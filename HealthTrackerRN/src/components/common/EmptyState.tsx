import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, useColorScheme } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { getTheme, fontSize, spacing, radius, palette } from '../../theme';

interface EmptyStateProps {
  icon: string;
  title: string;
  message: string;
  actionLabel?: string;
  onAction?: () => void;
}

export default function EmptyState({ icon, title, message, actionLabel, onAction }: EmptyStateProps) {
  const theme = getTheme(useColorScheme());
  return (
    <View style={styles.container}>
      <View style={[styles.iconWrap, { backgroundColor: theme.border }]}>
        <Ionicons name={icon as any} size={40} color={theme.textTertiary} />
      </View>
      <Text style={[styles.title, { color: theme.text }]}>{title}</Text>
      <Text style={[styles.message, { color: theme.textSecondary }]}>{message}</Text>
      {actionLabel && onAction && (
        <TouchableOpacity
          style={[styles.button, { backgroundColor: theme.primary }]}
          onPress={onAction}
          activeOpacity={0.8}
        >
          <Text style={styles.buttonText}>{actionLabel}</Text>
        </TouchableOpacity>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container:  { alignItems: 'center', paddingVertical: spacing.xxl, paddingHorizontal: spacing.xl },
  iconWrap:   { width: 80, height: 80, borderRadius: 40, alignItems: 'center', justifyContent: 'center', marginBottom: spacing.lg },
  title:      { fontSize: fontSize.lg, fontWeight: '600', marginBottom: spacing.sm, textAlign: 'center' },
  message:    { fontSize: fontSize.md, textAlign: 'center', lineHeight: 22, marginBottom: spacing.xl },
  button:     { paddingHorizontal: spacing.xl, paddingVertical: spacing.md, borderRadius: radius.full },
  buttonText: { color: '#fff', fontWeight: '600', fontSize: fontSize.md },
});
