// Mirrors backend/src/lib/week.js — ISO weeks (Mon–Sun), UTC math.
const DAY_MS = 86_400_000;

function week1Monday(year: number) {
  const jan4 = new Date(Date.UTC(year, 0, 4));
  return new Date(jan4.getTime() - ((jan4.getUTCDay() + 6) % 7) * DAY_MS);
}

export function isoWeekOf(date: Date) {
  const d = new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate()));
  d.setUTCDate(d.getUTCDate() + 3 - ((d.getUTCDay() + 6) % 7));
  const year = d.getUTCFullYear();
  const week = Math.floor((d.getTime() - week1Monday(year).getTime()) / (7 * DAY_MS)) + 1;
  return `${year}-W${String(week).padStart(2, "0")}`;
}

export const currentIsoWeek = () => isoWeekOf(new Date());

export const isIsoWeek = (s: string | null | undefined): s is string => !!s && /^\d{4}-W\d{2}$/.test(s);

function mondayOf(week: string) {
  const [y, w] = week.split("-W").map(Number);
  return new Date(week1Monday(y).getTime() + (w - 1) * 7 * DAY_MS);
}

export const shiftWeek = (week: string, by: number) => isoWeekOf(new Date(mondayOf(week).getTime() + by * 7 * DAY_MS));
