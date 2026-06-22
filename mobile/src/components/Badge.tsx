import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { C, F, R } from '@/theme/tokens';
import { Clock, Flame } from 'lucide-react-native';

type Tone = 'time' | 'easy' | 'neutral';
type IconCmp = React.ComponentType<{ size?: number; color?: string }>;

const TONES: Record<Tone, { bg: string; fg: string }> = {
  time: { bg: C.saffronSoft, fg: C.terracottaDeep },
  easy: { bg: C.sageSoft, fg: C.sageDeep },
  neutral: { bg: C.cream2, fg: C.ink2 },
};

export function Badge({ label, tone = 'neutral', Icon }: { label: string; tone?: Tone; Icon?: IconCmp }) {
  const { bg, fg } = TONES[tone];
  return (
    <View style={[styles.badge, { backgroundColor: bg }]}>
      {Icon ? <Icon size={13} color={fg} /> : null}
      <Text style={[styles.label, { color: fg }]}>{label}</Text>
    </View>
  );
}

// Convenience presets used across recipe surfaces
export function TimeBadge({ minutes }: { minutes: number }) {
  return <Badge tone="time" Icon={Clock} label={`${minutes} min`} />;
}
export function DifficultyBadge({ level }: { level: string }) {
  return <Badge tone="easy" Icon={Flame} label={level} />;
}

const styles = StyleSheet.create({
  badge: { flexDirection: 'row', alignItems: 'center', gap: 5, borderRadius: R.pill, paddingVertical: 6, paddingHorizontal: 11 },
  label: { fontFamily: F.sansSemi, fontSize: 12.5 },
});
