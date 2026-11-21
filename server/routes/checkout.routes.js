import { Router } from 'express';
import crypto from 'crypto';
import { z } from 'zod';
import Course from '../models/Course.js';
import Enrollment from '../models/Enrollment.js';
import Payment from '../models/Payment.js';
import { protect } from '../middleware/auth.js';
import { validate } from '../middleware/validate.js';
import { ApiError, asyncHandler } from '../utils/asyncHandler.js';

const router = Router();
router.use(protect);

// Demo payment processor modelled on Stripe test cards. No real money ever moves.
const DECLINED = new Set(['4000000000000002', '4000000000009995']);

const luhn = (num) => {
  let sum = 0;
  let dbl = false;
  for (let i = num.length - 1; i >= 0; i -= 1) {
    let d = Number(num[i]);
    if (dbl) {
      d *= 2;
      if (d > 9) d -= 9;
    }
    sum += d;
    dbl = !dbl;
  }
  return sum % 10 === 0;
};

const brandOf = (n) =>
  /^4/.test(n) ? 'Visa' : /^5[1-5]/.test(n) ? 'Mastercard' : /^3[47]/.test(n) ? 'Amex' : 'Card';

const schema = z.object({
  courseId: z.string().min(1),
  card: z.object({
    name: z.string().trim().min(2, 'Enter the name on the card'),
    number: z
      .string()
      .transform((s) => s.replace(/\s+/g, ''))
      .refine((s) => /^\d{13,19}$/.test(s), 'Enter a valid card number'),
    expiry: z.string().regex(/^(0[1-9]|1[0-2])\/\d{2}$/, 'Expiry must be MM/YY'),
    cvc: z.string().regex(/^\d{3,4}$/, 'Enter a valid CVC'),
  }),
});

router.post(
  '/',
  validate(schema),
  asyncHandler(async (req, res) => {
    const { courseId, card } = req.body;
    const course = await Course.findById(courseId);
    if (!course || course.status !== 'published') throw new ApiError(404, 'Course not found');
    if (await Enrollment.exists({ user: req.user._id, course: course._id })) {
      throw new ApiError(409, 'You already own this course');
    }

    const [mm, yy] = card.expiry.split('/').map(Number);
    if (new Date(2000 + yy, mm) < new Date()) throw new ApiError(400, 'Your card has expired');
    if (!luhn(card.number)) throw new ApiError(400, 'Your card number is invalid');

    const base = {
      user: req.user._id,
      course: course._id,
      instructor: course.instructor,
      amount: course.price,
      transactionId: `demo_${crypto.randomBytes(8).toString('hex')}`,
      cardBrand: brandOf(card.number),
      cardLast4: card.number.slice(-4),
    };

    if (DECLINED.has(card.number)) {
      await Payment.create({ ...base, status: 'failed' });
      throw new ApiError(402, 'Your card was declined. Try the test card 4242 4242 4242 4242.');
    }

    const payment = await Payment.create(base);
    const enrollment = await Enrollment.create({
      user: req.user._id,
      course: course._id,
      pricePaid: course.price,
    });
    await Course.updateOne({ _id: course._id }, { $inc: { studentsCount: 1 } });
    res.status(201).json({ payment, enrollment });
  }),
);

// The logged-in user's purchase history.
router.get(
  '/history',
  asyncHandler(async (req, res) => {
    const payments = await Payment.find({ user: req.user._id })
      .sort('-createdAt')
      .populate('course', 'title slug');
    res.json(payments);
  }),
);

export default router;
