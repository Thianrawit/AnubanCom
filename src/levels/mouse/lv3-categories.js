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
        const box = document.createElement('div');
        box.className = `drop-zone w-full min-h-[140px] sm:min-h-[160px] rounded-3xl border-4 ${cat.color} p-3 flex flex-col items-center justify-start relative shadow-sm`;
        box.dataset.match = cat.type;
        box.innerHTML = `
            <div class="text-sm sm:text-base font-extrabold text-slate-700 bg-white/90 px-4 py-1.5 rounded-full shadow-sm mb-2 border border-slate-200 flex items-center gap-2">
                <span>${cat.name}</span> ${GameIcon(cat.icon, 'w-6 h-6')}
            </div>
            <div class="box-content flex flex-wrap justify-center gap-2 w-full"></div>
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

