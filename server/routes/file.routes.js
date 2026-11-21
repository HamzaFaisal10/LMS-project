import { Router } from 'express';
import File from '../models/File.js';
import Course from '../models/Course.js';
import { protect } from '../middleware/auth.js';
import { ApiError, asyncHandler } from '../utils/asyncHandler.js';
import { courseAccess } from '../utils/access.js';

const router = Router();

// Download a lesson resource (enrolled students, the instructor and admins only).
router.get(
  '/:id',
  protect,
  asyncHandler(async (req, res) => {
    const file = await File.findById(req.params.id).select('+data');
    if (!file) throw new ApiError(404, 'File not found');
    if (file.course) {
      const course = await Course.findById(file.course).select('instructor');
      const { canLearn } = await courseAccess(req.user, course);
      if (!canLearn) throw new ApiError(403, 'Enroll in this course to download its resources');
    }
    res.setHeader('Content-Type', file.mimeType);
    res.setHeader('Content-Disposition', `attachment; filename="${encodeURIComponent(file.name)}"`);
    res.send(file.data);
  }),
);

export default router;
