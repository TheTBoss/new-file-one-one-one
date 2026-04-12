import React from 'react';
import {
  View, Text, ScrollView, StyleSheet, TouchableOpacity,
  useColorScheme, Alert,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';
import { getTheme, spacing, fontSize, fontWeight, radius, palette } from '../theme';
import { useNutritionStore }  from '../store/nutritionStore';
import { useSleepStore }      from '../store/sleepStore';
import { useHabitStore }      from '../store/habitStore';
import { useWorkoutStore }    from '../store/workoutStore';
import { useLifestyleStore }  from '../store/lifestyleStore';
import { useBodyStore }       from '../store/bodyStore';
import { useSettingsStore }   from '../store/settingsStore';
import Card from '../components/common/Card';
import ProgressRing from '../components/common/ProgressRing';
import ProgressBar  from '../components/common/ProgressBar';
import { DashboardStack } from '../navigation/TabNavigator';
import { todayStr, lastNDays, dayLetter, relativeDate } from '../utils/date';
import { safeRatio, formatDuration, sleepDuration } from '../utils/helpers';

type Nav = NativeStackNavigationProp<DashboardStack>;

export default function DashboardScreen() {
  const colorScheme = useColorScheme();
  const theme = getTheme(colorScheme);
  const nav = useNavigation<Nav>();

  const { goals, profile } = useSettingsStore();
  const { calorieSumForDate, macroSumForDate } = useNutritionStore();
  const { lastEntry: lastSleep } = useSleepStore();
  const { completionRateToday, habits } = useHabitStore();
  const { thisWeekSessions } = useWorkoutStore();
  const { todayWaterMl } = useLifestyleStore();
  const { latest: latestBody } = useBodyStore();

  const today     = todayStr();
  const calories  = calorieSumForDate(today);
  const macros    = macroSumForDate(today);
  const water     = todayWaterMl();
  const sleep     = lastSleep();
  const habitRate = completionRateToday();
  const weekWorkouts = thisWeekSessions().length;
  const bodyEntry = latestBody();

  const hour = new Date().getHours();
  const greeting = hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening';
  const greetName = profile.name ? `, ${profile.name}` : '';

  const days7 = lastNDays(7);

  const bgColor  = colorScheme === 'dark' ? '#000' : '#F2F2F7';

  return (
    <ScrollView style={[styles.scroll, { backgroundColor: bgColor }]} contentContainerStyle={styles.content}>
      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={[styles.greeting, { color: theme.text }]}>{greeting}{greetName}</Text>
          <Text style={[styles.date, { color: theme.textSecondary }]}>{relativeDate(today)}</Text>
        </View>
        <TouchableOpacity onPress={() => nav.navigate('Settings')}>
          <Ionicons name="settings-outline" size={26} color={theme.textSecondary} />
        </TouchableOpacity>
      </View>

      {/* Calorie Ring Card */}
      <Card style={styles.calorieCard}>
        <View style={styles.calorieRow}>
          <ProgressRing
            size={120}
            progress={safeRatio(calories, goals.calorieGoal)}
            color={calories > goals.calorieGoal ? palette.red : palette.blue}
            strokeWidth={12}
          >
            <View style={{ alignItems: 'center' }}>
              <Text style={[styles.calorieNum, { color: theme.text }]}>{Math.round(calories)}</Text>
              <Text style={[styles.calorieSub, { color: theme.textSecondary }]}>kcal</Text>
            </View>
          </ProgressRing>

          <View style={styles.calorieInfo}>
            <Text style={[styles.calorieGoalText, { color: theme.textSecondary }]}>
              {calories > goals.calorieGoal
                ? `${Math.round(calories - goals.calorieGoal)} over goal`
                : `${Math.round(goals.calorieGoal - calories)} remaining`}
            </Text>
            <Text style={[{ color: theme.textSecondary, fontSize: fontSize.sm }]}>Goal: {goals.calorieGoal} kcal</Text>

            <View style={styles.macroRow}>
              <MacroChip label="P" value={macros.protein} color={palette.blue} />
              <MacroChip label="C" value={macros.carbs}   color={palette.orange} />
              <MacroChip label="F" value={macros.fat}     color={palette.yellow} />
            </View>
          </View>
        </View>

        {/* Macro bar */}
        <View style={[styles.macroBarTrack, { backgroundColor: theme.border }]}>
          {macros.protein + macros.carbs + macros.fat > 0 && (
            <>
              <View style={[styles.macroBarSeg, { flex: macros.protein, backgroundColor: palette.blue }]} />
              <View style={[styles.macroBarSeg, { flex: macros.carbs,   backgroundColor: palette.orange }]} />
              <View style={[styles.macroBarSeg, { flex: macros.fat,     backgroundColor: palette.yellow }]} />
            </>
          )}
        </View>
      </Card>

      {/* Quick stats grid */}
      <View style={styles.grid}>
        <QuickStatCard
          icon="water-outline"
          label="Water"
          value={`${Math.round(water)}`}
          unit="ml"
          sub={`Goal: ${goals.waterGoal}ml`}
          progress={safeRatio(water, goals.waterGoal)}
          color={palette.cyan}
          theme={theme}
        />
        <QuickStatCard
          icon="moon-outline"
          label="Sleep"
          value={sleep ? formatDuration(sleepDuration(sleep.bedTime, sleep.wakeTime)) : '--'}
          unit=""
          sub={sleep ? `Quality: ${QUALITY_LABELS[sleep.quality]}` : 'No data'}
          progress={sleep ? safeRatio(sleepDuration(sleep.bedTime, sleep.wakeTime), goals.sleepGoal) : 0}
          color={palette.indigo}
          theme={theme}
        />
        <QuickStatCard
          icon="checkmark-circle-outline"
          label="Habits"
          value={`${Math.round(habitRate * 100)}`}
          unit="%"
          sub={`${habits.filter(h=>h.isActive).length} active`}
          progress={habitRate}
          color={palette.green}
          theme={theme}
        />
        <QuickStatCard
          icon="barbell-outline"
          label="Workouts"
          value={`${weekWorkouts}`}
          unit=""
          sub="This week"
          progress={safeRatio(weekWorkouts, 4)}
          color={palette.orange}
          theme={theme}
        />
      </View>

      {/* Weight card */}
      {bodyEntry && bodyEntry.weight > 0 && (
        <Card style={styles.weightCard}>
          <View style={styles.weightRow}>
            <Ionicons name="fitness-outline" size={28} color={palette.purple} />
            <View style={{ marginLeft: spacing.md }}>
              <Text style={[styles.weightLabel, { color: theme.textSecondary }]}>Current Weight</Text>
              <Text style={[styles.weightValue, { color: theme.text }]}>
                {bodyEntry.weight.toFixed(1)} kg
              </Text>
            </View>
            <View style={{ flex: 1 }} />
            <View style={{ alignItems: 'flex-end' }}>
              <Text style={[{ fontSize: fontSize.sm, color: theme.textSecondary }]}>Goal</Text>
              <Text style={[{ fontWeight: fontWeight.semibold, color: theme.text }]}>
                {goals.weightGoal.toFixed(1)} kg
              </Text>
            </View>
          </View>
        </Card>
      )}

      {/* Weekly activity */}
      <Card>
        <Text style={[styles.sectionTitle, { color: theme.text }]}>This Week</Text>
        <View style={styles.weekRow}>
          {days7.map((d) => (
            <WeekDayDot key={d} date={d} theme={theme} />
          ))}
        </View>
      </Card>
    </ScrollView>
  );
}

// ─── Sub-components ───────────────────────────────────────────────────────────

const QUALITY_LABELS: Record<number, string> = { 1:'Terrible', 2:'Poor', 3:'Fair', 4:'Good', 5:'Excellent' };

function MacroChip({ label, value, color }: { label: string; value: number; color: string }) {
  const theme = getTheme(useColorScheme());
  return (
    <View style={styles.macroChip}>
      <Text style={[styles.macroChipLabel, { color }]}>{label}</Text>
      <Text style={[styles.macroChipVal,   { color: theme.text }]}>{Math.round(value)}g</Text>
    </View>
  );
}

function QuickStatCard({ icon, label, value, unit, sub, progress, color, theme }: any) {
  return (
    <Card style={styles.statCard} padding={12}>
      <View style={styles.statHeader}>
        <Ionicons name={icon} size={16} color={color} />
        <Text style={[styles.statLabel, { color: theme.textSecondary }]}>{label}</Text>
      </View>
      <Text style={[styles.statValue, { color: theme.text }]}>
        {value}<Text style={[styles.statUnit, { color: theme.textSecondary }]}>{unit}</Text>
      </Text>
      <ProgressBar progress={progress} color={color} height={4} />
      <Text style={[styles.statSub, { color: theme.textTertiary }]}>{sub}</Text>
    </Card>
  );
}

function WeekDayDot({ date, theme }: { date: string; theme: any }) {
  const { habits, isCompletedToday: _ } = useHabitStore();
  const { sessions } = useWorkoutStore();
  const isToday = date === todayStr();

  const hasWorkout = sessions.some(
    (s) => s.isCompleted && s.date === date
  );
  const active = habits.filter((h) => h.isActive);
  const doneCount = active.filter((h) =>
    h.logs.some((l) => l.date === date && l.completed)
  ).length;
  const habitProgress = active.length > 0 ? doneCount / active.length : 0;

  return (
    <View style={styles.dotWrap}>
      <View style={[
        styles.dot,
        {
          backgroundColor: hasWorkout
            ? palette.orange
            : habitProgress > 0.7
            ? palette.green
            : theme.border,
          borderWidth: isToday ? 2 : 0,
          borderColor: theme.primary,
        },
      ]}>
        {hasWorkout && (
          <Ionicons name="barbell" size={9} color="#fff" />
        )}
      </View>
      <Text style={[styles.dotLabel, { color: isToday ? theme.primary : theme.textTertiary, fontWeight: isToday ? '700' : '400' }]}>
        {dayLetter(date)}
      </Text>
    </View>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  scroll:    { flex: 1 },
  content:   { padding: spacing.lg, gap: spacing.md },
  header:    { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: spacing.sm },
  greeting:  { fontSize: fontSize.xl, fontWeight: fontWeight.bold },
  date:      { fontSize: fontSize.sm, marginTop: 2 },

  calorieCard: { gap: spacing.sm },
  calorieRow:  { flexDirection: 'row', alignItems: 'center', gap: spacing.lg },
  calorieNum:  { fontSize: fontSize.xxl, fontWeight: fontWeight.bold },
  calorieSub:  { fontSize: fontSize.xs, marginTop: -2 },
  calorieInfo: { flex: 1, gap: spacing.xs },
  calorieGoalText: { fontSize: fontSize.sm, fontWeight: fontWeight.semibold },

  macroRow:    { flexDirection: 'row', gap: spacing.md, marginTop: spacing.xs },
  macroChip:   { alignItems: 'center' },
  macroChipLabel: { fontSize: fontSize.xs, fontWeight: fontWeight.bold },
  macroChipVal:   { fontSize: fontSize.sm, fontWeight: fontWeight.semibold },

  macroBarTrack: { flexDirection: 'row', height: 6, borderRadius: 3, overflow: 'hidden' },
  macroBarSeg:   { height: 6 },

  grid:      { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm },
  statCard:  { width: '47.5%' },
  statHeader:{ flexDirection: 'row', alignItems: 'center', gap: 5, marginBottom: spacing.xs },
  statLabel: { fontSize: fontSize.xs },
  statValue: { fontSize: fontSize.xl, fontWeight: fontWeight.bold, marginBottom: 4 },
  statUnit:  { fontSize: fontSize.sm, fontWeight: fontWeight.regular },
  statSub:   { fontSize: fontSize.xs, marginTop: 4 },

  weightCard:  {},
  weightRow:   { flexDirection: 'row', alignItems: 'center' },
  weightLabel: { fontSize: fontSize.sm },
  weightValue: { fontSize: fontSize.xl, fontWeight: fontWeight.bold },

  sectionTitle: { fontSize: fontSize.md, fontWeight: fontWeight.semibold, marginBottom: spacing.md },
  weekRow:    { flexDirection: 'row', justifyContent: 'space-between' },
  dotWrap:    { alignItems: 'center', gap: 4 },
  dot:        { width: 32, height: 32, borderRadius: 16, alignItems: 'center', justifyContent: 'center' },
  dotLabel:   { fontSize: fontSize.xs },
});
