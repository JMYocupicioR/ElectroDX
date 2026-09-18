import { useState, useEffect, useRef, useCallback } from 'react';
import { useAuth } from '../contexts/AuthProvider';
import type { ExamQuestion, ExamConfig, ExamAttemptState } from '../types/exam';
import type { ExamOptionOrder } from '../utils/examQuestionOrder';
import {
  clearExamAttemptCaches,
  createExamAttempt,
  finalizeExamAttempt,
  flushExamProgress,
  saveExamProgress,
} from '../services/examService';

/** Intervalo del auto-guardado periódico */
const AUTOSAVE_INTERVAL_MS = 15_000;
/** Espera tras el último cambio del alumno antes de persistir */
const SAVE_DEBOUNCE_MS = 1_500;

interface UseExamRunnerOptions {
  questions: ExamQuestion[];
  config: ExamConfig;
  resumeAttemptId?: string | null;
  initialState?: Partial<ExamAttemptState>;
  expiresAt?: string | null;
  assignmentId?: string | null;
  /** Permutación de opciones mostrada, para poder reanudar sin corromper respuestas */
  optionOrder?: ExamOptionOrder;
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
  optionOrder,
  onSubmit,
}: UseExamRunnerOptions): UseExamRunnerReturn {
  const { user, session } = useAuth();

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

  const [timeLeft, setTimeLeft] = useState<number | null>(() => {
    if (expiresAt) {
      return Math.max(0, Math.round((new Date(expiresAt).getTime() - Date.now()) / 1000));
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
  const attemptIdRef = useRef(attemptId);
  const accessTokenRef = useRef<string | null>(session?.access_token ?? null);
  useEffect(() => { answersRef.current = answers; }, [answers]);
  useEffect(() => { flaggedRef.current = flagged; }, [flagged]);
  useEffect(() => { currentIndexRef.current = currentIndex; }, [currentIndex]);
  useEffect(() => { timeLeftRef.current = timeLeft; }, [timeLeft]);
  useEffect(() => { attemptIdRef.current = attemptId; }, [attemptId]);
  useEffect(() => { accessTokenRef.current = session?.access_token ?? null; }, [session?.access_token]);

  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const autoSaveRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const debouncedSaveRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const submittingRef = useRef(false);
  const abandonedRef = useRef(false);
  const creatingAttemptRef = useRef(false);

  /** Fin absoluto del examen en ms epoch. null si no hay límite de tiempo. */
  const deadlineRef = useRef<number | null>(expiresAt ? new Date(expiresAt).getTime() : null);

  // El deadline de una evaluación asignada puede llegar después del montaje
  useEffect(() => {
    if (!expiresAt) return;
    deadlineRef.current = new Date(expiresAt).getTime();
  }, [expiresAt]);

  // ─── Hidratación del intento reanudado ──────────────────────────────────────
  // El intento se carga de forma asíncrona, así que `initialState` llega varios
  // renders después del montaje y los inicializadores de useState ya corrieron:
  // sin esto, reanudar un examen perdía las respuestas y el índice guardados.
  const hydratedRef = useRef(false);
  const resumingRef = useRef(Boolean(resumeAttemptId));

  // El id del intento reanudado también llega tarde. Sin esta sincronización el
  // examen reanudado nunca se auto-guardaba ni se marcaba COMPLETED al enviar.
  useEffect(() => {
    if (!resumeAttemptId) return;
    resumingRef.current = true;
    setAttemptId(prev => prev ?? resumeAttemptId);
  }, [resumeAttemptId]);

  useEffect(() => {
    if (hydratedRef.current || !initialState) return;
    hydratedRef.current = true;

    if (initialState.currentQuestionIndex !== undefined) {
      setCurrentIndex(initialState.currentQuestionIndex);
    }
    if (initialState.flagged && Object.keys(initialState.flagged).length > 0) {
      setFlagged(initialState.flagged);
    }
    if (initialState.answers && Object.keys(initialState.answers).length > 0) {
      // Lo ya presente gana: la caché local de una asignación se escribe en cada
      // respuesta, mientras que el intento en base se guarda con debounce.
      setAnswers(prev => ({ ...initialState.answers, ...prev }));
    }
  }, [initialState?.currentQuestionIndex, initialState?.answers, initialState?.flagged]); // eslint-disable-line react-hooks/exhaustive-deps

  /** true cuando ya es seguro escribir en el intento sin pisar lo guardado */
  const canPersist = useCallback(
    () => Boolean(attemptIdRef.current) && (!resumingRef.current || hydratedRef.current),
    []
  );

  const persistNow = useCallback((): Promise<boolean> => {
    const id = attemptIdRef.current;
    // Nunca guardar antes de hidratar un intento reanudado: se sobrescribirían
    // las respuestas del alumno con el estado vacío del montaje.
    if (!id || !canPersist()) return Promise.resolve(false);
    return saveExamProgress(id, {
      currentQuestionIndex: currentIndexRef.current,
      answers: answersRef.current,
      flagged: flaggedRef.current,
      timeRemainingSeconds: timeLeftRef.current,
    });
  }, [canPersist]);

  // ─── Crear intento en Supabase ──────────────────────────────────────────────
  useEffect(() => {
    if (!user || questions.length === 0 || resumeAttemptId) return;
    if (creatingAttemptRef.current) return;
    creatingAttemptRef.current = true;

    createExamAttempt(user.id, config, questions.map(q => q.id), {
      optionOrder,
      expiresAt,
      assignmentId,
    }).then(attempt => {
      if (attempt) setAttemptId(attempt.id);
      else creatingAttemptRef.current = false;
    });
  }, [user, questions.length]); // eslint-disable-line react-hooks/exhaustive-deps

  // ─── Temporizador Continuo en Tiempo Real ────────────────────────────────────
  // Siempre contra una marca absoluta: si el alumno cierra la pestaña, el tiempo
  // sigue corriendo y al reanudar ve los segundos que realmente le quedan.
  useEffect(() => {
    if (questions.length === 0) return;

    if (deadlineRef.current === null) {
      // Prioridad: tiempo restante del intento reanudado > estado actual > límite configurado.
      const seconds =
        initialState?.timeRemainingSeconds ??
        timeLeftRef.current ??
        config.timeLimitSeconds ??
        null;
      if (seconds === null) return;
      deadlineRef.current = Date.now() + seconds * 1000;
      setTimeLeft(seconds);
    }

    const tick = () => {
      const deadline = deadlineRef.current;
      if (deadline === null) return;

      const remaining = Math.max(0, Math.round((deadline - Date.now()) / 1000));
      setTimeLeft(remaining);

      if (remaining <= 0 && !submittingRef.current) {
        handleSubmit();
      }
    };

    tick();
    timerRef.current = setInterval(tick, 1000);

    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, [questions.length, config.timeLimitSeconds, expiresAt, initialState?.timeRemainingSeconds]); // eslint-disable-line react-hooks/exhaustive-deps

  // ─── Auto-guardado periódico ────────────────────────────────────────────────
  useEffect(() => {
    if (!attemptId || questions.length === 0) return;

    autoSaveRef.current = setInterval(() => {
      if (submittingRef.current) return;
      void persistNow();
    }, AUTOSAVE_INTERVAL_MS);

    return () => { if (autoSaveRef.current) clearInterval(autoSaveRef.current); };
  }, [attemptId, questions.length, persistNow]);

  // ─── Guardado inmediato tras cada cambio del alumno (con debounce) ───────────
  useEffect(() => {
    if (!attemptId || submittingRef.current) return;

    if (debouncedSaveRef.current) clearTimeout(debouncedSaveRef.current);
    debouncedSaveRef.current = setTimeout(() => {
      if (!submittingRef.current) void persistNow();
    }, SAVE_DEBOUNCE_MS);

    return () => { if (debouncedSaveRef.current) clearTimeout(debouncedSaveRef.current); };
  }, [answers, flagged, currentIndex, attemptId, persistNow]);

  // ─── Guardado de último instante al ocultar o cerrar la pestaña ──────────────
  useEffect(() => {
    if (!attemptId) return;

    const flush = () => {
      if (submittingRef.current || abandonedRef.current || !canPersist()) return;
      flushExamProgress(
        attemptId,
        {
          currentQuestionIndex: currentIndexRef.current,
          answers: answersRef.current,
          flagged: flaggedRef.current,
          timeRemainingSeconds: timeLeftRef.current,
        },
        accessTokenRef.current
      );
    };

    const onVisibilityChange = () => {
      if (document.visibilityState === 'hidden') flush();
    };

    document.addEventListener('visibilitychange', onVisibilityChange);
    window.addEventListener('pagehide', flush);
    return () => {
      document.removeEventListener('visibilitychange', onVisibilityChange);
      window.removeEventListener('pagehide', flush);
    };
  }, [attemptId, canPersist]);

  // ─── Cleanup al desmontar ───────────────────────────────────────────────────
  useEffect(() => {
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
      if (autoSaveRef.current) clearInterval(autoSaveRef.current);
      if (debouncedSaveRef.current) clearTimeout(debouncedSaveRef.current);
      if (!submittingRef.current && !abandonedRef.current) void persistNow();
    };
  }, [persistNow]);

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
    if (debouncedSaveRef.current) clearTimeout(debouncedSaveRef.current);

    const durationSeconds = Math.floor((Date.now() - startedAtRef.current) / 1000);
    onSubmit?.(answersRef.current, durationSeconds, attemptIdRef.current);
  }, [onSubmit]);

  /** Cierra el intento como ABANDONED. Idempotente: seguro llamarlo varias veces. */
  const abandonExam = useCallback(async () => {
    if (abandonedRef.current || submittingRef.current) return;
    abandonedRef.current = true;

    if (timerRef.current) clearInterval(timerRef.current);
    if (autoSaveRef.current) clearInterval(autoSaveRef.current);
    if (debouncedSaveRef.current) clearTimeout(debouncedSaveRef.current);

    const id = attemptIdRef.current;
    if (id) {
      await finalizeExamAttempt(id, 'ABANDONED');
      clearExamAttemptCaches(id, assignmentId);
    }
  }, [assignmentId]);

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
