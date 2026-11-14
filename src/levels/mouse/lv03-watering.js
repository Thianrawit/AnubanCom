// ==========================================
// Mouse Level 3: Click & Hold Watering Plant
// 4 Growth Stages:
// ขั้น 1: กระถางดินเปล่า (icon-plant.webp)
// ขั้น 2: กำลังโตขั้นที่ 1 ต้นกล้างอก (icon-plant-sprout.webp)
// ขั้น 3: กำลังโตขั้นที่ 2 ต้นมีใบดก (icon-plant-growing.webp)
// ขั้น 4: โตเต็มที่ ออกผลไม้สุ่ม/ดอกไม้บนกระถาง
// ==========================================
import { WATERING_SETTINGS } from '../../config/settings.js';
import { playSound } from '../../core/audio.js';
import { GameIcon } from '../../components/GameIcon.js';
import { startInstantGhostDemo, stopInstantGhostDemo, createStarBurst } from '../../core/ui.js';

export function renderWateringLevel(board, config, onComplete) {
    // คลังผลไม้และพืชสำหรับสุ่มในขั้นที่ 4 ตอนโตเต็มที่
    const fruitOptions = [
        { icon: 'apple', name: 'แอปเปิล' },
        { icon: 'orange', name: 'ส้ม' },
        { icon: 'strawberry', name: 'สตรอว์เบอร์รี' },
        { icon: 'watermelon', name: 'แตงโม' },
        { icon: 'banana', name: 'กล้วย' },
        { icon: 'carrot', name: 'แครอท' },
        { icon: 'flower', name: 'ดอกไม้' },
        { icon: 'tree', name: 'ต้นไม้' }
    ];

    // สุ่มผลไม้ไม่ซ้ำในแต่ละรอบ
    const shuffledFruit = [...fruitOptions].sort(() => Math.random() - 0.5);
    const totalPlants = Math.min(WATERING_SETTINGS.totalPlants || 3, fruitOptions.length);
    const plants = [];
    for (let i = 0; i < totalPlants; i++) {
        plants.push({
            id: `pl_${shuffledFruit[i].icon}_${i}`,
            bloomIcon: shuffledFruit[i].icon,
            name: shuffledFruit[i].name
        });
    }

    let currentPlantIdx = 0;
    let progress = 0; // 0.0 to 1.0
    let isHolding = false;
    let isBloomed = false;
    let levelFinished = false;
    let animId = null;
    let ghostCleanup = null;
    let nextTimer = null;

    const circumference = 2 * Math.PI * 58; // r = 58 -> ~364.4

    board.innerHTML = `
        <div id="wateringStage" class="relative w-full h-[440px] sm:h-[470px] bg-gradient-to-b from-sky-100 via-emerald-50 to-amber-50 rounded-3xl overflow-hidden flex flex-col items-center justify-between p-4 border-4 border-emerald-300 shadow-inner select-none">
            <!-- Decorative Clouds -->
            <div class="absolute top-6 left-6 pointer-events-none opacity-80 float-anim">${GameIcon('cloud', 'w-16 h-16')}</div>
            <div class="absolute top-8 right-8 pointer-events-none opacity-80 float-anim" style="animation-delay: 1s;">${GameIcon('cloud', 'w-20 h-20')}</div>

            <!-- Visual Progress Badges -->
            <div id="wateringProgressRow" class="flex items-center gap-3 z-20 bg-white/90 px-5 py-2 rounded-full shadow-md border-2 border-emerald-200"></div>

            <!-- Interactive Watering Can & Plant Pot Scene -->
            <div class="relative flex flex-col items-center justify-center flex-1 w-full max-w-md my-auto">
                <!-- Watering Can Hold Button + Circular Gauge -->
                <div id="wateringCanBtn" class="relative w-32 h-32 flex items-center justify-center cursor-pointer select-none z-20 transition-transform duration-200 hover:scale-105">
                    <!-- Circular Gauge SVG -->
                    <svg width="132" height="132" viewBox="0 0 132 132" class="absolute inset-0 pointer-events-none">
                        <circle cx="66" cy="66" r="58" stroke="#e2e8f0" stroke-width="10" fill="#ffffff" />
                        <circle id="wateringGaugeCircle" cx="66" cy="66" r="58" stroke="#0ea5e9" stroke-width="10" fill="none"
                            stroke-linecap="round"
                            stroke-dasharray="${circumference}"
                            stroke-dashoffset="${circumference}"
                            transform="rotate(-90 66 66)" />
                    </svg>

                    <!-- 3D Claymation Watering Can (icon-watering-can.webp) -->
                    <div id="wateringCanGraphic" class="relative z-10 transition-transform duration-200 flex items-center justify-center pointer-events-none">
                        ${GameIcon('watering-can', 'w-20 h-20')}
                    </div>
                </div>

                <!-- Falling Water Droplets Stream (icon-water-drop.webp) -->
                <div id="waterDropsBox" class="h-14 w-24 flex justify-center items-start gap-2 overflow-hidden opacity-0 transition-opacity pointer-events-none -mt-2 z-20">
                    <div class="water-drop-anim" style="animation-delay: 0s;">${GameIcon('water-drop', 'w-5 h-5')}</div>
                    <div class="water-drop-anim" style="animation-delay: 0.18s;">${GameIcon('water-drop', 'w-6 h-6')}</div>
                    <div class="water-drop-anim" style="animation-delay: 0.35s;">${GameIcon('water-drop', 'w-5 h-5')}</div>
                </div>

                <!-- Plant Growth Stage Area (4 Stages) -->
                <div id="plantStageVisual" class="relative flex items-end justify-center h-40 sm:h-44 -mt-2 z-10 transition-transform duration-200 origin-bottom">
                </div>
            </div>

            <!-- Visual Hold Cue Pill -->
            <div class="flex items-center gap-2 bg-emerald-500 text-white px-4 py-1.5 rounded-full shadow-md z-20">
                ${GameIcon('mouse-device', 'w-5 h-5')}
                ${GameIcon('watering-can', 'w-5 h-5')}
                ${GameIcon('water-drop', 'w-4 h-4 animate-bounce')}
                ${GameIcon('plant-flower', 'w-5 h-5')}
            </div>
        </div>
    `;

    const stage = document.getElementById('wateringStage');
    const progressRow = document.getElementById('wateringProgressRow');
    const canBtn = document.getElementById('wateringCanBtn');
    const canGraphic = document.getElementById('wateringCanGraphic');
    const gaugeCircle = document.getElementById('wateringGaugeCircle');
    const waterDropsBox = document.getElementById('waterDropsBox');
    const plantVisual = document.getElementById('plantStageVisual');

    function updateProgressBadges() {
        if (!progressRow) return;
        progressRow.innerHTML = '';
        for (let i = 0; i < totalPlants; i++) {
            const badge = document.createElement('div');
            const targetFruit = plants[i].bloomIcon;
            if (i < currentPlantIdx) {
                badge.className = 'w-10 h-10 rounded-full bg-emerald-100 border-2 border-emerald-400 flex items-center justify-center p-1 pop-anim';
                badge.innerHTML = GameIcon(targetFruit, 'w-7 h-7');
            } else if (i === currentPlantIdx) {
                badge.className = 'w-10 h-10 rounded-full bg-amber-100 border-2 border-amber-400 flex items-center justify-center p-1 animate-pulse shadow-sm';
                badge.innerHTML = GameIcon(targetFruit, 'w-7 h-7');
            } else {
                badge.className = 'w-10 h-10 rounded-full bg-slate-100 border-2 border-slate-300 flex items-center justify-center opacity-45';
                badge.innerHTML = GameIcon(targetFruit, 'w-6 h-6 grayscale');
            }
            progressRow.appendChild(badge);
        }
    }

    let lastStageKey = '';
    function renderPlantGrowth() {
        const currentPlant = plants[currentPlantIdx];
        const offset = circumference * (1 - Math.max(0, Math.min(1, progress)));
        gaugeCircle.setAttribute('stroke-dashoffset', String(offset));

        if (isBloomed || progress >= 1.0) {
            // ขั้นที่ 4 (โตเต็มที่ / ออกผล): กระถาง icon-plant.webp พร้อมผลไม้สุ่มอยู่บนกระถาง
            const key = `stage4_bloom_${currentPlantIdx}_${currentPlant.bloomIcon}`;
            if (lastStageKey !== key) {
                lastStageKey = key;
                plantVisual.innerHTML = `
                    <div class="relative w-36 h-40 sm:w-40 sm:h-44 flex flex-col items-center justify-end pop-anim">
                        <div class="absolute top-0 z-10 kb-bounce drop-shadow-lg">
                            ${GameIcon(currentPlant.bloomIcon, 'w-20 h-20 sm:w-24 sm:h-24')}
                        </div>
                        <div class="w-36 h-36 sm:w-40 sm:h-40 flex items-end justify-center">
                            ${GameIcon('plant', 'w-36 h-36 sm:w-40 sm:h-40')}
                        </div>
                    </div>
                `;
            }
            plantVisual.style.transform = 'scale(1.05)';
        } else if (progress < 0.25) {
            // ขั้นที่ 1: กระถางธรรมดายังไม่มีต้นไม้ (icon-plant.webp)
            const key = `stage1_empty_${currentPlantIdx}`;
            if (lastStageKey !== key) {
                lastStageKey = key;
                plantVisual.innerHTML = `
                    <div class="w-36 h-36 sm:w-40 sm:h-40 flex items-end justify-center">
                        ${GameIcon('plant', 'w-36 h-36 sm:w-40 sm:h-40')}
                    </div>
                `;
            }
            plantVisual.style.transform = 'scale(1)';
        } else if (progress < 0.60) {
            // ขั้นที่ 2: กำลังโตขั้นที่ 1 ต้นกล้างอกขึ้นมา (icon-plant-sprout.webp)
            const key = `stage2_sprout_${currentPlantIdx}`;
            if (lastStageKey !== key) {
                lastStageKey = key;
                plantVisual.innerHTML = `
                    <div class="w-36 h-36 sm:w-40 sm:h-40 flex items-end justify-center pop-anim">
                        ${GameIcon('plant-sprout', 'w-36 h-36 sm:w-40 sm:h-40')}
                    </div>
                `;
            }
            const sc = 0.95 + ((progress - 0.25) / 0.35) * 0.08;
            plantVisual.style.transform = `scale(${sc.toFixed(2)})`;
        } else {
            // ขั้นที่ 3: กำลังโตขั้นที่ 2 ต้นมีใบดกขึ้น (icon-plant-growing.webp)
            const key = `stage3_growing_${currentPlantIdx}`;
            if (lastStageKey !== key) {
                lastStageKey = key;
                plantVisual.innerHTML = `
                    <div class="w-36 h-36 sm:w-40 sm:h-40 flex items-end justify-center pop-anim">
                        ${GameIcon('plant-growing', 'w-36 h-36 sm:w-40 sm:h-40')}
                    </div>
                `;
            }
            const sc = 0.98 + ((progress - 0.60) / 0.40) * 0.08;
            plantVisual.style.transform = `scale(${sc.toFixed(2)})`;
        }
    }

    function startHold(e) {
        if (e.type === 'mousedown' && e.button !== 0) return;
        if (isBloomed || levelFinished) return;
        isHolding = true;
        // Tilt watering can spout downward to pour
        canGraphic.style.transform = 'rotate(22deg) scale(1.08)';
        waterDropsBox.style.opacity = '1';
        gaugeCircle.setAttribute('stroke', '#10b981');
    }

    function stopHold() {
        if (!isHolding) return;
        isHolding = false;
        canGraphic.style.transform = 'rotate(0deg) scale(1)';
        waterDropsBox.style.opacity = '0';
        if (!isBloomed) {
            gaugeCircle.setAttribute('stroke', '#0ea5e9');
        }
    }

    canBtn.addEventListener('mousedown', startHold);
    canBtn.addEventListener('touchstart', startHold, { passive: true });
    window.addEventListener('mouseup', stopHold);
    window.addEventListener('touchend', stopHold);

    updateProgressBadges();
    renderPlantGrowth();

    let lastTime = performance.now();
    let soundTick = 0;

    function loop(now) {
        if (levelFinished) return;
        const dt = Math.min(0.1, (now - lastTime) / 1000);
        lastTime = now;

        if (!isBloomed) {
            const holdDur = WATERING_SETTINGS.holdDuration || WATERING_SETTINGS.holdDurationSeconds || 2.4;
            const decay = WATERING_SETTINGS.decayRate || 0.25;

            if (isHolding) {
                progress = Math.min(1.0, progress + dt / holdDur);
                soundTick += dt;
                if (soundTick >= 0.45) {
                    soundTick = 0;
                    playSound('point-hit');
                }
                if (progress >= 1.0) {
                    triggerBloom();
                }
            } else if (progress > 0) {
                progress = Math.max(0, progress - dt * decay);
            }
            renderPlantGrowth();
        }

        animId = requestAnimationFrame(loop);
    }

    function triggerBloom() {
        isBloomed = true;
        stopHold();
        renderPlantGrowth();
        playSound('drop-success');
        createStarBurst(plantVisual);

        currentPlantIdx++;
        updateProgressBadges();

        nextTimer = setTimeout(() => {
            if (levelFinished) return;
            if (currentPlantIdx >= totalPlants) {
                levelFinished = true;
                stopInstantGhostDemo();
                if (onComplete) onComplete();
            } else {
                progress = 0;
                isBloomed = false;
                lastStageKey = '';
                gaugeCircle.setAttribute('stroke', '#0ea5e9');
                renderPlantGrowth();
            }
        }, 1250);
    }

    animId = requestAnimationFrame(loop);

    // Instant Ghost Demo at 0s positioned on the Watering Can button
    ghostCleanup = startInstantGhostDemo(stage, {
        type: 'hold',
        getPoints: (w, h) => {
            const sRect = stage.getBoundingClientRect();
            const bRect = canBtn.getBoundingClientRect();
            if (bRect.width > 0) {
                return [{
                    x: bRect.left - sRect.left + bRect.width * 0.5,
                    y: bRect.top - sRect.top + bRect.height * 0.5
                }];
            }
            return [{ x: w * 0.5, y: h * 0.34 }];
        },
        isDone: () => levelFinished
    });

    return function cleanup() {
        levelFinished = true;
        clearTimeout(nextTimer);
        if (animId) cancelAnimationFrame(animId);
        if (ghostCleanup) ghostCleanup();
        stopInstantGhostDemo();
        canBtn.removeEventListener('mousedown', startHold);
        canBtn.removeEventListener('touchstart', startHold);
        window.removeEventListener('mouseup', stopHold);
        window.removeEventListener('touchend', stopHold);
    };
}

export const initLevel = renderWateringLevel;
