# 產品詳細頁切版 PRD（可累積版）

> 來源：Inbox 整理 (2026-04-24)
> 適用：Odoo 產品詳細頁 / ICB 系統

## 1) 目的
這份文件用來規範「產品詳細頁」RWD 切版流程，避免每次都重複踩坑。  
核心重點：**先處理外框層級，再處理內容元件**，確保左右間距與層級一致。

---

## 2) 適用範圍
- Odoo 產品詳細頁
- 含 snippet 結構（特別是 `.s_table_of_content` / `.s_custom_proDetail`）
- Bootstrap 4.5 斷點系統（優先使用 `@include media-breakpoint-down(...)`）

---

## 3) 核心原則
1. **先外框、後內容**：先把最外層容器的左右邊界規範好，再處理內文。
2. **只保留一層水平內距**：遇到 `container > container`，內層要清空左右 padding。
3. **上方選單優先處理**：若 TOC/頁籤在上方，第一步就要做外框去重，避免雙重內凹。
4. **側邊選單通常不先動**：側邊結構在桌機通常可維持，行動版再局部處理。
5. **規則只在必要頁面生效**：避免全站覆寫，優先綁定 `#product_detail`、`.s_custom_proDetail`。

---

## 4) 切版策略

### 4.1 斷點策略
- 手機主斷點：`@include media-breakpoint-down(md)`
- 如需更細切：`sm` / `xs` 再補，但不跳出 Bootstrap mixin 體系

### 4.2 外框去重策略 (重要)
在 `#product_detail` 內，遇到巢狀容器時，內層容器左右 padding 清空：

```scss
@include media-breakpoint-down(md) {
  #product_detail {
    .container > .container,
    .container > .container-fluid,
    .container-fluid > .container,
    .container-fluid > .container-fluid,
    .o_container_small > .container,
    .o_container_small > .container-fluid,
    .o_container_small > .o_container_small {
      padding-left: 0;
      padding-right: 0;
    }
  }
}
```

### 4.3 上方 TOC（`.s_table_of_content`）策略
- TOC 在上方時，避免額外再加一層 `var(--container-pd-x)`。
- 若外層已有容器內距，TOC wrapper 本身左右 padding 應清空。
- 行動版導覽可橫向滑動，不要強制換行導致擠壓。

---

## 5) 交付前檢查清單 (Pre-flight Checklist)
- [ ] **390px**：無雙層內凹。
- [ ] **430px**：TOC 左右對齊正常。
- [ ] **768px**：主內容欄位層級與間距一致。
- [ ] **無水平捲軸**（非規格表例外區）。
- [ ] **Selector 綁定**：確保覆寫只在產品詳情頁生效，不污染全站。

---

## 6) 常見問題與診斷 (FAQ)

| 症狀 | 可能原因 | 解決方案 |
| :--- | :--- | :--- |
| **左右「凹兩層」** | `container > container` 雙重內距 | 在 mobile 下清空內層 container padding |
| **TOC 與內容不對齊** | TOC wrapper 多加了內距 | TOC wrapper 左右 padding 歸零 |
| **桌機變成單欄** | 規則未包在媒體查詢內 | 限定在 `@include media-breakpoint-down(md)` |

---

## 7) 經驗累積紀錄

### 2026-04-24（首版）
- **頁面**：產品詳細頁（Odoo snippet：`.s_table_of_content`）
- **現象**：上半與下半區塊左右出現雙重內凹。
- **根因**：外層容器與內層容器同時套用水平 padding。
- **修改 selector**：`#product_detail`、`#wrapwrap #product_details`、`.s_table_of_content_navbar_wrap`。
- **解法摘要**：外框去重，內層容器 padding 清空，只保留一層間距。
- **驗證重點**：上方 TOC 與主內容左右對齊一致。
