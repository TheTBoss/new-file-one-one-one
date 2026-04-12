import React, { useState } from 'react';
import {
  View, Text, TextInput, ScrollView, StyleSheet,
  TouchableOpacity, useColorScheme,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { getTheme, spacing, fontSize, fontWeight, radius, palette } from '../theme';
import { useBodyStore } from '../store/bodyStore';
import { todayStr } from '../utils/date';

interface MeasurementField {
  key: string;
  label: string;
  unit: string;
  color: string;
}

const BASIC_FIELDS: MeasurementField[] = [
  { key: 'weight',          label: 'Weight',          unit: 'kg', color: palette.purple },
  { key: 'bodyFat',         label: 'Body Fat',        unit: '%',  color: palette.orange },
  { key: 'muscleMass',      label: 'Muscle Mass',     unit: 'kg', color: palette.blue },
  { key: 'waterPercentage', label: 'Water %',         unit: '%',  color: palette.cyan },
];

const BODY_FIELDS: MeasurementField[] = [
  { key: 'chest',      label: 'Chest',        unit: 'cm', color: palette.red },
  { key: 'waist',      label: 'Waist',        unit: 'cm', color: palette.orange },
  { key: 'hips',       label: 'Hips',         unit: 'cm', color: palette.pink },
  { key: 'neck',       label: 'Neck',         unit: 'cm', color: palette.teal },
  { key: 'shoulders',  label: 'Shoulders',    unit: 'cm', color: palette.indigo },
  { key: 'bicepLeft',  label: 'Bicep (L)',    unit: 'cm', color: palette.blue },
  { key: 'bicepRight', label: 'Bicep (R)',    unit: 'cm', color: palette.blue },
  { key: 'thighLeft',  label: 'Thigh (L)',    unit: 'cm', color: palette.green },
  { key: 'thighRight', label: 'Thigh (R)',    unit: 'cm', color: palette.green },
  { key: 'calfLeft',   label: 'Calf (L)',     unit: 'cm', color: palette.yellow },
  { key: 'calfRight',  label: 'Calf (R)',     unit: 'cm', color: palette.yellow },
];

export default function AddMeasurementScreen() {
  const colorScheme = useColorScheme();
  const theme = getTheme(colorScheme);
  const nav = useNavigation();
  const { addMeasurement, latest } = useBodyStore();
  const prev = latest();
  const bg = colorScheme === 'dark' ? '#000' : '#F2F2F7';

  const [values, setValues] = useState<Record<string, string>>(() => {
    const init: Record<string, string> = {};
    [...BASIC_FIELDS, ...BODY_FIELDS].forEach((f) => {
      const prevVal = prev ? (prev as any)[f.key] : 0;
      init[f.key] = prevVal > 0 ? String(prevVal) : '';
    });
    return init;
  });
  const [notes, setNotes] = useState('');

  const isValid = parseFloat(values.weight) > 0;

  function save() {
    addMeasurement({
      date: todayStr(),
      weight:          parseFloat(values.weight) || 0,
      bodyFat:         parseFloat(values.bodyFat) || 0,
      muscleMass:      parseFloat(values.muscleMass) || 0,
      waterPercentage: parseFloat(values.waterPercentage) || 0,
      chest:           parseFloat(values.chest) || 0,
      waist:           parseFloat(values.waist) || 0,
      hips:            parseFloat(values.hips) || 0,
      neck:            parseFloat(values.neck) || 0,
      bicepLeft:       parseFloat(values.bicepLeft) || 0,
      bicepRight:      parseFloat(values.bicepRight) || 0,
      thighLeft:       parseFloat(values.thighLeft) || 0,
      thighRight:      parseFloat(values.thighRight) || 0,
      calfLeft:        parseFloat(values.calfLeft) || 0,
      calfRight:       parseFloat(values.calfRight) || 0,
      shoulders:       parseFloat(values.shoulders) || 0,
      notes: notes.trim(),
    });
    nav.goBack();
  }

  function renderField(field: MeasurementField) {
    return (
      <View key={field.key} style={styles.fieldRow}>
        <View style={[styles.colorDot, { backgroundColor: field.color }]} />
        <Text style={[styles.fieldLabel, { color: theme.text }]}>{field.label}</Text>
        <View style={{ flex: 1 }} />
        <TextInput
          style={[styles.fieldInput, { color: theme.text, borderColor: theme.border }]}
          keyboardType="decimal-pad"
          placeholder="0"
          placeholderTextColor={theme.textTertiary}
          textAlign="right"
          value={values[field.key]}
          onChangeText={(v) => setValues((prev) => ({ ...prev, [field.key]: v }))}
        />
        <Text style={[styles.unitLabel, { color: theme.textSecondary }]}>{field.unit}</Text>
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: bg }]}>
      <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
        {/* Basic */}
        <Text style={[styles.sectionLabel, { color: theme.textSecondary }]}>COMPOSITION</Text>
        <View style={[styles.card, { backgroundColor: theme.cardBackground }]}>
          {BASIC_FIELDS.map((f, i) => (
            <React.Fragment key={f.key}>
              {i > 0 && <View style={[styles.divider, { backgroundColor: theme.border }]} />}
              {renderField(f)}
            </React.Fragment>
          ))}
        </View>

        {/* Body measurements */}
        <Text style={[styles.sectionLabel, { color: theme.textSecondary }]}>MEASUREMENTS</Text>
        <View style={[styles.card, { backgroundColor: theme.cardBackground }]}>
          {BODY_FIELDS.map((f, i) => (
            <React.Fragment key={f.key}>
              {i > 0 && <View style={[styles.divider, { backgroundColor: theme.border }]} />}
              {renderField(f)}
            </React.Fragment>
          ))}
        </View>

        {/* Notes */}
        <Text style={[styles.sectionLabel, { color: theme.textSecondary }]}>NOTES</Text>
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
          style={[styles.saveBtn, { backgroundColor: isValid ? theme.primary : theme.border }]}
          onPress={save}
          disabled={!isValid}
          activeOpacity={0.8}
        >
          <Text style={[styles.saveBtnText, { color: isValid ? '#fff' : theme.textTertiary }]}>
            Save Measurements
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container:    { flex: 1 },
  content:      { padding: spacing.lg, paddingBottom: 100 },
  sectionLabel: { fontSize: fontSize.xs, fontWeight: fontWeight.semibold, marginBottom: 6, marginTop: spacing.sm, marginLeft: spacing.xs },
  card:         { borderRadius: radius.md, overflow: 'hidden', marginBottom: spacing.sm },
  fieldRow:     { flexDirection: 'row', alignItems: 'center', paddingHorizontal: spacing.md, paddingVertical: 10 },
  colorDot:     { width: 10, height: 10, borderRadius: 5, marginRight: spacing.sm },
  fieldLabel:   { fontSize: fontSize.sm },
  fieldInput:   { width: 70, fontSize: fontSize.md, borderWidth: 1, borderRadius: radius.sm, paddingHorizontal: 8, paddingVertical: 4 },
  unitLabel:    { fontSize: fontSize.sm, marginLeft: spacing.xs, width: 30 },
  divider:      { height: StyleSheet.hairlineWidth, marginHorizontal: spacing.md },
  notesInput:   { padding: spacing.md, fontSize: fontSize.md, minHeight: 60, textAlignVertical: 'top' },
  footer:       { position: 'absolute', bottom: 0, left: 0, right: 0, padding: spacing.lg, borderTopWidth: 1 },
  saveBtn:      { padding: spacing.md, borderRadius: radius.lg, alignItems: 'center' },
  saveBtnText:  { fontSize: fontSize.md, fontWeight: fontWeight.bold },
});
