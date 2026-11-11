import os
import asyncio
import edge_tts

# Audio directory
VOICE_DIR = os.path.join(os.path.dirname(__file__), "..", "audio", "voice")
os.makedirs(VOICE_DIR, exist_ok=True)

# Thai letters
# Thai letters
'''thai_letters = {
    'ก': 'กอ ไก่', 'ข': 'ขอ ไข่', 'ค': 'คอ ควาย', 'ง': 'งอ งู',
    'จ': 'จอ จาน', 'ช': 'ชอ ช้าง', 'ด': 'ดอ เด็ก', 'ต': 'ตอ เต่า',
    'ถ': 'ถอ ถุง', 'ท': 'ทอ ทหาร', 'น': 'นอ หนู', 'บ': 'บอ ใบไม้',
    'ป': 'ปอ ปลา', 'ผ': 'ผอ ผึ้ง', 'พ': 'พอ พาน', 'ฟ': 'ฟอ ฟัน',
    'ม': 'มอ ม้า', 'ย': 'ยอ ยัก', 'ร': 'รอ เรือ', 'ล': 'ลอ ลิง',
    'ว': 'วอ แหวน', 'ส': 'สอ เสือ', 'ห': 'หอ หีบ', 'อ': 'ออ อ่าง'
}'''

thai_letters = {
    'ก': 'กอ ไก่'
}

# English letters
'''english_letters = {
    'A': 'A Apple', 'B': 'B Banana', 'C': 'C Cat', 'D': 'D Dog',
    'E': 'E Elephant', 'F': 'F Fish', 'G': 'G Giraffe', 'H': 'H House',
    'I': 'I Ice cream', 'J': 'J Juice', 'K': 'K Kite', 'L': 'L Lion',
    'M': 'M Monkey', 'N': 'N Nest', 'O': 'O Orange', 'P': 'P Pencil',
    'Q': 'Q Queen', 'R': 'R Rabbit', 'S': 'S Sun', 'T': 'T Tree',
    'U': 'U Umbrella', 'V': 'V Violin', 'W': 'W Watermelon', 'X': 'X Xylophone',
    'Y': 'Y Yacht', 'Z': 'Z Zebra'
}'''

# Numbers
'''numbers = {
    '0': 'ศูนย์', '1': 'หนึ่ง', '2': 'สอง', '3': 'สาม', '4': 'สี่',
    '5': 'ห้า', '6': 'หก', '7': 'เจ็ด', '8': 'แปด', '9': 'เก้า'
}'''

# Prompts & UI phrases
'''phrases = {
    'win': 'เก่งมากๆ เลยครับ หนูทำภารกิจสำเร็จแล้ว',
    'correct': 'ถูกต้องครับ เก่งมาก',
    'wrong': 'ลองใหม่อีกครั้งนะลูก'
}'''

async def generate_voice():
    print("Generating voice audio files using Edge-TTS...")
    
    # 1. Thai letters
    for key, text in thai_letters.items():
        filename = f"th_{ord(key)}.mp3"
        filepath = os.path.join(VOICE_DIR, filename)
        if not os.path.exists(filepath):
            print(f"Generating Thai: {key} ({text}) -> {filename}")
            comm = edge_tts.Communicate(text, "th-TH-PremwadeeNeural")
            await comm.save(filepath)
            await asyncio.sleep(0.1)

    # 3. Numbers
    '''for key, text in numbers.items():
        filename = f"num_{key}.mp3"
        filepath = os.path.join(VOICE_DIR, filename)
        if not os.path.exists(filepath):
            print(f"Generating Number: {key} ({text}) -> {filename}")
            comm = edge_tts.Communicate(text, "th-TH-PremwadeeNeural")
            await comm.save(filepath)
            await asyncio.sleep(0.1)'''

    # 4. Phrases
    '''
    for key, text in phrases.items():
        filename = f"phrase_{key}.mp3"
        filepath = os.path.join(VOICE_DIR, filename)
        if not os.path.exists(filepath):
            print(f"Generating Phrase: {key} -> {filename}")
            comm = edge_tts.Communicate(text, "th-TH-PremwadeeNeural")
            await comm.save(filepath)
            await asyncio.sleep(0.1)

    print("Edge-TTS Voice Generation Complete!")'''

if __name__ == '__main__':
    asyncio.run(generate_voice())
