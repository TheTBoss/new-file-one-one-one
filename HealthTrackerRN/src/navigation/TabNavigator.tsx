import React from 'react';
import { useColorScheme } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';
import { getTheme } from '../theme';

// Screens
import DashboardScreen   from '../screens/DashboardScreen';
import NutritionScreen   from '../screens/NutritionScreen';
import AddFoodScreen     from '../screens/AddFoodScreen';
import WorkoutScreen     from '../screens/WorkoutScreen';
import ActiveWorkoutScreen from '../screens/ActiveWorkoutScreen';
import HabitsScreen      from '../screens/HabitsScreen';
import AddHabitScreen    from '../screens/AddHabitScreen';
import ProgressScreen    from '../screens/ProgressScreen';
import AddSleepScreen    from '../screens/AddSleepScreen';
import AddMoodScreen     from '../screens/AddMoodScreen';
import AddMeasurementScreen from '../screens/AddMeasurementScreen';
import SettingsScreen    from '../screens/SettingsScreen';

// ─── Param lists ─────────────────────────────────────────────────────────────

export type DashboardStack = {
  Dashboard:  undefined;
  Settings:   undefined;
};

export type NutritionStack = {
  Nutrition:  undefined;
  AddFood:    { mealType?: string; date?: string };
};

export type WorkoutStack = {
  Workout:       undefined;
  ActiveWorkout: { sessionId: string };
};

export type HabitsStack = {
  Habits:    undefined;
  AddHabit:  { habitId?: string };
};

export type ProgressStack = {
  Progress:       undefined;
  AddSleep:       undefined;
  AddMood:        undefined;
  AddMeasurement: undefined;
};

// ─── Stack navigators ─────────────────────────────────────────────────────────

const DashTab  = createNativeStackNavigator<DashboardStack>();
const NutTab   = createNativeStackNavigator<NutritionStack>();
const WorkTab  = createNativeStackNavigator<WorkoutStack>();
const HabTab   = createNativeStackNavigator<HabitsStack>();
const ProgTab  = createNativeStackNavigator<ProgressStack>();
const Tab      = createBottomTabNavigator();

function DashboardNavigator() {
  const theme = getTheme(useColorScheme());
  return (
    <DashTab.Navigator screenOptions={{ headerStyle: { backgroundColor: theme.cardBackground }, headerTintColor: theme.text }}>
      <DashTab.Screen name="Dashboard" component={DashboardScreen} options={{ title: 'Dashboard' }} />
      <DashTab.Screen name="Settings"  component={SettingsScreen}  options={{ title: 'Settings'  }} />
    </DashTab.Navigator>
  );
}

function NutritionNavigator() {
  const theme = getTheme(useColorScheme());
  return (
    <NutTab.Navigator screenOptions={{ headerStyle: { backgroundColor: theme.cardBackground }, headerTintColor: theme.text }}>
      <NutTab.Screen name="Nutrition" component={NutritionScreen} options={{ title: 'Nutrition' }} />
      <NutTab.Screen name="AddFood"   component={AddFoodScreen}   options={{ title: 'Add Food', presentation: 'modal' }} />
    </NutTab.Navigator>
  );
}

function WorkoutNavigator() {
  const theme = getTheme(useColorScheme());
  return (
    <WorkTab.Navigator screenOptions={{ headerStyle: { backgroundColor: theme.cardBackground }, headerTintColor: theme.text }}>
      <WorkTab.Screen name="Workout"       component={WorkoutScreen}       options={{ title: 'Workout'         }} />
      <WorkTab.Screen name="ActiveWorkout" component={ActiveWorkoutScreen} options={{ title: 'Active Workout', headerShown: false }} />
    </WorkTab.Navigator>
  );
}

function HabitsNavigator() {
  const theme = getTheme(useColorScheme());
  return (
    <HabTab.Navigator screenOptions={{ headerStyle: { backgroundColor: theme.cardBackground }, headerTintColor: theme.text }}>
      <HabTab.Screen name="Habits"   component={HabitsScreen}   options={{ title: 'Habits'    }} />
      <HabTab.Screen name="AddHabit" component={AddHabitScreen} options={{ title: 'New Habit', presentation: 'modal' }} />
    </HabTab.Navigator>
  );
}

function ProgressNavigator() {
  const theme = getTheme(useColorScheme());
  return (
    <ProgTab.Navigator screenOptions={{ headerStyle: { backgroundColor: theme.cardBackground }, headerTintColor: theme.text }}>
      <ProgTab.Screen name="Progress"       component={ProgressScreen}       options={{ title: 'Progress'           }} />
      <ProgTab.Screen name="AddSleep"       component={AddSleepScreen}       options={{ title: 'Log Sleep',     presentation: 'modal' }} />
      <ProgTab.Screen name="AddMood"        component={AddMoodScreen}        options={{ title: 'Log Mood',      presentation: 'modal' }} />
      <ProgTab.Screen name="AddMeasurement" component={AddMeasurementScreen} options={{ title: 'Measurements',  presentation: 'modal' }} />
    </ProgTab.Navigator>
  );
}

// ─── Root tab navigator ───────────────────────────────────────────────────────

export default function TabNavigator() {
  const colorScheme = useColorScheme();
  const theme = getTheme(colorScheme);

  return (
    <NavigationContainer>
      <Tab.Navigator
        screenOptions={({ route }) => ({
          headerShown: false,
          tabBarStyle: {
            backgroundColor: theme.tabBar,
            borderTopColor: theme.tabBarBorder,
          },
          tabBarActiveTintColor: theme.primary,
          tabBarInactiveTintColor: theme.textTertiary,
          tabBarIcon: ({ color, size, focused }) => {
            const icons: Record<string, { active: string; inactive: string }> = {
              DashboardTab:  { active: 'home',            inactive: 'home-outline'            },
              NutritionTab:  { active: 'nutrition',       inactive: 'nutrition-outline'       },
              WorkoutTab:    { active: 'barbell',         inactive: 'barbell-outline'         },
              HabitsTab:     { active: 'checkmark-circle',inactive: 'checkmark-circle-outline'},
              ProgressTab:   { active: 'stats-chart',     inactive: 'stats-chart-outline'     },
            };
            const set = icons[route.name] ?? { active: 'help', inactive: 'help-outline' };
            return (
              <Ionicons
                name={(focused ? set.active : set.inactive) as any}
                size={size}
                color={color}
              />
            );
          },
        })}
      >
        <Tab.Screen name="DashboardTab" component={DashboardNavigator} options={{ title: 'Home'      }} />
        <Tab.Screen name="NutritionTab" component={NutritionNavigator} options={{ title: 'Nutrition' }} />
        <Tab.Screen name="WorkoutTab"   component={WorkoutNavigator}   options={{ title: 'Workout'   }} />
        <Tab.Screen name="HabitsTab"    component={HabitsNavigator}    options={{ title: 'Habits'    }} />
        <Tab.Screen name="ProgressTab"  component={ProgressNavigator}  options={{ title: 'Progress'  }} />
      </Tab.Navigator>
    </NavigationContainer>
  );
}
