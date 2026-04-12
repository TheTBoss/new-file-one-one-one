import React, { useState } from 'react';
import {
  View, Text, TextInput, ScrollView, StyleSheet,
  TouchableOpacity, useColorScheme, Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { getTheme, spacing, fontSize, fontWeight, radius, palette } from '../theme';
import { useSettingsStore } from '../store/settingsStore';

export default function SettingsScreen() {
  const colorScheme = useColorScheme();
  const theme = getTheme(colorScheme);
  const bg = colorScheme === 'dark' ? '#000' : '#F2F2F7';

  const { profile, goals, updateProfile, updateGoals } = useSettingsStore();

  const [name, setName]       = useState(profile.name);
  const [height, setHeight]   = useState(String(profile.heightCm));
  const [birth, setBirth]     = useState(String(profile.birthYear));

  const [calGoal, setCalGoal]       = useState(String(goals.calorieGoal));
  const [protGoal, setProtGoal]     = useState(String(goals.proteinGoal));
  const [carbGoal, setCarbGoal]     = useState(String(goals.carbGoal));
  const [fatGoal, setFatGoal]       = useState(String(goals.fatGoal));
  const [fiberGoal, setFiberGoal]   = useState(String(goals.fiberGoal));
  const [waterGoal, setWaterGoal]   = useState(String(goals.waterGoal));
  const [sleepGoal, setSleepGoal]   = useState(String(goals.sleepGoal));
  const [weightGoal, setWeightGoal] = useState(String(goals.weightGoal));

  function saveProfile() {
    updateProfile({
      name: name.trim(),
      heightCm: parseInt(height) || 170,
      birthYear: parseInt(birth) || 1990,
    });
    Alert.alert('Saved', 'Profile updated.');
  }

  function saveGoals() {
    updateGoals({
      calorieGoal: parseInt(calGoal) || 2000,
      proteinGoal: parseInt(protGoal) || 150,
      carbGoal:    parseInt(carbGoal) || 250,
      fatGoal:     parseInt(fatGoal) || 65,
      fiberGoal:   parseInt(fiberGoal) || 25,
      waterGoal:   parseInt(waterGoal) || 2500,
      sleepGoal:   parseFloat(sleepGoal) || 8,
      weightGoal:  parseFloat(weightGoal) || 75,
    });
    Alert.alert('Saved', 'Goals updated.');
  }

  return (
    <ScrollView style={[styles.scroll, { backgroundColor: bg }]} contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
      {/* Profile */}
      <Text style={[styles.sectionLabel, { color: theme.textSecondary }]}>PROFILE</Text>
      <View style={[styles.card, { backgroundColor: theme.cardBackground }]}>
        <SettingRow label="Name" value={name} onChange={setName} theme={theme} />
        <Divider theme={theme} />
        <SettingRow label="Height (cm)" value={height} onChange={setHeight} keyboard="number-pad" theme={theme} />
        <Divider theme={theme} />
        <SettingRow label="Birth Year" value={birth} onChange={setBirth} keyboard="number-pad" theme={theme} />
      </View>
      <TouchableOpacity
        style={[styles.saveRowBtn, { backgroundColor: theme.primary }]}
        onPress={saveProfile}
        activeOpacity={0.8}
      >
        <Text style={styles.saveRowBtnText}>Save Profile</Text>
      </TouchableOpacity>

      {/* Goals */}
      <Text style={[styles.sectionLabel, { color: theme.textSecondary }]}>DAILY GOALS</Text>
      <View style={[styles.card, { backgroundColor: theme.cardBackground }]}>
        <SettingRow label="Calories (kcal)"  value={calGoal}    onChange={setCalGoal}    keyboard="number-pad" theme={theme} />
        <Divider theme={theme} />
        <SettingRow label="Protein (g)"      value={protGoal}   onChange={setProtGoal}   keyboard="number-pad" theme={theme} />
        <Divider theme={theme} />
        <SettingRow label="Carbs (g)"        value={carbGoal}   onChange={setCarbGoal}   keyboard="number-pad" theme={theme} />
        <Divider theme={theme} />
        <SettingRow label="Fat (g)"          value={fatGoal}    onChange={setFatGoal}    keyboard="number-pad" theme={theme} />
        <Divider theme={theme} />
        <SettingRow label="Fiber (g)"        value={fiberGoal}  onChange={setFiberGoal}  keyboard="number-pad" theme={theme} />
        <Divider theme={theme} />
        <SettingRow label="Water (ml)"       value={waterGoal}  onChange={setWaterGoal}  keyboard="number-pad" theme={theme} />
        <Divider theme={theme} />
        <SettingRow label="Sleep (hours)"    value={sleepGoal}  onChange={setSleepGoal}  keyboard="decimal-pad" theme={theme} />
        <Divider theme={theme} />
        <SettingRow label="Weight Goal (kg)" value={weightGoal} onChange={setWeightGoal} keyboard="decimal-pad" theme={theme} />
      </View>
      <TouchableOpacity
        style={[styles.saveRowBtn, { backgroundColor: theme.primary }]}
        onPress={saveGoals}
        activeOpacity={0.8}
      >
        <Text style={styles.saveRowBtnText}>Save Goals</Text>
      </TouchableOpacity>

      {/* App info */}
      <Text style={[styles.sectionLabel, { color: theme.textSecondary }]}>ABOUT</Text>
      <View style={[styles.card, { backgroundColor: theme.cardBackground }]}>
        <View style={styles.infoRow}>
          <Text style={[styles.infoLabel, { color: theme.textSecondary }]}>App</Text>
          <Text style={[styles.infoValue, { color: theme.text }]}>HealthTracker</Text>
        </View>
        <Divider theme={theme} />
        <View style={styles.infoRow}>
          <Text style={[styles.infoLabel, { color: theme.textSecondary }]}>Version</Text>
          <Text style={[styles.infoValue, { color: theme.text }]}>1.0.0</Text>
        </View>
        <Divider theme={theme} />
        <View style={styles.infoRow}>
          <Text style={[styles.infoLabel, { color: theme.textSecondary }]}>Data Storage</Text>
          <Text style={[styles.infoValue, { color: theme.text }]}>Local (AsyncStorage)</Text>
        </View>
      </View>
    </ScrollView>
  );
}

function SettingRow({ label, value, onChange, keyboard = 'default', theme }: any) {
  return (
    <View style={styles.settingRow}>
      <Text style={[styles.settingLabel, { color: theme.textSecondary }]}>{label}</Text>
      <TextInput
        style={[styles.settingInput, { color: theme.text }]}
        value={value}
        onChangeText={onChange}
        keyboardType={keyboard}
        textAlign="right"
      />
    </View>
  );
}

function Divider({ theme }: { theme: any }) {
  return <View style={[styles.divider, { backgroundColor: theme.border }]} />;
}

const styles = StyleSheet.create({
  scroll:        { flex: 1 },
  content:       { padding: spacing.lg, paddingBottom: 40 },
  sectionLabel:  { fontSize: fontSize.xs, fontWeight: fontWeight.semibold, marginBottom: 6, marginTop: spacing.lg, marginLeft: spacing.xs },
  card:          { borderRadius: radius.md, overflow: 'hidden', marginBottom: spacing.sm },
  settingRow:    { flexDirection: 'row', alignItems: 'center', paddingHorizontal: spacing.md, paddingVertical: 12 },
  settingLabel:  { fontSize: fontSize.sm, flex: 1 },
  settingInput:  { fontSize: fontSize.md, fontWeight: fontWeight.semibold, minWidth: 80 },
  divider:       { height: StyleSheet.hairlineWidth, marginHorizontal: spacing.md },
  saveRowBtn:    { padding: spacing.md, borderRadius: radius.lg, alignItems: 'center', marginBottom: spacing.sm },
  saveRowBtnText:{ color: '#fff', fontSize: fontSize.md, fontWeight: fontWeight.bold },
  infoRow:       { flexDirection: 'row', alignItems: 'center', paddingHorizontal: spacing.md, paddingVertical: 12 },
  infoLabel:     { fontSize: fontSize.sm, flex: 1 },
  infoValue:     { fontSize: fontSize.sm, fontWeight: fontWeight.medium },
});
