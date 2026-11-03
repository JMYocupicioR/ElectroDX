import { useCallback, useEffect, useMemo, useState } from 'react';
import { AlertTriangle, RefreshCw } from 'lucide-react';
import { AdminLayout } from './AdminLayout';
import { CalendarBoard } from './calendar/CalendarBoard';
import { CalendarCreateMenu, type CalendarCreateAction } from './calendar/CalendarCreateMenu';
import { CalendarEventInspector } from './calendar/CalendarEventInspector';
import { CalendarRemindersPanel } from './calendar/CalendarRemindersPanel';
import { CalendarRubricRail } from './calendar/CalendarRubricRail';
import AssignExamModal from './AssignExamModal';
import AssignHomeworkModal from './AssignHomeworkModal';
import { AssignClinicalCaseModal } from './AssignClinicalCaseModal';
import { CreateLiveClassModal } from './CreateLiveClassModal';
import AcademicScheduleManagerModal from './AcademicScheduleManagerModal';
import GradebookConfigModal from './GradebookConfigModal';
import AttendanceTrackerModal from './AttendanceTrackerModal';
import TeacherQuickGradeModal from './TeacherQuickGradeModal';
import { loadAcademicCalendarFeed } from '../../services/academicCalendarService';
import { getAdminProfiles } from '../../services/editorialService';
import { deleteWorkshop } from '../../services/courseService';
import { deleteMilestone } from '../../services/academicScheduleService';
import { deleteAssignmentsByIds, getTeacherPendingReviewItems } from '../../services/studentPlanService';
import { computeWorkshopAttendanceSummary, getCohortAttendance } from '../../services/attendanceService';
import { filterGradeableStudents } from '../../utils/adminUtils';
import {
  calendarItemStartDate,
  calendarTypesForFilter,
  defaultCalendarBoardView,
  filterItemsByTypes,
  localDateTimeInputValue,
  writeCalendarBoardView,
} from '../../utils/academicCalendar';
import { buildTeacherCalendarReminders, type TeacherReminderRow } from '../../utils/teacherCalendarReminders';
import { useAuth } from '../../contexts/AuthProvider';
import type { CalendarBoardView, CalendarItem, CalendarItemType, CalendarRubricSnapshot } from '../../types/academicCalendar';
import type { AcademicMilestone } from '../../types/academicGradebook';
import type { WorkshopAttendanceSummary } from '../../types/academicAnalytics';
import type { AdminProfileRow } from '../../types/admin';
import type { LiveWorkshop } from '../../types/database';
import type { TeacherPendingReviewItem } from '../../types/studentPlan';

export default function AdminAcademicCalendarPage() {
  const { user } = useAuth();
  const [profiles, setProfiles] = useState<AdminProfileRow[]>([]);
  const [items, setItems] = useState<CalendarItem[]>([]);
  const [rubric, setRubric] = useState<CalendarRubricSnapshot | null>(null);
  const [workshops, setWorkshops] = useState<LiveWorkshop[]>([]);
  const [milestones, setMilestones] = useState<AcademicMilestone[]>([]);
  const [pendingSubmissions, setPendingSubmissions] = useState<TeacherPendingReviewItem[]>([]);
  const [pendingRetakes, setPendingRetakes] = useState<TeacherPendingReviewItem[]>([]);
  const [attendanceSummaries, setAttendanceSummaries] = useState<WorkshopAttendanceSummary[]>([]);
  const [gradingItem, setGradingItem] = useState<TeacherPendingReviewItem | null>(null);
  const [attendanceWorkshopId, setAttendanceWorkshopId] = useState<string | undefined>();
  const [loading, setLoading] = useState(true);
  const [view, setView] = useState<CalendarBoardView>(() =>
    defaultCalendarBoardView({
      storage: typeof localStorage === 'undefined' ? null : localStorage,
      narrowViewport: typeof window !== 'undefined' && window.matchMedia('(max-width: 767px)').matches,
    })
  );
  const [anchor, setAnchor] = useState(() => new Date());
  const [typeFilter, setTypeFilter] = useState<CalendarItemType | 'all'>('all');
  const [selected, setSelected] = useState<CalendarItem | null>(null);
  const [createDay, setCreateDay] = useState<Date | null>(null);

  const [showExam, setShowExam] = useState(false);
  const [showHomework, setShowHomework] = useState(false);
  const [showCase, setShowCase] = useState(false);
  const [showClass, setShowClass] = useState(false);
  const [showMilestone, setShowMilestone] = useState(false);
  const [showRubrics, setShowRubrics] = useState(false);
  const [showAttendance, setShowAttendance] = useState(false);
  const [editingWorkshop, setEditingWorkshop] = useState<LiveWorkshop | null>(null);
  const [prefillDate, setPrefillDate] = useState<string | undefined>();
  const [feedWarnings, setFeedWarnings] = useState<string[]>([]);
  const [reloadError, setReloadError] = useState<string | null>(null);

  const loadFeed = async (): Promise<{ ok: boolean; warnings: string[] }> => {
    setLoading(true);
    setReloadError(null);
    try {
      const people = filterGradeableStudents(await getAdminProfiles(false, 'all').catch(() => []), user?.id);
      setProfiles(people);
      const studentIds = people.map((profile) => profile.id);
      const [feed, reviews, attendance] = await Promise.all([
        loadAcademicCalendarFeed(people),
        getTeacherPendingReviewItems(people).catch(() => ({ pendingSubmissions: [], pendingRetakes: [] })),
        getCohortAttendance(studentIds).catch(() => []),
      ]);
      setItems(feed.items);
      setRubric(feed.rubric);
      setWorkshops(feed.workshops);
      setMilestones(feed.milestones);
      setPendingSubmissions(reviews.pendingSubmissions);
      setPendingRetakes(reviews.pendingRetakes);
      setAttendanceSummaries(
        feed.workshops.map((workshop) => computeWorkshopAttendanceSummary(workshop, studentIds, attendance))
      );
      setFeedWarnings(feed.warnings);
      setSelected((current) => (current ? feed.items.find((item) => item.id === current.id) ?? null : null));
      return { ok: feed.warnings.length === 0, warnings: feed.warnings };
    } catch (error) {
      const message = error instanceof Error ? error.message : 'No se pudo actualizar el calendario.';
      setReloadError(message);
      return { ok: false, warnings: [message] };
    } finally {
      setLoading(false);
    }
  };

  const refreshAfterWrite = async (kind: 'talleres' | 'tareas' | 'cortes'): Promise<boolean> => {
    const result = await loadFeed();
    const kindFailed = result.warnings.some((warning) => warning.toLowerCase().includes(kind));
    if (!result.ok || kindFailed) {
      setReloadError((current) => current ?? 'El cambio se guardó, pero el tablero no se pudo recargar por completo.');
      return false;
    }
    return true;
  };

  useEffect(() => {
    void loadFeed();
  }, []);

  const handleViewChange = useCallback((next: CalendarBoardView) => {
    setView(next);
    writeCalendarBoardView(next, typeof localStorage === 'undefined' ? null : localStorage);
  }, []);

  const closeInspector = useCallback(() => setSelected(null), []);
  const closeCreate = useCallback(() => setCreateDay(null), []);

  const visibleItems = useMemo(
    () => filterItemsByTypes(items, calendarTypesForFilter(typeFilter)),
    [items, typeFilter]
  );

  const reminders = useMemo(
    () =>
      buildTeacherCalendarReminders({
        items,
        milestones,
        workshops,
        pendingSubmissions,
        pendingRetakes,
        attendanceSummaries,
      }),
    [items, milestones, workshops, pendingSubmissions, pendingRetakes, attendanceSummaries]
  );

  const openReminder = (row: TeacherReminderRow) => {
    if (row.action === 'grade' && row.review) {
      setGradingItem(row.review);
      return;
    }
    if (row.action === 'attendance' && row.workshopId) {
      setAttendanceWorkshopId(row.workshopId);
      setShowAttendance(true);
      return;
    }
    if (row.calendarItemId) {
      const item = items.find((entry) => entry.id === row.calendarItemId);
      if (item) {
        setSelected(item);
        setAnchor(calendarItemStartDate(item.startsAt, item.allDay));
      }
    }
  };

  const openCreate = (action: CalendarCreateAction) => {
    if (!createDay) return;
    const dateValue =
      action === 'session' ? localDateTimeInputValue(createDay, 19, 0) : localDateTimeInputValue(createDay, 23, 59);
    setPrefillDate(dateValue);
    setCreateDay(null);
    if (action === 'session') {
      setEditingWorkshop(null);
      setShowClass(true);
    }
    if (action === 'exam') setShowExam(true);
    if (action === 'practical_task') setShowHomework(true);
    if (action === 'clinical_case') setShowCase(true);
    if (action === 'milestone') setShowMilestone(true);
  };

  const selectedWorkshop = selected?.workshopId
    ? workshops.find((workshop) => workshop.id === selected.workshopId) ?? null
    : null;

  const handleDeleteSession = async (workshopId: string) => {
    try {
      await deleteWorkshop(workshopId);
      setSelected(null);
      await refreshAfterWrite('talleres');
    } catch (error) {
      console.error('[handleDeleteSession] error:', error);
      alert(error instanceof Error ? error.message : 'Error al eliminar la clase');
      throw error;
    }
  };

  const handleDeleteAssignment = async (item: CalendarItem) => {
    try {
      const dueDay = item.startsAt?.slice(0, 10);
      const removed = await deleteAssignmentsByIds(item.assignmentIds, {
        studentIds: item.studentIds,
        batchId: item.batchId,
        title: item.title,
        type: item.assignmentType,
        dueDay,
      });
      if (removed === 0) {
        throw new Error('No se encontraron asignaciones para eliminar.');
      }
      setSelected(null);
      await refreshAfterWrite('tareas');
    } catch (error) {
      console.error('[handleDeleteAssignment] error:', error);
      alert(error instanceof Error ? error.message : 'Error al eliminar la tarea');
      throw error;
    }
  };

  const handleDeleteMilestone = async (milestoneId: string) => {
    try {
      await deleteMilestone(milestoneId);
      setSelected(null);
      await refreshAfterWrite('cortes');
    } catch (error) {
      console.error('[handleDeleteMilestone] error:', error);
      alert(error instanceof Error ? error.message : 'Error al eliminar el corte');
      throw error;
    }
  };

  return (
    <AdminLayout fullBleed title="Calendario académico">
      {(reloadError || feedWarnings.length > 0) && (
        <div
          role="alert"
          className="mb-4 p-3.5 rounded-2xl border border-amber-300 dark:border-amber-800 bg-amber-50 dark:bg-amber-950/40 text-amber-900 dark:text-amber-100 text-xs flex flex-wrap items-start justify-between gap-3"
        >
          <div className="space-y-1.5 min-w-0">
            <p className="font-bold inline-flex items-center gap-1.5">
              <AlertTriangle className="w-4 h-4" />
              El calendario no pudo cargar todos los eventos
            </p>
            {reloadError ? <p>{reloadError}</p> : null}
            {feedWarnings.map((warning) => (
              <p key={warning}>{warning}</p>
            ))}
          </div>
          <button
            type="button"
            onClick={() => void loadFeed()}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-amber-400 dark:border-amber-700 bg-white/70 dark:bg-amber-950/50 text-xs font-bold hover:bg-white dark:hover:bg-amber-900/40"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
            Reintentar
          </button>
        </div>
      )}

      <div className="space-y-4">
        <CalendarRubricRail rubric={rubric} onEdit={() => setShowRubrics(true)} />
        <CalendarBoard
          view={view}
          onViewChange={handleViewChange}
          anchor={anchor}
          onAnchorChange={setAnchor}
          items={visibleItems}
          typeFilter={typeFilter}
          onTypeFilterChange={setTypeFilter}
          selectedId={selected?.id}
          onSelectItem={setSelected}
          onSelectDay={(day) => {
            setSelected(null);
            setCreateDay(day);
          }}
          itemCount={items.length}
          loading={loading}
          onRefresh={() => void loadFeed()}
        />
        <CalendarRemindersPanel reminders={reminders} loading={loading && items.length === 0} onOpen={openReminder} />
      </div>

      <CalendarEventInspector
        item={selected}
        onClose={closeInspector}
        onEditSession={() => {
          setEditingWorkshop(selectedWorkshop);
          setPrefillDate(undefined);
          setShowClass(true);
        }}
        onTakeAttendance={() => setShowAttendance(true)}
        onAssignAnother={() => {
          if (!selected) return;
          setPrefillDate(localDateTimeInputValue(new Date(selected.startsAt), 23, 59));
          if (selected.type === 'exam') setShowExam(true);
          else if (selected.type === 'practical_task' || selected.type === 'reading' || selected.type === 'emg_report') {
            setShowHomework(true);
          } else setShowCase(true);
        }}
        onEditMilestone={() => setShowMilestone(true)}
        onDeleteSession={handleDeleteSession}
        onDeleteAssignment={handleDeleteAssignment}
        onDeleteMilestone={handleDeleteMilestone}
      />

      {createDay ? (
        <CalendarCreateMenu
          dateLabel={createDay.toLocaleDateString('es-MX', { weekday: 'long', day: 'numeric', month: 'long' })}
          onSelect={openCreate}
          onClose={closeCreate}
        />
      ) : null}

      <CreateLiveClassModal
        isOpen={showClass}
        onClose={() => {
          setShowClass(false);
          setEditingWorkshop(null);
        }}
        initialWorkshop={editingWorkshop}
        initialScheduledAt={editingWorkshop ? undefined : prefillDate}
        onSuccess={async () => {
          const ok = await refreshAfterWrite('talleres');
          if (ok) {
            setShowClass(false);
            setEditingWorkshop(null);
          }
          return ok;
        }}
      />
      <AssignExamModal
        isOpen={showExam}
        onClose={() => setShowExam(false)}
        profiles={profiles}
        initialDueDate={prefillDate}
        onAssigned={() => refreshAfterWrite('tareas')}
      />
      <AssignHomeworkModal
        isOpen={showHomework}
        onClose={() => setShowHomework(false)}
        profiles={profiles}
        initialDueDate={prefillDate}
        onAssigned={() => refreshAfterWrite('tareas')}
      />
      <AssignClinicalCaseModal
        isOpen={showCase}
        onClose={() => setShowCase(false)}
        profiles={profiles}
        initialDueDate={prefillDate}
        onAssigned={() => refreshAfterWrite('tareas')}
      />
      <AcademicScheduleManagerModal
        isOpen={showMilestone}
        onClose={() => setShowMilestone(false)}
        profiles={profiles}
        onUpdated={() => {
          void refreshAfterWrite('cortes');
        }}
      />
      <GradebookConfigModal
        isOpen={showRubrics}
        onClose={() => setShowRubrics(false)}
        onSaved={() => {
          void loadFeed();
        }}
      />
      <AttendanceTrackerModal
        isOpen={showAttendance}
        onClose={() => {
          setShowAttendance(false);
          setAttendanceWorkshopId(undefined);
        }}
        profiles={profiles}
        initialWorkshopId={attendanceWorkshopId ?? selected?.workshopId ?? undefined}
        onSaved={() => {
          setShowAttendance(false);
          setAttendanceWorkshopId(undefined);
          void loadFeed();
        }}
      />
      <TeacherQuickGradeModal
        isOpen={Boolean(gradingItem)}
        onClose={() => setGradingItem(null)}
        item={gradingItem}
        onGraded={() => {
          setGradingItem(null);
          void loadFeed();
        }}
      />
    </AdminLayout>
  );
}
