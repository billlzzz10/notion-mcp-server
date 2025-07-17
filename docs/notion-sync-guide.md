# 🚀 Notion Sync Guide

คู่มือการใช้งาน Notion synchronization workflows สำหรับโปรเจ็ค

## 🎯 Overview

ระบบ Notion sync ของเราทำให้สามารถ:
- **Pull**: ดึงข้อมูลจาก Notion databases มาเป็นไฟล์ Markdown
- **Push**: ส่งไฟล์ Markdown กลับไปอัปเดตใน Notion
- **Backup**: สำรองข้อมูลไปยัง Google Drive (optional)

## 📋 Setup Requirements

### 1. Notion Integration
1. สร้าง [Notion Integration](https://www.notion.so/my-integrations)
2. คัดลอก **Internal Integration Token**
3. เพิ่ม Integration ให้ access databases ที่ต้องการ
4. คัดลอก **Database IDs** จาก URL

### 2. GitHub Secrets
เพิ่ม secrets เหล่านี้ใน repository settings:

```
NOTION_TOKEN=secret_xxx...
NOTION_CHARACTERS_DB_ID=xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
NOTION_SCENES_DB_ID=xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
NOTION_LOCATIONS_DB_ID=xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
```

### 3. Google Drive (Optional)
สำหรับ backup:
```
GOOGLE_SERVICE_ACCOUNT_EMAIL=your-service@project.iam.gserviceaccount.com
GOOGLE_PRIVATE_KEY=-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----
GOOGLE_DRIVE_FOLDER_ID=1abc...xyz
```

## 🔄 How to Use

### Pull from Notion (Manual)
1. ไปที่ **Actions** tab ใน GitHub
2. เลือก **"Pull from Notion"** workflow
3. กด **"Run workflow"**
4. ระบุ Database ID (หรือใช้ default)
5. รอ workflow ทำงานเสร็จ
6. ไฟล์ใหม่จะปรากฏใน `vault/` folder

### Push to Notion (Manual)
1. สร้างหรือแก้ไขไฟล์ใน `vault/` folder
2. ไปที่ **Actions** tab
3. เลือก **"Push to Notion"** workflow
4. กด **"Run workflow"**
5. ระบุ path ของไฟล์ เช่น `vault/My-Character.md`
6. รอ workflow ทำงานเสร็จ

### Local Testing
```bash
# Test pull from Notion
npm run notion:pull

# Test push to Notion (ต้องตั้ง FILE_TO_SYNC environment variable)
FILE_TO_SYNC=vault/test.md npm run notion:push
```

## 📁 File Structure

```
vault/
├── Character-Name.md
├── Scene-Title.md
├── Location-Name.md
└── ...
```

### Markdown Format
```markdown
# Character Name

<!-- Notion Page ID: xxx-xxx-xxx -->
<!-- Last synced: 2025-07-17T... -->

**Race**: Human
**Status**: Alive
**Faction**: Heroes

Character description and content here...

---
*Synced from Notion by GitHub Action*
```

## 🛠️ Configuration

### Database Schema Examples

#### Characters Database
| Property | Type | Description |
|----------|------|-------------|
| Name | Title | ชื่อตัวละคร |
| Race | Select | เผ่าพันธุ์ |
| Status | Select | สถานะ |
| Faction | Multi-select | กลุ่ม/ฝ่าย |
| Description | Text | รายละเอียด |

#### Scenes Database
| Property | Type | Description |
|----------|------|-------------|
| Title | Title | ชื่อฉาก |
| Summary | Text | สรุปเนื้อหา |
| Characters | Relation | ตัวละครในฉาก |
| Location | Relation | สถานที่ |
| Tags | Multi-select | ป้ายกำกับ |

## 🔧 Troubleshooting

### Common Issues

1. **"Database not found"**
   - ตรวจสอบ Database ID ใน secrets
   - ตรวจสอบ Integration permissions

2. **"Property doesn't exist"**
   - ปรับ property names ใน script ให้ตรงกับ database schema

3. **"Authentication failed"**
   - ตรวจสอบ NOTION_TOKEN ใน secrets
   - ตรวจสอบ Integration ยังใช้งานได้

### Debug Commands
```bash
# Check environment variables
echo $NOTION_TOKEN
echo $NOTION_DB_ID

# Test Notion connection
node -e "
const { Client } = require('@notionhq/client');
const notion = new Client({ auth: process.env.NOTION_TOKEN });
notion.databases.retrieve({ database_id: process.env.NOTION_DB_ID })
  .then(r => console.log('✅ Connected:', r.title))
  .catch(e => console.error('❌ Error:', e.message));
"
```

## 📈 Workflow Status

- ✅ **Pull from Notion**: Ready to use
- ✅ **Push to Notion**: Ready to use  
- ✅ **Google Drive Backup**: Optional feature
- ⏳ **Auto-sync on schedule**: Coming soon
- ⏳ **Bi-directional sync**: Coming soon

## 🎨 Customization

### Adding New Properties
แก้ไขใน `scripts/push-to-notion.js`:
```javascript
// เพิ่ม property types ใหม่
if (key === 'YourNewProperty') {
  properties[key] = {
    select: { name: value }
  };
}
```

### Custom File Naming
แก้ไขใน `scripts/pull-from-notion.js`:
```javascript
// Custom filename format
const fileName = `${safeTitle}-${pageId.slice(-6)}.md`;
```

---

💡 **Tips**: ใช้ consistent naming conventions และ test ใน development environment ก่อนใช้งานจริง
