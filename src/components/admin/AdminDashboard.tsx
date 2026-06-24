import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Users, FileCheck, BookOpen, CheckCircle, AlertCircle } from 'lucide-react';
import { AdminLayout } from './AdminLayout';
import { getAdminStats, getAuditLog, getProfilesByIds } from '../../services/editorialService';
import type { AdminStats, AuditLogEntry } from '../../types/admin';

export default function AdminDashboard() {
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [audit, setAudit] = useState<AuditLogEntry[]>([]);
  const [actorNames, setActorNames] = useState<Map<string, string>>(new Map());

  useEffect(() => {
    getAdminStats().then(setStats).catch(console.error);
    getAuditLog(8)
      .then(async (entries) => {
        setAudit(entries);
        const ids = entries.map((e) => e.actor_id).filter(Boolean) as string[];
        const profiles = await getProfilesByIds(ids);
        const names = new Map<string, string>();
        profiles.forEach((p, id) => names.set(id, p.display_name));
        setActorNames(names);
      })
      .catch(console.error);
  }, []);

  return (
    <AdminLayout title="Panel de administración">
      <p className="text-sm text-slate-500 mb-6 -mt-4">
        Moderación editorial y verificación de colaboradores.
      </p>

      {stats && (stats.pending_revisions > 0 || (stats.pending_enrollments ?? 0) > 0) && (
        <div className="mb-6 flex items-start gap-3 p-4 rounded-xl bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800">
          <AlertCircle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
          <p className="text-sm text-amber-800 dark:text-amber-200">
            {(stats.pending_enrollments ?? 0) > 0 && (
              <>
                <strong>{stats.pending_enrollments}</strong> inscripción(es) médica(s) pendiente(s).
                {(stats.pending_revisions > 0) && ' '}
              </>
            )}
            {stats.pending_revisions > 0 && (
              <>
                <strong>{stats.pending_revisions}</strong> propuesta(s) esperando revisión.
              </>
            )}
          </p>
        </div>
      )}

      <div className="mb-8 flex flex-wrap gap-2">
        <Link to="/colaborador/nueva-revision" className="px-4 py-2 rounded-xl bg-blue-600 text-white text-sm font-medium">
          Proponer tema / subtema
        </Link>
        <Link to="/colaborador/nuevo-modulo" className="px-4 py-2 rounded-xl border border-violet-300 text-violet-700 text-sm font-medium">
          Proponer módulo
        </Link>
      </div>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 mb-8">
        <Link
          to="/admin/usuarios"
          className="p-5 rounded-2xl border border-slate-200 dark:border-slate-700 hover:border-blue-400 transition"
        >
          <Users className="w-7 h-7 text-blue-500 mb-2" />
          <p className="text-sm text-slate-500">Inscripciones pendientes</p>
          <p className="text-3xl font-bold text-blue-600">{stats?.pending_enrollments ?? '—'}</p>
          <p className="text-xs text-slate-400 mt-1">{stats?.enrolled_physicians ?? 0} médicos inscritos</p>
        </Link>
        <Link
          to="/admin/revisiones"
          className="p-5 rounded-2xl border border-slate-200 dark:border-slate-700 hover:border-emerald-400 transition"
        >
          <FileCheck className="w-7 h-7 text-emerald-500 mb-2" />
          <p className="text-sm text-slate-500">Revisiones pendientes</p>
          <p className="text-3xl font-bold text-emerald-600">{stats?.pending_revisions ?? '—'}</p>
          <p className="text-xs text-slate-400 mt-1">{stats?.approved_revisions ?? 0} aprobadas</p>
        </Link>
        <Link
          to="/admin/evaluaciones"
          className="p-5 rounded-2xl border border-slate-200 dark:border-slate-700 hover:border-violet-400 transition"
        >
          <BookOpen className="w-7 h-7 text-violet-500 mb-2" />
          <p className="text-sm text-slate-500">Cuestionarios publicados</p>
          <p className="text-3xl font-bold text-violet-600">{stats?.published_quizzes ?? '—'}</p>
          <p className="text-xs text-slate-400 mt-1">{stats?.quiz_attempts_total ?? 0} intentos registrados</p>
        </Link>
      </div>

      <section>
        <h2 className="text-lg font-semibold mb-3 flex items-center gap-2">
          <CheckCircle className="w-5 h-5 text-slate-400" />
          Actividad reciente
        </h2>
        {audit.length === 0 ? (
          <p className="text-sm text-slate-500 py-6 text-center rounded-xl border border-dashed border-slate-200 dark:border-slate-700">
            Sin actividad registrada aún.
          </p>
        ) : (
          <ul className="space-y-2">
            {audit.map((entry) => (
              <li
                key={entry.id}
                className="flex flex-wrap items-center justify-between gap-2 px-4 py-3 rounded-xl bg-white/60 dark:bg-slate-800/40 border border-slate-200/60 dark:border-slate-700/40 text-sm"
              >
                <span className="font-medium text-slate-700 dark:text-slate-200">
                  {entry.action.replace(/_/g, ' ')}
                </span>
                <span className="text-xs text-slate-400">
                  {entry.actor_id ? actorNames.get(entry.actor_id) ?? 'Sistema' : 'Sistema'}
                  {' · '}
                  {new Date(entry.created_at).toLocaleString('es-MX')}
                </span>
              </li>
            ))}
          </ul>
        )}
        <Link to="/admin/auditoria" className="inline-block mt-3 text-sm text-indigo-600 hover:underline">
          Ver auditoría completa →
        </Link>
      </section>
    </AdminLayout>
  );
}
