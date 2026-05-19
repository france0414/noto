# ICB RWD Master Learnings (AI 必讀)

這是 AI 在進行 ICB 系統 RWD 調整時的最高指導原則。**AI 每次開始任務前，必須首先閱讀此文件與最新的 Log。**

## 核心工作流 (Workflow)

1. **讀取規範**：閱讀此文件與 `Logs/` 下最新的專案紀錄。
2. **初始化 Log**：在 `Logs/` 下建立或更新當日 Session Log。
3. **執行調整**：根據 SCSS 與 URL 進行 RWD 修正。
4. **即時記錄**：每一次 User 反饋修正後，立即記錄「為什麼錯」與「正確做法」。
5. **結案總結**：專案 Close 時，將重要經驗合併至此 Master 文件。

---

## Log 紀錄規範 (Standard Logging Format)

每一則 Log 必須包含：
- **[做法紀錄]**：具體修改了哪些 Class、使用了什麼屬性？
- **[問題診斷]**：如果出錯，原因是什麼？（例如：權重不足、影響到父層、手機版空間不夠）
- **[正確解法]**：最終確認可行的 SCSS 代碼塊。
- **[完成進度]**：目前該區塊的進度百分比（如：80% - 剩餘字體大小微調）。

---

## 累積經驗庫 (Cumulative Knowledge)

### ✅ 最佳實踐 (Best Practices)
- **產品詳細頁標準**：[[Product_Detail_Page_Standard]]
  - 原則 1：先處理外框 (Container)，再處理內容。
  - 原則 2：去重巢狀容器 (Nested Containers) 的 Padding。
  - 原則 3：限定 Scope（如 `#product_detail`），避免污染全站。

### ❌ 避坑指南 (Anti-Patterns)
- **不要在全域寫單欄規則**：務必包在 `@include media-breakpoint-down(md)` 內。
- **避免重複定義變數**：如 `var(--container-pd-x)` 應由最外層控制。

---

## 專案狀態追蹤
*(這裡可以簡述目前進行中案子的進度與位置)*
