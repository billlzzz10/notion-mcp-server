export type Rule = {
  match: Partial<{
    task: string;            // e.g., "code" | "summarize" | "local"
    provider: string;        // lock to a provider if needed
    contains: string;        // substring match on user query
    mime: string;            // optional mime context
  }>;
  provider: string;
  model: string;
};

export class RuleEngine {
  constructor(private rules: Rule[] = []) {}

  choose(input: { query: string; task?: string; mime?: string }): { provider?: string; model?: string } {
    for (const r of this.rules) {
      if (r.match.task && r.match.task !== (input.task || "")) continue;
      if (r.match.provider && r.match.provider !== "") continue; // reserved for future
      if (r.match.contains && !input.query.toLowerCase().includes(r.match.contains.toLowerCase())) continue;
      if (r.match.mime && r.match.mime !== (input.mime || "")) continue;
      return { provider: r.provider, model: r.model };
    }
    return {};
  }
}
