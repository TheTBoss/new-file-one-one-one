import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { WorkoutSession, WorkoutExercise, ExerciseSet } from '../types';
import { generateId } from '../utils/helpers';
import { todayStr } from '../utils/date';

interface WorkoutState {
  sessions: WorkoutSession[];
  activeSessionId: string | null;

  startSession: (name: string) => string;         // returns new session id
  endSession: (id: string) => void;
  discardSession: (id: string) => void;
  deleteSession: (id: string) => void;
  updateSessionName: (id: string, name: string) => void;

  addExercise: (sessionId: string, exercise: Omit<WorkoutExercise, 'id' | 'sets'>) => string;
  removeExercise: (sessionId: string, exerciseId: string) => void;

  addSet: (sessionId: string, exerciseId: string, set?: Partial<ExerciseSet>) => void;
  updateSet: (sessionId: string, exerciseId: string, setId: string, updates: Partial<ExerciseSet>) => void;
  removeSet: (sessionId: string, exerciseId: string, setId: string) => void;
  toggleSetDone: (sessionId: string, exerciseId: string, setId: string) => void;

  getSession: (id: string) => WorkoutSession | undefined;
  completedSessions: () => WorkoutSession[];
  thisWeekSessions: () => WorkoutSession[];
}

export const useWorkoutStore = create<WorkoutState>()(
  persist(
    (set, get) => ({
      sessions: [],
      activeSessionId: null,

      startSession: (name) => {
        const id = generateId();
        const session: WorkoutSession = {
          id,
          name,
          date: todayStr(),
          startTime: new Date().toISOString(),
          notes: '',
          caloriesBurned: 0,
          isCompleted: false,
          exercises: [],
        };
        set((s) => ({ sessions: [...s.sessions, session], activeSessionId: id }));
        return id;
      },

      endSession: (id) =>
        set((s) => ({
          sessions: s.sessions.map((sess) =>
            sess.id === id
              ? { ...sess, endTime: new Date().toISOString(), isCompleted: true }
              : sess
          ),
          activeSessionId: null,
        })),

      discardSession: (id) =>
        set((s) => ({
          sessions: s.sessions.filter((sess) => sess.id !== id),
          activeSessionId: null,
        })),

      deleteSession: (id) =>
        set((s) => ({ sessions: s.sessions.filter((sess) => sess.id !== id) })),

      updateSessionName: (id, name) =>
        set((s) => ({
          sessions: s.sessions.map((sess) =>
            sess.id === id ? { ...sess, name } : sess
          ),
        })),

      addExercise: (sessionId, exercise) => {
        const id = generateId();
        set((s) => ({
          sessions: s.sessions.map((sess) =>
            sess.id === sessionId
              ? {
                  ...sess,
                  exercises: [
                    ...sess.exercises,
                    { ...exercise, id, sets: [] },
                  ],
                }
              : sess
          ),
        }));
        // Add first empty set automatically
        const prevSet = undefined;
        get().addSet(sessionId, id, { setNumber: 1, reps: 8, weight: 0 });
        return id;
      },

      removeExercise: (sessionId, exerciseId) =>
        set((s) => ({
          sessions: s.sessions.map((sess) =>
            sess.id === sessionId
              ? { ...sess, exercises: sess.exercises.filter((e) => e.id !== exerciseId) }
              : sess
          ),
        })),

      addSet: (sessionId, exerciseId, partial = {}) =>
        set((s) => ({
          sessions: s.sessions.map((sess) => {
            if (sess.id !== sessionId) return sess;
            return {
              ...sess,
              exercises: sess.exercises.map((ex) => {
                if (ex.id !== exerciseId) return ex;
                const prevSet = ex.sets[ex.sets.length - 1];
                const newSet: ExerciseSet = {
                  id: generateId(),
                  setNumber: ex.sets.length + 1,
                  reps: prevSet?.reps ?? 8,
                  weight: prevSet?.weight ?? 0,
                  weightUnit: prevSet?.weightUnit ?? 'kg',
                  durationSeconds: 0,
                  isWarmup: false,
                  isPersonalRecord: false,
                  rpe: 0,
                  isDone: false,
                  ...partial,
                };
                return { ...ex, sets: [...ex.sets, newSet] };
              }),
            };
          }),
        })),

      updateSet: (sessionId, exerciseId, setId, updates) =>
        set((s) => ({
          sessions: s.sessions.map((sess) => {
            if (sess.id !== sessionId) return sess;
            return {
              ...sess,
              exercises: sess.exercises.map((ex) => {
                if (ex.id !== exerciseId) return ex;
                return {
                  ...ex,
                  sets: ex.sets.map((st) =>
                    st.id === setId ? { ...st, ...updates } : st
                  ),
                };
              }),
            };
          }),
        })),

      removeSet: (sessionId, exerciseId, setId) =>
        set((s) => ({
          sessions: s.sessions.map((sess) => {
            if (sess.id !== sessionId) return sess;
            return {
              ...sess,
              exercises: sess.exercises.map((ex) => {
                if (ex.id !== exerciseId) return ex;
                return { ...ex, sets: ex.sets.filter((st) => st.id !== setId) };
              }),
            };
          }),
        })),

      toggleSetDone: (sessionId, exerciseId, setId) =>
        set((s) => ({
          sessions: s.sessions.map((sess) => {
            if (sess.id !== sessionId) return sess;
            return {
              ...sess,
              exercises: sess.exercises.map((ex) => {
                if (ex.id !== exerciseId) return ex;
                return {
                  ...ex,
                  sets: ex.sets.map((st) =>
                    st.id === setId ? { ...st, isDone: !st.isDone } : st
                  ),
                };
              }),
            };
          }),
        })),

      getSession: (id) => get().sessions.find((s) => s.id === id),

      completedSessions: () => get().sessions.filter((s) => s.isCompleted),

      thisWeekSessions: () => {
        const monday = new Date();
        monday.setDate(monday.getDate() - ((monday.getDay() + 6) % 7));
        monday.setHours(0, 0, 0, 0);
        return get()
          .sessions.filter((s) => s.isCompleted && new Date(s.startTime) >= monday);
      },
    }),
    {
      name: 'ht-workout',
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);
