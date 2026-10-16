const round2 = (n) => Math.round(n * 100) / 100;
const pct = (cur, prev) => (prev === 0 ? null : Math.round(((cur - prev) / prev) * 1000) / 10);

function totals(days) {
  const revenue = days.reduce((sum, d) => sum + d.posRevenue + d.eatclubRevenue, 0);
  return {
    totalRevenue: round2(revenue),
    avgPerDay: round2(revenue / 7),
    totalCovers: days.reduce((sum, d) => sum + d.covers, 0),
  };
}

export function buildSummary(currentDays, previousDays) {
  const current = totals(currentDays);
  const previous = totals(previousDays);
  return {
    current,
    previous,
    changePct: {
      totalRevenue: pct(current.totalRevenue, previous.totalRevenue),
      avgPerDay: pct(current.avgPerDay, previous.avgPerDay),
      totalCovers: pct(current.totalCovers, previous.totalCovers),
    },
  };
}
