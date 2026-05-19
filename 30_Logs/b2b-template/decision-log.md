# B2B 模板網站 Decision Log

| 日期 | 決定 | 原因 |
|---|---|---|
| 2026-04-17 | ~~前端框架選定 Astro~~ → 改為 Next.js + React | 市場主流、AI 工具生態最佳、React 元件可複用、Vercel 部署 |
| 2026-04-17 | 納入 AI SEO（AEO） | Schema.org + llms.txt + 語意化 HTML |
| 2026-04-17 | 需要多語系，先中英 | B2B 外銷導向，next-intl + 資料夾分語系 |
| 2026-04-17 | AI 文案生成作為模板附加價值 | 客戶資料未齊全時 AI 先生成有意義內容，加 `_source` 追蹤 |
| 2026-04-17 | 以 my-project 元件庫為基底，Fork 乾淨版 | 已有成熟的 BaseCard + Product/News/Category 元件 |
| 2026-04-17 | 清除 8 套 AI 設定檔，只保留一份主力指令 | 多份衝突指令導致 AI 生成不一致 |
| 2026-04-17 | 統一元件規範：shadcn/ui + Tailwind + TypeScript | 確保 VS Code 和視覺工具（v0/Bolt）輸出一致 |
| 2026-04-17 | 採用 Block 組合系統 | 不同產業模板只是不同 JSON 配置，code 共用 |
| 2026-04-17 | Generator 模式先行，Pipeline 量產時再串 | Block Generator + JSON Generator 優先 |
| 2026-04-20 | 三階段開發：Phase 1 展示站 → Phase 2 篩選+進階 → Phase 3 變體 | 2-3 天內先有完整 B2B 網站能力 |
| 2026-04-20 | 前台編輯模式 Phase 1 預留介面 | BlockProps 加 `isEditMode` + `onUpdate`，零成本預留 |
| 2026-04-20 | 基礎詢價車移入 Phase 1 | B2B 核心功能不應延後，Phase 1 用 Context + localStorage + Formspree |
| 2026-04-20 | JSON Schema 預留 Phase 2/3 欄位 | `specs`、`inquirable`、`variants`、`variantAxis` 先定義不填值 |
