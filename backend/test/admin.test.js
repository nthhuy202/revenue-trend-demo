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

test('responses carry security headers and no x-powered-by', async () => {
  const app = await startApp();
  try {
    const response = await fetch(`${app.url}/api/auth/me`);
    assert.equal(response.headers.get('x-content-type-options'), 'nosniff');
    assert.equal(response.headers.get('x-powered-by'), null);
  } finally {
    await app.close();
  }
});

test('login is rate limited per IP after repeated failures', async () => {
  const app = await startApp();
  const login = () =>
    fetch(`${app.url}/api/auth/login`, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      // Empty email fails without touching the database.
      body: JSON.stringify({ email: '', password: 'wrong' }),
    });
  try {
    for (let attempt = 0; attempt < 20; attempt++) assert.equal((await login()).status, 401);
    const blocked = await login();
    assert.equal(blocked.status, 429);
    assert.ok(Number(blocked.headers.get('retry-after')) > 0);
  } finally {
    await app.close();
  }
});
