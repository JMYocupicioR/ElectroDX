import { useEffect, useMemo, useState } from 'react';
import { ClipboardList, ChevronLeft, ChevronRight, Send } from 'lucide-react';
import { useAuth } from '../../contexts/AuthProvider';
import { useSettingsStore } from '../../stores/settingsStore';
import {
  getAttemptCountForQuiz,
  getQuizWithQuestions,
  submitQuizAttempt,
} from '../../services/quizService';
import { shuffleOptions, shuffleQuestions } from '../../utils/quizScoring';
import { localizeQuizQuestion } from '../../utils/quizLocalization';
import type { QuizAnswerRecord, QuizTopicFlag, QuizWithQuestions } from '../../types/quiz';
import { QuizResults } from './QuizResults';

export function QuizPlayer({
  topicId,
  quizFlag: _quizFlag,
}: {
  topicId: string;
  moduleId: string;
  quizFlag: QuizTopicFlag;
}) {
  const { user } = useAuth();
  const lang = useSettingsStore((s) => s.language);
  const [quiz, setQuiz] = useState<QuizWithQuestions | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [step, setStep] = useState(0);
  const [responses, setResponses] = useState<Record<string, string[]>>({});
  const [startedAt] = useState(Date.now());
  const [submitted, setSubmitted] = useState<{
    score: number;
    passed: boolean;
    answers: QuizAnswerRecord[];
  } | null>(null);
  const [attemptBlocked, setAttemptBlocked] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    getQuizWithQuestions(topicId)
      .then(async (data) => {
        if (cancelled) return;
        if (!data) {
          setError(lang === 'en' ? 'Could not load quiz.' : 'No se pudo cargar el cuestionario.');
          return;
        }
        if (user && data.max_attempts != null) {
          const count = await getAttemptCountForQuiz(data.id, user.id);
          if (count >= data.max_attempts) {
            setAttemptBlocked(
              lang === 'en'
                ? `Maximum of ${data.max_attempts} attempt(s) reached.`
                : `Has alcanzado el máximo de ${data.max_attempts} intento(s).`
            );
          }
        }
        setQuiz(data);
      })
      .catch((e) => {
        if (!cancelled) setError(e instanceof Error ? e.message : 'Error al cargar');
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [topicId, user, lang]);

  const displayQuestions = useMemo(() => {
    if (!quiz) return [];
    const ordered = shuffleQuestions(quiz.questions, quiz.shuffle_questions);
    return ordered.map((q) =>
      localizeQuizQuestion(
        {
          ...q,
          options: shuffleOptions(q.options, quiz.shuffle_options),
        },
        lang
      )
    );
  }, [quiz, lang]);

  const current = displayQuestions[step];

  const toggleOption = (questionId: string, optionId: string, multiple: boolean) => {
    setResponses((prev) => {
      const currentSelected = prev[questionId] ?? [];
      if (multiple) {
        const next = currentSelected.includes(optionId)
          ? currentSelected.filter((id) => id !== optionId)
          : [...currentSelected, optionId];
        return { ...prev, [questionId]: next };
      }
      return { ...prev, [questionId]: [optionId] };
    });
  };

  const handleSubmit = async () => {
    if (!quiz || !user) return;
    const unanswered = displayQuestions.filter((q) => !(responses[q.id]?.length));
    if (unanswered.length > 0) {
      setError(
        lang === 'en'
          ? `Answer all questions (${unanswered.length} remaining).`
          : `Responde todas las preguntas (${unanswered.length} pendiente(s)).`
      );
      return;
    }

    const durationSeconds = Math.round((Date.now() - startedAt) / 1000);

    try {
      const attempt = await submitQuizAttempt({
        topicId,
        durationSeconds,
        answers: displayQuestions.map((q) => ({
          questionId: q.id,
          selectedIds: responses[q.id] ?? [],
        })),
      });
      setSubmitted({
        score: attempt.score,
        passed: attempt.passed,
        answers: attempt.answers,
      });
      setError(null);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Error al guardar el intento');
    }
  };

  if (loading) {
    return (
      <section className="mt-10 p-6 rounded-2xl border border-slate-200 dark:border-slate-700">
        <p className="text-sm text-slate-500">
          {lang === 'en' ? 'Loading assessment…' : 'Cargando evaluación…'}
        </p>
      </section>
    );
  }

  if (attemptBlocked) {
    return (
      <section className="mt-10 p-6 rounded-2xl border border-amber-200 dark:border-amber-800 bg-amber-50/50 dark:bg-amber-950/20">
        <p className="text-sm text-amber-800 dark:text-amber-200">{attemptBlocked}</p>
      </section>
    );
  }

  if (!quiz) {
    return (
      <section className="mt-10 p-6 rounded-2xl border border-red-200 dark:border-red-800">
        <p className="text-sm text-red-600">{error ?? (lang === 'en' ? 'Quiz unavailable.' : 'Cuestionario no disponible.')}</p>
      </section>
    );
  }

  if (submitted) {
    return (
      <QuizResults
        quiz={quiz}
        displayQuestions={displayQuestions}
        result={submitted}
        responses={responses}
      />
    );
  }

  return (
    <section className="mt-10 rounded-2xl border border-indigo-200/60 dark:border-indigo-800/40 bg-white/80 dark:bg-slate-900/60 overflow-hidden">
      <div className="px-6 py-4 border-b border-slate-200/60 dark:border-slate-700/40 bg-indigo-50/50 dark:bg-indigo-950/20">
        <div className="flex items-center gap-2 mb-1">
          <ClipboardList className="w-5 h-5 text-indigo-500" />
          <h2 className="text-lg font-bold text-slate-900 dark:text-white">
            {quiz.title ?? (lang === 'en' ? 'Topic assessment' : 'Evaluación del tema')}
          </h2>
        </div>
        <p className="text-xs text-slate-500">
          {lang === 'en' ? 'Question' : 'Pregunta'} {step + 1} {lang === 'en' ? 'of' : 'de'}{' '}
          {displayQuestions.length} · {lang === 'en' ? 'Pass' : 'Aprobación'}: {quiz.pass_score}%
        </p>
      </div>

      {current && (
        <div className="p-6 space-y-4">
          <p className="font-medium text-slate-900 dark:text-white">{current.stem}</p>
          {current.image_url && (
            <img
              src={current.image_url}
              alt={current.image_alt ?? ''}
              className="max-h-64 rounded-xl border border-slate-200 dark:border-slate-700"
            />
          )}
          <div className="space-y-2">
            {current.options.map((opt) => {
              const selected = (responses[current.id] ?? []).includes(opt.id);
              const inputType = current.type === 'multiple' ? 'checkbox' : 'radio';
              return (
                <label
                  key={opt.id}
                  className={`flex items-center gap-3 p-3 rounded-xl border cursor-pointer transition ${
                    selected
                      ? 'border-indigo-400 bg-indigo-50 dark:bg-indigo-950/30'
                      : 'border-slate-200 dark:border-slate-700 hover:border-indigo-300'
                  }`}
                >
                  <input
                    type={inputType}
                    name={`q-${current.id}`}
                    checked={selected}
                    onChange={() =>
                      toggleOption(current.id, opt.id, current.type === 'multiple')
                    }
                  />
                  <span className="text-sm text-slate-700 dark:text-slate-200">{opt.text}</span>
                </label>
              );
            })}
          </div>
        </div>
      )}

      {error && <p className="px-6 pb-2 text-sm text-red-600">{error}</p>}

      <div className="px-6 py-4 border-t border-slate-200/60 dark:border-slate-700/40 flex flex-wrap items-center justify-between gap-2">
        <button
          type="button"
          disabled={step === 0}
          onClick={() => setStep((s) => s - 1)}
          className="inline-flex items-center gap-1 px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 text-sm disabled:opacity-40"
        >
          <ChevronLeft className="w-4 h-4" /> {lang === 'en' ? 'Previous' : 'Anterior'}
        </button>

        {step < displayQuestions.length - 1 ? (
          <button
            type="button"
            onClick={() => setStep((s) => s + 1)}
            className="inline-flex items-center gap-1 px-4 py-2 rounded-lg bg-indigo-600 text-white text-sm"
          >
            {lang === 'en' ? 'Next' : 'Siguiente'} <ChevronRight className="w-4 h-4" />
          </button>
        ) : (
          <button
            type="button"
            onClick={handleSubmit}
            className="inline-flex items-center gap-1 px-4 py-2 rounded-lg bg-emerald-600 text-white text-sm font-medium"
          >
            <Send className="w-4 h-4" /> {lang === 'en' ? 'Submit' : 'Enviar evaluación'}
          </button>
        )}
      </div>
    </section>
  );
}
