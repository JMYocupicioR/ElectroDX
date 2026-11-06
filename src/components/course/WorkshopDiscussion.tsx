import { useCallback, useEffect, useMemo, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import {
  CheckCircle2,
  Clock,
  Lock,
  MessageCircle,
  Play,
  RotateCcw,
  Send,
  Trash2,
  X,
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthProvider';
import type { LiveWorkshop } from '../../types/database';
import { formatVideoTime } from '../../utils/videoProgressTracker';
import {
  createWorkshopThread,
  deleteQaReply,
  deleteQaThread,
  listQaRepliesForThreads,
  listWorkshopDiscussionDirectory,
  listWorkshopThreads,
  replyQaThread,
  updateQaThreadStatus,
  type QaReply,
  type QaThread,
  type TopicDiscussionAuthor,
} from '../../services/studentToolsService';

function formatWhen(iso: string): string {
  return new Date(iso).toLocaleString('es-MX', {
    day: 'numeric',
    month: 'short',
    hour: '2-digit',
    minute: '2-digit',
  });
}

function statusBadge(status: QaThread['status']) {
  if (status === 'answered') {
    return (
      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-emerald-100 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800/50">
        <CheckCircle2 className="w-3 h-3" /> Respondida
      </span>
    );
  }
  if (status === 'closed') {
    return (
      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-400">
        <Lock className="w-3 h-3" /> Cerrada
      </span>
    );
  }
  return (
    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-sky-100 dark:bg-sky-950/40 text-sky-700 dark:text-sky-300 border border-sky-200 dark:border-sky-800/50">
      Abierta
    </span>
  );
}

interface WorkshopDiscussionProps {
  workshop: LiveWorkshop;
  className?: string;
}

export function WorkshopDiscussion({ workshop, className = '' }: WorkshopDiscussionProps) {
  const location = useLocation();
  const { user, isAdmin, isEditor } = useAuth();
  const isStaff = isAdmin || isEditor;
  const pageUrl = `${location.pathname}${location.search}#clase-comentarios`;

  const [threads, setThreads] = useState<QaThread[]>([]);
  const [replies, setReplies] = useState<Record<string, QaReply[]>>({});
  const [authors, setAuthors] = useState<Record<string, TopicDiscussionAuthor>>({});
  const [draft, setDraft] = useState('');
  const [attachedSecond, setAttachedSecond] = useState<number | null>(null);
  const [liveVideoSecond, setLiveVideoSecond] = useState<number | null>(null);
  const [replyDrafts, setReplyDrafts] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);
  const [posting, setPosting] = useState(false);
  const [replyingId, setReplyingId] = useState<string | null>(null);
  const [saved, setSaved] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Detectar y actualizar el segundo actual del video en reproducción
  useEffect(() => {
    const handleTick = (e: Event) => {
      const detail = (e as CustomEvent<{ currentTime: number }>).detail;
      if (typeof detail?.currentTime === 'number' && Number.isFinite(detail.currentTime)) {
        setLiveVideoSecond(Math.floor(detail.currentTime));
      }
    };
    window.addEventListener('neurosafe:video-tick', handleTick);

    // Leer valor inicial si el reproductor ya estaba activo
    if (typeof (window as any).__NEUROSAFE_CURRENT_VIDEO_TIME__ === 'number') {
      setLiveVideoSecond(Math.floor((window as any).__NEUROSAFE_CURRENT_VIDEO_TIME__));
    }

    return () => {
      window.removeEventListener('neurosafe:video-tick', handleTick);
    };
  }, []);

  const authorName = useCallback(
    (userId: string) => {
      if (userId === user?.id) return 'Tú';
      return authors[userId]?.display_name || 'Médico cursista';
    },
    [authors, user?.id]
  );

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [rows, directory] = await Promise.all([
        listWorkshopThreads(workshop.id),
        listWorkshopDiscussionDirectory(workshop.id).catch(() => [] as TopicDiscussionAuthor[]),
      ]);
      const replyRows = await listQaRepliesForThreads(rows.map((row) => row.id));
      const grouped: Record<string, QaReply[]> = {};
      for (const reply of replyRows) {
        grouped[reply.thread_id] = [...(grouped[reply.thread_id] ?? []), reply];
      }
      setThreads(rows);
      setReplies(grouped);
      setAuthors(Object.fromEntries(directory.map((row) => [row.user_id, row])));
    } catch (e) {
      setError(e instanceof Error ? e.message : 'No se pudieron cargar las dudas de esta clase.');
    } finally {
      setLoading(false);
    }
  }, [workshop.id]);

  useEffect(() => {
    void load();
  }, [load]);

  // Scroll automático si la URL trae el ancla #clase-comentarios
  useEffect(() => {
    if (location.hash !== '#clase-comentarios' || loading) return;
    const el = document.getElementById('clase-comentarios');
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }, [location.hash, loading]);

  const canReply = useMemo(() => Boolean(user), [user]);

  async function handlePublish() {
    if (!draft.trim() || posting) return;
    setPosting(true);
    setError(null);
    try {
      const savedThread = await createWorkshopThread({
        body: draft.trim(),
        workshopId: workshop.id,
        moduleId: workshop.module_id,
        topicId: workshop.topic_id,
        pageUrl,
        videoSecond: attachedSecond,
      });
      setThreads((prev) => [savedThread, ...prev]);
      setDraft('');
      setAttachedSecond(null);
      setSaved('Duda publicada correctamente');
      setTimeout(() => setSaved(null), 4000);
      if (user) {
        setAuthors((prev) => ({
          ...prev,
          [user.id]: prev[user.id] ?? { user_id: user.id, display_name: 'Tú', is_staff: isStaff },
        }));
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : 'No se pudo publicar la duda');
    } finally {
      setPosting(false);
    }
  }

  async function handleReply(threadId: string) {
    const body = (replyDrafts[threadId] ?? '').trim();
    if (!body || replyingId) return;
    setReplyingId(threadId);
    setError(null);
    try {
      const savedReply = await replyQaThread(threadId, body);
      setReplies((prev) => ({ ...prev, [threadId]: [...(prev[threadId] ?? []), savedReply] }));
      setReplyDrafts((prev) => ({ ...prev, [threadId]: '' }));
      setSaved('Respuesta enviada');
      setTimeout(() => setSaved(null), 3000);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'No se pudo responder');
    } finally {
      setReplyingId(null);
    }
  }

  async function handleDeleteThread(thread: QaThread) {
    if (!window.confirm('¿Deseas eliminar esta duda y sus respuestas?')) return;
    try {
      await deleteQaThread(thread.id);
      setThreads((prev) => prev.filter((row) => row.id !== thread.id));
      setReplies((prev) => {
        const next = { ...prev };
        delete next[thread.id];
        return next;
      });
    } catch (e) {
      setError(e instanceof Error ? e.message : 'No se pudo borrar');
    }
  }

  async function handleDeleteReply(reply: QaReply) {
    if (!window.confirm('¿Deseas eliminar esta respuesta?')) return;
    try {
      await deleteQaReply(reply.id);
      setReplies((prev) => ({
        ...prev,
        [reply.thread_id]: (prev[reply.thread_id] ?? []).filter((row) => row.id !== reply.id),
      }));
    } catch (e) {
      setError(e instanceof Error ? e.message : 'No se pudo borrar la respuesta');
    }
  }

  async function handleStatus(thread: QaThread, status: QaThread['status']) {
    try {
      const savedThread = await updateQaThreadStatus(thread.id, status);
      setThreads((prev) => prev.map((row) => (row.id === thread.id ? savedThread : row)));
    } catch (e) {
      setError(e instanceof Error ? e.message : 'No se pudo actualizar el estado');
    }
  }

  function handleSeekToSecond(second: number) {
    window.dispatchEvent(
      new CustomEvent('neurosafe:seek-video', {
        detail: { second },
      })
    );
    const playerEl = document.getElementById('tracked-live-player');
    if (playerEl) {
      playerEl.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  }

  return (
    <section
      id="clase-comentarios"
      className={`p-4 sm:p-6 lg:p-7 rounded-2xl border border-slate-200/90 dark:border-slate-800 bg-white dark:bg-slate-900/70 shadow-sm transition-all ${className}`}
    >
      {/* ─── ENCABEZADO ─── */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pb-4 border-b border-slate-100 dark:border-slate-800">
        <div>
          <h2 className="text-base sm:text-lg font-bold flex items-center gap-2 text-slate-900 dark:text-white">
            <span className="p-1.5 rounded-lg bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400">
              <MessageCircle className="w-4 h-4" />
            </span>
            Dudas y discusión de esta clase
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Espacio de debate para la cohorte y los profesores. Puedes vincular el minuto exacto del video.
          </p>
        </div>
        <span className="inline-flex items-center px-2.5 py-1 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-xs font-bold shrink-0">
          {threads.length} {threads.length === 1 ? 'duda registrada' : 'dudas registradas'}
        </span>
      </div>

      {/* ─── CAJA DE NUEVA DUDA / COMENTARIO ─── */}
      <div className="mt-4 p-3.5 sm:p-4 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200/80 dark:border-slate-700/60">
        <label
          className="block text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-300 mb-2"
          htmlFor={`workshop-comment-${workshop.id}`}
        >
          ¿Tienes alguna duda sobre esta clase o video?
        </label>
        <textarea
          id={`workshop-comment-${workshop.id}`}
          rows={3}
          className="w-full rounded-xl border border-slate-200 dark:border-slate-700 px-4 py-3 text-sm dark:bg-slate-900 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all placeholder:text-slate-400"
          placeholder="Escribe tu pregunta clínica o técnica para que los docentes y compañeros te respondan…"
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
        />

        {/* Barra de utilidades: vinculación de timestamp y botón publicar */}
        <div className="mt-3 flex flex-wrap items-center justify-between gap-3">
          <div className="flex flex-wrap items-center gap-2">
            {attachedSecond !== null ? (
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-indigo-100 dark:bg-indigo-950/70 text-indigo-700 dark:text-indigo-300 text-xs font-semibold border border-indigo-200 dark:border-indigo-800">
                <Clock className="w-3.5 h-3.5" /> Momento vinculado: {formatVideoTime(attachedSecond)}
                <button
                  type="button"
                  onClick={() => setAttachedSecond(null)}
                  className="hover:text-red-500 ml-1 cursor-pointer"
                  title="Quitar minuto vinculado"
                  aria-label="Quitar minuto"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </span>
            ) : liveVideoSecond !== null && liveVideoSecond > 0 ? (
              <button
                type="button"
                onClick={() => setAttachedSecond(liveVideoSecond)}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-200 text-xs font-medium border border-slate-200 dark:border-slate-700 hover:border-indigo-400 hover:text-indigo-600 dark:hover:text-indigo-400 transition-all cursor-pointer shadow-sm"
              >
                <Clock className="w-3.5 h-3.5 text-indigo-500" /> Vincular segundo actual ({formatVideoTime(liveVideoSecond)})
              </button>
            ) : null}
          </div>

          <div className="flex items-center gap-3">
            {saved && <span className="text-xs text-emerald-600 dark:text-emerald-400 font-semibold">{saved}</span>}
            {error && (
              <span className="text-xs text-red-600 dark:text-red-400 font-semibold" role="alert">
                {error}
              </span>
            )}
            <button
              type="button"
              className="min-h-[42px] px-5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-semibold shadow-md shadow-indigo-600/20 disabled:opacity-50 transition-all cursor-pointer inline-flex items-center gap-2"
              disabled={posting || !draft.trim()}
              onClick={() => void handlePublish()}
            >
              <Send className="w-4 h-4" />
              {posting ? 'Publicando…' : 'Publicar duda'}
            </button>
          </div>
        </div>
      </div>

      {/* ─── LISTA DE HILOS Y RESPUESTAS ─── */}
      <div className="mt-8 space-y-4">
        {loading ? (
          <div className="py-8 text-center text-slate-400">
            <Clock className="w-6 h-6 mx-auto animate-spin mb-2" />
            <p className="text-sm">Cargando comentarios del taller…</p>
          </div>
        ) : threads.length === 0 ? (
          <div className="py-12 px-4 rounded-2xl border border-dashed border-slate-200 dark:border-slate-800 text-center text-slate-400">
            <MessageCircle className="w-8 h-8 mx-auto text-slate-300 dark:text-slate-600 mb-2" />
            <p className="text-sm font-medium text-slate-600 dark:text-slate-300">
              Aún no hay dudas publicadas en esta clase.
            </p>
            <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto">
              Si te surge alguna pregunta sobre el caso o la técnica de exploración, sé el primero en participar.
            </p>
          </div>
        ) : (
          threads.map((thread) => {
            const threadReplies = replies[thread.id] ?? [];
            const staffAuthor = authors[thread.student_id]?.is_staff;
            const canDeleteThread = isStaff || thread.student_id === user?.id;
            const closed = thread.status === 'closed';

            return (
              <article
                key={thread.id}
                className="p-4 sm:p-5 rounded-2xl bg-slate-50/80 dark:bg-slate-800/60 border border-slate-200/70 dark:border-slate-700/60 transition-all"
              >
                {/* Cabecera del hilo */}
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <p className="text-xs sm:text-sm font-bold text-slate-800 dark:text-slate-100">
                        {authorName(thread.student_id)}
                      </p>
                      {staffAuthor && (
                        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-indigo-100 dark:bg-indigo-950/80 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800">
                          Profesor
                        </span>
                      )}
                      <span className="text-xs font-normal text-slate-400">{formatWhen(thread.created_at)}</span>
                    </div>

                    {/* Chip de momento del video si existe */}
                    {thread.video_second !== null && thread.video_second !== undefined && (
                      <button
                        type="button"
                        onClick={() => handleSeekToSecond(thread.video_second!)}
                        className="mt-2 inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-purple-100 dark:bg-purple-950/60 text-purple-700 dark:text-purple-300 hover:bg-purple-200 dark:hover:bg-purple-900/80 text-xs font-bold transition-all cursor-pointer border border-purple-200 dark:border-purple-800/60"
                        title="Ir a este momento en el reproductor de video"
                      >
                        <Play className="w-3 h-3 fill-current" />
                        Minuto {formatVideoTime(thread.video_second)} · Ver momento
                      </button>
                    )}

                    <p className="text-sm mt-2 text-slate-700 dark:text-slate-200 whitespace-pre-wrap leading-relaxed">
                      {thread.body}
                    </p>
                  </div>

                  <div className="shrink-0">{statusBadge(thread.status)}</div>
                </div>

                {/* Acciones de gestión (Staff / Autor) */}
                {(canDeleteThread || isStaff) && (
                  <div className="mt-3 pt-3 border-t border-slate-200/60 dark:border-slate-700/60 flex flex-wrap gap-2 items-center">
                    {isStaff && thread.status !== 'answered' && (
                      <button
                        type="button"
                        className="min-h-[32px] px-2.5 rounded-lg text-xs font-semibold inline-flex items-center gap-1.5 border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-200 hover:bg-emerald-50 dark:hover:bg-emerald-950/40 hover:text-emerald-600 transition-colors cursor-pointer"
                        onClick={() => void handleStatus(thread, 'answered')}
                      >
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                        Marcar respondida
                      </button>
                    )}
                    {isStaff && thread.status !== 'closed' && (
                      <button
                        type="button"
                        className="min-h-[32px] px-2.5 rounded-lg text-xs font-semibold inline-flex items-center gap-1.5 border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
                        onClick={() => void handleStatus(thread, 'closed')}
                      >
                        <Lock className="w-3.5 h-3.5 text-slate-400" />
                        Cerrar duda
                      </button>
                    )}
                    {isStaff && thread.status !== 'open' && (
                      <button
                        type="button"
                        className="min-h-[32px] px-2.5 rounded-lg text-xs font-semibold border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer inline-flex items-center gap-1.5"
                        onClick={() => void handleStatus(thread, 'open')}
                      >
                        <RotateCcw className="w-3.5 h-3.5" />
                        Reabrir
                      </button>
                    )}
                    {canDeleteThread && (
                      <button
                        type="button"
                        className="min-h-[32px] px-2.5 rounded-lg text-xs font-semibold text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/30 inline-flex items-center gap-1 transition-colors cursor-pointer ml-auto"
                        onClick={() => void handleDeleteThread(thread)}
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                        Borrar
                      </button>
                    )}
                  </div>
                )}

                {/* Respuestas anidadas */}
                <div className="mt-4 space-y-2.5 pl-3 sm:pl-4 border-l-2 border-indigo-200 dark:border-indigo-900/60">
                  {threadReplies.map((reply) => {
                    const replyStaff = authors[reply.author_id]?.is_staff;
                    const canDeleteReply = isStaff || reply.author_id === user?.id;
                    return (
                      <div
                        key={reply.id}
                        className="p-3 rounded-xl bg-white dark:bg-slate-900/90 border border-slate-200/80 dark:border-slate-700/80 shadow-sm"
                      >
                        <div className="flex items-center justify-between gap-2">
                          <p className="text-xs font-bold text-slate-700 dark:text-slate-200 flex items-center gap-2">
                            {authorName(reply.author_id)}
                            {replyStaff && (
                              <span className="text-[10px] uppercase font-bold tracking-wide text-indigo-600 dark:text-indigo-300 bg-indigo-50 dark:bg-indigo-950/60 px-1.5 py-0.5 rounded">
                                Docente
                              </span>
                            )}
                            <span className="font-normal text-slate-400 text-[11px]">
                              {formatWhen(reply.created_at)}
                            </span>
                          </p>
                          {canDeleteReply && (
                            <button
                              type="button"
                              className="text-[11px] font-semibold text-rose-500 hover:text-rose-700 cursor-pointer"
                              onClick={() => void handleDeleteReply(reply)}
                              title="Borrar respuesta"
                            >
                              Borrar
                            </button>
                          )}
                        </div>
                        <p className="text-sm mt-1.5 text-slate-700 dark:text-slate-200 whitespace-pre-wrap leading-relaxed">
                          {reply.body}
                        </p>
                      </div>
                    );
                  })}
                </div>

                {/* Formulario de respuesta */}
                {canReply && !closed ? (
                  <form
                    className="mt-3 flex gap-2 pl-3 sm:pl-4"
                    onSubmit={(e) => {
                      e.preventDefault();
                      void handleReply(thread.id);
                    }}
                  >
                    <label className="sr-only" htmlFor={`workshop-reply-${thread.id}`}>
                      Responder a esta duda
                    </label>
                    <input
                      id={`workshop-reply-${thread.id}`}
                      className="flex-1 min-h-[42px] rounded-xl border border-slate-200 dark:border-slate-700 px-3.5 text-sm dark:bg-slate-900 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      placeholder="Escribe una respuesta a esta duda…"
                      value={replyDrafts[thread.id] ?? ''}
                      onChange={(e) =>
                        setReplyDrafts((prev) => ({ ...prev, [thread.id]: e.target.value }))
                      }
                    />
                    <button
                      type="submit"
                      className="min-h-[42px] min-w-[42px] px-3.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white inline-flex items-center justify-center disabled:opacity-50 transition-all cursor-pointer shadow-sm"
                      disabled={replyingId === thread.id || !(replyDrafts[thread.id] ?? '').trim()}
                      aria-label="Enviar respuesta"
                    >
                      <Send className="w-4 h-4" />
                    </button>
                  </form>
                ) : closed ? (
                  <p className="mt-3 text-xs text-slate-400 pl-3 sm:pl-4">Esta duda está marcada como cerrada.</p>
                ) : (
                  <p className="mt-3 text-xs text-slate-400 pl-3 sm:pl-4">
                    <Link to="/auth/login" className="underline font-semibold text-indigo-500">
                      Inicia sesión
                    </Link>{' '}
                    para responder.
                  </p>
                )}
              </article>
            );
          })
        )}
      </div>
    </section>
  );
}

