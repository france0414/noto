# GTMC + B2B 雙專案架構規劃（索引）

> 來源：Inbox 整理 (2026-04-17)
> 更新：2026-04-17（拆分為兩個獨立專案文件）
> 標籤：#GTMC #B2B #索引

---

## 專案總覽

本文件原為雙專案合併規劃，已拆分為獨立文件方便各自追蹤。

| 專案 | 文件 | 狀態 | 說明 |
|---|---|---|---|
| **GTMC 官網重塑** | [[GTMC_官網重塑專案]] | 🟢 執行中 | Odoo → MCP 爬取 → JSON → Next.js |
| **B2B 模板網站** | [[B2B_模板網站專案]] | 🔵 規劃中 | 母版+擴充、多語系、AI 文案生成 |

---

## 共用決策

兩個專案共用的技術決定：

| 項目 | 決定 |
|---|---|
| 前端框架 | **Next.js + React** — SSG 靜態產出、React 元件生態、Vercel 部署、AI 工具支援 |
| 資料分離 | **JSON 檔案** → 未來可替換為 CMS API |
| AI SEO | Schema.org JSON-LD + llms.txt + 語意化 HTML |
| CMS | **延後決定** — JSON 結構定好就行，之後接什麼都可以 |

---

## 決策紀錄（完整）

| 日期 | 決定 | 原因 |
|---|---|---|
| 2026-04-17 | 先不上 CMS，用 MCP + JSON 做資料分離 | CMS 太複雜，先確保資料能抽出來 |
| 2026-04-17 | 兩站共用 JSON 資料格式與 Next.js 模板思維 | 降低重複工作，統一資料結構 |
| 2026-04-17 | 確認 GTMC 舊站為 Odoo 系統 | 前台可公開爬取 |
| 2026-04-17 | GTMC 走 MCP 爬取路線（路徑 B） | 設計師權限不確定，MCP 前台爬取已確認可行 |
| 2026-04-17 | ~~前端框架選定 Astro~~ → 改為 Next.js + React | 市場主流、AI 工具生態最佳、React 元件可複用 |
| 2026-04-17 | 納入 AI SEO（AEO） | Schema.org + llms.txt + 語意化 HTML |
| 2026-04-17 | GTMC 不做多語系，B2B 需要 | GTMC 實驗性；B2B 外銷需多語系，用 next-intl |
| 2026-04-17 | B2B 多語系先中後英，AI 翻譯 + 人工校對 | 中文先行 → AI 翻譯 → 專業術語校對 |
| 2026-04-17 | B2B 圖片共用 media/，命名分語系 | 無文字共用，有文字加 `_{lang}` |
| 2026-04-17 | AI 文案生成作為 B2B 附加價值 | 客戶資料未齊全時先生成有意義內容 |
| 2026-04-17 | 拆分為獨立專案文件 | 原檔過大，兩專案各自追蹤更清楚 |

---

## 參考來源

- [Facebook 社群討論](https://www.facebook.com/groups/2294169410829101/posts/4480513625527991/)
- [Hygraph - Product Catalog Architecture](https://hygraph.com/blog/product-catalog-architecture)
- [Adesso Finland - Legacy CMS Migration](https://www.adesso-finland.fi/en/news/blog/how-to-migrate-from-a-legacy-cms-system-to-a-headless-cms-without-risk.jsp)
- [Kontent.ai - Migrating Content](https://kontent.ai/blog/migrating-content-from-a-monolith-cms-to-a-headless-cms/)
