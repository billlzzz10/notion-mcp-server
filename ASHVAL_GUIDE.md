# 🌟 คู่มือการใช้งาน Ashval World Building System

## 📋 สารบัญ
1. [การติดตั้งและตั้งค่าเริ่มต้น](#การติดตั้งและตั้งค่าเริ่มต้น)
2. [การสร้างฐานข้อมูลใน Notion](#การสร้างฐานข้อมูลใน-notion)
3. [การกำหนดค่า Environment](#การกำหนดค่า-environment)
4. [คำแนะนำการใช้งานเครื่องมือ 10 ตัว](#คำแนะนำการใช้งานเครื่องมือ-10-ตัว)
5. [การตั้งค่า Make.com Integration](#การตั้งค่า-makecom-integration)
6. [การใช้งาน AI และ Google Colab](#การใช้งาน-ai-และ-google-colab)
7. [ตัวอย่างการใช้งานจริง](#ตัวอย่างการใช้งานจริง)

---

## 🚀 การติดตั้งและตั้งค่าเริ่มต้น

### 1. เตรียมระบบ
```bash
# คัดลอกโปรเจกต์
git clone <repository-url>
cd notion-mcp-server

# ติดตั้ง dependencies
npm install

# สร้าง build
npm run build
```

### 2. ตั้งค่า Notion Integration
1. ไปที่ [Notion Developers](https://developers.notion.com/)
2. สร้าง Internal Integration ใหม่
3. ตั้งชื่อ "Ashval World Building Server"
4. เก็บ Integration Token ไว้

### 3. กำหนดค่า Environment
```bash
# คัดลอกไฟล์ตัวอย่าง
cp .env.example .env

# แก้ไขไฟล์ .env
nano .env
```

---

## 🗄️ การสร้างฐานข้อมูลใน Notion

### ฐานข้อมูลหลัก (8 ตาราง)

#### 1. Characters Database
**Properties:**
- `Name` (Title) - ชื่อตัวละคร
- `Role` (Select): Protagonist, Antagonist, Supporting, Minor
- `Arc Status` (Select): Not Started, Developing, Complete
- `Screen Time` (Select): Major, Medium, Minor
- `Goal` (Rich Text) - เป้าหมายหลัก
- `Personality` (Rich Text) - บุคลิกภาพ
- `Abilities` (Multi-select) - ความสามารถ
- `Location` (Relation to Locations) - สถานที่อาศัย
- `Power System` (Relation to Power Systems) - ระบบพลัง
- `Scenes` (Relation to Scenes) - ฉากที่ปรากฏ

#### 2. Scenes Database
**Properties:**
- `Title` (Title) - ชื่อฉาง
- `Chapter` (Number) - หมายเลขตอน
- `Order` (Number) - ลำดับในตอน
- `Summary` (Rich Text) - สรุปเนื้อหา
- `Purpose` (Rich Text) - จุดประสงค์ของฉาง
- `Conflict` (Rich Text) - ความขัดแย้ง
- `Tone` (Select): มืดมัว, น่ากลัว, หวังใจ, เศร้า, สงบ
- `Emotional Arc` (Select): Rising, Falling, Stable, Climax
- `Pacing` (Select): Very Slow, Slow, Medium, Fast, Very Fast
- `Characters in Scene` (Relation to Characters)
- `Location` (Relation to Locations)
- `Date/Time` (Date) - เวลาในเรื่อง

#### 3. Locations Database
**Properties:**
- `Name` (Title) - ชื่อสถานที่
- `Type` (Select): City, Village, Forest, Mountain, Dungeon, Building
- `Description` (Rich Text) - คำอธิบาย
- `Climate` (Select): Hot, Cold, Temperate, Magical
- `Danger Level` (Select): Safe, Low, Medium, High, Extreme
- `Resources` (Multi-select) - ทรัพยากร
- `World` (Relation to Worlds)
- `Scenes` (Relation to Scenes)
- `Connected Locations` (Relation to Locations)

#### 4. Worlds Database
**Properties:**
- `Name` (Title) - ชื่อโลก
- `Type` (Select): Physical, Spiritual, Dimensional
- `Magic Level` (Select): None, Low, Medium, High, Extreme
- `Technology Level` (Select): Ancient, Medieval, Renaissance, Modern, Futuristic
- `Description` (Rich Text)
- `Rules` (Rich Text) - กฎของโลก
- `Locations` (Relation to Locations)

#### 5. Power Systems Database
**Properties:**
- `Name` (Title) - ชื่อระบบ
- `Type` (Select): Mana, Elemental, Divine, Dark, Physical
- `Description` (Rich Text)
- `Limitations` (Rich Text) - ข้อจำกัด
- `Users` (Relation to Characters)
- `World` (Relation to Worlds)

#### 6. Arcanas Database
**Properties:**
- `Name` (Title) - ชื่อ Arcana
- `Type` (Select): Major, Minor
- `Element` (Select): Fire, Water, Earth, Air, Light, Dark, Neutral
- `Description` (Rich Text)
- `Effects` (Rich Text) - ผลกระทบ
- `Users` (Relation to Characters)

#### 7. Missions Database
**Properties:**
- `Title` (Title) - ชื่อภารกิจ
- `Type` (Select): Main Quest, Side Quest, Personal Quest
- `Status` (Select): Not Started, In Progress, Complete, Failed
- `Objective` (Rich Text) - วัตถุประสงค์
- `Reward` (Rich Text) - รางวัล
- `Difficulty` (Select): Easy, Medium, Hard, Extreme
- `Characters Involved` (Relation to Characters)
- `Locations` (Relation to Locations)
- `Start Date` (Date)
- `End Date` (Date)

#### 8. AI Prompts Database
**Properties:**
- `Title` (Title) - ชื่อ prompt
- `Type` (Select): Character, Scene, Location, Combat, Dialogue, World Building
- `Prompt Text` (Rich Text) - เนื้อหา prompt
- `Parameters` (Rich Text) - พารามิเตอร์
- `Results` (Rich Text) - ผลลัพธ์
- `Rating` (Select): 1, 2, 3, 4, 5
- `Created Date` (Created time)
- `Last Used` (Last edited time)

### ฐานข้อมูลเพิ่มเติม (4 ตาราง)

#### 9. Version History Database
**Properties:**
- `Title` (Title) - ชื่อการเปลี่ยนแปลง
- `Entity Type` (Select): Character, Scene, Location, World, Power System, Arcana, Mission
- `Entity ID` (Rich Text) - ID ของเอนทิตี้
- `Change Type` (Select): Create, Update, Delete, Archive
- `Old Value` (Rich Text) - ค่าเดิม
- `New Value` (Rich Text) - ค่าใหม่
- `Reason` (Rich Text) - เหตุผล
- `Changed By` (Person) - ผู้แก้ไข
- `Change Date` (Created time)
- `AI Generated` (Checkbox) - สร้างโดย AI

#### 10. Story Timeline Database
**Properties:**
- `Event Name` (Title) - ชื่อเหตุการณ์
- `Date/Time` (Date) - เวลาในเรื่อง
- `Chapter` (Number) - ตอนที่เกิดขึ้น
- `Type` (Select): Plot Point, Character Development, World Event, Combat
- `Importance` (Select): Critical, Major, Minor, Background
- `Description` (Rich Text) - คำอธิบาย
- `Characters Involved` (Relation to Characters)
- `Location` (Relation to Locations)
- `Scene` (Relation to Scenes)
- `Consequences` (Rich Text) - ผลที่ตามมา

#### 11. Story Arcs Database
**Properties:**
- `Arc Name` (Title) - ชื่อ story arc
- `Arc Type` (Select): Character Arc, Plot Arc, World Arc, Relationship Arc
- `Status` (Select): Planning, Active, Resolved, Abandoned
- `Start Chapter` (Number) - ตอนเริ่มต้น
- `End Chapter` (Number) - ตอนสิ้นสุด
- `Progress` (Select): 0%, 25%, 50%, 75%, 100%
- `Theme` (Select): Growth, Redemption, Revenge, Love, Power, Truth
- `Central Conflict` (Rich Text) - ความขัดแย้งหลัก
- `Resolution` (Rich Text) - วิธีแก้ปัญหา
- `Characters` (Relation to Characters)
- `Dependencies` (Relation to Story Arcs) - arc ที่เชื่อมโยง

#### 12. World Rules Database
**Properties:**
- `Rule Name` (Title) - ชื่อกฎ
- `Category` (Select): Magic, Technology, Society, Nature, Divine, Physical
- `Description` (Rich Text) - คำอธิบายกฎ
- `Exceptions` (Rich Text) - ข้อยกเว้น
- `Evidence` (Rich Text) - หลักฐานในเรื่อง
- `Related Characters` (Relation to Characters)
- `Related Locations` (Relation to Locations)
- `Importance` (Select): Core, Important, Minor
- `World` (Relation to Worlds)

---

## ⚙️ การกำหนดค่า Environment

แก้ไขไฟล์ `.env` ตาม Database ID ที่ได้จาก Notion:

```env
NOTION_TOKEN=secret_xxxxxxxxxxxxxxxxxx
NOTION_CHARACTERS_DB_ID=12345678-1234-1234-1234-123456789abc
NOTION_SCENES_DB_ID=12345678-1234-1234-1234-123456789abc
# ... (ตาม database ที่สร้าง)
```

### วิธีหา Database ID:
1. เปิดฐานข้อมูลใน Notion
2. คัดลอก URL: `https://notion.so/workspace/database_id?v=view_id`
3. `database_id` คือส่วนที่ต้องการ

---

## 🛠️ คำแนะนำการใช้งานเครื่องมือ 10 ตัว

### 1. Version Control System
```javascript
// ติดตามการเปลี่ยนแปลงตัวละคร
await ashval_version_control({
  operation: "log_change",
  entityType: "Character",
  entityId: "char_001",
  changeType: "Update",
  oldValue: "Level 1 Mage",
  newValue: "Level 5 Arcane Master",
  reason: "Character progression after quest completion"
});

// ดูประวัติการเปลี่ยนแปลง
await ashval_version_control({
  operation: "get_history",
  entityType: "Character",
  entityId: "char_001",
  limit: 10
});
```

### 2. Timeline Analyzer
```javascript
// วิเคราะห์ช่วงเวลาที่ขาดหาย
await ashval_timeline_analyzer({
  analysisType: "gap_analysis",
  timeRange: {
    start: "2024-01-01",
    end: "2024-12-31"
  }
});

// ตรวจหาความขัดแย้งทางเวลา
await ashval_timeline_analyzer({
  analysisType: "conflict_detection",
  characters: ["Aria", "Kael"],
  autoFix: true
});
```

### 3. Conflict Generator
```javascript
// สร้างความขัดแย้งระหว่างตัวละคร
await ashval_conflict_generator({
  conflictType: "character_vs_character",
  character1: "Aria",
  character2: "Kael",
  context: "Both seeking the same ancient artifact",
  intensity: "high"
});

// สร้างความขัดแย้งกับโลก
await ashval_conflict_generator({
  conflictType: "character_vs_world",
  character: "Aria",
  worldElement: "Corruption spreading across the land",
  generateSolutions: true
});
```

### 4. Story Arc Analyzer
```javascript
// วิเคราะห์ความก้าวหน้าของ arc
await ashval_story_arc_analyzer({
  analysisType: "progress_tracking",
  arcName: "Aria's Redemption Arc",
  currentChapter: 15
});

// วิเคราะห์การพัฒนาตัวละคร
await ashval_story_arc_analyzer({
  analysisType: "character_development",
  character: "Aria",
  generateSuggestions: true
});
```

### 5. Smart Filter System
```javascript
// สร้าง view สำหรับฉากต่อสู้
await ashval_smart_filter({
  filterType: "scenes",
  criteria: {
    tone: ["มืดมัว", "น่ากลัว"],
    pacing: ["Fast", "Very Fast"],
    hasConflict: true
  },
  sortBy: "chapter",
  generateInsights: true
});

// กรองตัวละครที่ต้องพัฒนา
await ashval_smart_filter({
  filterType: "characters",
  criteria: {
    arcStatus: "Not Started",
    screenTime: ["Major", "Medium"]
  },
  generateSuggestions: true
});
```

### 6. Image Generator
```javascript
// สร้างภาพตัวละคร
await ashval_image_generator({
  type: "character",
  characterName: "Aria Shadowbane",
  service: "midjourney",
  style: "dark fantasy",
  includeWorldContext: true,
  setupWebhook: true
});

// สร้างภาพสถานที่
await ashval_image_generator({
  type: "location",
  locationName: "Tower of Forgotten Echoes",
  service: "stable_diffusion",
  mood: "mysterious",
  timeOfDay: "twilight"
});
```

### 7. Consistency Checker
```javascript
// ตรวจสอบความสอดคล้องทั้งหมด
await ashval_consistency_checker({
  checkType: "full_check",
  autoFix: false,
  generateReport: true
});

// ตรวจสอบตัวละครเฉพาะ
await ashval_consistency_checker({
  checkType: "character_abilities",
  character: "Aria",
  crossReference: true
});
```

### 8. World Rules Query
```javascript
// ค้นหากฎเกี่ยวกับเวทมนตร์
await ashval_world_rules_query({
  operation: "search",
  query: "mana regeneration",
  category: "Magic"
});

// ตรวจสอบเนื้อหากับกฎโลก
await ashval_world_rules_query({
  operation: "validate_content",
  content: "Aria casts three major spells in succession",
  suggestFixes: true
});
```

### 9. Advanced Prompt Generator
```javascript
// สร้าง prompt สำหรับฉากต่อสู้
await ashval_advanced_prompt_generator({
  promptType: "combat_scene",
  context: {
    characters: ["Aria", "Shadow Beast"],
    location: "Abandoned Temple",
    chapter: 12
  },
  includeWorldRules: true,
  saveToDatabase: true
});

// สร้าง prompt สำหรับบทสนทนา
await ashval_advanced_prompt_generator({
  promptType: "dialogue",
  context: {
    characters: ["Aria", "Kael"],
    relationship: "former_allies_now_enemies",
    setting: "confrontation"
  }
});
```

### 10. Story Structure Analyzer
```javascript
// วิเคราะห์ pacing
await ashval_story_structure_analyzer({
  analysisType: "pacing_analysis",
  chapterRange: { start: 1, end: 20 },
  generateSuggestions: true
});

// วิเคราะห์โครงสร้างเรื่องแบบเต็ม
await ashval_story_structure_analyzer({
  analysisType: "full_analysis",
  compareWithTemplate: "three_act",
  exportFormat: "chart"
});
```

---

## 🔗 การตั้งค่า Make.com Integration

### 1. สร้าง Scenario ใน Make.com

#### Scenario: Auto Scene Generation
1. **Trigger**: Webhook (เมื่อมีการร้องขอสร้างฉาง)
2. **Module 1**: HTTP Request ไปยัง Notion MCP Server
3. **Module 2**: OpenAI/Gemini API สำหรับสร้างเนื้อหา
4. **Module 3**: Update Notion Database

### 2. ตั้งค่า Webhook URL
```env
MAKE_WEBHOOK_URL=https://hook.make.com/your-webhook-id
```

### 3. ตัวอย่างการใช้งาน
```javascript
// ส่งข้อมูลไปยัง Make.com
fetch(process.env.MAKE_WEBHOOK_URL, {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    action: 'generate_scene',
    data: {
      chapter: 15,
      characters: ['Aria', 'Kael'],
      location: 'Dark Forest',
      purpose: 'Character confrontation'
    }
  })
});
```

---

## 🤖 การใช้งาน AI และ Google Colab

### 1. ตั้งค่า Google Colab Notebook

```python
# Install required packages
!pip install notion-client openai google-generativeai

# Import libraries
from notion_client import Client
import google.generativeai as genai
import json

# Configure APIs
notion = Client(auth="your_notion_token")
genai.configure(api_key="your_gemini_api_key")

# Function to generate content
def generate_ashval_content(prompt_type, context):
    model = genai.GenerativeModel('gemini-1.5-pro')
    
    # Load world context from Notion
    world_context = get_world_context()
    
    # Generate prompt
    prompt = f"""
    You are creating content for the dark fantasy world of Ashval.
    Context: {world_context}
    Type: {prompt_type}
    Specific Context: {context}
    
    Generate detailed, immersive content that fits the world's tone and rules.
    """
    
    response = model.generate_content(prompt)
    return response.text

# Function to save back to Notion
def save_to_notion(content, database_id):
    notion.pages.create(
        parent={"database_id": database_id},
        properties={
            "Title": {"title": [{"text": {"content": content["title"]}}]},
            "Content": {"rich_text": [{"text": {"content": content["body"]}}]},
            "AI Generated": {"checkbox": True}
        }
    )
```

### 2. Automation Scripts

```python
# Script สำหรับสร้างฉากอัตโนมัติ
def auto_generate_scenes(chapter_number, scene_count=3):
    # ดึงข้อมูลตัวละครและสถานที่
    characters = get_active_characters(chapter_number)
    locations = get_available_locations()
    
    for i in range(scene_count):
        # สร้างบริบทสำหรับฉาง
        context = {
            "chapter": chapter_number,
            "scene_number": i + 1,
            "characters": random.sample(characters, 2),
            "location": random.choice(locations)
        }
        
        # สร้างเนื้อหา
        scene_content = generate_ashval_content("scene", context)
        
        # บันทึกใน Notion
        save_scene_to_notion(scene_content, context)
        
        print(f"Generated scene {i+1} for chapter {chapter_number}")
```

---

## 📝 ตัวอย่างการใช้งานจริง

### Workflow 1: การสร้างตัวละครใหม่
```javascript
// 1. สร้างตัวละครใน Characters Database
const newCharacter = {
  name: "Lyra Nightwhisper",
  role: "Supporting",
  arcStatus: "Not Started",
  goal: "Uncover the truth about her family's disappearance"
};

// 2. ใช้ Image Generator สร้างภาพ
await ashval_image_generator({
  type: "character",
  characterName: "Lyra Nightwhisper",
  style: "dark fantasy portrait",
  service: "midjourney"
});

// 3. สร้าง Version Control entry
await ashval_version_control({
  operation: "log_change",
  entityType: "Character",
  changeType: "Create",
  newValue: JSON.stringify(newCharacter),
  reason: "New character introduction for chapter 8"
});

// 4. ตรวจสอบ Consistency
await ashval_consistency_checker({
  checkType: "character_abilities",
  character: "Lyra Nightwhisper"
});
```

### Workflow 2: การวางแผนฉากใหม่
```javascript
// 1. วิเคราะห์ Timeline
await ashval_timeline_analyzer({
  analysisType: "gap_analysis",
  chapterRange: { start: 10, end: 15 }
});

// 2. สร้าง Conflicts
await ashval_conflict_generator({
  conflictType: "character_vs_character",
  character1: "Lyra",
  character2: "Aria",
  context: "Disagreement about rescue mission strategy"
});

// 3. สร้าง Advanced Prompt
await ashval_advanced_prompt_generator({
  promptType: "dialogue",
  context: {
    characters: ["Lyra", "Aria"],
    setting: "War council meeting",
    tension: "high"
  },
  saveToDatabase: true
});

// 4. วิเคราะห์ Story Structure
await ashval_story_structure_analyzer({
  analysisType: "emotional_beats",
  chapterRange: { start: 10, end: 15 }
});
```

### Workflow 3: การตรวจสอบและปรับปรุง
```javascript
// 1. รันการตรวจสอบความสอดคล้องแบบเต็ม
await ashval_consistency_checker({
  checkType: "full_check",
  autoFix: false,
  generateReport: true
});

// 2. วิเคราะห์ Story Arcs
await ashval_story_arc_analyzer({
  analysisType: "dependency_analysis",
  generateSuggestions: true
});

// 3. ใช้ Smart Filter หาปัญหา
await ashval_smart_filter({
  filterType: "characters",
  criteria: {
    arcStatus: "Not Started",
    screenTime: "Major"
  },
  generateSuggestions: true
});

// 4. สร้างรายงานโดยรวม
await ashval_story_structure_analyzer({
  analysisType: "full_analysis",
  generateSuggestions: true,
  exportFormat: "text"
});
```

---

## 🎯 การใช้งานขั้นสูง

### 1. Batch Operations
```javascript
// ประมวลผลหลายตัวละครพร้อมกัน
const characters = ["Aria", "Kael", "Lyra", "Marcus"];

for (const character of characters) {
  await ashval_consistency_checker({
    checkType: "character_abilities",
    character: character,
    autoFix: true
  });
  
  await ashval_image_generator({
    type: "character",
    characterName: character,
    service: "stable_diffusion"
  });
}
```

### 2. Custom Workflows
```javascript
// Workflow สำหรับสร้างตอนใหม่
async function createNewChapter(chapterNumber) {
  // 1. วิเคราะห์ปัญหาที่เป็นไปได้
  const analysis = await ashval_story_structure_analyzer({
    analysisType: "pacing_analysis",
    chapterRange: { start: chapterNumber - 2, end: chapterNumber - 1 }
  });
  
  // 2. สร้างความขัดแย้งใหม่
  const conflicts = await ashval_conflict_generator({
    conflictType: "plot_advancement",
    chapter: chapterNumber,
    generateSolutions: false
  });
  
  // 3. สร้าง prompts สำหรับเนื้อหา
  await ashval_advanced_prompt_generator({
    promptType: "plot_advancement",
    context: {
      chapter: chapterNumber,
      previousEvents: analysis.keyEvents,
      conflicts: conflicts
    },
    saveToDatabase: true
  });
  
  // 4. บันทึก version
  await ashval_version_control({
    operation: "log_change",
    entityType: "Chapter",
    changeType: "Create",
    newValue: `Chapter ${chapterNumber} planning complete`,
    reason: "Automated chapter planning workflow"
  });
}
```

---

## 🔧 การแก้ไขปัญหาที่พบบ่อย

### 1. Database Connection Issues
```bash
# ตรวจสอบ token
echo $NOTION_TOKEN

# ทดสอบการเชื่อมต่อ
npm run test-connection
```

### 2. Invalid Database ID
```javascript
// ตรวจสอบ Database ID
const databases = await notion.search({
  filter: { property: "object", value: "database" }
});
console.log(databases.results.map(db => ({ 
  title: db.title[0]?.text?.content, 
  id: db.id 
})));
```

### 3. Permission Errors
1. ตรวจสอบว่า Integration มีสิทธิ์เข้าถึงฐานข้อมูล
2. Share ฐานข้อมูลให้กับ Integration
3. ตรวจสอบ Capabilities ใน Integration settings

---

## 📊 การติดตามและรายงาน

### 1. สร้างรายงานประจำสัปดาห์
```javascript
async function generateWeeklyReport() {
  const report = {
    versionChanges: await ashval_version_control({
      operation: "get_history",
      timeRange: "last_week"
    }),
    
    consistencyIssues: await ashval_consistency_checker({
      checkType: "summary_report"
    }),
    
    storyProgress: await ashval_story_arc_analyzer({
      analysisType: "progress_summary"
    })
  };
  
  // บันทึกรายงาน
  await saveReportToNotion(report);
}
```

### 2. Dashboard Metrics
- จำนวนตัวละครที่พัฒนาแล้ว
- ฉากที่สร้างด้วย AI
- ปัญหาความสอดคล้องที่แก้ไข
- Story arcs ที่เสร็จสมบูรณ์

---

## 🎓 คำแนะนำการใช้งานอย่างมีประสิทธิภาพ

### 1. Best Practices
- ใช้ Version Control ทุกครั้งที่ทำการเปลี่ยนแปลงสำคัญ
- รัน Consistency Check ก่อนสร้างเนื้อหาใหม่
- ใช้ Smart Filter เพื่อค้นหาโอกาสปรับปรุง
- สร้าง Advanced Prompts สำหรับเนื้อหาที่สำคัญ

### 2. Automation Tips
- ตั้งค่า Make.com สำหรับงานที่ทำซ้ำ
- ใช้ Google Colab สำหรับการประมวลผลจำนวนมาก
- สร้าง custom workflows สำหรับงานเฉพาะ

### 3. Performance Optimization
- ใช้ batch operations เมื่อทำงานกับข้อมูลจำนวนมาก
- กำหนด limits ในการ query เพื่อประหยัด API calls
- Cache ข้อมูลที่ใช้บ่อยใน local storage

---

ระบบ Ashval World Building System พร้อมใช้งาน! 🚀

ติดตามเอกสารนี้เพื่อเริ่มต้นการใช้งานและสร้างโลกแฟนตาซีที่สมบูรณ์แบบ
