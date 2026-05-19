# Excel Image Extractor Script

> **原始路徑**: `/Users/apple/Documents/excl轉檔/extract.py`
> **更新日期**: 2026-04-24

```python
import zipfile
import os
import xml.etree.ElementTree as ET
from pathlib import Path

EXCEL_FILE = "產品照片.xlsx"
OUTPUT_DIR = "output"

NS_XDR = 'http://schemas.openxmlformats.org/drawingml/2006/spreadsheetDrawing'
NS_A   = 'http://schemas.openxmlformats.org/drawingml/2006/main'
NS_R   = 'http://schemas.openxmlformats.org/officeDocument/2006/relationships'
NS_SS  = 'http://schemas.openxmlformats.org/spreadsheetml/2006/main'

def parse_rels(z, path):
    try:
        content = z.read(path)
    except KeyError:
        return {}
    root = ET.fromstring(content)
    return {rel.get('Id'): (rel.get('Target'), rel.get('Type', '')) for rel in root}

def col_letter_to_num(col):
    result = 0
    for c in col:
        result = result * 26 + (ord(c.upper()) - ord('A') + 1)
    return result

def get_shared_strings(z):
    try:
        content = z.read('xl/sharedStrings.xml')
    except KeyError:
        return []
    root = ET.fromstring(content)
    strings = []
    for si in root:
        texts = [t.text for t in si.iter(f'{{{NS_SS}}}t') if t.text]
        strings.append(''.join(texts))
    return strings

def get_sheet_cells(z, sheet_path, shared_strings):
    content = z.read(sheet_path)
    root = ET.fromstring(content)
    cells = {}
    for row_elem in root.iter(f'{{{NS_SS}}}row'):
        r = int(row_elem.get('r'))
        for cell in row_elem:
            ref = cell.get('r')
            col_letter = ''.join(filter(str.isalpha, ref))
            col = col_letter_to_num(col_letter)
            cell_type = cell.get('t', '')
            v = cell.find(f'{{{NS_SS}}}v')
            if v is not None and v.text:
                cells[(r, col)] = shared_strings[int(v.text)] if cell_type == 's' else v.text
    return cells

def parse_drawing(z, drawing_path, drawing_rels_path):
    content = z.read(drawing_path)
    root = ET.fromstring(content)

    rels = parse_rels(z, drawing_rels_path)
    rid_to_media = {
        rid: 'xl/media/' + target.split('/')[-1]
        for rid, (target, rtype) in rels.items()
        if 'image' in rtype
    }

    images = []
    seen = set()

    for anchor in root:
        frm = anchor.find(f'{{{NS_XDR}}}from')
        if frm is None:
            continue
        col_e = frm.find(f'{{{NS_XDR}}}col')
        row_e = frm.find(f'{{{NS_XDR}}}row')
        if col_e is None or row_e is None:
            continue
        col, row = int(col_e.text), int(row_e.text)

        pic = anchor.find(f'{{{NS_XDR}}}pic')
        if pic is None:
            continue
        blip = pic.find(f'{{{NS_XDR}}}blipFill/{{{NS_A}}}blip')
        if blip is None:
            continue
        rid = blip.get(f'{{{NS_R}}}embed')
        if not rid:
            continue

        # 同一 rId 在同一欄只取第一次出現(濾掉重複的裝飾圖)
        key = (rid, col)
        if key in seen:
            continue
        seen.add(key)

        media = rid_to_media.get(rid)
        if media:
            images.append((row, col, media))

    return images

def clean(name):
    return "".join(c for c in name if c not in r'\/:*?"<>|').strip()

def extract_images():
    os.makedirs(OUTPUT_DIR, exist_ok=True)

    with zipfile.ZipFile(EXCEL_FILE, 'r') as z:
        shared_strings = get_shared_strings(z)

        wb_root = ET.fromstring(z.read('xl/workbook.xml'))
        wb_rels  = parse_rels(z, 'xl/_rels/workbook.xml.rels')

        sheets = []
        for s in wb_root.iter(f'{{{NS_SS}}}sheet'):
            rid = s.get(f'{{{NS_R}}}id')
            if rid and rid in wb_rels:
                target, _ = wb_rels[rid]
                sheets.append((s.get('name'), 'xl/' + target))

        total = 0
        for sheet_name, sheet_path in sheets:
            sheet_filename = sheet_path.split('/')[-1]
            sheet_rels = parse_rels(z, f'xl/worksheets/_rels/{sheet_filename}.rels')

            drawing_path = drawing_rels_path = None
            for _, (target, rtype) in sheet_rels.items():
                if 'drawing' in rtype:
                    dfn = target.split('/')[-1]
                    drawing_path      = f'xl/drawings/{dfn}'
                    drawing_rels_path = f'xl/drawings/_rels/{dfn}.rels'
                    break

            if not drawing_path:
                continue
            try:
                z.getinfo(drawing_path)
            except KeyError:
                continue

            images = parse_drawing(z, drawing_path, drawing_rels_path)
            if not images:
                continue

            cells = get_sheet_cells(z, sheet_path, shared_strings)

            folder_path = Path(OUTPUT_DIR) / clean(sheet_name)
            folder_path.mkdir(parents=True, exist_ok=True)

            for (draw_row, draw_col, media_path) in images:
                # 圖片在 drawing row R → sheet row R+1
                # 標題在圖片下一列 → sheet row R+2
                title = cells.get((draw_row + 2, draw_col + 1))
                if not title:
                    continue

                title = clean(str(title))
                ext   = Path(media_path).suffix
                dst   = folder_path / f"{title}{ext}"

                dst.write_bytes(z.read(media_path))
                print(f"✓  {clean(sheet_name)}/{title}{ext}")
                total += 1

        print(f"\n完成！共輸出 {total} 張圖片 → {OUTPUT_DIR}/")

if __name__ == "__main__":
    extract_images()
```
