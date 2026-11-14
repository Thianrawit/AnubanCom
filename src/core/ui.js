// ==========================================
// UI & Visual Effects Helper
// ==========================================
import { playSound, playLetterSound, speakLockedLevelMessage, isVoiceEnabled } from './audio.js';
import { GameIcon } from '../components/GameIcon.js';
import { SYSTEM_SETTINGS } from '../config/settings.js';

export function createStarBurst(element) {
    if (!element || typeof confetti !== 'function') return;
    const rect = element.getBoundingClientRect();
    const centerX = (rect.left + rect.width / 2) / window.innerWidth;
    const centerY = (rect.top + rect.height / 2) / window.innerHeight;

    confetti({
        particleCount: 20,
        spread: 60,
        origin: { x: centerX, y: centerY },
        colors: ['#f59e0b', '#10b981', '#3b82f6', '#ec4899']
    });
}

export function showVictoryModal(options = {}) {
    const { mode, level, isLastLevel = false, onNext, onReplay } = options;
    
    playSound('win');
    playLetterSound("เก่งมากครับ", 'th-TH', 'audio/voice/phrase_win.mp3');
    
    if (typeof confetti === 'function') {
        confetti({ particleCount: 90, spread: 80, origin: { y: 0.5 } });
    }

    const modal = document.getElementById('victoryModal');
    const nextBtn = document.getElementById('nextLevelBtn');

    if (!modal) return;

    if (isLastLevel || mode === 'keyboard') {
        nextBtn.innerHTML = `<span class="flex items-center justify-center gap-1.5">กลับหน้าหลัก ${GameIcon('house', 'w-5 h-5')}</span>`;
    } else {
        nextBtn.innerHTML = `<span class="flex items-center justify-center gap-1.5">ด่านถัดไป ${GameIcon('arrow-right', 'w-5 h-5')}</span>`;
    }

    modal.classList.remove('hidden');
    setTimeout(() => modal.classList.add('opacity-100'), 10);
}

export function hideVictoryModal() {
    const modal = document.getElementById('victoryModal');
    if (!modal) return;
    modal.classList.remove('opacity-100');
    modal.classList.add('hidden');
}

export function showLockedModal(unlockedLevel) {
    const modal = document.getElementById('lockedLevelModal');
    const targetText = document.getElementById('lockedTargetLvText');
    if (!modal) return;

    if (targetText) {
        targetText.innerText = `ด่าน ${unlockedLevel}`;
    }

    modal.classList.remove('hidden');
    setTimeout(() => modal.classList.add('opacity-100'), 10);

    // อ่านเสียงให้เด็กด้วยความเร็ว 0.7 ตามคำสั่งผู้ใช้
    speakLockedLevelMessage(unlockedLevel);
}

export function hideLockedModal() {
    const modal = document.getElementById('lockedLevelModal');
    if (!modal) return;
    if ('speechSynthesis' in window) {
        window.speechSynthesis.cancel();
    }
    modal.classList.remove('opacity-100');
    setTimeout(() => modal.classList.add('hidden'), 300);
}

export function showSettingsModal() {
    const modal = document.getElementById('settingsModal');
    if (!modal) return;
    updateSettingsVoiceUI();
    modal.classList.remove('hidden');
    setTimeout(() => modal.classList.add('opacity-100'), 10);
}

export function hideSettingsModal() {
    const modal = document.getElementById('settingsModal');
    if (!modal) return;
    modal.classList.remove('opacity-100');
    setTimeout(() => modal.classList.add('hidden'), 300);
}

export function updateSettingsVoiceUI() {
    const isEnabled = isVoiceEnabled();
    const btn = document.getElementById('voiceToggleBtn');
    const text = document.getElementById('voiceToggleText');
    const icon = document.getElementById('voiceSettingIcon');
    const desc = document.getElementById('voiceSettingDesc');

    if (!btn || !text || !icon || !desc) return;

    if (isEnabled) {
        btn.className = 'bg-emerald-500 hover:bg-emerald-600 text-white font-bold text-xs sm:text-sm py-2 px-3.5 rounded-xl shadow-sm transition active:scale-95 flex items-center gap-1.5';
        text.innerHTML = `<span class="flex items-center gap-1">เปิดอยู่ ${GameIcon('speaker-on', 'w-4 h-4')}</span>`;
        icon.className = 'w-10 h-10 rounded-xl bg-emerald-100 text-emerald-600 flex items-center justify-center text-lg';
        icon.innerHTML = GameIcon('speaker-on', 'w-6 h-6');
        desc.innerText = 'เปิดอยู่ (มีเสียงพากย์)';
    } else {
        btn.className = 'bg-slate-400 hover:bg-slate-500 text-white font-bold text-xs sm:text-sm py-2 px-3.5 rounded-xl shadow-sm transition active:scale-95 flex items-center gap-1.5';
        text.innerHTML = `<span class="flex items-center gap-1">ปิดอยู่ ${GameIcon('speaker-off', 'w-4 h-4')}</span>`;
        icon.className = 'w-10 h-10 rounded-xl bg-slate-200 text-slate-500 flex items-center justify-center text-lg';
        icon.innerHTML = GameIcon('speaker-off', 'w-6 h-6');
        desc.innerText = 'ปิดอยู่ (ไม่มีเสียงพากย์)';
    }
}

let toastTimer = null;
export function showSettingsToast(msg) {
    const toast = document.getElementById('settingsToast');
    if (!toast) return;
    toast.innerHTML = `<span class="flex items-center justify-center gap-1.5">${msg}</span>`;
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => {
        toast.innerHTML = '';
    }, SYSTEM_SETTINGS.toastDuration || 2500);
}

