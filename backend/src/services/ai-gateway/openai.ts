import { IAIProvider } from './index';
import OpenAI from 'openai';
import dotenv from 'dotenv';

dotenv.config();

export class OpenAIProvider implements IAIProvider {
  private client: OpenAI;

  constructor() {
    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) {
      console.warn('OpenAI API key is missing. The OpenAI provider will not be available.');
      this.client = {} as OpenAI;
      return;
    }
    this.client = new OpenAI({ apiKey });
  }

  async generate(prompt: string, options: any = {}): Promise<string> {
    if (!this.client.apiKey) {
        throw new Error('OpenAI provider is not configured.');
    }

    const messages: OpenAI.Chat.Completions.ChatCompletionMessageParam[] = [
        { role: 'system', content: options.systemMessage || 'You are a helpful assistant.' },
        { role: 'user', content: prompt },
    ];

    try {
      const response = await this.client.chat.completions.create({
        model: options.model || "gpt-4-turbo",
        messages: messages,
        max_tokens: options.maxTokens || 4000,
        temperature: options.temperature || 0.7,
      });

      return response.choices[0]?.message?.content || '';
    } catch (error) {
      console.error('OpenAI API error:', error);
      throw new Error(`OpenAI API error: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }
}
