# B2B 模板網站專案

> 來源：從 [[GTMC_B2B_Headless_架構規劃]] 拆分 (2026-04-17)
> 標籤：#B2B #NextJS #React #i18n #模板系統 #資料分離
> 狀態：🔵 規劃中
> 相關：[[GTMC_官網重塑專案]]

---

## 原始需求

希望自己規劃一個 B2B 網站並且使用 HTML 模式，希望產品與最新消息或者一些屬於會上架型的資料是可以資料與框架分離。

---

## 核心概念：母版 + 擴充區

B2B 模板系統 = **可複用的網站產品**，核心架構：

- **母版（Base Template）**：所有客戶共用，可版本更新
- **擴充區（Extension Slots）**：每個客戶獨立，不影響母版
- **JSON 資料分離**：內容與框架完全獨立

---

## 元件庫基底

> 來源：[france0414/my-project](https://github.com/france0414/my-project)
> 技術棧：Next.js + React 19 + TypeScript + Tailwind CSS 4 + shadcn/ui

### 已有元件（從 my-project 遷移）

**三層架構：**
```
第 1 層：shadcn/ui 基礎元件（npx shadcn add 安裝）
  Button, Card, Dialog, Badge...
  ↓
第 2 層：通用元件（自己封裝）
  BaseCard, ImageDisplay, ResponsiveColumnsControl
  ↓
第 3 層：業務元件（基於第 2 層擴展）
  ProductCard/List, NewsCard/List/Section/Homepage,
  CategoryCard/List, HeroCarousel, BackgroundSection
```

**元件清單：**

| 類別 | 元件 | 狀態 |
|---|---|---|
| 基礎 | BaseCard（vertical/horizontal/overlay layout） | ✅ 可用 |
| 基礎 | ImageDisplay（桌面/手機雙圖源、比例控制） | ✅ 可用 |
| 基礎 | ResponsiveColumnsControl（5 斷點欄位控制） | ✅ 可用 |
| 產品 | ProductCard / ProductList（Grid/List、篩選） | ✅ 可用 |
| 新聞 | NewsCard / NewsList / NewsSection / NewsHomepage | ✅ 可用 |
| 分類 | CategoryCard / CategoryList | ✅ 可用 |
| 頁面 | HeroCarousel（slide/fade/parallax） | ✅ 可用 |
| 頁面 | BackgroundSection（響應式背景圖、視差） | ✅ 可用 |
| 表單 | ContactForm / InquiryForm | 🚧 開發中 |

**元件檔案結構規範：**
```
src/components/ComponentName/
├── ComponentName.tsx          # 主元件
├── ComponentName.types.ts     # TypeScript 介面
├── ComponentName.stories.tsx  # Storybook 故事（穩定後加回）
├── ComponentName.utils.ts     # 工具函數（可選）
└── index.ts                   # 統一匯出
```

### 遷移計畫：Fork 乾淨版

> my-project 有 8 套 AI 工具設定檔互相衝突 + 舊文件，不直接用，Fork 乾淨版。

**搬過來：**
- `src/components/Common/` — BaseCard, ImageDisplay, ResponsiveColumnsControl
- `src/components/Product/` — ProductCard, ProductList
- `src/components/News/` — NewsCard, NewsList, NewsSection
- `src/components/Category/` — CategoryCard, CategoryList
- `src/components/HeroCarousel/`、`BackgroundSection/`
- `components.json`（shadcn/ui 設定）
- `tailwind.config.ts`

**不搬（清掉）：**
- ❌ `.agent/` `.claude/` `.codex/` `.cursor/` `.gemini/` `.kiro/` `.roo/` `.windsurf/`（8 套 AI 設定）
- ❌ `AGENTS.md`、`AGENTS.backup.md`（舊 AI 指令）
- ❌ `COMPONENTS_OLD.md`、`ICON_SYSTEM_REFACTOR.md`（過時文件）
- ❌ `component-report.json`、`test-notion.js`（實驗性腳本）
- ❌ `.storybook/`（穩定後再加回）

**只保留一份 AI 指令**（選主力工具：VS Code Copilot 或 Cursor）

### 新 repo 初始化步驟

```bash
# 1. 建立新專案
npx create-next-app@latest b2b-template --typescript --tailwind --app
# 2. 安裝 shadcn/ui
npx shadcn@latest init
npx shadcn@latest add button card badge dialog ...
# 3. 從 my-project 搬元件
cp -r my-project/src/components/Common/ b2b-template/src/components/
cp -r my-project/src/components/Product/ b2b-template/src/components/
# ... 其餘元件同理
# 4. 確認 import 路徑一致（@/components/ui/...）
# 5. 建立 data/ 資料夾放 JSON
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

### 頁面規劃

| 頁面 | 讀取資料 | Layout |
|---|---|---|
| 首頁 `/` | `company.json` + `products.json`（精選） | `<RootLayout>` |
| 產品列表 `/products` | `products.json` 依分類篩選 | `<SidebarLayout>` |
| 產品明細 `/products/[slug]` | 單筆 product（`getStaticPaths`） | `<RootLayout>` |
| 最新消息列表 `/news` | `news.json` | `<SidebarLayout>` |
| 新聞內頁 `/news/[slug]` | 單篇（`getStaticPaths`） | `<RootLayout>` |
| 關於我們 `/about` | `company.json` | `<RootLayout>` |
| 聯絡/詢價 `/contact` | Formspree 表單 | `<RootLayout>` |

---

## 多語系（i18n）

### 規格

- 先支援：**中文 + 英文**
- 架構支援未來擴充其他語系（日文等）

### 架構：資料夾分語系

```
data/
  zh/
    products.json
    news.json
    company.json
  en/
    products.json
    news.json
    company.json
  ja/                    ← 未來擴充只加資料夾
    ...

src/pages/
  [locale]/
    index.tsx
    products/
      index.tsx
      [slug].tsx
    news/
      index.tsx
      [slug].tsx
```

### JSON 欄位設計 — 分檔不巢狀

```json
// data/zh/products.json
[{ "id": "p001", "name": "CNC 車床", "description": "高精度..." }]

// data/en/products.json
[{ "id": "p001", "name": "CNC Lathe", "description": "High precision..." }]
```

### Next.js i18n 設定

```js
// next.config.js
module.exports = {
  i18n: {
    locales: ['zh', 'en'],
    defaultLocale: 'zh',
  },
};
```

或使用 `next-intl` 套件處理更複雜的 i18n 需求（路由、翻譯檔、locale 切換）。

### 圖片命名規則（共用 media/ 資料夾）

| 圖片類型 | 命名 | 範例 |
|---|---|---|
| 無文字，共用 | `{id}_{用途}.jpg` | `p001_hero.jpg` |
| 有文字，分語系 | `{id}_{用途}_{lang}.jpg` | `p001_spec_zh.jpg`、`p001_spec_en.jpg` |

JSON 裡指向對應語系的圖片：
```json
// data/zh/products.json
{ "images": { "hero": "media/p001_hero.jpg", "spec": "media/p001_spec_zh.jpg" } }

// data/en/products.json
{ "images": { "hero": "media/p001_hero.jpg", "spec": "media/p001_spec_en.jpg" } }
```

### 多語系工作流程

```
1. 先寫中文：data/zh/*.json（主要語系）
2. AI 翻譯：保持 key 不變，只翻 value → data/en/*.json
3. 人工校對：B2B 專業術語、產品規格需確認
4. 圖片：有文字的圖出語系版本，無文字的共用
```

擴充新語系只需：加 `data/{lang}/` + `src/pages/[locale]/` 頁面 + next.config 加 locale。

---

## AI 文案生成

> 客戶資料未齊全時，可用 AI 生成有意義的初版文案，客戶確認後替換。

### 工作流程

```
1. 收集客戶基本資訊（公司名、產業、產品線、目標市場）
2. AI 根據產業 + 市場研究，生成初版文案 JSON
3. 網站先跑起來，客戶看到實際效果
4. 客戶提供真實資料 → 替換對應 JSON 欄位
5. 混合模式：部分 AI 生成 + 部分客戶提供
```

### JSON 加 _source 追蹤欄位

```json
{
  "id": "p001",
  "name": "CNC 車床 VL-25",
  "description": "高精度數控車床...",
  "_source": "ai_draft",
  "_review": false
}
```

| `_source` 值 | 意思 |
|---|---|
| `client` | 客戶提供的真實資料 |
| `ai_draft` | AI 生成的初稿，待客戶確認 |
| `ai_reviewed` | AI 生成，客戶已確認 |

### AI 生成 Prompt 要素

| 要素 | 說明 |
|---|---|
| 目標關鍵字 | 該產業核心搜尋詞 |
| 搜尋意圖 | 買家找規格？比價？初步了解？ |
| 競品參考 | 可先爬競品網站作為 context |
| 字數限制 | meta_title 60 字、meta_description 155 字 |
| 語氣 | B2B 偏專業、數據導向 |

---

## AI SEO（AEO）

> AI 搜尋引擎（ChatGPT、Perplexity、Gemini）也會爬網站，需要額外優化。

| 做法 | 說明 | 實作方式 |
|---|---|---|
| **Schema.org JSON-LD** | 告訴 AI 每頁內容類型 | Next.js `<Head>` 或 `metadata` API 統一注入 |
| **語意化 HTML** | `<article>`, `<section>`, `<nav>` | React 元件直接寫語意標籤 |
| **llms.txt** | 給 AI 爬蟲的網站摘要檔 | `public/llms.txt` |
| **sitemap.xml** | AI 爬蟲也讀 | `next-sitemap` 套件 |
| **Open Graph + Meta** | AI 引用時抓描述 | Next.js `metadata` API 統一管理 |
| **FAQ Schema** | 服務頁/產品頁加 FAQ | 提高 AI 引用機率 |

### JSON SEO 欄位

每筆資料都需包含：
```json
{
  "seo": {
    "meta_title": "CNC 車床 VL-25 | XX 精機",
    "meta_description": "高精度 CNC 車床，主軸轉速 6000rpm...",
    "og_image": "media/p001_hero.jpg",
    "keywords": ["CNC 車床", "CNC Lathe", "台灣工具機"],
    "schema_type": "Product"
  }
}
```

---

## 雙軌協作架構（Code + Visual）

> 你（VS Code）寫邏輯和資料層，設計師（v0/Bolt）生成視覺元件，統一合併。

### 統一元件規範

**所有人輸出都必須遵守：** shadcn/ui + Tailwind CSS + TypeScript

```
你（VS Code + Copilot）── 寫 Layout、資料層、動畫 ──┐
                                                       ├──→ 同一個 Next.js 專案
設計師（v0 / Bolt / Lovable）── 生成 UI 元件 ──────────┘
```

### 視覺 AI 工具整合

| 工具 | 輸出格式 | 整合方式 | 適合 |
|---|---|---|---|
| **v0 (Vercel)** | React + shadcn/ui + Tailwind | `npx shadcn add` 或複製元件 | 設計師 / 你 |
| **Bolt.new** | 完整 Next.js 專案 | 匯出 GitHub → 拆元件合併 | 快速出原型 |
| **Lovable** | React + Tailwind | 匯出 GitHub | 快速出原型 |
| **Figma → code** | React 元件 | 複製進專案 | 傳統設計師 |

### 協作流程

```
1. 你定義元件介面（props 規格）
   → ProductCard 需要 { name, image, price, description }

2. 設計師用 v0 生成視覺元件
   → prompt：「B2B 產品卡片，工業風格，shadcn/ui」
   → v0 產出 ProductCard.tsx

3. 你收到元件，放進 components/blocks/
   → 確認 props 介面一致
   → 接上 JSON 資料

4. 需調整 → 你在 VS Code 微調 / 設計師在 v0 重新生成
```

### AI 指令管理

**只保留一份主力 AI 指令**，避免多工具衝突：
- VS Code：`.github/copilot-instructions.md` 或 `.cursor/rules/`
- 內容：元件規範、shadcn/ui 用法、Tailwind token、SEO 語意標籤規則

---

## 動畫 / 3D 視覺層

> 與 shadcn/ui 元件層獨立，各司其職。

### 技術選擇

| 類型 | 工具 | 用途 | React 整合 |
|---|---|---|---|
| **頁面動畫** | `framer-motion` | 進場動畫、頁面轉場、數字跳動 | ✅ shadcn 官方推薦 |
| **進階動畫** | `GSAP` | 時間軸、ScrollTrigger | ✅ |
| **平滑滾動** | `Lenis` | 全站平滑滾動效果 | ✅ |
| **3D** | `@react-three/fiber` (R3F) | Three.js 的 React 版 | ✅ 原生 React 元件 |
| **3D 輔助** | `@react-three/drei` | 燈光、模型載入、OrbitControls | ✅ |
| **Canvas 2D** | 原生 Canvas API | 粒子效果、背景動畫 | ✅ `useRef` |

### B2B 常用場景

| 場景 | 技術 | 效果 |
|---|---|---|
| 首頁 Hero | Three.js + Shader | 3D 產品模型旋轉、光影 |
| 滾動進場 | Framer Motion `whileInView` | 元素依序淡入滑入 |
| 產品展示 | R3F + drei | 360° 互動旋轉產品 |
| 背景效果 | Canvas 粒子 | 科技感粒子流動 |
| 頁面轉場 | Framer Motion `AnimatePresence` | 頁面切換過渡 |
| 數字跳動 | Framer Motion `useSpring` | 產能數據從 0 跳到目標值 |

### 元件資料夾結構

```
src/components/
  ui/               ← shadcn/ui 基礎元件
  common/            ← BaseCard, ImageDisplay（已有）
  blocks/            ← ProductCard, NewsCard（已有）
  three/             ← 3D 元件（新增）
    ProductViewer.tsx     ← 3D 產品展示
    ParticleBackground.tsx ← 粒子背景
    HeroScene.tsx         ← 首頁 3D 場景
  motion/            ← 動畫 wrapper（新增）
    FadeInView.tsx        ← 滾動進場
    PageTransition.tsx    ← 頁面轉場
    CountUp.tsx           ← 數字跳動
  layouts/           ← RootLayout, SidebarLayout
```

### 用法範例

```tsx
<RootLayout>                          {/* shadcn Layout */}
  <HeroSection>
    <Canvas>                          {/* Three.js 3D 場景 */}
      <OrbitControls />
      <ProductModel url="/models/cnc.glb" />
    </Canvas>
  </HeroSection>

  <motion.div                         {/* Framer Motion 動畫 */}
    initial={{ opacity: 0, y: 20 }}
    whileInView={{ opacity: 1, y: 0 }}
  >
    <ProductCard {...data} />         {/* shadcn 元件照常用 */}
  </motion.div>
</RootLayout>
```

---

## 三種部署模式

> 同一份 code，切換 `next.config.js` 一行設定即可。

### 模式 A：純靜態 HTML（預設）

```js
// next.config.js
module.exports = { output: 'export' };
// npm run build → out/ 資料夾 → 全部是 .html + .css + .js
```

- 資料來源：本地 JSON 檔（Build 時讀取，嵌進 HTML）
- 後台：❌ 無
- 部署：任何主機（Vercel / Netlify / GitHub Pages / 虛擬主機 / USB）
- 適合：先上線、客戶預覽、展示用

### 模式 B：Next.js 全端（有後台）

```js
// next.config.js
module.exports = {};  // 不寫 output，預設 Node.js server
```

- 資料來源：CMS API（Strapi / Directus）
- 後台：✅ CMS 後台登入上架
- 部署：Vercel / VPS
- 適合：客戶自己管理內容

### 模式 C：混合模式

- 靜態頁 + 部分 API Routes
- 資料來源：JSON + API 混用
- 適合：漸進式升級

### 演進路線

```
現在（模式 A）           之後（模式 B）            再之後
─────────              ──────────              ──────
JSON 檔案          →    Strapi / Directus     →    自建後台
手動改 JSON        →    CMS 後台上架           →    多角色權限
getStaticProps     →    getStaticProps         →    getServerSideProps
讀 fs.readFile     →    讀 fetch(CMS_API)     →    讀 DB / API
```

**前端元件、shadcn/ui、Three.js、動畫、i18n 切換模式完全不用改。**

---

## Block 組合系統

> 頁面不寫死，用區塊組合。不同產業 = 不同區塊排列，共用同一套元件。

### 核心概念

```
頁面 = 區塊池裡挑選 + 排序

homepage.json = [
  { "block": "HeroBanner", "variant": "video" },
  { "block": "ProductHighlight", "variant": "grid-3" },
  { "block": "NewsLatest", "variant": "cards-3" },
  { "block": "ContactCTA", "variant": "with-form" }
]
```

### 區塊池（Block Library）

| 區塊 | 用途 | 變體（variant） |
|---|---|---|
| **HeroBanner** | 首屏大圖/影片 | `image` / `video` / `carousel` / `3d-scene` |
| **ProductHighlight** | 精選產品 | `grid-3` / `grid-4` / `carousel` / `featured-1` |
| **CategoryShowcase** | 產品分類導覽 | `cards` / `icons` / `tabs` |
| **AboutPreview** | 公司簡介摘要 | `text-image` / `stats` / `timeline` |
| **NewsLatest** | 最新消息 | `cards-3` / `list` / `featured-side` |
| **ClientLogos** | 合作客戶牆 | `scroll` / `grid` / `carousel` |
| **Certifications** | 認證/獎項 | `badges` / `cards` |
| **VideoShowcase** | 影片展示 | `single` / `gallery` |
| **StatsCounter** | 數據亮點 | `4-columns` / `banner` |
| **ContactCTA** | 聯絡行動呼籲 | `simple` / `with-form` / `map` |
| **FAQ** | 常見問題 | `accordion` / `two-column` |
| **Testimonials** | 客戶見證 | `quotes` / `cards` / `carousel` |

### 產業預設模板

```json
// data/templates/manufacturing.json — 製造業 / OEM
{
  "name": "製造業 / OEM",
  "blocks": [
    { "block": "HeroBanner", "variant": "video" },
    { "block": "ProductHighlight", "variant": "grid-3" },
    { "block": "StatsCounter", "variant": "4-columns" },
    { "block": "CategoryShowcase", "variant": "icons" },
    { "block": "Certifications", "variant": "badges" },
    { "block": "ClientLogos", "variant": "scroll" },
    { "block": "NewsLatest", "variant": "cards-3" },
    { "block": "ContactCTA", "variant": "with-form" }
  ]
}

// data/templates/trading.json — 貿易商 / 代理
{
  "name": "貿易商 / 代理",
  "blocks": [
    { "block": "HeroBanner", "variant": "carousel" },
    { "block": "CategoryShowcase", "variant": "cards" },
    { "block": "ProductHighlight", "variant": "grid-4" },
    { "block": "AboutPreview", "variant": "text-image" },
    { "block": "ClientLogos", "variant": "grid" },
    { "block": "NewsLatest", "variant": "list" },
    { "block": "ContactCTA", "variant": "simple" }
  ]
}

// data/templates/food.json — 食品 / 農業
{
  "name": "食品 / 農業",
  "blocks": [
    { "block": "HeroBanner", "variant": "image" },
    { "block": "AboutPreview", "variant": "stats" },
    { "block": "ProductHighlight", "variant": "featured-1" },
    { "block": "Certifications", "variant": "cards" },
    { "block": "VideoShowcase", "variant": "single" },
    { "block": "Testimonials", "variant": "quotes" },
    { "block": "ContactCTA", "variant": "with-form" }
  ]
}
```

### BlockRenderer 技術實作

```tsx
// src/components/blocks/BlockRenderer.tsx
const BLOCK_MAP = {
  HeroBanner, ProductHighlight, CategoryShowcase,
  AboutPreview, NewsLatest, ClientLogos, Certifications,
  VideoShowcase, StatsCounter, ContactCTA, FAQ, Testimonials,
};

export function BlockRenderer({ blocks, data }) {
  return (
    <>
      {blocks.map((block, i) => {
        const Component = BLOCK_MAP[block.block];
        if (!Component) return null;
        return <Component key={i} variant={block.variant} data={data} />;
      })}
    </>
  );
}
```

### Block Props 合約（強制）

> 不強制用 shadcn/ui，只要 props 介面對就行。設計師愛用 MUI、純 CSS 都可以。

```ts
// 每個 Block 必須遵守的介面
interface BlockProps {
  variant?: string;      // 必須支援 variant
  data: Record<string, any>;  // 資料從外部傳入
  className?: string;    // 方便外層加動畫
}
```

| 必須遵守 | 建議但不強制 |
|---|---|
| ✅ TypeScript props 介面 | 💡 shadcn/ui |
| ✅ 接受 `variant` + `data` props | 💡 Tailwind CSS |
| ✅ 輸出合法 JSX | 💡 語意化 HTML |
| ✅ 不在元件內 fetch 資料 | 💡 framer-motion |
| ✅ 支援 `className` 傳入 | |

### 客戶選擇流程

```
Step 1: 選產業模板（起點）→ 載入預設 homepage.json
Step 2: 客製區塊 → 加/刪/換 variant
Step 3: 輸出調整後的 homepage.json
Step 4: 填入資料 → 客戶提供 or AI 生成
```

每個客戶的差異只是：
```
client-a/
  homepage.json      ← 區塊組合（不同）
  data/zh/           ← 資料內容（不同）
  theme.json         ← 顏色、字型（不同）

模板 code            ← 完全共用，不用改
```

---

## 客戶資料需求清單

### 模板 Demo 用（你自己準備）

| 資料 | 內容 | 數量 | 來源 |
|---|---|---|---|
| Demo 公司資訊 | 公司名、Slogan、簡介、地址 | 1 份 | AI 生成 |
| Demo 產品 | 產品名、規格、描述、分類、圖片 | 6-10 筆 | AI 生成 + Unsplash |
| Demo 新聞 | 標題、日期、內文、分類 | 4-6 篇 | AI 生成 |
| Demo 圖片 | Hero、產品圖、Logo | 15-20 張 | Unsplash / Pexels |
| 3D 模型（選配） | 展示用 .glb 檔 | 1-2 個 | Sketchfab 免費 |

### 客戶必填

| 類別 | 項目 | 格式 |
|---|---|---|
| **公司基本** | 公司名稱（中/英） | 文字 |
| | Logo（PNG/SVG 透明背景） | 圖檔 |
| | 公司簡介（200-500 字） | 文字 |
| | 聯絡電話、Email | 文字 |
| | 公司地址（中/英） | 文字 |
| | Slogan | 文字 |
| **產品資料** | 產品名稱（中/英） | 文字 |
| | 產品分類 | 文字 |
| | 產品描述（100-300 字/筆） | 文字 |
| | 產品圖片（至少 1 張/筆） | 圖檔 |
| **最新消息** | 至少 2-3 篇文章 | 文字+圖 |

### 客戶選填（加分）

| 項目 | 用途 |
|---|---|
| 客戶 Logo 牆 | 首頁信任區塊 |
| 認證/獎項圖片 | 關於我們頁 |
| 工廠/辦公室照片 3-5 張 | 關於我們頁 |
| 公司影片 | Hero 或產品頁 |
| FAQ 5-10 題 | SEO + AI SEO（FAQ Schema） |
| 社群連結（FB / LINE / YT） | Footer |
| Google Analytics GA4 ID | 流量分析 |
| 網域 | 部署上線 |

### 資料不齊全時的處理

```
客戶只給了公司名 + 5 張產品圖 + 產品型號？
→ AI 文案生成：
  1. 公司名 + 產業 → AI 生成公司簡介
  2. 產品型號 + 圖 → AI 生成產品描述
  3. AI 生成新聞（產業趨勢、展覽、新品發布）
  4. 全部標記 _source: "ai_draft"
  5. 網站先上線，客戶看效果後逐步替換
```

### 建議：做 Google Sheet 收集表

```
Sheet 1: 公司資訊（公司名、地址、電話、簡介）
Sheet 2: 產品資料（一行一筆：名稱、分類、描述、規格）
Sheet 3: 新聞文章（標題、日期、內文）
Sheet 4: 圖片清單（檔名、用途、對應產品 ID）
→ 客戶填好 → 你轉成 JSON → 網站自動生成
```

---

## Generator 與 Pipeline 規劃

> Generator = 照模板填空（單步）；Pipeline = 多步串接（量產時再做）

### Generator（開發時用）

| Generator | 優先級 | 用途 |
|---|---|---|
| **Block 元件生成器** | ⭐ 高 | 每次建新 Block 固定產出 `.tsx` + `.types.ts` + `index.ts` |
| **JSON 資料生成器** | ⭐ 高 | AI 生成客戶文案時確保格式一致、SEO 欄位完整 |
| **首頁配置生成器** | 中 | 依產業自動組合區塊，產出 `homepage.json` |

**Generator 資料夾結構（待選定主力 AI 工具後建立）：**
```
.skills/（或 .cursor/skills/ 或 .codex/skills/）
  block-generator/
    SKILL.md                      ← AI 讀取的指令
    assets/
      Component.tsx               ← 元件模板
      Component.types.ts          ← 介面模板
      index.ts                    ← 匯出模板
    references/
      block-style-guide.md        ← 規範

  json-generator/
    SKILL.md
    assets/
      products.template.json      ← 產品 JSON 模板
      news.template.json
      company.template.json
    references/
      json-style-guide.md         ← 欄位規則、_source、SEO 必填
      seo-rules.md

  homepage-generator/
    SKILL.md
    assets/
      homepage.template.json
    references/
      industry-guide.md           ← 各產業建議區塊
      block-catalog.md            ← 所有可用區塊清單
```

### Pipeline（量產階段再做）

```
「新客戶上線 Pipeline」
  客戶填 Google Sheet
    → [1] 轉成 JSON
    → [2] AI 補齊缺漏（_source: ai_draft）
    → [3] AI 翻譯 zh → en
    → [4] AI 生成 SEO 欄位
    → [5] 選產業模板 → homepage.json
    → [6] 套主題色 → theme.json
    → [7] npm run build → 靜態 HTML
    → [8] 部署 Vercel preview URL
    → 客戶看效果 → 調整 → 上線
```

Pipeline 的每一步其實就是呼叫不同的 Generator。等 Block 系統和 JSON 模板穩定後再串。

---

## AI Skill 規劃

> 等選定主力 AI 工具後安裝。不管用什麼工具，只保留一份指令。

### 建議安裝

| Skill | 優先級 | 用途 |
|---|---|---|
| **web-design-guidelines** | ⭐ 建議 | 確保 AI 產出元件符合設計原則（間距、排版、對比） |
| **frontend-design** | ⭐ 建議 | 元件設計一致性（responsive、spacing、layout） |
| **block-generator**（自建） | ⭐ 高 | 確保新 Block 結構一致 |
| **json-generator**（自建） | ⭐ 高 | 確保 JSON 格式一致 |
| **design-md** | 💡 之後再加 | 寫 Design Token 文件時用 |
| **stitch-design** | ❌ 不需要 | 除非確定用 Stitch |

### 安裝後整合原則

```
1. 所有外部 Skill 下載後合併精簡成自己的版本
2. 內容對齊 Block props 介面 + JSON Schema + shadcn/ui 規範
3. 只放在一個工具的資料夾裡（不要 8 套共存）
4. Skill 是「給 AI 的指令」，不進 production build
```

---

## 未來擴充（CMS 選配）

```
之前：Next.js getStaticProps → 讀本地 JSON 檔
之後：Next.js getStaticProps → 讀 CMS API（回傳一樣的 JSON 結構）
```

CMS 選項：Strapi / Directus / Google Sheets + API / Notion API
**現在不用決定**，JSON 結構定好了，之後換什麼都行。
Strapi 原生支援 i18n locale，多語系也能無縫接上。

---

## 前台編輯模式（Visual Editor）

> Block 元件本身就內建編輯能力，不依賴後台。前台編輯 = 改 JSON State → 匯出 JSON。

### 核心概念

```
現在：  JSON 檔 → props → Block 渲染（唯讀）
編輯模式：JSON State ←→ props ←→ Block 渲染 + 編輯 UI（雙向）
儲存：  JSON State → 匯出 JSON 檔（下載 / 複製 / POST API）
```

### 三層控制

| 層級 | 操作 | 對應 JSON |
|---|---|---|
| **頁面級** | Block 排序、新增、刪除 | `homepage.json` blocks 陣列 |
| **區塊級** | 切換 variant、調整設定（欄數、背景色、左右切換） | `block.config` 物件 |
| **內容級** | 文字 inline 編輯、圖片替換、項目排序、插入新項目 | `block.items` 陣列 |

### Block JSON 結構（擴充 config + items）

```json
{
  "block": "ProductHighlight",
  "variant": "grid-3",
  "config": {
    "columns": 3,
    "layout": "horizontal",
    "showPrice": true
  },
  "items": [
    { "type": "product", "id": "p001" },
    { "type": "product", "id": "p002" },
    { "type": "text", "content": "自訂文字區塊" },
    { "type": "image", "src": "media/custom.jpg", "alt": "說明" }
  ]
}
```

### Block Props 合約擴充

```ts
// 原有 BlockProps 加上編輯相關 props
interface BlockProps {
  variant?: string;
  data: Record<string, any>;
  className?: string;
  // ↓ 編輯模式擴充（Phase 2+ 才實作，現在先預留介面）
  isEditMode?: boolean;
  onUpdate?: (newBlockData: BlockData) => void;
}
```

**Phase 1 預留策略：props 介面先定義 `isEditMode` + `onUpdate`，但不實作邏輯。** Block 元件內部只要加一個 `if (!isEditMode) return 純展示;` 的判斷點即可，零成本預留。

### 技術選擇

| 功能 | 庫 | 階段 |
|---|---|---|
| Block 拖曳排序 | `@dnd-kit/core` + `@dnd-kit/sortable` | Phase 2+ |
| 文字 inline 編輯 | `contentEditable` 或 `@tiptap/react` | Phase 2+ |
| 圖片替換 | `<input type="file">` + FileReader | Phase 2+ |
| 設定面板 | shadcn/ui `Sheet` + `Select` + `Switch` | Phase 2+ |
| 儲存 | JSON 匯出下載 → 未來接 API | Phase 2+ |

### 後台同步演進（未來）

```
Phase 1：零後台，JSON 檔驅動
Phase 2：前台編輯 → 匯出 JSON（仍無後台）
Phase 3+：接 Strapi Dynamic Zone 或自建 Schema Registry
  → 前台編輯存回 CMS API
  → 後台自動產生對應表單
  → 新增 Block = 新增 Strapi Component，前後台同時可用
```

**現在不做後台同步，但 JSON 結構（block + variant + config + items）本身就是為了讓後台能無痛接入。**

---

## 三階段開發計畫

### Phase 1：完整 B2B 網站能力（2-3 天內）

> 目標：AI 系統能產出一個完整的 B2B 網站（展示型，純靜態）

**Day 1 — 基礎建設**

| # | 任務 | 產出 |
|---|---|---|
| 1 | 選定主力 AI 工具（VS Code Copilot） | `.github/copilot-instructions.md` |
| 2 | 建立乾淨 repo `b2b-template` | Next.js + shadcn/ui + Tailwind 專案 |
| 3 | 從 my-project 搬元件（Common / Product / News / Category） | `src/components/` |
| 4 | 建立 Block 資料夾 + `BlockRenderer.tsx` | `src/components/blocks/` |
| 5 | 建立 `data/` + JSON Schema（products / news / company） | `data/zh/*.json` |
| 6 | 建立產業預設模板 | `data/templates/manufacturing.json` 等 |

**Day 2 — 頁面串接 + i18n + SEO**

| # | 任務 | 產出 |
|---|---|---|
| 7 | 接上 `getStaticProps` 讀 JSON → BlockRenderer 渲染 | 首頁 + 產品列表 + 產品明細 |
| 8 | 加入 i18n（`next-intl`）+ 資料夾分語系 | `data/en/*.json` + locale 路由 |
| 9 | 加入 SEO Layout（metadata API + Schema.org JSON-LD） | `<Head>` + `llms.txt` |
| 10 | 加入 Framer Motion 基礎動畫 | `FadeInView` 滾動進場 |

**Day 3 — Generator + Demo + 詢價車**

| # | 任務 | 產出 |
|---|---|---|
| 11 | 做 Block Generator（SKILL.md + 模板） | `.skills/block-generator/` |
| 12 | 做 JSON Generator（SKILL.md + 模板） | `.skills/json-generator/` |
| 13 | 基礎詢價車（加入詢價 + 詢價清單 + 送出表單） | `src/components/inquiry/` |
| 14 | AI 生成 Demo 資料（製造業範例） | `data/zh/*.json` 填滿 |
| 15 | 建立第一個完整 Demo Site | 可部署的靜態 B2B 網站 |

**詢價車 v1（Phase 1 基礎版）：**
```
功能：
- ProductCard 加「加入詢價」按鈕
- 詢價車側邊欄（shadcn Sheet）顯示已加入的產品
- 可調整數量、移除項目
- 送出詢價表單（公司名、聯絡人、Email、需求說明）→ Formspree
- localStorage 暫存（訪客不用登入）

技術：
- React Context 管理 cart state（簡單場景不需要 Zustand）
- shadcn Sheet + Badge + Button
- Formspree 零後端送信

元件：
  src/components/inquiry/
    InquiryCartProvider.tsx    ← Context Provider（包在 RootLayout）
    AddToInquiryButton.tsx     ← 加入詢價按鈕（放在 ProductCard）
    InquiryCartSheet.tsx       ← 詢價車側邊欄
    InquiryCartButton.tsx      ← Header 浮動按鈕（Badge 顯示數量）
    InquirySubmitForm.tsx      ← 送出表單
```

**Phase 1 預留（零成本）：**
- `BlockProps` 介面加 `isEditMode?: boolean` + `onUpdate?: callback`
- Block JSON 結構支援 `config` + `items`（但 Phase 1 只用 `block` + `variant`）
- 不裝 `@dnd-kit`、不寫編輯 UI

### Phase 2：篩選功能 + 詢價車進階 + 前台編輯

> 目標：產品互動篩選 + 詢價車增強 + 初步編輯能力

**詢價車 v2（進階功能）**

```
Phase 1 基礎版之上新增：
- 詢價項目加備註欄位（每筆產品可寫需求）
- 詢價紀錄 localStorage 歷史（上次送過什麼）
- 送出後自動產生 PDF 詢價單（選配）
- 接 API 存檔（如果有後台）
- Zustand 取代 Context（如果 state 變複雜）
```

**篩選功能（Product Filter）**

```
概念：產品列表頁的多條件篩選

篩選維度（從 JSON 自動產生）：
- 分類（category）
- 規格（specs 裡的 key-value）
- 關鍵字搜尋（name + description）
- 排序（名稱、日期、分類）

技術：
- URL query params 驅動（`/products?category=cnc&sort=name`）
- React state 篩選 + useMemo
- shadcn/ui Checkbox + Select + Input
- 手機版：篩選收進 Sheet 側邊欄
```

```tsx
// 元件結構
src/components/
  filter/
    ProductFilter.tsx          ← 篩選面板（桌面側邊欄 / 手機 Sheet）
    FilterCheckboxGroup.tsx    ← 勾選篩選（分類、規格）
    FilterSearchInput.tsx      ← 關鍵字搜尋
    FilterSortSelect.tsx       ← 排序下拉
    useProductFilter.ts        ← 篩選邏輯 hook
```

**JSON 預留欄位（Phase 1 就定義）：**
```json
{
  "id": "p001",
  "name": "CNC 車床 VL-25",
  "category": "cnc-lathe",
  "specs": {
    "主軸轉速": "6000 rpm",
    "加工直徑": "250mm",
    "精度": "±0.005mm"
  },
  "inquirable": true,
  "minOrderQuantity": 1
}
```

### Phase 3：產品變體系統

> 目標：一個產品有多種規格/型號/選項

```
概念：
  CNC 車床 VL 系列
    ├── VL-25（加工直徑 250mm）
    ├── VL-32（加工直徑 320mm）
    └── VL-40（加工直徑 400mm）
  
  每個變體有不同的：規格、價格、圖片、庫存狀態
```

**JSON 結構設計：**
```json
{
  "id": "p001",
  "name": "CNC 車床 VL 系列",
  "category": "cnc-lathe",
  "variants": [
    {
      "sku": "VL-25",
      "name": "VL-25",
      "specs": { "加工直徑": "250mm", "主軸轉速": "6000 rpm" },
      "images": { "hero": "media/p001_vl25.jpg" },
      "status": "available"
    },
    {
      "sku": "VL-32",
      "name": "VL-32",
      "specs": { "加工直徑": "320mm", "主軸轉速": "4500 rpm" },
      "images": { "hero": "media/p001_vl32.jpg" },
      "status": "available"
    }
  ],
  "variantAxis": ["加工直徑"],
  "commonSpecs": {
    "品牌": "XX 精機",
    "產地": "台灣"
  }
}
```

**元件設計：**
```tsx
src/components/
  product/
    ProductVariantSelector.tsx  ← 變體選擇器（按鈕組 / 下拉）
    ProductSpecTable.tsx        ← 規格比較表
    VariantImageGallery.tsx     ← 依選擇的變體切換圖片
```

**Phase 1 預留（零成本）：**
- products.json 欄位預留 `variants?: []` + `variantAxis?: []`
- Phase 1 不寫 variant 資料，ProductCard 正常顯示
- Phase 3 才實作 VariantSelector 元件

---

## Next Action（更新 2026-04-20）

### Phase 1（2-3 天內）

| # | 任務 | 優先級 | 狀態 |
|---|---|---|---|
| 1 | **選定主力 AI 工具** → VS Code Copilot，建立 `.github/copilot-instructions.md` | ⭐ | 🔴 待做 |
| 2 | **建立乾淨 repo** `b2b-template`，搬元件 | ⭐ | 🔴 待做 |
| 3 | 建立 Block 元件資料夾 + `BlockRenderer.tsx` | ⭐ | 🔴 待做 |
| 4 | 建立 `data/` + JSON Schema（含 Phase 2/3 預留欄位） | ⭐ | 🔴 待做 |
| 5 | 建立產業預設模板 | ⭐ | 🔴 待做 |
| 6 | 接上 `getStaticProps` → BlockRenderer | ⭐ | 🔴 待做 |
| 7 | i18n（`next-intl`）+ 資料夾分語系 | ⭐ | 🔴 待做 |
| 8 | SEO Layout + Schema.org JSON-LD | ⭐ | 🔴 待做 |
| 9 | Framer Motion 基礎動畫 | 中 | 🔴 待做 |
| 10 | Block Generator + JSON Generator（SKILL.md） | ⭐ | 🔴 待做 |
| 11 | 基礎詢價車 v1（加入詢價 + 側邊欄 + Formspree 送出） | ⭐ | 🔴 待做 |
| 12 | AI 生成 Demo 資料 + 第一個 Demo Site | ⭐ | 🔴 待做 |

### Phase 2（Phase 1 完成後）

| # | 任務 | 優先級 |
|---|---|---|
| 13 | 產品篩選（Filter + URL query + useMemo） | ⭐ |
| 14 | 詢價車 v2 進階（備註、歷史紀錄、PDF 匯出） | 中 |
| 15 | 前台編輯模式 v1（Block 排序 + variant 切換 + 文字編輯） | 中 |
| 16 | Google Sheet 客戶收集表模板 | 中 |

### Phase 3（有客戶需求時）

| # | 任務 | 優先級 |
|---|---|---|
| 17 | 產品變體系統（VariantSelector + SpecTable） | 依需求 |
| 18 | 前台編輯模式 v2（區塊內容新增 + 圖片替換 + 匯出） | 依需求 |
| 19 | 後台接入（Strapi Dynamic Zone） | 依需求 |
| 20 | Three.js 3D 產品展示 | 選配 |
| 21 | Pipeline 量產串接 | 量產時 |

---

## 決策紀錄

| 日期 | 決定 | 原因 |
|---|---|---|
| 2026-04-17 | ~~前端框架選定 Astro~~ → 改為 Next.js + React | 市場主流、AI 工具生態最佳、React 元件可複用、Vercel 部署 |
| 2026-04-17 | 納入 AI SEO（AEO） | Schema.org + llms.txt + 語意化 HTML |
| 2026-04-17 | 需要多語系，先中英 | B2B 外銷導向，Next.js i18n / next-intl + 資料夾分語系 |
| 2026-04-17 | 多語系先中後英，AI 翻譯 + 人工校對 | 中文先行 → AI 翻譯 → 專業術語人工校對 |
| 2026-04-17 | 圖片共用 media/，命名分語系 | 無文字共用，有文字加 `_{lang}` 後綴 |
| 2026-04-17 | AI 文案生成作為模板產品附加價值 | 客戶資料未齊全時 AI 先生成有意義內容，加 `_source` 追蹤 |
| 2026-04-17 | 以 my-project 元件庫為基底，Fork 乾淨版 | 已有成熟的 BaseCard + Product/News/Category 元件，不重寫 |
| 2026-04-17 | 清除 8 套 AI 設定檔，只保留一份主力指令 | 多份衝突指令導致 AI 生成不一致 |
| 2026-04-17 | 統一元件規範：shadcn/ui + Tailwind + TypeScript | 確保 VS Code 和視覺工具（v0/Bolt）輸出格式一致 |
| 2026-04-17 | 動畫層：Framer Motion（基礎）+ Three.js（3D） | 與 shadcn 元件層獨立，各管各的 |
| 2026-04-17 | 支援三種部署模式（純 HTML / 全端 / 混合） | `next.config.js` 一行切換，前端 code 不用改 |
| 2026-04-17 | 採用 Block 組合系統，頁面 = 區塊池排列 | 不同產業模板只是不同 JSON 配置，code 共用 |
| 2026-04-17 | Props 合約：TypeScript 介面必須遵守，UI 庫不強制 | 外部設計師可用 MUI 或純 CSS，只要 `variant` + `data` + `className` 介面對 |
| 2026-04-17 | Generator 模式先行，Pipeline 量產時再串 | Block Generator + JSON Generator 優先，Pipeline 等第一個客戶後才做 |
| 2026-04-17 | AI Skill 選擇：web-design-guidelines + frontend-design | stitch-design 不需要，design-md 之後再加 |
| 2026-04-20 | 三階段開發計畫：Phase 1 完整展示站 → Phase 2 詢價車+篩選 → Phase 3 產品變體 | 2-3 天內先有完整 B2B 網站能力，再疊互動功能 |
| 2026-04-20 | 前台編輯模式納入規劃，Phase 1 預留介面 | BlockProps 加 `isEditMode` + `onUpdate`，Block JSON 支援 `config` + `items`，零成本預留 |
| 2026-04-20 | 後台同步不做，JSON 結構本身就是後台接口 | block + variant + config + items 結構可直接對接 Strapi Dynamic Zone |
| 2026-04-20 | JSON Schema 預留 Phase 2/3 欄位 | `specs`、`inquirable`、`variants`、`variantAxis` 先定義不填值 |

---

## 與 GTMC 專案的關係

| | GTMC 官網重塑 | B2B 模板網站 |
|---|---|---|
| 資料來源 | MCP 從舊站爬取 | 自己規劃 / AI 生成 |
| 急迫程度 | 先做（舊站要淘汰） | 可並行或稍後 |
| 複雜度 | 較高（遷移、SEO redirect） | 較低（全新建置） |
| 多語系 | ❌ 不需要 | ✅ 中英文 |
| 共用部分 | Next.js + React 架構、AI SEO 規則、JSON 資料分離思維 | 同左 |

---

## 參考來源

- [france0414/my-project](https://github.com/france0414/my-project) — 元件庫基底（BaseCard、Product、News、Category、HeroCarousel）
- [Facebook 社群討論](https://www.facebook.com/groups/2294169410829101/posts/4480513625527991/)
- [Hygraph - Product Catalog Architecture](https://hygraph.com/blog/product-catalog-architecture)
- [shadcn/ui](https://ui.shadcn.com/) — React 元件庫
- [Framer Motion](https://motion.dev/) — React 動畫
- [React Three Fiber](https://r3f.docs.pmnd.rs/) — Three.js React 整合
- [next-intl](https://next-intl.dev/) — Next.js i18n
