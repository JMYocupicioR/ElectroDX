import { useEffect, useState } from 'react';
import { AdminLayout } from './AdminLayout';
import { getAuditLog, getProfilesByIds, getStudentActivityFeed } from '../../services/editorialService';
import type { AuditLogEntry } from '../../types/admin';
import {
  describeStudentActivity,
  studentActivityErrorText,
  studentActivityKindLabel,
  type StudentActivityFilter,
  type StudentActivityRow,
} from '../../utils/studentActivityFeed';

const ACTIVITY_PAGE = 40;

const ACTIVITY_FILTERS: { id: StudentActivityFilter; label: string }[] = [
  { id: 'all', label: 'Todo' },
  { id: 'reading', label: 'Lectura' },
  { id: 'quiz', label: 'Evaluaciones' },
  { id: 'exam', label: 'Simulacros' },
  { id: 'comment', label: 'Comentarios' },
];

function formatWhen(iso: string): string {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return iso;
  return date.toLocaleString('es-MX');
}

function DirectionLog() {
  const [entries, setEntries] = useState<AuditLogEntry[]>([]);
  const [actorNames, setActorNames] = useState<Map<string, string>>(new Map());

  useEffect(() => {
    getAuditLog(100)
      .then(async (data) => {
        setEntries(data);
        const ids = data.map((entry) => entry.actor_id).filter(Boolean) as string[];
        const profiles = await getProfilesByIds(ids);
        const names = new Map<string, string>();
        profiles.forEach((profile, id) => names.set(id, profile.display_name));
        setActorNames(names);
      })
      .catch(console.error);
  }, []);

  if (entries.length === 0) {
    return (
      <p className="text-sm text-slate-500 py-12 text-center rounded-xl border border-dashed border-slate-200 dark:border-slate-700">
        Sin registros de auditoría.
      </p>
    );
  }

  return (
    <div className="overflow-x-auto rounded-xl border border-slate-200 dark:border-slate-700">
      <table className="w-full text-sm text-left">
        <thead className="bg-slate-50 dark:bg-slate-800/80 text-xs uppercase text-slate-500">
          <tr>
            <th className="px-4 py-3">Acción</th>
            <th className="px-4 py-3">Entidad</th>
            <th className="px-4 py-3">Actor</th>
            <th className="px-4 py-3">Fecha</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
          {entries.map((entry) => (
            <tr key={entry.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30">
              <td className="px-4 py-3 font-medium">{entry.action.replace(/_/g, ' ')}</td>
              <td className="px-4 py-3 text-slate-500">
                {entry.entity_type} · {entry.entity_id.slice(0, 8)}…
              </td>
              <td className="px-4 py-3">
                {entry.actor_id ? actorNames.get(entry.actor_id) ?? entry.actor_id.slice(0, 8) : '—'}
              </td>
              <td className="px-4 py-3 text-slate-400 whitespace-nowrap">{formatWhen(entry.created_at)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function ActivityLog() {
  const [filter, setFilter] = useState<StudentActivityFilter>('all');
  const [rows, setRows] = useState<StudentActivityRow[]>([]);
  const [names, setNames] = useState<Map<string, string>>(new Map());
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hasMore, setHasMore] = useState(false);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(null);
    setRows([]);
    setHasMore(false);

    getStudentActivityFeed({
      limit: ACTIVITY_PAGE,
      kind: filter === 'all' ? null : filter,
    })
      .then(async (data) => {
        if (cancelled) return;
        setRows(data);
        setHasMore(data.length === ACTIVITY_PAGE);
        const ids = data.map((row) => row.actor_id).filter(Boolean);
        if (ids.length === 0) return;
        const profiles = await getProfilesByIds(ids);
        if (cancelled) return;
        setNames((current) => {
          const next = new Map(current);
          profiles.forEach((profile, id) => next.set(id, profile.display_name));
          return next;
        });
      })
      .catch((loadError: unknown) => {
        if (cancelled) return;
        setError(studentActivityErrorText(loadError));
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [filter]);

  const loadMore = async () => {
    const last = rows[rows.length - 1];
    if (!last || loadingMore) return;
    setLoadingMore(true);
    setError(null);
    try {
      const data = await getStudentActivityFeed({
        before: last.occurred_at,
        beforeId: last.entity_id,
        limit: ACTIVITY_PAGE,
        kind: filter === 'all' ? null : filter,
      });
      setRows((current) => {
        const seen = new Set(current.map((row) => `${row.kind}:${row.entity_id}`));
        const next = data.filter((row) => !seen.has(`${row.kind}:${row.entity_id}`));
        return [...current, ...next];
      });
      setHasMore(data.length === ACTIVITY_PAGE);
      const ids = data.map((row) => row.actor_id).filter((id) => !names.has(id));
      if (ids.length > 0) {
        const profiles = await getProfilesByIds(ids);
        setNames((current) => {
          const next = new Map(current);
          profiles.forEach((profile, id) => next.set(id, profile.display_name));
          return next;
        });
      }
    } catch (loadError: unknown) {
      setError(studentActivityErrorText(loadError));
    } finally {
      setLoadingMore(false);
    }
  };

  return (
    <div>
      <div className="flex flex-wrap gap-2 mb-4" role="group" aria-label="Filtrar actividad">
        {ACTIVITY_FILTERS.map((item) => {
          const selected = filter === item.id;
          return (
            <button
              key={item.id}
              type="button"
              aria-pressed={selected}
              onClick={() => setFilter(item.id)}
              className={`px-3 py-1.5 rounded-lg text-sm border cursor-pointer ${
                selected
                  ? 'bg-slate-900 text-white border-slate-900 dark:bg-slate-100 dark:text-slate-900 dark:border-slate-100'
                  : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50 dark:bg-slate-900 dark:text-slate-300 dark:border-slate-700 dark:hover:bg-slate-800'
              }`}
            >
              {item.label}
            </button>
          );
        })}
      </div>

      {loading ? (
        <p className="text-sm text-slate-500 py-12 text-center">Cargando actividad…</p>
      ) : error && rows.length === 0 ? (
        <p className="text-sm text-rose-600 dark:text-rose-400 py-12 text-center rounded-xl border border-dashed border-slate-200 dark:border-slate-700">
          {error}
        </p>
      ) : rows.length === 0 ? (
        <p className="text-sm text-slate-500 py-12 text-center rounded-xl border border-dashed border-slate-200 dark:border-slate-700">
          Todavía no hay actividad de alumnos en este filtro.
        </p>
      ) : (
        <div className="overflow-x-auto rounded-xl border border-slate-200 dark:border-slate-700">
          <table className="w-full text-sm text-left">
            <thead className="bg-slate-50 dark:bg-slate-800/80 text-xs uppercase text-slate-500">
              <tr>
                <th className="px-4 py-3">Acontecimiento</th>
                <th className="px-4 py-3">Fecha</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {rows.map((row) => (
                <tr key={`${row.kind}:${row.entity_id}`} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30">
                  <td className="px-4 py-3">
                    <span className="block text-[11px] uppercase tracking-wide text-slate-400 mb-0.5">
                      {studentActivityKindLabel(row.kind)}
                    </span>
                    <span className="font-medium">
                      {describeStudentActivity(row, names.get(row.actor_id))}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-slate-400 whitespace-nowrap align-top">
                    {formatWhen(row.occurred_at)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {error && rows.length > 0 && (
        <p className="mt-3 text-sm text-rose-600 dark:text-rose-400">{error}</p>
      )}

      {hasMore && !loading && (
        <div className="mt-4 flex justify-center">
          <button
            type="button"
            onClick={() => void loadMore()}
            disabled={loadingMore}
            className="px-4 py-2 rounded-lg text-sm border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 cursor-pointer disabled:opacity-60"
          >
            {loadingMore ? 'Cargando…' : 'Cargar más'}
          </button>
        </div>
      )}
    </div>
  );
}

export default function AdminAuditPage() {
  const [tab, setTab] = useState<'direccion' | 'actividad'>('direccion');

  return (
    <AdminLayout title="Registro de auditoría">
      <p className="text-sm text-slate-500 mb-4 -mt-4">
        {tab === 'direccion'
          ? 'Historial de acciones administrativas y editoriales.'
          : 'Lecturas, evaluaciones, simulacros y comentarios de los alumnos.'}
      </p>

      <div className="flex flex-wrap gap-2 mb-6" role="tablist" aria-label="Vistas de auditoría">
        <button
          type="button"
          role="tab"
          id="audit-tab-direccion"
          aria-selected={tab === 'direccion'}
          aria-controls="audit-panel-direccion"
          onClick={() => setTab('direccion')}
          className={`px-4 py-2 rounded-lg text-sm font-medium border cursor-pointer ${
            tab === 'direccion'
              ? 'bg-slate-900 text-white border-slate-900 dark:bg-slate-100 dark:text-slate-900 dark:border-slate-100'
              : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50 dark:bg-slate-900 dark:text-slate-300 dark:border-slate-700 dark:hover:bg-slate-800'
          }`}
        >
          Dirección
        </button>
        <button
          type="button"
          role="tab"
          id="audit-tab-actividad"
          aria-selected={tab === 'actividad'}
          aria-controls="audit-panel-actividad"
          onClick={() => setTab('actividad')}
          className={`px-4 py-2 rounded-lg text-sm font-medium border cursor-pointer ${
            tab === 'actividad'
              ? 'bg-slate-900 text-white border-slate-900 dark:bg-slate-100 dark:text-slate-900 dark:border-slate-100'
              : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50 dark:bg-slate-900 dark:text-slate-300 dark:border-slate-700 dark:hover:bg-slate-800'
          }`}
        >
          Actividad
        </button>
      </div>

      {tab === 'direccion' ? (
        <div role="tabpanel" id="audit-panel-direccion" aria-labelledby="audit-tab-direccion">
          <DirectionLog />
        </div>
      ) : (
        <div role="tabpanel" id="audit-panel-actividad" aria-labelledby="audit-tab-actividad">
          <ActivityLog />
        </div>
      )}
    </AdminLayout>
  );
}
