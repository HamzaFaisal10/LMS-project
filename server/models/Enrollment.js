import mongoose from 'mongoose';

const enrollmentSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    course: { type: mongoose.Schema.Types.ObjectId, ref: 'Course', required: true, index: true },
    completedLessons: [{ type: mongoose.Schema.Types.ObjectId }],
    progress: { type: Number, default: 0 }, // 0-100
    lastLesson: { type: mongoose.Schema.Types.ObjectId },
    completedAt: Date,
    pricePaid: { type: Number, default: 0 },
  },
  { timestamps: true },
);

enrollmentSchema.index({ user: 1, course: 1 }, { unique: true });

export default mongoose.models.Enrollment || mongoose.model('Enrollment', enrollmentSchema);
