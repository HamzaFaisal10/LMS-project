import Enrollment from '../models/Enrollment.js';

// Returns { enrollment, canManage } describing a user's access to a course.
export async function courseAccess(user, course) {
  if (!user) return { enrollment: null, canManage: false, canLearn: false };
  const canManage =
    user.role === 'admin' ||
    String(course.instructor?._id || course.instructor) === String(user._id);
  const enrollment = await Enrollment.findOne({ user: user._id, course: course._id });
  return { enrollment, canManage, canLearn: canManage || Boolean(enrollment) };
}

export function computeProgress(course, completedLessons) {
  const ids = new Set(course.sections.flatMap((s) => s.lessons.map((l) => String(l._id))));
  const done = completedLessons.filter((id) => ids.has(String(id)));
  return { done, progress: ids.size ? Math.round((done.length / ids.size) * 100) : 0 };
}
