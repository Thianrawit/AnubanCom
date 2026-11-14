// ==========================================
// PWA (Progressive Web App) Install Manager
// ==========================================

let deferredInstallPrompt = null;

export function initPWA() {
    // 1. Register Service Worker
    if ('serviceWorker' in navigator) {
        window.addEventListener('load', () => {
            navigator.serviceWorker.register('./sw.js')
                .then((reg) => {
                    console.log('PWA Service Worker registered:', reg.scope);
                })
                .catch((err) => {
                    console.log('PWA Service Worker registration note:', err);
                });
        });
    }

    // 2. Listen for beforeinstallprompt
    window.addEventListener('beforeinstallprompt', (e) => {
        // Prevent default mini-infobar from appearing on mobile
        e.preventDefault();
        deferredInstallPrompt = e;
        updatePwaInstallUI();
    });

    // 3. Listen for appinstalled
    window.addEventListener('appinstalled', () => {
        deferredInstallPrompt = null;
        updatePwaInstallUI();
        if (typeof window.showSettingsToast === 'function') {
            window.showSettingsToast('ติดตั้งแอปลงบนเครื่องสำเร็จแล้วครับ! 🎉');
        }
    });

    // Initial UI check
    updatePwaInstallUI();
}

export function isAppInstalled() {
    return window.matchMedia('(display-mode: standalone)').matches || 
           window.navigator.standalone === true ||
           document.referrer.includes('android-app://');
}

export function isIOSDevice() {
    return /iPad|iPhone|iPod/.test(navigator.userAgent) && !window.MSStream;
}

export function updatePwaInstallUI() {
    const installBtn = document.getElementById('pwaInstallBtn');
    const badge = document.getElementById('pwaInstallBadge');
    const subtext = document.getElementById('pwaInstallDesc') || document.getElementById('pwaInstallSubtext');

    if (!installBtn || !badge) return;

    if (isAppInstalled()) {
        badge.className = 'bg-white text-emerald-700 text-xs font-black px-3 py-1.5 rounded-xl shadow-sm flex items-center gap-1.5';
        badge.innerHTML = '<i class="fa-solid fa-check"></i> ติดตั้งแล้ว';
        if (subtext) subtext.innerText = 'เปิดใช้งานในโหมดแอปเรียบร้อยแล้ว';
    } else if (deferredInstallPrompt) {
        badge.className = 'bg-white text-emerald-700 text-xs font-black px-3 py-1.5 rounded-xl shadow-sm flex items-center gap-1.5 animate-pulse';
        badge.innerHTML = '<i class="fa-solid fa-download"></i> ติดตั้งทันที';
        if (subtext) subtext.innerText = 'กดเพื่อติดตั้งลงเครื่องได้ทันที';
    } else if (isIOSDevice()) {
        badge.className = 'bg-white text-emerald-700 text-xs font-black px-3 py-1.5 rounded-xl shadow-sm flex items-center gap-1.5';
        badge.innerHTML = '<i class="fa-solid fa-arrow-up-from-bracket"></i> วิธีติดตั้ง';
        if (subtext) subtext.innerText = 'สำหรับ iPhone / iPad (Safari)';
    } else {
        badge.className = 'bg-white text-emerald-700 text-xs font-black px-3 py-1.5 rounded-xl shadow-sm flex items-center gap-1.5';
        badge.innerHTML = '<i class="fa-solid fa-download"></i> ติดตั้ง';
        if (subtext) subtext.innerText = 'เล่นได้เต็มจอ ไม่ต้องเข้าผ่านเบราว์เซอร์';
    }
}

export async function installAppToDevice() {
    const toast = (msg) => {
        if (typeof window.showSettingsToast === 'function') {
            window.showSettingsToast(msg);
        } else {
            alert(msg);
        }
    };

    // Case 1: Already installed
    if (isAppInstalled()) {
        toast('แอปนี้ติดตั้งอยู่บนเครื่องแล้วครับ พร้อมเล่นแบบเต็มจอได้เลย! ✨');
        return;
    }

    // Case 2: Browser triggered beforeinstallprompt
    if (deferredInstallPrompt) {
        try {
            deferredInstallPrompt.prompt();
            const choiceResult = await deferredInstallPrompt.userChoice;
            if (choiceResult.outcome === 'accepted') {
                toast('กำลังติดตั้งแอปลงบนเครื่อง... ขอบคุณครับ! 🎉');
                deferredInstallPrompt = null;
            } else {
                toast('ยกเลิกการติดตั้งไว้ก่อน สามารถกดติดตั้งใหม่ได้ตลอดเวลาครับ');
            }
        } catch (err) {
            console.error('Error invoking PWA install prompt:', err);
        }
        updatePwaInstallUI();
        return;
    }

    // Case 3: iOS Safari
    if (isIOSDevice()) {
        const iosModal = document.getElementById('pwaIosGuideModal');
        if (iosModal) {
            iosModal.classList.remove('hidden');
            setTimeout(() => iosModal.classList.remove('opacity-0'), 10);
            return;
        }
        toast('วิธีติดตั้งบน iPhone / iPad: กดปุ่มแชร์ (Share ด้านล่าง) แล้วกด "เพิ่มไปยังหน้าจอโฮม" ครับ 📲');
        return;
    }

    // Case 4: Other desktop or Android browsers without beforeinstallprompt
    toast('วิธีติดตั้ง: กดเมนู 3 จุด (⋮) ของเบราว์เซอร์ แล้วเลือก "ติดตั้งแอป" หรือ "เพิ่มลงในหน้าจอหลัก" ครับ 📲');
}

export function hideIosGuideModal() {
    const iosModal = document.getElementById('pwaIosGuideModal');
    if (iosModal) {
        iosModal.classList.add('opacity-0');
        setTimeout(() => iosModal.classList.add('hidden'), 300);
    }
}

// Bind to window for HTML onclick triggers
if (typeof window !== 'undefined') {
    window.installAppToDevice = installAppToDevice;
    window.updatePwaInstallUI = updatePwaInstallUI;
    window.initPWA = initPWA;
    window.hideIosGuideModal = hideIosGuideModal;
}
