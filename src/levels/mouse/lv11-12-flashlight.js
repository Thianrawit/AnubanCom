// ==========================================
// Mouse Levels 6 & 7: Hide & Seek Torch Game 🔦
// ==========================================
import { FLASHLIGHT_CONFIG } from '../../config/gameConfig.js';
import { playSound } from '../../core/audio.js';
import { GameIcon } from '../../components/GameIcon.js';

let hideSeekActive = false;
let hideSeekAnimId = null;

export function renderHideAndSeekLevel(board, config, onComplete) {
    stopFlashlightGame();

    const totalTargets = config.targets.length;
    let matchedCount = 0;
    hideSeekActive = true;
    let hideSeekItems = [];
    let hideSeekMousePos = { x: -500, y: -500 };

    // สรุปข้อมูลเป้าหมายเพื่อทำ HUD นับจำนวนคงเหลือของแต่ละอย่าง
    const targetStats = {};
    config.targets.forEach(t => {
        if (!targetStats[t.type]) {
            targetStats[t.type] = {
                name: t.name,
                icon: t.icon,
                remaining: 0
            };
        }
        targetStats[t.type].remaining++;
    });

    board.innerHTML = `
        <div class="relative w-full h-[460px] sm:h-[500px] bg-slate-950 rounded-3xl overflow-hidden select-none cursor-default shadow-2xl border-4 border-slate-800">
            <div class="absolute top-3 left-3 right-3 flex flex-wrap justify-between items-center z-30 pointer-events-none gap-2">
                <div class="bg-slate-900/90 text-amber-300 font-extrabold text-xs sm:text-sm px-4 py-1.5 rounded-full border border-amber-400/40 shadow-lg flex items-center gap-2">
                    <span class="flex items-center gap-1.5">${GameIcon('flashlight', 'w-4 h-4')} ภารกิจ: ${config.questText}</span>
                </div>
                
                <div id="hsBadgesContainer" class="flex flex-wrap items-center gap-2"></div>

                <div class="bg-amber-400 text-slate-900 font-black text-xs sm:text-sm px-3.5 py-1.5 rounded-full shadow-lg">
                    เหลืออีก: <span id="hsRemainingCount">${totalTargets}</span> ชิ้น
                </div>
            </div>

            <div id="hsItemsContainer" class="absolute inset-0 z-10"></div>
            <canvas id="flashlightCanvas" class="absolute inset-0 pointer-events-none z-20"></canvas>
        </div>
    `;

    const updateHsHUD = () => {
        const badgeBox = document.getElementById('hsBadgesContainer');
        if (badgeBox) {
            badgeBox.innerHTML = '';
            Object.keys(targetStats).forEach(type => {
                const info = targetStats[type];
                const isDone = info.remaining === 0;
                const badge = document.createElement('div');
                badge.className = `flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-black shadow-md border ${
                    isDone 
                        ? 'bg-slate-800/90 text-slate-500 border-slate-700 grayscale line-through' 
                        : 'bg-slate-900/90 text-amber-300 border-amber-400/50'
                }`;
                badge.innerHTML = `
                    <span>${GameIcon(info.icon, 'w-5 h-5')}</span>
                    <span>${info.name}:</span>
                    <span class="${isDone ? 'text-slate-500' : 'text-amber-400'}">${info.remaining} ชิ้น</span>
                `;
                badgeBox.appendChild(badge);
            });
        }
        const remainElem = document.getElementById('hsRemainingCount');
        if (remainElem) remainElem.innerText = `${totalTargets - matchedCount}`;
    };

    updateHsHUD();

    const canvas = document.getElementById('flashlightCanvas');
    const container = document.getElementById('hsItemsContainer');
    const boardBox = canvas.parentElement;

    container.style.opacity = '0';

    const getBoardDimensions = () => {
        const rect = boardBox.getBoundingClientRect();
        let w = boardBox.clientWidth || rect.width || board.clientWidth;
        let h = boardBox.clientHeight || rect.height || 480;
        if (!w || w < 200) w = Math.max(320, board.getBoundingClientRect().width || (window.innerWidth - 60));
        if (!h || h < 200) h = 480;
        return { w: Math.round(w), h: Math.round(h) };
    };

    const dims = getBoardDimensions();
    canvas.width = dims.w;
    canvas.height = dims.h;

    const initCtx = canvas.getContext('2d');
    initCtx.fillStyle = '#050816';
    initCtx.fillRect(0, 0, canvas.width, canvas.height);

    hideSeekItems = [];
    container.innerHTML = '';

    const safeMarginX = 80;
    const safeMarginY = 90;
    const maxX = Math.max(80, canvas.width - safeMarginX * 2);
    const maxY = Math.max(80, canvas.height - safeMarginY * 2);

    config.targets.forEach((tgt) => {
        const posX = safeMarginX + Math.random() * maxX;
        const posY = safeMarginY + Math.random() * maxY;

        const elem = document.createElement('div');
        elem.className = "absolute flex flex-col justify-center items-center pointer-events-none transition-transform select-none";
        elem.style.left = `${posX}px`;
        elem.style.top = `${posY}px`;
        elem.style.transform = `translate(-50%, -50%) scale(1)`;

        elem.innerHTML = `
            <div class="drop-shadow-lg flex items-center justify-center">${GameIcon(tgt.icon, 'w-14 h-14 sm:w-16 sm:h-16')}</div>
            <div class="text-[11px] font-bold text-amber-200 bg-slate-900/80 px-2 py-0.5 rounded-full mt-1 border border-amber-400/30">${tgt.name}</div>
        `;

        container.appendChild(elem);

        hideSeekItems.push({
            id: tgt.id,
            type: tgt.type,
            name: tgt.name,
            icon: tgt.icon,
            sound: tgt.sound,
            x: posX,
            y: posY,
            elem: elem,
            scale: 1.0,
            hoverTime: 0,
            found: false
        });
    });

    container.style.opacity = '1';

    const updatePos = (clientX, clientY) => {
        const rect = canvas.getBoundingClientRect();
        hideSeekMousePos.x = clientX - rect.left;
        hideSeekMousePos.y = clientY - rect.top;
    };

    const onEnter = (e) => updatePos(e.clientX, e.clientY);
    const onMove = (e) => updatePos(e.clientX, e.clientY);
    const onTStart = (e) => {
        if (e.touches && e.touches.length > 0) updatePos(e.touches[0].clientX, e.touches[0].clientY);
    };
    const onTMove = (e) => {
        if (e.touches && e.touches.length > 0) updatePos(e.touches[0].clientX, e.touches[0].clientY);
    };
    const onLeave = () => {
        hideSeekMousePos = { x: -500, y: -500 };
    };

    boardBox.addEventListener('mouseenter', onEnter);
    boardBox.addEventListener('mousemove', onMove);
    boardBox.addEventListener('touchstart', onTStart, { passive: true });
    boardBox.addEventListener('touchmove', onTMove, { passive: true });
    boardBox.addEventListener('mouseleave', onLeave);

    let lastTimestamp = performance.now();

    function flashlightLoop(now) {
        if (!hideSeekActive) return;

        const curDims = getBoardDimensions();
        if (curDims.w > 100 && curDims.h > 100 && (canvas.width !== curDims.w || canvas.height !== curDims.h)) {
            canvas.width = curDims.w;
            canvas.height = curDims.h;
        }

        const dt = (now - lastTimestamp) / 1000;
        lastTimestamp = now;

        const ctx = canvas.getContext('2d');
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        ctx.fillStyle = '#050816';
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        if (hideSeekMousePos.x > -100 && hideSeekMousePos.y > -100) {
            ctx.save();
            ctx.globalCompositeOperation = 'destination-out';

            const r = FLASHLIGHT_CONFIG.torchRadius;
            const f = Math.max(0, FLASHLIGHT_CONFIG.feather);

            if (f === 0) {
                ctx.beginPath();
                ctx.arc(hideSeekMousePos.x, hideSeekMousePos.y, r, 0, Math.PI * 2);
                ctx.fillStyle = '#000000';
                ctx.fill();
            } else {
                const innerR = Math.max(0, r - f);
                const outerR = r + f;
                const grad = ctx.createRadialGradient(
                    hideSeekMousePos.x, hideSeekMousePos.y, innerR,
                    hideSeekMousePos.x, hideSeekMousePos.y, outerR
                );
                grad.addColorStop(0, 'rgba(0,0,0,1)');
                grad.addColorStop(1, 'rgba(0,0,0,0)');
                ctx.fillStyle = grad;
                ctx.beginPath();
                ctx.arc(hideSeekMousePos.x, hideSeekMousePos.y, outerR, 0, Math.PI * 2);
                ctx.fill();
            }
            ctx.restore();

            ctx.beginPath();
            ctx.arc(hideSeekMousePos.x, hideSeekMousePos.y, r, 0, Math.PI * 2);
            ctx.strokeStyle = f > 0 ? 'rgba(245, 158, 11, 0.75)' : '#f59e0b';
            ctx.lineWidth = 3;
            ctx.stroke();
        }

        hideSeekItems.forEach(item => {
            if (item.found) return;

            const dist = Math.hypot(item.x - hideSeekMousePos.x, item.y - hideSeekMousePos.y);

            if (dist < FLASHLIGHT_CONFIG.detectRadius) {
                item.hoverTime += dt;
                const progress = Math.min(1.0, item.hoverTime / FLASHLIGHT_CONFIG.requiredHoverTime);
                item.scale = 1.0 + progress * 0.15;
                item.elem.style.transform = `translate(-50%, -50%) scale(${item.scale})`;

                if (item.hoverTime >= FLASHLIGHT_CONFIG.requiredHoverTime) {
                    item.found = true;
                    matchedCount++;
                    if (targetStats[item.type]) {
                        targetStats[item.type].remaining = Math.max(0, targetStats[item.type].remaining - 1);
                    }
                    updateHsHUD();
                    playSound(item.sound || 'drop-success');

                    item.elem.style.transition = 'transform 0.2s ease-out, opacity 0.2s ease-out';
                    item.elem.style.transform = 'translate(-50%, -50%) scale(1.25)';
                    item.elem.style.opacity = '0';

                    if (typeof confetti === 'function') {
                        confetti({ particleCount: 20, spread: 50, origin: { x: item.x / window.innerWidth, y: item.y / window.innerHeight } });
                    }

                    if (matchedCount >= totalTargets) {
                        stopFlashlightGame();
                        if (onComplete) setTimeout(onComplete, 600);
                    }
                }
            } else {
                if (item.hoverTime > 0) {
                    item.hoverTime = Math.max(0, item.hoverTime - dt * 3.5);
                    item.scale = 1.0 + (item.hoverTime / FLASHLIGHT_CONFIG.requiredHoverTime) * 0.15;
                    item.elem.style.transform = `translate(-50%, -50%) scale(${item.scale})`;
                }
            }
        });

        hideSeekAnimId = requestAnimationFrame(flashlightLoop);
    }

    hideSeekAnimId = requestAnimationFrame(flashlightLoop);

    return function cleanup() {
        stopFlashlightGame();
        boardBox.removeEventListener('mouseenter', onEnter);
        boardBox.removeEventListener('mousemove', onMove);
        boardBox.removeEventListener('touchstart', onTStart);
        boardBox.removeEventListener('touchmove', onTMove);
        boardBox.removeEventListener('mouseleave', onLeave);
    };
}

function stopFlashlightGame() {
    hideSeekActive = false;
    if (hideSeekAnimId) {
        cancelAnimationFrame(hideSeekAnimId);
        hideSeekAnimId = null;
    }
}


export const initLevel = renderHideAndSeekLevel;
