import { test } from 'node:test';
import assert from 'node:assert/strict';
import { validateDays, validateEvent } from '../src/lib/validate.js';
import { weekDates } from '../src/lib/week.js';

const validDays = () =>
  weekDates('2026-W42').map((date) => ({ date, posRevenue: 1800, eatclubRevenue: 300, labourCosts: 650.5, covers: 120 }));

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
