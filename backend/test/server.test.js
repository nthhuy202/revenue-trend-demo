import { test } from 'node:test';
import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';

test('server refuses to start without JWT_SECRET', () => {
  // Empty rather than deleted: Prisma auto-loads backend/.env, which would fill a missing var.
  const env = { ...process.env, PORT: '0', JWT_SECRET: '' };
  const result = spawnSync(process.execPath, ['src/server.js'], { env, encoding: 'utf8', timeout: 5000 });
  assert.notEqual(result.status, 0);
  assert.match(result.stderr, /JWT_SECRET/);
});
