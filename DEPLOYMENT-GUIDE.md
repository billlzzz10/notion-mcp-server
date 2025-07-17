# 🚀 UnicornX Server Deployment Guide

วิธีการ Deploy UnicornX server ให้รันได้ 24/7 และเข้าถึงได้จากทุกที่

## 📋 ขั้นตอนการ Deploy

### 1. เตรียม Server ให้พร้อม Deploy

```bash
# ตรวจสอบว่า server ทำงานได้
cd unicorn-x
node server.js
```

### 2. เลือกวิธี Deployment

#### 🌈 **Railway.app** (แนะนำ - ง่ายและฟรี)

```bash
# 1. สร้างบัญชีที่ https://railway.app
# 2. เชื่อมต่อ GitHub repository
# 3. เลือก "Deploy from GitHub repo"
# 4. ตั้งค่า Environment Variables:

NODE_ENV=production
NOTION_API_KEY=your_notion_key
NOTION_PROJECTS_DB_ID=your_db_id
```

#### 🎨 **Render.com** (ทางเลือกที่ดี)

```bash
# 1. สร้างบัญชีที่ https://render.com
# 2. เชื่อมต่อ GitHub repository
# 3. ตั้งค่า Build Command: npm ci
# 4. ตั้งค่า Start Command: node unicorn-x/server.js
```

#### 🔥 **Vercel** (สำหรับ Serverless)

```bash
# 1. Install Vercel CLI
npm i -g vercel

# 2. Deploy
vercel

# 3. ตั้งค่า Environment Variables ใน Vercel Dashboard
```

### 3. ตั้งค่า Environment Variables

```env
# Notion Configuration
NOTION_API_KEY=your_notion_api_key
NOTION_PROJECTS_DB_ID=your_projects_db_id
NOTION_TASKS_DB_ID=your_tasks_db_id
NOTION_CHARACTERS_DB_ID=your_characters_db_id
NOTION_SCENES_DB_ID=your_scenes_db_id
NOTION_LOCATIONS_DB_ID=your_locations_db_id

# Google Drive (Optional)
GDRIVE_CREDENTIALS={"type":"service_account",...}
GDRIVE_FOLDER_ID=your_folder_id

# Server Configuration
NODE_ENV=production
PORT=3000
```

### 4. ทดสอบหลัง Deploy

```bash
# ทดสอบ Health Check
curl https://your-app-url.com/api/health

# ทดสอบ API
curl -X POST https://your-app-url.com/api/command \
  -H "Content-Type: application/json" \
  -d '{"command": "สวัสดี"}'
```

## 🎯 วิธีใช้งานหลัง Deploy

### 1. เข้าถึง UnicornX Dashboard

```url
https://your-app-url.com/
```

### 2. ส่ง Request ผ่าน API

```javascript
// Example: ส่งคำสั่งไป UnicornX
const response = await fetch('https://your-app-url.com/api/command', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    command: 'สร้าง task ใหม่ชื่อ "ทำงาน UnicornX"'
  })
});

const result = await response.json();
console.log(result);
```

### 3. ใช้งานผ่าน Postman หรือ cURL

```bash
# GET Health Check
curl https://your-app-url.com/api/health

# POST Command
curl -X POST https://your-app-url.com/api/command \
  -H "Content-Type: application/json" \
  -d '{
    "command": "แสดงรายการ projects ทั้งหมด"
  }'

# GET Dashboard
curl https://your-app-url.com/api/dashboard
```

## ✅ ประโยชน์ที่ได้

- 🌍 **เข้าถึงได้จากทุกที่**: ใช้งานผ่าน URL
- 🔄 **รันต่อเนื่อง 24/7**: ไม่ต้องเปิดเครื่องเอง
- 📱 **รองรับทุกอุปกรณ์**: มือถือ, แท็บเล็ต, คอมพิวเตอร์
- 🔒 **HTTPS Secure**: ปลอดภัยด้วย SSL
- 🚀 **Auto Scaling**: รองรับผู้ใช้หลายคนพร้อมกัน

## 🎉 ตัวอย่างการใช้งาน

```bash
# สร้างโปรเจค Ashval ใหม่
curl -X POST https://your-unicornx.railway.app/api/command \
  -H "Content-Type: application/json" \
  -d '{"command": "สร้างโปรเจค Ashval Novel"}'

# ดูสถานะทั้งหมด
curl https://your-unicornx.railway.app/api/dashboard
```
