// ==========================================
// Mouse Level 5: Paint Tracing Game 🎨
// ==========================================
import { playSound } from '../../core/audio.js';
import { GameIcon } from '../../components/GameIcon.js';
import { PAINT_SETTINGS } from '../../config/settings.js';

let paintHintTimer = null;
let paintHintAnimId = null;

export function renderMouseLevel5(board, config, onComplete) {
    let currentShapeIndex = 0;
    let currentColor = '#ec4899';
    let brushSize = PAINT_SETTINGS.brushSize || 14;
    let tracingPoints = [];
    let completedPoints = 0;
    let isTracing = false;
    let canvas = null;
    let ctx = null;

    board.innerHTML = `
        <div class="flex flex-col items-center justify-center w-full">
            <div class="flex flex-wrap items-center justify-between w-full max-w-md gap-2 mb-3 bg-slate-100/90 p-2 rounded-2xl border-2 border-slate-200">
                <span id="shapeNameTitle" class="text-base font-extrabold text-purple-600 bg-white px-3 py-1 rounded-xl shadow-sm border border-slate-200 flex items-center gap-1.5">
                    รูปทรง: ${config.shapes[0].name} ${GameIcon(config.shapes[0].icon, 'w-5 h-5')}
                </span>

                <div class="flex items-center gap-1.5" id="colorPaletteBar">
                    <button data-color="#ec4899" class="color-btn active w-7 h-7 rounded-full bg-pink-500 border-2 border-white shadow-sm"></button>
                    <button data-color="#ef4444" class="color-btn w-7 h-7 rounded-full bg-red-500 border-2 border-white shadow-sm"></button>
                    <button data-color="#f59e0b" class="color-btn w-7 h-7 rounded-full bg-amber-500 border-2 border-white shadow-sm"></button>
                    <button data-color="#10b981" class="color-btn w-7 h-7 rounded-full bg-emerald-500 border-2 border-white shadow-sm"></button>
                    <button data-color="#3b82f6" class="color-btn w-7 h-7 rounded-full bg-blue-500 border-2 border-white shadow-sm"></button>
                    <button data-color="#8b5cf6" class="color-btn w-7 h-7 rounded-full bg-purple-500 border-2 border-white shadow-sm"></button>
                    
                    <button id="clearBoardBtn" class="w-8 h-8 rounded-xl bg-rose-100 hover:bg-rose-200 border-2 border-rose-300 text-rose-600 flex justify-center items-center shadow-sm text-xs font-bold transition" title="ล้างกระดานใหม่">
                        ${GameIcon('rotate', 'w-4 h-4')}
                    </button>
                </div>
            </div>

            <div class="relative bg-white rounded-3xl border-4 border-purple-200 shadow-inner p-2">
                <canvas id="tracingCanvas" width="340" height="300" class="rounded-2xl paint-canvas" style="cursor: var(--cursor-pencil);"></canvas>
            </div>

            <p class="text-xs sm:text-sm text-slate-500 font-bold mt-2 flex items-center gap-1.5">
                ${GameIcon('palette', 'w-4 h-4 inline-block')} กดเมาส์/ใช้นิ้วลากวาดเส้นทับเส้นประให้ครบนะครับ
            </p>
        </div>
    `;

    canvas = document.getElementById('tracingCanvas');
    ctx = canvas.getContext('2d');

    // Setup color palette buttons
    const colorButtons = board.querySelectorAll('.color-btn');
    colorButtons.forEach(btn => {
        btn.addEventListener('click', () => {
            currentColor = btn.dataset.color;
            colorButtons.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
        });
    });

    const clearBtn = document.getElementById('clearBoardBtn');
    clearBtn.addEventListener('click', () => {
        stopPaintDemo();
        initPaintCanvas(config.shapes[currentShapeIndex].path);
        startPaintHintTimer();
    });

    function initPaintCanvas(shapeType) {
        if (!canvas) return;
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        tracingPoints = [];
        completedPoints = 0;

        const cx = canvas.width / 2;
        const cy = canvas.height / 2;

        if (shapeType === 'heart') {
            for (let t = 0; t < Math.PI * 2; t += 0.3) {
                const x = 16 * Math.pow(Math.sin(t), 3);
                const y = -(13 * Math.cos(t) - 5 * Math.cos(2*t) - 2 * Math.cos(3*t) - Math.cos(4*t));
                tracingPoints.push({ x: cx + x * 7, y: cy + y * 7, hit: false });
            }
        } else if (shapeType === 'star') {
            const R = 95, r = 45;
            for (let i = 0; i < 10; i++) {
                const radius = (i % 2 === 0) ? R : r;
                const angle = (i * Math.PI) / 5 - Math.PI / 2;
                tracingPoints.push({ x: cx + radius * Math.cos(angle), y: cy + radius * Math.sin(angle), hit: false });
            }
        } else if (shapeType === 'apple') {
            for (let a = 0; a < Math.PI * 2; a += 0.35) {
                const r = 80 + Math.sin(a * 2) * 8;
                tracingPoints.push({ x: cx + r * Math.cos(a), y: cy + r * Math.sin(a) + 10, hit: false });
            }
        } else if (shapeType === 'house') {
            const pts = [
                {x: cx, y: cy - 90}, {x: cx + 90, y: cy - 20}, {x: cx + 90, y: cy + 80},
                {x: cx - 90, y: cy + 80}, {x: cx - 90, y: cy - 20}, {x: cx, y: cy - 90}
            ];
            pts.forEach(p => tracingPoints.push({ x: p.x, y: p.y, hit: false }));
        }

        drawBackgroundGuide();
    }

    function drawBackgroundGuide() {
        ctx.beginPath();
        ctx.setLineDash([8, 8]);
        ctx.strokeStyle = '#cbd5e1';
        ctx.lineWidth = 4;

        tracingPoints.forEach((pt, index) => {
            if (index === 0) ctx.moveTo(pt.x, pt.y);
            else ctx.lineTo(pt.x, pt.y);
        });
        ctx.closePath();
        ctx.stroke();
        ctx.setLineDash([]);

        tracingPoints.forEach(pt => {
            ctx.beginPath();
            ctx.arc(pt.x, pt.y, 7, 0, Math.PI * 2);
            ctx.fillStyle = pt.hit ? '#10b981' : '#f59e0b';
            ctx.fill();
            ctx.strokeStyle = '#ffffff';
            ctx.lineWidth = 2;
            ctx.stroke();
        });
    }

    function paintStroke(x1, y1, x2, y2) {
        ctx.beginPath();
        ctx.moveTo(x1, y1);
        ctx.lineTo(x2, y2);
        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';
        ctx.strokeStyle = currentColor;
        ctx.lineWidth = brushSize;
        ctx.stroke();
    }

    function checkPaintPoints(x, y) {
        tracingPoints.forEach(pt => {
            if (!pt.hit) {
                const dist = Math.hypot(pt.x - x, pt.y - y);
                if (dist < 24) {
                    pt.hit = true;
                    completedPoints++;
                    playSound('point-hit');
                    drawBackgroundGuide();

                    if (completedPoints >= tracingPoints.length) {
                        onPaintCompleted();
                    }
                }
            }
        });
    }

    function onPaintCompleted() {
        stopPaintDemo();
        playSound('win');
        if (typeof confetti === 'function') {
            confetti({ particleCount: 50, spread: 70, origin: { y: 0.5 } });
        }

        currentShapeIndex++;
        if (currentShapeIndex < config.shapes.length) {
            setTimeout(() => {
                const titleElem = document.getElementById('shapeNameTitle');
                if (titleElem) {
                    titleElem.innerHTML = `รูปทรง: ${config.shapes[currentShapeIndex].name} ${GameIcon(config.shapes[currentShapeIndex].icon, 'w-5 h-5')}`;
                }
                initPaintCanvas(config.shapes[currentShapeIndex].path);
                startPaintHintTimer();
            }, 800);
        } else {
            if (onComplete) setTimeout(onComplete, 600);
        }
    }

    let lastX = 0;
    let lastY = 0;

    const getPos = (e) => {
        const rect = canvas.getBoundingClientRect();
        const clientX = e.clientX !== undefined ? e.clientX : (e.touches && e.touches[0] ? e.touches[0].clientX : 0);
        const clientY = e.clientY !== undefined ? e.clientY : (e.touches && e.touches[0] ? e.touches[0].clientY : 0);
        const scaleX = rect.width ? canvas.width / rect.width : 1;
        const scaleY = rect.height ? canvas.height / rect.height : 1;
        return {
            x: (clientX - rect.left) * scaleX,
            y: (clientY - rect.top) * scaleY
        };
    };

    const startPaint = (e) => {
        if (e.button !== undefined && e.button !== 0) return;
        stopPaintDemo();
        isTracing = true;
        const pos = getPos(e);
        lastX = pos.x;
        lastY = pos.y;
        paintStroke(pos.x, pos.y, pos.x, pos.y);
        checkPaintPoints(pos.x, pos.y);
    };

    const movePaint = (e) => {
        if (!isTracing) return;
        const pos = getPos(e);
        paintStroke(lastX, lastY, pos.x, pos.y);
        checkPaintPoints(pos.x, pos.y);
        lastX = pos.x;
        lastY = pos.y;
    };

    const stopPaint = () => {
        isTracing = false;
        if (completedPoints < tracingPoints.length) {
            startPaintHintTimer();
        }
    };

    canvas.addEventListener('mousedown', startPaint);
    canvas.addEventListener('mousemove', movePaint);
    window.addEventListener('mouseup', stopPaint);

    canvas.addEventListener('touchstart', (e) => { e.preventDefault(); startPaint(e); }, { passive: false });
    canvas.addEventListener('touchmove', (e) => { e.preventDefault(); movePaint(e); }, { passive: false });
    canvas.addEventListener('touchend', stopPaint);

    // Paint Demo Functions
    function startPaintHintTimer() {
        stopPaintDemo();
        paintHintTimer = setTimeout(() => {
            triggerPaintDemo();
        }, PAINT_SETTINGS.idleHintDelay || 6500);
    }

    function stopPaintDemo() {
        if (paintHintTimer) {
            clearTimeout(paintHintTimer);
            paintHintTimer = null;
        }
        if (paintHintAnimId) {
            cancelAnimationFrame(paintHintAnimId);
            paintHintAnimId = null;
        }
        const oldOverlay = document.getElementById('paintHintOverlay');
        if (oldOverlay) oldOverlay.remove();
    }

    function triggerPaintDemo() {
        stopPaintDemo();
        if (!canvas || tracingPoints.length === 0) return;

        const rect = canvas.getBoundingClientRect();

        const overlay = document.createElement('div');
        overlay.id = 'paintHintOverlay';
        overlay.className = 'fixed inset-0 pointer-events-none z-50 overflow-hidden';
        overlay.innerHTML = `
            <canvas id="demoPaintGhostCanvas" width="${canvas.width}" height="${canvas.height}" 
                    class="absolute pointer-events-none rounded-2xl" 
                    style="left: ${rect.left}px; top: ${rect.top}px; width: ${rect.width}px; height: ${rect.height}px;">
            </canvas>
            <div id="demoPaintMouse" class="absolute pointer-events-none select-none" style="transform: translate(-30%, -20%);">
                <svg width="60" height="70" viewBox="0 0 60 70" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <g filter="url(#paintMouseShadow)">
                        <rect x="10" y="8" width="40" height="54" rx="20" fill="#FFFFFF" stroke="#334155" stroke-width="3.5"/>
                        <path d="M30 8 L30 32" stroke="#334155" stroke-width="3" stroke-linecap="round"/>
                        <path d="M10 32 L50 32" stroke="#334155" stroke-width="2.5"/>
                        <path id="demoPaintLeftBtn" d="M10 28 C10 17, 18 8, 30 8 L30 32 L10 32 Z" fill="#EF4444" stroke="#334155" stroke-width="2"/>
                        <rect x="27" y="16" width="6" height="12" rx="3" fill="#64748B"/>
                        <circle id="demoPaintPulse" cx="20" cy="20" r="14" stroke="#EF4444" stroke-width="3" fill="none" class="opacity-100"/>
                    </g>
                    <defs>
                        <filter id="paintMouseShadow" x="0" y="0" width="60" height="70" filterUnits="userSpaceOnUse">
                            <feDropShadow dx="2" dy="5" stdDeviation="4" flood-opacity="0.3"/>
                        </filter>
                    </defs>
                </svg>
                <div id="demoPaintBadge" class="bg-purple-600 text-white font-extrabold text-xs px-2.5 py-1 rounded-full shadow-md whitespace-nowrap absolute -top-7 -left-4 border-2 border-white">
                    🎨 กดคลิกซ้ายค้างแล้ววาดตามเส้น
                </div>
            </div>
        `;

        document.body.appendChild(overlay);

        const ghostCanvas = document.getElementById('demoPaintGhostCanvas');
        if (!ghostCanvas) return;
        const ghostCtx = ghostCanvas.getContext('2d');
        const mouseElem = document.getElementById('demoPaintMouse');
        const leftBtn = document.getElementById('demoPaintLeftBtn');

        const scaleX = rect.width / canvas.width;
        const scaleY = rect.height / canvas.height;

        const pts = tracingPoints;
        const numPts = pts.length;
        const loopTime = 6500;
        const startTime = performance.now();

        function renderPaintLoop(now) {
            const elapsed = (now - startTime) % loopTime;
            const progress = elapsed / loopTime;

            ghostCtx.clearRect(0, 0, ghostCanvas.width, ghostCanvas.height);

            if (progress < 0.85) {
                const drawProgress = progress / 0.85;
                const floatIdx = drawProgress * numPts;
                const curIdx = Math.min(Math.floor(floatIdx), numPts - 1);
                const frac = floatIdx - curIdx;

                const curPt = pts[curIdx];
                const nextPt = pts[(curIdx + 1) % numPts];

                const cx = curPt.x + (nextPt.x - curPt.x) * frac;
                const cy = curPt.y + (nextPt.y - curPt.y) * frac;

                ghostCtx.beginPath();
                ghostCtx.strokeStyle = 'rgba(236, 72, 153, 0.7)';
                ghostCtx.lineWidth = 10;
                ghostCtx.lineCap = 'round';
                ghostCtx.lineJoin = 'round';

                for (let i = 0; i <= curIdx; i++) {
                    if (i === 0) ghostCtx.moveTo(pts[i].x, pts[i].y);
                    else ghostCtx.lineTo(pts[i].x, pts[i].y);
                }
                ghostCtx.lineTo(cx, cy);
                ghostCtx.stroke();

                const screenX = rect.left + cx * scaleX;
                const screenY = rect.top + cy * scaleY;
                mouseElem.style.left = `${screenX}px`;
                mouseElem.style.top = `${screenY}px`;
                mouseElem.style.opacity = '1';
                ghostCanvas.style.opacity = '1';
                leftBtn.setAttribute('fill', '#EF4444');
            } else {
                const fadeP = (progress - 0.85) / 0.15;
                mouseElem.style.opacity = `${1 - fadeP}`;
                ghostCanvas.style.opacity = `${1 - fadeP}`;
                leftBtn.setAttribute('fill', '#10B981');
            }

            paintHintAnimId = requestAnimationFrame(renderPaintLoop);
        }

        paintHintAnimId = requestAnimationFrame(renderPaintLoop);
    }

    initPaintCanvas(config.shapes[0].path);
    startPaintHintTimer();

    return function cleanup() {
        stopPaintDemo();
        window.removeEventListener('mouseup', stopPaint);
    };
}


export const initLevel = renderMouseLevel5;
