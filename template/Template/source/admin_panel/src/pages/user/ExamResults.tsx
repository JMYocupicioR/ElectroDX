import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { supabase } from '../../lib/supabase';
import { UserLayout } from '../../layouts/UserLayout';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip as ReTooltip, BarChart, Bar, XAxis, YAxis, CartesianGrid } from 'recharts';
import { CheckCircle, XCircle, Home, RotateCcw } from 'lucide-react';

export const ExamResults = () => {
    const { sessionId } = useParams<{ sessionId: string }>();
    const [session, setSession] = useState<any>(null);
    const [answers, setAnswers] = useState<any[]>([]);
    const [breakdown, setBreakdown] = useState<any>({ islandScores: [], topicScores: [] });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchResults = async () => {
            if (!sessionId) return;
            
            // 1. Get Session Details
            const { data: sessionData, error: sessionError } = await supabase
                .from('exam_sessions')
                .select('*, island:islands(name)')
                .eq('id', sessionId)
                .single();

            if (sessionError) {
                console.error("Error fetching session", sessionError);
                return;
            }
            setSession(sessionData);

            // 2. Get Answers Details
            const { data: answersData, error: answersError } = await supabase
                .from('exam_answers')
                .select(`
                    *,
                    question:questions(content, pearl),
                    topic:topics(name, island:islands(name))
                `)
                .eq('session_id', sessionId);

            if (answersError) {
                console.error("Error fetching answers", answersError);
            } else {
                setAnswers(answersData || []);
                calculateBreakdown(answersData || []);
            }
            setLoading(false);
        };

        fetchResults();
    }, [sessionId]);

    const calculateBreakdown = (answersData: any[]) => {
        // Group by Island
        const islandMap: Record<string, { total: number, correct: number, name: string }> = {};
        const topicMap: Record<string, { total: number, correct: number, name: string }> = {};

        answersData.forEach(ans => {
            // Island Stats
            const islandName = ans.topic?.island?.name || 'Varios';
            if (!islandMap[islandName]) islandMap[islandName] = { total: 0, correct: 0, name: islandName };
            islandMap[islandName].total++;
            if (ans.is_correct) islandMap[islandName].correct++;

            // Topic Stats
            const topicName = ans.topic?.name || 'Varios';
            if (!topicMap[topicName]) topicMap[topicName] = { total: 0, correct: 0, name: topicName };
            topicMap[topicName].total++;
            if (ans.is_correct) topicMap[topicName].correct++;
        });

        const islandScores = Object.values(islandMap).map(i => ({
            name: i.name,
            score: Math.round((i.correct / i.total) * 100)
        }));

        const topicScores = Object.values(topicMap).map(t => ({
            name: t.name,
            score: Math.round((t.correct / t.total) * 100),
            count: t.total
        })).sort((a, b) => a.score - b.score); // Ascending for "weakest areas"

        setBreakdown({ islandScores, topicScores });
    };

    if (loading) return <UserLayout title="Resultados"><div className="p-8 text-center">Calculando resultados...</div></UserLayout>;
    if (!session) return <UserLayout title="Error"><div className="p-8 text-center">No se encontró la sesión.</div></UserLayout>;

    const scoreColor = session.score_percentage >= 80 ? 'text-green-600' : session.score_percentage >= 60 ? 'text-yellow-600' : 'text-red-600';
    const pieData = [
        { name: 'Correctas', value: session.correct_answers, color: '#16a34a' },
        { name: 'Incorrectas', value: session.total_questions - session.correct_answers, color: '#ef4444' }
    ];

    return (
        <UserLayout title="Resultados del Examen">
            <div className="max-w-5xl mx-auto space-y-8">
                
                {/* Score Header */}
                <div className="bg-white rounded-xl shadow-lg border border-gray-100 overflow-hidden">
                    <div className="p-4 md:p-8 text-center">
                        <h2 className="text-gray-500 font-medium uppercase tracking-wide mb-2 text-sm md:text-base">Tu Calificación</h2>
                        <div className={`text-5xl md:text-6xl font-bold mb-3 md:mb-4 ${scoreColor}`}>
                            {session.score_percentage}%
                        </div>
                        <p className="text-gray-600 mb-6 text-sm md:text-base">
                            Respondiste correctamente <span className="font-bold">{session.correct_answers}</span> de <span className="font-bold">{session.total_questions}</span> preguntas.
                        </p>
                        
                        
                        <div className="h-48 md:h-64 w-full flex justify-center items-center mb-6">
                            <ResponsiveContainer width="100%" height="100%">
                                <PieChart>
                                    <Pie
                                        data={pieData}
                                        cx="50%"
                                        cy="50%"
                                        innerRadius={60}
                                        outerRadius={80}
                                        paddingAngle={5}
                                        dataKey="value"
                                    >
                                        {pieData.map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={entry.color} />
                                        ))}
                                    </Pie>
                                    <ReTooltip />
                                </PieChart>
                            </ResponsiveContainer>
                        </div>

                        <div className="flex flex-col md:flex-row justify-center gap-3 md:gap-4">
                            <Link 
                                to="/user/dashboard" 
                                className="flex items-center justify-center px-6 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
                            >
                                <Home size={18} className="mr-2" /> Ir al Inicio
                            </Link>
                            <Link 
                                to="/user/exam" 
                                className="flex items-center justify-center px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                            >
                                <RotateCcw size={18} className="mr-2" /> Nuevo Examen
                            </Link>
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    {/* Breakdown by Island */}
                    <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-6 flex flex-col">
                        <h3 className="text-lg font-bold text-gray-900 mb-4">Desempeño por Área</h3>
                        {breakdown.islandScores.length > 0 ? (
                            <div className="flex-1 min-h-[300px]">
                                <ResponsiveContainer width="100%" height="100%">
                                    <BarChart data={breakdown.islandScores} layout="vertical" margin={{ left: 40, top: 5, right: 30, bottom: 5 }}>
                                        <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#f3f4f6" />
                                        <XAxis type="number" domain={[0, 100]} />
                                        <YAxis dataKey="name" type="category" width={120} tick={{fontSize: 12, fill: '#4b5563'}} />
                                        <ReTooltip cursor={{fill: 'transparent'}} contentStyle={{ borderRadius: '8px', border: '1px solid #e5e7eb' }} />
                                        <Bar dataKey="score" fill="#4f46e5" radius={[0, 4, 4, 0]} name="Puntaje %" />
                                    </BarChart>
                                </ResponsiveContainer>
                            </div>
                        ) : (
                            <p className="text-gray-500 text-sm">No hay datos suficientes para desgloce.</p>
                        )}
                    </div>

                    {/* Breakdown by Topic (Weakest) */}
                    <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-6">
                        <h3 className="text-lg font-bold text-gray-900 mb-4">Áreas de Oportunidad (Temas)</h3>
                        <p className="text-xs text-gray-500 mb-4">Temas con menor puntaje en este examen.</p>
                        <div className="space-y-3">
                            {breakdown.topicScores.slice(0, 5).map((t: any, idx: number) => (
                                <div key={idx} className="flex justify-between items-center p-3 bg-red-50 rounded-lg border border-red-100">
                                    <div>
                                        <p className="font-medium text-gray-900 text-sm">{t.name}</p>
                                        <p className="text-xs text-gray-500">{t.count} preguntas</p>
                                    </div>
                                    <div className="font-bold text-red-600">{t.score}%</div>
                                </div>
                            ))}
                            {breakdown.topicScores.length === 0 && <p className="text-gray-500 text-sm">Sin datos.</p>}
                        </div>
                    </div>
                </div>

                {/* Answer Review List */}
                <div className="bg-white rounded-xl shadow-lg border border-gray-100 overflow-hidden">
                    <div className="p-6 border-b border-gray-100">
                        <h3 className="text-lg font-bold text-gray-900">Revisión de Respuestas</h3>
                    </div>
                    <div className="divide-y divide-gray-100 max-h-[800px] overflow-y-auto">
                        {answers.map((ans, idx) => {
                            const options = ans.question?.content?.options || [];
                            const selectedOption = options[ans.selected_option_index] || { text: 'Opción no encontrada' };
                            const correctOption = options.find((o: any) => o.is_correct) || { text: 'Respuesta correcta no encontrada' };

                            return (
                                <div key={idx} className={`p-6 transition-colors ${ans.is_correct ? 'hover:bg-gray-50' : 'bg-red-50/20 hover:bg-red-50/40'}`}>
                                    <div className="flex gap-4">
                                        <div className="flex-shrink-0 mt-1">
                                            {ans.is_correct ? (
                                                <CheckCircle className="text-green-500" size={24} />
                                            ) : (
                                                <XCircle className="text-red-500" size={24} />
                                            )}
                                        </div>
                                        <div className="flex-1">
                                            {/* Topic Breadcrumb */}
                                            <div className="mb-2 text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                {ans.topic?.island?.name || 'General'} &bull; {ans.topic?.name || 'Tema'}
                                            </div>

                                            {/* Question Image */}
                                            {ans.question?.content?.image_url && (
                                                <div className="mb-4">
                                                    <img 
                                                        src={ans.question.content.image_url} 
                                                        alt="Caso Clínico" 
                                                        className="max-h-48 rounded-lg border border-gray-200 object-contain bg-white p-1"
                                                    />
                                                </div>
                                            )}

                                            {/* Stem */}
                                            <h4 className="text-gray-900 text-base md:text-lg font-semibold mb-4 leading-relaxed whitespace-pre-wrap">
                                                {ans.question?.content?.stem || 'Pregunta no disponible'}
                                            </h4>

                                            {/* Answers */}
                                            <div className="space-y-3 mb-4">
                                                <div className={`p-4 rounded-lg border ${ans.is_correct ? 'bg-green-50 border-green-200 text-green-900' : 'bg-red-50 border-red-200 text-red-900'}`}>
                                                    <div className="text-xs font-bold uppercase tracking-wider mb-1 opacity-70">
                                                        Tu respuesta
                                                    </div>
                                                    <div className="text-sm md:text-base font-medium">
                                                        {selectedOption.text}
                                                    </div>
                                                    {selectedOption.feedback_clinical && (
                                                        <div className="mt-3 text-sm opacity-90 border-t border-current pt-3">
                                                            <span className="font-semibold block mb-1">Justificación:</span> 
                                                            {selectedOption.feedback_clinical}
                                                        </div>
                                                    )}
                                                </div>

                                                {!ans.is_correct && (
                                                    <div className="p-4 rounded-lg border bg-gray-50 border-gray-200 text-gray-800">
                                                        <div className="text-xs font-bold uppercase tracking-wider text-green-600 mb-1">
                                                            Respuesta correcta
                                                        </div>
                                                        <div className="text-sm md:text-base font-medium text-gray-900">
                                                            {correctOption.text}
                                                        </div>
                                                        {correctOption.feedback_clinical && (
                                                            <div className="mt-3 text-sm text-gray-600 border-t border-gray-200 pt-3">
                                                                <span className="font-semibold block mb-1">Justificación:</span> 
                                                                {correctOption.feedback_clinical}
                                                            </div>
                                                        )}
                                                    </div>
                                                )}
                                            </div>

                                            {/* Pearl */}
                                            {ans.question?.pearl && (
                                                <div className="mt-4 bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                                                    <div className="flex items-start">
                                                        <div className="flex-shrink-0 text-yellow-600 mr-3 mt-0.5">
                                                            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M15 14c.2-1 .7-1.7 1.5-2.5 1-.9 1.5-2.2 1.5-3.5A6 6 0 0 0 6 8c0 1 .2 2.2 1.5 3.5.7.9 1.2 1.5 1.5 2.5"/><path d="M9 18h6"/><path d="M10 22h4"/></svg>
                                                        </div>
                                                        <div>
                                                            <h5 className="text-sm font-bold text-yellow-900 mb-1 uppercase tracking-wider">Perla del Consejo</h5>
                                                            <p className="text-sm text-yellow-800 leading-relaxed font-medium">
                                                                {ans.question.pearl}
                                                            </p>
                                                        </div>
                                                    </div>
                                                </div>
                                            )}

                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>

            </div>
        </UserLayout>
    );
};
