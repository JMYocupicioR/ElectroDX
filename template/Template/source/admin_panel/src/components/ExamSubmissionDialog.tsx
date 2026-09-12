import { X, CheckCircle, AlertCircle, Flag, Clock } from 'lucide-react';

interface ExamSubmissionDialogProps {
    totalQuestions: number;
    answeredCount: number;
    flaggedCount: number;
    timeElapsed?: number | null;
    answers: Record<string, number>;
    flagged: Record<string, boolean>;
    questions: Array<{ id: string }>;
    mode?: string;
    onReview: () => void;
    onSubmit: () => void;
    onCancel: () => void;
}

export const ExamSubmissionDialog = ({
    totalQuestions,
    answeredCount,
    flaggedCount,
    timeElapsed,
    answers,
    flagged,
    questions,
    mode,
    onReview,
    onSubmit,
    onCancel
}: ExamSubmissionDialogProps) => {
    const unansweredCount = totalQuestions - answeredCount;

    const formatTime = (seconds: number | null) => {
        if (seconds === null) return 'Sin límite';
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins}:${secs.toString().padStart(2, '0')}`;
    };

    return (
        <div className="fixed inset-0 z-50 overflow-y-auto">
            <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:p-0">
                {/* Backdrop */}
                <div className="fixed inset-0 transition-opacity bg-black bg-opacity-50" onClick={onCancel}></div>

                {/* Dialog */}
                <div className="relative inline-block px-4 pt-5 pb-4 overflow-hidden text-left align-bottom transition-all transform bg-white rounded-xl shadow-2xl sm:my-8 sm:align-middle sm:max-w-3xl sm:w-full sm:p-8">
                    {/* Close Button */}
                    <button
                        onClick={onCancel}
                        className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors"
                    >
                        <X size={24} />
                    </button>

                    {/* Header */}
                    <div className="text-center mb-6">
                        <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-gradient-to-r from-indigo-500 to-purple-600 mb-4">
                            <AlertCircle className="h-8 w-8 text-white" />
                        </div>
                        <h3 className="text-2xl font-bold text-gray-900 mb-2">
                            ¿Estás seguro de finalizar el examen?
                        </h3>
                        <p className="text-gray-600">
                            Revisa el resumen antes de enviar tus respuestas
                        </p>
                    </div>

                    {/* Summary Cards */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                        {/* Total Questions */}
                        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 text-center">
                            <div className="text-3xl font-bold text-blue-600">{totalQuestions}</div>
                            <div className="text-sm text-blue-900 mt-1">Total</div>
                        </div>

                        {/* Answered */}
                        <div className="bg-green-50 border border-green-200 rounded-lg p-4 text-center">
                            <div className="flex items-center justify-center">
                                <CheckCircle className="h-5 w-5 text-green-600 mr-1" />
                                <div className="text-3xl font-bold text-green-600">{answeredCount}</div>
                            </div>
                            <div className="text-sm text-green-900 mt-1">Respondidas</div>
                        </div>

                        {/* Unanswered */}
                        {unansweredCount > 0 ? (
                            <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-center">
                                <div className="flex items-center justify-center">
                                    <AlertCircle className="h-5 w-5 text-red-600 mr-1" />
                                    <div className="text-3xl font-bold text-red-600">{unansweredCount}</div>
                                </div>
                                <div className="text-sm text-red-900 mt-1">Sin Responder</div>
                            </div>
                        ) : (
                            <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 text-center">
                                <div className="text-3xl font-bold text-gray-400">{unansweredCount}</div>
                                <div className="text-sm text-gray-600 mt-1">Sin Responder</div>
                            </div>
                        )}

                        {/* Flagged */}
                        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 text-center">
                            <div className="flex items-center justify-center">
                                <Flag className="h-5 w-5 text-yellow-600 mr-1" />
                                <div className="text-3xl font-bold text-yellow-600">{flaggedCount}</div>
                            </div>
                            <div className="text-sm text-yellow-900 mt-1">Marcadas</div>
                        </div>
                    </div>

                    {/* Time Elapsed */}
                    {timeElapsed !== null && timeElapsed !== undefined && (
                        <div className="mb-6 bg-indigo-50 border border-indigo-200 rounded-lg p-4 flex items-center justify-center">
                            <Clock className="h-5 w-5 text-indigo-600 mr-2" />
                            <span className="text-indigo-900 font-medium">
                                Tiempo restante: <span className="font-mono font-bold">{formatTime(timeElapsed)}</span>
                            </span>
                        </div>
                    )}

                    {/* Warning if unanswered */}
                    {unansweredCount > 0 && (
                        <div className="mb-6 bg-yellow-50 border-l-4 border-yellow-400 p-4 rounded">
                            <div className="flex">
                                <AlertCircle className="h-5 w-5 text-yellow-500 mr-2 flex-shrink-0" />
                                <div>
                                    <p className="text-sm font-semibold text-yellow-800">
                                        Atención: Tienes {unansweredCount} {unansweredCount === 1 ? 'pregunta sin responder' : 'preguntas sin responder'}
                                    </p>
                                    <p className="text-sm text-yellow-700 mt-1">
                                        Las preguntas sin responder se marcarán como incorrectas. ¿Deseas revisar?
                                    </p>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Question Map */}
                    <div className="mb-6">
                        <h4 className="text-sm font-semibold text-gray-700 mb-3">Mapa de Preguntas</h4>
                        <div className="grid grid-cols-10 gap-2">
                            {questions.map((q, index) => {
                                const isAnswered = answers[q.id] !== undefined;
                                const isFlagged = flagged[q.id];

                                return (
                                    <div
                                        key={q.id}
                                        className={`aspect-square flex items-center justify-center rounded text-xs font-semibold border ${
                                            isAnswered
                                                ? 'bg-green-100 border-green-300 text-green-700'
                                                : 'bg-red-50 border-red-200 text-red-600'
                                        } ${isFlagged ? 'ring-2 ring-yellow-400' : ''}`}
                                        title={`Pregunta ${index + 1}${isFlagged ? ' (Marcada)' : ''}${isAnswered ? ' (Respondida)' : ' (Sin responder)'}`}
                                    >
                                        {index + 1}
                                    </div>
                                );
                            })}
                        </div>
                        <div className="flex items-center gap-4 mt-3 text-xs text-gray-600">
                            <div className="flex items-center">
                                <div className="w-4 h-4 bg-green-100 border border-green-300 rounded mr-1"></div>
                                Respondida
                            </div>
                            <div className="flex items-center">
                                <div className="w-4 h-4 bg-red-50 border border-red-200 rounded mr-1"></div>
                                Sin responder
                            </div>
                            <div className="flex items-center">
                                <div className="w-4 h-4 bg-white border border-gray-300 rounded ring-2 ring-yellow-400 mr-1"></div>
                                Marcada
                            </div>
                        </div>
                    </div>

                    {/* Actions */}
                    <div className="flex flex-col sm:flex-row gap-3">
                        {mode === 'CUSTOM' ? (
                            <button
                                disabled
                                className="flex-1 px-6 py-3 border border-gray-200 text-gray-400 bg-gray-50 rounded-lg font-semibold cursor-not-allowed"
                                title="No puedes cancelar un examen asignado"
                            >
                                Cancelar/eliminar
                            </button>
                        ) : (
                            <button
                                onClick={onCancel}
                                className="flex-1 px-6 py-3 border border-red-300 text-red-600 rounded-lg font-semibold hover:bg-red-50 transition-colors"
                            >
                                Cancelar/eliminar
                            </button>
                        )}
                        <button
                            onClick={onReview}
                            className="flex-1 px-6 py-3 bg-indigo-600 text-white rounded-lg font-semibold hover:bg-indigo-700 transition-colors"
                        >
                            Revisar Examen
                        </button>
                        <button
                            onClick={onSubmit}
                            className="flex-1 px-6 py-3 bg-green-600 text-white rounded-lg font-semibold hover:bg-green-700 transition-colors shadow-lg"
                        >
                            Finalizar y Enviar
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};
