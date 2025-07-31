// Types for the Ashval Writer's Suite application

export type ViewName = 
  | 'dashboard'
  | 'graph'
  | 'notes'
  | 'ai-writer'
  | 'settings'
  | 'tasks'
  | 'dictionary'
  | 'lore-manager'
  | 'pomodoro'
  | 'story-structure'
  | 'forecast'
  | 'universe-map';

export interface Project {
  id: string;
  name: string;
  description: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface Note {
  id: string;
  title: string;
  content: string;
  category: string;
  status: NoteStatus;
  createdAt: Date;
  updatedAt: Date;
  projectId?: string;
}

export interface Task {
  id: string;
  title: string;
  description: string;
  completed: boolean;
  priority: 'low' | 'medium' | 'high';
  dueDate?: Date;
  createdAt: Date;
  projectId?: string;
}

export interface DictionaryEntry {
  id: string;
  term: string;
  definition: string;
  category: string;
  projectId?: string;
}

export interface PlotPoint {
  id: string;
  title: string;
  description: string;
  status: PlotPointStatus;
  order: number;
  projectId?: string;
}

export interface WorldElement {
  id: string;
  name: string;
  type: string;
  description: string;
  projectId?: string;
}

export interface GraphLink {
  id: string;
  from: string;
  to: string;
  relationship: LinkRelationshipType;
  description?: string;
}

export type PlotPointStatus = 'planned' | 'in-progress' | 'completed';
export type LinkRelationshipType = 'related' | 'causes' | 'affects' | 'contains' | 'references';
export type NoteStatus = 'draft' | 'review' | 'published' | 'archived';

export interface AiPersonality {
  id: string;
  name: string;
  description: string;
  systemPrompt: string;
}
