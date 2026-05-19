# Daily Log Sync

把 `30_Logs/b2b-template/W2B Temporary` 當天的日誌同步到指定 Google Sheet。

## 同步規則

- 只處理今天的 `YYYY-MM-DD-log.md`
- 只抓 `## Daily Report Snippet`
- 只抓 `工時：8h` 或 `工時：7.5h` 這種格式
- 先找今天頁籤，格式為 `MMDD`，例如 `0518`
- 再找今天表頭，格式為 `M/D(weekday)`，例如 `5/18(一)`
- 再找列標籤 `惠閔`
- 只寫入交叉的摘要格（第 5 列）
- 寫入格式為「摘要內容 + 全形括號工時」，例如 `完成 A\n完成 B（8h）`
- 第 6 列工時格不由程式寫入
- 預設不覆蓋不同的既有內容

## 準備

1. 建立 Google service account，並把目標試算表分享給它。
2. 複製 `.env.example` 成 `.env`。
3. 填入 service account 與表單資訊。

## 安裝

```bash
cd "/Users/apple/Desktop/obsidian/AI-france/40_Tools/daily-log-sync"
npm install
```

## 使用

先 dry run：

注意：dry run 仍需完整 Google credentials 與 `.env`，因為程式會讀取試算表中繼資料並定位目標儲存格。

```bash
npm run sync:dry-run
```

正式同步：

```bash
npm run sync
```

## 日誌格式

在當天 log 中至少要有：

```md
## Daily Report Snippet

- 完成 A
- 完成 B

工時：7.5h
```

如果缺少 `Daily Report Snippet` 或 `工時`，程式會停止，不會寫進 Google Sheet。
