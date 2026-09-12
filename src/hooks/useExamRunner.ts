import { useState, useEffect, useRef, useCallback } from 'react';
import { useAuth } from '../contexts/AuthProvider';
import type { ExamQuestion, ExamConfig, ExamAttemptState } from '../types/exam';
import {
  createExamAttempt,
  saveExamProgress,
  finalizeExamAttempt,
  deleteExamAttempt,
} from '../services/examService';

interface UseExamRunnerOptions {
  questions: ExamQuestion[];
  config: ExamConfig;
  resumeAttemptId?: string | null;
  initialState?: Partial<ExamAttemptState>;
  onSubmit?: (answers: Record<string, number>, durationSeconds: number, attemptId: string | null) => void;
}

interface UseExamRunnerReturn {
  // Estado
  currentIndex: number;
  currentQuestion: ExamQuestion | null;
  answers: Record<string, number>;
  flagged: Record<string, boolean>;
  timeLeft: number | null; // segundos restantes, null si no hay límite
  isSubmitting: boolean;
  attemptId: string | null;
  // Acciones
  selectAnswer: (questionId: string, optionIndex: number) => void;
  toggleFlag: (questionId: string) => void;
  goToQuestion: (index: number) => void;
  goNext: () => void;
  goPrev: () => void;
  submitExam: () => Promise<void>;
  abandonExam: () => Promise<void>;
}

export function useExamRunner({
  questions,
  config,
  resumeAttemptId = null,
  initialState,
  onSubmit,
}: UseExamRunnerOptions): UseExamRunnerReturn {
  const { user } = useAuth();

  const [currentIndex, setCurrentIndex] = useState(initialState?.currentQuestionIndex ?? 0);
  const [answers, setAnswers] = useState<Record<string, number>>(initialState?.answers ?? {});
  const [flagged, setFlagged] = useState<Record<string, boolean>>(initialState?.flagged ?? {});
  const [timeLeft, setTimeLeft] = useState<number | null>(
    initialState?.timeRemainingSeconds !== undefined
      ? initialState.timeRemainingSeconds
      : config.timeLimitSeconds ?? null
  );
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [attemptId, setAttemptId] = useState<string | null>(resumeAttemptId);
  const startedAtRef = useRef<number>(Date.now());

  // Refs para acceso actualizado en timers y auto-save (evita stale closures)
  const answersRef = useRef(answers);
  const flaggedRef = useRef(flagged);
  const currentIndexRef = useRef(currentIndex);
  const timeLeftRef = useRef(timeLeft);
  useEffect(() => { answersRef.current = answers; }, [answers]);
  useEffect(() => { flaggedRef.current = flagged; }, [flagged]);
  useEffect(() => { currentIndexRef.current = currentIndex; }, [currentIndex]);
  useEffect(() => { timeLeftRef.current = timeLeft; }, [timeLeft]);

  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const autoSaveRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const submittingRef = useRef(false);

  // ─── Crear intento en Supabase ──────────────────────────────────────────────
  useEffect(() => {
    if (!user || questions.length === 0 || resumeAttemptId) return;

    createExamAttempt(user.id, config, questions.map(q => q.id)).then(attempt => {
      if (attempt) setAttemptId(attempt.id);
    });
  }, [user, questions.length]); // eslint-disable-line react-hooks/exhaustive-deps

  // ─── Temporizador ───────────────────────────────────────────────────────────
  useEffect(() => {
    if (config.timeLimitSeconds == null || questions.length === 0) return;

    timerRef.current = setInterval(() => {
      setTimeLeft(prev => {
        if (prev === null) return null;
        if (prev <= 1) {
          // Auto-envío al agotar el tiempo
          if (!submittingRef.current) handleSubmit();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, [questions.length, config.timeLimitSeconds]); // eslint-disable-line react-hooks/exhaustive-deps

  // ─── Auto-guardado cada 15 segundos ─────────────────────────────────────────
  useEffect(() => {
    if (!attemptId || questions.length === 0) return;

    autoSaveRef.current = setInterval(() => {
      if (submittingRef.current) return;
      saveExamProgress(attemptId, {
        currentQuestionIndex: currentIndexRef.current,
        answers: answersRef.current,
        flagged: flaggedRef.current,
        timeRemainingSeconds: timeLeftRef.current,
      });
    }, 15000);

    return () => { if (autoSaveRef.current) clearInterval(autoSaveRef.current); };
  }, [attemptId, questions.length]);

  // ─── Cleanup al desmontar ───────────────────────────────────────────────────
  useEffect(() => {
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
      if (autoSaveRef.current) clearInterval(autoSaveRef.current);
    };
  }, []);

  // ─── Acciones ───────────────────────────────────────────────────────────────

  const selectAnswer = useCallback((questionId: string, optionIndex: number) => {
    setAnswers(prev => ({ ...prev, [questionId]: optionIndex }));
  }, []);

  const toggleFlag = useCallback((questionId: string) => {
    setFlagged(prev => ({ ...prev, [questionId]: !prev[questionId] }));
  }, []);

  const goToQuestion = useCallback((index: number) => {
    if (index >= 0 && index < questions.length) setCurrentIndex(index);
  }, [questions.length]);

  const goNext = useCallback(() => {
    setCurrentIndex(prev => Math.min(prev + 1, questions.length - 1));
  }, [questions.length]);

  const goPrev = useCallback(() => {
    setCurrentIndex(prev => Math.max(prev - 1, 0));
  }, []);

  const handleSubmit = useCallback(async () => {
    if (submittingRef.current) return;
    submittingRef.current = true;
    setIsSubmitting(true);

    if (timerRef.current) clearInterval(timerRef.current);
    if (autoSaveRef.current) clearInterval(autoSaveRef.current);

    const durationSeconds = Math.floor((Date.now() - startedAtRef.current) / 1000);
    onSubmit?.(answersRef.current, durationSeconds, attemptId);
  }, [onSubmit, attemptId]);

  const abandonExam = useCallback(async () => {
    if (timerRef.current) clearInterval(timerRef.current);
    if (autoSaveRef.current) clearInterval(autoSaveRef.current);
    if (attemptId) {
      await finalizeExamAttempt(attemptId, 'ABANDONED');
    }
  }, [attemptId]);

  return {
    currentIndex,
    currentQuestion: questions[currentIndex] ?? null,
    answers,
    flagged,
    timeLeft,
    isSubmitting,
    attemptId,
    selectAnswer,
    toggleFlag,
    goToQuestion,
    goNext,
    goPrev,
    submitExam: handleSubmit,
    abandonExam,
  };
}

export { deleteExamAttempt };
