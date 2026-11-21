import { Router } from 'express';
import { z } from 'zod';
import User from '../models/User.js';
import { protect, signToken } from '../middleware/auth.js';
import { validate } from '../middleware/validate.js';
import { ApiError, asyncHandler } from '../utils/asyncHandler.js';
import { DEMO_ACCOUNTS } from '../seed/demoAccounts.js';
import rateLimit from 'express-rate-limit';

const router = Router();
const authLimiter = rateLimit({ windowMs: 15 * 60 * 1000, limit: 50 });

const registerSchema = z.object({
  name: z.string().trim().min(2, 'Name is too short').max(80),
  email: z.string().trim().email('Enter a valid email'),
  password: z.string().min(6, 'Password must be at least 6 characters').max(100),
  role: z.enum(['student', 'instructor']).default('student'),
});

const loginSchema = z.object({
  email: z.string().trim().email('Enter a valid email'),
  password: z.string().min(1, 'Password is required'),
});

const send = (res, user, status = 200) => res.status(status).json({ token: signToken(user), user });

router.post(
  '/register',
  authLimiter,
  validate(registerSchema),
  asyncHandler(async (req, res) => {
    const exists = await User.findOne({ email: req.body.email.toLowerCase() });
    if (exists) throw new ApiError(409, 'An account with this email already exists');
    const user = await User.create(req.body);
    send(res, user, 201);
  }),
);

router.post(
  '/login',
  authLimiter,
  validate(loginSchema),
  asyncHandler(async (req, res) => {
    const user = await User.findOne({ email: req.body.email.toLowerCase() }).select('+password');
    if (!user || !(await user.matchPassword(req.body.password))) {
      throw new ApiError(401, 'Invalid email or password');
    }
    if (user.isBlocked) throw new ApiError(403, 'Your account has been suspended');
    send(res, user);
  }),
);

// One-click login into the shared demo accounts (portfolio demo convenience).
router.post(
  '/demo/:role',
  asyncHandler(async (req, res) => {
    const account = DEMO_ACCOUNTS[req.params.role];
    if (!account) throw new ApiError(404, 'Unknown demo role');
    const user = await User.findOne({ email: account.email });
    if (!user) throw new ApiError(503, 'Demo data is being prepared, please retry in a moment');
    if (user.isBlocked) {
      user.isBlocked = false;
      await user.save();
    }
    send(res, user);
  }),
);

router.get('/me', protect, (req, res) => res.json({ user: req.user }));

const profileSchema = z.object({
  name: z.string().trim().min(2).max(80),
  headline: z.string().trim().max(120).optional().default(''),
  bio: z.string().trim().max(1000).optional().default(''),
});

router.put(
  '/profile',
  protect,
  validate(profileSchema),
  asyncHandler(async (req, res) => {
    Object.assign(req.user, req.body);
    await req.user.save();
    res.json({ user: req.user });
  }),
);

const passwordSchema = z.object({
  currentPassword: z.string().min(1, 'Current password is required'),
  newPassword: z.string().min(6, 'New password must be at least 6 characters').max(100),
});

router.put(
  '/password',
  protect,
  validate(passwordSchema),
  asyncHandler(async (req, res) => {
    const user = await User.findById(req.user._id).select('+password');
    if (user.isDemo) throw new ApiError(403, 'Passwords of demo accounts cannot be changed');
    if (!(await user.matchPassword(req.body.currentPassword))) {
      throw new ApiError(400, 'Current password is incorrect');
    }
    user.password = req.body.newPassword;
    await user.save();
    res.json({ message: 'Password updated' });
  }),
);

export default router;
