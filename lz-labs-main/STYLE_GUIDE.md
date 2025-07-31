# คู่มือสไตล์ผลิตภัณฑ์ดิจิทัล UnicornX OS (ฉบับปรับปรุง pastel/contrast กลาง)

## 1. บทนำ
คู่มือสไตล์นี้นำเสนอมาตรฐานการออกแบบที่ครอบคลุมสำหรับ UnicornX OS เพื่อความสอดคล้อง เข้าถึงง่าย และเป็นหนึ่งเดียวกันของแบรนด์ การยึดแนวทางนี้จะช่วยให้ UX/UI มีคุณภาพสูงและปลอดภัยต่อการใช้งาน

---

## 2. จานสี (Color Palette)

### 2.1 สีหลัก (Primary)
ใช้สำหรับปุ่มหลัก, action เด่น, highlight สำคัญ

| Token      | Light         | Dark         | หมายเหตุ            |
|------------|--------------|--------------|---------------------|
| P500       | #A7C7FF      | #3B5FC9      | Pastel Blue         |
| P400       | #B9D6FF      | #5A7FEA      | Hover/Light Accent  |
| P600       | #7697C9      | #22376B      | Active/Dark Accent  |

### 2.2 สีรอง (Secondary)
ใช้สำหรับปุ่มรอง, accent, highlight รอง

| Token      | Light         | Dark         | หมายเหตุ            |
|------------|--------------|--------------|---------------------|
| S500       | #D3B9FF      | #7F5AEA      | Pastel Purple       |
| S400       | #E4D6FF      | #A088EA      | Hover/Light Accent  |
| S600       | #B9A7FF      | #5E3BA7      | Active/Dark Accent  |

### 2.3 สีกลาง (Neutral)
ใช้เป็นพื้นหลัง, ข้อความ, เส้นขอบ, พื้นผิว

| Token      | Light         | Dark         | หมายเหตุ            |
|------------|--------------|--------------|---------------------|
| N0         | #FFFFFF      | #FFFFFF      | BG/Primary Text (D) |
| N100       | #F2F2F7      | #222224      | Surface/BG          |
| N200       | #E5E5EA      | #3A3A3C      | Border/Divider      |
| N400       | #AEAEB2      | #5A5A5F      | Disabled (D:Text)   |
| N600       | #8E8E93      | #AEAEB2      | Secondary Text      |
| N900       | #1C1C1E      | #1C1C1E      | Primary Text (L)    |

> **ข้อควรระวัง:**  
> - หลีกเลี่ยงข้อความ N600/400 บนพื้น N100/N0 สำหรับเนื้อหาสำคัญ  
> - ใช้ N900/N0 เป็น primary text เท่านั้น

### 2.4 สีความหมาย (Semantic)
ใช้กับสถานะ เช่น Success, Error, Warning, Info

| State     | Pastel BG   | Strong      | Text (บน BG Pastel) |
|-----------|-------------|-------------|---------------------|
| Success   | #B9FFD6     | #34C759     | #1C1C1E             |
| Error     | #FFB9B9     | #FF3B30     | #1C1C1E             |
| Warning   | #FFF7B9     | #FF9500     | #1C1C1E             |
| Info      | #CCE5FF     | #007AFF     | #1C1C1E             |

> **ข้อควรระวัง:**  
> - Strong BG (สด) ให้ใช้ข้อความขาว/เข้มแล้วแต่ contrast  
> - Pastel BG + ข้อความเข้ม = ปลอดภัย

---

## 3. ระบบตัวอักษร (Typography)

| องค์ประกอบ | ขนาดฟอนต์ | น้ำหนัก | ความสูงบรรทัด | ระยะห่างตัวอักษร | ตัวอย่างการใช้งาน              |
|:-----------|:----------|:--------|:--------------|:------------------|:--------------------------------|
| H1         | 36px      | Bold    | 120% (43px)   | 0%                | หน้าแรก, Hero Title            |
| H2         | 28px      | Bold    | 125% (35px)   | 0%                | Section Title                   |
| H3         | 22px      | Medium  | 130% (29px)   | 0%                | Card Title, Sub-section         |
| H4         | 18px      | Medium  | 135% (24px)   | 0%                | Smaller Heading                 |
| Body Lg    | 16px      | Regular | 140% (22px)   | 0%                | ข้อความเนื้อหาหลัก             |
| Body Sm    | 14px      | Regular | 140% (20px)   | 0%                | คำอธิบาย, Secondary text       |
| Button     | 14px/16px | Medium  | 100% (auto)   | 0.5px             | Label บนปุ่ม                    |
| Caption    | 12px      | Regular | 135% (16px)   | 0%                | Note, helper, meta              |
| Label      | 14px      | Medium  | 135% (19px)   | 0%                | Form label, tag                 |

- **Font Family:** Inter (Regular, Medium, Bold)
- **Contrast:** Primary text ต้องผ่าน 4.5:1, Secondary/Disabled 3:1 ขึ้นไป  
- **Button:** ใช้ 14px หรือ 16px, Medium/Bold เท่านั้น

---

## 4. ปุ่ม (Buttons)

### 4.1 Primary Button (เน้นแอคชั่นสำคัญ)
- BG: #A7C7FF (Light), #3B5FC9 (Dark)
- Text: #1C1C1E (Light), #FFFFFF (Dark)
- Hover: #B9D6FF
- Active: #7697C9
- Corner radius: 8px
- Font: 14px/16px, Medium
- Icon: 16/20px (นำหน้า/ตามหลัง)

### 4.2 Secondary Button
- BG: #D3B9FF (Light), #7F5AEA (Dark)
- Text: #1C1C1E (Light), #FFFFFF (Dark)
- Hover: #E4D6FF
- Active: #B9A7FF

### 4.3 Success/Error/Warning Button
- BG: #B9FFD6, #FFB9B9, #FFF7B9 (Light)
- Text: #1C1C1E
- Hover: เฉด pastel อ่อน/เข้มขึ้น
- Strong: ใช้ #34C759, #FF3B30, #FF9500 เฉพาะ icon หรือ border

### 4.4 Disabled Button
- BG: #E5E5EA
- Text: #AEAEB2
- Cursor: not-allowed

---

## 5. แนวทางความคมชัด (Contrast & Accessibility)

- ข้อความหลัก (primary text) ต้องมี contrast ≥ 4.5:1 กับพื้นหลัง
- ข้อความรอง/disabled ≥ 3:1
- ปุ่มพาสเทล + ข้อความเข้ม = ปลอดภัยสุด
- สีสด (strong) สำหรับ icon/border/indicator เท่านั้น
- ใช้ contrast checker (WebAIM, accessible-colors.com) ก่อน merge ทุกครั้ง
- หลีกเลี่ยง N600/N400 เป็นข้อความหลักบนพื้นอ่อน

---

## 6. หมายเหตุการใช้งาน

- ถ้าไม่แน่ใจเรื่องคู่สี ให้เลือก “พื้นพาสเทล + ข้อความเข้ม” แล้วตรวจสอบ contrast ทุกครั้ง
- Document ตัวอย่างปุ่ม/การ์ด/ฟอร์มที่ใช้คู่สีปลอดภัยใน Storybook/Design System
- หากต้องการเพิ่มสีใหม่ ต้องทดสอบกับข้อความเข้มและขาวเสมอ

---

## 7. Checklist สำหรับทีม

- [x] ปุ่มหลักใช้พาสเทล + ข้อความเข้ม
- [x] Contrast ผ่านขั้นต่ำ WCAG AA
- [x] Disabled/Secondary text ยังอ่านออก
- [x] สีความหมายใช้พาสเทลในพื้นหลัง, strong เฉพาะ icon/border
- [x] ถ้าใช้ strong BG ต้องใช้ข้อความขาว/เข้มแล้วแต่ contrast จริง
- [x] Document ตัวอย่างสีใน Figma/Storybook
