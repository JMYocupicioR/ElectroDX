import { Palette, RotateCcw, X } from 'lucide-react';
import type { CalendarItemType } from '../../../types/academicCalendar';
import {
  CALENDAR_COLOR_PALETTE,
  CALENDAR_LEGEND_TYPES,
  useCalendarColorLabels,
} from '../../../utils/calendarColorLabels';

export function CalendarColorLabelsEditor({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) {
  const { labels, setTypeLabel, reset } = useCalendarColorLabels();

  if (!open) return null;

  return (
    <div
      className="absolute z-30 right-0 top-full mt-2 w-[min(100vw-2rem,22rem)] p-3.5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 shadow-xl"
      role="dialog"
      aria-label="Editar etiquetas de color"
    >
      <div className="flex items-start justify-between gap-2 mb-3">
        <div>
          <p className="text-xs font-black text-slate-900 dark:text-white inline-flex items-center gap-1.5">
            <Palette className="w-3.5 h-3.5 text-indigo-500" />
            Etiquetas de color
          </p>
          <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
            Cambia el nombre y el color de cada tipo de evento.
          </p>
        </div>
        <button
          type="button"
          onClick={onClose}
          className="p-1 rounded-lg text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
          aria-label="Cerrar etiquetas de color"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      <ul className="space-y-3">
        {CALENDAR_LEGEND_TYPES.map((type: CalendarItemType) => (
          <li key={type} className="space-y-1.5">
            <input
              type="text"
              maxLength={24}
              value={labels[type].label}
              onChange={(event) => setTypeLabel(type, { label: event.target.value })}
              className="w-full px-2.5 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs font-bold text-slate-800 dark:text-slate-100"
              aria-label={`Nombre para ${labels[type].label}`}
            />
            <div className="flex flex-wrap gap-1">
              {CALENDAR_COLOR_PALETTE.map((swatch) => {
                const selected = labels[type].color === swatch.hex;
                return (
                  <button
                    key={swatch.id}
                    type="button"
                    title={swatch.name}
                    aria-label={`${swatch.name} para ${labels[type].label}`}
                    aria-pressed={selected}
                    onClick={() => setTypeLabel(type, { color: swatch.hex })}
                    className={`w-6 h-6 rounded-full border-2 transition ${
                      selected ? 'border-slate-900 dark:border-white scale-110' : 'border-transparent hover:scale-105'
                    }`}
                    style={{ backgroundColor: swatch.hex }}
                  />
                );
              })}
            </div>
          </li>
        ))}
      </ul>

      <button
        type="button"
        onClick={reset}
        className="mt-3 inline-flex items-center gap-1.5 text-[11px] font-bold text-slate-500 hover:text-indigo-600 dark:hover:text-indigo-300"
      >
        <RotateCcw className="w-3 h-3" />
        Restablecer colores
      </button>
    </div>
  );
}
