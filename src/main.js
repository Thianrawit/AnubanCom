// ==========================================
// AnubanCom: Main Entry Point & Router (15 Mouse Levels + 4 Keyboard Modes)
// ==========================================
import { GameIcon } from './components/GameIcon.js';
import { mouseLevelConfigs, TOTAL_MOUSE_LEVELS } from './config/gameConfig.js';
import { initSecurity, registerKeyHandler } from './core/security.js';
import {
    showVictoryModal,
    hideVictoryModal,
    showLockedModal,
    hideLockedModal,
    showSettingsModal,
    hideSettingsModal,
    updateSettingsVoiceUI,
    showSettingsToast,
    stopInstantGhostDemo
} from './core/ui.js';
import { isVoiceEnabled, setVoiceEnabled, playSound } from './core/audio.js';

// Mouse Level Renderers (15 Levels)
import { renderBubblesLevel } from './levels/mouse/lv01-bubbles.js';
import { renderBalloonsLevel } from './levels/mouse/lv02-balloons.js';
import { renderWateringLevel } from './levels/mouse/lv03-watering.js';
import { renderMouseLevel1 } from './levels/mouse/lv04-shapes.js';
import { renderMouseLevel2 } from './levels/mouse/lv05-animals.js';
import { renderPathLevel } from './levels/mouse/lv06-path.js';
import { renderMouseLevel3 } from './levels/mouse/lv07-categories.js';
import { renderFeedingLevel } from './levels/mouse/lv08-feeding.js';
import { renderMouseLevel4 } from './levels/mouse/lv09-puzzle.js';
import { renderMouseLevel5 } from './levels/mouse/lv10-paint.js';
import { renderHideAndSeekLevel } from './levels/mouse/lv11-12-flashlight.js';
import { renderCatchMeLevel } from './levels/mouse/lv13-15-catch.js';

// Keyboard Engines
import { initKeyboardLevel, handlePhysicalKeyInput, isKeyboardActive } from './levels/keyboard/keyboardEngine.js';
import { initKeyMiniGame, handleKeyMiniGameInput, isKeyMiniGameActive } from './levels/keyboard/keyMiniGames.js';

// Application State
let currentMode = 'mouse'; // 'mouse' | 'keyboard' | 'keyboard-mini'
let currentKeyboardSubmode = 'thai'; // 'thai' | 'english' | 'number'
let currentKeyMiniSubgame = 'egg'; // 'egg' | 'space' | 'arrows'
let currentLevel = 1;
let currentCleanupFn = null;
let unlockedMouseLevel = 1;

// Level Lock Progression Storage
function loadUnlockedMouseLevel() {
    const saved = localStorage.getItem('anuban_unlocked_mouse_level');
    const parsed = parseInt(saved, 10);
    if (!isNaN(parsed) && parsed >= 1 && parsed <= TOTAL_MOUSE_LEVELS) {
        unlockedMouseLevel = parsed;
    } else {
        unlockedMouseLevel = 1;
    }
}

function saveUnlockedMouseLevel(lvl) {
    unlockedMouseLevel = Math.max(1, Math.min(TOTAL_MOUSE_LEVELS, lvl));
    localStorage.setItem('anuban_unlocked_mouse_level', unlockedMouseLevel.toString());
}

// Update Mouse Cards Visual Lock Status
export function updateMouseCardsUI() {
    for (let i = 1; i <= TOTAL_MOUSE_LEVELS; i++) {
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
            overlay.className = 'lock-overlay absolute top-1.5 right-1.5 bg-slate-900/80 text-amber-300 text-[10px] font-black px-2 py-0.5 rounded-full shadow flex items-center gap-1 pointer-events-none';
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
            opt.innerText = `[ล็อค] ${mouseLevelConfigs[k].title}`;
        }
        select.appendChild(opt);
    });
    select.value = currentLevel;
}

// Clean up current active level before loading new level or navigating
function cleanupActiveLevel() {
    stopInstantGhostDemo();
    document.body.classList.remove('is-dragging');
    const board = document.getElementById('gameBoard');
    if (board) board.classList.remove('drag-game-active');
    if (typeof currentCleanupFn === 'function') {
        currentCleanupFn();
        currentCleanupFn = null;
    }
}

function hideAllScreens() {
    document.getElementById('mainMenuScreen')?.classList.add('hidden');
    document.getElementById('mouseMenuScreen')?.classList.add('hidden');
    document.getElementById('keyboardMenuScreen')?.classList.add('hidden');
    document.getElementById('keyboardMiniMenuScreen')?.classList.add('hidden');
    document.getElementById('gameplayScreen')?.classList.add('hidden');
    document.getElementById('gameplayScreen')?.classList.remove('flex');
}

// Navigation Functions
export function showMainMenu() {
    cleanupActiveLevel();
    hideVictoryModal();
    hideLockedModal();
    hideSettingsModal();

    if ('speechSynthesis' in window) window.speechSynthesis.cancel();

    hideAllScreens();
    document.getElementById('mainMenuScreen')?.classList.remove('hidden');

    document.getElementById('levelSelect')?.classList.add('hidden');
    document.getElementById('resetBtn')?.classList.add('hidden');

    const headerIcon = document.getElementById('headerIcon');
    if (headerIcon) headerIcon.src = 'assets/icons/icon-kid.webp';
}

export function openSubmenu(menuType) {
    cleanupActiveLevel();
    hideAllScreens();

    document.getElementById('levelSelect')?.classList.add('hidden');
    document.getElementById('resetBtn')?.classList.add('hidden');

    if (menuType === 'mouse') {
        updateMouseCardsUI();
        document.getElementById('mouseMenuScreen')?.classList.remove('hidden');
    } else {
        document.getElementById('keyboardMenuScreen')?.classList.remove('hidden');
    }
}

export function openKeyMiniGamesMenu() {
    cleanupActiveLevel();
    hideAllScreens();
    document.getElementById('levelSelect')?.classList.add('hidden');
    document.getElementById('resetBtn')?.classList.add('hidden');
    document.getElementById('keyboardMiniMenuScreen')?.classList.remove('hidden');
}

export function startKeyMiniGame(subGame) {
    currentMode = 'keyboard-mini';
    currentKeyMiniSubgame = subGame;

    hideAllScreens();
    document.getElementById('gameplayScreen')?.classList.remove('hidden');
    document.getElementById('gameplayScreen')?.classList.add('flex');

    document.getElementById('resetBtn')?.classList.remove('hidden');
    document.getElementById('levelSelect')?.classList.add('hidden');

    const headerIcon = document.getElementById('headerIcon');
    if (headerIcon) headerIcon.src = 'assets/icons/icon-keyboard.webp';

    loadLevel(1);
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

    hideAllScreens();
    document.getElementById('gameplayScreen')?.classList.remove('hidden');
    document.getElementById('gameplayScreen')?.classList.add('flex');

    document.getElementById('resetBtn')?.classList.remove('hidden');
    const select = document.getElementById('levelSelect');
    if (select) {
        select.classList.remove('hidden');
        updateLevelSelectOptions();
    }

    const headerIcon = document.getElementById('headerIcon');
    if (headerIcon) headerIcon.src = 'assets/icons/icon-mouse-device.webp';
    loadLevel(currentLevel);
}

export function startSpecificKeyboard(submode) {
    currentMode = 'keyboard';
    currentKeyboardSubmode = submode;

    hideAllScreens();
    document.getElementById('gameplayScreen')?.classList.remove('hidden');
    document.getElementById('gameplayScreen')?.classList.add('flex');

    document.getElementById('resetBtn')?.classList.remove('hidden');
    document.getElementById('levelSelect')?.classList.add('hidden');

    const headerIcon = document.getElementById('headerIcon');
    if (headerIcon) headerIcon.src = 'assets/icons/icon-keyboard.webp';
    loadLevel(1);
}

export function loadLevel(lvl) {
    cleanupActiveLevel();
    hideVictoryModal();

    currentLevel = parseInt(lvl, 10);
    const board = document.getElementById('gameBoard');

    const dragLevels = [3, 4, 5, 6, 7, 8, 9, 10, 13, 14, 15];
    if (currentMode === 'mouse' && dragLevels.includes(currentLevel)) {
        board?.classList.add('drag-game-active');
    } else {
        board?.classList.remove('drag-game-active');
    }

    if (currentMode === 'mouse') {
        const select = document.getElementById('levelSelect');
        if (select) select.value = currentLevel;

        const config = mouseLevelConfigs[currentLevel];
        document.getElementById('levelTitle').innerText = config.title;
        document.getElementById('levelDesc').innerText = config.desc;

        const onComplete = () => {
            if (currentLevel >= unlockedMouseLevel && unlockedMouseLevel < TOTAL_MOUSE_LEVELS) {
                saveUnlockedMouseLevel(currentLevel + 1);
                updateMouseCardsUI();
                updateLevelSelectOptions();
            }
            showVictoryModal({
                mode: 'mouse',
                level: currentLevel,
                isLastLevel: currentLevel >= TOTAL_MOUSE_LEVELS
            });
        };

        switch (currentLevel) {
            case 1:
                currentCleanupFn = renderBubblesLevel(board, config, onComplete);
                break;
            case 2:
                currentCleanupFn = renderBalloonsLevel(board, config, onComplete);
                break;
            case 3:
                currentCleanupFn = renderWateringLevel(board, config, onComplete);
                break;
            case 4:
                currentCleanupFn = renderMouseLevel1(board, config, onComplete);
                break;
            case 5:
                currentCleanupFn = renderMouseLevel2(board, config, onComplete);
                break;
            case 6:
                currentCleanupFn = renderPathLevel(board, config, onComplete);
                break;
            case 7:
                currentCleanupFn = renderMouseLevel3(board, config, onComplete);
                break;
            case 8:
                currentCleanupFn = renderFeedingLevel(board, config, onComplete);
                break;
            case 9:
                currentCleanupFn = renderMouseLevel4(board, config, onComplete);
                break;
            case 10:
                currentCleanupFn = renderMouseLevel5(board, config, onComplete);
                break;
            case 11:
            case 12:
                currentCleanupFn = renderHideAndSeekLevel(board, config, onComplete);
                break;
            case 13:
            case 14:
            case 15:
                currentCleanupFn = renderCatchMeLevel(board, config, onComplete);
                break;
        }
    } else if (currentMode === 'keyboard-mini') {
        const miniOrder = ['egg', 'space', 'arrows'];
        const idx = miniOrder.indexOf(currentKeyMiniSubgame);
        const onComplete = () => {
            showVictoryModal({
                mode: 'keyboard-mini',
                level: idx + 1,
                isLastLevel: idx >= miniOrder.length - 1
            });
        };
        currentCleanupFn = initKeyMiniGame(board, currentKeyMiniSubgame, onComplete);
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
        if (currentLevel < TOTAL_MOUSE_LEVELS) {
            loadLevel(currentLevel + 1);
        } else {
            showMainMenu();
        }
    } else if (currentMode === 'keyboard-mini') {
        const miniOrder = ['egg', 'space', 'arrows'];
        const idx = miniOrder.indexOf(currentKeyMiniSubgame);
        if (idx >= 0 && idx < miniOrder.length - 1) {
            currentKeyMiniSubgame = miniOrder[idx + 1];
            loadLevel(1);
        } else {
            openKeyMiniGamesMenu();
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
    showSettingsToast(newState ? `เปิดเสียงอ่านแล้ว ${GameIcon('speaker-on', 'w-4 h-4')}` : `ปิดเสียงอ่านแล้ว ${GameIcon('speaker-off', 'w-4 h-4')}`);
}

export function unlockAllMouseLevels() {
    saveUnlockedMouseLevel(TOTAL_MOUSE_LEVELS);
    updateMouseCardsUI();
    updateLevelSelectOptions();
    playSound('win');
    showSettingsToast(`ปลดล็อคครบทั้ง ${TOTAL_MOUSE_LEVELS} ด่านเรียบร้อยแล้ว! ${GameIcon('party-popper', 'w-4 h-4')}`);
}

export function lockAllMouseLevels() {
    saveUnlockedMouseLevel(1);
    updateMouseCardsUI();
    updateLevelSelectOptions();
    playSound('correct-key');
    showSettingsToast(`ล็อคด่านทั้งหมดแล้ว เริ่มเล่นที่ด่าน 1 ${GameIcon('lock', 'w-4 h-4')}`);
}

// Bind to window for global inline event handlers in HTML
window.showMainMenu = showMainMenu;
window.openSubmenu = openSubmenu;
window.openKeyMiniGamesMenu = openKeyMiniGamesMenu;
window.startKeyMiniGame = startKeyMiniGame;
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
    (e) => {
        if (currentMode === 'keyboard-mini' && isKeyMiniGameActive()) {
            handleKeyMiniGameInput(e);
        } else if (currentMode === 'keyboard' && isKeyboardActive()) {
            handlePhysicalKeyInput(e);
        }
    },
    () => (currentMode === 'keyboard' && isKeyboardActive()) || (currentMode === 'keyboard-mini' && isKeyMiniGameActive())
);
initSecurity();

// Initial page load
window.addEventListener('DOMContentLoaded', () => {
    loadUnlockedMouseLevel();
    updateMouseCardsUI();
    showMainMenu();
});
