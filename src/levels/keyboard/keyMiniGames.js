// ==========================================
// Visual Keyboard Mini-Games (Zero-Text Pre-Literacy Mode)
// 1. Dino Egg Hatch (Any-Key Reaction)
// 2. Rabbit Spacebar Jump (Spacebar Timing)
// 3. Train Apple Collector (4-Way Arrow Keys)
// ==========================================
import { KEY_MINIGAMES_SETTINGS, SYSTEM_SETTINGS } from '../../config/settings.js';
import { playSound } from '../../core/audio.js';
import { GameIcon } from '../../components/GameIcon.js';
import { createStarBurst } from '../../core/ui.js';

let activeMiniGame = null;
let externalKeyHandler = null;
let activeCleanupFn = null;

export function isKeyMiniGameActive() {
    return activeMiniGame !== null;
}

export function handleKeyMiniGameInput(e) {
    if (typeof externalKeyHandler === 'function') {
        externalKeyHandler(e);
    }
}

export function initKeyMiniGame(board, subGame, onComplete) {
    if (typeof activeCleanupFn === 'function') {
        activeCleanupFn();
        activeCleanupFn = null;
    }

    activeMiniGame = subGame;

    if (subGame === 'egg') {
        activeCleanupFn = renderDinoEggGame(board, onComplete);
    } else if (subGame === 'space') {
        activeCleanupFn = renderRabbitSpaceGame(board, onComplete);
    } else if (subGame === 'arrows') {
        activeCleanupFn = renderBeeHoneyGame(board, onComplete);
    }

    return function cleanup() {
        activeMiniGame = null;
        externalKeyHandler = null;
        if (typeof activeCleanupFn === 'function') {
            activeCleanupFn();
            activeCleanupFn = null;
        }
    };
}

// Helper: Finger Tap Hint Element for Virtual Keys using 3D Claymation hand-point
function createFingerHintHTML() {
    return GameIcon('hand-point', 'w-14 h-14 drop-shadow-lg');
}

// ==========================================
// Mini-Game 1: ฟักไข่ไดโนเสาร์ (Any-Key Reaction)
// ขั้นที่ 1: icon-dino-egg-1.webp
// ขั้นที่ 2: icon-dino-egg-2.webp
// ขั้นที่ 3: icon-dino-egg-3.webp
// ขั้นที่ 4: สุ่มสัตว์น่ารัก (dino-egg-4, pig, dog, chicken, cat, fish)
// ==========================================
function renderDinoEggGame(board, onComplete) {
    document.getElementById('levelTitle').innerText = 'มินิเกม 1: ฟักไข่หรรษา';
    document.getElementById('levelDesc').innerText = 'กดปุ่มใดก็ได้บนคีย์บอร์ด 3 ครั้งเพื่อฟักไข่นะ!';

    const totalEggs = KEY_MINIGAMES_SETTINGS.totalEggs || KEY_MINIGAMES_SETTINGS.eggTotalRounds || 3;
    const hitsNeeded = KEY_MINIGAMES_SETTINGS.eggHitsRequired || KEY_MINIGAMES_SETTINGS.eggPressesRequired || 3;

    // คลังสัตว์สำหรับสุ่มในขั้นที่ 4 (รวมลูกไดโนเสาร์ dino-egg-4, หมู, หมา, ไก่, แมว, ปลา)
    const hatchPool = [
        { icon: 'dino-egg-4', sound: 'win' },
        { icon: 'pig', sound: 'drop-success' },
        { icon: 'dog', sound: 'dog' },
        { icon: 'chicken', sound: 'chicken' },
        { icon: 'cat', sound: 'cat' },
        { icon: 'fish', sound: 'drop-success' }
    ];

    // สุ่มลำดับสัตว์ไม่ให้ซ้ำกันในแต่ละรอบ (ให้มี dino-egg-4 ผสมกับสัตว์อื่นอย่างสนุกสนาน)
    const shuffledBabies = [...hatchPool].sort(() => Math.random() - 0.5);
    // บังคับให้มี dino-egg-4 อย่างน้อย 1 ฟองในเซ็ตเสมอ
    if (!shuffledBabies.slice(0, totalEggs).some(b => b.icon === 'dino-egg-4')) {
        shuffledBabies[0] = { icon: 'dino-egg-4', sound: 'win' };
    }

    let currentEggIdx = 0;
    let currentHits = 0;
    let isHatching = false;
    let finished = false;
    let nextTimer = null;
    let idleTimer = null;

    board.innerHTML = `
        <div class="relative w-full h-[440px] sm:h-[470px] bg-gradient-to-b from-amber-50 via-emerald-50 to-lime-100 rounded-3xl overflow-hidden flex flex-col items-center justify-between p-4 border-4 border-emerald-300 shadow-inner select-none">
            <!-- Decorative Clouds -->
            <div class="absolute top-6 left-6 pointer-events-none opacity-80 float-anim">${GameIcon('cloud', 'w-16 h-16')}</div>
            <div class="absolute top-8 right-8 pointer-events-none opacity-80 float-anim" style="animation-delay: 1s;">${GameIcon('cloud', 'w-20 h-20')}</div>

            <!-- Egg Progress Badges -->
            <div id="eggProgressRow" class="flex items-center gap-3 bg-white/90 px-5 py-2 rounded-full shadow-md border-2 border-emerald-200 z-20"></div>

            <!-- Nest & Dinosaur Egg Area -->
            <div class="relative flex flex-col items-center justify-center my-auto">
                <!-- 3-Tap Crack Dots -->
                <div id="eggHitDots" class="flex items-center gap-2.5 mb-2"></div>

                <div id="dinoEggContainer" class="relative w-48 h-52 flex items-center justify-center z-20"></div>

                <!-- Straw Nest -->
                <svg width="210" height="54" viewBox="0 0 210 54" fill="none" xmlns="http://www.w3.org/2000/svg" class="-mt-6 z-10 drop-shadow">
                    <ellipse cx="105" cy="28" rx="92" ry="20" fill="#D97706" stroke="#92400E" stroke-width="3"/>
                    <ellipse cx="105" cy="22" rx="78" ry="13" fill="#F59E0B"/>
                </svg>
            </div>

            <!-- Interactive Any-Key Visual Pad (With 0s Instant Ghost Hand) -->
            <div class="relative flex flex-col items-center z-20">
                <div id="eggGhostHand" class="finger-pointer-anim absolute -bottom-5 -left-8 -translate-x-1/2 pointer-events-none z-30 transition-opacity duration-200">
                    ${createFingerHintHTML()}
                </div>
                <button id="anyKeyPadBtn" class="bg-white hover:bg-amber-50 active:scale-95 border-4 border-amber-400 rounded-2xl px-8 py-3 shadow-xl flex items-center gap-3 transition cursor-pointer">
                    ${GameIcon('keyboard', 'w-9 h-9')}
                </button>
            </div>
        </div>
    `;

    const progressRow = document.getElementById('eggProgressRow');
    const hitDots = document.getElementById('eggHitDots');
    const eggContainer = document.getElementById('dinoEggContainer');
    const anyKeyBtn = document.getElementById('anyKeyPadBtn');
    const ghostHand = document.getElementById('eggGhostHand');

    function resetIdleGhost() {
        if (ghostHand) ghostHand.style.opacity = '0';
        clearTimeout(idleTimer);
        idleTimer = setTimeout(() => {
            if (!finished && ghostHand) ghostHand.style.opacity = '1';
        }, SYSTEM_SETTINGS.ghostDemoIdleDelay || SYSTEM_SETTINGS.ghostIdleTimeout || 5000);
    }

    function updateEggProgress() {
        if (!progressRow) return;
        progressRow.innerHTML = '';
        for (let i = 0; i < totalEggs; i++) {
            const b = document.createElement('div');
            if (i < currentEggIdx) {
                b.className = 'w-10 h-10 rounded-full bg-emerald-100 border-2 border-emerald-400 flex items-center justify-center p-1 pop-anim';
                b.innerHTML = GameIcon(shuffledBabies[i % shuffledBabies.length].icon, 'w-7 h-7');
            } else if (i === currentEggIdx) {
                b.className = 'w-10 h-10 rounded-full bg-amber-100 border-2 border-amber-400 flex items-center justify-center p-1 animate-pulse';
                b.innerHTML = GameIcon('dino-egg-1', 'w-7 h-7');
            } else {
                b.className = 'w-10 h-10 rounded-full bg-slate-100 border-2 border-slate-300 flex items-center justify-center opacity-45';
                b.innerHTML = GameIcon('dino-egg-1', 'w-6 h-6 grayscale');
            }
            progressRow.appendChild(b);
        }
    }

    function renderEggState() {
        const baby = shuffledBabies[currentEggIdx % shuffledBabies.length];

        // Update 3 hit dots
        if (hitDots) {
            hitDots.innerHTML = '';
            for (let i = 0; i < hitsNeeded; i++) {
                const d = document.createElement('span');
                d.className = `w-4 h-4 rounded-full border-2 transition-all ${
                    i < currentHits
                        ? 'bg-amber-400 border-amber-600 scale-125'
                        : 'bg-white border-slate-300'
                }`;
                hitDots.appendChild(d);
            }
        }

        if (currentHits >= hitsNeeded) {
            // ขั้นที่ 4: ฟักออกเป็นสัตว์แบบสุ่ม (dino-egg-4, หมู, หมา, ไก่, แมว, ปลา)
            eggContainer.innerHTML = `
                <div class="flex flex-col items-center justify-center pop-anim z-20">
                    <div class="kb-bounce drop-shadow-xl">${GameIcon(baby.icon, 'w-36 h-36 sm:w-40 sm:h-40')}</div>
                </div>
            `;
            return;
        }

        // ขั้นที่ 1..3 ใช้ไอคอนไข่จริงจาก public/assets/icons/
        // currentHits === 0 -> dino-egg-1 (ไข่เต็มใบ)
        // currentHits === 1 -> dino-egg-2 (เริ่มร้าว)
        // currentHits >= 2  -> dino-egg-3 (ร้าวมาก เห็นตากะพริบข้างใน)
        const stageEggIcons = ['dino-egg-1', 'dino-egg-2', 'dino-egg-3'];
        const eggIconName = stageEggIcons[Math.min(currentHits, 2)];

        eggContainer.innerHTML = `
            <div class="flex items-center justify-center drop-shadow-xl">
                ${GameIcon(eggIconName, 'w-40 h-44 sm:w-44 sm:h-48')}
            </div>
        `;
    }

    function triggerEggTap() {
        if (isHatching || finished) return;
        resetIdleGhost();

        currentHits++;
        eggContainer.classList.remove('egg-wobble-anim');
        void eggContainer.offsetWidth;
        eggContainer.classList.add('egg-wobble-anim');

        anyKeyBtn.classList.add('scale-95', 'bg-amber-100');
        setTimeout(() => anyKeyBtn.classList.remove('scale-95', 'bg-amber-100'), 140);

        renderEggState();

        if (currentHits < hitsNeeded) {
            playSound('correct-key');
        } else {
            // Egg hatched!
            isHatching = true;
            const baby = shuffledBabies[currentEggIdx % shuffledBabies.length];
            playSound(baby.sound || 'win');
            createStarBurst(eggContainer);

            currentEggIdx++;
            updateEggProgress();

            nextTimer = setTimeout(() => {
                if (finished) return;
                if (currentEggIdx >= totalEggs) {
                    finished = true;
                    if (onComplete) onComplete();
                } else {
                    currentHits = 0;
                    isHatching = false;
                    renderEggState();
                }
            }, 1350);
        }
    }

    anyKeyBtn.addEventListener('click', triggerEggTap);
    externalKeyHandler = (e) => {
        if (e.repeat) return;
        triggerEggTap();
    };

    updateEggProgress();
    renderEggState();

    return function cleanup() {
        finished = true;
        clearTimeout(nextTimer);
        clearTimeout(idleTimer);
        anyKeyBtn.removeEventListener('click', triggerEggTap);
    };
}

// ==========================================
// Mini-Game 2: กระต่ายกระโดดข้ามก้อนหิน (Spacebar Jump)
// ตอนกระโดดใช้ bunny-jump.webp, ตอนวิ่งบนพื้นใช้ icon-rabbit.webp
// สิ่งกีดขวางใช้ icon-rock.webp และแอ่งน้ำ water.webp
// ==========================================
function renderRabbitSpaceGame(board, onComplete) {
    document.getElementById('levelTitle').innerText = 'มินิเกม 2: กระต่ายกระโดด (Spacebar)';
    document.getElementById('levelDesc').innerText = 'กดปุ่มยาว Spacebar เมื่อก้อนหินเข้ามาใกล้เพื่อกระโดดข้ามนะ!';

    const totalJumpsNeeded = KEY_MINIGAMES_SETTINGS.totalJumpsRequired || KEY_MINIGAMES_SETTINGS.rabbitTotalJumps || 5;
    let jumpsCompleted = 0;
    let isJumping = false;
    let jumpTimer = null;
    let animId = null;
    let finished = false;
    let obstacleType = 'rock'; // 'rock' | 'puddle'

    board.innerHTML = `
        <div class="relative w-full h-[440px] sm:h-[470px] bg-gradient-to-b from-sky-200 via-sky-100 to-emerald-100 rounded-3xl overflow-hidden flex flex-col items-center justify-between p-4 border-4 border-indigo-300 shadow-inner select-none">
            <!-- Jump Progress Stars -->
            <div id="spaceProgressRow" class="flex items-center gap-2.5 bg-white/90 px-5 py-2 rounded-full shadow-md border-2 border-indigo-200 z-20"></div>

            <!-- Side-Scrolling Meadow Track -->
            <div id="rabbitTrackArea" class="relative w-full max-w-2xl h-56 my-auto overflow-hidden rounded-3xl bg-gradient-to-b from-sky-100/70 to-emerald-200 border-4 border-white shadow-lg">
                <!-- Dynamic Moving Clouds Layer -->
                <div id="rabbitCloudsLayer" class="absolute inset-0 pointer-events-none overflow-hidden z-0"></div>

                <!-- Ground Path -->
                <div class="absolute bottom-0 inset-x-0 h-14 bg-amber-200 border-t-4 border-emerald-400 z-10"></div>

                <!-- Rabbit Hero (Switches to bunny-jump.webp when jumping) -->
                <div id="jumpingRabbit" class="absolute left-14 sm:left-20 bottom-11 w-24 h-24 flex items-center justify-center transition-transform duration-300 z-20">
                    ${GameIcon('rabbit', 'w-20 h-20')}
                </div>

                <!-- Moving Rock / Puddle Obstacle -->
                <div id="rollingRock" class="absolute bottom-11 w-16 h-16 flex items-center justify-center z-20" style="left: 520px;">
                    ${GameIcon('rock', 'w-16 h-16')}
                </div>
            </div>

            <!-- Giant Glowing Spacebar Button + Instant Ghost Hand -->
            <div class="relative flex flex-col items-center z-20 mb-1">
                <div id="spaceGhostHand" class="finger-pointer-anim absolute -bottom-5 left-5 -translate-x-1/2 pointer-events-none z-30 opacity-100 transition-opacity">
                    ${createFingerHintHTML()}
                </div>
                <button id="giantSpaceBtn" class="w-64 sm:w-80 h-14 bg-amber-300 hover:bg-amber-400 active:translate-y-1 border-4 border-amber-500 border-b-8 rounded-2xl shadow-xl flex items-center justify-center gap-3 font-black text-amber-950 text-lg transition cursor-pointer">
                    <span>SPACEBAR</span>
                    <i class="fa-solid fa-arrow-up animate-bounce"></i>
                </button>
            </div>
        </div>
    `;

    const progressRow = document.getElementById('spaceProgressRow');
    const trackArea = document.getElementById('rabbitTrackArea');
    const cloudsLayer = document.getElementById('rabbitCloudsLayer');
    const rabbitElem = document.getElementById('jumpingRabbit');
    const rockElem = document.getElementById('rollingRock');
    const spaceBtn = document.getElementById('giantSpaceBtn');
    const ghostHand = document.getElementById('spaceGhostHand');

    let rockX = 540;
    let passedCurrentRock = false;

    // Moving Clouds with randomized altitude & parallax drift
    let activeClouds = [];

    function spawnCloud(startX = null) {
        if (!cloudsLayer || finished) return;
        const trackW = trackArea.clientWidth || 600;
        const x = startX !== null ? startX : (trackW + Math.random() * 50 + 10);
        // Random altitude y: between 6px and 62px
        const y = Math.floor(Math.random() * 56) + 6;
        const cloudTypes = [
            { iconClass: 'w-12 h-12', opacity: '0.75', speed: 0.7 },
            { iconClass: 'w-16 h-16', opacity: '0.85', speed: 0.95 },
            { iconClass: 'w-20 h-20', opacity: '0.90', speed: 1.15 }
        ];
        const chosen = cloudTypes[Math.floor(Math.random() * cloudTypes.length)];

        const cloudElem = document.createElement('div');
        cloudElem.className = 'absolute top-0 left-0 pointer-events-none transition-none will-change-transform';
        cloudElem.style.opacity = chosen.opacity;
        cloudElem.style.transform = `translate3d(${x}px, ${y}px, 0)`;
        cloudElem.innerHTML = GameIcon('cloud', chosen.iconClass);
        cloudsLayer.appendChild(cloudElem);

        activeClouds.push({
            elem: cloudElem,
            x: x,
            y: y,
            speed: chosen.speed
        });
    }

    function initClouds() {
        const trackW = trackArea.clientWidth || 600;
        spawnCloud(trackW * 0.12);
        spawnCloud(trackW * 0.48);
        spawnCloud(trackW * 0.82);
    }

    function updateProgressUI() {
        if (!progressRow) return;
        progressRow.innerHTML = '';
        for (let i = 0; i < totalJumpsNeeded; i++) {
            const s = document.createElement('div');
            if (i < jumpsCompleted) {
                s.className = 'w-9 h-9 rounded-full bg-emerald-100 border-2 border-emerald-400 flex items-center justify-center p-1 pop-anim';
                s.innerHTML = GameIcon('star-gold', 'w-6 h-6');
            } else {
                s.className = 'w-9 h-9 rounded-full bg-slate-100 border-2 border-slate-300 flex items-center justify-center opacity-45';
                s.innerHTML = GameIcon('star-gold', 'w-5 h-5 grayscale');
            }
            progressRow.appendChild(s);
        }
    }

    function updateObstacleGraphic() {
        obstacleType = jumpsCompleted % 2 === 1 ? 'puddle' : 'rock';
        if (rockElem) {
            rockElem.innerHTML = GameIcon(obstacleType, 'w-16 h-16');
        }
    }

    function triggerJump() {
        if (isJumping || finished) return;
        isJumping = true;
        playSound('rabbit');

        // เปลี่ยนรูปเป็นกระต่ายกระโดด bunny-jump.webp
        rabbitElem.innerHTML = GameIcon('bunny-jump', 'w-24 h-24');
        rabbitElem.style.transform = 'translateY(-95px) scale(1.08)';
        spaceBtn.classList.add('scale-95', 'bg-emerald-300');
        setTimeout(() => spaceBtn.classList.remove('scale-95', 'bg-emerald-300'), 180);

        const jumpDur = KEY_MINIGAMES_SETTINGS.jumpDuration || 680;
        jumpTimer = setTimeout(() => {
            if (finished) return;
            rabbitElem.style.transform = 'translateY(0px) scale(1)';
            rabbitElem.innerHTML = GameIcon('rabbit', 'w-20 h-20');
            setTimeout(() => {
                isJumping = false;
            }, 120);
        }, jumpDur);
    }

    spaceBtn.addEventListener('click', triggerJump);
    externalKeyHandler = (e) => {
        if (e.code === 'Space' || e.key === ' ' || e.code === 'ArrowUp') {
            e.preventDefault();
            triggerJump();
        }
    };

    updateProgressUI();
    updateObstacleGraphic();
    initClouds();

    function loop() {
        if (finished) return;
        const trackW = trackArea.clientWidth || 600;
        const rabbitX = 76;

        // Animate drifting clouds (parallax background)
        for (let i = activeClouds.length - 1; i >= 0; i--) {
            const cloud = activeClouds[i];
            cloud.x -= cloud.speed;
            cloud.elem.style.transform = `translate3d(${cloud.x.toFixed(1)}px, ${cloud.y}px, 0)`;

            // Remove cloud when it exits screen left to free DOM & memory
            if (cloud.x < -80) {
                cloud.elem.remove();
                activeClouds.splice(i, 1);
            }
        }

        // Spawn next cloud when rightmost cloud moves sufficiently into screen
        const rightmostX = activeClouds.length > 0
            ? activeClouds.reduce((max, c) => Math.max(max, c.x), -999)
            : -999;
        if (rightmostX < trackW - 140 && Math.random() < 0.035) {
            spawnCloud();
        }

        // Distance from rock to rabbit
        const dist = rockX - rabbitX;

        // Assistive Slow-Motion when rock enters jump window (80px..195px ahead) and child hasn't jumped yet
        let speed = KEY_MINIGAMES_SETTINGS.rabbitSpeed || 2.4;
        if (dist > 55 && dist < 190 && !isJumping) {
            speed *= (KEY_MINIGAMES_SETTINGS.slowMoFactor || KEY_MINIGAMES_SETTINGS.rabbitSlowMoFactor || 0.25);
            spaceBtn.classList.add('spacebar-glow-anim');
            if (ghostHand) ghostHand.style.opacity = '1';
        } else {
            spaceBtn.classList.remove('spacebar-glow-anim');
            if (ghostHand && jumpsCompleted > 0) ghostHand.style.opacity = '0';
        }

        rockX -= speed;

        // Check collision or successful jump pass
        if (rockX < rabbitX + 36 && rockX > rabbitX - 24 && !passedCurrentRock) {
            if (isJumping) {
                // Successful jump over the obstacle!
                passedCurrentRock = true;
                jumpsCompleted++;
                updateProgressUI();
                playSound('drop-success');
                createStarBurst(rabbitElem);

                if (jumpsCompleted >= totalJumpsNeeded) {
                    finished = true;
                    setTimeout(() => {
                        if (onComplete) onComplete();
                    }, 750);
                    return;
                }
            } else {
                // Gentle bump: reset obstacle ahead smoothly without penalty
                playSound('wrong-key');
                rockX = trackW + 40;
                passedCurrentRock = false;
            }
        }

        if (rockX < -60) {
            rockX = trackW + 40;
            passedCurrentRock = false;
            updateObstacleGraphic();
        }

        rockElem.style.left = `${rockX}px`;
        animId = requestAnimationFrame(loop);
    }

    animId = requestAnimationFrame(loop);

    return function cleanup() {
        finished = true;
        clearTimeout(jumpTimer);
        if (animId) cancelAnimationFrame(animId);
        spaceBtn.removeEventListener('click', triggerJump);
        activeClouds.forEach(c => {
            if (c.elem) c.elem.remove();
        });
        activeClouds = [];
    };
}

// ==========================================
// Mini-Game 3: ผึ้งน้อยเก็บน้ำผึ้ง (Arrow Keys 4 ทิศ)
// ใช้ icon-bee.webp และ icon-honey.webp
// ==========================================
function renderBeeHoneyGame(board, onComplete) {
    document.getElementById('levelTitle').innerText = 'มินิเกม 3: ผึ้งน้อยเก็บน้ำผึ้ง';
    document.getElementById('levelDesc').innerText = 'กดปุ่มลูกศรพาน้องผึ้งบินไปเก็บโถน้ำผึ้งให้ครบนะ!';

    const gridSize = KEY_MINIGAMES_SETTINGS.gridSize || 4;
    const totalHoneyNeeded = KEY_MINIGAMES_SETTINGS.totalHoneyRequired || KEY_MINIGAMES_SETTINGS.totalApplesRequired || 5;

    let honeyCollected = 0;
    let beePos = { r: Math.floor(gridSize / 2), c: Math.floor(gridSize / 2) };
    let honeyPos = { r: 0, c: 0 };
    let finished = false;
    let idleTimer = null;

    board.innerHTML = `
        <div class="relative w-full h-[450px] sm:h-[480px] bg-gradient-to-b from-amber-50 via-emerald-50 to-sky-50 rounded-3xl overflow-hidden flex flex-col items-center justify-between p-3 sm:p-4 border-4 border-amber-300 shadow-inner select-none">
            <!-- Honey Progress Row -->
            <div id="trainProgressRow" class="flex items-center gap-2.5 bg-white/90 px-5 py-1.5 rounded-full shadow-md border-2 border-amber-200 z-20"></div>

            <!-- Main Play Area: Meadow Grid + Big Direction Compass + Virtual Arrow Keypad -->
            <div class="flex flex-col sm:flex-row items-center justify-center gap-6 sm:gap-10 my-auto w-full">
                <!-- Honeycomb Meadow Grid -->
                <div id="trainGridBoard" class="grid ${gridSize === 4 ? 'grid-cols-4' : 'grid-cols-3'} gap-2 bg-emerald-200 p-3 rounded-3xl border-4 border-emerald-400 shadow-xl"></div>

                <!-- Direction Cue + Virtual 4-Arrow Keypad -->
                <div class="flex flex-col items-center gap-3">
                    <!-- Giant Direction Indicator (Guidance Compass) -->
                    <div id="bigDirectionBox" class="w-20 h-20 rounded-3xl bg-white border-4 border-amber-400 shadow-lg flex items-center justify-center text-4xl text-amber-500 animate-bounce" title="ทิศทางของน้ำผึ้ง">
                        <i class="fa-solid fa-arrow-up"></i>
                    </div>

                    <!-- Virtual Arrow Keys Pad -->
                    <div class="relative grid grid-cols-3 gap-1.5 bg-slate-200/90 p-2.5 rounded-2xl border-2 border-slate-300 shadow-md">
                        <div></div>
                        <button data-dir="ArrowUp" class="arrow-vk w-14 h-12 rounded-xl bg-white border-2 border-b-4 border-slate-300 flex items-center justify-center text-xl text-slate-700 font-black transition active:scale-90 relative">
                            <i class="fa-solid fa-caret-up"></i>
                        </button>
                        <div></div>

                        <button data-dir="ArrowLeft" class="arrow-vk w-14 h-12 rounded-xl bg-white border-2 border-b-4 border-slate-300 flex items-center justify-center text-xl text-slate-700 font-black transition active:scale-90 relative">
                            <i class="fa-solid fa-caret-left"></i>
                        </button>
                        <button data-dir="ArrowDown" class="arrow-vk w-14 h-12 rounded-xl bg-white border-2 border-b-4 border-slate-300 flex items-center justify-center text-xl text-slate-700 font-black transition active:scale-90 relative">
                            <i class="fa-solid fa-caret-down"></i>
                        </button>
                        <button data-dir="ArrowRight" class="arrow-vk w-14 h-12 rounded-xl bg-white border-2 border-b-4 border-slate-300 flex items-center justify-center text-xl text-slate-700 font-black transition active:scale-90 relative">
                            <i class="fa-solid fa-caret-right"></i>
                        </button>
                    </div>
                </div>
            </div>
        </div>
    `;

    const progressRow = document.getElementById('trainProgressRow');
    const gridBoard = document.getElementById('trainGridBoard');
    const bigDirBox = document.getElementById('bigDirectionBox');
    const arrowButtons = Array.from(board.querySelectorAll('.arrow-vk'));

    function updateProgressUI() {
        if (!progressRow) return;
        progressRow.innerHTML = '';
        for (let i = 0; i < totalHoneyNeeded; i++) {
            const d = document.createElement('div');
            if (i < honeyCollected) {
                d.className = 'w-9 h-9 rounded-full bg-amber-100 border-2 border-amber-400 flex items-center justify-center p-1 pop-anim';
                d.innerHTML = GameIcon('honey', 'w-6 h-6');
            } else {
                d.className = 'w-9 h-9 rounded-full bg-slate-100 border-2 border-slate-300 flex items-center justify-center opacity-45';
                d.innerHTML = GameIcon('honey', 'w-5 h-5 grayscale');
            }
            progressRow.appendChild(d);
        }
    }

    // น้ำผึ้งเกิดไกลตัวผึ้งประมาณนึง ห้ามชิดกับผึ้ง (Manhattan distance >= 2)
    function spawnNewHoney() {
        const minDistance = KEY_MINIGAMES_SETTINGS.minHoneyDistance || 2;
        const candidates = [];
        for (let r = 0; r < gridSize; r++) {
            for (let c = 0; c < gridSize; c++) {
                if (r === beePos.r && c === beePos.c) continue;
                const manhattan = Math.abs(r - beePos.r) + Math.abs(c - beePos.c);
                if (manhattan >= minDistance) {
                    candidates.push({ r, c, dist: manhattan });
                }
            }
        }

        // Fallback หากตารางแคบจนไม่มีช่องห่าง >= minDistance
        if (candidates.length === 0) {
            for (let r = 0; r < gridSize; r++) {
                for (let c = 0; c < gridSize; c++) {
                    if (r !== beePos.r || c !== beePos.c) {
                        candidates.push({ r, c, dist: Math.abs(r - beePos.r) + Math.abs(c - beePos.c) });
                    }
                }
            }
        }

        // คัดเลือกช่องที่อยู่ไกลตัวผึ้งประมาณนึง (ระยะทางไกลสุดในกลุ่ม)
        const maxDist = Math.max(...candidates.map(x => x.dist));
        const farPool = candidates.filter(x => x.dist >= Math.min(3, maxDist));
        const finalPool = farPool.length > 0 ? farPool : candidates;

        const pick = finalPool[Math.floor(Math.random() * finalPool.length)] || { r: 0, c: 0 };
        honeyPos = { r: pick.r, c: pick.c };
    }

    function getSuggestedArrow() {
        const dr = honeyPos.r - beePos.r;
        const dc = honeyPos.c - beePos.c;
        if (Math.abs(dr) >= Math.abs(dc)) {
            return dr < 0 ? 'ArrowUp' : 'ArrowDown';
        } else {
            return dc < 0 ? 'ArrowLeft' : 'ArrowRight';
        }
    }

    function renderGridAndHints(showHand = true) {
        gridBoard.innerHTML = '';
        const cellSizeClass = gridSize >= 4 
            ? 'w-16 h-16 sm:w-20 sm:h-20' 
            : 'w-20 h-20 sm:w-24 sm:h-24';
        const beeIconClass = gridSize >= 4 ? 'w-12 h-12 sm:w-16 sm:h-16' : 'w-16 h-16 sm:w-18 sm:h-18';
        const honeyIconClass = gridSize >= 4 ? 'w-12 h-12 sm:w-14 sm:h-14' : 'w-14 h-14 sm:w-16 sm:h-16';

        for (let r = 0; r < gridSize; r++) {
            for (let c = 0; c < gridSize; c++) {
                const cell = document.createElement('div');
                cell.className = `${cellSizeClass} rounded-2xl bg-amber-50/95 border-2 border-amber-300 flex items-center justify-center relative shadow-inner`;

                if (r === beePos.r && c === beePos.c) {
                    const beeWrap = document.createElement('div');
                    beeWrap.className = 'z-10 pop-anim flex items-center justify-center';
                    beeWrap.innerHTML = GameIcon('bee', beeIconClass);
                    cell.appendChild(beeWrap);
                } else if (r === honeyPos.r && c === honeyPos.c) {
                    const honeyWrap = document.createElement('div');
                    honeyWrap.className = 'z-10 kb-bounce drop-shadow-md flex items-center justify-center';
                    honeyWrap.innerHTML = GameIcon('honey', honeyIconClass);
                    cell.appendChild(honeyWrap);
                }

                gridBoard.appendChild(cell);
            }
        }

        const suggestedArrow = getSuggestedArrow();
        const iconMap = {
            ArrowUp: 'fa-arrow-up',
            ArrowDown: 'fa-arrow-down',
            ArrowLeft: 'fa-arrow-left',
            ArrowRight: 'fa-arrow-right'
        };

        bigDirBox.innerHTML = `<i class="fa-solid ${iconMap[suggestedArrow]}"></i>`;

        // แสดงเข็มทิศและนิ้วแนะนำทิศทางไปยังน้ำผึ้ง
        arrowButtons.forEach(btn => {
            const oldFinger = btn.querySelector('.mini-arrow-finger');
            if (oldFinger) oldFinger.remove();

            if (btn.dataset.dir === suggestedArrow) {
                btn.classList.add('key-hint');
                if (showHand) {
                    const f = document.createElement('div');
                    f.className = 'mini-arrow-finger finger-pointer-anim absolute -top-11 left-1/2 -translate-x-1/2 pointer-events-none z-30';
                    f.innerHTML = createFingerHintHTML();
                    btn.appendChild(f);
                }
            } else {
                btn.classList.remove('key-hint');
            }
        });
    }

    // อนุญาตให้บินเดินทางไหนก็ได้ ไม่จำกัดทิศทาง
    function handleArrowMove(code) {
        if (finished) return;
        clearTimeout(idleTimer);

        let moved = false;
        if (code === 'ArrowUp') {
            if (beePos.r > 0) { beePos.r--; moved = true; }
        } else if (code === 'ArrowDown') {
            if (beePos.r < gridSize - 1) { beePos.r++; moved = true; }
        } else if (code === 'ArrowLeft') {
            if (beePos.c > 0) { beePos.c--; moved = true; }
        } else if (code === 'ArrowRight') {
            if (beePos.c < gridSize - 1) { beePos.c++; moved = true; }
        }

        // หากชนขอบตาราง ให้ส่งเสียงเตือนเบาๆ
        if (!moved) {
            playSound('wrong-key');
            gridBoard.classList.add('animate-shake');
            setTimeout(() => gridBoard.classList.remove('animate-shake'), 250);
            return;
        }

        // ตรวจสอบว่าบินมาเก็บน้ำผึ้งได้สำเร็จหรือไม่
        if (beePos.r === honeyPos.r && beePos.c === honeyPos.c) {
            honeyCollected++;
            updateProgressUI();
            playSound('drop-success');
            createStarBurst(gridBoard);

            if (honeyCollected >= totalHoneyNeeded) {
                finished = true;
                renderGridAndHints(false);
                setTimeout(() => {
                    if (onComplete) onComplete();
                }, 700);
                return;
            }
            spawnNewHoney();
        } else {
            playSound('correct-key');
        }

        renderGridAndHints(false);
        idleTimer = setTimeout(() => {
            if (!finished) renderGridAndHints(true);
        }, SYSTEM_SETTINGS.ghostDemoIdleDelay || SYSTEM_SETTINGS.ghostIdleTimeout || 5000);
    }

    arrowButtons.forEach(btn => {
        btn.onclick = () => handleArrowMove(btn.dataset.dir);
    });

    externalKeyHandler = (e) => {
        if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(e.code)) {
            e.preventDefault();
            handleArrowMove(e.code);
        }
    };

    updateProgressUI();
    spawnNewHoney();
    renderGridAndHints(true);

    return function cleanup() {
        finished = true;
        clearTimeout(idleTimer);
    };
}

export const renderTrainArrowsGame = renderBeeHoneyGame;
