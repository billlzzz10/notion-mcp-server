const TelegramBot = require('node-telegram-bot-api');
const { GoogleGenerativeAI } = require('@google/generative-ai');
require('dotenv').config();

// Bot configuration
const token = process.env.TELEGRAM_BOT_TOKEN;
const bot = new TelegramBot(token, { polling: true });

// Gemini AI configuration  
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

console.log('🤖 Ashval Telegram Bot กำลังเริ่มต้น...');
console.log('📱 Bot Token:', token ? 'พร้อมใช้งาน ✅' : 'ไม่พบ Token ❌');

// Start command
bot.onText(/\/start/, (msg) => {
    const chatId = msg.chat.id;
    const welcomeMessage = `🏰 ยินดีต้อนรับสู่ Ashval Database Optimizer Bot!

🎯 ฟีเจอร์ที่ใช้ได้:
• 💬 Chat กับ AI (Gemini Flash/Pro)
• 🗃️ อัปเดตฐานข้อมูล Notion
• 📊 วิเคราะห์ข้อมูล
• 🔍 ตรวจสอบความสมบูรณ์ของข้อมูล

📝 คำสั่งที่ใช้ได้:
/help - ดูคำสั่งทั้งหมด
/database - จัดการฐานข้อมูล
/status - ตรวจสอบสถานะ

💡 หรือพิมพ์ข้อความใดๆ เพื่อ Chat กับ AI!`;
    
    bot.sendMessage(chatId, welcomeMessage);
});

// Help command
bot.onText(/\/help/, (msg) => {
    const chatId = msg.chat.id;
    const helpMessage = `🆘 คำสั่งทั้งหมด:

🔧 จัดการฐานข้อมูล:
/database - เมนูฐานข้อมูล

📊 การวิเคราะห์:
/status - ตรวจสอบสถานะระบบ

💬 AI Chat:
พิมพ์ข้อความใดๆ เพื่อ Chat กับ Gemini AI
(ระบบจะเลือกโมเดลอัตโนมัติ: Flash สำหรับงานเบา, Pro สำหรับงานหนัก)

🏰 Ashval Database Optimizer Bot v1.0`;
    
    bot.sendMessage(chatId, helpMessage);
});

// Database menu
bot.onText(/\/database/, (msg) => {
    const chatId = msg.chat.id;
    const opts = {
        reply_markup: {
            inline_keyboard: [
                [{ text: '🔄 อัปเดตข้อมูลที่ยังไม่ครบ', callback_data: 'fill_data' }],
                [{ text: '📊 วิเคราะห์คอลัมน์ที่ไม่จำเป็น', callback_data: 'analyze_columns' }],
                [{ text: '⚡ ออปติไมซ์ทั้งหมด', callback_data: 'optimize_all' }]
            ]
        }
    };
    
    bot.sendMessage(chatId, '🗃️ เลือกการดำเนินการกับฐานข้อมูล:', opts);
});

// Handle callback queries
bot.on('callback_query', async (callbackQuery) => {
    const message = callbackQuery.message;
    const chatId = message.chat.id;
    const data = callbackQuery.data;
    
    bot.answerCallbackQuery(callbackQuery.id);
    
    let endpoint = '';
    let action = '';
    
    switch (data) {
        case 'fill_data':
            endpoint = '/api/agent/database/fill-missing';
            action = '🔄 กำลังอัปเดตข้อมูลที่ยังไม่ครบถ้วน...';
            break;
        case 'analyze_columns':
            endpoint = '/api/agent/database/analyze-columns';
            action = '📊 กำลังวิเคราะห์คอลัมน์ที่ไม่จำเป็น...';
            break;
        case 'optimize_all':
            endpoint = '/api/agent/database/optimize';
            action = '⚡ กำลังออปติไมซ์ฐานข้อมูลทั้งหมด...';
            break;
    }
    
    if (endpoint) {
        bot.sendMessage(chatId, action);
        await callDatabaseAPI(endpoint, chatId);
    }
});

// Status command
bot.onText(/\/status/, async (msg) => {
    const chatId = msg.chat.id;
    await checkSystemStatus(chatId);
});

// Handle AI chat
bot.on('message', async (msg) => {
    const chatId = msg.chat.id;
    const text = msg.text;
    
    // Skip commands
    if (!text || text.startsWith('/')) return;
    
    try {
        bot.sendChatAction(chatId, 'typing');
        
        // Smart model selection
        const complexity = assessComplexity(text);
        const modelName = complexity === 'heavy' ? 'gemini-2.5-pro' : 'gemini-1.5-flash';
        
        console.log(`🧠 ใช้โมเดล: ${modelName} (${complexity}) สำหรับ: "${text.substring(0, 30)}..."`);
        
        const model = genAI.getGenerativeModel({ model: modelName });
        
        const prompt = `คุณคือ Ashval AI Assistant ผู้ช่วยในการจัดการฐานข้อมูล Notion สำหรับนิยาย Ashval
        
ตอบคำถามนี้เป็นภาษาไทยให้กระชับและเป็นประโยชน์: ${text}`;
        
        const result = await model.generateContent(prompt);
        const response = result.response;
        const aiText = response.text();
        
        // Split long messages (Telegram limit = 4096 chars)
        if (aiText.length > 4000) {
            const chunks = aiText.match(/.{1,4000}/g);
            for (let i = 0; i < chunks.length; i++) {
                await bot.sendMessage(chatId, `${chunks[i]}${i < chunks.length - 1 ? '\n\n(ต่อ...)' : ''}`);
                if (i < chunks.length - 1) await new Promise(resolve => setTimeout(resolve, 1000));
            }
        } else {
            bot.sendMessage(chatId, `🤖 ${modelName}: ${aiText}`);
        }
        
    } catch (error) {
        console.error('Error in AI chat:', error);
        bot.sendMessage(chatId, '❌ เกิดข้อผิดพลาดในการติดต่อ AI โปรดลองใหม่อีกครั้ง');
    }
});

// Assess message complexity for smart model selection
function assessComplexity(text) {
    const heavyKeywords = [
        'วิเคราะห์', 'analyze', 'ซับซ้อน', 'complex', 'detailed', 'รายละเอียด',
        'เปรียบเทียบ', 'compare', 'สรุป', 'summary', 'อธิบาย', 'explain',
        'แผนงาน', 'plan', 'strategy', 'ยุทธศาสตร์', 'architecture', 'โครงสร้าง'
    ];
    
    const wordCount = text.split(/\s+/).length;
    const hasHeavyKeywords = heavyKeywords.some(keyword => 
        text.toLowerCase().includes(keyword.toLowerCase())
    );
    
    return (wordCount > 15 || hasHeavyKeywords) ? 'heavy' : 'light';
}

// Call database API
async function callDatabaseAPI(endpoint, chatId) {
    try {
        const https = require('https');
        const http = require('http');
        
        const postData = JSON.stringify({
            source: 'telegram_bot',
            chatId: chatId,
            timestamp: new Date().toISOString()
        });
        
        const options = {
            hostname: 'localhost',
            port: 3001,
            path: endpoint,
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Content-Length': Buffer.byteLength(postData)
            }
        };
        
        const req = http.request(options, (res) => {
            let data = '';
            
            res.on('data', (chunk) => {
                data += chunk;
            });
            
            res.on('end', () => {
                try {
                    if (res.statusCode === 200) {
                        const result = JSON.parse(data);
                        bot.sendMessage(chatId, `✅ สำเร็จ!\n\n📊 ผลลัพธ์:\n${JSON.stringify(result, null, 2).substring(0, 3000)}`);
                    } else {
                        bot.sendMessage(chatId, `❌ เกิดข้อผิดพลาด (${res.statusCode}): ${data}`);
                    }
                } catch (parseError) {
                    bot.sendMessage(chatId, `✅ ดำเนินการสำเร็จแล้ว! (${res.statusCode})`);
                }
            });
        });
        
        req.on('error', (error) => {
            console.error('API call error:', error);
            bot.sendMessage(chatId, '❌ ไม่สามารถเชื่อมต่อกับเซิร์ฟเวอร์ได้ โปรดตรวจสอบว่าเซิร์ฟเวอร์ทำงานอยู่');
        });
        
        req.write(postData);
        req.end();
        
    } catch (error) {
        console.error('API call error:', error);
        bot.sendMessage(chatId, '❌ เกิดข้อผิดพลาดในการเรียก API');
    }
}

// Check system status
async function checkSystemStatus(chatId) {
    const statusMessage = `📊 สถานะระบบ Ashval Database Optimizer

🔗 เซิร์ฟเวอร์: กำลังทำงานที่ localhost:3001
🗃️ ฐานข้อมูล: Notion API พร้อมใช้งาน
🤖 AI Model: Smart Selection (Flash/Pro)
🤖 Bot Token: ${process.env.TELEGRAM_BOT_TOKEN ? 'ใช้งานได้ ✅' : 'ไม่พบ ❌'}
⏰ เวลา: ${new Date().toLocaleString('th-TH')}

✅ ระบบพร้อมให้บริการ!

📋 Database IDs:
• Characters: ${process.env.NOTION_CHARACTERS_DB_ID ? '✅' : '❌'}
• Scenes: ${process.env.NOTION_SCENES_DB_ID ? '✅' : '❌'}
• Locations: ${process.env.NOTION_LOCATIONS_DB_ID ? '✅' : '❌'}`;
    
    bot.sendMessage(chatId, statusMessage);
}

// Error handling
bot.on('polling_error', (error) => {
    console.error('❌ Polling error:', error.message);
});

bot.on('error', (error) => {
    console.error('❌ Bot error:', error.message);
});

console.log('🚀 Ashval Telegram Bot เริ่มทำงานแล้ว!');
console.log('📱 พิมพ์ /start ใน Telegram เพื่อเริ่มใช้งาน');
console.log('🔗 Bot Username: @' + (process.env.BOT_USERNAME || 'กำหนดใน .env'));
