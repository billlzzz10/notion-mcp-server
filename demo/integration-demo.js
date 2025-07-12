#!/usr/bin/env node

/**
 * 🚀 Ashval Integration Demo
 * แสดงฟีเจอร์ใหม่: Projects Database + Gemini AI + Telegram Bot
 */

import { config } from 'dotenv';
import { notion } from '../build/services/notion.js';
import { handleProjectsTools } from '../build/tools/projects.js';

// Load environment variables
config();

console.log('🌟 === Ashval New Features Demo === 🌟\n');

async function demoProjectsDatabase() {
    console.log('📊 === Projects Database Demo ===');
    
    try {
        // Demo: Create a sample project
        console.log('➕ Creating sample project...');
        const projectResult = await handleProjectsTools('createProject', {
            databaseId: process.env.NOTION_PROJECTS_DB_ID || 'demo_id',
            project: {
                name: 'Ashval Character Development Phase 2',
                description: 'Develop secondary characters and their backstories',
                status: 'In progress',
                priority: 'High',
                startDate: '2025-07-15',
                endDate: '2025-08-30',
                tags: ['character', 'development', 'backstory'],
                assignee: 'Story Team',
                progress: 35,
                budget: 8000,
                notes: 'Focus on supporting characters and their relationships'
            }
        });
        
        if (projectResult.success) {
            console.log('✅ Project created successfully!');
            console.log(`   Project ID: ${projectResult.projectId}`);
        } else {
            console.log('❌ Failed to create project');
        }
        
        // Demo: Query projects
        console.log('\n📋 Querying projects...');
        const queryResult = await handleProjectsTools('queryProjects', {
            databaseId: process.env.NOTION_PROJECTS_DB_ID || 'demo_id',
            filters: {
                status: 'In progress',
                sortBy: 'priority',
                sortDirection: 'descending'
            }
        });
        
        if (queryResult.success) {
            console.log(`✅ Found ${queryResult.projects.length} projects`);
            queryResult.projects.slice(0, 3).forEach((project, i) => {
                const name = project.properties?.Name?.title?.[0]?.text?.content || 'No name';
                const status = project.properties?.Status?.select?.name || 'No status';
                console.log(`   ${i+1}. ${name} - Status: ${status}`);
            });
        }
        
        // Demo: Get project statistics
        console.log('\n📈 Getting project statistics...');
        const statsResult = await handleProjectsTools('getProjectStats', {
            databaseId: process.env.NOTION_PROJECTS_DB_ID || 'demo_id'
        });
        
        if (statsResult.success) {
            const stats = statsResult.stats;
            console.log('✅ Project Statistics:');
            console.log(`   Total Projects: ${stats.total}`);
            console.log(`   In Progress: ${stats.byStatus['In progress'] || 0}`);
            console.log(`   Completed: ${stats.byStatus.Completed || 0}`);
            console.log(`   Average Progress: ${stats.averageProgress}%`);
            console.log(`   Total Budget: $${stats.totalBudget.toLocaleString()}`);
            console.log(`   Overdue Projects: ${stats.overdue}`);
        }
        
    } catch (error) {
        console.log('❌ Projects Database Demo Error:', error.message);
    }
}

async function demoAIPromptAnalysis() {
    console.log('\n🧠 === AI Prompt Analysis Demo ===');
    
    try {
        // Import the story structure analyzer
        const { handleStoryStructureAnalysis } = await import('../build/tools/storyStructureAnalyzer.js');
        
        const samplePrompt = `สร้างตัวละครที่เป็นนักรบหญิงจากเผ่า Etheria ที่มีพลังควบคุมลม มีนิสัยแกร่งกล้าแต่อ่อนโยนต่อเพื่อน และมีความลับเกี่ยวกับอดีตที่เธอไม่อยากให้ใครรู้`;
        
        console.log('🔍 Analyzing AI prompt...');
        console.log(`📝 Prompt: "${samplePrompt.substring(0, 60)}..."`);
        
        const analysisResult = await handleStoryStructureAnalysis({
            analysisType: 'ai_prompts',
            content: samplePrompt
        });
        
        if (analysisResult.success && analysisResult.analysis.ai_prompts) {
            const analysis = analysisResult.analysis.ai_prompts;
            console.log('✅ AI Prompt Analysis Results:');
            console.log(`   📊 Effectiveness Score: ${analysis.effectivenessScore}/10`);
            console.log(`   🏷️ Prompt Type: ${analysis.promptType}`);
            console.log(`   🎯 Clarity Score: ${analysis.clarityScore}/10`);
            console.log(`   🔧 Specificity Score: ${analysis.specificityScore}/10`);
            
            console.log('\n💡 Improvement Suggestions:');
            analysis.improvementSuggestions.forEach((suggestion, i) => {
                console.log(`   ${i+1}. ${suggestion}`);
            });
            
            console.log('\n📊 Usage Analytics:');
            console.log(`   📈 Estimated Effectiveness: ${analysis.usageAnalytics.estimatedEffectiveness}`);
            console.log(`   🎨 Best Use Case: ${analysis.usageAnalytics.bestUseCase}`);
        } else {
            console.log('❌ Failed to analyze AI prompt');
        }
        
    } catch (error) {
        console.log('❌ AI Prompt Analysis Demo Error:', error.message);
    }
}

function demoTelegramBotSetup() {
    console.log('\n🤖 === Telegram Bot Setup Demo ===');
    
    const requiredEnvVars = [
        'GEMINI_API_KEY',
        'TELEGRAM_BOT_TOKEN',
        'NOTION_PROJECTS_DB_ID',
        'NOTION_CHARACTERS_DB_ID',
        'NOTION_SCENES_DB_ID',
        'NOTION_LOCATIONS_DB_ID'
    ];
    
    console.log('🔧 Checking environment variables...');
    
    const missingVars = requiredEnvVars.filter(varName => !process.env[varName]);
    
    if (missingVars.length === 0) {
        console.log('✅ All required environment variables are set!');
        console.log('🚀 Bot is ready to start with:');
        console.log('   🧠 Gemini AI integration');
        console.log('   📱 Telegram Bot interface');
        console.log('   📊 Projects Database management');
        console.log('   🔍 Smart search and analytics');
        
        console.log('\n📱 Available Bot Commands:');
        console.log('   /start - เริ่มต้นใช้งาน');
        console.log('   /projects - จัดการโปรเจกต์');
        console.log('   /characters - จัดการตัวละคร');
        console.log('   /stats - ดูสถิติทั้งหมด');
        console.log('   /search <query> - ค้นหาข้อมูล');
        console.log('   /prompt <text> - วิเคราะห์ AI prompts');
        console.log('   ข้อความธรรมดา - สนทนากับ AI');
        
        console.log('\n🚀 To start the bot:');
        console.log('   npm run start-bot');
        
    } else {
        console.log('❌ Missing required environment variables:');
        missingVars.forEach(varName => {
            console.log(`   - ${varName}`);
        });
        console.log('\n📝 Please add these to your .env file');
        console.log('   See .env.example for reference');
    }
}

function demoWebInterface() {
    console.log('\n🌐 === Web Chat Interface Demo ===');
    
    console.log('🖥️ Modern Web Chat Features:');
    console.log('   � Multi-chat Sessions - หลายการสนทนา');
    console.log('   🔍 Auto-Detection Schema - ตรวจสอบ DB อัตโนมัติ');
    console.log('   🧠 AI Integration - เชื่อมต่อ Gemini AI');
    console.log('   � Dynamic Properties - ปรับตาม DB จริง');
    console.log('   🏰 Ashval World Building - เครื่องมือสร้างโลก');
    console.log('   🎬 Scene Management - จัดการฉาก');
    
    console.log('\n🚀 To start web interface:');
    console.log('   npm run start-web');
    console.log('   Open: http://localhost:3000');
    
    console.log('\n🎛️ New Project Manager Features:');
    console.log('   ➕ Create projects with full details');
    console.log('   📋 Query and filter projects');
    console.log('   📈 View detailed statistics');
    console.log('   📊 Progress tracking');
    console.log('   💰 Budget management');
    console.log('   🏷️ Tag-based organization');
}

function showIntegrationSummary() {
    console.log('\n🌟 === Integration Summary ===');
    
    console.log('✅ Successfully added:');
    console.log('   📊 Projects Database - Complete project management system');
    console.log('   🤖 Gemini AI Integration - Advanced AI conversations');
    console.log('   📱 Telegram Bot - Chat-based interface');
    console.log('   🧠 AI Prompt Analysis - Effectiveness scoring & suggestions');
    console.log('   🌐 Enhanced Web Interface - Projects management UI');
    
    console.log('\n🎯 Next Steps:');
    console.log('   1. 🔑 Set up API keys (Gemini, Telegram)');
    console.log('   2. 📊 Create Projects database in Notion');
    console.log('   3. 🤖 Start the Telegram bot');
    console.log('   4. 🌐 Launch web interface');
    console.log('   5. 🎨 Consider image generation integration');
    
    console.log('\n📚 Documentation:');
    console.log('   📖 Bot Setup: docs/bot-integration-guide.md');
    console.log('   📊 Projects: docs/projects-database-guide.md');
    console.log('   🌐 Web Chat: web-chat/README.md');
}

async function main() {
    try {
        await demoProjectsDatabase();
        await demoAIPromptAnalysis();
        demoTelegramBotSetup();
        demoWebInterface();
        showIntegrationSummary();
        
        console.log('\n🎉 Demo completed successfully!');
        console.log('🚀 Your Ashval integration is ready to use!');
        
    } catch (error) {
        console.error('💥 Demo failed:', error);
        process.exit(1);
    }
}

// Run demo if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
    main();
}
