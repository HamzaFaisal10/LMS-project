import { Router } from 'express';
import Course from '../models/Course.js';
import Quiz from '../models/Quiz.js';
import QuizAttempt from '../models/QuizAttempt.js';
import { protect } from '../middleware/auth.js';
import { ApiError, asyncHandler } from '../utils/asyncHandler.js';
import { courseAccess, computeProgress } from '../utils/access.js';

const router = Router();
router.use(protect);

async function loadCourse(req) {
  const course = await Course.findById(req.params.courseId).populate('instructor', 'name headline');
  if (!course) throw new ApiError(404, 'Course not found');
  const access = await courseAccess(req.user, course);
  if (!access.canLearn) throw new ApiError(403, 'Enroll in this course to access its lessons');
  return { course, ...access };
}

// Full course content for the lesson player.
router.get(
  '/:courseId',
  asyncHandler(async (req, res) => {
    const { course, enrollment, canManage } = await loadCourse(req);
    const quizzes = await Quiz.find({ course: course._id })
      .select('title passingScore questions._id')
      .lean();
    const attempts = await QuizAttempt.find({ user: req.user._id, course: course._id })
      .sort('-score')
      .lean();
    res.json({
      course,
      enrollment,
      canManage,
      quizzes: quizzes.map((q) => {
        const best = attempts.find((a) => String(a.quiz) === String(q._id));
        return {
          _id: q._id,
          title: q.title,
          passingScore: q.passingScore,
          questionCount: q.questions.length,
          bestScore: best?.score ?? null,
          passed: Boolean(best?.passed),
        };
      }),
    });
  }),
);

// Toggle a lesson's completion and recompute progress.
router.post(
  '/:courseId/lessons/:lessonId/complete',
  asyncHandler(async (req, res) => {
    const { course, enrollment } = await loadCourse(req);
    if (!enrollment) return res.json({ preview: true });
    const id = req.params.lessonId;
    const has = enrollment.completedLessons.some((l) => String(l) === id);
    const wanted = req.body?.completed ?? !has;
    let list = enrollment.completedLessons.map(String).filter((l) => l !== id);
    if (wanted) list.push(id);
    const { done, progress } = computeProgress(course, list);
    enrollment.completedLessons = done;
    enrollment.progress = progress;
    enrollment.lastLesson = id;
    if (progress === 100 && !enrollment.completedAt) enrollment.completedAt = new Date();
    if (progress < 100) enrollment.completedAt = undefined;
    await enrollment.save();
    res.json(enrollment);
  }),
);

// Remember the last opened lesson ("continue where you left off").
router.post(
  '/:courseId/lessons/:lessonId/open',
  asyncHandler(async (req, res) => {
    const { enrollment } = await loadCourse(req);
    if (enrollment) {
      enrollment.lastLesson = req.params.lessonId;
      await enrollment.save();
    }
    res.json({ ok: true });
  }),
);

export default router;
