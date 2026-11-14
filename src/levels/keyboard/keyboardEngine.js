// ==========================================
// Keyboard Engine & Virtual Keyboard Logic
// ==========================================
import { keyboardLayoutRows, keyboardLevelConfigs, keyCodeToCharMap } from './keyData.js';
import { playSound, playLetterSound } from '../../core/audio.js';
import { GameIcon } from '../../components/GameIcon.js';
import { KEYBOARD_SETTINGS } from '../../config/settings.js';

let hintTimer = null;
let currentSubmode = 'thai';
let currentLetterList = [];
let currentLetterIndex = 0;
let targetLetter = '';
let totalTargets = 10;
let matchedCount = 0;
let onLevelCompleteCallback = null;

export function initKeyboardLevel(board, submode, onComplete) {
    cleanupKeyboardLevel();

    currentSubmode = submode;
    onLevelCompleteCallback = onComplete;
    const config = keyboardLevelConfigs[submode];

    document.getElementById('levelTitle').innerText = config.title;
    document.getElementById('levelDesc').innerText = config.desc;

    const allKeys = Object.keys(config.dict);
    currentLetterList = [...allKeys].sort(() => Math.random() - 0.5);

    totalTargets = Math.min(KEYBOARD_SETTINGS.totalQuestions || 10, currentLetterList.length);
    currentLetterIndex = 0;
    matchedCount = 0;

    renderKeyboardLayout(board);
    nextKeyboardPrompt();

    return cleanupKeyboardLevel;
}

export function cleanupKeyboardLevel() {
    clearTimeout(hintTimer);
    hintTimer = null;
    removeFingerHint();
    if ('speechSynthesis' in window) window.speechSynthesis.cancel();
}

export function isKeyboardActive() {
    return currentLetterIndex < totalTargets;
}

export function playCurrentTargetAudio() {
    const activeDict = keyboardLevelConfigs[currentSubmode].dict;
    const data = activeDict[targetLetter];
    if (!data) return;

    const lang = (currentSubmode === 'english') ? 'en-US' : 'th-TH';
    playLetterSound(data.name, lang, data.soundUrl || '');
}

function renderKeyboardLayout(board) {
    board.innerHTML = `
        <div class="flex flex-col items-center justify-center w-full max-w-sm bg-indigo-50 border-4 border-indigo-200 rounded-3xl p-4 sm:p-5 shadow-md mb-3 pop-anim relative">
            <button id="speakerAudioBtn" class="absolute top-3 right-3 bg-indigo-500 hover:bg-indigo-600 text-white w-10 h-10 rounded-2xl flex justify-center items-center shadow transition active:scale-90" title="ฟังเสียงอ่าน">
                <i class="fa-solid fa-volume-high text-lg"></i>
            </button>
            <div id="targetPic" class="w-20 h-20 sm:w-24 sm:h-24 mb-1 kb-bounce flex items-center justify-center" style="--kb-bounce-height: -${KEYBOARD_SETTINGS.bounceHeight}px; --kb-bounce-duration: ${KEYBOARD_SETTINGS.bounceDuration}s;">${GameIcon('chicken', 'w-20 h-20 sm:w-24 sm:h-24')}</div>
            <div id="targetChar" class="text-5xl sm:text-6xl font-extrabold text-indigo-700 tracking-wider">ก</div>
            <div id="targetName" class="text-base font-bold text-indigo-500 mt-1">ก ไก่</div>
            <div id="progressDots" class="flex gap-1.5 mt-3"></div>
        </div>

        <div class="w-full max-w-4xl flex flex-col items-center relative">
            <p class="text-xs text-slate-400 font-bold mb-2">กดปุ่มบนคีย์บอร์ดจริง (ไม่ต้องสลับภาษา) หรือแตะที่ปุ่มจำลองด้านล่าง 👇</p>
            <div id="virtualKeyboard" class="flex flex-col items-center gap-1.5 sm:gap-2 w-full p-2.5 sm:p-3 bg-slate-100/90 rounded-2xl border-2 border-slate-200 shadow-sm relative">
            </div>
        </div>
    `;

    document.getElementById('speakerAudioBtn').addEventListener('click', playCurrentTargetAudio);

    const vkContainer = document.getElementById('virtualKeyboard');
    vkContainer.innerHTML = '';

    const keyboardRows = keyboardLayoutRows[currentSubmode] || [];
    const activeDict = keyboardLevelConfigs[currentSubmode].dict;

    keyboardRows.forEach(row => {
        const rowDiv = document.createElement('div');
        rowDiv.className = "flex justify-center gap-0.5 sm:gap-1.5 w-full";

        row.forEach(char => {
            const btn = document.createElement('button');
            const isKeyInDict = !!activeDict[char];
            if (isKeyInDict) {
                btn.className = `vk-key text-[11px] sm:text-base md:text-lg font-extrabold bg-white hover:bg-amber-100 text-slate-700 min-w-[22px] sm:min-w-[42px] md:min-w-[48px] h-8 sm:h-11 md:h-12 px-0.5 sm:px-2 rounded-lg sm:rounded-xl shadow-sm border sm:border-2 border-slate-200 flex justify-center items-center transition active:scale-90 relative`;
                btn.dataset.char = char;
                btn.innerText = char;
                btn.onclick = () => handleInputChar(char);
            } else {
                btn.className = `text-[9px] sm:text-sm font-bold bg-slate-200/50 text-slate-400 min-w-[20px] sm:min-w-[38px] md:min-w-[44px] h-8 sm:h-11 md:h-12 px-0.5 sm:px-1.5 rounded-lg sm:rounded-xl border border-slate-200/60 flex justify-center items-center cursor-default select-none opacity-40`;
                btn.innerText = char;
                btn.disabled = true;
            }
            rowDiv.appendChild(btn);
        });

        vkContainer.appendChild(rowDiv);
    });
}

function removeFingerHint() {
    const oldHand = document.getElementById('handHintFinger');
    if (oldHand) oldHand.remove();
}

function showFingerHint(targetElem) {
    removeFingerHint();
    if (!targetElem) return;

    const hand = document.createElement('div');
    hand.id = 'handHintFinger';
    hand.className = 'finger-pointer-anim absolute pointer-events-none z-30 select-none';
    hand.style.top = '-62px';
    hand.style.left = '50%';
    hand.style.marginLeft = '-34px';
    hand.innerHTML = `
        <svg width="68" height="68" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
            <g filter="url(#shadowFilter)">
                <rect x="42" y="38" width="16" height="42" rx="8" fill="#FBBF24" stroke="#D97706" stroke-width="3"/>
                <circle cx="50" cy="74" r="5" fill="#FDE68A"/>
                <path d="M30 42 C30 35, 42 35, 42 45 L42 62 C42 66, 30 66, 30 58 Z" fill="#F59E0B" stroke="#B45309" stroke-width="3"/>
                <path d="M32 20 C32 12, 68 12, 68 20 L68 46 C68 54, 32 54, 32 46 Z" fill="#FBBF24" stroke="#D97706" stroke-width="3"/>
                <rect x="56" y="24" width="16" height="11" rx="5" fill="#F59E0B" stroke="#B45309" stroke-width="2.5"/>
                <rect x="56" y="33" width="16" height="11" rx="5" fill="#F59E0B" stroke="#B45309" stroke-width="2.5"/>
                <rect x="56" y="42" width="15" height="10" rx="5" fill="#F59E0B" stroke="#B45309" stroke-width="2.5"/>
                <rect x="36" y="2" width="28" height="18" rx="4" fill="#3B82F6" stroke="#1D4ED8" stroke-width="3"/>
                <rect x="34" y="16" width="32" height="6" rx="3" fill="#FFFFFF" stroke="#94A3B8" stroke-width="2"/>
            </g>
            <defs>
                <filter id="shadowFilter" x="0" y="0" width="100" height="100" filterUnits="userSpaceOnUse">
                    <feDropShadow dx="0" dy="4" stdDeviation="4" flood-opacity="0.35"/>
                </filter>
            </defs>
        </svg>
    `;
    targetElem.appendChild(hand);
}

function nextKeyboardPrompt() {
    clearTimeout(hintTimer);
    removeFingerHint();

    if (currentLetterIndex >= totalTargets) {
        if (onLevelCompleteCallback) setTimeout(onLevelCompleteCallback, 400);
        return;
    }

    targetLetter = currentLetterList[currentLetterIndex];
    const activeDict = keyboardLevelConfigs[currentSubmode].dict;
    const data = activeDict[targetLetter] || { name: targetLetter, icon: '🔤', soundUrl: '' };

    const targetCharElem = document.getElementById('targetChar');
    const targetPicElem = document.getElementById('targetPic');
    const targetNameElem = document.getElementById('targetName');

    if (!targetCharElem) return;

    targetCharElem.className = 'text-5xl sm:text-6xl font-extrabold text-indigo-700 tracking-wider pop-anim';
    targetCharElem.innerText = targetLetter;
    targetPicElem.className = 'w-20 h-20 sm:w-24 sm:h-24 mb-1 kb-bounce flex items-center justify-center';
    targetPicElem.style.setProperty('--kb-bounce-height', `-${KEYBOARD_SETTINGS.bounceHeight}px`);
    targetPicElem.style.setProperty('--kb-bounce-duration', `${KEYBOARD_SETTINGS.bounceDuration}s`);
    targetPicElem.innerHTML = GameIcon(data.icon, 'w-20 h-20 sm:w-24 sm:h-24');
    targetNameElem.innerText = data.name;

    const lang = (currentSubmode === 'english') ? 'en-US' : 'th-TH';
    playLetterSound(data.name, lang, data.soundUrl || '');

    const dots = document.getElementById('progressDots');
    if (dots) {
        dots.innerHTML = '';
        for (let i = 0; i < totalTargets; i++) {
            const dot = document.createElement('span');
            if (i < currentLetterIndex) dot.className = 'w-3 h-3 bg-emerald-500 rounded-full';
            else if (i === currentLetterIndex) dot.className = 'w-3 h-3 bg-amber-400 rounded-full animate-ping';
            else dot.className = 'w-3 h-3 bg-slate-300 rounded-full';
            dots.appendChild(dot);
        }
    }

    document.querySelectorAll('.vk-key').forEach(k => k.classList.remove('key-hint'));

    hintTimer = setTimeout(() => {
        const targetKeyElem = document.querySelector(`.vk-key[data-char="${targetLetter}"]`);
        if (targetKeyElem) {
            targetKeyElem.classList.add('key-hint');
            showFingerHint(targetKeyElem);
        }
    }, KEYBOARD_SETTINGS.idleHintDelay || 5000);
}

export function handleInputChar(inputChar) {
    if (currentLetterIndex >= totalTargets) return;

    let match = false;
    if (currentSubmode === 'english') {
        match = (inputChar.toUpperCase() === targetLetter.toUpperCase());
    } else {
        match = (inputChar === targetLetter);
    }

    if (match) {
        clearTimeout(hintTimer);
        removeFingerHint();
        playSound('correct-key');
        matchedCount++;
        currentLetterIndex++;

        const keyBtn = document.querySelector(`.vk-key[data-char="${targetLetter}"]`);
        if (keyBtn) {
            keyBtn.classList.remove('key-hint');
            keyBtn.classList.add('bg-emerald-400', 'text-white', 'border-emerald-500');
            setTimeout(() => keyBtn.classList.remove('bg-emerald-400', 'text-white', 'border-emerald-500'), 400);
        }

        if (typeof confetti === 'function') {
            confetti({ particleCount: 15, spread: 50, origin: { y: 0.4 } });
        }
        nextKeyboardPrompt();
    } else {
        playSound('wrong-key');
        const targetCharElem = document.getElementById('targetChar');
        if (targetCharElem) {
            targetCharElem.classList.add('animate-shake');
            setTimeout(() => targetCharElem.classList.remove('animate-shake'), 300);
        }
    }
}

export function handlePhysicalKeyInput(e) {
    let pressedChar = e.key;
    const code = e.code;

    if (currentSubmode === 'thai') {
        const mapped = keyCodeToCharMap[code];
        if (mapped && mapped.th) {
            pressedChar = mapped.th;
        }
    } else if (currentSubmode === 'english') {
        const mapped = keyCodeToCharMap[code];
        if (mapped && mapped.en) {
            pressedChar = mapped.en;
        }
    } else if (currentSubmode === 'number') {
        if (code.startsWith('Digit')) {
            pressedChar = code.replace('Digit', '');
        } else if (code.startsWith('Numpad')) {
            pressedChar = code.replace('Numpad', '');
        }
    }

    handleInputChar(pressedChar);
}

