// Simple logger for this script
const logger = {
  info: (...args) => console.log('ℹ️', ...args),
  error: (...args) => console.error('❌', ...args),
  warn: (...args) => console.warn('⚠️', ...args)
};

// Import Notion service manually
import { Client } from '@notionhq/client';
import dotenv from 'dotenv';

dotenv.config();

const notionService = new Client({
  auth: process.env.NOTION_TOKEN
});

const DATABASES = {
  PROJECTS: process.env.NOTION_PROJECTS_DB_ID,
  TASKS: process.env.NOTION_TASKS_DB_ID,
  SUBTASKS: process.env.NOTION_SUBTASKS_DB_ID,
  REPORTS: process.env.NOTION_REPORTS_DB_ID
};

/**
 * Create Project Roadmap
 * Adds roadmap tasks and projects to Notion databases based on development plan
 */

const ROADMAP_PROJECTS = [
  {
    name: "Dashboard & Analytics Module",
    description: "Comprehensive project analytics, status summary, trend graphs, and user behavior analytics system",
    category: "Analytics",
    priority: "High",
    status: "In Progress",
    progress: 30,
    tags: ["Analytics", "Dashboard", "Charts", "Metrics"],
    dueDate: "2025-02-15"
  },
  {
    name: "AI Recommendation Engine",
    description: "Smart task prioritization and recommendations based on user patterns and project data analysis",
    category: "AI/ML",
    priority: "High", 
    status: "In Progress",
    progress: 25,
    tags: ["AI", "Machine Learning", "Recommendations", "Patterns"],
    dueDate: "2025-02-28"
  },
  {
    name: "Calendar Integration System",
    description: "Google Calendar and Outlook sync for due dates, automatic event creation, and conflict resolution",
    category: "Integration",
    priority: "Medium",
    status: "Not Started",
    progress: 0,
    tags: ["Calendar", "Google", "Outlook", "Sync"],
    dueDate: "2025-03-15"
  },
  {
    name: "Feedback Loop System",
    description: "User correction system for AI-generated content with learning capabilities",
    category: "AI/ML",
    priority: "Medium",
    status: "Not Started", 
    progress: 0,
    tags: ["Feedback", "Learning", "User Experience", "AI"],
    dueDate: "2025-03-30"
  },
  {
    name: "Diagram Generator",
    description: "Auto-generate flow charts, architecture diagrams, and dependency maps from Notion data",
    category: "Visualization",
    priority: "Low",
    status: "Not Started",
    progress: 0,
    tags: ["Diagrams", "Visualization", "Architecture", "Flow"],
    dueDate: "2025-04-30"
  },
  {
    name: "Thai Novel Writing AI",
    description: "Fine-tuned language model for creative writing in Thai, optimized for novel and story generation",
    category: "AI/ML", 
    priority: "Low",
    status: "Planning",
    progress: 5,
    tags: ["Thai", "Novel", "Creative Writing", "Language Model"],
    dueDate: "2025-06-30"
  },
  {
    name: "Infrastructure Migration",
    description: "Migrate from Azure Functions to custom Express server with Redis/RabbitMQ integration",
    category: "Infrastructure",
    priority: "Medium",
    status: "Planning",
    progress: 0,
    tags: ["Node.js", "Express", "Redis", "RabbitMQ", "Migration"],
    dueDate: "2025-08-31"
  }
];

const ROADMAP_TASKS = [
  // Dashboard & Analytics Module Tasks
  {
    projectName: "Dashboard & Analytics Module",
    name: "Design Dashboard UI Components",
    description: "Create responsive dashboard components with charts and metrics",
    priority: "High",
    status: "In Progress",
    estimatedHours: 16,
    category: "Frontend",
    tags: ["UI", "Dashboard", "Charts"]
  },
  {
    projectName: "Dashboard & Analytics Module", 
    name: "Implement Real-time Metrics Collection",
    description: "Set up metrics collection system for real-time dashboard updates",
    priority: "High",
    status: "To Do",
    estimatedHours: 12,
    category: "Backend",
    tags: ["Metrics", "Real-time", "Data"]
  },
  {
    projectName: "Dashboard & Analytics Module",
    name: "Create Trend Analysis Algorithms",
    description: "Develop algorithms for analyzing project and task trends over time",
    priority: "Medium",
    status: "To Do", 
    estimatedHours: 20,
    category: "Analytics",
    tags: ["Algorithms", "Trends", "Analysis"]
  },
  
  // AI Recommendation Engine Tasks
  {
    projectName: "AI Recommendation Engine",
    name: "Implement User Pattern Analysis",
    description: "Analyze user behavior patterns for intelligent recommendations",
    priority: "High",
    status: "In Progress",
    estimatedHours: 24,
    category: "AI/ML",
    tags: ["Patterns", "Analysis", "User Behavior"]
  },
  {
    projectName: "AI Recommendation Engine",
    name: "Build Recommendation Algorithms",
    description: "Create ML algorithms for task prioritization and suggestions",
    priority: "High",
    status: "To Do",
    estimatedHours: 32,
    category: "AI/ML", 
    tags: ["Algorithms", "ML", "Recommendations"]
  },
  {
    projectName: "AI Recommendation Engine",
    name: "Implement Learning Feedback System",
    description: "System to learn from user acceptance/rejection of recommendations",
    priority: "Medium",
    status: "To Do",
    estimatedHours: 16,
    category: "AI/ML",
    tags: ["Learning", "Feedback", "ML"]
  },

  // Calendar Integration Tasks
  {
    projectName: "Calendar Integration System",
    name: "Implement Google Calendar API Integration",
    description: "Set up Google Calendar API for bidirectional sync",
    priority: "High",
    status: "To Do",
    estimatedHours: 20,
    category: "Integration",
    tags: ["Google", "API", "Calendar"]
  },
  {
    projectName: "Calendar Integration System",
    name: "Implement Outlook Calendar Integration", 
    description: "Set up Microsoft Graph API for Outlook calendar sync",
    priority: "Medium",
    status: "To Do",
    estimatedHours: 18,
    category: "Integration",
    tags: ["Outlook", "Microsoft", "API"]
  },
  {
    projectName: "Calendar Integration System",
    name: "Build Conflict Resolution System",
    description: "Handle conflicts between Notion and calendar updates",
    priority: "Medium",
    status: "To Do",
    estimatedHours: 14,
    category: "Integration",
    tags: ["Conflicts", "Resolution", "Sync"]
  },

  // Thai Novel Writing AI Tasks
  {
    projectName: "Thai Novel Writing AI",
    name: "Research Thai Language Models",
    description: "Research and evaluate existing Thai language models on Hugging Face",
    priority: "Medium",
    status: "To Do",
    estimatedHours: 8,
    category: "Research",
    tags: ["Research", "Thai", "Language Models"]
  },
  {
    projectName: "Thai Novel Writing AI",
    name: "Collect Thai Novel Training Data",
    description: "Gather and preprocess Thai novel corpus for model training",
    priority: "Medium",
    status: "To Do",
    estimatedHours: 40,
    category: "Data",
    tags: ["Data Collection", "Thai", "Corpus"]
  },
  {
    projectName: "Thai Novel Writing AI",
    name: "Fine-tune Model for Creative Writing",
    description: "Fine-tune base model for Thai creative writing and novel generation",
    priority: "High",
    status: "To Do",
    estimatedHours: 60,
    category: "AI/ML",
    tags: ["Fine-tuning", "Creative Writing", "Training"]
  },

  // Infrastructure Migration Tasks
  {
    projectName: "Infrastructure Migration",
    name: "Design New Express Architecture",
    description: "Design scalable Express.js architecture to replace Azure Functions",
    priority: "High",
    status: "To Do",
    estimatedHours: 16,
    category: "Architecture",
    tags: ["Express", "Architecture", "Design"]
  },
  {
    projectName: "Infrastructure Migration",
    name: "Implement Redis Queue Management",
    description: "Set up Redis for caching and queue management",
    priority: "Medium",
    status: "To Do",
    estimatedHours: 12,
    category: "Infrastructure",
    tags: ["Redis", "Queue", "Caching"]
  },
  {
    projectName: "Infrastructure Migration",
    name: "Setup RabbitMQ Message Broker",
    description: "Implement RabbitMQ for reliable message passing",
    priority: "Medium",
    status: "To Do",
    estimatedHours: 14,
    category: "Infrastructure",
    tags: ["RabbitMQ", "Messaging", "Queue"]
  }
];

async function createRoadmapProjects() {
  logger.info('🚀 Creating roadmap projects...');
  
  const createdProjects = [];
  
  // Get data source ID for Projects DB
  const dbResponse = await notionService.databases.retrieve({ database_id: DATABASES.PROJECTS });
  const dataSource = dbResponse.data_sources?.[0];
  if (!dataSource) {
    throw new Error(`No data source found for Projects DB: ${DATABASES.PROJECTS}`);
  }

  for (const project of ROADMAP_PROJECTS) {
    try {
      const response = await notionService.pages.create({
        parent: {
          data_source_id: dataSource.id
        },
        properties: {
          Name: {
            title: [
              {
                text: {
                  content: project.name
                }
              }
            ]
          },
          Description: {
            rich_text: [
              {
                text: {
                  content: project.description
                }
              }
            ]
          },
          Category: {
            select: {
              name: project.category
            }
          },
          Priority: {
            select: {
              name: project.priority
            }
          },
          Status: {
            select: {
              name: project.status
            }
          },
          Progress: {
            number: project.progress
          },
          Tags: {
            multi_select: project.tags.map(tag => ({ name: tag }))
          },
          'Due Date': {
            date: {
              start: project.dueDate
            }
          }
        }
      });

      createdProjects.push({
        id: response.id,
        name: project.name,
        notionUrl: `https://notion.so/${response.id.replace(/-/g, '')}`
      });

      logger.info(`✅ Created project: ${project.name}`);
      
      // Add delay to avoid rate limiting
      await new Promise(resolve => setTimeout(resolve, 300));
      
    } catch (error) {
      logger.error(`❌ Failed to create project ${project.name}:`, error);
    }
  }
  
  return createdProjects;
}

async function createRoadmapTasks(projects) {
  logger.info('📋 Creating roadmap tasks...');
  
  const createdTasks = [];

  // Get data source ID for Tasks DB
  const dbResponse = await notionService.databases.retrieve({ database_id: DATABASES.TASKS });
  const dataSource = dbResponse.data_sources?.[0];
  if (!dataSource) {
    throw new Error(`No data source found for Tasks DB: ${DATABASES.TASKS}`);
  }
  
  for (const task of ROADMAP_TASKS) {
    try {
      // Find the project ID for this task
      const project = projects.find(p => p.name === task.projectName);
      if (!project) {
        logger.warn(`⚠️ Project not found for task: ${task.name}`);
        continue;
      }

      const response = await notionService.pages.create({
        parent: {
          data_source_id: dataSource.id
        },
        properties: {
          Name: {
            title: [
              {
                text: {
                  content: task.name
                }
              }
            ]
          },
          Description: {
            rich_text: [
              {
                text: {
                  content: task.description
                }
              }
            ]
          },
          Project: {
            relation: [
              {
                id: project.id
              }
            ]
          },
          Priority: {
            select: {
              name: task.priority
            }
          },
          Status: {
            select: {
              name: task.status
            }
          },
          'Estimated Hours': {
            number: task.estimatedHours
          },
          Category: {
            select: {
              name: task.category
            }
          },
          Tags: {
            multi_select: task.tags.map(tag => ({ name: tag }))
          }
        }
      });

      createdTasks.push({
        id: response.id,
        name: task.name,
        projectName: task.projectName,
        notionUrl: `https://notion.so/${response.id.replace(/-/g, '')}`
      });

      logger.info(`✅ Created task: ${task.name}`);
      
      // Add delay to avoid rate limiting
      await new Promise(resolve => setTimeout(resolve, 300));
      
    } catch (error) {
      logger.error(`❌ Failed to create task ${task.name}:`, error);
    }
  }
  
  return createdTasks;
}

async function main() {
  try {
    logger.info('🎯 Starting roadmap creation process...');
    
    // Create projects first
    const projects = await createRoadmapProjects();
    logger.info(`✅ Created ${projects.length} projects`);
    
    // Then create tasks linked to projects
    const tasks = await createRoadmapTasks(projects);
    logger.info(`✅ Created ${tasks.length} tasks`);
    
    // Summary
    const summary = {
      projectsCreated: projects.length,
      tasksCreated: tasks.length,
      projects: projects,
      tasks: tasks,
      timestamp: new Date().toISOString()
    };
    
    logger.info('🎉 Roadmap creation completed!');
    logger.info('📊 Summary:', summary);
    
    // Optional: Create a report in Notion
    await createRoadmapReport(summary);
    
    return summary;
    
  } catch (error) {
    logger.error('❌ Roadmap creation failed:', error);
    throw error;
  }
}

async function createRoadmapReport(summary) {
  try {
    // Get data source ID for Reports DB
    const dbResponse = await notionService.databases.retrieve({ database_id: DATABASES.REPORTS });
    const dataSource = dbResponse.data_sources?.[0];
    if (!dataSource) {
      throw new Error(`No data source found for Reports DB: ${DATABASES.REPORTS}`);
    }

    const reportContent = `
# 🗺️ Development Roadmap Implementation Report

**Created:** ${new Date().toLocaleDateString('th-TH')}

## 📊 Summary
- **Projects Created:** ${summary.projectsCreated}
- **Tasks Created:** ${summary.tasksCreated}
- **Total Items:** ${summary.projectsCreated + summary.tasksCreated}

## 🎯 Created Projects
${summary.projects.map(p => `- [${p.name}](${p.notionUrl})`).join('\n')}

## 📋 Implementation Phases

### Phase 1: Core System Enhancement (In Progress)
- Dashboard & Analytics Module ✅ Added
- AI Recommendation Engine ✅ Added

### Phase 2: Analytics & Intelligence
- Calendar Integration System ✅ Added
- Feedback Loop System ✅ Added

### Phase 3: Visualization & Architecture
- Diagram Generator ✅ Added

### Phase 4: Infrastructure & Performance  
- Infrastructure Migration ✅ Added

### Phase 5: AI & Language Models
- Thai Novel Writing AI ✅ Added

## 🚀 Next Steps
1. Begin implementation of Dashboard & Analytics Module
2. Set up AI Recommendation Engine core algorithms
3. Research Google Calendar and Outlook API integration
4. Plan Thai language model training infrastructure

## 🔗 Related Links
- [Main README Roadmap](../README.md#roadmap--development-plan)
- [AI Model Recommendations](../README.md#ai-model-recommendations)
- [Thai Novel Writing Guide](../ASHVAL_GUIDE.md)
`;

    const response = await notionService.pages.create({
      parent: {
        data_source_id: dataSource.id
      },
      properties: {
        Name: {
          title: [
            {
              text: {
                content: "📊 Development Roadmap Implementation Report"
              }
            }
          ]
        },
        Type: {
          select: {
            name: "Planning"
          }
        },
        Status: {
          select: {
            name: "Completed"
          }
        },
        'Created Date': {
          date: {
            start: new Date().toISOString().split('T')[0]
          }
        }
      },
      children: [
        {
          object: 'block',
          type: 'paragraph',
          paragraph: {
            rich_text: [
              {
                type: 'text',
                text: {
                  content: reportContent
                }
              }
            ]
          }
        }
      ]
    });

    logger.info(`✅ Created roadmap report: https://notion.so/${response.id.replace(/-/g, '')}`);
    
  } catch (error) {
    logger.error('❌ Failed to create roadmap report:', error);
  }
}

// Run the script
if (import.meta.url === `file://${process.argv[1]}`) {
  main().catch(error => {
    logger.error('❌ Script execution failed:', error);
    process.exit(1);
  });
}

export { createRoadmapProjects, createRoadmapTasks, main };


