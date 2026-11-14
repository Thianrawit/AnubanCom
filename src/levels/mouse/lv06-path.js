// ==========================================
// Mouse Level 6: Wide-Path Dragging (Guide Pet Home)
// พาน้องเดินตามถนนสีเหลืองกลับบ้าน (หลุดขอบถนนเด้งกลับจุดเริ่มอย่างนุ่มนวล)
// ==========================================
import { PATH_SETTINGS } from '../../config/settings.js';
import { playSound } from '../../core/audio.js';
import { GameIcon } from '../../components/GameIcon.js';
import { startInstantGhostDemo, stopInstantGhostDemo, createStarBurst } from '../../core/ui.js';

export function renderPathLevel(board, config, onComplete) {
    const stages = config.stages || [
        {
            id: 'path_1',
            heroIcon: 'dog',
            goalIcon: 'doghouse',
            heroSound: 'dog',
            waypoints: [
                { x: 0.14, y: 0.52 },
                { x: 0.50, y: 0.52 },
                { x: 0.86, y: 0.52 }
            ]
        },
        {
            id: 'path_2',
            heroIcon: 'cat',
            goalIcon: 'fish',
            heroSound: 'cat',
            waypoints: [
                { x: 0.14, y: 0.72 },
                { x: 0.50, y: 0.28 },
                { x: 0.86, y: 0.72 }
            ]
        },
        {
            id: 'path_3',
            heroIcon: 'bear',
            goalIcon: 'honey',
            heroSound: 'drop-success',
            waypoints: [
                { x: 0.14, y: 0.32 },
                { x: 0.38, y: 0.74 },
                { x: 0.62, y: 0.28 },
                { x: 0.86, y: 0.70 }
            ]
        }
    ];

    const totalStages = Math.min(PATH_SETTINGS.totalStages || 3, stages.length);
    let currentStageIdx = 0;
    let isDragging = false;
    let stageCleared = false;
    let levelFinished = false;
    let ghostCleanup = null;
    let nextStageTimer = null;

    board.innerHTML = `
        <div id="pathStageContainer" class="relative w-full h-[430px] sm:h-[460px] bg-gradient-to-b from-emerald-100 via-lime-100 to-emerald-200 rounded-3xl overflow-hidden select-none border-4 border-emerald-400 shadow-inner">
            <!-- Visual Stage Progress Badges -->
            <div id="pathProgressRow" class="absolute top-3 left-1/2 -translate-x-1/2 z-30 bg-white/90 px-5 py-1.5 rounded-full shadow-md border-2 border-emerald-300 flex items-center gap-3"></div>

            <!-- Road Canvas -->
            <canvas id="pathRoadCanvas" class="absolute inset-0 w-full h-full pointer-events-none z-10"></canvas>

            <!-- Goal Target Pad -->
            <div id="pathGoalPad" class="absolute z-20 w-20 h-20 sm:w-24 sm:h-24 rounded-full bg-white/95 border-4 border-amber-400 shadow-xl flex items-center justify-center pointer-events-none -translate-x-1/2 -translate-y-1/2 animate-pulse"></div>

            <!-- Draggable Hero Token -->
            <div id="pathHeroToken" class="absolute z-30 w-20 h-20 sm:w-22 sm:h-22 rounded-full bg-white border-4 border-sky-400 shadow-2xl flex items-center justify-center cursor-grab active:cursor-grabbing -translate-x-1/2 -translate-y-1/2 touch-none"></div>
        </div>
    `;

    const container = document.getElementById('pathStageContainer');
    const progressRow = document.getElementById('pathProgressRow');
    const canvas = document.getElementById('pathRoadCanvas');
    const goalPad = document.getElementById('pathGoalPad');
    const heroToken = document.getElementById('pathHeroToken');
    const ctx = canvas.getContext('2d');

    let pixelWaypoints = [];

    function updateProgressBadges() {
        if (!progressRow) return;
        progressRow.innerHTML = '';
        for (let i = 0; i < totalStages; i++) {
            const badge = document.createElement('div');
            if (i < currentStageIdx) {
                badge.className = 'w-10 h-10 rounded-full bg-emerald-100 border-2 border-emerald-400 flex items-center justify-center p-1 pop-anim';
                badge.innerHTML = GameIcon(stages[i].heroIcon, 'w-7 h-7');
            } else if (i === currentStageIdx) {
                badge.className = 'w-10 h-10 rounded-full bg-amber-100 border-2 border-amber-400 flex items-center justify-center p-1 animate-pulse';
                badge.innerHTML = GameIcon(stages[i].goalIcon, 'w-7 h-7');
            } else {
                badge.className = 'w-10 h-10 rounded-full bg-slate-100 border-2 border-slate-300 flex items-center justify-center opacity-45';
                badge.innerHTML = '<span class="w-3 h-3 rounded-full bg-slate-300"></span>';
            }
            progressRow.appendChild(badge);
        }
    }

    function computePixelWaypoints() {
        const rect = container.getBoundingClientRect();
        const w = Math.max(320, rect.width || container.clientWidth || 640);
        const h = Math.max(320, rect.height || container.clientHeight || 450);
        canvas.width = w;
        canvas.height = h;

        const stg = stages[currentStageIdx];
        pixelWaypoints = stg.waypoints.map(pt => ({
            x: pt.x * w,
            y: pt.y * h
        }));
    }

    function drawRoad() {
        computePixelWaypoints();
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        if (pixelWaypoints.length < 2) return;

        const roadW = PATH_SETTINGS.roadWidth || 78;

        // 1. Road Outer Border (Warm Amber-Brown)
        ctx.save();
        ctx.beginPath();
        ctx.moveTo(pixelWaypoints[0].x, pixelWaypoints[0].y);
        for (let i = 1; i < pixelWaypoints.length; i++) {
            ctx.lineTo(pixelWaypoints[i].x, pixelWaypoints[i].y);
        }
        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';
        ctx.lineWidth = roadW + 16;
        ctx.strokeStyle = '#f59e0b';
        ctx.stroke();

        // 2. Main Sunny Yellow Road Surface
        ctx.lineWidth = roadW;
        ctx.strokeStyle = '#fef08a';
        ctx.stroke();

        // 3. Dashed Center Direction Line
        ctx.lineWidth = 6;
        ctx.setLineDash([16, 14]);
        ctx.strokeStyle = '#fb923c';
        ctx.stroke();
        ctx.restore();
    }

    function distanceToSegment(px, py, x1, y1, x2, y2) {
        const dx = x2 - x1;
        const dy = y2 - y1;
        const lenSq = dx * dx + dy * dy;
        if (lenSq === 0) return Math.hypot(px - x1, py - y1);
        let t = ((px - x1) * dx + (py - y1) * dy) / lenSq;
        t = Math.max(0, Math.min(1, t));
        const projX = x1 + t * dx;
        const projY = y1 + t * dy;
        return Math.hypot(px - projX, py - projY);
    }

    function getMinDistanceToRoad(px, py) {
        let minDist = Infinity;
        for (let i = 0; i < pixelWaypoints.length - 1; i++) {
            const d = distanceToSegment(
                px, py,
                pixelWaypoints[i].x, pixelWaypoints[i].y,
                pixelWaypoints[i + 1].x, pixelWaypoints[i + 1].y
            );
            if (d < minDist) minDist = d;
        }
        return minDist;
    }

    function resetHeroToStart(smooth = true) {
        if (pixelWaypoints.length === 0) return;
        const startPt = pixelWaypoints[0];
        heroToken.style.transition = smooth ? 'left 0.35s cubic-bezier(0.34, 1.56, 0.64, 1), top 0.35s cubic-bezier(0.34, 1.56, 0.64, 1)' : 'none';
        heroToken.style.left = `${startPt.x}px`;
        heroToken.style.top = `${startPt.y}px`;
    }

    function loadStage(idx) {
        if (levelFinished) return;
        stageCleared = false;
        isDragging = false;
        const stg = stages[idx];

        drawRoad();
        updateProgressBadges();

        heroToken.innerHTML = GameIcon(stg.heroIcon, 'w-14 h-14');
        goalPad.innerHTML = GameIcon(stg.goalIcon, 'w-14 h-14');

        const goalPt = pixelWaypoints[pixelWaypoints.length - 1];
        goalPad.style.left = `${goalPt.x}px`;
        goalPad.style.top = `${goalPt.y}px`;

        resetHeroToStart(false);
    }

    function onStartDrag(e) {
        if (e.type === 'mousedown' && e.button !== 0) return;
        if (stageCleared || levelFinished) return;
        e.preventDefault();
        isDragging = true;
        document.body.classList.add('is-dragging');
        heroToken.style.transition = 'none';
        heroToken.classList.add('scale-110');
    }

    function onMoveDrag(clientX, clientY) {
        if (!isDragging || stageCleared || levelFinished) return;
        const rect = container.getBoundingClientRect();
        const x = clientX - rect.left;
        const y = clientY - rect.top;

        heroToken.style.left = `${x}px`;
        heroToken.style.top = `${y}px`;

        // Check if wandered off the yellow road
        const minDist = getMinDistanceToRoad(x, y);
        const maxTolerance = PATH_SETTINGS.offRoadTolerance || 50;

        if (minDist > maxTolerance) {
            isDragging = false;
            document.body.classList.remove('is-dragging');
            heroToken.classList.remove('scale-110');
            playSound('drop-fail');
            resetHeroToStart(true);
            return;
        }

        // Check if reached the Goal Pad
        const goalPt = pixelWaypoints[pixelWaypoints.length - 1];
        const distToGoal = Math.hypot(x - goalPt.x, y - goalPt.y);
        if (distToGoal <= 54) {
            completeStage();
        }
    }

    function onEndDrag() {
        document.body.classList.remove('is-dragging');
        if (!isDragging) return;
        isDragging = false;
        heroToken.classList.remove('scale-110');
        if (!stageCleared) {
            resetHeroToStart(true);
        }
    }

    function completeStage() {
        stageCleared = true;
        isDragging = false;
        document.body.classList.remove('is-dragging');
        heroToken.classList.remove('scale-110');

        const stg = stages[currentStageIdx];
        const goalPt = pixelWaypoints[pixelWaypoints.length - 1];
        heroToken.style.transition = 'left 0.2s ease-out, top 0.2s ease-out';
        heroToken.style.left = `${goalPt.x}px`;
        heroToken.style.top = `${goalPt.y}px`;

        playSound(stg.heroSound || 'drop-success');
        createStarBurst(goalPad);

        currentStageIdx++;
        updateProgressBadges();

        nextStageTimer = setTimeout(() => {
            if (levelFinished) return;
            if (currentStageIdx >= totalStages) {
                levelFinished = true;
                stopInstantGhostDemo();
                if (onComplete) onComplete();
            } else {
                loadStage(currentStageIdx);
            }
        }, 1150);
    }

    const onMouseMove = (e) => onMoveDrag(e.clientX, e.clientY);
    const onTouchMove = (e) => {
        if (e.touches && e.touches.length > 0) {
            onMoveDrag(e.touches[0].clientX, e.touches[0].clientY);
        }
    };
    const onResize = () => {
        if (!levelFinished) {
            drawRoad();
            const goalPt = pixelWaypoints[pixelWaypoints.length - 1];
            if (goalPt) {
                goalPad.style.left = `${goalPt.x}px`;
                goalPad.style.top = `${goalPt.y}px`;
                resetHeroToStart(false);
            }
        }
    };

    heroToken.addEventListener('mousedown', onStartDrag);
    heroToken.addEventListener('touchstart', onStartDrag, { passive: false });
    window.addEventListener('mousemove', onMouseMove);
    window.addEventListener('touchmove', onTouchMove, { passive: true });
    window.addEventListener('mouseup', onEndDrag);
    window.addEventListener('touchend', onEndDrag);
    window.addEventListener('resize', onResize);

    // Wait a tick for layout dimensions if needed
    loadStage(0);
    setTimeout(() => {
        if (!levelFinished && !isDragging) loadStage(currentStageIdx);
    }, 50);

    // Instant Ghost Demo at 0s following the current stage's waypoints
    ghostCleanup = startInstantGhostDemo(container, {
        type: 'path',
        getPoints: () => pixelWaypoints.length >= 2 ? pixelWaypoints : [{ x: 100, y: 220 }, { x: 500, y: 220 }],
        isDone: () => levelFinished
    });

    return function cleanup() {
        levelFinished = true;
        document.body.classList.remove('is-dragging');
        clearTimeout(nextStageTimer);
        if (ghostCleanup) ghostCleanup();
        stopInstantGhostDemo();
        heroToken.removeEventListener('mousedown', onStartDrag);
        heroToken.removeEventListener('touchstart', onStartDrag);
        window.removeEventListener('mousemove', onMouseMove);
        window.removeEventListener('touchmove', onTouchMove);
        window.removeEventListener('mouseup', onEndDrag);
        window.removeEventListener('touchend', onEndDrag);
        window.removeEventListener('resize', onResize);
    };
}

export const initLevel = renderPathLevel;

