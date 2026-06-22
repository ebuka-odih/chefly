import { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Animated, Easing } from 'react-native';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { ChefHat } from 'lucide-react-native';
import { C, F } from '@/theme/tokens';

const FLOATERS: { e: string; top: string; left?: string; right?: string; size: number }[] = [
  { e: '🥕', top: '16%', left: '14%', size: 32 },
  { e: '🍅', top: '24%', right: '16%', size: 38 },
  { e: '🥬', top: '66%', left: '12%', size: 42 },
  { e: '🌶️', top: '74%', right: '18%', size: 32 },
  { e: '🧄', top: '44%', left: '8%', size: 30 },
  { e: '🍋', top: '40%', right: '9%', size: 34 },
];

export default function Splash() {
  const router = useRouter();
  const scale = useRef(new Animated.Value(0.6)).current;
  const fade = useRef(new Animated.Value(0)).current;
  const bar = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.spring(scale, { toValue: 1, useNativeDriver: true, friction: 6, tension: 90 }),
      Animated.timing(fade, { toValue: 1, duration: 500, useNativeDriver: true }),
    ]).start();
    Animated.loop(
      Animated.timing(bar, { toValue: 1, duration: 1500, easing: Easing.inOut(Easing.ease), useNativeDriver: true }),
    ).start();
    const t = setTimeout(() => router.replace('/onboarding'), 2000);
    return () => clearTimeout(t);
  }, [fade, router, scale, bar]);

  const barX = bar.interpolate({ inputRange: [0, 1], outputRange: [-60, 150] });

  return (
    <LinearGradient colors={['#6D9233', '#4A6B1F', C.forest, C.forestDeep]} locations={[0, 0.4, 0.74, 1]} style={styles.root}>
      <View pointerEvents="none" style={StyleSheet.absoluteFill}>
        {FLOATERS.map((f, k) => (
          <Text key={k} style={[styles.floater, { top: f.top as any, left: f.left as any, right: f.right as any, fontSize: f.size }]}>
            {f.e}
          </Text>
        ))}
      </View>

      <Animated.View style={{ opacity: fade, alignItems: 'center' }}>
        <Animated.View style={[styles.logo, { transform: [{ scale }] }]}>
          <ChefHat size={52} color={C.white} strokeWidth={2} />
        </Animated.View>
        <Text style={styles.word}>Chefly</Text>
        <Text style={styles.tag}>Cook with what you have</Text>
      </Animated.View>

      <View style={styles.loader}>
        <Animated.View style={[styles.bar, { transform: [{ translateX: barX }] }]} />
      </View>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  floater: { position: 'absolute', opacity: 0.18 },
  logo: {
    width: 104,
    height: 104,
    borderRadius: 32,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255,255,255,0.16)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.35)',
    shadowColor: '#000',
    shadowOpacity: 0.3,
    shadowRadius: 30,
    shadowOffset: { width: 0, height: 18 },
  },
  word: { fontFamily: F.heavy, fontSize: 42, color: C.white, marginTop: 26, letterSpacing: -1 },
  tag: { fontFamily: F.sansMed, fontSize: 15, color: 'rgba(255,255,255,0.78)', marginTop: 6 },
  loader: { position: 'absolute', bottom: 72, width: 132, height: 4, borderRadius: 4, backgroundColor: 'rgba(255,255,255,0.18)', overflow: 'hidden' },
  bar: { width: 42, height: '100%', borderRadius: 4, backgroundColor: '#AED581' },
});
