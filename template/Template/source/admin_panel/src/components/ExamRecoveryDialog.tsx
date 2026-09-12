import { ExamAttempt } from '../hooks/useExamAttempt';
import { AlertTriangle, Play, Trash2 } from 'lucide-react';

interface ExamRecoveryDialogProps {
    attempt: ExamAttempt;
    onContinue: () => void;
    onStartNew: () => void;
    onCancel: () => void;
}

export const ExamRecoveryDialog = ({ attempt, onContinue, onStartNew, onCancel }: ExamRecoveryDialogProps) => {
    const totalQuestions = attempt.question_ids.length;
    const answeredCount = Object.keys(attempt.answers).length;
    const progressPercentage = Math.round((answeredCount / totalQuestions) * 100);
    
    const formatTime = (seconds: number | null) => {
        if (seconds === null) return 'Sin límite';
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins}:${secs.toString().padStart(2, '0')}`;
    };

    const getModeName = () => {
        switch (attempt.mode) {
            case 'FULL_SIMULATION':
                return 'Simulacro Completo';
            case 'ISLAND_SPECIFIC':
                return 'Examen por Isla';
            case 'CUSTOM':
                return 'Examen Personalizado';
            default:
                return 'Examen';
        }
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full overflow-hidden animate-in fade-in zoom-in duration-200">
                {/* Header */}
                <div className="bg-gradient-to-r from-amber-500 to-orange-600 p-6 text-white">
                    <div className="flex items-center gap-3">
                        <div className="p-3 bg-white/20 rounded-full">
                            <AlertTriangle className="h-6 w-6" />
                        </div>
                        <div>
                            <h2 className="text-2xl font-bold">Examen Pendiente</h2>
                            <p className="text-amber-100 text-sm mt-1">
                                Tienes un examen en progreso
                            </p>
                        </div>
                    </div>
                </div>

                {/* Content */}
                <div className="p-6 space-y-4">
                    <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-lg p-4 border border-blue-100">
                        <h3 className="font-semibold text-gray-900 mb-3 flex items-center">
                            <span className="w-2 h-2 bg-blue-500 rounded-full mr-2 animate-pulse"></span>
                            Detalles del Examen
                        </h3>
                        <div className="space-y-2 text-sm">
                            <div className="flex justify-between">
                                <span className="text-gray-600">Tipo:</span>
                                <span className="font-medium text-gray-900">{getModeName()}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-gray-600">Total de preguntas:</span>
                                <span className="font-medium text-gray-900">{totalQuestions}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-gray-600">Preguntas respondidas:</span>
                                <span className="font-medium text-gray-900">{answeredCount}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-gray-600">Tiempo restante:</span>
                                <span className="font-medium text-gray-900">{formatTime(attempt.time_remaining_seconds)}</span>
                            </div>
                        </div>

                        {/* Progress Bar */}
                        <div className="mt-4">
                            <div className="flex justify-between text-xs text-gray-600 mb-1">
                                <span>Progreso</span>
                                <span>{progressPercentage}%</span>
                            </div>
                            <div className="w-full bg-gray-200 rounded-full h-2">
                                <div 
                                    className="bg-gradient-to-r from-blue-500 to-indigo-600 h-2 rounded-full transition-all duration-500"
                                    style={{ width: `${progressPercentage}%` }}
                                />
                            </div>
                        </div>
                    </div>

                    <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                        <p className="text-sm text-yellow-800">
                            <strong>¿Qué deseas hacer?</strong> Puedes continuar donde lo dejaste o empezar un nuevo examen desde cero.
                        </p>
                    </div>
                </div>

                {/* Actions */}
                <div className="px-6 pb-6 space-y-3">
                    <button
                        onClick={onContinue}
                        className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-green-600 to-emerald-600 text-white py-3 px-6 rounded-xl font-bold hover:from-green-700 hover:to-emerald-700 transition-all shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
                    >
                        <Play size={20} fill="currentColor" />
                        Continuar Examen
                    </button>

                    <button
                        onClick={onStartNew}
                        className="w-full flex items-center justify-center gap-2 bg-white text-red-600 py-3 px-6 rounded-xl font-semibold border-2 border-red-600 hover:bg-red-50 transition-all"
                    >
                        <Trash2 size={18} />
                        Empezar de Nuevo
                    </button>

                    <button
                        onClick={onCancel}
                        className="w-full text-gray-600 py-2 px-6 rounded-lg font-medium hover:bg-gray-100 transition-colors text-sm"
                    >
                        Cancelar
                    </button>
                </div>
            </div>
        </div>
    );
};
