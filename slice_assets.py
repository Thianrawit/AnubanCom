import os
import json
import glob
import numpy as np
from PIL import Image, ImageDraw, ImageOps

RAW_DIR = "public/raw_sheets"
OUTPUT_DIR = "public/assets/icons"
MANIFEST_TS_PATH = "src/constants/iconMap.ts"
ROWS = 3
COLS = 3
MAX_SIZE = 256
PADDING = 6

SHEETS_CONFIG = {
    "sheet_1": [
        "gamepad", "sparkles", "gear",
        "rotate", "house", "star-face",
        "mouse-device", "keyboard", "arrow-right"
    ],
    "sheet_2": [
        "lock", "party-popper", "speaker-on",
        "speaker-off", "hand-point", "hand-grab",
        "shape-circle", "shape-square", "shape-triangle"
    ],
    "sheet_3": [
        "heart", "basket-fruit", "basket-pet",
        "bear", "honey", "flower",
        "pine-tree", "palette", "car"
    ],
    "sheet_4": [
        "butterfly", "flashlight", "apple",
        "banana", "orange", "strawberry",
        "watermelon", "trophy", "star-gold"
    ],
    "sheet_5": [
        "cat", "dog", "frog",
        "chicken", "mouse-animal", "rabbit",
        "snake", "fish", "monkey"
    ],
    "sheet_6": [
        "egg-bowl", "buffalo", "plate",
        "elephant", "kid", "turtle",
        "backpack", "soldier", "leaf"
    ],
    "sheet_7": [
        "bee", "phan", "tooth",
        "horse", "giant", "sailboat",
        "ring", "tiger", "chest"
    ],
    "sheet_8": [
        "bathtub", "ant", "egg",
        "giraffe", "icecream", "juice",
        "king", "lion", "nurse"
    ],
    "sheet_9": [
        "pig", "queen", "tree",
        "umbrella", "violin", "xylophone",
        "yacht", "zebra", "num-0"
    ],
    "sheet_10": [
        "num-1", "num-2", "num-3",
        "num-4", "num-5", "num-6",
        "num-7", "num-8", "num-9"
    ],
}

def remove_white_bg_clean(cell: Image.Image) -> Image.Image:
    """เจาะพื้นหลังสีขาวจากขอบนอกเข้าใน + เก็บขอบฟุ้ง JPEG โดยไม่ทำลายสีขาวในตัวการ์ตูน"""
    # ขยายขอบขาว 2px รอบช่องเพื่อให้พื้นหลังทุกด้านเชื่อมถึงกัน
    padded = ImageOps.expand(cell.convert("RGBA"), border=2, fill=(255, 255, 255, 255))
    
    # Flood fill จากมุมซ้ายบน (thresh=38 ช่วยเก็บคราบขาวขุ่นจากการบีบอัดไฟล์ .jpg)
    ImageDraw.floodfill(padded, (0, 0), (0, 0, 0, 0), thresh=38)
    
    # ตัดขอบขยาย 2px กลับคืน
    w, h = padded.size
    cropped = padded.crop((2, 2, w - 2, h - 2))
    
    # เก็บขอบหยักสีขาว (Anti-aliasing / Defringe) เฉพาะพิกเซลริมสุดที่ติดกับพื้นใส
    arr = np.array(cropped, dtype=np.uint8)
    alpha = arr[:, :, 3]
    transparent = (alpha == 0)
    
    # หาพิกเซลทึบที่อยู่ติดกับพื้นที่โปร่งใส (บน ล่าง ซ้าย ขวา)
    touching_bg = np.zeros_like(transparent)
    touching_bg[1:, :] |= transparent[:-1, :]
    touching_bg[:-1, :] |= transparent[1:, :]
    touching_bg[:, 1:] |= transparent[:, :-1]
    touching_bg[:, :-1] |= transparent[:, 1:]
    edge_pixels = touching_bg & (~transparent)
    
    # ลดความทึบเฉพาะพิกเซลขอบนอกที่อมขาว (ไม่กระทบเส้นขอบสีเข้มหรือสีสด)
    min_rgb = arr[:, :, :3].min(axis=2)
    whitish_edge = edge_pixels & (min_rgb > 200)
    new_alpha = np.clip((255 - min_rgb[whitish_edge].astype(np.float32)) * 4.5, 0, 255).astype(np.uint8)
    arr[:, :, 3][whitish_edge] = new_alpha
    
    return Image.fromarray(arr, "RGBA")

def find_sheet_file(base_name: str):
    for ext in ("png", "jpg", "jpeg", "webp"):
        matches = glob.glob(os.path.join(RAW_DIR, f"{base_name}.{ext}"))
        if matches:
            return matches[0]
    return None

def process_all_sheets():
    os.makedirs(OUTPUT_DIR, exist_ok=True)
    generated_icons = {}

    for base_name, icon_names in SHEETS_CONFIG.items():
        input_path = find_sheet_file(base_name)
        if not input_path:
            print(f"[ข้าม] ยังไม่พบไฟล์ {base_name}.(png/jpg)")
            continue

        print(f"\n=== กำลังประมวลผล {os.path.basename(input_path)} ===")
        raw_img = Image.open(input_path).convert("RGBA")
        width, height = raw_img.size
        cell_w = width // COLS
        cell_h = height // ROWS

        idx = 0
        for r in range(ROWS):
            for c in range(COLS):
                if idx >= len(icon_names):
                    break

                left = c * cell_w
                upper = r * cell_h
                right = left + cell_w
                lower = upper + cell_h

                cell = raw_img.crop((left, upper, right, lower))
                clean_cell = remove_white_bg_clean(cell)

                # Auto-trim ตัดพื้นที่ใสส่วนเกินให้ตัวการ์ตูนชิดกรอบพอดี
                bbox = clean_cell.getbbox()
                if bbox:
                    clean_cell = clean_cell.crop(bbox)
                    clean_cell = ImageOps.expand(clean_cell, border=PADDING, fill=(0, 0, 0, 0))

                clean_cell.thumbnail((MAX_SIZE, MAX_SIZE), Image.Resampling.LANCZOS)

                name = icon_names[idx]
                out_filename = f"icon-{name}.webp"
                out_path = os.path.join(OUTPUT_DIR, out_filename)
                clean_cell.save(out_path, "WEBP", quality=92, method=6)

                generated_icons[name] = f"/assets/icons/{out_filename}"
                print(f"  -> {out_filename} ({clean_cell.size[0]}x{clean_cell.size[1]} px)")
                idx += 1

    if generated_icons:
        os.makedirs(os.path.dirname(MANIFEST_TS_PATH), exist_ok=True)
        with open(MANIFEST_TS_PATH, "w", encoding="utf-8") as f:
            f.write("// Auto-generated by slice_assets.py\n")
            f.write("export const ICON_ASSETS = ")
            f.write(json.dumps(generated_icons, indent=2))
            f.write(" as const;\n\n")
            f.write("export type IconAssetName = keyof typeof ICON_ASSETS;\n")
        print(f"\nสร้างไฟล์ Mapping สำเร็จ: {MANIFEST_TS_PATH} (รวม {len(generated_icons)} ไอคอน)")

if __name__ == "__main__":
    process_all_sheets()