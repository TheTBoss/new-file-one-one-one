import React from 'react';
import { View, Text, ScrollView, StyleSheet, TouchableOpacity, Alert, useColorScheme } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';
import { getTheme, spacing, fontSize, fontWeight, radius, palette } from '../theme';
import { useWorkoutStore }   from '../store/workoutStore';
import Card       from '../components/common/Card';
import BarChart   from '../components/common/BarChart';
import EmptyState from '../components/common/EmptyState';
import { WorkoutStack }  from '../navigation/TabNavigator';
import { WorkoutSession } from '../types';
import { relativeDate, lastNDays, dayLabel, todayStr } from '../utils/date';
import { totalVolume, formatDuration } from '../utils/helpers';

type Nav = NativeStackNavigationProp<WorkoutStack>;

export default function WorkoutScreen() {
  const colorScheme = useColorScheme();
  const theme = getTheme(colorScheme);
  const nav   = useNavigation<Nav>();
  const bg    = colorScheme === 'dark' ? '#000' : '#F2F2F7';

  const { startSession, completedSessions, thisWeekSessions, deleteSession } = useWorkoutStore();

  const completed  = completedSessions().sort((a, b) => b.startTime.localeCompare(a.startTime));
  const weekSessions = thisWeekSessions();

  const days7 = lastNDays(7);
  const chartData = days7.map((d) => {
    const vol = completed
      .filter((s) => s.date === d)
      .reduce((sum, s) => sum + s.exercises.flatMap(e=>e.sets).filter(st=>!st.isWarmup).reduce((a,st)=>a+st.reps*st.weight,0), 0);
    return { label: dayLabel(d).substring(0, 1), value: vol, highlight: d === todayStr() };
  });

  function handleStart() {
    const today = new Date();
    const name  = `Workout – ${today.toLocaleDateString('en-GB', { weekday: 'short', month: 'short', day: 'numeric' })}`;
    const id    = startSession(name);
    nav.navigate('ActiveWorkout', { sessionId: id });
  }

  function confirmDelete(session: WorkoutSession) {
    Alert.alert('Delete workout?', session.name, [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Delete', style: 'destructive', onPress: () => deleteSession(session.id) },
    ]);
  }

  const totalSets    = weekSessions.reduce((s, sess) => s + sess.exercises.flatMap(e=>e.sets).filter(st=>!st.isWarmup).length, 0);
  const totalVol     = weekSessions.reduce((s, sess) =>
    s + sess.exercises.flatMap(e=>e.sets).filter(st=>!st.isWarmup).reduce((a,st)=>a+st.reps*st.weight, 0), 0);

  return (
    <ScrollView style={[styles.scroll, { backgroundColor: bg }]} contentContainerStyle={styles.content}>
      {/* Start workout */}
      <TouchableOpacity style={[styles.startBtn, { backgroundColor: palette.orange }]} onPress={handleStart} activeOpacity={0.85}>
        <View style={styles.startInner}>
          <Ionicons name="play-circle" size={48} color="#fff" />
          <View style={{ flex: 1 }}>
            <Text style={styles.startTitle}>Start Workout</Text>
            <Text style={styles.startSub}>Track exercises, sets, reps & weight</Text>
          </View>
          <Ionicons name="chevron-forward" size={22} color="rgba(255,255,255,0.7)" />
        </View>
      </TouchableOpacity>

      {/* This week stats */}
      <Card>
        <Text style={[styles.sectionTitle, { color: theme.text }]}>This Week</Text>
        <View style={styles.statsRow}>
          <WeekStat label="Workouts" value={String(weekSessions.length)} color={palette.orange} theme={theme} />
          <WeekStat label="Total Sets"  value={String(totalSets)}   color={palette.blue}   theme={theme} />
          <WeekStat label="Volume"  value={totalVol > 0 ? `${(totalVol/1000).toFixed(1)}t` : '--'} color={palette.green} theme={theme} />
        </View>
      </Card>

      {/* Volume chart */}
      {completed.length >= 2 && (
        <Card>
          <Text style={[styles.sectionTitle, { color: theme.text }]}>Weekly Volume (kg)</Text>
          <BarChart data={chartData} color={palette.orange} height={150} />
        </Card>
      )}

      {/* History */}
      <Text style={[styles.sectionTitle, { color: theme.text, paddingLeft: 2 }]}>Recent Workouts</Text>

      {completed.length === 0 ? (
        <EmptyState
          icon="barbell-outline"
          title="No workouts yet"
          message="Start your first workout to begin tracking your progress"
          actionLabel="Start Workout"
          onAction={handleStart}
        />
      ) : (
        completed.slice(0, 8).map((sess) => (
          <WorkoutRow key={sess.id} session={sess} theme={theme} onDelete={() => confirmDelete(sess)} />
        ))
      )}
    </ScrollView>
  );
}

function WeekStat({ label, value, color, theme }: any) {
  return (
    <View style={{ flex: 1, alignItems: 'center' }}>
      <Text style={[styles.weekStatVal, { color }]}>{value}</Text>
      <Text style={[styles.weekStatLabel, { color: theme.textSecondary }]}>{label}</Text>
    </View>
  );
}

function WorkoutRow({ session, theme, onDelete }: { session: WorkoutSession; theme: any; onDelete: () => void }) {
  const durationMs = session.endTime
    ? new Date(session.endTime).getTime() - new Date(session.startTime).getTime()
    : 0;
  const durationH  = durationMs / 3600000;
  const sets       = session.exercises.flatMap((e) => e.sets).filter((s) => !s.isWarmup).length;
  const vol        = session.exercises.flatMap((e) => e.sets).filter((s)=>!s.isWarmup).reduce((a, s) => a + s.reps * s.weight, 0);

  return (
    <Card style={{ marginBottom: spacing.sm }}>
      <View style={styles.workoutRowTop}>
        <View style={[styles.dateBadge, { backgroundColor: palette.orange + '22' }]}>
          <Text style={[styles.dateBadgeDay,  { color: palette.orange }]}>
            {new Date(session.date).getDate()}
          </Text>
          <Text style={[styles.dateBadgeMon,  { color: palette.orange }]}>
            {new Date(session.date).toLocaleString('default', { month: 'short' }).toUpperCase()}
          </Text>
        </View>
        <View style={{ flex: 1, marginLeft: spacing.md }}>
          <Text style={[styles.workoutName, { color: theme.text }]} numberOfLines={1}>{session.name}</Text>
          <View style={styles.workoutMeta}>
            {durationH > 0 && (
              <View style={styles.metaChip}>
                <Ionicons name="time-outline" size={12} color={theme.textSecondary} />
                <Text style={[styles.metaText, { color: theme.textSecondary }]}>{formatDuration(durationH)}</Text>
              </View>
            )}
            <View style={styles.metaChip}>
              <Ionicons name="layers-outline" size={12} color={theme.textSecondary} />
              <Text style={[styles.metaText, { color: theme.textSecondary }]}>{sets} sets</Text>
            </View>
            {vol > 0 && (
              <View style={styles.metaChip}>
                <Ionicons name="barbell-outline" size={12} color={theme.textSecondary} />
                <Text style={[styles.metaText, { color: theme.textSecondary }]}>{Math.round(vol)}kg</Text>
              </View>
            )}
          </View>
        </View>
        <TouchableOpacity onPress={onDelete}>
          <Ionicons name="trash-outline" size={18} color={theme.textTertiary} />
        </TouchableOpacity>
      </View>
      {session.exercises.length > 0 && (
        <Text style={[styles.exerciseList, { color: theme.textSecondary }]} numberOfLines={1}>
          {session.exercises.map((e) => e.name).join(' · ')}
        </Text>
      )}
    </Card>
  );
}

const styles = StyleSheet.create({
  scroll:    { flex: 1 },
  content:   { padding: spacing.lg, gap: spacing.md },
  startBtn:  { borderRadius: radius.xl, overflow: 'hidden', marginBottom: spacing.sm },
  startInner:{ flexDirection: 'row', alignItems: 'center', padding: spacing.xl, gap: spacing.lg },
  startTitle:{ fontSize: fontSize.xl, fontWeight: fontWeight.bold, color: '#fff' },
  startSub:  { fontSize: fontSize.sm, color: 'rgba(255,255,255,0.8)', marginTop: 2 },
  sectionTitle: { fontSize: fontSize.md, fontWeight: fontWeight.semibold, marginBottom: spacing.md },
  statsRow:  { flexDirection: 'row' },
  weekStatVal:   { fontSize: fontSize.xl, fontWeight: fontWeight.bold },
  weekStatLabel: { fontSize: fontSize.xs, marginTop: 2 },
  workoutRowTop: { flexDirection: 'row', alignItems: 'center' },
  dateBadge:     { width: 48, height: 52, borderRadius: radius.md, alignItems: 'center', justifyContent: 'center' },
  dateBadgeDay:  { fontSize: fontSize.xl, fontWeight: fontWeight.bold, lineHeight: 26 },
  dateBadgeMon:  { fontSize: fontSize.xs, fontWeight: fontWeight.semibold },
  workoutName:   { fontSize: fontSize.md, fontWeight: fontWeight.semibold },
  workoutMeta:   { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm, marginTop: 4 },
  metaChip:      { flexDirection: 'row', alignItems: 'center', gap: 3 },
  metaText:      { fontSize: fontSize.xs },
  exerciseList:  { fontSize: fontSize.xs, marginTop: spacing.sm, paddingTop: spacing.sm, borderTopWidth: StyleSheet.hairlineWidth },
});
