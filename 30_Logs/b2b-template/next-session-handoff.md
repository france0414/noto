# B2B 模板網站 下次接手 Handoff

## 目前狀態
- ✅ Phase 1 Day 1 基礎建設完成
- Code repo：`~/Documents/b2b-template`
- 完整規劃文件：`10_Research/Project_Planning/B2B_模板網站專案.md`
- AI 開發指引：`.github/copilot-instructions.md`（完整版，含架構 + 階段 + 規範）

## 已完成
- Next.js + React 19 + TypeScript + Tailwind CSS 4 專案
- shadcn/ui 初始化 + 16 個元件
- BlockRenderer + BlockProps 型別（含 isEditMode 預留）
- data/zh/ + data/en/ JSON（products, news, company，含預留欄位）
- data/templates/ 產業模板（manufacturing, trading, food）
- `.github/copilot-instructions.md` + `AGENTS.md` + `CLAUDE.md` 統一指引

## 重要決策（不能偏移）
1. 技術棧：Next.js + React 19 + TypeScript + Tailwind CSS 4 + shadcn/ui
2. 資料分離：JSON 檔驅動，code 與內容完全獨立
3. Block 組合系統：頁面 = 區塊池排列，props 合約強制（variant + data + className）
4. 只保留一份 AI 指令（VS Code Copilot）
5. 基礎詢價車在 Phase 1 就要有（Context + localStorage + Formspree）

## Phase 1 執行順序（2-3 天）

### Day 1 — 基礎建設
1. 建立 `.github/copilot-instructions.md`（主力 AI 指令）
2. `npx create-next-app@latest b2b-template`
3. `npx shadcn@latest init` + 安裝基礎元件
4. 從 my-project 搬元件（Common / Product / News / Category）
5. 建立 `src/components/blocks/BlockRenderer.tsx`
6. 建立 `data/zh/*.json` + JSON Schema（含預留欄位）
7. 建立 `data/templates/manufacturing.json` 等產業模板

### Day 2 — 頁面串接 + i18n + SEO
8. `getStaticProps` 讀 JSON → BlockRenderer 渲染
9. `next-intl` + 資料夾分語系（data/en/）
10. SEO Layout（metadata API + Schema.org JSON-LD + llms.txt）
11. Framer Motion 基礎動畫（FadeInView）

### Day 3 — Generator + Demo + 詢價車
12. Block Generator（SKILL.md + 模板）
13. JSON Generator（SKILL.md + 模板）
14. 基礎詢價車 v1（AddToInquiryButton + InquiryCartSheet + InquirySubmitForm）
15. AI 生成 Demo 資料 + 第一個 Demo Site

## 元件來源
- `france0414/my-project`（GitHub）→ Fork 乾淨版
- 搬：Common/ Product/ News/ Category/ HeroCarousel/ BackgroundSection/
- 不搬：8 套 AI 設定、.storybook/、過時文件

## 每次開工先確認
```bash
# repo 建好後
npm run typecheck
npm run build
```

## 下一次優先工作（Day 2）
1. 從 my-project 搬元件（Common / Product / News / Category）
2. 頁面串接：getStaticProps → JSON → BlockRenderer 渲染（首頁 + 產品列表 + 產品明細）
3. i18n：安裝 next-intl + locale 路由
4. SEO Layout：metadata API + Schema.org JSON-LD + llms.txt
5. Framer Motion 基礎動畫（FadeInView）
