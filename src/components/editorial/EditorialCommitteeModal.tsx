import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Scale,
  X,
  CheckCircle2,
  Building2,
  Stethoscope,
  ExternalLink,
  Shield,
} from 'lucide-react';
import { getCommitteeMembers } from '../../services/editorialService';
import type { Profile } from '../../types/database';
import { BRAND } from '../../config/brand';

interface EditorialCommitteeModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function EditorialCommitteeModal({
  isOpen,
  onClose,
}: EditorialCommitteeModalProps) {
  const [members, setMembers] = useState<Profile[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!isOpen) return;

    let cancelled = false;
    setLoading(true);
    getCommitteeMembers()
      .then((data) => {
        if (!cancelled) setMembers(data);
      })
      .catch((err) => {
        console.warn('[EditorialCommitteeModal] Error fetching members:', err);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [isOpen]);

  // Handle escape key
  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="comite-editorial-modal-title"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-slate-950/75 backdrop-blur-sm animate-fade-in"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="relative w-full max-w-2xl max-h-[90vh] flex flex-col rounded-3xl bg-white dark:bg-slate-900 border border-indigo-200/60 dark:border-indigo-900/40 shadow-2xl overflow-hidden animate-scale-up">
        {/* Glow backdrop header decoration */}
        <div className="absolute top-0 right-0 -mt-8 -mr-8 w-60 h-60 rounded-full bg-indigo-500/10 blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 -mb-8 -ml-8 w-60 h-60 rounded-full bg-blue-500/10 blur-3xl pointer-events-none" />

        {/* Modal Header */}
        <div className="relative z-10 flex items-start justify-between p-5 sm:p-6 border-b border-slate-100 dark:border-slate-800 bg-gradient-to-r from-indigo-50/60 via-white to-white dark:from-indigo-950/30 dark:via-slate-900 dark:to-slate-900">
          <div className="flex items-center gap-3.5 min-w-0">
            <div className="p-2.5 rounded-2xl bg-indigo-500/15 text-indigo-600 dark:text-indigo-400 border border-indigo-500/25 shrink-0 shadow-xs">
              <Scale className="w-6 h-6" />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <h2
                  id="comite-editorial-modal-title"
                  className="text-lg sm:text-xl font-extrabold text-slate-900 dark:text-white tracking-tight"
                >
                  Comité Editorial y Dirección Académica
                </h2>
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-indigo-500/15 text-indigo-700 dark:text-indigo-300 border border-indigo-500/30">
                  <Shield className="w-3 h-3 text-indigo-500" />
                  Aval Oficial
                </span>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 truncate mt-0.5">
                {BRAND.enableAccreditation
                  ? 'ElectroDx Diplomado · Aval COMEFYR Oficial'
                  : 'ElectroDx Diplomado · Dirección Académica de Posgrado'}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            aria-label="Cerrar modal"
            className="p-2 rounded-xl text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition cursor-pointer shrink-0 ml-2"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="relative z-10 flex-1 overflow-y-auto p-5 sm:p-6 space-y-4">
          <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed bg-slate-50 dark:bg-slate-800/50 p-3.5 rounded-2xl border border-slate-200/60 dark:border-slate-800">
            Cuerpo médico colegiado responsable del rigor científico, dictaminación metodológica,
            actualización continua de guías clínicas internacionales y supervisión de evaluaciones
            formativas para los médicos inscritos.
          </p>

          {loading ? (
            <div className="py-12 text-center space-y-3">
              <div className="w-8 h-8 border-3 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto" />
              <p className="text-xs text-slate-400 font-medium">Cargando miembros del comité…</p>
            </div>
          ) : members.length === 0 ? (
            <div className="py-10 text-center rounded-2xl border border-dashed border-slate-200 dark:border-slate-800 p-6">
              <Scale className="w-8 h-8 text-slate-400 mx-auto mb-2" />
              <p className="text-xs text-slate-500">
                La nómina oficial del comité se encuentra en proceso de sincronización.
              </p>
            </div>
          ) : (
            <div className="grid gap-3 sm:grid-cols-2">
              {members.map((member) => (
                <div
                  key={member.id}
                  className="p-4 rounded-2xl border border-indigo-200/70 dark:border-indigo-900/40 bg-gradient-to-br from-indigo-50/30 via-white to-white dark:from-indigo-950/20 dark:via-slate-900/80 dark:to-slate-900/80 shadow-xs flex items-start gap-3.5 hover:border-indigo-300 dark:hover:border-indigo-700/60 transition-all"
                >
                  {/* Avatar */}
                  <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-indigo-600 to-blue-600 text-white flex items-center justify-center font-bold text-sm shadow-xs shrink-0 overflow-hidden">
                    {member.avatar_url ? (
                      <img
                        src={member.avatar_url}
                        alt={member.display_name || ''}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <span>{member.display_name?.charAt(0)?.toUpperCase() || 'Dr'}</span>
                    )}
                  </div>

                  {/* Details */}
                  <div className="min-w-0 flex-1 space-y-1">
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <h3 className="font-bold text-slate-900 dark:text-white text-xs sm:text-sm leading-tight">
                        {member.display_name}
                      </h3>
                      {member.cedula_verified && (
                        <span
                          title="Cédula verificada SEP"
                          className="inline-flex items-center gap-0.5 px-1.5 py-0.2 rounded-full text-[9px] font-bold bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30"
                        >
                          <CheckCircle2 className="w-2.5 h-2.5 text-emerald-500" /> SEP
                        </span>
                      )}
                    </div>

                    {member.credentials && (
                      <p className="text-[11px] text-indigo-600 dark:text-indigo-400 font-medium leading-snug">
                        {member.credentials}
                      </p>
                    )}

                    {member.specialty && (
                      <p className="text-[11px] text-slate-600 dark:text-slate-300 flex items-center gap-1 leading-snug">
                        <Stethoscope className="w-3 h-3 text-slate-400 shrink-0" />
                        <span className="truncate">{member.specialty}</span>
                      </p>
                    )}

                    {member.institution && (
                      <p className="text-[11px] text-slate-500 dark:text-slate-400 flex items-center gap-1 leading-snug">
                        <Building2 className="w-3 h-3 text-slate-400 shrink-0" />
                        <span className="truncate">{member.institution}</span>
                      </p>
                    )}

                    <div className="pt-1">
                      <Link
                        to={`/especialistas/${member.id}`}
                        onClick={onClose}
                        className="inline-flex items-center gap-1 text-[11px] font-semibold text-blue-600 dark:text-cyan-400 hover:underline"
                      >
                        <span>Ver expediente</span>
                        <ExternalLink className="w-2.5 h-2.5" />
                      </Link>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="relative z-10 flex flex-col-reverse sm:flex-row items-center justify-between gap-3 p-4 sm:p-5 border-t border-slate-100 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-900/60">
          <Link
            to="/comite-editorial"
            onClick={onClose}
            className="inline-flex items-center gap-1.5 text-xs font-bold text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 dark:hover:text-indigo-300 hover:underline transition"
          >
            <span>Ver página completa y aval institucional</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </Link>

          <button
            type="button"
            onClick={onClose}
            className="w-full sm:w-auto px-5 py-2 rounded-xl text-xs font-bold bg-slate-900 dark:bg-white text-white dark:text-slate-900 hover:bg-slate-800 dark:hover:bg-slate-100 shadow-sm transition cursor-pointer"
          >
            Entendido
          </button>
        </div>
      </div>
    </div>
  );
}
