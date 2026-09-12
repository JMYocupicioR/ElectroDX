import { useEffect, useState } from 'react';
import { toast } from 'sonner';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '../../lib/supabase';
import { UserLayout } from '../../layouts/UserLayout';
import { Settings, Clock, BookOpen, HelpCircle, Play, CheckSquare, Square } from 'lucide-react';
import { useExamAttempt, ExamAttempt } from '../../hooks/useExamAttempt';
import { ExamRecoveryDialog } from '../../components/ExamRecoveryDialog';

interface Topic {
    id: string;
    name: string;
    description: string;
}

export const UserIslandConfig = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    
    // Data state
    const [islandName, setIslandName] = useState('');
    const [topics, setTopics] = useState<Topic[]>([]);
    const [loading, setLoading] = useState(true);
    const [pendingAttempt, setPendingAttempt] = useState<ExamAttempt | null>(null);
    const [userId, setUserId] = useState<string | null>(null);
    const examAttempt = useExamAttempt();
    
    // Configuration state
    const [selectedTopicIds, setSelectedTopicIds] = useState<Set<string>>(new Set());
    const [questionCount, setQuestionCount] = useState<number>(20); // 10, 20, 50, 0 (all)
    const [isTimeLimitEnabled, setIsTimeLimitEnabled] = useState(false);
    const [timeLimitMinutes, setTimeLimitMinutes] = useState(30);
    const [feedbackMode, setFeedbackMode] = useState<'immediate' | 'end'>('immediate'); // Mode Tutor vs Exam

    useEffect(() => {
        const fetchData = async () => {
            if (!id) return;

            // Get user
            const { data: { user } } = await supabase.auth.getUser();
            if (user) {
                setUserId(user.id);
                // Check for pending attempts
                const pending = await examAttempt.checkPendingAttempt(user.id);
                setPendingAttempt(pending);
            }

            // Fetch Island details
            const { data: island } = await supabase
                .from('islands')
                .select('name')
                .eq('id', id)
                .single();
            
            if (island) setIslandName(island.name);

            // Fetch Topics
            const { data: topicsData } = await supabase
                .from('topics')
                .select('id, name, description')
                .eq('island_id', id)
                .order('name');

            if (topicsData) {
                setTopics(topicsData);
                // Select all by default
                setSelectedTopicIds(new Set(topicsData.map(t => t.id)));
            }

            setLoading(false);
        };

        fetchData();
    }, [id]);

    const toggleTopic = (topicId: string) => {
        const newSet = new Set(selectedTopicIds);
        if (newSet.has(topicId)) {
            newSet.delete(topicId);
        } else {
            newSet.add(topicId);
        }
        setSelectedTopicIds(newSet);
    };

    const toggleAllTopics = () => {
        if (selectedTopicIds.size === topics.length) {
            setSelectedTopicIds(new Set());
        } else {
            setSelectedTopicIds(new Set(topics.map(t => t.id)));
        }
    };

    const handleStartExam = async () => {
        if (selectedTopicIds.size === 0) {
            toast.warning('Por favor selecciona al menos un tema.');
            return;
        }

        if (!userId) return;

        // Check for pending attempt before starting
        const pending = await examAttempt.checkPendingAttempt(userId);
        if (pending) {
            setPendingAttempt(pending);
        } else {
            navigate(`/user/islands/${id}/take`, {
                state: {
                    config: {
                        topicIds: Array.from(selectedTopicIds),
                        questionCount: questionCount === 0 ? null : questionCount, // null means all
                        timeLimit: isTimeLimitEnabled ? timeLimitMinutes * 60 : null, // seconds
                        feedbackMode
                    }
                }
            });
        }
    };

    const handleContinueAttempt = () => {
        if (!pendingAttempt) return;
        navigate('/user/exam/session', { state: { attemptId: pendingAttempt.id } });
    };

    const handleStartNewAttempt = async () => {
        if (!pendingAttempt) return;
        await examAttempt.deletePendingAttempt(pendingAttempt.id);
        setPendingAttempt(null);
    };

    const handleCancelRecovery = () => {
        setPendingAttempt(null);
    };

    if (loading) {
        return (
            <UserLayout title="Cargando configuración...">
                <div className="flex justify-center items-center h-64">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
                </div>
            </UserLayout>
        );
    }

    return (
        <UserLayout title={`Configurar Examen: ${islandName}`}>
            <div className="max-w-4xl mx-auto space-y-6">
                
                {/* Intro Card */}
                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                    <div className="flex items-start gap-4">
                        <div className="p-3 bg-indigo-100 rounded-lg">
                            <Settings className="h-6 w-6 text-indigo-600" />
                        </div>
                        <div>
                            <h2 className="text-xl font-bold text-gray-900">Personaliza tu estudio</h2>
                            <p className="text-gray-600 mt-1">
                                Ajusta los parámetros del examen para enfocar tu aprendizaje donde más lo necesitas.
                            </p>
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {/* Left Column: Topics Selection */}
                    <div className="md:col-span-2 space-y-4">
                        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                            <div className="p-4 border-b border-gray-100 bg-gray-50 flex justify-between items-center">
                                <h3 className="font-semibold text-gray-900 flex items-center gap-2">
                                    <BookOpen size={18} className="text-gray-500" />
                                    Temas a Evaluar
                                </h3>
                                <button 
                                    onClick={toggleAllTopics}
                                    className="text-sm text-indigo-600 hover:text-indigo-800 font-medium"
                                >
                                    {selectedTopicIds.size === topics.length ? 'Deseleccionar todos' : 'Seleccionar todos'}
                                </button>
                            </div>
                            
                            <div className="p-2 max-h-[500px] overflow-y-auto">
                                {topics.length === 0 ? (
                                    <div className="p-8 text-center text-gray-500">
                                        No hay temas disponibles en esta isla.
                                    </div>
                                ) : (
                                    <div className="space-y-1">
                                        {topics.map(topic => (
                                            <div 
                                                key={topic.id}
                                                onClick={() => toggleTopic(topic.id)}
                                                className={`flex items-start p-3 rounded-lg cursor-pointer transition-colors ${
                                                    selectedTopicIds.has(topic.id) ? 'bg-indigo-50 border border-indigo-100' : 'hover:bg-gray-50 border border-transparent'
                                                }`}
                                            >
                                                <div className="mt-0.5 mr-3 flex-shrink-0 text-indigo-600">
                                                    {selectedTopicIds.has(topic.id) ? <CheckSquare size={20} /> : <Square size={20} className="text-gray-400" />}
                                                </div>
                                                <div>
                                                    <p className={`font-medium ${selectedTopicIds.has(topic.id) ? 'text-indigo-900' : 'text-gray-700'}`}>
                                                        {topic.name}
                                                    </p>
                                                    {topic.description && (
                                                        <p className="text-xs text-gray-500 mt-0.5 line-clamp-1">{topic.description}</p>
                                                    )}
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                            <div className="p-3 bg-gray-50 border-t border-gray-100 text-xs text-center text-gray-500">
                                {selectedTopicIds.size} temas seleccionados
                            </div>
                        </div>
                    </div>

                    {/* Right Column: Exam Settings */}
                    <div className="space-y-4">
                        {/* Questions Count */}
                        <div className="bg-white p-5 rounded-xl shadow-sm border border-gray-100">
                            <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
                                <HelpCircle size={18} className="text-gray-500" />
                                Cantidad de Preguntas
                            </h3>
                            <div className="space-y-2">
                                {[10, 20, 50, 100].map(num => (
                                    <label key={num} className="flex items-center p-2 rounded hover:bg-gray-50 cursor-pointer">
                                        <input 
                                            type="radio" 
                                            name="qCount"
                                            checked={questionCount === num}
                                            onChange={() => setQuestionCount(num)}
                                            className="text-indigo-600 focus:ring-indigo-500 h-4 w-4"
                                        />
                                        <span className="ml-2 text-gray-700">{num} Preguntas</span>
                                    </label>
                                ))}
                                <label className="flex items-center p-2 rounded hover:bg-gray-50 cursor-pointer">
                                    <input 
                                        type="radio" 
                                        name="qCount"
                                        checked={questionCount === 0}
                                        onChange={() => setQuestionCount(0)}
                                        className="text-indigo-600 focus:ring-indigo-500 h-4 w-4"
                                    />
                                    <span className="ml-2 text-gray-700">Todas las disponibles</span>
                                </label>
                            </div>
                        </div>

                        {/* Time Limit */}
                        <div className="bg-white p-5 rounded-xl shadow-sm border border-gray-100">
                            <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
                                <Clock size={18} className="text-gray-500" />
                                Control de Tiempo
                            </h3>
                            
                            <div className="flex items-center justify-between mb-4">
                                <span className="text-sm text-gray-700">Límite de Tiempo</span>
                                <button 
                                    onClick={() => setIsTimeLimitEnabled(!isTimeLimitEnabled)}
                                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                                        isTimeLimitEnabled ? 'bg-indigo-600' : 'bg-gray-200'
                                    }`}
                                >
                                    <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                                        isTimeLimitEnabled ? 'translate-x-6' : 'translate-x-1'
                                    }`} />
                                </button>
                            </div>

                            {isTimeLimitEnabled && (
                                <div>
                                    <label className="text-xs text-gray-500 mb-1 block">Minutos</label>
                                    <input 
                                        type="number" 
                                        value={timeLimitMinutes}
                                        onChange={(e) => setTimeLimitMinutes(Number(e.target.value))}
                                        className="w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                                        min="5"
                                        max="180"
                                    />
                                </div>
                            )}
                        </div>

                        {/* Mode */}
                        <div className="bg-white p-5 rounded-xl shadow-sm border border-gray-100">
                            <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
                                <Settings size={18} className="text-gray-500" />
                                Modo de Examen
                            </h3>
                            <div className="flex gap-2 p-1 bg-gray-100 rounded-lg">
                                <button
                                    onClick={() => setFeedbackMode('immediate')}
                                    className={`flex-1 py-1.5 text-sm font-medium rounded-md transition-all ${
                                        feedbackMode === 'immediate' 
                                            ? 'bg-white text-indigo-600 shadow-sm' 
                                            : 'text-gray-500 hover:text-gray-700'
                                    }`}
                                >
                                    Tutor
                                </button>
                                <button
                                    onClick={() => setFeedbackMode('end')}
                                    className={`flex-1 py-1.5 text-sm font-medium rounded-md transition-all ${
                                        feedbackMode === 'end' 
                                            ? 'bg-white text-indigo-600 shadow-sm' 
                                            : 'text-gray-500 hover:text-gray-700'
                                    }`}
                                >
                                    Examen
                                </button>
                            </div>
                            <p className="text-xs text-gray-500 mt-2">
                                {feedbackMode === 'immediate' 
                                    ? 'Verás la respuesta correcta y la explicación inmediatamente después de responder.'
                                    : 'Verás tus resultados y retroalimentación al finalizar el examen completo.'}
                            </p>
                        </div>
                    </div>
                </div>

                {/* Footer Action */}
                <div className="flex justify-end pt-4">
                    <button
                        onClick={handleStartExam}
                        disabled={selectedTopicIds.size === 0}
                        className={`
                            flex items-center px-8 py-4 rounded-xl text-white font-bold text-lg shadow-lg hover:shadow-xl transition-all transform hover:-translate-y-1
                            ${selectedTopicIds.size === 0 ? 'bg-gray-400 cursor-not-allowed' : 'bg-gradient-to-r from-indigo-600 to-purple-600'}
                        `}
                    >
                        Comenzar Examen <Play className="ml-2" fill="currentColor" />
                    </button>
                </div>

                {/* Recovery Dialog */}
                {pendingAttempt && (
                    <ExamRecoveryDialog
                        attempt={pendingAttempt}
                        onContinue={handleContinueAttempt}
                        onStartNew={handleStartNewAttempt}
                        onCancel={handleCancelRecovery}
                    />
                )}

            </div>
        </UserLayout>
    );
};
