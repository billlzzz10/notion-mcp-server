import { describe, it, expect } from 'vitest';
import { RuleEngine, Rule } from '../RuleEngine.js';

describe('RuleEngine', () => {
  const rules: Rule[] = [
    { match: { task: "code" }, provider: "anthropic", model: "claude-3-5-sonnet" },
    { match: { task: "summarize" }, provider: "mistral", model: "mistral-medium" },
    { match: { contains: "image" }, provider: "openai", model: "dall-e-3" },
    { match: { mime: "application/pdf" }, provider: "anthropic", model: "claude-3-opus" },
  ];

  const engine = new RuleEngine(rules);

  it('should choose a provider and model based on task', () => {
    const result = engine.choose({ query: "write a function in python", task: "code" });
    expect(result).toEqual({ provider: "anthropic", model: "claude-3-5-sonnet" });
  });

  it('should choose a provider and model based on a keyword', () => {
    const result = engine.choose({ query: "can you make an image of a cat" });
    expect(result).toEqual({ provider: "openai", model: "dall-e-3" });
  });

  it('should choose a provider and model based on mime type', () => {
    const result = engine.choose({ query: "summarize this document", mime: "application/pdf" });
    expect(result).toEqual({ provider: "anthropic", model: "claude-3-opus" });
  });

  it('should return an empty object if no rule matches', () => {
    const result = engine.choose({ query: "what is the weather today?" });
    expect(result).toEqual({});
  });

  it('should respect multiple matching conditions', () => {
    const result = engine.choose({ query: "write code to summarize a pdf", task: "code", mime: "application/pdf" });
    // The first rule in the list that matches should be chosen. "code" task comes first.
    expect(result).toEqual({ provider: "anthropic", model: "claude-3-5-sonnet" });
  });
});
