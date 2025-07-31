import { Router } from 'express';
import { validateJobRequest } from '../middlewares/validateJob';
import { jobQueue } from '../config/redis';

const router = Router();

router.post(
  '/',
  validateJobRequest,
  async (req, res) => {
    const { taskName, payload, app } = req.body;
    const userId = (req.user && req.user.id) || 'anonymous';
    const job = {
      taskName,
      payload,
      metadata: { userId, app: app || 'UnicornXOS' },
    };
    await jobQueue.add('user-job', job);
    res.json({ msg: 'รับทราบ กำลังดำเนินการ...' });
  }
);

export default router;
