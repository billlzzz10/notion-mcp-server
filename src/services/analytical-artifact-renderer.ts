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
}

export interface FiveWhysData {
  problem: string;
  whys: string[];
}

export interface SWOTData {
  strengths: string[];
  weaknesses: string[];
  opportunities: string[];
  threats: string[];
}

export function renderSWOT(data: SWOTData): string {
  return `
## SWOT Analysis

| **Strengths** | **Weaknesses** |
|---------------|----------------|
| ${data.strengths.map(s => `• ${s}`).join('<br>')} | ${data.weaknesses.map(w => `• ${w}`).join('<br>')} |

| **Opportunities** | **Threats** |
|-------------------|-------------|
| ${data.opportunities.map(o => `• ${o}`).join('<br>')} | ${data.threats.map(t => `• ${t}`).join('<br>')} |
`;
}

// 3. Five Whys
export function renderFiveWhys(data: FiveWhysData): string {
  let text = `## Five Whys Analysis\n**Problem:** ${data.problem}\n\n`;
  data.whys.forEach((why, index) => {
    text += `**Why ${index + 1}:** ${why}\n`;
  });
  return text;
}

// 4. Framework Selector
export function selectFrameworkByIntent(intent: string): string {
  const intentLower = intent.toLowerCase();
  
  if (intentLower.includes('สาเหตุ') || intentLower.includes('cause') || intentLower.includes('fishbone')) {
    return 'fishbone';
  }
  if (intentLower.includes('swot') || intentLower.includes('จุดแข็ง') || intentLower.includes('strengths')) {
    return 'swot';
  }
  if (intentLower.includes('why') || intentLower.includes('ทำไม') || intentLower.includes('root cause')) {
    return 'five-whys';
  }
  
  return 'fishbone'; // default
}

// 5. Master Render Function
export function renderAnalyticalFramework(type: string, data: any): string {
  switch (type) {
    case 'fishbone':
      return renderFishbone(data as FishboneData);
    case 'swot':
      return renderSWOT(data as SWOTData);
    case 'five-whys':
      return renderFiveWhys(data as FiveWhysData);
    default:
      throw new Error(`Unsupported framework type: ${type}`);
  }
}
