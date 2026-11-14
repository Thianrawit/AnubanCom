# คู่มือการสร้างภาพประกอบมินิเกมใหม่ (Assets.md)

เอกสารนี้รวบรวม Prompt สำหรับนำไปสร้างชุดภาพสติกเกอร์เวกเตอร์ใน **Google Flow** เพื่อใช้กับมินิเกมปูพื้นฐานเมาส์และคีย์บอร์ดทั้ง 8 เกมใหม่ โดยแบ่งเป็น 3 แผ่นตาราง (Sprite Sheets) ตามหมวดหมู่การใช้งาน

### คำแนะนำหลังเจนภาพเสร็จ:
1. ดาวน์โหลดภาพจาก Google Flow และตัดแบ่ง (Crop/Slice) ออกเป็นไฟล์ `.png` พื้นหลังโปร่งใส (Transparent)
2. นำไปเก็บไว้ในโฟลเดอร์ `public/images/minigames/` เพื่อใช้ประกอบในโค้ดแต่ละด่าน

---

## ชุดที่ 1: หมวดปูพื้นฐานเมาส์ (เช็ดฟองสบู่, จิ้มลูกโป่ง, กดค้างรดน้ำต้นไม้)
- **ขนาดตาราง:** 3x4 (12 ชิ้น)
- **รายการสิ่งของ:** 1. กลุ่มฟองสบู่พาสเทล, 2. ฟองน้ำอาบน้ำสีเหลืองน่ารัก, 3. ลูกโป่งกลมสีแดง, 4. ลูกโป่งกลมสีฟ้า, 5. ลูกโป่งรูปดาวสีเหลือง, 6. ลูกเจี๊ยบกางร่มชูชีพ, 7. บัวรดน้ำสีฟ้าพาสเทล, 8. กระถางต้นไม้มีต้นกล้าจิ๋ว, 9. กระถางต้นไม้มีลำต้นและใบเขียว, 10. กระถางต้นไม้มีดอกไม้สีชมพูบานสะพรั่ง, 11. หยดน้ำสีทองมีหน้าตาน่ารัก, 12. ก้อนเมฆสีขาวนุ่มฟูมีหน้าตาน่ารัก

```text
A clean 3x4 grid sprite sheet of 12 cute kawaii chibi cartoon icons: 1. fluffy pastel soap bubble cluster, 2. cute yellow bath sponge with kawaii face, 3. red round party balloon with string, 4. blue round party balloon with string, 5. yellow star-shaped party balloon with string, 6. cute little baby chick floating with a pastel parachute, 7. pastel blue watering can with spout, 8. terracotta flower pot with soil and tiny green seed sprout, 9. terracotta flower pot with medium leafy green stem, 10. terracotta flower pot with blooming pink flower with kawaii face, 11. shiny water droplet with kawaii face, 12. cute fluffy white cloud with kawaii face. Consistent 2D flat vector sticker illustration style with thick uniform dark brown outlines, soft rounded shapes, vibrant pastel-accented colors, simple cel-shading, and cute glossy white pill-shaped highlights. Adorable kawaii faces with dot eyes, tiny smiles, and rosy pink oval cheeks on cute characters and objects. Strict 3x4 grid alignment, wide empty white margins around each icon, no overlapping elements, no text, no numbers, no borders or grid lines. Isolated on a completely flat, solid pure white background (#FFFFFF), zero drop shadows, zero gradients.
```

---

## ชุดที่ 2: หมวดควบคุมทิศทางและให้อาหารสัตว์ (พาน้องกลับบ้าน, ให้อาหารตามใจนึก)
- **ขนาดตาราง:** 3x4 (12 ชิ้น)
- **รายการสิ่งของ:** 1. หน้าลูกสุนัขสุดน่ารัก, 2. บ้านสุนัขไม้หลังคาสีแดง, 3. กระดูกสีขาวมีแก้มชมพู, 4. หน้าลิงน้อยสุดน่ารัก, 5. หน้ากระต่ายขาวสุดน่ารัก, 6. หน้าลูกแมวสุดน่ารัก, 7. กล้วยหอมสีเหลืองมีหน้าตาน่ารัก, 8. แครอทสีส้มใบเขียวสดใส, 9. ปลาตัวน้อยสีเงินมีหน้าตาน่ารัก, 10. แอปเปิลสีแดงใบเขียวมีหน้าตาน่ารัก, 11. ตะกร้าหวายปิกนิก, 12. ก้อนเมฆความคิด (Thought Bubble) สีขาวฟู

```text
A clean 3x4 grid sprite sheet of 12 cute kawaii chibi cartoon icons: 1. cute puppy dog face icon, 2. cozy wooden dog house with red roof, 3. cute white bone with rosy pink cheeks, 4. cute baby monkey face icon, 5. cute white bunny rabbit face icon, 6. cute little kitten face icon, 7. ripe yellow banana with kawaii face, 8. fresh orange carrot with green leafy top and kawaii face, 9. cute silver fish with kawaii face, 10. shiny red apple with green leaf and kawaii face, 11. woven wicker picnic basket, 12. fluffy white cloud-shaped thought bubble. Consistent 2D flat vector sticker illustration style with thick uniform dark brown outlines, soft rounded shapes, vibrant pastel-accented colors, simple cel-shading, and cute glossy white pill-shaped highlights. Adorable kawaii faces with dot eyes, tiny smiles, and rosy pink oval cheeks on cute characters and objects. Strict 3x4 grid alignment, wide empty white margins around each icon, no overlapping elements, no text, no numbers, no borders or grid lines. Isolated on a completely flat, solid pure white background (#FFFFFF), zero drop shadows, zero gradients.
```

---

## ชุดที่ 3: หมวดมินิเกมคีย์บอร์ดภาพล้วน (ฟักไข่ไดโนเสาร์, กระโดดข้ามหิน, รถไฟเก็บแอปเปิล)
- **ขนาดตาราง:** 3x3 (9 ชิ้น)
- **รายการสิ่งของ:** 1. ไข่ไดโนเสาร์ลายจุดใบใหญ่สมบูรณ์, 2. ไข่ไดโนเสาร์มีรอยร้าวเล็กน้อย, 3. ไข่ไดโนเสาร์มีรอยร้าวใหญ่เห็นดวงตาแอบมอง, 4. ลูกไดโนเสาร์ทีเร็กซ์สีเขียวฟักออกจากเปลือกไข่, 5. กระต่ายขาวกำลังกระโดดดีใจ, 6. ก้อนหินในสวนสีเทาเรียบมน, 7. แอ่งน้ำสีฟ้าใสมีหยดน้ำกระเซ็น, 8. หัวรถจักรรถไฟของเล่นสีสันสดใส, 9. ธงสถานีรถไฟสีทอง

```text
A clean 3x3 grid sprite sheet of 9 cute kawaii chibi cartoon icons: 1. large pastel spotted dinosaur egg intact, 2. spotted dinosaur egg with a small zigzag crack, 3. spotted dinosaur egg with a big crack and cute eyes peeking out, 4. cute baby green T-Rex dinosaur hatching happily out of eggshell, 5. cute white bunny jumping joyfully with arms raised, 6. smooth rounded grey garden stepping stone, 7. cute blue water puddle with splash droplets, 8. cute colorful toy steam locomotive train engine with kawaii face, 9. golden railway station flag. Consistent 2D flat vector sticker illustration style with thick uniform dark brown outlines, soft rounded shapes, vibrant pastel-accented colors, simple cel-shading, and cute glossy white pill-shaped highlights. Adorable kawaii faces with dot eyes, tiny smiles, and rosy pink oval cheeks on cute characters and objects. Strict 3x3 grid alignment, wide empty white margins around each icon, no overlapping elements, no text, no numbers, no borders or grid lines. Isolated on a completely flat, solid pure white background (#FFFFFF), zero drop shadows, zero gradients.
```