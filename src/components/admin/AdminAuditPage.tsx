import { useEffect, useState } from 'react';
import { AdminLayout } from './AdminLayout';
import { getAuditLog, getProfilesByIds } from '../../services/editorialService';
import type { AuditLogEntry } from '../../types/admin';

export default function AdminAuditPage() {
  const [entries, setEntries] = useState<AuditLogEntry[]>([]);
  const [actorNames, setActorNames] = useState<Map<string, string>>(new Map());

  useEffect(() => {
    getAuditLog(100)
      .then(async (data) => {
        setEntries(data);
        const ids = data.map((e) => e.actor_id).filter(Boolean) as string[];
        const profiles = await getProfilesByIds(ids);
        const names = new Map<string, string>();
        profiles.forEach((p, id) => names.set(id, p.display_name));
        setActorNames(names);
      })
      .catch(console.error);
  }, []);

  return (
    <AdminLayout title="Registro de auditoría">
      <p className="text-sm text-slate-500 mb-6 -mt-4">
        Historial de acciones administrativas y editoriales.
      </p>

      {entries.length === 0 ? (
        <p className="text-sm text-slate-500 py-12 text-center rounded-xl border border-dashed border-slate-200 dark:border-slate-700">
          Sin registros de auditoría.
        </p>
      ) : (
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
              {entries.map((e) => (
                <tr key={e.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30">
                  <td className="px-4 py-3 font-medium">{e.action.replace(/_/g, ' ')}</td>
                  <td className="px-4 py-3 text-slate-500">
                    {e.entity_type} · {e.entity_id.slice(0, 8)}…
                  </td>
                  <td className="px-4 py-3">
                    {e.actor_id ? actorNames.get(e.actor_id) ?? e.actor_id.slice(0, 8) : '—'}
                  </td>
                  <td className="px-4 py-3 text-slate-400 whitespace-nowrap">
                    {new Date(e.created_at).toLocaleString('es-MX')}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </AdminLayout>
  );
}
