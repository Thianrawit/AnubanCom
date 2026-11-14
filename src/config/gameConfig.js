// ==========================================
// Centralized Game Configuration (15 Mouse Levels + Audio SFX)
// ==========================================
import {
    FLASHLIGHT_SETTINGS,
    CATCH_ME_SETTINGS,
    BUBBLES_SETTINGS,
    BALLOONS_SETTINGS,
    WATERING_SETTINGS,
    PATH_SETTINGS,
    FEEDING_SETTINGS
} from './settings.js';

export const FLASHLIGHT_CONFIG = FLASHLIGHT_SETTINGS;
export const CATCH_ME_CONFIG = CATCH_ME_SETTINGS;
export const BUBBLES_CONFIG = BUBBLES_SETTINGS;
export const BALLOONS_CONFIG = BALLOONS_SETTINGS;
export const WATERING_CONFIG = WATERING_SETTINGS;
export const PATH_CONFIG = PATH_SETTINGS;
export const FEEDING_CONFIG = FEEDING_SETTINGS;

if (typeof window !== 'undefined') {
    window.FLASHLIGHT_CONFIG = FLASHLIGHT_CONFIG;
    window.CATCH_ME_CONFIG = CATCH_ME_CONFIG;
}

export const sfxFiles = {
    'win': 'audio/sfx/win.wav',
    'drop-success': 'audio/sfx/correct.wav',
    'correct-key': 'audio/sfx/correct.wav',
    'point-hit': 'audio/sfx/correct.wav',
    'drop-fail': 'audio/sfx/wrong.wav',
    'wrong-key': 'audio/sfx/wrong.wav',
    'cat': 'audio/sfx/cat.mp3',
    'dog': 'audio/sfx/dog.mp3',
    'frog': 'audio/sfx/frog.mp3',
    'chicken': 'audio/sfx/chicken.mp3',
    'mouse': 'audio/sfx/mouse.wav',
    'rabbit': 'audio/sfx/rabbit.wav'
};

export const TOTAL_MOUSE_LEVELS = 15;

export const mouseLevelConfigs = {
    // 1. [ใหม่ - Hover & Wipe] เช็ดฟองสบู่หาสัตว์ซ่อนแอบ
    1: {
        title: "ด่าน 1: เช็ดฟองสบู่",
        desc: "ขยับเมาส์ปัดฟองสบู่ออกให้เห็นเพื่อนสัตว์",
        type: 'bubbles',
        animals: [
            { id: 'b_cat', icon: 'cat', name: 'น้องแมว', sound: 'cat' },
            { id: 'b_dog', icon: 'dog', name: 'เจ้าตูบ', sound: 'dog' },
            { id: 'b_frog', icon: 'frog', name: 'กบน้อย', sound: 'frog' }
        ]
    },
    // 2. [ใหม่ - Single Click] จิ้มลูกโป่งลอยช้า
    2: {
        title: "ด่าน 2: จิ้มลูกโป่ง",
        desc: "คลิกซ้าย 1 ครั้งเพื่อเจาะลูกโป่งช่วยเพื่อนสัตว์",
        type: 'balloons',
        animals: [
            { icon: 'cat', sound: 'cat' },
            { icon: 'dog', sound: 'dog' },
            { icon: 'rabbit', sound: 'rabbit' },
            { icon: 'chicken', sound: 'chicken' },
            { icon: 'frog', sound: 'frog' }
        ]
    },
    // 3. [ใหม่ - Click & Hold] กดค้างรดน้ำต้นไม้
    3: {
        title: "ด่าน 3: รดน้ำต้นไม้",
        desc: "กดคลิกซ้ายค้างไว้ที่บัวรดน้ำจนต้นไม้โตเต็มที่",
        type: 'watering',
        plants: [
            { id: 'pl_flower', bloomIcon: 'flower', name: 'ดอกไม้สีชมพู' },
            { id: 'pl_apple', bloomIcon: 'apple', name: 'ผลแอปเปิล' },
            { id: 'pl_tree', bloomIcon: 'tree', name: 'ต้นไม้ใหญ่' }
        ]
    },
    // 4. [เดิม ด่าน 1] ลากวางรูปทรงลงบล็อก
    4: {
        title: "ด่าน 4: บล็อกรูปทรง",
        desc: "คลิกค้างลากรูปทรงไปใส่ช่องที่ตรงกัน",
        type: 'shapes',
        items: [
            { id: 'shape-circle', type: 'circle', name: 'วงกลม', icon: 'shape-circle', svg: '<circle cx="40" cy="40" r="32" fill="#f43f5e" />' },
            { id: 'shape-square', type: 'square', name: 'สี่เหลี่ยม', icon: 'shape-square', svg: '<rect x="10" y="10" width="60" height="60" rx="8" fill="#3b82f6" />' },
            { id: 'shape-triangle', type: 'triangle', name: 'สามเหลี่ยม', icon: 'shape-triangle', svg: '<polygon points="40,10 70,70 10,70" fill="#f59e0b" />' },
            { id: 'shape-star', type: 'star', name: 'ดาว', icon: 'star-gold', svg: '<polygon points="40,5 50,30 78,30 55,48 64,75 40,58 16,75 25,48 2,30 30,30" fill="#a855f7" />' }
        ]
    },
    // 5. [เดิม ด่าน 2] จับคู่รูปภาพกับเงาสัตว์
    5: {
        title: "ด่าน 5: จับคู่เงาสัตว์",
        desc: "คลิกค้างลากสัตว์ไปวางทับเงาที่เหมือนกัน",
        type: 'animals',
        pairs: [
            { id: 'p1', type: 'cat', icon: 'cat', name: 'น้องแมว', sound: 'audio/sfx/cat.mp3', voice: 'audio/voice/cat.mp3' },
            { id: 'p2', type: 'dog', icon: 'dog', name: 'น้องหมา', sound: 'audio/sfx/dog.mp3', voice: 'audio/voice/dog.mp3' },
            { id: 'p3', type: 'chicken', icon: 'chicken', name: 'กุ๊กไก่', sound: 'audio/sfx/chicken.mp3', voice: 'audio/voice/chicken.mp3' },
            { id: 'p4', type: 'frog', icon: 'frog', name: 'กบซ่า', sound: 'audio/sfx/frog.mp3', voice: 'audio/voice/frog.mp3' }
        ]
    },
    // 6. [ใหม่ - Wide-Path Dragging] พาน้องเดินกลับบ้าน
    6: {
        title: "ด่าน 6: พากลับบ้าน",
        desc: "ลากน้องเดินตามถนนสีเหลืองไปหาบ้าน",
        type: 'path',
        stages: [
            {
                id: 'path_1',
                heroIcon: 'dog',
                goalIcon: 'doghouse',
                heroSound: 'dog',
                // Waypoints in normalized [0..1] coordinates of the canvas
                waypoints: [
                    { x: 0.14, y: 0.50 },
                    { x: 0.50, y: 0.50 },
                    { x: 0.86, y: 0.50 }
                ]
            },
            {
                id: 'path_2',
                heroIcon: 'cat',
                goalIcon: 'fish',
                heroSound: 'cat',
                waypoints: [
                    { x: 0.14, y: 0.72 },
                    { x: 0.48, y: 0.28 },
                    { x: 0.86, y: 0.68 }
                ]
            },
            {
                id: 'path_3',
                heroIcon: 'bear',
                goalIcon: 'honey',
                heroSound: 'drop-success',
                waypoints: [
                    { x: 0.14, y: 0.30 },
                    { x: 0.38, y: 0.72 },
                    { x: 0.64, y: 0.28 },
                    { x: 0.86, y: 0.68 }
                ]
            }
        ]
    },
    // 7. [เดิม ด่าน 3] แยกหมวดหมู่ภาพ
    7: {
        title: "ด่าน 7: แยกตะกร้า",
        desc: "ลากผลไม้และสัตว์เลี้ยงใส่ตะกร้าให้ถูกใบ",
        type: 'categories',
        categories: [
            { type: 'fruit', name: 'ตะกร้าผลไม้', icon: 'basket-fruit', color: 'border-amber-400 bg-amber-50' },
            { type: 'animal', name: 'ตะกร้าสัตว์เลี้ยง', icon: 'basket-pet', color: 'border-sky-400 bg-sky-50' }
        ],
        items: [
            { id: 'm1', type: 'fruit', icon: 'apple' },
            { id: 'm2', type: 'animal', icon: 'cat' },
            { id: 'm3', type: 'fruit', icon: 'banana' },
            { id: 'm4', type: 'animal', icon: 'dog' },
            { id: 'm5', type: 'fruit', icon: 'orange' },
            { id: 'm6', type: 'animal', icon: 'rabbit' }
        ]
    },
    // 8. [ใหม่ - Visual Thought-Bubble] ให้อาหารสัตว์ตามใจนึก
    8: {
        title: "ด่าน 8: ป้อนอาหารสัตว์",
        desc: "ลากอาหารป้อนให้ตรงกับก้อนเมฆความคิด",
        type: 'feeding',
        rounds: [
            {
                animals: [
                    { id: 'f_monkey', icon: 'monkey', wantIcon: 'banana', wantCount: 2, sound: 'drop-success' },
                    { id: 'f_rabbit', icon: 'rabbit', wantIcon: 'carrot', wantCount: 1, sound: 'rabbit' }
                ],
                foods: ['banana', 'carrot', 'banana', 'apple']
            },
            {
                animals: [
                    { id: 'f_cat', icon: 'cat', wantIcon: 'fish', wantCount: 2, sound: 'cat' },
                    { id: 'f_dog', icon: 'dog', wantIcon: 'bone', wantCount: 1, sound: 'dog' }
                ],
                foods: ['fish', 'bone', 'fish', 'carrot']
            }
        ]
    },
    // 9. [เดิม ด่าน 4] ต่อภาพจิ๊กซอว์ 2x2
    9: {
        title: "ด่าน 9: จิ๊กซอว์ 2x2",
        desc: "ลากชิ้นส่วน 4 ชิ้นไปต่อในกรอบรูป",
        type: 'puzzle',
        pieces: [
            { id: 'pz1', pos: '0', icon: 'bear', bg: 'bg-amber-200' },
            { id: 'pz2', pos: '1', icon: 'honey', bg: 'bg-amber-300' },
            { id: 'pz3', pos: '2', icon: 'flower', bg: 'bg-amber-400' },
            { id: 'pz4', pos: '3', icon: 'pine-tree', bg: 'bg-amber-500' }
        ]
    },
    // 10. [เดิม ด่าน 5] โปรแกรม Paint ลากเส้นตามรอยประ
    10: {
        title: "ด่าน 10: วาดเส้น Paint",
        desc: "คลิกค้างวาดทับเส้นประให้ครบทุกรูป",
        type: 'paint',
        shapes: [
            { name: 'หัวใจ', icon: 'heart', path: 'heart' },
            { name: 'ดาว', icon: 'star-gold', path: 'star' },
            { name: 'แอปเปิล', icon: 'apple', path: 'apple' },
            { name: 'บ้านน้อย', icon: 'house', path: 'house' }
        ]
    },
    // 11. [เดิม ด่าน 6] ไฟฉายส่องซ่อนแอบ 1 (ผลไม้)
    11: {
        title: "ด่าน 11: ไฟฉายหาผลไม้",
        desc: "เลื่อนไฟฉายส่องหาผลไม้ในความมืด",
        type: 'hide-seek',
        subLevel: 1,
        targets: [
            { id: 'hs_apple_1', name: 'แอปเปิล', icon: 'apple', type: 'apple', sound: 'drop-success' },
            { id: 'hs_apple_2', name: 'แอปเปิล', icon: 'apple', type: 'apple', sound: 'drop-success' },
            { id: 'hs_banana_1', name: 'กล้วย', icon: 'banana', type: 'banana', sound: 'drop-success' },
            { id: 'hs_banana_2', name: 'กล้วย', icon: 'banana', type: 'banana', sound: 'drop-success' }
        ],
        questText: "หาผลไม้ให้ครบนะ!"
    },
    // 12. [เดิม ด่าน 7] ไฟฉายส่องซ่อนแอบ 2 (สัตว์เลี้ยง)
    12: {
        title: "ด่าน 12: ไฟฉายหาสัตว์",
        desc: "เลื่อนไฟฉายส่องหาสัตว์เลี้ยงในความมืด",
        type: 'hide-seek',
        subLevel: 2,
        targets: [
            { id: 'hs_cat', name: 'น้องแมว', icon: 'cat', type: 'cat', sound: 'cat' },
            { id: 'hs_dog', name: 'น้องหมา', icon: 'dog', type: 'dog', sound: 'dog' },
            { id: 'hs_chicken', name: 'กุ๊กไก่', icon: 'chicken', type: 'chicken', sound: 'chicken' }
        ],
        questText: "หาสัตว์เลี้ยงให้ครบนะ!"
    },
    // 13. [เดิม ด่าน 8] จับสัตว์วิ่งบนจอ 1 (หนูซน)
    13: {
        title: "ด่าน 13: จับหนูซน",
        desc: "คลิกซ้ายจับหนูซน 3 ตัว",
        type: 'catch-me',
        subLevel: 1,
        animals: [
            { type: 'mouse', icon: 'mouse-animal', name: 'หนู', count: 3, sound: 'mouse', speed: 1.6 }
        ]
    },
    // 14. [เดิม ด่าน 9] จับสัตว์วิ่งบนจอ 2 (หนู + กระต่าย)
    14: {
        title: "ด่าน 14: จับหนูและกระต่าย",
        desc: "คลิกซ้ายจับหนู 3 ตัว และกระต่าย 2 ตัว",
        type: 'catch-me',
        subLevel: 2,
        animals: [
            { type: 'mouse', icon: 'mouse-animal', name: 'หนู', count: 3, sound: 'mouse', speed: 1.8 },
            { type: 'rabbit', icon: 'rabbit', name: 'กระต่าย', count: 2, sound: 'rabbit', speed: 1.9 }
        ]
    },
    // 15. [เดิม ด่าน 10] จับสัตว์วิ่งบนจอ 3 (แก๊งซ่า 10 ตัว)
    15: {
        title: "ด่าน 15: จับแก๊งซ่า 10 ตัว",
        desc: "คลิกซ้ายจับหนู 4, กระต่าย 4 และไก่ 2 ตัว",
        type: 'catch-me',
        subLevel: 3,
        animals: [
            { type: 'mouse', icon: 'mouse-animal', name: 'หนู', count: 4, sound: 'mouse', speed: 2.1 },
            { type: 'rabbit', icon: 'rabbit', name: 'กระต่าย', count: 4, sound: 'rabbit', speed: 2.2 },
            { type: 'chicken', icon: 'chicken', name: 'ไก่', count: 2, sound: 'chicken', speed: 2.0 }
        ]
    }
};
