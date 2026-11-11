import os
import asyncio
import edge_tts

VOICE_DIR = os.path.join(os.path.dirname(__file__), "..", "audio", "voice")
os.makedirs(VOICE_DIR, exist_ok=True)

# English letters with phonetic Thai and translation / no-transliteration where appropriate
'''english_letters = {
    'A': 'เอ แอปเปิ้ล',
    'B': 'บี บานาน่า กล้วย',
    'C': 'ซี แคท แมว',
    'D': 'ดี ด็อก สุนัข',
    'E': 'อี เอเลเฟ่นต์ ช้าง',
    'F': 'เอฟ ฟิช ปลา',
    'G': 'จี ยีราฟ',
    'H': 'เอช เฮ้าส์ บ้าน',
    'I': 'ไอ ไอศกรีม',
    'J': 'เจ จูซ น้ำผลไม้',
    'K': 'เค ไคท์ ว่าว',
    'L': 'แอล ไลออน สิงโต',
    'M': 'เอ็ม มังกี้ ลิง',
    'N': 'เอ็น เนสท์ รังนก',
    'O': 'โอ ออเรนจ์ ส้ม',
    'P': 'พี พลิก หมู',
    'Q': 'คิว ควีน พระราชินี',
    'R': 'อาร์ แรบบิท กระต่าย',
    'S': 'เอส ซัน พระอาทิตย์',
    'T': 'ที ทรี ต้นไม้',
    'U': 'ยู อัมเบรลล่า ร่ม',
    'V': 'วี ไวโอลิน',
    'W': 'ดับเบิลยู วอเตอร์เมลอน แตงโม',
    'X': 'เอ็กซ์ ไซโลโฟน ระนาดฝรั่ง',
    'Y': 'วาย ยอร์ช เรือยอชต์',
    'Z': 'ซี ซีบร้า ม้าลาย'
}'''

english_letters = {
    'K': 'เค คิง พระราชา',
}


async def generate_english_voice():
    print("Generating Bilingual English Voice Files at slower rate (-25%) for Kindergarten kids...")
    for key, text in english_letters.items():
        filename = f"en_{key}.mp3"
        filepath = os.path.join(VOICE_DIR, filename)
        print(f"Generating {key}: '{text}' -> {filename} (rate: -25%)")
        comm = edge_tts.Communicate(text, "th-TH-NiwatNeural", rate="-25%")
        await comm.save(filepath)
        await asyncio.sleep(0.1)
    print("All English voice files successfully generated with slower rate!")

if __name__ == '__main__':
    asyncio.run(generate_english_voice())

