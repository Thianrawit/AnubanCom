// ==========================================
// Mouse Level 2: Slow Floating Balloons (Single Left Click)
// จิ้มลูกโป่งลอยช้าปล่อยลูกสัตว์กางร่มชูชีพ
// ==========================================
import { BALLOONS_SETTINGS } from '../../config/settings.js';
import { playSound } from '../../core/audio.js';
import { GameIcon } from '../../components/GameIcon.js';
import { startInstantGhostDemo, stopInstantGhostDemo, createStarBurst } from '../../core/ui.js';

export function renderBalloonsLevel(board, config, onComplete) {
    const animalPool = config.animals || [
        { icon: 'chicken', sound: 'chicken' },
        { icon: 'cat', sound: 'cat' },
        { icon: 'dog', sound: 'dog' },
        { icon: 'rabbit', sound: 'rabbit' },
        { icon: 'frog', sound: 'frog' }
    ];

    const totalToPop = BALLOONS_SETTINGS.totalToPop || BALLOONS_SETTINGS.targetScore || 5;
    let poppedCount = 0;
    let levelFinished = false;
    let animId = null;
    let ghostCleanup = null;

    const balloonPalette = [
        { fill: '#f43f5e', border: '#fda4af' }, // Rose
        { fill: '#38bdf8', border: '#bae6fd' }, // Sky
        { fill: '#fbbf24', border: '#fde68a' }, // Amber
        { fill: '#a855f7', border: '#e9d5ff' }, // Purple
        { fill: '#10b981', border: '#a7f3d0' }  // Emerald
    ];

    board.innerHTML = `
        <div id="balloonStage" class="relative w-full h-[440px] sm:h-[470px] bg-gradient-to-b from-sky-200 via-sky-100 to-emerald-100 rounded-3xl overflow-hidden select-none border-4 border-sky-300 shadow-inner">
            <!-- Decorative 3D Claymation Clouds -->
            <div class="absolute top-6 left-6 pointer-events-none opacity-85 float-anim">${GameIcon('cloud', 'w-20 h-20')}</div>
            <div class="absolute top-10 right-8 pointer-events-none opacity-85 float-anim" style="animation-delay: 1.2s;">${GameIcon('cloud', 'w-24 h-24')}</div>

            <!-- Visual Progress Bar (Zero-Text) -->
            <div class="absolute top-3 left-1/2 -translate-x-1/2 z-30 bg-white/90 px-4 py-1.5 rounded-full shadow-md border-2 border-sky-200 flex items-center gap-2" id="balloonProgressRow"></div>

            <!-- Active Balloons Layer -->
            <div id="balloonsContainer" class="absolute inset-0 z-20"></div>

            <!-- Parachuting Rescued Animals Layer -->
            <div id="parachutesContainer" class="absolute inset-0 z-10 pointer-events-none"></div>

            <!-- Green Meadow Ground -->
            <div class="absolute bottom-0 inset-x-0 h-14 bg-gradient-to-t from-emerald-400 to-emerald-300 border-t-4 border-emerald-200 z-10 flex items-center justify-center">
                <div class="flex items-center gap-2 bg-white/90 px-4 py-1 rounded-full shadow-sm">
                    ${GameIcon('mouse-device', 'w-5 h-5')}
                    <span class="w-3 h-3 rounded-full bg-rose-500 animate-ping"></span>
                    ${GameIcon('balloon-red', 'w-5 h-5')}
                </div>
            </div>
        </div>
    `;

    const stage = document.getElementById('balloonStage');
    const progressRow = document.getElementById('balloonProgressRow');
    const balloonsContainer = document.getElementById('balloonsContainer');
    const parachutesContainer = document.getElementById('parachutesContainer');

    const activeBalloons = [];
    const fallingParachutes = [];

    // Half-dimensions of the 112x136 balloon wrapper for exact center positioning without CSS transform conflicts
    const HALF_W = 56;
    const HALF_H = 68;

    function updateProgressUI() {
        if (!progressRow) return;
        progressRow.innerHTML = '';
        for (let i = 0; i < totalToPop; i++) {
            const slot = document.createElement('div');
            if (i < poppedCount) {
                const animal = animalPool[i % animalPool.length];
                slot.className = 'w-9 h-9 rounded-full bg-emerald-100 border-2 border-emerald-400 flex items-center justify-center p-1 pop-anim';
                slot.innerHTML = GameIcon(animal.icon, 'w-7 h-7');
            } else {
                slot.className = 'w-9 h-9 rounded-full bg-slate-100 border-2 border-slate-300 flex items-center justify-center opacity-60';
                slot.innerHTML = GameIcon('balloon-red', 'w-6 h-6');
            }
            progressRow.appendChild(slot);
        }
    }

    function spawnBalloon(indexSeed, isInitial = false) {
        const rect = stage.getBoundingClientRect();
        const stageW = rect.width || 650;
        const stageH = rect.height || 450;

        const animal = animalPool[indexSeed % animalPool.length];
        const color = balloonPalette[indexSeed % balloonPalette.length];

        // Outer wrapper ONLY handles left/top coordinates (never transform/scale on outer wrapper!)
        const elem = document.createElement('div');
        elem.className = 'absolute cursor-pointer select-none flex flex-col items-center';
        elem.style.width = '112px';
        elem.style.height = '136px';

        // Inner visual child handles hover scale & ring pulse so position never shifts
        elem.innerHTML = `
            <div class="balloon-inner balloon-hover-ring flex flex-col items-center transition-transform duration-150 rounded-full">
                <div class="relative w-28 h-28 rounded-full flex items-center justify-center shadow-lg border-4"
                     style="background: radial-gradient(circle at 32% 28%, #ffffff 0%, ${color.fill} 45%); border-color: ${color.border};">
                    <!-- Animal Silhouette Inside Balloon -->
                    <div class="filter brightness-0 opacity-45 pointer-events-none">
                        ${GameIcon(animal.icon, 'w-16 h-16')}
                    </div>
                    <!-- Specular Shine -->
                    <div class="absolute top-3 left-4 w-5 h-8 rounded-full bg-white/55 -rotate-30 pointer-events-none"></div>
                </div>
                <!-- Balloon Knot & String -->
                <div class="w-3 h-2 -mt-1 pointer-events-none" style="background-color: ${color.fill}; clip-path: polygon(50% 0%, 0% 100%, 100% 100%);"></div>
                <div class="w-0.5 h-6 bg-slate-400/70 pointer-events-none"></div>
            </div>
        `;

        // Spread balloons horizontally across lanes
        const laneCount = 3;
        const lane = indexSeed % laneCount;
        const laneWidth = (stageW - 180) / laneCount;
        const x = 90 + lane * laneWidth + laneWidth * 0.5 + (Math.random() * 30 - 15);
        
        // ลอยอยู่กลางอากาศตั้งแต่เริ่มเกมทันที (เด็กไม่ต้องรอลอยขึ้นมาจากข้างล่าง)
        const initialYOffsets = [0.32, 0.55, 0.78];
        const y = isInitial
            ? stageH * (initialYOffsets[indexSeed % initialYOffsets.length] || 0.5)
            : stageH + 60;

        const bObj = {
            elem,
            animal,
            x,
            y,
            currentDrawX: x,
            vy: (BALLOONS_SETTINGS.floatSpeed || BALLOONS_SETTINGS.floatSpeedMin || 0.95) * (0.9 + Math.random() * 0.25),
            swayOffset: Math.random() * Math.PI * 2,
            popped: false
        };

        elem.style.left = `${x - HALF_W}px`;
        elem.style.top = `${y - HALF_H}px`;

        const popHandler = (e) => {
            if (e.type === 'mousedown' && e.button !== 0) return;
            if (bObj.popped || levelFinished) return;
            e.stopPropagation();

            bObj.popped = true;
            poppedCount++;
            updateProgressUI();

            playSound(animal.sound || 'drop-success');
            createStarBurst(elem);

            // Spawn Parachute Animal at balloon's exact current drawn position
            spawnParachuteAnimal(bObj.currentDrawX, bObj.y, animal.icon);

            const inner = elem.querySelector('.balloon-inner');
            if (inner) {
                inner.innerHTML = GameIcon('balloon-star', 'w-28 h-28');
                inner.style.transition = 'transform 0.22s ease-out, opacity 0.22s ease-out';
                inner.style.transform = 'scale(1.4)';
                inner.style.opacity = '0';
            }

            setTimeout(() => {
                if (elem.parentNode) elem.remove();
            }, 220);

            if (poppedCount >= totalToPop) {
                levelFinished = true;
                stopInstantGhostDemo();
                setTimeout(() => {
                    if (onComplete) onComplete();
                }, 900);
            } else {
                const unpopped = activeBalloons.filter(b => !b.popped).length;
                if (poppedCount + unpopped < totalToPop) {
                    spawnBalloon(poppedCount + unpopped + 1, false);
                }
            }
        };

        elem.addEventListener('mousedown', popHandler);
        elem.addEventListener('touchstart', popHandler, { passive: true });

        balloonsContainer.appendChild(elem);
        activeBalloons.push(bObj);
    }

    function spawnParachuteAnimal(x, y, iconName) {
        const pElem = document.createElement('div');
        pElem.className = 'absolute pointer-events-none flex flex-col items-center';
        pElem.style.width = '96px';
        pElem.style.left = `${x - 48}px`;
        pElem.style.top = `${y - 48}px`;

        if (iconName === 'chicken') {
            pElem.innerHTML = `
                <div class="parachute-sway flex flex-col items-center drop-shadow-md">
                    ${GameIcon('chick-parachute', 'w-24 h-24')}
                </div>
            `;
        } else {
            pElem.innerHTML = `
                <div class="parachute-sway flex flex-col items-center">
                    <svg width="78" height="52" viewBox="0 0 80 54" fill="none" xmlns="http://www.w3.org/2000/svg" class="-mb-2">
                        <path d="M6 34 C6 12, 74 12, 74 34 Z" fill="#F43F5E" stroke="#FFFFFF" stroke-width="2.5"/>
                        <path d="M22 34 C22 14, 58 14, 58 34 Z" fill="#FBBF24"/>
                        <path d="M34 34 C34 15, 46 15, 46 34 Z" fill="#38BDF8"/>
                        <line x1="12" y1="34" x2="32" y2="52" stroke="#64748B" stroke-width="2"/>
                        <line x1="68" y1="34" x2="48" y2="52" stroke="#64748B" stroke-width="2"/>
                        <line x1="40" y1="34" x2="40" y2="52" stroke="#64748B" stroke-width="2"/>
                    </svg>
                    <div class="drop-shadow-md">${GameIcon(iconName, 'w-14 h-14')}</div>
                </div>
            `;
        }

        parachutesContainer.appendChild(pElem);
        fallingParachutes.push({
            elem: pElem,
            x,
            y,
            vy: 1.5
        });
    }

    updateProgressUI();

    const initialCount = Math.min(BALLOONS_SETTINGS.maxOnScreen || BALLOONS_SETTINGS.maxActiveBalloons || 3, totalToPop);
    for (let i = 0; i < initialCount; i++) {
        spawnBalloon(i, true);
    }

    let startTime = performance.now();
    function loop(now) {
        if (levelFinished) return;
        const rect = stage.getBoundingClientRect();
        const stageW = rect.width || 650;
        const stageH = rect.height || 450;
        const t = (now - startTime) / 1000;

        activeBalloons.forEach(b => {
            if (b.popped) return;
            b.y -= b.vy;
            const swayX = Math.sin(t * 2 + b.swayOffset) * 14;
            b.currentDrawX = b.x + swayX;

            // Wrap back to bottom if floated off top (No Game Over)
            if (b.y < -70) {
                b.y = stageH + 60;
                b.x = 90 + Math.random() * Math.max(120, stageW - 180);
                b.currentDrawX = b.x;
            }

            b.elem.style.left = `${b.currentDrawX - HALF_W}px`;
            b.elem.style.top = `${b.y - HALF_H}px`;
        });

        // Update falling parachutes
        for (let i = fallingParachutes.length - 1; i >= 0; i--) {
            const p = fallingParachutes[i];
            if (p.y < stageH - 76) {
                p.y += p.vy;
                p.elem.style.top = `${p.y - 48}px`;
            }
        }

        animId = requestAnimationFrame(loop);
    }

    animId = requestAnimationFrame(loop);

    // Instant Ghost Demo at 0s pointing at the lowest/closest active balloon
    ghostCleanup = startInstantGhostDemo(stage, {
        type: 'click',
        getPoints: (w, h) => {
            const visibleBalloon = activeBalloons.find(b => !b.popped && b.y > 60 && b.y < h - 40);
            if (visibleBalloon) {
                return [{ x: visibleBalloon.currentDrawX || visibleBalloon.x, y: visibleBalloon.y }];
            }
            return [{ x: w * 0.5, y: h * 0.55 }];
        },
        isDone: () => levelFinished
    });

    return function cleanup() {
        levelFinished = true;
        if (animId) cancelAnimationFrame(animId);
        if (ghostCleanup) ghostCleanup();
        stopInstantGhostDemo();
    };
}

export const initLevel = renderBalloonsLevel;
