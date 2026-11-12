import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  AlertTriangle,
  Award,
  BookOpen,
  CheckCircle2,
  ClipboardCheck,
  Download,
  FileCheck2,
  Filter,
  Lock,
  Plus,
  RefreshCw,
  Scale,
  ShieldCheck,
  Sparkles,
  Unlock,
  Video,
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthProvider';
import {
  buildPlatformParticipationReport,
  closeEditorialConfigTaskByDirection,
  createEditorialConfigTask,
  listEditorialConfigTasks,
  listParticipationAuditLogs,
  saveOrFreezeEditionCreditAct,
  type PlatformParticipationReport,
} from '../../services/participationAuditService';
import type {
  EditorialConfigTaskRow,
  ParticipationAuditLogRow,
  ParticipationBagCategory,
} from '../../types/database';

type SubView = 'medicos' | 'temas' | 'bitacora' | 'encargos';

const ROLE_LABELS: Record<string, { label: string; cls: string }> = {
  profesor: {
    label: 'Profesor (Solo Docencia)',
    cls: 'bg-sky-50 text-sky-800 border-sky-200 dark:bg-sky-950/40 dark:text-sky-200 dark:border-sky-800',
  },
  editor: {
    label: 'Editor (Obra + Editorial)',
    cls: 'bg-purple-50 text-purple-800 border-purple-200 dark:bg-purple-950/40 dark:text-purple-200 dark:border-purple-800',
  },
  ambos: {
    label: 'Profesor y Editor (3 Bolsas)',
    cls: 'bg-emerald-50 text-emerald-800 border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-200 dark:border-emerald-800',
  },
  sin_convenio: {
    label: 'Sin Anexo Firmado',
    cls: 'bg-amber-50 text-amber-800 border-amber-200 dark:bg-amber-950/40 dark:text-amber-200 dark:border-amber-800',
  },
};

const BAG_BADGES: Record<ParticipationBagCategory, { label: string; cls: string }> = {
  docencia: {
    label: 'Bolsa Docencia (Cl. 6)',
    cls: 'bg-sky-50 text-sky-700 border-sky-200 dark:bg-sky-950/40 dark:text-sky-300 dark:border-sky-800',
  },
  obra: {
    label: 'Bolsa Obra · Palabras (Cl. 7)',
    cls: 'bg-indigo-50 text-indigo-700 border-indigo-200 dark:bg-indigo-950/40 dark:text-indigo-300 dark:border-indigo-800',
  },
  editorial: {
    label: 'Bolsa Labor Editorial (Cl. 8 / Art. 10)',
    cls: 'bg-purple-50 text-purple-700 border-purple-200 dark:bg-purple-950/40 dark:text-purple-300 dark:border-purple-800',
  },
  excluded: {
    label: 'Excluido de Bolsas (Art. 6 / Art. 13)',
    cls: 'bg-slate-100 text-slate-700 border-slate-300 dark:bg-slate-800 dark:text-slate-300 dark:border-slate-700',
  },
  governance: {
    label: 'Gobernanza / Acta (Cl. 10)',
    cls: 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-300 dark:border-emerald-800',
  },
};

function formatCurrency(mxn: number): string {
  return new Intl.NumberFormat('es-MX', {
    style: 'currency',
    currency: 'MXN',
    maximumFractionDigits: 2,
  }).format(mxn || 0);
}

function formatDurationMinutes(seconds: number | null | undefined): string {
  if (!seconds || seconds <= 0) return '0 min';
  const mins = Math.round(seconds / 60);
  if (mins < 60) return `${mins} min`;
  const h = Math.floor(mins / 60);
  const rem = mins % 60;
  return rem > 0 ? `${h} h ${rem} min (${mins} min)` : `${h} h (${mins} min)`;
}

export function ParticipationLegalAuditPanel() {
  const { user, isAdmin } = useAuth();
  const [subView, setSubView] = useState<SubView>('medicos');
  const [editionLabel, setEditionLabel] = useState('1.0');
  const [docenciaPoolMxn, setDocenciaPoolMxn] = useState<number>(50000);
  const [obraPoolMxn, setObraPoolMxn] = useState<number>(50000);
  const [editorialPoolMxn, setEditorialPoolMxn] = useState<number>(30000);

  const [report, setReport] = useState<PlatformParticipationReport | null>(null);
  const [logs, setLogs] = useState<ParticipationAuditLogRow[]>([]);
  const [configTasks, setConfigTasks] = useState<EditorialConfigTaskRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [syncing, setSyncing] = useState(false);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Filtros
  const [topicSearch, setTopicSearch] = useState('');
  const [logBagFilter, setLogBagFilter] = useState<ParticipationBagCategory | 'all'>('all');

  // Formulario de nueva tarea de configuración por escrito (Reglamento Art. 10)
  const [taskAssignee, setTaskAssignee] = useState('');
  const [taskTitle, setTaskTitle] = useState('');
  const [taskBrief, setTaskBrief] = useState('');
  const [savingTask, setSavingTask] = useState(false);

  const loadAll = useCallback(
    async (persistAttributions = false) => {
      if (persistAttributions) setSyncing(true);
      else setLoading(true);
      setErrorMessage(null);
      try {
        const [rep, auditRows, taskRows] = await Promise.all([
          buildPlatformParticipationReport({
            editionLabel,
            docenciaPoolMxn,
            obraPoolMxn,
            editorialPoolMxn,
            persistTopicAttributions: persistAttributions,
          }),
          listParticipationAuditLogs(200),
          listEditorialConfigTasks(),
        ]);
        setReport(rep);
        setLogs(auditRows);
        setConfigTasks(taskRows);
        if (persistAttributions) {
          setStatusMessage(
            `Atribución léxica sincronizada en base de datos (${rep.topics.length} temas auditados · SHA-256: ${rep.snapshotSha256.slice(0, 12)}…).`
          );
        }
      } catch (err) {
        setErrorMessage(
          err instanceof Error ? err.message : 'Error al calcular el reporte de participación.'
        );
      } finally {
        setLoading(false);
        setSyncing(false);
      }
    },
    [editionLabel, docenciaPoolMxn, obraPoolMxn, editorialPoolMxn]
  );

  useEffect(() => {
    void loadAll(false);
  }, [loadAll]);

  const handleEmitCreditAct = async (freezeFinal: boolean) => {
    if (!report || !user) return;
    setSyncing(true);
    setErrorMessage(null);
    setStatusMessage(null);
    try {
      const savedAct = await saveOrFreezeEditionCreditAct({
        report,
        actorId: user.id,
        freezeFinal,
        notes: freezeFinal
          ? 'Acta de Créditos congelada definitivamente (Contrato Cl. 10).'
          : 'Acta de Créditos notificada con plazo de revisión de 5 días naturales (Reglamento Art. 16).',
      });
      setStatusMessage(
        freezeFinal
          ? `Acta de Créditos CONGELADA (${savedAct.edition_label}) con huella SHA-256: ${savedAct.snapshot_sha256.slice(0, 16)}…`
          : `Acta de Créditos EMITIDA (${savedAct.edition_label}). Plazo de 5 días naturales (Art. 16) vence el ${new Date(savedAct.objection_deadline_at ?? '').toLocaleDateString('es-MX')}.`
      );
      await loadAll(false);
    } catch (err) {
      setErrorMessage(
        err instanceof Error ? err.message : 'No se pudo emitir el Acta de Créditos.'
      );
    } finally {
      setSyncing(false);
    }
  };

  const handleExportCsv = () => {
    if (!report) return;
    const headers = [
      'Medico',
      'Papel_Anexo_Cl2',
      'Folio_Anexo',
      'Sesiones_Validadas_Docencia',
      'Sesiones_Computables',
      'Pct_Docencia',
      'Pago_Docencia_MXN',
      'Palabras_Vivas_Obra',
      'Palabras_Computables',
      'Ediciones_Ortograficas_Filtradas_Art6',
      'Temas_Autor_Principal_Mayor50Pct',
      'Temas_Coautor',
      'Pct_Obra',
      'Pago_Obra_MXN',
      'Reactivos_Publicados_1u',
      'Casos_Clinicos_EMG_2u',
      'Tareas_Configuracion_1u',
      'Unidades_Editoriales_Computables',
      'Pct_Labor_Editorial',
      'Pago_Labor_Editorial_MXN',
      'Videos_Subidos',
      'Duracion_Videos_Min',
      'Total_Pagar_MXN',
    ];
    const rows = report.physicians.map((p) => [
      `"${p.displayName.replace(/"/g, '""')}"`,
      p.markedRole,
      p.agreementFolio ?? 'SIN_FOLIO',
      p.validatedSessions,
      p.computableSessions,
      p.docenciaSharePct,
      p.docenciaPayoutMxn,
      p.rawSurvivingWords,
      p.computableWords,
      p.orthographicEditsFiltered,
      p.principalAuthorTopics.length,
      p.coauthorTopics.length,
      p.obraSharePct,
      p.obraPayoutMxn,
      p.publishedQuizQuestions + p.publishedExamQuestions,
      p.publishedClinicalCases,
      p.closedConfigTasks,
      p.computableEditorialUnits,
      p.editorialSharePct,
      p.editorialPayoutMxn,
      p.uploadedVideosCount,
      Math.round(p.uploadedVideosDurationSeconds / 60),
      p.totalPayoutMxn,
    ]);
    const csvContent =
      '\uFEFF' + [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `Acta_Creditos_ElectroDX_Ed_${report.editionLabel}_${report.snapshotSha256.slice(0, 8)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleCreateConfigTask = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !taskAssignee || !taskTitle.trim() || !taskBrief.trim()) return;
    setSavingTask(true);
    setErrorMessage(null);
    try {
      await createEditorialConfigTask({
        editionLabel,
        assignedTo: taskAssignee,
        title: taskTitle,
        writtenBrief: taskBrief,
        assignedBy: user.id,
      });
      setTaskTitle('');
      setTaskBrief('');
      setStatusMessage('Encargo de configuración por escrito registrado (Art. 10).');
      await loadAll(false);
    } catch (err) {
      setErrorMessage(err instanceof Error ? err.message : 'No se pudo crear el encargo.');
    } finally {
      setSavingTask(false);
    }
  };

  const handleCloseConfigTask = async (taskId: string) => {
    if (!user) return;
    setSyncing(true);
    try {
      await closeEditorialConfigTaskByDirection({
        taskId,
        closedByDirection: user.id,
        directionNotes: 'Validado y cerrado por Dirección Académica (+1.00 unidad editorial).',
      });
      setStatusMessage('Tarea cerrada por Dirección Académica (+1 unidad editorial acreditada).');
      await loadAll(false);
    } catch (err) {
      setErrorMessage(err instanceof Error ? err.message : 'Error al cerrar la tarea.');
    } finally {
      setSyncing(false);
    }
  };

  const filteredTopics = useMemo(() => {
    if (!report) return [];
    const q = topicSearch.trim().toLowerCase();
    if (!q) return report.topics;
    return report.topics.filter(
      (t) =>
        t.topicTitle.toLowerCase().includes(q) ||
        t.topicId.toLowerCase().includes(q) ||
        t.moduleId.toLowerCase().includes(q)
    );
  }, [report, topicSearch]);

  const physicianNameMap = useMemo(() => {
    const map = new Map<string, string>();
    for (const p of report?.physicians ?? []) {
      map.set(p.physicianId, p.displayName);
    }
    return map;
  }, [report]);

  const combinedLogs = useMemo(() => {
    const dbItems = logs.map((l) => ({
      id: l.id,
      occurredAt: l.occurred_at,
      authorId: l.author_id,
      bagCategory: l.bag_category,
      actionType: l.action_type,
      topicId: l.topic_id ?? l.entity_id,
      deltaWords: l.delta_words,
      deltaUnits: Number(l.delta_editorial_units ?? 0),
      deltaSessions: Number(l.delta_sessions ?? 0),
      durationSeconds: l.duration_seconds,
      legalClauseRef: l.legal_clause_ref,
      summary: l.diff_summary ?? l.action_type,
      sha256: l.payload_sha256,
      source: 'DB_IMMUTABLE' as const,
    }));

    const existingRevIds = new Set(
      logs.map((l) => String((l.metadata as Record<string, unknown>)?.revisionId ?? ''))
    );

    const syntheticItems = (report?.syntheticAuditEvents ?? [])
      .filter((ev) => !existingRevIds.has(ev.revisionId))
      .map((ev) => ({
        id: `syn-${ev.revisionId}`,
        occurredAt: ev.reviewedAt,
        authorId: ev.authorId,
        bagCategory: ev.bagCategory,
        actionType: ev.isOrthographicOrFormatOnly
          ? 'orthographic_filtered_0_words'
          : ev.isMediaOnlyChange
            ? 'media_only_0_words'
            : ev.isReferencesOnlyChange
              ? 'references_only_0_words'
              : 'topic_words_diff_audited',
        topicId: ev.topicId,
        deltaWords: ev.netWordsAdded,
        deltaUnits: 0,
        deltaSessions: 0,
        durationSeconds: null,
        legalClauseRef: ev.legalClauseRef,
        summary: ev.summary,
        sha256: ev.revisionId.slice(0, 12),
        source: 'DIFF_ENGINE' as const,
      }));

    const all = [...dbItems, ...syntheticItems].sort((a, b) =>
      b.occurredAt.localeCompare(a.occurredAt)
    );
    if (logBagFilter === 'all') return all;
    return all.filter((item) => item.bagCategory === logBagFilter);
  }, [logs, report, logBagFilter]);

  if (loading && !report) {
    return (
      <div className="py-12 text-center text-sm text-slate-500">
        Analizando revisiones, tokenizando palabras clínicas y verificando candados contractuales…
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Cabecera de gobernanza y calculadora de bolsas */}
      <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 shadow-xs space-y-4">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <Scale className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
              <h2 className="text-base font-bold text-slate-900 dark:text-white">
                Motor de Conteo Real, Candados por Rol y Acta de Créditos
              </h2>
            </div>
            <p className="text-xs text-slate-500 mt-1 max-w-3xl">
              Audita en tiempo real las 3 bolsas del Contrato (Cláusulas 2, 6, 7, 8 y 10) y el Reglamento Editorial
              (Art. 5–14): excluye el temario base estático, filtra correcciones ortográficas/puntuación (0 palabras,
              Art. 6), evita duplicar pasajes en coautoría (Art. 7), identifica al Autor Principal (&gt;50%, Art. 8) y
              separa videos/clases bajo el principio <em>Hora ≠ Palabra</em> (Art. 13).
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              disabled={syncing}
              onClick={() => void loadAll(true)}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold border border-indigo-200 dark:border-indigo-800 bg-indigo-50 dark:bg-indigo-950/40 text-indigo-700 dark:text-indigo-300 hover:bg-indigo-100 cursor-pointer disabled:opacity-50"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${syncing ? 'animate-spin' : ''}`} />
              Sincronizar atribuciones en BD
            </button>
            <button
              type="button"
              onClick={handleExportCsv}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 hover:bg-slate-50 cursor-pointer"
            >
              <Download className="w-3.5 h-3.5" />
              Exportar Acta CSV
            </button>
            {isAdmin && (
              <>
                <button
                  type="button"
                  disabled={syncing}
                  onClick={() => void handleEmitCreditAct(false)}
                  className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold bg-emerald-600 hover:bg-emerald-700 text-white cursor-pointer disabled:opacity-50"
                >
                  <FileCheck2 className="w-3.5 h-3.5" />
                  Notificar Acta (Plazo 5 días · Art. 16)
                </button>
                <button
                  type="button"
                  disabled={syncing}
                  onClick={() => void handleEmitCreditAct(true)}
                  className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold bg-slate-900 hover:bg-slate-800 dark:bg-white dark:text-slate-900 cursor-pointer disabled:opacity-50"
                >
                  <Lock className="w-3.5 h-3.5" />
                  Congelar Edición (Cl. 10)
                </button>
              </>
            )}
          </div>
        </div>

        {/* Configuración de bolsas económicas de la edición */}
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 pt-2 border-t border-slate-100 dark:border-slate-800">
          <label className="block">
            <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-500">
              Edición / Cohorte
            </span>
            <input
              type="text"
              value={editionLabel}
              onChange={(e) => setEditionLabel(e.target.value)}
              className="mt-1 w-full px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-sm font-semibold"
            />
          </label>
          <label className="block">
            <span className="text-[11px] font-semibold uppercase tracking-wider text-sky-600 dark:text-sky-400">
              Bolsa Docencia (MXN · Cl. 6)
            </span>
            <input
              type="number"
              min={0}
              step={1000}
              value={docenciaPoolMxn}
              onChange={(e) => setDocenciaPoolMxn(Math.max(0, Number(e.target.value) || 0))}
              className="mt-1 w-full px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-sm font-semibold"
            />
          </label>
          <label className="block">
            <span className="text-[11px] font-semibold uppercase tracking-wider text-indigo-600 dark:text-indigo-400">
              Bolsa Obra / Palabras (MXN · Cl. 7)
            </span>
            <input
              type="number"
              min={0}
              step={1000}
              value={obraPoolMxn}
              onChange={(e) => setObraPoolMxn(Math.max(0, Number(e.target.value) || 0))}
              className="mt-1 w-full px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-sm font-semibold"
            />
          </label>
          <label className="block">
            <span className="text-[11px] font-semibold uppercase tracking-wider text-purple-600 dark:text-purple-400">
              Bolsa Labor Editorial (MXN · Cl. 8)
            </span>
            <input
              type="number"
              min={0}
              step={1000}
              value={editorialPoolMxn}
              onChange={(e) => setEditorialPoolMxn(Math.max(0, Number(e.target.value) || 0))}
              className="mt-1 w-full px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-sm font-semibold"
            />
          </label>
        </div>

        {/* Tarjetas KPI de denominadores auditados */}
        {report && (
          <div className="grid grid-cols-2 lg:grid-cols-5 gap-3 pt-2">
            <div className="p-3 rounded-xl bg-sky-50/70 dark:bg-sky-950/30 border border-sky-200/70 dark:border-sky-800/50">
              <span className="text-[11px] font-bold uppercase text-sky-700 dark:text-sky-300">
                Sesiones Computables (Cl. 6)
              </span>
              <p className="text-xl font-black text-slate-900 dark:text-white mt-0.5">
                {report.totals.totalComputableSessions.toFixed(2)}
              </p>
              <span className="text-[11px] text-slate-500">
                Validadas por Dirección Académica
              </span>
            </div>

            <div className="p-3 rounded-xl bg-indigo-50/70 dark:bg-indigo-950/30 border border-indigo-200/70 dark:border-indigo-800/50">
              <span className="text-[11px] font-bold uppercase text-indigo-700 dark:text-indigo-300">
                Palabras Netas de Obra (Cl. 7)
              </span>
              <p className="text-xl font-black text-slate-900 dark:text-white mt-0.5">
                {report.totals.totalPublishedAuthoredWords.toLocaleString('es-MX')}
              </p>
              <span className="text-[11px] text-slate-500">
                Excluye {report.totals.totalPlatformBaselineWords.toLocaleString('es-MX')} palabras base
              </span>
            </div>

            <div className="p-3 rounded-xl bg-purple-50/70 dark:bg-purple-950/30 border border-purple-200/70 dark:border-purple-800/50">
              <span className="text-[11px] font-bold uppercase text-purple-700 dark:text-purple-300">
                Unidades Editoriales (Art. 10)
              </span>
              <p className="text-xl font-black text-slate-900 dark:text-white mt-0.5">
                {report.totals.totalComputableEditorialUnits.toFixed(1)} u.
              </p>
              <span className="text-[11px] text-slate-500">
                Reactivo=1u · Caso=2u · Config=1u
              </span>
            </div>

            <div className="p-3 rounded-xl bg-amber-50/70 dark:bg-amber-950/30 border border-amber-200/70 dark:border-amber-800/50">
              <span className="text-[11px] font-bold uppercase text-amber-800 dark:text-amber-300">
                Filtro Ortográfico (Art. 6)
              </span>
              <p className="text-xl font-black text-slate-900 dark:text-white mt-0.5">
                {report.totals.totalOrthographicEditsFiltered}
              </p>
              <span className="text-[11px] text-slate-500">
                Ajustes de 1 letra/tilde = 0 palabras
              </span>
            </div>

            <div className="p-3 rounded-xl bg-slate-100 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700">
              <span className="text-[11px] font-bold uppercase text-slate-600 dark:text-slate-300">
                Huella SHA-256 del Acta
              </span>
              <p className="text-xs font-mono font-bold text-slate-900 dark:text-white mt-1.5 truncate">
                {report.snapshotSha256}
              </p>
              <span className="text-[11px] text-slate-500">
                {report.physicians.length} médicos auditados
              </span>
            </div>
          </div>
        )}

        {statusMessage && (
          <div className="p-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-xs text-emerald-800 dark:text-emerald-200 flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 shrink-0" />
            <span>{statusMessage}</span>
          </div>
        )}
        {errorMessage && (
          <div className="p-3 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 text-xs text-rose-700 dark:text-rose-200 flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 shrink-0" />
            <span>{errorMessage}</span>
          </div>
        )}
      </div>

      {/* Selector de sub-vistas */}
      <div className="flex flex-wrap gap-2">
        {(
          [
            {
              id: 'medicos',
              label: '1. Liquidación por Médico y Candados (Cl. 2, 6, 7, 8)',
              icon: Award,
            },
            {
              id: 'temas',
              label: '2. Coautoría por Tema y Autor Principal >50% (Art. 5–8)',
              icon: BookOpen,
            },
            {
              id: 'bitacora',
              label: '3. Bitácora Legal Inmutable (Logs SHA-256)',
              icon: ShieldCheck,
            },
            {
              id: 'encargos',
              label: '4. Tareas de Configuración por Escrito (Art. 10 = 1u)',
              icon: ClipboardCheck,
            },
          ] as const
        ).map(({ id, label, icon: Icon }) => (
          <button
            key={id}
            type="button"
            onClick={() => setSubView(id)}
            className={`inline-flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold border cursor-pointer transition ${
              subView === id
                ? 'bg-indigo-600 text-white border-indigo-600 shadow-xs'
                : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:bg-slate-50'
            }`}
          >
            <Icon className="w-3.5 h-3.5" />
            <span>{label}</span>
          </button>
        ))}
      </div>

      {/* SUB-VISTA 1: TABLA POR MÉDICO */}
      {subView === 'medicos' && report && (
        <div className="overflow-x-auto rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-xs">
          <table className="w-full text-xs text-left">
            <thead className="bg-slate-50 dark:bg-slate-800/80 text-[11px] uppercase text-slate-500 border-b border-slate-200 dark:border-slate-700">
              <tr>
                <th className="px-4 py-3">Médico / Papel Anexo (Cl. 2)</th>
                <th className="px-4 py-3">Bolsa 1: Docencia (Cl. 6)</th>
                <th className="px-4 py-3">Bolsa 2: Obra / Palabras (Cl. 7 · Art. 5–8)</th>
                <th className="px-4 py-3">Bolsa 3: Labor Editorial (Cl. 8 · Art. 10)</th>
                <th className="px-4 py-3">Multimedia (Art. 13: Hora ≠ Palabra)</th>
                <th className="px-4 py-3 text-right">Total Liquidación</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {report.physicians.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-4 py-10 text-center text-slate-500">
                    No se encontraron médicos con convenios ni aportaciones registradas.
                  </td>
                </tr>
              ) : (
                report.physicians.map((p) => {
                  const roleBadge = ROLE_LABELS[p.markedRole] ?? ROLE_LABELS.sin_convenio;
                  return (
                    <tr key={p.physicianId} className="hover:bg-slate-50/60 dark:hover:bg-slate-800/30 align-top">
                      {/* Médico y Rol */}
                      <td className="px-4 py-3.5 min-w-[210px]">
                        <p className="font-bold text-slate-900 dark:text-white text-sm">
                          {p.displayName}
                        </p>
                        {p.credentials && (
                          <p className="text-[11px] text-slate-500">{p.credentials}</p>
                        )}
                        <span
                          className={`inline-flex items-center gap-1 mt-1.5 px-2 py-0.5 rounded-full text-[10px] font-bold border ${roleBadge.cls}`}
                        >
                          {p.markedRole === 'sin_convenio' ? (
                            <Lock className="w-3 h-3" />
                          ) : (
                            <Unlock className="w-3 h-3" />
                          )}
                          {roleBadge.label}
                        </span>
                        {p.agreementFolio && (
                          <p className="text-[10px] font-mono text-slate-400 mt-1">
                            Folio: {p.agreementFolio}
                          </p>
                        )}
                        {p.excludedContributionsWarnings.map((w, i) => (
                          <p
                            key={i}
                            className="mt-1.5 p-1.5 rounded-lg bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 text-[10px] text-amber-800 dark:text-amber-200"
                          >
                            ⚠️ {w}
                          </p>
                        ))}
                      </td>

                      {/* Bolsa 1: Docencia */}
                      <td className="px-4 py-3.5 min-w-[175px]">
                        <div className="flex items-center justify-between">
                          <span className="font-bold text-slate-900 dark:text-white">
                            {p.computableSessions.toFixed(2)} sesiones
                          </span>
                          <span className="text-[11px] font-semibold text-sky-600 dark:text-sky-400">
                            {p.docenciaSharePct.toFixed(2)}%
                          </span>
                        </div>
                        <p className="text-[11px] text-slate-500 mt-0.5">
                          Impartidas: {p.rawCompletedSessions.toFixed(1)} · Validadas Dir.:{' '}
                          {p.validatedSessions.toFixed(1)}
                        </p>
                        <p className="text-[11px] text-slate-400">
                          Tiempo en aula: {p.totalTeachingMinutes} min
                        </p>
                        <p className="mt-1 font-bold text-sky-700 dark:text-sky-300">
                          {formatCurrency(p.docenciaPayoutMxn)}
                        </p>
                      </td>

                      {/* Bolsa 2: Obra */}
                      <td className="px-4 py-3.5 min-w-[230px]">
                        <div className="flex items-center justify-between">
                          <span className="font-bold text-slate-900 dark:text-white">
                            {p.computableWords.toLocaleString('es-MX')} palabras
                          </span>
                          <span className="text-[11px] font-semibold text-indigo-600 dark:text-indigo-400">
                            {p.obraSharePct.toFixed(2)}%
                          </span>
                        </div>
                        <p className="text-[11px] text-slate-500 mt-0.5">
                          Vivas brutas: {p.rawSurvivingWords.toLocaleString('es-MX')} · Ortografía filtrada (Art. 6):{' '}
                          {p.orthographicEditsFiltered}
                        </p>
                        <div className="mt-1 flex flex-wrap gap-1">
                          {p.principalAuthorTopics.length > 0 && (
                            <span className="px-1.5 py-0.5 rounded bg-indigo-100 dark:bg-indigo-950/60 text-indigo-800 dark:text-indigo-200 text-[10px] font-bold">
                              ★ Autor Principal (&gt;50%): {p.principalAuthorTopics.length} tema(s)
                            </span>
                          )}
                          {p.coauthorTopics.length > 0 && (
                            <span className="px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 text-[10px]">
                              Coautor: {p.coauthorTopics.length} tema(s)
                            </span>
                          )}
                        </div>
                        <p className="mt-1 font-bold text-indigo-700 dark:text-indigo-300">
                          {formatCurrency(p.obraPayoutMxn)}
                        </p>
                      </td>

                      {/* Bolsa 3: Labor Editorial */}
                      <td className="px-4 py-3.5 min-w-[200px]">
                        <div className="flex items-center justify-between">
                          <span className="font-bold text-slate-900 dark:text-white">
                            {p.computableEditorialUnits.toFixed(1)} unidades
                          </span>
                          <span className="text-[11px] font-semibold text-purple-600 dark:text-purple-400">
                            {p.editorialSharePct.toFixed(2)}%
                          </span>
                        </div>
                        <p className="text-[11px] text-slate-500 mt-0.5">
                          • Reactivos (1u): {p.publishedQuizQuestions + p.publishedExamQuestions}
                          <br />• Casos EMG (2u): {p.publishedClinicalCases} ({p.publishedClinicalCases * 2}u)
                          <br />• Config. cerrada Dir. (1u): {p.closedConfigTasks}
                        </p>
                        <p className="mt-1 font-bold text-purple-700 dark:text-purple-300">
                          {formatCurrency(p.editorialPayoutMxn)}
                        </p>
                      </td>

                      {/* Multimedia (Hora != Palabra) */}
                      <td className="px-4 py-3.5 min-w-[180px] text-[11px] text-slate-600 dark:text-slate-300">
                        <p>
                          🎬 Videos en temas: <strong>{p.uploadedVideosCount}</strong> (
                          {formatDurationMinutes(p.uploadedVideosDurationSeconds)})
                        </p>
                        <p>
                          🖼️ Figuras/Imágenes: <strong>{p.uploadedImagesCount}</strong>
                        </p>
                        <p>
                          📄 Guías PDF: <strong>{p.uploadedPdfsCount}</strong>
                        </p>
                        <span className="inline-block mt-1 text-[10px] text-slate-400">
                          Art. 13: no inflan palabras de Obra
                        </span>
                      </td>

                      {/* Total */}
                      <td className="px-4 py-3.5 text-right font-black text-sm text-emerald-700 dark:text-emerald-400 whitespace-nowrap">
                        {formatCurrency(p.totalPayoutMxn)}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* SUB-VISTA 2: AUDITORÍA GRANULAR POR TEMA Y UMBRAL >50% */}
      {subView === 'temas' && report && (
        <div className="space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <input
              type="search"
              value={topicSearch}
              onChange={(e) => setTopicSearch(e.target.value)}
              placeholder="Buscar por título o ID de tema (ej. conduccion-nerviosa)..."
              className="w-full sm:w-96 px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs"
            />
            <span className="text-xs text-slate-500">
              Mostrando {filteredTopics.length} temas con actividad o publicados
            </span>
          </div>

          <div className="grid gap-3">
            {filteredTopics.map((t) => (
              <div
                key={t.topicId}
                className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-4 shadow-xs"
              >
                <div className="flex flex-wrap items-start justify-between gap-2 pb-3 border-b border-slate-100 dark:border-slate-800">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-[10px] font-mono text-slate-600 dark:text-slate-300">
                        {t.moduleId} / {t.topicId}
                      </span>
                      <h3 className="font-bold text-sm text-slate-900 dark:text-white">
                        {t.topicTitle}
                      </h3>
                    </div>
                    <p className="text-xs text-slate-500 mt-1">
                      Palabras totales en el tema: <strong>{t.totalAllWords.toLocaleString('es-MX')}</strong> ·
                      Base estática excluida: <strong>{t.baselineWords.toLocaleString('es-MX')}</strong> ·
                      Palabras netas de médicos (Bolsa Obra):{' '}
                      <strong className="text-indigo-600 dark:text-indigo-400">
                        {t.totalAuthoredWords.toLocaleString('es-MX')}
                      </strong>
                    </p>
                  </div>

                  <div className="flex flex-wrap items-center gap-2 text-[11px]">
                    {t.embeddedMediaSummary.videosCount > 0 && (
                      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-blue-50 dark:bg-blue-950/40 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800 font-semibold">
                        <Video className="w-3 h-3" />
                        {t.embeddedMediaSummary.videosCount} video(s) ·{' '}
                        {t.embeddedMediaSummary.totalVideoDurationSeconds > 0
                          ? formatDurationMinutes(t.embeddedMediaSummary.totalVideoDurationSeconds)
                          : 'duración previa sin declarar'}
                      </span>
                    )}
                    {t.embeddedMediaSummary.imagesCount > 0 && (
                      <span className="px-2.5 py-1 rounded-full bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 font-semibold">
                        🖼️ {t.embeddedMediaSummary.imagesCount} fig.
                      </span>
                    )}
                    {t.embeddedMediaSummary.referencesCount > 0 && (
                      <span className="px-2.5 py-1 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 font-semibold">
                        📚 {t.embeddedMediaSummary.referencesCount} citas (excluidas de Obra)
                      </span>
                    )}
                  </div>
                </div>

                {t.requiresDirectionTieBreak && (
                  <div className="mt-3 p-2.5 rounded-xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 text-xs text-amber-800 dark:text-amber-200">
                    ⚖️ <strong>Reglamento Art. 8:</strong> Hay coautoría pero ningún médico supera individualmente el{' '}
                    <code>&gt;50%</code> de las palabras del tema. La Dirección Académica define el orden de aparición
                    según el aporte listado abajo.
                  </div>
                )}

                {t.attributions.length === 0 ? (
                  <p className="mt-3 text-xs text-slate-400">
                    100% contenido base de la plataforma (sin palabras nuevas aportadas por médicos).
                  </p>
                ) : (
                  <div className="mt-3 grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
                    {t.attributions.map((attr) => {
                      const name = attr.author_id
                        ? physicianNameMap.get(attr.author_id) ?? attr.author_id.slice(0, 8)
                        : 'Plataforma';
                      return (
                        <div
                          key={`${t.topicId}:${attr.author_id}`}
                          className={`p-3 rounded-xl border text-xs ${
                            attr.is_principal_author
                              ? 'border-indigo-300 bg-indigo-50/50 dark:border-indigo-700 dark:bg-indigo-950/30'
                              : 'border-slate-200 bg-slate-50/50 dark:border-slate-800 dark:bg-slate-800/40'
                          }`}
                        >
                          <div className="flex items-center justify-between gap-2">
                            <span className="font-bold text-slate-900 dark:text-white truncate">
                              #{attr.author_rank <= 50 ? attr.author_rank : '—'} · {name}
                            </span>
                            {attr.is_principal_author ? (
                              <span className="px-2 py-0.5 rounded-full bg-indigo-600 text-white text-[10px] font-bold">
                                Autor Principal (&gt;50%)
                              </span>
                            ) : attr.surviving_words > 0 ? (
                              <span className="px-2 py-0.5 rounded-full bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-200 text-[10px] font-semibold">
                                Coautor
                              </span>
                            ) : (
                              <span className="px-2 py-0.5 rounded-full bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-300 text-[10px] font-semibold">
                                0 palabras (Art. 6 / Media)
                              </span>
                            )}
                          </div>
                          <p className="mt-1.5 text-slate-600 dark:text-slate-300">
                            Palabras vivas: <strong>{attr.surviving_words.toLocaleString('es-MX')}</strong> (
                            <strong>{attr.author_share_pct}%</strong> del tema)
                          </p>
                          {attr.orthographic_edits_ignored > 0 && (
                            <p className="mt-0.5 text-[11px] text-amber-700 dark:text-amber-300">
                              Filtro Art. 6: {attr.orthographic_edits_ignored} cambio(s) ortográfico/1 letra no sumado(s)
                            </p>
                          )}
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* SUB-VISTA 3: BITÁCORA LEGAL INMUTABLE */}
      {subView === 'bitacora' && (
        <div className="space-y-4">
          <div className="flex flex-wrap items-center gap-2">
            <Filter className="w-4 h-4 text-slate-400" />
            {(
              [
                { id: 'all', label: 'Todos los eventos' },
                { id: 'obra', label: 'Bolsa Obra (Palabras)' },
                { id: 'editorial', label: 'Bolsa Labor Editorial (Unidades)' },
                { id: 'docencia', label: 'Bolsa Docencia (Sesiones)' },
                { id: 'excluded', label: 'Excluidos (Art. 6 Ortografía / Art. 13 Videos)' },
                { id: 'governance', label: 'Gobernanza y Acta (Cl. 10)' },
              ] as const
            ).map((f) => (
              <button
                key={f.id}
                type="button"
                onClick={() => setLogBagFilter(f.id)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold border cursor-pointer ${
                  logBagFilter === f.id
                    ? 'bg-slate-900 text-white border-slate-900 dark:bg-white dark:text-slate-900'
                    : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-700'
                }`}
              >
                {f.label}
              </button>
            ))}
          </div>

          <div className="overflow-x-auto rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900">
            <table className="w-full text-xs text-left">
              <thead className="bg-slate-50 dark:bg-slate-800/80 text-[11px] uppercase text-slate-500 border-b border-slate-200 dark:border-slate-700">
                <tr>
                  <th className="px-4 py-3">Fecha / Origen</th>
                  <th className="px-4 py-3">Médico</th>
                  <th className="px-4 py-3">Bolsa / Clasificación Legal</th>
                  <th className="px-4 py-3">Detalle Técnico y Cláusula Aplicada</th>
                  <th className="px-4 py-3 text-right">Impacto</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {combinedLogs.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-4 py-10 text-center text-slate-500">
                      No hay registros en este filtro.
                    </td>
                  </tr>
                ) : (
                  combinedLogs.map((item) => {
                    const bagInfo = BAG_BADGES[item.bagCategory] ?? BAG_BADGES.excluded;
                    const authorName = item.authorId
                      ? physicianNameMap.get(item.authorId) ?? item.authorId.slice(0, 8)
                      : 'Sistema / Dirección';
                    return (
                      <tr key={item.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30 align-top">
                        <td className="px-4 py-3 whitespace-nowrap text-slate-500">
                          <div>{new Date(item.occurredAt).toLocaleString('es-MX')}</div>
                          <span className="inline-block mt-0.5 font-mono text-[10px] text-slate-400">
                            {item.source === 'DB_IMMUTABLE' ? '🔒 Log SQL' : '⚡ Motor Diff'} ·{' '}
                            {item.sha256 ? item.sha256.slice(0, 10) : '—'}
                          </span>
                        </td>
                        <td className="px-4 py-3 font-semibold text-slate-900 dark:text-white">
                          {authorName}
                          {item.topicId && (
                            <span className="block text-[10px] font-mono text-slate-400">
                              {item.topicId}
                            </span>
                          )}
                        </td>
                        <td className="px-4 py-3">
                          <span
                            className={`inline-block px-2 py-0.5 rounded-full text-[10px] font-bold border ${bagInfo.cls}`}
                          >
                            {bagInfo.label}
                          </span>
                        </td>
                        <td className="px-4 py-3 max-w-xl">
                          <p className="font-medium text-slate-800 dark:text-slate-100">{item.summary}</p>
                          <p className="text-[11px] text-slate-500 mt-0.5">📜 {item.legalClauseRef}</p>
                        </td>
                        <td className="px-4 py-3 text-right font-mono font-bold whitespace-nowrap">
                          {item.deltaWords !== 0 && (
                            <span className="block text-indigo-600 dark:text-indigo-400">
                              +{item.deltaWords} palabras
                            </span>
                          )}
                          {item.deltaUnits !== 0 && (
                            <span className="block text-purple-600 dark:text-purple-400">
                              +{item.deltaUnits} u. ed.
                            </span>
                          )}
                          {item.deltaSessions !== 0 && (
                            <span className="block text-sky-600 dark:text-sky-400">
                              +{item.deltaSessions} sesión
                            </span>
                          )}
                          {item.durationSeconds != null && item.durationSeconds > 0 && (
                            <span className="block text-amber-600 dark:text-amber-400">
                              ⏱ {formatDurationMinutes(item.durationSeconds)}
                            </span>
                          )}
                          {item.deltaWords === 0 &&
                            item.deltaUnits === 0 &&
                            item.deltaSessions === 0 && (
                              <span className="text-slate-400">0 (Excluido)</span>
                            )}
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* SUB-VISTA 4: TAREAS DE CONFIGURACIÓN POR ESCRITO (ART. 10 = 1 UNIDAD) */}
      {subView === 'encargos' && (
        <div className="grid gap-6 lg:grid-cols-[22rem_1fr]">
          <form
            onSubmit={handleCreateConfigTask}
            className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-4 space-y-3 h-fit"
          >
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-purple-600" />
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                Nuevo Encargo por Escrito (Art. 10)
              </h3>
            </div>
            <p className="text-xs text-slate-500">
              Conforme al Artículo 10 del Reglamento Editorial, cada tarea de configuración encargada por escrito y
              cerrada por la Dirección Académica acredita <strong>1.00 unidad editorial</strong>.
            </p>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
              Médico asignado *
              <select
                required
                value={taskAssignee}
                onChange={(e) => setTaskAssignee(e.target.value)}
                className="mt-1 w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs"
              >
                <option value="">Selecciona un médico…</option>
                {(report?.physicians ?? []).map((p) => (
                  <option key={p.physicianId} value={p.physicianId}>
                    {p.displayName} ({p.markedRole})
                  </option>
                ))}
              </select>
            </label>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
              Título de la tarea *
              <input
                type="text"
                required
                value={taskTitle}
                onChange={(e) => setTaskTitle(e.target.value)}
                placeholder="Ej. Estructuración de parámetros normativos de plexo braquial"
                className="mt-1 w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs"
              />
            </label>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
              Instrucción / Alcance por escrito *
              <textarea
                rows={3}
                required
                value={taskBrief}
                onChange={(e) => setTaskBrief(e.target.value)}
                placeholder="Detalle verificable del encargo editorial o de configuración..."
                className="mt-1 w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs"
              />
            </label>
            <button
              type="submit"
              disabled={savingTask || !isAdmin}
              className="w-full inline-flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-700 text-white text-xs font-bold cursor-pointer disabled:opacity-50"
            >
              <Plus className="w-4 h-4" />
              Registrar Encargo por Escrito (1 u.)
            </button>
          </form>

          <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-4">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white mb-3">
              Historial de Encargos de Configuración (Edición {editionLabel})
            </h3>
            {configTasks.length === 0 ? (
              <p className="text-xs text-slate-500 py-8 text-center">
                No hay tareas de configuración registradas todavía.
              </p>
            ) : (
              <div className="space-y-2.5">
                {configTasks.map((t) => {
                  const assigneeName =
                    physicianNameMap.get(t.assigned_to) ?? t.assigned_to.slice(0, 8);
                  const isClosed = t.status === 'closed_by_direction';
                  return (
                    <div
                      key={t.id}
                      className="p-3.5 rounded-xl border border-slate-200 dark:border-slate-700 flex flex-wrap items-center justify-between gap-3"
                    >
                      <div className="space-y-1 max-w-xl">
                        <div className="flex items-center gap-2">
                          <span
                            className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                              isClosed
                                ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-200'
                                : 'bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-200'
                            }`}
                          >
                            {isClosed ? '✓ Cerrada por Dirección (+1.0 u.)' : 'Pendiente de cierre'}
                          </span>
                          <span className="font-bold text-xs text-slate-900 dark:text-white">
                            {t.title}
                          </span>
                        </div>
                        <p className="text-xs text-slate-600 dark:text-slate-300">{t.written_brief}</p>
                        <p className="text-[11px] text-slate-400">
                          Asignado a: <strong>{assigneeName}</strong> ·{' '}
                          {new Date(t.assigned_at).toLocaleDateString('es-MX')}
                        </p>
                      </div>
                      {!isClosed && isAdmin && (
                        <button
                          type="button"
                          onClick={() => void handleCloseConfigTask(t.id)}
                          className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold cursor-pointer"
                        >
                          Cerrar y Acreditar 1 u.
                        </button>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

