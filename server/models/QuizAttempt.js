import mongoose from 'mongoose';

const attemptSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    quiz: { type: mongoose.Schema.Types.ObjectId, ref: 'Quiz', required: true, index: true },
    course: { type: mongoose.Schema.Types.ObjectId, ref: 'Course', required: true },
    answers: [Number],
    score: Number, // percentage
    passed: Boolean,
  },
  { timestamps: true },
);

export default mongoose.models.QuizAttempt || mongoose.model('QuizAttempt', attemptSchema);
