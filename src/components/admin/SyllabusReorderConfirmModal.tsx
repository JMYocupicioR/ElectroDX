import { AlertTriangle, ArrowDownUp, Calendar, EyeOff, Loader2, Unlock } from 'lucide-react';
import { AccessibleModal } from '../a11y/AccessibleModal';
import type { PendingSyllabusReorder } from '../../utils/syllabusReorder';

interface SyllabusReorderConfirmModalProps {
  pending: PendingSyllabusReorder | null;
  busy?: boolean;
  onCancel: () => void;
  onConfirm: () => void | Promise<void>;
}

const ENTITY_LABELS = {
  modulo: 'módulo',
  tema: 'tema',
  subtema: 'subtema',
} as const;

export function SyllabusReorderConfirmModal({
  pending,
  busy = false,
  onCancel,
  onConfirm,
}: SyllabusReorderConfirmModalProps) {
  if (!pending) return null;

  const entityLabel = ENTITY_LABELS[pending.entityType];
  const { impacts } = pending;
  const hasWarnings = Boolean(
    impacts.isHidden ||
      impacts.hasScheduledDate ||
      impacts.isOpenToRegistration ||
      (impacts.openTopicsInModuleCount ?? 0) > 0
  );

  return (
    <AccessibleModal
      open={Boolean(pending)}
      title="Confirmar cambio de orden"
      labelledBy="syllabus-reorder-confirm-title"
      onClose={() => {
        if (!busy) onCancel();
      }}
      panelClassName="sm:max-w-lg"
      headerSlot={
        <div className="flex items-center gap-2 text-[11px] font-black uppercase tracking-wider text-blue-600 dark:text-cyan-400 mb-1">
          <ArrowDownUp className="w-3.5 h-3.5" />
          <span>Cambio en el temario en vivo</span>
        </div>
      }
    >
      <div className="space-y-4">
        <p className="text-sm text-slate-700 dark:text-slate-200 leading-relaxed">
          ¿Deseas mover el {entityLabel}{' '}
          <strong className="text-slate-900 dark:text-white">«{pending.itemTitle}»</strong> de la
          posición{' '}
          <span className="inline-flex items-center px-1.5 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 font-mono text-xs font-bold">
            #{pending.oldPosition}
          </span>{' '}
          a la{' '}
          <span className="inline-flex items-center px-1.5 py-0.5 rounded-md bg-blue-100 dark:bg-blue-950/70 text-blue-800 dark:text-cyan-300 font-mono text-xs font-bold">
            #{pending.newPosition}
          </span>
          {pending.placementDescription ? ` (${pending.placementDescription})` : ''} dentro de{' '}
          <strong className="text-slate-900 dark:text-white">«{pending.containerTitle}»</strong>?
        </p>

        <div className="p-3 rounded-xl bg-blue-50/80 dark:bg-blue-950/30 border border-blue-200/80 dark:border-blue-800/60 text-xs text-blue-900 dark:text-blue-200 leading-relaxed">
          Al confirmar, el cambio se guardará y{' '}
          <strong>el alumno verá el nuevo orden inmediatamente</strong> en el índice del curso,
          la barra lateral, su ruta de estudio y todos los selectores del panel.
        </div>

        {hasWarnings && (
          <div className="p-3 rounded-xl bg-amber-50/80 dark:bg-amber-950/30 border border-amber-200/80 dark:border-amber-800/60 space-y-2 text-xs text-amber-900 dark:text-amber-200">
            <p className="font-bold flex items-center gap-1.5 text-amber-800 dark:text-amber-300">
              <AlertTriangle className="w-3.5 h-3.5 shrink-0" />
              <span>Avisos de impacto en reglas del curso</span>
            </p>
            <ul className="space-y-1.5 text-[11px] leading-snug">
              {impacts.isHidden && (
                <li className="flex items-start gap-1.5">
                  <EyeOff className="w-3.5 h-3.5 shrink-0 mt-0.5 text-amber-600 dark:text-amber-400" />
                  <span>
                    Este {entityLabel} está marcado como <strong>Oculto</strong>; seguirá oculto
                    para los alumnos en su nueva posición.
                  </span>
                </li>
              )}
              {impacts.hasScheduledDate && (
                <li className="flex items-start gap-1.5">
                  <Calendar className="w-3.5 h-3.5 shrink-0 mt-0.5 text-amber-600 dark:text-amber-400" />
                  <span>
                    Tiene clase en vivo programada
                    {impacts.scheduledDateLabel ? ` (${impacts.scheduledDateLabel})` : ''}. Mover su
                    orden en el temario no modifica la fecha en el calendario.
                  </span>
                </li>
              )}
              {impacts.isOpenToRegistration && (
                <li className="flex items-start gap-1.5">
                  <Unlock className="w-3.5 h-3.5 shrink-0 mt-0.5 text-emerald-600 dark:text-emerald-400" />
                  <span>
                    Tiene acceso abierto al <strong>Registro gratuito</strong>; cambiar su
                    posición altera qué contenido ven primero los usuarios sin inscripción al nivel.
                  </span>
                </li>
              )}
              {(impacts.openTopicsInModuleCount ?? 0) > 0 && !impacts.isOpenToRegistration && (
                <li className="flex items-start gap-1.5">
                  <Unlock className="w-3.5 h-3.5 shrink-0 mt-0.5 text-emerald-600 dark:text-emerald-400" />
                  <span>
                    Este módulo contiene {impacts.openTopicsInModuleCount}{' '}
                    {impacts.openTopicsInModuleCount === 1
                      ? 'tema abierto al registro gratuito'
                      : 'temas abiertos al registro gratuito'}
                    .
                  </span>
                </li>
              )}
            </ul>
          </div>
        )}

        <div className="flex items-center justify-end gap-2.5 pt-2">
          <button
            type="button"
            disabled={busy}
            onClick={onCancel}
            className="px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs font-semibold text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700 transition cursor-pointer disabled:opacity-50"
          >
            Cancelar
          </button>
          <button
            type="button"
            disabled={busy}
            onClick={() => void onConfirm()}
            className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold shadow-xs transition inline-flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
          >
            {busy ? (
              <>
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                <span>Guardando orden…</span>
              </>
            ) : (
              <span>Confirmar cambio</span>
            )}
          </button>
        </div>
      </div>
    </AccessibleModal>
  );
}
