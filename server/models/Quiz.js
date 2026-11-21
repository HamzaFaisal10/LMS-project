import mongoose from 'mongoose';

const questionSchema = new mongoose.Schema({
  question: { type: String, required: true },
  options: { type: [String], validate: (v) => v.length >= 2 && v.length <= 6 },
  correctIndex: { type: Number, required: true },
  explanation: { type: String, default: '' },
});

const quizSchema = new mongoose.Schema(
  {
    course: { type: mongoose.Schema.Types.ObjectId, ref: 'Course', required: true, index: true },
    title: { type: String, required: true },
    passingScore: { type: Number, default: 70 },
    questions: [questionSchema],
  },
  { timestamps: true },
);

export default mongoose.models.Quiz || mongoose.model('Quiz', quizSchema);
