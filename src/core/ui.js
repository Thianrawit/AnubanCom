// ==========================================
// UI & Visual Effects Helper
// ==========================================
import { playSound, playLetterSound, speakLockedLevelMessage, stopLockedVoice, isVoiceEnabled } from './audio.js';
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
    stopLockedVoice();
    const modal = document.getElementById('lockedLevelModal');
    if (!modal) return;
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

// ==========================================
// Instant Ghost Demo Engine (0s Auto-Demo + Hide on Input + 5s Idle Re-show)
// ==========================================
let activeGhostCleanup = null;

export function stopInstantGhostDemo() {
    if (typeof activeGhostCleanup === 'function') {
        activeGhostCleanup();
        activeGhostCleanup = null;
    }
    const existing = document.getElementById('instantGhostOverlay');
    if (existing) existing.remove();
}

/**
 * Starts an Instant Ghost Demo immediately at 0s, hides on user action, re-appears after 5s idle.
 * @param {HTMLElement} container - Board element
 * @param {Object} options - { type: 'wipe'|'click'|'hold'|'path'|'drag', getPoints: () => [...], isDone: () => bool }
 */
export function startInstantGhostDemo(container, options = {}) {
    stopInstantGhostDemo();
    if (!container) return () => {};

    const {
        type = 'click',
        getPoints = null,
        idleDelay = SYSTEM_SETTINGS.ghostDemoIdleDelay || 5000,
        isDone = () => false
    } = options;

    const overlay = document.createElement('div');
    overlay.id = 'instantGhostOverlay';
    overlay.className = 'absolute inset-0 pointer-events-none z-40 overflow-hidden transition-opacity duration-300 opacity-100';

    overlay.innerHTML = `
        <div id="ghostCursorActor" class="absolute pointer-events-none select-none flex flex-col items-center" style="left: 50%; top: 50%; transform: translate(-28%, -18%);">
            <!-- Hold / Click Progress Ring -->
            <svg id="ghostRingSvg" width="84" height="84" viewBox="0 0 84 84" class="
                absolute -top-4 -left-3 pointer-events-none opacity-0 transition-opacity
            ">
                <circle cx="42" cy="42" r="34" stroke="rgba(255,255,255,0.6)" stroke-width="6" fill="none" />
                <circle id="ghostProgressCircle" cx="42" cy="42" r="34" stroke="#10b981" stroke-width="6" fill="none"
                    stroke-linecap="round" stroke-dasharray="213.6" stroke-dashoffset="213.6"
                    transform="rotate(-90 42 42)" />
            </svg>

            <!-- Cute Vector Mouse + Hand Indicator -->
            <svg width="64" height="74" viewBox="0 0 60 70" fill="none" xmlns="http://www.w3.org/2000/svg">
                <g filter="url(#ghostDropShadow)">
                    <rect x="10" y="8" width="40" height="54" rx="20" fill="#FFFFFF" stroke="#334155" stroke-width="3.5"/>
                    <path d="M30 8 L30 32" stroke="#334155" stroke-width="3" stroke-linecap="round"/>
                    <path d="M10 32 L50 32" stroke="#334155" stroke-width="2.5"/>
                    <path id="ghostLeftBtn" d="M10 28 C10 17, 18 8, 30 8 L30 32 L10 32 Z" fill="#E2E8F0" stroke="#334155" stroke-width="2"/>
                    <rect x="27" y="16" width="6" height="12" rx="3" fill="#64748B"/>
                    <circle id="ghostPulseCircle" cx="20" cy="20" r="15" stroke="#EF4444" stroke-width="3.5" fill="none" class="opacity-0"/>
                </g>
                <defs>
                    <filter id="ghostDropShadow" x="0" y="0" width="60" height="70" filterUnits="userSpaceOnUse">
                        <feDropShadow dx="2" dy="5" stdDeviation="4" flood-opacity="0.32"/>
                    </filter>
                </defs>
            </svg>
        </div>
    `;

    container.appendChild(overlay);

    const actor = overlay.querySelector('#ghostCursorActor');
    const leftBtn = overlay.querySelector('#ghostLeftBtn');
    const pulseCircle = overlay.querySelector('#ghostPulseCircle');
    const ringSvg = overlay.querySelector('#ghostRingSvg');
    const progressCircle = overlay.querySelector('#ghostProgressCircle');

    let visible = true;
    let destroyed = false;
    let animId = null;
    let idleTimer = null;
    const startTime = performance.now();
    let lastMousePos = null;

    const hideGhost = () => {
        if (destroyed) return;
        if (visible) {
            visible = false;
            overlay.classList.remove('opacity-100');
            overlay.classList.add('opacity-0');
        }
        clearTimeout(idleTimer);
        idleTimer = setTimeout(() => {
            if (!destroyed && !isDone()) {
                visible = true;
                overlay.classList.remove('opacity-0');
                overlay.classList.add('opacity-100');
            }
        }, idleDelay);
    };

    const onMouseMove = (e) => {
        if (performance.now() - startTime < 450) return;
        if (!lastMousePos) {
            lastMousePos = { x: e.clientX, y: e.clientY };
            return;
        }
        const dist = Math.hypot(e.clientX - lastMousePos.x, e.clientY - lastMousePos.y);
        if (dist > 14) {
            lastMousePos = { x: e.clientX, y: e.clientY };
            hideGhost();
        }
    };

    const onImmediateInput = () => hideGhost();

    container.addEventListener('mousemove', onMouseMove, { passive: true });
    container.addEventListener('mousedown', onImmediateInput, { passive: true });
    container.addEventListener('touchstart', onImmediateInput, { passive: true });
    container.addEventListener('touchmove', onImmediateInput, { passive: true });
    window.addEventListener('keydown', onImmediateInput, { passive: true });

    const animate = (now) => {
        if (destroyed) return;
        if (isDone()) {
            overlay.classList.add('opacity-0');
            return;
        }

        const rect = container.getBoundingClientRect();
        const w = rect.width || 600;
        const h = rect.height || 450;
        const pts = (typeof getPoints === 'function' ? getPoints(w, h) : null) || [{ x: w * 0.5, y: h * 0.5 }];

        if (type === 'wipe') {
            const t = ((now - startTime) % 2400) / 2400;
            const angle = t * Math.PI * 2;
            const cx = pts[0]?.x ?? w * 0.5;
            const cy = pts[0]?.y ?? h * 0.5;
            const x = cx + Math.sin(angle * 2) * 95;
            const y = cy + Math.cos(angle) * 45;
            actor.style.left = `${x}px`;
            actor.style.top = `${y}px`;
            leftBtn.setAttribute('fill', '#E2E8F0');
            pulseCircle.setAttribute('class', 'opacity-0');
        } else if (type === 'click') {
            const p = pts[0] || { x: w * 0.5, y: h * 0.5 };
            const cycle = ((now - startTime) % 1400) / 1400;
            actor.style.left = `${p.x}px`;
            actor.style.top = `${p.y}px`;
            if (cycle > 0.35 && cycle < 0.75) {
                leftBtn.setAttribute('fill', '#EF4444');
                pulseCircle.setAttribute('class', 'opacity-100');
                actor.style.transform = 'translate(-28%, -18%) scale(0.92)';
            } else {
                leftBtn.setAttribute('fill', '#E2E8F0');
                pulseCircle.setAttribute('class', 'opacity-0');
                actor.style.transform = 'translate(-28%, -18%) scale(1)';
            }
        } else if (type === 'hold') {
            const p = pts[0] || { x: w * 0.5, y: h * 0.5 };
            const cycle = ((now - startTime) % 2600) / 2600;
            actor.style.left = `${p.x}px`;
            actor.style.top = `${p.y}px`;
            ringSvg.style.opacity = '1';
            if (cycle > 0.15 && cycle < 0.88) {
                const holdP = (cycle - 0.15) / 0.73;
                leftBtn.setAttribute('fill', '#EF4444');
                pulseCircle.setAttribute('class', 'opacity-100');
                const offset = 213.6 * (1 - holdP);
                progressCircle.setAttribute('stroke-dashoffset', String(offset));
                actor.style.transform = 'translate(-28%, -18%) scale(0.93)';
            } else {
                leftBtn.setAttribute('fill', '#E2E8F0');
                pulseCircle.setAttribute('class', 'opacity-0');
                progressCircle.setAttribute('stroke-dashoffset', '213.6');
                actor.style.transform = 'translate(-28%, -18%) scale(1)';
            }
        } else if (type === 'path' || type === 'drag') {
            const duration = 2800;
            const cycle = ((now - startTime) % duration) / duration;
            if (pts.length >= 2) {
                if (cycle < 0.15) {
                    actor.style.left = `${pts[0].x}px`;
                    actor.style.top = `${pts[0].y}px`;
                    leftBtn.setAttribute('fill', '#E2E8F0');
                    pulseCircle.setAttribute('class', 'opacity-0');
                } else if (cycle < 0.85) {
                    const moveP = (cycle - 0.15) / 0.70;
                    const totalSegs = pts.length - 1;
                    const exactSeg = moveP * totalSegs;
                    const idx = Math.min(totalSegs - 1, Math.floor(exactSeg));
                    const localT = exactSeg - idx;
                    const x = pts[idx].x + (pts[idx + 1].x - pts[idx].x) * localT;
                    const y = pts[idx].y + (pts[idx + 1].y - pts[idx].y) * localT;
                    actor.style.left = `${x}px`;
                    actor.style.top = `${y}px`;
                    leftBtn.setAttribute('fill', '#EF4444');
                    pulseCircle.setAttribute('class', 'opacity-100');
                } else {
                    const last = pts[pts.length - 1];
                    actor.style.left = `${last.x}px`;
                    actor.style.top = `${last.y}px`;
                    leftBtn.setAttribute('fill', '#10B981');
                    pulseCircle.setAttribute('class', 'opacity-0');
                }
            }
        }

        animId = requestAnimationFrame(animate);
    };

    animId = requestAnimationFrame(animate);

    const cleanup = () => {
        destroyed = true;
        clearTimeout(idleTimer);
        if (animId) cancelAnimationFrame(animId);
        container.removeEventListener('mousemove', onMouseMove);
        container.removeEventListener('mousedown', onImmediateInput);
        container.removeEventListener('touchstart', onImmediateInput);
        container.removeEventListener('touchmove', onImmediateInput);
        window.removeEventListener('keydown', onImmediateInput);
        if (overlay.parentNode) overlay.remove();
    };

    activeGhostCleanup = cleanup;
    return cleanup;
}


