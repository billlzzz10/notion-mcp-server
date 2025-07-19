type FishboneCategory = {
  name: string;
  causes: string[];
};

export interface FishboneData {
  problem: string;
  categories: FishboneCategory[];
}

export function canUseMermaidForFishbone(data: FishboneData): boolean {
  // Mermaid รองรับ fishbone เบื้องต้น (simple structure)
  return data.categories.length > 0 && data.categories.length <= 6;
}

export function renderMermaidFishbone(data: FishboneData): string {
  // Mermaid syntax for fishbone (Ishikawa)
  let mermaid = `\`\`\`mermaid
fishbone
    ${data.problem}
`;
  data.categories.forEach(cat => {
    mermaid += `    ${cat.name}\n`;
    cat.causes.forEach(cause => {
      mermaid += `        ${cause}\n`;
    });
  });
  mermaid += '```';
  return mermaid;
}

export function renderTextFishbone(data: FishboneData): string {
  let text = `ปัญหา: ${data.problem}\n`;
  data.categories.forEach(cat => {
    text += `- ${cat.name}:\n`;
    cat.causes.forEach(cause => {
      text += `  - ${cause}\n`;
    });
  });
  return text;
}

export function renderFishbone(data: FishboneData): string {
  if (canUseMermaidForFishbone(data)) {
    return renderMermaidFishbone(data);
  } else {
    return renderTextFishbone(data);
  }
}export interface FiveWhysData {
  problem: string;
  whys: string[];
}

export function renderFiveWhys(data: FiveWhysData): string {
  let text = `ปัญหา: ${data.problem}\n`;
  data.whys.forEach((why, index) => {
    text += `Why ${index + 1}: ${why}\n`;
  });
  return text;
}

// 2. SWOT Analysis
export interface SWOTData {
  strengths: string[];
  weaknesses: string[];
  opportunities: string[];
  threats: string[];
}

export function renderSWOT(data: SWOTData): string {
  const formatList = (items: string[]) => items.map(item => `- ${item}`).join('<br>');

  return `
## SWOT Analysis

| Strengths | Weaknesses |
|-----------|------------|
| ${formatList(data.strengths)} | ${formatList(data.weaknesses)} |

<br>

| Opportunities | Threats |
|---------------|---------|
| ${formatList(data.opportunities)} | ${formatList(data.threats)} |
`;
}
