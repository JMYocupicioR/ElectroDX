import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { User, BadgeCheck } from 'lucide-react';
import { getPublicProfiles } from '../../services/editorialService';
import type { Profile } from '../../types/database';

export default function SpecialistsPage() {
  const [profiles, setProfiles] = useState<Profile[]>([]);

  useEffect(() => {
    getPublicProfiles().then(setProfiles).catch(console.error);
  }, []);

  return (
    <div className="pt-24 pb-16 px-4 max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold mb-2">Especialistas colaboradores</h1>
      <p className="text-sm text-slate-500 mb-8">
        Médicos y electrofisiólogos verificados que contribuyen a esta biblioteca de electromiografía.
      </p>

      {profiles.length === 0 ? (
        <p className="text-sm text-slate-500">Aún no hay perfiles públicos verificados.</p>
      ) : (
        <ul className="grid gap-4 sm:grid-cols-2">
          {profiles.map((p) => (
            <li key={p.id}>
              <Link
                to={`/especialistas/${p.id}`}
                className="flex items-start gap-4 p-4 rounded-2xl border border-slate-200 dark:border-slate-700 hover:border-blue-300 transition h-full"
              >
                <div className="w-12 h-12 rounded-full bg-slate-200 dark:bg-slate-700 overflow-hidden flex-shrink-0 flex items-center justify-center">
                  {p.avatar_url ? (
                    <img src={p.avatar_url} alt="" className="w-full h-full object-cover" />
                  ) : (
                    <User className="w-6 h-6 text-slate-400" />
                  )}
                </div>
                <div>
                  <p className="font-semibold flex items-center gap-1.5">
                    {p.display_name}
                    {p.verified_at && <BadgeCheck className="w-4 h-4 text-blue-500" />}
                  </p>
                  <p className="text-sm text-slate-500">{p.credentials}</p>
                  <p className="text-xs text-slate-400">{p.institution}</p>
                </div>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
