# Daily Log Sync 單格寫入設計

## 背景與目標

目前 `daily-log-sync` 會把每天 log 的內容分別寫到 Google Sheet 的兩格：
- 第 5 列：`Daily Report Snippet` 摘要
- 第 6 列：工時（例如 `8h`）

本次需求改為只由程式管理第 5 列，並把摘要與總工時合併到同一格。第 6 列保留給使用者手動填寫其他案件，不由同步程式寫入。

目標結果：
- 程式只寫日期欄位的第 5 列
- 寫入格式固定為：`<summary>（<hours>h）`
- 第 6 列完全不改動

## 範圍

### In Scope
- 保留既有資料來源：當天 log 的 `## Daily Report Snippet` 與 `工時：Xh`
- 保留既有欄位定位：以頁籤 `MMDD`、日期表頭 `M/D(weekday)`、列標籤定位當天欄位
- 調整寫入行為為單格（第 5 列）
- 調整 dry-run 顯示內容與覆蓋保護邏輯
- 更新 README 說明

### Out of Scope
- 起始/結束時間解析、計算與同步
- 第 6 列寫入或格式管理
- 變更目前 log 檔格式

## 現況摘要

程式結構：
- `src/parseDailyLog.ts`：解析摘要與工時
- `src/googleSheetsClient.ts`：定位儲存格、批次寫入
- `src/syncTodayLogToSheet.ts`：主流程、覆蓋保護、dry-run 輸出

目前 `writeTargets` 一次寫兩格（summary/hours），覆蓋保護也同時比對兩格。

## 設計方案

### 1) 寫入內容組裝
- 新增單格最終字串：`combinedContent = `${summary}（${hoursRaw}）``
- 例：`完成 A\n完成 B（8h）`

說明：`hoursRaw` 已是 `8h` 形式，直接包進全形括號，符合需求格式 2。

### 2) 寫入行為改為單格
- `writeTargets(...)` 只更新 `summaryCellA1`
- 不再寫 `hoursCellA1`

### 3) 覆蓋保護改為只看第 5 列
- 安全檢查只比對 `existingSummary` 與 `combinedContent`
- `ALLOW_OVERWRITE=false` 時，如果第 5 列有不同內容就中止
- 不再比較第 6 列，避免影響使用者手動維護內容

### 4) dry-run 與日誌輸出調整
- 顯示將寫入的單一目標格（第 5 列）
- 顯示最終預覽字串 `combinedContent`
- 不再顯示或提及第 6 列寫入計畫

## 受影響檔案與責任

1. `40_Tools/daily-log-sync/src/googleSheetsClient.ts`
   - `writeTargets` 參數改為接收 `combinedContent`
   - `batchUpdate.data` 由兩筆改為一筆（`summaryCellA1`）

2. `40_Tools/daily-log-sync/src/syncTodayLogToSheet.ts`
   - 在主流程組裝 `combinedContent`
   - 覆蓋保護改為單格比較
   - `printPlan` 改為單格輸出

3. `40_Tools/daily-log-sync/README.md`
   - 同步規則改成「只寫第 5 列，內容為 `工作內容（Xh）`，第 6 列不寫」

## 錯誤處理

- 維持既有解析錯誤：缺 `Daily Report Snippet` 或缺 `工時` 即中止
- 維持既有定位錯誤：找不到唯一頁籤、日期欄、列標籤即中止
- 覆蓋錯誤訊息更新為單格語意：第 5 列已有不同內容時停止

## 測試與驗證

### 手動驗證
1. `npm run sync:dry-run`
   - 確認輸出只顯示第 5 列目標儲存格
   - 確認內容格式為 `summary（Xh）`
2. `npm run sync`
   - 確認第 5 列被更新
   - 確認第 6 列維持原值
3. 在第 5 列放入不同內容、`ALLOW_OVERWRITE=false`
   - 確認程式中止且提示覆蓋保護

### 相容性
- 不變更 `.env` 必填欄位
- 不變更 log 格式契約

## 風險與緩解

- 風險：第 5 列內容長度增加（摘要加工時）
  - 緩解：維持純文字寫入，讓 Sheet 自動換行/顯示；不做格式化邏輯
- 風險：既有資料與新格式不同導致覆蓋保護觸發
  - 緩解：保留 `ALLOW_OVERWRITE=true` 作為受控覆蓋機制

## 完成定義

- 程式只寫第 5 列，不寫第 6 列
- 寫入內容格式為 `summary（Xh）`
- dry-run 輸出與 README 與實作一致
- 覆蓋保護只檢查第 5 列
