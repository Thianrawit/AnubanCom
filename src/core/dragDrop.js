// ==========================================
// Custom Drag & Drop Engine (Mouse Levels 1-4)
// ==========================================
import { playSound } from './audio.js';

let activeDragElem = null;
let cloneElem = null;
let touchOffsetX = 0;
let touchOffsetY = 0;
let dropSuccessCallback = null;
let dropFailCallback = null;
let dragStartCallback = null;
let boundItems = [];

export function initDragAndDrop(options = {}) {
    cleanupDragAndDrop();

    dropSuccessCallback = options.onSuccess || null;
    dropFailCallback = options.onFail || null;
    dragStartCallback = options.onStart || null;

    const dragItems = document.querySelectorAll('.drag-item');
    boundItems = [];

    dragItems.forEach(item => {
        const onMD = (e) => onMouseDown(e, item);
        const onTS = (e) => onTouchStart(e, item);
        item.addEventListener('mousedown', onMD);
        item.addEventListener('touchstart', onTS, { passive: false });
        boundItems.push({ item, onMD, onTS });
    });
}

export function cleanupDragAndDrop() {
    boundItems.forEach(({ item, onMD, onTS }) => {
        if (item) {
            item.removeEventListener('mousedown', onMD);
            item.removeEventListener('touchstart', onTS);
        }
    });
    boundItems = [];

    document.removeEventListener('mousemove', onMouseMove);
    document.removeEventListener('mouseup', onMouseUp);
    document.removeEventListener('touchmove', onTouchMove);
    document.removeEventListener('touchend', onTouchEnd);

    if (cloneElem && cloneElem.parentNode) {
        cloneElem.parentNode.removeChild(cloneElem);
    }
    if (activeDragElem) {
        activeDragElem.style.opacity = '1';
    }
    cloneElem = null;
    activeDragElem = null;
}

function onMouseDown(e, item) {
    if (e.button !== 0) return; // อนุญาตเฉพาะคลิกซ้ายเท่านั้น
    e.preventDefault();
    startDragging(item, e.clientX, e.clientY);
    document.addEventListener('mousemove', onMouseMove);
    document.addEventListener('mouseup', onMouseUp);
}

function onMouseMove(e) {
    moveDragging(e.clientX, e.clientY);
}

function onMouseUp(e) {
    document.removeEventListener('mousemove', onMouseMove);
    document.removeEventListener('mouseup', onMouseUp);
    endDragging(e.clientX, e.clientY);
}

function onTouchStart(e, item) {
    if (e.touches.length !== 1) return;
    e.preventDefault();
    const touch = e.touches[0];
    startDragging(item, touch.clientX, touch.clientY);
    document.addEventListener('touchmove', onTouchMove, { passive: false });
    document.addEventListener('touchend', onTouchEnd);
}

function onTouchMove(e) {
    if (e.touches.length !== 1) return;
    e.preventDefault();
    const touch = e.touches[0];
    moveDragging(touch.clientX, touch.clientY);
}

function onTouchEnd(e) {
    document.removeEventListener('touchmove', onTouchMove);
    document.removeEventListener('touchend', onTouchEnd);
    const touch = e.changedTouches[0];
    endDragging(touch.clientX, touch.clientY);
}

function startDragging(elem, clientX, clientY) {
    if (dragStartCallback) dragStartCallback(elem);
    activeDragElem = elem;
    playSound('drag');

    const rect = elem.getBoundingClientRect();
    touchOffsetX = clientX - rect.left;
    touchOffsetY = clientY - rect.top;

    cloneElem = elem.cloneNode(true);
    cloneElem.style.position = 'fixed';
    cloneElem.style.left = `${rect.left}px`;
    cloneElem.style.top = `${rect.top}px`;
    cloneElem.style.width = `${rect.width}px`;
    cloneElem.style.height = `${rect.height}px`;
    cloneElem.style.pointerEvents = 'none';
    cloneElem.style.zIndex = '1000';
    cloneElem.classList.add('dragging', 'shadow-2xl');

    document.body.appendChild(cloneElem);
    elem.style.opacity = '0.3';
}

function moveDragging(clientX, clientY) {
    if (!cloneElem) return;
    cloneElem.style.left = `${clientX - touchOffsetX}px`;
    cloneElem.style.top = `${clientY - touchOffsetY}px`;
    highlightDropZones(clientX, clientY);
}

function highlightDropZones(x, y) {
    document.querySelectorAll('.drop-zone').forEach(zone => {
        const rect = zone.getBoundingClientRect();
        if (x >= rect.left && x <= rect.right && y >= rect.top && y <= rect.bottom) {
            zone.classList.add('hovered');
        } else {
            zone.classList.remove('hovered');
        }
    });
}

function endDragging(x, y) {
    if (!activeDragElem || !cloneElem) return;

    activeDragElem.style.opacity = '1';
    let targetZone = null;

    document.querySelectorAll('.drop-zone').forEach(zone => {
        zone.classList.remove('hovered');
        const rect = zone.getBoundingClientRect();
        if (x >= rect.left && x <= rect.right && y >= rect.top && y <= rect.bottom) {
            targetZone = zone;
        }
    });

    if (targetZone) {
        const dragType = activeDragElem.dataset.type;
        const matchType = targetZone.dataset.match;

        if (dragType === matchType) {
            if (dropSuccessCallback) {
                dropSuccessCallback(activeDragElem, targetZone);
            }
        } else {
            playSound('drop-fail');
            if (dropFailCallback) dropFailCallback();
        }
    } else {
        playSound('drop-fail');
        if (dropFailCallback) dropFailCallback();
    }

    if (cloneElem && cloneElem.parentNode) {
        cloneElem.parentNode.removeChild(cloneElem);
    }
    cloneElem = null;
    activeDragElem = null;
}

