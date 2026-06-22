import React from 'react';
import { Pressable, Text, StyleSheet, GestureResponderEvent, ViewStyle, StyleProp } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { C, F, R, GRAD, SHADOW } from '@/theme/tokens';

type Variant = 'primary' | 'outline' | 'ghost' | 'sage' | 'dark';
type IconCmp = React.ComponentType<{ size?: number; color?: string }>;

type Props = {
  label: string;
  onPress?: (e: GestureResponderEvent) => void;
  variant?: Variant;
  Icon?: IconCmp;
  IconRight?: IconCmp;
  disabled?: boolean;
  large?: boolean;
  style?: StyleProp<ViewStyle>;
};

const TEXT: Record<Variant, string> = { primary: C.white, outline: C.terracotta, ghost: C.ink, sage: C.white, dark: '#F4ECDE' };
const BG: Record<Variant, string> = { primary: 'transparent', outline: 'transparent', ghost: C.cream2, sage: C.sage, dark: C.char };

export function Button({ label, onPress, variant = 'primary', Icon, IconRight, disabled, large, style }: Props) {
  const color = TEXT[variant];
  return (
    <Pressable
      onPress={onPress}
      disabled={disabled}
      style={({ pressed }) => [
        styles.base,
        large && styles.large,
        { backgroundColor: BG[variant] },
        variant === 'outline' && styles.outline,
        variant === 'primary' && SHADOW.cta,
        disabled && { opacity: 0.5 },
        pressed && { transform: [{ scale: 0.98 }] },
        style,
      ]}
    >
      {variant === 'primary' && (
        <LinearGradient colors={GRAD.warm} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={StyleSheet.absoluteFill} />
      )}
      {Icon ? <Icon size={large ? 20 : 18} color={color} /> : null}
      <Text style={[styles.label, large && { fontSize: 16.5 }, { color }]}>{label}</Text>
      {IconRight ? <IconRight size={large ? 20 : 18} color={color} /> : null}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  base: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 9, height: 52, paddingHorizontal: 22, borderRadius: R.pill, overflow: 'hidden' },
  large: { height: 58, paddingHorizontal: 24 },
  outline: { borderWidth: 1.5, borderColor: C.line2 },
  label: { fontFamily: F.sansSemi, fontSize: 15.5 },
});
