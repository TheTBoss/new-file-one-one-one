import React, { useState } from 'react';
import {
  View, Text, TextInput, ScrollView, StyleSheet,
  TouchableOpacity, useColorScheme,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { getTheme, spacing, fontSize, fontWeight, radius, palette } from '../theme';
import { useSleepStore } from '../store/sleepStore';
import { SleepQuality } from '../types';
import { todayStr } from '../utils/date';

const QUALITY_OPTIONS: { value: SleepQuality; label: string; emoji: string }[] = [
  { value: 1, label: 'Terrible', emoji: '\ud83d\ude29' },
  { value: 2, label: 'Poor',     emoji: '\ud83d\ude1e' },
  { value: 3, label: 'Fair',     emoji: '\ud83d\ude10' },
  { value: 4, label: 'Good',     emoji: '\ud83d\ude0a' },
  { value: 5, label: 'Excellent',emoji: '\ud83d\ude04' },
];

export default function AddSleepScreen() {
  const colorScheme = useColorScheme();
  const theme = getTheme(colorScheme);
  const nav = useNavigation();
  const { addEntry } = useSleepStore();
  const bg = colorScheme === 'dark' ? '#000' : '#F2F2F7';

  const [bedHour, setBedHour]     = useState('22');
  const [bedMin, setBedMin]       = useState('30');
  const [wakeHour, setWakeHour]   = useState('6');
  const [wakeMin, setWakeMin]     = useState('30');
  const [quality, setQuality]     = useState<SleepQuality>(4);
  const [interruptions, setInter] = useState('0');
  const [feltRested, setRested]   = useState(true);
  const [notes, setNotes]         = useState('');

  function save() {
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    const bH = parseInt(bedHour) || 22;
    const bM = parseInt(bedMin) || 0;
    const wH = parseInt(wakeHour) || 6;
    const wM = parseInt(wakeMin) || 0;

    const bedDate = new Date(yesterday);
    bedDate.setHours(bH, bM, 0, 0);
    if (bH < 12) {
      bedDate.setDate(today.getDate());
    }

    const wakeDate = new Date(today);
    wakeDate.setHours(wH, wM, 0, 0);

    addEntry({
      bedTime: bedDate.toISOString(),
      wakeTime: wakeDate.toISOString(),
      quality,
      notes: notes.trim(),
      interruptions: parseInt(interruptions) || 0,
      feltRested,
      date: todayStr(),
    });
    nav.goBack();
  }

  return (
    <View style={[styles.container, { backgroundColor: bg }]}>
      <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
        {/* Bed time */}
        <Text style={[styles.label, { color: theme.textSecondary }]}>BED TIME</Text>
        <View style={[styles.card, { backgroundColor: theme.cardBackground }]}>
          <View style={styles.timeRow}>
            <Ionicons name="moon-outline" size={22} color={palette.indigo} />
            <TextInput
              style={[styles.timeInput, { color: theme.text, borderColor: theme.border }]}
              keyboardType="number-pad"
              maxLength={2}
              value={bedHour}
              onChangeText={setBedHour}
            />
            <Text style={[styles.colon, { color: theme.text }]}>:</Text>
            <TextInput
              style={[styles.timeInput, { color: theme.text, borderColor: theme.border }]}
              keyboardType="number-pad"
              maxLength={2}
              value={bedMin}
              onChangeText={setBedMin}
            />
          </View>
        </View>

        {/* Wake time */}
        <Text style={[styles.label, { color: theme.textSecondary }]}>WAKE TIME</Text>
        <View style={[styles.card, { backgroundColor: theme.cardBackground }]}>
          <View style={styles.timeRow}>
            <Ionicons name="sunny-outline" size={22} color={palette.orange} />
            <TextInput
              style={[styles.timeInput, { color: theme.text, borderColor: theme.border }]}
              keyboardType="number-pad"
              maxLength={2}
              value={wakeHour}
              onChangeText={setWakeHour}
            />
            <Text style={[styles.colon, { color: theme.text }]}>:</Text>
            <TextInput
              style={[styles.timeInput, { color: theme.text, borderColor: theme.border }]}
              keyboardType="number-pad"
              maxLength={2}
              value={wakeMin}
              onChangeText={setWakeMin}
            />
          </View>
        </View>

        {/* Quality */}
        <Text style={[styles.label, { color: theme.textSecondary }]}>SLEEP QUALITY</Text>
        <View style={[styles.card, { backgroundColor: theme.cardBackground }]}>
          <View style={styles.qualityRow}>
            {QUALITY_OPTIONS.map((q) => (
              <TouchableOpacity
                key={q.value}
                style={[styles.qualityBtn, {
                  backgroundColor: quality === q.value ? palette.indigo + '20' : 'transparent',
                  borderColor: quality === q.value ? palette.indigo : theme.border,
                  borderWidth: 1,
                }]}
                onPress={() => setQuality(q.value)}
              >
                <Text style={{ fontSize: 24 }}>{q.emoji}</Text>
                <Text style={[styles.qualityLabel, {
                  color: quality === q.value ? palette.indigo : theme.textSecondary,
                }]}>{q.label}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Interruptions */}
        <Text style={[styles.label, { color: theme.textSecondary }]}>INTERRUPTIONS</Text>
        <View style={[styles.card, { backgroundColor: theme.cardBackground }]}>
          <View style={styles.counterRow}>
            <TouchableOpacity onPress={() => setInter(String(Math.max(0, (parseInt(interruptions) || 0) - 1)))}>
              <Ionicons name="remove-circle-outline" size={28} color={theme.textSecondary} />
            </TouchableOpacity>
            <Text style={[styles.counterVal, { color: theme.text }]}>{interruptions}</Text>
            <TouchableOpacity onPress={() => setInter(String((parseInt(interruptions) || 0) + 1))}>
              <Ionicons name="add-circle-outline" size={28} color={theme.textSecondary} />
            </TouchableOpacity>
          </View>
        </View>

        {/* Felt rested */}
        <Text style={[styles.label, { color: theme.textSecondary }]}>FELT RESTED?</Text>
        <View style={[styles.card, { backgroundColor: theme.cardBackground }]}>
          <View style={styles.toggleRow}>
            <TouchableOpacity
              style={[styles.toggleBtn, { backgroundColor: feltRested ? palette.green : 'transparent', borderColor: palette.green }]}
              onPress={() => setRested(true)}
            >
              <Text style={{ color: feltRested ? '#fff' : palette.green, fontWeight: '600' }}>Yes</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.toggleBtn, { backgroundColor: !feltRested ? palette.red : 'transparent', borderColor: palette.red }]}
              onPress={() => setRested(false)}
            >
              <Text style={{ color: !feltRested ? '#fff' : palette.red, fontWeight: '600' }}>No</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Notes */}
        <Text style={[styles.label, { color: theme.textSecondary }]}>NOTES</Text>
        <View style={[styles.card, { backgroundColor: theme.cardBackground }]}>
          <TextInput
            style={[styles.notesInput, { color: theme.text }]}
            placeholder="Optional notes..."
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
          <Text style={styles.saveBtnText}>Log Sleep</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container:   { flex: 1 },
  content:     { padding: spacing.lg, paddingBottom: 100 },
  label:       { fontSize: fontSize.xs, fontWeight: fontWeight.semibold, marginBottom: 6, marginTop: spacing.sm, marginLeft: spacing.xs },
  card:        { borderRadius: radius.md, padding: spacing.md, marginBottom: spacing.sm },
  timeRow:     { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  timeInput:   { width: 56, height: 48, borderWidth: 1, borderRadius: radius.sm, textAlign: 'center', fontSize: fontSize.xl, fontWeight: fontWeight.bold },
  colon:       { fontSize: fontSize.xl, fontWeight: fontWeight.bold },
  qualityRow:  { flexDirection: 'row', gap: spacing.sm },
  qualityBtn:  { flex: 1, alignItems: 'center', paddingVertical: spacing.sm, borderRadius: radius.md },
  qualityLabel:{ fontSize: 9, marginTop: 2, fontWeight: fontWeight.semibold },
  counterRow:  { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: spacing.xl },
  counterVal:  { fontSize: fontSize.xxl, fontWeight: fontWeight.bold, minWidth: 40, textAlign: 'center' },
  toggleRow:   { flexDirection: 'row', gap: spacing.sm },
  toggleBtn:   { flex: 1, alignItems: 'center', paddingVertical: spacing.sm, borderRadius: radius.md, borderWidth: 1 },
  notesInput:  { fontSize: fontSize.md, minHeight: 60, textAlignVertical: 'top' },
  footer:      { position: 'absolute', bottom: 0, left: 0, right: 0, padding: spacing.lg, borderTopWidth: 1 },
  saveBtn:     { padding: spacing.md, borderRadius: radius.lg, alignItems: 'center' },
  saveBtnText: { color: '#fff', fontSize: fontSize.md, fontWeight: fontWeight.bold },
});
