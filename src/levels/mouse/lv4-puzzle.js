// ==========================================
// Mouse Level 4: Simple Jigsaw 🐻
// ==========================================
import { initDragAndDrop, cleanupDragAndDrop } from '../../core/dragDrop.js';
import { playSound } from '../../core/audio.js';
import { createStarBurst } from '../../core/ui.js';
import { startMouseHint, stopMouseHint } from './mouseHint.js';
import { GameIcon } from '../../components/GameIcon.js';

export function renderMouseLevel4(board, config, onComplete) {
    let matchedCount = 0;
    const totalTargets = config.pieces.length;

    board.innerHTML = '';
    const puzzleWrapper = document.createElement('div');
    puzzleWrapper.className = "flex flex-col md:flex-row items-center justify-center gap-6 sm:gap-10 w-full";

    const puzzleFrame = document.createElement('div');
    puzzleFrame.className = "grid grid-cols-2 gap-2 bg-amber-100 p-3 rounded-3xl shadow-inner border-4 border-amber-300 relative";

    config.pieces.forEach(p => {
        const slot = document.createElement('div');
        slot.className = `drop-zone w-24 h-24 sm:w-28 sm:h-28 bg-white/60 rounded-2xl border-2 border-dashed border-amber-300 flex justify-center items-center relative overflow-hidden`;
        slot.dataset.match = p.pos;
        slot.innerHTML = `<div class="opacity-25 grayscale brightness-0 flex items-center justify-center">${GameIcon(p.icon, 'w-14 h-14 sm:w-16 sm:h-16')}</div>`;
        puzzleFrame.appendChild(slot);
    });

    const piecesContainer = document.createElement('div');
    piecesContainer.className = "flex flex-wrap md:flex-col justify-center gap-4 border-t-2 md:border-t-0 md:border-l-2 border-dashed border-slate-200 pt-4 md:pt-0 md:pl-8";

    const shuffledPieces = [...config.pieces].sort(() => Math.random() - 0.5);

    shuffledPieces.forEach(p => {
        const piece = document.createElement('div');
        piece.className = `drag-item w-20 h-20 sm:w-24 sm:h-24 ${p.bg} rounded-2xl shadow-md border-2 border-white flex justify-center items-center`;
        piece.dataset.type = p.pos;
        piece.dataset.id = p.id;
        piece.innerHTML = GameIcon(p.icon, 'w-14 h-14 sm:w-16 sm:h-16');
        piecesContainer.appendChild(piece);
    });

    puzzleWrapper.appendChild(puzzleFrame);
    puzzleWrapper.appendChild(piecesContainer);
    board.appendChild(puzzleWrapper);

    const checkRemaining = () => matchedCount < totalTargets;

    initDragAndDrop({
        onStart: () => stopMouseHint(),
        onSuccess: (dragElem, zone) => {
            playSound('drop-success');

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

