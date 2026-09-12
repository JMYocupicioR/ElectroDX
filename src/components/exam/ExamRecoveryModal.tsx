import type { ExamAttemptRecord } from '../../types/exam';
import { RotateCcw, Play, X, Clock, Brain } from 'lucide-react';
import { deleteExamAttempt } from '../../services/examService';

interface ExamRecoveryModalProps {
  attempt: ExamAttemptRecord;
  onResume: () => void;
  onStartNew: () => void;
  onCancel: () => void;
}

function formatTime(seconds: number) {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m}:${String(s).padStart(2, '0')}`;
}

export function ExamRecoveryModal({ attempt, onResume, onStartNew, onCancel }: ExamRecoveryModalProps) {
  const answeredCount = Object.keys(attempt.answers ?? {}).length;
  const totalCount = attempt.question_ids?.length ?? 0;
  const timeRemaining = attempt.time_remaining_seconds;

  const handleStartNew = async () => {
    await deleteExamAttempt(attempt.id);
    onStartNew();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
      <div className="w-full max-w-sm bg-gradient-to-b from-slate-900 to-slate-800 border border-white/10 rounded-2xl shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="px-6 pt-6 pb-4 text-center">
          <div className="w-14 h-14 mx-auto mb-4 rounded-2xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center">
            <Brain className="w-7 h-7 text-amber-400" />
          </div>
          <h2 className="text-lg font-bold text-white mb-1">Examen en progreso</h2>
          <p className="text-slate-400 text-sm">
            Tienes un examen incompleto. ¿Deseas continuarlo donde lo dejaste?
          </p>
        </div>

        {/* Estado del intento */}
        <div className="mx-6 mb-5 p-4 rounded-xl bg-white/5 border border-white/10 space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span className="text-slate-400">Progreso</span>
            <span className="text-white font-semibold">{answeredCount} / {totalCount} preguntas</span>
          </div>
          <div className="w-full h-1.5 bg-white/10 rounded-full">
            <div
              className="h-1.5 bg-gradient-to-r from-cyan-500 to-indigo-500 rounded-full transition-all"
              style={{ width: totalCount > 0 ? `${(answeredCount / totalCount) * 100}%` : '0%' }}
            />
          </div>
          {timeRemaining !== null && timeRemaining !== undefined && (
            <div className="flex items-center gap-1.5 text-sm text-amber-400">
              <Clock className="w-3.5 h-3.5" />
              <span>Tiempo restante: {formatTime(timeRemaining)}</span>
            </div>
          )}
        </div>

        {/* Acciones */}
        <div className="px-6 pb-6 space-y-2">
          <button
            onClick={onResume}
            className="w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-gradient-to-r from-cyan-500 to-indigo-500 text-white font-semibold text-sm shadow-lg shadow-cyan-500/20 hover:from-cyan-400 hover:to-indigo-400 transition-all"
          >
            <Play className="w-4 h-4" />
            Continuar examen
          </button>
          <button
            onClick={handleStartNew}
            className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl bg-white/5 border border-white/10 text-slate-300 text-sm hover:bg-white/10 transition-all"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            Empezar examen nuevo
          </button>
          <button
            onClick={onCancel}
            className="w-full py-2 text-slate-500 text-xs hover:text-slate-400 transition-colors"
          >
            Cancelar
          </button>
        </div>
      </div>
    </div>
  );
}
