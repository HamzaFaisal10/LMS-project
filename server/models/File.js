import mongoose from 'mongoose';

// Small downloadable resources (PDFs etc.) stored directly in MongoDB.
const fileSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    mimeType: { type: String, required: true },
    size: Number,
    data: { type: Buffer, required: true, select: false },
    owner: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    course: { type: mongoose.Schema.Types.ObjectId, ref: 'Course' },
  },
  { timestamps: true },
);

export default mongoose.models.File || mongoose.model('File', fileSchema);
