import { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Animated } from 'react-native';
import Svg, { Defs, RadialGradient, Stop, Ellipse, Circle } from 'react-native-svg';
import { C, F, SHADOW } from '@/theme/tokens';
import type { Breakdown } from '@/data/mock';

// Radial "bloom" chart — petals radiate from a centered dish emoji.
export function NutritionFlower({ data = [], center = '🥗', size = 280 }: { data?: Breakdown[]; center?: string; size?: number }) {
  const N = Math.max(data.length, 1);
  const VB = 320;
  const mid = 160;
  const petalD = 66;
  const labelR = 132;
  const factor = size / VB;

  const bloom = useRef(new Animated.Value(0)).current;
  const pop = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    Animated.spring(bloom, { toValue: 1, friction: 6, tension: 55, useNativeDriver: true }).start();
    Animated.spring(pop, { toValue: 1, friction: 5, tension: 80, delay: 180, useNativeDriver: true }).start();
  }, [bloom, pop]);
  const bloomScale = bloom.interpolate({ inputRange: [0, 1], outputRange: [0.62, 1] });

  return (
    <View style={{ width: size, height: size }}>
      <Animated.View style={{ width: size, height: size, opacity: bloom, transform: [{ scale: bloomScale }] }}>
        <Svg viewBox="0 0 320 320" width={size} height={size}>
          <Defs>
            <RadialGradient id="bloom" cx="160" cy="160" r="150" gradientUnits="userSpaceOnUse">
              <Stop offset="0%" stopColor="#ffd34e" />
              <Stop offset="26%" stopColor="#ffe49a" />
              <Stop offset="52%" stopColor="#dcedc8" />
              <Stop offset="100%" stopColor="#aed581" />
            </RadialGradient>
          </Defs>
          {data.map((d, i) => {
            const ang = -90 + (360 / N) * i;
            const rad = (ang * Math.PI) / 180;
            const px = mid + petalD * Math.cos(rad);
            const py = mid + petalD * Math.sin(rad);
            return (
              <Ellipse
                key={`p-${i}`}
                cx={px}
                cy={py}
                rx={46}
                ry={68}
                fill="url(#bloom)"
                opacity={0.9}
                rotation={ang + 90}
                originX={px}
                originY={py}
              />
            );
          })}
          <Circle cx={mid} cy={mid} r={40} fill="#fff" />
        </Svg>
      </Animated.View>

      {/* center dish */}
      <Animated.View style={[styles.center, { left: size / 2 - 37, top: size / 2 - 37, opacity: pop, transform: [{ scale: pop }] }]}>
        <Text style={styles.emoji}>{center}</Text>
      </Animated.View>

      {/* labels */}
      {data.map((d, i) => {
        const ang = -90 + (360 / N) * i;
        const rad = (ang * Math.PI) / 180;
        const lx = size / 2 + labelR * factor * Math.cos(rad);
        const ly = size / 2 + labelR * factor * Math.sin(rad);
        return (
          <Animated.View key={`l-${i}`} style={[styles.label, { left: lx - 38, top: ly - 16, opacity: bloom }]}>
            <Text style={styles.pct}>{d.percent}%</Text>
            <Text style={styles.name} numberOfLines={1}>{d.label}</Text>
          </Animated.View>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  center: {
    position: 'absolute',
    width: 74,
    height: 74,
    borderRadius: 37,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
    ...SHADOW.sm,
  },
  emoji: { fontSize: 34, lineHeight: 40 },
  label: { position: 'absolute', width: 76, alignItems: 'center' },
  pct: { fontFamily: F.heavy, fontSize: 16, color: C.ink, letterSpacing: -0.3 },
  name: { fontFamily: F.sansMed, fontSize: 11.5, color: C.ink3 },
});
