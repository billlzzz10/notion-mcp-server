import { RuleEngine, Rule } from "./RuleEngine.js";
import { PromptManager, AssistantPromptCfg } from "./PromptManager.js";
import { CacheManager } from "./CacheManager.js";

// NOTE: Assume you already have ProviderManager implemented elsewhere.
// It must expose: listProviders(): string[], get(name): provider, and provider.call(messages, tools?, model?)
type Provider = {
  call: (args: {
    model: string;
    messages: Array<{ role: "system" | "user" | "assistant"; content: string }>;
    tools?: any[];
  }) => Promise<{ text: string; tool_use?: any[] } | any>;
};
type ProviderManager = {
  listProviders: () => string[];
  get: (name: string) => Provider;
};

export type RouterConfig = {
  default_provider: string;
  default_model: string;
  rules?: Rule[];
  assistant_prompt?: AssistantPromptCfg;
};

export class Router {
  private rules: RuleEngine;
  private prompts: PromptManager;
  private cache: CacheManager;

  constructor(
    private providers: ProviderManager,
    cfg: RouterConfig,
    cacheDir = "./cache"
  ) {
    this.rules = new RuleEngine(cfg.rules || []);
    this.prompts = new PromptManager();
    this.cache = new CacheManager(cacheDir);
    this.cfg = cfg;
  }

  private cfg: RouterConfig;

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
    tools?: any[];            // MCP-described tools list (optional)
    cacheKeyExtras?: any;     // additional cache components
    cacheContext?: string;    // previous context to include (optional)
  }): Promise<{ text: string; provider: string; model: string }> {
    const { provider, model } = this.pickProviderModel({
      query: params.query,
      task: params.task,
      mime: params.mime
    });

    // guard: provider must be available (i.e., has key/host)
    const available = this.providers.listProviders();
    if (!available.includes(provider)) {
      throw new Error(`Provider "${provider}" is not available. กรุณาใส่ API key ให้ถูกต้อง`);
    }

    // build prompt with constraints and optional cached context
    const built = this.prompts.build(params.query, {
      assistant: this.cfg.assistant_prompt || { style: "balanced", max_length: 1500, min_length: 300 },
      cacheContext: params.cacheContext,
      toolsNote: params.tools && params.tools.length ? "Tool calls are available." : undefined
    });

    // cache key
    const cacheKey = JSON.stringify({
      fp: built.fingerprint,
      provider,
      model,
      extra: params.cacheKeyExtras || null
    });

    const hit = await this.cache.get(cacheKey);
    if (hit?.value?.text) {
      return { text: hit.value.text, provider, model };
    }

    // call provider
    const prov = this.providers.get(provider);
    // normalize call signature across providers
    const result = await prov.call({
      model,
      messages: built.messages,
      tools: params.tools
    });

    // best-effort extract text
    const text =
      result?.text ??
      result?.content?.[0]?.text ??
      result?.choices?.[0]?.message?.content ??
      JSON.stringify(result);

    await this.cache.set(cacheKey, { text });
    return { text, provider, model };
  }
}
