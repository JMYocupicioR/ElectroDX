import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  CheckCircle2,
  Clock,
  Archive,
  Search,
  Upload,
  Sparkles,
  BookOpen,
  AlertTriangle,
  ChevronDown,
  ChevronUp,
  Trash2,
  Check,
  RefreshCw,
} from 'lucide-react';
import { useAllModules } from '../../../hooks/useAllModules';
import {
  adminDeleteExamQuestion,
  adminImportDraftExamQuestions,
  adminListExamQuestions,
  adminUpdateExamQuestionsStatus,
} from '../../../services/examService';
import type { ExamQuestion } from '../../../types/exam';

type StatusFilter = 'ALL' | 'DRAFT' | 'PUBLISHED' | 'ARCHIVED';

export function AdminExamBankManager() {
  const { modules: availableModules } = useAllModules();
  const [questions, setQuestions] = useState<ExamQuestion[]>([]);
  const [loading, setLoading] = useState(true);
  const [acting, setActing] = useState(false);
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('ALL');
  const [moduleFilter, setModuleFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [toast, setToast] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const loadQuestions = useCallback(async () => {
    setLoading(true);
    setErrorMsg(null);
    try {
      const rows = await adminListExamQuestions({
        status: statusFilter,
        moduleId: moduleFilter,
      });
      setQuestions(rows);
      setSelectedIds(new Set());
    } catch (err) {
      console.error(err);
      setErrorMsg('No se pudo cargar el banco de reactivos exam_questions.');
    } finally {
      setLoading(false);
    }
  }, [statusFilter, moduleFilter]);

  useEffect(() => {
    void loadQuestions();
  }, [loadQuestions]);

  const counts = useMemo(() => {
    let draft = 0;
    let published = 0;
    let archived = 0;
    for (const q of questions) {
      if (q.status === 'DRAFT') draft += 1;
      else if (q.status === 'PUBLISHED') published += 1;
      else if (q.status === 'ARCHIVED') archived += 1;
    }
    return { draft, published, archived, total: questions.length };
  }, [questions]);

  const filteredQuestions = useMemo(() => {
    const qLower = searchQuery.trim().toLowerCase();
    if (!qLower) return questions;
    return questions.filter(
      (q) =>
        q.stem.toLowerCase().includes(qLower) ||
        q.topic_name.toLowerCase().includes(qLower) ||
        (q.source_reference ?? '').toLowerCase().includes(qLower) ||
        (q.pearl ?? '').toLowerCase().includes(qLower)
    );
  }, [questions, searchQuery]);

  const toggleSelect = (id: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const toggleSelectAllFiltered = () => {
    if (selectedIds.size === filteredQuestions.length && filteredQuestions.length > 0) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(filteredQuestions.map((q) => q.id)));
    }
  };

  const handleBatchStatus = async (ids: string[], nextStatus: 'DRAFT' | 'PUBLISHED' | 'ARCHIVED') => {
    if (ids.length === 0) return;
    setActing(true);
    setErrorMsg(null);
    try {
      await adminUpdateExamQuestionsStatus(ids, nextStatus);
      setToast(
        nextStatus === 'PUBLISHED'
          ? `${ids.length} reactivo(s) aprobados y publicados en el simulador.`
          : nextStatus === 'ARCHIVED'
          ? `${ids.length} reactivo(s) archivados.`
          : `${ids.length} reactivo(s) marcados como borrador (DRAFT).`
      );
      setTimeout(() => setToast(null), 4000);
      await loadQuestions();
    } catch (err) {
      console.error(err);
      setErrorMsg('Error al actualizar el estado de los reactivos.');
    } finally {
      setActing(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('¿Eliminar permanentemente este reactivo del banco exam_questions?')) return;
    setActing(true);
    setErrorMsg(null);
    try {
      await adminDeleteExamQuestion(id);
      setToast('Reactivo eliminado.');
      setTimeout(() => setToast(null), 3500);
      await loadQuestions();
    } catch (err) {
      console.error(err);
      setErrorMsg('No se pudo eliminar el reactivo.');
    } finally {
      setActing(false);
    }
  };

  const handleImportJson = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (!file) return;

    setActing(true);
    setErrorMsg(null);
    try {
      const raw = await file.text();
      const parsed = JSON.parse(raw) as Record<string, unknown> | Array<Partial<ExamQuestion>>;
      const items: Array<Partial<ExamQuestion>> = Array.isArray(parsed)
        ? parsed
        : Array.isArray(parsed.examQuestions)
        ? (parsed.examQuestions as Array<Partial<ExamQuestion>>)
        : [];

      if (items.length === 0) {
        setErrorMsg(
          'El archivo JSON no contiene un arreglo "examQuestions" ni una lista de reactivos del simulador.'
        );
        return;
      }

      const defaultMod =
        !Array.isArray(parsed) && typeof parsed.moduleId === 'string'
          ? parsed.moduleId
          : 'fundamentals';
      const defaultTopic =
        !Array.isArray(parsed) && typeof parsed.topicId === 'string'
          ? parsed.topicId
          : undefined;

      const inserted = await adminImportDraftExamQuestions(items, defaultMod, defaultTopic);
      setToast(
        `${inserted} reactivo(s) importados en estado DRAFT. Revísalos y apruébalos a PUBLISHED.`
      );
      setTimeout(() => setToast(null), 5000);
      setStatusFilter('DRAFT');
      await loadQuestions();
    } catch (err) {
      console.error(err);
      setErrorMsg('Error al importar el archivo JSON de examQuestions.');
    } finally {
      setActing(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Resumen y Acciones Superiores */}
      <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-indigo-500" />
              <span>Banco de Reactivos del Simulador (`exam_questions`)</span>
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Los reactivos generados por IA o importados entran como{' '}
              <strong className="text-amber-600 dark:text-amber-400">DRAFT</strong> y requieren
              aprobación clínica humana antes de pasar a{' '}
              <strong className="text-emerald-600 dark:text-emerald-400">PUBLISHED</strong>.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <input
              ref={fileInputRef}
              type="file"
              accept=".json,application/json"
              onChange={handleImportJson}
              className="hidden"
            />
            <button
              type="button"
              disabled={acting}
              onClick={() => fileInputRef.current?.click()}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-indigo-50 dark:bg-indigo-950/50 border border-indigo-200 dark:border-indigo-800 text-indigo-700 dark:text-indigo-300 hover:bg-indigo-100 text-xs font-bold transition cursor-pointer"
            >
              <Upload className="w-3.5 h-3.5" />
              <span>Importar Borrador IA (`examQuestions` .json)</span>
            </button>

            <button
              type="button"
              onClick={() => void loadQuestions()}
              disabled={loading || acting}
              className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition cursor-pointer"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
              <span>Actualizar</span>
            </button>
          </div>
        </div>

        {/* Filtros */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2 border-t border-slate-100 dark:border-slate-800">
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Buscar por viñeta, tema, perla o cita..."
              className="w-full pl-9 pr-3 py-2 rounded-xl text-xs border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800"
            />
          </div>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as StatusFilter)}
            className="px-3 py-2 rounded-xl text-xs font-semibold border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800"
          >
            <option value="ALL">Todos los estados ({counts.total})</option>
            <option value="DRAFT">Pendientes de revisión — DRAFT ({counts.draft})</option>
            <option value="PUBLISHED">Publicados en simulador — PUBLISHED ({counts.published})</option>
            <option value="ARCHIVED">Archivados — ARCHIVED ({counts.archived})</option>
          </select>

          <select
            value={moduleFilter}
            onChange={(e) => setModuleFilter(e.target.value)}
            className="px-3 py-2 rounded-xl text-xs font-semibold border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800"
          >
            <option value="all">Todos los módulos</option>
            {availableModules.map((m) => (
              <option key={m.id} value={m.id}>
                Módulo {m.number}: {m.title}
              </option>
            ))}
          </select>
        </div>

        {/* Acciones en lote */}
        {selectedIds.size > 0 && (
          <div className="flex flex-wrap items-center justify-between gap-2 p-3 rounded-xl bg-indigo-50/70 dark:bg-indigo-950/30 border border-indigo-200 dark:border-indigo-800">
            <span className="text-xs font-bold text-indigo-800 dark:text-indigo-200">
              {selectedIds.size} reactivo(s) seleccionado(s)
            </span>
            <div className="flex flex-wrap items-center gap-2">
              <button
                type="button"
                disabled={acting}
                onClick={() => void handleBatchStatus(Array.from(selectedIds), 'PUBLISHED')}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition cursor-pointer"
              >
                <Check className="w-3.5 h-3.5" /> Aprobar y Publicar (`PUBLISHED`)
              </button>
              <button
                type="button"
                disabled={acting}
                onClick={() => void handleBatchStatus(Array.from(selectedIds), 'DRAFT')}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold transition cursor-pointer"
              >
                <Clock className="w-3.5 h-3.5" /> Pasar a `DRAFT`
              </button>
              <button
                type="button"
                disabled={acting}
                onClick={() => void handleBatchStatus(Array.from(selectedIds), 'ARCHIVED')}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-600 hover:bg-slate-700 text-white text-xs font-bold transition cursor-pointer"
              >
                <Archive className="w-3.5 h-3.5" /> Archivar
              </button>
            </div>
          </div>
        )}
      </div>

      {toast && (
        <div className="p-3.5 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-800 dark:text-emerald-200 text-xs font-semibold flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
          <span>{toast}</span>
        </div>
      )}

      {errorMsg && (
        <div className="p-3.5 rounded-xl bg-red-500/10 border border-red-500/30 text-red-800 dark:text-red-200 text-xs font-semibold flex items-center gap-2">
          <AlertTriangle className="w-4 h-4 text-red-500 shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}

      {/* Lista de reactivos */}
      <div className="space-y-3">
        <div className="flex items-center justify-between px-2">
          <label className="inline-flex items-center gap-2 text-xs font-semibold text-slate-600 dark:text-slate-400 cursor-pointer">
            <input
              type="checkbox"
              checked={
                filteredQuestions.length > 0 && selectedIds.size === filteredQuestions.length
              }
              onChange={toggleSelectAllFiltered}
              className="rounded text-indigo-600"
            />
            <span>Seleccionar todos ({filteredQuestions.length})</span>
          </label>
        </div>

        {loading ? (
          <div className="p-8 text-center text-xs text-slate-500">
            Cargando banco de reactivos del simulador...
          </div>
        ) : filteredQuestions.length === 0 ? (
          <div className="p-8 rounded-2xl border border-dashed border-slate-300 dark:border-slate-800 text-center text-xs text-slate-500">
            No se encontraron reactivos con los filtros seleccionados.
          </div>
        ) : (
          filteredQuestions.map((q) => {
            const isExpanded = expandedId === q.id;
            const isSelected = selectedIds.has(q.id);

            return (
              <div
                key={q.id}
                className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 overflow-hidden shadow-2xs"
              >
                <div className="p-4 flex items-start gap-3">
                  <input
                    type="checkbox"
                    checked={isSelected}
                    onChange={() => toggleSelect(q.id)}
                    className="mt-1 rounded text-indigo-600"
                  />

                  <div
                    onClick={() => setExpandedId(isExpanded ? null : q.id)}
                    className="flex-1 min-w-0 cursor-pointer"
                  >
                    <div className="flex flex-wrap items-center gap-2 mb-1.5">
                      <span
                        className={`text-[10px] font-extrabold px-2 py-0.5 rounded-full uppercase ${
                          q.status === 'PUBLISHED'
                            ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/70 dark:text-emerald-300'
                            : q.status === 'DRAFT'
                            ? 'bg-amber-100 text-amber-800 dark:bg-amber-950/70 dark:text-amber-300'
                            : 'bg-slate-200 text-slate-700 dark:bg-slate-800 dark:text-slate-400'
                        }`}
                      >
                        {q.status}
                      </span>

                      <span className="text-[11px] font-semibold px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                        {q.module_id} · {q.topic_name}
                      </span>

                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300">
                        Nivel {q.difficulty}
                      </span>

                      {q.is_critical && (
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-rose-100 dark:bg-rose-950/60 text-rose-700 dark:text-rose-300">
                          ★ Crítico Consejo
                        </span>
                      )}
                    </div>

                    <p className="text-xs sm:text-sm font-medium text-slate-900 dark:text-slate-100 line-clamp-2">
                      {q.stem}
                    </p>
                  </div>

                  <div className="flex items-center gap-1.5 shrink-0">
                    {q.status !== 'PUBLISHED' && (
                      <button
                        type="button"
                        disabled={acting}
                        onClick={() => void handleBatchStatus([q.id], 'PUBLISHED')}
                        className="px-2.5 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-[11px] font-bold transition cursor-pointer"
                        title="Aprobar y publicar en el simulador"
                      >
                        Aprobar
                      </button>
                    )}
                    {q.status === 'PUBLISHED' && (
                      <button
                        type="button"
                        disabled={acting}
                        onClick={() => void handleBatchStatus([q.id], 'DRAFT')}
                        className="px-2.5 py-1 rounded-lg border border-amber-300 dark:border-amber-800 text-amber-700 dark:text-amber-300 text-[11px] font-semibold hover:bg-amber-50 dark:hover:bg-amber-950/40 transition cursor-pointer"
                      >
                        Pasar a DRAFT
                      </button>
                    )}
                    <button
                      type="button"
                      disabled={acting}
                      onClick={() => void handleDelete(q.id)}
                      className="p-1.5 rounded-lg text-slate-400 hover:text-red-500 transition cursor-pointer"
                      title="Eliminar reactivo"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                    <button
                      type="button"
                      onClick={() => setExpandedId(isExpanded ? null : q.id)}
                      className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-slate-200"
                    >
                      {isExpanded ? (
                        <ChevronUp className="w-4 h-4" />
                      ) : (
                        <ChevronDown className="w-4 h-4" />
                      )}
                    </button>
                  </div>
                </div>

                {isExpanded && (
                  <div className="px-4 pb-4 pt-3 border-t border-slate-100 dark:border-slate-800 space-y-3 bg-slate-50/40 dark:bg-slate-950/30">
                    {/* Hallazgos electrofisiológicos */}
                    {q.findings && q.findings.length > 0 && (
                      <div className="flex flex-wrap gap-2">
                        {q.findings.map((f, fIdx) => (
                          <span
                            key={fIdx}
                            className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-slate-900 text-emerald-400 font-mono text-[11px] border border-slate-700"
                          >
                            <strong className="text-cyan-400">[{f.type}]</strong> {f.label}:{' '}
                            <span className="text-white font-bold">{f.value}</span>
                          </span>
                        ))}
                      </div>
                    )}

                    {/* Imagen si tiene */}
                    {q.image_url && (
                      <figure className="rounded-xl overflow-hidden border border-slate-200 dark:border-slate-800 bg-slate-950 p-2 max-w-xl">
                        <img
                          src={q.image_url}
                          alt={q.image_alt ?? 'Trazado EMG'}
                          className="max-h-52 object-contain mx-auto"
                        />
                      </figure>
                    )}

                    {/* Opciones con feedback por opción */}
                    <div className="space-y-1.5">
                      {q.options.map((opt, oIdx) => (
                        <div
                          key={oIdx}
                          className={`p-2.5 rounded-xl border text-xs ${
                            opt.is_correct
                              ? 'border-emerald-500/40 bg-emerald-500/10 text-emerald-900 dark:text-emerald-200'
                              : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300'
                          }`}
                        >
                          <div className="font-bold flex items-center justify-between">
                            <span>
                              {String.fromCharCode(65 + oIdx)}. {opt.text}
                            </span>
                            {opt.is_correct && (
                              <span className="text-[10px] font-extrabold text-emerald-600 dark:text-emerald-400">
                                ✓ CORRECTA
                              </span>
                            )}
                          </div>
                          {opt.feedback && (
                            <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">
                              ↳ {opt.feedback}
                            </p>
                          )}
                        </div>
                      ))}
                    </div>

                    {/* Perla y Referencia */}
                    {(q.pearl || q.source_reference) && (
                      <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/20 text-xs space-y-1.5">
                        {q.pearl && (
                          <p className="text-slate-800 dark:text-amber-100">
                            <strong className="text-amber-600 dark:text-amber-400">
                              Perla Clínica:{' '}
                            </strong>
                            {q.pearl}
                          </p>
                        )}
                        {q.source_reference && (
                          <p className="text-[11px] text-indigo-700 dark:text-indigo-300 flex items-center gap-1.5">
                            <BookOpen className="w-3.5 h-3.5 shrink-0" />
                            <span>
                              <strong>Fuente:</strong> {q.source_reference}
                            </span>
                          </p>
                        )}
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}

