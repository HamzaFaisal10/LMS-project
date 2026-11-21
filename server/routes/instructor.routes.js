import { Router } from 'express';
import multer from 'multer';
import { z } from 'zod';
import mongoose from 'mongoose';
import Course from '../models/Course.js';
import Enrollment from '../models/Enrollment.js';
import Payment from '../models/Payment.js';
import Quiz from '../models/Quiz.js';
import File from '../models/File.js';
import { protect, authorize } from '../middleware/auth.js';
import { validate } from '../middleware/validate.js';
import { ApiError, asyncHandler } from '../utils/asyncHandler.js';
import { slugify } from '../utils/slugify.js';
import { monthlySeries, sum } from '../utils/stats.js';

const router = Router();
router.use(protect, authorize('instructor', 'admin'));

async function ownCourse(req) {
  const course = await Course.findById(req.params.id);
  if (!course) throw new ApiError(404, 'Course not found');
  if (req.user.role !== 'admin' && String(course.instructor) !== String(req.user._id)) {
    throw new ApiError(403, 'This is not your course');
  }
  return course;
}

async function uniqueSlug(title, excludeId) {
  const base = slugify(title) || 'course';
  let slug = base;
  for (let i = 2; await Course.exists({ slug, _id: { $ne: excludeId } }); i += 1)
    slug = `${base}-${i}`;
  return slug;
}

// Dashboard overview: totals, revenue trend and best-selling courses.
router.get(
  '/stats',
  asyncHandler(async (req, res) => {
    const courses = await Course.find({ instructor: req.user._id }).select(
      'title slug status rating studentsCount price theme',
    );
    const ids = courses.map((c) => c._id);
    const [enrollments, payments] = await Promise.all([
      Enrollment.find({ course: { $in: ids } })
        .select('user course progress createdAt')
        .lean(),
      Payment.find({ course: { $in: ids }, status: 'paid' })
        .select('course amount createdAt')
        .lean(),
    ]);
    const published = courses.filter((c) => c.status === 'published');
    const perCourse = courses
      .map((c) => ({
        _id: c._id,
        title: c.title,
        slug: c.slug,
        status: c.status,
        students: enrollments.filter((e) => String(e.course) === String(c._id)).length,
        revenue: sum(
          payments.filter((p) => String(p.course) === String(c._id)),
          (p) => p.amount,
        ),
      }))
      .sort((a, b) => b.revenue - a.revenue);
    const thirtyDays = Date.now() - 30 * 86400000;
    res.json({
      totals: {
        courses: courses.length,
        published: published.length,
        students: new Set(enrollments.map((e) => String(e.user))).size,
        enrollments: enrollments.length,
        revenue: sum(payments, (p) => p.amount),
        revenue30d: sum(
          payments.filter((p) => new Date(p.createdAt) > thirtyDays),
          (p) => p.amount,
        ),
        rating: published.length
          ? Number((published.reduce((n, c) => n + c.rating, 0) / published.length).toFixed(1))
          : 0,
        completionRate: enrollments.length
          ? Math.round(
              (enrollments.filter((e) => e.progress === 100).length / enrollments.length) * 100,
            )
          : 0,
      },
      monthly: monthlySeries(payments),
      courses: perCourse,
    });
  }),
);

router.get(
  '/courses',
  asyncHandler(async (req, res) => {
    const courses = await Course.find({ instructor: req.user._id })
      .sort('-updatedAt')
      .populate('category', 'name icon')
      .select('-description');
    const ids = courses.map((c) => c._id);
    const [enrollCounts, payments] = await Promise.all([
      Enrollment.find({ course: { $in: ids } })
        .select('course')
        .lean(),
      Payment.find({ course: { $in: ids }, status: 'paid' })
        .select('course amount')
        .lean(),
    ]);
    res.json(
      courses.map((c) => ({
        ...c.toJSON(),
        enrollments: enrollCounts.filter((e) => String(e.course) === String(c._id)).length,
        revenue: sum(
          payments.filter((p) => String(p.course) === String(c._id)),
          (p) => p.amount,
        ),
      })),
    );
  }),
);

const detailsSchema = z.object({
  title: z.string().trim().min(5, 'Title must be at least 5 characters').max(120),
  subtitle: z.string().trim().max(200).optional().default(''),
  description: z.string().trim().max(5000).optional().default(''),
  category: z.string().min(1, 'Choose a category'),
  level: z.enum(['Beginner', 'Intermediate', 'Advanced', 'All levels']).default('All levels'),
  language: z.string().trim().max(30).optional().default('English'),
  price: z.coerce.number().min(0).max(999),
  theme: z.coerce.number().int().min(0).max(7).optional().default(0),
  outcomes: z.array(z.string().trim().min(1)).max(12).optional().default([]),
  requirements: z.array(z.string().trim().min(1)).max(12).optional().default([]),
});

router.post(
  '/courses',
  validate(
    detailsSchema
      .partial({ subtitle: true, description: true })
      .extend({ price: z.coerce.number().min(0).max(999).default(0) }),
  ),
  asyncHandler(async (req, res) => {
    const course = await Course.create({
      ...req.body,
      slug: await uniqueSlug(req.body.title),
      instructor: req.user._id,
      status: 'draft',
      sections: [{ title: 'Introduction', lessons: [] }],
    });
    res.status(201).json(course);
  }),
);

router.get(
  '/courses/:id',
  asyncHandler(async (req, res) => {
    const course = await ownCourse(req);
    await course.populate('sections.lessons.resources.file', 'name size mimeType');
    const quiz = await Quiz.findOne({ course: course._id });
    res.json({ course, quiz });
  }),
);

router.put(
  '/courses/:id',
  validate(detailsSchema),
  asyncHandler(async (req, res) => {
    const course = await ownCourse(req);
    if (req.body.title !== course.title) course.slug = await uniqueSlug(req.body.title, course._id);
    Object.assign(course, req.body);
    await course.save();
    res.json(course);
  }),
);

const id = z
  .string()
  .regex(/^[a-f\d]{24}$/i)
  .optional();
const curriculumSchema = z.object({
  sections: z
    .array(
      z.object({
        _id: id,
        title: z.string().trim().min(1, 'Every section needs a title').max(120),
        lessons: z.array(
          z.object({
            _id: id,
            title: z.string().trim().min(1, 'Every lesson needs a title').max(150),
            description: z.string().max(3000).optional().default(''),
            videoUrl: z.string().trim().max(500).optional().default(''),
            duration: z.coerce.number().min(0).max(600).optional().default(0),
            isPreview: z.boolean().optional().default(false),
            resources: z
              .array(
                z.object({
                  name: z.string(),
                  file: z.string().regex(/^[a-f\d]{24}$/i),
                  size: z.number().optional(),
                }),
              )
              .optional()
              .default([]),
          }),
        ),
      }),
    )
    .max(50),
});

router.put(
  '/courses/:id/curriculum',
  validate(curriculumSchema),
  asyncHandler(async (req, res) => {
    const course = await ownCourse(req);
    course.sections = req.body.sections;
    await course.save();
    await course.populate('sections.lessons.resources.file', 'name size mimeType');
    res.json(course);
  }),
);

const quizSchema = z.object({
  title: z.string().trim().min(3).max(120),
  passingScore: z.coerce.number().int().min(1).max(100).default(70),
  questions: z
    .array(
      z.object({
        question: z.string().trim().min(3, 'Every question needs text'),
        options: z.array(z.string().trim().min(1, 'Options cannot be empty')).min(2).max(6),
        correctIndex: z.number().int().min(0),
        explanation: z.string().trim().max(500).optional().default(''),
      }),
    )
    .min(1, 'Add at least one question')
    .max(50),
});

router.put(
  '/courses/:id/quiz',
  validate(quizSchema),
  asyncHandler(async (req, res) => {
    const course = await ownCourse(req);
    for (const q of req.body.questions) {
      if (q.correctIndex >= q.options.length)
        throw new ApiError(400, 'Each question needs a valid correct answer');
    }
    const quiz = await Quiz.findOneAndUpdate(
      { course: course._id },
      { ...req.body, course: course._id },
      { upsert: true, new: true },
    );
    res.json(quiz);
  }),
);

router.delete(
  '/courses/:id/quiz',
  asyncHandler(async (req, res) => {
    const course = await ownCourse(req);
    await Quiz.deleteOne({ course: course._id });
    res.json({ message: 'Quiz removed' });
  }),
);

// Send a course to admins for review before it goes live.
router.post(
  '/courses/:id/submit',
  asyncHandler(async (req, res) => {
    const course = await ownCourse(req);
    if (course.lessonCount === 0)
      throw new ApiError(400, 'Add at least one lesson before submitting');
    if (course.status === 'published') throw new ApiError(400, 'This course is already live');
    course.status = 'pending';
    course.rejectionReason = '';
    await course.save();
    res.json(course);
  }),
);

router.post(
  '/courses/:id/unpublish',
  asyncHandler(async (req, res) => {
    const course = await ownCourse(req);
    course.status = 'draft';
    await course.save();
    res.json(course);
  }),
);

router.delete(
  '/courses/:id',
  asyncHandler(async (req, res) => {
    const course = await ownCourse(req);
    if (await Enrollment.exists({ course: course._id })) {
      throw new ApiError(
        400,
        'Courses with enrolled students cannot be deleted — unpublish it instead',
      );
    }
    await Promise.all([
      Quiz.deleteMany({ course: course._id }),
      File.deleteMany({ course: course._id }),
      course.deleteOne(),
    ]);
    res.json({ message: 'Course deleted' });
  }),
);

// Resource uploads (stored in MongoDB, max 2 MB, documents and images only).
const ALLOWED = /pdf|zip|msword|officedocument|text\/plain|image\/(png|jpe?g)/;
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 2 * 1024 * 1024 },
  fileFilter: (_req, file, cb) =>
    ALLOWED.test(file.mimetype)
      ? cb(null, true)
      : cb(new ApiError(400, 'Only PDF, DOC, ZIP, TXT or image files are allowed')),
});

router.post(
  '/courses/:id/files',
  upload.single('file'),
  asyncHandler(async (req, res) => {
    const course = await ownCourse(req);
    if (!req.file) throw new ApiError(400, 'No file uploaded');
    const file = await File.create({
      name: req.file.originalname,
      mimeType: req.file.mimetype,
      size: req.file.size,
      data: req.file.buffer,
      owner: req.user._id,
      course: course._id,
    });
    res
      .status(201)
      .json({ _id: file._id, name: file.name, size: file.size, mimeType: file.mimeType });
  }),
);

// Students enrolled across the instructor's courses.
router.get(
  '/students',
  asyncHandler(async (req, res) => {
    const courses = await Course.find({ instructor: req.user._id }).select('_id');
    const filter = { course: { $in: courses.map((c) => c._id) } };
    if (req.query.course && mongoose.isValidObjectId(req.query.course))
      filter.course = req.query.course;
    const enrollments = await Enrollment.find(filter)
      .sort('-createdAt')
      .limit(500)
      .populate('user', 'name email')
      .populate('course', 'title');
    res.json(enrollments.filter((e) => e.user && e.course));
  }),
);

export default router;
