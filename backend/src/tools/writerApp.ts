#!/usr/bin/env node

/**
 * Writer App Integration Tools for MCP Server
 * Integrates the Ashval writing application functionality into the MCP system
 */

// Simple type definitions to avoid external dependencies
interface Tool {
  name: string;
  description: string;
  inputSchema: {
    type: string;
    properties: Record<string, any>;
    required?: string[];
    additionalProperties?: boolean;
  };
}

// Types for Writer App (simplified versions of frontend types)
interface Note {
  id: string;
  projectId: string;
  title: string;
  subtitle?: string;
  content: string;
  category: string;
  tags: string[];
  characterCount: number;
  status: string;
  revision: number;
  createdAt: string;
  updatedAt: string;
}

interface PlotPoint {
  id: string;
  projectId: string;
  title: string;
  description: string;
  type: string;
  status: string;
  order: number;
  relatedNotes: string[];
  createdAt: string;
  updatedAt: string;
}

interface WorldElement {
  id: string;
  projectId: string;
  name: string;
  description: string;
  category: string;
  properties: Record<string, any>;
  createdAt: string;
  updatedAt: string;
}

interface DictionaryEntry {
  id: string;
  projectId: string;
  term: string;
  definition: string;
  category: string;
  isVerified: boolean;
  createdAt: string;
  updatedAt: string;
}

interface Task {
  id: string;
  projectId: string;
  title: string;
  description?: string;
  priority: string;
  completed: boolean;
  dueDate?: string;
  createdAt: string;
  updatedAt: string;
}

// In-memory storage (in production, this would use a database)
const storage = {
  notes: new Map<string, Note>(),
  plotPoints: new Map<string, PlotPoint>(),
  worldElements: new Map<string, WorldElement>(),
  dictionary: new Map<string, DictionaryEntry>(),
  tasks: new Map<string, Task>(),
  projects: new Map<string, { id: string; name: string; icon: string }>()
};

// Helper functions
function generateId(prefix: string): string {
  return `${prefix}-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;
}

function filterByProject<T extends { projectId: string }>(collection: Map<string, T>, projectId: string): T[] {
  return Array.from(collection.values()).filter(item => item.projectId === projectId);
}

// Writer App Tools
export const writerAppTools: Tool[] = [
  // Project Management
  {
    name: 'writer_create_project',
    description: 'Create a new writing project',
    inputSchema: {
      type: 'object',
      properties: {
        name: { type: 'string', description: 'Project name' },
        icon: { type: 'string', description: 'Project icon', default: 'book' }
      },
      required: ['name']
    }
  },

  {
    name: 'writer_list_projects',
    description: 'List all writing projects',
    inputSchema: {
      type: 'object',
      properties: {},
      additionalProperties: false
    }
  },

  // Notes Management
  {
    name: 'writer_create_note',
    description: 'Create a new note in the writing system',
    inputSchema: {
      type: 'object',
      properties: {
        projectId: { type: 'string', description: 'Project ID' },
        title: { type: 'string', description: 'Note title' },
        subtitle: { type: 'string', description: 'Note subtitle' },
        content: { type: 'string', description: 'Note content' },
        category: { 
          type: 'string', 
          description: 'Note category',
          enum: ['character', 'place', 'event', 'plot', 'world', 'other', '']
        },
        tags: { 
          type: 'array', 
          items: { type: 'string' },
          description: 'Note tags'
        }
      },
      required: ['projectId', 'title', 'content']
    }
  },

  {
    name: 'writer_list_notes',
    description: 'List notes for a project',
    inputSchema: {
      type: 'object',
      properties: {
        projectId: { type: 'string', description: 'Project ID' },
        category: { 
          type: 'string', 
          description: 'Filter by category',
          enum: ['character', 'place', 'event', 'plot', 'world', 'other', '']
        },
        search: { type: 'string', description: 'Search term' }
      },
      required: ['projectId']
    }
  },

  {
    name: 'writer_update_note',
    description: 'Update an existing note',
    inputSchema: {
      type: 'object',
      properties: {
        noteId: { type: 'string', description: 'Note ID' },
        title: { type: 'string', description: 'Note title' },
        subtitle: { type: 'string', description: 'Note subtitle' },
        content: { type: 'string', description: 'Note content' },
        category: { 
          type: 'string', 
          description: 'Note category',
          enum: ['character', 'place', 'event', 'plot', 'world', 'other', '']
        },
        tags: { 
          type: 'array', 
          items: { type: 'string' },
          description: 'Note tags'
        }
      },
      required: ['noteId']
    }
  },

  {
    name: 'writer_delete_note',
    description: 'Delete a note',
    inputSchema: {
      type: 'object',
      properties: {
        noteId: { type: 'string', description: 'Note ID' }
      },
      required: ['noteId']
    }
  },

  // Plot Points Management
  {
    name: 'writer_create_plot_point',
    description: 'Create a new plot point',
    inputSchema: {
      type: 'object',
      properties: {
        projectId: { type: 'string', description: 'Project ID' },
        title: { type: 'string', description: 'Plot point title' },
        description: { type: 'string', description: 'Plot point description' },
        type: { 
          type: 'string', 
          description: 'Plot point type',
          enum: ['setup', 'inciting-incident', 'rising-action', 'climax', 'falling-action', 'resolution', 'other']
        },
        relatedNotes: { 
          type: 'array', 
          items: { type: 'string' },
          description: 'Related note IDs'
        }
      },
      required: ['projectId', 'title', 'description']
    }
  },

  {
    name: 'writer_list_plot_points',
    description: 'List plot points for a project',
    inputSchema: {
      type: 'object',
      properties: {
        projectId: { type: 'string', description: 'Project ID' },
        type: { 
          type: 'string', 
          description: 'Filter by type',
          enum: ['setup', 'inciting-incident', 'rising-action', 'climax', 'falling-action', 'resolution', 'other']
        }
      },
      required: ['projectId']
    }
  },

  // World Elements Management
  {
    name: 'writer_create_world_element',
    description: 'Create a new world element',
    inputSchema: {
      type: 'object',
      properties: {
        projectId: { type: 'string', description: 'Project ID' },
        name: { type: 'string', description: 'Element name' },
        description: { type: 'string', description: 'Element description' },
        category: { 
          type: 'string', 
          description: 'Element category',
          enum: ['location', 'organization', 'culture', 'magic-system', 'technology', 'religion', 'other']
        },
        properties: { 
          type: 'object', 
          description: 'Additional properties',
          additionalProperties: true
        }
      },
      required: ['projectId', 'name', 'description']
    }
  },

  {
    name: 'writer_list_world_elements',
    description: 'List world elements for a project',
    inputSchema: {
      type: 'object',
      properties: {
        projectId: { type: 'string', description: 'Project ID' },
        category: { 
          type: 'string', 
          description: 'Filter by category',
          enum: ['location', 'organization', 'culture', 'magic-system', 'technology', 'religion', 'other']
        }
      },
      required: ['projectId']
    }
  },

  // Dictionary Management
  {
    name: 'writer_create_dictionary_entry',
    description: 'Create a new dictionary entry',
    inputSchema: {
      type: 'object',
      properties: {
        projectId: { type: 'string', description: 'Project ID' },
        term: { type: 'string', description: 'Term' },
        definition: { type: 'string', description: 'Definition' },
        category: { 
          type: 'string', 
          description: 'Entry category',
          enum: ['character', 'place', 'concept', 'item', 'magic', 'other']
        }
      },
      required: ['projectId', 'term', 'definition']
    }
  },

  {
    name: 'writer_list_dictionary_entries',
    description: 'List dictionary entries for a project',
    inputSchema: {
      type: 'object',
      properties: {
        projectId: { type: 'string', description: 'Project ID' },
        verified: { type: 'boolean', description: 'Filter by verification status' }
      },
      required: ['projectId']
    }
  },

  // Tasks Management
  {
    name: 'writer_create_task',
    description: 'Create a new task',
    inputSchema: {
      type: 'object',
      properties: {
        projectId: { type: 'string', description: 'Project ID' },
        title: { type: 'string', description: 'Task title' },
        description: { type: 'string', description: 'Task description' },
        priority: { 
          type: 'string', 
          description: 'Task priority',
          enum: ['low', 'medium', 'high', 'urgent']
        },
        dueDate: { type: 'string', description: 'Due date (ISO string)' }
      },
      required: ['projectId', 'title']
    }
  },

  {
    name: 'writer_list_tasks',
    description: 'List tasks for a project',
    inputSchema: {
      type: 'object',
      properties: {
        projectId: { type: 'string', description: 'Project ID' },
        completed: { type: 'boolean', description: 'Filter by completion status' },
        priority: { 
          type: 'string', 
          description: 'Filter by priority',
          enum: ['low', 'medium', 'high', 'urgent']
        }
      },
      required: ['projectId']
    }
  },

  {
    name: 'writer_toggle_task',
    description: 'Toggle task completion status',
    inputSchema: {
      type: 'object',
      properties: {
        taskId: { type: 'string', description: 'Task ID' }
      },
      required: ['taskId']
    }
  },

  // AI Writing Assistant
  {
    name: 'writer_generate_content',
    description: 'Generate content using AI for writing assistance',
    inputSchema: {
      type: 'object',
      properties: {
        projectId: { type: 'string', description: 'Project ID' },
        prompt: { type: 'string', description: 'Writing prompt' },
        context: { type: 'string', description: 'Additional context' },
        personality: { 
          type: 'string', 
          description: 'AI personality to use',
          enum: ['creative', 'analytical', 'descriptive', 'dialogue', 'world-builder']
        },
        outputType: { 
          type: 'string', 
          description: 'Type of content to generate',
          enum: ['note', 'dialogue', 'description', 'plot-point', 'character', 'worldbuilding']
        }
      },
      required: ['projectId', 'prompt']
    }
  },

  // Analytics and Insights
  {
    name: 'writer_get_project_stats',
    description: 'Get statistics for a writing project',
    inputSchema: {
      type: 'object',
      properties: {
        projectId: { type: 'string', description: 'Project ID' }
      },
      required: ['projectId']
    }
  }
];

// Tool handlers
export const writerAppHandlers = {
  // Project Management
  writer_create_project: async (args: { name: string; icon?: string }) => {
    const project = {
      id: generateId('project'),
      name: args.name,
      icon: args.icon || 'book'
    };
    
    storage.projects.set(project.id, project);
    
    return {
      content: [{
        type: 'text' as const,
        text: JSON.stringify({ success: true, project }, null, 2)
      }]
    };
  },

  writer_list_projects: async () => {
    const projects = Array.from(storage.projects.values());
    
    return {
      content: [{
        type: 'text' as const,
        text: JSON.stringify({ projects }, null, 2)
      }]
    };
  },

  // Notes Management
  writer_create_note: async (args: { 
    projectId: string; 
    title: string; 
    subtitle?: string; 
    content: string; 
    category?: string; 
    tags?: string[] 
  }) => {
    const note: Note = {
      id: generateId('note'),
      projectId: args.projectId,
      title: args.title,
      subtitle: args.subtitle || '',
      content: args.content,
      category: args.category || '',
      tags: args.tags || [],
      characterCount: args.content.length,
      status: 'draft',
      revision: 1,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    
    storage.notes.set(note.id, note);
    
    return {
      content: [{
        type: 'text' as const,
        text: JSON.stringify({ success: true, note }, null, 2)
      }]
    };
  },

  writer_list_notes: async (args: { projectId: string; category?: string; search?: string }) => {
    let notes = filterByProject(storage.notes, args.projectId);
    
    if (args.category) {
      notes = notes.filter(note => note.category === args.category);
    }
    
    if (args.search) {
      const searchLower = args.search.toLowerCase();
      notes = notes.filter(note => 
        note.title.toLowerCase().includes(searchLower) ||
        note.content.toLowerCase().includes(searchLower) ||
        note.tags.some(tag => tag.toLowerCase().includes(searchLower))
      );
    }
    
    return {
      content: [{
        type: 'text' as const,
        text: JSON.stringify({ notes }, null, 2)
      }]
    };
  },

  writer_update_note: async (args: { 
    noteId: string; 
    title?: string; 
    subtitle?: string; 
    content?: string; 
    category?: string; 
    tags?: string[] 
  }) => {
    const note = storage.notes.get(args.noteId);
    if (!note) {
      throw new Error(`Note with ID ${args.noteId} not found`);
    }
    
    const updatedNote: Note = {
      ...note,
      title: args.title ?? note.title,
      subtitle: args.subtitle ?? note.subtitle,
      content: args.content ?? note.content,
      category: args.category ?? note.category,
      tags: args.tags ?? note.tags,
      characterCount: (args.content ?? note.content).length,
      revision: note.revision + 1,
      updatedAt: new Date().toISOString()
    };
    
    storage.notes.set(args.noteId, updatedNote);
    
    return {
      content: [{
        type: 'text' as const,
        text: JSON.stringify({ success: true, note: updatedNote }, null, 2)
      }]
    };
  },

  writer_delete_note: async (args: { noteId: string }) => {
    const deleted = storage.notes.delete(args.noteId);
    
    return {
      content: [{
        type: 'text' as const,
        text: JSON.stringify({ success: deleted }, null, 2)
      }]
    };
  },

  // Plot Points Management
  writer_create_plot_point: async (args: { 
    projectId: string; 
    title: string; 
    description: string; 
    type?: string; 
    relatedNotes?: string[] 
  }) => {
    const existingPlotPoints = filterByProject(storage.plotPoints, args.projectId);
    const maxOrder = existingPlotPoints.reduce((max, pp) => Math.max(max, pp.order), 0);
    
    const plotPoint: PlotPoint = {
      id: generateId('plot'),
      projectId: args.projectId,
      title: args.title,
      description: args.description,
      type: args.type || 'other',
      status: 'planned',
      order: maxOrder + 1,
      relatedNotes: args.relatedNotes || [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    
    storage.plotPoints.set(plotPoint.id, plotPoint);
    
    return {
      content: [{
        type: 'text' as const,
        text: JSON.stringify({ success: true, plotPoint }, null, 2)
      }]
    };
  },

  writer_list_plot_points: async (args: { projectId: string; type?: string }) => {
    let plotPoints = filterByProject(storage.plotPoints, args.projectId);
    
    if (args.type) {
      plotPoints = plotPoints.filter(pp => pp.type === args.type);
    }
    
    // Sort by order
    plotPoints.sort((a, b) => a.order - b.order);
    
    return {
      content: [{
        type: 'text' as const,
        text: JSON.stringify({ plotPoints }, null, 2)
      }]
    };
  },

  // World Elements Management
  writer_create_world_element: async (args: { 
    projectId: string; 
    name: string; 
    description: string; 
    category?: string; 
    properties?: Record<string, any> 
  }) => {
    const worldElement: WorldElement = {
      id: generateId('world'),
      projectId: args.projectId,
      name: args.name,
      description: args.description,
      category: args.category || 'other',
      properties: args.properties || {},
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    
    storage.worldElements.set(worldElement.id, worldElement);
    
    return {
      content: [{
        type: 'text' as const,
        text: JSON.stringify({ success: true, worldElement }, null, 2)
      }]
    };
  },

  writer_list_world_elements: async (args: { projectId: string; category?: string }) => {
    let worldElements = filterByProject(storage.worldElements, args.projectId);
    
    if (args.category) {
      worldElements = worldElements.filter(we => we.category === args.category);
    }
    
    return {
      content: [{
        type: 'text' as const,
        text: JSON.stringify({ worldElements }, null, 2)
      }]
    };
  },

  // Dictionary Management
  writer_create_dictionary_entry: async (args: { 
    projectId: string; 
    term: string; 
    definition: string; 
    category?: string 
  }) => {
    const entry: DictionaryEntry = {
      id: generateId('dict'),
      projectId: args.projectId,
      term: args.term,
      definition: args.definition,
      category: args.category || 'other',
      isVerified: args.definition.trim() !== '',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    
    storage.dictionary.set(entry.id, entry);
    
    return {
      content: [{
        type: 'text' as const,
        text: JSON.stringify({ success: true, entry }, null, 2)
      }]
    };
  },

  writer_list_dictionary_entries: async (args: { projectId: string; verified?: boolean }) => {
    let entries = filterByProject(storage.dictionary, args.projectId);
    
    if (typeof args.verified === 'boolean') {
      entries = entries.filter(entry => entry.isVerified === args.verified);
    }
    
    return {
      content: [{
        type: 'text' as const,
        text: JSON.stringify({ entries }, null, 2)
      }]
    };
  },

  // Tasks Management
  writer_create_task: async (args: { 
    projectId: string; 
    title: string; 
    description?: string; 
    priority?: string; 
    dueDate?: string 
  }) => {
    const task: Task = {
      id: generateId('task'),
      projectId: args.projectId,
      title: args.title,
      description: args.description || '',
      priority: args.priority || 'medium',
      completed: false,
      dueDate: args.dueDate,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    
    storage.tasks.set(task.id, task);
    
    return {
      content: [{
        type: 'text' as const,
        text: JSON.stringify({ success: true, task }, null, 2)
      }]
    };
  },

  writer_list_tasks: async (args: { projectId: string; completed?: boolean; priority?: string }) => {
    let tasks = filterByProject(storage.tasks, args.projectId);
    
    if (typeof args.completed === 'boolean') {
      tasks = tasks.filter(task => task.completed === args.completed);
    }
    
    if (args.priority) {
      tasks = tasks.filter(task => task.priority === args.priority);
    }
    
    return {
      content: [{
        type: 'text' as const,
        text: JSON.stringify({ tasks }, null, 2)
      }]
    };
  },

  writer_toggle_task: async (args: { taskId: string }) => {
    const task = storage.tasks.get(args.taskId);
    if (!task) {
      throw new Error(`Task with ID ${args.taskId} not found`);
    }
    
    const updatedTask = {
      ...task,
      completed: !task.completed,
      updatedAt: new Date().toISOString()
    };
    
    storage.tasks.set(args.taskId, updatedTask);
    
    return {
      content: [{
        type: 'text' as const,
        text: JSON.stringify({ success: true, task: updatedTask }, null, 2)
      }]
    };
  },

  // AI Writing Assistant
  writer_generate_content: async (args: { 
    projectId: string; 
    prompt: string; 
    context?: string; 
    personality?: string; 
    outputType?: string 
  }) => {
    // This is a mock implementation - in a real system, this would integrate with an AI service
    const mockContent = `This is AI-generated content for your prompt: "${args.prompt}"\n\nPersonality: ${args.personality || 'default'}\nOutput Type: ${args.outputType || 'general'}\nContext: ${args.context || 'none'}`;
    
    return {
      content: [{
        type: 'text' as const,
        text: JSON.stringify({ 
          success: true, 
          generatedContent: mockContent,
          metadata: {
            projectId: args.projectId,
            personality: args.personality,
            outputType: args.outputType
          }
        }, null, 2)
      }]
    };
  },

  // Analytics and Insights
  writer_get_project_stats: async (args: { projectId: string }) => {
    const notes = filterByProject(storage.notes, args.projectId);
    const plotPoints = filterByProject(storage.plotPoints, args.projectId);
    const worldElements = filterByProject(storage.worldElements, args.projectId);
    const dictionary = filterByProject(storage.dictionary, args.projectId);
    const tasks = filterByProject(storage.tasks, args.projectId);
    
    const stats = {
      projectId: args.projectId,
      counts: {
        notes: notes.length,
        plotPoints: plotPoints.length,
        worldElements: worldElements.length,
        dictionaryEntries: dictionary.length,
        tasks: tasks.length,
        completedTasks: tasks.filter(t => t.completed).length
      },
      wordCounts: {
        totalCharacters: notes.reduce((sum, note) => sum + note.characterCount, 0),
        averageNoteLength: notes.length > 0 ? Math.round(notes.reduce((sum, note) => sum + note.characterCount, 0) / notes.length) : 0
      },
      categories: {
        noteCategories: notes.reduce((acc, note) => {
          acc[note.category || 'uncategorized'] = (acc[note.category || 'uncategorized'] || 0) + 1;
          return acc;
        }, {} as Record<string, number>),
        plotPointTypes: plotPoints.reduce((acc, pp) => {
          acc[pp.type] = (acc[pp.type] || 0) + 1;
          return acc;
        }, {} as Record<string, number>)
      }
    };
    
    return {
      content: [{
        type: 'text' as const,
        text: JSON.stringify({ stats }, null, 2)
      }]
    };
  }
};