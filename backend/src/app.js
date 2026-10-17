import express from 'express';
import cookieParser from 'cookie-parser';
import { router as revenueTrend } from './routes/revenueTrend.js';
import { router as auth } from './routes/auth.js';
import { router as admin } from './routes/admin.js';

export function createApp() {
  const app = express();
  app.disable('x-powered-by');
  // Requests arrive through the Next.js proxy on the same host; trust its X-Forwarded-For only.
  app.set('trust proxy', 'loopback');
  app.use((req, res, next) => {
    res.set('X-Content-Type-Options', 'nosniff');
    next();
  });
  app.use(express.json());
  app.use(cookieParser());

  app.use('/api', revenueTrend);
  app.use('/api', auth);
  app.use('/api', admin);

  app.use('/api', (req, res) => res.status(404).json({ error: 'Not found' }));
  app.use((err, req, res, next) => {
    console.error(err);
    res.status(err.status ?? 500).json({ error: err.status ? err.message : 'Internal server error' });
  });
  return app;
}
