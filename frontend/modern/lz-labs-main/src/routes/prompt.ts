import express from 'express';
import { fetchPrompt, PromptParams } from '../agents/PromptAgent';

const router = express.Router();

// POST /api/prompt
router.post('/', async (req, res) => {
  try {
    const params = req.body as PromptParams;
    const text = await fetchPrompt(params);
    res.json({ text });
  } catch (err: any) {
    console.error('Error in /api/prompt:', err);
    res.status(500).json({ error: err.message || 'Prompt generation failed' });
  }
});

export default router;
