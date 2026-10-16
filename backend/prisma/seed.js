import bcrypt from 'bcryptjs';
import { PrismaClient } from '@prisma/client';
import { currentIsoWeek, previousWeek, weekDates } from '../src/lib/week.js';

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

async function seedWeek(week, data) {
  const dates = weekDates(week);
  for (const [i, d] of dates.entries()) {
    const values = {
      posRevenue: data.pos[i],
      eatclubRevenue: data.eatclub[i],
      labourCosts: data.labour[i],
      covers: data.covers[i],
    };
    await prisma.dailyMetric.upsert({
      where: { date: new Date(d) },
      update: values,
      create: { date: new Date(d), ...values },
    });
  }
  return dates;
}

async function main() {
  const email = process.env.ADMIN_EMAIL || 'admin@example.com';
  const password = process.env.ADMIN_PASSWORD || 'admin123';
  const passwordHash = await bcrypt.hash(password, 10);
  await prisma.adminUser.upsert({ where: { email }, update: { passwordHash }, create: { email, passwordHash } });

  const week = currentIsoWeek();
  const current = await seedWeek(week, CURRENT);
  const previous = await seedWeek(previousWeek(week), PREVIOUS);

  await prisma.event.deleteMany({
    where: { date: { gte: new Date(previous[0]), lte: new Date(current[6]) } },
  });
  await prisma.event.createMany({
    data: [
      { date: new Date(current[4]), impact: 'negative', label: 'Rainy day' },
      { date: new Date(current[5]), impact: 'positive', label: 'Local festival' },
    ],
  });

  console.log(`Seeded admin ${email}, weeks ${previousWeek(week)} and ${week}`);
}

main()
  .catch((err) => {
    console.error(err);
    process.exitCode = 1;
  })
  .finally(() => prisma.$disconnect());
