import { ViewName, Project, Note, Task, DictionaryEntry, PlotPoint, WorldElement, PlotPointStatus, NoteStatus, OperationMode, NoteTemplate, NotePriority, LoreEntry, RelationshipType, ExportTemplate, AppTheme } from './types';
import { fetchPrompt } from './agents/PromptAgent';

export const DEFAULT_VIEW: ViewName = 'dashboard';

export const APP_TITLE = 'Ashval Writer\'s Suite';

export const DEFAULT_AI_PERSONALITY_ID = 'creative-writer';
export const DEFAULT_PLOT_POINT_STATUS: PlotPointStatus = 'planned';
export const DEFAULT_NOTE_STATUS: NoteStatus = 'draft';

export const NOTE_CATEGORIES = [
  'Characters',
  'Worldbuilding',
  'Plot',
  'Research',
  'Ideas',
  'Other',
];
export const COMMON_RELATIONSHIP_TYPES: RelationshipType[] = [
  'Ally', 'Enemy', 'Friend', 'Rival', 'Family (Sibling)', 'Family (Parent)',
  'Family (Child)', 'Family (Spouse)', 'Family (Other)', 'Mentor', 'Mentee',
  'Romantic Interest', 'Complicated', 'Neutral', 'Servant', 'Master', 'Acquaintance', 'Other'
];

export const OPERATION_MODES: OperationMode[] = [
  {
    value: 'scene-analysis',
    label: 'วิเคราะห์ฉาก',
    systemInstruction: `คุณคือผู้ช่วยนักเขียน AI ผู้เชี่ยวชาญด้านการวิเคราะห์ฉาก
1. วิเคราะห์ฉากที่ให้มาในรายละเอียดเกี่ยวกับองค์ประกอบ โครงสร้าง จังหวะ โทน อารมณ์ สัญลักษณ์ และผลกระทบโดยรวมต่อเรื่องราว
2. หากมีข้อมูลโปรเจกต์ (Project Context) ให้มา ให้ใช้ข้อมูลนั้นประกอบการวิเคราะห์ด้วย
3. เสนอแนะแนวทางที่นำไปปฏิบัติได้เพื่อปรับปรุงหรือขยายความ โดยเน้นจุดแข็งและส่วนที่ควรพัฒนา`,
    userPromptFormatter: (input: string) => `กรุณาวิเคราะห์ฉากต่อไปนี้:\n\n${input}`,
  },
  {
    value: 'character-analysis',
    label: 'วิเคราะห์ตัวละคร',
    systemInstruction: `คุณคือผู้ช่วยนักเขียน AI ผู้เชี่ยวชาญด้านการวิเคราะห์ตัวละคร
1. วิเคราะห์ข้อมูลตัวละครที่ให้มาเกี่ยวกับลักษณะนิสัย แรงจูงใจ เป้าหมาย ความขัดแย้งภายในและภายนอก ความสัมพันธ์กับตัวละครอื่น พัฒนาการของตัวละคร และบทบาทในเรื่องราว
2. หากมีข้อมูลโปรเจกต์ (Project Context) ให้มา ให้ใช้ข้อมูลนั้นประกอบการวิเคราะห์ด้วย
3. ให้คำแนะนำเพื่อทำให้ตัวละครมีมิติและน่าเชื่อถือยิ่งขึ้น`,
    userPromptFormatter: (input: string) => `กรุณาวิเคราะห์ตัวละคร:\n\n${input}`,
  },
  {
    value: 'magic-system',
    label: 'วิเคราะห์ระบบเวท/พลังพิเศษ',
    systemInstruction: "คุณคือผู้ช่วยนักเขียน AI ผู้เชี่ยวชาญด้านการวิเคราะห์ระบบพลังเหนือธรรมชาติ จงวิเคราะห์ระบบที่ให้มาในแง่ของกฎเกณฑ์ ข้อจำกัด แหล่งพลังงาน ผลกระทบต่อโลกและตัวละคร ความสมดุล ความคิดสร้างสรรค์ และความสอดคล้องภายใน หากมีข้อมูลโปรเจกต์ (Project Context) ให้มา ให้ใช้ข้อมูลนั้นประกอบการวิเคราะห์ด้วย พร้อมเสนอแนะแนวทางเพื่อเพิ่มความน่าเชื่อถือ ความลึกซึ้ง และความน่าสนใจของระบบ",
    userPromptFormatter: (input: string) => `กรุณาวิเคราะห์ระบบเวทมนตร์/พลังพิเศษจากรายละเอียดต่อไปนี้:\n\n${input}`,
  },
  // ...(add remaining modes as specified in user request)
];

export const MAIN_NAVIGATION = [
  { id: 'dashboard', label: 'Dashboard', icon: 'dashboard' },
  { id: 'notes', label: 'Notes', icon: 'notes' },
  { id: 'ai-writer', label: 'AI Writer', icon: 'ai' },
  { id: 'graph', label: 'Graph', icon: 'graph' }
];

export const TOOLS_NAVIGATION = [
  { id: 'tasks', label: 'Tasks', icon: 'tasks' },
  { id: 'dictionary', label: 'Dictionary', icon: 'dictionary' },
  { id: 'lore-manager', label: 'Lore Manager', icon: 'lore' },
  { id: 'pomodoro', label: 'Pomodoro', icon: 'timer' },
  { id: 'story-structure', label: 'Story Structure', icon: 'structure' }
];

export const SETTINGS_NAVIGATION = [
  { id: 'settings', label: 'Settings', icon: 'settings' }
];

export const INITIAL_PROJECTS: Project[] = [
  {
    id: '1',
    name: 'Default Project',
    description: 'Your first writing project',
    createdAt: new Date(),
    updatedAt: new Date()
  }
];

export const INITIAL_NOTES: Note[] = [
  {
    id: '1',
    title: 'Welcome to Ashval Writer\'s Suite',
    content: 'This is your first note. Start writing your story here!',
    category: 'Ideas',
    status: 'draft',
    createdAt: new Date(),
    updatedAt: new Date(),
    projectId: '1'
  }
];

export const INITIAL_TASKS: Task[] = [
  {
    id: '1',
    title: 'Create your first character',
    description: 'Develop a compelling protagonist for your story',
    completed: false,
    priority: 'medium',
    createdAt: new Date(),
    projectId: '1'
  }
];

export const INITIAL_DICTIONARY_ENTRIES: DictionaryEntry[] = [
  {
    id: '1',
    term: 'Ashval',
    definition: 'A mystical realm where stories come to life',
    category: 'Worldbuilding',
    projectId: '1'
  }
];

export const INITIAL_PLOT_POINTS: PlotPoint[] = [
  {
    id: '1',
    title: 'Opening Scene',
    description: 'Introduce the main character and setting',
    status: 'planned',
    order: 1,
    projectId: '1'
  }
];

export const INITIAL_WORLD_ELEMENTS: WorldElement[] = [
  {
    id: '1',
    name: 'The Writer\'s Sanctuary',
    type: 'Location',
    description: 'A peaceful place where creativity flows freely',
    projectId: '1'
  }
];

export const APP_ROADMAP_MARKDOWN = `
# Ashval Writer's Suite Roadmap

## Current Features
- [x] Notes Management
- [x] Task Tracking
- [x] AI Writing Assistant
- [x] Project Organization

## Planned Features
- [ ] Advanced Plot Structure Tools
- [ ] Character Relationship Mapping
- [ ] World Building Templates
- [ ] Export to Multiple Formats
`;

const result = await fetchPrompt({ seed: 123, gender: 'male', custom: 'portrait' });
console.log(result);
