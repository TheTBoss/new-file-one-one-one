import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  View, Text, ScrollView, StyleSheet, TouchableOpacity, TextInput,
  Alert, Modal, FlatList, useColorScheme,
} from 'react-native';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { getTheme, spacing, fontSize, fontWeight, radius, palette } from '../theme';
import { useWorkoutStore } from '../store/workoutStore';
import { WorkoutStack }   from '../navigation/TabNavigator';
import { WorkoutExercise, ExerciseSet, MuscleGroup } from '../types';
import { formatElapsed, EXERCISE_LIBRARY } from '../utils/helpers';

type RouteT = RouteProp<WorkoutStack, 'ActiveWorkout'>;

export default function ActiveWorkoutScreen() {
  const colorScheme = useColorScheme();
  const theme = getTheme(colorScheme);
  const nav   = useNavigation();
  const route = useRoute<RouteT>();
  const { sessionId } = route.params;

  const {
    getSession, endSession, discardSession, updateSessionName,
    addExercise, removeExercise, addSet, removeSet, updateSet, toggleSetDone,
  } = useWorkoutStore();

  const session = getSession(sessionId);

  const [elapsed,     setElapsed]     = useState(0);
  const [restLeft,    setRestLeft]    = useState(0);
  const [showPicker,  setShowPicker]  = useState(false);
  const [pickSearch,  setPickSearch]  = useState('');
  const [pickGroup,   setPickGroup]   = useState<MuscleGroup | 'all'>('all');
  const [sessionName, setSessionName] = useState(session?.name ?? 'Workout');

  // Timer
  useEffect(() => {
    const id = setInterval(() => {
      setElapsed((e) => e + 1);
      setRestLeft((r) => Math.max(0, r - 1));
    }, 1000);
    return () => clearInterval(id);
  }, []);

  useEffect(() => {
    updateSessionName(sessionId, sessionName);
  }, [sessionName]);

  if (!session) {
    return (
      <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
        <Text>Session not found</Text>
      </View>
    );
  }

  const allGroups: (MuscleGroup | 'all')[] = [
    'all', 'chest', 'back', 'shoulders', 'biceps', 'triceps',
    'core', 'quads', 'hamstrings', 'glutes', 'calves', 'cardio',
  ];

  const filteredExercises = EXERCISE_LIBRARY.filter((e) => {
    const matchGroup = pickGroup === 'all' || e.muscleGroup === pickGroup;
    const matchSearch = !pickSearch || e.name.toLowerCase().includes(pickSearch.toLowerCase());
    return matchGroup && matchSearch;
  });

  function handleAddExercise(preset: typeof EXERCISE_LIBRARY[0]) {
    addExercise(sessionId, {
      name: preset.name,
      muscleGroup: preset.muscleGroup as MuscleGroup,
      exerciseType: preset.exerciseType as any,
      notes: '',
      order: session!.exercises.length,
      restTimeSeconds: 90,
    });
    setShowPicker(false);
  }

  function handleFinish() {
    Alert.alert('Finish Workout?', 'Your session will be saved.', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Finish & Save', onPress: () => {
          endSession(sessionId);
          nav.goBack();
        },
      },
    ]);
  }

  function handleDiscard() {
    Alert.alert('Discard Workout?', 'All progress will be lost.', [
      { text: 'Keep going', style: 'cancel' },
      {
        text: 'Discard', style: 'destructive', onPress: () => {
          discardSession(sessionId);
          nav.goBack();
        },
      },
    ]);
  }

  const bg = colorScheme === 'dark' ? '#000' : '#F2F2F7';

  const totalSets = session.exercises.flatMap((e) => e.sets).filter((s) => !s.isWarmup).length;
  const totalVol  = session.exercises.flatMap((e) => e.sets).filter((s)=>!s.isWarmup).reduce((a,s)=>a+s.reps*s.weight,0);

  return (
    <View style={[styles.container, { backgroundColor: bg }]}>
      {/* Header */}
      <View style={[styles.header, { backgroundColor: theme.cardBackground, borderBottomColor: theme.border }]}>
        <TouchableOpacity onPress={handleDiscard}>
          <Text style={[styles.discardBtn, { color: palette.red }]}>Discard</Text>
        </TouchableOpacity>
        <TextInput
          style={[styles.sessionName, { color: theme.text }]}
          value={sessionName}
          onChangeText={setSessionName}
        />
        <TouchableOpacity onPress={handleFinish} style={[styles.finishBtn, { backgroundColor: palette.green }]}>
          <Text style={styles.finishBtnText}>Finish</Text>
        </TouchableOpacity>
      </View>

      {/* Timer bar */}
      <View style={[styles.timerBar, { backgroundColor: theme.cardBackground }]}>
        <View style={styles.timerStat}>
          <Text style={[styles.timerTime, { color: theme.text }]}>{formatElapsed(elapsed)}</Text>
          <Text style={[styles.timerLabel, { color: theme.textSecondary }]}>Duration</Text>
        </View>
        <View style={[styles.timerDivider, { backgroundColor: theme.border }]} />
        <View style={styles.timerStat}>
          <Text style={[styles.timerVal, { color: palette.blue }]}>{totalSets}</Text>
          <Text style={[styles.timerLabel, { color: theme.textSecondary }]}>Sets</Text>
        </View>
        <View style={[styles.timerDivider, { backgroundColor: theme.border }]} />
        <View style={styles.timerStat}>
          <Text style={[styles.timerVal, { color: palette.orange }]}>{Math.round(totalVol)}kg</Text>
          <Text style={[styles.timerLabel, { color: theme.textSecondary }]}>Volume</Text>
        </View>
      </View>

      {/* Rest timer banner */}
      {restLeft > 0 && (
        <View style={[styles.restBanner, { backgroundColor: palette.orange + '22', borderColor: palette.orange }]}>
          <Ionicons name="timer-outline" size={16} color={palette.orange} />
          <Text style={[styles.restText, { color: palette.orange }]}>Rest: {restLeft}s</Text>
          <TouchableOpacity onPress={() => setRestLeft(0)}>
            <Text style={{ color: palette.orange, fontWeight: '700', fontSize: fontSize.sm }}>Skip</Text>
          </TouchableOpacity>
        </View>
      )}

      {/* Exercises */}
      <ScrollView contentContainerStyle={styles.exerciseList} keyboardShouldPersistTaps="handled">
        {session.exercises.length === 0 ? (
          <View style={{ padding: spacing.xl, alignItems: 'center', gap: spacing.md }}>
            <Ionicons name="barbell-outline" size={52} color={theme.textTertiary} />
            <Text style={[{ color: theme.textSecondary, fontSize: fontSize.md, textAlign: 'center' }]}>
              Add your first exercise to get started
            </Text>
          </View>
        ) : (
          session.exercises.map((exercise) => (
            <ExerciseBlock
              key={exercise.id}
              exercise={exercise}
              sessionId={sessionId}
              theme={theme}
              onStartRest={() => setRestLeft(exercise.restTimeSeconds)}
              onAddSet={() => addSet(sessionId, exercise.id)}
              onRemoveExercise={() => removeExercise(sessionId, exercise.id)}
              onUpdateSet={(setId, updates) => updateSet(sessionId, exercise.id, setId, updates)}
              onRemoveSet={(setId) => removeSet(sessionId, exercise.id, setId)}
              onToggleDone={(setId) => toggleSetDone(sessionId, exercise.id, setId)}
            />
          ))
        )}

        {/* Add exercise */}
        <TouchableOpacity
          style={[styles.addExBtn, { backgroundColor: theme.cardBackground, borderColor: theme.primary }]}
          onPress={() => { setPickSearch(''); setPickGroup('all'); setShowPicker(true); }}
        >
          <Ionicons name="add-circle" size={20} color={theme.primary} />
          <Text style={[styles.addExText, { color: theme.primary }]}>Add Exercise</Text>
        </TouchableOpacity>
      </ScrollView>

      {/* Exercise picker modal */}
      <Modal visible={showPicker} animationType="slide" presentationStyle="pageSheet">
        <View style={[styles.modalContainer, { backgroundColor: bg }]}>
          <View style={[styles.modalHeader, { borderBottomColor: theme.border }]}>
            <Text style={[styles.modalTitle, { color: theme.text }]}>Choose Exercise</Text>
            <TouchableOpacity onPress={() => setShowPicker(false)}>
              <Ionicons name="close-circle" size={28} color={theme.textSecondary} />
            </TouchableOpacity>
          </View>

          <TextInput
            style={[styles.searchInput, { backgroundColor: theme.inputBackground, color: theme.text, borderColor: theme.border }]}
            placeholder="Search exercises..."
            placeholderTextColor={theme.textTertiary}
            value={pickSearch}
            onChangeText={setPickSearch}
          />

          {/* Muscle group filter */}
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ maxHeight: 44, marginBottom: spacing.sm }}>
            <View style={{ flexDirection: 'row', gap: 8, paddingHorizontal: spacing.lg }}>
              {allGroups.map((g) => (
                <TouchableOpacity
                  key={g}
                  style={[styles.groupChip, {
                    backgroundColor: pickGroup === g ? theme.primary : theme.cardBackground,
                    borderColor: theme.primary, borderWidth: 1,
                  }]}
                  onPress={() => setPickGroup(g)}
                >
                  <Text style={{ fontSize: fontSize.xs, fontWeight: '600', color: pickGroup === g ? '#fff' : theme.primary }}>
                    {g === 'all' ? 'All' : g.charAt(0).toUpperCase() + g.slice(1)}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </ScrollView>

          <FlatList
            data={filteredExercises}
            keyExtractor={(item, i) => `${item.name}-${i}`}
            renderItem={({ item }) => (
              <TouchableOpacity
                style={[styles.exercisePickRow, { borderBottomColor: theme.border }]}
                onPress={() => handleAddExercise(item)}
              >
                <View style={{ flex: 1 }}>
                  <Text style={[styles.exPickName, { color: theme.text }]}>{item.name}</Text>
                  <Text style={[styles.exPickMeta, { color: theme.textSecondary }]}>
                    {item.muscleGroup} · {item.exerciseType}
                  </Text>
                </View>
                <Ionicons name="add-circle-outline" size={22} color={theme.primary} />
              </TouchableOpacity>
            )}
          />
        </View>
      </Modal>
    </View>
  );
}

// ─── Exercise block ───────────────────────────────────────────────────────────

function ExerciseBlock({
  exercise, sessionId, theme,
  onStartRest, onAddSet, onRemoveExercise, onUpdateSet, onRemoveSet, onToggleDone,
}: {
  exercise: WorkoutExercise;
  sessionId: string;
  theme: any;
  onStartRest: () => void;
  onAddSet: () => void;
  onRemoveExercise: () => void;
  onUpdateSet: (setId: string, updates: Partial<ExerciseSet>) => void;
  onRemoveSet: (setId: string) => void;
  onToggleDone: (setId: string) => void;
}) {
  const maxWeight = Math.max(...exercise.sets.map((s) => s.weight), 0);
  const doneCount = exercise.sets.filter((s) => s.isDone).length;

  return (
    <View style={[styles.exBlock, { backgroundColor: theme.cardBackground }]}>
      {/* Exercise header */}
      <View style={styles.exHeader}>
        <View style={{ flex: 1 }}>
          <Text style={[styles.exName, { color: theme.text }]}>{exercise.name}</Text>
          <Text style={[styles.exMeta, { color: theme.textSecondary }]}>
            {exercise.muscleGroup} · {exercise.sets.length} sets
            {maxWeight > 0 ? ` · Best: ${maxWeight}kg` : ''}
          </Text>
        </View>
        <TouchableOpacity onPress={onRemoveExercise} style={{ padding: 4 }}>
          <Ionicons name="close-circle-outline" size={20} color={theme.textTertiary} />
        </TouchableOpacity>
      </View>

      {/* Sets header */}
      <View style={[styles.setHeader, { borderTopColor: theme.border, borderBottomColor: theme.border }]}>
        <Text style={[styles.setCol, { color: theme.textTertiary, width: 36 }]}>SET</Text>
        <Text style={[styles.setCol, { color: theme.textTertiary, flex: 1, textAlign: 'center' }]}>KG</Text>
        <Text style={[styles.setCol, { color: theme.textTertiary, flex: 1, textAlign: 'center' }]}>REPS</Text>
        <View style={{ width: 40 }} />
      </View>

      {/* Sets */}
      {exercise.sets.map((s) => (
        <SetRow
          key={s.id}
          set={s}
          theme={theme}
          onUpdate={(updates) => onUpdateSet(s.id, updates)}
          onRemove={() => onRemoveSet(s.id)}
          onDone={() => { onToggleDone(s.id); if (!s.isDone) onStartRest(); }}
        />
      ))}

      {/* Add set */}
      <TouchableOpacity style={[styles.addSetBtn, { borderTopColor: theme.border }]} onPress={onAddSet}>
        <Ionicons name="add" size={16} color={theme.primary} />
        <Text style={[styles.addSetText, { color: theme.primary }]}>Add Set</Text>
      </TouchableOpacity>
    </View>
  );
}

function SetRow({
  set, theme, onUpdate, onRemove, onDone,
}: { set: ExerciseSet; theme: any; onUpdate: (u: Partial<ExerciseSet>) => void; onRemove: () => void; onDone: () => void }) {
  const [weight, setWeight] = useState(String(set.weight || ''));
  const [reps,   setReps]   = useState(String(set.reps   || ''));

  return (
    <View style={[styles.setRow, { borderBottomColor: theme.border, backgroundColor: set.isDone ? palette.green + '11' : 'transparent' }]}>
      {/* Set number */}
      <View style={[styles.setNumBadge, { backgroundColor: set.isWarmup ? palette.orange + '33' : set.isDone ? palette.green : theme.border }]}>
        <Text style={[styles.setNumText, { color: set.isWarmup ? palette.orange : set.isDone ? '#fff' : theme.textSecondary }]}>
          {set.isWarmup ? 'W' : String(set.setNumber)}
        </Text>
      </View>

      {/* Weight */}
      <View style={[styles.setInput, { borderColor: theme.border }]}>
        <TextInput
          style={{ color: theme.text, textAlign: 'center', fontSize: fontSize.md, fontWeight: '600' }}
          keyboardType="decimal-pad"
          value={weight}
          onChangeText={setWeight}
          onBlur={() => onUpdate({ weight: parseFloat(weight) || 0 })}
          placeholder="0"
          placeholderTextColor={theme.textTertiary}
        />
      </View>

      {/* Reps */}
      <View style={styles.repsControl}>
        <TouchableOpacity onPress={() => {
          const v = Math.max(0, (parseInt(reps) || 0) - 1);
          setReps(String(v)); onUpdate({ reps: v });
        }}>
          <Ionicons name="remove-circle-outline" size={22} color={theme.textSecondary} />
        </TouchableOpacity>
        <Text style={[styles.repsNum, { color: theme.text }]}>{reps || '0'}</Text>
        <TouchableOpacity onPress={() => {
          const v = (parseInt(reps) || 0) + 1;
          setReps(String(v)); onUpdate({ reps: v });
        }}>
          <Ionicons name="add-circle-outline" size={22} color={theme.textSecondary} />
        </TouchableOpacity>
      </View>

      {/* Done / delete */}
      <TouchableOpacity
        style={[styles.doneBtn, { backgroundColor: set.isDone ? palette.green : theme.border }]}
        onPress={onDone}
        onLongPress={onRemove}
      >
        <Ionicons name={set.isDone ? 'checkmark' : 'checkmark-outline'} size={16} color={set.isDone ? '#fff' : theme.textSecondary} />
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container:    { flex: 1 },
  header:       { flexDirection: 'row', alignItems: 'center', paddingHorizontal: spacing.lg, paddingVertical: spacing.md, borderBottomWidth: 1 },
  discardBtn:   { fontSize: fontSize.sm, fontWeight: fontWeight.semibold, width: 60 },
  sessionName:  { flex: 1, textAlign: 'center', fontSize: fontSize.md, fontWeight: fontWeight.bold },
  finishBtn:    { paddingHorizontal: spacing.md, paddingVertical: 6, borderRadius: radius.md, width: 60, alignItems: 'center' },
  finishBtnText:{ color: '#fff', fontWeight: fontWeight.bold, fontSize: fontSize.sm },

  timerBar:     { flexDirection: 'row', alignItems: 'center', paddingVertical: spacing.md, borderBottomWidth: StyleSheet.hairlineWidth },
  timerStat:    { flex: 1, alignItems: 'center' },
  timerTime:    { fontSize: fontSize.xl, fontWeight: fontWeight.bold, fontVariant: ['tabular-nums'] },
  timerVal:     { fontSize: fontSize.xl, fontWeight: fontWeight.bold },
  timerLabel:   { fontSize: fontSize.xs, marginTop: 2 },
  timerDivider: { width: 1, height: 32 },

  restBanner:   { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', margin: spacing.md, padding: spacing.sm, borderRadius: radius.md, borderWidth: 1, gap: spacing.sm },
  restText:     { flex: 1, fontWeight: fontWeight.semibold },

  exerciseList: { padding: spacing.md, gap: spacing.md, paddingBottom: 40 },

  addExBtn:     { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: spacing.sm, padding: spacing.md, borderRadius: radius.lg, borderWidth: 1, borderStyle: 'dashed', marginTop: spacing.sm },
  addExText:    { fontWeight: fontWeight.semibold, fontSize: fontSize.sm },

  exBlock:      { borderRadius: radius.lg, overflow: 'hidden' },
  exHeader:     { flexDirection: 'row', alignItems: 'center', padding: spacing.md },
  exName:       { fontSize: fontSize.md, fontWeight: fontWeight.bold },
  exMeta:       { fontSize: fontSize.xs, marginTop: 2 },

  setHeader:    { flexDirection: 'row', alignItems: 'center', paddingHorizontal: spacing.md, paddingVertical: 6, borderTopWidth: 1, borderBottomWidth: 1 },
  setCol:       { fontSize: fontSize.xs, fontWeight: fontWeight.semibold },

  setRow:       { flexDirection: 'row', alignItems: 'center', paddingHorizontal: spacing.md, paddingVertical: 8, borderBottomWidth: StyleSheet.hairlineWidth, gap: spacing.sm },
  setNumBadge:  { width: 32, height: 32, borderRadius: 16, alignItems: 'center', justifyContent: 'center' },
  setNumText:   { fontSize: fontSize.sm, fontWeight: fontWeight.bold },
  setInput:     { flex: 1, height: 36, borderWidth: 1, borderRadius: radius.sm, alignItems: 'center', justifyContent: 'center' },
  repsControl:  { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 4 },
  repsNum:      { fontSize: fontSize.lg, fontWeight: fontWeight.bold, minWidth: 28, textAlign: 'center' },
  doneBtn:      { width: 36, height: 36, borderRadius: 18, alignItems: 'center', justifyContent: 'center' },

  addSetBtn:    { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: spacing.xs, paddingVertical: spacing.sm, borderTopWidth: StyleSheet.hairlineWidth },
  addSetText:   { fontSize: fontSize.sm, fontWeight: fontWeight.semibold },

  modalContainer: { flex: 1 },
  modalHeader:    { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: spacing.lg, borderBottomWidth: 1 },
  modalTitle:     { fontSize: fontSize.xl, fontWeight: fontWeight.bold },
  searchInput:    { margin: spacing.lg, padding: spacing.md, borderRadius: radius.md, borderWidth: 1, fontSize: fontSize.md },
  groupChip:      { paddingHorizontal: spacing.sm, paddingVertical: 6, borderRadius: radius.full },
  exercisePickRow:{ flexDirection: 'row', alignItems: 'center', padding: spacing.lg, borderBottomWidth: StyleSheet.hairlineWidth },
  exPickName:     { fontSize: fontSize.md, fontWeight: fontWeight.medium },
  exPickMeta:     { fontSize: fontSize.xs, marginTop: 2 },
});
