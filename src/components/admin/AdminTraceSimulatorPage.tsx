// src/components/admin/AdminTraceSimulatorPage.tsx
// Vista del Simulador de Trazos EMG dentro del panel administrativo y docente

import { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import {
  Activity,
  CheckCircle2,
  AlertTriangle,
  Sparkles,
  Stethoscope,
  Filter,
  Copy,
  Check,
  ArrowRight,
  Move,
  Trash2,
  UserCheck,
} from 'lucide-react';
import { AdminLayout } from './AdminLayout';
import {
  getAllTracesMerged,
  addImageToTraceCase,
  addMultipleImagesToTraceCase,
  removeImageFromTraceCase,
  deleteCustomTrace,
} from '../simulator/traceEngine/customTraceStore';
import type { DiagnosticCategory, TraceCaseDefinition } from '../simulator/traceEngine/types';
import { TraceOscilloscope } from '../simulator/traceEngine/TraceOscilloscope';
import { TraceTelemetry } from '../simulator/traceEngine/TraceTelemetry';
import { TraceImagesGallery } from '../simulator/traceEngine/TraceImagesGallery';
import { TeacherTraceBuilderModal } from '../simulator/TeacherTraceBuilderModal';
import { WaveformSculptorModal } from '../simulator/traceEngine/WaveformSculptorModal';

const CATEGORIES: { id: DiagnosticCategory | 'all'; label: string }[] = [
  { id: 'all', label: 'Todos los Trazos' },
  { id: 'entrapment', label: 'Atrapamientos Focales' },
  { id: 'polyneuropathy', label: 'Polineuropatías' },
  { id: 'radiculopathy', label: 'Radiculopatías y Aguja' },
  { id: 'motor_neuron', label: 'Enf. Motoneurona (ELA)' },
  { id: 'myopathy', label: 'Miopatías y Miotonía' },
];

export default function AdminTraceSimulatorPage() {
  const [selectedCategory, setSelectedCategory] = useState<DiagnosticCategory | 'all'>('all');
  const [activeCaseIndex, setActiveCaseIndex] = useState(0);
  const [isPathologic, setIsPathologic] = useState(false);
  const [showProximal, setShowProximal] = useState(false);
  const [isBuilderOpen, setIsBuilderOpen] = useState(false);
  const [isSculptorOpen, setIsSculptorOpen] = useState(false);
  const [sculptorInitialCase, setSculptorInitialCase] = useState<TraceCaseDefinition | undefined>(undefined);
  const [copiedPreset, setCopiedPreset] = useState(false);
  const [tracesVersion, setTracesVersion] = useState(0);

  // Casos fusionados (presets de fábrica + casos esculpidos / guardados por docentes)
  const allCases = useMemo(() => {
    // depend on tracesVersion to trigger reload on save
    // eslint-disable-next-line @typescript-eslint/no-unused-expressions
    tracesVersion;
    return getAllTracesMerged();
  }, [tracesVersion]);

  const filteredCases = useMemo(() => {
    if (selectedCategory === 'all') return allCases;
    return allCases.filter((c) => c.category === selectedCategory);
  }, [selectedCategory, allCases]);

  const currentCase: TraceCaseDefinition =
    filteredCases[activeCaseIndex] ?? filteredCases[0] ?? allCases[0];

  const activeParams =
    isPathologic && currentCase.pathologic ? currentCase.pathologic : currentCase.normal;

  const currentSnippet = `:::emg-trace{preset="${currentCase.id}" mode="comparison"}:::`;

  const handleCopySnippet = async () => {
    try {
      await navigator.clipboard.writeText(currentSnippet);
      setCopiedPreset(true);
      setTimeout(() => setCopiedPreset(false), 2000);
    } catch {}
  };

  const handleOpenSculptor = (targetCase?: TraceCaseDefinition) => {
    setSculptorInitialCase(targetCase || currentCase);
    setIsSculptorOpen(true);
  };

  const handleTraceSavedFromSculptor = (savedCase: TraceCaseDefinition) => {
    setTracesVersion((v) => v + 1);
    // Find index of saved case in list
    setTimeout(() => {
      const updatedAll = getAllTracesMerged();
      const newIndex = updatedAll.findIndex((c) => c.id === savedCase.id);
      if (newIndex >= 0) {
        setSelectedCategory('all');
        setActiveCaseIndex(newIndex);
      }
    }, 50);
  };

  const handleDeleteCustom = (caseId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (confirm('¿Eliminar este trazo personalizado permanentemente?')) {
      deleteCustomTrace(caseId);
      setTracesVersion((v) => v + 1);
      setActiveCaseIndex(0);
    }
  };

  return (
    <AdminLayout
      title="Simulador de Trazos EMG"
      subtitle="Laboratorio electrofisiológico calibrado, banco de ondas y generador interactivo para temas"
      headerActions={
        <div className="flex flex-wrap items-center gap-2">
          {/* Botón Esculpir Manualmente */}
          <button
            type="button"
            onClick={() => handleOpenSculptor()}
            className="inline-flex items-center gap-1.5 rounded-xl border border-purple-500/30 bg-purple-500/10 hover:bg-purple-500/20 px-3.5 py-2 text-xs font-bold text-purple-300 shadow-sm transition"
          >
            <Move className="h-3.5 w-3.5" />
            <span>Esculpir Morfología Manual</span>
          </button>

          {/* Botón Parámetros / Calibrador */}
          <button
            type="button"
            onClick={() => setIsBuilderOpen(true)}
            className="inline-flex items-center gap-1.5 rounded-xl bg-gradient-to-r from-cyan-600 to-teal-600 px-3.5 py-2 text-xs font-bold text-white shadow-sm hover:from-cyan-700 hover:to-teal-700 transition"
          >
            <Sparkles className="h-3.5 w-3.5" />
            <span>Crear / Calibrar Trazo</span>
          </button>
        </div>
      }
    >
      <div className="space-y-6">
        {/* Banner de Ayuda Docente */}
        <div className="rounded-2xl border border-cyan-200/70 dark:border-cyan-900/50 bg-gradient-to-r from-cyan-50/70 via-teal-50/40 to-slate-50 dark:from-cyan-950/30 dark:via-teal-950/20 dark:to-slate-900/40 p-4 sm:p-5 flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-xs">
          <div className="flex items-start gap-3">
            <span className="p-2 rounded-xl bg-cyan-600 text-white shrink-0 shadow-xs">
              <Activity className="h-5 w-5" />
            </span>
            <div>
              <h2 className="text-sm sm:text-base font-bold text-slate-900 dark:text-white">
                Integración de Trazos en Lecciones y Temas
              </h2>
              <p className="text-xs text-slate-600 dark:text-slate-300 mt-0.5 leading-relaxed">
                Cualquier trazo de este laboratorio puede incrustarse en el flujo de lectura de un tema copiando su directiva o usando el botón <strong>«⚡ Trazo EMG»</strong> en el editor del tema.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 self-start md:self-auto shrink-0">
            <div className="font-mono text-xs px-2.5 py-1.5 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-cyan-600 dark:text-cyan-400 select-all">
              {currentSnippet}
            </div>
            <button
              type="button"
              onClick={handleCopySnippet}
              className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-slate-900 dark:bg-slate-800 text-white text-xs font-semibold hover:bg-slate-800 dark:hover:bg-slate-700 transition"
              title="Copiar código para pegar en el contenido de un tema"
            >
              {copiedPreset ? <Check className="h-3.5 w-3.5 text-emerald-400" /> : <Copy className="h-3.5 w-3.5" />}
              <span>{copiedPreset ? 'Copiado' : 'Copiar'}</span>
            </button>
          </div>
        </div>

        {/* Barra de Filtros por Categoría */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 no-scrollbar text-xs font-semibold">
          <span className="flex items-center gap-1 text-slate-500 dark:text-slate-400 mr-1 text-[11px] whitespace-nowrap">
            <Filter className="h-3.5 w-3.5 text-cyan-500" />
            Categoría:
          </span>
          {CATEGORIES.map((cat) => (
            <button
              key={cat.id}
              onClick={() => {
                setSelectedCategory(cat.id);
                setActiveCaseIndex(0);
                setIsPathologic(false);
                setShowProximal(false);
              }}
              className={`whitespace-nowrap rounded-xl px-3 py-1.5 transition ${
                selectedCategory === cat.id
                  ? 'bg-cyan-600 text-white font-bold shadow-xs'
                  : 'border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 hover:border-slate-300 dark:hover:border-slate-700'
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>

        {/* Selector de Casos */}
        <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/60 p-2 sm:p-2.5 shadow-2xs">
          <div className="flex items-center gap-2 overflow-x-auto no-scrollbar">
            <span className="flex items-center gap-1.5 text-xs font-medium text-slate-500 dark:text-slate-400 whitespace-nowrap pl-2">
              <Stethoscope className="h-3.5 w-3.5 text-cyan-500" />
              Caso:
            </span>
            {filteredCases.map((c, idx) => (
              <div
                key={c.id}
                className={`group relative whitespace-nowrap rounded-xl transition flex items-center ${
                  activeCaseIndex === idx
                    ? 'bg-slate-900 dark:bg-cyan-500 text-white dark:text-slate-950 font-bold shadow-xs'
                    : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
                }`}
              >
                <button
                  type="button"
                  onClick={() => {
                    setActiveCaseIndex(idx);
                    setIsPathologic(false);
                    setShowProximal(false);
                  }}
                  className="px-3.5 py-1.5 text-xs font-medium flex items-center gap-1.5 focus:outline-none"
                >
                  <span>{c.title}</span>
                  {c.isCustomUserCreated && (
                    <span
                      className={`inline-flex items-center gap-0.5 rounded px-1 text-[9px] font-semibold ${
                        activeCaseIndex === idx
                          ? 'bg-slate-950 text-cyan-300'
                          : 'bg-purple-500/20 text-purple-300 border border-purple-500/30'
                      }`}
                      title="Trazo personalizado por docente"
                    >
                      <UserCheck className="h-2.5 w-2.5" />
                      <span>Docente</span>
                    </span>
                  )}
                </button>
                {c.isCustomUserCreated && (
                  <button
                    type="button"
                    onClick={(e) => handleDeleteCustom(c.id, e)}
                    className="opacity-0 group-hover:opacity-100 text-rose-400 hover:text-rose-300 pr-2.5 p-1 transition"
                    title="Eliminar este trazo"
                  >
                    <Trash2 className="h-3 w-3" />
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Panel Central del Osciloscopio y Telemetría */}
        <div className="overflow-hidden rounded-3xl border border-slate-800 bg-slate-950 text-slate-100 shadow-xl">
          {/* Barra superior de información */}
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-800 bg-slate-900/90 px-4 py-3 sm:px-6">
            <div>
              <div className="flex items-center gap-2">
                <span className="font-mono text-xs font-bold text-cyan-300">
                  {currentCase.nerveOrMuscle}
                </span>
                <span className="rounded bg-slate-800 px-1.5 py-0.5 text-[10px] font-mono text-slate-400 uppercase">
                  {currentCase.studyType === 'motor'
                    ? 'CMAP Motor'
                    : currentCase.studyType === 'sensory'
                    ? 'SNAP Sensitivo'
                    : 'EMG de Aguja'}
                </span>
                {currentCase.isCustomUserCreated && (
                  <span className="rounded bg-purple-500/20 border border-purple-500/30 px-1.5 py-0.5 text-[10px] font-semibold text-purple-300">
                    Morfología Manual Personalizada
                  </span>
                )}
              </div>
              <p className="text-xs text-slate-400 mt-0.5">{currentCase.technique}</p>
            </div>

            <div className="flex items-center gap-2">
              {/* Botón para editar directamente la morfología de este caso */}
              <button
                type="button"
                onClick={() => handleOpenSculptor(currentCase)}
                className="inline-flex items-center gap-1.5 rounded-xl border border-purple-500/40 bg-purple-500/10 hover:bg-purple-500/20 px-3 py-1.5 text-xs font-semibold text-purple-300 transition"
                title="Abre el editor Bézier para modificar los puntos de control de este trazo"
              >
                <Move className="h-3 w-3" />
                <span>Moldear Puntos</span>
              </button>

              {currentCase.pathologic && (
                <div className="inline-flex rounded-xl border border-slate-700/80 bg-slate-900 p-1">
                  <button
                    type="button"
                    onClick={() => setIsPathologic(false)}
                    className={`flex items-center gap-1.5 rounded-lg px-3 py-1 text-xs font-semibold transition ${
                      !isPathologic
                        ? 'bg-emerald-400 text-slate-950 font-bold'
                        : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    <CheckCircle2 className="h-3.5 w-3.5" />
                    <span>Normal</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setIsPathologic(true)}
                    className={`flex items-center gap-1.5 rounded-lg px-3 py-1 text-xs font-semibold transition ${
                      isPathologic
                        ? 'bg-amber-400 text-slate-950 font-bold'
                        : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    <AlertTriangle className="h-3.5 w-3.5" />
                    <span>Patológico</span>
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Grid Osciloscopio + Telemetría */}
          <div className="grid grid-cols-1 lg:grid-cols-12 divide-y lg:divide-y-0 lg:divide-x divide-slate-800">
            <div className="p-4 sm:p-6 lg:col-span-7 flex flex-col justify-between">
              <TraceOscilloscope
                traceParams={activeParams}
                studyType={currentCase.studyType}
                sensitivity={currentCase.sensitivity}
                sweepSpeed={currentCase.sweepSpeed}
                isPathologic={isPathologic}
                showProximal={showProximal}
                onToggleProximal={
                  currentCase.studyType === 'motor'
                    ? () => setShowProximal(!showProximal)
                    : undefined
                }
                height={290}
              />

              <div className="mt-3 flex flex-wrap items-center justify-between gap-2 text-xs text-slate-400">
                <span className="flex items-center gap-1.5">
                  <Activity className="h-3.5 w-3.5 text-cyan-400" />
                  <span>Usa los calibradores interactivos para medir y corroborar los valores clínicos</span>
                </span>
                <span className="font-mono text-[11px] text-slate-500">ElectroDx Engine v3</span>
              </div>
            </div>

            <div className="p-4 sm:p-6 lg:col-span-5 bg-slate-900/60 flex flex-col justify-between">
              <TraceTelemetry
                traceParams={activeParams}
                studyType={currentCase.studyType}
                isPathologic={isPathologic}
                clinicalPearls={currentCase.clinicalPearls}
              />

              <div className="mt-4 pt-3 border-t border-slate-800 flex items-center justify-between text-xs">
                <span className="text-slate-400 text-[11px]">Banco de Casos Clínicos con Tabla</span>
                <Link
                  to="/admin/ejercicios"
                  className="inline-flex items-center gap-1 font-semibold text-cyan-400 hover:text-cyan-300 transition"
                >
                  <span>Ver Casos</span>
                  <ArrowRight className="h-3.5 w-3.5" />
                </Link>
              </div>
            </div>
          </div>
        </div>

        {/* Galería de Imágenes Complementarias con Selector de Patrón Normal vs Patológico */}
        <TraceImagesGallery
          images={currentCase.images || []}
          canEdit={true}
          isPathologic={isPathologic}
          studyType={currentCase.studyType}
          onAddImage={(newImg, scope) => {
            const updated = addImageToTraceCase(currentCase.id, newImg, scope);
            if (updated) {
              setTracesVersion((v) => v + 1);
            }
          }}
          onAddMultipleImages={(newImages, scope) => {
            const updated = addMultipleImagesToTraceCase(currentCase.id, newImages, scope);
            if (updated) {
              setTracesVersion((v) => v + 1);
            }
          }}
          onRemoveImage={(imgId) => {
            const updated = removeImageFromTraceCase(currentCase.id, imgId);
            if (updated) {
              setTracesVersion((v) => v + 1);
            }
          }}
        />
      </div>

      {/* Modal de Escultor de Morfología Manual */}
      <WaveformSculptorModal
        isOpen={isSculptorOpen}
        onClose={() => setIsSculptorOpen(false)}
        initialCase={sculptorInitialCase}
        onTraceSaved={handleTraceSavedFromSculptor}
      />

      {/* Modal de Estudio Docente */}
      <TeacherTraceBuilderModal
        isOpen={isBuilderOpen}
        onClose={() => setIsBuilderOpen(false)}
        topicTitle="Panel de Administración"
      />
    </AdminLayout>
  );
}
