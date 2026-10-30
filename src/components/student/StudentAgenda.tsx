import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { CalendarBoard } from '../admin/calendar/CalendarBoard';
import { getClinicalCaseExerciseLocation } from '../../services/emgExerciseService';
import { loadStudentAgenda } from '../../services/studentAgendaService';
import type { CalendarBoardView, CalendarItem, CalendarItemType } from '../../types/academicCalendar';
import {
  CALENDAR_BOARD_VIEW_STORAGE_KEY,
  CALENDAR_TYPE_LABELS,
  calendarTypesForFilter,
  filterItemsByTypes,
  itemsForDay,
  readCalendarBoardView,
} from '../../utils/academicCalendar';

export function StudentAgenda({
  studentId,
  showPrivateNote = false,
}: {
  studentId: string | null;
  showPrivateNote?: boolean;
}) {
  const navigate = useNavigate();
  const [items, setItems] = useState<CalendarItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [view, setView] = useState<CalendarBoardView>(() => {
    if (typeof window === 'undefined') return 'agenda';
    return readCalendarBoardView(window.localStorage) ?? 'agenda';
  });
  const [anchor, setAnchor] = useState(() => new Date());
  const [typeFilter, setTypeFilter] = useState<CalendarItemType | 'all'>('all');
  const [selectedDay, setSelectedDay] = useState<Date | null>(null);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    loadStudentAgenda(studentId)
      .then((next) => {
        if (!cancelled) setItems(next);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [studentId]);

  const visibleItems = useMemo(
    () => filterItemsByTypes(items, calendarTypesForFilter(typeFilter)),
    [items, typeFilter],
  );
  const dayItems = useMemo(
    () => (selectedDay ? itemsForDay(visibleItems, selectedDay) : []),
    [visibleItems, selectedDay],
  );

  const openItem = (item: CalendarItem) => {
    if (item.type === 'session' && item.workshopId) {
      navigate(`/taller/${item.workshopId}`);
      return;
    }
    const assignmentId = item.assignmentIds[0];
    if (item.type === 'clinical_case' && assignmentId) {
      navigate(getClinicalCaseExerciseLocation(assignmentId));
      return;
    }
    if (assignmentId) {
      navigate('/portal?tab=assignments');
    }
  };

  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-lg font-black text-slate-900 dark:text-white">Agenda del diplomado</h2>
        <p className="text-sm text-slate-500 mt-1">
          Clases en vivo, exámenes, tareas, casos y cortes. Un examen se muestra con su fecha límite; la plataforma no distingue todavía si es en línea o presencial.
        </p>
        {showPrivateNote && !studentId ? (
          <p className="text-sm text-amber-700 dark:text-amber-300 mt-2">
            Inicia sesión para ver también tus exámenes y tareas. Aquí solo aparecen las clases publicadas.
          </p>
        ) : null}
      </div>

      <CalendarBoard
        view={view}
        onViewChange={(next) => {
          setView(next);
          try {
            window.localStorage.setItem(CALENDAR_BOARD_VIEW_STORAGE_KEY, next);
          } catch {
            // El calendario sigue usable si el navegador bloquea el almacenamiento.
          }
        }}
        anchor={anchor}
        onAnchorChange={setAnchor}
        items={visibleItems}
        typeFilter={typeFilter}
        onTypeFilterChange={setTypeFilter}
        onSelectItem={openItem}
        onSelectDay={setSelectedDay}
        itemCount={visibleItems.length}
        loading={loading}
        onRefresh={() => {
          setLoading(true);
          void loadStudentAgenda(studentId).then((next) => {
            setItems(next);
            setLoading(false);
          });
        }}
        dayIntent="view"
        showColorEditor={false}
      />

      {selectedDay ? (
        <section className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-4">
          <h3 className="text-sm font-black text-slate-900 dark:text-white">
            {selectedDay.toLocaleDateString('es-MX', { weekday: 'long', day: 'numeric', month: 'long' })}
          </h3>
          {dayItems.length === 0 ? (
            <p className="text-sm text-slate-500 mt-2">No hay actividades este día.</p>
          ) : (
            <ul className="mt-3 space-y-2">
              {dayItems.map((item) => (
                <li key={item.id}>
                  <button
                    type="button"
                    onClick={() => openItem(item)}
                    className="w-full text-left px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 hover:border-indigo-300 dark:hover:border-indigo-700 cursor-pointer"
                  >
                    <span className="block text-[10px] font-black uppercase tracking-wider text-slate-400">
                      {CALENDAR_TYPE_LABELS[item.type]}
                      {item.modality === 'in_person' ? ' · Presencial' : item.modality === 'online' ? ' · En línea' : ''}
                    </span>
                    <span className="block text-sm font-bold text-slate-900 dark:text-white">{item.title}</span>
                  </button>
                </li>
              ))}
            </ul>
          )}
        </section>
      ) : null}
    </div>
  );
}
