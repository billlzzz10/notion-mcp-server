# 🏰 Ashval Chat v2.1 - Perfect UX Edition

Modern web chat interface ที่รวม Gemini AI เข้ากับ Notion MCP Server พร้อม Auto-Detection Schema System

## ✨ **NEW in v2.1 - Perfect UX Edition**

### 🔧 **Environment Variables Support**
- ✅ **Auto-load API Keys จาก .env** - ไม่ต้องกรอกทุกครั้ง!
- ✅ Development-friendly configuration
- ✅ Type-safe environment variables

### 📱 **Enhanced UX**
- ✅ **Sidebar Toggle** - ปุ่มเบอร์เกอร์ (☰) ซ่อน/แสดง sidebar
- ✅ **Responsive Design** - ใช้งานได้ทุกหน้าจอ
- ✅ **Smooth Animations** - เคลื่อนไหวนุ่มนวลทุกจุด
- ✅ **Modern UI Components** - Design system สมบูรณ์แบบ

### 📎 **Advanced File Support**
- ✅ **รองรับไฟล์สูงสุด 10MB**
- ✅ **Multiple file types**: Text, Markdown, CSV, JSON, JavaScript, PDF, HTML, CSS
- ✅ **Image support**: JPEG, PNG, GIF, WebP
- ✅ **File preview** พร้อมแสดงขนาดไฟล์
- ✅ **Content processing** - ประมวลผลข้อความอัตโนมัติ

### 🔗 **Chat Sharing & Export**
- ✅ **Share Chat** - แชร์การสนทนาผ่าน Web Share API หรือ Clipboard
- ✅ **Chat Export** - ส่งออกรวมเวลาและข้อมูล
- ✅ **Message Actions** - Copy, Save to MCP ในทุกข้อความ

### 💾 **MCP Integration Enhanced**
- ✅ **Save to MCP** - บันทึกคำตอบ AI เข้า Notion Database
- ✅ **Auto-summarize** - สรุปเนื้อหาก่อนบันทึก
- ✅ **Smart database detection** - ตรวจหา schema อัตโนมัติ

## 🌟 คุณสมบัติหลัก

### 💬 **Chat Interface**
- **Multi-chat sessions**: สร้างและจัดการหลายการสนทนา
- **Auto-rename chats**: ตั้งชื่อแชตอัตโนมัติจากเนื้อหา
- **Thai language support**: รองรับภาษาไทยเต็มรูปแบบ
- **Message persistence**: บันทึกการสนทนาอัตโนมัติ

### 🤖 **AI Integration**
- **Gemini 2.0 Flash Experimental**: AI รุ่นล่าสุดจาก Google
- **Context awareness**: จำบริบทการสนทนาได้ยาว
- **Tool integration**: ใช้ Notion tools ได้อัตโนมัติ
- **Error handling**: จัดการข้อผิดพลาดอย่างชาญฉลาด

### 🔧 **Notion MCP Tools**
- **Auto-Detection Schema**: ตรวจหา database structure อัตโนมัติ
- **Dynamic field mapping**: แมป field อัตโนมัติตามชื่อ
- **Smart property creation**: สร้าง properties ตาม schema
- **Projects Management**: 
  - สร้างโปรเจกต์ใหม่
  - ค้นหาและกรองโปรเจกต์
  - อัพเดทข้อมูลโปรเจกต์
  - ดูสถิติโปรเจกต์

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
