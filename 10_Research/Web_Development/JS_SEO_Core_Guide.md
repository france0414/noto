# 🌐 JS SEO 核心指南

這份筆記整理了 JavaScript 對搜尋引擎優化 (SEO) 的影響機制與判斷標準。

## 📌 核心結論
Google 可以執行 JS，但會經過 **Crawling (抓取) -> Rendering (渲染) -> Indexing (索引)** 三個階段。JS 本身不傷 SEO，但「依賴 JS 才能看到的內容」會增加風險。

## ⚠️ SEO 高風險情況
- **Client-Side Rendering (CSR)**: 初始 HTML 幾乎空白，重要內容全靠 JS 非同步載入。
- **非標準連結**: 使用 `#/about` 或 JS 事件跳轉，而非標準的 `<a href="/about">`。
- **動態 Metadata**: `title`, `description`, `canonical` 等全靠 JS 修改，導致搜尋引擎抓到預設值或空白。
- **效能過低**: 過多 JS 套件導致頁面載入速度變慢。

## ✅ SEO 友善做法
- **Progressive Enhancement**: 主要內容出現在初始 HTML，JS 僅用於增強互動效果（如彈窗、輪播）。
- **真正的 URL**: 使用可抓取的連結路徑。
- **Server-Side Rendering (SSR)**: 由伺服器先吐出完整 HTML 內容。

---
## 🔍 快速判法
> 「關掉瀏覽器的 JavaScript 後，頁面還剩多少重要資訊？」
- 如果看得到主要內容 -> **SEO 風險低**。
- 如果只剩空殼 -> **SEO 風險高**。
