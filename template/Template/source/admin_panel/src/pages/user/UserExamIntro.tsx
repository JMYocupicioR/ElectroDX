import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { supabase } from '../../lib/supabase';
import { UserLayout } from '../../layouts/UserLayout';
import { useIslands } from '../../hooks/useIslands';
import { FileText, Layers, Play, Clock, AlertTriangle, CheckCircle } from 'lucide-react';
import { useExamAttempt, ExamAttempt } from '../../hooks/useExamAttempt';
import { ExamRecoveryDialog } from '../../components/ExamRecoveryDialog';

export const UserExamIntro = () => {
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const assignedId = searchParams.get('assigned_id');
    const { islands } = useIslands();
    const [selectedIsland, setSelectedIsland] = useState<string>('');
    const [loading, setLoading] = useState(true);
    const [pendingAttempt, setPendingAttempt] = useState<ExamAttempt | null>(null);
    const [userId, setUserId] = useState<string | null>(null);
    const [assignedExam, setAssignedExam] = useState<any | null>(null);
    const examAttempt = useExamAttempt();

    useEffect(() => {
        const initialize = async () => {
            const { data: { user } } = await supabase.auth.getUser();
            if (user) {
                setUserId(user.id);
                const pending = await examAttempt.checkPendingAttempt(user.id);
                setPendingAttempt(pending);
            }

            // Check for assigned exam
            if (assignedId && user) {
                const { data: assignedData } = await supabase
                    .from('assigned_exams')
                    .select('*')
                    .eq('id', assignedId)
                    .eq('student_id', user.id)
                    .single();
                if (assignedData) {
                    setAssignedExam(assignedData);
                }
            }

            setLoading(false);
        };
        initialize();
    }, []);

    const startFullSimulation = async () => {
        if (!userId) return;
        
        // Check for pending attempt before starting
        const pending = await examAttempt.checkPendingAttempt(userId);
        if (pending) {
            setPendingAttempt(pending);
        } else {
            navigate('/user/exam/session?mode=FULL_SIMULATION');
        }
    };

    const startIslandExam = async () => {
        if (!selectedIsland || !userId) return;
        
        // Check for pending attempt before starting
        const pending = await examAttempt.checkPendingAttempt(userId);
        if (pending) {
            setPendingAttempt(pending);
        } else {
            navigate(`/user/exam/session?mode=ISLAND_SPECIFIC&island_id=${selectedIsland}`);
        }
    };

    const startAssignedExam = async () => {
        if (!assignedId || !userId) return;
        
        // Mark as strictly in progress in DB if not already
        if (assignedExam?.status === 'PENDING') {
            await supabase.from('assigned_exams').update({ status: 'IN_PROGRESS' }).eq('id', assignedId);
        }

        const pending = await examAttempt.checkPendingAttempt(userId);
        if (pending) {
            setPendingAttempt(pending);
        } else {
            navigate(`/user/exam/session?mode=CUSTOM&assigned_id=${assignedId}`);
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

    if (loading) return <UserLayout title="Cargando..."><div className="p-8 text-center">Cargando opciones...</div></UserLayout>;

    return (
        <UserLayout title="Centro de Exámenes">
            <div className="max-w-4xl mx-auto space-y-8">
                
                {/* Header Banner */}
                <div className="bg-gradient-to-r from-blue-700 to-indigo-800 rounded-xl p-8 text-white shadow-xl">
                    <h2 className="text-3xl font-bold mb-3 flex items-center">
                        <FileText className="mr-3 h-8 w-8" /> Simulador de Examen Profesional
                    </h2>
                    <p className="text-blue-100 text-lg opacity-90 max-w-2xl">
                        Pon a prueba tus conocimientos en un entorno realista. Sin retroalimentación inmediata, con límite de tiempo y resultados detallados al final.
                    </p>
                    <div className="flex gap-4 mt-6 text-sm font-medium">
                        <div className="flex items-center bg-white/10 px-3 py-1 rounded-full"><Clock size={16} className="mr-2"/> Tiempo Limitado</div>
                        <div className="flex items-center bg-white/10 px-3 py-1 rounded-full"><AlertTriangle size={16} className="mr-2"/> Sin Ayudas</div>
                    </div>
                </div>

                {assignedExam ? (
                    <div className="bg-white rounded-xl shadow-lg border-2 border-red-500 overflow-hidden">
                        <div className="p-8">
                            <div className="flex items-center space-x-3 mb-6">
                                <span className="bg-red-100 text-red-600 p-2 rounded-lg">🔔</span>
                                <h3 className="text-2xl font-bold text-gray-900">Examen Asignado: {assignedExam.title}</h3>
                            </div>
                            
                            {assignedExam.description && (
                                <p className="text-gray-600 mb-6 text-lg bg-gray-50 p-4 rounded-lg border border-gray-100 italic">
                                    "{assignedExam.description}"
                                </p>
                            )}
                            
                            <ul className="text-sm text-gray-600 bg-red-50 p-4 rounded-lg space-y-3 mb-8 border border-red-100">
                                <li className="flex items-center">
                                    <CheckCircle className="text-red-500 mr-2" size={18}/> 
                                    Este es un examen obligatorio asignado por tu profesor.
                                </li>
                                <li className="flex items-center">
                                    <Layers className="text-red-500 mr-2" size={18}/> 
                                    Cubrirá temas específicos seleccionados para ti.
                                </li>
                                <li className="flex items-center">
                                    <Clock className="text-red-500 mr-2" size={18}/> 
                                    Los resultados se enviarán automáticamente al administrador al finalizar.
                                </li>
                            </ul>
                            
                            <button 
                                onClick={startAssignedExam}
                                className="w-full py-4 bg-red-600 text-white rounded-xl font-bold text-lg hover:bg-red-700 transition-colors flex justify-center items-center shadow-md hover:shadow-lg"
                            >
                                <Play size={20} className="mr-2" /> 
                                {assignedExam.status === 'IN_PROGRESS' ? 'Retomar Examen Asignado' : 'Comenzar Examen Asignado'}
                            </button>
                        </div>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        {/* Full Simulation Card */}
                        <div className="bg-white rounded-xl shadow-lg border border-gray-100 overflow-hidden hover:shadow-xl transition-shadow group">
                            <div className="p-6">
                                <div className="h-12 w-12 bg-blue-100 rounded-lg flex items-center justify-center mb-4 group-hover:bg-blue-600 transition-colors">
                                    <Layers className="text-blue-600 h-6 w-6 group-hover:text-white" />
                                </div>
                                <h3 className="text-xl font-bold text-gray-900 mb-2">Simulacro Completo</h3>
                                <p className="text-gray-600 mb-6 text-sm">
                                    100 preguntas aleatorias de todas las islas. Simula las condiciones reales del examen de consejo.
                                </p>
                                <ul className="text-sm text-gray-500 space-y-2 mb-6">
                                    <li className="flex items-center">✅ Todas las áreas incluidas</li>
                                    <li className="flex items-center">✅ Mezcla de dificultad aleatoria</li>
                                    <li className="flex items-center">✅ Análisis global de desempeño</li>
                                </ul>
                                <button 
                                    onClick={startFullSimulation}
                                    className="w-full py-3 bg-blue-600 text-white rounded-lg font-bold hover:bg-blue-700 transition-colors flex justify-center items-center"
                                >
                                    <Play size={18} className="mr-2" /> Iniciar Simulacro (100 Preguntas)
                                </button>
                            </div>
                        </div>

                        {/* Island Specific Card */}
                        <div className="bg-white rounded-xl shadow-lg border border-gray-100 overflow-hidden hover:shadow-xl transition-shadow group">
                            <div className="p-6">
                                <div className="h-12 w-12 bg-purple-100 rounded-lg flex items-center justify-center mb-4 group-hover:bg-purple-600 transition-colors">
                                    <FileText className="text-purple-600 h-6 w-6 group-hover:text-white" />
                                </div>
                                <h3 className="text-xl font-bold text-gray-900 mb-2">Examen por Isla</h3>
                                <p className="text-gray-600 mb-6 text-sm">
                                    Enfócate en una sola área. Ideal para validar tu dominio sobre un tema específico antes de avanzar.
                                </p>
                                
                                <div className="mb-6">
                                    <label className="block text-sm font-medium text-gray-700 mb-2">Selecciona un Área:</label>
                                    <select 
                                        value={selectedIsland}
                                        onChange={(e) => setSelectedIsland(e.target.value)}
                                        className="w-full border-gray-300 rounded-lg shadow-sm focus:border-purple-500 focus:ring-purple-500"
                                    >
                                        <option value="">-- Elige una Isla --</option>
                                        {islands.map(i => (
                                            <option key={i.id} value={i.id}>{i.name}</option>
                                        ))}
                                    </select>
                                </div>

                                <button 
                                    onClick={startIslandExam}
                                    disabled={!selectedIsland}
                                    className="w-full py-3 bg-purple-600 text-white rounded-lg font-bold hover:bg-purple-700 transition-colors flex justify-center items-center disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    <Play size={18} className="mr-2" /> Iniciar Examen de Área
                                </button>
                            </div>
                        </div>
                    </div>
                )}

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
