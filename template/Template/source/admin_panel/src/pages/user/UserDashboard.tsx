import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '../../lib/supabase';
import { UserLayout } from '../../layouts/UserLayout';
import { useIslands } from '../../hooks/useIslands';
import { TrendingUp, BookOpen, Award, ChevronRight } from 'lucide-react';


interface MasteryScore {
    island_id: string;
    score: number;
}

interface AssignedExam {
    id: string;
    title: string;
    description: string;
    status: string;
    islands: string[];
}

export const UserDashboard = () => {
    const { islands } = useIslands({ select: '*' });
    const [assignedExams, setAssignedExams] = useState<AssignedExam[]>([]);
    const [masteryScores, setMasteryScores] = useState<Record<string, number>>({});
    const [examStats, setExamStats] = useState({ averageScore: 0 });
    const [userLevel, setUserLevel] = useState('Residente');
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchUserData = async () => {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) return;

            // Fetch user profile for residency year
            const { data: profile } = await supabase
                .from('user_profiles')
                .select('residency_year')
                .eq('user_id', user.id)
                .single();
            
            if (profile && profile.residency_year) {
                setUserLevel(profile.residency_year);
            }

            // Fetch user's mastery scores
            const { data: scoresData } = await supabase
                .from('mastery_scores')
                .select('island_id, score')
                .eq('user_id', user.id);

            if (scoresData) {
                const scoresMap: Record<string, number> = {};
                scoresData.forEach((score: MasteryScore) => {
                    scoresMap[score.island_id] = score.score;
                });
                setMasteryScores(scoresMap);
            }

            // Fetch exam sessions for average score
            const { data: sessions } = await supabase
                .from('exam_sessions')
                .select('score_percentage')
                .eq('user_id', user.id)
                .eq('status', 'COMPLETED');

            if (sessions && sessions.length > 0) {
                 const totalScore = sessions.reduce((sum, s) => sum + (s.score_percentage || 0), 0);
                 const avgScore = Math.round(totalScore / sessions.length);
                 setExamStats(prev => ({ ...prev, averageScore: avgScore }));
            }

            // Fetch assigned exams
            const { data: assignedData } = await supabase
                .from('assigned_exams')
                .select('*')
                .eq('student_id', user.id)
                .in('status', ['PENDING', 'IN_PROGRESS']);
                
            if (assignedData) {
                setAssignedExams(assignedData);
            }

            setLoading(false);
        };

        fetchUserData();
    }, []);

    if (loading) {
        return (
            <UserLayout title="Mi Progreso">
                <div className="flex items-center justify-center h-64">
                    <div className="text-center">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto mb-4"></div>
                        <p className="text-gray-600">Cargando tu progreso...</p>
                    </div>
                </div>
            </UserLayout>
        );
    }

    return (
        <UserLayout title="Mi Progreso">
            <div className="space-y-8">
                {/* Welcome Section */}
                <div className="bg-gradient-to-r from-indigo-500 to-purple-600 rounded-xl p-6 text-white shadow-lg">
                    <h2 className="text-2xl font-bold mb-2">¡Bienvenido de vuelta!</h2>
                    <p className="text-indigo-100">Continúa tu camino de aprendizaje seleccionando una isla</p>
                </div>

                {/* Assigned Exams Banner */}
                {assignedExams.length > 0 && (
                    <div className="space-y-4">
                        <h3 className="text-xl font-bold text-gray-900 flex items-center">
                            <span className="bg-red-100 text-red-600 p-1.5 rounded-lg mr-2">🔔</span>
                            Exámenes Asignados Pendientes
                        </h3>
                        {assignedExams.map(exam => (
                            <div key={exam.id} className="bg-white rounded-xl shadow border-l-4 border-red-500 p-5 flex flex-col md:flex-row md:items-center justify-between gap-4">
                                <div>
                                    <h4 className="font-bold text-lg text-gray-900 flex items-center">
                                        {exam.title}
                                        {exam.status === 'IN_PROGRESS' && (
                                            <span className="ml-3 text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded-full">En Progreso</span>
                                        )}
                                    </h4>
                                    {exam.description && <p className="text-gray-600 text-sm mt-1">{exam.description}</p>}
                                </div>
                                <div className="flex-shrink-0">
                                    <Link 
                                        to={`/user/exam?assigned_id=${exam.id}`} 
                                        className="inline-flex items-center px-4 py-2 bg-red-600 text-white font-medium rounded-lg hover:bg-red-700 transition-colors shadow-sm"
                                    >
                                        <BookOpen size={18} className="mr-2" />
                                        {exam.status === 'IN_PROGRESS' ? 'Continuar Examen' : 'Comenzar Examen'}
                                    </Link>
                                </div>
                            </div>
                        ))}
                    </div>
                )}

                {/* Stats Overview */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="bg-white p-6 rounded-lg shadow border-l-4 border-green-500">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-gray-600 mb-1">Islas Activas</p>
                                <p className="text-3xl font-bold text-gray-900">{islands.length}</p>
                            </div>
                            <BookOpen className="h-12 w-12 text-green-500 opacity-50" />
                        </div>
                    </div>

                    <div className="bg-white p-6 rounded-lg shadow border-l-4 border-indigo-600 cursor-pointer hover:bg-gray-50 transition-colors group">
                        <Link to="/user/exam">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm text-gray-600 mb-1">Modo Examen</p>
                                    <p className="text-xl font-bold text-gray-900 group-hover:text-indigo-700">Simulacro</p>
                                </div>
                                <Award className="h-12 w-12 text-indigo-600 opacity-50 group-hover:scale-110 transition-transform" />
                            </div>
                        </Link>
                    </div>

                    <div className="bg-white p-6 rounded-lg shadow border-l-4 border-blue-500">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-gray-600 mb-1">Promedio General</p>
                                <p className="text-3xl font-bold text-gray-900">
                                    {examStats.averageScore}%
                                </p>
                            </div>
                            <TrendingUp className="h-12 w-12 text-blue-500 opacity-50" />
                        </div>
                    </div>

                    <div className="bg-white p-6 rounded-lg shadow border-l-4 border-yellow-500">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-gray-600 mb-1">Nivel Actual</p>
                                <p className="text-3xl font-bold text-gray-900">{userLevel}</p>
                            </div>
                            <Award className="h-12 w-12 text-yellow-500 opacity-50" />
                        </div>
                    </div>
                </div>

                {/* Islands Grid */}
                <div>
                    <h3 className="text-xl font-bold text-gray-900 mb-4">Areas y Especialidades</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {islands.map((island) => {
                            const mastery = masteryScores[island.id] || 0;
                            const masteryColor =
                                mastery >= 80 ? 'from-green-500 to-green-600' :
                                mastery >= 60 ? 'from-yellow-500 to-yellow-600' :
                                'from-red-500 to-red-600';

                            return (
                                <Link
                                    key={island.id}
                                    to={`/user/islands/${island.id}`}
                                    className="bg-white rounded-xl shadow-md hover:shadow-xl transition-all duration-300 overflow-hidden group"
                                >
                                    <div className={`h-2 bg-gradient-to-r ${masteryColor}`}></div>
                                    <div className="p-6">
                                        <div className="flex justify-between items-start mb-3">
                                            <h4 className="font-bold text-lg text-gray-900 group-hover:text-indigo-600 transition-colors">
                                                {island.name}
                                            </h4>
                                            <ChevronRight className="text-gray-400 group-hover:text-indigo-600 group-hover:translate-x-1 transition-all" />
                                        </div>
                                        {island.description && (
                                            <p className="text-sm text-gray-600 mb-4">{island.description}</p>
                                        )}
                                        <div className="space-y-2">
                                            <div className="flex justify-between text-sm">
                                                <span className="text-gray-600">Dominio</span>
                                                <span className="font-semibold text-gray-900">{mastery}%</span>
                                            </div>
                                            <div className="w-full bg-gray-200 rounded-full h-2">
                                                <div
                                                    className={`h-2 rounded-full bg-gradient-to-r ${masteryColor} transition-all duration-500`}
                                                    style={{ width: `${mastery}%` }}
                                                ></div>
                                            </div>
                                        </div>
                                    </div>
                                </Link>
                            );
                        })}
                    </div>
                </div>
            </div>
        </UserLayout>
    );
};
