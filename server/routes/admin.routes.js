import { Router } from 'express';
import { z } from 'zod';
import User from '../models/User.js';
import Course from '../models/Course.js';
import Enrollment from '../models/Enrollment.js';
import Payment from '../models/Payment.js';
import { protect, authorize } from '../middleware/auth.js';
import { validate } from '../middleware/validate.js';
import { ApiError, asyncHandler } from '../utils/asyncHandler.js';
import { monthlySeries, sum } from '../utils/stats.js';

const router = Router();
router.use(protect, authorize('admin'));

const escapeRegex = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

router.get(
  '/stats',
  asyncHandler(async (_req, res) => {
    const [users, courses, enrollments, payments, recentUsers, pending] = await Promise.all([
      User.find().select('role createdAt').lean(),
      Course.find().select('status').lean(),
      Enrollment.countDocuments(),
      Payment.find({ status: 'paid' }).select('amount createdAt').lean(),
      User.find().sort('-createdAt').limit(6).select('name email role createdAt'),
      Course.find({ status: 'pending' })
        .sort('-updatedAt')
        .limit(5)
        .select('title slug updatedAt')
        .populate('instructor', 'name'),
    ]);
    const count = (arr, key, val) => arr.filter((x) => x[key] === val).length;
    res.json({
      totals: {
        users: users.length,
        students: count(users, 'role', 'student'),
        instructors: count(users, 'role', 'instructor'),
        courses: courses.length,
        published: count(courses, 'status', 'published'),
        pending: count(courses, 'status', 'pending'),
        enrollments,
        revenue: sum(payments, (p) => p.amount),
        orders: payments.length,
      },
      monthly: monthlySeries(payments),
      recentUsers,
      pending,
    });
  }),
);

router.get(
  '/users',
  asyncHandler(async (req, res) => {
    const { q, role } = req.query;
    const filter = {};
    if (role) filter.role = role;
    if (q) {
      const rx = new RegExp(escapeRegex(String(q).slice(0, 60)), 'i');
      filter.$or = [{ name: rx }, { email: rx }];
    }
    res.json(await User.find(filter).sort('-createdAt').limit(200));
  }),
);

router.patch(
  '/users/:id',
  validate(
    z.object({
      role: z.enum(['student', 'instructor', 'admin']).optional(),
      isBlocked: z.boolean().optional(),
    }),
  ),
  asyncHandler(async (req, res) => {
    const user = await User.findById(req.params.id);
    if (!user) throw new ApiError(404, 'User not found');
    if (String(user._id) === String(req.user._id))
      throw new ApiError(400, 'You cannot change your own account here');
    if (
      user.isDemo &&
      ['student@learnhub.dev', 'instructor@learnhub.dev', 'admin@learnhub.dev'].includes(user.email)
    ) {
      throw new ApiError(400, 'The shared demo accounts are protected so everyone can use them');
    }
    Object.assign(user, req.body);
    await user.save();
    res.json(user);
  }),
);

router.get(
  '/courses',
  asyncHandler(async (req, res) => {
    const filter = req.query.status ? { status: req.query.status } : {};
    const courses = await Course.find(filter)
      .sort('-updatedAt')
      .select('-description')
      .populate('instructor', 'name email')
      .populate('category', 'name icon');
    res.json(courses);
  }),
);

router.post(
  '/courses/:id/approve',
  asyncHandler(async (req, res) => {
    const course = await Course.findById(req.params.id);
    if (!course) throw new ApiError(404, 'Course not found');
    course.status = 'published';
    course.rejectionReason = '';
    course.publishedAt = course.publishedAt || new Date();
    await course.save();
    res.json(course);
  }),
);

router.post(
  '/courses/:id/reject',
  validate(
    z.object({ reason: z.string().trim().min(3, 'Please give the instructor a reason').max(500) }),
  ),
  asyncHandler(async (req, res) => {
    const course = await Course.findById(req.params.id);
    if (!course) throw new ApiError(404, 'Course not found');
    course.status = 'rejected';
    course.rejectionReason = req.body.reason;
    await course.save();
    res.json(course);
  }),
);

router.get(
  '/payments',
  asyncHandler(async (req, res) => {
    const filter = req.query.status ? { status: req.query.status } : {};
    const payments = await Payment.find(filter)
      .sort('-createdAt')
      .limit(300)
      .populate('user', 'name email')
      .populate('course', 'title slug');
    res.json(payments);
  }),
);

export default router;
