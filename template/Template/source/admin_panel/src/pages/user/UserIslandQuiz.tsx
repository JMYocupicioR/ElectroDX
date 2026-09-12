import { useEffect, useState, useRef } from 'react';
import { toast } from 'sonner';
import { useParams, useNavigate, useLocation, useBlocker } from 'react-router-dom';
import { supabase } from '../../lib/supabase';
import { UserLayout } from '../../layouts/UserLayout';
import { CheckCircle, XCircle, Lightbulb, ArrowRight, Trophy, Clock, ZoomIn } from 'lucide-react';
import { useExamAttempt } from '../../hooks/useExamAttempt';
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
            feedback_clinical?: string;
        }>;
    };
    difficulty: number;
    pearl: string;
    is_critical: boolean;
}

export const UserIslandQuiz = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const location = useLocation();
    const config = location.state?.config;

    const [questions, setQuestions] = useState<Question[]>([]);
    const [currentIndex, setCurrentIndex] = useState(0);
    const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
    const [answersRevealed, setAnswersRevealed] = useState(false); // To handle 'Exam Mode' vs 'Tutor Mode'
    const [score, setScore] = useState({ correct: 0, total: 0 });
    const [allAnswers, setAllAnswers] = useState<Record<string, number>>({}); // Track all answers for auto-save
    const [timeLeft, setTimeLeft] = useState<number | null>(config?.timeLimit || null); // Seconds
    const [attemptId, setAttemptId] = useState<string | null>(null);
    const timerRef = useRef<NodeJS.Timeout | null>(null);
    const autoSaveTimerRef = useRef<NodeJS.Timeout | null>(null);
    const [loading, setLoading] = useState(true);
    const [userId, setUserId] = useState<string | null>(null);
    const [showSubmissionDialog, setShowSubmissionDialog] = useState(false);
    const [expandedImage, setExpandedImage] = useState<string | null>(null);
    const [startedAt, setStartedAt] = useState<string | null>(null);
    const examAttempt = useExamAttempt();
    const { confirm, dialogProps } = useConfirmDialog();
    
    // Derived state for last question
    const isLast = currentIndex === questions.length - 1;

    useEffect(() => {
        // Timer Logic
        if (timeLeft !== null && timeLeft > 0 && !loading) {
            timerRef.current = setInterval(() => {
                setTimeLeft((prev) => {
                    if (prev !== null && prev <= 1) {
                         clearInterval(timerRef.current!);
                         return 0;
                    }
                    return prev !== null ? prev - 1 : null;
                });
            }, 1000);
        } else if (timeLeft === 0) {
            // Time's up!
            toast.warning('¡El tiempo se ha agotado!');
            navigate('/user/dashboard');
        }

        return () => {
            if (timerRef.current) clearInterval(timerRef.current);
        };
    }, [timeLeft, loading]);

    useEffect(() => {
        const fetchQuestions = async () => {
            if (!id) return;

            try {
                // Get user
                const { data: { user } } = await supabase.auth.getUser();
                if (!user) {
                    toast.error('Usuario no autenticado');
                    navigate('/login');
                    return;
                }
                setUserId(user.id);

                // Check if we're resuming an attempt
                const resumeAttemptId = location.state?.attemptId;
                
                if (resumeAttemptId) {
                    // Load existing attempt
                    const attempt = await examAttempt.loadAttempt(resumeAttemptId);
                    if (!attempt) {
                        toast.error('No se pudo cargar el intento guardado');
                        navigate('/user/dashboard');
                        return;
                    }

                    setAttemptId(attempt.id);
                    
                    // Fetch questions by IDs in the saved order
                    const { data: questionsData, error } = await supabase
                        .from('questions')
                        .select('*')
                        .in('id', attempt.question_ids);

                    if (error || !questionsData) {
                        console.error('Error fetching questions:', error);
                        toast.error('Error cargando preguntas: ' + error?.message);
                        return;
                    }

                    // Sort questions according to saved order
                    const orderedQuestions = attempt.question_ids.map(qId => 
                        questionsData.find(q => q.id === qId)
                    ).filter(Boolean);

                    setQuestions(orderedQuestions as Question[]);
                    setCurrentIndex(attempt.current_question_index);
                    setAllAnswers(attempt.answers as Record<string, number>);
                    setTimeLeft(attempt.time_remaining_seconds);

                    // Restore selected answer for current question if it exists
                    const currentQuestionId = orderedQuestions[attempt.current_question_index]?.id;
                    if (currentQuestionId && attempt.answers[currentQuestionId] !== undefined) {
                        setSelectedAnswer(attempt.answers[currentQuestionId]);
                    }

                } else {
                    // Create new attempt - Fetch questions based on config
                    let finalQuestions: any[] = [];
                    
                    if (config?.topicIds && config.topicIds.length > 0) {
                        // Configured topics
                        const { data: questionsData } = await supabase
                            .from('questions')
                            .select('*')
                            .in('topic_id', config.topicIds)
                            .eq('status', 'PUBLISHED');
                        
                        if (questionsData) {
                            finalQuestions = questionsData;

                            // Randomize question order (Shuffle)
                            for (let i = finalQuestions.length - 1; i > 0; i--) {
                                const j = Math.floor(Math.random() * (i + 1));
                                [finalQuestions[i], finalQuestions[j]] = [finalQuestions[j], finalQuestions[i]];
                            }

                            // Apply Limit
                            if (config.questionCount && config.questionCount > 0) {
                                finalQuestions = finalQuestions.slice(0, config.questionCount);
                            }
                        }

                    } else {
                        // Legacy / Default Fallback
                        const { data: topics } = await supabase
                            .from('topics')
                            .select('id')
                            .eq('island_id', id);

                        if (!topics || topics.length === 0) {
                            setLoading(false);
                            return;
                        }

                        const topicIds = topics.map(t => t.id);
                        const { data: questionsData } = await supabase
                            .from('questions')
                            .select('*')
                            .in('topic_id', topicIds)
                            .eq('status', 'PUBLISHED');

                        if (questionsData) {
                            finalQuestions = questionsData;
                            for (let i = finalQuestions.length - 1; i > 0; i--) {
                                const j = Math.floor(Math.random() * (i + 1));
                                [finalQuestions[i], finalQuestions[j]] = [finalQuestions[j], finalQuestions[i]];
                            }
                        }
                    }

                    // Apply Shuffle Options
                    const questionsWithShuffledOptions = finalQuestions.map(q => ({
                        ...q,
                        content: {
                            ...q.content,
                            options: shuffleOptions(q.content.options)
                        }
                    }));
                    setQuestions(questionsWithShuffledOptions);

                        if (resumeAttemptId) {
                            // Resume existing
                            const attempt = await examAttempt.loadAttempt(resumeAttemptId);
                            if (attempt) {
                                setAttemptId(attempt.id);
                                setStartedAt(attempt.created_at);
                                
                                setQuestions(finalQuestions); // Note: We should ideally load question order from attempt, but for now reuse fetched
                                // Logic to restore index/answers would go here or be handled by simple resume
                                setAllAnswers(attempt.answers);
                                setCurrentIndex(attempt.current_question_index);
                                setTimeLeft(attempt.time_remaining_seconds || 0);
                            }
                        } else {
                            // New Attempt
                            // Create exam attempt record
                            const questionIds = questionsWithShuffledOptions.map(q => q.id);
                            const newAttempt = await examAttempt.createAttempt(
                                user.id,
                                'CUSTOM', // or ISLAND_SPECIFIC if we want to track it as such
                                questionIds,
                                config || {},
                                id || null
                            );

                            if (newAttempt) {
                                setAttemptId(newAttempt.id);
                                setStartedAt(newAttempt.created_at);
                            }
                        }
                    }
                    setLoading(false);
            } catch (error: any) {
                console.error('Error initializing quiz:', error);
                toast.error('Error al inicializar quiz: ' + error.message);
                setLoading(false);
            }
        };

        fetchQuestions();

        return () => {
            if (timerRef.current) clearInterval(timerRef.current);
            if (autoSaveTimerRef.current) clearInterval(autoSaveTimerRef.current);
        };
    }, [id, location.state]);

    // Auto-save Logic - Save progress every 10 seconds and on changes
    useEffect(() => {
        if (!attemptId || loading || questions.length === 0) return;

        const saveCurrentState = async () => {
            await examAttempt.saveProgress(attemptId, {
                currentQuestionIndex: currentIndex,
                answers: allAnswers,
                flagged: {}, // UserIslandQuiz doesn't have flagging
                timeRemainingSeconds: timeLeft
            });
        };

        // Save immediately when answers change
        if (Object.keys(allAnswers).length > 0) {
            saveCurrentState();
        }

        // Auto-save every 10 seconds
        autoSaveTimerRef.current = setInterval(() => {
            saveCurrentState();
        }, 10000);

        return () => {
            if (autoSaveTimerRef.current) clearInterval(autoSaveTimerRef.current);
        };
    }, [attemptId, currentIndex, allAnswers, timeLeft, loading, questions]);

    // Prevent accidental exit during quiz
    const blocker = useBlocker(
        ({ currentLocation, nextLocation }) =>
            !loading &&
            questions.length > 0 &&
            currentLocation.pathname !== nextLocation.pathname
    );

    // Additional confirm for browser close/reload
    useEffect(() => {
        const handleBeforeUnload = (e: BeforeUnloadEvent) => {
            if (loading || !attemptId || questions.length === 0) return;
            e.preventDefault();
            e.returnValue = '';
        };

        window.addEventListener('beforeunload', handleBeforeUnload);
        return () => window.removeEventListener('beforeunload', handleBeforeUnload);
    }, [loading, attemptId, questions]);

    // Handle blocker dialog
    useEffect(() => {
        if (blocker.state === "blocked" && !showSubmissionDialog) {
             confirm({
                 title: '¿Salir del quiz?',
                 description: 'Se perderá el progreso de tu quiz.',
                 confirmLabel: 'Sí, salir',
             }).then((ok) => {
                 if (ok) blocker.proceed();
                 else blocker.reset();
             });
        }
    }, [blocker, showSubmissionDialog]);

    // Keyboard Navigation
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (loading || questions.length === 0 || showSubmissionDialog || expandedImage) return;

            // Number keys 1-5
            if (['1', '2', '3', '4', '5'].includes(e.key)) {
                const index = parseInt(e.key) - 1;
                const currentQ = questions[currentIndex];
                if (currentQ && index < currentQ.content.options.length) {
                    handleAnswer(index);
                }
            }

            // Arrow keys
            if (e.key === 'ArrowRight' && !isLast && selectedAnswer !== null) {
                 handleNext();
            }
        };

        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [currentIndex, questions, loading, showSubmissionDialog, expandedImage, isLast, selectedAnswer]);

    const handleAnswer = async (optionIndex: number) => {
        if (selectedAnswer !== null) return; // Prevent changing answer

        setSelectedAnswer(optionIndex);
        
        const isExamMode = config?.feedbackMode === 'end';
        if (!isExamMode) {
            setAnswersRevealed(true);
        } else {
            // In Exam Mode, we don't show correct/wrong colors immediately
            // But we allow proceeding to next question
            setAnswersRevealed(false);
        }

        const question = questions[currentIndex];
        const correct = question.content.options[optionIndex].is_correct;

        // Track answer for auto-save
        const questionId = question.id;
        setAllAnswers(prev => ({ ...prev, [questionId]: optionIndex }));



        if (correct) {
            setScore(prev => ({ correct: prev.correct + 1, total: prev.total + 1 }));
        } else {
            setScore(prev => ({ ...prev, total: prev.total + 1 }));
        }

        // Update user progress in database
        if (userId) {
            const { data: existing } = await supabase
                .from('user_progress')
                .select('*')
                .eq('user_id', userId)
                .eq('question_id', question.id)
                .single();

            if (existing) {
                await supabase
                    .from('user_progress')
                    .update({
                        attempts: existing.attempts + 1,
                        successes: correct ? existing.successes + 1 : existing.successes,
                        last_attempt: new Date().toISOString(),
                    })
                    .eq('id', existing.id);
            } else {
                await supabase
                    .from('user_progress')
                    .insert({
                        user_id: userId,
                        question_id: question.id,
                        attempts: 1,
                        successes: correct ? 1 : 0,
                        last_attempt: new Date().toISOString(),
                    });
            }
        }
    };

    const handleNext = async () => {
        if (currentIndex < questions.length - 1) {
            setCurrentIndex(currentIndex + 1);
            setSelectedAnswer(null);
            setAnswersRevealed(false);
        } else {
            // Quiz complete - mark attempt as completed
            if (attemptId) {
                await examAttempt.completeAttempt(attemptId);

                // Insert into exam_sessions for Analytics
                try {
                   if (userId) {
                        const durationSeconds = startedAt 
                            ? Math.floor((new Date().getTime() - new Date(startedAt).getTime()) / 1000) 
                            : 0;
                        
                        // Calculate score
                        const totalQuestions = questions.length;
                        const correctCount = score.correct;
                        const scorePercentage = totalQuestions > 0 ? (correctCount / totalQuestions) * 100 : 0;

                        const { error: sessionError } = await supabase.from('exam_sessions').insert({
                            user_id: userId,
                            mode: 'ISLAND_SPECIFIC', // or CUSTOM, but ISLAND_SPECIFIC maps better in analytics
                            island_id: id,
                            total_questions: totalQuestions,
                            correct_answers: correctCount,
                            score_percentage: scorePercentage,
                            status: 'COMPLETED',
                            completed_at: new Date().toISOString(),
                            duration_seconds: durationSeconds
                        });

                        if (sessionError) {
                            console.error('Error saving session to history:', sessionError);
                        }
                   }
                } catch (err) {
                    console.error('Error saving session:', err);
                }
            }
            // Clear timers
            if (timerRef.current) clearInterval(timerRef.current);
            if (autoSaveTimerRef.current) clearInterval(autoSaveTimerRef.current);
            
            navigate('/user/dashboard');
        }
    };

    if (loading) {
        return (
            <UserLayout title="Cargando Quiz">
                 <div className="max-w-4xl mx-auto space-y-6">
                    <Skeleton className="h-20 w-full" />
                    <Skeleton className="h-[400px] w-full" />
                </div>
            </UserLayout>
        );
    }

    if (questions.length === 0) {
        return (
            <UserLayout title="Sin Preguntas">
                <div className="bg-white rounded-lg p-8 text-center shadow">
                    <p className="text-gray-600 mb-4">No hay preguntas disponibles en esta isla aún.</p>
                    <button
                        onClick={() => navigate('/user/dashboard')}
                        className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
                    >
                        Volver al Dashboard
                    </button>
                </div>
            </UserLayout>
        );
    }

    const question = questions[currentIndex];

    return (
        <UserLayout title="Quiz">
            <div className="max-w-4xl mx-auto space-y-6">
                {/* Progress Bar */}
                <div className="bg-white/80 backdrop-blur-md p-4 rounded-lg md:rounded-xl shadow-sm border border-gray-100 sticky top-0 z-30 md:static transition-all">
                    <div className="flex justify-between items-center mb-3">
                         {timeLeft !== null && (
                            <div className="flex items-center text-gray-700 font-bold text-xl font-mono tracking-tight">
                                <Clock className={`mr-2 h-5 w-5 ${timeLeft < 60 ? 'text-red-500 animate-pulse' : 'text-blue-600'}`} />
                                {Math.floor(timeLeft / 60)}:{(timeLeft % 60).toString().padStart(2, '0')}
                            </div>
                        )}
                        <div className="text-xs font-semibold text-gray-500 uppercase tracking-wider flex items-center gap-2">
                             <Trophy size={14} className="text-yellow-500" />
                             <span>Score: {score.correct}/{questions.length}</span>
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

                {/* Question Card */}
                <AnimatePresence mode="wait">
                    <motion.div 
                        key={question.id}
                        initial={{ x: 20, opacity: 0 }}
                        animate={{ x: 0, opacity: 1 }}
                        exit={{ x: -20, opacity: 0 }}
                        transition={{ duration: 0.3, ease: "easeOut" }}
                        className="bg-white p-5 md:p-8 rounded-lg md:rounded-xl shadow-lg border border-gray-100 min-h-[50vh] md:min-h-[400px] flex flex-col"
                    >
                        {question.is_critical && (
                            <div className="mb-3 md:mb-4 bg-red-50 border-l-4 border-red-500 p-2 md:p-3">
                                <p className="text-xs md:text-sm font-semibold text-red-800">⚠️ Pregunta Crítica</p>
                            </div>
                        )}

                        {question.content.image_url && (
                             <div className="mb-6 flex justify-center group relative">
                                <div 
                                    className="relative cursor-zoom-in overflow-hidden rounded-lg shadow-sm border border-gray-200"
                                    onClick={() => setExpandedImage(question.content.image_url || null)}
                                >
                                    <img 
                                        src={question.content.image_url} 
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
                            {question.content.stem}
                        </h2>

                        {/* Options */}
                        <div className="space-y-3 mt-auto">
                            {question.content.options.map((option, index) => {
                                const isSelected = selectedAnswer === index;
                                // Only show colors if answers are revealed (Tutor Mode or Post-Answer in Exam Mode if we wanted, but we keep it hidden in exam)
                                const showCorrect = answersRevealed && option.is_correct;
                                const showWrong = answersRevealed && isSelected && !option.is_correct;

                                return (
                                    <button
                                        key={index}
                                        onClick={() => handleAnswer(index)}
                                        disabled={selectedAnswer !== null} // Disable after selection regardless of mode to prevent changing answer
                                        className={`w-full text-left p-4 rounded-xl border-2 transition-all duration-200 relative group overflow-hidden ${
                                            showCorrect
                                                ? 'bg-green-50 border-green-500'
                                                : showWrong
                                                ? 'bg-red-50 border-red-500'
                                                : isSelected
                                                ? 'border-blue-600 bg-blue-50 shadow-md transform scale-[1.01]'
                                                : 'border-gray-100 hover:border-blue-300 hover:bg-gray-50 hover:shadow-sm'
                                        }`}
                                    >
                                        <div className="flex items-start z-10 relative">
                                            {/* Key Hint */}
                                            <div className="hidden md:flex absolute -left-2 top-1/2 -translate-y-1/2 w-6 h-6 items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity -ml-6">
                                                <span className="text-xs font-mono text-gray-400 border border-gray-200 rounded px-1">{index + 1}</span>
                                            </div>

                                            <div className={`w-6 h-6 rounded-full border-2 mr-4 flex items-center justify-center flex-shrink-0 mt-0.5 transition-colors ${
                                                showCorrect ? 'border-green-500 bg-green-500 text-white' :
                                                showWrong ? 'border-red-500 bg-red-500 text-white' :
                                                isSelected ? 'border-blue-600 bg-blue-600' : 'border-gray-300 group-hover:border-blue-400'
                                            }`}>
                                                 {(showCorrect || showWrong) ? (
                                                    showCorrect ? <CheckCircle size={14} /> : <XCircle size={14} />
                                                 ) : (
                                                    isSelected && <div className="w-2.5 h-2.5 bg-white rounded-full" />
                                                 )}
                                            </div>

                                            <div className="flex-1">
                                                <span className={`font-medium text-sm md:text-base ${isSelected ? 'text-blue-900' : 'text-gray-700'}`}>
                                                    {option.text}
                                                </span>
                                                 {answersRevealed && option.feedback_clinical && isSelected && (
                                                    <motion.div 
                                                        initial={{ opacity: 0, height: 0 }}
                                                        animate={{ opacity: 1, height: 'auto' }}
                                                        className="mt-2 text-xs md:text-sm text-gray-600 bg-white/50 p-2 rounded"
                                                    >
                                                        {option.feedback_clinical}
                                                    </motion.div>
                                                )}
                                            </div>
                                        </div>
                                    </button>
                                );
                            })}
                        </div>

                        {/* Pearl (Teaching Point) - Show only if answers revealed */}
                        {answersRevealed && question.pearl && (
                             <motion.div 
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="mt-4 md:mt-6 bg-yellow-50 border-l-4 border-yellow-500 p-3 md:p-4 rounded"
                            >
                                <div className="flex items-start">
                                    <Lightbulb className="text-yellow-600 mr-2 md:mr-3 flex-shrink-0 mt-1" size={20} />
                                    <div>
                                        <p className="font-semibold text-yellow-900 mb-1 text-sm md:text-base">💡 Perla del Consejo</p>
                                        <p className="text-yellow-800 text-xs md:text-sm">{question.pearl}</p>
                                    </div>
                                </div>
                            </motion.div>
                        )}

                        {/* Next Button - Show if answer selected (regardless of mode) */}
                        {selectedAnswer !== null && (
                            <motion.button
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                onClick={handleNext}
                                className="mt-6 md:mt-8 w-full flex items-center justify-center px-6 py-4 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-all font-bold text-lg shadow-lg hover:shadow-xl transform active:scale-95"
                            >
                                {currentIndex < questions.length - 1 ? (
                                    <>
                                        Siguiente Pregunta <ArrowRight className="ml-2" size={20} />
                                    </>
                                ) : (
                                    <>
                                        Finalizar Quiz <Trophy className="ml-2" size={20} />
                                    </>
                                )}
                            </motion.button>
                        )}
                    </motion.div>
                </AnimatePresence>
                
                {expandedImage && <ImageModal src={expandedImage} onClose={() => setExpandedImage(null)} />}
            </div>

            {/* Submission Confirmation Dialog */}
            {showSubmissionDialog && (
                <ExamSubmissionDialog
                    totalQuestions={questions.length}
                    answeredCount={Object.keys(allAnswers).length}
                    flaggedCount={0}
                    timeElapsed={timeLeft}
                    answers={allAnswers}
                    flagged={{}}
                    questions={questions}
                    onReview={() => setShowSubmissionDialog(false)}
                    onSubmit={handleNext}
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
                            navigate('/user/dashboard');
                        }
                    }}
                />
            )}
            <ConfirmDialog {...dialogProps} />
        </UserLayout>
    );
};
