import React from 'react';
import {
  View, Text, ScrollView, StyleSheet, TouchableOpacity,
  Alert, useColorScheme,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';
import { getTheme, spacing, fontSize, fontWeight, radius, palette, namedColor } from '../theme';
import { useHabitStore } from '../store/habitStore';
import Card from '../components/common/Card';
import ProgressBar from '../components/common/ProgressBar';
import EmptyState from '../components/common/EmptyState';
import { HabitsStack } from '../navigation/TabNavigator';
import { Habit } from '../types';
import { todayStr, lastNDays, dayLetter } from '../utils/date';
import { calcStreak, safeRatio } from '../utils/helpers';

type Nav = NativeStackNavigationProp<HabitsStack>;

export default function HabitsScreen() {
  const colorScheme = useColorScheme();
  const theme = getTheme(colorScheme);
  const nav = useNavigation<Nav>();
  const bg = colorScheme === 'dark' ? '#000' : '#F2F2F7';

  const { habits, toggleToday, isCompletedToday, completionRateToday, deleteHabit, currentStreak } = useHabitStore();
  const active = habits.filter((h) => h.isActive);
  const rate = completionRateToday();
  const doneCount = active.filter((h) => isCompletedToday(h.id)).length;
  const days7 = lastNDays(7);

  function confirmDelete(habit: Habit) {
    Alert.alert('Delete habit?', habit.name, [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Delete', style: 'destructive', onPress: () => deleteHabit(habit.id) },
    ]);
  }

  return (
    <ScrollView style={[styles.scroll, { backgroundColor: bg }]} contentContainerStyle={styles.content}>
      {/* Today summary */}
      <Card>
        <Text style={[styles.sectionTitle, { color: theme.text }]}>Today's Progress</Text>
        <View style={styles.summaryRow}>
          <View style={{ flex: 1 }}>
            <Text style={[styles.bigNum, { color: palette.green }]}>
              {doneCount}/{active.length}
            </Text>
            <Text style={[styles.bigSub, { color: theme.textSecondary }]}>completed</Text>
          </View>
          <View style={{ flex: 1, alignItems: 'center' }}>
            <Text style={[styles.bigNum, { color: palette.blue }]}>
              {Math.round(rate * 100)}%
            </Text>
            <Text style={[styles.bigSub, { color: theme.textSecondary }]}>rate</Text>
          </View>
        </View>
        <ProgressBar progress={rate} color={palette.green} height={8} />
      </Card>

      {/* Week grid */}
      <Card>
        <Text style={[styles.sectionTitle, { color: theme.text }]}>This Week</Text>
        <View style={styles.weekRow}>
          {days7.map((d) => {
            const dayDone = active.filter((h) =>
              h.logs.some((l) => l.date === d && l.completed)
            ).length;
            const dayRate = active.length > 0 ? dayDone / active.length : 0;
            const isToday = d === todayStr();
            return (
              <View key={d} style={styles.dayCol}>
                <View
                  style={[
                    styles.dayDot,
                    {
                      backgroundColor:
                        dayRate >= 1 ? palette.green :
                        dayRate > 0 ? palette.orange + '88' :
                        theme.border,
                      borderWidth: isToday ? 2 : 0,
                      borderColor: theme.primary,
                    },
                  ]}
                >
                  {dayRate >= 1 && (
                    <Ionicons name="checkmark" size={12} color="#fff" />
                  )}
                </View>
                <Text style={[styles.dayLabel, {
                  color: isToday ? theme.primary : theme.textTertiary,
                  fontWeight: isToday ? '700' : '400',
                }]}>{dayLetter(d)}</Text>
              </View>
            );
          })}
        </View>
      </Card>

      {/* Habit list */}
      <View style={styles.listHeader}>
        <Text style={[styles.sectionTitle, { color: theme.text, marginBottom: 0 }]}>My Habits</Text>
        <TouchableOpacity onPress={() => nav.navigate('AddHabit', {})}>
          <Ionicons name="add-circle" size={28} color={theme.primary} />
        </TouchableOpacity>
      </View>

      {active.length === 0 ? (
        <EmptyState
          icon="checkmark-circle-outline"
          title="No habits yet"
          message="Build positive routines by creating your first habit"
          actionLabel="Create Habit"
          onAction={() => nav.navigate('AddHabit', {})}
        />
      ) : (
        active.map((habit) => {
          const done = isCompletedToday(habit.id);
          const streak = currentStreak(habit.id);
          const color = namedColor(habit.color);
          return (
            <Card key={habit.id} style={{ marginBottom: spacing.sm }}>
              <TouchableOpacity
                style={styles.habitRow}
                onPress={() => toggleToday(habit.id)}
                onLongPress={() => confirmDelete(habit)}
                activeOpacity={0.7}
              >
                <View style={[styles.checkbox, {
                  backgroundColor: done ? color : 'transparent',
                  borderColor: color,
                }]}>
                  {done && <Ionicons name="checkmark" size={16} color="#fff" />}
                </View>
                <View style={{ flex: 1, marginLeft: spacing.md }}>
                  <Text style={[styles.habitName, {
                    color: theme.text,
                    textDecorationLine: done ? 'line-through' : 'none',
                    opacity: done ? 0.6 : 1,
                  }]}>{habit.name}</Text>
                  <View style={styles.habitMeta}>
                    <Ionicons name="flame-outline" size={12} color={palette.orange} />
                    <Text style={[styles.habitMetaText, { color: theme.textSecondary }]}>
                      {streak} day streak
                    </Text>
                    <Text style={[styles.habitMetaText, { color: theme.textTertiary }]}>
                       · {habit.frequency}
                    </Text>
                  </View>
                </View>
                <Ionicons name={habit.icon as any || 'ellipse'} size={20} color={color} />
              </TouchableOpacity>
            </Card>
          );
        })
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scroll:     { flex: 1 },
  content:    { padding: spacing.lg, gap: spacing.md },
  sectionTitle: { fontSize: fontSize.md, fontWeight: fontWeight.semibold, marginBottom: spacing.md },
  summaryRow: { flexDirection: 'row', marginBottom: spacing.md },
  bigNum:     { fontSize: fontSize.xxl, fontWeight: fontWeight.bold },
  bigSub:     { fontSize: fontSize.sm },
  weekRow:    { flexDirection: 'row', justifyContent: 'space-between' },
  dayCol:     { alignItems: 'center', gap: 4 },
  dayDot:     { width: 32, height: 32, borderRadius: 16, alignItems: 'center', justifyContent: 'center' },
  dayLabel:   { fontSize: fontSize.xs },
  listHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 2 },
  habitRow:   { flexDirection: 'row', alignItems: 'center' },
  checkbox:   { width: 28, height: 28, borderRadius: 14, borderWidth: 2, alignItems: 'center', justifyContent: 'center' },
  habitName:  { fontSize: fontSize.md, fontWeight: fontWeight.semibold },
  habitMeta:  { flexDirection: 'row', alignItems: 'center', gap: 3, marginTop: 2 },
  habitMetaText: { fontSize: fontSize.xs },
});
