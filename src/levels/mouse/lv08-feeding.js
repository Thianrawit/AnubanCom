// ==========================================
// Mouse Level 8: Visual Thought-Bubble Animal Feeding
// ให้อาหารสัตว์ตามภาพและจำนวนในก้อนเมฆความคิด
// ==========================================
import { FEEDING_SETTINGS } from '../../config/settings.js';
import { initDragAndDrop, cleanupDragAndDrop } from '../../core/dragDrop.js';
import { playSound } from '../../core/audio.js';
import { GameIcon } from '../../components/GameIcon.js';
import { startInstantGhostDemo, stopInstantGhostDemo, createStarBurst } from '../../core/ui.js';

export function renderFeedingLevel(board, config, onComplete) {
    const rounds = config.rounds || [
        {
            animals: [
                { id: 'f_monkey', icon: 'monkey', wantIcon: 'banana', wantCount: 2, sound: 'drop-success' },
                { id: 'f_rabbit', icon: 'rabbit', wantIcon: 'carrot', wantCount: 1, sound: 'rabbit' }
            ],
            foods: ['banana', 'carrot', 'banana', 'apple']
        },
        {
            animals: [
                { id: 'f_cat', icon: 'cat', wantIcon: 'fish', wantCount: 2, sound: 'cat' },
                { id: 'f_dog', icon: 'dog', wantIcon: 'bone', wantCount: 1, sound: 'dog' }
            ],
            foods: ['fish', 'bone', 'fish', 'carrot']
        }
    ];

    const totalRounds = Math.min(FEEDING_SETTINGS.totalRounds || 2, rounds.length);
    let currentRoundIdx = 0;
    let levelFinished = false;
    let ghostCleanup = null;
    let roundTimer = null;

    board.innerHTML = `
        <div id="feedingStage" class="relative w-full h-[450px] sm:h-[480px] bg-gradient-to-b from-amber-50 via-emerald-50 to-lime-100 rounded-3xl overflow-hidden flex flex-col items-center justify-between p-4 border-4 border-amber-300 shadow-inner select-none">
            <!-- Round Progress Badges -->
            <div id="feedingProgressRow" class="flex items-center gap-3 z-20 bg-white/90 px-4 py-1.5 rounded-full shadow-sm border-2 border-amber-200"></div>

            <!-- Hungry Animals & Thought Bubbles Area -->
            <div id="feedingAnimalsRow" class="flex flex-wrap justify-center items-end gap-8 sm:gap-14 my-auto z-10 w-full"></div>

            <!-- Picnic Food Tray -->
            <div class="w-full max-w-lg bg-amber-100/90 border-4 border-amber-300 rounded-3xl p-3 sm:p-4 shadow-lg z-20 flex items-center justify-center gap-4">
                <div class="hidden sm:flex items-center justify-center shrink-0">
                    ${GameIcon('picnic-basket', 'w-14 h-14')}
                </div>
                <div id="feedingFoodTray" class="flex flex-wrap justify-center items-center gap-4 sm:gap-6 min-h-[76px]"></div>
            </div>
        </div>
    `;

    const stage = document.getElementById('feedingStage');
    const progressRow = document.getElementById('feedingProgressRow');
    const animalsRow = document.getElementById('feedingAnimalsRow');
    const foodTray = document.getElementById('feedingFoodTray');

    let animalState = [];

    function updateProgressBadges() {
        if (!progressRow) return;
        progressRow.innerHTML = '';
        for (let i = 0; i < totalRounds; i++) {
            const badge = document.createElement('div');
            if (i < currentRoundIdx) {
                badge.className = 'w-9 h-9 rounded-full bg-emerald-100 border-2 border-emerald-400 flex items-center justify-center p-1 pop-anim';
                badge.innerHTML = GameIcon('heart', 'w-6 h-6');
            } else if (i === currentRoundIdx) {
                badge.className = 'w-9 h-9 rounded-full bg-amber-100 border-2 border-amber-400 flex items-center justify-center p-1 animate-pulse';
                badge.innerHTML = GameIcon('picnic-basket', 'w-6 h-6');
            } else {
                badge.className = 'w-9 h-9 rounded-full bg-slate-100 border-2 border-slate-300 flex items-center justify-center opacity-45';
                badge.innerHTML = '<span class="w-3 h-3 rounded-full bg-slate-300"></span>';
            }
            progressRow.appendChild(badge);
        }
    }

    function renderThoughtBubbleContent(animObj) {
        if (animObj.fed >= animObj.wantCount) {
            return `
                <div class="flex items-center justify-center px-3 py-1 pop-anim">
                    ${GameIcon('heart', 'w-10 h-10')}
                </div>
            `;
        }
        let html = '<div class="flex items-center justify-center gap-1.5 px-2 py-0.5">';
        for (let i = 0; i < animObj.wantCount; i++) {
            const isFed = i < animObj.fed;
            html += `
                <div class="w-10 h-10 rounded-xl flex items-center justify-center transition-all ${
                    isFed
                        ? 'bg-emerald-100 border-2 border-emerald-400 scale-105'
                        : 'bg-slate-100/90 border-2 border-dashed border-amber-400 opacity-75'
                }">
                    ${GameIcon(animObj.wantIcon, 'w-7 h-7')}
                </div>
            `;
        }
        html += '</div>';
        return html;
    }

    function loadRound(rIdx) {
        if (levelFinished) return;
        cleanupDragAndDrop();

        const roundData = rounds[rIdx];
        animalState = roundData.animals.map(a => ({
            ...a,
            fed: 0
        }));

        updateProgressBadges();
        animalsRow.innerHTML = '';
        foodTray.innerHTML = '';

        // Render Animals with Cloud Thought Bubbles
        animalState.forEach((animObj, idx) => {
            const wrap = document.createElement('div');
            wrap.className = 'flex flex-col items-center relative';

            wrap.innerHTML = `
                <!-- Thought Bubble Cloud -->
                <div id="thoughtBubble_${idx}" class="thought-bubble-anim relative bg-white border-4 border-sky-300 rounded-3xl px-3 py-2 shadow-lg mb-3 flex items-center justify-center min-w-[92px] min-h-[56px]">
                    ${renderThoughtBubbleContent(animObj)}
                    <!-- Cloud Tail Dots -->
                    <span class=" absolute -bottom-2.5 left-1/2 -translate-x-1/2 w-3.5 h-3.5 bg-white border-b-3 border-r-3 border-sky-300 rounded-full"></span>
                    <span class="absolute -bottom-5 left-1/2 translate-x-1 w-2.5 h-2.5 bg-white border-2 border-sky-300 rounded-full"></span>
                </div>

                <!-- Animal Drop Zone Card -->
                <div id="animalZone_${idx}" data-animal-idx="${idx}" data-match="${animObj.wantIcon}"
                     class="drop-zone w-32 h-32 sm:w-36 sm:h-36 rounded-3xl bg-white/95 border-4 border-emerald-300 shadow-xl flex flex-col items-center justify-center p-3 transition-transform">
                    <div id="animalAvatar_${idx}" class="transition-transform duration-300">
                        ${GameIcon(animObj.icon, 'w-20 h-20 sm:w-24 sm:h-24')}
                    </div>
                </div>
            `;
            animalsRow.appendChild(wrap);
        });

        // Render Draggable Food Items
        roundData.foods.forEach((foodIcon, fIdx) => {
            const foodCard = document.createElement('div');
            foodCard.id = `foodItem_${fIdx}`;
            foodCard.dataset.type = foodIcon;
            foodCard.className = 'drag-item w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-white border-4 border-amber-400 shadow-md flex items-center justify-center p-2 bounce-hover';
            foodCard.innerHTML = GameIcon(foodIcon, 'w-12 h-12 sm:w-14 sm:h-14');
            foodTray.appendChild(foodCard);
        });

        initDragAndDrop({
            onSuccess: (dragElem, targetZone) => {
                const aIdx = parseInt(targetZone.dataset.animalIdx, 10);
                const animObj = animalState[aIdx];
                if (!animObj || animObj.fed >= animObj.wantCount) return;

                // Hide eaten food item
                dragElem.style.display = 'none';
                animObj.fed++;

                // Update thought bubble UI
                const bubbleElem = document.getElementById(`thoughtBubble_${aIdx}`);
                if (bubbleElem) {
                    bubbleElem.innerHTML = `
                        ${renderThoughtBubbleContent(animObj)}
                        <span class="absolute -bottom-2.5 left-1/2 -translate-x-1/2 w-3.5 h-3.5 bg-white border-b-3 border-r-3 border-sky-300 rounded-full"></span>
                    `;
                }

                // If animal is now full, lock its data-match so extra food won't match
                if (animObj.fed >= animObj.wantCount) {
                    targetZone.dataset.match = '__FULL__';
                    targetZone.classList.remove('border-emerald-300');
                    targetZone.classList.add('border-emerald-500', 'bg-emerald-50');
                }

                // Happy chewing bounce
                const avatar = document.getElementById(`animalAvatar_${aIdx}`);
                if (avatar) {
                    avatar.classList.remove('pop-anim');
                    void avatar.offsetWidth;
                    avatar.classList.add('pop-anim');
                }

                playSound(animObj.sound || 'drop-success');
                createStarBurst(targetZone);

                // Check if all animals in this round are full
                const allFull = animalState.every(a => a.fed >= a.wantCount);
                if (allFull) {
                    currentRoundIdx++;
                    updateProgressBadges();
                    roundTimer = setTimeout(() => {
                        if (levelFinished) return;
                        if (currentRoundIdx >= totalRounds) {
                            levelFinished = true;
                            stopInstantGhostDemo();
                            if (onComplete) onComplete();
                        } else {
                            loadRound(currentRoundIdx);
                        }
                    }, 1100);
                }
            }
        });
    }

    loadRound(0);

    // Instant Ghost Demo at 0s dynamically pointing from matching food on tray to hungry animal
    ghostCleanup = startInstantGhostDemo(stage, {
        type: 'drag',
        getPoints: (w, h) => {
            const sRect = stage.getBoundingClientRect();
            const hungryIdx = animalState.findIndex(a => a.fed < a.wantCount);
            if (hungryIdx !== -1) {
                const wantType = animalState[hungryIdx].wantIcon;
                const zoneElem = document.getElementById(`animalZone_${hungryIdx}`);
                const foodElems = Array.from(foodTray.querySelectorAll(`.drag-item[data-type="${wantType}"]`)).filter(
                    el => el.style.display !== 'none'
                );
                if (zoneElem && foodElems.length > 0) {
                    const fRect = foodElems[0].getBoundingClientRect();
                    const zRect = zoneElem.getBoundingClientRect();
                    return [
                        { x: fRect.left - sRect.left + fRect.width * 0.5, y: fRect.top - sRect.top + fRect.height * 0.5 },
                        { x: zRect.left - sRect.left + zRect.width * 0.5, y: zRect.top - sRect.top + zRect.height * 0.5 }
                    ];
                }
            }
            return [
                { x: w * 0.4, y: h * 0.82 },
                { x: w * 0.4, y: h * 0.48 }
            ];
        },
        isDone: () => levelFinished
    });

    return function cleanup() {
        levelFinished = true;
        clearTimeout(roundTimer);
        if (ghostCleanup) ghostCleanup();
        stopInstantGhostDemo();
        cleanupDragAndDrop();
    };
}

export const initLevel = renderFeedingLevel;

