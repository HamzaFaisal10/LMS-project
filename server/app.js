import express from 'express';
import helmet from 'helmet';
import cors from 'cors';
import rateLimit from 'express-rate-limit';
import mongoose from 'mongoose';
import { connectDB } from './config/db.js';
import { notFound, errorHandler } from './middleware/error.js';
import { ensureSeed } from './seed/ensureSeed.js';
import authRoutes from './routes/auth.routes.js';
import categoryRoutes from './routes/category.routes.js';
import courseRoutes from './routes/course.routes.js';
import enrollmentRoutes from './routes/enrollment.routes.js';
import learnRoutes from './routes/learn.routes.js';
import quizRoutes from './routes/quiz.routes.js';
import fileRoutes from './routes/file.routes.js';

const app = express();

app.set('trust proxy', 1);
app.use(helmet());
app.use(cors({ origin: process.env.CLIENT_ORIGIN || true, credentials: true }));
app.use(express.json({ limit: '1mb' }));
app.use(
  '/api',
  rateLimit({ windowMs: 60 * 1000, limit: 300, standardHeaders: true, legacyHeaders: false }),
);

// Ensure a database connection before any API handler runs (serverless-friendly).
app.use('/api', async (_req, _res, next) => {
  try {
    await connectDB();
    await ensureSeed();
    next();
  } catch (err) {
    next(err);
  }
});

app.get('/api/health', (_req, res) => {
  res.json({
    status: 'ok',
    db: mongoose.connection.readyState === 1 ? 'connected' : 'disconnected',
    time: new Date().toISOString(),
  });
});

app.use('/api/auth', authRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/courses', courseRoutes);
app.use('/api/enrollments', enrollmentRoutes);
app.use('/api/learn', learnRoutes);
app.use('/api/quizzes', quizRoutes);
app.use('/api/files', fileRoutes);

app.use('/api', notFound);
app.use(errorHandler);

export default app;
