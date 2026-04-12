import React from 'react';
import { View } from 'react-native';
import Svg, { Circle } from 'react-native-svg';

interface ProgressRingProps {
  size: number;
  progress: number;       // 0.0 – 1.0
  color: string;
  backgroundColor?: string;
  strokeWidth?: number;
  children?: React.ReactNode;
}

export default function ProgressRing({
  size,
  progress,
  color,
  backgroundColor = '#E5E7EB',
  strokeWidth = 8,
  children,
}: ProgressRingProps) {
  const clamped   = Math.max(0, Math.min(1, progress));
  const radius    = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const dashOffset = circumference * (1 - clamped);
  const center    = size / 2;

  return (
    <View style={{ width: size, height: size, alignItems: 'center', justifyContent: 'center' }}>
      <Svg width={size} height={size} style={{ position: 'absolute' }}>
        {/* Track */}
        <Circle
          cx={center}
          cy={center}
          r={radius}
          stroke={backgroundColor}
          strokeWidth={strokeWidth}
          fill="none"
        />
        {/* Progress */}
        <Circle
          cx={center}
          cy={center}
          r={radius}
          stroke={color}
          strokeWidth={strokeWidth}
          strokeDasharray={`${circumference} ${circumference}`}
          strokeDashoffset={dashOffset}
          strokeLinecap="round"
          transform={`rotate(-90, ${center}, ${center})`}
          fill="none"
        />
      </Svg>
      {children}
    </View>
  );
}
