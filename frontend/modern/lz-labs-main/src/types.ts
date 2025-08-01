export interface Project {
  id: string;
  name: string;
  description?: string;
  status: 'active' | 'completed' | 'on-hold' | 'archived';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  createdAt: string;
  updatedAt: string;
  pageId?: string;
  notes?: Note[];
  stats?: ProjectStats;
}

export interface Note {
  id: string;
  title: string;
  content: string;
  category: string;
  createdAt: string;
  updatedAt: string;
}

export interface ProjectStats {
  totalNotes: number;
  totalWords: number;
  lastActivity: string;
  progress: number;
}

export interface Message {
  id: string;
  text: string;
  sender: 'user' | 'ai' | 'system';
  timestamp: string;
  type?: 'text' | 'system' | 'error';
}

export interface CustomTool {
  id: string;
  name: string;
  description: string;
  category: string;
  enabled: boolean;
}

export interface Datasource {
  id: string;
  name: string;
  type: 'notion' | 'file' | 'api';
  status: 'connected' | 'disconnected' | 'error';
}

export interface Database {
  id: string;
  name: string;
  type: string;
  recordCount: number;
  lastSync: string;
}

export interface ChatState {
  messages: Message[];
  isLoading: boolean;
  error?: string;
}

export interface ProjectState {
  projects: Project[];
  activeProject?: Project;
  isLoading: boolean;
  error?: string;
}

export interface DashboardStats {
  totalProjects: number;
  activeDatabases: number;
  availableTools: number;
  systemStatus: 'healthy' | 'warning' | 'error';
}
