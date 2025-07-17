# 🔗 Make.com Integration Guide

## 📋 Overview

คู่มือการเชื่อมต่อ Make.com webhook กับ Notion MCP Server เพื่อให้ข้อมูลจาก Notion สามารถส่งมาที่ Gateway และ AI ได้อัตโนมัติ

---

## 🚀 Quick Setup

### 1️⃣ **เริ่ม MCP Gateway**

```bash
cd notion-mcp-server
npm run start-gateway
```

Gateway จะทำงานที่: `http://localhost:3001`

### 2️⃣ **Webhook Endpoints**

| Endpoint | Purpose | Method |
|----------|---------|--------|
| `/api/v1/agent/webhook/make` | **หลัก** - รับ webhook จาก Make.com | POST |
| `/api/v1/agent/webhook/test` | **ทดสอบ** - ทดสอบการเชื่อมต่อ | POST |
| `/api/v1/agent/webhook/status` | **สถานะ** - ตรวจสอบสถานะ webhook | GET |

---

## 🔧 Make.com Scenario Setup

### **Step 1: สร้าง Webhook Module**

1. เข้า Make.com และสร้าง Scenario ใหม่
2. เพิ่ม **Webhooks** module
3. เลือก **"Custom webhook"**
4. คัดลอก Webhook URL ที่ Make.com ให้

### **Step 2: ตั้งค่า Notion Trigger**

1. เพิ่ม **Notion** module หลัง Webhook
2. เลือก **"Watch Database Items"** 
3. เชื่อมต่อ Notion account
4. เลือก Database ที่ต้องการ monitor

### **Step 3: ตั้งค่า HTTP Module สำหรับ MCP**

1. เพิ่ม **HTTP** module หลัง Notion
2. เลือก **"Make a request"**
3. ตั้งค่าดังนี้:

```json
{
  "url": "http://localhost:3001/api/v1/agent/webhook/make",
  "method": "POST",
  "headers": {
    "Content-Type": "application/json",
    "X-Webhook-Source": "make.com"
  },
  "body": {
    "action": "{{notion.trigger_type}}",
    "database": "{{notion.database_name}}",
    "notion_page_id": "{{notion.page_id}}",
    "data": "{{notion.properties}}",
    "trigger_type": "database_item_updated",
    "timestamp": "{{now}}"
  }
}
```

---

## 📥 Webhook Payload Examples

### **Page Created**

```json
{
  "action": "page_created",
  "database": "characters",
  "notion_page_id": "abc123-def456-ghi789",
  "data": {
    "Name": "New Character",
    "Description": "Character description...",
    "Status": "Draft"
  },
  "trigger_type": "database_item_created",
  "timestamp": "2025-01-17T10:30:00Z"
}
```

### **Page Updated**

```json
{
  "action": "page_updated", 
  "database": "scenes",
  "notion_page_id": "xyz789-abc123-def456",
  "data": {
    "Title": "Updated Scene Title",
    "Status": {
      "changed": true,
      "old_value": "Draft",
      "new_value": "Complete"
    },
    "Summary": "Updated scene summary..."
  },
  "trigger_type": "database_item_updated",
  "timestamp": "2025-01-17T10:35:00Z"
}
```

### **AI Analysis Request**

```json
{
  "action": "ai_analysis_request",
  "database": "stories",
  "data": {
    "content": "Story content to analyze...",
    "analysis_type": "comprehensive",
    "page_id": "story123-abc456-def789"
  },
  "trigger_type": "automation_trigger",
  "timestamp": "2025-01-17T10:40:00Z"
}
```

---

## 🤖 AI Integration Features

### **Automatic AI Triggers**

Webhook จะ trigger AI analysis อัตโนมัติเมื่อ:

- ✅ **สร้างตัวละครใหม่** → วิเคราะห์ personality และ relationships
- ✅ **เพิ่มฉากใหม่** → วิเคราะห์ conflict และ story structure  
- ✅ **อัปเดต story content** → วิเคราะห์ consistency และ quality
- ✅ **เปลี่ยนสถานะโปรเจกต์** → trigger automation workflows

### **Supported AI Tools**

| Tool | Purpose | Auto-trigger |
|------|---------|--------------|
| `ashval_advanced_prompt_generator` | สร้าง AI prompts | ✅ |
| `ashval_consistency_checker` | ตรวจสอบความสอดคล้อง | ✅ |
| `ashval_conflict_generator` | สร้าง conflicts | ⚡ Manual |
| `ashval_character_dialogue_generator` | สร้างบทสนทนา | ⚡ Manual |

---

## 🔍 Testing & Debugging

### **1. ทดสอบ Webhook Connection**

```bash
curl -X POST http://localhost:3001/api/v1/agent/webhook/test \
  -H "Content-Type: application/json" \
  -d '{"test": "make.com integration", "timestamp": "2025-01-17T10:30:00Z"}'
```

**Expected Response:**
```json
{
  "success": true,
  "message": "Test webhook received successfully",
  "timestamp": "2025-01-17T10:30:15.123Z",
  "received_data": {
    "test": "make.com integration",
    "timestamp": "2025-01-17T10:30:00Z"
  },
  "next_step": "Configure your Make.com scenario to use /api/v1/agent/webhook/make"
}
```

### **2. ตรวจสอบ Webhook Status**

```bash
curl http://localhost:3001/api/v1/agent/webhook/status
```

### **3. ดู Gateway Logs**

```bash
# ใน terminal ที่รัน Gateway
# จะเห็น logs แบบนี้:
[2025-01-17T10:30:00.123Z] 📥 Make.com webhook received: {...}
[2025-01-17T10:30:00.234Z] 🆕 Processing new item creation
[2025-01-17T10:30:00.345Z] ✅ Webhook processed successfully
```

---

## ⚡ Automation Workflows

### **Character Creation Workflow**

1. **Notion**: สร้างตัวละครใหม่
2. **Make.com**: Detect การสร้าง → ส่ง webhook
3. **MCP Gateway**: รับ webhook → forward ไป MCP
4. **AI Analysis**: วิเคราะห์ character traits
5. **Notion Update**: อัปเดต analysis results กลับ Notion

### **Scene Development Workflow**

1. **Notion**: อัปเดต scene content
2. **Make.com**: Detect การเปลี่ยนแปลง → ส่ง webhook  
3. **MCP Gateway**: ประมวลผล → trigger consistency check
4. **AI Tools**: ตรวจสอบ timeline และ character consistency
5. **Automation**: สร้าง recommendations และ next steps

---

## 🛠️ Advanced Configuration

### **Custom Action Types**

สามารถเพิ่ม action types ใหม่ใน webhook handler:

```javascript
// webhook-handler.js
switch (action || trigger_type) {
  case 'custom_analysis':
    mcpResponse = await processCustomAnalysis(data, database);
    break;
  case 'batch_update':
    mcpResponse = await processBatchUpdate(data, database);
    break;
  // เพิ่ม cases ใหม่ได้
}
```

### **Database-specific Logic**

```javascript
// ตั้งค่า AI triggers สำหรับ database เฉพาะ
const aiTriggerDatabases = [
  'characters',
  'scenes', 
  'stories',
  'projects'
];

// Automation rules สำหรับแต่ละ database
const automationRules = {
  'characters': ['personality_analysis', 'relationship_mapping'],
  'scenes': ['conflict_analysis', 'pacing_check'],
  'stories': ['consistency_check', 'quality_assessment']
};
```

---

## 🔐 Security Considerations

### **Rate Limiting**

- Webhook endpoints มี rate limiting น้อยกว่า API endpoints
- ใช้ IP-based tracking
- Monitor ใน Gateway logs

### **Webhook Validation**

```javascript
// เพิ่ม validation ใน webhook handler
if (!req.headers['x-webhook-source'] || req.headers['x-webhook-source'] !== 'make.com') {
  return res.status(401).json({ error: 'Unauthorized webhook source' });
}
```

### **Payload Size Limits**

- Maximum payload size: 10MB
- JSON depth limit: 20 levels
- Timeout: 30 seconds

---

## 📊 Monitoring & Analytics

### **Webhook Metrics**

Gateway จะ track:
- จำนวน webhooks ที่ได้รับต่อชั่วโมง
- Success/failure rates
- Processing times
- AI trigger frequencies

### **Health Check**

```bash
curl http://localhost:3001/health
```

จะแสดง webhook status ใน `services` section

---

## 🚨 Troubleshooting

### **ปัญหาที่พบบ่อย**

| ปัญหา | สาเหตุ | แก้ไข |
|-------|-------|-------|
| **Webhook timeout** | MCP response ช้า | เพิ่ม timeout ใน Make.com |
| **400 Bad Request** | Payload format ผิด | ตรวจสอบ JSON structure |
| **500 Server Error** | MCP Gateway ไม่ทำงาน | Restart Gateway |
| **No AI response** | Database ไม่ trigger AI | ตรวจสอบ `shouldTriggerAI()` |

### **Debug Steps**

1. ✅ ตรวจสอบ Gateway ทำงานที่ port 3001
2. ✅ ทดสอบ `/webhook/test` endpoint 
3. ✅ ตรวจสอบ payload format
4. ✅ ดู Gateway logs
5. ✅ Test MCP tools แยก

---

## 📞 Support

- **Documentation**: [docs/](../docs/)
- **Issues**: GitHub Issues
- **Logs**: Gateway console output
- **Health Check**: http://localhost:3001/health

---

**Last Updated**: January 17, 2025  
**Version**: v3.1 Enhanced Gateway Edition
