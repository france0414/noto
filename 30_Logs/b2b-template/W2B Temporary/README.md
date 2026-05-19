# W2B Temporary

這個資料夾是 B2B 專案的「自動投遞接收點」。

目標：你在真正專案裡每日存檔，檔案會直接出現在這裡。

## 指令慣例

- `start-m`：記錄今日開始時間到 `.claude/session-state.json`
- `close`：只寫專案內收工紀錄（`docs/requirements/daily/YYYY-MM-DD-close.md`）
- `close-m`：收工紀錄 + 鏡像投遞到 `docs/W2B Temporary/YYYY-MM-DD-log.md`，並附上 `Start Time`、`Start Source`、`Close Time`、`Work Time`

`close-m` 的工時優先使用 `start-m` 記錄的時間；若沒有 `start-m`，則退回今日最早記錄到的 session 互動時間。這是 best-effort 統計，不代表整天在所有工具中的實際總工時。

## 一次性設定（推薦：符號連結）

在你的真正專案根目錄執行：

```bash
mkdir -p docs
ln -s "/Users/apple/Desktop/obsidian/AI-france/30_Logs/b2b-template/W2B Temporary" "docs/W2B Temporary"
```

設定完成後，你在專案這個路徑存檔：

- `docs/W2B Temporary/2026-04-22-log.md`

就會自動同步寫入到這邊。

## 檔名規則（建議）

- `YYYY-MM-DD-log.md`
- 範例：`2026-04-22-log.md`

## 每日日誌模板

```md
# B2B Daily Log - 2026-04-22

## 今日目標
- 

## 今日變更
- 

## 問題與阻塞
- 

## 明日計畫
- 
```
