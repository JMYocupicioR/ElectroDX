import { useEffect, useState } from 'react';
import { AccessibleModal } from '../a11y/AccessibleModal';
import { getPortalGuideSteps, type PortalGuideCourseState } from './portalGuideSteps';

export type { PortalGuideCourseState };

export interface StudentPortalGuideProps {
  open: boolean;
  courseState: PortalGuideCourseState;
  finalActionLabel: string;
  onBack: () => void;
  onNext: () => void;
  onSkip: () => void;
  onFinish: () => void;
  stepIndex: number;
  saving: boolean;
  saveError: string | null;
}

export function StudentPortalGuide({
  open,
  courseState,
  finalActionLabel,
  onBack,
  onNext,
  onSkip,
  onFinish,
  stepIndex,
  saving,
  saveError,
}: StudentPortalGuideProps) {
  const steps = getPortalGuideSteps(courseState);
  const currentStep = steps[stepIndex] ?? steps[0];
  const [clickedAction, setClickedAction] = useState<'skip' | 'finish' | null>(null);

  // Mover foco al título (h2) del diálogo al cambiar de paso
  useEffect(() => {
    if (open) {
      const titleEl = document.getElementById('portal-guide-title');
      titleEl?.focus();
    }
  }, [stepIndex, open]);

  // Manejo de flechas del teclado cuando el foco no está en controles interactivos
  useEffect(() => {
    if (!open || saving) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      const active = document.activeElement as HTMLElement | null;
      const tag = active?.tagName?.toLowerCase();
      const isControl =
        tag === 'button' ||
        tag === 'input' ||
        tag === 'textarea' ||
        tag === 'select' ||
        tag === 'a' ||
        Boolean(active?.isContentEditable);

      if (isControl) return;

      if (e.key === 'ArrowRight') {
        e.preventDefault();
        if (stepIndex < steps.length - 1) {
          onNext();
        } else {
          setClickedAction('finish');
          onFinish();
        }
      } else if (e.key === 'ArrowLeft') {
        if (stepIndex > 0) {
          e.preventDefault();
          onBack();
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [open, saving, stepIndex, steps.length, onNext, onBack, onFinish]);

  if (!open) return null;

  const StepIcon = currentStep.icon;
  const isFirstStep = stepIndex === 0;
  const isLastStep = stepIndex === steps.length - 1;

  const handleSkipClick = () => {
    if (saving) return;
    setClickedAction('skip');
    onSkip();
  };

  const handleFinishClick = () => {
    if (saving) return;
    setClickedAction('finish');
    onFinish();
  };

  const headerSlot = (
    <div className="mb-2">
      {/* Barra superior: Paso n de 5, indicadores de punto y botón Saltar */}
      <div className="flex items-center justify-between gap-3 pb-2">
        <div className="flex items-center gap-2.5">
          <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">
            Paso {stepIndex + 1} de {steps.length}
          </span>
          <div className="flex items-center gap-1.5" role="group" aria-label="Progreso de la inducción">
            {steps.map((step, idx) => {
              const isCurrent = idx === stepIndex;
              return (
                <span
                  key={step.id}
                  aria-current={isCurrent ? 'step' : undefined}
                  aria-label={`Paso ${idx + 1}: ${step.title}`}
                  className={`h-2 rounded-full transition-all duration-200 motion-reduce:transition-none ${
                    isCurrent
                      ? 'w-6 bg-blue-600 dark:bg-blue-500'
                      : 'w-2 bg-slate-200 dark:bg-slate-700'
                  }`}
                />
              );
            })}
          </div>
        </div>

        <button
          type="button"
          onClick={handleSkipClick}
          disabled={saving}
          className="text-xs font-medium text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200 px-2 py-1 rounded transition disabled:opacity-50 cursor-pointer"
        >
          {saving && clickedAction === 'skip' ? 'Guardando…' : 'Saltar'}
        </button>
      </div>

      {/* Kicker con ícono del paso */}
      <div className="flex items-center gap-1.5 pt-1">
        <StepIcon className="w-4 h-4 text-blue-600 dark:text-blue-400 shrink-0" aria-hidden="true" />
        <span className="text-xs font-bold uppercase tracking-wider text-blue-600 dark:text-blue-400">
          {currentStep.kicker}
        </span>
      </div>
    </div>
  );

  return (
    <AccessibleModal
      open={open}
      title={currentStep.title}
      onClose={handleSkipClick}
      labelledBy="portal-guide-title"
      headerSlot={headerSlot}
    >
      <div className="transition-opacity duration-200 motion-reduce:transition-none">
        {/* Alerta si hubo error al guardar en Supabase */}
        {saveError && (
          <div
            role="alert"
            className="mb-4 p-3 rounded-xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 text-amber-900 dark:text-amber-200 text-xs sm:text-sm"
          >
            <p className="font-semibold">No se pudo guardar. La guía volverá a aparecer la próxima vez.</p>
            {saveError.trim() && (
              <p className="text-[11px] text-amber-700 dark:text-amber-300 mt-1 font-mono break-all">
                {saveError}
              </p>
            )}
          </div>
        )}

        {/* Cuerpo del paso */}
        <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed mb-4">
          {currentStep.body}
        </p>

        {/* Detalle complementario (si aplica) */}
        {currentStep.detail && currentStep.detail.length > 0 && (
          <ul className="mb-6 space-y-2 text-xs sm:text-sm text-slate-700 dark:text-slate-300 bg-slate-50 dark:bg-slate-800/60 rounded-xl p-3.5 border border-slate-200/80 dark:border-slate-800">
            {currentStep.detail.map((item, idx) => (
              <li key={idx} className="flex items-start gap-2">
                <span
                  className="w-1.5 h-1.5 rounded-full bg-blue-600 dark:bg-blue-400 mt-1.5 shrink-0"
                  aria-hidden="true"
                />
                <span>{item}</span>
              </li>
            ))}
          </ul>
        )}

        {/* Controles de navegación */}
        <div className="flex items-center justify-between gap-3 pt-3 border-t border-slate-100 dark:border-slate-800">
          <button
            type="button"
            onClick={onBack}
            disabled={isFirstStep || saving}
            aria-disabled={isFirstStep || saving}
            className="min-h-[44px] px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 font-semibold text-sm hover:bg-slate-100 dark:hover:bg-slate-800 transition disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
          >
            Atrás
          </button>

          {isLastStep ? (
            <button
              type="button"
              onClick={handleFinishClick}
              disabled={saving}
              className="min-h-[44px] px-5 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold text-sm shadow-xs transition disabled:opacity-50 cursor-pointer"
            >
              {saving && clickedAction === 'finish' ? 'Guardando…' : finalActionLabel}
            </button>
          ) : (
            <button
              type="button"
              onClick={onNext}
              disabled={saving}
              className="min-h-[44px] px-5 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold text-sm shadow-xs transition disabled:opacity-50 cursor-pointer"
            >
              Siguiente
            </button>
          )}
        </div>
      </div>
    </AccessibleModal>
  );
}
