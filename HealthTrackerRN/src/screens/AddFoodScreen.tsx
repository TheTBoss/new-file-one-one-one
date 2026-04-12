import React, { useState } from 'react';
import {
  View, Text, TextInput, ScrollView, StyleSheet, TouchableOpacity,
  useColorScheme, Alert, Modal, FlatList,
} from 'react-native';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { getTheme, spacing, fontSize, fontWeight, radius, palette } from '../theme';
import { useNutritionStore } from '../store/nutritionStore';
import { MealType } from '../types';
import { NutritionStack } from '../navigation/TabNavigator';
import { FOOD_PRESETS } from '../utils/helpers';
import { todayStr } from '../utils/date';

type RouteT = RouteProp<NutritionStack, 'AddFood'>;

const MEAL_LABELS: Record<MealType, string> = {
  breakfast: 'Breakfast', lunch: 'Lunch', dinner: 'Dinner',
  snack: 'Snack', 'pre-workout': 'Pre-Workout', 'post-workout': 'Post-Workout',
};

export default function AddFoodScreen() {
  const colorScheme = useColorScheme();
  const theme = getTheme(colorScheme);
  const nav   = useNavigation();
  const route = useRoute<RouteT>();

  const mealTypeParam = (route.params?.mealType as MealType) ?? 'snack';
  const dateParam     = route.params?.date ?? todayStr();

  const { addEntry } = useNutritionStore();

  const [name,        setName]        = useState('');
  const [brand,       setBrand]       = useState('');
  const [calories,    setCalories]    = useState('');
  const [protein,     setProtein]     = useState('');
  const [carbs,       setCarbs]       = useState('');
  const [fat,         setFat]         = useState('');
  const [fiber,       setFiber]       = useState('');
  const [sodium,      setSodium]      = useState('');
  const [serving,     setServing]     = useState('1');
  const [servingUnit, setServingUnit] = useState('serving');
  const [mealType,    setMealType]    = useState<MealType>(mealTypeParam);
  const [showPresets, setShowPresets] = useState(false);
  const [presetSearch,setPresetSearch]= useState('');

  const isValid = name.trim().length > 0 && Number(calories) > 0;

  const calcCalories = () => {
    const p = Number(protein) || 0;
    const c = Number(carbs)   || 0;
    const f = Number(fat)     || 0;
    return p * 4 + c * 4 + f * 9;
  };

  function applyPreset(preset: typeof FOOD_PRESETS[0]) {
    setName(preset.name);
    setBrand(preset.brand);
    setCalories(String(Math.round(preset.calories)));
    setProtein(String(preset.protein));
    setCarbs(String(preset.carbohydrates));
    setFat(String(preset.fat));
    setServing(String(preset.servingSize));
    setServingUnit(preset.servingUnit);
    setShowPresets(false);
  }

  function save() {
    addEntry({
      name: name.trim(),
      brand:          brand.trim(),
      calories:       Number(calories) || 0,
      protein:        Number(protein)  || 0,
      carbohydrates:  Number(carbs)    || 0,
      fat:            Number(fat)      || 0,
      fiber:          Number(fiber)    || 0,
      sugar:          0,
      sodium:         Number(sodium)   || 0,
      servingSize:    Number(serving)  || 1,
      servingUnit:    servingUnit,
      mealType,
      date:           dateParam,
    });
    nav.goBack();
  }

  const filteredPresets = presetSearch
    ? FOOD_PRESETS.filter((p) => p.name.toLowerCase().includes(presetSearch.toLowerCase()))
    : FOOD_PRESETS;

  const bg = colorScheme === 'dark' ? '#000' : '#F2F2F7';

  return (
    <View style={[styles.container, { backgroundColor: bg }]}>
      <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">

        {/* Preset library button */}
        <TouchableOpacity
          style={[styles.presetBtn, { backgroundColor: theme.cardBackground, borderColor: theme.primary }]}
          onPress={() => setShowPresets(true)}
        >
          <Ionicons name="list" size={18} color={theme.primary} />
          <Text style={[styles.presetBtnText, { color: theme.primary }]}>Choose from Food Library</Text>
        </TouchableOpacity>

        <SectionLabel text="Food Details" theme={theme} />
        <FormCard theme={theme}>
          <FormField label="Name *"  value={name}    onChange={setName}    placeholder="e.g. Chicken Breast" theme={theme} />
          <Divider theme={theme} />
          <FormField label="Brand"   value={brand}   onChange={setBrand}   placeholder="Optional" theme={theme} />
          <Divider theme={theme} />
          <View style={styles.row}>
            <FormField label="Serving" value={serving} onChange={setServing} placeholder="1" keyboard="decimal-pad" theme={theme} flex={1} />
            <View style={{ width: spacing.sm }} />
            <FormField label="Unit" value={servingUnit} onChange={setServingUnit} placeholder="g / ml..." theme={theme} flex={2} />
          </View>
        </FormCard>

        {/* Meal type */}
        <SectionLabel text="Meal" theme={theme} />
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: spacing.md }}>
          <View style={{ flexDirection: 'row', gap: spacing.sm, paddingHorizontal: spacing.lg }}>
            {(Object.keys(MEAL_LABELS) as MealType[]).map((mt) => (
              <TouchableOpacity
                key={mt}
                style={[styles.mealChip, {
                  backgroundColor: mealType === mt ? theme.primary : theme.cardBackground,
                  borderColor: theme.primary, borderWidth: 1,
                }]}
                onPress={() => setMealType(mt)}
              >
                <Text style={{ color: mealType === mt ? '#fff' : theme.primary, fontSize: fontSize.sm, fontWeight: '600' }}>
                  {MEAL_LABELS[mt]}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </ScrollView>

        <SectionLabel text="Calories" theme={theme} />
        <FormCard theme={theme}>
          <View style={styles.row}>
            <FormField label="Calories *" value={calories} onChange={setCalories} keyboard="decimal-pad" placeholder="0" theme={theme} flex={1} />
            {(protein || carbs || fat) ? (
              <TouchableOpacity
                style={[styles.calcBtn, { backgroundColor: theme.primary }]}
                onPress={() => setCalories(String(Math.round(calcCalories())))}
              >
                <Text style={{ color: '#fff', fontSize: fontSize.xs, fontWeight: '600' }}>Calc</Text>
              </TouchableOpacity>
            ) : null}
          </View>
        </FormCard>

        <SectionLabel text="Macronutrients" theme={theme} />
        <FormCard theme={theme}>
          <MacroField label="Protein" value={protein} onChange={setProtein} unit="g" color={palette.blue}   theme={theme} />
          <Divider theme={theme} />
          <MacroField label="Carbs"   value={carbs}   onChange={setCarbs}   unit="g" color={palette.orange} theme={theme} />
          <Divider theme={theme} />
          <MacroField label="Fat"     value={fat}     onChange={setFat}     unit="g" color={palette.yellow} theme={theme} />
          <Divider theme={theme} />
          <MacroField label="Fiber"   value={fiber}   onChange={setFiber}   unit="g" color={palette.green}  theme={theme} />
          <Divider theme={theme} />
          <MacroField label="Sodium"  value={sodium}  onChange={setSodium}  unit="mg"color={palette.red}    theme={theme} />
        </FormCard>
      </ScrollView>

      {/* Save button */}
      <View style={[styles.footer, { backgroundColor: bg, borderTopColor: theme.border }]}>
        <TouchableOpacity
          style={[styles.saveBtn, { backgroundColor: isValid ? theme.primary : theme.border }]}
          onPress={save}
          disabled={!isValid}
          activeOpacity={0.8}
        >
          <Text style={[styles.saveBtnText, { color: isValid ? '#fff' : theme.textTertiary }]}>Add to Log</Text>
        </TouchableOpacity>
      </View>

      {/* Preset modal */}
      <Modal visible={showPresets} animationType="slide" presentationStyle="pageSheet">
        <View style={[styles.modalContainer, { backgroundColor: bg }]}>
          <View style={[styles.modalHeader, { borderBottomColor: theme.border }]}>
            <Text style={[styles.modalTitle, { color: theme.text }]}>Food Library</Text>
            <TouchableOpacity onPress={() => setShowPresets(false)}>
              <Ionicons name="close-circle" size={28} color={theme.textSecondary} />
            </TouchableOpacity>
          </View>
          <TextInput
            style={[styles.searchInput, { backgroundColor: theme.inputBackground, color: theme.text, borderColor: theme.border }]}
            placeholder="Search foods..."
            placeholderTextColor={theme.textTertiary}
            value={presetSearch}
            onChangeText={setPresetSearch}
          />
          <FlatList
            data={filteredPresets}
            keyExtractor={(item) => item.name}
            renderItem={({ item }) => (
              <TouchableOpacity
                style={[styles.presetRow, { borderBottomColor: theme.border }]}
                onPress={() => applyPreset(item)}
              >
                <View style={{ flex: 1 }}>
                  <Text style={[styles.presetName, { color: theme.text }]}>{item.name}</Text>
                  <Text style={[styles.presetInfo, { color: theme.textSecondary }]}>
                    {Math.round(item.calories)} kcal · {item.protein}g protein · per {item.servingSize}{item.servingUnit}
                  </Text>
                </View>
                <Ionicons name="chevron-forward" size={16} color={theme.textTertiary} />
              </TouchableOpacity>
            )}
          />
        </View>
      </Modal>
    </View>
  );
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function SectionLabel({ text, theme }: { text: string; theme: any }) {
  return (
    <Text style={[styles.sectionLabel, { color: theme.textSecondary }]}>{text.toUpperCase()}</Text>
  );
}

function FormCard({ children, theme }: { children: React.ReactNode; theme: any }) {
  return (
    <View style={[styles.formCard, { backgroundColor: theme.cardBackground }]}>{children}</View>
  );
}

function FormField({ label, value, onChange, placeholder = '', keyboard = 'default', theme, flex }: any) {
  return (
    <View style={[styles.fieldRow, flex ? { flex } : {}]}>
      <Text style={[styles.fieldLabel, { color: theme.textSecondary }]}>{label}</Text>
      <TextInput
        style={[styles.fieldInput, { color: theme.text }]}
        value={value}
        onChangeText={onChange}
        placeholder={placeholder}
        placeholderTextColor={theme.textTertiary}
        keyboardType={keyboard}
      />
    </View>
  );
}

function MacroField({ label, value, onChange, unit, color, theme }: any) {
  return (
    <View style={styles.macroRow}>
      <View style={[styles.colorDot, { backgroundColor: color }]} />
      <Text style={[styles.macroLabel, { color: theme.text }]}>{label}</Text>
      <View style={{ flex: 1 }} />
      <TextInput
        style={[styles.macroInput, { color: theme.text, borderColor: theme.border }]}
        value={value}
        onChangeText={onChange}
        keyboardType="decimal-pad"
        placeholder="0"
        placeholderTextColor={theme.textTertiary}
        textAlign="right"
      />
      <Text style={[styles.unitLabel, { color: theme.textSecondary }]}>{unit}</Text>
    </View>
  );
}

function Divider({ theme }: { theme: any }) {
  return <View style={[styles.divider, { backgroundColor: theme.border }]} />;
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  content:   { padding: spacing.lg, paddingBottom: 80 },
  presetBtn: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm, padding: spacing.md, borderRadius: radius.md, borderWidth: 1, marginBottom: spacing.md },
  presetBtnText: { fontSize: fontSize.sm, fontWeight: fontWeight.semibold },
  sectionLabel: { fontSize: fontSize.xs, fontWeight: fontWeight.semibold, marginBottom: 6, marginTop: spacing.sm, marginLeft: spacing.xs },
  formCard:  { borderRadius: radius.md, overflow: 'hidden', marginBottom: spacing.sm },
  fieldRow:  { paddingHorizontal: spacing.md, paddingVertical: 12 },
  fieldLabel:{ fontSize: fontSize.xs, marginBottom: 4 },
  fieldInput:{ fontSize: fontSize.md },
  divider:   { height: StyleSheet.hairlineWidth, marginHorizontal: spacing.md },
  row:       { flexDirection: 'row', alignItems: 'center' },
  calcBtn:   { paddingHorizontal: spacing.sm, paddingVertical: 6, borderRadius: radius.sm, marginRight: spacing.md },
  mealChip:  { paddingHorizontal: spacing.md, paddingVertical: 8, borderRadius: radius.full },
  macroRow:  { flexDirection: 'row', alignItems: 'center', paddingHorizontal: spacing.md, paddingVertical: 10 },
  colorDot:  { width: 10, height: 10, borderRadius: 5, marginRight: spacing.sm },
  macroLabel:{ fontSize: fontSize.sm },
  macroInput:{ width: 70, fontSize: fontSize.md, borderWidth: 1, borderRadius: radius.sm, paddingHorizontal: 8, paddingVertical: 4 },
  unitLabel: { fontSize: fontSize.sm, marginLeft: spacing.xs, width: 30 },
  footer:    { position: 'absolute', bottom: 0, left: 0, right: 0, padding: spacing.lg, borderTopWidth: 1 },
  saveBtn:   { padding: spacing.md, borderRadius: radius.lg, alignItems: 'center' },
  saveBtnText: { fontSize: fontSize.md, fontWeight: fontWeight.bold },
  modalContainer: { flex: 1 },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: spacing.lg, borderBottomWidth: 1 },
  modalTitle: { fontSize: fontSize.xl, fontWeight: fontWeight.bold },
  searchInput: { margin: spacing.lg, padding: spacing.md, borderRadius: radius.md, borderWidth: 1, fontSize: fontSize.md },
  presetRow: { flexDirection: 'row', alignItems: 'center', padding: spacing.lg, borderBottomWidth: StyleSheet.hairlineWidth },
  presetName:{ fontSize: fontSize.md, fontWeight: fontWeight.medium },
  presetInfo:{ fontSize: fontSize.xs, marginTop: 2 },
});
