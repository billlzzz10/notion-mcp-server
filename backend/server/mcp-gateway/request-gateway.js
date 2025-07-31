import express from 'express';
import bodyParser from 'body-parser';
import { getSchema, refreshSchema } from './schema-check.js';

// Mock imports for missing MCP modules
const createProject = async (data) => ({ success: true, id: 'mock-project', ...data });
const createTask = async (data) => ({ success: true, id: 'mock-task', ...data });
const savePrompt = async (data) => ({ success: true, id: 'mock-prompt', ...data });
const evaluateImprovement = async (oldResp, newResp) => ({ improvement: 'mock-eval', score: 85 });

const router = express.Router();
router.use(bodyParser.json());

// schema endpoints
router.get('/schema/:dbId', async (req, res) => {
  try {
    const schema = await getSchema(req.params.dbId);
    res.json({ success: true, schema });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});
router.post('/schema/:dbId/refresh', async (req, res) => {
  try {
    const schema = await refreshSchema(req.params.dbId);
    res.json({ success: true, schema });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// logic endpoints
router.post('/project', async (req, res) => {
  try {
    const result = await createProject(req.body);
    res.json({ success: true, result });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

router.post('/task', async (req, res) => {
  try {
    const result = await createTask(req.body);
    res.json({ success: true, result });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

router.post('/prompt', async (req, res) => {
  try {
    const result = await savePrompt(req.body);
    res.json({ success: true, result });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

router.post('/ai-eval', async (req, res) => {
  try {
    const result = await evaluateImprovement(req.body.oldResponse, req.body.newResponse);
    res.json({ success: true, result });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// Database endpoints
router.get('/databases', async (req, res) => {
  try {
    // Get databases from environment variables
    const databases = {};
    const envKeys = Object.keys(process.env);
    
    envKeys.forEach(key => {
      if (key.includes('_DB_ID') && process.env[key]) {
        const dbName = key.replace('NOTION_', '').replace('_DB_ID', '');
        const friendlyName = dbName.split('_').map(word => 
          word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()
        ).join(' ');
        databases[friendlyName] = process.env[key];
      }
    });
    
    console.log('Found databases:', databases);
    res.json({ success: true, databases });
  } catch (err) {
    console.error('Error fetching databases:', err);
    res.status(500).json({ success: false, error: err.message });
  }
});

router.get('/database/:dbId/pages', async (req, res) => {
  try {
    const { dbId } = req.params;
    console.log(`Fetching pages from database: ${dbId}`);
    
    // Determine database type and create appropriate mock data
    let mockData = { pages: [] };
    
    if (dbId === process.env.NOTION_CHARACTERS_DB_ID) {
      mockData = {
        pages: [
          {
            id: 'char1',
            properties: {
              Name: {
                type: 'title',
                title: [{ plain_text: 'Ashval Thorne' }]
              },
              Race: {
                type: 'select',
                select: { name: 'Human' }
              },
              Status: {
                type: 'select', 
                select: { name: 'Alive' }
              },
              Age: {
                type: 'number',
                number: 28
              },
              Description: {
                type: 'rich_text',
                rich_text: [{ plain_text: 'The enigmatic protagonist of our story, bearer of ancient powers' }]
              },
              Class: {
                type: 'select',
                select: { name: 'Mage-Warrior' }
              }
            }
          },
          {
            id: 'char2', 
            properties: {
              Name: {
                type: 'title',
                title: [{ plain_text: 'Elena Blackwood' }]
              },
              Race: {
                type: 'select',
                select: { name: 'Elf' }
              },
              Status: {
                type: 'select',
                select: { name: 'Alive' }
              },
              Age: {
                type: 'number',
                number: 150
              },
              Description: {
                type: 'rich_text',
                rich_text: [{ plain_text: 'Mysterious ally with ancient knowledge of the old ways' }]
              },
              Class: {
                type: 'select',
                select: { name: 'Arcane Scholar' }
              }
            }
          },
          {
            id: 'char3',
            properties: {
              Name: {
                type: 'title',
                title: [{ plain_text: 'Marcus Drayven' }]
              },
              Race: {
                type: 'select',
                select: { name: 'Demon-Touched' }
              },
              Status: {
                type: 'select',
                select: { name: 'Unknown' }
              },
              Age: {
                type: 'number',
                number: 45
              },
              Description: {
                type: 'rich_text',
                rich_text: [{ plain_text: 'Powerful antagonist from the shadow realm, seeks ancient artifacts' }]
              },
              Class: {
                type: 'select',
                select: { name: 'Shadow Lord' }
              }
            }
          }
        ]
      };
    } else if (dbId === process.env.NOTION_SCENES_DB_ID) {
      mockData = {
        pages: [
          {
            id: 'scene1',
            properties: {
              Title: {
                type: 'title',
                title: [{ plain_text: 'The Awakening Chamber' }]
              },
              Chapter: {
                type: 'select',
                select: { name: 'Chapter 1' }
              },
              Location: {
                type: 'select',
                select: { name: 'Ancient Temple' }
              },
              Status: {
                type: 'select',
                select: { name: 'Complete' }
              },
              Word_Count: {
                type: 'number',
                number: 2500
              }
            }
          },
          {
            id: 'scene2',
            properties: {
              Title: {
                type: 'title',
                title: [{ plain_text: 'First Encounter' }]
              },
              Chapter: {
                type: 'select',
                select: { name: 'Chapter 1' }
              },
              Location: {
                type: 'select',
                select: { name: 'Forest Path' }
              },
              Status: {
                type: 'select',
                select: { name: 'Draft' }
              },
              Word_Count: {
                type: 'number',
                number: 1800
              }
            }
          }
        ]
      };
    } else if (dbId === process.env.NOTION_PROJECTS_DB_ID) {
      mockData = {
        pages: [
          {
            id: 'proj1',
            properties: {
              Name: {
                type: 'title',
                title: [{ plain_text: 'Ashval Chronicles - Book 1' }]
              },
              Status: {
                type: 'select',
                select: { name: 'In Progress' }
              },
              Priority: {
                type: 'select',
                select: { name: 'High' }
              },
              Progress: {
                type: 'number',
                number: 75
              },
              Deadline: {
                type: 'date',
                date: { start: '2025-08-15' }
              }
            }
          }
        ]
      };
    } else {
      // Generic mock data for unknown databases
      mockData = {
        pages: [
          {
            id: 'generic1',
            properties: {
              Name: {
                type: 'title',
                title: [{ plain_text: 'Sample Entry' }]
              },
              Status: {
                type: 'select',
                select: { name: 'Active' }
              },
              Created: {
                type: 'date',
                date: { start: new Date().toISOString().split('T')[0] }
              }
            }
          }
        ]
      };
    }
    
    console.log(`Returning ${mockData.pages.length} pages for database ${dbId}`);
    res.json({ success: true, ...mockData });
  } catch (err) {
    console.error('Error fetching database pages:', err);
    res.status(500).json({ success: false, error: err.message });
  }
});

export default router;
