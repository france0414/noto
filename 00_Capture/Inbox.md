# 📥 收件匣 (Inbox)

## 📥 待整理內容 (Pending)

*(請在此處輸入新內容...)*

目前 JS 想要定义共用，主要有两个功能需要实时的实现方式：

1. 内建固定动态的 JS 引用
   类似比较复杂的 Three.js、Canvas 等等。从 Next.js 引入一些动态效果，但这部分可能要先看安装在哪边。它们一般是不被启用的，只有当需要时才被调用。

2. 软件接入考量
   每一个软件在接这些 JS 的时候，需要考量它们具体会怎么接入。

关于结构方面，我希望不要有太多的额外结构，尽量采用自由的结构。可能通过包一个 div，或者加一些 data 属性之类的方式来达到效果。

关于预览机制与前台编辑系统的构想，我有一些具体的建议：

1. 预览与编辑器结构
   (a) 希望编辑器是独立的，功能上应区分为预览（预示）、开版（检视器）等模块。
   (b) 检视区支持探索不同的页面或项目。可以创建一个文件夹，内部包含多个版本。
   (c) 现有的预览区如果全部堆在一起会显得比较乱，应当设计为所有操作在预览区执行完毕后，再统一进行更新。

2. 前台编辑与 AI 辅助
   (a) 未来希望实现“前台执行”模式。用户通过前台的一个编辑入口进入后，无需跳转到后台，即可直接在前台完成图片、文字的编辑或内容新增。
   (b) 界面右侧可以加入辅助性的 AI 助手，协助用户进行校对、打证或新增内容。

3. 数据结构与扩展性
   (a) 这种资料结构在进入前台后，应同步生成 JSON 格式的配置文件（角色档）。
   (b) 考虑到未来的后台对接，系统应具备自动扩充字段（栏位）的可能性。

4. 语系处理逻辑
   (a) 在预设情况下，系统会支持多语系。
   (b) 初始状态下是否先统一为一个语系，等人工介入后再进行多语系更新？这个逻辑需要确认。5. 排版与档案处理逻辑

应该是说，因为我后续可能会遇到一些问题，主要有以下几点：

1. 排版确认逻辑
   (a) 在第一次跟我们排版的时候，主要的画面应鼓励应用到任何团队页面上。
   (b) 在拍板确认之前，必须清楚回到主档案的位置（原理是一样的）。

2. 资料上传与同步
   (a) 所有资料应整理到主档案中。
   (b) 并且这些所有的资料，在相关系统或组件上线的时候，其实就会同步上去的。

---

## 🗂️ 已處理/歸檔 (Archive)

- [2026-04-24] **LiteLab Toolbox (影像/表格/色彩工具)** ➔ 已整理至 [LiteLab_Toolbox/README.md](file:///Users/apple/Desktop/obsidian/AI-france/40_Tools/LiteLab_Toolbox/README.md)
- [2026-04-24] **Excel 自動化轉檔工具** ➔ 已整理至 [Excel_Automation/README.md](file:///Users/apple/Desktop/obsidian/AI-france/40_Tools/Excel_Automation/README.md)
- [2026-04-24] **產品詳細頁切版 PRD** ➔ 已整理至 [Product_Detail_Page_Standard.md](file:///Users/apple/Desktop/obsidian/AI-france/40_Tools/ICB_System/RWD_Flow/Guides/Product_Detail_Page_Standard.md)
- [2026-04-17] [ICB AI 結構生成架構規劃] ➔ 歸類至 `10_Research/Project_Planning/ICB_AI_結構生成架構規劃.md`
- [2026-04-17] [GTMC + B2B Headless 架構規劃] ➔ 歸類至 `10_Research/Project_Planning/GTMC_B2B_Headless_架構規劃.md`
- [2026-04-17] AI 工具相關筆記 4 篇從 `llm.c_Study/` 搬移至 `10_Research/AI_Tools/`
- [2026-04-16] [AI 全端自動化網站復刻／資料流架構設計] ➔ 歸類至 `10_Research/Web_Development/`

---

## 💡 歷史備忘 (B2B Project)

### 2026-04-23: designdotmd 整合策略討論
- **結論**：建議採「混合」方式，做一個輕量的 theme loader + preview。
- **技術重點**：JSON Tokens ➔ CSS 變數 ➔ 注入 Layout。
- **下一步**：可產出 MVP 檔案範例（layout.tsx, theme loader）。