# Production Setup Guide

## Quick Setup สำหรับ Frontend Team

### 1. Backend URLs ที่ใช้:
```
API Gateway: http://your-domain.com:3001
Health Check: http://your-domain.com:3001/health
Chat API: http://your-domain.com:3001/api/agent/webhook/make
Databases API: http://your-domain.com:3001/api/databases
```

### 2. สิ่งที่ Frontend ต้องทำ:
1. ส่ง HTTP POST ไป `/api/agent/webhook/make` สำหรับ chat
2. ส่ง HTTP GET ไป `/api/databases` เพื่อดูรายการ database
3. ส่ง HTTP GET ไป `/api/database/{id}/pages` เพื่อดูข้อมูลใน database
4. Handle JSON response ตามตัวอย่างใน FRONTEND-API-GUIDE.md

### 3. การ Deploy:
**Backend (ฝั่งเรา):**
```bash
npm run build
npm run start-gateway  # รันที่ port 3001
```

**Frontend (ฝั่งคุณ):**
- สร้าง React/Vue/Angular app
- เรียก API ตาม documentation
- Deploy ที่ domain ของคุณ

### 4. ตัวอย่าง Code:
```javascript
// ส่งข้อความ chat
const response = await fetch('http://your-backend:3001/api/agent/webhook/make', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ message: "สวัสดี" })
});
const data = await response.json();
console.log(data.response); // คำตอบจาก AI
```

ถ้าต้องการ code ตัวอย่างเพิ่มเติม หรือมีคำถามเพิ่มเติม สามารถถามได้เลยครับ!
