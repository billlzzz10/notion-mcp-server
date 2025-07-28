# Notion MCP Server Development Guidelines
---

## 📝 ตัวอย่างการสร้างฐานข้อมูลใน Notion ทีละขั้นตอน (ภาษาไทย)

### 1. วิธีสร้างฐานข้อมูลใหม่ใน Notion

1. เปิด Notion และไปยังหน้าที่ต้องการสร้างฐานข้อมูล
2. กดปุ่ม "+" หรือพิมพ์ "/database" แล้วเลือก "Table - Full page" หรือ "Table - Inline"
3. ตั้งชื่อฐานข้อมูล เช่น "Ashval Characters", "Ashval Scenes", "Ashval Locations"
4. เพิ่ม properties ตามตัวอย่างด้านล่าง

### 2. ตัวอย่าง Properties สำหรับฐานข้อมูลหลัก

#### ฐานข้อมูล Characters
| Property Name         | Type         | Description (คำอธิบาย)           |
|----------------------|--------------|-----------------------------------|
| Name                 | Title        | ชื่อของตัวละคร                   |
| Description          | Text         | รายละเอียด/ประวัติตัวละคร        |
| Race                 | Select       | เผ่าพันธุ์ (Human, Elf, Demon ฯลฯ)|
| Faction              | Multi-select | กลุ่ม/ฝ่ายที่สังกัด               |
| Status               | Select       | สถานะ (Alive, Dead, Missing ฯลฯ) |
| Scenes               | Relation     | เชื่อมโยงกับ Scenes Database      |

#### ฐานข้อมูล Scenes
| Property Name         | Type         | Description (คำอธิบาย)           |
|----------------------|--------------|-----------------------------------|
| Title                | Title        | ชื่อฉาก                           |
| Summary              | Text         | สรุปเนื้อหา/เหตุการณ์            |
| Location             | Relation     | เชื่อมโยงกับ Locations Database   |
| Characters in Scene  | Relation     | เชื่อมโยงกับ Characters Database  |
| Tags                 | Multi-select | ป้ายกำกับ (Action, Drama ฯลฯ)    |

#### ฐานข้อมูล Locations
| Property Name         | Type         | Description (คำอธิบาย)           |
|----------------------|--------------|-----------------------------------|
| Name                 | Title        | ชื่อสถานที่                       |
| Description          | Text         | รายละเอียดสถานที่                 |
| Region               | Select       | ภูมิภาค/โซน                       |
| Scenes               | Relation     | เชื่อมโยงกับ Scenes Database      |

### 3. วิธีสร้าง Property แบบ Relation
1. กด "+" เพื่อเพิ่ม Property ใหม่
2. เลือกประเภทเป็น "Relation"
3. เลือกฐานข้อมูลปลายทางที่ต้องการเชื่อมโยง เช่น Characters ↔ Scenes
4. สามารถตั้งชื่อ property ได้ตามต้องการ เช่น "Characters in Scene"

### 4. วิธีนำ Database ID มาใช้ใน .env
1. เปิดฐานข้อมูลที่สร้างใน Notion
2. ดูที่ URL เช่น `https://www.notion.so/yourworkspace/xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx?v=...`
3. คัดลอกส่วนที่เป็น Database ID (ชุดตัวอักษรหลัง workspace/)
4. นำไปใส่ในไฟล์ `.env` เช่น
   ```env
   NOTION_CHARACTERS_DB_ID=xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
   NOTION_SCENES_DB_ID=xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
   NOTION_LOCATIONS_DB_ID=xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
   ```

---
# Codacy Rules
Configuration for AI behavior when interacting with Codacy's MCP Server

## After ANY successful `edit_file` or `reapply` operation
- YOU MUST IMMEDIATELY run the `codacy_cli_analyze` tool from Codacy's MCP Server for each file that was edited, with:
 - `rootPath`: set to the workspace path
 - `file`: set to the path of the edited file
 - `tool`: leave empty or unset
- If any issues are found in the new edits, propose and apply fixes for them.
- > NOTE: Failure to follow this rule is considered a critical error.

## CRITICAL: Dependencies and Security Checks
- IMMEDIATELY after ANY of these actions:
 - Running npm/yarn/pnpm install
 - Adding dependencies to package.json
 - Adding requirements to requirements.txt
 - Adding dependencies to pom.xml
 - Adding dependencies to build.gradle
 - Any other package manager operations
- You MUST run the `codacy_cli_analyze` tool with:
 - `rootPath`: set to the workspace path
 - `tool`: set to "trivy"
 - `file`: leave empty or unset
- If any vulnerabilities are found because of the newly added packages:
 - Stop all other operations
 - Propose and apply fixes for the security issues
 - Only continue with the original task after security issues are resolved
- EXAMPLE:
 - After: npm install react-markdown
 - Do: Run codacy_cli_analyze with trivy
 - Before: Continuing with any other tasks

## General
- Repeat the relevant steps for each modified file.
- "Propose fixes" means to both suggest and, if possible, automatically apply the fixes.
- You MUST NOT wait for the user to ask for analysis or remind you to run the tool.
- Do not run `codacy_cli_analyze` looking for changes in duplicated code or code complexity metrics.
- Do not run `codacy_cli_analyze` looking for changes in code coverage.
- Do not try to manually install Codacy CLI using either brew, npm, npx, or any other package manager.
- If the Codacy CLI is not installed, just run the `codacy_cli_analyze` tool from Codacy's MCP Server.
- When calling `codacy_cli_analyze`, only send provider, organization and repository if the project is a git repository.

## Whenever a call to a Codacy tool that uses `repository` or `organization` as a parameter returns a 404 error
- Offer to run the `codacy_setup_repository` tool to add the repository to Codacy
- If the user accepts, run the `codacy_setup_repository` tool
- Do not ever try to run the `codacy_setup_repository` tool on your own
- After setup, immediately retry the action that failed (only retry once)
