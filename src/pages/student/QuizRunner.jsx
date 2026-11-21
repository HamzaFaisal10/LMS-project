import { useState } from 'react';
import toast from 'react-hot-toast';
import { ArrowLeft, CheckCircle2, RotateCcw, Trophy, XCircle } from 'lucide-react';
import { useApi } from '../../hooks';
import { api } from '../../lib/api';
import { PageLoader, Spinner } from '../../components/ui';

export default function QuizRunner({ quizId, onBack, onFinished }) {
  const { data: quiz, loading } = useApi(`/quizzes/${quizId}`);
  const [answers, setAnswers] = useState({});
  const [result, setResult] = useState(null);
  const [busy, setBusy] = useState(false);

  if (loading) return <PageLoader />;

  const submit = async () => {
    if (Object.keys(answers).length < quiz.questions.length)
      return toast.error('Please answer every question');
    setBusy(true);
    try {
      const r = await api(`/quizzes/${quizId}/attempt`, {
        method: 'POST',
        body: { answers: quiz.questions.map((_, i) => answers[i]) },
      });
      setResult(r);
      onFinished?.();
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } catch (err) {
      toast.error(err.message);
    } finally {
      setBusy(false);
    }
  };

  const retry = () => {
    setAnswers({});
    setResult(null);
  };

  return (
    <div className="mx-auto max-w-3xl p-6">
      <button onClick={onBack} className="btn-ghost -ml-3">
        <ArrowLeft className="h-4 w-4" /> Back to lessons
      </button>
      <h1 className="mt-2 text-2xl font-extrabold">{quiz.title}</h1>
      <p className="text-sm text-slate-500">
        {quiz.questions.length} questions · Pass mark {quiz.passingScore}%
      </p>

      {result && (
        <div className={`mt-6 rounded-2xl p-6 ${result.passed ? 'bg-emerald-50' : 'bg-rose-50'}`}>
          <div className="flex items-center gap-4">
            <div
              className={`rounded-full p-3 ${result.passed ? 'bg-emerald-100 text-emerald-600' : 'bg-rose-100 text-rose-600'}`}
            >
              {result.passed ? <Trophy className="h-7 w-7" /> : <XCircle className="h-7 w-7" />}
            </div>
            <div>
              <p className="text-2xl font-extrabold">{result.score}%</p>
              <p
                className={`font-semibold ${result.passed ? 'text-emerald-700' : 'text-rose-700'}`}
              >
                {result.passed ? 'You passed — great job!' : 'Not quite — review and try again.'} (
                {result.correct}/{result.total} correct)
              </p>
            </div>
            <button onClick={retry} className="btn-secondary ml-auto">
              <RotateCcw className="h-4 w-4" /> Retake
            </button>
          </div>
        </div>
      )}

      <ol className="mt-6 space-y-5">
        {quiz.questions.map((q, i) => {
          const r = result?.results[i];
          return (
            <li key={q._id} className="card p-5">
              <p className="font-semibold">
                {i + 1}. {q.question}
              </p>
              <div className="mt-3 space-y-2">
                {q.options.map((opt, oi) => {
                  const chosen = answers[i] === oi;
                  let style = chosen
                    ? 'border-brand-500 bg-brand-50'
                    : 'border-slate-200 hover:bg-slate-50';
                  if (r)
                    style =
                      oi === r.correctIndex
                        ? 'border-emerald-500 bg-emerald-50'
                        : chosen
                          ? 'border-rose-400 bg-rose-50'
                          : 'border-slate-200 opacity-70';
                  return (
                    <button
                      key={oi}
                      disabled={!!result}
                      onClick={() => setAnswers({ ...answers, [i]: oi })}
                      className={`flex w-full items-center justify-between rounded-xl border px-4 py-3 text-left text-sm transition ${style}`}
                    >
                      {opt}
                      {r && oi === r.correctIndex && (
                        <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                      )}
                      {r && chosen && oi !== r.correctIndex && (
                        <XCircle className="h-4 w-4 text-rose-500" />
                      )}
                    </button>
                  );
                })}
              </div>
              {r?.explanation && (
                <p className="mt-3 rounded-lg bg-slate-50 px-3 py-2 text-sm text-slate-600">
                  💡 {r.explanation}
                </p>
              )}
            </li>
          );
        })}
      </ol>
      {!result && (
        <button onClick={submit} disabled={busy} className="btn-primary mt-6 w-full py-3">
          {busy && <Spinner className="h-4 w-4 text-white" />} Submit answers
        </button>
      )}
    </div>
  );
}
