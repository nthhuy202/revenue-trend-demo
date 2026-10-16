import { Router } from 'express';
import { prisma } from '../db.js';
import { currentIsoWeek, parseIsoWeek, previousWeek, weekDates } from '../lib/week.js';
import { serializeDay, toDateStr } from '../lib/serialize.js';
import { buildSummary } from '../lib/summary.js';

export async function loadWeek(week) {
  const dates = weekDates(week);
  const rows = await prisma.dailyMetric.findMany({
    where: { date: { gte: new Date(dates[0]), lte: new Date(dates[6]) } },
  });
  const byDate = new Map(rows.map((r) => [toDateStr(r.date), r]));
  return dates.map((d) => serializeDay(byDate.get(d), d));
}

export async function loadEvents(week) {
  const dates = weekDates(week);
  const events = await prisma.event.findMany({
    where: { date: { gte: new Date(dates[0]), lte: new Date(dates[6]) } },
    orderBy: [{ date: 'asc' }, { id: 'asc' }],
  });
  return events.map((e) => ({ id: e.id, date: toDateStr(e.date), impact: e.impact, label: e.label }));
}

export const router = Router();

router.get('/revenue-trend', async (req, res) => {
  const week = req.query.week ?? currentIsoWeek();
  if (!parseIsoWeek(week)) {
    return res.status(400).json({ error: 'Invalid week, expected format YYYY-Www (e.g. 2026-W42)' });
  }
  const prev = previousWeek(week);
  const [currentDays, previousDays, events] = await Promise.all([loadWeek(week), loadWeek(prev), loadEvents(week)]);
  res.json({
    week,
    current: { week, days: currentDays },
    previous: { week: prev, days: previousDays },
    events,
    summary: buildSummary(currentDays, previousDays),
  });
});
