// ==========================================
// Mouse Drag Hint Overlay (Auto 5s Idle Demo for Levels 1-4)
// ==========================================
import { GameIcon } from '../../components/GameIcon.js';
import { MOUSE_DRAG_SETTINGS } from '../../config/settings.js';

let mouseHintTimer = null;
let mouseHintAnimId = null;

export function startMouseHint(getRemainingCheckFn) {
    stopMouseHint();

    mouseHintTimer = setTimeout(() => {
        triggerMouseDragDemo(getRemainingCheckFn);
    }, MOUSE_DRAG_SETTINGS.idleHintDelay || 5000);
}

export function stopMouseHint() {
    if (mouseHintTimer) {
        clearTimeout(mouseHintTimer);
        mouseHintTimer = null;
    }
    if (mouseHintAnimId) {
        cancelAnimationFrame(mouseHintAnimId);
        mouseHintAnimId = null;
    }
    const oldOverlay = document.getElementById('mouseHintOverlay');
    if (oldOverlay) oldOverlay.remove();
}

function triggerMouseDragDemo(getRemainingCheckFn) {
    stopMouseHint();

    if (getRemainingCheckFn && !getRemainingCheckFn()) return;

    // หาชิ้นส่วนที่ยังไม่ได้ตอบ
    const remainingDragItems = Array.from(document.querySelectorAll('.drag-item')).filter(el => {
        return el.offsetParent !== null && el.style.display !== 'none';
    });
    if (remainingDragItems.length === 0) return;

    const demoDragItem = remainingDragItems[0];
    const targetType = demoDragItem.dataset.type;

    // หาช่อง drop-zone ที่ตรงกันและยังว่างอยู่
    const matchingZones = Array.from(document.querySelectorAll(`.drop-zone[data-match="${targetType}"]`));
    let demoDropZone = matchingZones.find(z => !z.querySelector('.drag-item') && !z.classList.contains('matched'));
    if (!demoDropZone && matchingZones.length > 0) demoDropZone = matchingZones[0];
    if (!demoDropZone) return;

    // สร้าง Overlay เมาส์สาธิต
    const overlay = document.createElement('div');
    overlay.id = 'mouseHintOverlay';
    overlay.className = 'fixed inset-0 pointer-events-none z-50 overflow-hidden';
    overlay.innerHTML = `
        <!-- Ghost Item Replica (ลากจำลอง) -->
        <div id="demoGhostItem" class="absolute pointer-events-none opacity-0 transition-opacity rounded-2xl shadow-xl flex justify-center items-center" style="transform: translate(-50%, -50%);">
            ${demoDragItem.innerHTML}
        </div>

        <!-- Animated Mouse Vector -->
        <div id="demoMousePointer" class="absolute pointer-events-none select-none" style="transform: translate(-30%, -20%);">
            <svg width="64" height="74" viewBox="0 0 60 70" fill="none" xmlns="http://www.w3.org/2000/svg">
                <g filter="url(#mouseShadow)">
                    <rect x="10" y="8" width="40" height="54" rx="20" fill="#FFFFFF" stroke="#334155" stroke-width="3.5"/>
                    <path d="M30 8 L30 32" stroke="#334155" stroke-width="3" stroke-linecap="round"/>
                    <path d="M10 32 L50 32" stroke="#334155" stroke-width="2.5"/>
                    <path id="demoLeftClickBtn" d="M10 28 C10 17, 18 8, 30 8 L30 32 L10 32 Z" fill="#E2E8F0" stroke="#334155" stroke-width="2"/>
                    <rect x="27" y="16" width="6" height="12" rx="3" fill="#64748B"/>
                    <circle id="demoClickPulse" cx="20" cy="20" r="14" stroke="#EF4444" stroke-width="3" fill="none" class="opacity-0"/>
                </g>
                <defs>
                    <filter id="mouseShadow" x="0" y="0" width="60" height="70" filterUnits="userSpaceOnUse">
                        <feDropShadow dx="2" dy="5" stdDeviation="4" flood-opacity="0.3"/>
                    </filter>
                </defs>
            </svg>

            <div id="demoMouseBadge" class="bg-indigo-600 text-white font-extrabold text-xs px-2.5 py-1 rounded-full shadow-md whitespace-nowrap absolute -top-7 -left-4 border-2 border-white opacity-0 transition-opacity flex items-center gap-1.5">
                ${GameIcon('mouse-device', 'w-4 h-4')} <span>คลิกซ้ายค้างแล้วลาก</span>
            </div>
        </div>
    `;

    document.body.appendChild(overlay);

    const ghostElem = document.getElementById('demoGhostItem');
    const mousePointer = document.getElementById('demoMousePointer');
    const leftClickBtn = document.getElementById('demoLeftClickBtn');
    const clickPulse = document.getElementById('demoClickPulse');
    const badge = document.getElementById('demoMouseBadge');

    const itemRect = demoDragItem.getBoundingClientRect();
    const startX = itemRect.left + itemRect.width / 2;
    const startY = itemRect.top + itemRect.height / 2;

    const zoneRect = demoDropZone.getBoundingClientRect();
    const endX = zoneRect.left + zoneRect.width / 2;
    const endY = zoneRect.top + zoneRect.height / 2;

    ghostElem.style.width = `${itemRect.width}px`;
    ghostElem.style.height = `${itemRect.height}px`;

    const totalDuration = MOUSE_DRAG_SETTINGS.hintLoopDuration || 3200;
    const loopStartTime = performance.now();

    function animateDemo(now) {
        const elapsed = (now - loopStartTime) % totalDuration;
        const progress = elapsed / totalDuration;

        if (progress < 0.20) {
            const p = progress / 0.20;
            const curX = startX + (startX - (startX + 60)) * (1 - p);
            const curY = startY + (startY - (startY + 50)) * (1 - p);
            mousePointer.style.left = `${curX}px`;
            mousePointer.style.top = `${curY}px`;
            mousePointer.style.opacity = `${p}`;
            leftClickBtn.setAttribute('fill', '#E2E8F0');
            clickPulse.setAttribute('class', 'opacity-0');
            ghostElem.style.opacity = '0';
            badge.style.opacity = '0';
        } else if (progress < 0.35) {
            mousePointer.style.left = `${startX}px`;
            mousePointer.style.top = `${startY}px`;
            leftClickBtn.setAttribute('fill', '#EF4444');
            clickPulse.setAttribute('class', 'opacity-100');
            ghostElem.style.left = `${startX}px`;
            ghostElem.style.top = `${startY}px`;
            ghostElem.style.opacity = '0.7';
            badge.style.opacity = '1';
        } else if (progress < 0.75) {
            const p = (progress - 0.35) / 0.40;
            const easeP = p < 0.5 ? 2 * p * p : -1 + (4 - 2 * p) * p;
            const curX = startX + (endX - startX) * easeP;
            const curY = startY + (endY - startY) * easeP;

            mousePointer.style.left = `${curX}px`;
            mousePointer.style.top = `${curY}px`;
            ghostElem.style.left = `${curX}px`;
            ghostElem.style.top = `${curY}px`;
            ghostElem.style.opacity = '0.75';
            leftClickBtn.setAttribute('fill', '#EF4444');
            clickPulse.setAttribute('class', 'opacity-0');
            badge.style.opacity = '1';
        } else if (progress < 0.88) {
            mousePointer.style.left = `${endX}px`;
            mousePointer.style.top = `${endY}px`;
            ghostElem.style.left = `${endX}px`;
            ghostElem.style.top = `${endY}px`;
            ghostElem.style.opacity = '0.4';
            leftClickBtn.setAttribute('fill', '#10B981');
            badge.style.opacity = '0';
        } else {
            const p = (progress - 0.88) / 0.12;
            mousePointer.style.opacity = `${1 - p}`;
            ghostElem.style.opacity = `${(1 - p) * 0.4}`;
        }

        mouseHintAnimId = requestAnimationFrame(animateDemo);
    }

    mouseHintAnimId = requestAnimationFrame(animateDemo);
}

