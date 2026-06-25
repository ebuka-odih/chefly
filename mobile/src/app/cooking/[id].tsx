import { useState } from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { X, ArrowLeft, ArrowRight, Timer, Check } from 'lucide-react-native';
import { C, F, GRAD } from '@/theme/tokens';
import { getRecipe } from '@/data/mock';
import { Button } from '@/components/Button';
import { getRegisteredRecipe } from '@/lib/recipesApi';

export default function CookingMode() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { id } = useLocalSearchParams<{ id: string }>();
  const recipe = getRegisteredRecipe(id) ?? getRecipe(id);
  const steps = recipe.steps;
  const [i, setI] = useState(0);
  const [done, setDone] = useState(false);
  const total = steps.length;
  const last = i === total - 1;

  if (done) {
    return (
      <LinearGradient colors={GRAD.cooking} style={[styles.root, styles.doneRoot, { paddingTop: insets.top, paddingBottom: insets.bottom + 24 }]}>
        <Text style={{ fontSize: 72 }}>🎉</Text>
        <Text style={styles.doneT}>Plated &amp; perfect</Text>
        <Text style={styles.doneS}>You cooked {recipe.name}. Nicely done, chef.</Text>
        <View style={{ width: '100%', gap: 11, marginTop: 30 }}>
          <Button label="Back to home" large onPress={() => router.replace('/(tabs)')} />
          <Button label="Cook again" variant="dark" onPress={() => { setDone(false); setI(0); }} />
        </View>
      </LinearGradient>
    );
  }

  return (
    <LinearGradient colors={GRAD.cooking} style={[styles.root, { paddingTop: insets.top + 14, paddingBottom: insets.bottom + 22 }]}>
      <View style={styles.top}>
        <Pressable style={styles.exit} onPress={() => router.back()}><X size={18} color="#F4ECDE" /></Pressable>
        <View style={styles.prog}>
          {steps.map((_, k) => <View key={k} style={[styles.progBar, k <= i && styles.progOn]} />)}
        </View>
      </View>

      <View style={styles.body}>
        <Text style={styles.step}>Step {i + 1} of {total}</Text>
        <Text style={styles.h}>{steps[i]}</Text>
        <View style={styles.timer}>
          <Timer size={18} color={C.saffron} />
          <Text style={styles.timerV}>0{Math.max(2, total - i)}:00</Text>
          <Text style={styles.timerL}>suggested</Text>
        </View>
      </View>

      <View style={styles.nav}>
        <Pressable style={[styles.prev, i === 0 && { opacity: 0.35 }]} disabled={i === 0} onPress={() => setI(i - 1)}>
          <ArrowLeft size={20} color="#F4ECDE" />
        </Pressable>
        <Button
          label={last ? 'Finish' : 'Next step'}
          IconRight={last ? Check : ArrowRight}
          onPress={() => (last ? setDone(true) : setI(i + 1))}
          style={{ flex: 1 }}
        />
      </View>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, paddingHorizontal: 26 },
  top: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  exit: { width: 38, height: 38, borderRadius: 19, backgroundColor: 'rgba(255,255,255,0.08)', alignItems: 'center', justifyContent: 'center' },
  prog: { flexDirection: 'row', gap: 6 },
  progBar: { width: 22, height: 5, borderRadius: 3, backgroundColor: 'rgba(255,255,255,0.16)' },
  progOn: { backgroundColor: C.saffron },
  body: { marginTop: 44 },
  step: { fontFamily: F.sansBold, fontSize: 13, letterSpacing: 1.4, textTransform: 'uppercase', color: C.saffron },
  h: { fontFamily: F.serif, fontSize: 32, color: '#FBF6EC', marginTop: 16, lineHeight: 38 },
  timer: { flexDirection: 'row', alignItems: 'center', gap: 10, alignSelf: 'flex-start', marginTop: 28, backgroundColor: 'rgba(255,255,255,0.07)', borderWidth: 1, borderColor: 'rgba(255,255,255,0.12)', borderRadius: 999, paddingVertical: 11, paddingHorizontal: 18 },
  timerV: { fontFamily: F.serif, fontSize: 19, color: '#FBF6EC' },
  timerL: { fontFamily: F.sans, fontSize: 12, color: 'rgba(244,236,222,0.6)' },
  nav: { marginTop: 'auto', flexDirection: 'row', gap: 12, alignItems: 'center' },
  prev: { width: 56, height: 56, borderRadius: 28, backgroundColor: 'rgba(255,255,255,0.08)', alignItems: 'center', justifyContent: 'center' },
  doneRoot: { alignItems: 'center', justifyContent: 'center' },
  doneT: { fontFamily: F.serifBold, fontSize: 34, color: '#FBF6EC', marginTop: 18 },
  doneS: { fontFamily: F.sans, fontSize: 15, color: 'rgba(244,236,222,0.78)', marginTop: 10, textAlign: 'center' },
});
