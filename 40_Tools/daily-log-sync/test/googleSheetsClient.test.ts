import assert from 'node:assert/strict';
import test from 'node:test';
import { writeTargets } from '../src/googleSheetsClient.js';

test('writeTargets writes only combined content to summary cell', async () => {
  let captured: unknown;

  const sheets = {
    spreadsheets: {
      values: {
        async batchUpdate(payload: unknown) {
          captured = payload;
          return {};
        },
      },
    },
  };

  await writeTargets({
    sheets: sheets as never,
    config: {
      spreadsheetId: 'spreadsheet-id',
      targetRowLabel: '惠閔',
      searchRange: 'A1:ZZ200',
      allowOverwrite: false,
      hoursWriteMode: 'text',
    },
    located: {
      sheetTitle: '0519',
      headerCellA1: '0519!C2',
      rowLabelCellA1: '0519!A5',
      summaryCellA1: '0519!C5',
      hoursCellA1: '0519!C6',
      existingSummary: '',
      existingHours: '',
    },
    combinedContent: 'today summary（2.5h）',
  });

  assert.deepEqual(captured, {
    spreadsheetId: 'spreadsheet-id',
    requestBody: {
      valueInputOption: 'USER_ENTERED',
      data: [
        {
          range: '0519!C5',
          values: [['today summary（2.5h）']],
        },
      ],
    },
  });
});
