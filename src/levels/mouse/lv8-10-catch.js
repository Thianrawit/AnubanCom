// ==========================================
// Mouse Levels 8, 9, 10: Catch Me Animal Game 🐭
// ==========================================
import { CATCH_ME_CONFIG } from '../../config/gameConfig.js';
import { playSound } from '../../core/audio.js';
import { GameIcon } from '../../components/GameIcon.js';

let catchMeActive = false;
let catchAnimId = null;

export function renderCatchMeLevel(board, config, onComplete) {
    stopCatchMeGame();

    let matchedCount = 0;
    catchMeActive = true;
    let catchAnimalsList = [];

    const totalTargets = config.animals.reduce((sum, a) => sum + a.count, 0);

    const animalStats = {};
    config.animals.forEach(a => {
        animalStats[a.type] = {
            name: a.name,
            icon: a.icon,
            total: a.count,
            remaining: a.count
        };
    });

    board.innerHTML = `
        <div id="catchMePlayArea" class="relative w-full h-[460px] sm:h-[500px] bg-gradient-to-b from-sky-100 via-emerald-50 to-amber-50 rounded-3xl overflow-hidden select-none catcher-cursor shadow-2xl border-4 border-emerald-300">
            <div class="absolute top-3 left-3 right-3 flex flex-wrap justify-between items-center z-30 pointer-events-none gap-2">
                <div id="catchHudBadges" class="flex flex-wrap gap-2"></div>
                <div class="bg-rose-500 text-white font-black text-xs sm:text-sm px-4 py-1.5 rounded-full shadow-lg">
                    เหลืออีก: <span id="catchRemainingTotal">${totalTargets}</span> ตัว
                </div>
            </div>

            <div id="catchAnimalsContainer" class="absolute inset-0 z-10"></div>
        </div>
    `;

    const updateCatchHUD = () => {
        const hudContainer = document.getElementById('catchHudBadges');
        if (!hudContainer) return;
        hudContainer.innerHTML = '';

        Object.keys(animalStats).forEach(type => {
            const info = animalStats[type];
            const isAllCaught = info.remaining === 0;

            const badge = document.createElement('div');
            badge.className = `flex items-center gap-1.5 px-3 py-1 rounded-full text-xs sm:text-sm font-extrabold shadow-md border ${
                isAllCaught 
                    ? 'bg-slate-300 text-slate-500 border-slate-400 grayscale' 
                    : 'bg-white text-slate-800 border-emerald-400'
            }`;
            badge.innerHTML = `
                <span class="${isAllCaught ? 'filter grayscale brightness-50' : ''}">${GameIcon(info.icon, 'w-6 h-6')}</span>
                <span>${info.name}:</span>
                <span class="font-black ${isAllCaught ? 'text-slate-500' : 'text-emerald-600'}">${info.remaining} ตัว</span>
            `;
            hudContainer.appendChild(badge);
        });

        const totalElem = document.getElementById('catchRemainingTotal');
        if (totalElem) totalElem.innerText = `${totalTargets - matchedCount}`;
    };

    updateCatchHUD();

    const playArea = document.getElementById('catchMePlayArea');
    const container = document.getElementById('catchAnimalsContainer');

    catchAnimalsList = [];
    const areaWidth = playArea.clientWidth;
    const areaHeight = playArea.clientHeight;

    let animalIdCounter = 0;
    config.animals.forEach(group => {
        for (let i = 0; i < group.count; i++) {
            const aId = `animal_${animalIdCounter++}`;
            const elem = document.createElement('div');
            elem.className = "absolute flex justify-center items-center select-none cursor-pointer transition-transform duration-75 active:scale-90";
            elem.style.transform = `translate(-50%, -50%)`;
            elem.innerHTML = GameIcon(group.icon, 'w-14 h-14 sm:w-16 sm:h-16 object-contain pointer-events-none drop-shadow-md');

            container.appendChild(elem);

            const angle = Math.random() * Math.PI * 2;
            const speed = group.speed * (0.9 + Math.random() * 0.4);

            const animalObj = {
                id: aId,
                type: group.type,
                name: group.name,
                icon: group.icon,
                sound: group.sound,
                elem: elem,
                x: 60 + Math.random() * (areaWidth - 120),
                y: 60 + Math.random() * (areaHeight - 120),
                vx: Math.cos(angle) * speed,
                vy: Math.sin(angle) * speed,
                caught: false
            };

            elem.onmousedown = (e) => {
                if (e.button !== 0 || animalObj.caught) return;
                e.stopPropagation();

                animalObj.caught = true;
                matchedCount++;
                animalStats[animalObj.type].remaining--;
                updateCatchHUD();

                playSound(animalObj.sound || 'drop-success');

                elem.style.filter = 'brightness(0) grayscale(1)';
                elem.style.transition = 'transform 0.3s ease-out, opacity 0.3s ease-out';
                elem.style.transform = 'translate(-50%, -50%) scale(1.6)';
                elem.style.opacity = '0';

                if (typeof confetti === 'function') {
                    confetti({ particleCount: 20, spread: 60, origin: { x: animalObj.x / window.innerWidth, y: animalObj.y / window.innerHeight } });
                }

                if (matchedCount >= totalTargets) {
                    stopCatchMeGame();
                    if (onComplete) setTimeout(onComplete, 600);
                }
            };

            catchAnimalsList.push(animalObj);
        }
    });

    function catchLoop() {
        if (!catchMeActive) return;

        const curWidth = playArea.clientWidth;
        const curHeight = playArea.clientHeight;

        catchAnimalsList.forEach(a => {
            if (a.caught) return;

            const mult = (typeof CATCH_ME_CONFIG !== 'undefined' && CATCH_ME_CONFIG.speedMultiplier !== undefined) 
                ? CATCH_ME_CONFIG.speedMultiplier 
                : 0.5;

            a.x += a.vx * mult;
            a.y += a.vy * mult;

            if (a.x < 35) { a.x = 35; a.vx = Math.abs(a.vx); }
            if (a.x > curWidth - 35) { a.x = curWidth - 35; a.vx = -Math.abs(a.vx); }
            if (a.y < 45) { a.y = 45; a.vy = Math.abs(a.vy); }
            if (a.y > curHeight - 45) { a.y = curHeight - 45; a.vy = -Math.abs(a.vy); }

            const flip = a.vx < 0 ? -1 : 1;
            a.elem.style.left = `${a.x}px`;
            a.elem.style.top = `${a.y}px`;
            a.elem.style.transform = `translate(-50%, -50%) scaleX(${flip})`;
        });

        catchAnimId = requestAnimationFrame(catchLoop);
    }

    catchAnimId = requestAnimationFrame(catchLoop);

    return function cleanup() {
        stopCatchMeGame();
    };
}

function stopCatchMeGame() {
    catchMeActive = false;
    if (catchAnimId) {
        cancelAnimationFrame(catchAnimId);
        catchAnimId = null;
    }
}

