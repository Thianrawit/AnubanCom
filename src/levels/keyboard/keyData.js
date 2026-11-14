// ==========================================
// Keyboard Dictionaries & Layout Tables
// ==========================================

export const thaiNoShiftDict = {
    'ก': { name: 'ก ไก่', icon: 'chicken', code: 'KeyD', soundUrl: 'audio/voice/th_3585.mp3' },
    'ข': { name: 'ข ไข่', icon: 'egg-bowl', code: 'Minus', soundUrl: 'audio/voice/th_3586.mp3' },
    'ค': { name: 'ค ควาย', icon: 'buffalo', code: 'Digit8', soundUrl: 'audio/voice/th_3588.mp3' },
    'ง': { name: 'ง งู', icon: 'snake', code: 'Quote', soundUrl: 'audio/voice/th_3591.mp3' },
    'จ': { name: 'จ จาน', icon: 'plate', code: 'Digit0', soundUrl: 'audio/voice/th_3592.mp3' },
    'ช': { name: 'ช ช้าง', icon: 'elephant', code: 'Equal', soundUrl: 'audio/voice/th_3594.mp3' },
    'ด': { name: 'ด เด็ก', icon: 'kid', code: 'KeyF', soundUrl: 'audio/voice/th_3604.mp3' }, 
    'ต': { name: 'ต เต่า', icon: 'turtle', code: 'Digit9', soundUrl: 'audio/voice/th_3605.mp3' },
    'ถ': { name: 'ถ ถุง', icon: 'backpack', code: 'Digit5', soundUrl: 'audio/voice/th_3606.mp3' },
    'ท': { name: 'ท ทหาร', icon: 'soldier', code: 'KeyM', soundUrl: 'audio/voice/th_3607.mp3' },
    'น': { name: 'น หนู', icon: 'mouse-animal', code: 'KeyO', soundUrl: 'audio/voice/th_3609.mp3' },
    'บ': { name: 'บ ใบไม้', icon: 'leaf', code: 'BracketLeft', soundUrl: 'audio/voice/th_3610.mp3' },
    'ป': { name: 'ป ปลา', icon: 'fish', code: 'KeyX', soundUrl: 'audio/voice/th_3611.mp3' },
    'ผ': { name: 'ผ ผึ้ง', icon: 'bee', code: 'KeyZ', soundUrl: 'audio/voice/th_3612.mp3' },
    'พ': { name: 'พ พาน', icon: 'phan', code: 'KeyR', soundUrl: 'audio/voice/th_3614.mp3' },
    'ฟ': { name: 'ฟ ฟัน', icon: 'tooth', code: 'KeyA', soundUrl: 'audio/voice/th_3615.mp3' },
    'ม': { name: 'ม ม้า', icon: 'horse', code: 'Comma', soundUrl: 'audio/voice/th_3617.mp3' },
    'ย': { name: 'ย ยักษ์', icon: 'giant', code: 'KeyP', soundUrl: 'audio/voice/th_3618.mp3' },
    'ร': { name: 'ร เรือ', icon: 'sailboat', code: 'KeyI', soundUrl: 'audio/voice/th_3619.mp3' },
    'ล': { name: 'ล ลิง', icon: 'monkey', code: 'BracketRight', soundUrl: 'audio/voice/th_3621.mp3' },
    'ว': { name: 'ว แหวน', icon: 'ring', code: 'Semicolon', soundUrl: 'audio/voice/th_3623.mp3' },
    'ส': { name: 'ส เสือ', icon: 'tiger', code: 'KeyL', soundUrl: 'audio/voice/th_3626.mp3' },
    'ห': { name: 'ห หีบ', icon: 'chest', code: 'KeyS', soundUrl: 'audio/voice/th_3627.mp3' },
    'อ': { name: 'อ อ่าง', icon: 'bathtub', code: 'KeyV', soundUrl: 'audio/voice/th_3629.mp3' }
};

export const keyCodeToCharMap = {
    'KeyD': { th: 'ก', en: 'D' },
    'KeyF': { th: 'ด', en: 'F' },
    'KeyG': { th: 'เ', en: 'G' },
    'KeyJ': { th: '่', en: 'J' },
    'KeyK': { th: 'า', en: 'K' },
    'KeyH': { th: '้', en: 'H' },
    'KeyL': { th: 'ส', en: 'L' },
    'Semicolon': { th: 'ว', en: ';' },
    'Quote': { th: 'ง', en: "'" },
    'KeyA': { th: 'ฟ', en: 'A' },
    'KeyS': { th: 'ห', en: 'S' },
    'KeyZ': { th: 'ผ', en: 'Z' },
    'KeyX': { th: 'ป', en: 'X' },
    'KeyC': { th: 'แ', en: 'C' },
    'KeyV': { th: 'อ', en: 'V' },
    'KeyB': { th: 'ิ', en: 'B' },
    'KeyN': { th: 'ื', en: 'N' },
    'KeyM': { th: 'ท', en: 'M' },
    'Comma': { th: 'ม', en: ',' },
    'Period': { th: 'ใ', en: '.' },
    'Slash': { th: 'ฝ', en: '/' },
    'KeyQ': { th: 'ๆ', en: 'Q' },
    'KeyW': { th: 'ไ', en: 'W' },
    'KeyE': { th: 'ำ', en: 'E' },
    'KeyR': { th: 'พ', en: 'R' },
    'KeyT': { th: 'ะ', en: 'T' },
    'KeyY': { th: 'ั', en: 'Y' },
    'KeyU': { th: 'ซ', en: 'U' },
    'KeyI': { th: 'ร', en: 'I' },
    'KeyO': { th: 'น', en: 'O' },
    'KeyP': { th: 'ย', en: 'P' },
    'BracketLeft': { th: 'บ', en: '[' },
    'BracketRight': { th: 'ล', en: ']' },
    'Digit1': { th: 'ๅ', en: '1' },
    'Digit2': { th: '/', en: '2' },
    'Digit3': { th: '-', en: '3' },
    'Digit4': { th: 'ภ', en: '4' },
    'Digit5': { th: 'ถ', en: '5' },
    'Digit6': { th: 'ุ', en: '6' },
    'Digit7': { th: 'ึ', en: '7' },
    'Digit8': { th: 'ค', en: '8' },
    'Digit9': { th: 'ต', en: '9' },
    'Digit0': { th: 'จ', en: '0' },
    'Minus': { th: 'ข', en: '-' },
    'Equal': { th: 'ช', en: '=' }
};

export const englishDict = {
    'A': { name: 'A - Ant (มด)', icon: 'ant', soundUrl: 'audio/voice/en_A.mp3' },
    'B': { name: 'B - Banana (กล้วย)', icon: 'banana', soundUrl: 'audio/voice/en_B.mp3' },
    'C': { name: 'C - Cat (แมว)', icon: 'cat', soundUrl: 'audio/voice/en_C.mp3' },
    'D': { name: 'D - Dog (สุนัข)', icon: 'dog', soundUrl: 'audio/voice/en_D.mp3' },
    'E': { name: 'E - Egg (ไข่)', icon: 'egg', soundUrl: 'audio/voice/en_E.mp3' },
    'F': { name: 'F - Fish (ปลา)', icon: 'fish', soundUrl: 'audio/voice/en_F.mp3' },
    'G': { name: 'G - Giraffe (ยีราฟ)', icon: 'giraffe', soundUrl: 'audio/voice/en_G.mp3' },
    'H': { name: 'H - House (บ้าน)', icon: 'house', soundUrl: 'audio/voice/en_H.mp3' },
    'I': { name: 'I - Ice cream (ไอศกรีม)', icon: 'icecream', soundUrl: 'audio/voice/en_I.mp3' },
    'J': { name: 'J - Juice (น้ำผลไม้)', icon: 'juice', soundUrl: 'audio/voice/en_J.mp3' },
    'K': { name: 'K - King (พระราชา)', icon: 'king', soundUrl: 'audio/voice/en_K.mp3' },
    'L': { name: 'L - Lion (สิงโต)', icon: 'lion', soundUrl: 'audio/voice/en_L.mp3' },
    'M': { name: 'M - Monkey (ลิง)', icon: 'monkey', soundUrl: 'audio/voice/en_M.mp3' },
    'N': { name: 'N - Nurse (พยาบาล)', icon: 'nurse', soundUrl: 'audio/voice/en_N.mp3' },
    'O': { name: 'O - Orange (ส้ม)', icon: 'orange', soundUrl: 'audio/voice/en_O.mp3' },
    'P': { name: 'P - Pig (หมู)', icon: 'pig', soundUrl: 'audio/voice/en_P.mp3' },
    'Q': { name: 'Q - Queen (พระราชินี)', icon: 'queen', soundUrl: 'audio/voice/en_Q.mp3' },
    'R': { name: 'R - Rabbit (กระต่าย)', icon: 'rabbit', soundUrl: 'audio/voice/en_R.mp3' },
    'S': { name: 'S - Snake (งู)', icon: 'snake', soundUrl: 'audio/voice/en_S.mp3' },
    'T': { name: 'T - Tree (ต้นไม้)', icon: 'tree', soundUrl: 'audio/voice/en_T.mp3' },
    'U': { name: 'U - Umbrella (ร่ม)', icon: 'umbrella', soundUrl: 'audio/voice/en_U.mp3' },
    'V': { name: 'V - Violin (ไวโอลิน)', icon: 'violin', soundUrl: 'audio/voice/en_V.mp3' },
    'W': { name: 'W - Watermelon (แตงโม)', icon: 'watermelon', soundUrl: 'audio/voice/en_W.mp3' },
    'X': { name: 'X - Xylophone (ระนาดฝรั่ง)', icon: 'xylophone', soundUrl: 'audio/voice/en_X.mp3' },
    'Y': { name: 'Y - Yacht (เรือยอชต์)', icon: 'yacht', soundUrl: 'audio/voice/en_Y.mp3' },
    'Z': { name: 'Z - Zebra (ม้าลาย)', icon: 'zebra', soundUrl: 'audio/voice/en_Z.mp3' }
};

export const numberDict = {
    '0': { name: 'ศูนย์', icon: 'num-0', soundUrl: 'audio/voice/num_0.mp3' },
    '1': { name: 'หนึ่ง', icon: 'num-1', soundUrl: 'audio/voice/num_1.mp3' },
    '2': { name: 'สอง', icon: 'num-2', soundUrl: 'audio/voice/num_2.mp3' },
    '3': { name: 'สาม', icon: 'num-3', soundUrl: 'audio/voice/num_3.mp3' },
    '4': { name: 'สี่', icon: 'num-4', soundUrl: 'audio/voice/num_4.mp3' },
    '5': { name: 'ห้า', icon: 'num-5', soundUrl: 'audio/voice/num_5.mp3' },
    '6': { name: 'หก', icon: 'num-6', soundUrl: 'audio/voice/num_6.mp3' },
    '7': { name: 'เจ็ด', icon: 'num-7', soundUrl: 'audio/voice/num_7.mp3' },
    '8': { name: 'แปด', icon: 'num-8', soundUrl: 'audio/voice/num_8.mp3' },
    '9': { name: 'เก้า', icon: 'num-9', soundUrl: 'audio/voice/num_9.mp3' }
};

export const keyboardLayoutRows = {
    thai: [
        ['ๅ', '/', '-', 'ภ', 'ถ', 'ุ', 'ึ', 'ค', 'ต', 'จ', 'ข', 'ช'],
        ['ๆ', 'ไ', 'ำ', 'พ', 'ะ', 'ั', 'ี', 'ร', 'น', 'ย', 'บ', 'ล'],
        ['ฟ', 'ห', 'ก', 'ด', 'เ', '้', '่', 'า', 'ส', 'ว', 'ง'],
        ['ผ', 'ป', 'แ', 'อ', 'ิ', 'ื', 'ท', 'ม', 'ใ', 'ฝ']
    ],
    english: [
        ['Q', 'W', 'E', 'R', 'T', 'Y', 'U', 'I', 'O', 'P'],
        ['A', 'S', 'D', 'F', 'G', 'H', 'J', 'K', 'L'],
        ['Z', 'X', 'C', 'V', 'B', 'N', 'M']
    ],
    number: [
        ['1', '2', '3', '4', '5'],
        ['6', '7', '8', '9', '0']
    ]
};

export const keyboardLevelConfigs = {
    'thai': {
        title: "ฝึกคีย์บอร์ด: พยัญชนะไทย",
        desc: "ตามหาพยัญชนะไทย 25 ตัว กดพิมพ์ได้เลย!",
        dict: thaiNoShiftDict
    },
    'english': {
        title: "ฝึกคีย์บอร์ด: ภาษาอังกฤษ A-Z",
        desc: "ค้นหาและกดตัวอักษรภาษาอังกฤษ A-Z บนคีย์บอร์ดเลย!",
        dict: englishDict
    },
    'number': {
        title: "ฝึกคีย์บอร์ด: ตัวเลข 0-9 🔢",
        desc: "ฝึกสายตาและกดตัวเลข 0 ถึง 9 บนคีย์บอร์ดนะ!",
        dict: numberDict
    }
};

