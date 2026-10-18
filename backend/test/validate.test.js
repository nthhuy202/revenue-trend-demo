import { test } from 'node:test';
import assert from 'node:assert/strict';
import { validateDays, validateEvent } from '../src/lib/validate.js';
import { weekDates } from '../src/lib/week.js';

const validDays = () =>
  weekDates('2026-W42').map((date) => ({ date, posRevenue: 1800, eatclubRevenue: 300, labourCosts: 650.5, covers: 120 }));

test('weeks after the current week cannot be edited', () => {
  const now = new Date('2026-10-14T12:00:00Z'); // 2026-W42
  assert.equal(validateDays('2026-W42', validDays(), now).ok, true);
  const nextWeekDays = weekDates('2026-W43').map((date) => ({ ...validDays()[0], date }));
  assert.match(validateDays('2026-W43', nextWeekDays, now).error, /after the current week/);
  assert.equal(validateEvent({ date: '2026-10-18', impact: 'positive', label: 'x' }, now).ok, true);
  assert.match(validateEvent({ date: '2026-10-19', impact: 'positive', label: 'x' }, now).error, /after the current week/);
});

test('validateDays accepts seven valid days of the week', () => {
  const result = validateDays('2026-W42', validDays());
  assert.equal(result.ok, true);
  assert.equal(result.value.length, 7);
  assert.equal(result.value[0].labourCosts, 650.5);
});

test('validateDays rejects a negative amount and names the field', () => {
  const days = validDays();
  days[0].posRevenue = -5;
  const result = validateDays('2026-W42', days);
  assert.equal(result.ok, false);
  assert.match(result.error, /posRevenue/);
});

test('validateDays rejects blank and non-numeric amounts', () => {
  for (const bad of ['', 'abc', null]) {
    const days = validDays();
    days[2].eatclubRevenue = bad;
    assert.equal(validateDays('2026-W42', days).ok, false, `value ${JSON.stringify(bad)}`);
  }
});

test('validateDays rejects fractional covers', () => {
  const days = validDays();
  days[1].covers = 1.5;
  assert.equal(validateDays('2026-W42', days).ok, false);
});

test('validateDays requires exactly the seven dates of that week', () => {
  assert.equal(validateDays('2026-W42', validDays().slice(0, 6)).ok, false);
  const days = validDays();
  days[6].date = '2026-10-19';
  assert.equal(validateDays('2026-W42', days).ok, false);
  assert.equal(validateDays('2026-W42', 'nope').ok, false);
});

test('validateEvent accepts a valid event and trims the label', () => {
  const result = validateEvent({ date: '2026-10-16', impact: 'positive', label: '  Festival ' });
  assert.deepEqual(result, { ok: true, value: { date: '2026-10-16', impact: 'positive', label: 'Festival' } });
});

test('validateEvent rejects unknown impact, empty label and bad date', () => {
  assert.equal(validateEvent({ date: '2026-10-16', impact: 'neutral', label: 'x' }).ok, false);
  assert.equal(validateEvent({ date: '2026-10-16', impact: 'positive', label: '   ' }).ok, false);
  assert.equal(validateEvent({ date: '2026-13-40', impact: 'positive', label: 'x' }).ok, false);
});

test('validateDays rejects non-numeric types that Number() would coerce', () => {
  for (const bad of [true, [5], '0x10', '1e3', ' 12 ']) {
    const days = validDays();
    days[0].posRevenue = bad;
    assert.equal(validateDays('2026-W42', days).ok, false, `value ${JSON.stringify(bad)}`);
  }
});

test('validateDays rejects covers with any fractional part', () => {
  const days = validDays();
  days[0].covers = 1.001;
  assert.equal(validateDays('2026-W42', days).ok, false);
});

test('validateDays rejects values the database columns cannot hold', () => {
  const money = validDays();
  money[0].labourCosts = 1e11;
  assert.equal(validateDays('2026-W42', money).ok, false);
  const covers = validDays();
  covers[0].covers = 3e9;
  assert.equal(validateDays('2026-W42', covers).ok, false);
});

test('validateDays accepts numeric strings with up to two decimals', () => {
  const days = validDays();
  days[0].posRevenue = '1734.5';
  days[0].covers = '118';
  const result = validateDays('2026-W42', days);
  assert.equal(result.ok, true);
  assert.equal(result.value[0].posRevenue, 1734.5);
  assert.equal(result.value[0].covers, 118);
});
