import { test } from 'node:test';
import assert from 'node:assert/strict';
import { parseIsoWeek, currentIsoWeek, weekDates, previousWeek, nextWeek, isAfterCurrentWeek } from '../src/lib/week.js';

test('isAfterCurrentWeek compares across the year boundary', () => {
  const now = new Date('2026-12-30T12:00:00Z'); // 2026-W53
  assert.equal(isAfterCurrentWeek('2026-W53', now), false);
  assert.equal(isAfterCurrentWeek('2026-W09', now), false);
  assert.equal(isAfterCurrentWeek('2027-W01', now), true);
});

test('weekDates returns Monday..Sunday of the ISO week', () => {
  const days = weekDates('2026-W42');
  assert.equal(days.length, 7);
  assert.equal(days[0], '2026-10-12');
  assert.equal(days[6], '2026-10-18');
});

test('currentIsoWeek uses the ISO year, not the calendar year', () => {
  assert.equal(currentIsoWeek(new Date('2026-10-16T12:00:00Z')), '2026-W42');
  assert.equal(currentIsoWeek(new Date('2027-01-01T00:00:00Z')), '2026-W53');
});

test('previousWeek / nextWeek cross the year boundary', () => {
  assert.equal(previousWeek('2027-W01'), '2026-W53');
  assert.equal(nextWeek('2026-W53'), '2027-W01');
  assert.equal(previousWeek('2026-W42'), '2026-W41');
});

test('parseIsoWeek rejects bad formats and weeks the year does not have', () => {
  assert.deepEqual(parseIsoWeek('2026-W42'), { year: 2026, week: 42 });
  assert.equal(parseIsoWeek('2026-42'), null);
  assert.equal(parseIsoWeek('2025-W53'), null);
  assert.equal(parseIsoWeek('2026-W00'), null);
  assert.equal(parseIsoWeek('abc'), null);
});
