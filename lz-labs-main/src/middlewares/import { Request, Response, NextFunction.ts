import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import 'jsonwebtoken'; // This import is not necessary for fixing the type error. The type error is usually resolved by installing @types/jsonwebtoken.

export function authenticateJWT(req: Request, res: Response, next: NextFunction) {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) return res.status(401).json({ msg: 'Missing token' });
  try {
    req.user = jwt.verify(token, process.env.JWT_SECRET!);
    next();
  } catch (err) {
    res.status(401).json({ msg: 'Invalid/Expired token' });
  }
}
