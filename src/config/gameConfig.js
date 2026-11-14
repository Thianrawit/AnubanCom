// ==========================================
// Centralized Game Configuration
// ==========================================
import { FLASHLIGHT_SETTINGS, CATCH_ME_SETTINGS } from './settings.js';

export const FLASHLIGHT_CONFIG = FLASHLIGHT_SETTINGS;
export const CATCH_ME_CONFIG = CATCH_ME_SETTINGS;

// Map to window for easy debugging in DevTools
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

export const mouseLevelConfigs = {
    1: {
        title: "ด่านที่ 1: ลากวางรูปทรงลงบล็อก 🔺",
        desc: "ลากรูปทรงสีสดใส ไปวางในช่องรูปทรงที่เหมือนกันนะครับ",
        items: [
            { id: 'shape-circle', type: 'circle', name: 'วงกลม', icon: 'shape-circle', svg: '<circle cx="40" cy="40" r="32" fill="#f43f5e" />' },
            { id: 'shape-square', type: 'square', name: 'สี่เหลี่ยม', icon: 'shape-square', svg: '<rect x="10" y="10" width="60" height="60" rx="8" fill="#3b82f6" />' },
            { id: 'shape-triangle', type: 'triangle', name: 'สามเหลี่ยม', icon: 'shape-triangle', svg: '<polygon points="40,10 70,70 10,70" fill="#f59e0b" />' },
            { id: 'shape-star', type: 'star', name: 'ดาว', icon: 'star-gold', svg: '<polygon points="40,5 50,30 78,30 55,48 64,75 40,58 16,75 25,48 2,30 30,30" fill="#a855f7" />' }
        ]
    },
    2: {
        title: "ด่านที่ 2: จับคู่รูปภาพกับเงา 🐱",
        desc: "ลากรูปสัตว์น่ารัก ไปวางจับคู่กับภาพเงาไร้สีให้ถูกต้องนะ",
        pairs: [
            { id: 'p1', type: 'cat', icon: 'cat', name: 'น้องแมว', sound: 'audio/sfx/cat.mp3', voice: 'audio/voice/cat.mp3' },
            { id: 'p2', type: 'dog', icon: 'dog', name: 'น้องหมา', sound: 'audio/sfx/dog.mp3', voice: 'audio/voice/dog.mp3' },
            { id: 'p3', type: 'chicken', icon: 'chicken', name: 'กุ๊กไก่', sound: 'audio/sfx/chicken.mp3', voice: 'audio/voice/chicken.mp3' },
            { id: 'p4', type: 'frog', icon: 'frog', name: 'กบซ่า', sound: 'audio/sfx/frog.mp3', voice: 'audio/voice/frog.mp3' }
        ]
    },
    3: {
        title: "ด่านที่ 3: แยกหมวดหมู่ภาพ 🍎 🐶",
        desc: "ลากรูปภาพไปเก็บใส่กล่องให้ตรงหมวดหมู่ (กล่องผลไม้ VS กล่องสัตว์เลี้ยง)",
        categories: [
            { type: 'fruit', name: 'กล่องผลไม้', icon: 'basket-fruit', color: 'border-amber-400 bg-amber-50' },
            { type: 'animal', name: 'กล่องสัตว์เลี้ยง', icon: 'basket-pet', color: 'border-sky-400 bg-sky-50' }
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
    4: {
        title: "ด่านที่ 4: ต่อภาพจิ๊กซอว์หมีน้อย 🐻",
        desc: "ลากชิ้นส่วนการ์ตูนไปต่อในกรอบรูปให้สมบูรณ์นะ!",
        pieces: [
            { id: 'pz1', pos: '0', icon: 'bear', bg: 'bg-amber-200' },
            { id: 'pz2', pos: '1', icon: 'honey', bg: 'bg-amber-300' },
            { id: 'pz3', pos: '2', icon: 'flower', bg: 'bg-amber-400' },
            { id: 'pz4', pos: '3', icon: 'pine-tree', bg: 'bg-amber-500' }
        ]
    },
    5: {
        title: "ด่านที่ 5: โปรแกรม Paint ลากเส้นตามรอยประ 🎨",
        desc: "เลือกสีพู่กัน แล้วลากเมาส์/นิ้ววาดทับตามเส้นประให้สมบูรณ์นะ!",
        shapes: [
            { name: 'หัวใจ', icon: 'heart', path: 'heart' },
            { name: 'ดาว', icon: 'star-gold', path: 'star' },
            { name: 'แอปเปิล', icon: 'apple', path: 'apple' },
            { name: 'บ้านน้อย', icon: 'house', path: 'house' }
        ]
    },
    6: {
        title: "ด่านที่ 6: ไฟฉายส่องซ่อนแอบ 1 (ผลไม้) 🔦",
        desc: "เลื่อนเมาส์ส่องหาผลไม้ ส่องแป๊บเดียวให้ครบนะ!",
        type: 'hide-seek',
        subLevel: 1,
        targets: [
            { id: 'hs_apple_1', name: 'แอปเปิล', icon: 'apple', type: 'apple', sound: 'drop-success' },
            { id: 'hs_apple_2', name: 'แอปเปิล', icon: 'apple', type: 'apple', sound: 'drop-success' },
            { id: 'hs_banana_1', name: 'กล้วย', icon: 'banana', type: 'banana', sound: 'drop-success' },
            { id: 'hs_banana_2', name: 'กล้วย', icon: 'banana', type: 'banana', sound: 'drop-success' }
        ],
        questText: "หาผลไม้ในฟาร์มให้ครบนะครับ!"
    },
    7: {
        title: "ด่านที่ 7: ไฟฉายส่องซ่อนแอบ 2 (สัตว์เลี้ยง) 🔦",
        desc: "เลื่อนเมาส์ส่องหาสัตว์น่ารัก ส่องแป๊บเดียวให้ครบนะ!",
        type: 'hide-seek',
        subLevel: 2,
        targets: [
            { id: 'hs_cat', name: 'น้องแมว', icon: 'cat', type: 'cat', sound: 'cat' },
            { id: 'hs_dog', name: 'น้องหมา', icon: 'dog', type: 'dog', sound: 'dog' },
            { id: 'hs_chicken', name: 'กุ๊กไก่', icon: 'chicken', type: 'chicken', sound: 'chicken' }
        ],
        questText: "หาสัตว์เลี้ยงน่ารักให้ครบนะครับ!"
    },
    8: {
        title: "ด่านที่ 8: จับให้ได้ 1 (หนูซน 3 ตัว) 🐭",
        desc: "ใช้เมาส์คลิกซ้ายจับหนูซนให้ครบ 3 ตัวนะ!",
        type: 'catch-me',
        subLevel: 1,
        animals: [
            { type: 'mouse', icon: 'mouse-animal', name: 'หนู', count: 3, sound: 'mouse', speed: 1.6 }
        ]
    },
    9: {
        title: "ด่านที่ 9: จับให้ได้ 2 (หนู 3 + กระต่าย 2) 🐰",
        desc: "ใช้เมาส์คลิกซ้ายจับหนู 3 ตัว และกระต่าย 2 ตัวให้ทันนะ!",
        type: 'catch-me',
        subLevel: 2,
        animals: [
            { type: 'mouse', icon: 'mouse-animal', name: 'หนู', count: 3, sound: 'mouse', speed: 1.8 },
            { type: 'rabbit', icon: 'rabbit', name: 'กระต่าย', count: 2, sound: 'rabbit', speed: 1.9 }
        ]
    },
    10: {
        title: "ด่านที่ 10: จับให้ได้ 3 (แก๊งซ่า 10 ตัว) 🐔",
        desc: "ใช้เมาส์คลิกซ้ายจับหนู 4 ตัว, กระต่าย 4 ตัว, ไก่ 2 ตัวให้ครบเลย!",
        type: 'catch-me',
        subLevel: 3,
        animals: [
            { type: 'mouse', icon: 'mouse-animal', name: 'หนู', count: 4, sound: 'mouse', speed: 2.1 },
            { type: 'rabbit', icon: 'rabbit', name: 'กระต่าย', count: 4, sound: 'rabbit', speed: 2.2 },
            { type: 'chicken', icon: 'chicken', name: 'ไก่', count: 2, sound: 'chicken', speed: 2.0 }
        ]
    }
};

