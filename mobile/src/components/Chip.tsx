import React from 'react';
import { Pressable, Text, StyleSheet } from 'react-native';
import { C, F, R } from '@/theme/tokens';

type IconCmp = React.ComponentType<{ size?: number; color?: string }>;

export function Chip({ label, selected, onPress, Icon }: { label: string; selected?: boolean; onPress?: () => void; Icon?: IconCmp }) {
  const color = selected ? C.white : C.ink;
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [styles.chip, selected && styles.on, pressed && { opacity: 0.85 }]}
    >
      <Text style={[styles.label, { color }]}>{label}</Text>
      {Icon ? <Icon size={15} color={color} /> : null}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  chip: { flexDirection: 'row', alignItems: 'center', gap: 6, backgroundColor: C.cream, borderWidth: 1, borderColor: C.line2, borderRadius: R.pill, paddingVertical: 9, paddingHorizontal: 15 },
  on: { backgroundColor: C.terracotta, borderColor: C.terracotta },
  label: { fontFamily: F.sansMed, fontSize: 14 },
});
