// ==========================================
// GameIcon Component: Centralized Icon Renderer
// ==========================================
import { ICON_ASSETS } from '../constants/iconMap.js';

// Map common emojis to their icon asset keys
export const EMOJI_TO_ICON_NAME = {
    '🎮': 'gamepad',
    '✨': 'sparkles',
    '⚙️': 'gear',
    '🔄': 'rotate',
    '🏠': 'house',
    '🌟': 'star-face',
    '🖱️': 'mouse-device',
    '⌨️': 'keyboard',
    '➔': 'arrow-right',
    '➡️': 'arrow-right',
    '🔒': 'lock',
    '🎉': 'party-popper',
    '🔊': 'speaker-on',
    '🔇': 'speaker-off',
    '🖐️': 'hand-point',
    '👆': 'hand-point',
    '✊': 'hand-grab',
    '🔴': 'shape-circle',
    '🟦': 'shape-square',
    '🔺': 'shape-triangle',
    '❤️': 'heart',
    '💖': 'heart',
    '🧺': 'basket-fruit',
    '🧺 🍎': 'basket-fruit',
    '🧺 🐶': 'basket-pet',
    '🐻': 'bear',
    '🍯': 'honey',
    '🌸': 'flower',
    '🌲': 'pine-tree',
    '🎨': 'palette',
    '🚗': 'car',
    '🦋': 'butterfly',
    '🔦': 'flashlight',
    '🍎': 'apple',
    '🍌': 'banana',
    '🍊': 'orange',
    '🍓': 'strawberry',
    '🍉': 'watermelon',
    '🏆': 'trophy',
    '⭐': 'star-gold',
    '⭐️': 'star-gold',
    '🐱': 'cat',
    '🐶': 'dog',
    '🐸': 'frog',
    '🐔': 'chicken',
    '🐭': 'mouse-animal',
    '🐰': 'rabbit',
    '🐍': 'snake',
    '🐟': 'fish',
    '🐒': 'monkey',
    '🥣': 'egg-bowl',
    '🐃': 'buffalo',
    '🍽️': 'plate',
    '🐘': 'elephant',
    '🧒': 'kid',
    '👶': 'kid',
    '🐢': 'turtle',
    '🎒': 'backpack',
    '🛍️': 'backpack',
    '💂': 'soldier',
    '🪖': 'soldier',
    '🍃': 'leaf',
    '🐝': 'bee',
    '🪔': 'phan',
    '🦷': 'tooth',
    '🐴': 'horse',
    '👹': 'giant',
    '⛵': 'sailboat',
    '💍': 'ring',
    '🐯': 'tiger',
    '📦': 'chest',
    '🛁': 'bathtub',
    '🐜': 'ant',
    '🥚': 'egg',
    '🦒': 'giraffe',
    '🍦': 'icecream',
    '🧃': 'juice',
    '🫅🏻': 'king',
    '👑': 'king',
    '🦁': 'lion',
    '👩🏻‍⚕️': 'nurse',
    '🐖': 'pig',
    '🐷': 'pig',
    '👸': 'queen',
    '🌳': 'tree',
    '☂️': 'umbrella',
    '🎻': 'violin',
    '🎼': 'xylophone',
    '🛥️': 'yacht',
    '🦓': 'zebra',
    '⭕': 'num-0',
    '🎈': 'num-1',
    '🐥': 'num-2',
    '🐥🐥': 'num-2',
    '⭐️⭐️⭐️': 'num-3',
    '🍀': 'num-4',
    '🍀🍀🍀🍀': 'num-4',
    '🖐️': 'num-5',
    '🎲': 'num-6',
    '🌈': 'num-7',
    '🍎🍎🍎🍎🍎🍎🍎🍎': 'num-8',
    '⚽': 'num-9'
};

export function getIconUrl(nameOrEmoji) {
    if (!nameOrEmoji) return '';
    const clean = String(nameOrEmoji).trim();
    // 1. Direct match in ICON_ASSETS
    if (ICON_ASSETS[clean]) {
        return ICON_ASSETS[clean];
    }
    // 2. Emoji mapping match
    const mapped = EMOJI_TO_ICON_NAME[clean];
    if (mapped && ICON_ASSETS[mapped]) {
        return ICON_ASSETS[mapped];
    }
    return '';
}

/**
 * Returns an HTML string for an icon image
 * @param {string} name - The icon name or emoji
 * @param {string} className - Optional Tailwind CSS classes
 */
export function GameIcon(name, className = 'w-8 h-8') {
    const url = getIconUrl(name);
    if (!url) {
        return `<span class="inline-block ${className}">${name}</span>`;
    }
    return `<img src="${url}" alt="${name}" class="inline-block object-contain pointer-events-none select-none ${className}" draggable="false" />`;
}

/**
 * Creates and returns an HTMLImageElement
 */
export function createGameIcon(name, className = 'w-8 h-8') {
    const url = getIconUrl(name);
    const img = document.createElement('img');
    img.src = url || '';
    img.alt = name;
    img.className = `inline-block object-contain pointer-events-none select-none ${className}`;
    img.draggable = false;
    return img;
}

// Custom Web Component: <game-icon name="cat" class="w-12 h-12"></game-icon>
if (typeof customElements !== 'undefined' && !customElements.get('game-icon')) {
    class GameIconElement extends HTMLElement {
        connectedCallback() {
            const name = this.getAttribute('name') || '';
            const className = this.getAttribute('class') || this.getAttribute('className') || 'w-8 h-8';
            const url = getIconUrl(name);
            if (url) {
                this.innerHTML = `<img src="${url}" alt="${name}" class="inline-block object-contain pointer-events-none select-none ${className}" draggable="false" />`;
            } else {
                this.innerHTML = name;
            }
        }
    }
    customElements.define('game-icon', GameIconElement);
}

// Expose globally for convenience
if (typeof window !== 'undefined') {
    window.GameIcon = GameIcon;
    window.createGameIcon = createGameIcon;
    window.ICON_ASSETS = ICON_ASSETS;
    window.getIconUrl = getIconUrl;
}

