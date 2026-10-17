import { Router } from 'express';
import bcrypt from 'bcryptjs';
import { prisma } from '../db.js';
import { COOKIE_NAME, cookieOptions, requireAdmin, setAuthCookie } from '../lib/auth.js';
import { createLimiter } from '../lib/rateLimit.js';

export const router = Router();

const LOGIN_WINDOW_MS = 15 * 60 * 1000;
const ipLimiter = createLimiter({ max: 20, windowMs: LOGIN_WINDOW_MS });
const emailLimiter = createLimiter({ max: 5, windowMs: LOGIN_WINDOW_MS });

router.post('/auth/login', async (req, res) => {
  const email = String(req.body?.email ?? '').trim().toLowerCase();
  const password = String(req.body?.password ?? '');
  const retryAfter = Math.max(ipLimiter.retryAfter(req.ip), emailLimiter.retryAfter(email));
  if (retryAfter) {
    res.set('Retry-After', String(retryAfter));
    return res.status(429).json({ error: 'Too many login attempts. Try again later.' });
  }
  const admin = email ? await prisma.adminUser.findUnique({ where: { email } }) : null;
  if (!admin || !(await bcrypt.compare(password, admin.passwordHash))) {
    ipLimiter.fail(req.ip);
    if (email) emailLimiter.fail(email);
    return res.status(401).json({ error: 'Invalid email or password' });
  }
  emailLimiter.reset(email);
  setAuthCookie(res, admin);
  res.json({ email: admin.email });
});

router.post('/auth/logout', (req, res) => {
  res.clearCookie(COOKIE_NAME, cookieOptions);
  res.status(204).end();
});

router.get('/auth/me', requireAdmin, (req, res) => res.json({ email: req.admin.email }));
