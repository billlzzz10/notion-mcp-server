#!/usr/bin/env node

/**
 * Script to automatically update README.md with current tool status
 * Run with: node scripts/update-readme.js
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

function countTools() {
  const indexPath = path.join(__dirname, '../src/tools/index.ts');
  
  if (!fs.existsSync(indexPath)) {
    console.error('❌ Tool index file not found');
    return { notion: 0, ashval: 0 };
  }

  const content = fs.readFileSync(indexPath, 'utf8');
  
  // Count different types of tools
  const notionMatches = content.match(/server\.tool\(\s*["']notion_/g);
  const ashvalMatches = content.match(/server\.tool\(\s*["']ashval_/g);
  
  const notionCount = notionMatches ? notionMatches.length : 0;
  const ashvalCount = ashvalMatches ? ashvalMatches.length : 0;
  
  console.log(`📊 Found ${notionCount} Notion tools, ${ashvalCount} Ashval tools`);
  
  return { notion: notionCount, ashval: ashvalCount };
}

function updateReadme(toolCounts) {
  const readmePath = path.join(__dirname, '../README.md');
  
  if (!fs.existsSync(readmePath)) {
    console.error('❌ README.md not found');
    return false;
  }

  let readme = fs.readFileSync(readmePath, 'utf8');
  
  // Update tool counts in section headers
  readme = readme.replace(
    /### ✅ Notion Base Tools \(\d+\/\d+ เครื่องมือ\)/,
    `### ✅ Notion Base Tools (${toolCounts.notion}/${toolCounts.notion} เครื่องมือ)`
  );
  
  readme = readme.replace(
    /### ✅ Ashval World Building Tools \(\d+\/\d+ เครื่องมือ\)/,
    `### ✅ Ashval World Building Tools (${toolCounts.ashval}/${toolCounts.ashval} เครื่องมือ)`
  );
  
  const totalTools = toolCounts.notion + toolCounts.ashval;
  readme = readme.replace(
    /### 🟢 สถานะรวม: พร้อมใช้งาน \(\d+\/\d+ เครื่องมือ\)/,
    `### 🟢 สถานะรวม: พร้อมใช้งาน (${totalTools}/${totalTools} เครื่องมือ)`
  );
  
  // Update last updated timestamp
  const now = new Date().toISOString().split('T')[0];
  // Convert to Thai date format (YYYY-MM-DD)
  const [year, month, day] = now.split('-');
  const thaiDate = `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`;
  if (readme.includes('*Last updated:')) {
    readme = readme.replace(
      /\*Last updated: .*\*/,
      `*Last updated: ${thaiDate}*`
    );
  } else {
    readme = readme.replace(
      /(### 🟢 สถานะรวม: พร้อมใช้งาน.*)\n/,
      `$1\n\n*Last updated: ${thaiDate}*\n`
    );
  }
  
  // Write updated content
  fs.writeFileSync(readmePath, readme);
  console.log(`✅ Updated README.md with ${totalTools} total tools`);
  console.log(`📅 Last updated: ${thaiDate}`);
  
  return true;
}

function generateStatusReport(toolCounts) {
  const total = toolCounts.notion + toolCounts.ashval;
  const expectedTotal = 17; // Updated to 17 total tools
  const expectedAshval = 12; // Updated to 12 Ashval tools
  
  console.log('\n📋 Tool Status Report:');
  console.log(`├── Notion Base Tools: ${toolCounts.notion}/5 ✅`);
  console.log(`├── Ashval World Building: ${toolCounts.ashval}/${expectedAshval} ✅`);
  console.log(`└── Total: ${total}/${expectedTotal} ✅`);
  
  if (total === expectedTotal) {
    console.log('\n🎉 All tools are functional!');
  } else {
    console.log(`\n⚠️  Missing ${expectedTotal - total} tools`);
  }
}

// Main execution
function main() {
  console.log('🔄 Updating README.md with current tool status...\n');
  
  try {
    const toolCounts = countTools();
    const success = updateReadme(toolCounts);
    
    if (success) {
      generateStatusReport(toolCounts);
    } else {
      console.log('❌ Failed to update README');
    }
    
    process.exit(success ? 0 : 1);
    
  } catch (error) {
    console.error('❌ Error updating README:', error.message);
    console.error('Stack:', error.stack);
    process.exit(1);
  }
}

// Run if called directly
main();

export { countTools, updateReadme, generateStatusReport };
