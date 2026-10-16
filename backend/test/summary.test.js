import { test } from 'node:test';
import assert from 'node:assert/strict';
import { buildSummary } from '../src/lib/summary.js';

const days = (pos, eatclub, covers) =>
  Array.from({ length: 7 }, () => ({ posRevenue: pos, eatclubRevenue: eatclub, covers }));

test('buildSummary totals revenue as POS + Eatclub and compares with previous', () => {
  const s = buildSummary(days(1000, 100, 10), days(900, 100, 10));
  assert.deepEqual(s.current, { totalRevenue: 7700, avgPerDay: 1100, totalCovers: 70 });
  assert.deepEqual(s.previous, { totalRevenue: 7000, avgPerDay: 1000, totalCovers: 70 });
  assert.equal(s.changePct.totalRevenue, 10);
  assert.equal(s.changePct.avgPerDay, 10);
  assert.equal(s.changePct.totalCovers, 0);
});

test('buildSummary returns null change when previous period is empty', () => {
  const s = buildSummary(days(1000, 100, 10), days(0, 0, 0));
  assert.deepEqual(s.changePct, { totalRevenue: null, avgPerDay: null, totalCovers: null });
});

test('buildSummary rounds money to cents and pct to one decimal', () => {
  const s = buildSummary(days(1000.006, 0, 3), days(3000 / 7, 0, 1));
  assert.equal(s.current.totalRevenue, 7000.04);
  assert.equal(s.changePct.totalCovers, 200);
  assert.equal(s.changePct.totalRevenue, 133.3);
});
