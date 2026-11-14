// ==========================================
// Mouse Level 1: Bubble Wipe (Hover & Wipe - Zero Click Required)
// เช็ดฟองสบู่หาสัตว์ซ่อนแอบ
// ==========================================
import { BUBBLES_SETTINGS } from '../../config/settings.js';
import { playSound } from '../../core/audio.js';
import { GameIcon } from '../../components/GameIcon.js';
import { startInstantGhostDemo, stopInstantGhostDemo, createStarBurst } from '../../core/ui.js';

export function renderBubblesLevel(board, config, onComplete) {
    const animals = config.animals || [
        { id: 'b_cat', icon: 'cat', name: 'น้องแมว', sound: 'cat' },
        { id: 'b_dog', icon: 'dog', name: 'เจ้าตูบ', sound: 'dog' },
        { id: 'b_frog', icon: 'frog', name: 'กบน้อย', sound: 'frog' }
    ];

    const totalRounds = Math.min(BUBBLES_SETTINGS.totalAnimals || 3, animals.length);
    let currentRound = 0;
    let isClearing = false;
    let levelFinished = false;
    let ghostCleanup = null;
    let roundTimeout = null;

    board.innerHTML = `
        <div id="bubbleStage" class="relative w-full h-[430px] sm:h-[460px] bg-gradient-to-b from-sky-100 via-cyan-50 to-emerald-50 rounded-3xl overflow-hidden flex flex-col items-center justify-between p-4 border-4 border-sky-200 shadow-inner select-none cursor-none">
            <!-- Visual Progress Badges (Zero-Text) -->
            <div id="bubbleProgressRow" class="flex items-center gap-3 z-20 bg-white/85 px-5 py-2 rounded-full shadow-md border-2 border-sky-200"></div>

            <!-- Central Animal & Bubble Wipe Area -->
            <div id="bubbleBox" class="relative w-72 h-72 sm:w-80 sm:h-80 rounded-3xl bg-white/90 shadow-xl border-4 border-sky-300 flex items-center justify-center overflow-hidden my-auto cursor-none">
                <div id="hiddenAnimalPic" class="transition-transform duration-500 scale-95 flex flex-col items-center justify-center pointer-events-none"></div>
                <canvas id="bubbleCanvas" width="320" height="320" class="absolute inset-0 w-full h-full cursor-none touch-none z-10 transition-opacity duration-500"></canvas>
            </div>

            <!-- Custom Sponge Cursor Follower for Minigame Frame -->
            <div id="spongeCursorFollower" class="pointer-events-none absolute z-30 transition-opacity duration-150 opacity-0 -translate-x-1/2 -translate-y-1/2" style="width: 68px; height: 58px;">
                <img src="assets/icons/icon-sponge.webp" alt="sponge cursor" class="w-full h-full object-contain drop-shadow-md select-none pointer-events-none" />
            </div>

            <!-- Visual Action Cue Icon (Move Mouse / Sponge Wipe) -->
            <div class="flex items-center gap-2 bg-sky-500 text-white px-4 py-1.5 rounded-full shadow-md z-20 pointer-events-none">
                ${GameIcon('mouse-device', 'w-6 h-6')}
                <i class="fa-solid fa-arrows-left-right text-lg animate-pulse"></i>
                ${GameIcon('sponge', 'w-6 h-6')}
            </div>
        </div>
    `;

    const stage = document.getElementById('bubbleStage');
    const progressRow = document.getElementById('bubbleProgressRow');
    const animalPic = document.getElementById('hiddenAnimalPic');
    const canvas = document.getElementById('bubbleCanvas');
    const spongeFollower = document.getElementById('spongeCursorFollower');
    const ctx = canvas.getContext('2d');

    // Track wiped cells on a 12x12 grid covering the central area (x: 40..280, y: 40..280)
    const GRID_N = 12;
    let wipedGrid = [];

    function updateProgressBadges() {
        if (!progressRow) return;
        progressRow.innerHTML = '';
        for (let i = 0; i < totalRounds; i++) {
            const badge = document.createElement('div');
            if (i < currentRound) {
                badge.className = 'w-11 h-11 rounded-full bg-emerald-100 border-2 border-emerald-400 flex items-center justify-center p-1 pop-anim shadow-sm';
                badge.innerHTML = GameIcon(animals[i].icon, 'w-8 h-8');
            } else if (i === currentRound) {
                badge.className = 'w-11 h-11 rounded-full bg-amber-100 border-2 border-amber-400 flex items-center justify-center p-1 animate-pulse shadow-sm';
                badge.innerHTML = GameIcon('sponge', 'w-7 h-7');
            } else {
                badge.className = 'w-11 h-11 rounded-full bg-slate-100 border-2 border-slate-300 flex items-center justify-center opacity-50';
                badge.innerHTML = '<span class="w-3 h-3 rounded-full bg-slate-300"></span>';
            }
            progressRow.appendChild(badge);
        }
    }

    function drawSoapBubbles() {
        ctx.globalCompositeOperation = 'source-over';
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        // Soft foam base layer so animal is completely hidden initially
        const bgGrad = ctx.createRadialGradient(160, 160, 30, 160, 160, 210);
        bgGrad.addColorStop(0, '#e0f2fe');
        bgGrad.addColorStop(0.6, '#bae6fd');
        bgGrad.addColorStop(1, '#7dd3fc');
        ctx.fillStyle = bgGrad;
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        const bubbleColors = [
            'rgba(255, 255, 255, 0.85)',
            'rgba(224, 242, 254, 0.9)',
            'rgba(252, 231, 243, 0.85)',
            'rgba(237, 233, 244, 0.85)',
            'rgba(209, 250, 229, 0.85)'
        ];

        // Draw 85 overlapping 3D-style pastel soap bubbles
        for (let i = 0; i < 85; i++) {
            const r = 18 + (i % 5) * 8;
            const x = (i * 43) % (canvas.width + 20) - 10;
            const y = ((i * 67) % (canvas.height + 20)) - 10;

            ctx.beginPath();
            ctx.arc(x, y, r, 0, Math.PI * 2);
            ctx.fillStyle = bubbleColors[i % bubbleColors.length];
            ctx.fill();
            ctx.lineWidth = 2;
            ctx.strokeStyle = 'rgba(255, 255, 255, 0.95)';
            ctx.stroke();

            // Specular highlight dot on each bubble
            ctx.beginPath();
            ctx.arc(x - r * 0.32, y - r * 0.32, r * 0.22, 0, Math.PI * 2);
            ctx.fillStyle = 'rgba(255, 255, 255, 0.95)';
            ctx.fill();
        }
    }

    function loadRound(idx) {
        if (levelFinished) return;
        isClearing = false;
        const animal = animals[idx];

        animalPic.className = 'transition-transform duration-500 scale-95 flex flex-col items-center justify-center pointer-events-none';
        animalPic.innerHTML = GameIcon(animal.icon, 'w-44 h-44 sm:w-52 sm:h-52');

        canvas.style.opacity = '1';
        drawSoapBubbles();

        wipedGrid = new Array(GRID_N * GRID_N).fill(false);
        updateProgressBadges();
    }

    let lastSoundTime = 0;
    function wipeAt(clientX, clientY) {
        if (isClearing || levelFinished) return;
        const rect = canvas.getBoundingClientRect();
        const scaleX = canvas.width / (rect.width || 320);
        const scaleY = canvas.height / (rect.height || 320);
        const x = (clientX - rect.left) * scaleX;
        const y = (clientY - rect.top) * scaleY;

        if (x < 0 || x > canvas.width || y < 0 || y > canvas.height) return;

        const wipeR = BUBBLES_SETTINGS.wipeRadius || 52;

        // Erase bubble layer permanently with soft radial brush
        ctx.save();
        ctx.globalCompositeOperation = 'destination-out';
        const grad = ctx.createRadialGradient(x, y, wipeR * 0.4, x, y, wipeR);
        grad.addColorStop(0, 'rgba(0,0,0,1)');
        grad.addColorStop(1, 'rgba(0,0,0,0)');
        ctx.fillStyle = grad;
        ctx.beginPath();
        ctx.arc(x, y, wipeR, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();

        // Mark grid cells inside wipe radius (central zone 40..280)
        let newlyWiped = false;
        const cellSpan = 240 / GRID_N;
        for (let gy = 0; gy < GRID_N; gy++) {
            for (let gx = 0; gx < GRID_N; gx++) {
                const idx = gy * GRID_N + gx;
                if (wipedGrid[idx]) continue;
                const cx = 40 + (gx + 0.5) * cellSpan;
                const cy = 40 + (gy + 0.5) * cellSpan;
                if (Math.hypot(x - cx, y - cy) <= wipeR * 0.85) {
                    wipedGrid[idx] = true;
                    newlyWiped = true;
                }
            }
        }

        const now = performance.now();
        if (newlyWiped && now - lastSoundTime > 180) {
            lastSoundTime = now;
            playSound('point-hit');
        }

        // Check cleared percentage
        const clearedCount = wipedGrid.filter(Boolean).length;
        const ratio = clearedCount / (GRID_N * GRID_N);
        const threshold = BUBBLES_SETTINGS.clearThreshold || 0.75;

        if (ratio >= threshold) {
            completeCurrentAnimal();
        }
    }

    function completeCurrentAnimal() {
        isClearing = true;
        const animal = animals[currentRound];

        // Fade out remaining bubbles & bounce animal
        canvas.style.opacity = '0';
        animalPic.className = 'transition-transform duration-500 scale-110 kb-bounce flex flex-col items-center justify-center pointer-events-none';
        playSound(animal.sound || 'drop-success');
        createStarBurst(animalPic);

        currentRound++;
        updateProgressBadges();

        roundTimeout = setTimeout(() => {
            if (levelFinished) return;
            if (currentRound >= totalRounds) {
                levelFinished = true;
                stopInstantGhostDemo();
                if (onComplete) onComplete();
            } else {
                loadRound(currentRound);
            }
        }, 1250);
    }

    // Update Sponge Cursor Follower Position inside minigame stage
    function updateSpongePosition(clientX, clientY, isTouch = false) {
        if (!spongeFollower || !stage) return;
        const sRect = stage.getBoundingClientRect();
        const sx = clientX - sRect.left;
        const sy = isTouch ? (clientY - sRect.top - 28) : (clientY - sRect.top);

        spongeFollower.style.left = `${sx}px`;
        spongeFollower.style.top = `${sy}px`;
        spongeFollower.style.opacity = '1';

        // Add a slight scrubbing tilt effect while wiping
        const wobbleAngle = Math.sin(performance.now() * 0.02) * 12;
        spongeFollower.style.transform = `translate(-50%, -50%) rotate(${wobbleAngle.toFixed(1)}deg) scale(1.05)`;
    }

    const onStageMouseMove = (e) => {
        updateSpongePosition(e.clientX, e.clientY, false);
    };

    const onStageMouseLeave = () => {
        if (spongeFollower) spongeFollower.style.opacity = '0';
    };

    const onMouseMove = (e) => {
        updateSpongePosition(e.clientX, e.clientY, false);
        wipeAt(e.clientX, e.clientY);
    };

    const onTouchMove = (e) => {
        if (e.touches && e.touches.length > 0) {
            updateSpongePosition(e.touches[0].clientX, e.touches[0].clientY, true);
            wipeAt(e.touches[0].clientX, e.touches[0].clientY);
        }
    };

    const onTouchEnd = () => {
        if (spongeFollower) spongeFollower.style.opacity = '0';
    };

    stage.addEventListener('mousemove', onStageMouseMove);
    stage.addEventListener('mouseleave', onStageMouseLeave);
    canvas.addEventListener('mousemove', onMouseMove);
    canvas.addEventListener('touchstart', onTouchMove, { passive: true });
    canvas.addEventListener('touchmove', onTouchMove, { passive: true });
    canvas.addEventListener('touchend', onTouchEnd, { passive: true });

    loadRound(0);

    // Instant Ghost Demo at 0s
    ghostCleanup = startInstantGhostDemo(stage, {
        type: 'wipe',
        getPoints: (w, h) => [{ x: w * 0.5, y: h * 0.5 }],
        isDone: () => levelFinished
    });

    return function cleanup() {
        levelFinished = true;
        clearTimeout(roundTimeout);
        if (ghostCleanup) ghostCleanup();
        stopInstantGhostDemo();
        stage.removeEventListener('mousemove', onStageMouseMove);
        stage.removeEventListener('mouseleave', onStageMouseLeave);
        canvas.removeEventListener('mousemove', onMouseMove);
        canvas.removeEventListener('touchstart', onTouchMove);
        canvas.removeEventListener('touchmove', onTouchMove);
        canvas.removeEventListener('touchend', onTouchEnd);
    };
}

export const initLevel = renderBubblesLevel;
