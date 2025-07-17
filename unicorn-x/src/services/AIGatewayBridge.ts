/**
 * AI Gateway Bridge - สะพานเชื่อมระหว่าง UI และ AI Core
 * เป็นศูนย์กลางในการจัดการคำสั่งภาษาธรรมชาติและแปลงเป็น actions
 */

export interface NaturalLanguageCommand {
  input: string;
  context?: Record<string, any>;
  userId?: string;
  timestamp?: Date;
}

export interface AIIntent {
  action: 'create_dashboard' | 'setup_notification' | 'generate_report' | 'create_automation';
  confidence: number;
  entities: {
    databases?: string[];
    schedule?: string;
    platform?: string;
    conditions?: Array<{
      field: string;
      operator: string;
      value: any;
    }>;
    outputFormat?: string;
  };
  parameters?: Record<string, any>;
}

export interface ExecutionPlan {
  steps: Array<{
    id: string;
    description: string;
    action: string;
    parameters: Record<string, any>;
    estimatedTime: number; // in seconds
    dependencies?: string[];
  }>;
  totalEstimatedTime: number;
  requiredPermissions: string[];
  resourceRequirements: string[];
}

export interface ExecutionResult {
  status: 'success' | 'error' | 'partial';
  message: string;
  data?: any;
  notionPageUrl?: string;
  automationId?: string;
  errors?: Array<{
    step: string;
    error: string;
    code: string;
  }>;
}

export class AIGatewayBridge {
  private apiKey: string;
  private notionToken: string;
  private telegramBotToken?: string;
  private socket: WebSocket | null = null;
  private eventListeners: Map<string, Function[]> = new Map();

  constructor(config: {
    apiKey: string;
    notionToken: string;
    telegramBotToken?: string;
    webSocketUrl?: string;
  }) {
    this.apiKey = config.apiKey;
    this.notionToken = config.notionToken;
    this.telegramBotToken = config.telegramBotToken;
    
    if (config.webSocketUrl) {
      this.connectWebSocket(config.webSocketUrl);
    }
  }

  /**
   * เชื่อมต่อ WebSocket เพื่อรับการอัปเดตแบบเรียลไทม์
   */
  private connectWebSocket(url: string) {
    try {
      this.socket = new WebSocket(url);
      
      this.socket.onopen = () => {
        console.log('🔗 WebSocket connected to AI Gateway');
        this.emit('connection', { status: 'connected' });
      };
      
      this.socket.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          this.handleWebSocketMessage(data);
        } catch (error) {
          console.error('❌ Error parsing WebSocket message:', error);
        }
      };
      
      this.socket.onclose = () => {
        console.log('⚠️ WebSocket disconnected');
        this.emit('connection', { status: 'disconnected' });
        
        // พยายามเชื่อมต่อใหม่หลัง 5 วินาที
        setTimeout(() => this.connectWebSocket(url), 5000);
      };
      
      this.socket.onerror = (error) => {
        console.error('❌ WebSocket error:', error);
        this.emit('error', { message: 'WebSocket connection error' });
      };
    } catch (error) {
      console.error('❌ Failed to create WebSocket connection:', error);
    }
  }

  /**
   * จัดการข้อความจาก WebSocket
   */
  private handleWebSocketMessage(data: any) {
    switch (data.type) {
      case 'execution_progress':
        this.emit('executionProgress', data.data);
        break;
      case 'execution_complete':
        this.emit('executionComplete', data.data);
        break;
      case 'execution_error':
        this.emit('executionError', data.data);
        break;
      case 'notification':
        this.emit('notification', data.data);
        break;
      default:
        this.emit(data.type, data.data);
    }
  }

  /**
   * ประมวลผลคำสั่งภาษาธรรมชาติ
   */
  async processNaturalLanguageCommand(command: NaturalLanguageCommand): Promise<{
    intent: AIIntent;
    plan: ExecutionPlan;
  }> {
    try {
      console.log('🤖 Processing natural language command:', command.input);

      // ใช้ AI ในการวิเคราะห์คำสั่ง
      const intent = await this.analyzeIntent(command.input, command.context);
      
      // สร้างแผนการดำเนินงาน
      const plan = await this.createExecutionPlan(intent, command.context);
      
      console.log('✅ Intent analysis complete:', { intent, plan });
      
      return { intent, plan };
    } catch (error) {
      console.error('❌ Error processing natural language command:', error);
      throw new Error(`Failed to process command: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * วิเคราะห์ความตั้งใจจากคำสั่งภาษาธรรมชาติ
   */
  private async analyzeIntent(input: string, context?: Record<string, any>): Promise<AIIntent> {
    // สำหรับ demo ใช้การวิเคราะห์แบบ rule-based
    const intent: AIIntent = {
      action: this.determineAction(input),
      confidence: 0.85,
      entities: this.extractEntities(input),
      parameters: {}
    };

    // ในระบบจริงจะใช้ AI/ML model เพื่อวิเคราะห์ได้แม่นยำขึ้น
    if (context) {
      intent.parameters = { ...intent.parameters, ...context };
    }

    return intent;
  }

  /**
   * กำหนด action จากข้อความ
   */
  private determineAction(input: string): AIIntent['action'] {
    const lowerInput = input.toLowerCase();
    
    if (lowerInput.includes('แดชบอร์ด') || lowerInput.includes('dashboard')) {
      return 'create_dashboard';
    } else if (lowerInput.includes('แจ้งเตือน') || lowerInput.includes('ส่ง') || lowerInput.includes('notification')) {
      return 'setup_notification';
    } else if (lowerInput.includes('รายงาน') || lowerInput.includes('สรุป') || lowerInput.includes('report')) {
      return 'generate_report';
    } else {
      return 'create_automation';
    }
  }

  /**
   * ดึงข้อมูลที่สำคัญจากข้อความ
   */
  private extractEntities(input: string): AIIntent['entities'] {
    const entities: AIIntent['entities'] = {
      databases: [],
      conditions: []
    };

    // ค้นหาชื่อฐานข้อมูล
    const databaseKeywords = {
      'ลูกค้า': 'customers',
      'customer': 'customers',
      'ขาย': 'sales',
      'sale': 'sales',
      'โปรเจ็ค': 'projects',
      'project': 'projects',
      'งาน': 'tasks',
      'task': 'tasks'
    };

    Object.entries(databaseKeywords).forEach(([keyword, dbName]) => {
      if (input.toLowerCase().includes(keyword)) {
        entities.databases!.push(dbName);
      }
    });

    // ค้นหาเงื่อนไขเวลา
    if (input.includes('ทุกวัน') || input.includes('daily')) {
      entities.schedule = 'daily';
    } else if (input.includes('ทุกเย็น') || input.includes('evening')) {
      entities.schedule = 'daily_evening';
    } else if (input.includes('ทุกสัปดาห์') || input.includes('weekly')) {
      entities.schedule = 'weekly';
    }

    // ค้นหาแพลตฟอร์ม
    if (input.toLowerCase().includes('telegram')) {
      entities.platform = 'telegram';
    } else if (input.toLowerCase().includes('email')) {
      entities.platform = 'email';
    } else {
      entities.platform = 'notion';
    }

    // ค้นหาเงื่อนไขตัวเลข
    const numberMatches = input.match(/(\d+(?:,\d+)*)\s*บาท/g);
    if (numberMatches) {
      numberMatches.forEach(match => {
        const value = parseInt(match.replace(/[^\d]/g, ''));
        entities.conditions!.push({
          field: 'amount',
          operator: 'greater_than',
          value: value
        });
      });
    }

    return entities;
  }

  /**
   * สร้างแผนการดำเนินงาน
   */
  private async createExecutionPlan(intent: AIIntent, context?: Record<string, any>): Promise<ExecutionPlan> {
    const baseSteps = [
      {
        id: 'validate_permissions',
        description: 'ตรวจสอบสิทธิ์การเข้าถึง',
        action: 'validate_access',
        parameters: { required: ['notion_access'] },
        estimatedTime: 5,
        dependencies: []
      },
      {
        id: 'analyze_schema',
        description: 'วิเคราะห์โครงสร้างฐานข้อมูล',
        action: 'analyze_database_schema',
        parameters: { databases: intent.entities.databases || [] },
        estimatedTime: 10,
        dependencies: ['validate_permissions']
      }
    ];

    let specificSteps: typeof baseSteps = [];

    switch (intent.action) {
      case 'create_dashboard':
        specificSteps = [
          {
            id: 'fetch_data',
            description: 'ดึงข้อมูลจากฐานข้อมูล',
            action: 'fetch_notion_data',
            parameters: { databases: intent.entities.databases },
            estimatedTime: 15,
            dependencies: ['analyze_schema']
          },
          {
            id: 'generate_visualizations',
            description: 'สร้างกราฟและการแสดงผล',
            action: 'create_visualizations',
            parameters: { data: '{{fetch_data.result}}' },
            estimatedTime: 20,
            dependencies: ['fetch_data']
          },
          {
            id: 'create_notion_page',
            description: 'สร้างหน้า Notion ใหม่',
            action: 'create_notion_dashboard',
            parameters: { 
              title: this.generateDashboardTitle(intent),
              content: '{{generate_visualizations.result}}'
            },
            estimatedTime: 10,
            dependencies: ['generate_visualizations']
          }
        ];
        break;

      case 'setup_notification':
        specificSteps = [
          {
            id: 'setup_triggers',
            description: 'ตั้งค่าเงื่อนไขการแจ้งเตือน',
            action: 'create_triggers',
            parameters: { 
              conditions: intent.entities.conditions,
              schedule: intent.entities.schedule
            },
            estimatedTime: 15,
            dependencies: ['analyze_schema']
          },
          {
            id: 'configure_channels',
            description: 'ตั้งค่าช่องทางการแจ้งเตือน',
            action: 'setup_notification_channels',
            parameters: { platform: intent.entities.platform },
            estimatedTime: 10,
            dependencies: ['setup_triggers']
          }
        ];
        break;

      case 'generate_report':
        specificSteps = [
          {
            id: 'collect_data',
            description: 'รวบรวมข้อมูลสำหรับรายงาน',
            action: 'collect_report_data',
            parameters: { databases: intent.entities.databases },
            estimatedTime: 20,
            dependencies: ['analyze_schema']
          },
          {
            id: 'generate_report',
            description: 'สร้างรายงาน',
            action: 'create_report',
            parameters: { 
              data: '{{collect_data.result}}',
              format: intent.entities.outputFormat || 'notion'
            },
            estimatedTime: 15,
            dependencies: ['collect_data']
          }
        ];
        break;

      default:
        specificSteps = [
          {
            id: 'create_custom_automation',
            description: 'สร้างระบบอัตโนมัติแบบกำหนดเอง',
            action: 'create_automation',
            parameters: intent.parameters || {},
            estimatedTime: 30,
            dependencies: ['analyze_schema']
          }
        ];
    }

    const allSteps = [...baseSteps, ...specificSteps];
    const totalTime = allSteps.reduce((sum, step) => sum + step.estimatedTime, 0);

    return {
      steps: allSteps,
      totalEstimatedTime: totalTime,
      requiredPermissions: ['notion:read', 'notion:write'],
      resourceRequirements: ['notion_integration']
    };
  }

  /**
   * สร้างชื่อสำหรับแดชบอร์ด
   */
  private generateDashboardTitle(intent: AIIntent): string {
    const databases = intent.entities.databases || [];
    if (databases.length > 0) {
      const dbNames = databases.map(db => {
        switch (db) {
          case 'customers': return 'ลูกค้า';
          case 'sales': return 'ยอดขาย';
          case 'projects': return 'โปรเจ็ค';
          case 'tasks': return 'งาน';
          default: return db;
        }
      }).join(' และ ');
      return `แดชบอร์ด${dbNames}`;
    }
    return 'แดชบอร์ดภาพรวม';
  }

  /**
   * ดำเนินการตามแผน
   */
  async executeAction(intent: AIIntent, plan: ExecutionPlan): Promise<ExecutionResult> {
    try {
      console.log('🚀 Starting execution with plan:', plan);
      
      // ส่งสัญญาณเริ่มดำเนินการ
      this.emit('executionStarted', { intent, plan });

      const results: Record<string, any> = {};
      
      for (const step of plan.steps) {
        try {
          console.log(`⏳ Executing step: ${step.description}`);
          
          // ส่งสัญญาณความคืบหน้า
          this.emit('executionProgress', {
            stepId: step.id,
            description: step.description,
            status: 'running'
          });

          // จำลองการดำเนินการ (ในระบบจริงจะเรียก API หรือบริการจริง)
          await this.simulateStepExecution(step);
          
          results[step.id] = {
            status: 'success',
            data: `Result for ${step.id}`,
            timestamp: new Date()
          };

          // ส่งสัญญาณความคืบหน้า
          this.emit('executionProgress', {
            stepId: step.id,
            description: step.description,
            status: 'completed'
          });

        } catch (error) {
          console.error(`❌ Error in step ${step.id}:`, error);
          
          this.emit('executionProgress', {
            stepId: step.id,
            description: step.description,
            status: 'error',
            error: error instanceof Error ? error.message : 'Unknown error'
          });

          return {
            status: 'error',
            message: `เกิดข้อผิดพลาดในขั้นตอน: ${step.description}`,
            errors: [{
              step: step.id,
              error: error instanceof Error ? error.message : 'Unknown error',
              code: 'EXECUTION_ERROR'
            }]
          };
        }
      }

      const result: ExecutionResult = {
        status: 'success',
        message: 'ดำเนินการเสร็จสิ้นเรียบร้อยแล้ว',
        data: results,
        notionPageUrl: this.generateNotionUrl(intent),
        automationId: `automation_${Date.now()}`
      };

      this.emit('executionComplete', result);
      console.log('✅ Execution completed successfully');

      return result;

    } catch (error) {
      console.error('❌ Execution failed:', error);
      
      const errorResult: ExecutionResult = {
        status: 'error',
        message: error instanceof Error ? error.message : 'เกิดข้อผิดพลาดไม่ทราบสาเหตุ'
      };

      this.emit('executionError', errorResult);
      return errorResult;
    }
  }

  /**
   * จำลองการดำเนินการในแต่ละขั้นตอน
   */
  private async simulateStepExecution(step: any): Promise<void> {
    // จำลองเวลาในการประมวลผล
    await new Promise(resolve => setTimeout(resolve, step.estimatedTime * 100));
    
    // สำหรับ demo เพียงแค่ log
    console.log(`✓ Completed step: ${step.id} - ${step.description}`);
  }

  /**
   * สร้าง URL สำหรับหน้า Notion
   */
  private generateNotionUrl(intent: AIIntent): string {
    // ในระบบจริงจะคืน URL ของหน้าที่สร้างจริง
    const baseUrl = 'https://notion.so/unicornx';
    const pageId = Math.random().toString(36).substring(2, 15);
    return `${baseUrl}/${pageId}`;
  }

  /**
   * ระบบจัดการเหตุการณ์
   */
  on(eventName: string, listener: Function) {
    if (!this.eventListeners.has(eventName)) {
      this.eventListeners.set(eventName, []);
    }
    this.eventListeners.get(eventName)!.push(listener);
  }

  private emit(eventName: string, data: any) {
    const listeners = this.eventListeners.get(eventName);
    if (listeners) {
      listeners.forEach(listener => {
        try {
          listener(data);
        } catch (error) {
          console.error(`Error in event listener for ${eventName}:`, error);
        }
      });
    }
  }

  /**
   * ทำลายการเชื่อมต่อ
   */
  disconnect() {
    if (this.socket) {
      this.socket.close();
      this.socket = null;
    }
    this.eventListeners.clear();
  }
}
