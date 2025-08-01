import express from 'express';
import { getSchema } from './schema-check.js';
import { AdvancedLogManager, SecurityManager, RateLimiter } from './managers.js';
import { findAndFillMissingData, analyzeUnnecessaryColumns } from '../../src/tools/databaseOptimizer.js';

const router = express.Router();

/**
 * Smart AI Model Selection
 * เลือกโมเดล AI ตามความซับซ้อนของงาน
 */
class SmartModelRouter {
  constructor() {
    this.modelStrategies = {
      light: {
        model: 'gemini-1.5-flash',
        maxTokens: 8192,
        temperature: 0.7,
        tasks: ['summary', 'quick-analysis', 'status-update', 'simple-query'],
        costLevel: 'low',
        speedLevel: 'high',
        description: 'เร็ว ประหยัด เหมาะกับงานเบาๆ'
      },
      heavy: {
        model: 'gemini-2.0-flash-exp', // หรือ gemini-2.5-pro เมื่อออก
        maxTokens: 32768,
        temperature: 0.3,
        tasks: ['deep-analysis', 'complex-reasoning', 'multi-step-workflow', 'code-generation'],
        costLevel: 'high',
        speedLevel: 'medium',
        description: 'แม่นยำ ลึกซึ้ง เหมาะกับงานหนัก'
      }
    };
  }

  assessTaskComplexity(command, context = {}) {
    const complexityFactors = {
      heavyKeywords: [
        'analyze', 'generate', 'create', 'build', 'develop', 'design',
        'วิเคราะห์', 'สร้าง', 'พัฒนา', 'ออกแบบ', 'ประมวลผล',
        'comprehensive', 'detailed', 'advanced', 'complex'
      ],
      lightKeywords: [
        'list', 'show', 'get', 'check', 'status', 'summary',
        'แสดง', 'ดู', 'เช็ค', 'สถานะ', 'สรุป', 'รายการ'
      ],
      dataSize: context.dataSize || 0,
      steps: context.steps || 1,
      precisionRequired: context.precision || 'medium'
    };

    let complexityScore = 0;
    const commandLower = command.toLowerCase();
    
    complexityFactors.heavyKeywords.forEach(keyword => {
      if (commandLower.includes(keyword)) {
        complexityScore += 0.3;
      }
    });

    complexityFactors.lightKeywords.forEach(keyword => {
      if (commandLower.includes(keyword)) {
        complexityScore -= 0.2;
      }
    });

    if (complexityFactors.dataSize > 1000) complexityScore += 0.2;
    if (complexityFactors.dataSize > 10000) complexityScore += 0.3;
    if (complexityFactors.steps > 3) complexityScore += 0.2;
    if (complexityFactors.steps > 10) complexityScore += 0.4;
    if (complexityFactors.precisionRequired === 'high') complexityScore += 0.3;
    if (complexityFactors.precisionRequired === 'critical') complexityScore += 0.5;

    complexityScore = Math.max(0, Math.min(1, complexityScore));

    return {
      score: complexityScore,
      level: complexityScore > 0.6 ? 'heavy' : 'light',
      factors: complexityFactors,
      reasoning: this.explainComplexity(complexityScore, complexityFactors)
    };
  }

  selectOptimalModel(command, context = {}, options = {}) {
    const complexity = this.assessTaskComplexity(command, context);
    
    if (options.forceModel) {
      const forcedStrategy = options.forceModel === 'heavy' ? 'heavy' : 'light';
      return {
        ...this.modelStrategies[forcedStrategy],
        complexity,
        overridden: true,
        reason: `Forced to use ${forcedStrategy} model by user`
      };
    }

    if (options.urgent === true) {
      return {
        ...this.modelStrategies.light,
        complexity,
        overridden: true,
        reason: 'Using fast model due to urgent flag'
      };
    }

    if (options.precision === 'critical') {
      return {
        ...this.modelStrategies.heavy,
        complexity,
        overridden: true,
        reason: 'Using precise model due to critical precision requirement'
      };
    }

    const selectedStrategy = this.modelStrategies[complexity.level];
    
    return {
      ...selectedStrategy,
      complexity,
      overridden: false,
      reason: `Selected ${complexity.level} model based on complexity analysis`
    };
  }

  explainComplexity(score, factors) {
    const reasons = [];
    
    if (score > 0.6) {
      reasons.push('งานมีความซับซ้อนสูง');
      if (factors.steps > 10) reasons.push('มีขั้นตอนมาก');
      if (factors.dataSize > 10000) reasons.push('ข้อมูลขนาดใหญ่');
      if (factors.precisionRequired === 'critical') reasons.push('ต้องการความแม่นยำสูง');
    } else {
      reasons.push('งานมีความซับซ้อนต่ำถึงปานกลาง');
      if (factors.steps <= 3) reasons.push('มีขั้นตอนน้อย');
      if (factors.dataSize <= 1000) reasons.push('ข้อมูลขนาดเล็ก');
    }

    return reasons.join(', ');
  }

  getUsageStats() {
    return {
      modelStrategies: this.modelStrategies,
      recommendations: {
        light: 'ใช้สำหรับงานสรุป, ค้นหา, อัปเดตสถานะ',
        heavy: 'ใช้สำหรับงานวิเคราะห์, สร้างเนื้อหา, การให้เหตุผลซับซ้อน'
      },
      timestamp: new Date().toISOString()
    };
  }
}

// Enhanced Gateway with Logging & Security
class EnhancedGateway {
  constructor() {
    this.logManager = new AdvancedLogManager();
    this.securityManager = new SecurityManager();
    this.rateLimiter = new RateLimiter();
    this.modelRouter = new SmartModelRouter();
  }

  async processRequest(request) {
    // Security & Rate Limiting
    await this.securityManager.validate(request);
    await this.rateLimiter.check(request.user || 'anonymous');
    
    // Advanced Logging
    const logId = this.logManager.startTransaction(request);
    
    try {
      const result = await this.processCore(request);
      this.logManager.success(logId, result);
      return result;
    } catch (error) {
      this.logManager.error(logId, error);
      throw error;
    }
  }

  async processCore(request) {
    const { command, context, options } = request.body;
    const modelSelection = this.modelRouter.selectOptimalModel(command, context, options);
    
    this.logManager.logEvent('model_selection', {
      command: command?.substring(0, 100) + '...',
      selectedModel: modelSelection.model,
      complexity: modelSelection.complexity.score,
      reason: modelSelection.reason
    });

    return {
      modelSelection,
      message: `เลือกโมเดล ${modelSelection.model} (${modelSelection.description})`
    };
  }

  async getSystemStats() {
    return {
      logging: await this.logManager.getStatistics(),
      security: this.securityManager.getSecurityStats(),
      rateLimiting: this.rateLimiter.getUsageStats(),
      modelRouting: this.modelRouter.getUsageStats(),
      timestamp: new Date().toISOString()
    };
  }
}

// สร้าง instance global
const gateway = new EnhancedGateway();

/**
 * Middleware: Check schemas of all relevant databases
 */
async function checkAllSchemas(req, res, next) {
  // Bypass schema check for development
  if (process.env.NODE_ENV === 'development') {
    console.log('⚠️ Bypassing schema check for development');
    next();
    return;
  }
  
  const dbIds = [
    process.env.NOTION_PROJECTS_DB_ID,
    process.env.NOTION_TASKS_DB_ID,
    process.env.NOTION_CHARACTERS_DB_ID,
    process.env.NOTION_PROJECT_PROGRESS_DB_ID
  ].filter(Boolean);
  try {
    for (const id of dbIds) {
      await getSchema(id);
    }
    next();
  } catch (err) {
    console.error('❌ Error checking database schemas:', err);
    res.status(500).json({ success: false, error: 'Failed to validate database schemas' });
  }
}

// Apply middleware to all /api/agent routes
router.use(checkAllSchemas);

/**
 * Agent Command Processor Endpoint
 * รับคำสั่งจากผู้ใช้และให้ AI Agent ประมวลผลอัตโนมัติ
 */
router.post('/process-command', async (req, res) => {
  try {
    const { command, context, options = {} } = req.body;
    
    if (!command) {
      return res.status(400).json({
        success: false,
        error: 'กรุณาระบุคำสั่งที่ต้องการให้ Agent ประมวลผล'
      });
    }
    
    console.log(`🤖 Agent รับคำสั่ง: "${command}"`);
    
    // ใช้ Enhanced Gateway ในการประมวลผล
    const gatewayResult = await gateway.processRequest(req);
    
    // Import the agent decision engine
    const { processAgentCommand } = await import('../../src/tools/agentDecisionEngine.js');
    
    // Process the command through AI Agent with selected model
    const result = await processAgentCommand({
      userCommand: command,
      context: context || {},
      options: {
        ...options,
        modelSelection: gatewayResult.modelSelection
      }
    });
    
    res.json({
      success: true,
      timestamp: new Date().toISOString(),
      modelInfo: {
        selectedModel: gatewayResult.modelSelection.model,
        complexity: gatewayResult.modelSelection.complexity.score,
        reason: gatewayResult.modelSelection.reason
      },
      ...result
    });
    
  } catch (error) {
    console.error('❌ เกิดข้อผิดพลาดใน Agent Command Processor:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * YouTube Analysis Endpoint
 * วิเคราะห์วิดีโอ YouTube โดยตรง
 */
router.post('/youtube/analyze', async (req, res) => {
  try {
    const { youtubeUrl, analysisType = 'summary', saveToNotion = true, saveToGoogleDrive = false } = req.body;
    
    if (!youtubeUrl) {
      return res.status(400).json({
        success: false,
        error: 'กรุณาระบุ YouTube URL'
      });
    }
    
    console.log(`🎥 กำลังวิเคราะห์ YouTube: ${youtubeUrl}`);
    
    // Import YouTube analyzer
    const { analyzeYouTubeVideo } = await import('../../src/tools/youtubeAnalyzer.js');
    
    // Analyze the video
    const analysisResult = await analyzeYouTubeVideo({
      youtubeUrl,
      analysisType,
      saveToNotion
    });
    
    // Save to Google Drive if requested
    let driveResult = null;
    if (saveToGoogleDrive && analysisResult.success) {
      const { manageGoogleDrive } = await import('../../src/tools/googleDriveManager.js');
      
      driveResult = await manageGoogleDrive({
        action: 'upload',
        content: JSON.stringify(analysisResult.result, null, 2),
        fileName: `YouTube_Analysis_${analysisResult.result.videoId}_${Date.now()}.json`,
        fileType: 'text',
        notionPageId: analysisResult.notionPageId
      });
    }
    
    res.json({
      success: true,
      timestamp: new Date().toISOString(),
      youtubeAnalysis: analysisResult,
      googleDrive: driveResult
    });
    
  } catch (error) {
    console.error('❌ เกิดข้อผิดพลาดในการวิเคราะห์ YouTube:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * Google Drive Management Endpoint
 * จัดการไฟล์ใน Google Drive
 */
router.post('/drive/manage', async (req, res) => {
  try {
    const { action, content, fileName, fileType, folderId, notionPageId, shareSettings } = req.body;
    
    if (!action) {
      return res.status(400).json({
        success: false,
        error: 'กรุณาระบุการดำเนินการ (action)'
      });
    }
    
    console.log(`📁 กำลังจัดการ Google Drive: ${action}`);
    
    // Import Google Drive manager
    const { manageGoogleDrive } = await import('../../src/tools/googleDriveManager.js');
    
    // Execute the drive operation
    const result = await manageGoogleDrive({
      action,
      content,
      fileName,
      fileType,
      folderId,
      notionPageId,
      shareSettings
    });
    
    res.json({
      success: true,
      timestamp: new Date().toISOString(),
      ...result
    });
    
  } catch (error) {
    console.error('❌ เกิดข้อผิดพลาดในการจัดการ Google Drive:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * Webhook Endpoint for Make.com and other services
 * รับ webhook จากบริการภายนอก
 */
router.post('/webhook/:source', async (req, res) => {
  try {
    const { source } = req.params;
    const payload = req.body;
    
    console.log(`🔗 รับ webhook จาก ${source}:`, payload);
    
    // Extract command from different webhook sources
    let command = '';
    let context = { source, timestamp: new Date().toISOString() };
    
    switch (source.toLowerCase()) {
      case 'make':
      case 'zapier':
        command = payload.command || payload.text || payload.message || '';
        context = { ...context, ...payload.context };
        break;
      case 'colab':
        command = payload.notebook_command || payload.instruction || '';
        context = { ...context, notebook_id: payload.notebook_id };
        break;
      default:
        command = payload.command || payload.text || JSON.stringify(payload);
    }
    
    if (!command) {
      return res.status(400).json({
        success: false,
        error: 'ไม่พบคำสั่งใน webhook payload'
      });
    }
    
    // สร้าง fake request เพื่อใช้กับ Enhanced Gateway
    const fakeReq = {
      body: { command, context },
      headers: req.headers,
      ip: req.ip,
      connection: req.connection,
      method: req.method,
      url: req.url,
      user: `webhook_${source}`
    };
    
    // ใช้ Enhanced Gateway ในการประมวลผล
    const gatewayResult = await gateway.processRequest(fakeReq);
    
    // Process through AI Agent
    const { processAgentCommand } = await import('../../src/tools/agentDecisionEngine.js');
    
    const result = await processAgentCommand({
      userCommand: command,
      context,
      options: {
        modelSelection: gatewayResult.modelSelection
      }
    });
    
    res.json({
      success: true,
      source,
      timestamp: new Date().toISOString(),
      modelInfo: {
        selectedModel: gatewayResult.modelSelection.model,
        complexity: gatewayResult.modelSelection.complexity.score,
        reason: gatewayResult.modelSelection.reason
      },
      ...result
    });
    
  } catch (error) {
    console.error(`❌ เกิดข้อผิดพลาดในการประมวลผล webhook จาก ${req.params.source}:`, error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * System Statistics Endpoint
 * ดูสถิติการทำงานของระบบทั้งหมด
 */
router.get('/system-stats', async (req, res) => {
  try {
    const stats = await gateway.getSystemStats();
    res.json({
      success: true,
      stats
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * Model Selection Test Endpoint
 * ทดสอบการเลือกโมเดล AI
 */
router.post('/test-model-selection', async (req, res) => {
  try {
    const { command, context = {}, options = {} } = req.body;
    
    if (!command) {
      return res.status(400).json({
        success: false,
        error: 'กรุณาระบุคำสั่งที่ต้องการทดสอบ'
      });
    }
    
    const modelSelection = gateway.modelRouter.selectOptimalModel(command, context, options);
    
    res.json({
      success: true,
      command,
      modelSelection,
      explanation: {
        complexity: modelSelection.complexity,
        reasoning: modelSelection.reasoning || modelSelection.reason,
        alternatives: {
          light: gateway.modelRouter.modelStrategies.light,
          heavy: gateway.modelRouter.modelStrategies.heavy
        }
      }
    });
    
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Database Optimizer Endpoints
router.post('/database/fill-missing', async (req, res) => {
  try {
    const { databaseId, autoFill = false, fieldTypes } = req.body;
    
    console.log('🔍 เริ่มตรวจสอบข้อมูลที่ขาดหาย...');
    
    const result = await findAndFillMissingData.execute({
      databaseId,
      autoFill,
      fieldTypes
    });
    
    res.json(result);
  } catch (error) {
    console.error('❌ Error in fill-missing endpoint:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

router.post('/database/analyze-columns', async (req, res) => {
  try {
    const { databaseId, minimumUsageThreshold = 20 } = req.body;
    
    console.log('📊 เริ่มวิเคราะห์คอลัมน์ที่ไม่จำเป็น...');
    
    const result = await analyzeUnnecessaryColumns.execute({
      databaseId,
      minimumUsageThreshold
    });
    
    res.json(result);
  } catch (error) {
    console.error('❌ Error in analyze-columns endpoint:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Combined Database Optimization Endpoint
router.post('/database/optimize', async (req, res) => {
  try {
    const { 
      databaseId, 
      autoFill = false, 
      fieldTypes,
      minimumUsageThreshold = 20,
      action = 'both' // 'missing', 'columns', 'both'
    } = req.body;
    
    console.log(`🚀 เริ่มการ optimize ฐานข้อมูล (${action})...`);
    
    const results = {};
    
    if (action === 'missing' || action === 'both') {
      console.log('🔍 ตรวจสอบข้อมูลที่ขาดหาย...');
      results.missingData = await findAndFillMissingData.execute({
        databaseId,
        autoFill,
        fieldTypes
      });
    }
    
    if (action === 'columns' || action === 'both') {
      console.log('📊 วิเคราะห์คอลัมน์ที่ไม่จำเป็น...');
      results.columnAnalysis = await analyzeUnnecessaryColumns.execute({
        databaseId,
        minimumUsageThreshold
      });
    }
    
    res.json({
      success: true,
      action,
      timestamp: new Date().toISOString(),
      results
    });
    
  } catch (error) {
    console.error('❌ Error in optimize endpoint:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

export default router;
