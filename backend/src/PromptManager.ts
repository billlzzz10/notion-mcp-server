import crypto from "node:crypto";

export type AssistantPromptCfg = {
  style?: "balanced" | "short" | "detailed";
  max_length?: number; // target chars for total prompt window
  min_length?: number; // lower bound if we must expand with cache context
};

export type BuildOptions = {
  assistant: AssistantPromptCfg;
  cacheContext?: string; // optional cached context string
  toolsNote?: string;    // short instruction for tool usage
};

export type BuiltPrompt = {
  messages: Array<{ role: "system" | "user" | "assistant"; content: string }>;
  fingerprint: string; // hash for cache key
  approx_tokens: number;
};

export class PromptManager {
  private approxTokenCount(text: string): number {
    // rough heuristic: 1 token ≈ 4 chars
    return Math.ceil(text.length / 4);
  }

  private clamp(text: string, limit: number): string {
    return text.length > limit ? text.slice(0, Math.max(limit, 0)) : text;
  }

  build(userQuery: string, opts: BuildOptions): BuiltPrompt {
    const sysBase =
      opts.assistant?.style === "short"
        ? "You are a concise assistant. Return compact answers. Avoid chain-of-thought."
        : opts.assistant?.style === "detailed"
        ? "You are an analytical assistant. Provide clear steps without revealing hidden chain-of-thought."
        : "Be precise and brief. Do not reveal chain-of-thought. Use tools if helpful.";

    const toolHint = opts.toolsNote ? ` Tools: ${opts.toolsNote}` : "";
    let context = opts.cacheContext || "";

    // ensure min length by padding with cached context if provided
    const minLen = opts.assistant?.min_length ?? 300;
    const maxLen = opts.assistant?.max_length ?? 1500;

    // compose raw prompt text
    let sys = `${sysBase}${toolHint}`.trim();
    let usr = userQuery.trim();
    let ctx = context.trim();

    // enforce max length across system+context+user, prefer keeping user intact
    const budget = maxLen;
    const sysBudget = Math.min(Math.floor(budget * 0.25), 400);
    const ctxBudget = Math.min(Math.floor(budget * 0.35), 600);
    const usrBudget = budget - sysBudget - ctxBudget;

    sys = this.clamp(sys, sysBudget);
    // if overall too short and we have context, keep as much as allowed
    if (ctx.length < minLen && (sys.length + usr.length) < minLen && context) {
      ctx = context.slice(0, Math.min(minLen - (sys.length + usr.length), ctxBudget));
    } else {
      ctx = this.clamp(ctx, ctxBudget);
    }
    usr = this.clamp(usr, usrBudget);

    const messages = [
      { role: "system" as const, content: sys },
      ...(ctx ? [{ role: "assistant" as const, content: `Context:\n${ctx}` }] : []),
      { role: "user" as const, content: usr },
    ];

    const joined = messages.map(m => `[${m.role}] ${m.content}`).join("\n");
    const approx_tokens = this.approxTokenCount(joined);
    const fingerprint = crypto.createHash("sha1").update(joined).digest("hex");

    return { messages, fingerprint, approx_tokens };
  }
}
