import { test } from 'node:test';
import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';

test('seed refuses to run without admin credentials', () => {
  // Empty rather than deleted: Prisma auto-loads backend/.env, which would fill a missing var.
  const env = { ...process.env, ADMIN_EMAIL: '', ADMIN_PASSWORD: '' };
  const result = spawnSync(process.execPath, ['prisma/seed.js'], { env, encoding: 'utf8', timeout: 5000 });
  assert.notEqual(result.status, 0);
  assert.match(result.stderr, /ADMIN_EMAIL and ADMIN_PASSWORD/);
});
