// ==========================================
// Mouse Level 3: Image Classification 🍎 🐶
// ==========================================
import { initDragAndDrop, cleanupDragAndDrop } from '../../core/dragDrop.js';
import { playSound } from '../../core/audio.js';
import { createStarBurst } from '../../core/ui.js';
import { startMouseHint, stopMouseHint } from './mouseHint.js';
import { GameIcon } from '../../components/GameIcon.js';

export function renderMouseLevel3(board, config, onComplete) {
    let matchedCount = 0;
    const totalTargets = config.items.length;

    board.innerHTML = '';
    const boxesContainer = document.createElement('div');
    boxesContainer.className = "grid grid-cols-2 gap-4 sm:gap-8 w-full justify-items-center mb-4 max-w-xl";

    const itemsContainer = document.createElement('div');
    itemsContainer.className = "flex flex-wrap justify-center gap-4 sm:gap-6 w-full border-t-2 border-dashed border-slate-200 pt-6";

    config.categories.forEach(cat => {
        const isFruit = cat.type === 'fruit';
        const box = document.createElement('div');
        box.className = `drop-zone w-full min-h-[220px] sm:min-h-[250px] rounded-3xl border-4 ${cat.color} p-3 flex flex-col items-center justify-start relative shadow-md transition-all`;
        box.dataset.match = cat.type;
        box.innerHTML = `
            <!-- Large Basket Illustration for Non-Reading Kids -->
            <div class="flex flex-col items-center pointer-events-none mb-1">
                <div class="relative flex items-center justify-center p-1 drop-shadow-md">
                    ${GameIcon(cat.icon, 'w-24 h-24 sm:w-28 sm:h-28 object-contain transition-transform duration-300')}
                </div>
                <div class="text-xs sm:text-sm font-black text-slate-700 bg-white/95 px-3 py-1 rounded-full shadow-sm border border-slate-200 flex items-center gap-1.5">
                    ${isFruit 
                        ? `${GameIcon('apple', 'w-4 h-4')} <span>ผลไม้</span> ${GameIcon('banana', 'w-4 h-4')}` 
                        : `${GameIcon('dog', 'w-4 h-4')} <span>สัตว์เลี้ยง</span> ${GameIcon('cat', 'w-4 h-4')}`}
                </div>
            </div>
            <div class="box-content flex flex-wrap justify-center gap-2 w-full min-h-[48px] p-1.5 rounded-2xl bg-white/50 border border-dashed border-slate-300/60"></div>
        `;
        boxesContainer.appendChild(box);
    });

    const shuffledItems = [...config.items].sort(() => Math.random() - 0.5);
    shuffledItems.forEach(item => {
        const elem = document.createElement('div');
        elem.className = `drag-item p-3 bg-white rounded-2xl shadow-md border-2 border-slate-100 flex justify-center items-center hover:scale-110 transition`;
        elem.dataset.type = item.type;
        elem.dataset.id = item.id;
        elem.dataset.icon = item.icon;
        elem.innerHTML = GameIcon(item.icon, 'w-14 h-14 sm:w-16 sm:h-16');
        itemsContainer.appendChild(elem);
    });

    board.appendChild(boxesContainer);
    board.appendChild(itemsContainer);

    const checkRemaining = () => matchedCount < totalTargets;

    initDragAndDrop({
        onStart: () => stopMouseHint(),
        onSuccess: (dragElem, zone) => {
            playSound('drop-success');

            const boxContent = zone.querySelector('.box-content');
            const miniItem = document.createElement('span');
            miniItem.className = "pop-anim p-1 flex items-center justify-center";
            miniItem.innerHTML = GameIcon(dragElem.dataset.icon, 'w-10 h-10 sm:w-12 sm:h-12');
            boxContent.appendChild(miniItem);
            dragElem.remove();

            matchedCount++;
            createStarBurst(zone);

            if (matchedCount >= totalTargets) {
                stopMouseHint();
                if (onComplete) setTimeout(onComplete, 600);
            } else {
                startMouseHint(checkRemaining);
            }
        },
        onFail: () => {
            startMouseHint(checkRemaining);
        }
    });

    startMouseHint(checkRemaining);

    return function cleanup() {
        stopMouseHint();
        cleanupDragAndDrop();
    };
}


export const initLevel = renderMouseLevel3;
