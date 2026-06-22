import { useEffect, useRef, useState } from 'react';
import { View, Text, StyleSheet, Pressable, Animated, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { ArrowLeft, ImageIcon, Zap, Check, Plus, ArrowRight } from 'lucide-react-native';
import { C, F, R } from '@/theme/tokens';
import { Chip } from '@/components/Chip';
import { Button } from '@/components/Button';

const DETECTED = ['Tomatoes', 'Onions', 'Plantain', 'Eggs', 'Pepper'];
const EXTRA = ['Rice', 'Chicken', 'Yam', 'Garlic', 'Spinach'];

export default function Camera() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const [phase, setPhase] = useState<'camera' | 'detecting' | 'review'>('camera');
  const [selected, setSelected] = useState<string[]>([]);
  const scan = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(scan, { toValue: 1, duration: 2200, useNativeDriver: true }),
        Animated.timing(scan, { toValue: 0, duration: 2200, useNativeDriver: true }),
      ]),
    );
    loop.start();
    return () => loop.stop();
  }, [scan]);

  const capture = () => {
    setPhase('detecting');
    setTimeout(() => {
      setSelected(DETECTED);
      setPhase('review');
    }, 1600);
  };

  const toggle = (item: string) =>
    setSelected((s) => (s.includes(item) ? s.filter((x) => x !== item) : [...s, item]));

  const allChips = Array.from(new Set([...DETECTED, ...EXTRA]));
  const translateY = scan.interpolate({ inputRange: [0, 1], outputRange: [0, 280] });

  return (
    <View style={styles.root}>
      <LinearGradient colors={['#2C2620', '#15110C']} style={StyleSheet.absoluteFill} />

      <Pressable style={[styles.back, { top: insets.top + 8 }]} onPress={() => router.back()}>
        <ArrowLeft size={22} color="#F4ECDE" />
      </Pressable>

      <View style={[styles.viewport, { marginTop: insets.top + 60 }]}>
        <LinearGradient colors={['rgba(110,154,74,0.16)', 'rgba(213,80,43,0.16)']} style={StyleSheet.absoluteFill} />
        <View style={styles.reticle} />
        <View style={[styles.corner, styles.tl]} />
        <View style={[styles.corner, styles.tr]} />
        <View style={[styles.corner, styles.bl]} />
        <View style={[styles.corner, styles.br]} />
        {phase === 'camera' && <Animated.View style={[styles.scanline, { transform: [{ translateY }] }]} />}
        {phase === 'detecting' && (
          <View style={styles.detecting}>
            <ActivityIndicator color={C.saffron} size="large" />
            <Text style={styles.detectingText}>Reading your ingredients…</Text>
          </View>
        )}
      </View>

      {phase !== 'review' && <Text style={styles.hint}>Point at your ingredients and tap to scan</Text>}

      {phase === 'camera' && (
        <View style={[styles.controls, { bottom: insets.bottom + 30 }]}>
          <Pressable style={styles.side}><ImageIcon size={22} color="#F4ECDE" /></Pressable>
          <Pressable style={styles.shutter} onPress={capture}><View style={styles.shutterInner} /></Pressable>
          <Pressable style={styles.side}><Zap size={22} color="#F4ECDE" /></Pressable>
        </View>
      )}

      {phase === 'review' && (
        <View style={[styles.sheet, { paddingBottom: insets.bottom + 24 }]}>
          <View style={styles.grip} />
          <Text style={styles.sheetTitle}>We found these</Text>
          <Text style={styles.sheetSub}>Tap to add or remove, then generate ideas</Text>
          <View style={styles.sheetChips}>
            {allChips.map((item) => {
              const on = selected.includes(item);
              return <Chip key={item} label={item} selected={on} Icon={on ? Check : Plus} onPress={() => toggle(item)} />;
            })}
          </View>
          <Button
            label={`Generate meal ideas (${selected.length})`}
            IconRight={ArrowRight}
            large
            disabled={selected.length === 0}
            onPress={() => router.replace({ pathname: '/suggestions', params: { n: String(selected.length) } })}
          />
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: C.char },
  back: { position: 'absolute', left: 20, zIndex: 10, width: 42, height: 42, borderRadius: 21, backgroundColor: 'rgba(255,255,255,0.1)', alignItems: 'center', justifyContent: 'center' },
  viewport: { flex: 1, marginHorizontal: 22, marginBottom: 150, borderRadius: 24, overflow: 'hidden', borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)', alignItems: 'center', justifyContent: 'center' },
  reticle: { width: '76%', height: '60%', borderWidth: 2, borderColor: 'rgba(255,255,255,0.3)', borderStyle: 'dashed', borderRadius: 18 },
  corner: { position: 'absolute', width: 28, height: 28, borderColor: C.saffron },
  tl: { top: '18%', left: '14%', borderLeftWidth: 3, borderTopWidth: 3, borderTopLeftRadius: 8 },
  tr: { top: '18%', right: '14%', borderRightWidth: 3, borderTopWidth: 3, borderTopRightRadius: 8 },
  bl: { bottom: '18%', left: '14%', borderLeftWidth: 3, borderBottomWidth: 3, borderBottomLeftRadius: 8 },
  br: { bottom: '18%', right: '14%', borderRightWidth: 3, borderBottomWidth: 3, borderBottomRightRadius: 8 },
  scanline: { position: 'absolute', top: '20%', left: '16%', right: '16%', height: 2, backgroundColor: C.saffron },
  detecting: { position: 'absolute', alignItems: 'center', gap: 14, backgroundColor: 'rgba(21,17,12,0.55)', paddingVertical: 26, paddingHorizontal: 34, borderRadius: R.md },
  detectingText: { fontFamily: F.sansMed, fontSize: 14, color: '#F4ECDE' },
  hint: { position: 'absolute', bottom: 150, left: 0, right: 0, textAlign: 'center', fontFamily: F.sansMed, fontSize: 13.5, color: 'rgba(244,236,222,0.85)' },
  controls: { position: 'absolute', left: 0, right: 0, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 40 },
  side: { width: 50, height: 50, borderRadius: 25, backgroundColor: 'rgba(255,255,255,0.1)', alignItems: 'center', justifyContent: 'center' },
  shutter: { width: 76, height: 76, borderRadius: 38, borderWidth: 5, borderColor: 'rgba(255,255,255,0.35)', alignItems: 'center', justifyContent: 'center' },
  shutterInner: { width: 58, height: 58, borderRadius: 29, backgroundColor: C.white },
  sheet: { position: 'absolute', bottom: 0, left: 0, right: 0, backgroundColor: C.cream, borderTopLeftRadius: 28, borderTopRightRadius: 28, paddingHorizontal: 22, paddingTop: 12 },
  grip: { width: 42, height: 5, borderRadius: 3, backgroundColor: C.line2, alignSelf: 'center', marginBottom: 16 },
  sheetTitle: { fontFamily: F.serif, fontSize: 23, color: C.ink },
  sheetSub: { fontFamily: F.sans, fontSize: 13.5, color: C.ink2, marginTop: 4 },
  sheetChips: { flexDirection: 'row', flexWrap: 'wrap', gap: 10, marginVertical: 18 },
});
