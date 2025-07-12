# Ashval World Building Context and Guidelines

เมื่อสร้างเนื้อหาหรือเครื่องมือสำหรับโลก Ashval ให้คำนึงถึงบริบทนี้:

## โลก Ashval - Dark Fantasy Setting

### ระบบมานา (Mana System)
- **เอธีเรีย (Etheria)**: พลังสร้างสรรค์, สีเงิน, ใช้เพื่อการรักษาและสร้าง
- **อัมบรา (Umbra)**: พลังทำลาย, สีดำ, ใช้เพื่อการต่อสู้และทำลาย
- **ความเสียสมดุล**: การใช้มานาไม่สมดุลทำให้โลกผุพัง

### ระบบ Arcana
- **The Fool**: พลังของอิกนัส, มองเห็นทางออกที่ซ่อนอยู่
- **The Hidden**: Arcana ที่เป็นทั้งพลังและคำสาป
- **กฎ Arcana**: ผู้ใช้ได้พลังแต่ต้องรับภาระและผลกระทบ

### ตัวละครหลัก
- **อิกนัส ลิโอเรน (Ignus)**: นักผจญภัยใช้ The Fool, ถูกส่งมาจากโลกอื่น
- **ซีรีน**: นักรบหญิง, เพื่อนสนิทอิกนัส
- **มีอา**: ตัวละครลึกลับที่มี Arcana ที่แตกต่าง

### สถานที่สำคัญ
- **เหมืองมานา**: แหล่งผลิตหินมานา, จุดเริ่มต้นการผจญภัย
- **ป่าเรดวู๊ด**: ป่าอันตรายที่มีสัตว์อสูร
- **ทะเลทรายโลซาน**: ทะเลทรายมีส์ม่วง, มีซากปรักหักพังโบราณ

## Tone และสไตล์การเขียน
- **มืดมัว**: เน้นความยากลำบากและการดิ้นรน
- **มีความหวัง**: แม้จะมืดมัวแต่ยังมีแสงสว่างเล็กๆ น้อยๆ
- **ความเป็นมนุษย์**: โฟกัสการเติบโตและการเปลี่ยนแปลงของตัวละคร
- **ความลึกลับ**: มีเรื่องราวที่ซ่อนอยู่รอการค้นพบ

## Database Structure สำหรับ Ashval

### Characters Database Properties:
- Name (Title), Role (Select), Arc Status (Select)
- Goal (Rich Text), Personality (Rich Text), Abilities (Rich Text)
- Power System (Relation to Power Systems)

### Scenes Database Properties:
- Title (Title), Chapter (Number), Order (Number)
- Summary (Rich Text), Purpose (Rich Text), Conflict (Rich Text)
- Tone (Select), Characters in Scene (Relation)

### Story Arcs Database Properties:
- Arc Name (Title), Arc Type (Select), Theme (Select)
- Central Conflict (Rich Text), Character Growth (Rich Text)

## Content Generation Guidelines

### เมื่อสร้างฉากใหม่:
```
บริบท: ฉากต้องสอดคล้องกับ tone "มืดมัว" และระบบมานาของโลก Ashval
ตัวละคร: ใช้ข้อมูลจาก Characters database เพื่อความสอดคล้อง
สถานที่: อ้างอิงจาก Locations database หรือสร้างใหม่ตามความเหมาะสม
ความขัดแย้ง: เชื่อมโยงกับ story arcs ที่มีอยู่
```

### เมื่อพัฒนาตัวละคร:
```
Growth Arc: ตัวละครต้องมีการเปลี่ยนแปลงที่ชัดเจน
Relationships: พิจารณาความสัมพันธ์กับตัวละครอื่น
Power System: ตรวจสอบความสอดคล้องของ Arcana/พลัง
Consistency: เช็คกับข้อมูลที่มีอยู่ใน database
```

## AI Prompt Templates สำหรับ Ashval

### Scene Expansion:
```
"ขยายฉาก: {scene_summary} 
บริบท: โลก Ashval ที่มีระบบมานาเอธีเรีย/อัมบรา
โทน: {scene_tone}
ตัวละคร: {characters_in_scene}
จุดประสงค์: {scene_purpose}
ความยาว: 300-500 คำ"
```

### Character Development:
```
"พัฒนาตัวละคร: {character_name}
Goal: {character_goal}
Personality: {character_personality}
Current Arc Status: {arc_status}
เหตุการณ์ปัจจุบัน: {current_chapter_context}
โฟกัส: การเติบโตทางจิตใจและความท้าทาย"
```