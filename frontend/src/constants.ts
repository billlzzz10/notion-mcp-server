// frontend/src/constants.ts
import { NoteTemplate, ExportTemplate } from './types';

export const OPERATION_MODES = [
  { value: 'scene-creation', label: 'สร้างฉาก (Scene Creation)', systemInstruction: 'You are an expert screenwriter and novelist...' },
  { value: 'character-analysis', label: 'วิเคราะห์ตัวละคร (Character Analysis)', systemInstruction: 'You are a character psychologist...' },
  { value: 'dialogue-generation', label: 'สร้างบทสนทนา (Dialogue Generation)', systemInstruction: 'You are a master dialogue writer...' },
  // Add all other operation modes here
];

export const INITIAL_AI_RESPONSE_MESSAGE = "<p>ผลลัพธ์จาก AI จะปรากฏที่นี่...</p>";
export const PROCESSING_AI_RESPONSE_MESSAGE = "<p>AI กำลังประมวลผล...</p>";

export const AI_MAX_INPUT_CHARS = 15000;
export const MAX_CHAT_EXCHANGES = 5;
export const PROJECT_CONTEXT_MAX_NOTE_CHARS = 500;
export const PROJECT_CONTEXT_MAX_LORE_CHARS = 500;
export const MAX_PROJECT_NOTES_IN_CONTEXT = 5;
export const MAX_PROJECT_LORE_IN_CONTEXT = 10;

export const MODEL_NAME = 'gemini-1.5-flash-latest';
export const AVAILABLE_AI_MODELS = ['gemini-1.5-flash-latest', 'gemini-1.5-pro-latest', 'gpt-4o', 'gpt-3.5-turbo'];

export const NOTE_TEMPLATES: NoteTemplate[] = [
    { name: 'โครงร่างตัวละคร', content: '# Character Outline\n\n## Basic Info\n- **Name:** \n- **Age:** \n- **Occupation:** \n\n## Physical Description\n\n## Personality\n\n## Backstory\n', icon: '👤', category: 'character' },
    { name: 'โครงร่างฉาก', content: '# Scene Outline\n\n## Setting\n\n## Characters Present\n\n## Key Events\n\n## Purpose of Scene\n', icon: '🎬', category: 'scene' },
];

export const EXPORT_TEMPLATES: ExportTemplate[] = [
    { id: 'default-md', name: 'Default Markdown', format: 'markdown', template: '{{content}}' },
    { id: 'default-html', name: 'Default HTML', format: 'html', template: '<html><body>{{content}}</body></html>' },
];