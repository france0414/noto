# 🏢 Odoo 專屬 SEO 優化策略

針對 Odoo 系統特性所整理出的 SEO 開發建議。

## 🛡️ Odoo 的 SEO 特性
Odoo 大多數的 Website 頁面是透過 **Controller & Template** (QWeb) 在伺服器端渲染的，因此天生對 SEO 較為友善。主要內容在 HTML Response 裡就看得到。

## ✅ 安全開發建議
- **模板輸出內容**: 確保文案、產品資訊是透過 QWeb 模板直接輸出的，而非 JS 動態抓取 API 塞入。
- **標準 A 連結**: 導航與按鈕應使用真正的 `<a t-att-href="...">`，避免使用 `javascript:void(0)` 搭配自訂 click 事件跳轉。
- **適當使用 JS**: JS 應只用來做視覺增強（Slider, Tab, Accordion），而非承載核心商業邏輯或內容。

## 📋 檢查清單
- [ ] **查看原始碼**: View Source 看看 H1 與主要的 `div` 內容是否在裡面。
- [ ] **關掉 JS 測試**: 用瀏覽器擴充功能關掉 JS，看頁面是否仍可閱讀。
- [ ] **GSC 驗證**: 使用 Google Search Console 的「檢查網址」看 Google 渲染出的結果。
