import mongoose from 'mongoose';

const resourceSchema = new mongoose.Schema({
  name: { type: String, required: true },
  file: { type: mongoose.Schema.Types.ObjectId, ref: 'File', required: true },
  size: Number,
});

const lessonSchema = new mongoose.Schema({
  title: { type: String, required: true, trim: true },
  description: { type: String, default: '' },
  videoUrl: { type: String, default: '' }, // YouTube, Vimeo or direct MP4 link
  duration: { type: Number, default: 0 }, // minutes
  isPreview: { type: Boolean, default: false },
  resources: [resourceSchema],
});

const sectionSchema = new mongoose.Schema({
  title: { type: String, required: true, trim: true },
  lessons: [lessonSchema],
});

const courseSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true, maxlength: 120 },
    slug: { type: String, required: true, unique: true, index: true },
    subtitle: { type: String, default: '', maxlength: 200 },
    description: { type: String, default: '' },
    instructor: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    category: { type: mongoose.Schema.Types.ObjectId, ref: 'Category' },
    level: {
      type: String,
      enum: ['Beginner', 'Intermediate', 'Advanced', 'All levels'],
      default: 'All levels',
    },
    language: { type: String, default: 'English' },
    price: { type: Number, default: 0, min: 0 },
    theme: { type: Number, default: 0 }, // index of the generated thumbnail gradient
    outcomes: [String],
    requirements: [String],
    sections: [sectionSchema],
    status: {
      type: String,
      enum: ['draft', 'pending', 'published', 'rejected'],
      default: 'draft',
      index: true,
    },
    rejectionReason: { type: String, default: '' },
    rating: { type: Number, default: 0 },
    ratingCount: { type: Number, default: 0 },
    studentsCount: { type: Number, default: 0 },
    publishedAt: Date,
  },
  { timestamps: true },
);

courseSchema.index({ title: 'text', subtitle: 'text', description: 'text' });

courseSchema.virtual('lessonCount').get(function lessonCount() {
  return (this.sections || []).reduce((n, s) => n + s.lessons.length, 0);
});

courseSchema.virtual('totalMinutes').get(function totalMinutes() {
  return (this.sections || []).reduce(
    (n, s) => n + s.lessons.reduce((m, l) => m + (l.duration || 0), 0),
    0,
  );
});

courseSchema.set('toJSON', { virtuals: true });
courseSchema.set('toObject', { virtuals: true });

export default mongoose.models.Course || mongoose.model('Course', courseSchema);
