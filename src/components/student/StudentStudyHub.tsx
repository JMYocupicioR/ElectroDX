import { useEffect, useMemo, useState } from 'react';
import { Bookmark, NotebookPen, RefreshCw, FileText, MessageCircle, Calendar, Target, AlertTriangle, BarChart3 } from 'lucide-react';
import {
  buildCalendarUrls,
  createFlashcard,
  createQaThread,
  listBookmarks,
  listDueFlashcards,
  listEmgReports,
  listQaReplies,
  listQaThreads,
  replyQaThread,
  reviewFlashcard,
  submitEmgReport,
  type EmgReportSubmission,
  type Flashcard,
  type LessonBookmark,
  type QaReply,
  type QaThread,
} from '../../services/studentToolsService';
import { portalCopy } from '../../i18n/portal';
import { useSettingsStore } from '../../stores/settingsStore';
import type { ModuleQuizProgress, QuizAttempt } from '../../types/quiz';
import type { StudentLearningPlan } from '../../types/studentPlan';
import { getTopicPublicUrl } from '../../utils/adminUtils';

export function StudentStudyHub({
  attempts = [],
  moduleProgress = [],
  plans = [],
}: {
  attempts?: QuizAttempt[];
  moduleProgress?: ModuleQuizProgress[];
  plans?: StudentLearningPlan[];
}) {
  const lang = useSettingsStore((s) => s.language);
  const copy = lang === 'en' ? portalCopy.en : portalCopy.es;
  const [error, setError] = useState<string | null>(null);
  const [bookmarks, setBookmarks] = useState<LessonBookmark[]>([]);
  const [cards, setCards] = useState<Flashcard[]>([]);
  const [threads, setThreads] = useState<QaThread[]>([]);
  const [reports, setReports] = useState<EmgReportSubmission[]>([]);
  const [reportTitle, setReportTitle] = useState('');
  const [reportText, setReportText] = useState('');
  const [reportUrl, setReportUrl] = useState('');
  const [qaTitle, setQaTitle] = useState('');
  const [qaBody, setQaBody] = useState('');
  const [qaCohort, setQaCohort] = useState(false);
  const [front, setFront] = useState('');
  const [back, setBack] = useState('');
  const [revealedCard, setRevealedCard] = useState<string | null>(null);
  const [openThread, setOpenThread] = useState<string | null>(null);
  const [replies, setReplies] = useState<Record<string, QaReply[]>>({});
  const [replyDraft, setReplyDraft] = useState('');

  const reload = async () => {
    setError(null);
    try {
      const [b, c, t, r] = await Promise.all([
        listBookmarks(),
        listDueFlashcards(),
        listQaThreads(),
        listEmgReports(),
      ]);
      setBookmarks(b);
      setCards(c);
      setThreads(t);
      setReports(r);
    } catch (e) {
      setError(e instanceof Error ? e.message : copy.loadError);
    }
  };

  useEffect(() => {
    void reload();
    // eslint-disable-next-line react-hooks/exhaustive-deps -- carga inicial
  }, []);

  const errorNotebook = useMemo(() => {
    const misses: { moduleId: string; topicId: string; questionId: string; at: string }[] = [];
    for (const attempt of attempts) {
      for (const answer of attempt.answers ?? []) {
        if (!answer.correct) {
          misses.push({
            moduleId: attempt.module_id,
            topicId: attempt.topic_id,
            questionId: answer.questionId,
            at: attempt.completed_at,
          });
        }
      }
    }
    return misses.slice(0, 12);
  }, [attempts]);

  const strengths = useMemo(() => {
    return [...moduleProgress]
      .filter((m) => typeof m.averageScore === 'number')
      .sort((a, b) => (b.averageScore ?? 0) - (a.averageScore ?? 0))
      .slice(0, 6);
  }, [moduleProgress]);

  const calendar = buildCalendarUrls({
    title: 'Sesión ElectroDx / estudio EMG',
    details: 'Bloque de estudio y laboratorio',
    startIso: new Date(Date.now() + 86400000).toISOString(),
    endIso: new Date(Date.now() + 86400000 + 3600000).toISOString(),
  });

  return (
    <div className="space-y-6">
      {error && (
        <div className="p-3 rounded-xl bg-red-50 text-red-700 text-sm" role="alert">
          {error}{' '}
          <button type="button" className="underline font-semibold" onClick={() => void reload()}>
            {copy.retry}
          </button>
        </div>
      )}

      <section className="p-5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900">
        <h3 className="font-bold flex items-center gap-2 mb-3">
          <Target className="w-4 h-4" /> {lang === 'en' ? 'Personalized plans' : 'Planes personalizados'}
        </h3>
        {plans.length === 0 ? (
          <p className="text-sm text-slate-500">{copy.empty}</p>
        ) : (
          <ul className="space-y-2 text-sm">
            {plans.map((plan) => (
              <li key={plan.id} className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800">
                <p className="font-semibold">{plan.title}</p>
                {plan.description && <p className="text-xs text-slate-500 mt-1">{plan.description}</p>}
                {plan.target_date && (
                  <p className="text-xs text-slate-400 mt-1">
                    {lang === 'en' ? 'Target' : 'Meta'}: {plan.target_date}
                  </p>
                )}
                {plan.weekly_goal_minutes ? (
                  <p className="text-xs text-slate-400">
                    {plan.weekly_goal_minutes} {lang === 'en' ? 'min / week' : 'min / semana'}
                  </p>
                ) : null}
              </li>
            ))}
          </ul>
        )}
      </section>

      <section className="p-5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900">
        <h3 className="font-bold flex items-center gap-2 mb-3">
          <BarChart3 className="w-4 h-4" /> {lang === 'en' ? 'Strengths by module' : 'Fortalezas por módulo'}
        </h3>
        {strengths.length === 0 ? (
          <p className="text-sm text-slate-500">{copy.empty}</p>
        ) : (
          <ul className="space-y-2 text-sm">
            {strengths.map((item) => (
              <li key={item.moduleId} className="flex justify-between gap-3">
                <span>{item.moduleTitle}</span>
                <span className="font-semibold">{item.averageScore}%</span>
              </li>
            ))}
          </ul>
        )}
      </section>

      <section className="p-5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900">
        <h3 className="font-bold flex items-center gap-2 mb-3">
          <AlertTriangle className="w-4 h-4" /> {lang === 'en' ? 'Error notebook' : 'Cuaderno de errores'}
        </h3>
        {errorNotebook.length === 0 ? (
          <p className="text-sm text-slate-500">{copy.empty}</p>
        ) : (
          <ul className="space-y-2 text-sm">
            {errorNotebook.map((item) => (
              <li key={`${item.topicId}-${item.questionId}-${item.at}`}>
                <a className="text-blue-600 underline" href={getTopicPublicUrl(item.moduleId, item.topicId) ?? '#'}>
                  {item.topicId}
                </a>
              </li>
            ))}
          </ul>
        )}
      </section>

      <section className="p-5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900">
        <h3 className="font-bold flex items-center gap-2 mb-3">
          <Bookmark className="w-4 h-4" /> {lang === 'en' ? 'Bookmarks' : 'Marcadores'}
        </h3>
        {bookmarks.length === 0 ? (
          <p className="text-sm text-slate-500">{copy.empty}</p>
        ) : (
          <ul className="space-y-2 text-sm">
            {bookmarks.map((b) => (
              <li key={b.id}>
                <a className="text-blue-600 underline" href={b.url}>
                  {b.title || b.topic_id}
                </a>
              </li>
            ))}
          </ul>
        )}
      </section>

      <section className="p-5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900">
        <h3 className="font-bold flex items-center gap-2 mb-3">
          <RefreshCw className="w-4 h-4" /> {copy.review}
        </h3>
        <form
          className="grid gap-2 sm:grid-cols-2 mb-4"
          onSubmit={async (e) => {
            e.preventDefault();
            try {
              await createFlashcard({ topicId: 'general', front, back });
              setFront('');
              setBack('');
              await reload();
            } catch (err) {
              setError(err instanceof Error ? err.message : copy.submitError);
            }
          }}
        >
          <label className="text-xs font-semibold">
            Anverso
            <input className="mt-1 w-full min-h-[44px] rounded-lg border px-3 dark:bg-slate-800" value={front} onChange={(e) => setFront(e.target.value)} required />
          </label>
          <label className="text-xs font-semibold">
            Reverso
            <input className="mt-1 w-full min-h-[44px] rounded-lg border px-3 dark:bg-slate-800" value={back} onChange={(e) => setBack(e.target.value)} required />
          </label>
          <button type="submit" className="sm:col-span-2 min-h-[44px] rounded-xl bg-blue-600 text-white font-semibold">
            Añadir tarjeta
          </button>
        </form>
        {cards.length === 0 ? (
          <p className="text-sm text-slate-500">{copy.empty}</p>
        ) : (
          <ul className="space-y-3">
            {cards.map((card) => {
              const revealed = revealedCard === card.id;
              return (
                <li key={card.id} className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800">
                  <p className="font-semibold text-sm">{card.front}</p>
                  {revealed ? (
                    <>
                      <p className="text-xs text-slate-500 mt-2">{card.back}</p>
                      <div className="flex flex-wrap gap-2 mt-2">
                        {([
                          [1, 'Otra vez'],
                          [3, 'Difícil'],
                          [4, 'Bien'],
                          [5, 'Fácil'],
                        ] as const).map(([quality, label]) => (
                          <button
                            key={quality}
                            type="button"
                            className="min-h-[44px] px-3 rounded-lg bg-slate-200 dark:bg-slate-700 text-xs"
                            onClick={() =>
                              void reviewFlashcard(card.id, quality).then(() => {
                                setRevealedCard(null);
                                return reload();
                              })
                            }
                          >
                            {label}
                          </button>
                        ))}
                      </div>
                    </>
                  ) : (
                    <button
                      type="button"
                      className="mt-2 min-h-[44px] px-3 rounded-lg bg-blue-600 text-white text-xs"
                      onClick={() => setRevealedCard(card.id)}
                    >
                      Revelar
                    </button>
                  )}
                </li>
              );
            })}
          </ul>
        )}
      </section>

      <section className="p-5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900">
        <h3 className="font-bold flex items-center gap-2 mb-3">
          <FileText className="w-4 h-4" /> {copy.reports}
        </h3>
        <form
          className="space-y-2"
          onSubmit={async (e) => {
            e.preventDefault();
            try {
              await submitEmgReport({ title: reportTitle, interpretation: reportText, fileUrl: reportUrl || undefined });
              setReportTitle('');
              setReportText('');
              setReportUrl('');
              await reload();
            } catch (err) {
              setError(err instanceof Error ? err.message : copy.submitError);
            }
          }}
        >
          <input className="w-full min-h-[44px] rounded-lg border px-3 dark:bg-slate-800" placeholder="Título del reporte" value={reportTitle} onChange={(e) => setReportTitle(e.target.value)} required />
          <input className="w-full min-h-[44px] rounded-lg border px-3 dark:bg-slate-800" placeholder="Enlace al archivo (Drive, PDF)" value={reportUrl} onChange={(e) => setReportUrl(e.target.value)} />
          <textarea className="w-full rounded-lg border px-3 py-2 dark:bg-slate-800" rows={4} placeholder="Interpretación estructurada" value={reportText} onChange={(e) => setReportText(e.target.value)} required />
          <button type="submit" className="min-h-[44px] px-4 rounded-xl bg-blue-600 text-white font-semibold">
            Entregar reporte
          </button>
        </form>
        {reports.length > 0 && (
          <ul className="mt-4 space-y-2 text-sm">
            {reports.map((report) => (
              <li key={report.id} className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800">
                <span className="font-semibold">{report.title}</span>
                <span className="ml-2 text-xs uppercase text-slate-400">{report.status}</span>
                {report.feedback && <p className="text-xs text-slate-500 mt-1">{report.feedback}</p>}
                {report.rubric && Object.keys(report.rubric).length > 0 && (
                  <ul className="mt-2 text-xs text-slate-500 space-y-0.5">
                    {Object.entries(report.rubric).map(([key, value]) => (
                      <li key={key}>
                        {key}: {String(value)}
                      </li>
                    ))}
                  </ul>
                )}
                {typeof report.rubric_score === 'number' && (
                  <p className="text-xs font-semibold mt-1">Rúbrica: {report.rubric_score}/100</p>
                )}
              </li>
            ))}
          </ul>
        )}
      </section>

      <section className="p-5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900">
        <h3 className="font-bold flex items-center gap-2 mb-3">
          <MessageCircle className="w-4 h-4" /> {copy.qa}
        </h3>
        <form
          className="space-y-2 mb-4"
          onSubmit={async (e) => {
            e.preventDefault();
            try {
              await createQaThread({
                title: qaTitle,
                body: qaBody,
                visibility: qaCohort ? 'cohort' : 'private',
              });
              setQaTitle('');
              setQaBody('');
              await reload();
            } catch (err) {
              setError(err instanceof Error ? err.message : copy.submitError);
            }
          }}
        >
          <input className="w-full min-h-[44px] rounded-lg border px-3 dark:bg-slate-800" placeholder="Asunto" value={qaTitle} onChange={(e) => setQaTitle(e.target.value)} required />
          <textarea className="w-full rounded-lg border px-3 py-2 dark:bg-slate-800" rows={3} placeholder="Pregunta clínica (será moderada por el docente)" value={qaBody} onChange={(e) => setQaBody(e.target.value)} required />
          <label className="flex items-center gap-2 text-xs">
            <input type="checkbox" checked={qaCohort} onChange={(e) => setQaCohort(e.target.checked)} />
            Visible para la cohorte
          </label>
          <button type="submit" className="min-h-[44px] px-4 rounded-xl bg-blue-600 text-white font-semibold">
            Enviar pregunta
          </button>
        </form>
        {threads.length === 0 ? (
          <p className="text-sm text-slate-500">{copy.empty}</p>
        ) : (
          <ul className="space-y-2 text-sm">
            {threads.map((th) => (
              <li key={th.id} className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800">
                <button
                  type="button"
                  className="w-full text-left"
                  onClick={async () => {
                    const next = openThread === th.id ? null : th.id;
                    setOpenThread(next);
                    if (next && !replies[th.id]) {
                      const rows = await listQaReplies(th.id);
                      setReplies((prev) => ({ ...prev, [th.id]: rows }));
                    }
                  }}
                >
                  <span className="font-semibold">{th.title}</span>
                  <span className="ml-2 text-xs uppercase text-slate-400">{th.status}</span>
                  {th.visibility === 'cohort' && (
                    <span className="ml-2 text-[10px] uppercase text-indigo-500">Cohorte</span>
                  )}
                </button>
                <p className="text-xs text-slate-500 mt-1">{th.body}</p>
                {openThread === th.id && (
                  <div className="mt-3 space-y-2">
                    {(replies[th.id] ?? []).map((reply) => (
                      <p key={reply.id} className="text-xs p-2 rounded-lg bg-white dark:bg-slate-900">
                        {reply.body}
                      </p>
                    ))}
                    <form
                      className="flex gap-2"
                      onSubmit={async (e) => {
                        e.preventDefault();
                        if (!replyDraft.trim()) return;
                        const saved = await replyQaThread(th.id, replyDraft.trim());
                        setReplies((prev) => ({ ...prev, [th.id]: [...(prev[th.id] ?? []), saved] }));
                        setReplyDraft('');
                      }}
                    >
                      <input
                        className="flex-1 min-h-[44px] rounded-lg border px-3 dark:bg-slate-900"
                        placeholder="Responder"
                        value={replyDraft}
                        onChange={(e) => setReplyDraft(e.target.value)}
                      />
                      <button type="submit" className="min-h-[44px] px-3 rounded-lg bg-blue-600 text-white text-xs">
                        Enviar
                      </button>
                    </form>
                  </div>
                )}
              </li>
            ))}
          </ul>
        )}
      </section>

      <section className="p-5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900">
        <h3 className="font-bold flex items-center gap-2 mb-3">
          <Calendar className="w-4 h-4" /> {copy.calendar}
        </h3>
        <div className="flex flex-wrap gap-2">
          <a className="min-h-[44px] px-4 rounded-xl bg-blue-50 text-blue-700 inline-flex items-center font-semibold" href={calendar.google} target="_blank" rel="noreferrer">
            Google Calendar
          </a>
          <a className="min-h-[44px] px-4 rounded-xl bg-blue-50 text-blue-700 inline-flex items-center font-semibold" href={calendar.outlook} target="_blank" rel="noreferrer">
            Outlook
          </a>
          <a className="min-h-[44px] px-4 rounded-xl bg-blue-50 text-blue-700 inline-flex items-center font-semibold" href={calendar.ics} download="electodx.ics">
            ICS
          </a>
        </div>
      </section>

      <p className="text-xs text-slate-400 flex items-center gap-1">
        <NotebookPen className="w-3.5 h-3.5" />
        Los apuntes por lección se guardan dentro de cada tema del temario.
      </p>
    </div>
  );
}
