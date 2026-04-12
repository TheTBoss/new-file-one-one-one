import React from 'react';
import {
  View, Text, ScrollView, StyleSheet, TouchableOpacity,
  useColorScheme, Alert,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';
import { getTheme, spacing, fontSize, fontWeight, radius, palette } from '../theme';
import { useSleepStore } from '../store/sleepStore';
import { useLifestyleStore } from '../store/lifestyleStore';
import { useBodyStore } from '../store/bodyStore';
import { useSettingsStore } from '../store/settingsStore';
import Card from '../components/common/Card';
import ProgressBar from '../components/common/ProgressBar';
import ProgressRing from '../components/common/ProgressRing';
import BarChart from '../components/common/BarChart';
import { ProgressStack } from '../navigation/TabNavigator';
import { todayStr, lastNDays, dayLabel, relativeDate } from '../utils/date';
import { safeRatio, formatDuration, sleepDuration, calcBMI, bmiCategory } from '../utils/helpers';

type Nav = NativeStackNavigationProp<ProgressStack>;

export default function ProgressScreen() {
  const colorScheme = useColorScheme();
  const theme = getTheme(colorScheme);
  const nav = useNavigation<Nav>();
  const bg = colorScheme === 'dark' ? '#000' : '#F2F2F7';

  const { goals } = useSettingsStore();
  const { lastEntry: lastSleep, avgDuration, entries: sleepEntries } = useSleepStore();
  const { todayWaterMl, addWater, deleteWater, waterEntries, todayMood, moodEntries } = useLifestyleStore();
  const { latest: latestBody, measurements, weightTrend } = useBodyStore();

  const sleep = lastSleep();
  const avgSleep = avgDuration(7);
  const water = todayWaterMl();
  const mood = todayMood();
  const body = latestBody();
  const trend = weightTrend(30);

  const waterAmounts = [250, 330, 500];

  const days7 = lastNDays(7);
  const sleepChartData = days7.map((d) => {
    const entry = sleepEntries.find((e) => e.date === d);
    return {
      label: dayLabel(d).substring(0, 1),
      value: entry ? sleepDuration(entry.bedTime, entry.wakeTime) : 0,
      highlight: d === todayStr(),
    };
  });

  return (
    <ScrollView style={[styles.scroll, { backgroundColor: bg }]} contentContainerStyle={styles.content}>
      {/* Water tracker */}
      <Card>
        <View style={styles.cardHeader}>
          <View style={styles.headerLeft}>
            <Ionicons name="water" size={20} color={palette.cyan} />
            <Text style={[styles.sectionTitle, { color: theme.text }]}>Water</Text>
          </View>
          <Text style={[styles.headerRight, { color: theme.textSecondary }]}>
            {Math.round(water)} / {goals.waterGoal} ml
          </Text>
        </View>
        <ProgressBar progress={safeRatio(water, goals.waterGoal)} color={palette.cyan} height={8} />
        <View style={styles.waterBtns}>
          {waterAmounts.map((ml) => (
            <TouchableOpacity
              key={ml}
              style={[styles.waterBtn, { backgroundColor: palette.cyan + '15', borderColor: palette.cyan }]}
              onPress={() => addWater(ml)}
            >
              <Ionicons name="add" size={14} color={palette.cyan} />
              <Text style={[styles.waterBtnText, { color: palette.cyan }]}>{ml}ml</Text>
            </TouchableOpacity>
          ))}
        </View>
      </Card>

      {/* Sleep */}
      <Card>
        <View style={styles.cardHeader}>
          <View style={styles.headerLeft}>
            <Ionicons name="moon" size={20} color={palette.indigo} />
            <Text style={[styles.sectionTitle, { color: theme.text }]}>Sleep</Text>
          </View>
          <TouchableOpacity onPress={() => nav.navigate('AddSleep')}>
            <Ionicons name="add-circle" size={24} color={theme.primary} />
          </TouchableOpacity>
        </View>
        {sleep ? (
          <View style={styles.sleepInfo}>
            <View style={styles.sleepStat}>
              <Text style={[styles.sleepVal, { color: theme.text }]}>
                {formatDuration(sleepDuration(sleep.bedTime, sleep.wakeTime))}
              </Text>
              <Text style={[styles.sleepLabel, { color: theme.textSecondary }]}>Last Night</Text>
            </View>
            <View style={styles.sleepStat}>
              <Text style={[styles.sleepVal, { color: theme.text }]}>
                {avgSleep > 0 ? formatDuration(avgSleep) : '--'}
              </Text>
              <Text style={[styles.sleepLabel, { color: theme.textSecondary }]}>7d Avg</Text>
            </View>
            <View style={styles.sleepStat}>
              <Text style={[styles.sleepVal, { color: theme.text }]}>
                {['', 'Terrible', 'Poor', 'Fair', 'Good', 'Excellent'][sleep.quality]}
              </Text>
              <Text style={[styles.sleepLabel, { color: theme.textSecondary }]}>Quality</Text>
            </View>
          </View>
        ) : (
          <Text style={[styles.empty, { color: theme.textTertiary }]}>No sleep data. Tap + to log sleep.</Text>
        )}
        {sleepEntries.length >= 2 && (
          <View style={{ marginTop: spacing.md }}>
            <BarChart data={sleepChartData} color={palette.indigo} height={120} goalValue={goals.sleepGoal} />
          </View>
        )}
      </Card>

      {/* Mood */}
      <Card>
        <View style={styles.cardHeader}>
          <View style={styles.headerLeft}>
            <Ionicons name="happy" size={20} color={palette.yellow} />
            <Text style={[styles.sectionTitle, { color: theme.text }]}>Mood</Text>
          </View>
          <TouchableOpacity onPress={() => nav.navigate('AddMood')}>
            <Ionicons name="add-circle" size={24} color={theme.primary} />
          </TouchableOpacity>
        </View>
        {mood ? (
          <View style={styles.moodRow}>
            <Text style={{ fontSize: 36 }}>
              {['', '\ud83d\ude29', '\ud83d\ude1e', '\ud83d\ude10', '\ud83d\ude0a', '\ud83d\ude04'][mood.mood]}
            </Text>
            <View style={{ flex: 1, marginLeft: spacing.md }}>
              <Text style={[styles.moodLabel, { color: theme.text }]}>
                {['', 'Terrible', 'Bad', 'Okay', 'Good', 'Great'][mood.mood]}
              </Text>
              <Text style={[styles.moodSub, { color: theme.textSecondary }]}>
                Energy: {mood.energyLevel}/10 · Stress: {mood.stressLevel}/10
              </Text>
              {mood.notes ? (
                <Text style={[styles.moodNotes, { color: theme.textTertiary }]} numberOfLines={2}>{mood.notes}</Text>
              ) : null}
            </View>
          </View>
        ) : (
          <Text style={[styles.empty, { color: theme.textTertiary }]}>No mood logged today. Tap + to log mood.</Text>
        )}
      </Card>

      {/* Body measurements */}
      <Card>
        <View style={styles.cardHeader}>
          <View style={styles.headerLeft}>
            <Ionicons name="fitness" size={20} color={palette.purple} />
            <Text style={[styles.sectionTitle, { color: theme.text }]}>Body</Text>
          </View>
          <TouchableOpacity onPress={() => nav.navigate('AddMeasurement')}>
            <Ionicons name="add-circle" size={24} color={theme.primary} />
          </TouchableOpacity>
        </View>
        {body ? (
          <>
            <View style={styles.bodyGrid}>
              <BodyStat label="Weight" value={`${body.weight.toFixed(1)} kg`} color={palette.purple} theme={theme} />
              <BodyStat label="Body Fat" value={body.bodyFat > 0 ? `${body.bodyFat.toFixed(1)}%` : '--'} color={palette.orange} theme={theme} />
              <BodyStat
                label="BMI"
                value={body.weight > 0 ? calcBMI(body.weight, useSettingsStore.getState().profile.heightCm).toFixed(1) : '--'}
                color={palette.blue}
                theme={theme}
              />
              <BodyStat
                label="30d Trend"
                value={trend !== 0 ? `${trend > 0 ? '+' : ''}${trend.toFixed(1)} kg` : '--'}
                color={trend > 0 ? palette.red : palette.green}
                theme={theme}
              />
            </View>
            <Text style={[styles.bodyDate, { color: theme.textTertiary }]}>
              Last measured: {relativeDate(body.date)}
            </Text>
          </>
        ) : (
          <Text style={[styles.empty, { color: theme.textTertiary }]}>No measurements yet. Tap + to add.</Text>
        )}
      </Card>
    </ScrollView>
  );
}

function BodyStat({ label, value, color, theme }: { label: string; value: string; color: string; theme: any }) {
  return (
    <View style={styles.bodyStat}>
      <Text style={[styles.bodyStatVal, { color }]}>{value}</Text>
      <Text style={[styles.bodyStatLabel, { color: theme.textSecondary }]}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  scroll:      { flex: 1 },
  content:     { padding: spacing.lg, gap: spacing.md },
  cardHeader:  { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: spacing.md },
  headerLeft:  { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  headerRight: { fontSize: fontSize.sm },
  sectionTitle:{ fontSize: fontSize.md, fontWeight: fontWeight.semibold, marginBottom: 0 },
  waterBtns:   { flexDirection: 'row', gap: spacing.sm, marginTop: spacing.md },
  waterBtn:    { flexDirection: 'row', alignItems: 'center', gap: 4, paddingHorizontal: spacing.md, paddingVertical: 8, borderRadius: radius.full, borderWidth: 1 },
  waterBtnText:{ fontSize: fontSize.sm, fontWeight: fontWeight.semibold },
  sleepInfo:   { flexDirection: 'row' },
  sleepStat:   { flex: 1, alignItems: 'center' },
  sleepVal:    { fontSize: fontSize.lg, fontWeight: fontWeight.bold },
  sleepLabel:  { fontSize: fontSize.xs, marginTop: 2 },
  empty:       { fontSize: fontSize.sm, paddingVertical: spacing.sm },
  moodRow:     { flexDirection: 'row', alignItems: 'center' },
  moodLabel:   { fontSize: fontSize.lg, fontWeight: fontWeight.bold },
  moodSub:     { fontSize: fontSize.sm, marginTop: 2 },
  moodNotes:   { fontSize: fontSize.xs, marginTop: 4, fontStyle: 'italic' },
  bodyGrid:    { flexDirection: 'row', flexWrap: 'wrap' },
  bodyStat:    { width: '50%', paddingVertical: spacing.sm },
  bodyStatVal: { fontSize: fontSize.xl, fontWeight: fontWeight.bold },
  bodyStatLabel:{ fontSize: fontSize.xs, marginTop: 2 },
  bodyDate:    { fontSize: fontSize.xs, marginTop: spacing.sm },
});
