#!/usr/bin/env node

/**
 * Auto Update Roadmap System - ระบบอัปเดต README และ Roadmap อัตโนมัติ
 * รับไอเดียใหม่และอัปเดตเอกสารโดยอัตโนมัติ
 */

import fs from 'fs/promises';
import path from 'path';
import { GoogleGenerativeAI } from '@google/generative-ai';
import dotenv from 'dotenv';

dotenv.config();

class AutoUpdateRoadmapSystem {
  constructor() {
    this.genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    this.ideaQueue = [];
    this.lastUpdate = new Date();
  }

  async addIdea(ideaText, priority = 'medium', category = 'feature') {
    const idea = {
      id: Date.now(),
      text: ideaText,
      priority, // low, medium, high, urgent
      category, // feature, bugfix, improvement, enhancement
      timestamp: new Date().toISOString(),
      status: 'pending'
    };

    this.ideaQueue.push(idea);
    console.log(`💡 เพิ่มไอเดียใหม่: ${ideaText}`);
    
    return idea;
  }

  async processIdeasWithAI() {
    if (this.ideaQueue.length === 0) {
      return null;
    }

    console.log('🤖 กำลังประมวลไอเดียด้วย AI...');
    
    const model = this.genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
    
    const currentReadme = await this.readCurrentFiles();
    
    const prompt = `
    คุณเป็น Product Manager ที่ต้องช่วยอัปเดต README และ Roadmap สำหรับโปรเจกต์ Notion MCP Server

    === ไอเดียใหม่ที่ได้รับ ===
    ${this.ideaQueue.map((idea, index) => `
    ${index + 1}. [${idea.priority.toUpperCase()}] ${idea.category}: ${idea.text}
    วันที่: ${new Date(idea.timestamp).toLocaleString('th-TH')}
    `).join('\n')}

    === เอกสารปัจจุบัน ===
    README.md:
    ${currentReadme.readme.substring(0, 2000)}...

    ROADMAP-UPDATED.md:
    ${currentReadme.roadmap.substring(0, 2000)}...

    === งานที่ต้องทำ ===
    1. วิเคราะห์ไอเดียใหม่ทั้งหมด
    2. จัดลำดับความสำคัญตาม business value และความเป็นไปได้
    3. อัปเดต Roadmap โดยใส่ไอเดียใหม่ในส่วนที่เหมาะสม
    4. อัปเดต README ถ้าจำเป็น (เช่น เพิ่มฟีเจอร์ใหม่ในรายการ)
    5. เสนอ timeline ที่เหมาะสม

    === ข้อกำหนด ===
    - ใช้ภาษาไทยในการเขียน
    - รักษาโครงสร้างเดิมของเอกสาร
    - เพิ่มเฉพาะส่วนที่จำเป็น ไม่ต้องเขียนใหม่ทั้งหมด
    - ใส่วันที่และรายละเอียดที่ชัดเจน
    - จัดกลุ่มไอเดียที่เกี่ยวข้องกัน

    โปรดส่งคืนเป็น JSON รูปแบบ:
    {
      "analysis": "การวิเคราะห์ไอเดีย",
      "roadmapUpdates": "ข้อความที่จะเพิ่มใน roadmap",
      "readmeUpdates": "ข้อความที่จะเพิ่มใน readme (ถ้าจำเป็น)",
      "timeline": "กำหนดเวลาที่เสนอ",
      "prioritization": "การจัดลำดับความสำคัญ"
    }
    `;

    try {
      const result = await model.generateContent(prompt);
      const responseText = result.response.text();
      
      // ลองแยก JSON จาก response
      const jsonMatch = responseText.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        return JSON.parse(jsonMatch[0]);
      } else {
        // ถ้าไม่ใช่ JSON ให้ใช้เป็น plain text
        return {
          analysis: responseText,
          roadmapUpdates: responseText,
          readmeUpdates: '',
          timeline: 'ต้องระบุเพิ่มเติม',
          prioritization: 'ต้องวิเคราะห์เพิ่มเติม'
        };
      }
    } catch (error) {
      console.error('❌ AI Processing Error:', error);
      return null;
    }
  }

  async readCurrentFiles() {
    try {
      const readme = await fs.readFile('README.md', 'utf8');
      const roadmap = await fs.readFile('ROADMAP-UPDATED.md', 'utf8');
      
      return { readme, roadmap };
    } catch (error) {
      console.error('❌ ไม่สามารถอ่านไฟล์เอกสารได้:', error.message);
      return { readme: '', roadmap: '' };
    }
  }

  async updateRoadmap(updates) {
    if (!updates.roadmapUpdates) return;

    console.log('📝 กำลังอัปเดต ROADMAP...');
    
    try {
      let roadmap = await fs.readFile('ROADMAP-UPDATED.md', 'utf8');
      
      // เพิ่มส่วนใหม่หลังจาก header
      const timestamp = new Date().toLocaleString('th-TH');
      const newSection = `

## 🆕 อัปเดตล่าสุด (${timestamp})

${updates.roadmapUpdates}

### 📊 การวิเคราะห์ไอเดียใหม่
${updates.analysis}

### ⏱️ Timeline ที่เสนอ
${updates.timeline}

### 🎯 การจัดลำดับความสำคัญ
${updates.prioritization}

---
`;

      // หาตำแหน่งที่จะแทรก (หลังจาก title และ overview)
      const insertPosition = roadmap.indexOf('\n## ');
      if (insertPosition !== -1) {
        roadmap = roadmap.slice(0, insertPosition) + newSection + roadmap.slice(insertPosition);
      } else {
        roadmap += newSection;
      }
      
      await fs.writeFile('ROADMAP-UPDATED.md', roadmap);
      console.log('✅ อัปเดต ROADMAP สำเร็จ');
      
    } catch (error) {
      console.error('❌ ไม่สามารถอัปเดต ROADMAP:', error.message);
    }
  }

  async updateReadme(updates) {
    if (!updates.readmeUpdates || updates.readmeUpdates.trim() === '') return;

    console.log('📝 กำลังอัปเดต README...');
    
    try {
      let readme = await fs.readFile('README.md', 'utf8');
      
      // อัปเดต timestamp
      const timestamp = new Date().toISOString().split('T')[0];
      readme = readme.replace(
        /\*Last updated: .*\*/g,
        `*Last updated: ${timestamp}*`
      );
      
      // เพิ่มส่วนใหม่ถ้าจำเป็น
      if (updates.readmeUpdates.length > 0) {
        const newSection = `

## 🆕 ฟีเจอร์ใหม่ล่าสุด

${updates.readmeUpdates}

*อัปเดต: ${new Date().toLocaleString('th-TH')}*

`;
        
        const insertPosition = readme.indexOf('\n## ');
        if (insertPosition !== -1) {
          readme = readme.slice(0, insertPosition) + newSection + readme.slice(insertPosition);
        } else {
          readme += newSection;
        }
      }
      
      await fs.writeFile('README.md', readme);
      console.log('✅ อัปเดต README สำเร็จ');
      
    } catch (error) {
      console.error('❌ ไม่สามารถอัปเดต README:', error.message);
    }
  }

  async generateUpdateReport(updates) {
    const report = `# 📋 Auto Update Report

**วันที่อัปเดต**: ${new Date().toLocaleString('th-TH')}
**จำนวนไอเดียที่ประมวล**: ${this.ideaQueue.length}

## 💡 ไอเดียที่ได้รับ

${this.ideaQueue.map((idea, index) => `
### ${index + 1}. ${idea.text}
- **ประเภท**: ${idea.category}
- **ความสำคัญ**: ${idea.priority}
- **วันที่เพิ่ม**: ${new Date(idea.timestamp).toLocaleString('th-TH')}
- **สถานะ**: ${idea.status}
`).join('\n')}

## 🤖 การวิเคราะห์ด้วย AI

${updates?.analysis || 'ไม่สามารถวิเคราะห์ได้'}

## 📈 การอัปเดตที่ทำ

### ROADMAP
${updates?.roadmapUpdates ? '✅ อัปเดตแล้ว' : '❌ ไม่มีการอัปเดต'}

### README
${updates?.readmeUpdates ? '✅ อัปเดตแล้ว' : '❌ ไม่มีการอัปเดต'}

## ⏭️ ขั้นตอนต่อไป

${updates?.timeline || 'ต้องระบุเพิ่มเติม'}

---
*รายงานนี้สร้างโดย Auto Update Roadmap System*
`;

    await fs.writeFile('update-report.md', report);
    console.log('📊 สร้างรายงานการอัปเดต: update-report.md');
  }

  async processQueue() {
    if (this.ideaQueue.length === 0) {
      console.log('📭 ไม่มีไอเดียในคิว');
      return;
    }

    console.log(`🚀 เริ่มประมวลไอเดีย ${this.ideaQueue.length} รายการ...`);
    
    // ประมวลด้วย AI
    const updates = await this.processIdeasWithAI();
    
    if (updates) {
      // อัปเดตเอกสาร
      await this.updateRoadmap(updates);
      await this.updateReadme(updates);
      
      // สร้างรายงาน
      await this.generateUpdateReport(updates);
      
      // อัปเดตสถานะไอเดีย
      this.ideaQueue.forEach(idea => {
        idea.status = 'processed';
      });
      
      console.log('✅ ประมวลไอเดียเสร็จสิ้น');
    } else {
      console.log('❌ ไม่สามารถประมวลไอเดียด้วย AI ได้');
    }
    
    // ล้าง queue
    this.ideaQueue = [];
  }

  async addIdeaFromInput(inputText) {
    // แยกข้อมูลจาก input
    const priorityMatch = inputText.match(/\[([^\]]+)\]/);
    const priority = priorityMatch ? priorityMatch[1].toLowerCase() : 'medium';
    
    const categoryMatch = inputText.match(/(\w+):/);
    const category = categoryMatch ? categoryMatch[1].toLowerCase() : 'feature';
    
    const cleanText = inputText
      .replace(/\[([^\]]+)\]/, '')
      .replace(/^\w+:/, '')
      .trim();
    
    await this.addIdea(cleanText, priority, category);
  }

  async run(ideaText = null) {
    console.log('🚀 เริ่มระบบอัปเดต Roadmap อัตโนมัติ...\n');
    
    if (ideaText) {
      await this.addIdeaFromInput(ideaText);
    }
    
    await this.processQueue();
  }
}

// Export และรัน
export default AutoUpdateRoadmapSystem;

if (import.meta.url === `file://${process.argv[1]}`) {
  const updater = new AutoUpdateRoadmapSystem();
  
  // รับไอเดียจาก command line argument
  const ideaInput = process.argv[2];
  updater.run(ideaInput);
}
