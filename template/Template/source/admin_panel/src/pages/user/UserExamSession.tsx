import { useEffect, useState, useRef } from 'react';
import { toast } from 'sonner';
import { useNavigate, useSearchParams, useLocation, useBlocker, Link } from 'react-router-dom';
import { supabase } from '../../lib/supabase';
import { UserLayout } from '../../layouts/UserLayout';
import { ChevronRight, ChevronLeft, Flag, Clock, CheckCircle, ZoomIn, BookOpen } from 'lucide-react';
import { useExamAttempt } from '../../hooks/useExamAttempt';
import { useAuth } from '../../contexts/AuthContext';
import { ExamSubmissionDialog } from '../../components/ExamSubmissionDialog';
import { motion, AnimatePresence } from 'framer-motion';
import { ProgressBar } from '../../components/ui/ProgressBar';
import { Skeleton } from '../../components/ui/Skeleton';
import { ImageModal } from '../../components/ui/ImageModal';
import { ConfirmDialog, useConfirmDialog } from '../../components/ui/ConfirmDialog';



// Fisher-Yates shuffle utility for randomizing options
const shuffleOptions = (options: any[]) => {
    const shuffled = [...options];
    for (let i = shuffled.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
};

interface Question {
    id: string;
    content: {
        stem: string;
        image_url?: string;
        options: Array<{
            text: string;
            is_correct: boolean;
        }>;
    };
    island_id: string;
    topic_id: string;
}

export const UserExamSession = () => {
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const location = useLocation();
    const mode = searchParams.get('mode');
    const islandId = searchParams.get('island_id');
    const assignedId = searchParams.get('assigned_id');

    const [questions, setQuestions] = useState<Question[]>([]);
    const [currentIndex, setCurrentIndex] = useState(0);
    const [answers, setAnswers] = useState<Record<string, number>>({}); // questionId -> optionIndex
    const [flagged, setFlagged] = useState<Record<string, boolean>>({});
    const [loading, setLoading] = useState(true);
    const [timeLeft, setTimeLeft] = useState<number>(0); // in seconds
    const [submitting, setSubmitting] = useState(false);
    const [attemptId, setAttemptId] = useState<string | null>(null);
    const [userId, setUserId] = useState<string | null>(null);
    const [showSubmissionDialog, setShowSubmissionDialog] = useState(false);
    const [startedAt, setStartedAt] = useState<string | null>(null);
    const [expandedImage, setExpandedImage] = useState<string | null>(null);
    const [currentAssignedId, setCurrentAssignedId] = useState<string | null>(assignedId);
    const [activeMode, setActiveMode] = useState<string | null>(mode);
    const isLast = currentIndex === questions.length - 1;

    const timerRef = useRef<NodeJS.Timeout | null>(null);
    const autoSaveTimerRef = useRef<NodeJS.Timeout | null>(null);
    const submittingRef = useRef(false);
    const examAttempt = useExamAttempt();
    const { confirm, dialogProps } = useConfirmDialog();

    // Stable refs for latest state — used by auto-save and auto-submit to avoid stale closures
    const answersRef = useRef(answers);
    const flaggedRef = useRef(flagged);
    const currentIndexRef = useRef(currentIndex);
    const timeLeftRef = useRef(timeLeft);
    useEffect(() => { answersRef.current = answers; }, [answers]);
    useEffect(() => { flaggedRef.current = flagged; }, [flagged]);
    useEffect(() => { currentIndexRef.current = currentIndex; }, [currentIndex]);
    useEffect(() => { timeLeftRef.current = timeLeft; }, [timeLeft]);

    const { session, loading: authLoading } = useAuth();
    const isInitializedRef = useRef(false);

    useEffect(() => {
        const initializeExam = async () => {
            if (isInitializedRef.current || authLoading) return;
            
            try {
                console.log('[Exam] Initializing exam session...');
                
                // Use session from context if available, otherwise check supabase directly
                let user = session?.user;
                if (!user) {
                    const { data } = await supabase.auth.getUser();
                    user = data?.user || undefined;
                }
                
                if (!user) {
                    console.warn('[Exam] No user found, redirecting to login');
                    toast.error('Sesión expirada o no encontrada');
                    navigate('/login');
                    return;
                }
                
                setUserId(user.id);
                isInitializedRef.current = true;

                // Check if we're resuming an attempt
                const resumeAttemptId = location.state?.attemptId;
                
                if (resumeAttemptId) {
                    console.log('[Exam] Resuming attempt:', resumeAttemptId);
                    // Load existing attempt
                    const attempt = await examAttempt.loadAttempt(resumeAttemptId);
                    if (!attempt) {
                        toast.error('No se pudo cargar el intento guardado');
                        navigate('/user/exam');
                        return;
                    }

                    setAttemptId(attempt.id);
                    setStartedAt(attempt.created_at);
                    if (attempt.config?.assignedId) {
                        setCurrentAssignedId(attempt.config.assignedId as string);
                    }
                    
                    // Fetch questions by IDs in the saved order
                    const { data: questionsData, error } = await supabase
                        .from('questions')
                        .select('id, content, topic_id, topic:topics(island_id)')
                        .in('id', attempt.question_ids);

                    if (error || !questionsData) {
                        console.error('Error fetching questions:', error);
                        toast.error('Error cargando preguntas: ' + error?.message);
                        return;
                    }

                    // Sort questions according to saved order
                    const orderedQuestions = attempt.question_ids.map(qId => 
                        questionsData.find(q => q.id === qId)
                    ).filter(Boolean).map((q: any) => ({
                        ...q,
                        island_id: q.topic?.island_id
                    }));

                    setQuestions(orderedQuestions as Question[]);
                    setCurrentIndex(attempt.current_question_index);
                    setAnswers(attempt.answers as Record<string, number>);
                    setFlagged(attempt.flagged as Record<string, boolean>);
                    
                    if (attempt.mode === 'CUSTOM') {
                        const totalTimeLimit = orderedQuestions.length * 90;
                        const elapsedSeconds = Math.floor((new Date().getTime() - new Date(attempt.created_at).getTime()) / 1000);
                        setTimeLeft(Math.max(0, totalTimeLimit - elapsedSeconds));
                    } else {
                        setTimeLeft(attempt.time_remaining_seconds || 0);
                    }
                    setActiveMode(attempt.mode);

                } else {
                    // Create new attempt
                    // Fetch questions based on mode
                    let query = supabase.from('questions').select('id, content, topic_id, topic:topics(island_id)').eq('status', 'PUBLISHED');
                    
                    // Store config from assigned exam (if applicable) for use later
                    let assignedConfig: Record<string, any> | null = null;

                    if (mode === 'ISLAND_SPECIFIC' && islandId) {
                        // Get all topics for this island first
                        const { data: topics } = await supabase.from('topics').select('id').eq('island_id', islandId);
                        const topicIds = topics?.map(t => t.id) || [];
                        query = query.in('topic_id', topicIds);
                    } else if (mode === 'CUSTOM' && assignedId) {
                        const { data: assignedExam } = await supabase.from('assigned_exams').select('islands, topics, config, question_ids').eq('id', assignedId).single();
                        if (assignedExam) {
                            assignedConfig = assignedExam.config as Record<string, any> | null;

                            if (assignedExam.question_ids && assignedExam.question_ids.length > 0) {
                                // Manual selection mode: fetch specific questions
                                query = query.in('id', assignedExam.question_ids);
                            } else {
                                // Filter mode: fetch by topic/island
                                if (assignedExam.topics && assignedExam.topics.length > 0) {
                                    query = query.in('topic_id', assignedExam.topics);
                                } else if (assignedExam.islands && assignedExam.islands.length > 0) {
                                    const { data: topics } = await supabase.from('topics').select('id').in('island_id', assignedExam.islands);
                                    const topicIds = topics?.map(t => t.id) || [];
                                    query = query.in('topic_id', topicIds);
                                }

                                // Apply difficulty filters from config
                                if (assignedConfig?.difficulty_min) {
                                    query = query.gte('difficulty', assignedConfig.difficulty_min);
                                }
                                if (assignedConfig?.difficulty_max) {
                                    query = query.lte('difficulty', assignedConfig.difficulty_max);
                                }
                            }
                        }
                    }
                    
                    const { data, error } = await query;
                    
                    if (error) {
                        console.error("Error fetching questions:", error);
                        toast.error("Error cargando preguntas: " + error.message);
                    }
                    
                    if (data) {
                        // Map data to include island_id from the nested topic relationship
                        const mappedData = data.map((q: any) => ({
                            ...q,
                            island_id: q.topic?.island_id,
                            content: {
                                ...q.content,
                                options: shuffleOptions(q.content.options) // Randomize answer order
                            }
                        }));

                        // Randomize questions
                        const shuffled = [...mappedData].sort(() => 0.5 - Math.random());

                        // Apply question count limit
                        let selected = shuffled;
                        if (mode === 'FULL_SIMULATION') {
                            selected = shuffled.slice(0, 100);
                        } else if (assignedConfig?.question_count && assignedConfig.question_count > 0) {
                            selected = shuffled.slice(0, assignedConfig.question_count);
                        }

                        setQuestions(selected);
                        
                        // Set Timer: use custom time_limit_minutes if configured, else 1.5 min per question
                        let initialTime = selected.length * 90;
                        if (assignedConfig?.time_limit_minutes && assignedConfig.time_limit_minutes > 0) {
                            initialTime = assignedConfig.time_limit_minutes * 60;
                        }
                        setTimeLeft(initialTime);

                        // Create exam attempt record
                        const questionIds = selected.map(q => q.id);
                        const newAttempt = await examAttempt.createAttempt(
                            user.id,
                            activeMode as 'FULL_SIMULATION' | 'ISLAND_SPECIFIC' | 'CUSTOM',
                            questionIds,
                            { assignedId: assignedId || undefined },
                            activeMode === 'ISLAND_SPECIFIC' ? islandId : null
                        );

                        if (newAttempt) {
                            setAttemptId(newAttempt.id);
                            setStartedAt(newAttempt.created_at);
                        }
                    }
                }
                setLoading(false);
            } catch (error: any) {
                console.error('Error initializing exam:', error);
                toast.error('Error al inicializar examen: ' + error.message);
                setLoading(false);
            }
        };

        initializeExam();

        return () => {
            if (timerRef.current) clearInterval(timerRef.current);
            if (autoSaveTimerRef.current) clearInterval(autoSaveTimerRef.current);
        };
    }, [mode, islandId, session, authLoading, navigate]); // Removed location.state to prevent accidental re-runs if state fluctuates

    // Timer Logic
    useEffect(() => {
        if (loading || questions.length === 0) return;

        timerRef.current = setInterval(() => {
            setTimeLeft((prev) => {
                if (prev <= 1) {
                    return 0;
                }
                return prev - 1;
            });
        }, 1000);

        return () => {
            if (timerRef.current) clearInterval(timerRef.current);
        };
    }, [loading, questions]);

    // Reference to confirmSubmitExam to use within the timer effect without stale closure issues
    const confirmSubmitExamRef = useRef<() => Promise<void>>(() => Promise.resolve());
    useEffect(() => {
        confirmSubmitExamRef.current = confirmSubmitExam;
    }); // Update on every render to always have the latest closure

    // Auto-submit when time is up
    useEffect(() => {
        if (timeLeft <= 0 && questions.length > 0 && !submitting && !loading) {
            toast.warning("El tiempo se ha agotado. El examen se guardará y enviará automáticamente.");
            confirmSubmitExamRef.current();
        }
    }, [timeLeft, questions.length, submitting, loading]);

    // Auto-save Logic - Save progress every 10 seconds and on answer/flag changes
    // IMPORTANT: timeLeft is NOT in the dependency array — it changes every second
    // and would cause race conditions. Instead, we read it from a ref.
    useEffect(() => {
        if (!attemptId || loading || questions.length === 0) return;

        const saveCurrentState = async () => {
            try {
                const success = await examAttempt.saveProgress(attemptId, {
                    currentQuestionIndex: currentIndexRef.current,
                    answers: answersRef.current,
                    flagged: flaggedRef.current,
                    timeRemainingSeconds: timeLeftRef.current
                });
                if (!success) {
                    console.warn('[Exam] Progress save failed - check connection/auth');
                }
            } catch (err) {
                console.error('[Exam] Error in auto-save:', err);
            }
        };

        // Save immediately when answers or flags change
        if (Object.keys(answers).length > 0 || Object.keys(flagged).length > 0) {
            saveCurrentState();
        }

        // Auto-save every 10 seconds
        autoSaveTimerRef.current = setInterval(() => {
            saveCurrentState();
        }, 10000);

        return () => {
            if (autoSaveTimerRef.current) clearInterval(autoSaveTimerRef.current);
        };
    }, [attemptId, currentIndex, answers, flagged, loading, questions]);

    // Prevent accidental exit during exam
    useEffect(() => {
        const handleBeforeUnload = (e: BeforeUnloadEvent) => {
            if (loading || !attemptId || questions.length === 0) return;
            e.preventDefault();
            e.returnValue = ''; // Chrome requires this
        };

        window.addEventListener('beforeunload', handleBeforeUnload);
        return () => window.removeEventListener('beforeunload', handleBeforeUnload);
    }, [loading, attemptId, questions]);

    // Keyboard Navigation
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (loading || questions.length === 0 || showSubmissionDialog || expandedImage) return;

            // Number keys 1-5 for options
            if (['1', '2', '3', '4', '5'].includes(e.key)) {
                const index = parseInt(e.key) - 1;
                const currentQ = questions[currentIndex];
                if (currentQ && index < currentQ.content.options.length) {
                    handleAnswer(index);
                }
            }

            // Arrow keys for navigation
            if (e.key === 'ArrowRight' && !isLast) {
                setCurrentIndex(prev => Math.min(questions.length - 1, prev + 1));
            }
            if (e.key === 'ArrowLeft' && currentIndex > 0) {
                setCurrentIndex(prev => Math.max(0, prev - 1));
            }
        };

        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [currentIndex, questions, loading, showSubmissionDialog, expandedImage, isLast]);

    // --- Navigation Blocker ---
    const blocker = useBlocker(
        ({ currentLocation, nextLocation }) =>
            !submittingRef.current && // Use ref for synchronous read — state is stale in closures
            questions.length > 0 && // Don't block if exam hasn't started/failed
            currentLocation.pathname !== nextLocation.pathname // Only block if path changes
    );

    // Reset blocker if we confirm exit
    useEffect(() => {
        if (blocker.state === "blocked" && !showSubmissionDialog) {
             const title = activeMode === 'CUSTOM' 
                 ? 'Salir del examen asignado'
                 : '¿Salir del examen?';
             const description = activeMode === 'CUSTOM'
                 ? 'Si sales, el TIEMPO CONTINUARÁ CORRIENDO. Si expira, se enviará automáticamente.'
                 : 'Se perderá el progreso no guardado de tu examen.';
             confirm({ title, description, confirmLabel: 'Sí, salir' }).then((ok) => {
                 if (ok) blocker.proceed();
                 else blocker.reset();
             });
        }
    }, [blocker, showSubmissionDialog]);


    const handleAnswer = (optionIndex: number) => {
        const questionId = questions[currentIndex].id;
        setAnswers(prev => ({ ...prev, [questionId]: optionIndex }));
    };

    const toggleFlag = () => {
        const questionId = questions[currentIndex].id;
        setFlagged(prev => ({ ...prev, [questionId]: !prev[questionId] }));
    };

    const handleSubmitExam = async () => {
        setShowSubmissionDialog(true);
    };

    const confirmSubmitExam = async () => {
        if (submittingRef.current) return;
        submittingRef.current = true;
        setSubmitting(true);
        if (timerRef.current) clearInterval(timerRef.current);
        if (autoSaveTimerRef.current) clearInterval(autoSaveTimerRef.current);

        try {
            if (!userId) {
                throw new Error("No user ID found");
            }

            // Calculate Score
            let correctCount = 0;
            const answersToInsert: any[] = [];

            questions.forEach(q => {
                const selectedIdx = answers[q.id];
                const isAnswered = selectedIdx !== undefined;
                const isCorrect = isAnswered ? q.content.options[selectedIdx].is_correct : false;
                
                if (isCorrect) correctCount++;

                if (isAnswered) {
                    answersToInsert.push({
                        question_id: q.id,
                        topic_id: q.topic_id,
                        island_id: q.island_id,
                        selected_option_index: selectedIdx,
                        is_correct: isCorrect
                    });
                }
            });

            const scorePercentage = (correctCount / questions.length) * 100;

            // 1. Update User Progress (Granular Tracking for Analytics)
            const answeredQuestionIds = Object.keys(answers);
            if (answeredQuestionIds.length > 0) {
                // Fetch existing progress to increment correctly
                const { data: existingProgress } = await supabase
                    .from('user_progress')
                    .select('question_id, attempts, successes')
                    .eq('user_id', userId)
                    .in('question_id', answeredQuestionIds);

                const progressMap = new Map(existingProgress?.map(p => [p.question_id, p]) || []);
                
                const progressUpdates = answeredQuestionIds.map(qId => {
                    const existing = progressMap.get(qId);
                    const q = questions.find(q => q.id === qId);
                    // answers[qId] is the index of the selected option
                    const selectedOptionIdx = answers[qId];
                    const isCorrect = q?.content.options[selectedOptionIdx]?.is_correct || false;

                    return {
                        user_id: userId,
                        question_id: qId,
                        attempts: (existing?.attempts || 0) + 1,
                        successes: (existing?.successes || 0) + (isCorrect ? 1 : 0),
                        last_attempt: new Date().toISOString()
                    };
                });

                // Bulk Upsert (Requires unique constraint on user_id + question_id)
                const { error: progressError } = await supabase
                    .from('user_progress')
                    .upsert(progressUpdates, { onConflict: 'user_id, question_id' });
                
                if (progressError) {
                    console.error("Error updating progress stats:", progressError);
                    // We don't stop the exam submission if this fails, but it's bad for analytics
                }
            }

            // 2. Create Session
            const durationSeconds = startedAt ? Math.floor((new Date().getTime() - new Date(startedAt).getTime()) / 1000) : 0;
            // Determine a valid mode — if activeMode is missing but it's an assigned exam, use 'CUSTOM'
            const resolvedMode = activeMode ?? (currentAssignedId ? 'CUSTOM' : 'FULL_SIMULATION');
            const { data: session, error: sessionError } = await supabase.from('exam_sessions').insert({
                user_id: userId,
                mode: resolvedMode,
                island_id: resolvedMode === 'ISLAND_SPECIFIC' ? islandId : null,
                total_questions: questions.length,
                correct_answers: correctCount,
                score_percentage: scorePercentage,
                status: 'COMPLETED',
                completed_at: new Date().toISOString(),
                duration_seconds: durationSeconds
            }).select().single();

            if (sessionError) throw sessionError;

            // Update assigned exam if this was a custom exam
            if (currentAssignedId) {
                const { error: assignError } = await supabase.from('assigned_exams').update({
                    status: 'COMPLETED',
                    score_percentage: scorePercentage,
                    exam_session_id: session.id,
                    completed_at: new Date().toISOString()
                }).eq('id', currentAssignedId);
                if (assignError) console.error("Error updating assigned exam", assignError);
            }

            // 3. Insert Answers linked to Session
            if (answersToInsert.length > 0) {
                const answersWithSession = answersToInsert.map(a => ({ ...a, session_id: session.id }));
                const { error: answersError } = await supabase.from('exam_answers').insert(answersWithSession);
                if (answersError) console.error("Error saving answers details", answersError);
            }

            // 4. Mark exam attempt as completed
            if (attemptId) {
                await examAttempt.completeAttempt(attemptId);
            }

            // Redirect to Results
            navigate(`/user/exam/results/${session.id}`);

        } catch (error: any) {
            toast.error("Error al enviar examen: " + error.message);
            submittingRef.current = false;
            setSubmitting(false);
        }
    };

    // Format seconds to MM:SS
    const formatTime = (seconds: number) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins}:${secs.toString().padStart(2, '0')}`;
    };


    if (loading) {
        return (
            <UserLayout title="Examen">
                 <div className="max-w-5xl mx-auto p-4 space-y-6">
                    <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 flex justify-between items-center">
                         <Skeleton className="h-8 w-32" />
                         <Skeleton className="h-6 w-48" />
                    </div>
                    <div className="bg-white p-8 rounded-xl shadow-lg border border-gray-100 min-h-[400px] flex flex-col gap-6">
                        <Skeleton className="h-64 w-full rounded-lg" />
                        <div className="space-y-4">
                            <Skeleton className="h-4 w-full" />
                            <Skeleton className="h-4 w-5/6" />
                            <Skeleton className="h-4 w-4/6" />
                        </div>
                        <div className="space-y-3 mt-4">
                            {[1, 2, 3, 4].map(i => <Skeleton key={i} className="h-16 w-full rounded-lg" />)}
                        </div>
                    </div>
                 </div>
            </UserLayout>
        );
    }
    if (questions.length === 0) {
        return (
            <UserLayout title="Examen">
                <div className="flex flex-col items-center justify-center min-h-[400px] text-center p-8 bg-white rounded-xl shadow-sm border border-gray-100">
                    <div className="bg-red-50 text-red-500 p-4 rounded-full mb-4">
                        <BookOpen size={48} />
                    </div>
                    <h2 className="text-xl font-bold text-gray-900 mb-2">No se encontraron preguntas</h2>
                    <p className="text-gray-600 mb-6 max-w-md">
                        Hubo un problema al cargar el contenido del examen o no hay preguntas disponibles para esta sección.
                    </p>
                    <Link to="/user" className="px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors">
                        Volver al Inicio
                    </Link>
                </div>
            </UserLayout>
        );
    }

    const currentQ = questions[currentIndex];
    
    if (!currentQ) {
        return (
            <UserLayout title="Examen">
                <div className="flex flex-col items-center justify-center min-h-[400px] text-center p-8">
                    <p className="text-gray-600 mb-4">Error al cargar la pregunta actual.</p>
                    <button 
                        onClick={() => setCurrentIndex(0)} 
                        className="text-indigo-600 hover:underline"
                    >
                        Reiniciar desde la primera pregunta
                    </button>
                </div>
            </UserLayout>
        );
    }

    return (
        <UserLayout title="Examen en Curso">
            <div className="max-w-5xl mx-auto flex gap-6 px-3 md:px-0">
                
                {/* Main Content */}
                <div className="flex-1 space-y-3 md:space-y-6">
                    {/* Timer & Progress Header */}
                    <div className="bg-white/80 backdrop-blur-md p-4 rounded-lg md:rounded-xl shadow-sm border border-gray-100 sticky top-0 z-30 md:static transition-all">
                        <div className="flex justify-between items-center mb-3">
                            <div className="flex items-center text-gray-700 font-bold text-xl font-mono tracking-tight">
                                <Clock className={`mr-2 h-5 w-5 ${timeLeft < 300 ? 'text-red-500 animate-pulse' : 'text-blue-600'}`} />
                                {formatTime(timeLeft)}
                            </div>
                            
                           <div className="flex items-center gap-3">
                                <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
                                    Progreso
                                </span>
                                <button 
                                    onClick={toggleFlag}
                                    className={`flex items-center px-3 py-1.5 rounded-full text-sm font-medium transition-all duration-200 ${
                                        flagged[currentQ.id] 
                                        ? 'bg-yellow-100 text-yellow-700 ring-2 ring-yellow-400 ring-offset-1' 
                                        : 'text-gray-400 hover:bg-gray-100 hover:text-gray-600'
                                    }`}
                                >
                                    <Flag size={16} className={`${flagged[currentQ.id] ? 'fill-yellow-500' : ''}`} />
                                    <span className="ml-1.5 hidden sm:inline">{flagged[currentQ.id] ? 'Marcada' : 'Marcar'}</span>
                                </button>
                            </div>
                        </div>

                        <div className="flex items-center gap-4">
                             <div className="flex-1">
                                <ProgressBar current={currentIndex + 1} total={questions.length} />
                             </div>
                             <div className="text-xs font-medium text-gray-500 w-16 text-right">
                                {Math.round(((currentIndex + 1) / questions.length) * 100)}%
                             </div>
                        </div>
                    </div>

                    {/* Unanswered Questions Warning */}
                    {(() => {
                        const unansweredCount = questions.length - Object.keys(answers).length;
                        if (unansweredCount > 0) {
                            return (
                                <div className="mt-3 bg-yellow-50 border-l-4 border-yellow-400 p-3 rounded">
                                    <p className="text-sm text-yellow-800">
                                        ⚠️ Tienes <strong>{unansweredCount}</strong> {unansweredCount === 1 ? 'pregunta sin responder' : 'preguntas sin responder'}
                                    </p>
                                </div>
                            );
                        }
                        return null;
                    })()}

                    {/* Question Card */}
                    <AnimatePresence mode="wait">
                        <motion.div 
                            key={currentQ.id}
                            initial={{ x: 20, opacity: 0 }}
                            animate={{ x: 0, opacity: 1 }}
                            exit={{ x: -20, opacity: 0 }}
                            transition={{ duration: 0.3, ease: "easeOut" }}
                            className="bg-white p-5 md:p-8 rounded-lg md:rounded-xl shadow-lg border border-gray-100 min-h-[50vh] md:min-h-[400px] flex flex-col"
                        >
                            {currentQ.content.image_url && (
                                <div className="mb-6 flex justify-center group relative">
                                    <div 
                                        className="relative cursor-zoom-in overflow-hidden rounded-lg shadow-sm border border-gray-200"
                                        onClick={() => setExpandedImage(currentQ.content.image_url || null)}
                                    >
                                        <img 
                                            src={currentQ.content.image_url} 
                                            alt="Caso Clínico" 
                                            className="max-h-64 md:max-h-80 w-auto object-contain transition-transform duration-300 group-hover:scale-105"
                                        />
                                        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors flex items-center justify-center opacity-0 group-hover:opacity-100">
                                            <ZoomIn className="text-white drop-shadow-md" size={32} />
                                        </div>
                                    </div>
                                </div>
                            )}
                            
                            <h2 className="text-lg md:text-xl font-bold text-gray-900 mb-8 leading-relaxed">
                                {currentQ.content.stem}
                            </h2>

                            <div className="space-y-3 mt-auto">
                                {currentQ.content.options.map((option, idx) => {
                                    const isSelected = answers[currentQ.id] === idx;
                                    return (
                                    <button
                                        key={idx}
                                        onClick={() => handleAnswer(idx)}
                                        className={`w-full text-left p-4 rounded-xl border-2 transition-all duration-200 relative group overflow-hidden ${
                                            isSelected 
                                                ? 'border-blue-600 bg-blue-50 shadow-md transform scale-[1.01]' 
                                                : 'border-gray-100 hover:border-blue-300 hover:bg-gray-50 hover:shadow-sm'
                                        }`}
                                    >
                                        <div className="flex items-start z-10 relative">
                                            <div className={`w-6 h-6 rounded-full border-2 mr-4 flex items-center justify-center flex-shrink-0 mt-0.5 transition-colors ${
                                                isSelected ? 'border-blue-600 bg-blue-600' : 'border-gray-300 group-hover:border-blue-400'
                                            }`}>
                                                {isSelected && <div className="w-2.5 h-2.5 bg-white rounded-full" />}
                                            </div>
                                            <div className="flex-1">
                                                <span className={`text-base leading-relaxed ${isSelected ? 'font-semibold text-blue-900' : 'text-gray-700'}`}>
                                                    {option.text}
                                                </span>
                                            </div>
                                            {/* Keyboard shortcut hint */}
                                            <span className={`absolute right-2 top-2 text-xs font-mono font-bold transition-opacity ${isSelected ? 'text-blue-300' : 'text-gray-200 opacity-0 group-hover:opacity-100'}`}>
                                                {idx + 1}
                                            </span>
                                        </div>
                                    </button>
                                )})}
                            </div>
                        </motion.div>
                    </AnimatePresence>

                    {/* Navigation */}
                    <div className="flex justify-between items-center pt-3 md:pt-4 pb-20 md:pb-0">
                        <button
                            onClick={() => setCurrentIndex(prev => Math.max(0, prev - 1))}
                            disabled={currentIndex === 0}
                            className="flex items-center px-5 py-2.5 md:px-6 md:py-3 rounded-lg text-gray-600 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed font-medium text-base active:bg-gray-200 transition-colors"
                        >
                            <ChevronLeft className="mr-1.5 h-5 w-5" /> Anterior
                        </button>

                        <div className="flex gap-3">
                            {!isLast ? (
                                <button
                                    onClick={() => setCurrentIndex(prev => Math.min(questions.length - 1, prev + 1))}
                                    className="flex items-center px-5 py-2.5 md:px-6 md:py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 active:bg-blue-800 font-medium shadow-md hover:shadow-lg transition-all text-base"
                                >
                                    Siguiente <ChevronRight className="ml-1.5 h-5 w-5" />
                                </button>
                            ) : (
                                <button
                                    onClick={handleSubmitExam}
                                    disabled={submitting}
                                    className="flex items-center px-6 py-2.5 md:px-8 md:py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 active:bg-green-800 font-bold shadow-md hover:shadow-lg transition-all disabled:opacity-70 text-base"
                                >
                                    {submitting ? 'Enviando...' : 'Finalizar'} <CheckCircle className="ml-1.5 h-5 w-5" />
                                </button>
                            )}
                        </div>
                    </div>
                </div>

                {/* Sidebar Question Map */}
                <div className="w-64 hidden xl:block">
                    <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 sticky top-20 max-h-[calc(100vh-100px)] overflow-y-auto custom-scrollbar">
                        <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-4 flex items-center gap-2">
                            <span>Navegación</span>
                            <span className="bg-gray-100 text-gray-600 px-2 py-0.5 rounded text-[10px]">{questions.length}</span>
                        </h3>
                        
                        <div className="grid grid-cols-5 gap-2">
                            {questions.map((q, idx) => {
                                const isAnswered = answers[q.id] !== undefined;
                                const isCurrent = currentIndex === idx;
                                const isFlagged = flagged[q.id];
                                
                                let bgClass = 'bg-gray-50 text-gray-500 border-gray-100 hover:bg-gray-100';
                                if (isCurrent) bgClass = 'ring-2 ring-blue-500 ring-offset-1 border-blue-500 bg-white text-blue-600 font-bold shadow-sm transform scale-105 z-10';
                                else if (isFlagged) bgClass = 'bg-yellow-50 text-yellow-700 border-yellow-200';
                                else if (isAnswered) bgClass = 'bg-blue-600 text-white border-blue-600 shadow-sm';

                                return (
                                    <button
                                        key={q.id}
                                        onClick={() => setCurrentIndex(idx)}
                                        className={`relative w-8 h-8 rounded-lg text-xs flex items-center justify-center border transition-all duration-200 ${bgClass}`}
                                    >
                                        {idx + 1}
                                        {isFlagged && <div className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-yellow-400 rounded-full border-2 border-white" />}
                                    </button>
                                );
                            })}
                        </div>

                        <div className="mt-6 space-y-2 text-xs text-gray-500 font-medium">
                            <div className="flex items-center"><div className="w-3 h-3 bg-blue-600 rounded mr-2" /> Respondida</div>
                            <div className="flex items-center relative"><div className="w-3 h-3 bg-yellow-100 border border-yellow-300 rounded mr-2" /><div className="absolute left-2 -top-0.5 w-1.5 h-1.5 bg-yellow-400 rounded-full" /> Marcada</div>
                            <div className="flex items-center"><div className="w-3 h-3 bg-gray-100 border border-gray-200 rounded mr-2" /> Pendiente</div>
                        </div>
                    </div>
                </div>



                {/* Submission Confirmation Dialog */}
                {showSubmissionDialog && (
                    <ExamSubmissionDialog
                        totalQuestions={questions.length}
                        answeredCount={Object.keys(answers).length}
                        flaggedCount={Object.keys(flagged).length}
                        timeElapsed={timeLeft}
                        answers={answers}
                        flagged={flagged}
                        questions={questions}
                        mode={activeMode || undefined}
                        onReview={() => setShowSubmissionDialog(false)}
                        onSubmit={confirmSubmitExam}
                        onCancel={async () => {
                            const ok = await confirm({
                                title: '¿Eliminar intento?',
                                description: 'Todo el progreso se perderá.',
                                confirmLabel: 'Sí, eliminar',
                            });
                            if (ok) {
                                if (attemptId) {
                                    await examAttempt.deletePendingAttempt(attemptId);
                                }
                                setShowSubmissionDialog(false);
                                navigate('/user/exam');
                            }
                        }}
                    />
                )}
            </div>
            <AnimatePresence>
                {expandedImage && <ImageModal src={expandedImage} onClose={() => setExpandedImage(null)} />}
            </AnimatePresence>
            <ConfirmDialog {...dialogProps} />
        </UserLayout>
    );
};
