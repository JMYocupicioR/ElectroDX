import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { ArrowLeft, User, BadgeCheck } from 'lucide-react';
import { getProfileById } from '../../services/editorialService';
import type { Profile } from '../../types/database';

export default function PublicProfilePage() {
  const { userId } = useParams();
  const [profile, setProfile] = useState<Profile | null>(null);

  useEffect(() => {
    if (!userId) return;
    getProfileById(userId).then(setProfile);
  }, [userId]);

  if (!profile) {
    return (
      <div className="pt-24 px-4 text-center text-slate-500">
        Perfil no encontrado o no público.
      </div>
    );
  }

  return (
    <div className="pt-24 pb-16 px-4 max-w-2xl mx-auto">
      <Link to="/especialistas" className="inline-flex items-center gap-2 text-sm text-slate-500 mb-6">
        <ArrowLeft className="w-4 h-4" /> Especialistas
      </Link>

      <div className="rounded-2xl border border-slate-200 dark:border-slate-700 p-6 text-center">
        <div className="w-24 h-24 mx-auto rounded-full bg-slate-200 dark:bg-slate-700 overflow-hidden flex items-center justify-center mb-4">
          {profile.avatar_url ? (
            <img src={profile.avatar_url} alt="" className="w-full h-full object-cover" />
          ) : (
            <User className="w-10 h-10 text-slate-400" />
          )}
        </div>
        <h1 className="text-2xl font-bold flex items-center justify-center gap-2">
          {profile.display_name}
          {profile.verified_at && <BadgeCheck className="w-5 h-5 text-blue-500" title="Colaborador verificado" />}
        </h1>
        <p className="text-slate-600 dark:text-slate-400 mt-1">{profile.credentials}</p>
        <p className="text-sm text-slate-500">{profile.institution}</p>
        {profile.specialty && (
          <p className="text-sm text-slate-500 mt-1">{profile.specialty}</p>
        )}
        {profile.bio && (
          <p className="text-sm text-slate-600 dark:text-slate-400 mt-4 text-left">{profile.bio}</p>
        )}
      </div>
    </div>
  );
}
