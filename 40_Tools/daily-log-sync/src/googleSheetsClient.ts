import { google, sheets_v4 } from 'googleapis';

export interface SyncConfig {
  spreadsheetId: string;
  targetRowLabel: string;
  searchRange: string;
  allowOverwrite: boolean;
  hoursWriteMode: 'text' | 'number';
}

export interface LocatedTarget {
  sheetTitle: string;
  headerCellA1: string;
  rowLabelCellA1: string;
  summaryCellA1: string;
  hoursCellA1: string;
  existingSummary: string;
  existingHours: string;
}

export function createSheetsClient(serviceAccountEmail: string, privateKey: string) {
  const auth = new google.auth.JWT({
    email: serviceAccountEmail,
    key: privateKey,
    scopes: ['https://www.googleapis.com/auth/spreadsheets'],
  });

  return google.sheets({ version: 'v4', auth });
}

export async function locateSheetTargets(params: {
  sheets: sheets_v4.Sheets;
  config: SyncConfig;
  expectedTabTitle: string;
  expectedHeader: string;
}) {
  const { sheets, config, expectedTabTitle, expectedHeader } = params;
  const spreadsheet = await sheets.spreadsheets.get({
    spreadsheetId: config.spreadsheetId,
  });

  const matchingSheets = (spreadsheet.data.sheets ?? []).filter(
    (sheet) => sheet.properties?.title === expectedTabTitle,
  );

  if (matchingSheets.length !== 1) {
    throw new Error(`找不到唯一頁籤：${expectedTabTitle}`);
  }

  const sheetTitle = matchingSheets[0].properties?.title;
  if (!sheetTitle) {
    throw new Error('目標頁籤沒有標題。');
  }

  const gridRange = `${sheetTitle}!${config.searchRange}`;
  const gridResponse = await sheets.spreadsheets.values.get({
    spreadsheetId: config.spreadsheetId,
    range: gridRange,
  });

  const values = gridResponse.data.values ?? [];
  const headerMatches = findMatches(values, expectedHeader);
  if (headerMatches.length !== 1) {
    throw new Error(`找不到唯一日期欄：${expectedHeader}`);
  }

  const rowLabelMatches = findMatches(values, config.targetRowLabel);
  if (rowLabelMatches.length !== 1) {
    throw new Error(`找不到唯一列標籤：${config.targetRowLabel}`);
  }

  const headerMatch = headerMatches[0];
  const rowLabelMatch = rowLabelMatches[0];
  const summaryRowIndex = rowLabelMatch.rowIndex;
  const summaryColIndex = headerMatch.colIndex;
  const hoursRowIndex = summaryRowIndex + 1;

  const summaryCellA1 = toA1(summaryRowIndex, summaryColIndex, sheetTitle);
  const hoursCellA1 = toA1(hoursRowIndex, summaryColIndex, sheetTitle);

  return {
    sheetTitle,
    headerCellA1: toA1(headerMatch.rowIndex, headerMatch.colIndex, sheetTitle),
    rowLabelCellA1: toA1(rowLabelMatch.rowIndex, rowLabelMatch.colIndex, sheetTitle),
    summaryCellA1,
    hoursCellA1,
    existingSummary: readCell(values, summaryRowIndex, summaryColIndex),
    existingHours: readCell(values, hoursRowIndex, summaryColIndex),
  } satisfies LocatedTarget;
}

export async function writeTargets(params: {
  sheets: sheets_v4.Sheets;
  config: SyncConfig;
  located: LocatedTarget;
  combinedContent: string;
}) {
  const { sheets, config, located, combinedContent } = params;

  await sheets.spreadsheets.values.batchUpdate({
    spreadsheetId: config.spreadsheetId,
    requestBody: {
      valueInputOption: 'USER_ENTERED',
      data: [
        {
          range: located.summaryCellA1,
          values: [[combinedContent]],
        },
      ],
    },
  });
}

function findMatches(values: string[][], expected: string) {
  const matches: Array<{ rowIndex: number; colIndex: number }> = [];

  for (let rowIndex = 0; rowIndex < values.length; rowIndex += 1) {
    const row = values[rowIndex] ?? [];
    for (let colIndex = 0; colIndex < row.length; colIndex += 1) {
      if ((row[colIndex] ?? '').trim() === expected) {
        matches.push({ rowIndex: rowIndex + 1, colIndex: colIndex + 1 });
      }
    }
  }

  return matches;
}

function readCell(values: string[][], rowIndex: number, colIndex: number) {
  return values[rowIndex - 1]?.[colIndex - 1]?.trim() ?? '';
}

function toA1(rowIndex: number, colIndex: number, sheetTitle: string) {
  return `${sheetTitle}!${columnToLetters(colIndex)}${rowIndex}`;
}

function columnToLetters(column: number) {
  let current = column;
  let result = '';

  while (current > 0) {
    const remainder = (current - 1) % 26;
    result = String.fromCharCode(65 + remainder) + result;
    current = Math.floor((current - 1) / 26);
  }

  return result;
}
