import { createApp } from '../src/app.js';

// Starts the app on a random port; returns { url, close }.
export async function startApp() {
  const server = createApp().listen(0);
  await new Promise((resolve) => server.once('listening', resolve));
  return {
    url: `http://127.0.0.1:${server.address().port}`,
    close: () => new Promise((resolve) => server.close(resolve)),
  };
}
