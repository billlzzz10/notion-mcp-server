import express from 'express';

// Mock writer app handlers for testing (in production, this would import from the actual tools)
const mockWriterAppHandlers = {
  writer_create_project: async (args) => ({
    content: [{ text: JSON.stringify({ success: true, project: { id: 'demo-project', name: args.name, icon: args.icon || 'book' } }) }]
  }),
  writer_list_projects: async () => ({
    content: [{ text: JSON.stringify({ projects: [{ id: 'demo-project', name: 'Demo Project', icon: 'book' }] }) }]
  }),
  writer_create_note: async (args) => ({
    content: [{ text: JSON.stringify({ success: true, note: { id: 'demo-note', ...args, createdAt: new Date().toISOString() } }) }]
  }),
  writer_list_notes: async (args) => ({
    content: [{ text: JSON.stringify({ notes: [] }) }]
  }),
  writer_update_note: async (args) => ({
    content: [{ text: JSON.stringify({ success: true, note: { id: args.noteId, updatedAt: new Date().toISOString() } }) }]
  }),
  writer_delete_note: async (args) => ({
    content: [{ text: JSON.stringify({ success: true }) }]
  }),
  writer_create_plot_point: async (args) => ({
    content: [{ text: JSON.stringify({ success: true, plotPoint: { id: 'demo-plot', ...args, createdAt: new Date().toISOString() } }) }]
  }),
  writer_list_plot_points: async (args) => ({
    content: [{ text: JSON.stringify({ plotPoints: [] }) }]
  }),
  writer_create_world_element: async (args) => ({
    content: [{ text: JSON.stringify({ success: true, worldElement: { id: 'demo-world', ...args, createdAt: new Date().toISOString() } }) }]
  }),
  writer_list_world_elements: async (args) => ({
    content: [{ text: JSON.stringify({ worldElements: [] }) }]
  }),
  writer_create_dictionary_entry: async (args) => ({
    content: [{ text: JSON.stringify({ success: true, entry: { id: 'demo-dict', ...args, createdAt: new Date().toISOString() } }) }]
  }),
  writer_list_dictionary_entries: async (args) => ({
    content: [{ text: JSON.stringify({ entries: [] }) }]
  }),
  writer_create_task: async (args) => ({
    content: [{ text: JSON.stringify({ success: true, task: { id: 'demo-task', ...args, createdAt: new Date().toISOString() } }) }]
  }),
  writer_list_tasks: async (args) => ({
    content: [{ text: JSON.stringify({ tasks: [] }) }]
  }),
  writer_toggle_task: async (args) => ({
    content: [{ text: JSON.stringify({ success: true, task: { id: args.taskId, completed: true } }) }]
  }),
  writer_generate_content: async (args) => ({
    content: [{ text: JSON.stringify({ success: true, generatedContent: `AI generated content for: ${args.prompt}` }) }]
  }),
  writer_get_project_stats: async (args) => ({
    content: [{ text: JSON.stringify({ stats: { projectId: args.projectId, counts: { notes: 0, plotPoints: 0, tasks: 0 } } }) }]
  })
};

const router = express.Router();

// Project Management
router.post('/projects', async (req, res) => {
  try {
    const result = await mockWriterAppHandlers.writer_create_project(req.body);
    res.json(JSON.parse(result.content[0].text));
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.get('/projects', async (req, res) => {
  try {
    const result = await mockWriterAppHandlers.writer_list_projects();
    res.json(JSON.parse(result.content[0].text));
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Notes Management
router.post('/projects/:projectId/notes', async (req, res) => {
  try {
    const args = { ...req.body, projectId: req.params.projectId };
    const result = await mockWriterAppHandlers.writer_create_note(args);
    res.json(JSON.parse(result.content[0].text));
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.get('/projects/:projectId/notes', async (req, res) => {
  try {
    const args = { 
      projectId: req.params.projectId,
      category: req.query.category,
      search: req.query.search
    };
    const result = await mockWriterAppHandlers.writer_list_notes(args);
    res.json(JSON.parse(result.content[0].text));
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.put('/notes/:noteId', async (req, res) => {
  try {
    const args = { ...req.body, noteId: req.params.noteId };
    const result = await mockWriterAppHandlers.writer_update_note(args);
    res.json(JSON.parse(result.content[0].text));
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.delete('/notes/:noteId', async (req, res) => {
  try {
    const result = await mockWriterAppHandlers.writer_delete_note({ noteId: req.params.noteId });
    res.json(JSON.parse(result.content[0].text));
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Plot Points Management
router.post('/projects/:projectId/plot-points', async (req, res) => {
  try {
    const args = { ...req.body, projectId: req.params.projectId };
    const result = await mockWriterAppHandlers.writer_create_plot_point(args);
    res.json(JSON.parse(result.content[0].text));
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.get('/projects/:projectId/plot-points', async (req, res) => {
  try {
    const args = { 
      projectId: req.params.projectId,
      type: req.query.type
    };
    const result = await mockWriterAppHandlers.writer_list_plot_points(args);
    res.json(JSON.parse(result.content[0].text));
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// World Elements Management
router.post('/projects/:projectId/world-elements', async (req, res) => {
  try {
    const args = { ...req.body, projectId: req.params.projectId };
    const result = await mockWriterAppHandlers.writer_create_world_element(args);
    res.json(JSON.parse(result.content[0].text));
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.get('/projects/:projectId/world-elements', async (req, res) => {
  try {
    const args = { 
      projectId: req.params.projectId,
      category: req.query.category
    };
    const result = await mockWriterAppHandlers.writer_list_world_elements(args);
    res.json(JSON.parse(result.content[0].text));
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Dictionary Management
router.post('/projects/:projectId/dictionary', async (req, res) => {
  try {
    const args = { ...req.body, projectId: req.params.projectId };
    const result = await mockWriterAppHandlers.writer_create_dictionary_entry(args);
    res.json(JSON.parse(result.content[0].text));
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.get('/projects/:projectId/dictionary', async (req, res) => {
  try {
    const args = { 
      projectId: req.params.projectId,
      verified: req.query.verified === 'true' ? true : req.query.verified === 'false' ? false : undefined
    };
    const result = await mockWriterAppHandlers.writer_list_dictionary_entries(args);
    res.json(JSON.parse(result.content[0].text));
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Tasks Management
router.post('/projects/:projectId/tasks', async (req, res) => {
  try {
    const args = { ...req.body, projectId: req.params.projectId };
    const result = await mockWriterAppHandlers.writer_create_task(args);
    res.json(JSON.parse(result.content[0].text));
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.get('/projects/:projectId/tasks', async (req, res) => {
  try {
    const args = { 
      projectId: req.params.projectId,
      completed: req.query.completed === 'true' ? true : req.query.completed === 'false' ? false : undefined,
      priority: req.query.priority
    };
    const result = await mockWriterAppHandlers.writer_list_tasks(args);
    res.json(JSON.parse(result.content[0].text));
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.patch('/tasks/:taskId/toggle', async (req, res) => {
  try {
    const result = await mockWriterAppHandlers.writer_toggle_task({ taskId: req.params.taskId });
    res.json(JSON.parse(result.content[0].text));
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// AI Writing Assistant
router.post('/projects/:projectId/generate', async (req, res) => {
  try {
    const args = { ...req.body, projectId: req.params.projectId };
    const result = await mockWriterAppHandlers.writer_generate_content(args);
    res.json(JSON.parse(result.content[0].text));
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Analytics and Insights
router.get('/projects/:projectId/stats', async (req, res) => {
  try {
    const result = await mockWriterAppHandlers.writer_get_project_stats({ projectId: req.params.projectId });
    res.json(JSON.parse(result.content[0].text));
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

export default router;