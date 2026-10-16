import { Router } from 'express';
import { prisma } from '../db.js';
import { requireAdmin } from '../lib/auth.js';
import { parseIsoWeek } from '../lib/week.js';
import { validateDays, validateEvent } from '../lib/validate.js';
import { loadEvents, loadWeek } from './revenueTrend.js';

export const router = Router();
router.use('/admin', requireAdmin);

function checkWeek(req, res, next) {
  if (!parseIsoWeek(req.params.week)) {
    return res.status(400).json({ error: 'Invalid week, expected format YYYY-Www (e.g. 2026-W42)' });
  }
  next();
}

async function weekPayload(week) {
  const [days, events] = await Promise.all([loadWeek(week), loadEvents(week)]);
  return { week, days, events };
}

router.get('/admin/weeks/:week', checkWeek, async (req, res) => {
  res.json(await weekPayload(req.params.week));
});

router.put('/admin/weeks/:week/days', checkWeek, async (req, res) => {
  const result = validateDays(req.params.week, req.body?.days);
  if (!result.ok) return res.status(400).json({ error: result.error });
  await prisma.$transaction(
    result.value.map(({ date, ...values }) =>
      prisma.dailyMetric.upsert({
        where: { date: new Date(date) },
        update: values,
        create: { date: new Date(date), ...values },
      }),
    ),
  );
  res.json(await weekPayload(req.params.week));
});

router.post('/admin/events', async (req, res) => {
  const result = validateEvent(req.body);
  if (!result.ok) return res.status(400).json({ error: result.error });
  const { date, ...rest } = result.value;
  const event = await prisma.event.create({ data: { date: new Date(date), ...rest } });
  res.status(201).json({ id: event.id, ...result.value });
});

router.delete('/admin/events/:id', async (req, res) => {
  const id = Number(req.params.id);
  if (!Number.isInteger(id)) return res.status(404).json({ error: 'Event not found' });
  const { count } = await prisma.event.deleteMany({ where: { id } });
  if (count === 0) return res.status(404).json({ error: 'Event not found' });
  res.status(204).end();
});
