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
  expiresAt?: string | null;
  assignmentId?: string | null;
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
  expiresAt = null,
  assignmentId = null,
  onSubmit,
}: UseExamRunnerOptions): UseExamRunnerReturn {
  const { user } = useAuth();

  const [currentIndex, setCurrentIndex] = useState(initialState?.currentQuestionIndex ?? 0);
  
  // Recuperar respuestas cacheadas para esta asignación si existen
  const [answers, setAnswers] = useState<Record<string, number>>(() => {
    if (assignmentId) {
      try {
        const cached = localStorage.getItem(`neurosafe_asg_answers_${assignmentId}`);
        if (cached) return JSON.parse(cached);
      } catch {}
    }
    return initialState?.answers ?? {};
  });

  const [flagged, setFlagged] = useState<Record<string, boolean>>(initialState?.flagged ?? {});
  
  const expiresAtMs = useRef<number | null>(
    expiresAt ? new Date(expiresAt).getTime() : null
  );

  // Inicializar tiempo restante calculando contra expiresAt si está definido
  const [timeLeft, setTimeLeft] = useState<number | null>(() => {
    if (expiresAt) {
      const ms = new Date(expiresAt).getTime();
      return Math.max(0, Math.floor((ms - Date.now()) / 1000));
    }
    if (initialState?.timeRemainingSeconds !== undefined) {
      return initialState.timeRemainingSeconds;
    }
    return config.timeLimitSeconds ?? null;
  });

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

  // ─── Temporizador Continuo en Tiempo Real ────────────────────────────────────
  useEffect(() => {
    if (questions.length === 0) return;
    if (!expiresAtMs.current && config.timeLimitSeconds == null) return;

    const tick = () => {
      if (expiresAtMs.current) {
        // Cálculo absoluto contra la marca de tiempo límite
        const remaining = Math.max(0, Math.floor((expiresAtMs.current - Date.now()) / 1000));
        setTimeLeft(remaining);
        if (remaining <= 0) {
          if (!submittingRef.current) handleSubmit();
        }
      } else {
        setTimeLeft(prev => {
          if (prev === null) return null;
          if (prev <= 1) {
            if (!submittingRef.current) handleSubmit();
            return 0;
          }
          return prev - 1;
        });
      }
    };

    tick();
    timerRef.current = setInterval(tick, 1000);

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
    setAnswers(prev => {
      const next = { ...prev, [questionId]: optionIndex };
      if (assignmentId) {
        try {
          localStorage.setItem(`neurosafe_asg_answers_${assignmentId}`, JSON.stringify(next));
        } catch {}
      }
      return next;
    });
  }, [assignmentId]);

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
