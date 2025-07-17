#!/usr/bin/env node

/**
 * Quick Idea Adder - เพิ่มไอเดียใหม่อย่างรวดเร็ว
 * ใช้: npm run idea "ไอเดียใหม่"
 * หรือ: node quick-idea.js "ไอเดียใหม่"
 */

import AutoUpdateRoadmapSystem from './auto-update-roadmap.js';

async function quickIdea() {
  const ideaText = process.argv[2];
  
  if (!ideaText) {
    console.log(`
🚀 Quick Idea Adder

การใช้งาน:
  npm run idea "ไอเดียใหม่"
  node quick-idea.js "ไอเดียใหม่"

ตัวอย่าง:
  npm run idea "[high] feature: เพิ่ม TTS integration กับ Google Colab"
  npm run idea "[medium] improvement: ปรับปรุง error handling"
  npm run idea "[urgent] bugfix: แก้ API timeout"

รูปแบบ: [priority] category: description
- Priority: low, medium, high, urgent
- Category: feature, improvement, bugfix, enhancement
    `);
    process.exit(1);
  }

  console.log('💡 เพิ่มไอเดียใหม่...');
  
  const updater = new AutoUpdateRoadmapSystem();
  await updater.run(ideaText);
}

quickIdea().catch(console.error);
