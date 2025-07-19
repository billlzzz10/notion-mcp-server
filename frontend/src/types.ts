// frontend/src/types.ts

export interface AppNote {
  id: number;
  title: string;
  icon?: string;
  coverImageUrl?: string;
  content: string;
  category: string;
  tags: string[];
  createdAt: string;
  updatedAt: string;
  versions: NoteVersion[];
  links: NoteLink[];
  projectId: string | null;
}

export interface AppTask {
  id: number;
  title: string;
  icon?: string;
  completed: boolean;
  priority: 'low' | 'medium' | 'high';
  dueDate: string;
  category: string;
  subtasks: AppSubtask[];
  createdAt: string;
  projectId: string | null;
  description?: string;
  htmlDescription?: string;
}

export interface AppSubtask {
  id: string;
  title: string;
  completed: boolean;
}

export interface Project {
  id: string;
  name: string;
  genre?: string;
  description?: string;
  createdAt: string;
  isArchived: boolean;
  lastModified: string;
  summary: string;
}

export interface LoreEntry {
    id: string;
    title: string;
    type: 'Character' | 'Location' | 'Item' | 'Concept' | 'Event' | 'System';
    content: string;
    tags: string[];
    createdAt: string;
    projectId: string | null;
    role?: string;
    characterArcana?: string[];
    relationships?: Array<{
        targetCharacterId: string;
        targetCharacterName?: string;
        relationshipType: string;
        description?: string;
    }>;
    coverImageUrl?: string;
}

export interface NoteVersion {
  timestamp: string;
  content: string;
}

export interface NoteLink {
  targetTitle: string;
}

export interface UserNoteTemplate {
  id: string;
  name: string;
  content: string;
  icon?: string;
  category?: string;
}

export interface NoteTemplate {
  name: string;
  content: string;
  icon?: string;
  category?: string;
}

export interface PlotOutlineNode {
  id: string;
  text: string;
  parentId: string | null;
  order: number;
  projectId: string | null;
  createdAt: string;
  linkedNoteIds: number[];
  linkedLoreIds: string[];
}

export interface LongformDocument {
  id: string;
  title: string;
  projectId: string | null;
  createdAt: string;
  updatedAt: string;
  items: Array<{ id: number | string; type: 'note' | 'lore' }>;
}

export interface ChatTurn {
  role: 'user' | 'model';
  text: string;
}

export interface PomodoroConfig {
  work: number;
  shortBreak: number;
  longBreak: number;
  rounds: number;
}

export interface UserPreferences {
  notificationPreferences: NotificationPreferences;
  aiWriterPreferences: AiWriterPreferences;
  selectedFontFamily: string;
  customGeminiApiKey?: string;
  selectedAiModel: string;
  apiKeyMode: ApiKeyMode;
}

export interface NotificationPreferences {
  taskReminders: boolean;
  projectUpdates: boolean;
}

export interface AiWriterPreferences {
  repetitionThreshold: number;
  autoAddLoreFromAi: boolean;
  autoAnalyzeScenes: boolean;
  contextualAiMenuStyle: 'simple' | 'advanced';
}

export type ApiKeyMode = 'server-default' | 'prompt' | 'user-provided';

export interface AppTheme {
  name: string;
  bg: string;
  text: string;
  textSecondary: string;
  accent: string;
  accentText: string;
  headerBg: string;
  headerText: string;
  sidebarBg: string;
  sidebarText: string;
  sidebarHoverBg: string;
  sidebarHoverText: string;
  sidebarActiveBg: string;
  sidebarActiveText: string;
  sidebarBorder: string;
  cardBg: string;
  cardBorder: string;
  cardShadow: string;
  button: string;
  buttonText: string;
  buttonHover: string;
  buttonSecondaryBg: string;
  buttonSecondaryText: string;
  buttonSecondaryHoverBg: string;
  inputBg: string;
  inputText: string;
  inputBorder: string;
  inputPlaceholder: string;
  focusRing: string;
  aiResponseBg: string;
  divider: string;
  bg_preview: string;
  bg_preview_color: string;
}

export interface ExportTemplate {
  id: string;
  name: string;
  format: 'markdown' | 'html' | 'plaintext';
  template: string;
}

export interface AppDataType {