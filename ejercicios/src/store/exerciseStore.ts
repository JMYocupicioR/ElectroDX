// exerciseStore.ts — Estado global del modo ejercicio
import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { Difficulty, ExerciseAttempt } from '../types/ClinicalCase';

interface PatternStat {
  attempts: number;
  correct: number;
  lastAttempt: string;
  mastered: boolean;
}

interface ExerciseState {
  totalExercises: number;
  correctAnswers: number;
  currentStreak: number;
  bestStreak: number;
  patternStats: Record<string, PatternStat>;
  exerciseHistory: ExerciseAttempt[];
  preferredDifficulty: Difficulty;
  showHints: boolean;

  // Actions
  recordAttempt: (attempt: ExerciseAttempt) => void;
  setDifficulty: (d: Difficulty) => void;
  toggleHints: () => void;
  resetProgress: () => void;
}

export const useExerciseStore = create<ExerciseState>()(
  persist(
    (set) => ({
      totalExercises: 0,
      correctAnswers: 0,
      currentStreak: 0,
      bestStreak: 0,
      patternStats: {},
      exerciseHistory: [],
      preferredDifficulty: 'medium',
      showHints: true,

      recordAttempt: (attempt) =>
        set((state) => {
          const newStreak = attempt.isCorrect ? state.currentStreak + 1 : 0;
          const stats = { ...state.patternStats };
          const existing = stats[attempt.patternId] || { attempts: 0, correct: 0, lastAttempt: '', mastered: false };
          stats[attempt.patternId] = {
            attempts: existing.attempts + 1,
            correct: existing.correct + (attempt.isCorrect ? 1 : 0),
            lastAttempt: attempt.timestamp,
            mastered: (existing.correct + (attempt.isCorrect ? 1 : 0)) / (existing.attempts + 1) >= 0.8
              && (existing.attempts + 1) >= 5,
          };
          return {
            totalExercises: state.totalExercises + 1,
            correctAnswers: state.correctAnswers + (attempt.isCorrect ? 1 : 0),
            currentStreak: newStreak,
            bestStreak: Math.max(state.bestStreak, newStreak),
            patternStats: stats,
            exerciseHistory: [...state.exerciseHistory.slice(-99), attempt],
          };
        }),

      setDifficulty: (d) => set({ preferredDifficulty: d }),
      toggleHints: () => set((s) => ({ showHints: !s.showHints })),
      resetProgress: () => set({
        totalExercises: 0, correctAnswers: 0, currentStreak: 0, bestStreak: 0,
        patternStats: {}, exerciseHistory: [],
      }),
    }),
    { name: 'emg-exercise-progress' }
  )
);
