# ICB AI 結構生成架構規劃

> 來源：Inbox 整理 (2026-04-17)
> 標籤：#ICB #AI #Odoo #模板系統 #元件庫 #網站生成
> 狀態：🔵 規劃中
> 參考 repo：https://github.com/france0414/icb-v2
> 相關：[[B2B_模板網站專案]]

---

## 原始需求

希望利用 AI 讓同事也能生成適合 ICB 的網站結構。

目前的 ICB 概念有幾個核心前提：

- 參考 Odoo 的網站/模組結構
- 不只要保留既有樣版能力
- 還要能複製自己已設計過的樣版
- 同時希望系統能在既有規則內做出新組合，而不是只能複製
- 因此需要持續整理「原生元件能力」作為 AI 可用的基底

---

## 依 icb-v2 現況校正後的理解

讀取 repo 後，ICB 目前更精確的定位不是「通用網站生成器」，而是：

**一套讓設計師透過 AI 終端工具，生成符合 Odoo 15 規範的 XML + SCSS 的工作流系統。**

目前有幾個不能忽略的系統前提：

- 設計師主要透過 `/page`、`/create`、`/dynamic` 等指令操作
- 產出物寫入 `outputs/`，再貼回 Odoo 後台
- 動態產品 / 動態新聞必須沿用 Odoo 原生 locked structure
- AI 可以設計骨架與樣式，但不能突破 QWeb / Bootstrap 4.5 / dynamic snippet 的結構邊界
- `/create` 是先出骨架報表，再等確認後才生成 XML + SCSS

所以 ICB 的核心不是「自由拼網站」，而是「在 Odoo 承重牆內，盡可能提高 AI 的生成自由度與資產複用能力」。

---

## 核心問題

目前真正要解的，不是「讓 AI 直接生頁面」，而是讓 AI 理解三層東西：

1. **ICB 的結構規則**：哪些區塊可用、哪些欄位必填、哪些頁面必備
2. **元件能力邊界**：每個元件能處理什麼資料、支援哪些版型變體
3. **生成策略**：何時複製既有模板，何時改寫，何時自由組合

如果這三層沒有拆開，AI 很容易出現兩種問題：

- 只會複製舊稿，做不出新東西
- 為了創新而亂組，結果不符合 ICB 規範

---

## 建議架構

### 1. 先把 ICB 從「模板集合」升級成「規則系統」

不要只存整包模板，應拆成可被 AI 理解的結構：

- **Page Schema**：首頁、關於頁、產品列表、產品詳情、聯絡頁等
- **Section Schema**：Hero、Logo Wall、Feature Grid、Product List、CTA、FAQ
- **Component Schema**：按鈕、卡片、輪播、表單、圖片區塊、標題區塊
- **Data Schema**：每個區塊需要哪些欄位，例如 title、subtitle、image、items

AI 生成時應該先決定頁面骨架，再選 section，再填 data，而不是一次吐完整 HTML。

### 2. 區分三種生成模式

這會直接影響 AI 的品質與可控性。

| 模式 | 用途 | 風險 | 建議 |
|---|---|---|---|
| **Clone** | 複製既有模板 | 容易太像 | 適合快速提案 |
| **Remix** | 用既有模板重組 | 中等 | 最適合商業實務 |
| **Generate** | 用元件自由生成 | 容易失控 | 要加規則約束 |

建議 ICB 預設走 **Remix-first**：

- 優先從已驗證模板出發
- 允許替換 section 順序與元件變體
- 只有在缺少對應模板時才進入自由生成

這樣比較符合「可商用、可交付、可維護」的目標。

### 3. 建立元件能力清單，而不是只存元件名稱

你提到想收集原生元件功能，這件事很關鍵，但格式要能讓 AI 使用。

建議每個元件至少記錄：

- 元件名稱
- 用途
- 可接受資料欄位
- 支援版型變體
- 限制條件
- 適合出現的 section 類型
- 可搭配的相鄰元件
- 不建議搭配的情境

例如：

```yaml
component: HeroBanner
purpose: 首屏品牌主視覺
props:
  - headline
  - subheadline
  - background_image
  - cta_primary
variants:
  - centered
  - split-left-text
  - video-background
constraints:
  - headline_max_chars: 28
  - cta_count_max: 2
best_for:
  - corporate_site
  - product_launch
avoid_for:
  - dense_catalog_page
```

這類 metadata 才是 AI 真正能拿來推理的基礎。

### 4. 保留 Odoo 式結構，但要承認目前就是被 Odoo 約束

Odoo 的優點是：

- 頁面與區塊的概念清楚
- 模組化好理解
- 商業網站常見需求齊全

但以 icb-v2 現況來看，這個抽象化不能脫離目前系統限制，至少第一階段要承認：

- 最終產出仍是 Odoo QWeb XML + SCSS
- 動態 snippet 內層 DOM 不能改
- 真正可自由發揮的主要是靜態 section 的組裝、順序、視覺節奏與 custom class 命名

因此比較務實的做法不是完全抽離 Odoo，而是先把 Odoo 思維抽象成中介層：

- **內容模型層**：品牌、產品、分類、文章、FAQ、CTA
- **版面組裝層**：頁面由 section 組成
- **視覺實作層**：對應到 React / Next.js / HTML 模板

也就是說，ICB 可以「借 Odoo 的結構觀念」，但不要讓最終資料格式直接耦合 Odoo 的 template 寫法。

### 5. 為 AI 增加評分與守門機制

如果要讓同事使用，不能只靠 prompt。

建議在生成後增加一層 validator：

- 是否符合頁面最小結構
- 是否缺少必要 section
- 標題層級是否合理
- CTA 是否過多
- 圖文比例是否失衡
- 是否有超出元件 props 定義的欄位
- 動態區塊是否誤改 locked inner DOM
- 是否正確使用 `data-snippet`、`data-name`、`data-custom-name`
- 是否正確包在 QWeb 外層結構內

最終讓輸出不是「一段自由文字」，而是：

```json
{
  "pageType": "homepage",
  "sourceMode": "remix",
  "sections": [...],
  "validation": {
    "passed": true,
    "warnings": ["CTA count is high"]
  }
}
```

---

## 建議的資料分層

若要讓 ICB 能持續擴充，建議資料至少拆成以下幾類：

### templates/

- 已完成的網站模板與 locked base 結構
- `templates/base/` 是不可隨意改 inner DOM 的基底
- `templates/improved/` 是可組裝的改良版積木與首頁配方

### components/

- 基礎元件與業務元件定義
- 每個元件的 props schema、variant、限制條件

### sections/

- 常見頁面區塊定義
- 說明 section 可接受哪些元件組成

### patterns/

- 常見商業網站結構模式
- 例如：企業官網型、B2B 型錄型、活動頁型、產品發表型

### prompts/

- 給 AI 使用的 system prompt / planner prompt / validator prompt
- 將規則外部化，方便迭代

### outputs/

- AI 生成 XML + SCSS 的沙盒輸出區
- 設計師應從這裡拿結果，而不是直接覆寫模板

### examples/

- 成功案例與失敗案例
- 幫助 AI 做 few-shot 參考，也幫助同事理解輸出邏輯

---

## 建議工作流程

### 階段 1：先做可控的結構生成

目標不是直接輸出完整網站，而是先輸出 page plan：

1. 輸入產業、目標客群、網站類型
2. AI 決定適合的 page types
3. AI 為每頁挑選 section 組合
4. Validator 檢查是否合理
5. 通過後再進到 Odoo XML + SCSS generation

### 階段 2：再做模板匹配

讓 AI 回答兩件事：

- 最接近的既有模板是哪一個
- 哪些 section 要保留、替換或新增

這一步會讓「複製我設計過的樣版」變成可控功能，而不是人工記憶。

### 階段 3：最後才做創作型生成

只有在以下情況才開放較高自由度：

- 既有模板覆蓋不到
- 使用者明確要求探索新方向
- 已有 validator 與人工審核流程

---

## 我對目前方向的具體建議

### 優先做的事

1. **先定義 page schema 與 section schema**，不要先衝 code generation。
2. **整理 10 到 20 個核心 section**，比一次蒐集所有元件更有效。
3. **每個既有模板補 metadata**，例如產業、風格、適用情境、使用的 section，以及是否含動態 locked 結構。
4. **明確區分基礎元件、section 元件、頁面模板**，不要混在一起。
5. **做一個 validator**，確保 AI 產出的結構至少可渲染、可維護。

### 暫時不要先做的事

1. 不要一開始就追求完全自由生成的首頁。
2. 不要讓 AI 直接發明 Odoo 不存在的動態 inner DOM。
3. 不要只用 prompt 管理規則，規則應轉成結構化設定檔。

---

## 建議的定位

ICB 比較適合被定義為：

**一個以 Odoo 15 為承重牆、以模板配方與 section 規則為核心、由 AI 協助設計師生成 XML + SCSS 的頁面生產系統。**

這樣它的價值不只是「做網站」，而是：

- 讓同事可用
- 讓生成結果可控
- 讓模板資產可累積
- 讓動態與靜態結構都能在 Odoo 限制內被安全生成

---

## 下一步建議

如果要把這個方向推進成可執行專案，下一份文件可以拆成三個子題：

1. **ICB schema 規格草案** → [[ICB_Schema_規格草案]]
2. **ICB 元件/section registry 設計**
3. **ICB AI 生成流程（planner -> validator -> renderer）**

這樣後續就能從「概念整理」走到「可實作規格」。