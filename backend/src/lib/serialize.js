export { toDateStr } from './week.js';

const WEEKDAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

// dateStr is 'YYYY-MM-DD'; row is a DailyMetric (Prisma Decimals) or undefined.
export function serializeDay(row, dateStr) {
  return {
    date: dateStr,
    weekday: WEEKDAYS[(new Date(dateStr).getUTCDay() + 6) % 7],
    posRevenue: row ? Number(row.posRevenue) : 0,
    eatclubRevenue: row ? Number(row.eatclubRevenue) : 0,
    labourCosts: row ? Number(row.labourCosts) : 0,
    covers: row ? row.covers : 0,
    hasData: Boolean(row),
  };
}
