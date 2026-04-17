# GTMC 官網重塑專案

> 來源：從 [[GTMC_B2B_Headless_架構規劃]] 拆分 (2026-04-17)
> 標籤：#GTMC #MCP #Odoo #NextJS #React #資料分離
> 狀態：🟢 執行中 — 確認走 MCP 爬取路線
> 相關：[[B2B_模板網站專案]]

---

## 可行性結論（可直接回報）

### 結論：可行，有兩條路

| 路徑 | 方式 | 條件 | 風險 |
|---|---|---|---|
| **路徑 A：後台匯出** | Odoo 後台直接匯出 CSV | 需要有匯出權限（目前待確認） | 低，資料最完整 |
| **路徑 B：MCP 爬取** | 用 AI 工具從前台爬取所有公開資料 | 不需要任何後台權限 | 低，前台資料全部公開可抓 |

### 已確認事項

- ✅ 舊站是 **Odoo 系統**
- ✅ 前台資料全部公開，**不需登入即可爬取**
- ✅ **無會員/帳號系統**，不需遷移使用者
- ✅ 資料量：成功案例 100+ 筆、部落格 50+ 篇、服務頁 5 大類
- ✅ 框架與資料分離技術上可行：爬取 → JSON → HTML 模板讀取
- ✅ 未來要上 CMS 只需替換 JSON 來源為 API，架構不用改

### 下一步（執行中）

1. ~~確認走 MCP 爬取路線~~ ✅ 已決定
2. **安裝 Firecrawl MCP + File System MCP** ← 目前在這
3. 跑一次完整資料抽取 → 驗證資料完整性
4. 定義 JSON Schema → 確認欄位規則
5. 資料清洗 → 把爬取結果整理成符合 Schema 的 JSON
6. 開始建前端（Next.js + React，含 AI SEO 結構）

---

## 原始需求

希望將目前的官網 GTMC，可以透過 AI 重塑，除了所有架構之外，有些資料為後台上架的也希望可以都有，並且最終還是希望有後台。

---

## 核心策略：先分離，後決定

> CMS 目前太複雜，先不碰。先確保一件事：**用 MCP 從舊官網把資料抽出來，做到框架與資料分離**。之後要不要上 CMS 就只是換資料來源，很單純。

### 整體路線

```
舊官網 ──MCP 爬取──→ JSON 資料檔 ──→ Next.js 讀 JSON ──→ 靜態網站（SSG）
                                         ↑
                                    未來可替換為
                                    CMS API / 資料庫
```

### 為什麼這樣做

- **降低複雜度**：不用一開始就搞 Strapi、API、權限，先把資料拿到手
- **資料分離 = 自由度**：Next.js 元件只管呈現，JSON 只管內容，兩邊獨立改動
- **CMS 變成選配**：資料已經是結構化 JSON，之後要接 CMS 只是把 JSON 來源從檔案換成 API
- **可驗證**：先用 JSON 跑起來，確認資料完整性，再考慮下一步

---

## 舊站現況分析（已爬取）

> 網址：https://www.gtmc.com.tw/
> **平台：Odoo**（從 URL 結構 `/web/image/`、`/shop/`、`/blog/` 可判斷）
> 性質：品牌顧問公司官網（非電商），`/shop/` 是作品集不是商品

### 網站架構（sitemap 已取得）

```
首頁 /
├── 關於我們 /GTMC
├── 服務項目 /service
│   ├── 策略行銷 /strategic-marketing
│   ├── 品牌設計 /brand-development
│   ├── 企業網站 /web-design
│   ├── 影像創作 /image-creation
│   └── 數位服務 /digital-service
├── 成功案例 /shop（Odoo eCommerce 模組，用作作品集）
│   ├── 品牌發展（CIS、平面文宣、數位應用、展場視覺）
│   ├── 企業網站（網站視覺設計）
│   ├── 影像創作（形象影片、公司簡介、產品影片、活動紀實、短影音、動畫、3D渲染、VR）
│   └── 數位服務（VR虛擬展示、3D商品動態、企業自平台、雲端APP）
├── 部落格 /blog
│   ├── 最新消息 /blog/msg-news-2
│   ├── 媒體報導 /blog/media-reports-4
│   ├── 活動花絮 /blog/activities-5
│   └── 趨勢洞察 /blog/trend-6
├── 活動 /events
├── 聯絡我們 /contactus
└── 隱私權政策 /privacy
```

### 資料盤點

| 資料類型 | 估計量 | 來源路徑 | MCP 可抓 |
|---|---|---|---|
| 服務頁面 | ~5 頁 | `/strategic-marketing` 等 | ✅ |
| 成功案例/作品集 | **100+ 筆** | `/shop/` 各子頁 | ✅ |
| 部落格文章 | 50+ 篇 | `/blog/` | ✅ |
| 公司資訊 | 1 頁 | `/GTMC` | ✅ |
| 圖片/媒體 | 大量 | Odoo `/web/image/` | ✅ |
| 客戶 Logo 牆 | 20+ 個 | 首頁 | ✅ |
| 聯絡資訊 | 台中 + 台北 | `/contactus` | ✅ |
| 活動 | 待確認 | `/events` | ✅ |

### 重要發現

1. **Odoo 系統** — 後台是 Odoo CMS + eCommerce 模組
2. **`/shop/` 不是商品** — 是作品集，每筆是一個客戶案例
3. **作品集量很大** — 超過 100 個案例
4. **部落格有分類** — 4 個分類，有多頁文章
5. **圖片走 Odoo 媒體庫** — URL 格式 `/web/image/{id}-{hash}/filename`
6. **無會員/登入系統** — 純展示型官網

---

## MCP 爬取計畫

### 可用的 MCP 工具

| MCP 工具 | 用途 | 適合抓什麼 |
|---|---|---|
| **Firecrawl MCP** | 整站爬取 | 全站頁面、作品列表、部落格、服務頁 |
| **Fetch MCP** | 單頁抓取 | 特定頁面、sitemap.xml |
| **File System MCP** | 讀寫本地檔案 | 儲存爬取結果為 JSON |
| **Browser/Puppeteer MCP** | JS 動態載入 | 備用 |

### 爬取步驟

1. **Sitemap 已取得** ✅

2. **依頁面類型定義要抓的欄位**
   - 成功案例：client_name, brand_name, category, description, images, tags
   - 部落格：title, date, category, content, image, tags
   - 服務頁面：service_name, description, sub_services, process
   - 公司資訊：about, clients, contact_info

3. **用 MCP 抓資料，存成 JSON**
   ```
   data/
     cases.json          ← 成功案例/作品集（100+ 筆）
     blog_posts.json     ← 部落格文章
     services.json       ← 服務項目頁面內容
     company.json        ← 公司資訊、客戶列表
     media/              ← 圖片
   ```

4. **資料清洗與標準化**
   - Odoo 圖片 URL 轉為本地路徑
   - 部落格 HTML 內容清理
   - 作品集分類統一命名
   - 日期格式統一

### 待確認事項

- [x] GTMC 舊官網網址 → `https://www.gtmc.com.tw/`
- [x] 舊站是什麼系統 → **Odoo**
- [x] 有沒有需要登入才能看到的內容 → 前台無需登入
- [ ] 作品集的每個案例頁需要抓到多細？
- [ ] 部落格文章全部都要搬？還是只搬最近的？
- [ ] Odoo 後台是否有權限可以直接匯出資料？
- [ ] 圖片需要全部下載到本地嗎？

---

## JSON 資料結構

**cases.json**
```json
[
  {
    "id": "c001",
    "client_name": "台中精機",
    "brand_name": "Victor Taichung",
    "category": "影像創作",
    "sub_category": "形象影片",
    "description": "精機造極 匯聚非凡",
    "url": "/shop/victor-taichung-image-video-322",
    "images": ["media/c001_01.jpg"],
    "tags": ["工具機", "形象影片"],
    "seo": {
      "meta_title": "台中精機形象影片 | GTMC",
      "meta_description": "...",
      "schema_type": "CreativeWork"
    }
  }
]
```

**blog_posts.json**
```json
[
  {
    "id": "b001",
    "title": "B2B 外銷行銷成本太高？...",
    "date": "2026-04-13",
    "category": "趨勢洞察",
    "content": "文章內容...",
    "image": "media/b001.jpg",
    "url": "/blog/trend-6/b2b-ads-quality-score-seo-synergy-186",
    "seo": {
      "meta_title": "B2B 外銷行銷成本太高？| GTMC",
      "meta_description": "...",
      "schema_type": "Article"
    }
  }
]
```

**services.json**
```json
[
  {
    "id": "s001",
    "name": "策略行銷",
    "url": "/strategic-marketing",
    "description": "GTMC 依據你的產業特性與商業模式...",
    "sub_services": [
      { "name": "品牌力經營顧問", "items": ["市場競爭者探勘", "競爭者品牌聲量", "產業趨勢分析", "數據驅動報告"] },
      { "name": "整體網站經營", "items": ["市場研究", "關鍵字研究與選擇", "行銷通路效益分析"] }
    ],
    "process": ["需求討論", "規劃提案", "執行監控", "循環優化"],
    "seo": {
      "meta_title": "策略行銷 | GTMC",
      "meta_description": "品牌力經營顧問、SEO、SEM...",
      "schema_type": "Service"
    }
  }
]
```

---

## 前端架構

### 框架：Next.js + React

- `getStaticProps` + `getStaticPaths` 讀 JSON 生成靜態頁（SSG），SEO 友好
- React Component 組合：共用 Layout（Header/Footer）、可複用 UI 元件
- 表單（詢價）：用 Formspree / Netlify Forms，零後端
- 未來可直接接 CMS API，前端幾乎不改（只改 data fetching 層）
- 部署：Vercel 一鍵部署，Preview URL 自動產生
- 生態優勢：shadcn/ui、Tailwind CSS、AI 工具（v0、Bolt）直接產出元件

### 頁面對應

| 頁面 | 讀取資料 | Layout |
|---|---|---|
| 首頁 `/` | `company.json` + `cases.json`（精選） | `<RootLayout>` |
| 成功案例列表 `/cases` | `cases.json` 依分類篩選 | `<SidebarLayout>` |
| 案例明細 `/cases/[slug]` | 單筆 case（`getStaticPaths`） | `<RootLayout>` |
| 服務頁面 `/services/[slug]` | `services.json` | `<SidebarLayout>` |
| 部落格列表 `/blog` | `blog_posts.json` 依分類 | `<SidebarLayout>` |
| 部落格文章 `/blog/[slug]` | 單篇（`getStaticPaths`） | `<RootLayout>` |

### 多語系

❌ GTMC 不做多語系（實驗性專案，舊站無英文版）

---

## AI SEO（AEO）

> 共用規範，詳見 [[B2B_模板網站專案]] AI SEO 區塊

| 做法 | 實作方式 |
|---|---|
| Schema.org JSON-LD | Next.js `<Head>` 或 `metadata` API 統一注入 |
| 語意化 HTML | `<article>`, `<section>`, `<nav>` |
| llms.txt | `public/llms.txt` |
| sitemap.xml | `next-sitemap` 套件 |
| Open Graph + Meta | Next.js `metadata` API 統一管理 |
| FAQ Schema | 服務頁加 FAQ 結構化資料 |

---

## 未來擴充（CMS 選配）

```
之前：Next.js getStaticProps → 讀本地 JSON 檔
之後：Next.js getStaticProps → 讀 CMS API（回傳一樣的 JSON 結構）
```

CMS 選項：Strapi / Directus / Google Sheets + API / Notion API
**現在不用決定**，JSON 結構定好了，之後換什麼都行。

---

## Next Action

1. ~~提供 GTMC 舊官網網址~~ ✅
2. **安裝 Firecrawl MCP** ← 目前在這
3. 確認：後台權限？作品集全搬？部落格全搬？
4. 跑一次完整爬取 → 確認資料完整度
5. 定義 JSON Schema → 開始建 Next.js 前端

---

## 決策紀錄

| 日期 | 決定 | 原因 |
|---|---|---|
| 2026-04-17 | 先不上 CMS，用 MCP + JSON 做資料分離 | CMS 太複雜，先確保資料能抽出來 |
| 2026-04-17 | 確認舊站為 Odoo 系統，前台可公開爬取 | 不需要登入，MCP 可直接抓 |
| 2026-04-17 | 確認走 MCP 爬取路線（路徑 B） | 設計師權限不確定能否匯出 CSV |
| 2026-04-17 | ~~前端框架選定 Astro~~ → 改為 Next.js + React | 市場主流、AI 工具生態最佳、React 元件可複用、Vercel 部署 |
| 2026-04-17 | 前端框架改為 Next.js + React | Astro 生態較小；Next.js 為市場主流，AI 工具（v0、Bolt）直接支援，學習 React 長期價值高 |
| 2026-04-17 | 納入 AI SEO（AEO） | Schema.org + llms.txt + 語意化 HTML |
| 2026-04-17 | 不做多語系 | 實驗性專案，舊站無英文版 |

---

## 專案資料夾

- Obsidian 規劃：`10_Research/Project_Planning/`
- 執行專案：`~/Documents/Gtmc-test/`
- 日誌連結：`30_Logs/gtmc-rebuild` → `~/Documents/Gtmc-test/docs/`

---

## 參考來源

- [Hygraph - Product Catalog Architecture](https://hygraph.com/blog/product-catalog-architecture)
- [Adesso Finland - Legacy CMS Migration](https://www.adesso-finland.fi/en/news/blog/how-to-migrate-from-a-legacy-cms-system-to-a-headless-cms-without-risk.jsp)
- [Kontent.ai - Migrating Content](https://kontent.ai/blog/migrating-content-from-a-monolith-cms-to-a-headless-cms/)
