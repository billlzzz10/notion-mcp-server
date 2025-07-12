# 🧠 Data Completion Assistant Tool Guide

เครื่องมือสำหรับช่วยเติมข้อมูลที่ขาดหายไปในฐานข้อมูล Ashval ด้วย AI และสร้างข้อเสนะแนะ

## 🎯 ฟีเจอร์หลัก

### 📊 วิเคราะห์ข้อมูลที่ขาดหายไป
- ตรวจสอบฟิลด์ที่ขาดหายไปในแต่ละเรกคอร์ด
- คำนวณเปอร์เซ็นต์ข้อมูลที่ไม่สมบูรณ์
- แสดงสถิติแบบรวมและแบบละเอียด

### 🎲 สร้างข้อมูลตัวอย่าง
- สร้างข้อมูลตัวอย่างที่เหมาะสมกับบริบท Ashval
- รองรับทุกประเภทฐานข้อมูล (12 databases)
- ปรับแต่งตามธีมแสง-เงา (Etheria/Umbra)

### 📋 สร้าง Templates
- Template พื้นฐานสำหรับแต่ละฟิลด์
- คู่มือการเติมข้อมูลแบบ step-by-step
- ตัวอย่างข้อมูลที่เหมาะสม

### 🎯 เติมฟิลด์เฉพาะ
- โฟกัสเติมข้อมูลในฟิลด์ที่ระบุ
- แนะนำข้อมูลตามบริบทของแต่ละเรกคอร์ด
- สร้างคำแนะนำเฉพาะสำหรับแต่ละตัวละคร/ฉาก/สถานที่

### 🚀 Bulk Completion
- วางแผนการเติมข้อมูลแบบขั้นตอน
- จัดลำดับความสำคัญของฟิลด์
- แนะนำเครื่องมือและวิธีการที่เหมาะสม

## 🛠️ วิธีใช้งาน

### พารามิเตอร์หลัก

```json
{
  "targetDatabase": "characters", // ฐานข้อมูลเป้าหมาย
  "assistanceType": "suggest_missing_data", // ประเภทการช่วยเหลือ
  "specificField": "Goal", // ฟิลด์เฉพาะ (ใช้กับ fill_specific_field)
  "recordLimit": 10, // จำนวนเรกคอร์ดที่ประมวลผล
  "generateSamples": true, // สร้างข้อมูลตัวอย่าง
  "useAshvalContext": true // ใช้บริบทโลก Ashval
}
```

### ตัวเลือกฐานข้อมูล (targetDatabase)

- `characters` - ตัวละคร
- `scenes` - ฉาก
- `locations` - สถานที่
- `worlds` - โลก
- `power_systems` - ระบบพลัง
- `arcanas` - อาร์คานา
- `missions` - ภารกิจ
- `ai_prompts` - AI Prompts
- `story_timeline` - เส้นเวลาเรื่อง
- `story_arcs` - Story Arcs
- `world_rules` - กฎของโลก

### ประเภทการช่วยเหลือ (assistanceType)

#### 1. `suggest_missing_data` (ค่าเริ่มต้น)
วิเคราะห์และแนะนำข้อมูลที่ขาดหายไป

```json
{
  "targetDatabase": "characters",
  "assistanceType": "suggest_missing_data",
  "recordLimit": 10,
  "useAshvalContext": true
}
```

**ผลลัพธ์:**
- สถิติข้อมูลที่ขาดหายไปแต่ละฟิลด์
- รายชื่อเรกคอร์ดที่ต้องการความสนใจ
- คำแนะนำเฉพาะสำหรับแต่ละฟิลด์

#### 2. `generate_templates`
สร้าง templates สำหรับการเติมข้อมูล

```json
{
  "targetDatabase": "scenes",
  "assistanceType": "generate_templates",
  "useAshvalContext": true
}
```

**ผลลัพธ์:**
- Template พื้นฐานแต่ละฟิลด์
- ตัวเลือกและตัวอย่าง
- คู่มือการเติมข้อมูล

#### 3. `create_sample_data`
สร้างข้อมูลตัวอย่างพร้อมใช้

```json
{
  "targetDatabase": "locations",
  "assistanceType": "create_sample_data",
  "recordLimit": 5,
  "useAshvalContext": true
}
```

**ผลลัพธ์:**
- ข้อมูลตัวอย่าง 5 เรกคอร์ด
- ครบทุกฟิลด์ที่จำเป็น
- เนื้อหาเหมาะสมกับธีม Ashval

#### 4. `fill_specific_field`
เติมฟิลด์เฉพาะที่ระบุ

```json
{
  "targetDatabase": "characters",
  "assistanceType": "fill_specific_field",
  "specificField": "Personality",
  "recordLimit": 10,
  "useAshvalContext": true
}
```

**ผลลัพธ์:**
- วิเคราะห์เรกคอร์ดที่ขาดฟิลด์นี้
- แนะนำข้อมูลตามบริบทของแต่ละตัวละคร
- คำแนะนำเฉพาะสำหรับฟิลด์นั้น

#### 5. `bulk_complete`
วางแผนการเติมข้อมูลแบบครบถ้วน

```json
{
  "targetDatabase": "scenes",
  "assistanceType": "bulk_complete",
  "recordLimit": 20,
  "useAshvalContext": true
}
```

**ผลลัพธ์:**
- แผนการเติมข้อมูลทีละขั้นตอน
- จัดลำดับความสำคัญฟิลด์
- แนะนำเครื่องมือและวิธีการ

## 🌟 การใช้บริบท Ashval

เมื่อตั้ง `useAshvalContext: true` เครื่องมือจะ:

### สำหรับตัวละคร (Characters)
- สร้าง Goals ที่เกี่ยวข้องกับ Etheria/Umbra magic
- แนะนำ Personality ที่สะท้อนอิทธิพลของพลัง
- เชื่อมโยงกับธีมแสง-เงา

### สำหรับฉาก (Scenes)  
- สร้าง Conflicts ที่เกี่ยวข้องกับการต่อสู้แสง-เงา
- แนะนำ Purpose ที่แสดงความขัดแย้งของโลก
- รวมองค์ประกอบระบบมายากล

### สำหรับสถานที่ (Locations)
- อธิบายการเชื่อมต่อกับพลัง Etheria/Umbra
- สร้างบรรยากาศที่สอดคล้องกับธีม
- เชื่อมโยงกับประวัติศาสตร์โลก Ashval

## 📝 ตัวอย่างการใช้งาน

### ตัวอย่างที่ 1: วิเคราะห์ตัวละครที่ขาดข้อมูล
```json
{
  "targetDatabase": "characters",
  "assistanceType": "suggest_missing_data",
  "recordLimit": 15,
  "generateSamples": true,
  "useAshvalContext": true
}
```

### ตัวอย่างที่ 2: สร้าง Templates สำหรับฉาก
```json
{
  "targetDatabase": "scenes",
  "assistanceType": "generate_templates",
  "useAshvalContext": true
}
```

### ตัวอย่างที่ 3: เติมฟิลด์ Goal ของตัวละคร
```json
{
  "targetDatabase": "characters", 
  "assistanceType": "fill_specific_field",
  "specificField": "Goal",
  "recordLimit": 10,
  "useAshvalContext": true
}
```

### ตัวอย่างที่ 4: สร้างข้อมูลตัวอย่างสถานที่
```json
{
  "targetDatabase": "locations",
  "assistanceType": "create_sample_data", 
  "recordLimit": 3,
  "useAshvalContext": true
}
```

### ตัวอย่างที่ 5: วางแผนเติมข้อมูลครบถ้วน
```json
{
  "targetDatabase": "power_systems",
  "assistanceType": "bulk_complete",
  "recordLimit": 25,
  "useAshvalContext": true
}
```

## 💡 เคล็ดลับการใช้งาน

### เริ่มต้นกับฐานข้อมูลใหม่
1. ใช้ `create_sample_data` เพื่อสร้างข้อมูลตัวอย่าง
2. ใช้ `generate_templates` เพื่อดู template
3. เติมข้อมูลจริงตาม template

### ปรับปรุงข้อมูลที่มีอยู่
1. ใช้ `suggest_missing_data` เพื่อหาช่องว่าง
2. ใช้ `fill_specific_field` เพื่อเติมทีละฟิลด์
3. ใช้ `bulk_complete` เพื่อวางแผนครบถ้วน

### การทำงานแบบ Batch
1. เริ่มจากฟิลด์ที่จำเป็น (required fields)
2. เติมฟิลด์ที่ขาดบ่อยที่สุดก่อน
3. ใช้ AI Prompt Generator ช่วยสร้างเนื้อหา

## ⚠️ หมายเหตุ

- เครื่องมือนี้เป็นตัวช่วยสร้างข้อเสนะแนะ ไม่ได้เติมข้อมูลจริงใน Notion
- ต้องใช้เครื่องมืออื่นเพื่อเพิ่มข้อมูลลงฐานข้อมูลจริง
- ข้อมูลตัวอย่างอาจต้องปรับแต่งให้เหมาะสมกับเรื่องของคุณ
