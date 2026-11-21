import mongoose from 'mongoose';

const paymentSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    course: { type: mongoose.Schema.Types.ObjectId, ref: 'Course', required: true, index: true },
    instructor: { type: mongoose.Schema.Types.ObjectId, ref: 'User', index: true },
    amount: { type: Number, required: true },
    currency: { type: String, default: 'USD' },
    status: { type: String, enum: ['paid', 'failed', 'refunded'], default: 'paid' },
    provider: { type: String, default: 'demo' },
    transactionId: { type: String, required: true },
    cardBrand: String,
    cardLast4: String,
  },
  { timestamps: true },
);

export default mongoose.models.Payment || mongoose.model('Payment', paymentSchema);
