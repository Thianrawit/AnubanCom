// ==========================================
// AnubanCom: Main Entry Point & Router
// ==========================================
import './styles/main.css';
import { mouseLevelConfigs } from './config/gameConfig.js';
import { initSecurity, registerKeyHandler } from './core/security.js';
import {
    showVictoryModal,
    hideVictoryModal,
    showLockedModal,
    hideLockedModal,
    showSettingsModal,
    hideSettingsModal,
    updateSettingsVoiceUI,
    showSettingsToast
} from './core/ui.js';
import { isVoiceEnabled, setVoiceEnabled, playSound } from './core/audio.js';

// Mouse Level Renderers
import { renderMouseLevel1 } from './levels/mouse/lv1-shapes.js';
import { renderMouseLevel2 } from './levels/mouse/lv2-animals.js';
import { renderMouseLevel3 } from './levels/mouse/lv3-categories.js';
import { renderMouseLevel4 } from './levels/mouse/lv4-puzzle.js';
import { renderMouseLevel5 } from './levels/mouse/lv5-paint.js';
import { renderHideAndSeekLevel } from './levels/mouse/lv6-7-flashlight.js';
import { renderCatchMeLevel } from './levels/mouse/lv8-10-catch.js';

// Keyboard Engine
import { initKeyboardLevel, handlePhysicalKeyInput, isKeyboardActive } from './levels/keyboard/keyboardEngine.js';

// Application State
let currentMode = 'mouse'; // 'mouse' | 'keyboard'
let currentKeyboardSubmode = 'thai'; // 'thai' | 'english' | 'number'
let currentLevel = 1;
let currentCleanupFn = null;
let unlockedMouseLevel = 1;

// Level Lock Progression Storage
function loadUnlockedMouseLevel() {
    const saved = localStorage.getItem('anuban_unlocked_mouse_level');
    const parsed = parseInt(saved, 10);
    if (!isNaN(parsed) && parsed >= 1 && parsed <= 10) {
        unlockedMouseLevel = parsed;
    } else {
        unlockedMouseLevel = 1;
    }
}

function saveUnlockedMouseLevel(lvl) {
    unlockedMouseLevel = Math.max(1, Math.min(10, lvl));
    localStorage.setItem('anuban_unlocked_mouse_level', unlockedMouseLevel.toString());
}

// Update Mouse Cards Visual Lock Status
export function updateMouseCardsUI() {
    for (let i = 1; i <= 10; i++) {
        const card = document.getElementById(`mouseCard-${i}`);
        if (!card) continue;

        const existingOverlay = card.querySelector('.lock-overlay');
        if (existingOverlay) existingOverlay.remove();

        if (i <= unlockedMouseLevel) {
            card.classList.remove('opacity-60', 'grayscale-[0.5]', 'brightness-90');
            card.classList.add('bounce-hover');
            card.title = `เล่นด่าน ${i}`;
        } else {
            card.classList.remove('bounce-hover');
            card.classList.add('opacity-60', 'grayscale-[0.5]', 'brightness-90');
            card.title = `ด่าน ${i} ยังล็อคอยู่ (ต้องเล่นด่าน ${unlockedMouseLevel} ให้จบก่อน)`;

            const overlay = document.createElement('div');
            overlay.className = 'lock-overlay absolute top-2 right-2 bg-slate-900/80 text-amber-300 text-[10px] font-black px-2 py-0.5 rounded-full shadow flex items-center gap-1 pointer-events-none';
            overlay.innerHTML = '<i class="fa-solid fa-lock"></i><span>ล็อค</span>';
            card.appendChild(overlay);
        }
    }
}

// Update Level Selector Dropdown Options
export function updateLevelSelectOptions() {
    const select = document.getElementById('levelSelect');
    if (!select) return;
    select.innerHTML = '';
    Object.keys(mouseLevelConfigs).forEach(lvlKey => {
        const k = parseInt(lvlKey, 10);
        const opt = document.createElement('option');
        opt.value = k;
        if (k <= unlockedMouseLevel) {
            opt.innerText = mouseLevelConfigs[k].title;
        } else {
            opt.innerText = `🔒 ${mouseLevelConfigs[k].title} (ล็อค)`;
        }
        select.appendChild(opt);
    });
    select.value = currentLevel;
}

// Clean up current active level before loading new level or navigating
function cleanupActiveLevel() {
    if (typeof currentCleanupFn === 'function') {
        currentCleanupFn();
        currentCleanupFn = null;
    }
}

// Navigation Functions
export function showMainMenu() {
    cleanupActiveLevel();
    hideVictoryModal();
    hideLockedModal();
    hideSettingsModal();

    if ('speechSynthesis' in window) window.speechSynthesis.cancel();

    document.getElementById('mainMenuScreen').classList.remove('hidden');
    document.getElementById('mouseMenuScreen').classList.add('hidden');
    document.getElementById('keyboardMenuScreen').classList.add('hidden');
    document.getElementById('gameplayScreen').classList.add('hidden');
    document.getElementById('gameplayScreen').classList.remove('flex');

    document.getElementById('levelSelect').classList.add('hidden');
    document.getElementById('resetBtn').classList.add('hidden');
}

export function openSubmenu(menuType) {
    document.getElementById('mainMenuScreen').classList.add('hidden');
    document.getElementById('gameplayScreen').classList.add('hidden');
    document.getElementById('gameplayScreen').classList.remove('flex');

    if (menuType === 'mouse') {
        updateMouseCardsUI();
        document.getElementById('mouseMenuScreen').classList.remove('hidden');
        document.getElementById('keyboardMenuScreen').classList.add('hidden');
    } else {
        document.getElementById('keyboardMenuScreen').classList.remove('hidden');
        document.getElementById('mouseMenuScreen').classList.add('hidden');
    }
}

export function startSpecificLevel(mode, lvlNum) {
    const targetLv = parseInt(lvlNum, 10);

    // Check level lock in mouse mode
    if (mode === 'mouse' && targetLv > unlockedMouseLevel) {
        showLockedModal(unlockedMouseLevel);
        return;
    }

    currentMode = mode;
    currentLevel = targetLv;

    document.getElementById('mainMenuScreen').classList.add('hidden');
    document.getElementById('mouseMenuScreen').classList.add('hidden');
    document.getElementById('keyboardMenuScreen').classList.add('hidden');

    document.getElementById('gameplayScreen').classList.remove('hidden');
    document.getElementById('gameplayScreen').classList.add('flex');

    document.getElementById('resetBtn').classList.remove('hidden');
    const select = document.getElementById('levelSelect');

    select.classList.remove('hidden');
    updateLevelSelectOptions();

    document.getElementById('headerIcon').className = 'fa-solid font-bold text-2xl fa-mouse-pointer';
    loadLevel(currentLevel);
}

export function startSpecificKeyboard(submode) {
    currentMode = 'keyboard';
    currentKeyboardSubmode = submode;

    document.getElementById('mainMenuScreen').classList.add('hidden');
    document.getElementById('mouseMenuScreen').classList.add('hidden');
    document.getElementById('keyboardMenuScreen').classList.add('hidden');

    document.getElementById('gameplayScreen').classList.remove('hidden');
    document.getElementById('gameplayScreen').classList.add('flex');

    document.getElementById('resetBtn').classList.remove('hidden');
    document.getElementById('levelSelect').classList.add('hidden');

    document.getElementById('headerIcon').className = 'fa-solid font-bold text-2xl fa-keyboard';
    loadLevel(1);
}

export function loadLevel(lvl) {
    cleanupActiveLevel();
    hideVictoryModal();

    currentLevel = parseInt(lvl);
    const board = document.getElementById('gameBoard');

    if (currentMode === 'mouse') {
        document.getElementById('levelSelect').value = currentLevel;
        const config = mouseLevelConfigs[currentLevel];
        document.getElementById('levelTitle').innerText = config.title;
        document.getElementById('levelDesc').innerText = config.desc;

        const onComplete = () => {
            // Unlock next level if currently at or beyond current unlocked
            if (currentLevel >= unlockedMouseLevel && unlockedMouseLevel < 10) {
                saveUnlockedMouseLevel(currentLevel + 1);
                updateMouseCardsUI();
                updateLevelSelectOptions();
            }
            showVictoryModal({
                mode: 'mouse',
                level: currentLevel,
                isLastLevel: currentLevel >= 10
            });
        };

        if (currentLevel === 1) {
            currentCleanupFn = renderMouseLevel1(board, config, onComplete);
        } else if (currentLevel === 2) {
            currentCleanupFn = renderMouseLevel2(board, config, onComplete);
        } else if (currentLevel === 3) {
            currentCleanupFn = renderMouseLevel3(board, config, onComplete);
        } else if (currentLevel === 4) {
            currentCleanupFn = renderMouseLevel4(board, config, onComplete);
        } else if (currentLevel === 5) {
            currentCleanupFn = renderMouseLevel5(board, config, onComplete);
        } else if (currentLevel === 6 || currentLevel === 7) {
            currentCleanupFn = renderHideAndSeekLevel(board, config, onComplete);
        } else if (currentLevel >= 8 && currentLevel <= 10) {
            currentCleanupFn = renderCatchMeLevel(board, config, onComplete);
        }
    } else {
        const onComplete = () => {
            showVictoryModal({
                mode: 'keyboard',
                level: 1,
                isLastLevel: true
            });
        };
        currentCleanupFn = initKeyboardLevel(board, currentKeyboardSubmode, onComplete);
    }
}

export function changeLevel(lvl) {
    const targetLv = parseInt(lvl, 10);
    if (currentMode === 'mouse' && targetLv > unlockedMouseLevel) {
        showLockedModal(unlockedMouseLevel);
        document.getElementById('levelSelect').value = currentLevel;
        return;
    }
    loadLevel(targetLv);
}

export function resetCurrentLevel() {
    loadLevel(currentLevel);
}

export function nextLevel() {
    hideVictoryModal();
    if (currentMode === 'mouse') {
        if (currentLevel < 10) {
            loadLevel(currentLevel + 1);
        } else {
            showMainMenu();
        }
    } else {
        showMainMenu();
    }
}

// Play current unlocked level from Locked Modal
export function playCurrentUnlockedLevel() {
    hideLockedModal();
    startSpecificLevel('mouse', unlockedMouseLevel);
}

// Settings Handlers
export function openSettingsModal() {
    showSettingsModal();
}

export function closeSettingsModal() {
    hideSettingsModal();
}

export function toggleVoiceSetting() {
    const newState = !isVoiceEnabled();
    setVoiceEnabled(newState);
    updateSettingsVoiceUI();
    showSettingsToast(newState ? 'เปิดเสียงอ่านแล้ว 🔊' : 'ปิดเสียงอ่านแล้ว 🔇');
}

export function unlockAllMouseLevels() {
    saveUnlockedMouseLevel(10);
    updateMouseCardsUI();
    updateLevelSelectOptions();
    playSound('win');
    showSettingsToast('ปลดล็อคด่านทั้งหมดเรียบร้อยแล้ว! 🎉');
}

export function lockAllMouseLevels() {
    saveUnlockedMouseLevel(1);
    updateMouseCardsUI();
    updateLevelSelectOptions();
    playSound('correct-key');
    showSettingsToast('ล็อคด่านทั้งหมดแล้ว เริ่มเล่นที่ด่าน 1 🔒');
}

// Bind to window for global inline event handlers in HTML
window.showMainMenu = showMainMenu;
window.openSubmenu = openSubmenu;
window.startSpecificLevel = startSpecificLevel;
window.startSpecificKeyboard = startSpecificKeyboard;
window.changeLevel = changeLevel;
window.resetCurrentLevel = resetCurrentLevel;
window.nextLevel = nextLevel;
window.openSettingsModal = openSettingsModal;
window.hideSettingsModal = closeSettingsModal;
window.toggleVoiceSetting = toggleVoiceSetting;
window.unlockAllMouseLevels = unlockAllMouseLevels;
window.lockAllMouseLevels = lockAllMouseLevels;
window.showLockedModal = showLockedModal;
window.hideLockedModal = hideLockedModal;
window.playCurrentUnlockedLevel = playCurrentUnlockedLevel;

// Initialize Security Guard and Key Routing
registerKeyHandler(
    (e) => handlePhysicalKeyInput(e),
    () => currentMode === 'keyboard' && isKeyboardActive()
);
initSecurity();

// Initial page load
window.addEventListener('DOMContentLoaded', () => {
    loadUnlockedMouseLevel();
    updateMouseCardsUI();
    showMainMenu();
});

