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

export default router;
