import os
import re
import json
import glob
import numpy as np
from PIL import Image, ImageDraw, ImageOps
from rembg import remove

RAW_DIR = "public/raw_sheets"
OUTPUT_DIR = "public/assets/icons"
MANIFEST_TS_PATH = "src/constants/iconMap.ts"
MAX_SIZE = 256
PADDING = 8

# กำหนดขนาดตาราง (rows, cols) และชื่อไอคอนเรียงตามลำดับ ซ้าย->ขวา, บน->ล่าง
EXTRA_SHEETS_CONFIG = {
    "sheet_11": {
        "rows": 4,
        "cols": 3,
        "icons": [
            "dog-head", "doghouse", "bone",
            "monkey-head", "rabbit-head", "cat-head",
            "banana-cute", "carrot", "fish-cute",
            "apple-cute", "picnic-basket", "thought-bubble"
        ]
    },
    "sheet_12": {
        "rows": 4,
        "cols": 3,
        "icons": [
            "bubbles", "sponge", "balloon-red",
            "balloon-blue", "balloon-star", "chick-parachute",
            "watering-can", "plant-sprout", "plant-growing",
            "plant-flower", "water-drop", "cloud"
        ]
    },
    "sheet_13": {
        "rows": 3,
        "cols": 3,
        "icons": [
            "dino-egg-1", "dino-egg-2", "dino-egg-3",
            "dino-egg-4", "bunny-jump", "rock",
            "puddle", "train", "flag"
        ]
    }
}


def find_sheet_file(base_name: str):
    for ext in ("jpg", "jpeg", "png", "webp"):
        matches = glob.glob(os.path.join(RAW_DIR, f"{base_name}.{ext}"))
        if matches:
            return matches[0]
    return None


def extract_clean_icon(cell: Image.Image) -> Image.Image:
    """หั่นเดี่ยวก่อนเจาะด้วย AI + ล็อกความทึบสีขาวไม่ให้กระต่าย/เมฆจาง"""
    # 1. เติมขอบขาว 20px กันไอคอนชิดขอบช่องแล้ว AI ตัดแหว่ง
    pad = 20
    padded = ImageOps.expand(cell.convert("RGBA"), border=pad, fill=(255, 255, 255, 255))

    # 2. ใช้ rembg เจาะพื้นหลังและรูตรงกลาง (หูตะกร้า, หูบัวรดน้ำ)
    removed = remove(padded)
    w, h = removed.size
    cropped = removed.crop((pad, pad, w - pad, h - pad))

    # 3. ย้ำเจาะพื้นหลังด้านนอกสุดด้วย Floodfill กันคราบขาวมุมภาพตกค้าง
    outer_check = ImageOps.expand(cell.convert("RGBA"), border=2, fill=(255, 255, 255, 255))
    ImageDraw.floodfill(outer_check, (0, 0), (0, 0, 0, 0), thresh=30)
    outer_alpha = np.array(outer_check.crop((2, 2, outer_check.width - 2, outer_check.height - 2)))[:, :, 3]

    arr = np.array(cropped, dtype=np.uint8)
    alpha = arr[:, :, 3]

    # บังคับพื้นหลังภายนอกให้ใส 100%
    alpha[outer_alpha == 0] = 0

    # Alpha Snap: กันตัวการ์ตูนสีขาว (กระต่าย/เมฆ) จางเป็นผี และเก็บขอบคม
    alpha[alpha < 35] = 0
    alpha[alpha > 200] = 255
    arr[:, :, 3] = alpha

    return Image.fromarray(arr, "RGBA")


def load_existing_manifest() -> dict:
    """โหลดรายการไอคอนเดิมจาก iconMap.ts เพื่ออัปเดตต่อท้ายไม่ให้ของเก่าหาย"""
    if not os.path.exists(MANIFEST_TS_PATH):
        return {}
    try:
        with open(MANIFEST_TS_PATH, "r", encoding="utf-8") as f:
            content = f.read()
        match = re.search(r"export const ICON_ASSETS\s*=\s*(\{[\s\S]*?\})\s*as const;", content)
        if match:
            return json.loads(match.group(1))
    except Exception:
        pass
    return {}


def process_extra_sheets():
    os.makedirs(OUTPUT_DIR, exist_ok=True)
    generated_icons = load_existing_manifest()

    for base_name, cfg in EXTRA_SHEETS_CONFIG.items():
        input_path = find_sheet_file(base_name)
        if not input_path:
            print(f"[ข้าม] ไม่พบไฟล์ {base_name}.(jpg/png) ในโฟลเดอร์ {RAW_DIR}")
            continue

        rows = cfg["rows"]
        cols = cfg["cols"]
        icon_names = cfg["icons"]

        print(f"\n=== กำลังประมวลผล {os.path.basename(input_path)} ({rows}x{cols}) ===")
        raw_img = Image.open(input_path).convert("RGBA")
        width, height = raw_img.size
        cell_w = width // cols
        cell_h = height // rows

        idx = 0
        for r in range(rows):
            for c in range(cols):
                if idx >= len(icon_names):
                    break

                left = c * cell_w
                upper = r * cell_h
                right = left + cell_w
                lower = upper + cell_h

                cell = raw_img.crop((left, upper, right, lower))
                name = icon_names[idx]

                print(f"  -> กำลังตัดและเจาะพื้นหลัง: {name}...")
                clean_cell = extract_clean_icon(cell)

                # Auto-trim ตัดขอบใสส่วนเกิน + เติม Padding กันเส้นขอบขาด
                bbox = clean_cell.getbbox()
                if bbox:
                    clean_cell = clean_cell.crop(bbox)
                    clean_cell = ImageOps.expand(clean_cell, border=PADDING, fill=(0, 0, 0, 0))

                clean_cell.thumbnail((MAX_SIZE, MAX_SIZE), Image.Resampling.LANCZOS)

                out_filename = f"icon-{name}.webp"
                out_path = os.path.join(OUTPUT_DIR, out_filename)
                clean_cell.save(out_path, "WEBP", quality=92, method=6)

                generated_icons[name] = f"/assets/icons/{out_filename}"
                print(f"     บันทึกสำเร็จ: {out_filename} ({clean_cell.size[0]}x{clean_cell.size[1]} px)")
                idx += 1

    if generated_icons:
        os.makedirs(os.path.dirname(MANIFEST_TS_PATH), exist_ok=True)
        with open(MANIFEST_TS_PATH, "w", encoding="utf-8") as f:
            f.write("// Auto-generated by slice_assets\n")
            f.write("export const ICON_ASSETS = ")
            f.write(json.dumps(generated_icons, indent=2))
            f.write(" as const;\n\n")
            f.write("export type IconAssetName = keyof typeof ICON_ASSETS;\n")
        print(f"\n[สำเร็จ] อัปเดต {MANIFEST_TS_PATH} เรียบร้อย (รวมทั้งหมด {len(generated_icons)} ไอคอน)")


if __name__ == "__main__":
    process_extra_sheets()