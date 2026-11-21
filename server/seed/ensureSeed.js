import mongoose from 'mongoose';
import User from '../models/User.js';
import Category from '../models/Category.js';
import Course from '../models/Course.js';
import Quiz from '../models/Quiz.js';
import Enrollment from '../models/Enrollment.js';
import QuizAttempt from '../models/QuizAttempt.js';
import Payment from '../models/Payment.js';
import bcrypt from 'bcryptjs';
import { DEMO_ACCOUNTS, DEMO_PASSWORD } from './demoAccounts.js';
import { CATEGORIES, COURSES, EXTRA_INSTRUCTORS, QUIZZES, STUDENT_NAMES } from './data.js';
import { slugify } from '../utils/slugify.js';

let seeding = null;

// Seeds demo data the first time the API runs against an empty database.
export async function ensureSeed() {
  if (seeding) return seeding;
  seeding = (async () => {
    const exists = await User.exists({ email: DEMO_ACCOUNTS.admin.email });
    if (!exists) await seedAll();
  })().catch((err) => {
    seeding = null;
    throw err;
  });
  return seeding;
}

// Wipes every collection and restores the demo dataset (used by the daily cron).
export async function resetDemo() {
  const collections = await mongoose.connection.db.collections();
  await Promise.all(collections.map((c) => c.deleteMany({})));
  await seedAll();
  seeding = Promise.resolve();
}

export async function seedAll() {
  const users = {};
  for (const [key, account] of Object.entries(DEMO_ACCOUNTS)) {
    users[key] = await User.create({ ...account, password: DEMO_PASSWORD, isDemo: true });
  }
  users.sarah = users.instructor;
  for (const ins of EXTRA_INSTRUCTORS) {
    users[ins.key] = await User.create({
      ...ins,
      role: 'instructor',
      password: DEMO_PASSWORD,
      isDemo: true,
    });
  }

  const categories = await Category.insertMany(CATEGORIES);
  const catBySlug = Object.fromEntries(categories.map((c) => [c.slug, c._id]));

  const now = Date.now();
  const courses = await Course.insertMany(
    COURSES.map((c, i) => ({
      ...c,
      slug: slugify(c.title),
      instructor: users[c.instructor]._id,
      category: catBySlug[c.category],
      description: `${c.subtitle}. This course is packed with practical lessons, real-world projects and quizzes so you can apply everything you learn. By the end you will have the confidence and portfolio to take the next step in your career.`,
      status: c.status || 'published',
      publishedAt: c.status ? undefined : new Date(now - (i + 1) * 20 * 86400000),
    })),
  );

  await Quiz.insertMany(
    courses
      .filter((c) => QUIZZES[c.title])
      .map((c) => ({
        course: c._id,
        title: `${c.title.split(':')[0]} — Final Quiz`,
        passingScore: 70,
        questions: (QUIZZES[c.title] || []).map(
          ([question, options, correctIndex, explanation]) => ({
            question,
            options,
            correctIndex,
            explanation,
          }),
        ),
      })),
  );

  // Simulated learners with realistic enrollment history over the last 6 months.
  const hash = await bcrypt.hash(DEMO_PASSWORD, 10);
  const students = await User.insertMany(
    STUDENT_NAMES.map((name, i) => ({
      name,
      email: `${name.toLowerCase().replace(/\s+/g, '.')}@example.com`,
      password: hash,
      role: 'student',
      isDemo: true,
      createdAt: new Date(now - (180 - i * 5) * 86400000),
    })),
  );
  const rand = mulberry32(42);
  const enrollments = [];
  for (const student of students) {
    const picks = [...courses.filter((c) => c.status === 'published')]
      .sort(() => rand() - 0.5)
      .slice(0, 1 + Math.floor(rand() * 4));
    for (const course of picks) {
      // Skewed towards recent months so the revenue trend shows healthy growth.
      const createdAt = new Date(now - Math.floor((1 - rand() ** 0.75) * 175 + 1) * 86400000);
      enrollments.push(buildEnrollment(student, course, Math.floor(rand() * 101), createdAt));
    }
  }

  // The demo student's own learning, so the dashboard feels lived-in.
  const bySlug = Object.fromEntries(courses.map((c) => [c.slug, c]));
  const mine = [
    ['the-complete-mern-stack-bootcamp', 45, 6],
    ['modern-javascript-es6-to-es2024', 100, 30],
    ['uiux-design-masterclass-with-figma', 0, 2],
  ];
  for (const [slug, pct, daysAgo] of mine) {
    if (bySlug[slug])
      enrollments.push(
        buildEnrollment(users.student, bySlug[slug], pct, new Date(now - daysAgo * 86400000)),
      );
  }
  await Enrollment.insertMany(enrollments);

  // Matching demo payments for every paid enrollment (powers revenue charts).
  const courseById = Object.fromEntries(courses.map((c) => [String(c._id), c]));
  await Payment.insertMany(
    enrollments
      .filter((e) => e.pricePaid > 0)
      .map((e, i) => ({
        user: e.user,
        course: e.course,
        instructor: courseById[String(e.course)].instructor,
        amount: e.pricePaid,
        status: 'paid',
        transactionId: `demo_seed_${String(i).padStart(5, '0')}`,
        cardBrand: i % 3 === 0 ? 'Mastercard' : 'Visa',
        cardLast4: i % 3 === 0 ? '4444' : '4242',
        createdAt: e.createdAt,
        updatedAt: e.createdAt,
      })),
  );

  const quizByCourse = Object.fromEntries(
    (await Quiz.find().lean()).map((q) => [String(q.course), q]),
  );
  const jsQuiz = quizByCourse[String(bySlug['modern-javascript-es6-to-es2024']?._id)];
  if (jsQuiz) {
    await QuizAttempt.create({
      user: users.student._id,
      quiz: jsQuiz._id,
      course: jsQuiz.course,
      answers: jsQuiz.questions.map((q) => q.correctIndex),
      score: 100,
      passed: true,
    });
  }

  // Course counters: real enrollments on top of the course's historical audience.
  for (const course of courses) {
    const count = enrollments.filter((e) => String(e.course) === String(course._id)).length;
    await Course.updateOne({ _id: course._id }, { studentsCount: course.ratingCount * 3 + count });
  }

  return { users, categories, courses, students, enrollments };
}

function buildEnrollment(user, course, pct, createdAt) {
  const lessonIds = course.sections.flatMap((s) => s.lessons.map((l) => l._id));
  const done = lessonIds.slice(0, Math.round((lessonIds.length * pct) / 100));
  const progress = lessonIds.length ? Math.round((done.length / lessonIds.length) * 100) : 0;
  return {
    user: user._id,
    course: course._id,
    completedLessons: done,
    progress,
    lastLesson: done[done.length - 1] || lessonIds[0],
    completedAt: progress === 100 ? createdAt : undefined,
    pricePaid: course.price,
    createdAt,
    updatedAt: createdAt,
  };
}

// Small deterministic PRNG so every reset produces the same demo data.
function mulberry32(seed) {
  let a = seed;
  return () => {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
