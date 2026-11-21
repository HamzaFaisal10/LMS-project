import { Router } from 'express';
import { asyncHandler, ApiError } from '../utils/asyncHandler.js';
import { resetDemo } from '../seed/ensureSeed.js';

const router = Router();

// Daily Vercel cron: restores the demo dataset so the public demo always looks fresh.
// Vercel sends "Authorization: Bearer <CRON_SECRET>" when CRON_SECRET is configured.
router.get(
  '/reset-demo',
  asyncHandler(async (req, res) => {
    const secret = process.env.CRON_SECRET;
    const fromVercelCron = (req.headers['user-agent'] || '').includes('vercel-cron');
    const authorized = secret ? req.headers.authorization === `Bearer ${secret}` : fromVercelCron;
    if (!authorized) throw new ApiError(401, 'Unauthorized');
    await resetDemo();
    res.json({ ok: true, resetAt: new Date().toISOString() });
  }),
);

export default router;
