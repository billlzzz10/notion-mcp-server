/**
 * 🤖 AI Agent Service
 * Handles AI-powered automation and intelligent responses
 */

import { GoogleGenerativeAI } from '@google/genai';
import winston from 'winston';

const logger = winston.createLogger({
  level: 'info',
  format: winston.format.simple(),
  transports: [new winston.transports.Console()]
});

export interface AIAgentRequest {
  prompt: string;
  context?: string;
  type: 'chat' | 'analysis' | 'generation' | 'automation';
  model?: string;
}

export interface AIAgentResponse {
  content: string;
  usage?: {
    promptTokens: number;
    completionTokens: number;
    totalTokens: number;
  };
  model: string;
  processingTime: number;
}

class AIAgentServiceClass {
  private genAI: GoogleGenerativeAI | null = null;
  private initialized: boolean = false;

  async initialize(): Promise<void> {
    try {
      logger.info('🤖 Initializing AI Agent Service...');
      
      const apiKey = process.env.GOOGLE_AI_API_KEY;
      if (!apiKey) {
        throw new Error('GOOGLE_AI_API_KEY environment variable is required');
      }

      this.genAI = new GoogleGenerativeAI(apiKey);
      this.initialized = true;
      
      logger.info('✅ AI Agent Service initialized');
    } catch (error) {
      logger.error('❌ AI Agent Service initialization failed:', error);
      throw error;
    }
  }

  async process(request: AIAgentRequest): Promise<AIAgentResponse> {
    const startTime = Date.now();

    try {
      if (!this.initialized || !this.genAI) {
        throw new Error('AI Agent Service not initialized');
      }

      logger.info(`🤖 Processing AI request: ${request.type}`);

      const model = this.genAI.getGenerativeModel({ 
        model: request.model || 'gemini-pro' 
      });

      // Prepare prompt based on type
      const enhancedPrompt = this.enhancePrompt(request);
      
      const result = await model.generateContent(enhancedPrompt);
      const response = await result.response;
      const content = response.text();

      const aiResponse: AIAgentResponse = {
        content,
        model: request.model || 'gemini-pro',
        processingTime: Date.now() - startTime
      };

      logger.info(`✅ AI request completed in ${aiResponse.processingTime}ms`);
      return aiResponse;

    } catch (error) {
      logger.error('❌ AI processing failed:', error);
      throw error;
    }
  }

  private enhancePrompt(request: AIAgentRequest): string {
    const { prompt, context, type } = request;
    
    const systemPrompts = {
      chat: '🦄 You are UnicornX, an intelligent AI assistant. Provide helpful, accurate, and engaging responses.',
      analysis: '📊 You are a data analyst for UnicornX. Analyze the given information and provide insights.',
      generation: '✨ You are a creative content generator for UnicornX. Create high-quality content.',
      automation: '⚡ You are an automation specialist for UnicornX. Help design and implement automated workflows.'
    };

    const systemPrompt = systemPrompts[type] || systemPrompts.chat;
    
    let enhancedPrompt = `${systemPrompt}\n\n`;
    
    if (context) {
      enhancedPrompt += `Context: ${context}\n\n`;
    }
    
    enhancedPrompt += `User Request: ${prompt}`;
    
    return enhancedPrompt;
  }

  // Specialized AI functions
  async generateCode(requirements: string, language: string = 'typescript'): Promise<string> {
    const request: AIAgentRequest = {
      prompt: `Generate ${language} code for: ${requirements}`,
      type: 'generation',
      context: `Language: ${language}, Framework: Modern web development best practices`
    };

    const response = await this.process(request);
    return response.content;
  }

  async analyzeData(data: any, analysisType: string = 'general'): Promise<string> {
    const request: AIAgentRequest = {
      prompt: `Analyze this data: ${JSON.stringify(data, null, 2)}`,
      type: 'analysis',
      context: `Analysis type: ${analysisType}`
    };

    const response = await this.process(request);
    return response.content;
  }

  async createAutomation(workflow: string): Promise<string> {
    const request: AIAgentRequest = {
      prompt: `Create an automation workflow for: ${workflow}`,
      type: 'automation',
      context: 'UnicornX Platform automation capabilities'
    };

    const response = await this.process(request);
    return response.content;
  }

  // Status check
  getStatus() {
    return {
      initialized: this.initialized,
      hasApiKey: !!process.env.GOOGLE_AI_API_KEY,
      service: 'AI Agent Service'
    };
  }
}

// Export singleton instance
export const AIAgentService = new AIAgentServiceClass();
