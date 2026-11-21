import mongoose from 'mongoose';
import User from '../models/User.js';
import Category from '../models/Category.js';
import Course from '../models/Course.js';
import { DEMO_ACCOUNTS, DEMO_PASSWORD } from './demoAccounts.js';
import { CATEGORIES, COURSES, EXTRA_INSTRUCTORS } from './data.js';
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
  // Shared password hash keeps seeding fast on serverless.
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
      status: 'published',
      publishedAt: new Date(now - (i + 1) * 20 * 86400000),
    })),
  );

  return { users, categories, courses };
}
