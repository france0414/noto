# Daily Log Single-Cell Sync Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Change `daily-log-sync` to write only row 5 with combined content `summary（Xh）`, while leaving row 6 untouched.

**Architecture:** Keep current parsing and sheet-target discovery flow, but switch write payload to a single target cell (`summaryCellA1`). Introduce small pure helpers for combined-content formatting and single-cell overwrite checks so behavior is testable without calling Google APIs. Update CLI output and README so runtime behavior and documentation stay consistent.

**Tech Stack:** TypeScript (Node.js ESM), `googleapis`, `dotenv`, `tsx`, TypeScript compiler, Node built-in test runner (`node:test`).

---

### Task 1: Add pure helpers and unit tests for single-cell content

**Files:**
- Create: `40_Tools/daily-log-sync/src/singleCellSync.ts`
- Create: `40_Tools/daily-log-sync/test/singleCellSync.test.ts`
- Modify: `40_Tools/daily-log-sync/package.json`
- Test: `40_Tools/daily-log-sync/test/singleCellSync.test.ts`

- [ ] **Step 1: Write the failing test**

```ts
import test from 'node:test';
import assert from 'node:assert/strict';
import { buildCombinedContent, shouldBlockOverwriteSingleCell } from '../src/singleCellSync.js';

test('buildCombinedContent puts hours in full-width parentheses', () => {
  const result = buildCombinedContent({
    summary: '完成 A\n完成 B',
    hoursRaw: '8h',
  });

  assert.equal(result, '完成 A\n完成 B（8h）');
});

test('shouldBlockOverwriteSingleCell returns false when cell is empty', () => {
  const blocked = shouldBlockOverwriteSingleCell({
    allowOverwrite: false,
    existingSummary: '',
    nextSummary: '內容（8h）',
  });

  assert.equal(blocked, false);
});

test('shouldBlockOverwriteSingleCell returns false when content is unchanged', () => {
  const blocked = shouldBlockOverwriteSingleCell({
    allowOverwrite: false,
    existingSummary: '內容（8h）',
    nextSummary: '內容（8h）',
  });

  assert.equal(blocked, false);
});

test('shouldBlockOverwriteSingleCell returns true when content differs and overwrite is disabled', () => {
  const blocked = shouldBlockOverwriteSingleCell({
    allowOverwrite: false,
    existingSummary: '舊內容（7h）',
    nextSummary: '新內容（8h）',
  });

  assert.equal(blocked, true);
});

test('shouldBlockOverwriteSingleCell returns false when overwrite is enabled', () => {
  const blocked = shouldBlockOverwriteSingleCell({
    allowOverwrite: true,
    existingSummary: '舊內容（7h）',
    nextSummary: '新內容（8h）',
  });

  assert.equal(blocked, false);
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npm run test`
Expected: FAIL with module-not-found for `../src/singleCellSync.js`.

- [ ] **Step 3: Write minimal implementation**

```ts
export function buildCombinedContent(params: { summary: string; hoursRaw: string }) {
  const { summary, hoursRaw } = params;
  return `${summary}（${hoursRaw}）`;
}

export function shouldBlockOverwriteSingleCell(params: {
  allowOverwrite: boolean;
  existingSummary: string;
  nextSummary: string;
}) {
  const { allowOverwrite, existingSummary, nextSummary } = params;
  if (allowOverwrite) {
    return false;
  }

  return existingSummary !== '' && existingSummary !== nextSummary;
}
```

- [ ] **Step 4: Add test script and run tests to verify pass**

`package.json` scripts section becomes:

```json
{
  "scripts": {
    "sync:dry-run": "tsx src/syncTodayLogToSheet.ts --dry-run",
    "sync": "tsx src/syncTodayLogToSheet.ts",
    "typecheck": "tsc --noEmit",
    "test": "node --test --import tsx test/**/*.test.ts"
  }
}
```

Run: `npm run test`
Expected: PASS, all `singleCellSync` tests green.

- [ ] **Step 5: Commit**

```bash
git add 40_Tools/daily-log-sync/src/singleCellSync.ts 40_Tools/daily-log-sync/test/singleCellSync.test.ts 40_Tools/daily-log-sync/package.json
git commit -m "test: add single-cell sync helper coverage"
```

### Task 2: Switch sync flow to single-cell write and single-cell overwrite safety

**Files:**
- Modify: `40_Tools/daily-log-sync/src/syncTodayLogToSheet.ts`
- Modify: `40_Tools/daily-log-sync/src/googleSheetsClient.ts`
- Test: `40_Tools/daily-log-sync/test/singleCellSync.test.ts`

- [ ] **Step 1: Add a failing integration-style assertion in helper tests**

Append this test in `test/singleCellSync.test.ts`:

```ts
test('combined content format remains stable for sync output', () => {
  const summary = '- 完成 API 串接\n- 更新部署';
  const hoursRaw = '6h';
  assert.equal(buildCombinedContent({ summary, hoursRaw }), '- 完成 API 串接\n- 更新部署（6h）');
});
```

Then update expectation later only if implementation differs.

- [ ] **Step 2: Run tests to ensure baseline is green before refactor**

Run: `npm run test`
Expected: PASS (safety net green before touching sync flow).

- [ ] **Step 3: Update sync entrypoint to use combined content and single-cell safety**

Key changes in `src/syncTodayLogToSheet.ts`:

```ts
import { buildCombinedContent, shouldBlockOverwriteSingleCell } from './singleCellSync.js';

const parsed = parseDailyLog(content);
const combinedContent = buildCombinedContent({
  summary: parsed.summary,
  hoursRaw: parsed.hoursRaw,
});

ensureOverwriteSafety({
  allowOverwrite: config.allowOverwrite,
  existingSummary: located.existingSummary,
  nextSummary: combinedContent,
});

await writeTargets({
  sheets,
  config,
  located,
  combinedContent,
});
```

Replace `ensureOverwriteSafety` implementation with:

```ts
function ensureOverwriteSafety(params: {
  allowOverwrite: boolean;
  existingSummary: string;
  nextSummary: string;
}) {
  const blocked = shouldBlockOverwriteSingleCell(params);
  if (blocked) {
    throw new Error('目標第 5 列已有不同內容，為避免覆蓋既有資料，已停止同步。若確認要覆蓋，請設定 ALLOW_OVERWRITE=true。');
  }
}
```

Update `printPlan` usage to print only summary cell and combined preview:

```ts
console.log(`Summary cell: ${located.summaryCellA1}`);
console.log('Combined preview:');
console.log(combinedContent);
```

- [ ] **Step 4: Update Google Sheets write payload to one range only**

In `src/googleSheetsClient.ts`, change `writeTargets` signature and payload:

```ts
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
```

- [ ] **Step 5: Run full checks**

Run: `npm run test && npm run typecheck`
Expected: PASS for tests and no TypeScript errors.

- [ ] **Step 6: Commit**

```bash
git add 40_Tools/daily-log-sync/src/syncTodayLogToSheet.ts 40_Tools/daily-log-sync/src/googleSheetsClient.ts
git commit -m "feat: sync daily log to single sheet cell"
```

### Task 3: Align README and validate dry-run/live behavior

**Files:**
- Modify: `40_Tools/daily-log-sync/README.md`
- Test: runtime command output from `sync:dry-run`

- [ ] **Step 1: Update README rules to match new behavior**

Replace sync rule bullets so they explicitly state:

```md
- 寫入交叉的摘要格（第 5 列）
- 寫入格式為：`Daily Report Snippet（Xh）`
- 第 6 列不由程式寫入
```

- [ ] **Step 2: Run dry-run and confirm output semantics**

Run: `npm run sync:dry-run`
Expected output includes:
- `Summary cell: <A1>`
- `Combined preview:`
- Combined string in format `...（8h）`

Expected output does not include:
- `Hours cell:`

- [ ] **Step 3: Optional live run verification against safe sheet**

Run: `npm run sync`
Expected:
- Only row 5 target cell changes
- Row 6 remains unchanged

- [ ] **Step 4: Commit**

```bash
git add 40_Tools/daily-log-sync/README.md
git commit -m "docs: document single-cell sync format"
```

### Task 4: Final regression and handoff evidence

**Files:**
- Modify: none
- Test: command outputs only

- [ ] **Step 1: Run final verification bundle**

Run: `npm run test && npm run typecheck && npm run sync:dry-run`
Expected:
- All tests pass
- Typecheck passes
- Dry-run shows single-cell behavior and combined format

- [ ] **Step 2: Capture final change review**

Run: `git status --short && git diff --stat`
Expected:
- Only planned files changed
- No unrelated file modifications staged by accident

- [ ] **Step 3: Final commit if needed**

```bash
git add -A
git commit -m "chore: finalize single-cell daily log sync"
```

Skip this step if all previous tasks already produced clean committed state.

## Self-Review

### 1) Spec coverage check
- Spec: only row 5 is program-managed -> Covered in Task 2 (single-range write).
- Spec: format is `summary（Xh）` -> Covered in Task 1 helper + Task 2 sync integration.
- Spec: row 6 untouched -> Covered in Task 2 payload removal and Task 3 runtime verification.
- Spec: overwrite safety checks row 5 only -> Covered in Task 1 helper + Task 2 safety update.
- Spec: README updated -> Covered in Task 3.

No spec gaps found.

### 2) Placeholder scan
- No `TODO/TBD/implement later` placeholders.
- Every code-edit step includes concrete code.
- Every test step includes explicit commands and expected outcomes.

### 3) Type/interface consistency
- `combinedContent` is used consistently between helper, sync entrypoint, and `writeTargets`.
- Overwrite guard names are consistent: `shouldBlockOverwriteSingleCell`, `existingSummary`, `nextSummary`.

Consistency check passed.
