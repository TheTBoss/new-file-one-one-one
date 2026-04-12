import React, { useState } from 'react';
import {
  View, Text, TextInput, ScrollView, StyleSheet,
  TouchableOpacity, useColorScheme,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { getTheme, spacing, fontSize, fontWeight, radius, palette } from '../theme';
import { useLifestyleStore } from '../store/lifestyleStore';
import { MoodLevel } from '../types';
import { todayStr } from '../utils/date';

const MOOD_OPTIONS: { value: MoodLevel; emoji: string; label: string }[] = [
  { value: 1, emoji: '\ud83d\ude29', label: 'Terrible' },
  { value: 2, emoji: '\ud83d\ude1e', label: 'Bad' },
  { value: 3, emoji: '\ud83d\ude10', label: 'Okay' },
  { value: 4, emoji: '\ud83d\ude0a', label: 'Good' },
  { value: 5, emoji: '\ud83d\ude04', label: 'Great' },
];

const TAGS = [
  'Productive', 'Relaxed', 'Anxious', 'Energetic', 'Tired',
  'Stressed', 'Happy', 'Focused', 'Social', 'Creative',
  'Motivated', 'Calm',
];

export default function AddMoodScreen() {
  const colorScheme = useColorScheme();
  const theme = getTheme(colorScheme);
  const nav = useNavigation();
  const { addMood } = useLifestyleStore();
  const bg = colorScheme === 'dark' ? '#000' : '#F2F2F7';

  const [mood, setMood]       = useState<MoodLevel>(3);
  const [energy, setEnergy]   = useState(5);
  const [stress, setStress]   = useState(3);
  const [anxiety, setAnxiety] = useState(3);
  const [notes, setNotes]     = useState('');
  const [tags, setTags]       = useState<string[]>([]);

  function toggleTag(tag: string) {
    setTags((prev) =>
      prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]
    );
  }

  function save() {
    addMood({
      date: todayStr(),
      mood,
      energyLevel: energy,
      stressLevel: stress,
      anxietyLevel: anxiety,
      notes: notes.trim(),
      tags,
    });
    nav.goBack();
  }

  return (
    <View style={[styles.container, { backgroundColor: bg }]}>
      <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
        {/* Mood */}
        <Text style={[styles.label, { color: theme.textSecondary }]}>HOW ARE YOU FEELING?</Text>
        <View style={[styles.card, { backgroundColor: theme.cardBackground }]}>
          <View style={styles.moodRow}>
            {MOOD_OPTIONS.map((m) => (
              <TouchableOpacity
                key={m.value}
                style={[styles.moodBtn, {
                  backgroundColor: mood === m.value ? palette.yellow + '25' : 'transparent',
                  borderColor: mood === m.value ? palette.yellow : theme.border,
                  borderWidth: mood === m.value ? 2 : 1,
                }]}
                onPress={() => setMood(m.value)}
              >
                <Text style={{ fontSize: 28 }}>{m.emoji}</Text>
                <Text style={[styles.moodLabel, {
                  color: mood === m.value ? palette.yellow : theme.textSecondary,
                }]}>{m.label}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Sliders */}
        <SliderField
          label="ENERGY LEVEL"
          value={energy}
          onChange={setEnergy}
          color={palette.orange}
          theme={theme}
        />
        <SliderField
          label="STRESS LEVEL"
          value={stress}
          onChange={setStress}
          color={palette.red}
          theme={theme}
        />
        <SliderField
          label="ANXIETY LEVEL"
          value={anxiety}
          onChange={setAnxiety}
          color={palette.purple}
          theme={theme}
        />

        {/* Tags */}
        <Text style={[styles.label, { color: theme.textSecondary }]}>TAGS</Text>
        <View style={styles.tagGrid}>
          {TAGS.map((tag) => (
            <TouchableOpacity
              key={tag}
              style={[styles.tag, {
                backgroundColor: tags.includes(tag) ? theme.primary : theme.cardBackground,
                borderColor: theme.primary, borderWidth: 1,
              }]}
              onPress={() => toggleTag(tag)}
            >
              <Text style={{
                color: tags.includes(tag) ? '#fff' : theme.primary,
                fontSize: fontSize.xs, fontWeight: '600',
              }}>{tag}</Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Notes */}
        <Text style={[styles.label, { color: theme.textSecondary }]}>NOTES</Text>
        <View style={[styles.card, { backgroundColor: theme.cardBackground }]}>
          <TextInput
            style={[styles.notesInput, { color: theme.text }]}
            placeholder="How was your day?"
            placeholderTextColor={theme.textTertiary}
            multiline
            value={notes}
            onChangeText={setNotes}
          />
        </View>
      </ScrollView>

      <View style={[styles.footer, { backgroundColor: bg, borderTopColor: theme.border }]}>
        <TouchableOpacity
          style={[styles.saveBtn, { backgroundColor: theme.primary }]}
          onPress={save}
          activeOpacity={0.8}
        >
          <Text style={styles.saveBtnText}>Log Mood</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

function SliderField({ label, value, onChange, color, theme }: {
  label: string; value: number; onChange: (v: number) => void; color: string; theme: any;
}) {
  return (
    <>
      <Text style={[styles.label, { color: theme.textSecondary }]}>{label}</Text>
      <View style={[styles.card, { backgroundColor: theme.cardBackground }]}>
        <View style={styles.sliderRow}>
          <TouchableOpacity onPress={() => onChange(Math.max(1, value - 1))}>
            <Ionicons name="remove-circle-outline" size={26} color={theme.textSecondary} />
          </TouchableOpacity>
          <View style={styles.sliderDots}>
            {Array.from({ length: 10 }, (_, i) => (
              <TouchableOpacity key={i} onPress={() => onChange(i + 1)}>
                <View style={[styles.sliderDot, {
                  backgroundColor: i < value ? color : theme.border,
                  width: i < value ? 24 : 20,
                  height: i < value ? 24 : 20,
                  borderRadius: 12,
                }]} />
              </TouchableOpacity>
            ))}
          </View>
          <TouchableOpacity onPress={() => onChange(Math.min(10, value + 1))}>
            <Ionicons name="add-circle-outline" size={26} color={theme.textSecondary} />
          </TouchableOpacity>
        </View>
        <Text style={[styles.sliderVal, { color }]}>{value}/10</Text>
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  container:  { flex: 1 },
  content:    { padding: spacing.lg, paddingBottom: 100 },
  label:      { fontSize: fontSize.xs, fontWeight: fontWeight.semibold, marginBottom: 6, marginTop: spacing.sm, marginLeft: spacing.xs },
  card:       { borderRadius: radius.md, padding: spacing.md, marginBottom: spacing.sm },
  moodRow:    { flexDirection: 'row', gap: spacing.sm },
  moodBtn:    { flex: 1, alignItems: 'center', paddingVertical: spacing.sm, borderRadius: radius.md },
  moodLabel:  { fontSize: 9, marginTop: 2, fontWeight: fontWeight.semibold },
  sliderRow:  { flexDirection: 'row', alignItems: 'center', gap: spacing.xs },
  sliderDots: { flex: 1, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  sliderDot:  { alignItems: 'center', justifyContent: 'center' },
  sliderVal:  { textAlign: 'center', fontWeight: fontWeight.bold, marginTop: spacing.xs },
  tagGrid:    { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm, marginBottom: spacing.md },
  tag:        { paddingHorizontal: spacing.md, paddingVertical: 6, borderRadius: radius.full },
  notesInput: { fontSize: fontSize.md, minHeight: 80, textAlignVertical: 'top' },
  footer:     { position: 'absolute', bottom: 0, left: 0, right: 0, padding: spacing.lg, borderTopWidth: 1 },
  saveBtn:    { padding: spacing.md, borderRadius: radius.lg, alignItems: 'center' },
  saveBtnText:{ color: '#fff', fontSize: fontSize.md, fontWeight: fontWeight.bold },
});
