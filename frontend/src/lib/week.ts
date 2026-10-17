// Mirrors backend/src/lib/week.js — ISO weeks (Mon–Sun), UTC math.
const DAY_MS = 86_400_000;
const WEEK_MS = 7 * DAY_MS;
const ISO_WEEK_PATTERN = /^\d{4}-W\d{2}$/;

function getWeek1Monday(year: number) {
  const jan4 = new Date(Date.UTC(year, 0, 4));

  return new Date(jan4.getTime() - ((jan4.getUTCDay() + 6) % 7) * DAY_MS);
}

export function getIsoWeek(date: Date) {
  const thursday = new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate()));
  thursday.setUTCDate(thursday.getUTCDate() + 3 - ((thursday.getUTCDay() + 6) % 7));
  const year = thursday.getUTCFullYear();
  const week = Math.floor((thursday.getTime() - getWeek1Monday(year).getTime()) / WEEK_MS) + 1;

  return `${year}-W${String(week).padStart(2, "0")}`;
}

export const getCurrentIsoWeek = () => getIsoWeek(new Date());

export const isIsoWeek = (value: string | null | undefined): value is string => !!value && ISO_WEEK_PATTERN.test(value);

function getMondayOf(week: string) {
  const [year, weekNumber] = week.split("-W").map(Number);

  return new Date(getWeek1Monday(year).getTime() + (weekNumber - 1) * WEEK_MS);
}

export const shiftWeek = (week: string, by: number) => getIsoWeek(new Date(getMondayOf(week).getTime() + by * WEEK_MS));
