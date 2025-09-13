import { RuleEngine, Rule } from "./RuleEngine.js";
import { PromptManager, AssistantPromptCfg } from "./PromptManager.js";
import { CacheManager } from "./CacheManager.js";
import fs from "fs";

// Simple mock provider for now. In a real scenario, this would import
// actual provider SDKs (OpenAI, Anthropic, etc.)
type Provider = {
  call: (args: {
    model: string;
    messages: Array<{ role: "system" | "user" | "assistant"; content: string }>;
    tools?: any[];
  }) => Promise<{ text: string; tool_use?: any[] } | any>;
};

export type RouterConfig = {
  default_provider: string;
  default_model: string;
  rules?: Rule[];
  assistant_prompt?: AssistantPromptCfg;
};

// --- Main Router Class ---
class Router {
  private rules: RuleEngine;
  private prompts: PromptManager;
  private cache: CacheManager;
  private providers: Map<string, Provider> = new Map();
  private availableProviders: string[] = [];
  private cfg: RouterConfig;

  constructor(config: RouterConfig, settings: any) {
    this.cfg = config;
    this.rules = new RuleEngine(config.rules || []);
    this.prompts = new PromptManager();
    this.cache = new CacheManager(settings.cache?.path || "./cache");
    this.initializeProviders(settings.providers);
  }

  private initializeProviders(providerSettings: any) {
    for (const providerName in providerSettings) {
      if (providerSettings[providerName]?.api_key || providerSettings[providerName]?.host) {
        this.providers.set(providerName, this.createMockProvider(providerName));
        this.availableProviders.push(providerName);
      }
    }
  }

  private createMockProvider(name: string): Provider {
    return {
      call: async (args) => {
        console.log(`--- Mock Provider (${name}) Called ---`);
        console.log(`Model: ${args.model}`);
        const userMessage = args.messages.find(m => m.role === 'user')?.content || '';
        return {
          text: `This is a mock response from ${name} for the query: "${userMessage}"`,
        };
      },
    };
  }

  private getProvider(name: string): Provider {
    const provider = this.providers.get(name);
    if (!provider) {
      throw new Error(`Provider "${name}" not found or not configured.`);
    }
    return provider;
  }

  private pickProviderModel(input: { query: string; task?: string; mime?: string }) {
    const byRule = this.rules.choose(input);
    const provider = byRule.provider || this.cfg.default_provider;
    const model = byRule.model || this.cfg.default_model;
    return { provider, model };
  }

  async handleQuery(params: {
    query: string;
    task?: string;
    mime?: string;
    tools?: any[];
    cacheKeyExtras?: any;
    cacheContext?: string;
  }): Promise<{ text: string; provider: string; model: string }> {
    const { provider, model } = this.pickProviderModel({
      query: params.query,
      task: params.task,
      mime: params.mime
    });

    if (!this.availableProviders.includes(provider)) {
      throw new Error(`Provider "${provider}" is not available. Please add its API key to settings.json.`);
    }

    const built = this.prompts.build(params.query, {
      assistant: this.cfg.assistant_prompt || { style: "balanced" },
      cacheContext: params.cacheContext,
      toolsNote: params.tools && params.tools.length ? "Tool calls are available." : undefined
    });

    const cacheKey = JSON.stringify({
      fp: built.fingerprint,
      provider,
      model,
      extra: params.cacheKeyExtras || null
    });

    const hit = await this.cache.get(cacheKey);
    if (hit?.value?.text) {
      console.log(`[Cache HIT] for key: ${cacheKey}`);
      return { text: hit.value.text, provider, model };
    }
    console.log(`[Cache MISS] for key: ${cacheKey}`);

    const prov = this.getProvider(provider);
    const result = await prov.call({
      model,
      messages: built.messages,
      tools: params.tools
    });

    const text = result?.text ?? JSON.stringify(result);
    await this.cache.set(cacheKey, { text });
    return { text, provider, model };
  }
}

// --- Singleton Instantiation ---
// This creates a single instance of the Router for the entire application.
let routerInstance: Router;

try {
    const config: RouterConfig = JSON.parse(fs.readFileSync("./config.json", "utf-8"));
    const settings: any = JSON.parse(fs.readFileSync("./settings.json", "utf-8"));
    routerInstance = new Router(config, settings);
    console.log("✅ AI Router initialized successfully.");
} catch (error) {
    console.error("❌ Failed to initialize AI Router. Make sure config.json and settings.json exist.", error);
    // Create a dummy instance to prevent crashes if files are missing
    routerInstance = new Router({default_provider: 'mock', default_model: 'mock'}, {providers: {}});
}

export const router = routerInstance;
