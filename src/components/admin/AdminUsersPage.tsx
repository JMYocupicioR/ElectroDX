import { useEffect, useState } from 'react';
import {
  UserCheck,
  Shield,
  UserX,
  PenLine,
  Mail,
  Calendar,
  AlertTriangle,
  Users,
  Stethoscope,
  XCircle,
} from 'lucide-react';
import { AdminLayout } from './AdminLayout';
import {
  getAdminProfiles,
  verifyContributor,
  verifyPhysicianEnrollment,
  rejectPhysicianEnrollment,
  revokePhysicianEnrollment,
  grantRole,
  revokeContributor,
} from '../../services/editorialService';
import type { AdminProfileRow } from '../../types/admin';
import type { AppRole } from '../../types/database';
import { isEnrollmentProfileComplete, isProfileComplete } from '../../utils/adminUtils';
import { useAuth } from '../../contexts/AuthProvider';

type Tab = 'enrollment_pending' | 'enrolled' | 'contributors';

const TAB_LABELS: Record<Tab, string> = {
  enrollment_pending: 'Inscripciones pendientes',
  enrolled: 'Médicos inscritos',
  contributors: 'Colaboradores',
};

export default function AdminUsersPage() {
  const { user } = useAuth();
  const [tab, setTab] = useState<Tab>('enrollment_pending');
  const [users, setUsers] = useState<AdminProfileRow[]>([]);
  const [loadingId, setLoadingId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const load = () =>
    getAdminProfiles(false, tab)
      .then(setUsers)
      .catch((e) => setError(e.message));

  useEffect(() => {
    load();
  }, [tab]);

  const run = async (userId: string, fn: () => Promise<void>) => {
    setLoadingId(userId);
    setError(null);
    try {
      await fn();
      await load();
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Error');
    } finally {
      setLoadingId(null);
    }
  };

  return (
    <AdminLayout title="Gestión de usuarios">
      <div className="flex flex-wrap gap-2 mb-6">
        {(Object.keys(TAB_LABELS) as Tab[]).map((t) => (
          <button
            key={t}
            type="button"
            onClick={() => setTab(t)}
            className={`px-4 py-2 rounded-xl text-sm font-medium transition ${
              tab === t
                ? 'bg-indigo-600 text-white'
                : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400'
            }`}
          >
            {TAB_LABELS[t]}
          </button>
        ))}
      </div>

      {error && <p className="text-sm text-red-600 mb-4">{error}</p>}

      {users.length === 0 ? (
        <div className="text-center py-12 rounded-2xl border border-dashed border-slate-200 dark:border-slate-700">
          <Users className="w-10 h-10 text-slate-300 mx-auto mb-3" />
          <p className="text-sm text-slate-500">No hay usuarios en esta categoría.</p>
        </div>
      ) : (
        <ul className="space-y-4">
          {users.map((u) => {
            const complete = isProfileComplete(u);
            const enrollmentComplete = isEnrollmentProfileComplete(u);
            const isSelf = u.id === user?.id;
            return (
              <li
                key={u.id}
                className="p-4 sm:p-5 rounded-2xl border border-slate-200 dark:border-slate-700 bg-white/60 dark:bg-slate-900/30"
              >
                <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-4">
                  <div className="flex gap-4 min-w-0">
                    <div className="w-12 h-12 rounded-full bg-slate-200 dark:bg-slate-700 overflow-hidden flex-shrink-0 flex items-center justify-center">
                      {u.avatar_url ? (
                        <img src={u.avatar_url} alt="" className="w-full h-full object-cover" />
                      ) : (
                        <span className="text-lg font-bold text-slate-400">
                          {u.display_name.charAt(0).toUpperCase()}
                        </span>
                      )}
                    </div>
                    <div className="min-w-0">
                      <p className="font-semibold text-slate-900 dark:text-white">{u.display_name}</p>
                      <p className="flex items-center gap-1.5 text-sm text-slate-500 mt-0.5">
                        <Mail className="w-3.5 h-3.5" /> {u.email}
                      </p>
                      <p className="flex items-center gap-1.5 text-xs text-slate-400 mt-1">
                        <Calendar className="w-3.5 h-3.5" />
                        Registro: {new Date(u.created_at).toLocaleDateString('es-MX')}
                      </p>
                      {u.credentials && (
                        <p className="text-sm text-slate-600 dark:text-slate-400 mt-2">
                          {u.credentials} · {u.institution}
                        </p>
                      )}
                      {u.cedula_profesional && (
                        <p className="text-xs text-slate-500 mt-1">Cédula: {u.cedula_profesional}</p>
                      )}
                      {u.specialty && <p className="text-xs text-slate-400">{u.specialty}</p>}
                      <div className="flex flex-wrap gap-1.5 mt-2">
                        {u.roles.map((r) => (
                          <span
                            key={r}
                            className="px-2 py-0.5 rounded-md bg-indigo-100 dark:bg-indigo-900/40 text-indigo-700 dark:text-indigo-300 text-xs"
                          >
                            {r}
                          </span>
                        ))}
                        {tab === 'enrollment_pending' && !enrollmentComplete && (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-amber-100 text-amber-700 text-xs">
                            <AlertTriangle className="w-3 h-3" /> Perfil incompleto
                          </span>
                        )}
                        {tab === 'contributors' && !complete && (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-amber-100 text-amber-700 text-xs">
                            <AlertTriangle className="w-3 h-3" /> Perfil incompleto
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  {!isSelf && (
                    <div className="flex flex-wrap gap-2 lg:flex-col lg:items-stretch">
                      {tab === 'enrollment_pending' && (
                        <>
                          <button
                            type="button"
                            disabled={loadingId === u.id || !enrollmentComplete}
                            onClick={() => run(u.id, () => verifyPhysicianEnrollment(u.id))}
                            className="inline-flex items-center justify-center gap-1 px-3 py-2 rounded-lg bg-emerald-600 text-white text-sm disabled:opacity-50"
                          >
                            <Stethoscope className="w-4 h-4" /> Aprobar inscripción
                          </button>
                          <button
                            type="button"
                            disabled={loadingId === u.id}
                            onClick={() => run(u.id, () => rejectPhysicianEnrollment(u.id))}
                            className="inline-flex items-center justify-center gap-1 px-3 py-2 rounded-lg border border-red-200 text-red-600 text-sm"
                          >
                            <XCircle className="w-4 h-4" /> Rechazar
                          </button>
                        </>
                      )}
                      {tab === 'enrolled' && (
                        <button
                          type="button"
                          disabled={loadingId === u.id}
                          onClick={() => {
                            if (!confirm('¿Revocar inscripción médica? Perderá acceso a evaluaciones.')) return;
                            run(u.id, () => revokePhysicianEnrollment(u.id));
                          }}
                          className="inline-flex items-center justify-center gap-1 px-3 py-2 rounded-lg border border-red-200 text-red-600 text-sm"
                        >
                          <UserX className="w-4 h-4" /> Revocar inscripción
                        </button>
                      )}
                      {tab === 'contributors' && !u.verified_at && (
                        <button
                          type="button"
                          disabled={loadingId === u.id}
                          onClick={() => run(u.id, () => verifyContributor(u.id))}
                          className="inline-flex items-center justify-center gap-1 px-3 py-2 rounded-lg bg-emerald-600 text-white text-sm"
                        >
                          <UserCheck className="w-4 h-4" /> Verificar colaborador
                        </button>
                      )}
                      {tab === 'contributors' && u.verified_at && !u.roles.includes('admin') && (
                        <>
                          <button
                            type="button"
                            disabled={loadingId === u.id}
                            onClick={() => run(u.id, () => grantRole(u.id, 'editor' as AppRole))}
                            className="inline-flex items-center justify-center gap-1 px-3 py-2 rounded-lg border border-violet-300 text-violet-600 text-sm"
                          >
                            <PenLine className="w-4 h-4" /> Hacer editor
                          </button>
                          <button
                            type="button"
                            disabled={loadingId === u.id}
                            onClick={() => run(u.id, () => grantRole(u.id, 'admin' as AppRole))}
                            className="inline-flex items-center justify-center gap-1 px-3 py-2 rounded-lg border border-indigo-300 text-indigo-600 text-sm"
                          >
                            <Shield className="w-4 h-4" /> Hacer admin
                          </button>
                          <button
                            type="button"
                            disabled={loadingId === u.id}
                            onClick={() => {
                              if (!confirm('¿Revocar acceso de colaborador?')) return;
                              run(u.id, () => revokeContributor(u.id));
                            }}
                            className="inline-flex items-center justify-center gap-1 px-3 py-2 rounded-lg border border-red-200 text-red-600 text-sm"
                          >
                            <UserX className="w-4 h-4" /> Revocar colaborador
                          </button>
                        </>
                      )}
                    </div>
                  )}
                  {isSelf && <span className="text-xs text-slate-400 italic">Tu cuenta</span>}
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </AdminLayout>
  );
}
