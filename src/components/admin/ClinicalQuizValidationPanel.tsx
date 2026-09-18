import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  AlertTriangle,
  Check,
  ChevronDown,
  ChevronRight,
  Copy,
  ExternalLink,
  Filter,
  Pencil,
  X,
} from 'lucide-react';
import { allModules } from '../../content/modules';
import {
  listQuizzesForValidation,
  setQuizValidationStatus,
} from '../../services/quizValidationService';
import { findDuplicateStems } from '../../utils/quizDuplicates';
import { getModuleLabel, getTopicPublicUrl } from '../../utils/adminUtils';
import type { ClinicalValidationStatus, QuizQuestion, QuizValidationItem } from '../../types/quiz';

const STATUS_LABELS: Record<ClinicalValidationStatus, string> = {
  pending_review: 'Pendiente',
  approved: 'Aprobado',
  rejected: 'Rechazado',
};

function isCorrectOption(opt: QuizQuestion['options'][number]) {
  return opt.isCorrect === true || Boolean((opt as { is_correct?: boolean }).is_correct);
}

export function ClinicalQuizValidationPanel() {
  const [quizzes, setQuizzes] = useState<QuizValidationItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState<ClinicalValidationStatus | 'all'>('pending_review');
  const [moduleFilter, setModuleFilter] = useState('');
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [openQuizId, setOpenQuizId] = useState<string | null>(null);
  const [notes, setNotes] = useState('');
  const [confirmBatch, setConfirmBatch] = useState(false);
  const [saving, setSaving] = useState(false);

  const load = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await listQuizzesForValidation();
      setQuizzes(data);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'No se pudo cargar la cola de validación');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void load();
  }, []);

  const moduleOrder = useMemo(
    () => new Map(allModules.map((mod, index) => [mod.id, mod.number || index + 1])),
    []
  );

  const duplicates = useMemo(() => {
    const rows = quizzes.flatMap((quiz) =>
      (quiz.questions ?? []).map((q) => ({
        quizId: quiz.id,
        topicId: quiz.topic_id,
        stem: q.stem,
      }))
    );
    return findDuplicateStems(rows);
  }, [quizzes]);

  const duplicateByQuizId = useMemo(() => {
    const map = new Map<string, { similar: boolean; otherTopics: string[] }>();
    for (const hit of duplicates.values()) {
      for (const quizId of hit.quizIds) {
        const prev = map.get(quizId);
        const others = hit.topicIds.filter((id) => {
          const quiz = quizzes.find((item) => item.id === quizId);
          return id !== quiz?.topic_id;
        });
        map.set(quizId, {
          similar: prev?.similar || hit.similar,
          otherTopics: [...new Set([...(prev?.otherTopics ?? []), ...others])],
        });
      }
    }
    return map;
  }, [duplicates, quizzes]);

  const filtered = useMemo(() => {
    return quizzes
      .filter((quiz) => {
        if (statusFilter !== 'all' && quiz.clinical_validation_status !== statusFilter) return false;
        if (moduleFilter && quiz.module_id !== moduleFilter) return false;
        return true;
      })
      .sort((a, b) => {
        const orderA = moduleOrder.get(a.module_id) ?? 99;
        const orderB = moduleOrder.get(b.module_id) ?? 99;
        if (orderA !== orderB) return orderA - orderB;
        return (a.title ?? a.topic_id).localeCompare(b.title ?? b.topic_id, 'es');
      });
  }, [quizzes, statusFilter, moduleFilter, moduleOrder]);

  const grouped = useMemo(() => {
    const groups: { moduleId: string; items: QuizValidationItem[] }[] = [];
    for (const quiz of filtered) {
      const last = groups[groups.length - 1];
      if (!last || last.moduleId !== quiz.module_id) {
        groups.push({ moduleId: quiz.module_id, items: [quiz] });
      } else {
        last.items.push(quiz);
      }
    }
    return groups;
  }, [filtered]);

  const pendingByModule = useMemo(() => {
    const counts = new Map<string, number>();
    for (const quiz of quizzes) {
      if (quiz.clinical_validation_status === 'pending_review') {
        counts.set(quiz.module_id, (counts.get(quiz.module_id) ?? 0) + 1);
      }
    }
    return counts;
  }, [quizzes]);

  const suggestedModule = useMemo(() => {
    return allModules.find((mod) => (pendingByModule.get(mod.id) ?? 0) > 0) ?? null;
  }, [pendingByModule]);

  const pendingTotal = quizzes.filter((q) => q.clinical_validation_status === 'pending_review').length;

  const applyStatus = async (ids: string[], status: ClinicalValidationStatus) => {
    if (ids.length === 0) return;
    setSaving(true);
    setError(null);
    try {
      await setQuizValidationStatus(ids, status, notes || undefined);
      setSelected(new Set());
      setConfirmBatch(false);
      setNotes('');
      await load();
    } catch (e) {
      setError(e instanceof Error ? e.message : 'No se pudo guardar la validación');
    } finally {
      setSaving(false);
    }
  };

  const toggleSelected = (id: string) => {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const selectModule = (items: QuizValidationItem[]) => {
    setSelected(new Set(items.map((item) => item.id)));
    setConfirmBatch(false);
  };

  return (
    <div className="space-y-4">
      {suggestedModule && (
        <div className="p-4 rounded-2xl border border-amber-200 bg-amber-50 dark:bg-amber-950/30 dark:border-amber-900 text-sm">
          <p className="font-semibold text-amber-900 dark:text-amber-200">Siguiente módulo sugerido</p>
          <p className="text-amber-800 dark:text-amber-300 mt-1">
            Revise primero el Módulo {suggestedModule.number}: {suggestedModule.title} (
            {pendingByModule.get(suggestedModule.id)} pendientes). El orden sigue la secuencia del diplomado.
          </p>
          <button
            type="button"
            className="mt-3 min-h-[44px] px-3 rounded-lg bg-amber-600 text-white text-xs font-semibold"
            onClick={() => {
              setModuleFilter(suggestedModule.id);
              setStatusFilter('pending_review');
            }}
          >
            Filtrar módulo {String(suggestedModule.number).padStart(2, '0')}
          </button>
        </div>
      )}

      <div className="flex flex-wrap items-center gap-3 p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50">
        <Filter className="w-4 h-4 text-slate-400" />
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value as ClinicalValidationStatus | 'all')}
          className="text-sm px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-800"
        >
          <option value="pending_review">Pendientes ({pendingTotal})</option>
          <option value="approved">Aprobados</option>
          <option value="rejected">Rechazados</option>
          <option value="all">Todos</option>
        </select>
        <select
          value={moduleFilter}
          onChange={(e) => setModuleFilter(e.target.value)}
          className="text-sm px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-800"
        >
          <option value="">Todos los módulos</option>
          {allModules.map((mod) => (
            <option key={mod.id} value={mod.id}>
              {String(mod.number).padStart(2, '0')}. {mod.title} ({pendingByModule.get(mod.id) ?? 0} pend.)
            </option>
          ))}
        </select>
        <span className="text-xs text-slate-500">{filtered.length} cuestionarios</span>
      </div>

      {selected.size > 0 && (
        <div className="p-4 rounded-xl border border-emerald-200 bg-emerald-50/70 dark:bg-emerald-950/20 space-y-3">
          <p className="text-sm font-semibold">{selected.size} seleccionados</p>
          <textarea
            rows={2}
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Notas de validación (opcional)"
            className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm"
          />
          {confirmBatch && (
            <p className="text-sm text-emerald-800">
              ¿Confirma aprobar {selected.size} cuestionarios? Pulse de nuevo para ejecutar.
            </p>
          )}
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              disabled={saving}
              onClick={() => {
                if (!confirmBatch) {
                  setConfirmBatch(true);
                  return;
                }
                void applyStatus([...selected], 'approved');
              }}
              className="inline-flex items-center gap-1 min-h-[44px] px-3 rounded-lg bg-emerald-600 text-white text-sm"
            >
              <Check className="w-4 h-4" />
              {confirmBatch ? 'Confirmar lote' : 'Aprobar lote'}
            </button>
            <button
              type="button"
              disabled={saving}
              onClick={() => {
                setConfirmBatch(false);
                void applyStatus([...selected], 'rejected');
              }}
              className="inline-flex items-center gap-1 min-h-[44px] px-3 rounded-lg bg-red-600 text-white text-sm"
            >
              <X className="w-4 h-4" /> Rechazar lote
            </button>
          </div>
        </div>
      )}

      {loading && <p className="text-sm text-slate-500">Cargando cuestionarios…</p>}
      {error && <p className="text-sm text-red-600">{error}</p>}

      {!loading && grouped.length === 0 && (
        <p className="text-sm text-slate-500 py-8 text-center rounded-xl border border-dashed">
          No hay cuestionarios con este filtro.
        </p>
      )}

      <div className="space-y-6">
        {grouped.map((group) => (
          <section key={group.moduleId} className="rounded-2xl border border-slate-200 dark:border-slate-700">
            <div className="flex flex-wrap items-center justify-between gap-3 p-4 border-b border-slate-100 dark:border-slate-800">
              <div>
                <h3 className="font-semibold">{getModuleLabel(group.moduleId)}</h3>
                <p className="text-xs text-slate-500">{group.items.length} en este filtro</p>
              </div>
              <button
                type="button"
                className="text-xs font-semibold text-emerald-700 min-h-[44px] px-3"
                onClick={() => selectModule(group.items)}
              >
                Seleccionar módulo
              </button>
            </div>
            <ul className="divide-y divide-slate-100 dark:divide-slate-800">
              {group.items.map((quiz) => {
                const dup = duplicateByQuizId.get(quiz.id);
                const open = openQuizId === quiz.id;
                const topicUrl = getTopicPublicUrl(quiz.module_id, quiz.topic_id);
                return (
                  <li key={quiz.id} className="p-4">
                    <div className="flex items-start gap-3">
                      <input
                        type="checkbox"
                        className="mt-1"
                        checked={selected.has(quiz.id)}
                        onChange={() => toggleSelected(quiz.id)}
                        aria-label={`Seleccionar ${quiz.title ?? quiz.topic_id}`}
                      />
                      <div className="flex-1 min-w-0">
                        <div className="flex flex-wrap items-center gap-2">
                          <button
                            type="button"
                            className="text-left font-medium inline-flex items-center gap-1"
                            onClick={() => setOpenQuizId(open ? null : quiz.id)}
                          >
                            {open ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
                            {quiz.title ?? quiz.topic_id}
                          </button>
                          <span className="text-[11px] px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800">
                            {STATUS_LABELS[quiz.clinical_validation_status ?? 'pending_review']}
                          </span>
                          {dup && (
                            <span className="text-[11px] px-2 py-0.5 rounded-full bg-amber-100 text-amber-800 inline-flex items-center gap-1">
                              <Copy className="w-3 h-3" />
                              {dup.similar ? 'Similar' : 'Duplicado'}
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-slate-500 mt-1">
                          {quiz.topic_id} · {quiz.question_count} reactivos · {quiz.attempt_count} intentos
                        </p>
                        {dup && dup.otherTopics.length > 0 && (
                          <p className="text-xs text-amber-700 mt-1">
                            También en: {dup.otherTopics.slice(0, 4).join(', ')}
                          </p>
                        )}
                        <div className="flex flex-wrap gap-2 mt-2">
                          <Link
                            to={`/admin/quizzes/${quiz.topic_id}`}
                            className="inline-flex items-center gap-1 text-xs text-indigo-600 min-h-[44px] px-2"
                          >
                            <Pencil className="w-3.5 h-3.5" /> Corregir en editor
                          </Link>
                          {topicUrl && (
                            <Link
                              to={topicUrl}
                              className="inline-flex items-center gap-1 text-xs text-slate-500 min-h-[44px] px-2"
                            >
                              <ExternalLink className="w-3.5 h-3.5" /> Ver tema
                            </Link>
                          )}
                          {quiz.clinical_validation_status === 'pending_review' && (
                            <>
                              <button
                                type="button"
                                disabled={saving}
                                className="text-xs font-semibold text-emerald-700 min-h-[44px] px-2"
                                onClick={() => void applyStatus([quiz.id], 'approved')}
                              >
                                Aprobar
                              </button>
                              <button
                                type="button"
                                disabled={saving}
                                className="text-xs font-semibold text-red-700 min-h-[44px] px-2"
                                onClick={() => void applyStatus([quiz.id], 'rejected')}
                              >
                                Rechazar
                              </button>
                            </>
                          )}
                        </div>
                      </div>
                    </div>
                    {open && (
                      <ol className="mt-4 space-y-3 pl-7">
                        {(quiz.questions ?? []).map((question, index) => (
                          <li
                            key={question.id}
                            className="p-3 rounded-xl bg-slate-50 dark:bg-slate-900/50 text-sm"
                          >
                            <p className="font-medium">
                              {index + 1}. {question.stem}
                            </p>
                            <p className="text-[11px] uppercase tracking-wide text-slate-400 mt-1">
                              {question.type} · {question.difficulty ?? 'sin dificultad'}
                            </p>
                            <ul className="mt-2 space-y-1">
                              {question.options.map((opt) => (
                                <li
                                  key={opt.id}
                                  className={
                                    isCorrectOption(opt)
                                      ? 'text-emerald-700 dark:text-emerald-300 font-semibold'
                                      : 'text-slate-600 dark:text-slate-300'
                                  }
                                >
                                  {isCorrectOption(opt) ? '✓ ' : '○ '}
                                  {opt.text}
                                </li>
                              ))}
                            </ul>
                            {question.explanation && (
                              <p className="text-xs text-slate-500 mt-2">{question.explanation}</p>
                            )}
                          </li>
                        ))}
                      </ol>
                    )}
                  </li>
                );
              })}
            </ul>
          </section>
        ))}
      </div>

      <p className="text-xs text-slate-400 flex items-center gap-1">
        <AlertTriangle className="w-3.5 h-3.5" />
        Los alumnos no pueden acreditar un cuestionario hasta que esté aprobado.
      </p>
    </div>
  );
}
