import { Router } from 'express';
import Course from '../models/Course.js';
import Enrollment from '../models/Enrollment.js';
import { protect } from '../middleware/auth.js';
import { ApiError, asyncHandler } from '../utils/asyncHandler.js';

const router = Router();
router.use(protect);

// The student's enrolled courses with progress.
router.get(
  '/me',
  asyncHandler(async (req, res) => {
    const enrollments = await Enrollment.find({ user: req.user._id })
      .sort('-updatedAt')
      .populate({
        path: 'course',
        select:
          'title slug subtitle theme category instructor sections.lessons._id sections.lessons.duration',
        populate: [
          { path: 'instructor', select: 'name' },
          { path: 'category', select: 'name icon' },
        ],
      });
    res.json(enrollments.filter((e) => e.course));
  }),
);

// Enroll in a free course (paid courses go through /checkout).
router.post(
  '/:courseId',
  asyncHandler(async (req, res) => {
    const course = await Course.findById(req.params.courseId);
    if (!course || course.status !== 'published') throw new ApiError(404, 'Course not found');
    if (course.price > 0)
      throw new ApiError(402, 'This is a paid course — please complete checkout');
    const existing = await Enrollment.findOne({ user: req.user._id, course: course._id });
    if (existing) return res.json(existing);
    const enrollment = await Enrollment.create({ user: req.user._id, course: course._id });
    await Course.updateOne({ _id: course._id }, { $inc: { studentsCount: 1 } });
    res.status(201).json(enrollment);
  }),
);

export default router;
