import { Router } from 'express';
import Course from '../models/Course.js';
import Category from '../models/Category.js';
import { optionalAuth } from '../middleware/auth.js';
import { ApiError, asyncHandler } from '../utils/asyncHandler.js';
import { courseAccess } from '../utils/access.js';

const router = Router();

const CARD_FIELDS =
  'title slug subtitle price level theme rating ratingCount studentsCount category instructor sections.lessons.duration publishedAt';

const escapeRegex = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

// Public catalog with search, filters, sorting and pagination.
router.get(
  '/',
  asyncHandler(async (req, res) => {
    const { q, category, level, price, sort = 'popular', page = 1, limit = 12 } = req.query;
    const filter = { status: 'published' };
    if (q) {
      const rx = new RegExp(escapeRegex(String(q).slice(0, 60)), 'i');
      filter.$or = [{ title: rx }, { subtitle: rx }];
    }
    if (category) {
      const cat = await Category.findOne({ slug: category });
      filter.category = cat?._id || null;
    }
    if (level) filter.level = level;
    if (price === 'free') filter.price = 0;
    if (price === 'paid') filter.price = { $gt: 0 };

    const sorts = {
      popular: { studentsCount: -1, ratingCount: -1 },
      rating: { rating: -1 },
      newest: { publishedAt: -1 },
      'price-low': { price: 1 },
      'price-high': { price: -1 },
    };
    const perPage = Math.min(48, Number(limit) || 12);
    const skip = (Math.max(1, Number(page)) - 1) * perPage;
    const [items, total] = await Promise.all([
      Course.find(filter)
        .select(CARD_FIELDS)
        .populate('instructor', 'name')
        .populate('category', 'name slug icon')
        .sort(sorts[sort] || sorts.popular)
        .skip(skip)
        .limit(perPage),
      Course.countDocuments(filter),
    ]);
    res.json({ items, total, page: Number(page), pages: Math.ceil(total / perPage) });
  }),
);

// Public course detail. Video links are only exposed for free-preview lessons.
router.get(
  '/:slug',
  optionalAuth,
  asyncHandler(async (req, res) => {
    const course = await Course.findOne({ slug: req.params.slug })
      .populate('instructor', 'name headline bio')
      .populate('category', 'name slug icon');
    if (!course) throw new ApiError(404, 'Course not found');
    const isOwner =
      req.user &&
      (String(course.instructor._id) === String(req.user._id) || req.user.role === 'admin');
    if (course.status !== 'published' && !isOwner) throw new ApiError(404, 'Course not found');

    const data = course.toJSON();
    data.sections = data.sections.map((s) => ({
      ...s,
      lessons: s.lessons.map((l) => ({
        _id: l._id,
        title: l.title,
        duration: l.duration,
        isPreview: l.isPreview,
        videoUrl: l.isPreview ? l.videoUrl : undefined,
        resourceCount: l.resources?.length || 0,
      })),
    }));
    data.instructorStats = await instructorStats(course.instructor._id);
    const { enrollment } = await courseAccess(req.user, course);
    data.isEnrolled = Boolean(enrollment);
    res.json(data);
  }),
);

async function instructorStats(instructorId) {
  const courses = await Course.find({ instructor: instructorId, status: 'published' })
    .select('studentsCount rating')
    .lean();
  const students = courses.reduce((n, c) => n + (c.studentsCount || 0), 0);
  const rating = courses.length
    ? courses.reduce((n, c) => n + (c.rating || 0), 0) / courses.length
    : 0;
  return { courses: courses.length, students, rating: Number(rating.toFixed(1)) };
}

export default router;
