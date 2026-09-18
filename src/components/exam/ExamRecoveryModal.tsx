import { useEffect, useState } from 'react';
import type { ExamAttemptRecord } from '../../types/exam';
import { RotateCcw, Play, Clock, Brain, Loader2, ShieldAlert } from 'lucide-react';
import { clearExamAttemptCaches, finalizeExamAttempt } from '../../services/examService';
import { useFocusTrap } from '../../hooks/useFocusTrap';

interface ExamRecoveryModalProps {
  attempt: ExamAttemptRecord;
  onResume: () => void;
  onStartNew: () => void;
  onCancel: () => void;
}

function formatTime(seconds: number) {
  const safe = Math.max(0, seconds);
  const h = Math.floor(safe / 3600);
  const m = Math.floor((safe % 3600) / 60);
  const s = safe % 60;
  if (h > 0) return `${h}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
  return `${m}:${String(s).padStart(2, '0')}`;
}

/** "hace 5 min", "hace 2 h" — para que continuar sea una decisión informada */
function formatElapsed(isoDate?: string) {
  if (!isoDate) return null;
  const ms = Date.now() - new Date(isoDate).getTime();
  if (!Number.isFinite(ms) || ms < 0) return null;

  const minutes = Math.floor(ms / 60_000);
  if (minutes < 1) return 'hace unos segundos';
  if (minutes < 60) return `hace ${minutes} min`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `hace ${hours} h`;
  const days = Math.floor(hours / 24);
  return `hace ${days} día${days !== 1 ? 's' : ''}`;
}

/**
 * Tiempo restante real de un examen cronometrado.
 * Si el intento tiene `expires_at` el cronómetro es absoluto y siguió corriendo
 * con la pestaña cerrada; si no, se usa el último valor guardado.
 */
function resolveTimeRemaining(attempt: ExamAttemptRecord): number | null {
  if (attempt.expires_at) {
    return Math.max(0, Math.round((new Date(attempt.expires_at).getTime() - Date.now()) / 1000));
  }
  return attempt.time_remaining_seconds ?? null;
}

export function ExamRecoveryModal({ attempt, onResume, onStartNew, onCancel }: ExamRecoveryModalProps) {
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const dialogRef = useFocusTrap(true);

  const answeredCount = Object.keys(attempt.answers ?? {}).length;
  const totalCount = attempt.question_ids?.length ?? 0;
  const timeRemaining = resolveTimeRemaining(attempt);
  const startedAgo = formatElapsed(attempt.created_at);
  const topics = attempt.config?.topicNames ?? [];
  const isAssigned = Boolean(attempt.assignment_id);
  const progressPct = totalCount > 0 ? Math.round((answeredCount / totalCount) * 100) : 0;

  // Bloquea el scroll del fondo mientras el diálogo está abierto
  useEffect(() => {
    const previous = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = previous; };
  }, []);

  const handleStartNew = async () => {
    if (busy) return;
    setBusy(true);
    setError(null);

    // Se marca ABANDONED en lugar de borrar la fila: conserva el rastro de
    // auditoría del intento y evita que una evaluación asignada se reinicie.
    const ok = await finalizeExamAttempt(attempt.id, 'ABANDONED');
    if (!ok) {
      setBusy(false);
      setError('No se pudo cerrar el examen anterior. Revisa tu conexión e inténtalo de nuevo.');
      return;
    }

    clearExamAttemptCaches(attempt.id, attempt.assignment_id);
    setBusy(false);
    onStartNew();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
      <div
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="exam-recovery-title"
        aria-describedby="exam-recovery-desc"
        onKeyDown={e => {
          if (e.key === 'Escape' && !busy) onCancel();
        }}
        className="w-full max-w-sm bg-gradient-to-b from-slate-900 to-slate-800 border border-white/10 rounded-2xl shadow-2xl overflow-hidden"
      >
        {/* Header */}
        <div className="px-6 pt-6 pb-4 text-center">
          <div className="w-14 h-14 mx-auto mb-4 rounded-2xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center">
            <Brain className="w-7 h-7 text-amber-400" />
          </div>
          <h2 id="exam-recovery-title" className="text-lg font-bold text-white mb-1">
            Examen en progreso
          </h2>
          <p id="exam-recovery-desc" className="text-slate-400 text-sm">
            {isAssigned
              ? 'Tienes una evaluación asignada sin terminar. Debes continuarla donde la dejaste.'
              : 'Tienes un examen incompleto. ¿Deseas continuarlo donde lo dejaste?'}
          </p>
        </div>

        {/* Estado del intento */}
        <div className="mx-6 mb-5 p-4 rounded-xl bg-white/5 border border-white/10 space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span className="text-slate-400">Progreso</span>
            <span className="text-white font-semibold">{answeredCount} / {totalCount} preguntas</span>
          </div>
          <div
            className="w-full h-1.5 bg-white/10 rounded-full"
            role="progressbar"
            aria-valuenow={progressPct}
            aria-valuemin={0}
            aria-valuemax={100}
            aria-label={`${answeredCount} de ${totalCount} preguntas respondidas`}
          >
            <div
              className="h-1.5 bg-gradient-to-r from-cyan-500 to-indigo-500 rounded-full transition-all"
              style={{ width: `${progressPct}%` }}
            />
          </div>

          {timeRemaining !== null && (
            <div className={`flex items-center gap-1.5 text-sm ${timeRemaining === 0 ? 'text-red-400' : 'text-amber-400'}`}>
              <Clock className="w-3.5 h-3.5" />
              <span>
                {timeRemaining === 0
                  ? 'Tiempo agotado: se enviará al continuar'
                  : `Tiempo restante: ${formatTime(timeRemaining)}`}
              </span>
            </div>
          )}

          {startedAgo && (
            <p className="text-xs text-slate-500">Iniciado {startedAgo}</p>
          )}

          {topics.length > 0 && (
            <p className="text-xs text-slate-500 line-clamp-2">
              {topics.length === 1 ? 'Tema: ' : 'Temas: '}
              {topics.slice(0, 3).join(', ')}
              {topics.length > 3 ? ` y ${topics.length - 3} más` : ''}
            </p>
          )}

          {isAssigned && (
            <p className="flex items-center gap-1.5 text-xs text-amber-300">
              <ShieldAlert className="w-3.5 h-3.5 shrink-0" />
              Evaluación oficial asignada por tu profesor
            </p>
          )}
        </div>

        {/* Acciones */}
        <div className="px-6 pb-6 space-y-2">
          {error && (
            <p role="alert" className="text-xs text-red-400 text-center pb-1">{error}</p>
          )}

          <button
            onClick={onResume}
            disabled={busy}
            className="w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-gradient-to-r from-cyan-500 to-indigo-500 text-white font-semibold text-sm shadow-lg shadow-cyan-500/20 hover:from-cyan-400 hover:to-indigo-400 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Play className="w-4 h-4" />
            Continuar examen
          </button>

          {/* Una evaluación asignada no se reinicia desde aquí */}
          {!isAssigned && (
            <button
              onClick={handleStartNew}
              disabled={busy}
              className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl bg-white/5 border border-white/10 text-slate-300 text-sm hover:bg-white/10 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {busy ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <RotateCcw className="w-3.5 h-3.5" />}
              {busy ? 'Cerrando examen anterior…' : 'Empezar examen nuevo'}
            </button>
          )}

          <button
            onClick={onCancel}
            disabled={busy}
            className="w-full py-2 text-slate-500 text-xs hover:text-slate-400 transition-colors disabled:opacity-50"
          >
            Cancelar
          </button>
        </div>
      </div>
    </div>
  );
}
