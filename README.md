```typescript
get-github-data
{
  "endpoint": "/repos/billlzzz10/notion-mcp-server/contents/README.md",
  "method": "GET"
}
```

ต่อไปนี้คือ README ฉบับภาษาไทยครับ:

# Notion MCP Server

## ภาพรวม

เซิร์ฟเวอร์ที่ใช้สำหรับรับคำขอจาก Notion Server และดำเนินการตามนั้น โดยใช้ Messaging Service และไลบรารีสนับสนุนอื่นๆ เซิร์ฟเวอร์นี้จะดำเนินการหลักๆ ดังนี้:

- รับคำขอจาก Notion Server ผ่าน API Endpoint
- ประมวลผลและส่งข้อความผ่าน Messaging Service
- ส่งการแจ้งเตือนผ่าน Line API

## การติดตั้ง

1. โคลนรีโพสิทอรี่นี้
2. รันคำสั่ง `npm install` เพื่อติดตั้งแพ็คเกจที่จำเป็น
3. สร้างไฟล์ `.env` ตามตัวอย่างในไฟล์ `.env.example`
4. รันคำสั่ง `npm run start` เพื่อเริ่มเซิร์ฟเวอร์

## การตั้งค่าสภาพแวดล้อม

สร้างไฟล์ `.env` ในไดเร็กทอรีรูทของโปรเจคและตั้งค่าต่อไปนี้:

```
SERVER_PORT=3000
LINE_NOTIFY_TOKEN=your_line_notify_token
NOTION_SECRET=your_notion_secret
NOTION_DATABASE_ID=your_notion_database_id
MESSAGING_SERVICE_URL=your_messaging_service_url
```

## การใช้งาน

เซิร์ฟเวอร์จะรันบนพอร์ตที่ระบุใน `.env` หรือใช้ค่าเริ่มต้น 3000 เมื่อไม่ได้ระบุ คำขอ API สามารถส่งไปที่:

```
http://localhost:3000/api/notion-webhook
```

## โครงสร้างโปรเจค

```
notion-mcp-server/
├── src/
│   ├── controllers/    # ตัวควบคุมสำหรับการจัดการคำขอ API
│   ├── services/       # บริการธุรกิจหลัก
│   ├── utils/          # ยูทิลิตี้และตัวช่วย
│   ├── routes/         # เส้นทาง API
│   └── index.ts        # จุดเริ่มต้นแอปพลิเคชัน
├── .env                # ตัวแปรสภาพแวดล้อม (ไม่รวมใน git)
├── .env.example        # ตัวอย่างตัวแปรสภาพแวดล้อม
├── package.json        # แพ็คเกจและสคริปต์
└── README.md           # เอกสารโปรเจค
```

## API Endpoints

### Notion Webhook
- **URL**: `/api/notion-webhook`
- **Method**: `POST`
- **Body**: ข้อมูลที่ส่งมาจาก Notion Server
- **คำอธิบาย**: จุดเริ่มต้นสำหรับรับข้อมูลจาก Notion

## การพัฒนา

1. รันคำสั่ง `npm run dev` เพื่อเริ่มเซิร์ฟเวอร์ในโหมดพัฒนา (ด้วย nodemon)
2. ทำการเปลี่ยนแปลงโค้ดของคุณ
3. เซิร์ฟเวอร์จะรีสตาร์ทโดยอัตโนมัติเมื่อมีการเปลี่ยนแปลงไฟล์

## การแก้ไขปัญหา

หากคุณพบปัญหาในการเชื่อมต่อกับ Notion API หรือ Line API ตรวจสอบว่า:

1. โทเค็นและคีย์ทั้งหมดในไฟล์ `.env` ถูกต้อง
2. บริการภายนอกที่คุณกำลังใช้งานอยู่
3. คอนโซลและบันทึกเพื่อดูข้อความข้อผิดพลาดโดยละเอียด

## การเพิ่มเติมในอนาคต

- การเพิ่มการทดสอบ
- การเพิ่มการบันทึกที่ดีขึ้น
- การเพิ่มการตรวจสอบสิทธิ์สำหรับ API Endpoint

## การมีส่วนร่วม

การมีส่วนร่วมยินดีต้อนรับ! กรุณาส่ง pull request หรือเปิด issue สำหรับการปรับปรุงที่เสนอ

## ลิขสิทธิ์

MIT