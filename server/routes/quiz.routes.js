import { Router } from 'express';
import { z } from 'zod';
import Course from '../models/Course.js';
import Quiz from '../models/Quiz.js';
import QuizAttempt from '../models/QuizAttempt.js';
import { protect } from '../middleware/auth.js';
import { validate } from '../middleware/validate.js';
import { ApiError, asyncHandler } from '../utils/asyncHandler.js';
import { courseAccess } from '../utils/access.js';

const router = Router();
router.use(protect);

async function loadQuiz(req) {
  const quiz = await Quiz.findById(req.params.id);
  if (!quiz) throw new ApiError(404, 'Quiz not found');
  const course = await Course.findById(quiz.course).select('instructor title');
  const access = await courseAccess(req.user, course);
  if (!access.canLearn) throw new ApiError(403, 'Enroll in this course to take the quiz');
  return { quiz, course, ...access };
}

// Quiz for taking: correct answers are never sent before submitting.
router.get(
  '/:id',
  asyncHandler(async (req, res) => {
    const { quiz, course } = await loadQuiz(req);
    const attempts = await QuizAttempt.find({ user: req.user._id, quiz: quiz._id })
      .sort('-createdAt')
      .limit(5)
      .lean();
    res.json({
      _id: quiz._id,
      title: quiz.title,
      passingScore: quiz.passingScore,
      course: { _id: course._id, title: course.title },
      questions: quiz.questions.map((q) => ({
        _id: q._id,
        question: q.question,
        options: q.options,
      })),
      attempts,
    });
  }),
);

router.post(
  '/:id/attempt',
  validate(z.object({ answers: z.array(z.number().int().min(-1)) })),
  asyncHandler(async (req, res) => {
    const { quiz } = await loadQuiz(req);
    const { answers } = req.body;
    const results = quiz.questions.map((q, i) => ({
      questionId: q._id,
      selected: answers[i] ?? -1,
      correctIndex: q.correctIndex,
      correct: answers[i] === q.correctIndex,
      explanation: q.explanation,
    }));
    const correct = results.filter((r) => r.correct).length;
    const score = Math.round((correct / quiz.questions.length) * 100);
    const passed = score >= quiz.passingScore;
    const attempt = await QuizAttempt.create({
      user: req.user._id,
      quiz: quiz._id,
      course: quiz.course,
      answers,
      score,
      passed,
    });
    res
      .status(201)
      .json({ attempt, score, passed, correct, total: quiz.questions.length, results });
  }),
);

export default router;
