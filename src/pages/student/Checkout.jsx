import { useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import toast from 'react-hot-toast';
import { CheckCircle2, CreditCard, Info, Lock, ShieldCheck } from 'lucide-react';
import { useApi } from '../../hooks';
import { api } from '../../lib/api';
import CourseThumb from '../../components/CourseThumb';
import { EmptyState, PageLoader, Spinner } from '../../components/ui';
import { money } from '../../lib/format';

const fmtCard = (v) =>
  v
    .replace(/\D/g, '')
    .slice(0, 16)
    .replace(/(.{4})/g, '$1 ')
    .trim();
const fmtExp = (v) => {
  const d = v.replace(/\D/g, '').slice(0, 4);
  return d.length > 2 ? `${d.slice(0, 2)}/${d.slice(2)}` : d;
};

export default function Checkout() {
  const { slug } = useParams();
  const navigate = useNavigate();
  const { data: course, loading, error } = useApi(`/courses/${slug}`);
  const [card, setCard] = useState({ name: '', number: '', expiry: '', cvc: '' });
  const [busy, setBusy] = useState(false);
  const [paid, setPaid] = useState(null);

  if (loading) return <PageLoader />;
  if (error)
    return (
      <div className="container-page py-16">
        <EmptyState title="Course not found" />
      </div>
    );
  if (course.isEnrolled && !paid) {
    return (
      <div className="container-page py-16">
        <EmptyState
          icon={CheckCircle2}
          title="You already own this course"
          action={
            <Link to={`/learn/${course._id}`} className="btn-primary">
              Go to course
            </Link>
          }
        />
      </div>
    );
  }

  const fillTest = () =>
    setCard({ name: 'Alex Carter', number: '4242 4242 4242 4242', expiry: '12/30', cvc: '123' });

  const pay = async (e) => {
    e.preventDefault();
    setBusy(true);
    try {
      const r = await api('/checkout', { method: 'POST', body: { courseId: course._id, card } });
      setPaid(r.payment);
      window.scrollTo({ top: 0 });
      toast.success('Payment successful!');
    } catch (err) {
      toast.error(err.message);
    } finally {
      setBusy(false);
    }
  };

  if (paid) {
    return (
      <div className="container-page max-w-lg py-16">
        <div className="card p-8 text-center">
          <div className="mx-auto mb-4 inline-flex rounded-full bg-emerald-50 p-4 text-emerald-600">
            <CheckCircle2 className="h-10 w-10" />
          </div>
          <h1 className="text-2xl font-extrabold">You&apos;re in! 🎉</h1>
          <p className="mt-2 text-slate-500">
            Payment of <b>{money(paid.amount)}</b> confirmed. You now have lifetime access to{' '}
            <b>{course.title}</b>.
          </p>
          <div className="mt-5 rounded-xl bg-slate-50 p-4 text-left text-sm text-slate-600">
            <p>
              Transaction: <span className="font-mono text-xs">{paid.transactionId}</span>
            </p>
            <p>
              Card: {paid.cardBrand} •••• {paid.cardLast4}
            </p>
          </div>
          <button
            onClick={() => navigate(`/learn/${course._id}`)}
            className="btn-primary mt-6 w-full py-3"
          >
            Start learning now
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="container-page py-10">
      <h1 className="text-3xl font-extrabold">Checkout</h1>
      <div className="mt-8 grid gap-8 lg:grid-cols-[1fr_380px]">
        <form onSubmit={pay} className="card p-6">
          <div className="mb-5 flex items-start gap-3 rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900">
            <Info className="mt-0.5 h-4 w-4 shrink-0" />
            <div>
              <b>Demo mode</b> — no real payment is taken. Use test card{' '}
              <span className="font-mono">4242 4242 4242 4242</span>, any future date and any CVC.
              Card <span className="font-mono">4000 0000 0000 0002</span> simulates a decline.
              <button
                type="button"
                onClick={fillTest}
                className="mt-2 block font-semibold text-amber-900 underline"
              >
                Fill test card details
              </button>
            </div>
          </div>
          <h2 className="flex items-center gap-2 text-lg font-bold">
            <CreditCard className="h-5 w-5" /> Payment details
          </h2>
          <div className="mt-4 space-y-4">
            <div>
              <label className="label">Name on card</label>
              <input
                required
                className="input"
                value={card.name}
                onChange={(e) => setCard({ ...card, name: e.target.value })}
                placeholder="Alex Carter"
              />
            </div>
            <div>
              <label className="label">Card number</label>
              <input
                required
                inputMode="numeric"
                className="input font-mono"
                value={card.number}
                onChange={(e) => setCard({ ...card, number: fmtCard(e.target.value) })}
                placeholder="4242 4242 4242 4242"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="label">Expiry</label>
                <input
                  required
                  className="input font-mono"
                  value={card.expiry}
                  onChange={(e) => setCard({ ...card, expiry: fmtExp(e.target.value) })}
                  placeholder="MM/YY"
                />
              </div>
              <div>
                <label className="label">CVC</label>
                <input
                  required
                  inputMode="numeric"
                  className="input font-mono"
                  value={card.cvc}
                  onChange={(e) =>
                    setCard({ ...card, cvc: e.target.value.replace(/\D/g, '').slice(0, 4) })
                  }
                  placeholder="123"
                />
              </div>
            </div>
          </div>
          <button disabled={busy} className="btn-primary mt-6 w-full py-3 text-base">
            {busy ? <Spinner className="h-4 w-4 text-white" /> : <Lock className="h-4 w-4" />} Pay{' '}
            {money(course.price)}
          </button>
          <p className="mt-3 flex items-center justify-center gap-1.5 text-xs text-slate-500">
            <ShieldCheck className="h-3.5 w-3.5" /> Secure checkout · Stripe-style demo processor
          </p>
        </form>

        <aside className="card h-fit overflow-hidden">
          <CourseThumb course={course} className="aspect-video" />
          <div className="p-5">
            <p className="font-bold">{course.title}</p>
            <p className="text-sm text-slate-500">{course.instructor.name}</p>
            <div className="mt-4 space-y-2 border-t border-slate-100 pt-4 text-sm">
              <div className="flex justify-between">
                <span className="text-slate-500">Original price</span>
                <span>{money(course.price)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Tax</span>
                <span>$0.00</span>
              </div>
              <div className="flex justify-between border-t border-slate-100 pt-2 text-base font-bold">
                <span>Total</span>
                <span>{money(course.price)}</span>
              </div>
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}
