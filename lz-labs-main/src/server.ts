import express from 'express';
import cors from 'cors';
import { authenticateJWT } from './middlewares/auth';
import { rateLimiter } from './middlewares/rateLimiter';
import jobRoutes from './routes/job';
import promptRoutes from './routes/prompt';

const app = express();
app.use(cors());
app.use(express.json());
app.use(rateLimiter);

app.use('/api/job', authenticateJWT, jobRoutes);
app.use('/api/prompt', authenticateJWT, promptRoutes);

export default app;

// If this file is run directly, start the Express server
if (require.main === module) {
  const port = process.env.PORT || 3001;
  app.listen(port, () => {
    console.log(`Server listening on http://localhost:${port}`);
  });
}
