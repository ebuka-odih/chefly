import { useEffect, useRef, useState } from 'react';
import { View, Text, StyleSheet, Pressable, Animated, Easing } from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Camera, Sparkles, ChefHat, ArrowRight } from 'lucide-react-native';
import { C, F, R, SHADOW } from '@/theme/tokens';
import { Button } from '@/components/Button';

type IconCmp = React.ComponentType<{ size?: number; color?: string; strokeWidth?: number }>;
type Slide = { Icon: IconCmp; emoji: string; title: string; description: string };

const SLIDES: Slide[] = [
  {
    Icon: Camera,
    emoji: '🥕',
    title: 'Snap your\ningredients',
    description: 'Point your camera at what you have — Chefly spots every ingredient in seconds.',
  },
  {
    Icon: Sparkles,
    emoji: '✨',
    title: 'Get instant\nmeal ideas',
    description: 'Smart recipes tuned to your ingredients, taste and the time you have.',
  },
  {
    Icon: ChefHat,
    emoji: '🍳',
    title: 'Cook with\neasy steps',
    description: 'Follow clear, beginner-friendly steps with a calm, guided cooking mode.',
  },
];

export default function Onboarding() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const [i, setI] = useState(0);
  const slide = SLIDES[i];
  const last = i === SLIDES.length - 1;

  // gentle float on the hero emoji
  const float = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(float, { toValue: -1, duration: 2000, easing: Easing.inOut(Easing.quad), useNativeDriver: true }),
        Animated.timing(float, { toValue: 0, duration: 2000, easing: Easing.inOut(Easing.quad), useNativeDriver: true }),
      ]),
    ).start();
  }, [float]);
  const translateY = float.interpolate({ inputRange: [-1, 0], outputRange: [-8, 0] });

  const finish = () => router.replace('/auth');
  const next = () => (last ? finish() : setI(i + 1));

  return (
    <View style={[styles.root, { paddingTop: insets.top + 18, paddingBottom: insets.bottom + 26 }]}>
      <Pressable onPress={finish} hitSlop={8} style={styles.skip}>
        <Text style={styles.skipText}>Skip</Text>
      </Pressable>

      <View style={styles.stage}>
        <View style={styles.hero}>
          <LinearGradient
            colors={['#C5E1A5', '#9CCC65', '#7CB342']}
            start={{ x: 0.3, y: 0.18 }}
            end={{ x: 0.85, y: 1 }}
            style={styles.blob}
          />
          <Animated.Text style={[styles.emoji, { transform: [{ translateY }] }]}>{slide.emoji}</Animated.Text>
          <View style={styles.badge}>
            <slide.Icon size={26} color={C.white} strokeWidth={2.2} />
          </View>
        </View>

        <View style={styles.text}>
          <Text style={styles.title}>{slide.title}</Text>
          <Text style={styles.desc}>{slide.description}</Text>
        </View>
      </View>

      <View style={styles.footer}>
        <View style={styles.dots}>
          {SLIDES.map((_, k) => (
            <Pressable key={k} onPress={() => setI(k)} hitSlop={8}>
              <View style={[styles.dot, k === i && styles.dotOn]} />
            </Pressable>
          ))}
        </View>
        <Button label={last ? 'Get Started' : 'Next'} IconRight={ArrowRight} onPress={next} large />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, paddingHorizontal: 24, backgroundColor: C.bg },
  skip: { alignSelf: 'flex-end', paddingVertical: 8, paddingHorizontal: 14 },
  skipText: { fontFamily: F.sansSemi, fontSize: 14, color: C.ink2 },
  stage: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  hero: { width: 224, height: 224, alignItems: 'center', justifyContent: 'center', marginBottom: 44 },
  // organic blob — asymmetric radii approximate the morphing CSS blob
  blob: {
    position: 'absolute',
    width: 224,
    height: 224,
    borderTopLeftRadius: 112,
    borderTopRightRadius: 96,
    borderBottomLeftRadius: 96,
    borderBottomRightRadius: 120,
    ...SHADOW.card,
  },
  emoji: { fontSize: 86 },
  badge: {
    position: 'absolute',
    right: 26,
    bottom: 22,
    width: 54,
    height: 54,
    borderRadius: R.sm,
    backgroundColor: C.ink,
    alignItems: 'center',
    justifyContent: 'center',
    ...SHADOW.card,
  },
  text: { alignItems: 'center', maxWidth: 330 },
  title: { fontFamily: F.heavy, fontSize: 31, color: C.ink, textAlign: 'center', letterSpacing: -0.6, lineHeight: 35 },
  desc: { fontFamily: F.sans, fontSize: 16, color: C.ink2, textAlign: 'center', marginTop: 14, lineHeight: 24 },
  footer: { alignItems: 'center', gap: 24 },
  dots: { flexDirection: 'row', gap: 8 },
  dot: { width: 8, height: 8, borderRadius: 5, backgroundColor: '#C5E1A5' },
  dotOn: { width: 26, backgroundColor: C.green600 },
});
