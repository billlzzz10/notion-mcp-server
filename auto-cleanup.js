#!/usr/bin/env node

/**
 * Auto Cleanup System - ระบบล้างไฟล์ทดสอบอัตโนมัติ
 * รันหลังจากการทดสอบเสร็จสิ้น เพื่อลบไฟล์ที่ไม่จำเป็น
 */

import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

class AutoCleanupSystem {
  constructor() {
    this.testFilePatterns = [
      /^test-.*\.js$/,
      /^.*-test\.js$/,
      /^temp-.*\.js$/,
      /^debug-.*\.js$/,
      /^sample-.*\.js$/,
      /^quick-.*\.js$/,
      /^demo-.*\.js$/,
      /.*\.test\.js$/,
      /.*\.spec\.js$/
    ];
    
    this.tempDocPatterns = [
      /^temp-.*\.md$/,
      /^draft-.*\.md$/,
      /^test-.*\.md$/,
      /.*-temp\.md$/,
      /.*-draft\.md$/,
      /.*-backup\.md$/
    ];

    this.logFilesPatterns = [
      /^.*\.log$/,
      /^debug\.txt$/,
      /^error\.txt$/,
      /^output\.txt$/
    ];

    this.preserveFiles = [
      // Scripts สำคัญที่ต้องเก็บ
      'check-data-quality.js',
      'check-db-schema.js', 
      'check-db-structure.js',
      'check-status-options.js',
      'check-youtube-db-schema.js',
      'auto-update-projects.js',
      'ashval-bot.js',
      'cleanup-duplicates.js',
      'create-project-roadmap.js',
      'fetch-notion-pages.js',
      'subtasks-reports-agent.js',
      'auto-cleanup.js', // ตัวเองไม่ลบตัวเอง
      'auto-update-roadmap.js'
    ];
  }

  async scanFiles() {
    console.log('🔍 กำลังสแกนไฟล์ที่ต้องการลบ...');
    
    const rootDir = process.cwd();
    const files = await fs.readdir(rootDir);
    
    const filesToDelete = {
      testFiles: [],
      tempDocs: [],
      logFiles: [],
      other: []
    };

    for (const file of files) {
      const filePath = path.join(rootDir, file);
      const stat = await fs.stat(filePath);
      
      if (stat.isFile()) {
        // ข้าม files ที่ต้องเก็บ
        if (this.preserveFiles.includes(file)) {
          continue;
        }

        // Test files
        if (this.testFilePatterns.some(pattern => pattern.test(file))) {
          filesToDelete.testFiles.push(file);
        }
        // Temp docs
        else if (this.tempDocPatterns.some(pattern => pattern.test(file))) {
          filesToDelete.tempDocs.push(file);
        }
        // Log files
        else if (this.logFilesPatterns.some(pattern => pattern.test(file))) {
          filesToDelete.logFiles.push(file);
        }
        // Other suspicious files
        else if (file.includes('backup') || file.includes('old') || file.includes('copy')) {
          filesToDelete.other.push(file);
        }
      }
    }

    return filesToDelete;
  }

  async deleteFiles(filesToDelete) {
    console.log('\n🗑️ กำลังลบไฟล์...');
    
    let deletedCount = 0;
    const deletedFiles = [];

    for (const [category, files] of Object.entries(filesToDelete)) {
      if (files.length > 0) {
        console.log(`\n📁 ${category}:`);
        for (const file of files) {
          try {
            await fs.unlink(file);
            console.log(`   ✅ ลบ: ${file}`);
            deletedFiles.push(file);
            deletedCount++;
          } catch (error) {
            console.log(`   ❌ ไม่สามารถลบ: ${file} (${error.message})`);
          }
        }
      }
    }

    return { deletedCount, deletedFiles };
  }

  async updatePackageJson() {
    console.log('\n📦 กำลังอัปเดต package.json...');
    
    try {
      const packageJsonPath = path.join(process.cwd(), 'package.json');
      const packageData = JSON.parse(await fs.readFile(packageJsonPath, 'utf8'));
      
      // ลบ scripts ที่ใช้ไฟล์ที่ไม่มีแล้ว
      const scriptsToCheck = Object.keys(packageData.scripts || {});
      const invalidScripts = [];
      
      for (const scriptName of scriptsToCheck) {
        const scriptCommand = packageData.scripts[scriptName];
        
        // ตรวจสอบว่า script ใช้ไฟล์ที่ไม่มีหรือไม่
        const nodeFileMatch = scriptCommand.match(/node\s+([^\s]+\.js)/);
        if (nodeFileMatch) {
          const filePath = nodeFileMatch[1];
          try {
            await fs.access(filePath);
          } catch {
            invalidScripts.push(scriptName);
          }
        }
      }
      
      // ลบ invalid scripts
      for (const scriptName of invalidScripts) {
        delete packageData.scripts[scriptName];
        console.log(`   ✅ ลบ script: ${scriptName}`);
      }
      
      // เพิ่ม auto-cleanup script
      if (!packageData.scripts['cleanup']) {
        packageData.scripts['cleanup'] = 'node auto-cleanup.js';
        console.log(`   ✅ เพิ่ม script: cleanup`);
      }
      
      await fs.writeFile(packageJsonPath, JSON.stringify(packageData, null, 2));
      console.log('   ✅ อัปเดต package.json สำเร็จ');
      
    } catch (error) {
      console.log(`   ❌ ไม่สามารถอัปเดต package.json: ${error.message}`);
    }
  }

  async generateReport(deletedFiles) {
    const report = `# 🧹 Auto Cleanup Report

**วันที่**: ${new Date().toLocaleString('th-TH')}
**ไฟล์ที่ลบ**: ${deletedFiles.deletedCount} ไฟล์

## 📋 รายการไฟล์ที่ลบ

${deletedFiles.deletedFiles.map(file => `- ✅ ${file}`).join('\n')}

## 🛡️ ไฟล์ที่เก็บไว้

${this.preserveFiles.map(file => `- 🔒 ${file}`).join('\n')}

---
*รายงานนี้สร้างโดย Auto Cleanup System*
`;

    await fs.writeFile('cleanup-report.md', report);
    console.log('📊 สร้างรายงานการทำความสะอาด: cleanup-report.md');
  }

  async run() {
    console.log('🚀 เริ่มระบบทำความสะอาดอัตโนมัติ...\n');
    
    try {
      // สแกนไฟล์
      const filesToDelete = await this.scanFiles();
      
      // แสดงสรุป
      const totalFiles = Object.values(filesToDelete).flat().length;
      
      if (totalFiles === 0) {
        console.log('✨ ไม่พบไฟล์ที่ต้องการลบ - ระบบสะอาดแล้ว!');
        return;
      }
      
      console.log(`\n📊 พบไฟล์ที่ต้องการลบ: ${totalFiles} ไฟล์`);
      Object.entries(filesToDelete).forEach(([category, files]) => {
        if (files.length > 0) {
          console.log(`   ${category}: ${files.length} ไฟล์`);
        }
      });
      
      // ลบไฟล์
      const result = await this.deleteFiles(filesToDelete);
      
      // อัปเดต package.json
      await this.updatePackageJson();
      
      // สร้างรายงาน
      await this.generateReport(result);
      
      console.log(`\n✅ ทำความสะอาดเสร็จสิ้น - ลบไฟล์ ${result.deletedCount} ไฟล์`);
      
    } catch (error) {
      console.error('❌ เกิดข้อผิดพลาด:', error.message);
    }
  }
}

// รันถ้าเรียกโดยตรง
if (import.meta.url === `file://${process.argv[1]}`) {
  const cleanup = new AutoCleanupSystem();
  cleanup.run();
}

export default AutoCleanupSystem;
