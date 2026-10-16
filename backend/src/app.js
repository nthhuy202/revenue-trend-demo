import express from 'express';
import cookieParser from 'cookie-parser';
import { router as revenueTrend } from './routes/revenueTrend.js';

export function createApp() {
  const app = express();
  app.use(express.json());
  app.use(cookieParser());

  app.use('/api', revenueTrend);

  app.use('/api', (req, res) => res.status(404).json({ error: 'Not found' }));
  app.use((err, req, res, next) => {
    console.error(err);
    res.status(err.status ?? 500).json({ error: err.status ? err.message : 'Internal server error' });
  });
  return app;
}
