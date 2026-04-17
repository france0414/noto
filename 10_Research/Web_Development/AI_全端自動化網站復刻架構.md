# AI 全端自動化網站復刻／資料流架構設計

## 需求描述
- 利用 AI + 爬蟲復刻企業官網/展示型網站，包含所有後台上架資料，並思考前端規劃與資料自動傳到後台資料庫。

## 技術目標
- 爬取前台資料（商品、文章等）
- 復刻前端介面 UI
- 建立後台管理系統
- 自動化上架資料到自己的 DB

## 偏好技術棧
- Python + React/Next.js

## 技術架構分層規劃
1. **爬蟲層（Python）**
   - Playwright 處理 JS 動態頁面
   - BeautifulSoup/Scrapy 處理靜態 HTML
   - 目標：商品資料、圖片 URL、分類結構、文章/新聞、聯絡資訊
   - Claude API 清洗、結構化 HTML → JSON
2. **資料處理層（FastAPI + Celery）**
   - FastAPI 提供 API 端點，Celery+Redis 排程與非同步任務
   - AI 自動補 SEO meta、商品描述翻譯、圖片 alt text
3. **資料庫層**
   - PostgreSQL（結構化資料）、Redis（快取/任務）、S3/Cloudflare R2（媒體檔案）
4. **前端層（Next.js + React）**
   - 官網前台 Next.js SSG/SSR，SEO 友好
   - 後台 CMS 可自建或串 Strapi/Payload
   - AI 輔助後台「建議補全」功能
5. **部署**
   - Docker Compose 本地開發
   - 前端 Vercel，後端+DB Railway/Render

## 連結
- 技術架構討論：https://claude.ai/share/35267284-482d-4b18-80f1-1839e7ba9b97

## 分類建議
- 屬於「AI 全端自動化網站復刻／資料流架構設計」主題，建議歸檔於本資料夾。

## 補充說明
- 不建議只用單一爬蟲工具處理所有動態網站，需搭配 Playwright/Selenium。
- 不建議資料未經清洗直接寫入 DB，應先結構化。
- 不建議前後端完全耦合，應有 API 層橋接。
- Stitch 適合 NoSQL/雲端自動化，若資料結構偏關聯式，PostgreSQL + FastAPI 更靈活。可同時測試兩種架構，依需求選擇。
