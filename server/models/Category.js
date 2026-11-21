import mongoose from 'mongoose';

const categorySchema = new mongoose.Schema(
  {
    name: { type: String, required: true, unique: true, trim: true },
    slug: { type: String, required: true, unique: true },
    icon: { type: String, default: 'BookOpen' }, // lucide icon name used by the UI
  },
  { timestamps: true },
);

export default mongoose.models.Category || mongoose.model('Category', categorySchema);
