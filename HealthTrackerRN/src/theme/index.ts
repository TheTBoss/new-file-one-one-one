import { Appearance } from 'react-native';

export const palette = {
  blue:    '#3B82F6',
  indigo:  '#6366F1',
  purple:  '#8B5CF6',
  pink:    '#EC4899',
  red:     '#EF4444',
  orange:  '#F97316',
  yellow:  '#EAB308',
  green:   '#22C55E',
  teal:    '#14B8A6',
  cyan:    '#06B6D4',
  gray:    '#6B7280',
  brown:   '#92400E',
  white:   '#FFFFFF',
  black:   '#000000',
};

export const lightTheme = {
  background:       '#F2F2F7',
  cardBackground:   '#FFFFFF',
  primary:          palette.blue,
  text:             '#1C1C1E',
  textSecondary:    '#6B7280',
  textTertiary:     '#9CA3AF',
  border:           '#E5E7EB',
  separator:        '#F3F4F6',
  destructive:      palette.red,
  success:          palette.green,
  warning:          palette.orange,
  tabBar:           '#FFFFFF',
  tabBarBorder:     '#E5E7EB',
  inputBackground:  '#F9FAFB',
};

export const darkTheme = {
  background:       '#000000',
  cardBackground:   '#1C1C1E',
  primary:          palette.blue,
  text:             '#FFFFFF',
  textSecondary:    '#8E8E93',
  textTertiary:     '#636366',
  border:           '#2C2C2E',
  separator:        '#2C2C2E',
  destructive:      '#FF453A',
  success:          '#30D158',
  warning:          '#FF9F0A',
  tabBar:           '#1C1C1E',
  tabBarBorder:     '#2C2C2E',
  inputBackground:  '#2C2C2E',
};

export type Theme = typeof lightTheme;

export function getTheme(colorScheme: 'light' | 'dark' | null | undefined): Theme {
  return colorScheme === 'dark' ? darkTheme : lightTheme;
}

export const spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  xxl: 32,
};

export const radius = {
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  full: 9999,
};

export const fontSize = {
  xs: 11,
  sm: 13,
  md: 15,
  lg: 17,
  xl: 20,
  xxl: 24,
  xxxl: 32,
  huge: 42,
};

export const fontWeight = {
  regular: '400' as const,
  medium:  '500' as const,
  semibold:'600' as const,
  bold:    '700' as const,
  heavy:   '800' as const,
};

// Named color helper
export function namedColor(name: string): string {
  return (palette as Record<string, string>)[name] ?? palette.blue;
}
