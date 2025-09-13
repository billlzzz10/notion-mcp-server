import { AzureOpenAI, OpenAI } from 'openai';
import dotenv from 'dotenv';
import { IAIProvider } from './index';

dotenv.config();

interface AzureConfig {
  endpoint: string;
  apiKey: string;
  deploymentName: string;
  apiVersion: string;
}

export class AzureProvider implements IAIProvider {
  private client: AzureOpenAI;
  private config: AzureConfig;

  constructor() {
    this.config = {
      endpoint: process.env.AZURE_OPENAI_ENDPOINT || '',
      apiKey: process.env.AZURE_OPENAI_API_KEY || '',
      deploymentName: process.env.AZURE_OPENAI_DEPLOYMENT_NAME || 'gpt-4',
      apiVersion: process.env.AZURE_OPENAI_API_VERSION || '2024-02-01',
    };

    if (!this.config.endpoint || !this.config.apiKey) {
      console.warn('Azure OpenAI configuration missing. The Azure provider will not be available.');
      // Set a dummy client to avoid crashes
      this.client = {} as AzureOpenAI;
      return;
    }

    this.client = new AzureOpenAI({
      endpoint: this.config.endpoint,
      apiKey: this.config.apiKey,
      apiVersion: this.config.apiVersion,
    });
  }

  async generate(prompt: string, options: any = {}): Promise<string> {
    if (!this.config.endpoint || !this.config.apiKey) {
      throw new Error('Azure provider is not configured.');
    }

    const messages: OpenAI.Chat.Completions.ChatCompletionMessageParam[] = [
      { role: 'system', content: options.systemMessage || 'You are a helpful assistant.' },
      { role: 'user', content: prompt },
    ];

    try {
      const response = await this.client.chat.completions.create({
        model: this.config.deploymentName,
        messages: messages,
        max_tokens: options.maxTokens || 4000,
        temperature: options.temperature || 0.7,
      });

      return response.choices[0]?.message?.content || '';
    } catch (error) {
      console.error('Azure OpenAI API error:', error);
      throw new Error(`Azure OpenAI API error: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }
}
