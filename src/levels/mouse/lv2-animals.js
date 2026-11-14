// ==========================================
// Mouse Level 2: Image to Shadow Match 🐱
// ==========================================
import { initDragAndDrop, cleanupDragAndDrop } from '../../core/dragDrop.js';
import { playSound } from '../../core/audio.js';
import { createStarBurst } from '../../core/ui.js';
import { startMouseHint, stopMouseHint } from './mouseHint.js';

export function renderMouseLevel2(board, config, onComplete) {
    let matchedCount = 0;
    const totalTargets = config.pairs.length;

    board.innerHTML = '';
    const targetsContainer = document.createElement('div');
    targetsContainer.className = "grid grid-cols-2 sm:grid-cols-4 gap-4 sm:gap-6 w-full justify-items-center mb-6";

    const itemsContainer = document.createElement('div');
    itemsContainer.className = "flex flex-wrap justify-center gap-4 sm:gap-8 w-full border-t-2 border-dashed border-slate-200 pt-6";

    const shuffledTargets = [...config.pairs].sort(() => Math.random() - 0.5);
    const shuffledItems = [...config.pairs].sort(() => Math.random() - 0.5);

    shuffledTargets.forEach(item => {
        const zone = document.createElement('div');
        zone.className = `drop-zone w-24 h-24 sm:w-28 sm:h-28 rounded-2xl border-4 border-dashed border-slate-300 bg-slate-100 flex flex-col justify-center items-center relative`;
        zone.dataset.match = item.type;
        zone.innerHTML = `
            <span class="text-4xl sm:text-5xl opacity-20 grayscale filter">${item.icon}</span>
            <span class="text-xs text-slate-400 font-bold mt-1">${item.name}</span>
        `;
        targetsContainer.appendChild(zone);
    });

    shuffledItems.forEach(item => {
        const dragElem = document.createElement('div');
        dragElem.className = `drag-item w-20 h-20 sm:w-24 sm:h-24 bg-white rounded-2xl shadow-lg border-2 border-slate-100 flex justify-center items-center cursor-grab active:scale-105 transition-transform`;
        dragElem.dataset.type = item.type;
        dragElem.dataset.id = item.id;
        dragElem.innerHTML = `<span class="text-4xl sm:text-5xl">${item.icon}</span>`;
        itemsContainer.appendChild(dragElem);
    });

    board.appendChild(targetsContainer);
    board.appendChild(itemsContainer);

    const checkRemaining = () => matchedCount < totalTargets;

    initDragAndDrop({
        onStart: () => stopMouseHint(),
        onSuccess: (dragElem, zone) => {
            const dragType = dragElem.dataset.type;
            if (['cat', 'dog', 'frog', 'chicken'].includes(dragType)) {
                playSound(dragType);
            } else {
                playSound('drop-success');
            }

            zone.innerHTML = '';
            const clone = dragElem.cloneNode(true);
            clone.className = "w-full h-full flex justify-center items-center pop-anim rounded-xl";
            clone.style.opacity = "1";
            clone.style.cursor = "default";
            zone.appendChild(clone);
            zone.style.borderColor = "#10b981";
            zone.style.backgroundColor = "#ecfdf5";
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

