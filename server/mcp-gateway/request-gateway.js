const express = require('express');
const bodyParser = require('body-parser');
const { getSchema, refreshSchema } = require('./schema-check');
const { createProject } = require('../mcp/project');
const { createTask } = require('../mcp/task');
const { savePrompt } = require('../mcp/prompt');
const { evaluateImprovement } = require('../mcp/ai-eval');

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

module.exports = router;
