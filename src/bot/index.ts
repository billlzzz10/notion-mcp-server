import { AshvalChatBot } from './ashvalChatBot.js';
import { YourChatBot } from './yourChatBot.js';
import { config } from 'dotenv';

// Load environment variables
config();

// Validate required environment variables
const requiredVars = [
  'NOTION_TOKEN',
  'GEMINI_API_KEY',
  'TELEGRAM_BOT_TOKEN',
  'NOTION_PROJECTS_DB_ID',
  'NOTION_CHARACTERS_DB_ID',
  'NOTION_SCENES_DB_ID',
  'NOTION_LOCATIONS_DB_ID'
];

const missingVars = requiredVars.filter(varName => !process.env[varName]);

if (missingVars.length > 0) {
  console.error('❌ Missing required environment variables:');
  missingVars.forEach(varName => {
    console.error(`   - ${varName}`);
  });
  console.error('\n📝 Please create a .env file with these variables.');
  process.exit(1);
}

async function main() {
  try {
    console.log('🚀 Starting Ashval Chat Bots...');
    
    // Start Telegram Bot
    const telegramBot = new AshvalChatBot();
    telegramBot.start();

    // Start Your Chat Bot (เปิดใช้งานเมื่อต้องการ)
    // const yourBot = new YourChatBot();
    // yourBot.start();

    console.log('✅ All bots started successfully!');

    // Handle graceful shutdown
    const shutdown = () => {
      console.log('\n🛑 Shutting down all bots gracefully...');
      telegramBot.stop();
      // yourBot?.stop();
      process.exit(0);
    };

    process.on('SIGINT', shutdown);
    process.on('SIGTERM', shutdown);

  } catch (error) {
    console.error('💥 Failed to start bot:', error);
    process.exit(1);
  }
}

main();
