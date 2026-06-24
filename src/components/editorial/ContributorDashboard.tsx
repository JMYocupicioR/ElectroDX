import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Plus, FileEdit, Clock, CheckCircle, XCircle, ClipboardList } from 'lucide-react';
import { useAuth } from '../../contexts/AuthProvider';
import { getMyRevisions } from '../../services/editorialService';
import { ProposeModuleLink } from './TopicContribution';
import type { ContentRevision, RevisionStatus } from '../../types/database';

const STATUS_LABEL: Record<RevisionStatus, string> = {
  draft: 'Borrador',
  pending_review: 'En revisión',
  approved: 'Aprobada',
  rejected: 'Rechazada',
  changes_requested: 'Cambios solicitados',
};

const STATUS_ICON: Record<RevisionStatus, typeof Clock> = {
  draft: FileEdit,
  pending_review: Clock,
  approved: CheckCircle,
  rejected: XCircle,
  changes_requested: FileEdit,
};

export default function ContributorDashboard() {
  const { user, profile, canProposeContent, roles } = useAuth();
  const [revisions, setRevisions] = useState<ContentRevision[]>([]);

  useEffect(() => {
    if (!user) return;
    getMyRevisions(user.id).then(setRevisions).catch(console.error);
  }, [user]);

  return (
    <div className="pt-24 pb-16 px-4 max-w-4xl mx-auto">
      <div className="flex flex-wrap items-start justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
            Hola, {profile?.display_name ?? 'Colaborador'}
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            {canProposeContent
              ? 'Puedes proponer contenido y cuestionarios. Todo pasa por revisión antes de publicarse.'
              : 'Tu perfil está pendiente de verificación por un administrador.'}
          </p>
          {!canProposeContent && (
            <p className="text-xs text-amber-700 dark:text-amber-300 mt-2 max-w-xl">
              Roles actuales: {roles.length ? roles.join(', ') : 'ninguno'}.
              {roles.includes('contributor') && !profile?.verified_at
                ? ' Completa tu perfil y espera verificación para crear cuestionarios.'
                : ' Un administrador debe asignarte rol admin, editor o colaborador en Supabase.'}
            </p>
          )}
        </div>
        <div className="flex flex-wrap gap-2">
          <Link to="/colaborador/perfil" className="px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 text-sm">
            Mi perfil
          </Link>
          {canProposeContent && (
            <>
              <Link
                to="/colaborador/nueva-revision"
                className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-blue-600 text-white text-sm font-medium"
              >
                <Plus className="w-4 h-4" /> Nuevo tema
              </Link>
              <Link
                to="/colaborador/cuestionario"
                className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-purple-600 text-white text-sm font-medium"
              >
                <ClipboardList className="w-4 h-4" /> Nuevo cuestionario
              </Link>
              <ProposeModuleLink label="Nuevo módulo" />
            </>
          )}
        </div>
      </div>

      <section>
        <h2 className="text-lg font-semibold mb-4">Mis propuestas</h2>
        {revisions.length === 0 ? (
          <p className="text-sm text-slate-500">Aún no has enviado propuestas.</p>
        ) : (
          <ul className="space-y-3">
            {revisions.map((rev) => {
              const Icon = STATUS_ICON[rev.status];
              const editUrl =
                rev.payload.revisionType === 'quiz'
                  ? `/colaborador/cuestionario/${rev.id}`
                  : rev.payload.revisionType === 'module'
                  ? `/colaborador/nuevo-modulo?revisionId=${rev.id}`
                  : `/colaborador/revision/${rev.id}`;
              return (
                <li key={rev.id}>
                  <Link
                    to={editUrl}
                    className="flex items-center gap-4 p-4 rounded-xl border border-slate-200 dark:border-slate-700 hover:border-blue-300 transition"
                  >
                    <Icon className="w-5 h-5 text-slate-400 flex-shrink-0" />
                    <div className="min-w-0 flex-1">
                      <p className="font-medium truncate">
                        {rev.payload.revisionType === 'module'
                          ? '📦 '
                          : rev.payload.revisionType === 'quiz'
                          ? '📝 '
                          : ''}
                        {rev.payload.title}
                      </p>
                      <p className="text-xs text-slate-500">
                        {rev.payload.revisionType === 'module'
                          ? 'Módulo · '
                          : rev.payload.revisionType === 'quiz'
                          ? 'Cuestionario · '
                          : ''}
                        {STATUS_LABEL[rev.status]} · {rev.action === 'create' ? 'Nuevo' : 'Edición'} · {new Date(rev.updated_at).toLocaleDateString('es-MX')}
                      </p>
                      {rev.review_notes && (
                        <p className="text-xs text-amber-600 mt-1">{rev.review_notes}</p>
                      )}
                    </div>
                  </Link>
                </li>
              );
            })}
          </ul>
        )}
      </section>
    </div>
  );
}
