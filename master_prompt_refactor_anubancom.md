# MASTER PROMPT: Refactor AnubanCom to Modular ES6 + Vite Singlefile Bundle

## 1. บริบทและเป้าหมาย (Context & Objective)
โปรเจกต์ **AnubanCom** เป็นเว็บแอปพลิเคชันเกมฝึกทักษะเมาส์และคีย์บอร์ดสำหรับเด็กอนุบาล ปัจจุบันโค้ดทั้งหมดถูกเขียนรวมอยู่ใน `index.html` ไฟล์เดียว (อ้างอิงโครงสร้างและรายละเอียดการทำงานทั้งหมดจากไฟล์ `cam.md` ในโปรเจกต์นี้)

**เป้าหมาย:** 
ต้องการปรับโครงสร้าง (Refactor) โค้ดจากไฟล์เดียว ให้แยกออกเป็น **ES6 Modules** แยกตามระบบแกนกลางและแยกตามแต่ละด่าน เพื่อให้การแก้ไขและเพิ่มด่านในอนาคตทำได้รวดเร็ว ปลอดภัย และประหยัด Token แต่เมื่อสั่ง Build (`npm run build`) จะต้องมัดรวม (Bundle) กลับออกมาเป็น `dist/index.html` **ไฟล์เดียว** ที่สามารถดับเบิลคลิกเปิดเล่นผ่าน Local Filesystem (`file://`) แบบ Offline ได้ทันทีโดยไม่ต้องพึ่ง Web Server

---

## 2. กฎเหล็ก: ห้ามเปลี่ยนแปลงพฤติกรรมเดิม (Zero Regression Rules)
ระบบทั้งหมดที่ระบุใน `cam.md` ต้องทำงานได้เหมือนเดิม **100%** ทั้งหน้าตา UI, สี, แอนิเมชัน, เสียง และฟิสิกส์การเล่น:
1. **Tech Stack & CDN:** คงการเรียกใช้ Tailwind CSS, Font Awesome 6 และ Canvas Confetti ผ่าน CDN เดิมไว้ทั้งหมด รวมถึงคงโฟลเดอร์ `scripts/` (Python TTS/SFX generators) ไว้เหมือนเดิม
2. **Security & Input Guard (`security.js`):**
   - บล็อกคลิกขวา (`disableContextMenu`) และบล็อกปุ่มเมาส์ที่ไม่ใช่คลิกซ้าย (`blockNonLeftMouse` เมื่อ `e.button !== 0`)
   - บล็อกคีย์ลัดเบราว์เซอร์และ DevTools (`F12`, `Ctrl+Shift+I/J/C`, `Ctrl+U`, `Tab`, `Alt`, `Meta`) ผ่าน `handleGlobalKeydown`
   - บล็อกการพิมพ์คีย์บอร์ดทั้งหมดเมื่อไม่อยู่ในโหมดคีย์บอร์ด (`currentMode !== 'keyboard'`)
   - คงกฎ CSS `user-select: none` และ `-webkit-user-drag: none` ทั่วทั้งแอป
3. **Audio & Speech Engine (`audio.js`):**
   - คงระบบเสียงพากย์ `playLetterSound` (โหลดไฟล์ Edge-TTS `.mp3` จาก `audio/voice/` เป็นหลัก และ Fallback ไปที่ Web Speech API `SpeechSynthesis` ค่า Pitch `1.1`, Rate `0.85`)
   - คงระบบเสียง SFX `playSound` (ใช้ `sfxCache` และ Fallback ไปที่ `playSynthSound` ผ่าน Web Audio API `AudioContext`)
4. **Custom Drag & Drop Engine (`dragDrop.js`):**
   - คงระบบลากวางที่เขียนเอง (`startDragging`, `endDragging`, Ghost element cloning, `getBoundingClientRect()` collision detection) ที่รองรับทั้ง Mouse และ Touch
5. **โหมดฝึกเมาส์ครบทั้ง 10 ด่าน (`levels/mouse/`):**
   - **ด่าน 1:** ลากวางรูปทรง + ระบบ Idle Hint จำลองเมาส์คลิกซ้ายลากอัตโนมัติเมื่อนิ่งเกิน 5 วินาที (`#mouseDragHintOverlay`)
   - **ด่าน 2:** จับคู่รูปสัตว์กับเงา + เสียงร้องของสัตว์แต่ละชนิด
   - **ด่าน 3:** แยกหมวดหมู่ภาพ (ผลไม้ VS สัตว์เลี้ยง)
   - **ด่าน 4:** ต่อภาพจิ๊กซอว์ 2x2 (4 ชิ้นส่วน)
   - **ด่าน 5:** กระดานวาดรูป Paint ลากตามรอยประ (หัวใจ, ดาว, แอปเปิล, บ้าน) + จานสี 6 สี + ยางลบ/ล้างกระดาน + Waypoints Collision + ระบบวาดตัวอย่างอัตโนมัติ (6.5 วิ) เมื่อนิ่งเกิน 5 วิ
   - **ด่าน 6 & 7:** ไฟฉายส่องซ่อนแอบ (`FLASHLIGHT_CONFIG`) + Canvas `destination-out` masking สี `#050816` + ระบบบังคับจอมืดสนิททันทีตอนเริ่ม (`getBoardDimensions`) + เอฟเฟกต์ซูมขยาย `1.15x` ตอนส่องโดนและ Pop `1.25x` เมื่อเก็บสำเร็จ + HUD Badges
   - **ด่าน 8, 9, 10:** เกมจับสัตว์วิ่งบนจอ (`CATCH_ME_CONFIG`) + Native Cursor + ลูป `catchLoop` สะท้อนขอบจอ + บังคับคลิกซ้ายโดนตัวเท่านั้น (ห้ามลากผ่าน) + เอฟเฟกต์สีดำล้วน (`brightness(0) grayscale(1)`) และเสียงร้องตอนถูกจับ
6. **โหมดฝึกคีย์บอร์ด 3 หมวดหมู่ (`levels/keyboard/`):**
   - หมวดภาษาไทย (24 พยัญชนะไม่ต้องกด Shift บนผังเกษมณี 4 แถว), หมวดภาษาอังกฤษ (A-Z ผัง QWERTY 3 แถว สปีด -25%), หมวดตัวเลข (0-9 แถวบนสุด)
   - คงระบบจำลองมือกดแป้นพิมพ์อัตโนมัติ (`images/hand_open.svg` / CSS Pointer) เมื่อนิ่งเกิน 5 วินาที
7. **Victory Modal & Controls:**
   - คงหน้าต่างผ่านด่าน, พลุ `confetti()`, เสียง `phrase_win.mp3` + `win.wav`, ปุ่มเล่นอีกครั้ง (`resetCurrentLevel`) และปุ่มด่านถัดไป (`nextLevel`)

---

## 3. โครงสร้างโฟลเดอร์เป้าหมาย (Target Architecture)
ให้จัดโครงสร้างโปรเจกต์ใหม่ดังนี้:

```text
AnubanCom/
├── index.html                    # โครงสร้าง HTML หลัก, หน้าเมนูเลือกโหมด/ด่าน, Victory Modal
├── vite.config.js                # ตั้งค่า vite-plugin-singlefile และ base: './'
├── package.json
├── public/                       # ย้ายโฟลเดอร์สื่อเดิมมาไว้ที่นี่เพื่อให้ Vite copy ไป dist/
│   ├── images/                   # hand_open.svg, hand_fist.svg
│   └── audio/                    # sfx/ และ voice/ ทั้งหมด
├── scripts/                      # คงสคริปต์ Python เดิมไว้ที่ Root
└── src/
    ├── main.js                   # Entry point, State management, Level router
    ├── config/
    │   └── gameConfig.js         # รวมค่าคงที่ทั้งหมด (FLASHLIGHT_CONFIG, CATCH_ME_CONFIG ฯลฯ)
    ├── core/
    │   ├── security.js           # ระบบบล็อกคลิกขวา, คีย์ลัด, และการพิมพ์นอกโหมด
    │   ├── audio.js              # ระบบเล่นเสียง Edge-TTS, sfxCache, Web Audio & Speech fallback
    │   ├── dragDrop.js           # Custom Drag & Drop Engine
    │   └── ui.js                 # จัดการ HUD, Confetti, Victory Modal, StarBurst
    ├── levels/
    │   ├── mouse/
    │   │   ├── lv1-shapes.js
    │   │   ├── lv2-animals.js
    │   │   ├── lv3-categories.js
    │   │   ├── lv4-puzzle.js
    │   │   ├── lv5-paint.js
    │   │   ├── lv6-7-flashlight.js
    │   │   └── lv8-10-catch.js
    │   └── keyboard/
    │       ├── keyboardEngine.js # เรนเดอร์แป้นพิมพ์เสมือน, จับคีย์, มือชี้ปุ่มเมื่อ idle 5 วิ
    │       └── keyData.js        # ข้อมูลตัวอักษรไทย 24 ตัว, A-Z, ตัวเลข 0-9 และผังแป้นพิมพ์
    └── styles/
        └── main.css              # Custom CSS และ Keyframe Animations ทั้งหมดจาก index.html เดิม
```

---

## 4. ข้อกำหนดทางเทคนิคสำหรับการแยก Module (Engineering Standards)
1. **Standard Level Lifecycle (ป้องกัน Memory Leak):**
   - ทุกไฟล์ด่านใน `src/levels/` ต้อง Export ฟังก์ชันมาตรฐานเดียวกัน เช่น `initLevel(container, context)` และ **ต้องคืนค่าฟังก์ชัน `cleanup()`** เพื่อล้าง `requestAnimationFrame` (`catchLoop`), `setTimeout`/`setInterval` (ตัวจับเวลา Idle Hint 5 วิ), และ `EventListener` ของด่านนั้นทิ้งทุกครั้งที่มีการเปลี่ยนด่านหรือกดกลับหน้าเมนูหลัก
2. **Offline Relative Paths:**
   - ใน `vite.config.js` ต้องใช้ `vite-plugin-singlefile` และกำหนด `base: './'`
   - การอ้างอิงไฟล์ในโค้ด JS/CSS ทั้งหมดต้องใช้ Relative Path แบบ **ไม่มี `/` นำหน้า** (เช่น `'audio/voice/th_3585.mp3'`, `'images/hand_open.svg'`) เพื่อให้เปิดผ่าน `file://` บน Windows/macOS ได้โดยไม่ติด Path error
3. **Centralized Config:**
   - นำตัวแปรปรับแต่ง `FLASHLIGHT_CONFIG` และ `CATCH_ME_CONFIG` ไปไว้ใน `src/config/gameConfig.js` เพื่อให้แก้ไขค่าฟิสิกส์และความเร็วได้จากจุดเดียว

---

## 5. แผนการดำเนินงานทีละขั้นตอน (Mandatory Phased Execution)
**คำสั่งสำคัญ:** ห้ามทำรวดเดียวทั้งหมด ให้ดำเนินการทีละ Phase ตามลำดับด้านล่าง เมื่อจบแต่ละ Phase ให้สรุปสิ่งที่ทำและ **หยุดรอคำยืนยันจากฉัน** ก่อนเริ่ม Phase ถัดไป:

- **Phase 1: Backup & Project Setup**
  1. คัดลอก `index.html` ปัจจุบันไปสำรองไว้ที่ `index.legacy.html`
  2. ย้ายโฟลเดอร์ `audio/` และ `images/` เข้าไปไว้ใน `public/audio/` และ `public/images/`
  3. สร้าง `package.json` และติดตั้ง `vite` กับ `vite-plugin-singlefile` พร้อมสร้างไฟล์ `vite.config.js`
  4. สร้างโครงสร้างโฟลเดอร์ใน `src/` ให้ครบตามแบบ

- **Phase 2: Extract Core Systems & Styles**
  1. แยก CSS ทั้งหมดไปไว้ที่ `src/styles/main.css`
  2. แยก `gameConfig.js`, `security.js`, `audio.js`, `dragDrop.js` และ `ui.js` ออกจาก `index.html` เดิม โดยตรวจสอบให้แน่ใจว่า Logic ทุกบรรทัดถูกย้ายมาครบถ้วน

- **Phase 3: Extract Mouse Levels (1 - 10)**
  1. แยกโค้ดด่านเมาส์ทั้ง 10 ด่านลงไฟล์ใน `src/levels/mouse/` พร้อมสร้างฟังก์ชัน `cleanup()` ให้ครบทุกด่าน (โดยเฉพาะด่าน 1 Idle Hint, ด่าน 5 Paint Canvas, ด่าน 6-7 Flashlight Masking, และด่าน 8-10 `catchLoop`)

- **Phase 4: Extract Keyboard Mode & Main Router**
  1. แยกข้อมูลตัวอักษรและผังแป้นพิมพ์ลง `src/levels/keyboard/keyData.js` และระบบเล่น/มือชี้ปุ่มลง `keyboardEngine.js`
  2. เชื่อมต่อทุกระบบเข้าด้วยกันใน `src/main.js` และปรับ `index.html` ให้เหลือเฉพาะโครงสร้าง DOM หลักและ `<script type="module" src="/src/main.js"></script>`

- **Phase 5: Production Build, Verification & Documentation Sync**
  1. รันคำสั่ง `npm run build` เพื่อสร้าง `dist/index.html`
  2. ตรวจสอบโค้ดใน `dist/` ว่าไฟล์เสียงและรูปภาพถูกคัดลอกไปครบและไม่มี Path ผิดพลาด
  3. อัปเดตโครงสร้างไฟล์และสถาปัตยกรรมใหม่ลงใน `cam.md` และบันทึกการเปลี่ยนแปลงลงใน `ReviewIDE.md` ให้ตรงกับโค้ดปัจจุบัน 100%

เริ่มดำเนินการ **Phase 1** ได้ทันที