import 'dotenv/config';
import fs from 'node:fs/promises';
import path from 'node:path';
import { createSheetsClient, locateSheetTargets, writeTargets, type SyncConfig } from './googleSheetsClient.js';
import { parseDailyLog } from './parseDailyLog.js';
import { buildCombinedContent, shouldBlockOverwriteSingleCell } from './singleCellSync.js';

async function main() {
  const dryRun = process.argv.includes('--dry-run');
  const config = readConfig();
  const today = new Date();
  const logPath = buildTodayLogPath(config.logRoot, today);
  const expectedTabTitle = formatTabTitle(today);
  const expectedHeader = formatDateHeader(today);

  const content = await fs.readFile(logPath, 'utf8');
  const parsed = parseDailyLog(content);
  const combinedContent = buildCombinedContent({ summary: parsed.summary, hoursRaw: parsed.hoursRaw });
  const sheets = createSheetsClient(config.serviceAccountEmail, config.privateKey);
  const located = await locateSheetTargets({
    sheets,
    config,
    expectedTabTitle,
    expectedHeader,
  });

  ensureOverwriteSafety({
    allowOverwrite: config.allowOverwrite,
    combinedContent,
    existingSummary: located.existingSummary,
  });

  printPlan({
    located,
    combinedContent,
  });

  if (dryRun) {
    return;
  }

  await writeTargets({
    sheets,
    config,
    located,
    combinedContent,
  });

  console.log('同步完成。');
}

function readConfig() {
  const spreadsheetId = required('GOOGLE_SPREADSHEET_ID');
  const serviceAccountEmail = required('GOOGLE_SERVICE_ACCOUNT_EMAIL');
  const privateKey = required('GOOGLE_PRIVATE_KEY').replace(/\\n/g, '\n');
  const targetRowLabel = process.env.TARGET_ROW_LABEL?.trim() || '惠閔';
  const logRoot = process.env.LOG_ROOT?.trim() || '/Users/apple/Desktop/obsidian/AI-france/30_Logs/b2b-template/W2B Temporary';
  const searchRange = process.env.SHEET_SEARCH_RANGE?.trim() || 'A1:ZZ200';
  const allowOverwrite = process.env.ALLOW_OVERWRITE === 'true';
  const hoursWriteMode = process.env.HOURS_WRITE_MODE === 'number' ? 'number' : 'text';

  return {
    spreadsheetId,
    serviceAccountEmail,
    privateKey,
    targetRowLabel,
    logRoot,
    searchRange,
    allowOverwrite,
    hoursWriteMode,
  } satisfies SyncConfig & {
    serviceAccountEmail: string;
    privateKey: string;
    logRoot: string;
  };
}

function buildTodayLogPath(logRoot: string, today: Date) {
  const filename = `${today.getFullYear()}-${pad(today.getMonth() + 1)}-${pad(today.getDate())}-log.md`;
  return path.join(logRoot, filename);
}

function formatTabTitle(today: Date) {
  return `${pad(today.getMonth() + 1)}${pad(today.getDate())}`;
}

function formatDateHeader(today: Date) {
  const weekdays = ['日', '一', '二', '三', '四', '五', '六'];
  return `${today.getMonth() + 1}/${today.getDate()}(${weekdays[today.getDay()]})`;
}

function ensureOverwriteSafety(params: {
  allowOverwrite: boolean;
  combinedContent: string;
  existingSummary: string;
}) {
  const { allowOverwrite, combinedContent, existingSummary } = params;

  const shouldBlock = shouldBlockOverwriteSingleCell({
    allowOverwrite,
    existingSummary,
    nextSummary: combinedContent,
  });

  if (shouldBlock) {
    throw new Error('第5列目標儲存格已有不同內容，為避免覆蓋既有資料，已停止同步。若確認要覆蓋，請設定 ALLOW_OVERWRITE=true。');
  }
}

function printPlan(params: {
  located: Awaited<ReturnType<typeof locateSheetTargets>>;
  combinedContent: string;
}) {
  const { located, combinedContent } = params;

  console.log(`Summary cell: ${located.summaryCellA1}`);
  console.log('Combined preview:');
  console.log(combinedContent);
}

function required(name: string) {
  const value = process.env[name]?.trim();
  if (!value) {
    throw new Error(`缺少環境變數：${name}`);
  }
  return value;
}

function pad(value: number) {
  return value.toString().padStart(2, '0');
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : error);
  process.exitCode = 1;
});
