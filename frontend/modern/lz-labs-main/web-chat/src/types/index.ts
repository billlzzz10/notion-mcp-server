// === 🏰 Ashval Chat Types ===

export interface ChatSession {
    id: string;
    name: string;
    history: ChatMessage[];
    createdAt: Date;
    updatedAt: Date;
}

export interface ChatMessage {
    id: string;
    type: 'user' | 'ai' | 'system' | 'error';
    content: string;
    timestamp: Date;
    metadata?: {
        fileAttachment?: FileAttachment;
        mcpResult?: any;
        tokens?: number;
        model?: string;
    };
}

export interface FileAttachment {
    file: File;
    content: string;
    previewUrl: string;
    type: string;
    size: number;
}

export interface AppSettings {
    theme: 'light' | 'dark';
    geminiKey: string;
    notionToken: string;
    projectsDbId: string;
    tasksDbId: string;
    aiPromptsDbId: string;
    charactersDbId: string;
    scenesDbId: string;
    locationsDbId: string;
}

export interface DatabaseSchema {
    detectedFields: {
        nameField: string;
        statusField: string;
        priorityField: string;
        descriptionField: string;
        dateFields: string[];
        selectFields: string[];
        multiSelectFields: string[];
        textFields: string[];
    };
}

export interface NotionPageResult {
    success: boolean;
    taskId?: string;
    promptId?: string;
    message?: string;
    error?: string;
    suggestion?: string;
    task?: any;
    detectedSchema?: any;
    isNew?: boolean;
    version?: number;
    usageCount?: number;
    comparison?: string;
    previousResponse?: string;
    newResponse?: string;
}

export type ToastType = 'success' | 'error' | 'warning' | 'info';

export interface ToastOptions {
    message: string;
    type: ToastType;
    showDontShowAgain?: boolean;
    duration?: number;
}

// Dashboard types
export interface DatabaseStats {
    total: number;
    byStatus: Record<string, number>;
    byPriority: Record<string, number>;
    recent: number;
}

export interface DashboardData {
    projects: DatabaseStats;
    tasks: DatabaseStats;
    prompts: DatabaseStats;
    characters: DatabaseStats;
    scenes: DatabaseStats;
    locations: DatabaseStats;
}
