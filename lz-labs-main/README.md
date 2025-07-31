# Ashval Writer's Suite - เอกสารทางเทคนิคสำหรับนักพัฒนา

> **หมายเหตุสำคัญ:** เอกสารนี้จะต้องได้รับการอัปเดตเป็น **ภาษาไทย** เสมอ กรุณาใช้หัวข้อที่มีอยู่และเพิ่มเติมเนื้อหาต่อท้ายเมื่อมีการอัปเดตฟีเจอร์หรือโครงสร้างใหม่

---

## 1. ภาพรวมโปรเจกต์ (Overview)

**Ashval Writer's Suite** คือชุดเครื่องมือสำหรับนักเขียนที่ขับเคลื่อนด้วย AI ถูกออกแบบมาเพื่อเป็นผู้ช่วยที่ครบวงจร ตั้งแต่การจดบันทึก, จัดการไอเดีย, สร้างเนื้อหา, วางโครงเรื่อง, ไปจนถึงการสร้างและสำรวจโลกในจินตนาการผ่านแผนภาพความรู้ (Knowledge Map)

โปรเจกต์นี้เป็นแอปพลิเคชันฝั่ง Client-side ทั้งหมด (ทำงานบนเบราว์เซอร์ของผู้ใช้) โดยไม่มี Backend Server เป็นของตัวเอง ทำให้ง่ายต่อการติดตั้งและดูแลรักษา

<!-- เพิ่มภาพสาธิต GIF -->
![](assets/demo.gif)

## 2. ฟีเจอร์หลัก (Core Features)

-   **Dashboard:** ภาพรวมความคืบหน้าของโปรเจกต์, สถิติการเขียน, และภารกิจประจำวัน (Daily Quests)
-   **Notes:** ระบบจดบันทึกที่ยืดหยุ่น รองรับ Markdown, การจัดหมวดหมู่, และการนำเข้า/ส่งออก
-   **AI Writer:** ผู้ช่วยนักเขียน AI ที่ปรับเปลี่ยนบุคลิก (Personality) ได้ มาพร้อมกับ:
    -   **AI Mentor Panel:** เครื่องมือวิเคราะห์เชิงลึกที่รวมเครื่องมือย่อยๆ ไว้ในที่เดียว
    -   **Context Selector:** ความสามารถในการดึงเนื้อหาจากโน้ตต่างๆ มาเป็นบริบท (Context) ให้กับ AI
-   **Graph View (Knowledge Map):** แผนภาพความรู้ที่ได้รับการปรับปรุงใหม่ แสดงความเชื่อมโยงของข้อมูลในรูปแบบไดนามิกที่ได้รับแรงบันดาลใจจาก Obsidian มีระบบฟิสิกส์ที่ทำให้โหนด "ลอย" และเคลื่อนไหวอย่างสวยงาม
-   **Lore Manager:** ศูนย์กลางในการจัดการ "จุดในโครงเรื่อง" (Plot Points) และ "องค์ประกอบโลก" (World Elements)
-   **เครื่องมือเสริม:** Pomodoro Timer, Dictionary, และเครื่องมือสร้างโครงสร้างเรื่อง

## 3. เทคโนโลยีและเครื่องมือ (Technology Stack)

-   **Frontend Framework:** React (v19) with TypeScript
-   **Styling:** Tailwind CSS (กำหนดค่าผ่าน CDN ใน `index.html`) และ CSS Variables สำหรับ Style Guide
-   **AI Integration:** Google Gemini API ผ่าน `@google/genai`
-   **Data Visualization:**
    -   `vis-network` สำหรับ Graph View
    -   `Chart.js` สำหรับแผนภูมิใน Dashboard
-   **Icon System:** **SVG Sprite System** - ไอคอนทั้งหมดถูกรวมอยู่ใน `assets/icons.svg` และเรียกใช้ผ่านคอมโพเนนต์ `<Icon />` เพื่อประสิทธิภาพและความสอดคล้อง
-   **Markdown Parsing:** `marked`
-   **Data Storage:** `localStorage` ของเบราว์เซอร์ สำหรับเก็บข้อมูลทั้งหมดของผู้ใช้

## 4. วิธีการติดตั้งและพัฒนาต่อ (Setup for Development)

### 4.1. การรันโปรเจกต์ (Running the Project)

เนื่องจากโปรเจกต์นี้ไม่มีขั้นตอนการ build ที่ซับซ้อนและใช้ CDN เป็นหลัก คุณสามารถรันโปรเจกต์บนเครื่องของคุณได้ง่ายๆ:

1.  Clone a copy of the repository.
2.  เปิดโฟลเดอร์โปรเจกต์ใน Code Editor ที่คุณถนัด (เช่น VS Code)
3.  ติดตั้ง Extension ที่ทำหน้าที่เป็น Live Server (เช่น **"Live Server"** โดย Ritwick Dey)
4.  คลิกขวาที่ไฟล์ `index.html` แล้วเลือก **"Open with Live Server"**
5.  เบราว์เซอร์จะเปิดขึ้นมาพร้อมกับแอปพลิเคชันที่กำลังทำงาน

### 4.2. การตั้งค่า API Key (สำคัญมาก)

เพื่อความปลอดภัย **ห้าม hardcode API Key ลงในซอร์สโค้ดเด็ดขาด** แอปพลิเคชันถูกออกแบบมาเพื่อดึง API Key จาก Environment Variables เท่านั้น

**สำหรับนักพัฒนา (ระหว่างการพัฒนา):**
คุณสามารถจำลอง Environment Variable ได้ชั่วคราวโดยการแก้ไขไฟล์ `index.html` **(คำเตือน: ห้าม commit การเปลี่ยนแปลงนี้ขึ้น Git เด็ดขาด)**

1.  เปิดไฟล์ `index.html`
2.  เพิ่มโค้ดส่วนนี้เข้าไปใน `<head>`:
    ```html
    <!-- ใน <head> ของ index.html -->
    <script>
        // FOR DEVELOPMENT ONLY - DO NOT COMMIT THIS BLOCK
        var process = {
            env: {
                API_KEY: 'YOUR_GEMINI_API_KEY_HERE'
            }
        };
    </script>
    ```
3.  แทนที่ `YOUR_GEMINI_API_KEY_HERE` ด้วย Key ของคุณ
4.  บันทึกไฟล์ (ไม่ต้อง commit) แล้ว Live Server จะรีเฟรชหน้าเว็บให้โดยอัตโนมัติ

**สำหรับ Deployment (เมื่อนำขึ้น Production):**
1.  ไปที่หน้าตั้งค่าของ Hosting Platform ของคุณ (เช่น Vercel, Netlify)
2.  มองหาส่วน "Environment Variables"
3.  สร้าง Variable ใหม่ชื่อ **`API_KEY`** และใส่ Google Gemini API Key ของคุณ
4.  บันทึกและ Deploy โปรเจกต์ใหม่ โค้ดจะใช้ค่าจาก Environment Variable นี้โดยอัตโนมัติ

### 4.3 วิธีสร้างสาธิตเป็น GIF
- ในหน้า **AI Writer** ให้คลิกปุ่ม **Record GIF** เพื่อเริ่มบันทึกการใช้งาน
- ทำการป้อนข้อความและเลือกโมเดลตามต้องการ รอให้ AI สร้างผลลัพธ์เสร็จ
- คลิกปุ่ม **Stop** ระบบจะสร้างไฟล์ GIF ให้ดาวน์โหลดอัตโนมัติ

## 5. โครงสร้างโฟลเดอร์ (Folder Structure)

### 5.1. โครงสร้างปัจจุบัน (Current Structure)

นี่คือโครงสร้างไฟล์และคำอธิบายของโปรเจกต์ในปัจจุบัน:

```
/
├── assets/
│   └── icons.svg           # (ใหม่) SVG sprite sheet สำหรับไอคอนทั้งหมดของแอป
├── components/
│   ├── charts/             # คอมโพเนนต์สำหรับแสดงผลแผนภูมิต่างๆ (Dashboard)
│   │   ├── ActivityChart.tsx
│   │   ├── ContentDistributionChart.tsx
│   │   └── StatRingChart.tsx
│   ├── views/              # คอมโพเนนต์หลักที่ทำหน้าที่เป็น "หน้า" หรือ "วิว"
│   │   ├── AiWriterView.tsx
│   │   ├── DashboardView.tsx
│   │   ├── DictionaryView.tsx
│   │   ├── GraphView.tsx     # (ปรับปรุง) แสดง Knowledge Map แบบไดนามิก
│   │   ├── LoreManagerView.tsx
│   │   ├── NotesView.tsx
│   │   ├── PlaceholderView.tsx
│   │   ├── PomodoroView.tsx
│   │   ├── SettingsView.tsx
│   │   ├── StoryStructureGeneratorView.tsx
│   │   └── TasksView.tsx
│   ├── AiMentorPanel.tsx   # (ใหม่) Panel เครื่องมือวิเคราะห์ของ AI ในหน้า AI Writer
│   ├── ContextSelectorModal.tsx # Modal สำหรับเลือก Note เพื่อเป็น Context ให้ AI
│   ├── Header.tsx          # แถบ Header ด้านบน
│   ├── Icon.tsx            # (ใหม่) คอมโพเนนต์สำหรับเรียกใช้ไอคอนจาก sprite sheet
│   ├── MobileControls.tsx  # ปุ่ม Quick Action สำหรับหน้าจอมือถือ
│   ├── NoteEditorModal.tsx # Modal สำหรับสร้างและแก้ไข Note
│   ├── ProjectSelectorDropdown.tsx # Dropdown สำหรับเลือกโปรเจกต์
│   └── Sidebar.tsx         # เมนูหลักด้านข้าง
├── App.tsx                 # คอมโพเนนต์หลัก จัดการ state ทั้งหมดและ view routing
├── constants.ts            # ค่าคงที่ต่างๆ ที่ใช้ในแอป (config, text, initial data)
├── index.html              # ไฟล์ HTML หลัก, โหลด CDN, กำหนด Style Guide ผ่าน CSS
├── index.tsx               # Entry point ของ React
├── metadata.json           # ข้อมูล metadata สำหรับแพลตฟอร์ม
├── prompts.ts              # คลัง System Instructions สำหรับ AI Personalities และ Tools
├── README.md               # เอกสารนี้
├── STYLE_GUIDE.md          # เอกสารอธิบายแนวทางการออกแบบ (Design System)
├── types.ts                # TypeScript type definitions ทั้งหมดที่ใช้ในโปรเจกต์
└── utils.ts                # ฟังก์ชันช่วยเหลือทั่วไป (เช่น parse markdown, นับตัวอักษร)
```

### 5.2. ไฟล์ที่ควรลบ (Obsolete Files)

ไฟล์เหล่านี้ถูกรวมเข้ากับส่วนอื่นหรือเลิกใช้งานแล้ว สามารถลบออกจากโปรเจกต์ได้อย่างปลอดภัย:

-   `components/views/UniverseMapView.tsx`
    -   **เหตุผล:** เป็นแนวคิดที่เข้าใจผิด ถูกแทนที่ด้วยการปรับปรุง `GraphView` ให้มีความสามารถมากขึ้น

### 5.3. โครงสร้างที่วางแผนไว้ในอนาคต (Future Architecture)

เพื่อรองรับการขยายตัวและทำให้โค้ดเป็นระเบียบมากขึ้น มีแผนจะปรับโครงสร้างโปรเจกต์ดังนี้:

```
/src/
├── assets/
│   └── icons.svg
├── components/
│   ├── common/             # คอมโพเนนต์เล็กๆ ที่ใช้ซ้ำได้ทั่วไป (Button, Input, Icon)
│   ├── layout/             # คอมโพเนนต์โครงสร้างหลัก (Header, Sidebar)
│   ├── modals/             # คอมโพเนนต์ Modal ทั้งหมด
│   └── views/              # คอมโพเนนต์หน้าหลัก (DashboardView, NotesView, etc.)
├── constants/
│   ├── index.ts            # (เดิมคือ constants.ts)
│   └── prompts.ts          # (เดิมคือ prompts.ts)
├── contexts/               # (ใหม่) React Contexts สำหรับ Global State Management
│   ├── ProjectContext.tsx
│   └── ThemeContext.tsx
├── hooks/                  # (ใหม่) Custom React Hooks ที่ใช้ซ้ำได้
│   └── useLocalStorage.ts
├── services/               # (ใหม่) แยก Logic การสื่อสารกับ API ภายนอก
│   ├── AiService.ts
├── types/
│   └── index.ts            # (เดิมคือ types.ts)
├── utils/
│   └── index.ts            # (เดิมคือ utils.ts)
└── App.tsx                 # Entry Point หลักของแอป
```

## 6. โร้ดแมพการพัฒนา (Roadmap)

### ระยะสั้น (Short-term)

-   [✅] **UI/UX Overhaul:** ปรับปรุงดีไซน์ทั้งหมด, เพิ่มอนิเมชั่น, และธีมสีใหม่
-   [✅] **Consolidated AI Mentor:** รวมเครื่องมือวิเคราะห์ AI ไว้ใน `AiMentorPanel`
-   [✅] **Custom Icon System:** เปลี่ยนมาใช้ SVG Sprite และ `<Icon />` component
-   [✅] **Graph View Enhancement:** ปรับปรุง Graph View ให้มีระบบฟิสิกส์และความสวยงามมากขึ้น
-   [ ] **Auto-Outlining:** ให้ AI ช่วยดึงหัวข้อจากเนื้อหามาสร้างเป็น Outline อัตโนมัติ
-   [ ] **Advanced Note Linking:** พัฒนาระบบการเชื่อมโยงระหว่างข้อมูลใน Graph View ให้ใช้งานง่ายขึ้น

### ระยะกลาง (Medium-term)

-   [ ] **AI-Powered Graph Analysis:** ให้ AI ช่วยวิเคราะห์ความสัมพันธ์ใน Graph View
-   [ ] **Contextual AI in Note Editor:** ให้ AI ช่วยเขียน/สรุปโดยใช้บริบทจากโน้ตที่เปิดอยู่
-   [ ] **Customizable UI:** ให้ผู้ใช้ปรับแต่งสไตล์ H1-H3, สี, และส่วนประกอบอื่นๆ ได้
-   [ ] **Prompt Management:** ระบบจัดการและบันทึก Prompt ที่ใช้บ่อย

### ระยะยาว (Long-term)

-   [ ] **Freeform Canvas/Mind Map:** พัฒนา Graph View ไปสู่ Canvas ที่สามารถปักหมุดและโยงเส้นได้อย่างอิสระ
-   [ ] **Collaboration Features:** (พิจารณ) ฟีเจอร์สำหรับการทำงานร่วมกันบนโปรเจกต์
-   [ ] **Mobile App / PWA:** พัฒนาเป็นแอปพลิเคชันสำหรับมือถือ

## 7. งานต่อไปที่ต้องปรับใน Frontend (Next Steps)

นี่คือแผนการพัฒนาในระยะถัดไป เพื่อปรับปรุงคุณภาพของโค้ดและเตรียมพร้อมสำหรับฟีเจอร์ในอนาคต:

1.  **Refactor State Management:**
    *   **ปัญหา:** ขณะนี้ State ทั้งหมดถูกจัดการอยู่ที่ `App.tsx` ทำให้เกิด "Prop Drilling" (การส่ง props ผ่านหลายชั้น) ซึ่งทำให้โค้ดซับซ้อนและดูแลรักษายาก
    *   **แนวทางการแก้ไข:** นำ **React Context API** มาใช้เพื่อจัดการ Global State เช่น `ProjectContext` (สำหรับ `projects`, `currentProjectId`, และฟังก์ชันที่เกี่ยวข้อง) และ `ThemeContext` (สำหรับ `isDarkMode` และ `toggleTheme`) วิธีนี้จะช่วยให้คอมโพเนนต์ต่างๆ เข้าถึง State ที่จำเป็นได้โดยตรง

2.  **ปรับปรุง Graph View เพิ่มเติม:**
    *   **เพิ่มความสามารถในการโต้ตอบ:**
        *   **สร้างโหนดโดยตรง:** เพิ่มความสามารถให้ผู้ใช้สามารถคลิกขวาบน Canvas เพื่อสร้าง Note, Plot Point, หรือ World Element ใหม่ได้โดยตรงจาก Graph View
        *   **ค้นหาและไฮไลท์:** เพิ่มช่องค้นหาสำหรับกรองโหนดในกราฟ และไฮไลท์โหนดที่ตรงกับคำค้นหา
    *   **ปรับปรุง Layout:** เพิ่มตัวเลือก Layout อื่นๆ นอกเหนือจาก Force-Directed และ Hierarchical เช่น Circular หรือ Grid

3.  **ต่อยอด AI Writer:**
    *   **ระบบจัดการ Prompt:** สร้าง UI สำหรับให้ผู้ใช้สามารถ "บันทึก Prompt ที่ใช้บ่อย" เพื่อเรียกใช้งานซ้ำได้ง่ายๆ
    *   **บันทึกผลลัพธ์ลงโน้ตโดยตรง:** หลังจาก AI ตอบกลับมา ควรมีปุ่มให้ผู้ใช้สามารถบันทึกคำตอบนั้นเป็น Note ใหม่ได้ทันที โดยอาจให้ AI ช่วยสรุป Title และ Category ให้โดยอัตโนมัติ

4. **AI Prompt API Integration:**
   - เพิ่มเรียกใช้ endpoint `POST /api/prompt` ใน `AiWriterView.tsx` พร้อมส่ง `seed`, `gender`, และ `custom` ให้ backend
   - สร้าง UI สำหรับเลือกโมเดล (เช่น Gemini vs DeepSeek) และส่งพารามิเตอร์ `model` ในการเรียก
   - จัดการแสดงผล loading และแสดงข้อความผลลัพธ์ที่ได้รับจาก AI

5. **End-to-End Testing for Prompt Generation:**
   - ทดสอบว่าเมื่อเลือกโมเดลและกรอก input แล้ว จะเรียก API และแสดงผลตอบกลับอย่างถูกต้อง
   - ตรวจสอบการจัดการข้อผิดพลาด (error handling) ในกรณีเรียก API ไม่สำเร็จ

---

### **บันทึกสำหรับนักพัฒนา (Note for Developers)**

1.  **ภาษา:** กรุณาอัปเดตเอกสาร README ทั้งหมด (ไฟล์นี้และไฟล์ย่อย) เป็น **ภาษาไทย** เท่านั้น
2.  **โครงสร้าง:** โปรดรักษาโครงสร้างหัวข้อ (Headers) ของเอกสารนี้ไว้ตามเดิม หากมีการเปลี่ยนแปลงหรือเพิ่มเติม ให้เพิ่มเนื้อหาเข้าไปในหัวข้อที่เกี่ยวข้อง หรือเพิ่มหัวข้อย่อยใหม่ตามความเหมาะสม
3.  **ความสม่ำเสมอ:** โค้ดใหม่ที่เพิ่มเข้ามาควรเป็นไปตามสไตล์และรูปแบบของโค้ดที่มีอยู่เดิม เพื่อรักษาความสม่ำเสมอของโปรเจกต์
