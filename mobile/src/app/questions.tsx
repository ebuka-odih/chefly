import { useState } from 'react';
import { View, Text, StyleSheet, Pressable, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { ArrowLeft, ArrowRight, Check } from 'lucide-react-native';
import { C, F, R, SHADOW } from '@/theme/tokens';
import { Button } from '@/components/Button';

type Option = { id: string; emoji: string; label: string; hint?: string };
type Question = {
  eyebrow: string;
  title: string;
  subtitle: string;
  multi: boolean;
  options: Option[];
};

const QUESTIONS: Question[] = [
  {
    eyebrow: 'About you',
    title: 'How do you cook?',
    subtitle: 'We tune suggestions to your comfort level.',
    multi: false,
    options: [
      { id: 'new', emoji: '🐣', label: 'Just starting out', hint: 'Keep it simple' },
      { id: 'get-by', emoji: '🍳', label: 'I get by', hint: 'A handful of go-tos' },
      { id: 'confident', emoji: '👩‍🍳', label: 'Confident', hint: 'I improvise happily' },
      { id: 'pro', emoji: '🔥', label: 'Pro-level', hint: 'Bring the challenge' },
    ],
  },
  {
    eyebrow: 'Your kitchen',
    title: 'Who are you\ncooking for?',
    subtitle: 'So portions and ideas fit your table.',
    multi: false,
    options: [
      { id: 'me', emoji: '🧑', label: 'Just me' },
      { id: 'two', emoji: '👫', label: 'Two of us' },
      { id: 'family', emoji: '👨‍👩‍👧', label: 'A family (3–4)' },
      { id: 'crowd', emoji: '🎉', label: 'A crowd (5+)' },
    ],
  },
  {
    eyebrow: 'Your plate',
    title: 'Any dietary\npreferences?',
    subtitle: 'Pick any that apply — or none.',
    multi: true,
    options: [
      { id: 'veg', emoji: '🥦', label: 'Vegetarian' },
      { id: 'vegan', emoji: '🌱', label: 'Vegan' },
      { id: 'pesc', emoji: '🐟', label: 'Pescatarian' },
      { id: 'gf', emoji: '🌾', label: 'Gluten-free' },
      { id: 'df', emoji: '🥛', label: 'Dairy-free' },
      { id: 'halal', emoji: '🕌', label: 'Halal' },
      { id: 'keto', emoji: '🥑', label: 'Keto' },
      { id: 'none', emoji: '🍽️', label: 'No restrictions' },
    ],
  },
  {
    eyebrow: 'Your goals',
    title: 'What are you\nhere for?',
    subtitle: 'Choose all that feel right.',
    multi: true,
    options: [
      { id: 'healthy', emoji: '🥗', label: 'Eat healthier' },
      { id: 'waste', emoji: '♻️', label: 'Waste less food' },
      { id: 'money', emoji: '💸', label: 'Save money' },
      { id: 'quick', emoji: '⚡', label: 'Quick weeknight meals' },
      { id: 'learn', emoji: '📖', label: 'Learn to cook' },
      { id: 'impress', emoji: '✨', label: 'Impress guests' },
    ],
  },
];

export default function Questions() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState<Record<number, string[]>>({});

  const q = QUESTIONS[step];
  const selected = answers[step] ?? [];
  const last = step === QUESTIONS.length - 1;
  const canContinue = selected.length > 0;
  const progress = (step + 1) / QUESTIONS.length;

  const toggle = (id: string) => {
    setAnswers((prev) => {
      const cur = prev[step] ?? [];
      if (q.multi) {
        // "No restrictions" is exclusive within the dietary question.
        if (id === 'none') return { ...prev, [step]: cur.includes('none') ? [] : ['none'] };
        const without = cur.filter((x) => x !== 'none');
        const nextSel = without.includes(id) ? without.filter((x) => x !== id) : [...without, id];
        return { ...prev, [step]: nextSel };
      }
      return { ...prev, [step]: [id] };
    });
    // Single-select auto-advances for a snappier feel.
    if (!q.multi && !last) setTimeout(() => setStep((s) => s + 1), 220);
  };

  const onBack = () => (step === 0 ? router.back() : setStep(step - 1));
  const onNext = () => (last ? router.replace('/paywall') : setStep(step + 1));

  return (
    <View style={[styles.root, { paddingTop: insets.top + 8, paddingBottom: insets.bottom + 16 }]}>
      <View style={styles.top}>
        <Pressable onPress={onBack} hitSlop={8} style={styles.backBtn}>
          <ArrowLeft size={20} color={C.ink} />
        </Pressable>
        <View style={styles.track}>
          <View style={[styles.fill, { width: `${progress * 100}%` }]} />
        </View>
        <Text style={styles.count}>
          {step + 1}/{QUESTIONS.length}
        </Text>
      </View>

      <ScrollView style={{ flex: 1 }} showsVerticalScrollIndicator={false} contentContainerStyle={styles.scroll}>
        <Text style={styles.eyebrow}>{q.eyebrow}</Text>
        <Text style={styles.title}>{q.title}</Text>
        <Text style={styles.subtitle}>{q.subtitle}</Text>

        <View style={styles.options}>
          {q.options.map((o) => {
            const on = selected.includes(o.id);
            return (
              <Pressable
                key={o.id}
                onPress={() => toggle(o.id)}
                style={({ pressed }) => [styles.opt, on && styles.optOn, pressed && { transform: [{ scale: 0.99 }] }]}
              >
                <Text style={styles.optEmoji}>{o.emoji}</Text>
                <View style={{ flex: 1 }}>
                  <Text style={[styles.optLabel, on && styles.optLabelOn]}>{o.label}</Text>
                  {o.hint ? <Text style={[styles.optHint, on && styles.optHintOn]}>{o.hint}</Text> : null}
                </View>
                <View style={[styles.check, on && styles.checkOn]}>
                  {on ? <Check size={14} color={C.white} strokeWidth={3} /> : null}
                </View>
              </Pressable>
            );
          })}
        </View>
      </ScrollView>

      <View style={styles.bottom}>
        <Button
          label={last ? 'See your plan' : 'Continue'}
          IconRight={ArrowRight}
          onPress={onNext}
          disabled={!canContinue}
          large
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, paddingHorizontal: 24 },
  top: { flexDirection: 'row', alignItems: 'center', gap: 14, marginBottom: 6 },
  backBtn: { width: 38, height: 38, borderRadius: R.pill, alignItems: 'center', justifyContent: 'center', backgroundColor: C.paper, borderWidth: 1, borderColor: C.line },
  track: { flex: 1, height: 7, borderRadius: 4, backgroundColor: C.line2, overflow: 'hidden' },
  fill: { height: '100%', borderRadius: 4, backgroundColor: C.terracotta },
  count: { fontFamily: F.sansSemi, fontSize: 13, color: C.ink3, width: 34, textAlign: 'right' },
  scroll: { paddingTop: 22, paddingBottom: 12 },
  eyebrow: { fontFamily: F.sansBold, fontSize: 12, letterSpacing: 1.4, color: C.terracotta, textTransform: 'uppercase' },
  title: { fontFamily: F.serifBold, fontSize: 32, color: C.ink, marginTop: 10, lineHeight: 35, letterSpacing: -0.4 },
  subtitle: { fontFamily: F.sans, fontSize: 15.5, color: C.ink2, marginTop: 10, lineHeight: 22 },
  options: { marginTop: 24, gap: 11 },
  opt: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    backgroundColor: C.paper,
    borderWidth: 1.5,
    borderColor: C.line,
    borderRadius: R.md,
    paddingVertical: 15,
    paddingHorizontal: 16,
  },
  optOn: { borderColor: C.terracotta, backgroundColor: C.saffronSoft },
  optEmoji: { fontSize: 24 },
  optLabel: { fontFamily: F.sansSemi, fontSize: 16, color: C.ink },
  optLabelOn: { color: C.terracottaDeep },
  optHint: { fontFamily: F.sans, fontSize: 13, color: C.ink3, marginTop: 2 },
  optHintOn: { color: C.terracotta },
  check: { width: 24, height: 24, borderRadius: R.pill, borderWidth: 1.5, borderColor: C.line2, alignItems: 'center', justifyContent: 'center' },
  checkOn: { backgroundColor: C.terracotta, borderColor: C.terracotta },
  bottom: { paddingTop: 8 },
});
