import React from 'react';
import { View, StyleSheet, useColorScheme } from 'react-native';
import { getTheme } from '../../theme';

interface ProgressBarProps {
  progress: number; // 0–1
  color?: string;
  height?: number;
  backgroundColor?: string;
}

export default function ProgressBar({ progress, color, height = 6, backgroundColor }: ProgressBarProps) {
  const theme = getTheme(useColorScheme());
  const clamped = Math.max(0, Math.min(1, progress));
  const barColor = color ?? theme.primary;
  const trackColor = backgroundColor ?? theme.border;

  return (
    <View style={[styles.track, { height, backgroundColor: trackColor, borderRadius: height / 2 }]}>
      <View
        style={[
          styles.fill,
          {
            width: `${clamped * 100}%`,
            height,
            backgroundColor: barColor,
            borderRadius: height / 2,
          },
        ]}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  track: { width: '100%', overflow: 'hidden' },
  fill:  {},
});
