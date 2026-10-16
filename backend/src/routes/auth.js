import { Router } from 'express';
import bcrypt from 'bcryptjs';
import { prisma } from '../db.js';
import { COOKIE_NAME, cookieOptions, requireAdmin, setAuthCookie } from '../lib/auth.js';

export const router = Router();

router.post('/auth/login', async (req, res) => {
  const email = String(req.body?.email ?? '').trim().toLowerCase();
  const password = String(req.body?.password ?? '');
  const admin = email ? await prisma.adminUser.findUnique({ where: { email } }) : null;
  if (!admin || !(await bcrypt.compare(password, admin.passwordHash))) {
    return res.status(401).json({ error: 'Invalid email or password' });
  }
  setAuthCookie(res, admin);
  res.json({ email: admin.email });
});

router.post('/auth/logout', (req, res) => {
  res.clearCookie(COOKIE_NAME, cookieOptions);
  res.status(204).end();
});

router.get('/auth/me', requireAdmin, (req, res) => res.json({ email: req.admin.email }));
