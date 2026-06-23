import { useEffect, useRef, useState } from 'react';
import { View, Text, StyleSheet, Pressable, Animated, Easing } from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Image, type ImageContentPosition } from 'expo-image';
import { ArrowRight } from 'lucide-react-native';
import { C, F, R, SHADOW } from '@/theme/tokens';
import { Button } from '@/components/Button';

type Slide = {
  img: number;
  bg: string; // matches the photo's backdrop so the frame blends
  focus: ImageContentPosition; // keep the hero food in view above the panel
  title: string;
  description: string;
};

const SLIDES: Slide[] = [
  {
    img: require('../../assets/1-onboarding-fit.png'),
    bg: '#E8EFDA',
    focus: { top: '40%', left: '50%' },
    title: 'Cook with what\nyou already have',
    description: 'Snap the veg in your fridge and Chefly names every ingredient in seconds.',
  },
  {
    img: require('../../assets/2-onboarding-fit.png'),
    bg: '#ECE6DA',
    focus: { top: '40%', left: '50%' },
    title: 'Instant ideas,\njust for you',
    description: 'Smart recipes matched to your ingredients, your taste and the time you’ve got.',
  },
  {
    img: require('../../assets/3-onboarding-fit.png'),
    bg: '#EDE7DB',
    focus: { top: '35%', left: '50%' },
    title: 'Put a real meal\non the table',
    description: 'Follow calm, clear steps and plate up something proper — no guesswork.',
  },
];

export default function Onboarding() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const [i, setI] = useState(0);
  const slide = SLIDES[i];
  const last = i === SLIDES.length - 1;

  // text reveal each time the slide changes
  const anim = useRef(new Animated.Value(1)).current;
  useEffect(() => {
    anim.setValue(0);
    Animated.timing(anim, { toValue: 1, duration: 440, easing: Easing.out(Easing.cubic), useNativeDriver: true }).start();
  }, [i, anim]);
  const textTranslate = anim.interpolate({ inputRange: [0, 1], outputRange: [14, 0] });

  const finish = () => router.replace('/auth');
  const next = () => (last ? finish() : setI(i + 1));

  return (
    <View style={styles.root}>
      <View style={[styles.imageWrap, { backgroundColor: slide.bg }]}>
        <Image
          source={slide.img}
          contentFit="cover"
          contentPosition={slide.focus}
          transition={300}
          style={StyleSheet.absoluteFill}
        />
        <Pressable onPress={finish} hitSlop={8} style={[styles.skip, { top: insets.top + 10 }]}>
          <Text style={styles.skipText}>Skip</Text>
        </Pressable>
      </View>

      <View style={[styles.panel, { paddingBottom: insets.bottom + 26 }]}>
        <View style={styles.dots}>
          {SLIDES.map((_, k) => (
            <Pressable key={k} onPress={() => setI(k)} hitSlop={8}>
              <View style={[styles.dot, k === i && styles.dotOn]} />
            </Pressable>
          ))}
        </View>

        <Animated.View style={{ opacity: anim, transform: [{ translateY: textTranslate }], alignItems: 'center' }}>
          <Text style={styles.title}>{slide.title}</Text>
          <Text style={styles.desc}>{slide.description}</Text>
        </Animated.View>

        <View style={styles.cta}>
          <Button label={last ? 'Get Started' : 'Next'} IconRight={ArrowRight} onPress={next} large />
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: C.bg },
  imageWrap: { flex: 1, overflow: 'hidden' },
  skip: {
    position: 'absolute',
    right: 18,
    backgroundColor: 'rgba(255,255,255,0.8)',
    borderRadius: R.pill,
    paddingVertical: 7,
    paddingHorizontal: 15,
    ...SHADOW.sm,
  },
  skipText: { fontFamily: F.sansSemi, fontSize: 14, color: C.ink },
  // text panel below the photo, rounded top lifting over it
  panel: {
    backgroundColor: C.bg,
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
    paddingHorizontal: 28,
    paddingTop: 22,
    alignItems: 'center',
    shadowColor: '#1F3110',
    shadowOpacity: 0.16,
    shadowRadius: 20,
    shadowOffset: { width: 0, height: -8 },
    elevation: 20,
  },
  dots: { flexDirection: 'row', gap: 8, marginBottom: 20 },
  dot: { width: 8, height: 8, borderRadius: 5, backgroundColor: '#C5E1A5' },
  dotOn: { width: 26, backgroundColor: C.green600 },
  title: { fontFamily: F.heavy, fontSize: 27, color: C.ink, textAlign: 'center', letterSpacing: -0.6, lineHeight: 32 },
  desc: { fontFamily: F.sans, fontSize: 15.5, color: C.ink2, textAlign: 'center', marginTop: 12, lineHeight: 23, maxWidth: 330 },
  cta: { width: '100%', marginTop: 24 },
});
