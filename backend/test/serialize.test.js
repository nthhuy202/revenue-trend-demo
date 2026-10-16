import { test } from 'node:test';
import assert from 'node:assert/strict';
import { Prisma } from '@prisma/client';
import { serializeDay, toDateStr } from '../src/lib/serialize.js';

test('toDateStr keeps the UTC calendar day even in a negative-offset timezone', () => {
  const original = process.env.TZ;
  process.env.TZ = 'America/Los_Angeles';
  try {
    assert.equal(toDateStr(new Date('2026-10-12T00:00:00Z')), '2026-10-12');
  } finally {
    process.env.TZ = original;
  }
});

test('serializeDay turns Prisma Decimals into numbers', () => {
  const row = {
    date: new Date('2026-10-12'),
    posRevenue: new Prisma.Decimal('1734.50'),
    eatclubRevenue: new Prisma.Decimal('270.00'),
    labourCosts: new Prisma.Decimal('570.25'),
    covers: 118,
  };
  const day = serializeDay(row, '2026-10-12');
  assert.equal(day.posRevenue, 1734.5);
  assert.equal(typeof day.posRevenue, 'number');
  assert.equal(day.labourCosts, 570.25);
  assert.equal(day.weekday, 'Mon');
  assert.equal(day.hasData, true);
});

test('serializeDay fills a missing day with zeros', () => {
  assert.deepEqual(serializeDay(undefined, '2026-10-13'), {
    date: '2026-10-13',
    weekday: 'Tue',
    posRevenue: 0,
    eatclubRevenue: 0,
    labourCosts: 0,
    covers: 0,
    hasData: false,
  });
});
