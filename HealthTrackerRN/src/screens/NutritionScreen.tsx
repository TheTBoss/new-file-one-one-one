import React, { useState } from 'react';
import {
  View, Text, ScrollView, StyleSheet, TouchableOpacity,
  Alert, useColorScheme, FlatList,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';
import { getTheme, spacing, fontSize, fontWeight, radius, palette } from '../theme';
import { useNutritionStore } from '../store/nutritionStore';
import { useSettingsStore }  from '../store/settingsStore';
import Card         from '../components/common/Card';
import ProgressRing from '../components/common/ProgressRing';
import ProgressBar  from '../components/common/ProgressBar';
import BarChart     from '../components/common/BarChart';
import { NutritionStack }  from '../navigation/TabNavigator';
import { MealType, FoodEntry } from '../types';
import { todayStr, lastNDays, dayLabel, relativeDate, shortDate } from '../utils/date';
import { safeRatio } from '../utils/helpers';

type Nav = NativeStackNavigationProp<NutritionStack>;

const MEAL_TYPES: { type: MealType; label: string; icon: string; color: string }[] = [
  { type: 'breakfast',    label: 'Breakfast',    icon: 'sunny-outline',     color: palette.orange },
  { type: 'lunch',        label: 'Lunch',        icon: 'partly-sunny-outline', color: palette.yellow },
  { type: 'dinner',       label: 'Dinner',       icon: 'moon-outline',      color: palette.indigo },
  { type: 'snack',        label: 'Snack',        icon: 'star-outline',      color: palette.green  },
  { type: 'pre-workout',  label: 'Pre-Workout',  icon: 'flash-outline',     color: palette.red    },
  { type: 'post-workout', label: 'Post-Workout', icon: 'checkmark-circle-outline', color: palette.blue },
];

export default function NutritionScreen() {
  const colorScheme = useColorScheme();
  const theme = getTheme(colorScheme);
  const nav = useNavigation<Nav>();
  const bg = colorScheme === 'dark' ? '#000' : '#F2F2F7';

  const { goals } = useSettingsStore();
  const { calorieSumForDate, macroSumForDate, entriesForMeal, deleteEntry, entries } = useNutritionStore();

  const [selectedDate, setSelectedDate] = useState(todayStr());

  const calories = calorieSumForDate(selectedDate);
  const macros   = macroSumForDate(selectedDate);
  const remaining = Math.max(goals.calorieGoal - calories, 0);
  const over      = Math.max(calories - goals.calorieGoal, 0);

  const days7 = lastNDays(7);
  const chartData = days7.map((d) => ({
    label:     dayLabel(d).substring(0, 1),
    value:     calorieSumForDate(d),
    highlight: d === todayStr(),
  }));

  function prevDay() {
    const d = new Date(selectedDate);
    d.setDate(d.getDate() - 1);
    setSelectedDate(d.toISOString().split('T')[0]);
  }
  function nextDay() {
    if (selectedDate >= todayStr()) return;
    const d = new Date(selectedDate);
    d.setDate(d.getDate() + 1);
    setSelectedDate(d.toISOString().split('T')[0]);
  }

  return (
    <ScrollView style={[styles.scroll, { backgroundColor: bg }]} contentContainerStyle={styles.content}>
      {/* Date selector */}
      <Card style={styles.datePicker}>
        <TouchableOpacity onPress={prevDay}>
          <Ionicons name="chevron-back" size={22} color={theme.primary} />
        </TouchableOpacity>
        <Text style={[styles.dateText, { color: theme.text }]}>
          {relativeDate(selectedDate)}
        </Text>
        <TouchableOpacity onPress={nextDay} disabled={selectedDate >= todayStr()}>
          <Ionicons name="chevron-forward" size={22}
            color={selectedDate >= todayStr() ? theme.textTertiary : theme.primary} />
        </TouchableOpacity>
      </Card>

      {/* Calorie summary */}
      <Card>
        <View style={styles.calorieHeader}>
          <View>
            <Text style={[styles.bigNumber, { color: theme.text }]}>{Math.round(calories)}</Text>
            <Text style={[styles.bigSub,    { color: theme.textSecondary }]}>of {goals.calorieGoal} kcal</Text>
          </View>
          <View style={{ alignItems: 'flex-end' }}>
            {over > 0 ? (
              <Text style={[styles.overLabel, { color: palette.red }]}>{Math.round(over)} over</Text>
            ) : (
              <Text style={[styles.overLabel, { color: palette.orange }]}>{Math.round(remaining)} left</Text>
            )}
          </View>
        </View>

        <ProgressBar
          progress={safeRatio(calories, goals.calorieGoal)}
          color={over > 0 ? palette.red : palette.blue}
          height={8}
        />

        <View style={styles.macroRow}>
          <MacroRingMini label="Protein" value={macros.protein} goal={goals.proteinGoal} color={palette.blue}   />
          <MacroRingMini label="Carbs"   value={macros.carbs}   goal={goals.carbGoal}    color={palette.orange} />
          <MacroRingMini label="Fat"     value={macros.fat}     goal={goals.fatGoal}     color={palette.yellow} />
          <MacroRingMini label="Fiber"   value={macros.fiber}   goal={goals.fiberGoal}   color={palette.green}  />
        </View>
      </Card>

      {/* Meal sections */}
      {MEAL_TYPES.map(({ type, label, icon, color }) => {
        const mealEntries = entriesForMeal(type, selectedDate);
        return (
          <MealSection
            key={type}
            mealType={type}
            label={label}
            icon={icon}
            color={color}
            entries={mealEntries}
            onAdd={() => nav.navigate('AddFood', { mealType: type, date: selectedDate })}
            onDelete={(id) => {
              Alert.alert('Delete entry?', '', [
                { text: 'Cancel', style: 'cancel' },
                { text: 'Delete', style: 'destructive', onPress: () => deleteEntry(id) },
              ]);
            }}
            theme={theme}
          />
        );
      })}

      {/* 7-day chart */}
      <Card>
        <Text style={[styles.sectionTitle, { color: theme.text }]}>7-Day Calories</Text>
        <BarChart
          data={chartData}
          goalValue={goals.calorieGoal}
          color={palette.blue}
          height={150}
          showValues
        />
      </Card>
    </ScrollView>
  );
}

// ─── Meal Section ─────────────────────────────────────────────────────────────

function MealSection({
  label, icon, color, entries, onAdd, onDelete, theme,
}: {
  mealType: MealType; label: string; icon: string; color: string;
  entries: FoodEntry[]; onAdd: () => void;
  onDelete: (id: string) => void; theme: any;
}) {
  const [expanded, setExpanded] = useState(true);
  const total = entries.reduce((s, e) => s + e.calories, 0);

  return (
    <Card padding={0} style={{ overflow: 'hidden' }}>
      {/* Header */}
      <TouchableOpacity
        style={[styles.mealHeader, { borderBottomWidth: expanded ? 1 : 0, borderColor: theme.border }]}
        onPress={() => setExpanded(!expanded)}
        activeOpacity={0.7}
      >
        <Ionicons name={icon as any} size={18} color={color} />
        <Text style={[styles.mealLabel, { color: theme.text }]}>{label}</Text>
        <View style={{ flex: 1 }} />
        {total > 0 && (
          <Text style={[styles.mealCals, { color: theme.textSecondary }]}>{Math.round(total)} kcal</Text>
        )}
        <Ionicons name={expanded ? 'chevron-up' : 'chevron-down'} size={16} color={theme.textTertiary} />
      </TouchableOpacity>

      {expanded && (
        <>
          {entries.length === 0 ? (
            <Text style={[styles.emptyMeal, { color: theme.textTertiary }]}>Nothing logged yet</Text>
          ) : (
            entries.map((e) => (
              <FoodRow key={e.id} entry={e} onDelete={() => onDelete(e.id)} theme={theme} />
            ))
          )}
          <TouchableOpacity style={[styles.addRow, { borderTopWidth: 1, borderColor: theme.border }]} onPress={onAdd}>
            <Ionicons name="add-circle" size={18} color={color} />
            <Text style={[styles.addLabel, { color }]}>Add food</Text>
          </TouchableOpacity>
        </>
      )}
    </Card>
  );
}

function FoodRow({ entry, onDelete, theme }: { entry: FoodEntry; onDelete: () => void; theme: any }) {
  return (
    <View style={[styles.foodRow, { borderBottomWidth: 1, borderColor: theme.border }]}>
      <View style={{ flex: 1 }}>
        <Text style={[styles.foodName, { color: theme.text }]} numberOfLines={1}>{entry.name}</Text>
        <Text style={[styles.foodSub, { color: theme.textSecondary }]}>
          {entry.servingSize} {entry.servingUnit}
          {entry.brand ? ` · ${entry.brand}` : ''}
        </Text>
      </View>
      <Text style={[styles.foodCals, { color: theme.text }]}>{Math.round(entry.calories)}</Text>
      <TouchableOpacity onPress={onDelete} style={{ marginLeft: spacing.sm }}>
        <Ionicons name="trash-outline" size={16} color={theme.textTertiary} />
      </TouchableOpacity>
    </View>
  );
}

function MacroRingMini({ label, value, goal, color }: { label: string; value: number; goal: number; color: string }) {
  const theme = getTheme(useColorScheme());
  return (
    <View style={{ alignItems: 'center', flex: 1 }}>
      <ProgressRing size={52} progress={safeRatio(value, goal)} color={color} strokeWidth={5}>
        <Text style={{ fontSize: 10, fontWeight: '700', color: theme.text }}>{Math.round(value)}g</Text>
      </ProgressRing>
      <Text style={{ fontSize: fontSize.xs, color: theme.textSecondary, marginTop: 4 }}>{label}</Text>
      <Text style={{ fontSize: 9, color: theme.textTertiary }}>/{Math.round(goal)}g</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  scroll:   { flex: 1 },
  content:  { padding: spacing.lg, gap: spacing.md },
  datePicker: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  dateText: { fontSize: fontSize.md, fontWeight: fontWeight.semibold },
  calorieHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: spacing.md },
  bigNumber: { fontSize: fontSize.huge, fontWeight: fontWeight.heavy, lineHeight: 46 },
  bigSub:    { fontSize: fontSize.sm },
  overLabel: { fontSize: fontSize.md, fontWeight: fontWeight.semibold },
  macroRow:  { flexDirection: 'row', marginTop: spacing.lg },
  sectionTitle: { fontSize: fontSize.md, fontWeight: fontWeight.semibold, marginBottom: spacing.md },

  mealHeader: { flexDirection: 'row', alignItems: 'center', padding: spacing.md, gap: spacing.sm },
  mealLabel:  { fontSize: fontSize.md, fontWeight: fontWeight.semibold },
  mealCals:   { fontSize: fontSize.sm, marginRight: spacing.sm },
  emptyMeal:  { paddingHorizontal: spacing.md, paddingVertical: spacing.sm, fontSize: fontSize.sm },
  addRow:     { flexDirection: 'row', alignItems: 'center', padding: spacing.md, gap: spacing.sm },
  addLabel:   { fontSize: fontSize.sm, fontWeight: fontWeight.semibold },

  foodRow:   { flexDirection: 'row', alignItems: 'center', paddingHorizontal: spacing.md, paddingVertical: 10 },
  foodName:  { fontSize: fontSize.sm, fontWeight: fontWeight.medium },
  foodSub:   { fontSize: fontSize.xs },
  foodCals:  { fontSize: fontSize.sm, fontWeight: fontWeight.bold },
});
