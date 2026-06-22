import React, { useEffect, useRef } from 'react';
import { View, Pressable, StyleSheet, Animated, Easing } from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { House, Bookmark, Clock, User, ScanLine } from 'lucide-react-native';
import type { BottomTabBarProps } from '@react-navigation/bottom-tabs';
import { C, R, GRAD, SHADOW } from '@/theme/tokens';

type IconCmp = React.ComponentType<{ size?: number; color?: string; strokeWidth?: number }>;
// Home · Saved | scan | History · Profile
const ICONS: Record<string, IconCmp> = { index: House, saved: Bookmark, history: Clock, profile: User };
const LEFT = ['index', 'saved'];
const RIGHT = ['history', 'profile'];

export function CustomTabBar({ state, navigation }: BottomTabBarProps) {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const activeName = state.routes[state.index]?.name;

  // pulsing ring around the scan FAB (mirrors .scanPulse)
  const pulse = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    Animated.loop(
      Animated.timing(pulse, { toValue: 1, duration: 2600, easing: Easing.out(Easing.cubic), useNativeDriver: true }),
    ).start();
  }, [pulse]);
  const ringStyle = {
    opacity: pulse.interpolate({ inputRange: [0, 0.7, 1], outputRange: [0.55, 0, 0] }),
    transform: [{ scale: pulse.interpolate({ inputRange: [0, 1], outputRange: [0.85, 1.25] }) }],
  };

  const renderTab = (name: string) => {
    const Icon = ICONS[name];
    const active = activeName === name;
    return (
      <Pressable key={name} style={styles.tab} onPress={() => navigation.navigate(name)} accessibilityRole="button">
        <View style={[styles.navPill, active && styles.navPillOn]}>
          <Icon size={25} color={active ? C.green700 : C.ink3} strokeWidth={active ? 2.6 : 2.1} />
        </View>
      </Pressable>
    );
  };

  return (
    <View style={[styles.wrap, { paddingBottom: insets.bottom + 14 }]}>
      <View style={[styles.pill, SHADOW.card]}>
        {LEFT.map(renderTab)}
        <View style={styles.gap} />
        {RIGHT.map(renderTab)}

        {/* Full-width centered slot — keeps the FAB on the true center
            regardless of the pill's horizontal padding. */}
        <View style={styles.fabSlot} pointerEvents="box-none">
          <Pressable
            onPress={() => router.push('/camera')}
            accessibilityLabel="Scan ingredients"
            accessibilityRole="button"
            style={({ pressed }) => [styles.fab, pressed && { transform: [{ scale: 0.92 }] }]}
          >
            <LinearGradient colors={GRAD.cooking} start={{ x: 0.5, y: 0 }} end={{ x: 0.5, y: 1 }} style={styles.fabFill} />
            <Animated.View style={[styles.ring, ringStyle]} />
            <ScanLine size={26} color={C.white} strokeWidth={2.4} />
          </Pressable>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { backgroundColor: C.bg, paddingHorizontal: 20, paddingTop: 8, alignItems: 'center', justifyContent: 'flex-end' },
  pill: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '100%',
    height: 66,
    borderRadius: R.pill,
    backgroundColor: C.surface,
    paddingHorizontal: 10,
    borderWidth: 1,
    borderColor: C.line,
  },
  tab: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  navPill: { width: 56, height: 46, borderRadius: R.pill, alignItems: 'center', justifyContent: 'center' },
  navPillOn: { backgroundColor: C.saffronSoft },
  gap: { width: 66 },
  fabSlot: { position: 'absolute', left: 0, right: 0, top: -22, alignItems: 'center' },
  fab: {
    width: 66,
    height: 66,
    borderRadius: 33,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: C.forestDeep,
    borderWidth: 5,
    borderColor: C.bg,
    ...SHADOW.card,
  },
  fabFill: { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, borderRadius: 33 },
  ring: { position: 'absolute', top: -5, left: -5, width: 76, height: 76, borderRadius: 38, borderWidth: 2, borderColor: C.green },
});
