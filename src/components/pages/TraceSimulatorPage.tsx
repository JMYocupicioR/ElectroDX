// src/components/pages/TraceSimulatorPage.tsx
// Laboratorio clínico interactivo completo de trazos electrodiagnósticos

import { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import {
  Activity,
  CheckCircle2,
  AlertTriangle,
  Sparkles,
  Stethoscope,
  ArrowRight,
  Filter,
  Move,
  UserCheck,
} from 'lucide-react';
import {
  getAllTracesMerged,
  addImageToTraceCase,
  addMultipleImagesToTraceCase,
  removeImageFromTraceCase,
} from '../simulator/traceEngine/customTraceStore';
import type { DiagnosticCategory, TraceCaseDefinition } from '../simulator/traceEngine/types';
import { TraceOscilloscope } from '../simulator/traceEngine/TraceOscilloscope';
import { TraceTelemetry } from '../simulator/traceEngine/TraceTelemetry';
import { TraceImagesGallery } from '../simulator/traceEngine/TraceImagesGallery';
import { TeacherTraceBuilderModal } from '../simulator/TeacherTraceBuilderModal';
import { WaveformSculptorModal } from '../simulator/traceEngine/WaveformSculptorModal';
import { useAuth } from '../../contexts/AuthProvider';

const CATEGORIES: { id: DiagnosticCategory | 'all'; label: string }[] = [
  { id: 'all', label: 'Todos los Trazos' },
  { id: 'entrapment', label: 'Atrapamientos Focales' },
  { id: 'polyneuropathy', label: 'Polineuropatías' },
  { id: 'radiculopathy', label: 'Radiculopatías y Aguja' },
  { id: 'motor_neuron', label: 'Enf. Motoneurona (ELA)' },
  { id: 'myopathy', label: 'Miopatías y Miotonía' },
];

export default function TraceSimulatorPage() {
  const { canProposeContent } = useAuth();
  const [selectedCategory, setSelectedCategory] = useState<DiagnosticCategory | 'all'>('all');
  const [activeCaseIndex, setActiveCaseIndex] = useState(0);
  const [isPathologic, setIsPathologic] = useState(false);
  const [showProximal, setShowProximal] = useState(false);
  const [isTeacherStudioOpen, setIsTeacherStudioOpen] = useState(false);
  const [isSculptorOpen, setIsSculptorOpen] = useState(false);
  const [tracesVersion, setTracesVersion] = useState(0);

  // Casos fusionados (presets clínicos + casos modelados)
  const allCases = useMemo(() => {
    // eslint-disable-next-line @typescript-eslint/no-unused-expressions
    tracesVersion;
    return getAllTracesMerged();
  }, [tracesVersion]);

  // Casos filtrados
  const filteredCases = useMemo(() => {
    if (selectedCategory === 'all') return allCases;
    return allCases.filter((c) => c.category === selectedCategory);
  }, [selectedCategory, allCases]);

  // Asegurar que activeCaseIndex esté dentro de los límites al cambiar filtro
  const currentCase: TraceCaseDefinition =
    filteredCases[activeCaseIndex] ?? filteredCases[0] ?? allCases[0];

  const activeParams =
    isPathologic && currentCase.pathologic ? currentCase.pathologic : currentCase.normal;

  return (
    <main id="contenido-principal" className="min-h-screen pt-20 pb-20 px-3 sm:px-6 max-w-7xl mx-auto space-y-6">
      {/* Cabecera del Laboratorio */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="flex h-6 w-6 items-center justify-center rounded-lg bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
              <Activity className="h-3.5 w-3.5" />
            </span>
            <span className="text-[11px] font-bold uppercase tracking-widest text-cyan-400">
              Laboratorio Electrodiagnóstico Calibrado
            </span>
          </div>
          <h1 className="text-xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
            Simulador de Trazos EMG y Conducción Nerviosa
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1 max-w-2xl leading-relaxed">
            Compara la morfología normal vs. patológica de CMAPs, SNAPs y EMG de aguja con rejilla CRT de 10 divisiones, calibradores arrastrables de latencia/amplitud, auscultación de audio e imágenes ecográficas y anatómicas correlativas.
          </p>
        </div>

        {/* Acciones de docente (si tiene permisos) */}
        {canProposeContent && (
          <div className="flex flex-wrap items-center gap-2 self-start sm:self-auto">
            <button
              type="button"
              onClick={() => setIsSculptorOpen(true)}
              className="inline-flex items-center gap-1.5 rounded-xl border border-purple-500/30 bg-purple-500/10 hover:bg-purple-500/20 px-3.5 py-2 text-xs font-bold text-purple-300 shadow-sm transition"
            >
              <Move className="h-3.5 w-3.5" />
              <span>Esculpir Trazo</span>
            </button>
            <button
              type="button"
              onClick={() => setIsTeacherStudioOpen(true)}
              className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-cyan-600 to-teal-600 px-4 py-2 text-xs font-bold text-white shadow-md shadow-cyan-500/20 hover:from-cyan-700 hover:to-teal-700 transition"
            >
              <Sparkles className="h-3.5 w-3.5" />
              <span>Estudio Docente</span>
            </button>
          </div>
        )}
      </div>

      {/* Selector de Categorías (Pills) */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 no-scrollbar text-xs font-semibold">
        <span className="flex items-center gap-1 text-slate-400 mr-1 text-[11px] whitespace-nowrap">
          <Filter className="h-3.5 w-3.5 text-cyan-400" />
          Filtro:
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
                ? 'bg-cyan-500 text-slate-950 font-bold shadow-xs'
                : 'border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 hover:border-slate-300 dark:hover:border-slate-700'
            }`}
          >
            {cat.label}
          </button>
        ))}
      </div>

      {/* Selector de Casos dentro de la categoría seleccionada */}
      <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white/70 dark:bg-slate-900/60 p-2 sm:p-2.5 backdrop-blur-sm">
        <div className="flex items-center gap-2 overflow-x-auto no-scrollbar">
          <span className="flex items-center gap-1.5 text-xs font-medium text-slate-500 dark:text-slate-400 whitespace-nowrap pl-2">
            <Stethoscope className="h-3.5 w-3.5 text-cyan-500" />
            Caso:
          </span>
          {filteredCases.map((c, idx) => (
            <button
              key={c.id}
              onClick={() => {
                setActiveCaseIndex(idx);
                setIsPathologic(false);
                setShowProximal(false);
              }}
              className={`whitespace-nowrap rounded-xl px-3.5 py-1.5 text-xs font-medium transition flex items-center gap-1.5 ${
                activeCaseIndex === idx
                  ? 'bg-slate-900 dark:bg-cyan-500 text-white dark:text-slate-950 font-bold shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
              }`}
            >
              <span>{c.title}</span>
              {c.isCustomUserCreated && (
                <span className="inline-flex items-center gap-0.5 rounded bg-purple-500/20 text-purple-300 px-1 text-[9px] font-semibold border border-purple-500/30">
                  <UserCheck className="h-2.5 w-2.5" />
                  <span>Docente</span>
                </span>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Contenedor Principal del Simulador */}
      <div className="overflow-hidden rounded-3xl border border-slate-800 bg-slate-950 text-slate-100 shadow-2xl">
        {/* Barra superior de telemetría y controles */}
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
                  Morfología Personalizada
                </span>
              )}
            </div>
            <p className="text-xs text-slate-400 mt-0.5">{currentCase.technique}</p>
          </div>

          <div className="flex items-center gap-2">
            {canProposeContent && (
              <button
                type="button"
                onClick={() => setIsSculptorOpen(true)}
                className="inline-flex items-center gap-1 rounded-xl border border-purple-500/30 bg-purple-500/10 hover:bg-purple-500/20 px-2.5 py-1 text-xs text-purple-300 transition"
                title="Editar los puntos de este caso"
              >
                <Move className="h-3 w-3" />
                <span>Editar Puntos</span>
              </button>
            )}

            {/* Conmutador Normal vs Patológico */}
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

        {/* Rejilla: Osciloscopio + Telemetría */}
        <div className="grid grid-cols-1 lg:grid-cols-12 divide-y lg:divide-y-0 lg:divide-x divide-slate-800">
          {/* Pantalla del Osciloscopio */}
          <div className="p-4 sm:p-6 lg:col-span-7 flex flex-col justify-between">
            <TraceOscilloscope
              traceParams={activeParams}
              studyType={currentCase.studyType}
              sensitivity={currentCase.sensitivity}
              sweepSpeed={currentCase.sweepSpeed}
              isPathologic={isPathologic}
              showProximal={showProximal}
              onToggleProximal={
                currentCase.studyType === 'motor' ? () => setShowProximal(!showProximal) : undefined
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

          {/* Panel de Telemetría Clínica */}
          <div className="p-4 sm:p-6 lg:col-span-5 bg-slate-900/60 flex flex-col justify-between">
            <TraceTelemetry
              traceParams={activeParams}
              studyType={currentCase.studyType}
              isPathologic={isPathologic}
              clinicalPearls={currentCase.clinicalPearls}
            />

            <div className="mt-4 pt-3 border-t border-slate-800 flex items-center justify-between text-xs">
              <span className="text-slate-400 text-[11px]">¿Deseas practicar con casos clínicos guiados?</span>
              <Link
                to="/ejercicios"
                className="inline-flex items-center gap-1 font-semibold text-cyan-400 hover:text-cyan-300 transition"
              >
                <span>Casos Clínicos</span>
                <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Galería de Imágenes Complementarias con Selector de Patrón Normal vs Patológico */}
      <TraceImagesGallery
        images={currentCase.images || []}
        canEdit={canProposeContent}
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

      {/* Modal de Escultor de Morfología */}
      {canProposeContent && (
        <WaveformSculptorModal
          isOpen={isSculptorOpen}
          onClose={() => setIsSculptorOpen(false)}
          initialCase={currentCase}
          onTraceSaved={() => {
            setTracesVersion((v) => v + 1);
          }}
        />
      )}

      {/* Modal de Estudio Docente */}
      <TeacherTraceBuilderModal
        isOpen={isTeacherStudioOpen}
        onClose={() => setIsTeacherStudioOpen(false)}
        topicTitle="Laboratorio Central"
      />
    </main>
  );
}
