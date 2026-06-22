import { useState } from 'react';
import { View, Text, StyleSheet, Pressable, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Crown, Check, Sparkles, X } from 'lucide-react-native';
import { C, F, R, GRAD, SHADOW } from '@/theme/tokens';
import { Button } from '@/components/Button';

const PERKS = [
  { emoji: '📸', label: 'Unlimited fridge snaps', hint: 'Scan as much as you cook' },
  { emoji: '🍲', label: 'AI meal ideas, any time', hint: 'Matched to what you have' },
  { emoji: '👩‍🍳', label: 'Step-by-step cooking mode', hint: 'Calm guidance with timers' },
  { emoji: '❤️', label: 'Save & revisit every win', hint: 'Build your own cookbook' },
];

type Plan = 'yearly' | 'monthly';

export default function Paywall() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const [plan, setPlan] = useState<Plan>('yearly');

  // No backend yet — both actions just enter the app.
  const enter = () => router.replace('/(tabs)');

  return (
    <View style={[styles.root, { paddingTop: insets.top + 8 }]}>
      <View style={styles.top}>
        <Pressable onPress={enter} hitSlop={10} style={styles.close}>
          <X size={18} color={C.ink2} />
        </Pressable>
      </View>

      <ScrollView style={{ flex: 1 }} showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 12 }}>
        <View style={styles.hero}>
          <View style={[styles.mark, SHADOW.cta]}>
            <LinearGradient colors={GRAD.warm} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={StyleSheet.absoluteFill} />
            <Crown size={36} color={C.white} />
          </View>
          <View style={styles.proPill}>
            <Sparkles size={13} color={C.gold} />
            <Text style={styles.proPillText}>Chefly Plus</Text>
          </View>
          <Text style={styles.title}>Cook anything,{'\n'}any night</Text>
          <Text style={styles.subtitle}>Start a 7-day free trial. Cancel anytime — no charge until it ends.</Text>
        </View>

        <View style={styles.perks}>
          {PERKS.map((p) => (
            <View key={p.label} style={styles.perk}>
              <View style={styles.perkIcon}>
                <Text style={{ fontSize: 18 }}>{p.emoji}</Text>
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.perkLabel}>{p.label}</Text>
                <Text style={styles.perkHint}>{p.hint}</Text>
              </View>
              <Check size={18} color={C.sage} strokeWidth={2.6} />
            </View>
          ))}
        </View>

      </ScrollView>

      <View style={[styles.bottom, { paddingBottom: insets.bottom + 14 }]}>
        <View style={styles.plans}>
          <Pressable onPress={() => setPlan('yearly')} style={[styles.plan, plan === 'yearly' && styles.planOn]}>
            <View style={styles.bestBadge}>
              <Text style={styles.bestBadgeText}>BEST VALUE · SAVE 58%</Text>
            </View>
            <View style={styles.planRow}>
              <View style={[styles.radio, plan === 'yearly' && styles.radioOn]}>
                {plan === 'yearly' ? <View style={styles.radioDot} /> : null}
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.planName}>Yearly</Text>
                <Text style={styles.planSub}>$34.99 / year</Text>
              </View>
              <View style={{ alignItems: 'flex-end' }}>
                <Text style={styles.planPrice}>$2.92</Text>
                <Text style={styles.planPer}>/ month</Text>
              </View>
            </View>
          </Pressable>

          <Pressable onPress={() => setPlan('monthly')} style={[styles.plan, plan === 'monthly' && styles.planOn]}>
            <View style={styles.planRow}>
              <View style={[styles.radio, plan === 'monthly' && styles.radioOn]}>
                {plan === 'monthly' ? <View style={styles.radioDot} /> : null}
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.planName}>Monthly</Text>
                <Text style={styles.planSub}>Billed every month</Text>
              </View>
              <View style={{ alignItems: 'flex-end' }}>
                <Text style={styles.planPrice}>$6.99</Text>
                <Text style={styles.planPer}>/ month</Text>
              </View>
            </View>
          </Pressable>
        </View>

        <Button label="Start 7-day free trial" Icon={Sparkles} onPress={enter} large />
        <Text style={styles.terms}>
          {plan === 'yearly' ? '7 days free, then $34.99/year' : '7 days free, then $6.99/month'} · Cancel anytime
        </Text>
        <Pressable onPress={enter} hitSlop={8} style={styles.skip}>
          <Text style={styles.skipText}>Maybe later</Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, paddingHorizontal: 24, backgroundColor: C.cream },
  top: { flexDirection: 'row', justifyContent: 'flex-end', marginBottom: 2 },
  close: { width: 36, height: 36, borderRadius: R.pill, alignItems: 'center', justifyContent: 'center', backgroundColor: C.cream2 },
  hero: { alignItems: 'center', paddingTop: 4 },
  mark: { width: 76, height: 76, borderRadius: 22, alignItems: 'center', justifyContent: 'center', overflow: 'hidden' },
  proPill: { flexDirection: 'row', alignItems: 'center', gap: 6, backgroundColor: C.char, borderRadius: R.pill, paddingVertical: 6, paddingHorizontal: 13, marginTop: 16 },
  proPillText: { fontFamily: F.sansBold, fontSize: 12, letterSpacing: 1, color: '#F4ECDE', textTransform: 'uppercase' },
  title: { fontFamily: F.serifBold, fontSize: 33, color: C.ink, marginTop: 14, lineHeight: 36, letterSpacing: -0.4, textAlign: 'center' },
  subtitle: { fontFamily: F.sans, fontSize: 15, color: C.ink2, marginTop: 10, lineHeight: 22, textAlign: 'center', paddingHorizontal: 8 },
  perks: { marginTop: 20, gap: 12 },
  perk: { flexDirection: 'row', alignItems: 'center', gap: 13 },
  perkIcon: { width: 42, height: 42, borderRadius: 14, backgroundColor: C.paper, borderWidth: 1, borderColor: C.line, alignItems: 'center', justifyContent: 'center' },
  perkLabel: { fontFamily: F.sansSemi, fontSize: 15.5, color: C.ink },
  perkHint: { fontFamily: F.sans, fontSize: 13, color: C.ink3, marginTop: 1 },
  plans: { gap: 10, marginBottom: 2 },
  plan: { backgroundColor: C.paper, borderWidth: 1.5, borderColor: C.line2, borderRadius: R.md, padding: 16 },
  planOn: { borderColor: C.terracotta, backgroundColor: C.saffronSoft, ...SHADOW.sm },
  bestBadge: { alignSelf: 'flex-start', backgroundColor: C.terracotta, borderRadius: R.pill, paddingVertical: 4, paddingHorizontal: 10, marginBottom: 11 },
  bestBadgeText: { fontFamily: F.sansBold, fontSize: 10.5, letterSpacing: 0.8, color: C.white },
  planRow: { flexDirection: 'row', alignItems: 'center', gap: 13 },
  radio: { width: 24, height: 24, borderRadius: R.pill, borderWidth: 2, borderColor: C.line2, alignItems: 'center', justifyContent: 'center' },
  radioOn: { borderColor: C.terracotta },
  radioDot: { width: 12, height: 12, borderRadius: R.pill, backgroundColor: C.terracotta },
  planName: { fontFamily: F.sansSemi, fontSize: 16, color: C.ink },
  planSub: { fontFamily: F.sans, fontSize: 13, color: C.ink3, marginTop: 1 },
  planPrice: { fontFamily: F.serifBold, fontSize: 20, color: C.ink },
  planPer: { fontFamily: F.sans, fontSize: 12, color: C.ink3 },
  bottom: { paddingTop: 12, gap: 12, borderTopWidth: 1, borderTopColor: C.line },
  terms: { fontFamily: F.sans, fontSize: 12.5, color: C.ink3, textAlign: 'center' },
  skip: { alignItems: 'center', paddingVertical: 2 },
  skipText: { fontFamily: F.sansSemi, fontSize: 14.5, color: C.ink2 },
});
