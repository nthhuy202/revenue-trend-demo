import { createApp } from './app.js';

if (!process.env.JWT_SECRET) {
  console.error('JWT_SECRET is not set. Copy .env.example to .env and set a secret (see README).');
  process.exit(1);
}

const port = Number(process.env.PORT) || 4000;
createApp().listen(port, () => console.log(`API listening on http://localhost:${port}`));
