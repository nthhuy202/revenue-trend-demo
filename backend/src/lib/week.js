// ISO-8601 weeks (Mon–Sun), all math in UTC so server timezone never shifts a day.
const DAY_MS = 86_400_000;
const WEEK_RE = /^(\d{4})-W(\d{2})$/;

export const toDateStr = (d) => d.toISOString().slice(0, 10);

// Monday of ISO week 1 = the Monday on or before Jan 4th.
function week1Monday(year) {
  const jan4 = new Date(Date.UTC(year, 0, 4));
  return new Date(jan4.getTime() - ((jan4.getUTCDay() + 6) % 7) * DAY_MS);
}

function weeksInYear(year) {
  return Math.round((week1Monday(year + 1) - week1Monday(year)) / (7 * DAY_MS));
}

const format = (year, week) => `${year}-W${String(week).padStart(2, '0')}`;

export function parseIsoWeek(str) {
  const m = WEEK_RE.exec(String(str));
  if (!m) return null;
  const year = Number(m[1]);
  const week = Number(m[2]);
  if (week < 1 || week > weeksInYear(year)) return null;
  return { year, week };
}

export function isoWeekOf(date) {
  const d = new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate()));
  d.setUTCDate(d.getUTCDate() + 3 - ((d.getUTCDay() + 6) % 7)); // Thursday of this week
  const year = d.getUTCFullYear();
  const week = Math.floor((d - week1Monday(year)) / (7 * DAY_MS)) + 1;
  return format(year, week);
}

export const currentIsoWeek = (now = new Date()) => isoWeekOf(now);

// Zero-padded YYYY-Www strings sort chronologically, so a string compare is enough.
export const isAfterCurrentWeek = (weekStr, now = new Date()) => weekStr > currentIsoWeek(now);

function mondayOf(weekStr) {
  const parsed = parseIsoWeek(weekStr);
  if (!parsed) throw new Error(`Invalid ISO week: ${weekStr}`);
  return new Date(week1Monday(parsed.year).getTime() + (parsed.week - 1) * 7 * DAY_MS);
}

export function weekDates(weekStr) {
  const monday = mondayOf(weekStr).getTime();
  return Array.from({ length: 7 }, (_, i) => toDateStr(new Date(monday + i * DAY_MS)));
}

export const previousWeek = (weekStr) => isoWeekOf(new Date(mondayOf(weekStr).getTime() - 7 * DAY_MS));
export const nextWeek = (weekStr) => isoWeekOf(new Date(mondayOf(weekStr).getTime() + 7 * DAY_MS));
