import { useCallback, useEffect, useMemo, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { CheckCircle2, Lock, MessageCircle, Send, Trash2 } from 'lucide-react';
import { useAuth } from '../../contexts/AuthProvider';
import {
  createTopicThread,
  deleteQaReply,
  deleteQaThread,
  listQaRepliesForThreads,
  listTopicDiscussionDirectory,
  listTopicThreads,
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

function statusLabel(status: QaThread['status']): string {
  if (status === 'answered') return 'Respondida';
  if (status === 'closed') return 'Cerrada';
  return 'Abierta';
}

export function TopicDiscussion({
  moduleId,
  topicId,
}: {
  moduleId: string;
  topicId: string;
}) {
  const location = useLocation();
  const { user, isAdmin, isEditor } = useAuth();
  const isStaff = isAdmin || isEditor;
  const pageUrl = `${location.pathname}${location.search}#tema-comentarios`;

  const [threads, setThreads] = useState<QaThread[]>([]);
  const [replies, setReplies] = useState<Record<string, QaReply[]>>({});
  const [authors, setAuthors] = useState<Record<string, TopicDiscussionAuthor>>({});
  const [draft, setDraft] = useState('');
  const [replyDrafts, setReplyDrafts] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);
  const [posting, setPosting] = useState(false);
  const [replyingId, setReplyingId] = useState<string | null>(null);
  const [saved, setSaved] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const authorName = useCallback(
    (userId: string) => {
      if (userId === user?.id) return 'Tú';
      return authors[userId]?.display_name || 'Médico';
    },
    [authors, user?.id]
  );

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [rows, directory] = await Promise.all([
        listTopicThreads(topicId),
        listTopicDiscussionDirectory(topicId).catch(() => [] as TopicDiscussionAuthor[]),
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
      setError(e instanceof Error ? e.message : 'No se pudieron cargar los comentarios');
    } finally {
      setLoading(false);
    }
  }, [topicId]);

  useEffect(() => {
    void load();
  }, [load]);

  useEffect(() => {
    if (location.hash !== '#tema-comentarios' || loading) return;
    document.getElementById('tema-comentarios')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }, [location.hash, loading]);

  const canReply = useMemo(() => Boolean(user), [user]);

  async function handlePublish() {
    if (!draft.trim() || posting) return;
    setPosting(true);
    setError(null);
    try {
      const savedThread = await createTopicThread({
        body: draft.trim(),
        moduleId,
        topicId,
        pageUrl,
      });
      setThreads((prev) => [savedThread, ...prev]);
      setDraft('');
      setSaved('Publicado');
      if (user) {
        setAuthors((prev) => ({
          ...prev,
          [user.id]: prev[user.id] ?? { user_id: user.id, display_name: 'Tú', is_staff: isStaff },
        }));
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : 'No se pudo publicar');
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
      setSaved('Respuesta publicada');
    } catch (e) {
      setError(e instanceof Error ? e.message : 'No se pudo responder');
    } finally {
      setReplyingId(null);
    }
  }

  async function handleDeleteThread(thread: QaThread) {
    if (!window.confirm('¿Borrar esta duda y sus respuestas?')) return;
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
    if (!window.confirm('¿Borrar esta respuesta?')) return;
    try {
      await deleteQaReply(reply.id);
      setReplies((prev) => ({
        ...prev,
        [reply.thread_id]: (prev[reply.thread_id] ?? []).filter((row) => row.id !== reply.id),
      }));
    } catch (e) {
      setError(e instanceof Error ? e.message : 'No se pudo borrar');
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

  return (
    <section
      id="tema-comentarios"
      className="mt-8 p-4 sm:p-5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white/80 dark:bg-slate-900/80"
    >
      <div className="flex items-start justify-between gap-3 mb-3">
        <div>
          <h2 className="text-sm font-bold flex items-center gap-2">
            <MessageCircle className="w-4 h-4" />
            Dudas y comentarios
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            Visible para la cohorte y los profesores. Pueden responderte en este mismo tema.
          </p>
        </div>
        <span className="text-[11px] font-semibold text-slate-400 shrink-0">
          {threads.length} {threads.length === 1 ? 'duda' : 'dudas'}
        </span>
      </div>

      <label className="sr-only" htmlFor={`topic-comment-${topicId}`}>
        Comentario
      </label>
      <textarea
        id={`topic-comment-${topicId}`}
        className="w-full min-h-[96px] rounded-xl border border-slate-200 dark:border-slate-700 px-3 py-2 text-sm dark:bg-slate-800"
        placeholder="Escribe una duda o comentario para la cohorte…"
        value={draft}
        onChange={(e) => setDraft(e.target.value)}
      />
      <div className="mt-2 flex flex-wrap items-center gap-3">
        <button
          type="button"
          className="min-h-[44px] px-4 rounded-xl bg-blue-600 text-white text-sm font-semibold disabled:opacity-60"
          disabled={posting || !draft.trim()}
          onClick={() => void handlePublish()}
        >
          {posting ? 'Publicando…' : 'Publicar'}
        </button>
        {saved && <span className="text-xs text-emerald-600">{saved}</span>}
        {error && (
          <span className="text-xs text-red-600" role="alert">
            {error}
          </span>
        )}
      </div>

      <div className="mt-5 space-y-3">
        {loading ? (
          <p className="text-sm text-slate-500">Cargando comentarios…</p>
        ) : threads.length === 0 ? (
          <p className="text-sm text-slate-500">
            Aún no hay dudas en este tema. Publica la primera para la cohorte.
          </p>
        ) : (
          threads.map((thread) => {
            const threadReplies = replies[thread.id] ?? [];
            const staffAuthor = authors[thread.student_id]?.is_staff;
            const canDeleteThread = isStaff || thread.student_id === user?.id;
            const closed = thread.status === 'closed';
            return (
              <article key={thread.id} className="p-3 sm:p-4 rounded-xl bg-slate-50 dark:bg-slate-800/80">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <p className="text-xs font-semibold text-slate-700 dark:text-slate-200">
                      {authorName(thread.student_id)}
                      {staffAuthor && (
                        <span className="ml-2 text-[10px] uppercase tracking-wide text-indigo-600 dark:text-indigo-300">
                          Profesor
                        </span>
                      )}
                      <span className="ml-2 font-normal text-slate-400">{formatWhen(thread.created_at)}</span>
                    </p>
                    <p className="text-sm mt-1 whitespace-pre-wrap">{thread.body}</p>
                  </div>
                  <span className="text-[10px] uppercase font-bold tracking-wide text-slate-400 shrink-0">
                    {statusLabel(thread.status)}
                  </span>
                </div>

                {(canDeleteThread || isStaff) && (
                  <div className="mt-2 flex flex-wrap gap-2">
                    {isStaff && thread.status !== 'answered' && (
                      <button
                        type="button"
                        className="min-h-[36px] px-2 rounded-lg text-xs font-semibold inline-flex items-center gap-1 border"
                        onClick={() => void handleStatus(thread, 'answered')}
                      >
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        Respondida
                      </button>
                    )}
                    {isStaff && thread.status !== 'closed' && (
                      <button
                        type="button"
                        className="min-h-[36px] px-2 rounded-lg text-xs font-semibold inline-flex items-center gap-1 border"
                        onClick={() => void handleStatus(thread, 'closed')}
                      >
                        <Lock className="w-3.5 h-3.5" />
                        Cerrar
                      </button>
                    )}
                    {isStaff && thread.status !== 'open' && (
                      <button
                        type="button"
                        className="min-h-[36px] px-2 rounded-lg text-xs font-semibold border"
                        onClick={() => void handleStatus(thread, 'open')}
                      >
                        Reabrir
                      </button>
                    )}
                    {canDeleteThread && (
                      <button
                        type="button"
                        className="min-h-[36px] px-2 rounded-lg text-xs font-semibold text-red-600 inline-flex items-center gap-1"
                        onClick={() => void handleDeleteThread(thread)}
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                        Borrar
                      </button>
                    )}
                  </div>
                )}

                <div className="mt-3 space-y-2">
                  {threadReplies.map((reply) => {
                    const replyStaff = authors[reply.author_id]?.is_staff;
                    const canDeleteReply = isStaff || reply.author_id === user?.id;
                    return (
                      <div key={reply.id} className="p-2 rounded-lg bg-white dark:bg-slate-900">
                        <p className="text-[11px] font-semibold text-slate-600 dark:text-slate-300">
                          {authorName(reply.author_id)}
                          {replyStaff && (
                            <span className="ml-2 text-[10px] uppercase tracking-wide text-indigo-600 dark:text-indigo-300">
                              Profesor
                            </span>
                          )}
                          <span className="ml-2 font-normal text-slate-400">{formatWhen(reply.created_at)}</span>
                        </p>
                        <p className="text-sm mt-1 whitespace-pre-wrap">{reply.body}</p>
                        {canDeleteReply && (
                          <button
                            type="button"
                            className="mt-1 text-[11px] font-semibold text-red-600"
                            onClick={() => void handleDeleteReply(reply)}
                          >
                            Borrar respuesta
                          </button>
                        )}
                      </div>
                    );
                  })}
                </div>

                {canReply && !closed ? (
                  <form
                    className="mt-3 flex gap-2"
                    onSubmit={(e) => {
                      e.preventDefault();
                      void handleReply(thread.id);
                    }}
                  >
                    <label className="sr-only" htmlFor={`reply-${thread.id}`}>
                      Responder
                    </label>
                    <input
                      id={`reply-${thread.id}`}
                      className="flex-1 min-h-[44px] rounded-lg border border-slate-200 dark:border-slate-700 px-3 text-sm dark:bg-slate-900"
                      placeholder="Responder"
                      value={replyDrafts[thread.id] ?? ''}
                      onChange={(e) =>
                        setReplyDrafts((prev) => ({ ...prev, [thread.id]: e.target.value }))
                      }
                    />
                    <button
                      type="submit"
                      className="min-h-[44px] min-w-[44px] px-3 rounded-lg bg-blue-600 text-white inline-flex items-center justify-center disabled:opacity-60"
                      disabled={replyingId === thread.id || !(replyDrafts[thread.id] ?? '').trim()}
                      aria-label="Enviar respuesta"
                    >
                      <Send className="w-4 h-4" />
                    </button>
                  </form>
                ) : closed ? (
                  <p className="mt-3 text-xs text-slate-400">Esta duda está cerrada.</p>
                ) : (
                  <p className="mt-3 text-xs text-slate-400">
                    <Link to="/auth/login" className="underline">
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
