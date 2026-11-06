import { useEffect, useMemo, useRef, useState } from 'react';
import {
  ArrowLeft,
  Save,
  Send,
  Plus,
  Trash2,
  Copy,
  ChevronUp,
  ChevronDown,
  Eye,
  CheckCircle2,
  AlertCircle,
  Sparkles,
  GraduationCap,
  Image as ImageIcon,
  Check,
  FolderInput,
  X,
  Upload,
  Activity,
  BookOpen,
} from 'lucide-react';
import { useAuth } from '../../../contexts/AuthProvider';
import { useAllModules } from '../../../hooks/useAllModules';
import { useMergedModule } from '../../../hooks/useMergedModule';
import { useGoBack } from '../../../hooks/useGoBack';
import { findTopicInTree, getAllFlatTopics, topicListKey } from '../../../services/contentMerge';
import {
  getQuizEditorDataForTopic,
  publishAdminQuizDirectly,
  saveRevision,
} from '../../../services/editorialService';
import { defaultOptionsForType } from '../../../utils/quizScoring';
import { CLINICAL_PRESETS } from '../../simulator/traceEngine/defaultPresets';
import { uploadRenderedTraceSvgToStorage } from '../../../utils/traceSvgGenerator';
import { getReferencesForTopic, type Reference } from '../../../content/topicReferences';
import type {
  QuizCitation,
  QuizDifficulty,
  QuizOption,
  QuizQuestionDraft,
  QuizQuestionType,
} from '../../../types/quiz';
import { AdminQuizSimulatorModal } from './AdminQuizSimulatorModal';
import { AdminMoveQuestionModal } from './AdminMoveQuestionModal';

const QUESTION_TYPES: { value: QuizQuestionType; label: string; description: string }[] = [
  { value: 'single', label: 'Opción Única', description: '1 respuesta correcta entre varias' },
  { value: 'multiple', label: 'Opción Múltiple', description: 'Varias respuestas correctas obligatorias' },
  { value: 'true_false', label: 'Verdadero / Falso', description: 'V o F predefinido' },
  { value: 'image_choice', label: 'Imagen Clínica', description: 'Viñeta con registro EMG, biopsia o trazo' },
];

const DIFFICULTIES: { value: QuizDifficulty; label: string; color: string }[] = [
  { value: 'basic', label: 'Básico', color: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300' },
  { value: 'intermediate', label: 'Intermedio', color: 'bg-blue-100 text-blue-800 dark:bg-blue-950/60 dark:text-blue-300' },
  { value: 'advanced', label: 'Avanzado', color: 'bg-purple-100 text-purple-800 dark:bg-purple-950/60 dark:text-purple-300' },
];

function createEmptyQuestion(type: QuizQuestionType = 'single'): QuizQuestionDraft {
  return {
    id: crypto.randomUUID(),
    type,
    stem: '',
    options: defaultOptionsForType(type),
    difficulty: 'intermediate',
    explanation: '',
  };
}

interface AdminQuizEditorProps {
  initialTopicId?: string;
  initialModuleId?: string;
  onBackToCatalog?: () => void;
  onSaved?: () => void;
  isModal?: boolean;
}

export function AdminQuizEditor({
  initialTopicId,
  initialModuleId,
  onBackToCatalog,
  onSaved,
  isModal,
}: AdminQuizEditorProps) {
  const { user } = useAuth();
  const goBack = useGoBack('/admin/quizzes');
  const { modules: availableModules } = useAllModules();

  // Selected module & topic
  const [selectedModuleId, setSelectedModuleId] = useState<string>(availableModules[0]?.id ?? 'fundamentals');
  const { module: mergedModule } = useMergedModule(selectedModuleId);
  const [selectedTopicId, setSelectedTopicId] = useState<string>(initialTopicId ?? '');
  const [selectedTopicPath, setSelectedTopicPath] = useState('');

  // Quiz configuration
  const [title, setTitle] = useState('');
  const [passScore, setPassScore] = useState(70);
  const [maxAttempts, setMaxAttempts] = useState<number | null>(null);
  const [shuffleQuestions, setShuffleQuestions] = useState(true);
  const [shuffleOptions, setShuffleOptions] = useState(true);
  const [questions, setQuestions] = useState<QuizQuestionDraft[]>([createEmptyQuestion()]);
  const [dataSource, setDataSource] = useState<'database' | 'fallback' | 'empty'>('empty');
  const [version, setVersion] = useState<number>(1);

  // UI state
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successToast, setSuccessToast] = useState<string | null>(null);
  const [showSimulator, setShowSimulator] = useState(false);
  const [expandedIndex, setExpandedIndex] = useState<number | null>(0);
  const [movingQuestionIndex, setMovingQuestionIndex] = useState<number | null>(null);
  const [selectedTracePreset, setSelectedTracePreset] = useState<string>(
    CLINICAL_PRESETS[0]?.id ?? 'median-cts'
  );
  const [selectedTraceVariant, setSelectedTraceVariant] = useState<
    'pathologic' | 'normal' | 'comparison'
  >('pathologic');
  const [uploadingTraceIndex, setUploadingTraceIndex] = useState<number | null>(null);
  const jsonFileInputRef = useRef<HTMLInputElement | null>(null);
  const quizLoadToken = useRef(0);
  const appliedRouteTopic = useRef('');
  const mergedModuleRef = useRef(mergedModule);
  mergedModuleRef.current = mergedModule;

  const topicRefs = useMemo(
    () => (selectedTopicId ? getReferencesForTopic(selectedModuleId, selectedTopicId) : []),
    [selectedModuleId, selectedTopicId]
  );

  // Available leaf topics for selected module. Option keys stay unique even
  // when two leaves in the same module reused a slug.
  const leafTopics = useMemo(() => {
    if (!mergedModule) return [];
    const seen = new Map<string, number>();
    return getAllFlatTopics(mergedModule.topics)
      .filter(({ topic }) => !topic.children?.length && Boolean(topic.content?.trim() || topic.description?.trim()))
      .map(({ topic, path }) => {
        const occurrence = seen.get(path.join('/')) ?? 0;
        seen.set(path.join('/'), occurrence + 1);
        return {
          topic,
          path,
          optionKey: topicListKey(selectedModuleId, path, occurrence),
        };
      });
  }, [mergedModule, selectedModuleId]);

  const selectedLeaf = leafTopics.find((item) => item.optionKey === selectedTopicPath) ?? null;

  // If initialTopicId was provided, open that module (the one from the catalog
  // when moduleId is present) instead of the first module that shares the slug.
  useEffect(() => {
    if (!initialTopicId || availableModules.length === 0) return;
    const routeKey = `${initialModuleId ?? ''}:${initialTopicId}`;
    if (appliedRouteTopic.current === routeKey) return;
    const preferred = initialModuleId
      ? availableModules.filter((mod) => mod.id === initialModuleId)
      : [];
    const rest = availableModules.filter((mod) => mod.id !== initialModuleId);
    for (const mod of [...preferred, ...rest]) {
      const match = getAllFlatTopics(mod.topics).find(({ topic }) => topic.id === initialTopicId);
      if (match) {
        setSelectedModuleId(mod.id);
        setSelectedTopicId(initialTopicId);
        setSelectedTopicPath(topicListKey(mod.id, match.path, 0));
        appliedRouteTopic.current = routeKey;
        break;
      }
    }
  }, [initialTopicId, initialModuleId, availableModules]);

  // Keep the dropdown on a real option after the merged tree loads.
  useEffect(() => {
    if (!selectedTopicId || leafTopics.length === 0) return;
    if (leafTopics.some((item) => item.optionKey === selectedTopicPath)) return;
    const match = leafTopics.find((item) => item.topic.id === selectedTopicId);
    if (match) setSelectedTopicPath(match.optionKey);
  }, [leafTopics, selectedTopicId, selectedTopicPath]);

  // Reload only when the selected topic changes. A module-tree refresh must
  // not refetch and paint the quiz from before a move finished saving.
  useEffect(() => {
    if (!selectedTopicId) return;

    const token = ++quizLoadToken.current;
    let cancelled = false;
    async function loadData() {
      setLoading(true);
      setErrorMessage(null);
      try {
        const topic = findTopicInTree(mergedModuleRef.current?.topics ?? [], selectedTopicId);
        const data = await getQuizEditorDataForTopic(selectedTopicId);
        if (cancelled || token !== quizLoadToken.current) return;

        setDataSource(data.source);
        setVersion(data.version);
        setTitle(data.title || (topic ? `Evaluación: ${topic.title}` : 'Evaluación del Tema'));
        setPassScore(data.passScore);
        setMaxAttempts(data.maxAttempts);
        setShuffleQuestions(data.shuffleQuestions);
        setShuffleOptions(data.shuffleOptions);

        if (data.questions && data.questions.length > 0) {
          setQuestions(
            data.questions.map((q) => ({
              ...q,
              id: q.id || crypto.randomUUID(),
              options: q.options.map((opt) => ({
                ...opt,
                id: opt.id || crypto.randomUUID(),
              })),
            }))
          );
        } else {
          setQuestions([createEmptyQuestion()]);
        }
      } catch (e) {
        if (!cancelled && token === quizLoadToken.current) {
          console.error(e);
          setErrorMessage('Error al cargar la información del cuestionario.');
        }
      } finally {
        if (!cancelled && token === quizLoadToken.current) setLoading(false);
      }
    }

    loadData();
    return () => {
      cancelled = true;
    };
  }, [selectedTopicId]);

  // Handle module dropdown change
  const handleModuleChange = (newModuleId: string) => {
    setSelectedModuleId(newModuleId);
    setSelectedTopicId('');
    setSelectedTopicPath('');
    setQuestions([createEmptyQuestion()]);
    setTitle('');
  };

  // Handle topic change. The option value is the list key, not the slug,
  // so two leaves that shared an id stay selectable.
  const handleTopicChange = (optionKey: string) => {
    const match = leafTopics.find((item) => item.optionKey === optionKey);
    if (!match) return;
    setSelectedTopicPath(optionKey);
    setSelectedTopicId(match.topic.id);
    setTitle(`Evaluación: ${match.topic.title}`);
  };

  // Question mutators
  const updateQuestion = (index: number, updates: Partial<QuizQuestionDraft>) => {
    setQuestions((prev) => {
      const copy = [...prev];
      const current = copy[index];
      if (!current) return prev;

      if (updates.type && updates.type !== current.type) {
        copy[index] = {
          ...current,
          ...updates,
          options: defaultOptionsForType(updates.type),
        };
      } else {
        copy[index] = { ...current, ...updates };
      }
      return copy;
    });
  };

  const addOptionToQuestion = (qIndex: number) => {
    setQuestions((prev) => {
      const copy = [...prev];
      const q = copy[qIndex];
      if (!q) return prev;
      const newOption: QuizOption = {
        id: crypto.randomUUID(),
        text: '',
        isCorrect: false,
      };
      copy[qIndex] = {
        ...q,
        options: [...q.options, newOption],
      };
      return copy;
    });
  };

  const removeOption = (qIndex: number, optIndex: number) => {
    setQuestions((prev) => {
      const copy = [...prev];
      const q = copy[qIndex];
      if (!q || q.options.length <= 2) return prev;
      const options = q.options.filter((_, i) => i !== optIndex);
      copy[qIndex] = { ...q, options };
      return copy;
    });
  };

  const toggleOptionCorrect = (qIndex: number, optIndex: number) => {
    setQuestions((prev) => {
      const copy = [...prev];
      const q = copy[qIndex];
      if (!q) return prev;

      const isMultiple = q.type === 'multiple';
      const options = q.options.map((opt, i) => {
        if (isMultiple) {
          return i === optIndex ? { ...opt, isCorrect: !opt.isCorrect } : opt;
        }
        return { ...opt, isCorrect: i === optIndex };
      });

      copy[qIndex] = { ...q, options };
      return copy;
    });
  };

  const moveQuestion = (index: number, direction: 'up' | 'down') => {
    setQuestions((prev) => {
      const targetIndex = direction === 'up' ? index - 1 : index + 1;
      if (targetIndex < 0 || targetIndex >= prev.length) return prev;
      const copy = [...prev];
      const [moved] = copy.splice(index, 1);
      copy.splice(targetIndex, 0, moved);
      return copy;
    });
    setExpandedIndex((prev) => {
      if (prev === index) return direction === 'up' ? index - 1 : index + 1;
      return prev;
    });
  };

  const duplicateQuestion = (index: number) => {
    setQuestions((prev) => {
      const q = prev[index];
      if (!q) return prev;
      const duplicated: QuizQuestionDraft = {
        ...q,
        id: crypto.randomUUID(),
        options: q.options.map((o) => ({ ...o, id: crypto.randomUUID() })),
      };
      const copy = [...prev];
      copy.splice(index + 1, 0, duplicated);
      return copy;
    });
    setExpandedIndex(index + 1);
  };

  const deleteQuestion = (index: number) => {
    if (questions.length <= 1) {
      alert('Un cuestionario debe tener al menos una pregunta.');
      return;
    }
    if (confirm('¿Eliminar esta pregunta del cuestionario?')) {
      setQuestions((prev) => prev.filter((_, i) => i !== index));
      setExpandedIndex(0);
    }
  };

  // Validation before save/publish
  const validateQuiz = (): string | null => {
    if (!selectedTopicId) return 'Por favor selecciona un tema hoja del curso.';
    if (!title.trim()) return 'El título del cuestionario no puede estar vacío.';
    if (questions.length === 0) return 'Debes incluir al menos una pregunta.';

    for (let i = 0; i < questions.length; i++) {
      const q = questions[i];
      if (!q.stem.trim()) return `La Pregunta ${i + 1} no tiene enunciado.`;
      if (q.options.length < 2) return `La Pregunta ${i + 1} debe tener al menos 2 opciones.`;

      const hasEmptyOption = q.options.some((o) => !o.text.trim());
      if (hasEmptyOption) return `La Pregunta ${i + 1} contiene opciones con texto en blanco.`;

      const hasCorrect = q.options.some((o) => o.isCorrect);
      if (!hasCorrect) return `La Pregunta ${i + 1} no tiene ninguna respuesta marcada como correcta.`;
    }

    return null;
  };

  // Direct Publish Action
  const handlePublishLive = async () => {
    if (!user) return;
    const validationError = validateQuiz();
    if (validationError) {
      setErrorMessage(validationError);
      return;
    }

    setSaving(true);
    setErrorMessage(null);
    try {
      await publishAdminQuizDirectly({
        topicId: selectedTopicId,
        moduleId: selectedModuleId,
        title,
        passScore,
        maxAttempts,
        shuffleQuestions,
        shuffleOptions,
        questions,
        authorId: user.id,
      });

      setDataSource('database');
      setVersion((v) => v + 1);
      setSuccessToast('¡Cuestionario publicado en vivo exitosamente! Los alumnos ya pueden resolverlo.');
      onSaved?.();
      setTimeout(() => setSuccessToast(null), 5000);
    } catch (e) {
      console.error(e);
      setErrorMessage(e instanceof Error ? e.message : 'Error al publicar el cuestionario en vivo.');
    } finally {
      setSaving(false);
    }
  };

  // Save Draft Action
  const handleSaveDraft = async () => {
    if (!user) return;
    if (!selectedTopicId) {
      setErrorMessage('Selecciona un tema primero.');
      return;
    }

    setSaving(true);
    setErrorMessage(null);
    try {
      await saveRevision({
        targetTopicId: selectedTopicId,
        moduleId: selectedModuleId,
        action: 'update',
        authorId: user.id,
        payload: {
          revisionType: 'quiz',
          title,
          quizTopicId: selectedTopicId,
          passScore,
          maxAttempts,
          shuffleQuestions,
          shuffleOptions,
          questions,
        },
      });

      setSuccessToast('Borrador guardado en la cola editorial.');
      onSaved?.();
      setTimeout(() => setSuccessToast(null), 4000);
    } catch (e) {
      console.error(e);
      setErrorMessage('Error al guardar el borrador.');
    } finally {
      setSaving(false);
    }
  };

  // Import JSON Draft (.agents/skills/emg-quiz-topics/drafts/{topicId}.json)
  const handleImportJsonFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (!file) return;

    setErrorMessage(null);
    try {
      const text = await file.text();
      const parsed = JSON.parse(text) as Record<string, unknown>;
      const quizObj =
        parsed.topicQuiz && typeof parsed.topicQuiz === 'object'
          ? (parsed.topicQuiz as Record<string, unknown>)
          : parsed;

      const rawQuestions = Array.isArray(quizObj.questions)
        ? (quizObj.questions as QuizQuestionDraft[])
        : [];
      if (rawQuestions.length === 0) {
        setErrorMessage('El archivo JSON no contiene un arreglo válido de "questions".');
        return;
      }

      if (typeof quizObj.title === 'string' && quizObj.title.trim()) {
        setTitle(quizObj.title.trim());
      }
      if (typeof quizObj.passScore === 'number') {
        setPassScore(quizObj.passScore);
      }
      if (typeof quizObj.shuffleQuestions === 'boolean') {
        setShuffleQuestions(quizObj.shuffleQuestions);
      }
      if (typeof quizObj.shuffleOptions === 'boolean') {
        setShuffleOptions(quizObj.shuffleOptions);
      }

      const normalized: QuizQuestionDraft[] = rawQuestions.map((q) => ({
        ...q,
        id: q.id || crypto.randomUUID(),
        type: q.type || 'single',
        difficulty: q.difficulty || 'intermediate',
        options: (q.options ?? []).map((opt) => ({
          id: opt.id || crypto.randomUUID(),
          text: opt.text ?? '',
          isCorrect: Boolean(opt.isCorrect),
        })),
      }));

      setQuestions(normalized);
      setExpandedIndex(0);
      setSuccessToast(
        `Borrador IA importado (${normalized.length} reactivos cargados). Revisa y publica o guarda borrador.`
      );
      setTimeout(() => setSuccessToast(null), 5000);
    } catch (err) {
      console.error(err);
      setErrorMessage('No se pudo leer el archivo JSON de borrador.');
    }
  };

  const handleGenerateAndUploadTrace = async (qIndex: number) => {
    const q = questions[qIndex];
    if (!q) return;
    setUploadingTraceIndex(qIndex);
    setErrorMessage(null);
    try {
      const uploaded = await uploadRenderedTraceSvgToStorage(
        selectedTopicId || 'general',
        {
          tracePresetId: selectedTracePreset,
          variant: selectedTraceVariant,
          hideDiagnosis: true,
        },
        q.imageAlt
      );
      updateQuestion(qIndex, {
        imageUrl: uploaded.imageUrl,
        imageAlt: uploaded.imageAlt,
      });
      setSuccessToast('Trazado EMG calibrado generado y subido a emg-trace-images.');
      setTimeout(() => setSuccessToast(null), 4000);
    } catch (err) {
      console.error(err);
      setErrorMessage(
        err instanceof Error ? err.message : 'Error al generar y subir el trazo EMG.'
      );
    } finally {
      setUploadingTraceIndex(null);
    }
  };

  const handleInsertReference = (qIndex: number, ref: Reference) => {
    const q = questions[qIndex];
    if (!q) return;
    const formattedLine = `📚 Referencia: ${ref.authors} (${ref.year}). ${ref.title}. ${ref.journal}.${ref.url ? ` ${ref.url}` : ''}`;
    const currentExp = (q.explanation ?? '').trim();
    const nextExp = currentExp.includes(ref.title)
      ? currentExp
      : currentExp
      ? `${currentExp}\n\n${formattedLine}`
      : formattedLine;

    const existingCitations: QuizCitation[] = q.citations ?? [];
    const alreadyInCitations = existingCitations.some((c) => c.title === ref.title);
    const nextCitations: QuizCitation[] = alreadyInCitations
      ? existingCitations
      : [
          ...existingCitations,
          {
            authors: ref.authors,
            title: ref.title,
            journal: ref.journal,
            year: ref.year,
            ...(ref.url ? { url: ref.url } : {}),
          },
        ];

    updateQuestion(qIndex, {
      explanation: nextExp,
      citations: nextCitations,
    });
  };

  return (
    <div className="space-y-6">
      {/* Top Header & Breadcrumbs */}
      <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-slate-200/80 dark:border-slate-800">
        <div className="flex items-center gap-3">
          {!isModal ? (
            <button
              type="button"
              onClick={onBackToCatalog || (() => goBack('/admin/quizzes'))}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 text-xs font-semibold hover:bg-slate-50 dark:hover:bg-slate-700 transition cursor-pointer"
            >
              <ArrowLeft className="w-3.5 h-3.5" /> Volver al Catálogo
            </button>
          ) : (
            <button
              type="button"
              onClick={onBackToCatalog}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 text-xs font-semibold hover:bg-slate-50 dark:hover:bg-slate-700 transition cursor-pointer"
            >
              <X className="w-3.5 h-3.5" /> Cerrar Editor
            </button>
          )}

          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold px-2 py-0.5 rounded-md bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800">
                Editor Directivo
              </span>
              {dataSource === 'database' && (
                <span className="text-[11px] font-semibold text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                  <Check className="w-3.5 h-3.5" /> En producción (v{version})
                </span>
              )}
              {dataSource === 'fallback' && (
                <span className="text-[11px] font-semibold text-amber-600 dark:text-amber-400 flex items-center gap-1">
                  <Sparkles className="w-3.5 h-3.5" /> Basado en banco estático
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Global Actions */}
        <div className="flex flex-wrap items-center gap-2">
          <input
            ref={jsonFileInputRef}
            type="file"
            accept=".json,application/json"
            onChange={handleImportJsonFile}
            className="hidden"
          />

          <button
            type="button"
            onClick={() => jsonFileInputRef.current?.click()}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl border border-cyan-200 dark:border-cyan-800 bg-cyan-50 dark:bg-cyan-950/40 text-cyan-700 dark:text-cyan-300 hover:bg-cyan-100 dark:hover:bg-cyan-900/50 text-xs sm:text-sm font-semibold transition shadow-xs"
            title="Importar archivo JSON generado por la skill emg-quiz-topics (.agents/skills/emg-quiz-topics/drafts/*.json)"
          >
            <Upload className="w-4 h-4" /> Importar Borrador IA (.json)
          </button>

          <button
            type="button"
            onClick={() => setShowSimulator(true)}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl border border-indigo-200 dark:border-indigo-800 bg-indigo-50 dark:bg-indigo-950/40 text-indigo-700 dark:text-indigo-300 hover:bg-indigo-100 dark:hover:bg-indigo-900/50 text-xs sm:text-sm font-semibold transition shadow-xs"
          >
            <Eye className="w-4 h-4" /> Probar como Alumno
          </button>

          <button
            type="button"
            disabled={saving || loading}
            onClick={handleSaveDraft}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700 text-xs sm:text-sm font-medium transition disabled:opacity-50"
          >
            <Save className="w-4 h-4 text-slate-500" /> Guardar Borrador
          </button>

          <button
            type="button"
            disabled={saving || loading}
            onClick={handlePublishLive}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white text-xs sm:text-sm font-bold shadow-md shadow-indigo-500/25 transition disabled:opacity-50 hover:scale-102"
          >
            <Send className="w-4 h-4" />
            <span>{saving ? 'Publicando...' : 'Publicar en Vivo'}</span>
          </button>
        </div>
      </div>

      {/* Notifications */}
      {errorMessage && (
        <div className="flex items-center gap-3 p-4 rounded-2xl bg-red-500/10 border border-red-500/30 text-red-900 dark:text-red-200 text-sm animate-in fade-in">
          <AlertCircle className="w-5 h-5 shrink-0 text-red-500" />
          <p className="font-medium">{errorMessage}</p>
        </div>
      )}

      {successToast && (
        <div className="flex items-center gap-3 p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-900 dark:text-emerald-200 text-sm animate-in fade-in">
          <CheckCircle2 className="w-5 h-5 shrink-0 text-emerald-500" />
          <p className="font-medium">{successToast}</p>
        </div>
      )}

      {/* Main Form Container */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Module & Topic Selection & Settings */}
        <div className="space-y-6 lg:col-span-1">
          {/* Target Topic Selection Card */}
          <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-4">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <GraduationCap className="w-4 h-4 text-indigo-500" />
              Destino del Cuestionario
            </h3>

            <div>
              <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1.5">
                Módulo Académico
              </label>
              <select
                value={selectedModuleId}
                onChange={(e) => handleModuleChange(e.target.value)}
                className="w-full px-3 py-2 rounded-xl text-xs sm:text-sm border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-800 dark:text-slate-100 font-medium"
              >
                {availableModules.map((m) => (
                  <option key={m.id} value={m.id}>
                    Módulo {m.number}: {m.title}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1.5">
                Tema de Estudio (Hoja)
              </label>
              <select
                value={selectedTopicPath}
                onChange={(e) => handleTopicChange(e.target.value)}
                className="w-full px-3 py-2 rounded-xl text-xs sm:text-sm border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-800 dark:text-slate-100 font-medium"
              >
                <option value="">-- Seleccionar tema para evaluar --</option>
                {leafTopics.map(({ topic, optionKey }) => (
                  <option key={optionKey} value={optionKey} title={topic.title}>
                    {topic.title}
                  </option>
                ))}
              </select>
              {selectedLeaf && (
                <p className="text-xs font-medium text-slate-700 dark:text-slate-200 mt-2 leading-snug">
                  {selectedLeaf.topic.title}
                </p>
              )}
              <p className="text-[11px] text-slate-400 mt-1">
                El quiz se asociará a este tema y aparecerá al final de la lección para los alumnos.
              </p>
            </div>
          </div>

          {/* Academic & Scoring Settings */}
          <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-4">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-purple-500" />
              Parámetros de Acreditación
            </h3>

            <div>
              <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1.5">
                Título de la Evaluación
              </label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Ej: Evaluación: Reflejo H y Respuestas Tardías"
                className="w-full px-3 py-2 rounded-xl text-xs sm:text-sm border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1.5">
                  Puntaje Mínimo (%)
                </label>
                <input
                  type="number"
                  min={0}
                  max={100}
                  value={passScore}
                  onChange={(e) => setPassScore(Math.max(0, Math.min(100, Number(e.target.value))))}
                  className="w-full px-3 py-2 rounded-xl text-xs sm:text-sm border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1.5">
                  Intentos Permitidos
                </label>
                <input
                  type="number"
                  min={1}
                  placeholder="Ilimitados"
                  value={maxAttempts ?? ''}
                  onChange={(e) =>
                    setMaxAttempts(e.target.value ? Math.max(1, Number(e.target.value)) : null)
                  }
                  className="w-full px-3 py-2 rounded-xl text-xs sm:text-sm border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800"
                />
              </div>
            </div>

            <div className="pt-2 border-t border-slate-100 dark:border-slate-800 space-y-2.5">
              <label className="flex items-center gap-2.5 text-xs text-slate-700 dark:text-slate-300 cursor-pointer">
                <input
                  type="checkbox"
                  checked={shuffleQuestions}
                  onChange={(e) => setShuffleQuestions(e.target.checked)}
                  className="rounded text-indigo-600 focus:ring-indigo-500"
                />
                <span>Aleatorizar orden de preguntas para alumnos</span>
              </label>

              <label className="flex items-center gap-2.5 text-xs text-slate-700 dark:text-slate-300 cursor-pointer">
                <input
                  type="checkbox"
                  checked={shuffleOptions}
                  onChange={(e) => setShuffleOptions(e.target.checked)}
                  className="rounded text-indigo-600 focus:ring-indigo-500"
                />
                <span>Aleatorizar orden de opciones de respuesta</span>
              </label>
            </div>
          </div>
        </div>

        {/* Right Column: Questions Builder */}
        <div className="space-y-4 lg:col-span-2">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-base font-bold text-slate-900 dark:text-white">
                Reactivos y Preguntas ({questions.length})
              </h2>
              <p className="text-xs text-slate-500">
                Diseña viñetas clínicas, opciones de respuesta y retroalimentaciones académicas.
              </p>
            </div>

            <button
              type="button"
              onClick={() => {
                const newQ = createEmptyQuestion();
                setQuestions((prev) => [...prev, newQ]);
                setExpandedIndex(questions.length);
              }}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs sm:text-sm font-semibold shadow-sm transition"
            >
              <Plus className="w-4 h-4" /> Agregar Pregunta
            </button>
          </div>

          {/* Question Cards List */}
          <div className="space-y-4">
            {questions.map((q, index) => {
              const isExpanded = expandedIndex === index;

              return (
                <div
                  key={q.id || index}
                  className={`rounded-2xl border transition-all ${
                    isExpanded
                      ? 'border-indigo-500/50 dark:border-indigo-500/40 bg-white dark:bg-slate-900 shadow-md'
                      : 'border-slate-200/80 dark:border-slate-800 bg-white/70 dark:bg-slate-900/60 hover:border-slate-300'
                  }`}
                >
                  {/* Question Card Header (Collapsible / Summary) */}
                  <div
                    onClick={() => setExpandedIndex(isExpanded ? null : index)}
                    className="flex items-center justify-between p-4 cursor-pointer select-none"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <span className="w-7 h-7 rounded-xl bg-indigo-50 dark:bg-indigo-950/80 text-indigo-600 dark:text-indigo-400 font-bold text-xs flex items-center justify-center shrink-0 border border-indigo-100 dark:border-indigo-800">
                        {index + 1}
                      </span>

                      <div className="min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
                            {QUESTION_TYPES.find((t) => t.value === q.type)?.label ?? 'Opción única'}
                          </span>
                          <span
                            className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                              DIFFICULTIES.find((d) => d.value === (q.difficulty ?? 'intermediate'))?.color
                            }`}
                          >
                            {DIFFICULTIES.find((d) => d.value === (q.difficulty ?? 'intermediate'))?.label}
                          </span>
                          {q.imageUrl && (
                            <span className="text-[10px] font-semibold text-cyan-600 dark:text-cyan-400 flex items-center gap-0.5">
                              <ImageIcon className="w-3 h-3" /> Imagen
                            </span>
                          )}
                        </div>
                        <p className="text-xs sm:text-sm font-medium text-slate-800 dark:text-slate-200 truncate mt-1">
                          {q.stem ? q.stem : '(Haz clic para redactar el enunciado...)'}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-1.5 shrink-0 ml-2" onClick={(e) => e.stopPropagation()}>
                      <button
                        type="button"
                        title="Subir"
                        disabled={index === 0}
                        onClick={() => moveQuestion(index, 'up')}
                        className="p-1 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 disabled:opacity-30 transition"
                      >
                        <ChevronUp className="w-4 h-4" />
                      </button>
                      <button
                        type="button"
                        title="Bajar"
                        disabled={index === questions.length - 1}
                        onClick={() => moveQuestion(index, 'down')}
                        className="p-1 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 disabled:opacity-30 transition"
                      >
                        <ChevronDown className="w-4 h-4" />
                      </button>
                      <button
                        type="button"
                        title="Duplicar pregunta"
                        onClick={() => duplicateQuestion(index)}
                        className="p-1 rounded-lg text-slate-400 hover:text-indigo-600 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
                      >
                        <Copy className="w-4 h-4" />
                      </button>
                      <button
                        type="button"
                        title="Mover o transferir a otro tema/módulo"
                        onClick={() => setMovingQuestionIndex(index)}
                        className="p-1 rounded-lg text-slate-400 hover:text-indigo-600 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
                      >
                        <FolderInput className="w-4 h-4" />
                      </button>
                      <button
                        type="button"
                        title="Eliminar pregunta"
                        onClick={() => deleteQuestion(index)}
                        className="p-1 rounded-lg text-slate-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/40 transition"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  {/* Question Card Content (Expanded) */}
                  {isExpanded && (
                    <div className="p-4 sm:p-5 border-t border-slate-100 dark:border-slate-800 space-y-4">
                      {/* Top Action inside expanded */}
                      <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
                        <span className="text-xs font-bold text-slate-500">Configuración del Reactivo</span>
                        <button
                          type="button"
                          onClick={() => setMovingQuestionIndex(index)}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold text-indigo-700 dark:text-indigo-300 bg-indigo-50 dark:bg-indigo-950/40 hover:bg-indigo-100 dark:hover:bg-indigo-900/50 transition border border-indigo-200 dark:border-indigo-800/60"
                        >
                          <FolderInput className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />
                          <span>Mover o transferir a otro tema...</span>
                        </button>
                      </div>

                      {/* Selectors Row */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div>
                          <label className="block text-xs font-semibold text-slate-500 mb-1">
                            Tipo de Reactivo
                          </label>
                          <select
                            value={q.type}
                            onChange={(e) =>
                              updateQuestion(index, { type: e.target.value as QuizQuestionType })
                            }
                            className="w-full px-3 py-2 rounded-xl text-xs sm:text-sm border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800"
                          >
                            {QUESTION_TYPES.map((t) => (
                              <option key={t.value} value={t.value}>
                                {t.label} ({t.description})
                              </option>
                            ))}
                          </select>
                        </div>

                        <div>
                          <label className="block text-xs font-semibold text-slate-500 mb-1">
                            Nivel de Dificultad
                          </label>
                          <select
                            value={q.difficulty ?? 'intermediate'}
                            onChange={(e) =>
                              updateQuestion(index, { difficulty: e.target.value as QuizDifficulty })
                            }
                            className="w-full px-3 py-2 rounded-xl text-xs sm:text-sm border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800"
                          >
                            {DIFFICULTIES.map((d) => (
                              <option key={d.value} value={d.value}>
                                {d.label}
                              </option>
                            ))}
                          </select>
                        </div>
                      </div>

                      {/* Stem Textarea */}
                      <div>
                        <label className="block text-xs font-semibold text-slate-500 mb-1">
                          Enunciado / Viñeta Clínica
                        </label>
                        <textarea
                          rows={3}
                          value={q.stem}
                          onChange={(e) => updateQuestion(index, { stem: e.target.value })}
                          placeholder="Escribe la viñeta clínica, antecedentes electrofisiológicos y pregunta..."
                          className="w-full px-3 py-2 rounded-xl text-xs sm:text-sm border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 leading-relaxed"
                        />
                      </div>

                      {/* Clinical Image Field (if image_choice) */}
                      {q.type === 'image_choice' && (
                        <div className="p-3.5 rounded-xl border border-cyan-200 dark:border-cyan-900/50 bg-cyan-50/40 dark:bg-cyan-950/20 space-y-3">
                          <div className="flex flex-wrap items-center justify-between gap-2">
                            <span className="text-xs font-bold text-cyan-800 dark:text-cyan-300 flex items-center gap-1.5">
                              <ImageIcon className="w-4 h-4" /> Registro de Imagen Clínica / Trazo EMG Calibrado
                            </span>
                            <span className="text-[11px] font-medium text-cyan-700/80 dark:text-cyan-300/80">
                              Osciloscopio 10×8 div · Sin revelar diagnóstico en encabezado
                            </span>
                          </div>

                          {/* Calibrated EMG SVG Trace Generator */}
                          <div className="p-3 rounded-xl bg-white/80 dark:bg-slate-900/80 border border-cyan-200/70 dark:border-cyan-800/60 space-y-2.5">
                            <div className="text-[11px] font-bold text-slate-700 dark:text-slate-200 flex items-center gap-1.5">
                              <Activity className="w-3.5 h-3.5 text-emerald-500" />
                              <span>Generador de Trazado EMG Calibrado (SVG → Bucket emg-trace-images)</span>
                            </div>
                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                              <select
                                value={selectedTracePreset}
                                onChange={(e) => setSelectedTracePreset(e.target.value)}
                                className="px-2.5 py-1.5 rounded-lg text-xs border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-100"
                              >
                                {CLINICAL_PRESETS.map((preset) => (
                                  <option key={preset.id} value={preset.id}>
                                    [{preset.studyType.toUpperCase()}] {preset.title}
                                  </option>
                                ))}
                              </select>

                              <select
                                value={selectedTraceVariant}
                                onChange={(e) =>
                                  setSelectedTraceVariant(
                                    e.target.value as 'pathologic' | 'normal' | 'comparison'
                                  )
                                }
                                className="px-2.5 py-1.5 rounded-lg text-xs border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-100"
                              >
                                <option value="pathologic">Trazo Patológico (L1 marcado)</option>
                                <option value="comparison">Comparativo CH1 Control vs CH2 Estudio</option>
                                <option value="normal">Trazo Normal / Control</option>
                              </select>

                              <button
                                type="button"
                                disabled={uploadingTraceIndex === index}
                                onClick={() => handleGenerateAndUploadTrace(index)}
                                className="inline-flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold shadow-xs transition disabled:opacity-50 cursor-pointer"
                              >
                                <Activity className="w-3.5 h-3.5" />
                                <span>
                                  {uploadingTraceIndex === index
                                    ? 'Generando SVG...'
                                    : 'Generar y Subir Trazo'}
                                </span>
                              </button>
                            </div>
                          </div>

                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                            <input
                              type="url"
                              placeholder="URL de la imagen (ej: https://... o ruta pública)"
                              value={q.imageUrl ?? ''}
                              onChange={(e) => updateQuestion(index, { imageUrl: e.target.value })}
                              className="px-3 py-2 rounded-xl text-xs border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800"
                            />
                            <input
                              type="text"
                              placeholder="Pie de figura / texto alternativo (alt clínico sin diagnóstico)"
                              value={q.imageAlt ?? ''}
                              onChange={(e) => updateQuestion(index, { imageAlt: e.target.value })}
                              className="px-3 py-2 rounded-xl text-xs border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800"
                            />
                          </div>

                          {q.imageUrl && (
                            <div className="rounded-xl overflow-hidden border border-slate-200 dark:border-slate-700 max-h-56 flex items-center justify-center bg-black/80 p-2">
                              <img
                                src={q.imageUrl}
                                alt={q.imageAlt || 'Vista previa'}
                                className="max-h-52 object-contain"
                                onError={(e) => {
                                  (e.target as HTMLElement).style.display = 'none';
                                }}
                              />
                            </div>
                          )}
                        </div>
                      )}

                      {/* Options Section */}
                      <div className="space-y-2.5">
                        <div className="flex items-center justify-between">
                          <label className="text-xs font-bold uppercase tracking-wider text-slate-500">
                            Opciones de Respuesta
                          </label>
                          {q.type !== 'true_false' && (
                            <button
                              type="button"
                              onClick={() => addOptionToQuestion(index)}
                              className="inline-flex items-center gap-1 text-xs font-semibold text-indigo-600 dark:text-indigo-400 hover:underline"
                            >
                              <Plus className="w-3.5 h-3.5" /> Agregar Opción
                            </button>
                          )}
                        </div>

                        <div className="space-y-2">
                          {q.options.map((opt, optIndex) => (
                            <div
                              key={opt.id || optIndex}
                              className={`flex items-center gap-2.5 p-2 rounded-xl border transition ${
                                opt.isCorrect
                                  ? 'border-emerald-500/60 bg-emerald-50/40 dark:bg-emerald-950/20'
                                  : 'border-slate-200 dark:border-slate-700/80 bg-white dark:bg-slate-800'
                              }`}
                            >
                              {/* Radio or checkbox */}
                              <label className="flex items-center justify-center cursor-pointer p-1">
                                <input
                                  type={q.type === 'multiple' ? 'checkbox' : 'radio'}
                                  name={`question-${index}-correct`}
                                  checked={opt.isCorrect}
                                  onChange={() => toggleOptionCorrect(index, optIndex)}
                                  className="w-4 h-4 rounded text-emerald-600 focus:ring-emerald-500"
                                />
                              </label>

                              {/* Option text */}
                              <input
                                type="text"
                                value={opt.text}
                                disabled={q.type === 'true_false'}
                                onChange={(e) => {
                                  const options = [...q.options];
                                  options[optIndex] = { ...options[optIndex], text: e.target.value };
                                  updateQuestion(index, { options });
                                }}
                                placeholder={`Texto de la opción ${optIndex + 1}`}
                                className="flex-1 px-3 py-1.5 rounded-lg text-xs sm:text-sm bg-transparent border-0 focus:ring-0 text-slate-800 dark:text-slate-100 disabled:opacity-75"
                              />

                              {opt.isCorrect && (
                                <span className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-100 dark:bg-emerald-950/70 px-2 py-0.5 rounded-md shrink-0">
                                  Correcta
                                </span>
                              )}

                              {q.type !== 'true_false' && q.options.length > 2 && (
                                <button
                                  type="button"
                                  onClick={() => removeOption(index, optIndex)}
                                  className="p-1 text-slate-400 hover:text-red-500 transition"
                                  title="Eliminar opción"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </button>
                              )}
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Explanation / Clinical Pearl & Bibliographic Grounding */}
                      <div className="space-y-2">
                        <div className="flex flex-wrap items-center justify-between gap-2">
                          <label className="text-xs font-semibold text-slate-500 flex items-center gap-1.5">
                            <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                            <span>Retroalimentación Académica / Perla Clínica + Bibliografía</span>
                          </label>

                          {topicRefs.length > 0 && (
                            <select
                              value=""
                              onChange={(e) => {
                                const idxRef = Number(e.target.value);
                                if (!Number.isNaN(idxRef) && topicRefs[idxRef]) {
                                  handleInsertReference(index, topicRefs[idxRef]);
                                }
                              }}
                              className="px-2.5 py-1 rounded-lg text-[11px] font-semibold border border-indigo-200 dark:border-indigo-800 bg-indigo-50/70 dark:bg-indigo-950/50 text-indigo-700 dark:text-indigo-300"
                            >
                              <option value="">+ Insertar cita verificada del tema...</option>
                              {topicRefs.map((ref, rIdx) => (
                                <option key={rIdx} value={rIdx}>
                                  {ref.authors} ({ref.year}) — {ref.journal || ref.title.slice(0, 45)}
                                </option>
                              ))}
                            </select>
                          )}
                        </div>

                        <textarea
                          rows={3}
                          value={q.explanation ?? ''}
                          onChange={(e) => updateQuestion(index, { explanation: e.target.value })}
                          placeholder="Justificación médica y electrodiagnóstica + 📚 Referencia: Autor (Año). Título. Revista. DOI/URL..."
                          className="w-full px-3 py-2 rounded-xl text-xs sm:text-sm border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 leading-relaxed"
                        />

                        {q.citations && q.citations.length > 0 && (
                          <div className="flex flex-wrap items-center gap-1.5 pt-1">
                            {q.citations.map((cit, cIdx) => (
                              <span
                                key={cIdx}
                                className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-[11px] text-slate-700 dark:text-slate-300"
                              >
                                <BookOpen className="w-3 h-3 text-indigo-500 shrink-0" />
                                <span className="truncate max-w-xs">
                                  {cit.authors} ({cit.year}) · {cit.journal}
                                </span>
                                <button
                                  type="button"
                                  onClick={() =>
                                    updateQuestion(index, {
                                      citations: q.citations?.filter((_, i) => i !== cIdx),
                                    })
                                  }
                                  className="text-slate-400 hover:text-red-500"
                                  title="Quitar cita estructurada"
                                >
                                  <X className="w-3 h-3" />
                                </button>
                              </span>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Interactive Simulator Modal */}
      <AdminQuizSimulatorModal
        isOpen={showSimulator}
        onClose={() => setShowSimulator(false)}
        quizTitle={title}
        passScore={passScore}
        questions={questions}
      />

      {/* Transfer Question Modal */}
      <AdminMoveQuestionModal
        isOpen={movingQuestionIndex !== null}
        onClose={() => setMovingQuestionIndex(null)}
        question={movingQuestionIndex !== null ? questions[movingQuestionIndex] : null}
        questionIndex={movingQuestionIndex}
        currentModuleId={selectedModuleId}
        currentTopicId={selectedTopicId}
        onSuccess={async (mode, _targetTopicId, targetTopicTitle) => {
          if (mode === 'move' && movingQuestionIndex !== null) {
            if (!user) throw new Error('Sesión no disponible.');
            if (!selectedTopicId) throw new Error('Selecciona el tema de origen antes de mover.');
            quizLoadToken.current += 1;
            const remaining = questions.filter((_, index) => index !== movingQuestionIndex);
            await publishAdminQuizDirectly({
              topicId: selectedTopicId,
              moduleId: selectedModuleId,
              title: title.trim() || 'Evaluación del tema',
              passScore,
              maxAttempts,
              shuffleQuestions,
              shuffleOptions,
              questions: remaining,
              authorId: user.id,
            });
            setQuestions(remaining.length > 0 ? remaining : [createEmptyQuestion()]);
            setExpandedIndex(
              remaining.length === 0 ? 0 : Math.min(movingQuestionIndex, remaining.length - 1)
            );
            setDataSource('database');
            setVersion((current) => current + 1);
          }
          setSuccessToast(
            mode === 'move'
              ? `Pregunta movida a «${targetTopicTitle}». Esta evaluación ya quedó actualizada en vivo.`
              : `Pregunta copiada al tema «${targetTopicTitle}».`
          );
          setTimeout(() => setSuccessToast(null), 5000);
        }}
      />
    </div>
  );
}
