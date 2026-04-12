import React, { useState } from 'react';
import {
  View, Text, TextInput, ScrollView, StyleSheet,
  TouchableOpacity, useColorScheme,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { getTheme, spacing, fontSize, fontWeight, radius, palette, namedColor } from '../theme';
import { useHabitStore } from '../store/habitStore';
import { HabitCategory, HabitFrequency } from '../types';

const CATEGORIES: { value: HabitCategory; label: string; icon: string }[] = [
  { value: 'health',       label: 'Health',       icon: 'heart-outline' },
  { value: 'fitness',      label: 'Fitness',      icon: 'barbell-outline' },
  { value: 'mindfulness',  label: 'Mindfulness',  icon: 'leaf-outline' },
  { value: 'nutrition',    label: 'Nutrition',     icon: 'nutrition-outline' },
  { value: 'sleep',        label: 'Sleep',         icon: 'moon-outline' },
  { value: 'productivity', label: 'Productivity',  icon: 'rocket-outline' },
  { value: 'learning',     label: 'Learning',      icon: 'book-outline' },
  { value: 'social',       label: 'Social',        icon: 'people-outline' },
  { value: 'other',        label: 'Other',         icon: 'ellipsis-horizontal-outline' },
];

const FREQUENCIES: { value: HabitFrequency; label: string }[] = [
  { value: 'daily',    label: 'Every day' },
  { value: 'weekdays', label: 'Weekdays' },
  { value: 'weekends', label: 'Weekends' },
  { value: '3x',       label: '3x / week' },
  { value: '5x',       label: '5x / week' },
];

const COLORS = ['blue', 'green', 'orange', 'red', 'purple', 'pink', 'teal', 'indigo', 'cyan', 'yellow'];

const ICONS = [
  'checkmark-circle-outline', 'heart-outline', 'barbell-outline', 'water-outline',
  'book-outline', 'walk-outline', 'leaf-outline', 'moon-outline',
  'musical-notes-outline', 'bicycle-outline', 'code-slash-outline', 'pencil-outline',
];

const FREQ_DAYS: Record<HabitFrequency, number> = {
  daily: 7, weekdays: 5, weekends: 2, '3x': 3, '5x': 5, custom: 3,
};

export default function AddHabitScreen() {
  const colorScheme = useColorScheme();
  const theme = getTheme(colorScheme);
  const nav = useNavigation();
  const { addHabit } = useHabitStore();

  const [name, setName]           = useState('');
  const [description, setDesc]    = useState('');
  const [category, setCategory]   = useState<HabitCategory>('health');
  const [frequency, setFrequency] = useState<HabitFrequency>('daily');
  const [color, setColor]         = useState('blue');
  const [icon, setIcon]           = useState('checkmark-circle-outline');

  const isValid = name.trim().length > 0;
  const bg = colorScheme === 'dark' ? '#000' : '#F2F2F7';

  function save() {
    addHabit({
      name: name.trim(),
      description: description.trim(),
      category,
      frequency,
      targetDaysPerWeek: FREQ_DAYS[frequency],
      color,
      icon,
      isActive: true,
    });
    nav.goBack();
  }

  return (
    <View style={[styles.container, { backgroundColor: bg }]}>
      <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
        {/* Name */}
        <Text style={[styles.label, { color: theme.textSecondary }]}>HABIT NAME</Text>
        <View style={[styles.inputCard, { backgroundColor: theme.cardBackground }]}>
          <TextInput
            style={[styles.input, { color: theme.text }]}
            placeholder="e.g. Drink 8 glasses of water"
            placeholderTextColor={theme.textTertiary}
            value={name}
            onChangeText={setName}
          />
        </View>

        {/* Description */}
        <Text style={[styles.label, { color: theme.textSecondary }]}>DESCRIPTION</Text>
        <View style={[styles.inputCard, { backgroundColor: theme.cardBackground }]}>
          <TextInput
            style={[styles.input, { color: theme.text }]}
            placeholder="Optional description"
            placeholderTextColor={theme.textTertiary}
            value={description}
            onChangeText={setDesc}
          />
        </View>

        {/* Category */}
        <Text style={[styles.label, { color: theme.textSecondary }]}>CATEGORY</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: spacing.md }}>
          <View style={styles.chipRow}>
            {CATEGORIES.map((c) => (
              <TouchableOpacity
                key={c.value}
                style={[styles.chip, {
                  backgroundColor: category === c.value ? theme.primary : theme.cardBackground,
                  borderColor: theme.primary, borderWidth: 1,
                }]}
                onPress={() => setCategory(c.value)}
              >
                <Ionicons
                  name={c.icon as any}
                  size={14}
                  color={category === c.value ? '#fff' : theme.primary}
                />
                <Text style={{
                  color: category === c.value ? '#fff' : theme.primary,
                  fontSize: fontSize.xs, fontWeight: '600',
                }}>{c.label}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </ScrollView>

        {/* Frequency */}
        <Text style={[styles.label, { color: theme.textSecondary }]}>FREQUENCY</Text>
        <View style={[styles.inputCard, { backgroundColor: theme.cardBackground, padding: spacing.sm }]}>
          {FREQUENCIES.map((f) => (
            <TouchableOpacity
              key={f.value}
              style={[styles.freqRow, {
                backgroundColor: frequency === f.value ? theme.primary + '15' : 'transparent',
                borderRadius: radius.sm,
              }]}
              onPress={() => setFrequency(f.value)}
            >
              <Ionicons
                name={frequency === f.value ? 'radio-button-on' : 'radio-button-off'}
                size={20}
                color={frequency === f.value ? theme.primary : theme.textTertiary}
              />
              <Text style={[styles.freqLabel, {
                color: frequency === f.value ? theme.primary : theme.text,
              }]}>{f.label}</Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Color */}
        <Text style={[styles.label, { color: theme.textSecondary }]}>COLOR</Text>
        <View style={styles.colorRow}>
          {COLORS.map((c) => (
            <TouchableOpacity
              key={c}
              style={[styles.colorDot, {
                backgroundColor: namedColor(c),
                borderWidth: color === c ? 3 : 0,
                borderColor: theme.text,
              }]}
              onPress={() => setColor(c)}
            />
          ))}
        </View>

        {/* Icon */}
        <Text style={[styles.label, { color: theme.textSecondary }]}>ICON</Text>
        <View style={styles.iconGrid}>
          {ICONS.map((ic) => (
            <TouchableOpacity
              key={ic}
              style={[styles.iconBtn, {
                backgroundColor: icon === ic ? namedColor(color) : theme.cardBackground,
                borderColor: icon === ic ? namedColor(color) : theme.border,
                borderWidth: 1,
              }]}
              onPress={() => setIcon(ic)}
            >
              <Ionicons name={ic as any} size={22} color={icon === ic ? '#fff' : theme.textSecondary} />
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>

      {/* Save */}
      <View style={[styles.footer, { backgroundColor: bg, borderTopColor: theme.border }]}>
        <TouchableOpacity
          style={[styles.saveBtn, { backgroundColor: isValid ? theme.primary : theme.border }]}
          onPress={save}
          disabled={!isValid}
          activeOpacity={0.8}
        >
          <Text style={[styles.saveBtnText, { color: isValid ? '#fff' : theme.textTertiary }]}>Create Habit</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container:  { flex: 1 },
  content:    { padding: spacing.lg, paddingBottom: 100 },
  label:      { fontSize: fontSize.xs, fontWeight: fontWeight.semibold, marginBottom: 6, marginTop: spacing.sm, marginLeft: spacing.xs },
  inputCard:  { borderRadius: radius.md, overflow: 'hidden', marginBottom: spacing.sm },
  input:      { padding: spacing.md, fontSize: fontSize.md },
  chipRow:    { flexDirection: 'row', gap: spacing.sm, paddingHorizontal: spacing.xs },
  chip:       { flexDirection: 'row', alignItems: 'center', gap: 4, paddingHorizontal: spacing.md, paddingVertical: 8, borderRadius: radius.full },
  freqRow:    { flexDirection: 'row', alignItems: 'center', gap: spacing.sm, paddingHorizontal: spacing.sm, paddingVertical: 10 },
  freqLabel:  { fontSize: fontSize.sm, fontWeight: fontWeight.medium },
  colorRow:   { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm, marginBottom: spacing.md },
  colorDot:   { width: 36, height: 36, borderRadius: 18 },
  iconGrid:   { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm, marginBottom: spacing.lg },
  iconBtn:    { width: 48, height: 48, borderRadius: radius.md, alignItems: 'center', justifyContent: 'center' },
  footer:     { position: 'absolute', bottom: 0, left: 0, right: 0, padding: spacing.lg, borderTopWidth: 1 },
  saveBtn:    { padding: spacing.md, borderRadius: radius.lg, alignItems: 'center' },
  saveBtnText:{ fontSize: fontSize.md, fontWeight: fontWeight.bold },
});
