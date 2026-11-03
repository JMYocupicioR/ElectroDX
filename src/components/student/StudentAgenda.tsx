import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { CalendarBoard } from '../admin/calendar/CalendarBoard';
import { getClinicalCaseExerciseLocation } from '../../services/emgExerciseService';
import { loadStudentAgenda } from '../../services/studentAgendaService';
import type { CalendarBoardView, CalendarItem, CalendarItemType } from '../../types/academicCalendar';
import {
  CALENDAR_BOARD_VIEW_STORAGE_KEY,
  calendarTypesForFilter,
  filterItemsByTypes,
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
        onSelectDay={() => {
          /* Solo consulta: el clic en un día abre la vista Día del tablero. */
        }}
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
    </div>
  );
}
