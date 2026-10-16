import { test } from 'node:test';
import assert from 'node:assert/strict';
import { startApp } from './helpers.js';

test('GET /api/revenue-trend rejects a malformed week with 400', async () => {
  const app = await startApp();
  try {
    const res = await fetch(`${app.url}/api/revenue-trend?week=2026-42`);
    assert.equal(res.status, 400);
    const body = await res.json();
    assert.match(body.error, /week/i);
  } finally {
    await app.close();
  }
});
