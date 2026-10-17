import { test } from 'node:test';
import assert from 'node:assert/strict';
import { createLimiter } from '../src/lib/rateLimit.js';

test('limiter blocks a key after max failures until the window ends', () => {
  const limiter = createLimiter({ max: 3, windowMs: 60_000 });
  const start = 1_000_000;

  limiter.fail('a', start);
  limiter.fail('a', start);
  assert.equal(limiter.retryAfter('a', start), 0);

  limiter.fail('a', start);
  assert.equal(limiter.retryAfter('a', start), 60);
  assert.equal(limiter.retryAfter('a', start + 30_000), 30);
  assert.equal(limiter.retryAfter('b', start), 0);
  assert.equal(limiter.retryAfter('a', start + 60_000), 0);
});

test('limiter starts a fresh window after expiry and forgets a reset key', () => {
  const limiter = createLimiter({ max: 2, windowMs: 1000 });

  limiter.fail('a', 0);
  limiter.fail('a', 1000);
  assert.equal(limiter.retryAfter('a', 1000), 0);

  limiter.fail('a', 1000);
  assert.equal(limiter.retryAfter('a', 1000), 1);

  limiter.reset('a');
  assert.equal(limiter.retryAfter('a', 1000), 0);
});
