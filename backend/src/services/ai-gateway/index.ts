import { AzureProvider } from './azure';
import { OpenAIProvider } from './openai';
import { GeminiProvider } from './gemini';
import { OpenRouterProvider } from './openrouter';
import { XAIProvider } from './xai';
import { OllamaProvider } from './ollama';
import { MistralProvider } from './mistral';

export interface IAIProvider {
  generate(prompt: string, options?: any): Promise<string>;
}

export type ProviderName = "openai" | "gemini" | "azure" | "openrouter" | "xai" | "ollama" | "mistral";

class AIGateway {
  private providers: Map<ProviderName, IAIProvider> = new Map();
  private defaultProvider: ProviderName = "gemini";

  constructor() {
    this.registerProvider('azure', new AzureProvider());
    this.registerProvider('openai', new OpenAIProvider());
    this.registerProvider('gemini', new GeminiProvider());
    this.registerProvider('openrouter', new OpenRouterProvider());
    this.registerProvider('xai', new XAIProvider());
    this.registerProvider('ollama', new OllamaProvider());
    this.registerProvider('mistral', new MistralProvider());

    console.log('AI Gateway initialized with available providers.');
  }

  public registerProvider(name: ProviderName, provider: IAIProvider) {
    this.providers.set(name, provider);
  }

  public async generate(
    prompt: string,
    options: { provider?: ProviderName; [key: string]: any } = {}
  ): Promise<string> {
    const providerName = options.provider || this.defaultProvider;
    const provider = this.providers.get(providerName);

    if (!provider) {
      throw new Error(`Provider ${providerName} is not registered or available.`);
    }

    try {
      console.log(`Routing AI request to ${providerName}...`);
      return await provider.generate(prompt, options);
    } catch (error) {
      console.error(`Error during generation with ${providerName}:`, error);
      // Optional: Add fallback logic to try another provider
      throw error;
    }
  }

  public setDefaultProvider(name: ProviderName) {
    if (this.providers.has(name)) {
      this.defaultProvider = name;
    } else {
      throw new Error(`Provider ${name} is not registered.`);
    }
  }
}

export const aigateway = new AIGateway();
