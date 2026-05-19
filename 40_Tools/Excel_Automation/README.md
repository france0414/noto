# Excel Automation Tool (Excel 自動化轉檔)

## 1) 工具目的
針對客戶提供的 Excel 檔案，自動化提取其中的圖片、文字、標題與描述，並將其轉化為結構化資料，以便後續進行網頁編排或資料庫上架。

---

## 2) 目前實作模式 (Mode: Drawing-to-Cell Mapping)
當前腳本 (`extract.py`) 採用的邏輯：
- **核心技術**：利用 Python `zipfile` 與 `xml.etree` 直接讀取 OOXML 結構。
- **對應邏輯**：
  - 圖片來源：`xl/media/`
  - 坐標定位：從 `xl/drawings/` 抓取圖片所在的 `row` 與 `col`。
  - 標題抓取：圖片所在的 `drawing_row + 2` 且 `drawing_col + 1` 的 Sheet 儲存格文字。
- **輸出格式**：依 Sheet 名稱建立資料夾，並以抓取到的文字命名圖片。

---

## 3) 未來規劃模式 (Future Modes)
為了應對不同客戶的 Excel 整理習慣，計畫開發以下模式：

### A. 欄位對應模式 (Column-Based)
- **場景**：Excel 像資料庫，A 欄是標題、B 欄是描述、C 欄是圖片。
- **邏輯**：逐行掃描，將特定欄位的圖片與同行的文字關聯。

### B. 區塊偵測模式 (Block-Based)
- **場景**：Excel 採自由排版，一個區塊包含一張大圖與一段文字描述。
- **邏輯**：利用坐標鄰近性 (Proximity) 判斷哪些文字屬於該圖片。

### C. 結構化資料輸出 (JSON/Markdown)
- **目標**：除了下載圖片，同步產出一個 `data.json` 或 `index.md`，記錄所有產品的完整資訊。

---

## 4) 相關腳本
- [excel_image_extractor.py](file:///Users/apple/Desktop/obsidian/AI-france/40_Tools/Excel_Automation/Scripts/excel_image_extractor.py.md)
