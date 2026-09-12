import { useEffect, useState } from 'react';
import { toast } from 'sonner';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../../lib/supabase';
import { UserLayout } from '../../layouts/UserLayout';
import { Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid, LineChart, Line } from 'recharts';
import { TrendingDown, Target, History, BookOpen, Clock, Award, Activity, Trash2 } from 'lucide-react';
import { ConfirmDialog, useConfirmDialog } from '../../components/ui/ConfirmDialog';

interface MasteryData {
    island: string;
    score: number;
}

interface TopicGap {
    topic: string;
    score: number;
    island: string;
}

export const UserAnalytics = () => {
    const navigate = useNavigate();
    const [masteryData, setMasteryData] = useState<MasteryData[]>([]);
    const [topicGaps, setTopicGaps] = useState<TopicGap[]>([]);
    const [loading, setLoading] = useState(true);
    const { confirm, dialogProps } = useConfirmDialog();

    const [examHistory, setExamHistory] = useState<any[]>([]);
    const [stats, setStats] = useState({
        totalExams: 0,
        averageScore: 0,
        totalQuestions: 0,
        totalTimeMinutes: 0
    });
    const [trendData, setTrendData] = useState<any[]>([]);

        const fetchData = async () => {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) return;

            const { data, error } = await supabase.rpc('get_user_analytics', { p_user_id: user.id });

            if (error) {
                console.error('Error fetching analytics:', error);
                setLoading(false);
                return;
            }

            if (data) {
                setMasteryData(data.mastery_radar || []);
                setTopicGaps(data.topic_gaps || []);
                setStats(data.stats || { totalExams: 0, averageScore: 0, totalQuestions: 0, totalTimeMinutes: 0 });
                setTrendData(data.trend_data || []);
                setExamHistory(data.exam_history || []);
            }

            setLoading(false);
        };

    useEffect(() => {
        fetchData();
    }, []);

    const handleDelete = async (id: string, status: string) => {
        const ok = await confirm({
            title: '¿Eliminar examen?',
            description: 'Esta acción no se puede deshacer.',
        });
        if (!ok) return;

        try {
            if (status === 'IN_PROGRESS') {
                const { error } = await supabase
                    .from('exam_attempts')
                    .delete()
                    .eq('id', id);
                if (error) throw error;
            } else {
                // Manually delete related answers first
                const { error: answersError } = await supabase
                    .from('exam_answers')
                    .delete()
                    .eq('session_id', id);
                
                if (answersError) console.warn('Error deleting answers:', answersError);

                // Delete the session and verify it actually happened
                const { data, error } = await supabase
                    .from('exam_sessions')
                    .delete()
                    .eq('id', id)
                    .select(); // Select returned rows to verify deletion
                
                if (error) throw error;
                
                // If RLS blocks deletion, no error is thrown but data is empty
                if (!data || data.length === 0) {
                    throw new Error('No se pudo eliminar. Es posible que falten permisos (RLS) en la base de datos.');
                }
            }

            // Update local state to remove the deleted item
            setExamHistory(prev => prev.filter(exam => exam.id !== id));
            
        } catch (error: any) {
            console.error('Error deleting exam:', error);
            toast.error('Error al eliminar el examen: ' + error.message);
            // Reload to show true state if local update was optimistic
            fetchData();
        }
    };

    if (loading) {
        return (
            <UserLayout title="Mis Analíticas">
                <div className="flex items-center justify-center h-64">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
                </div>
            </UserLayout>
        );
    }

    return (
        <UserLayout title="Mis Analíticas">
            <div className="space-y-8">
                {/* KPI Cards */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    <div className="bg-white p-6 rounded-xl shadow border border-gray-100 flex items-center">
                        <div className="p-3 rounded-full bg-blue-100 text-blue-600 mr-4">
                            <BookOpen size={24} />
                        </div>
                        <div>
                            <p className="text-sm text-gray-500 font-medium">Exámenes</p>
                            <p className="text-2xl font-bold text-gray-900">{stats.totalExams}</p>
                        </div>
                    </div>
                    <div className="bg-white p-6 rounded-xl shadow border border-gray-100 flex items-center">
                        <div className="p-3 rounded-full bg-green-100 text-green-600 mr-4">
                            <Award size={24} />
                        </div>
                        <div>
                            <p className="text-sm text-gray-500 font-medium">Promedio</p>
                            <p className="text-2xl font-bold text-gray-900">{stats.averageScore}%</p>
                        </div>
                    </div>
                    <div className="bg-white p-6 rounded-xl shadow border border-gray-100 flex items-center">
                        <div className="p-3 rounded-full bg-purple-100 text-purple-600 mr-4">
                            <Activity size={24} />
                        </div>
                        <div>
                            <p className="text-sm text-gray-500 font-medium">Preguntas</p>
                            <p className="text-2xl font-bold text-gray-900">{stats.totalQuestions}</p>
                        </div>
                    </div>
                    <div className="bg-white p-6 rounded-xl shadow border border-gray-100 flex items-center">
                        <div className="p-3 rounded-full bg-orange-100 text-orange-600 mr-4">
                            <Clock size={24} />
                        </div>
                        <div>
                            <p className="text-sm text-gray-500 font-medium">Tiempo Estudio</p>
                            <p className="text-2xl font-bold text-gray-900">{Math.floor(stats.totalTimeMinutes / 60)}h {stats.totalTimeMinutes % 60}m</p>
                        </div>
                    </div>
                </div>

                {/* Charts Row */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    {/* Mastery Radar */}
                    <div className="bg-white rounded-xl p-6 shadow-lg">
                    <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center">
                        <Target className="mr-2 text-indigo-600" />
                        Dominio por Isla
                    </h3>
                    {masteryData.length > 0 ? (
                        <ResponsiveContainer width="100%" height={400}>
                            <RadarChart data={masteryData}>
                                <PolarGrid stroke="#e0e7ff" />
                                <PolarAngleAxis dataKey="island" tick={{ fill: '#4b5563', fontSize: 12 }} />
                                <PolarRadiusAxis angle={90} domain={[0, 100]} tick={{ fill: '#6b7280' }} />
                                <Radar
                                    name="Dominio"
                                    dataKey="score"
                                    stroke="#6366f1"
                                    fill="#6366f1"
                                    fillOpacity={0.6}
                                />
                                <Tooltip
                                    contentStyle={{
                                        backgroundColor: '#fff',
                                        border: '1px solid #e5e7eb',
                                        borderRadius: '8px',
                                    }}
                                />
                            </RadarChart>
                        </ResponsiveContainer>
                        ) : (
                            <div className="text-center py-12 text-gray-500">
                                <p>Aún no hay datos suficientes. ¡Comienza a responder preguntas!</p>
                            </div>
                        )}
                    </div>

                    {/* Progress Trend */}
                    <div className="bg-white rounded-xl p-6 shadow-lg">
                        <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center">
                            <Activity className="mr-2 text-green-600" />
                            Tendencia de Progreso
                        </h3>
                        {trendData.length > 0 ? (
                            <ResponsiveContainer width="100%" height={400}>
                                <LineChart data={trendData}>
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f3f4f6" />
                                    <XAxis dataKey="date" tick={{ fontSize: 12, fill: '#6b7280' }} />
                                    <YAxis domain={[0, 100]} tick={{ fontSize: 12, fill: '#6b7280' }} />
                                    <Tooltip 
                                        contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                                    />
                                    <Line 
                                        type="monotone" 
                                        dataKey="score" 
                                        stroke="#10b981" 
                                        strokeWidth={3}
                                        dot={{ fill: '#10b981', r: 4 }}
                                        activeDot={{ r: 6 }}
                                    />
                                </LineChart>
                            </ResponsiveContainer>
                        ) : (
                            <div className="flex flex-col items-center justify-center h-64 text-gray-500">
                                <Activity className="mb-2 opacity-20" size={48} />
                                <p>Completa más exámenes para ver tu tendencia.</p>
                            </div>
                        )}
                    </div>
                </div>

                {/* Topic Gaps */}
                <div className="bg-white rounded-xl p-6 shadow-lg">
                    <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center">
                        <TrendingDown className="mr-2 text-red-600" />
                        Áreas de Oportunidad (Temas más débiles)
                    </h3>
                    {topicGaps.length > 0 ? (
                        <>
                            <ResponsiveContainer width="100%" height={300}>
                                <BarChart data={topicGaps} layout="vertical" margin={{ left: 100 }}>
                                    <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" />
                                    <XAxis type="number" domain={[0, 100]} />
                                    <YAxis dataKey="topic" type="category" tick={{ fontSize: 12 }} />
                                    <Tooltip
                                        contentStyle={{
                                            backgroundColor: '#fff',
                                            border: '1px solid #e5e7eb',
                                            borderRadius: '8px',
                                        }}
                                    />
                                    <Bar dataKey="score" fill="#ef4444" radius={[0, 8, 8, 0]} />
                                </BarChart>
                            </ResponsiveContainer>
                            <div className="mt-6 bg-blue-50 border-l-4 border-blue-500 p-4 rounded">
                                <p className="text-sm font-semibold text-blue-900 mb-2">💡 Recomendación</p>
                                <p className="text-sm text-blue-800">
                                    Enfócate en estudiar los temas mostrados arriba. Repasa los casos clínicos relacionados
                                    y presta atención a las "Perlas del Consejo" para mejorar tu dominio.
                                </p>
                            </div>
                        </>
                    ) : (
                        <div className="text-center py-12 text-gray-500">
                            <p>Aún no hay suficientes datos de tema. ¡Sigue practicando!</p>
                        </div>
                    )}
                </div>

                {/* Exam History Table */}
                <div className="bg-white rounded-xl shadow-lg border border-gray-100 overflow-hidden">
                    <div className="p-6 border-b border-gray-100">
                        <h3 className="text-xl font-bold text-gray-900 flex items-center">
                            <History className="mr-2 text-indigo-600" />
                            Historial de Exámenes
                        </h3>
                    </div>
                    <div className="overflow-x-auto">
                        <table className="w-full text-left">
                            <thead className="bg-gray-50 text-gray-500 font-medium text-sm uppercase tracking-wider">
                                <tr>
                                    <th className="px-6 py-3">Fecha</th>
                                    <th className="px-6 py-3">Tipo</th>
                                    <th className="px-6 py-3">Duración</th>
                                    <th className="px-6 py-3">Puntaje</th>
                                    <th className="px-6 py-3 text-right">Acciones</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                                {examHistory.length > 0 ? (
                                    examHistory.map((exam) => (
                                        <tr key={exam.id} className="hover:bg-gray-50 transition-colors">
                                            <td className="px-6 py-4 text-gray-900">{exam.date}</td>
                                            <td className="px-6 py-4 text-gray-700">
                                                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                                                    exam.type === 'Simulacro Completo' 
                                                        ? 'bg-purple-100 text-purple-800' 
                                                        : 'bg-blue-100 text-blue-800'
                                                }`}>
                                                    {exam.type}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 text-gray-600 text-sm">
                                                {exam.duration}
                                            </td>
                                            <td className="px-6 py-4">
                                                <span className={`font-bold ${
                                                    exam.status === 'IN_PROGRESS' ? 'text-blue-600 italic' :
                                                    (typeof exam.score === 'string' && exam.score.includes('%') ? (
                                                        parseInt(exam.score) >= 80 ? 'text-green-600' :
                                                        parseInt(exam.score) >= 60 ? 'text-yellow-600' : 'text-red-600'
                                                    ) : 'text-gray-600')
                                                }`}>
                                                    {exam.score}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 text-right">
                                                {exam.status === 'IN_PROGRESS' ? (
                                                     <button 
                                                        onClick={() => {
                                                            const targetPath = exam.mode === 'FULL_SIMULATION'
                                                                ? '/user/exam/session'
                                                                : `/user/island/${exam.islandId}/quiz`;
                                                            
                                                            navigate(targetPath, { state: { attemptId: exam.id } });
                                                        }}
                                                        className="text-blue-600 hover:text-blue-800 font-bold text-sm hover:underline mr-4"
                                                     >
                                                        Continuar
                                                     </button>
                                                ) : (
                                                    <a 
                                                        href={`/user/exam/results/${exam.id}`} 
                                                        className="text-indigo-600 hover:text-indigo-800 font-medium text-sm hover:underline mr-4"
                                                    >
                                                        Ver Detalles
                                                    </a>
                                                )}
                                                <button
                                                    onClick={() => handleDelete(exam.id, exam.status)}
                                                    className="text-red-500 hover:text-red-700 p-1 rounded hover:bg-red-50 transition-colors"
                                                    title="Eliminar examen"
                                                >
                                                    <Trash2 size={18} />
                                                </button>
                                            </td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan={5} className="px-6 py-8 text-center text-gray-500">
                                            No has realizado ningún examen aún.
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* Study Tips */}
                <div className="bg-gradient-to-r from-purple-50 to-indigo-50 rounded-xl p-6 border border-purple-200">
                    <h3 className="text-lg font-bold text-purple-900 mb-3">📚 Consejos de Estudio</h3>
                    <ul className="space-y-2 text-sm text-purple-800">
                        <li className="flex items-start">
                            <span className="mr-2">•</span>
                            <span>Intenta responder al menos 10 preguntas por día para mejorar tu retención.</span>
                        </li>
                        <li className="flex items-start">
                            <span className="mr-2">•</span>
                            <span>Lee cuidadosamente las "Perlas del Consejo" después de cada pregunta.</span>
                        </li>
                        <li className="flex items-start">
                            <span className="mr-2">•</span>
                            <span>Revisa los temas donde tu puntaje es menor al 60%.</span>
                        </li>
                        <li className="flex items-start">
                            <span className="mr-2">•</span>
                            <span>Presta especial atención a las preguntas marcadas como "Críticas".</span>
                        </li>
                    </ul>
                </div>
            </div>
            <ConfirmDialog {...dialogProps} />
        </UserLayout>
    );
};
