# ICB Schema 規格草案

> 來源：延伸自 [[ICB_AI_結構生成架構規劃]] (2026-04-17)
> 校正基礎：已比對 icb-v2 repo 結構與工作流說明
> 標籤：#ICB #Schema #AI #Odoo #XML #結構設計
> 狀態：🟡 草案
> 目的：定義 ICB 在目前 Odoo 15 限制下，可供 AI 生成頁面 XML + SCSS 的結構規格

---

## 文件目標

這份文件現在要先對齊 icb-v2 的真實定位：

ICB 目前不是一般網站 runtime schema，也不是 React/Next.js 頁面組裝器。

它目前更接近：

- 設計師透過 AI 終端工具操作的 **Odoo 15 頁面生成工作流**
- AI 依規則輸出 **XML + SCSS** 到 `outputs/`
- 設計師再把結果貼回 Odoo 後台前台編輯流程中使用
- 動態產品 / 動態新聞區塊必須沿用 Odoo 原生 locked 結構，不能手刻 inner DOM

所以這份 schema 的目的，不是脫離 Odoo，而是要定義 AI 與現有 Odoo 生成流程之間共同使用的結構語言。

也就是說，這份 schema 要解決三件事：

1. AI 生成的結果要有固定格式
2. Validator 要能檢查這份格式是否合理
3. 產出器才能把這份格式轉成 Odoo 可貼用的 XML + SCSS

因此 ICB schema 在目前階段應該是 **Odoo-aware 的中介層格式**，而不是通用前端框架格式。

---

## 可轉譯結構藍圖規範 v1

這一節是給團隊實際執行用的。目標是先產出「可轉譯藍圖」，再轉成 Odoo XML + SCSS。

重點原則：

1. 先定結構，不先寫最終 HTML。
2. 每個 section 都要先標記 Odoo 對應策略。
3. 動態區塊一律走 locked snippet，不可手刻 inner DOM。

### A. 藍圖輸入輸出

- 輸入：設計需求（文字 / 網址 / 截圖 / clientinfo）
- 中介產物：`page_blueprint.json`
- 最終產物：`outputs/*.xml` + `outputs/*.scss`

### B. 藍圖最小欄位

```json
{
  "workflow": {
    "workflowType": "create",
    "requiresPhaseA": true,
    "designerConfirmation": true
  },
  "page": {
    "pageType": "homepage",
    "qwebType": "homepage",
    "goal": "build_trust"
  },
  "sections": [
    {
      "sectionId": "hero-001",
      "sectionType": "hero",
      "sectionMode": "static",
      "snippetRef": "s_banner",
      "templateRef": "templates/improved/banners/banner-03.xml"
    },
    {
      "sectionId": "products-001",
      "sectionType": "product_preview",
      "sectionMode": "dynamic_locked",
      "snippetRef": "s_dynamic_snippet_products",
      "baseTemplateRef": "templates/base/base-dynamic-products.xml",
      "templateKey": "website_sale.dynamic_filter_template_product_product_list_0001"
    }
  ]
}
```

### C. sectionMode 對應規則

| `sectionMode` | 適用情境 | 允許操作 | 禁止操作 |
|---|---|---|---|
| `static` | Hero、圖文、CTA、FAQ、品牌介紹 | 調整 section 結構與 class、套用 custom block | 任意使用不存在的 Odoo snippet |
| `dynamic_locked` | 最新產品、新聞、部落格輪播 | 設定 `templateKey`、`data-custom-name`、外層 class | 手刻產品卡 / 新聞卡 inner DOM |
| `static_navigation` | 分類導覽、類別卡片連結 | 用靜態 snippet 做導覽卡片 | 誤用動態 snippet 模擬分類導航 |
| `embed_js` | 互動地圖、特殊互動區塊 | 用 `s_embed_code` 與既有規則包裝 | 把 JS 散寫在非規範區塊 |

### D. 設計語言到 Odoo 的轉譯規則

| 設計需求語意 | 優先轉譯策略 | Odoo 落地 |
|---|---|---|
| 全螢幕視覺 Hero | `hero` + `static` | `s_banner` / `s_cover` + 對應 SCSS |
| 產品卡輪播 | `product_preview` + `dynamic_locked` | `s_dynamic_snippet_products` |
| 新聞列表 / 輪播 | `news_list` + `dynamic_locked` | `s_dynamic_snippet` |
| 分類入口卡片 | `category_nav` + `static_navigation` | `s_three_columns` / `s_media_list` |
| 互動效果（地圖/固定欄） | `embed_js` | `s_embed_code` + `s_custom_noRemove` |

### E. 可轉譯子集（避免完整 HTML 先行）

在藍圖階段只允許描述：

- section 階層
- row / col 佈局意圖
- snippet 類型
- 內容槽位（標題、副標、按鈕、圖片、列表）
- 動態資料來源需求

不建議在藍圖階段輸入：

- Tailwind / React 專用 class
- 完整成品 HTML DOM
- 與 Odoo 不相容的 JS 架構

### F. Phase A -> Phase B 交接檢查

進入 Phase B 前至少檢查：

1. 每個 section 都有 `sectionMode`。
2. `dynamic_locked` 都有 `baseTemplateRef` 與 `templateKey`。
3. 頁面 wrapper 規則已確認（`website.layout`、`pageName`）。
4. 輸出路徑指向 `outputs/`。

通過後才產 XML + SCSS。

---

## Odoo 語系模型補充（單結構 + 翻譯值）

依目前你的 Odoo 使用方式，建議把語系策略固定為：

- **頁面結構只有一份**（同一份 XML）
- 其他語系走 Odoo 翻譯機制（文字值翻譯），不是複製多份頁面結構

因此在 ICB schema 上建議：

1. `pageId` 只代表「頁面本體」，不帶語系後綴（例如 `home`）。
2. 多語系資訊放在內容層（translation values），不要複製 `sections`。
3. 除非有法規或市場需求造成版面結構不同，否則不要做 `home-en`、`home-ja` 這種多份 page blueprint。

---

## 首頁實例藍圖（home-3 版）

以下範例對應目前常見的 home-3 方向：

- 左文影片 Hero
- 產品分類靜態卡 + 動態產品
- 動態部落格結尾

可直接作為 `homepage-blueprint-demo.json` 的起始稿。

```json
{
  "workflow": {
    "workflowType": "create",
    "requestMode": "free_create",
    "inputSource": "text",
    "requiresPhaseA": true,
    "designerConfirmation": true,
    "outputTarget": "outputs/",
    "previewEnabled": true
  },
  "page": {
    "pageId": "home",
    "pageType": "homepage",
    "title": "首頁",
    "goal": "build_trust",
    "entryCommand": "/create",
    "recipeRef": "home-3",
    "qwebType": "homepage",
    "requiredSections": ["hero", "product_preview", "cta"],
    "xmlWrapperRules": ["must_use_website_layout", "homepage_requires_pageName"],
    "validationRules": ["must_have_single_h1", "cta_count_max_3"]
  },
  "sections": [
    {
      "sectionId": "hero-001",
      "sectionType": "hero",
      "sectionMode": "static",
      "purpose": "establish_brand_and_value",
      "variant": "textleftmiddle",
      "snippetRef": "s_banner",
      "templateRef": "templates/improved/home-recipes/home-3.xml",
      "contentRef": "content.home.hero.primary",
      "constraints": ["hero_must_be_first"],
      "priority": 100
    },
    {
      "sectionId": "intro-001",
      "sectionType": "rich_text",
      "sectionMode": "static",
      "purpose": "explain_company_strength",
      "variant": "split_intro",
      "snippetRef": "s_text_block",
      "templateRef": "templates/improved/content-sections/content-sections.xml",
      "contentRef": "content.home.intro.primary",
      "priority": 90
    },
    {
      "sectionId": "category-nav-001",
      "sectionType": "category_nav",
      "sectionMode": "static_navigation",
      "purpose": "guide_category_entry",
      "variant": "fullWrapProduct_static",
      "snippetRef": "s_static_snippet",
      "templateRef": "templates/improved/home-recipes/home-3.xml",
      "contentRef": "content.home.categories.primary",
      "constraints": ["not_use_dynamic_for_navigation"],
      "priority": 80
    },
    {
      "sectionId": "dynamic-products-001",
      "sectionType": "product_preview",
      "sectionMode": "dynamic_locked",
      "purpose": "show_latest_products",
      "variant": "fullWrapProduct_dynamic",
      "snippetRef": "s_dynamic_snippet_products",
      "templateRef": "templates/base/base-dynamic-products.xml",
      "contentRef": "content.home.products.dynamic",
      "props": {
        "templateKey": "website_sale.dynamic_filter_template_product_product_list_0001",
        "dataCustomName": "fullWrapProduct",
        "dataNumberOfElements": 4,
        "dataNumberOfRecords": 16
      },
      "constraints": ["locked_inner_dom", "section_class_only"],
      "priority": 70
    },
    {
      "sectionId": "cta-001",
      "sectionType": "cta",
      "sectionMode": "static",
      "purpose": "drive_inquiry",
      "variant": "titleUpperBg",
      "snippetRef": "s_call_to_action",
      "templateRef": "templates/improved/content-sections/content-sections-2.xml",
      "contentRef": "content.home.cta.primary",
      "priority": 60
    },
    {
      "sectionId": "dynamic-news-001",
      "sectionType": "news_list",
      "sectionMode": "dynamic_locked",
      "purpose": "show_recent_news",
      "variant": "s_blog_post_card",
      "snippetRef": "s_dynamic_snippet",
      "templateRef": "templates/base/base-dynamic-news.xml",
      "contentRef": "content.home.news.dynamic",
      "props": {
        "templateKey": "website_blog.dynamic_filter_template_blog_post_list_0001",
        "dataCustomName": "newsSummary",
        "dataNumberOfElements": 4,
        "dataNumberOfRecords": 4
      },
      "constraints": ["locked_inner_dom", "section_class_only"],
      "priority": 50
    }
  ],
  "snippetBindings": [
    {
      "bindingId": "bind-dynamic-products-001",
      "snippetType": "s_dynamic_snippet_products",
      "baseTemplateRef": "templates/base/base-dynamic-products.xml",
      "templateKey": "website_sale.dynamic_filter_template_product_product_list_0001",
      "dataCustomName": "fullWrapProduct",
      "customClasses": ["o_cc2", "s_custom_fullWrapProduct"],
      "innerDomEditable": false,
      "scssRef": "templates/improved/dynamic/products/customized-dynamic-products.scss",
      "constraints": ["locked_inner_dom", "must_use_existing_template_key"]
    },
    {
      "bindingId": "bind-dynamic-news-001",
      "snippetType": "s_dynamic_snippet",
      "baseTemplateRef": "templates/base/base-dynamic-news.xml",
      "templateKey": "website_blog.dynamic_filter_template_blog_post_list_0001",
      "dataCustomName": "newsSummary",
      "customClasses": ["o_cc1", "s_custom_newsSummary"],
      "innerDomEditable": false,
      "scssRef": "templates/improved/dynamic/news/customized-dynamic-news.scss",
      "constraints": ["locked_inner_dom", "must_use_existing_template_key"]
    }
  ],
  "output": {
    "artifactId": "2026-04-17_home3_blueprint_draft_01",
    "xmlOutputPath": "outputs/2026-04-17_home3_blueprint_draft_01.xml",
    "scssOutputPath": "outputs/2026-04-17_home3_blueprint_draft_01.scss",
    "workflowType": "create",
    "previewScript": "python scripts/build_preview.py outputs/2026-04-17_home3_blueprint_draft_01.xml outputs/2026-04-17_home3_blueprint_draft_01.scss",
    "validationStatus": "draft",
    "lockCheckRequired": true,
    "designerAction": "confirm_phase_a_then_generate_xml_scss"
  }
}
```

### 這份實例怎麼用

1. 先用它跑 Phase A 骨架確認（只調 section 順序、目標、模式）。
2. 確認 `dynamic_locked` 的 `templateKey` 與 `dataCustomName`。
3. Phase B 才輸出 XML + SCSS 到 `outputs/`。
4. 產出後跑 dynamic lock 檢查與 preview。

---

## 讀取 icb-v2 後的關鍵校正

根據 repo 現況，這份 schema 需要遵守以下現實限制：

1. **設計師入口是 AI 指令，不是可視化 builder**
   目前主流程是 `/page`、`/create`、`/dynamic`、`/btn`、`/js`、`/block`。
2. **產出物是 XML + SCSS，不是直接可執行網站**
   AI 產出會進 `outputs/`，再由設計師複製貼入 Odoo。
3. **動態區塊是 locked structure**
   `s_dynamic_snippet_products` 與 `s_dynamic_snippet` 只能改 section 外層 class、data-custom-name、template key 等參數，不能自創內部卡片 DOM。
4. **首頁與一般頁都受 QWeb + Bootstrap 4.5 骨架限制**
   必須遵守 `<t t-name>`、`<t t-call="website.layout">`、`.container` / `.container-fluid`、`data-snippet`、`data-name` 等規則。
5. **生成流程是兩階段**
   `/create` 不是直接吐 code，而是先做 Phase A 骨架規劃，再經確認後進 Phase B 生成 XML + SCSS。

因此這份文件後面的 schema，不應理解成「網站執行資料模型」，而應理解成「AI 規劃與 Odoo 產出之間的轉譯規格」。

---

## Schema 分層

以 icb-v2 的現況來看，第一版更適合分成五層：

1. **Workflow Schema**：這次是 `/page`、`/create`、`/dynamic` 哪一種工作流
2. **Page Blueprint Schema**：頁面骨架規劃結果
3. **Section Schema**：每個區塊是靜態、動態、導航或特殊嵌入
4. **Snippet Binding Schema**：區塊如何綁到 Odoo snippet / template key / locked base
5. **Output Artifact Schema**：最後輸出的 XML、SCSS、預覽與驗證資訊

這五層的關係如下：

```text
Workflow
  -> Page Blueprint
    -> Sections[]
      -> Snippet Binding
        -> XML / SCSS Output
```

---

## 1. Workflow Schema

Workflow Schema 負責定義這次請求屬於哪一種生成模式，以及是否需要先走骨架確認。

### 必要欄位

| 欄位 | 型別 | 必填 | 說明 |
|---|---|---|---|
| `workflowType` | enum | yes | `page` / `create` / `dynamic` |
| `requestMode` | enum | yes | `template_recipe` / `free_create` / `dynamic_locked` |
| `inputSource` | enum | yes | `text` / `url` / `screenshot` / `clientinfo` |
| `requiresPhaseA` | boolean | yes | 是否需先出骨架報表 |
| `designerConfirmation` | boolean | yes | 是否需等待設計師確認 |
| `outputTarget` | string | yes | 預設應為 `outputs/` |
| `previewEnabled` | boolean | no | 是否可接本地 preview |

### workflowType 建議枚舉

- `page`
- `create`
- `dynamic`

### 範例

```json
{
  "workflowType": "create",
  "requestMode": "free_create",
  "inputSource": "url",
  "requiresPhaseA": true,
  "designerConfirmation": true,
  "outputTarget": "outputs/",
  "previewEnabled": true
}
```

---

## 2. Page Blueprint Schema

Page Blueprint Schema 用來描述 AI 在 Phase A 或套版流程中規劃出的頁面骨架。這一層仍是規劃結果，不是最終 XML。

### 必要欄位

| 欄位 | 型別 | 必填 | 說明 |
|---|---|---|---|
| `pageId` | string | yes | 頁面唯一 ID |
| `pageType` | enum | yes | 頁面類型 |
| `title` | string | yes | 頁面名稱 |
| `goal` | string | yes | 此頁核心目標 |
| `entryCommand` | string | yes | 來自哪個指令 |
| `recipeRef` | string | no | 若為套版，參照哪個 home recipe / block recipe |
| `qwebType` | enum | yes | `homepage` / `standard_page` / `system_page_style_only` |
| `requiredSections` | string[] | no | 必備 section 類型 |
| `sections` | Section[] | yes | 區塊列表 |
| `xmlWrapperRules` | string[] | yes | QWeb 外層規範 |
| `validationRules` | string[] | no | 頁面級規則 |

### pageType 建議枚舉

- `homepage`
- `about`
- `product_list`
- `product_detail`
- `news_list`
- `news_detail`
- `contact`
- `faq`
- `landing_page`

### qwebType 建議枚舉

- `homepage`
- `standard_page`
- `system_page_style_only`

### page goal 範例

- `build_trust`
- `generate_inquiry`
- `show_product_range`
- `educate_market`
- `drive_campaign_conversion`

### 範例

```json
{
  "pageId": "home",
  "pageType": "homepage",
  "title": "首頁",
  "goal": "build_trust",
  "entryCommand": "/create",
  "recipeRef": "home-3",
  "qwebType": "homepage",
  "requiredSections": ["hero", "product_preview", "cta"],
  "sections": [],
  "xmlWrapperRules": ["must_use_website_layout", "homepage_requires_pageName"],
  "validationRules": ["must_have_single_h1", "cta_count_max_3"]
}
```

---

## 3. Section Schema

Section Schema 是 ICB 最重要的一層，因為 AI 真正決定的是每個區塊要用靜態結構、動態結構，還是鎖定基底。

### 必要欄位

| 欄位 | 型別 | 必填 | 說明 |
|---|---|---|---|
| `sectionId` | string | yes | 區塊唯一 ID |
| `sectionType` | enum | yes | 區塊類型 |
| `sectionMode` | enum | yes | `static` / `dynamic_locked` / `static_navigation` / `embed_js` |
| `purpose` | string | yes | 區塊目標 |
| `variant` | string | no | 區塊版型變體 |
| `snippetRef` | string | no | 對應 Odoo snippet 或自訂積木 |
| `templateRef` | string | no | 若套用既有模板，對應模板檔 |
| `contentRef` | string | no | 對應內容來源 |
| `props` | object | no | 區塊層級參數 |
| `visibilityRules` | object | no | 顯示條件 |
| `constraints` | string[] | no | 使用限制 |
| `priority` | number | no | 在頁面中的排序權重 |

### sectionType 建議枚舉

- `hero`
- `feature_grid`
- `logo_wall`
- `product_preview`
- `product_grid`
- `category_nav`
- `stats`
- `testimonials`
- `faq`
- `timeline`
- `cta`
- `contact_form`
- `rich_text`
- `gallery`

### 典型 constraints 範例

- `hero_must_be_first`
- `max_items_6`
- `requires_image_ratio_16_9`
- `cta_button_max_2`
- `not_adjacent_to_same_type`
- `locked_inner_dom`
- `must_use_odoo_dynamic_snippet`

### 範例

```json
{
  "sectionId": "hero-001",
  "sectionType": "hero",
  "sectionMode": "static",
  "purpose": "establish_brand_and_value",
  "variant": "split-left-text",
  "snippetRef": "s_banner",
  "templateRef": "templates/improved/banners/banner-03.xml",
  "contentRef": "content.home.hero.primary",
  "props": {
    "align": "left",
    "backgroundStyle": "image"
  },
  "visibilityRules": {
    "locales": ["zh", "en"]
  },
  "constraints": ["hero_must_be_first", "cta_button_max_2"],
  "priority": 100
}
```

---

## 4. Snippet Binding Schema

這一層比通用 component schema 更貼近 icb-v2 現況。真正要綁的不是 React component，而是 Odoo snippet、base template、custom class 與 template key。

### 必要欄位

| 欄位 | 型別 | 必填 | 說明 |
|---|---|---|---|
| `bindingId` | string | yes | 綁定識別碼 |
| `snippetType` | enum | yes | Odoo snippet 類型 |
| `baseTemplateRef` | string | no | 是否引用 `templates/base/` 鎖定基底 |
| `improvedTemplateRef` | string | no | 是否引用 `templates/improved/` 成品 |
| `templateKey` | string | no | 動態 snippet 用的 template key |
| `dataCustomName` | string | no | 客製命名 |
| `customClasses` | string[] | no | 可加在 section 外層的 class |
| `innerDomEditable` | boolean | yes | 是否允許改內部 DOM |
| `scssRef` | string | no | 對應 SCSS 來源 |
| `constraints` | string[] | no | 使用限制 |

### snippetType 建議枚舉

- `s_banner`
- `s_cover`
- `s_text_block`
- `s_three_columns`
- `s_dynamic_snippet_products`
- `s_dynamic_snippet`
- `s_embed_code`
- `s_static_snippet`

### 動態區塊綁定重點

動態產品 / 動態新聞必須明確記錄這些欄位：

```json
{
  "snippetType": "s_dynamic_snippet_products",
  "baseTemplateRef": "templates/base/base-dynamic-products.xml",
  "templateKey": "website_sale.dynamic_filter_template_product_product_list_0001",
  "dataCustomName": "fullWrapProduct",
  "innerDomEditable": false,
  "constraints": ["locked_inner_dom", "section_class_only"]
}
```

### 範例

```json
{
  "bindingId": "dynamic-products-001",
  "snippetType": "s_dynamic_snippet_products",
  "baseTemplateRef": "templates/base/base-dynamic-products.xml",
  "improvedTemplateRef": "templates/improved/dynamic/products/fullWrapProduct.xml",
  "templateKey": "website_sale.dynamic_filter_template_product_product_list_0001",
  "dataCustomName": "fullWrapProduct",
  "customClasses": ["o_cc2", "s_custom_fullWrapProduct"],
  "innerDomEditable": false,
  "scssRef": "templates/improved/dynamic/products/fullWrapProduct.scss",
  "constraints": ["locked_inner_dom", "must_use_existing_template_key"]
}
```

---

## 5. Output Artifact Schema

Output Artifact Schema 負責描述最後交給設計師的可用產物。

### 必要欄位

| 欄位 | 型別 | 必填 | 說明 |
|---|---|---|---|
| `artifactId` | string | yes | 產出 ID |
| `xmlOutputPath` | string | yes | XML 輸出位置 |
| `scssOutputPath` | string | no | SCSS 輸出位置 |
| `workflowType` | string | yes | 來自哪個工作流 |
| `previewScript` | string | no | 是否可用 `build_preview.py` |
| `validationStatus` | enum | yes | `draft` / `checked` / `blocked` |
| `lockCheckRequired` | boolean | yes | 是否需檢查 dynamic lock |
| `designerAction` | string | yes | 設計師下一步要做什麼 |

### 範例

```json
{
  "artifactId": "2026-04-17_homepage_draft_01",
  "xmlOutputPath": "outputs/2026-04-17_homepage_draft_01.xml",
  "scssOutputPath": "outputs/2026-04-17_homepage_draft_01.scss",
  "workflowType": "create",
  "previewScript": "python scripts/build_preview.py outputs/2026-04-17_homepage_draft_01.xml",
  "validationStatus": "checked",
  "lockCheckRequired": true,
  "designerAction": "copy_to_odoo_backend_after_preview"
}
```

---

## 關聯規則

為了讓這份 schema 可被 validator 與產出流程共同使用，關聯方向應固定：

- `Workflow` 決定是否需走 Phase A / Phase B
- `Page Blueprint.sections[]` 指向 section objects
- `Section.snippetRef` / `templateRef` 指向 snippet binding
- `Snippet Binding` 決定能否改 inner DOM
- `Output Artifact` 指向最終 XML / SCSS 路徑

這樣可以避免 AI 每次生成時重新發明欄位。

---

## 驗證規則建議

Schema 只定欄位還不夠，還需要最基本的 validation layer。

### Workflow level

- `create` 必須先有 Phase A 骨架結果再進入 Phase B
- 所有產出預設寫入 `outputs/`

### Page level

- 每頁必須有至少一個 section
- `homepage` 必須有 `hero`
- 每頁只能有一個 H1 主標區塊
- `homepage` 必須有 `pageName = homepage`
- 所有頁面必須有正確 QWeb wrapper

### Section level

- `hero` 必須排在第一個或前兩個位置
- `contact_form` 不能在同一頁重複兩次
- 同類型 section 不可連續超過兩個
- `dynamic_locked` 不可手刻卡片 DOM
- `static_navigation` 不可誤用 `s_dynamic_snippet`

### Snippet binding level

- 若 `innerDomEditable = false`，只可改 section 外層 class / data 屬性
- `templateKey` 不可超出已支援清單
- `data-snippet`、`data-name` 必須存在

### Output level

- 不可直接覆寫 `templates/`
- dynamic 結構應可經 `validate_dynamic_lock.py` 檢查
- SCSS 不應內嵌進 XML

---

## 命名規範建議

為了方便 AI 與人類共同維護，建議命名統一採 snake_case 或 kebab-case，不要混用。

### 建議規則

- enum 值：`snake_case`
- ID：`kebab-case`
- renderer 名稱：保留程式碼命名風格，例如 `HeadingBlock`
- content path：用 dot path，例如 `content.home.hero.primary`

### 範例

- `pageType`: `product_detail`
- `sectionId`: `hero-001`
- `componentId`: `heading_block`
- `contentRef`: `content.home.hero.primary`

---

## 最小可行版本

如果要先做 MVP，建議第一版只支援以下範圍：

### pageType

- `homepage`
- `about`
- `product_list`
- `contact`

### sectionType

- `hero`
- `feature_grid`
- `product_preview`
- `rich_text`
- `cta`
- `contact_form`

### snippetType

- `s_banner`
- `s_cover`
- `s_text_block`
- `s_three_columns`
- `s_dynamic_snippet_products`
- `s_dynamic_snippet`

這樣可以先完成一套可運作的 planner -> validator -> renderer 流程。

---

## 建議的檔案結構

```text
icb/
  schemas/
    workflow.schema.json
    page-blueprint.schema.json
    section.schema.json
    snippet-binding.schema.json
    output-artifact.schema.json
  registries/
    sections.json
    snippets.json
    page-types.json
    template-keys.json
  examples/
    homepage-blueprint-demo.json
    product-list-blueprint-demo.json
  validators/
    page-rules.json
    section-rules.json
    dynamic-lock-rules.json
```

---

## 總結

ICB schema 在目前系統中的角色應該是：

**讓 AI 有 Odoo 規則可依、讓 validator 能檢查 locked structure、讓設計師拿到可貼回後台的 XML + SCSS。**

如果這層先定穩，後面做 registry、planner 與 validator 時，就不會把「自由生成網站」和「受 Odoo 限制的頁面生成」混在一起。

---

## 後續文件

這份草案之後最適合接兩份文件：

1. **ICB 元件與 section registry 格式**
2. **ICB AI 生成流程（planner -> validator -> renderer）**