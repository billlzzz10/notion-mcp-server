# 📊 Projects Database Integration

## Overview

Projects Database เป็นระบบจัดการโปรเจกต์สำหรับโลก Ashval ที่รองรับการติดตาม ประเมิน และวิเคราะห์โปรเจกต์ต่างๆ

## 🗃️ Database Schema

### Properties

| Field | Type | Description | Options |
|-------|------|-------------|---------|
| **Name** | Title | ชื่อโปรเจกต์ | Required |
| **Description** | Rich Text | คำอธิบายโปรเจกต์ | Optional |
| **Status** | Select | สถานะโปรเจกต์ | Not started, In progress, Completed, On hold |
| **Priority** | Select | ระดับความสำคัญ | Low, Medium, High, Critical |
| **Start Date** | Date | วันที่เริ่มโปรเจกต์ | Optional |
| **End Date** | Date | วันที่สิ้นสุดโปรเจกต์ | Optional |
| **Tags** | Multi-select | แท็กสำหรับจัดหมวดหมู่ | Optional |
| **Assignee** | Rich Text | ผู้รับผิดชอบ | Optional |
| **Progress** | Number | เปอร์เซ็นต์ความคืบหน้า | 0-100 |
| **Budget** | Number | งบประมาณโปรเจกต์ | Optional |
| **Notes** | Rich Text | หมายเหตุเพิ่มเติม | Optional |

## 🛠️ Available Tools

### 1. createProject
สร้างโปรเจกต์ใหม่

```javascript
// Example usage
{
  "databaseId": "your_projects_db_id",
  "project": {
    "name": "Character Development Phase 1",
    "description": "Develop main characters for Ashval story",
    "status": "In progress",
    "priority": "High",
    "startDate": "2025-07-15",
    "endDate": "2025-08-15",
    "tags": ["character", "development", "phase1"],
    "assignee": "Story Team",
    "progress": 25,
    "budget": 5000,
    "notes": "Focus on main protagonists first"
  }
}
```

### 2. updateProject
อัปเดตโปรเจกต์ที่มีอยู่

```javascript
// Example usage
{
  "projectId": "project_page_id",
  "updates": {
    "status": "Completed",
    "progress": 100,
    "notes": "Successfully completed all character profiles"
  }
}
```

### 3. queryProjects
ค้นหาและกรองโปรเจกต์

```javascript
// Example usage
{
  "databaseId": "your_projects_db_id",
  "filters": {
    "status": "In progress",
    "priority": "High",
    "assignee": "Story Team",
    "tags": ["character"],
    "sortBy": "priority",
    "sortDirection": "descending"
  }
}
```

### 4. getProjectStats
ดูสถิติและการวิเคราะห์โปรเจกต์

```javascript
// Example usage
{
  "databaseId": "your_projects_db_id"
}

// Response example
{
  "success": true,
  "stats": {
    "total": 15,
    "byStatus": {
      "Not started": 3,
      "In progress": 8,
      "Completed": 3,
      "On hold": 1
    },
    "byPriority": {
      "Low": 4,
      "Medium": 6,
      "High": 4,
      "Critical": 1
    },
    "averageProgress": 67,
    "totalBudget": 45000,
    "overdue": 2
  }
}
```

## 📱 Telegram Bot Integration

### Commands

```
/projects list          # แสดงรายการโปรเจกต์
/projects create        # สร้างโปรเจกต์ใหม่
/projects stats         # ดูสถิติโปรเจกต์
/projects overdue       # ดูโปรเจกต์ที่เกินกำหนด
```

### Interactive Buttons

- ➕ **Create Project** - สร้างโปรเจกต์ใหม่
- 📈 **Project Stats** - ดูสถิติแบบละเอียด
- 🔄 **Refresh Data** - อัปเดตข้อมูลล่าสุด
- ⚠️ **Show Overdue** - แสดงโปรเจกต์ที่เกินกำหนด

## 🌐 Web Interface

### Project Manager Card

Web interface มี Project Manager card ที่ให้คุณ:

1. **สร้างโปรเจกต์ใหม่**
   - กรอกชื่อ, คำอธิบาย
   - เลือกสถานะและความสำคัญ
   - กำหนดวันที่เริ่มและสิ้นสุด

2. **ดูรายการโปรเจกต์**
   - กรองตามสถานะและความสำคัญ
   - เรียงลำดับตามเกณฑ์ต่างๆ

3. **ดูสถิติโปรเจกต์**
   - ภาพรวมทั้งหมด
   - แยกตามสถานะและความสำคัญ
   - ข้อมูลงบประมาณและความคืบหน้า

## 🎯 Use Cases

### World Building Projects
- **Character Development** - การพัฒนาตัวละคร
- **Location Design** - การออกแบบสถานที่
- **Magic System Creation** - การสร้างระบบเวทมนตร์
- **Story Arc Planning** - การวางแผน story arcs

### Content Creation Projects
- **Scene Writing** - การเขียนฉาก
- **Dialogue Creation** - การสร้างบทสนทนา
- **World Lore Documentation** - การบันทึกความรู้เกี่ยวกับโลก
- **Visual Asset Creation** - การสร้างสื่อภาพ

### Research & Development
- **Magic System Research** - การวิจัยระบบเวทมนตร์
- **Cultural Development** - การพัฒนาวัฒนธรรม
- **Historical Timeline** - การสร้างเส้นเวลาประวัติศาสตร์
- **Language Creation** - การสร้างภาษา

## 📊 Analytics Features

### Progress Tracking
- ติดตามความคืบหน้าแต่ละโปรเจกต์
- คำนวณเปอร์เซ็นต์เสร็จสิ้นรวม
- ประมาณเวลาที่เหลือ

### Resource Management
- ติดตามงบประมาณ
- วิเคราะห์การใช้ทรัพยากร
- คำนวณ ROI ของโปรเจกต์

### Performance Metrics
- เวลาเฉลี่ยในการทำโปรเจกต์
- อัตราความสำเร็จ
- ปัจจัยที่ทำให้โปรเจกต์ล่าช้า

## 🔄 Integration with Other Systems

### Notion Databases
- เชื่อมโยงกับ Characters Database
- ลิงก์กับ Scenes และ Locations
- ซิงค์กับ Story Arcs

### AI Tools
- ใช้ AI สำหรับการประเมินความคืบหน้า
- แนะนำการจัดลำดับความสำคัญ
- วิเคราะห์ bottlenecks

### External Tools
- ส่งออกข้อมูลเป็น CSV
- เชื่อมต่อกับ project management tools
- Integration กับ calendar systems

## 🚀 Quick Start

### 1. Setup Database
1. สร้าง Notion database ใหม่
2. เพิ่ม properties ตามที่ระบุใน schema
3. คัดลอก database ID

### 2. Configure Environment
```env
NOTION_PROJECTS_DB_ID=your_database_id_here
```

### 3. Test Connection
```bash
# ทดสอบการสร้างโปรเจกต์
npm run quick-test projects
```

### 4. Start Using
- เริ่มใช้ผ่าน Web Interface: http://localhost:3000
- หรือใช้ Telegram Bot: /projects list
- หรือเรียกใช้ MCP tools โดยตรง

## 📈 Best Practices

### Project Organization
1. ใช้ tags เพื่อจัดหมวดหมู่
2. กำหนด priority อย่างสมเหตุผล
3. อัปเดต progress เป็นประจำ
4. เขียน notes อย่างละเอียด

### Progress Tracking
1. แบ่งโปรเจกต์ใหญ่เป็นช่วงย่อย
2. ตั้งเป้าหมายที่วัดผลได้
3. รีวิวและปรับแผนเป็นระยะ
4. ใช้ automation สำหรับการอัปเดต

### Team Collaboration
1. กำหนดผู้รับผิดชอบชัดเจน
2. ใช้ shared calendar
3. สื่อสารผ่าน comments
4. จัดทำ weekly reviews

---

🌟 **Projects Database** - Organized project management for your Ashval world! 🌟
