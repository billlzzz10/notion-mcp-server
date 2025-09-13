import { IAIProvider } from './index';
import { GoogleGenerativeAI, HarmCategory, HarmBlockThreshold } from '@google/generative-ai';
import dotenv from 'dotenv';

dotenv.config();

export class GeminiProvider implements IAIProvider {
  private client: GoogleGenerativeAI;

  constructor() {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      console.warn('Gemini API key is missing. The Gemini provider will not be available.');
      this.client = {} as GoogleGenerativeAI;
      return;
    }
    this.client = new GoogleGenerativeAI(apiKey);
  }

  async generate(prompt: string, options: any = {}): Promise<string> {
    if (!this.client) {
        throw new Error('Gemini provider is not configured.');
    }

    const model = this.client.getGenerativeModel({ model: options.model || "gemini-1.5-flash" });

    try {
        const chat = model.startChat({
            history: options.history || [],
            generationConfig: {
                maxOutputTokens: options.maxTokens || 4000,
                temperature: options.temperature || 0.7,
            },
            safetySettings: [
                {
                    category: HarmCategory.HARM_CATEGORY_HARASSMENT,
                    threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
                },
            ]
        });

        const result = await chat.sendMessage(prompt);
        const response = result.response;
        return response.text();
    } catch (error) {
      console.error('Gemini API error:', error);
      throw new Error(`Gemini API error: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }
}
