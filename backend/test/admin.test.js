import { test } from 'node:test';
import assert from 'node:assert/strict';
import { startApp } from './helpers.js';

test('admin endpoints require a login cookie', async () => {
  const app = await startApp();
  try {
    const get = await fetch(`${app.url}/api/admin/weeks/2026-W42`);
    assert.equal(get.status, 401);
    const put = await fetch(`${app.url}/api/admin/weeks/2026-W42/days`, {
      method: 'PUT',
      headers: { 'content-type': 'application/json', cookie: 'token=forged' },
      body: JSON.stringify({ days: [] }),
    });
    assert.equal(put.status, 401);
    const me = await fetch(`${app.url}/api/auth/me`);
    assert.equal(me.status, 401);
  } finally {
    await app.close();
  }
});
