# 🦄 Notion MCP Server

เซิร์ฟเวอร์ Node.js สำหรับรับ Webhook จาก Notion และส่งต่อข้อมูลไปยังบริการ Messaging/Line Notify  
**เหมาะสำหรับผู้ที่ต้องการเชื่อมโยง Notion automation กับระบบแจ้งเตือนแบบเรียลไทม์**

---

## 📦 คุณสมบัติหลัก

- รับ Webhook จาก Notion ผ่าน API Endpoint
- ประมวลผลข้อมูล และส่งต่อข้อความไปยัง Line Notify/บริการ Messaging อื่นๆ
- จัดการและขยายฟีเจอร์ได้ง่าย (โครงสร้างแยกไฟล์ชัดเจน)

---

## 🚀 วิธีเริ่มต้นใช้งาน

### 1️⃣ ติดตั้งโปรเจกต์

```bash
git clone https://github.com/billlzzz10/notion-mcp-server.git
cd notion-mcp-server
npm install
```

### 2️⃣ ตั้งค่า Environment Variables

สร้างไฟล์ `.env` ที่ root directory โดยดูตัวอย่างจาก `.env.example`

```env
SERVER_PORT=3000
LINE_NOTIFY_TOKEN=your_line_notify_token
NOTION_SECRET=your_notion_secret
NOTION_DATABASE_ID=your_notion_database_id
MESSAGING_SERVICE_URL=your_messaging_service_url
```

### 3️⃣ รันเซิร์ฟเวอร์

```bash
npm run start
```

---

## 🗂️ โครงสร้างโปรเจกต์

```plaintext
notion-mcp-server/
├── src/
│   ├── controllers/    # ตัวควบคุม API
│   ├── services/       # บริการหลัก
│   ├── utils/          # ตัวช่วยยูทิลิตี้
│   ├── routes/         # กำหนดเส้นทาง API
│   └── index.ts        # Entry point
├── .env                # ตัวแปรสภาพแวดล้อม (ไม่รวมใน git)
├── .env.example        # ตัวอย่างไฟล์ env
├── package.json        # ข้อมูลแพ็คเกจและสคริปต์
└── README.md           # เอกสารโปรเจกต์
```

---

## 🛠️ API Endpoint

### 📬 Notion Webhook

- **URL:** `/api/notion-webhook`
- **Method:** `POST`
- **Body:** ข้อมูล JSON ที่ส่งมาจาก Notion
- **คำอธิบาย:** จุดรับข้อมูลหลักจาก Notion Automation

---

## 💻 โหมดพัฒนา

```bash
npm run dev
```

- ใช้งาน nodemon เซิร์ฟเวอร์จะ restart อัตโนมัติเมื่อมีการแก้ไขไฟล์

---

## 🩺 การแก้ไขปัญหา

- ตรวจสอบ token และค่าใน `.env` ว่าถูกต้อง
- เช็คสถานะบริการภายนอก (เช่น Line API, Notion API)
- ดู log ข้อผิดพลาดในคอนโซล

---

## 🛠️ ฟีเจอร์ที่อาจเพิ่มในอนาคต

- ระบบทดสอบ (Testing)
- ระบบ log ที่ละเอียดขึ้น
- ระบบ authentication สำหรับ API

---

## 🤝 การร่วมพัฒนา

- Pull requests และ issue ใหม่ๆ ยินดีต้อนรับมาก!
- โปรดอ่านและปฏิบัติตามแนวทาง contribution ของโปรเจกต์

---

## 📄 License

MIT

---