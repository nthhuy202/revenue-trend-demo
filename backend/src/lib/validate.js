import { weekDates } from './week.js';

const MONEY_FIELDS = ['posRevenue', 'eatclubRevenue', 'labourCosts'];
const IMPACTS = ['positive', 'negative'];
const DATE_RE = /^\d{4}-\d{2}-\d{2}$/;

const fail = (error) => ({ ok: false, error });

// Accepts numbers or numeric strings; rejects blank, null, NaN, negatives.
function toAmount(raw) {
  if (raw === null || raw === undefined || (typeof raw === 'string' && raw.trim() === '')) return NaN;
  const n = Number(raw);
  return Number.isFinite(n) && n >= 0 ? Math.round(n * 100) / 100 : NaN;
}

export function isValidDate(str) {
  if (!DATE_RE.test(str)) return false;
  const d = new Date(str);
  return !Number.isNaN(d.getTime()) && d.toISOString().slice(0, 10) === str;
}

export function validateDays(week, days) {
  if (!Array.isArray(days)) return fail('days must be an array');
  const dates = weekDates(week);
  if (days.length !== 7) return fail('days must contain exactly 7 entries (Mon–Sun)');

  const value = [];
  for (const [i, day] of days.entries()) {
    if (day?.date !== dates[i]) return fail(`day ${i + 1} must have date ${dates[i]}`);
    const clean = { date: day.date };
    for (const field of MONEY_FIELDS) {
      clean[field] = toAmount(day[field]);
      if (Number.isNaN(clean[field])) return fail(`${field} on ${day.date} must be a number ≥ 0`);
    }
    const covers = toAmount(day.covers);
    if (!Number.isInteger(covers)) return fail(`covers on ${day.date} must be a whole number ≥ 0`);
    clean.covers = covers;
    value.push(clean);
  }
  return { ok: true, value };
}

export function validateEvent(body) {
  const { date, impact } = body ?? {};
  const label = typeof body?.label === 'string' ? body.label.trim() : '';
  if (typeof date !== 'string' || !isValidDate(date)) return fail('date must be a valid YYYY-MM-DD date');
  if (!IMPACTS.includes(impact)) return fail('impact must be "positive" or "negative"');
  if (!label) return fail('label is required');
  if (label.length > 80) return fail('label must be at most 80 characters');
  return { ok: true, value: { date, impact, label } };
}
