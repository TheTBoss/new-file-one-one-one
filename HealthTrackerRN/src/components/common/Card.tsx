import React from 'react';
import { View, StyleSheet, ViewStyle, useColorScheme } from 'react-native';
import { getTheme, spacing, radius } from '../../theme';

interface CardProps {
  children: React.ReactNode;
  style?: ViewStyle;
  padding?: number;
}

export default function Card({ children, style, padding = spacing.lg }: CardProps) {
  const theme = getTheme(useColorScheme());
  return (
    <View style={[styles.card, { backgroundColor: theme.cardBackground, padding }, style]}>
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: radius.lg,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 4,
    elevation: 2,
  },
});
