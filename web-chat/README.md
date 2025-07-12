# 🏰 Ashval Web Chat - Notion MCP Integration

เว็บอินเตอร์เฟสแชตที่รวม UnicornX Gemini Chat เข้ากับ Notion MCP Server

## 🌟 คุณสมบัติ

### 💬 Chat Interface
- **Multi-chat sessions**: สามารถสร้างและจัดการหลายๆ การสนทนาได้
- **Auto-rename chats**: ตั้งชื่อแชตอัตโนมัติจากเนื้อหาการสนทนา
- **Thai language support**: รองรับภาษาไทยเต็มรูปแบบ
- **Dark/Light theme**: เปลี่ยนธีมได้

### 📁 File Processing
- **Image support**: รองรับไฟล์รูปภาพ (JPEG, PNG, WebP)
- **Document support**: รองรับ PDF, Word, Excel, Text files
- **Drag & drop**: ลากไฟล์มาใส่ได้โดยตรง
- **Copy & paste**: คัดลอกรูปภาพมาวางได้

### 🔧 Notion MCP Tools
- **Projects Management**: จัดการโปรเจกต์ใน Notion Database
  - สร้างโปรเจกต์ใหม่
  - ค้นหาและกรองโปรเจกต์
  - อัพเดทข้อมูลโปรเจกต์
  - ดูสถิติโปรเจกต์
- **Characters, Scenes, Locations**: (พร้อมเพิ่มเติมในอนาคต)

### 📤 Export Features
- **PDF Export**: ส่งออกเป็นไฟล์ PDF พร้อม Thai font support
- **HTML Export**: ส่งออกเป็นเว็บเพจ
- **Text Export**: ส่งออกเป็น plain text
- **Markdown Export**: ส่งออกเป็น markdown format

## 🚀 การติดตั้ง

1. **จากโฟลเดอร์หลัก**:
   ```bash
   npm run build-web-chat    # Build web interface
   npm run start-web-chat    # เริ่ม development server (ใช้งานไม่ได้ในขณะนี้)
   ```

2. **จากโฟลเดอร์ web-chat**:
   ```bash
   cd web-chat
   npm install               # ติดตั้ง dependencies
   npm run build            # Build production
   npx vite                 # เริ่ม dev server (ต้องอนุญาต install vite@7.0.4)
   ```

## 🔑 การตั้งค่า

1. **เปิดเว็บแอป** จาก `dist/index.html` หรือ dev server
2. **คลิกปุ่ม Settings** (⚙️) ที่มุมขวาบน
3. **ใส่ API Keys**:
   - **Gemini API Key**: สำหรับ AI chatbot
   - **Notion Token**: สำหรับเชื่อมต่อ Notion
   - **Database IDs**: ID ของ Notion databases ต่างๆ
     - Projects Database ID
     - Characters Database ID
     - Scenes Database ID  
     - Locations Database ID

## 🎯 การใช้งาน

### พื้นฐาน
1. **พิมพ์ข้อความ** ในช่องแชตแล้วกด Enter
2. **แนบไฟล์** โดยคลิกปุ่ม 📎 หรือลากไฟล์มาวาง
3. **สร้างแชตใหม่** โดยคลิก "New Chat" ในแถบข้าง
4. **เปลี่ยนธีม** โดยคลิกปุ่ม 🌙/☀️

### Notion Tools
AI สามารถใช้ Notion tools อัตโนมัติเมื่อคุณถาม:
- "สร้างโปรเจกต์ใหม่ชื่อ 'เว็บไซต์ขายของ'"
- "ค้นหาโปรเจกต์ที่มีสถานะ In progress"
- "อัพเดทความคืบหน้าโปรเจกต์นี้เป็น 75%"
- "แสดงสถิติโปรเจกต์ทั้งหมด"

### Export
1. **คลิกปุ่ม Export** (📤) ที่หัวของแชต
2. **เลือกรูปแบบ**: PDF, HTML, TXT, หรือ MD
3. **ไฟล์จะดาวน์โหลดอัตโนมัติ**

## 🏗️ เทคโนโลยี

- **Frontend**: HTML5, CSS3, TypeScript
- **Build Tool**: Vite
- **AI**: Google Gemini 2.0 Flash Experimental
- **File Processing**: PDF.js, Mammoth, XLSX
- **Export**: jsPDF, html2canvas
- **Backend Integration**: Notion MCP Server

## 🔮 แผนการพัฒนาต่อ

- [ ] เพิ่ม Characters, Scenes, Locations tools
- [ ] ปรับปรุงการ export ให้รองรับ Thai fonts ดีขึ้น
- [ ] เพิ่มการจัดการหมวดหมู่แชต
- [ ] เพิ่มการค้นหาใน history
- [ ] รองรับไฟล์ประเภทอื่นๆ เพิ่มเติม
- [ ] เพิ่มการ sync กับ Notion real-time

## 🐛 ปัญหาที่ทราบ

- Dev server ต้องติดตั้ง vite@7.0.4 ด้วยตนเอง
- ใช้ built version ผ่าน `dist/index.html` แทนในขณะนี้
- Thai font ใน PDF export ยังไม่สมบูรณ์

## 📝 หมายเหตุ

เว็บแอปนี้รวม UnicornX Gemini Chat เข้ากับ Notion MCP Server ตามที่ผู้ใช้ร้องขอ โดยยังคงฟังก์ชั่นเดิมของ Airtable ไว้สำหรับใช้งานในอนาคต
