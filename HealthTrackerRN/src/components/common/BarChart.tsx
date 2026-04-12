import React from 'react';
import { View, Text, StyleSheet, useColorScheme } from 'react-native';
import { getTheme, fontSize } from '../../theme';

export interface BarChartData {
  label: string;
  value: number;
  highlight?: boolean;
}

interface BarChartProps {
  data: BarChartData[];
  height?: number;
  color?: string;
  highlightColor?: string;
  goalValue?: number;
  goalColor?: string;
  showValues?: boolean;
}

export default function BarChart({
  data,
  height = 130,
  color,
  highlightColor,
  goalValue,
  goalColor = '#EF4444',
  showValues = false,
}: BarChartProps) {
  const theme = getTheme(useColorScheme());
  const barColor = color ?? theme.primary;
  const hlColor  = highlightColor ?? '#F97316';

  const maxVal = Math.max(...data.map((d) => d.value), goalValue ?? 0, 1);
  const chartHeight = height - 24; // reserve label space

  return (
    <View style={{ height }}>
      <View style={[styles.chart, { height: chartHeight }]}>
        {/* Goal line */}
        {goalValue !== undefined && goalValue > 0 && (
          <View
            style={[
              styles.goalLine,
              {
                bottom: (goalValue / maxVal) * chartHeight,
                borderColor: goalColor,
              },
            ]}
          />
        )}

        {/* Bars */}
        {data.map((item, i) => {
          const barH = Math.max((item.value / maxVal) * chartHeight, item.value > 0 ? 2 : 0);
          const isHL = item.highlight ?? false;
          return (
            <View key={i} style={styles.barWrap}>
              {showValues && item.value > 0 && (
                <Text style={[styles.valueLabel, { color: theme.textSecondary }]}>
                  {item.value > 999 ? `${(item.value / 1000).toFixed(1)}k` : String(Math.round(item.value))}
                </Text>
              )}
              <View style={styles.barOuter}>
                <View
                  style={[
                    styles.bar,
                    { height: barH, backgroundColor: isHL ? hlColor : barColor },
                  ]}
                />
              </View>
            </View>
          );
        })}
      </View>

      {/* Labels */}
      <View style={styles.labels}>
        {data.map((item, i) => (
          <Text
            key={i}
            style={[
              styles.label,
              {
                color: item.highlight ? theme.primary : theme.textTertiary,
                fontWeight: item.highlight ? '600' : '400',
              },
            ]}
          >
            {item.label}
          </Text>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  chart:      { flexDirection: 'row', alignItems: 'flex-end', paddingHorizontal: 2 },
  barWrap:    { flex: 1, alignItems: 'center', justifyContent: 'flex-end' },
  barOuter:   { width: '65%', justifyContent: 'flex-end' },
  bar:        { borderRadius: 4 },
  valueLabel: { fontSize: 9, marginBottom: 2 },
  labels:     { flexDirection: 'row', marginTop: 4 },
  label:      { flex: 1, textAlign: 'center', fontSize: fontSize.xs },
  goalLine:   {
    position: 'absolute', left: 0, right: 0,
    borderTopWidth: 1.5, borderStyle: 'dashed',
  },
});
