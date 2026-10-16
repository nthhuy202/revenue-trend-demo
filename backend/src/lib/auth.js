import jwt from 'jsonwebtoken';

export const COOKIE_NAME = 'token';
const MAX_AGE_MS = 7 * 24 * 60 * 60 * 1000;

export const cookieOptions = {
  httpOnly: true,
  sameSite: 'lax',
  secure: process.env.NODE_ENV === 'production',
  path: '/',
};

function secret() {
  if (!process.env.JWT_SECRET) throw new Error('JWT_SECRET is not set');
  return process.env.JWT_SECRET;
}

export function setAuthCookie(res, admin) {
  const token = jwt.sign({ sub: admin.id, email: admin.email }, secret(), { expiresIn: '7d' });
  res.cookie(COOKIE_NAME, token, { ...cookieOptions, maxAge: MAX_AGE_MS });
}

export function requireAdmin(req, res, next) {
  try {
    req.admin = jwt.verify(req.cookies?.[COOKIE_NAME], secret());
    next();
  } catch {
    res.status(401).json({ error: 'Unauthorized' });
  }
}
