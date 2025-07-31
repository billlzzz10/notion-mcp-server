import { Request, Response, NextFunction } from 'express';

export function validateJobRequest(req: Request, res: Response, next: NextFunction) {
  const { taskName, payload } = req.body;
  if (!taskName || !payload) {
    return res.status(400).json({ msg: 'Invalid request: taskName and payload are required' });
  }
  next();
}
