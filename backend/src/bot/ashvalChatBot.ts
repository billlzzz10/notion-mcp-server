import { Bot, Context } from "grammy";
import { router } from "../Router.js";

export class AshvalChatBot {
  private bot: Bot;
  private conversationHistory = new Map<string, any[]>();

  constructor() {
    // Initialize Telegram Bot with grammy
    const telegramToken = process.env.TELEGRAM_BOT_TOKEN;
    if (!telegramToken) {
      throw new Error("TELEGRAM_BOT_TOKEN environment variable is required");
    }
    
    this.bot = new Bot(telegramToken);
    this.setupBotHandlers();
  }

  private setupBotHandlers() {
    // Start command
    this.bot.command("start", async (ctx: Context) => {
      await ctx.reply(`
🏰 **ยินดีต้อนรับสู่ Ashval Chat Bot!**

ฉันเป็น AI ผู้ช่วยที่จะช่วยคุณจัดการโลก Ashval ผ่าน Notion Database

**คำสั่งที่ใช้ได้:**
📊 /projects - จัดการโปรเจกต์
👥 /characters - จัดการตัวละคร  
🎬 /scenes - จัดการฉาก
🏰 /locations - จัดการสถานที่
📈 /stats - ดูสถิติทั้งหมด
🔍 /search <คำค้นหา> - ค้นหาข้อมูล
💡 /prompt <คำถาม> - วิเคราะห์ AI Prompts
❓ /help - ดูคำสั่งทั้งหมด

หรือพิมพ์ข้อความธรรมดาเพื่อสนทนากับ AI! 🤖
      `, { parse_mode: 'Markdown' });
    });

    // Help command
    this.bot.onText(/\/help/, (msg) => {
      const chatId = msg.chat.id;
      this.bot.sendMessage(chatId, this.getHelpMessage(), { parse_mode: 'Markdown' });
    });

    // Projects command
    this.bot.onText(/\/projects (.+)?/, async (msg, match) => {
      const chatId = msg.chat.id;
      const action = match?.[1] || 'list';
      await this.handleProjectsCommand(chatId, action);
    });

    // Characters command
    this.bot.onText(/\/characters (.+)?/, async (msg, match) => {
      const chatId = msg.chat.id;
      const action = match?.[1] || 'list';
      await this.handleCharactersCommand(chatId, action);
    });

    // Stats command
    this.bot.onText(/\/stats/, async (msg) => {
      const chatId = msg.chat.id;
      await this.handleStatsCommand(chatId);
    });

    // Search command
    this.bot.onText(/\/search (.+)/, async (msg, match) => {
      const chatId = msg.chat.id;
      const query = match?.[1];
      if (query) {
        await this.handleSearchCommand(chatId, query);
      }
    });

    // Prompt analysis command
    this.bot.onText(/\/prompt (.+)/, async (msg, match) => {
      const chatId = msg.chat.id;
      const prompt = match?.[1];
      if (prompt) {
        await this.handlePromptAnalysis(chatId, prompt);
      }
    });

    // Handle regular messages
    this.bot.on('message', async (msg) => {
      const chatId = msg.chat.id;
      const text = msg.text;

      // Skip if it's a command
      if (text?.startsWith('/')) return;

      if (text) {
        await this.handleRegularMessage(chatId, text, msg.from?.first_name || 'User');
      }
    });

    // Handle callback queries (inline buttons)
    this.bot.on('callback_query', async (callbackQuery) => {
      const message = callbackQuery.message;
      const data = callbackQuery.data;
      
      if (message && data) {
        await this.handleCallbackQuery(message.chat.id, data, callbackQuery.id);
      }
    });
  }

  private async handleRegularMessage(chatId: number, text: string, userName: string) {
    try {
      // Show typing indicator
      await this.bot.sendChatAction(chatId, 'typing');

      // Get conversation history
      const history = this.conversationHistory.get(chatId.toString()) || [];
      
      // Add user message to history
      history.push({
        role: "user",
        parts: [{ text: `${userName}: ${text}` }]
      });

      // Create AI prompt with Ashval context
      const contextPrompt = `
You are an AI assistant for the Ashval world-building project. You help manage characters, scenes, locations, and projects through Notion databases.

Current conversation with ${userName}:
${history.map(h => h.parts[0].text).join('\n')}

Please respond helpfully about Ashval world-building, character development, story creation, or general chat. Keep responses concise and engaging. Use Thai language naturally.

If the user asks about specific data manipulation, suggest using appropriate commands like /projects, /characters, etc.
      `;

      // Use the new Router to handle the query
      const routerResponse = await router.handleQuery({
        query: text,
        cacheContext: history.map(h => h.parts[0].text).join('\n'),
      });
      const response = routerResponse.text;

      // Add AI response to history
      history.push({
        role: "model", 
        parts: [{ text: response }]
      });

      // Keep only last 10 messages
      if (history.length > 10) {
        history.splice(0, history.length - 10);
      }

      // Save history
      this.conversationHistory.set(chatId.toString(), history);

      // Send response
      await this.bot.sendMessage(chatId, response, { parse_mode: 'Markdown' });

    } catch (error) {
      console.error('Error in regular message handling:', error);
      await this.bot.sendMessage(chatId, '❌ เกิดข้อผิดพลาดในการประมวลผล กรุณาลองใหม่อีกครั้ง');
    }
  }

  private async handleProjectsCommand(chatId: number, action: string) {
    try {
      await this.bot.sendChatAction(chatId, 'typing');

      switch (action) {
        case 'list':
          const projectsResult = await this.callMCPTool('queryProjects', {
            databaseId: process.env.NOTION_PROJECTS_DB_ID
          });
          
          if (projectsResult.success) {
            const projects = projectsResult.projects.slice(0, 5); // Show first 5
            const projectList = projects.map((p: any, i: number) => {
              const name = p.properties?.Name?.title?.[0]?.text?.content || 'ไม่มีชื่อ';
              const status = p.properties?.Status?.select?.name || 'ไม่ระบุ';
              const priority = p.properties?.Priority?.select?.name || 'ไม่ระบุ';
              return `${i+1}. **${name}**\n   📊 Status: ${status}\n   🔥 Priority: ${priority}`;
            }).join('\n\n');

            await this.bot.sendMessage(chatId, `📊 **Projects Overview**\n\n${projectList}`, {
              parse_mode: 'Markdown',
              reply_markup: {
                inline_keyboard: [
                  [{ text: '➕ Create Project', callback_data: 'create_project' }],
                  [{ text: '📈 Project Stats', callback_data: 'project_stats' }]
                ]
              }
            });
          }
          break;

        default:
          await this.bot.sendMessage(chatId, '❓ ใช้คำสั่ง: /projects list');
      }
    } catch (error) {
      console.error('Error in projects command:', error);
      await this.bot.sendMessage(chatId, '❌ เกิดข้อผิดพลาดในการเรียกข้อมูลโปรเจกต์');
    }
  }

  private async handleCharactersCommand(chatId: number, action: string) {
    try {
      await this.bot.sendChatAction(chatId, 'typing');
      
      const charactersResult = await this.callMCPTool('queryDatabase', {
        databaseId: process.env.NOTION_CHARACTERS_DB_ID,
        sorts: [{ property: 'Name', direction: 'ascending' }]
      });

      if (charactersResult.success) {
        const characters = charactersResult.results.slice(0, 5);
        const characterList = characters.map((c: any, i: number) => {
          const name = c.properties?.Name?.title?.[0]?.text?.content || 'ไม่มีชื่อ';
          const race = c.properties?.Race?.select?.name || 'ไม่ระบุ';
          const status = c.properties?.Status?.select?.name || 'ไม่ระบุ';
          return `${i+1}. **${name}**\n   🧬 Race: ${race}\n   💚 Status: ${status}`;
        }).join('\n\n');

        await this.bot.sendMessage(chatId, `👥 **Characters Overview**\n\n${characterList}`, {
          parse_mode: 'Markdown',
          reply_markup: {
            inline_keyboard: [
              [{ text: '➕ Create Character', callback_data: 'create_character' }],
              [{ text: '🔍 Character Analysis', callback_data: 'character_analysis' }]
            ]
          }
        });
      }
    } catch (error) {
      console.error('Error in characters command:', error);
      await this.bot.sendMessage(chatId, '❌ เกิดข้อผิดพลาดในการเรียกข้อมูลตัวละคร');
    }
  }

  private async handleStatsCommand(chatId: number) {
    try {
      await this.bot.sendChatAction(chatId, 'typing');

      // Get project stats
      const projectStats = await this.callMCPTool('getProjectStats', {
        databaseId: process.env.NOTION_PROJECTS_DB_ID
      });

      // Get database analysis
      const dbAnalysis = await this.callMCPTool('ashval_database_analyzer', {
        databases: [
          { id: process.env.NOTION_CHARACTERS_DB_ID, name: 'Characters' },
          { id: process.env.NOTION_SCENES_DB_ID, name: 'Scenes' },
          { id: process.env.NOTION_LOCATIONS_DB_ID, name: 'Locations' }
        ]
      });

      let statsMessage = '📈 **Ashval World Statistics**\n\n';

      if (projectStats.success) {
        const stats = projectStats.stats;
        statsMessage += `**📊 Projects Overview:**\n`;
        statsMessage += `• Total: ${stats.total}\n`;
        statsMessage += `• Completed: ${stats.byStatus.Completed}\n`;
        statsMessage += `• In Progress: ${stats.byStatus['In progress']}\n`;
        statsMessage += `• Overdue: ${stats.overdue}\n\n`;
      }

      if (dbAnalysis.success) {
        statsMessage += `**🗃️ Database Summary:**\n`;
        dbAnalysis.databases.forEach((db: any) => {
          statsMessage += `• ${db.name}: ${db.totalPages} entries\n`;
        });
      }

      await this.bot.sendMessage(chatId, statsMessage, { 
        parse_mode: 'Markdown',
        reply_markup: {
          inline_keyboard: [
            [{ text: '🔄 Refresh Stats', callback_data: 'refresh_stats' }],
            [{ text: '📊 Detailed Analysis', callback_data: 'detailed_analysis' }]
          ]
        }
      });

    } catch (error) {
      console.error('Error in stats command:', error);
      await this.bot.sendMessage(chatId, '❌ เกิดข้อผิดพลาดในการเรียกสถิติ');
    }
  }

  private async handleSearchCommand(chatId: number, query: string) {
    try {
      await this.bot.sendChatAction(chatId, 'typing');

      const searchResult = await this.callMCPTool('searchPage', {
        query: query,
        sort: { direction: 'descending', timestamp: 'last_edited_time' }
      });

      if (searchResult.success && searchResult.results.length > 0) {
        const results = searchResult.results.slice(0, 3);
        const resultList = results.map((r: any, i: number) => {
          const title = r.properties?.Name?.title?.[0]?.text?.content || 
                       r.properties?.Title?.title?.[0]?.text?.content || 'ไม่มีชื่อ';
          return `${i+1}. **${title}**`;
        }).join('\n');

        await this.bot.sendMessage(chatId, `🔍 **Search Results for "${query}"**\n\n${resultList}`, {
          parse_mode: 'Markdown'
        });
      } else {
        await this.bot.sendMessage(chatId, `❌ ไม่พบผลลัพธ์สำหรับ "${query}"`);
      }
    } catch (error) {
      console.error('Error in search command:', error);
      await this.bot.sendMessage(chatId, '❌ เกิดข้อผิดพลาดในการค้นหา');
    }
  }

  private async handlePromptAnalysis(chatId: number, prompt: string) {
    try {
      await this.bot.sendChatAction(chatId, 'typing');

      const analysisResult = await this.callMCPTool('ashval_story_structure_analyzer', {
        analysisType: 'ai_prompts',
        content: prompt
      });

      if (analysisResult.success) {
        const analysis = analysisResult.analysis.ai_prompts;
        
        let message = `🧠 **AI Prompt Analysis**\n\n`;
        message += `**📊 Effectiveness Score:** ${analysis.effectivenessScore}/10\n\n`;
        message += `**🏷️ Prompt Type:** ${analysis.promptType}\n\n`;
        message += `**💡 Improvement Suggestions:**\n`;
        analysis.improvementSuggestions.forEach((suggestion: string, i: number) => {
          message += `${i+1}. ${suggestion}\n`;
        });

        await this.bot.sendMessage(chatId, message, { parse_mode: 'Markdown' });
      }
    } catch (error) {
      console.error('Error in prompt analysis:', error);
      await this.bot.sendMessage(chatId, '❌ เกิดข้อผิดพลาดในการวิเคราะห์ prompt');
    }
  }

  private async handleCallbackQuery(chatId: number, data: string, queryId: string) {
    try {
      await this.bot.answerCallbackQuery(queryId);

      switch (data) {
        case 'refresh_stats':
          await this.handleStatsCommand(chatId);
          break;
        
        case 'project_stats':
          const projectStats = await this.callMCPTool('getProjectStats', {
            databaseId: process.env.NOTION_PROJECTS_DB_ID
          });
          
          if (projectStats.success) {
            const stats = projectStats.stats;
            let message = `📊 **Detailed Project Statistics**\n\n`;
            message += `**By Status:**\n`;
            Object.entries(stats.byStatus).forEach(([status, count]) => {
              message += `• ${status}: ${count}\n`;
            });
            message += `\n**By Priority:**\n`;
            Object.entries(stats.byPriority).forEach(([priority, count]) => {
              message += `• ${priority}: ${count}\n`;
            });
            message += `\n**Other Metrics:**\n`;
            message += `• Average Progress: ${stats.averageProgress}%\n`;
            message += `• Total Budget: $${stats.totalBudget.toLocaleString()}\n`;
            message += `• Overdue Projects: ${stats.overdue}\n`;

            await this.bot.sendMessage(chatId, message, { parse_mode: 'Markdown' });
          }
          break;

        default:
          await this.bot.sendMessage(chatId, '🔄 กำลังดำเนินการ...');
      }
    } catch (error) {
      console.error('Error in callback query:', error);
    }
  }

  private async callMCPTool(toolName: string, args: any): Promise<any> {
    try {
      // Import tool handlers directly
      const { handleProjectsTools } = await import('../tools/projects.js');
      const { registerDatabaseOperationTool } = await import('../tools/database.js');
      const { registerPagesOperationTool } = await import('../tools/pages.js');
      const { handleDatabaseAnalysis } = await import('../tools/databaseAnalyzer.js');
      const { handleStoryStructureAnalysis } = await import('../tools/storyStructureAnalyzer.js');

      // Route to appropriate handler
      switch (toolName) {
        case 'createProject':
        case 'updateProject':
        case 'queryProjects':
        case 'getProjectStats':
          return await handleProjectsTools(toolName, args);
        
        case 'queryDatabase':
          return await registerDatabaseOperationTool({ payload: { action: 'query_database', params: args } });
        
        case 'searchPage':
          return await registerPagesOperationTool({ payload: { operation: 'search', ...args } });
        
        case 'ashval_database_analyzer':
          return await handleDatabaseAnalysis(args);
        
        case 'ashval_story_structure_analyzer':
          return await handleStoryStructureAnalysis(args);
        
        default:
          throw new Error(`Unknown tool: ${toolName}`);
      }
    } catch (error) {
      console.error(`Error calling MCP tool ${toolName}:`, error);
      return { success: false, error: (error as Error).message };
    }
  }

  private getHelpMessage(): string {
    return `
🤖 **Ashval Chat Bot Commands**

**📊 Data Management:**
• \`/projects [action]\` - จัดการโปรเจกต์
• \`/characters [action]\` - จัดการตัวละคร
• \`/scenes [action]\` - จัดการฉาก
• \`/locations [action]\` - จัดการสถานที่

**📈 Analytics:**
• \`/stats\` - ดูสถิติทั้งหมด
• \`/search <query>\` - ค้นหาข้อมูล

**🧠 AI Features:**
• \`/prompt <text>\` - วิเคราะห์ AI prompts
• พิมพ์ข้อความธรรมดาเพื่อสนทนากับ AI

**💡 Tips:**
• ใช้ inline buttons เพื่อการนำทางที่ง่าย
• Bot จดจำบทสนทนาได้ 10 ข้อความล่าสุด
• รองรับ Markdown formatting

พิมพ์ข้อความธรรมดาเพื่อเริ่มสนทนา! 💬
    `;
  }

  public start() {
    console.log('🤖 Ashval Chat Bot started successfully!');
    console.log('📱 Ready to receive Telegram messages');
    console.log('🧠 Gemini AI integration active');
  }

  public stop() {
    this.bot.stopPolling();
    console.log('🛑 Ashval Chat Bot stopped');
  }
}
