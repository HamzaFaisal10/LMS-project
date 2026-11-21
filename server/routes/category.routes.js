import { Router } from 'express';
import { z } from 'zod';
import Category from '../models/Category.js';
import Course from '../models/Course.js';
import { protect, authorize } from '../middleware/auth.js';
import { validate } from '../middleware/validate.js';
import { ApiError, asyncHandler } from '../utils/asyncHandler.js';
import { slugify } from '../utils/slugify.js';

const router = Router();

router.get(
  '/',
  asyncHandler(async (_req, res) => {
    const [categories, counts] = await Promise.all([
      Category.find().sort('name').lean(),
      Course.aggregate([
        { $match: { status: 'published' } },
        { $group: { _id: '$category', n: { $sum: 1 } } },
      ]),
    ]);
    const byId = Object.fromEntries(counts.map((c) => [String(c._id), c.n]));
    res.json(categories.map((c) => ({ ...c, courseCount: byId[String(c._id)] || 0 })));
  }),
);

router.post(
  '/',
  protect,
  authorize('admin'),
  validate(z.object({ name: z.string().trim().min(2).max(40), icon: z.string().optional() })),
  asyncHandler(async (req, res) => {
    const category = await Category.create({ ...req.body, slug: slugify(req.body.name) });
    res.status(201).json(category);
  }),
);

router.delete(
  '/:id',
  protect,
  authorize('admin'),
  asyncHandler(async (req, res) => {
    const inUse = await Course.exists({ category: req.params.id });
    if (inUse) throw new ApiError(400, 'This category still has courses');
    await Category.findByIdAndDelete(req.params.id);
    res.json({ message: 'Category deleted' });
  }),
);

export default router;
