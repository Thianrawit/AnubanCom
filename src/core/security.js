// ==========================================
// Child-Lock & Input Security Guard
// ==========================================

let keyInputHandler = null;
let isKeyboardActiveFn = () => false;

export function registerKeyHandler(handler, activeCheckFn) {
    keyInputHandler = handler;
    if (activeCheckFn) isKeyboardActiveFn = activeCheckFn;
}

export function blockNonLeftMouse(e) {
    // e.button: 0 = ซ้าย, 1 = กลาง (ลูกกลิ้ง), 2 = ขวา
    if (e.button !== 0) {
        e.preventDefault();
        e.stopPropagation();
        e.stopImmediatePropagation();
        return false;
    }
}

export function disableContextMenu(e) {
    e.preventDefault();
    e.stopPropagation();
    e.stopImmediatePropagation();
    return false;
}

export function handleGlobalKeydown(e) {
    // บล็อก DevTools, View Source, Print, Save เสมอ
    if (
        e.key === 'F12' || 
        (e.ctrlKey && e.shiftKey && ['I', 'J', 'C', 'i', 'j', 'c'].includes(e.key)) ||
        (e.ctrlKey && ['u', 'U', 's', 'S', 'p', 'P'].includes(e.key)) ||
        e.key === 'Tab' || e.key === 'Alt' || e.key === 'Meta'
    ) {
        e.preventDefault();
        e.stopPropagation();
        e.stopImmediatePropagation();
        return false;
    }

    // ถ้าไม่ได้อยู่ในโหมดเกมฝึกคีย์บอร์ด ให้บล็อกการกดคีย์บอร์ดทุกปุ่ม 100%
    if (!isKeyboardActiveFn()) {
        e.preventDefault();
        e.stopPropagation();
        e.stopImmediatePropagation();
        return false;
    }

    if (keyInputHandler) {
        e.preventDefault();
        e.stopPropagation();
        keyInputHandler(e);
        return false;
    }
}

export function initSecurity() {
    ['mousedown', 'mouseup', 'click', 'auxclick'].forEach(evt => {
        window.addEventListener(evt, blockNonLeftMouse, true);
        document.addEventListener(evt, blockNonLeftMouse, true);
    });

    window.addEventListener('contextmenu', disableContextMenu, true);
    document.addEventListener('contextmenu', disableContextMenu, true);
    document.oncontextmenu = disableContextMenu;

    window.addEventListener('keydown', handleGlobalKeydown, true);
    document.addEventListener('keydown', handleGlobalKeydown, true);

    const preventUnlessKeyboard = (e) => {
        if (!isKeyboardActiveFn()) {
            e.preventDefault();
            e.stopPropagation();
        }
    };

    window.addEventListener('keyup', preventUnlessKeyboard, true);
    window.addEventListener('keypress', preventUnlessKeyboard, true);
}

