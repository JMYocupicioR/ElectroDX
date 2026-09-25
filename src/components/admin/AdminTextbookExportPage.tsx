import { useEffect, useMemo, useRef, useState, type ReactNode } from 'react';
import { Link } from 'react-router-dom';
import {
  AlertTriangle,
  BookMarked,
  ChevronDown,
  FileDown,
  FileText,
  Save,
  Trash2,
} from 'lucide-react';
import { AdminLayout } from './AdminLayout';
import { TextbookModuleTree } from './TextbookModuleTree';
import { useSyllabusCatalog } from '../../hooks/useSyllabusCatalog';
import {
  buildTextbookModel,
  type TextbookCover,
  type TextbookInclusion,
  type TextbookLang,
  type TextbookModel,
} from '../../pdf/textbook/buildTextbookModel';
import { loadTextbookContributors } from '../../pdf/textbook/loadTextbookContributors';
import { toggleAuthorDisabled, type TextbookCreditOptions, type TopicPrintOverride } from '../../pdf/textbook/textbookOptions';
import type { TextbookContributor } from '../../pdf/textbook/textbookCredits';
import { TextbookDocument } from '../../pdf/textbook/TextbookDocument';
import { openTextbookPrintOverlay } from '../../pdf/textbook/useTextbookPrint';
import type { FailedBookImage } from '../../pdf/textbook/inlineBookImages';
import {
  deleteTextbookPreset,
  loadTextbookDraft,
  loadTextbookPresets,
  saveTextbookDraft,
  saveTextbookPreset,
  type TextbookDraft,
  type TextbookPreset,
} from '../../pdf/textbook/textbookPresets';
import {
  DEFAULT_TEXTBOOK_THEME,
  TEXTBOOK_FONTS,
  resolveTextbookTheme,
  textbookPageHeightMm,
  textbookPageWidthMm,
  type TextbookPageSize,
  type TextbookTheme,
} from '../../pdf/textbook/textbookTheme';

const LARGE_BOOK_LESSONS = 120;

const INCLUSION_LABELS: { key: keyof TextbookInclusion; label: string; hint: string }[] = [
  { key: 'description', label: 'Descripciones', hint: 'Subtítulo de cada tema' },
  { key: 'body', label: 'Cuerpo de la lección', hint: 'Texto principal del temario' },
  { key: 'pearls', label: 'Perlas clínicas', hint: 'Recuadros de práctica' },
  { key: 'keyPoints', label: 'Puntos clave', hint: 'Cierre de cada lección' },
  { key: 'images', label: 'Imágenes', hint: 'Figuras con pie de foto' },
  { key: 'bibliography', label: 'Bibliografía', hint: 'Referencias por sección y apéndice' },
  { key: 'teachingPdfs', label: 'PDFs docentes', hint: 'Cita, sin incrustar el archivo' },
];

const fieldClass =
  'mt-1 w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-950 px-3 py-2 text-sm text-slate-900 dark:text-white';

const MM_TO_PX = 96 / 25.4;

function countLabel(count: number, singular: string, plural: string) {
  return `${count} ${count === 1 ? singular : plural}`;
}

function StatChip({ children }: { children: ReactNode }) {
  return (
    <span className="inline-flex items-center rounded-full border border-slate-200 bg-slate-50 px-2.5 py-1 text-xs font-semibold text-slate-700 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-200">
      {children}
    </span>
  );
}

function FoldSection({
  title,
  summary,
  defaultOpen = false,
  children,
  trailing,
}: {
  title: string;
  summary?: string;
  defaultOpen?: boolean;
  children: ReactNode;
  trailing?: ReactNode;
}) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900">
      <div className="flex items-start gap-2">
        <button
          type="button"
          className="flex min-h-11 flex-1 items-center justify-between gap-3 text-left"
          aria-expanded={open}
          onClick={() => setOpen((value) => !value)}
        >
          <span className="min-w-0">
            <span className="block text-sm font-bold text-slate-900 dark:text-white">{title}</span>
            {!open && summary && <span className="mt-0.5 block truncate text-xs text-slate-500">{summary}</span>}
          </span>
          <ChevronDown className={`h-4 w-4 shrink-0 text-slate-400 transition ${open ? 'rotate-180' : ''}`} />
        </button>
        {trailing}
      </div>
      {open && <div className="mt-3">{children}</div>}
    </section>
  );
}

function FittedBookPreview({
  pageWidthMm,
  pageHeightMm,
  children,
}: {
  pageWidthMm: number;
  pageHeightMm: number;
  children: ReactNode;
}) {
  const frameRef = useRef<HTMLDivElement>(null);
  const sheetRef = useRef<HTMLDivElement>(null);
  const [scale, setScale] = useState(0.45);
  const [sheetHeight, setSheetHeight] = useState(pageHeightMm * MM_TO_PX);

  useEffect(() => {
    const frame = frameRef.current;
    if (!frame) return undefined;
    const update = () => {
      const pad = 28;
      const availW = Math.max(160, frame.clientWidth - pad);
      const availH = Math.max(220, frame.clientHeight - pad);
      const pageW = pageWidthMm * MM_TO_PX;
      const pageH = pageHeightMm * MM_TO_PX;
      const next = Math.min(availW / pageW, availH / pageH, 1);
      setScale(Number.isFinite(next) && next > 0 ? next : 0.45);
    };
    update();
    const observer = new ResizeObserver(update);
    observer.observe(frame);
    return () => observer.disconnect();
  }, [pageWidthMm, pageHeightMm]);

  useEffect(() => {
    const sheet = sheetRef.current;
    if (!sheet) return undefined;
    const update = () => setSheetHeight(sheet.scrollHeight);
    update();
    const observer = new ResizeObserver(update);
    observer.observe(sheet);
    return () => observer.disconnect();
  }, [pageHeightMm, pageWidthMm]);

  const pageW = pageWidthMm * MM_TO_PX;
  const pageH = Math.max(sheetHeight, pageHeightMm * MM_TO_PX);

  return (
    <div ref={frameRef} className="book-preview-host min-h-0 flex-1 overflow-auto bg-[#64748b] p-3">
      <div style={{ width: pageW * scale, height: pageH * scale, margin: '0 auto' }}>
        <div ref={sheetRef} style={{ width: pageW, transform: `scale(${scale})`, transformOrigin: 'top left' }}>
          {children}
        </div>
      </div>
    </div>
  );
}

function ThemeSlider({
  label,
  value,
  min,
  max,
  step,
  unit,
  onChange,
}: {
  label: string;
  value: number;
  min: number;
  max: number;
  step: number;
  unit: string;
  onChange: (value: number) => void;
}) {
  return (
    <label className="block text-xs font-semibold text-slate-500">
      <span className="flex justify-between gap-2">
        <span>{label}</span>
        <span className="tabular-nums text-slate-700 dark:text-slate-200">{value}{unit}</span>
      </span>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className="mt-1 w-full accent-indigo-600"
      />
    </label>
  );
}

export default function AdminTextbookExportPage() {
  const { modulesWithOverrides, modulesForStaff, overrides, publishedTopics, loading } = useSyllabusCatalog();
  const initial = useMemo(() => loadTextbookDraft(), []);

  const [cover, setCover] = useState<TextbookCover>(initial.cover);
  const [inclusion, setInclusion] = useState<TextbookInclusion>(initial.inclusion);
  const [lang, setLang] = useState<TextbookLang>(initial.lang);
  const [includeHidden, setIncludeHidden] = useState(initial.includeHidden);
  const [skipEmptyContainers, setSkipEmptyContainers] = useState(initial.skipEmptyContainers);
  const [selectedModuleIds, setSelectedModuleIds] = useState<string[]>(initial.selectedModuleIds);
  const [previewModuleId, setPreviewModuleId] = useState<string | null>(initial.previewModuleId ?? null);
  const [theme, setTheme] = useState<TextbookTheme>(initial.theme);
  const [creditOptions, setCreditOptions] = useState<TextbookCreditOptions>(initial.creditOptions);
  const [topicOverrides, setTopicOverrides] = useState<Record<string, TopicPrintOverride>>(initial.topicOverrides);
  const [contributors, setContributors] = useState<TextbookContributor[]>([]);
  const [topicEditedAt, setTopicEditedAt] = useState<Record<string, string>>({});
  const [hydratedSelection, setHydratedSelection] = useState(false);

  const [presets, setPresets] = useState<TextbookPreset[]>(() => loadTextbookPresets());
  const [presetName, setPresetName] = useState('');
  const [presetNotice, setPresetNotice] = useState<string | null>(null);
  const [presetsOpen, setPresetsOpen] = useState(false);

  const [printModel, setPrintModel] = useState<TextbookModel | null>(null);
  const [failedImages, setFailedImages] = useState<FailedBookImage[]>([]);
  const [confirmLarge, setConfirmLarge] = useState<'print' | 'word' | null>(null);
  const [wordBusy, setWordBusy] = useState(false);
  const [wordError, setWordError] = useState<string | null>(null);

  const sourceModules = includeHidden ? modulesForStaff : modulesWithOverrides;
  const hiddenTopicIds = useMemo(
    () => new Set(overrides.filter((row) => row.is_visible === false).map((row) => row.topic_id)),
    [overrides]
  );

  const draft: TextbookDraft = useMemo(
    () => ({
      cover,
      inclusion,
      lang,
      selectedModuleIds,
      includeHidden,
      skipEmptyContainers,
      previewModuleId: previewModuleId ?? undefined,
      theme,
      creditOptions,
      topicOverrides,
    }),
    [cover, creditOptions, includeHidden, inclusion, lang, previewModuleId, selectedModuleIds, skipEmptyContainers, theme, topicOverrides]
  );

  useEffect(() => {
    if (hydratedSelection || !sourceModules.length) return;
    const valid = new Set(sourceModules.map((mod) => mod.id));
    const restored = selectedModuleIds.filter((id) => valid.has(id));
    setSelectedModuleIds(restored.length ? restored : sourceModules.map((mod) => mod.id));
    if (!previewModuleId || !valid.has(previewModuleId)) {
      setPreviewModuleId((restored[0] ?? sourceModules[0]?.id) ?? null);
    }
    setHydratedSelection(true);
  }, [hydratedSelection, previewModuleId, selectedModuleIds, sourceModules]);

  useEffect(() => {
    if (!hydratedSelection) return;
    saveTextbookDraft(draft);
  }, [draft, hydratedSelection]);

  useEffect(() => {
    let cancelled = false;
    void loadTextbookContributors(publishedTopics, sourceModules, creditOptions.showCredentials)
      .then((result) => {
        if (cancelled) return;
        setContributors(result.contributors);
        setTopicEditedAt(result.topicEditedAt);
      })
      .catch(() => {
        if (!cancelled) {
          setContributors([]);
          setTopicEditedAt({});
        }
      });
    return () => {
      cancelled = true;
    };
  }, [creditOptions.showCredentials, publishedTopics, sourceModules]);

  const buildOptions = useMemo(
    () => ({
      modules: sourceModules,
      selectedModuleIds,
      lang,
      inclusion,
      cover,
      includeHidden,
      skipEmptyContainers,
      hiddenTopicIds,
      contributors,
      creditOptions,
      topicOverrides,
      topicEditedAt,
    }),
    [contributors, cover, creditOptions, hiddenTopicIds, includeHidden, inclusion, lang, selectedModuleIds, skipEmptyContainers, sourceModules, topicEditedAt, topicOverrides]
  );

  const fullModel = useMemo(() => buildTextbookModel(buildOptions), [buildOptions]);
  const previewModel = useMemo(() => {
    if (!previewModuleId) return null;
    return buildTextbookModel({
      ...buildOptions,
      selectedModuleIds: [previewModuleId],
    });
  }, [buildOptions, previewModuleId]);

  useEffect(() => {
    if (!printModel) return undefined;
    return openTextbookPrintOverlay({
      model: printModel,
      theme,
      onClose: () => setPrintModel(null),
      onResult: (result) => setFailedImages(result.images.failed),
    });
    // Intentionally omit theme: the overlay should keep the typeface chosen at generate time.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [printModel]);

  const applyDraft = (next: TextbookDraft) => {
    setCover(next.cover);
    setInclusion(next.inclusion);
    setLang(next.lang);
    setIncludeHidden(next.includeHidden);
    setSkipEmptyContainers(next.skipEmptyContainers);
    setSelectedModuleIds(next.selectedModuleIds);
    setPreviewModuleId(next.previewModuleId ?? next.selectedModuleIds[0] ?? null);
    setTheme(resolveTextbookTheme(next.theme));
    setCreditOptions(next.creditOptions);
    setTopicOverrides(next.topicOverrides);
  };

  const toggleModule = (id: string) => {
    setSelectedModuleIds((current) => {
      const next = current.includes(id) ? current.filter((item) => item !== id) : [...current, id];
      if (previewModuleId && !next.includes(previewModuleId)) {
        setPreviewModuleId(next[0] ?? null);
      }
      return next;
    });
  };

  const startPrint = (model: TextbookModel, force = false) => {
    if (model.stats.lessons >= LARGE_BOOK_LESSONS && !force) {
      setConfirmLarge('print');
      return;
    }
    setConfirmLarge(null);
    setFailedImages([]);
    setPrintModel(model);
  };

  const startWord = async (model: TextbookModel, force = false) => {
    if (model.stats.lessons >= LARGE_BOOK_LESSONS && !force) {
      setConfirmLarge('word');
      return;
    }
    setConfirmLarge(null);
    setWordError(null);
    setWordBusy(true);
    try {
      const { downloadTextbookDocx } = await import('../../pdf/textbook/downloadTextbookDocx');
      await downloadTextbookDocx(model, theme);
    } catch (error) {
      setWordError(error instanceof Error ? error.message : 'No se pudo generar el Word');
    } finally {
      setWordBusy(false);
    }
  };

  const handleSavePreset = () => {
    const next = saveTextbookPreset(presetName, draft);
    setPresets(next);
    setPresetNotice(presetName.trim() ? `Guardada “${presetName.trim()}”.` : 'Escribe un nombre para guardar.');
    if (presetName.trim()) setPresetName('');
  };

  const allSelected = sourceModules.length > 0 && selectedModuleIds.length === sourceModules.length;
  const patchTheme = (partial: Partial<TextbookTheme>) => setTheme(resolveTextbookTheme({ ...theme, ...partial }));
  const fontLabel = TEXTBOOK_FONTS.find((font) => font.id === theme.fontId)?.label ?? 'Fuente';
  const inclusionOn = INCLUSION_LABELS.filter((item) => inclusion[item.key]).length;
  const activeContributors = contributors.filter((person) => !creditOptions.disabledAuthorIds.includes(person.id)).length;

  return (
    <AdminLayout
      title="Exportación de material didáctico"
      subtitle="Libro imprimible o Word del temario publicado."
      fullBleed
    >
      {loading && <p className="mb-3 text-sm text-slate-500">Cargando el temario publicado…</p>}

      <div className="sticky top-20 z-30 mb-4 sm:top-24">
        <div className="rounded-2xl border border-slate-200 bg-white/95 p-3 shadow-sm backdrop-blur dark:border-slate-800 dark:bg-slate-900/95">
          <div className="flex flex-col gap-3 xl:flex-row xl:items-center xl:justify-between">
            <div className="flex flex-wrap gap-1.5" aria-label="Resumen del libro">
              <StatChip>{countLabel(fullModel.stats.modules, 'módulo', 'módulos')}</StatChip>
              <StatChip>{countLabel(fullModel.stats.lessons, 'tema', 'temas')}</StatChip>
              <StatChip>{countLabel(fullModel.stats.images, 'figura', 'figuras')}</StatChip>
              <StatChip>{countLabel(fullModel.stats.references, 'referencia', 'referencias')}</StatChip>
              <StatChip>{fontLabel}</StatChip>
              <StatChip>{theme.pageSize === 'A4' ? 'A4' : 'Carta'}</StatChip>
              {fullModel.editorialAuthors.length > 0 && (
                <StatChip>{countLabel(fullModel.editorialAuthors.length, 'editor', 'editores')}</StatChip>
              )}
              {fullModel.stats.hiddenLessons > 0 && (
                <StatChip>{countLabel(fullModel.stats.hiddenLessons, 'oculto', 'ocultos')}</StatChip>
              )}
              {lang === 'en' && fullModel.stats.missingTranslations > 0 && (
                <StatChip>{countLabel(fullModel.stats.missingTranslations, 'lección sin traducción', 'lecciones sin traducción')}</StatChip>
              )}
              {Object.values(topicOverrides).some((item) => item.included === false) && (
                <StatChip>temas excluidos</StatChip>
              )}
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <button
                type="button"
                aria-expanded={presetsOpen}
                onClick={() => setPresetsOpen((open) => !open)}
                className="inline-flex min-h-11 items-center gap-1.5 rounded-xl border border-slate-300 px-3 text-sm font-semibold dark:border-slate-600"
              >
                Configuraciones
                <ChevronDown className={`h-4 w-4 transition ${presetsOpen ? 'rotate-180' : ''}`} />
              </button>
              <Link
                to="/admin/temario"
                className="inline-flex min-h-11 items-center rounded-xl px-3 text-sm font-semibold text-indigo-600 hover:underline"
              >
                Organizador del temario
              </Link>
              <button
                type="button"
                disabled={!fullModel.stats.lessons || wordBusy}
                onClick={() => void startWord(fullModel)}
                className="inline-flex min-h-11 items-center gap-2 rounded-xl border border-slate-300 px-4 text-sm font-semibold disabled:opacity-50 dark:border-slate-600"
              >
                <FileText className="h-4 w-4" />
                {wordBusy ? 'Preparando Word…' : 'Descargar Word'}
              </button>
              <button
                type="button"
                disabled={!fullModel.stats.lessons}
                onClick={() => startPrint(fullModel)}
                className="inline-flex min-h-11 items-center gap-2 rounded-xl bg-indigo-600 px-4 text-sm font-semibold text-white disabled:opacity-50"
              >
                <FileDown className="h-4 w-4" />
                Generar PDF
              </button>
            </div>
          </div>

          {presetsOpen && (
            <div className="mt-3 rounded-xl border border-slate-200 p-3 dark:border-slate-800">
              <p className="text-xs text-slate-500">
                El borrador se guarda solo. Una configuración con nombre conserva cohorte, idioma y tipografía.
              </p>
              <div className="mt-3 flex gap-2">
                <input
                  className={fieldClass + ' mt-0'}
                  value={presetName}
                  onChange={(e) => setPresetName(e.target.value)}
                  placeholder="Nombre, p. ej. Cohorte 2026 · Georgia"
                />
                <button
                  type="button"
                  onClick={handleSavePreset}
                  className="inline-flex min-h-11 shrink-0 items-center gap-1.5 rounded-xl bg-slate-900 px-3 text-xs font-semibold text-white dark:bg-white dark:text-slate-900"
                >
                  <Save className="h-3.5 w-3.5" />
                  Guardar
                </button>
              </div>
              {presetNotice && <p className="mt-2 text-xs text-indigo-600">{presetNotice}</p>}
              {presets.length > 0 && (
                <ul className="mt-3 space-y-2">
                  {presets.map((preset) => (
                    <li key={preset.id} className="flex items-center gap-2 rounded-xl border border-slate-200 px-3 py-2 dark:border-slate-800">
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-semibold text-slate-800 dark:text-slate-100">{preset.name}</p>
                        <p className="text-[11px] text-slate-500">
                          {new Date(preset.savedAt).toLocaleString('es-MX', { dateStyle: 'medium', timeStyle: 'short' })}
                        </p>
                      </div>
                      <button
                        type="button"
                        className="inline-flex min-h-11 items-center px-2 text-xs font-semibold text-indigo-600"
                        onClick={() => { applyDraft(preset.draft); setPresetNotice(`Cargada “${preset.name}”.`); setPresetsOpen(false); }}
                      >
                        Cargar
                      </button>
                      <button
                        type="button"
                        className="inline-flex min-h-11 items-center px-2 text-slate-400 hover:text-rose-600"
                        aria-label={`Borrar ${preset.name}`}
                        onClick={() => { setPresets(deleteTextbookPreset(preset.id)); setPresetNotice(`Eliminada “${preset.name}”.`); }}
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          )}

          {confirmLarge && (
            <div className="mt-3 rounded-xl border border-amber-300 bg-amber-50 p-3 text-sm text-amber-900 dark:bg-amber-950/40 dark:text-amber-100">
              <p className="flex items-start gap-2">
                <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" />
                Este libro tiene {fullModel.stats.lessons} temas. {confirmLarge === 'word' ? 'El Word puede tardar en armarse.' : 'El navegador puede tardar en paginarlo.'}
              </p>
              <div className="mt-3 flex gap-2">
                <button
                  type="button"
                  onClick={() => (confirmLarge === 'word' ? void startWord(fullModel, true) : startPrint(fullModel, true))}
                  className="inline-flex min-h-11 items-center rounded-lg bg-amber-700 px-3 text-xs font-semibold text-white"
                >
                  Continuar
                </button>
                <button type="button" onClick={() => setConfirmLarge(null)} className="inline-flex min-h-11 items-center rounded-lg px-3 text-xs font-semibold">
                  Revisar selección
                </button>
              </div>
            </div>
          )}
          {wordError && <p className="mt-3 text-xs text-rose-600">{wordError}</p>}
          {failedImages.length > 0 && !printModel && (
            <p className="mt-3 text-xs text-amber-700 dark:text-amber-300">
              {failedImages.length} figuras no se pudieron incrustar. El PDF las deja como pie y URL.
            </p>
          )}
        </div>
      </div>

      <div className="grid items-start gap-4 xl:grid-cols-[minmax(0,22rem)_minmax(0,1fr)]">
        <div className="space-y-4">
          <FoldSection title="Portada" summary={cover.title || 'Sin título'} defaultOpen>
            <label className="block mt-3 text-xs font-semibold text-slate-500">
              Título
              <input className={fieldClass} value={cover.title} onChange={(e) => setCover({ ...cover, title: e.target.value })} />
            </label>
            <label className="block mt-3 text-xs font-semibold text-slate-500">
              Subtítulo
              <input className={fieldClass} value={cover.subtitle} onChange={(e) => setCover({ ...cover, subtitle: e.target.value })} />
            </label>
            <label className="block mt-3 text-xs font-semibold text-slate-500">
              Autores (uno por línea)
              <textarea
                className={`${fieldClass} min-h-[5.5rem]`}
                value={cover.authors}
                onChange={(e) => setCover({ ...cover, authors: e.target.value })}
                placeholder="Dra. Nombre Apellido&#10;Dr. Nombre Apellido"
              />
            </label>
            <label className="block mt-3 text-xs font-semibold text-slate-500">
              Institución
              <input className={fieldClass} value={cover.institution} onChange={(e) => setCover({ ...cover, institution: e.target.value })} />
            </label>
          </FoldSection>

          <FoldSection
            title="Tipografía y página"
            summary={`${fontLabel} · ${theme.pageSize === 'A4' ? 'A4' : 'Carta'} · ${theme.bodyPt} pt`}
            trailing={(
              <button
                type="button"
                className="inline-flex min-h-11 items-center px-2 text-xs font-semibold text-indigo-600"
                onClick={() => setTheme(DEFAULT_TEXTBOOK_THEME)}
              >
                Restablecer
              </button>
            )}
          >
            <label className="block text-xs font-semibold text-slate-500">
              Tipo de letra
              <select
                className={fieldClass}
                value={theme.fontId}
                onChange={(e) => patchTheme({ fontId: e.target.value as TextbookTheme['fontId'] })}
              >
                {TEXTBOOK_FONTS.map((font) => (
                  <option key={font.id} value={font.id}>{font.label}</option>
                ))}
              </select>
            </label>
            <div className="mt-3 flex flex-wrap gap-2">
              {(['A4', 'Letter'] as TextbookPageSize[]).map((size) => (
                <button
                  key={size}
                  type="button"
                  onClick={() => patchTheme({ pageSize: size })}
                  className={`inline-flex min-h-11 items-center rounded-xl border px-3 text-xs font-semibold ${theme.pageSize === size ? 'border-indigo-600 bg-indigo-600 text-white' : 'border-slate-200 dark:border-slate-700'}`}
                >
                  {size === 'A4' ? 'A4' : 'Carta'}
                </button>
              ))}
            </div>
            <div className="mt-4 space-y-3">
              <ThemeSlider label="Cuerpo de texto" value={theme.bodyPt} min={9} max={14} step={0.5} unit=" pt" onChange={(bodyPt) => patchTheme({ bodyPt })} />
            </div>
            <details className="mt-4 rounded-xl border border-slate-200 dark:border-slate-700">
              <summary className="flex min-h-11 cursor-pointer items-center px-3 text-xs font-semibold text-slate-600 dark:text-slate-300">
                Ajustes finos
              </summary>
              <div className="space-y-3 px-3 pb-3">
              <ThemeSlider label="Título de portada" value={theme.coverTitlePt} min={16} max={36} step={1} unit=" pt" onChange={(coverTitlePt) => patchTheme({ coverTitlePt })} />
              <ThemeSlider label="Título de capítulo" value={theme.chapterTitlePt} min={13} max={28} step={1} unit=" pt" onChange={(chapterTitlePt) => patchTheme({ chapterTitlePt })} />
              <ThemeSlider label="Título de lección" value={theme.lessonTitlePt} min={11} max={20} step={1} unit=" pt" onChange={(lessonTitlePt) => patchTheme({ lessonTitlePt })} />
              <ThemeSlider label="Subtítulos" value={theme.subtitlePt} min={10} max={16} step={0.5} unit=" pt" onChange={(subtitlePt) => patchTheme({ subtitlePt })} />
              <ThemeSlider label="Interlineado" value={theme.lineHeight} min={1.2} max={2} step={0.05} unit="" onChange={(lineHeight) => patchTheme({ lineHeight })} />
              <ThemeSlider label="Espacio entre párrafos" value={theme.paragraphGapEm} min={0.3} max={1.6} step={0.05} unit=" em" onChange={(paragraphGapEm) => patchTheme({ paragraphGapEm })} />
              <ThemeSlider label="Espacio entre lecciones" value={theme.lessonGapEm} min={0.6} max={2.4} step={0.1} unit=" em" onChange={(lessonGapEm) => patchTheme({ lessonGapEm })} />
              <ThemeSlider label="Margen superior" value={theme.marginTopMm} min={10} max={30} step={1} unit=" mm" onChange={(marginTopMm) => patchTheme({ marginTopMm })} />
              <ThemeSlider label="Márgenes laterales" value={theme.marginSideMm} min={10} max={28} step={1} unit=" mm" onChange={(marginSideMm) => patchTheme({ marginSideMm })} />
              <ThemeSlider label="Margen inferior" value={theme.marginBottomMm} min={12} max={32} step={1} unit=" mm" onChange={(marginBottomMm) => patchTheme({ marginBottomMm })} />
              </div>
            </details>
          </FoldSection>

          <FoldSection
            title="Qué incluir"
            summary={`${countLabel(inclusionOn, 'bloque', 'bloques')} · ${lang === 'es' ? 'Español' : 'English'}`}
          >
            <div className="grid gap-2">
              {INCLUSION_LABELS.map((item) => (
                <label key={item.key} className="flex items-start gap-2 text-sm text-slate-700 dark:text-slate-300">
                  <input
                    type="checkbox"
                    className="mt-1"
                    checked={inclusion[item.key]}
                    onChange={(e) => setInclusion({ ...inclusion, [item.key]: e.target.checked })}
                  />
                  <span>
                    <span className="font-medium">{item.label}</span>
                    <span className="block text-xs text-slate-500">{item.hint}</span>
                  </span>
                </label>
              ))}
            </div>
            <div className="mt-4 flex flex-wrap gap-2">
              <button type="button" onClick={() => setLang('es')} className={`inline-flex min-h-11 items-center rounded-xl border px-3 text-xs font-semibold ${lang === 'es' ? 'border-indigo-600 bg-indigo-600 text-white' : 'border-slate-200 dark:border-slate-700'}`}>Español</button>
              <button type="button" onClick={() => setLang('en')} className={`inline-flex min-h-11 items-center rounded-xl border px-3 text-xs font-semibold ${lang === 'en' ? 'border-indigo-600 bg-indigo-600 text-white' : 'border-slate-200 dark:border-slate-700'}`}>English</button>
            </div>
            <label className="mt-4 flex items-start gap-2 text-sm text-slate-700 dark:text-slate-300">
              <input type="checkbox" className="mt-1" checked={includeHidden} onChange={(e) => setIncludeHidden(e.target.checked)} />
              <span>Incluir temas ocultos al alumnado. La portada interior lo declara.</span>
            </label>
            <label className="mt-2 flex items-start gap-2 text-sm text-slate-700 dark:text-slate-300">
              <input type="checkbox" className="mt-1" checked={skipEmptyContainers} onChange={(e) => setSkipEmptyContainers(e.target.checked)} />
              <span>Omitir contenedores sin cuerpo (solo títulos de sección vacíos).</span>
            </label>
          </FoldSection>

          <FoldSection
            title="Créditos editoriales"
            summary={contributors.length ? countLabel(activeContributors, 'colaborador activo', 'colaboradores activos') : 'Sin colaboradores publicados'}
          >
            <p className="text-xs text-slate-500">
              Nombres tomados de quienes publicaron o revisaron cada tema. Desactiva a quien no quieras en el libro.
            </p>
            <div className="mt-3 grid gap-2">
              <label className="flex items-start gap-2 text-sm text-slate-700 dark:text-slate-300">
                <input
                  type="checkbox"
                  className="mt-1"
                  checked={creditOptions.showCoverCredits}
                  onChange={(e) => setCreditOptions({ ...creditOptions, showCoverCredits: e.target.checked })}
                />
                <span>Listar colaboradores en la portada</span>
              </label>
              <label className="flex items-start gap-2 text-sm text-slate-700 dark:text-slate-300">
                <input
                  type="checkbox"
                  className="mt-1"
                  checked={creditOptions.showChapterCredits}
                  onChange={(e) => setCreditOptions({ ...creditOptions, showChapterCredits: e.target.checked })}
                />
                <span>Autores bajo el título de cada capítulo</span>
              </label>
              <label className="flex items-start gap-2 text-sm text-slate-700 dark:text-slate-300">
                <input
                  type="checkbox"
                  className="mt-1"
                  checked={creditOptions.showLessonCredits}
                  onChange={(e) => setCreditOptions({ ...creditOptions, showLessonCredits: e.target.checked })}
                />
                <span>Autores en cada tema</span>
              </label>
              <label className="flex items-start gap-2 text-sm text-slate-700 dark:text-slate-300">
                <input
                  type="checkbox"
                  className="mt-1"
                  checked={creditOptions.showCredentials}
                  onChange={(e) => setCreditOptions({ ...creditOptions, showCredentials: e.target.checked })}
                />
                <span>Mostrar credenciales (M.N., cédula, etc.)</span>
              </label>
              <label className="flex items-start gap-2 text-sm text-slate-700 dark:text-slate-300">
                <input
                  type="checkbox"
                  className="mt-1"
                  checked={creditOptions.showEditedDates}
                  onChange={(e) => setCreditOptions({ ...creditOptions, showEditedDates: e.target.checked })}
                />
                <span>Fecha de última revisión editorial</span>
              </label>
            </div>
            {contributors.length > 0 && (
              <div className="mt-3 flex flex-wrap gap-1.5">
                {contributors.map((person) => {
                  const disabled = creditOptions.disabledAuthorIds.includes(person.id);
                  return (
                    <button
                      key={person.id}
                      type="button"
                      onClick={() => setCreditOptions({ ...creditOptions, disabledAuthorIds: toggleAuthorDisabled(creditOptions.disabledAuthorIds, person.id) })}
                      className={`inline-flex min-h-11 items-center rounded-full border px-3 text-[11px] font-medium ${
                        disabled
                          ? 'border-slate-200 text-slate-400 line-through dark:border-slate-700'
                          : 'border-indigo-200 bg-indigo-50 text-indigo-800 dark:border-indigo-800 dark:bg-indigo-950/40 dark:text-indigo-200'
                      }`}
                    >
                      {person.label}
                    </button>
                  );
                })}
              </div>
            )}
          </FoldSection>

          <FoldSection
            title="Módulos y temas"
            summary={countLabel(selectedModuleIds.length, 'módulo en el libro', 'módulos en el libro')}
            defaultOpen
            trailing={(
              <button
                type="button"
                onClick={() => setSelectedModuleIds(allSelected ? [] : sourceModules.map((mod) => mod.id))}
                className="inline-flex min-h-11 items-center px-2 text-xs font-semibold text-indigo-600"
              >
                {allSelected ? 'Quitar todos' : 'Marcar todos'}
              </button>
            )}
          >
            <p className="mb-1 text-xs text-slate-500">
              Abre un módulo para ver autores y opciones de cada tema: excluir, solo esquema, ocultar perlas o imágenes.
            </p>
            <TextbookModuleTree
              modules={sourceModules}
              selectedModuleIds={selectedModuleIds}
              previewModuleId={previewModuleId}
              contributors={contributors}
              inclusion={inclusion}
              creditOptions={creditOptions}
              topicOverrides={topicOverrides}
              publishedTopics={publishedTopics}
              onToggleModule={toggleModule}
              onPreview={setPreviewModuleId}
              onToggleAuthor={(id) => setCreditOptions({ ...creditOptions, disabledAuthorIds: toggleAuthorDisabled(creditOptions.disabledAuthorIds, id) })}
              onChangeOverrides={setTopicOverrides}
            />
          </FoldSection>
        </div>

        <section className="flex min-h-[32rem] flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900 xl:sticky xl:top-44 xl:h-[calc(100vh-12rem)]">
          <div className="flex items-center gap-2 border-b border-slate-200 px-3 py-2 dark:border-slate-800">
            <BookMarked className="h-4 w-4 shrink-0 text-indigo-600" />
            <label className="flex min-w-0 flex-1 items-center gap-2 text-sm font-bold text-slate-900 dark:text-white">
              Vista previa
              <select
                className="min-h-11 min-w-0 flex-1 rounded-xl border border-slate-200 bg-white px-2 text-sm font-semibold text-slate-800 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100"
                value={previewModuleId ?? ''}
                onChange={(e) => setPreviewModuleId(e.target.value || null)}
              >
                {sourceModules.length === 0 && <option value="">Sin módulos</option>}
                {sourceModules.map((mod) => (
                  <option key={mod.id} value={mod.id}>
                    {String(mod.number).padStart(2, '0')}. {mod.title}
                  </option>
                ))}
              </select>
            </label>
          </div>
          {previewModel ? (
            <FittedBookPreview
              pageWidthMm={textbookPageWidthMm(theme.pageSize)}
              pageHeightMm={textbookPageHeightMm(theme.pageSize)}
            >
              <TextbookDocument model={previewModel} theme={theme} />
            </FittedBookPreview>
          ) : (
            <p className="p-6 text-sm text-slate-500">Selecciona un módulo para previsualizarlo.</p>
          )}
        </section>
      </div>
    </AdminLayout>
  );
}
