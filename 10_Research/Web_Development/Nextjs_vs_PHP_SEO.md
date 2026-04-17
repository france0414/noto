# 🚀 Next.js vs PHP：渲染模式與 SEO

這份筆記分析了 Next.js 在 SEO 上的優勢，以及它與傳統 PHP 網站的差異。

## ⚔️ Next.js vs 傳統 PHP
| 特性 | 傳統 PHP 網站 | Next.js |
| :--- | :--- | :--- |
| **預設渲染** | SSR (Server-Side Rendering) | SSR / SSG / ISR 可選 |
| **SEO 友善度** | 天然優勢，一開始就輸出 HTML | 極佳，但需正確配置 SSR/SSG |
| **互動體驗** | 較弱，通常需額外掛載 JS | 極強，React 生態系支援 |
| **現代化能力** | 取決於框架 (如 Laravel) | 元件化、拆包與圖片優化內建 |

## 💡 關鍵概念
- **Next.js 的優點**：它結合了「傳統 Server Render 的 SEO 優點」與「現代 Frontend 的互動優點」。
- **並非自動無敵**：如果在 Next.js 中過度使用 `use client` 並依賴前端 Fetching，SEO 優勢會消失。

## 🛠️ 最佳實踐建議
- **Server Components 第一**：重要內容（文案、標題）應放在 Server Component 中先生成。
- **混合使用**：文字、H1、FAQ 先由伺服器輸出；動畫、表單、切換特效再交給 Client Component。
- **獨立 URL**：確保每個頁面都有獨立的 URL 而不是單頁應用 (SPA)。
