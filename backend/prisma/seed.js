import bcrypt from 'bcryptjs';
import { PrismaClient } from '@prisma/client';
import { currentIsoWeek, previousWeek, nextWeek, weekDates } from '../src/lib/week.js';

const prisma = new PrismaClient();

// Mon..Sun sample figures shaped like the reference video (weekends busier).
const CURRENT = {
  pos: [1740, 1980, 1810, 1970, 2010, 2000, 2410],
  eatclub: [270, 330, 310, 340, 370, 630, 400],
  labour: [570, 670, 880, 680, 700, 800, 1180],
  covers: [118, 132, 121, 135, 138, 146, 143],
};
const PREVIOUS = {
  pos: [1610, 1830, 1580, 1850, 1870, 2000, 2160],
  eatclub: [280, 330, 280, 350, 340, 670, 380],
  labour: [560, 640, 790, 640, 660, 780, 1080],
  covers: [109, 124, 108, 126, 127, 134, 124],
};
const FUTURE_WEEKS = 3; // so the demo still has data after the week rolls over

const scale = (values, factor, step) => values.map((v) => Math.round((v * factor) / step) * step);

// Create-only: never overwrites figures or events an admin has edited.
async function seedWeek(week, data) {
  const dates = weekDates(week);
  await prisma.dailyMetric.createMany({
    data: dates.map((d, i) => ({
      date: new Date(d),
      posRevenue: data.pos[i],
      eatclubRevenue: data.eatclub[i],
      labourCosts: data.labour[i],
      covers: data.covers[i],
    })),
    skipDuplicates: true,
  });

  const range = { gte: new Date(dates[0]), lte: new Date(dates[6]) };
  if ((await prisma.event.count({ where: { date: range } })) === 0) {
    await prisma.event.createMany({
      data: [
        { date: new Date(dates[4]), impact: 'negative', label: 'Rainy day' },
        { date: new Date(dates[5]), impact: 'positive', label: 'Local festival' },
      ],
    });
  }
}

async function main() {
  const email = process.env.ADMIN_EMAIL?.trim().toLowerCase();
  const password = process.env.ADMIN_PASSWORD;
  if (!email || !password) {
    console.error('ADMIN_EMAIL and ADMIN_PASSWORD must be set. Copy .env.example to .env (see README).');
    process.exitCode = 1;
    return;
  }

  const passwordHash = await bcrypt.hash(password, 10);
  await prisma.adminUser.upsert({ where: { email }, update: { passwordHash }, create: { email, passwordHash } });

  const thisWeek = currentIsoWeek();
  await seedWeek(previousWeek(thisWeek), PREVIOUS);
  await seedWeek(thisWeek, CURRENT);
  let week = thisWeek;
  for (let i = 1; i <= FUTURE_WEEKS; i++) {
    week = nextWeek(week);
    const f = 1 + 0.02 * i;
    await seedWeek(week, {
      pos: scale(CURRENT.pos, f, 10),
      eatclub: scale(CURRENT.eatclub, f, 10),
      labour: scale(CURRENT.labour, 1 + 0.01 * i, 10),
      covers: scale(CURRENT.covers, f, 1),
    });
  }

  console.log(`Seeded admin ${email} and weeks ${previousWeek(thisWeek)} to ${week} (existing data kept)`);
}

main()
  .catch((err) => {
    console.error(err);
    process.exitCode = 1;
  })
  .finally(() => prisma.$disconnect());
