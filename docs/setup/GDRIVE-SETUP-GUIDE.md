# Google Drive Integration Example
# คู่มือการตั้งค่าตัวแปร Environment Variables สำหรับ Google Drive Upload

## 📋 Required Environment Variables

### Notion API
```bash
NOTION_API_KEY=secret_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
NOTION_PROJECTS_DB_ID=xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
NOTION_TASKS_DB_ID=xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
NOTION_CHARACTERS_DB_ID=xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
NOTION_SCENES_DB_ID=xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
NOTION_LOCATIONS_DB_ID=xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
```

### Google Drive API
```bash
# Service Account Credentials (JSON format)
GDRIVE_CREDENTIALS='{"type":"service_account","project_id":"your-project","private_key_id":"...","private_key":"-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n","client_email":"...@your-project.iam.gserviceaccount.com","client_id":"...","auth_uri":"https://accounts.google.com/o/oauth2/auth","token_uri":"https://oauth2.googleapis.com/token","auth_provider_x509_cert_url":"...","client_x509_cert_url":"..."}'

# Google Drive Folder ID (จาก URL)
GDRIVE_FOLDER_ID=1VdW0hPyTBcpuLP19Jz-8Odat0Q6UwR0a
```

## 🔧 การสร้าง Google Service Account

### 1. เปิด Google Cloud Console
```
https://console.cloud.google.com/
```

### 2. สร้าง Project ใหม่ (หรือเลือกที่มีอยู่)
- ไปที่ "Select a project" > "New Project"
- ตั้งชื่อ project เช่น "notion-backup"

### 3. เปิดใช้งาน Google Drive API
- ไปที่ "APIs & Services" > "Library"
- ค้นหา "Google Drive API"
- กด "Enable"

### 4. สร้าง Service Account
- ไปที่ "APIs & Services" > "Credentials"
- กด "Create Credentials" > "Service Account"
- ตั้งชื่อ เช่น "notion-backup-service"
- กด "Create and Continue"

### 5. ดาวน์โหลด Key File
- ใน Service Account ที่สร้าง
- ไปที่ "Keys" tab
- กด "Add Key" > "Create new key"
- เลือก "JSON"
- ดาวน์โหลดไฟล์

### 6. แปลง JSON เป็น Environment Variable
```bash
# Linux/Mac
export GDRIVE_CREDENTIALS="$(cat /path/to/your/keyfile.json | jq -c .)"

# Windows PowerShell
$env:GDRIVE_CREDENTIALS = (Get-Content "C:\path\to\your\keyfile.json" | ConvertFrom-Json | ConvertTo-Json -Compress)
```

## 📁 การหา Google Drive Folder ID

### จาก URL ของโฟลเดอร์
```
https://drive.google.com/drive/folders/1VdW0hPyTBcpuLP19Jz-8Odat0Q6UwR0a
                                        ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^
                                        นี่คือ Folder ID
```

### ขั้นตอน:
1. เปิด Google Drive
2. สร้างโฟลเดอร์ใหม่ชื่อ "Notion Backup"
3. คลิกขวาโฟลเดอร์ > "Share"
4. เพิ่ม email ของ Service Account ที่สร้าง
5. ให้สิทธิ์ "Editor"
6. คัดลอก URL ของโฟลเดอร์

## 🚀 GitHub Secrets Setup

### ไปที่ Repository Settings > Secrets and Variables > Actions

เพิ่ม Secrets ต่อไปนี้:

| Secret Name | Value |
|-------------|--------|
| `NOTION_API_KEY` | Token จาก Notion |
| `NOTION_PROJECTS_DB_ID` | Database ID ของ Projects |
| `NOTION_TASKS_DB_ID` | Database ID ของ Tasks |
| `NOTION_CHARACTERS_DB_ID` | Database ID ของ Characters |
| `NOTION_SCENES_DB_ID` | Database ID ของ Scenes |
| `NOTION_LOCATIONS_DB_ID` | Database ID ของ Locations |
| `GDRIVE_CREDENTIALS` | JSON credentials ของ Service Account |
| `GDRIVE_FOLDER_ID` | Folder ID ของ Google Drive |

## 🧪 การทดสอบ Local

### 1. สร้างไฟล์ .env
```bash
# สร้างไฟล์ .env ใน root project
touch .env
```

### 2. เพิ่มตัวแปรลงในไฟล์ .env
```bash
NOTION_API_KEY=your_notion_token
GDRIVE_CREDENTIALS='{"type":"service_account",...}'
GDRIVE_FOLDER_ID=your_folder_id
DATABASE_TYPE=all
TARGET_FOLDER=notion-backup
```

### 3. ทดสอบการทำงาน
```bash
# ทดสอบดึงข้อมูลจาก Notion
npm run notion:pull

# ทดสอบอัปโหลดไป Google Drive
npm run gdrive:upload

# ทดสอบทั้งกระบวนการ
npm run backup:notion
```

## 📊 ผลลัพธ์ที่คาดหวัง

### โครงสร้างไฟล์ใน Google Drive:
```
📁 Notion Backup
  └── 📁 2025-07-17
      ├── 📄 notion-projects-2025-07-17.json
      ├── 📄 notion-tasks-2025-07-17.json
      ├── 📄 notion-characters-2025-07-17.json
      ├── 📄 notion-scenes-2025-07-17.json
      ├── 📄 notion-locations-2025-07-17.json
      ├── 📄 notion-data-2025-07-17.json (รวม)
      ├── 📄 notion-summary-2025-07-17.json (สรุป)
      └── 📄 upload-report.json (รายงานการอัปโหลด)
```

## 🔒 Security Best Practices

1. **ไม่เก็บ credentials ใน code**
2. **ใช้ Service Account แทน Personal Account**
3. **จำกัดสิทธิ์ของ Service Account**
4. **หมุนเวียน API Keys เป็นระยะ**
5. **ตั้งค่า Folder permissions อย่างระมัดระวัง**

## 🔧 Troubleshooting

### Error: "The caller does not have permission"
- ตรวจสอบว่า Service Account มีสิทธิ์ในโฟลเดอร์
- ตรวจสอบ Google Drive API ถูก enable แล้ว

### Error: "File not found"
- ตรวจสอบ Folder ID ถูกต้อง
- ตรวจสอบโฟลเดอร์ destination มีไฟล์

### Error: "Invalid credentials"
- ตรวจสอบ JSON format ของ GDRIVE_CREDENTIALS
- ตรวจสอบ Service Account key ไม่หมดอายุ
