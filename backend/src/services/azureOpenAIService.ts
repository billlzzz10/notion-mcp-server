/**
 * Azure OpenAI Service for Notion MCP Server
 * Replaces Google Gemini AI with Azure OpenAI
 */

import { AzureOpenAI } from 'openai';
import dotenv from 'dotenv';

dotenv.config();

interface AzureOpenAIConfig {
  endpoint: string;
  apiKey: string;
  deploymentName: string;
  apiVersion: string;
}

interface ChatMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

interface ChatCompletionOptions {
  maxTokens?: number;
  temperature?: number;
  topP?: number;
  frequencyPenalty?: number;
  presencePenalty?: number;
}

export class AzureOpenAIService {
  private client: AzureOpenAI;
  private config: AzureOpenAIConfig;

  constructor() {
    this.config = {
      endpoint: process.env.AZURE_OPENAI_ENDPOINT || '',
      apiKey: process.env.AZURE_OPENAI_API_KEY || '',
      deploymentName: process.env.AZURE_OPENAI_DEPLOYMENT_NAME || 'gpt-4',
      apiVersion: process.env.AZURE_OPENAI_API_VERSION || '2024-02-01'
    };

    if (!this.config.endpoint || !this.config.apiKey) {
      throw new Error('Azure OpenAI configuration missing. Please set AZURE_OPENAI_ENDPOINT and AZURE_OPENAI_API_KEY environment variables.');
    }

    this.client = new AzureOpenAI({
      endpoint: this.config.endpoint,
      apiKey: this.config.apiKey,
      apiVersion: this.config.apiVersion
    });
  }

  /**
   * Generate chat completion using Azure OpenAI
   */
  async generateChatCompletion(
    messages: ChatMessage[],
    options: ChatCompletionOptions = {}
  ): Promise<string> {
    try {
      const response = await this.client.chat.completions.create({
        model: this.config.deploymentName,
        messages: messages.map(msg => ({
          role: msg.role,
          content: msg.content
        })),
        max_tokens: options.maxTokens || 4000,
        temperature: options.temperature || 0.7,
        top_p: options.topP || 0.95,
        frequency_penalty: options.frequencyPenalty || 0,
        presence_penalty: options.presencePenalty || 0
      });

      return response.choices[0]?.message?.content || '';
    } catch (error) {
      console.error('Azure OpenAI API error:', error);
      throw new Error(`Azure OpenAI API error: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Generate single text completion (compatibility method)
   */
  async generateText(
    prompt: string,
    systemMessage?: string,
    options: ChatCompletionOptions = {}
  ): Promise<string> {
    const messages: ChatMessage[] = [];
    
    if (systemMessage) {
      messages.push({ role: 'system', content: systemMessage });
    }
    
    messages.push({ role: 'user', content: prompt });

    return this.generateChatCompletion(messages, options);
  }

  /**
   * Analyze Notion content using Azure OpenAI
   */
  async analyzeNotionContent(
    content: string,
    analysisType: 'summary' | 'keywords' | 'questions' | 'improvements' | 'structure'
  ): Promise<string> {
    const systemPrompts = {
      summary: 'You are an expert content analyst. Provide a clear, concise summary of the following Notion page content.',
      keywords: 'You are an expert content analyst. Extract key topics, themes, and important keywords from the following Notion page content. Present them as a structured list.',
      questions: 'You are an expert content analyst. Generate thoughtful, relevant questions based on the following Notion page content that would help deepen understanding or identify areas for further exploration.',
      improvements: 'You are an expert content analyst and writing coach. Suggest specific improvements, enhancements, and optimizations for the following Notion page content.',
      structure: 'You are an expert content analyst. Analyze the structure and organization of the following Notion page content and suggest improvements for better clarity and flow.'
    };

    const systemMessage = systemPrompts[analysisType] || systemPrompts.summary;

    return this.generateText(content, systemMessage, {
      maxTokens: 1500,
      temperature: 0.3
    });
  }

  /**
   * Generate Ashval world-building content
   */
  async generateWorldBuilding(
    prompt: string,
    contentType: 'character' | 'scene' | 'location' | 'power_system' | 'story_arc'
  ): Promise<string> {
    const systemPrompts = {
      character: 'You are an expert fantasy world-builder specializing in the Ashval universe. Create rich, detailed character descriptions with unique personalities, backgrounds, and motivations that fit the Ashval world.',
      scene: 'You are an expert fantasy world-builder specializing in the Ashval universe. Create vivid, immersive scene descriptions that capture the atmosphere and details of the Ashval world.',
      location: 'You are an expert fantasy world-builder specializing in the Ashval universe. Create detailed location descriptions with unique geography, culture, and significance within the Ashval world.',
      power_system: 'You are an expert fantasy world-builder specializing in the Ashval universe. Design consistent, balanced power systems and magical elements that fit the established rules of the Ashval world.',
      story_arc: 'You are an expert fantasy world-builder and storyteller specializing in the Ashval universe. Create compelling story arcs with proper pacing, conflict, and resolution that advance the Ashval narrative.'
    };

    const systemMessage = systemPrompts[contentType];

    return this.generateText(prompt, systemMessage, {
      maxTokens: 2000,
      temperature: 0.8
    });
  }

  /**
   * Generate improved prompts for AI interactions
   */
  async generateImprovedPrompt(
    originalPrompt: string,
    context?: string
  ): Promise<string> {
    const systemMessage = `You are an expert AI prompt engineer. Your task is to improve and optimize prompts for better AI responses. 
    
    Improve the following prompt by:
    1. Making it more specific and clear
    2. Adding relevant context and constraints
    3. Structuring it for better AI understanding
    4. Including examples if helpful
    5. Ensuring it follows best practices for AI prompting

    ${context ? `Additional context: ${context}` : ''}

    Return only the improved prompt, ready to use.`;

    return this.generateText(originalPrompt, systemMessage, {
      maxTokens: 1000,
      temperature: 0.5
    });
  }

  /**
   * Check service health
   */
  async healthCheck(): Promise<boolean> {
    try {
      const response = await this.generateText('Hello', 'Respond with "OK"', {
        maxTokens: 10,
        temperature: 0
      });
      return response.toLowerCase().includes('ok');
    } catch (error) {
      console.error('Azure OpenAI health check failed:', error);
      return false;
    }
  }

  /**
   * Get service configuration info
   */
  getConfig(): Omit<AzureOpenAIConfig, 'apiKey'> {
    return {
      endpoint: this.config.endpoint,
      deploymentName: this.config.deploymentName,
      apiVersion: this.config.apiVersion
    };
  }
}

// Export singleton instance
export const azureOpenAIService = new AzureOpenAIService();