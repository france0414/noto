import * as fs from "fs";
import * as path from "path";

const AW_BASE = "http://localhost:5600/api/0";
const VAULT_ROOT = "/Users/apple/Desktop/obsidian/AI-france";
const COMPUTER_NAME = process.env.COMPUTER_NAME ?? "mac";
const DAILY_LOG_DIR = path.join(VAULT_ROOT, "30_Logs/daily", COMPUTER_NAME);


interface AWEvent {
  timestamp: string;
  duration: number;
  data: Record<string, string>;
}

interface AWBucket {
  id: string;
  type: string;
}

async function fetchJSON<T>(url: string): Promise<T> {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`ActivityWatch API error: ${res.status} ${url}`);
  return res.json() as Promise<T>;
}

async function getBuckets(): Promise<Record<string, AWBucket>> {
  return fetchJSON(`${AW_BASE}/buckets/`);
}

async function getEvents(bucketId: string, date: string): Promise<AWEvent[]> {
  // 台灣 UTC+8，轉成 UTC 的時間範圍
  const [y, m, d] = date.split("-").map(Number);
  const startUTC = new Date(Date.UTC(y, m - 1, d, -8, 0, 0)); // 00:00 台灣 = 前一天 16:00 UTC
  const endUTC = new Date(Date.UTC(y, m - 1, d, 15, 59, 59));  // 23:59 台灣 = 當天 15:59 UTC
  const start = startUTC.toISOString();
  const end = endUTC.toISOString();
  return fetchJSON(
    `${AW_BASE}/buckets/${bucketId}/events?start=${encodeURIComponent(start)}&end=${encodeURIComponent(end)}&limit=1000`
  );
}

function formatDuration(seconds: number): string {
  const m = Math.round(seconds / 60);
  if (m < 60) return `${m}m`;
  return `${Math.floor(m / 60)}h${m % 60 > 0 ? (m % 60) + "m" : ""}`;
}

function toLocalTime(timestamp: string): string {
  const d = new Date(timestamp);
  const h = d.getHours().toString().padStart(2, "0");
  const m = d.getMinutes().toString().padStart(2, "0");
  return `${h}:${m}`;
}

interface ActivityBlock {
  time: string;
  app: string;
  duration: number;
}

async function getTodayActivities(date: string): Promise<ActivityBlock[]> {
  const buckets = await getBuckets();

  const windowBucket = Object.keys(buckets).find((id) =>
    id.startsWith("aw-watcher-window")
  );

  if (!windowBucket) {
    throw new Error("找不到 aw-watcher-window bucket，請確認 ActivityWatch 正在執行");
  }

  const events = await getEvents(windowBucket, date);

  const blocks: ActivityBlock[] = [];
  for (const ev of events) {
    if (ev.duration < 30) continue;
    blocks.push({
      time: toLocalTime(ev.timestamp),
      app: ev.data["app"] ?? "Unknown",
      duration: ev.duration,
    });
  }

  return blocks;
}

function buildMarkdownSection(blocks: ActivityBlock[]): string {
  // 統計每個 App 的總時間
  const appTime: Record<string, number> = {};
  for (const b of blocks) {
    appTime[b.app] = (appTime[b.app] ?? 0) + b.duration;
  }

  let md = "\n\n---\n\n## 今天的活動（ActivityWatch 自動記錄）\n\n";

  const sorted = Object.entries(appTime).sort((a, b) => b[1] - a[1]);
  for (const [app, seconds] of sorted) {
    if (seconds < 60) continue;
    md += `- ${app}  ${formatDuration(seconds)}\n`;
  }

  return md;
}

function getTodayDateString(): string {
  const now = new Date();
  const y = now.getFullYear();
  const m = (now.getMonth() + 1).toString().padStart(2, "0");
  const d = now.getDate().toString().padStart(2, "0");
  return `${y}-${m}-${d}`;
}

async function main() {
  const date = process.argv[2] ?? getTodayDateString();
  console.log(`抓取 ${date} 的活動資料...`);

  const blocks = await getTodayActivities(date);
  console.log(`共 ${blocks.length} 筆活動記錄`);

  const section = buildMarkdownSection(blocks);

  // 找今天的日誌檔
  const logFile = path.join(DAILY_LOG_DIR, `${date}.md`);

  if (!fs.existsSync(logFile)) {
    fs.mkdirSync(DAILY_LOG_DIR, { recursive: true });
    fs.writeFileSync(logFile, `# ${date}\n\n## 今天做了什麼\n\n- \n\n## 未歸類收集\n\n- \n`, "utf-8");
    console.log(`已建立 ${logFile}`);
  }

  const existing = fs.readFileSync(logFile, "utf-8");

  // 如果已經有自動記錄區塊就取代，沒有就追加
  const MARKER = "## 今天的活動（ActivityWatch 自動記錄）";
  let updated: string;
  if (existing.includes(MARKER)) {
    const idx = existing.indexOf("\n\n---\n\n" + MARKER);
    updated = (idx >= 0 ? existing.slice(0, idx) : existing) + section;
  } else {
    updated = existing + section;
  }

  fs.writeFileSync(logFile, updated, "utf-8");
  console.log(`已更新 ${logFile}`);
}

main().catch((e) => {
  console.error(e.message);
  process.exit(1);
});
