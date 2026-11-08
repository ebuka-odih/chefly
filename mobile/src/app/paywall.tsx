import { useEffect, useState } from 'react';
import { View, Text, StyleSheet, Pressable, ScrollView, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import RevenueCatUI from 'react-native-purchases-ui';
import { Crown, Check, Sparkles, X, RefreshCcw, ShieldCheck } from 'lucide-react-native';
import { C, F, R, GRAD, SHADOW } from '@/theme/tokens';
import { Button } from '@/components/Button';
import {
  presentCheflyPaywall,
  restoreCheflyPurchases,
  useSubscription,
} from '@/lib/subscriptionStore';

const PERKS = [
  { emoji: '📸', label: 'Unlimited fridge snaps', hint: 'Scan as much as you cook' },
  { emoji: '🍲', label: 'AI meal ideas, any time', hint: 'Matched to what you have' },
  { emoji: '👩‍🍳', label: 'Step-by-step cooking mode', hint: 'Calm guidance with timers' },
  { emoji: '❤️', label: 'Save & revisit every win', hint: 'Build your own cookbook' },
];

export default function Paywall() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const subscription = useSubscription();
  const [restoring, setRestoring] = useState(false);

  const enter = () => router.replace('/(tabs)');

  useEffect(() => {
    if (subscription.isPro) {
      router.replace('/(tabs)');
    }
  }, [router, subscription.isPro]);

  const showPaywall = async () => {
    try {
      const result = await presentCheflyPaywall();
      if (result === RevenueCatUI.PAYWALL_RESULT.NOT_PRESENTED) {
        Alert.alert('Paywall unavailable', 'No RevenueCat paywall is available yet. Confirm the default offering is configured in RevenueCat.');
      }
      if (result === RevenueCatUI.PAYWALL_RESULT.PURCHASED || result === RevenueCatUI.PAYWALL_RESULT.RESTORED) {
        router.replace('/(tabs)');
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : 'We could not open the paywall.';
      Alert.alert('RevenueCat paywall', message);
    }
  };

  const restore = async () => {
    setRestoring(true);
    try {
      const customerInfo = await restoreCheflyPurchases();
      if (customerInfo.entitlements.active['Chefly Pro']) {
        router.replace('/(tabs)');
        return;
      }
      Alert.alert('Restore completed', 'We restored your account, but no active Chefly Pro entitlement was found yet.');
    } catch (error) {
      const message = error instanceof Error ? error.message : 'We could not restore your purchases.';
      Alert.alert('Restore failed', message);
    } finally {
      setRestoring(false);
    }
  };

  const planCards = [
    subscription.packages.yearly,
    subscription.packages.monthly,
    subscription.packages.lifetime,
  ].filter((aPackage): aPackage is NonNullable<typeof aPackage> => Boolean(aPackage));

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
            <Text style={styles.proPillText}>Chefly Pro</Text>
          </View>
          <Text style={styles.title}>Cook anything,{'\n'}any night</Text>
          <Text style={styles.subtitle}>RevenueCat handles the paywall, subscription products, purchase restore, and entitlement unlock for Chefly Pro.</Text>
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

        <View style={styles.statusCard}>
          <View style={styles.statusHead}>
            <ShieldCheck size={17} color={C.green700} />
            <Text style={styles.statusTitle}>Subscription status</Text>
          </View>
          <Text style={styles.statusBody}>
            {subscription.ready
              ? subscription.isPro
                ? 'Chefly Pro entitlement is active.'
                : 'Chefly Pro entitlement is not active yet.'
              : 'Checking RevenueCat customer info…'}
          </Text>
          {subscription.lastError ? <Text style={styles.error}>{subscription.lastError}</Text> : null}
        </View>

        <View style={styles.planList}>
          <Text style={styles.planListTitle}>Products in your default offering</Text>
          {planCards.length > 0 ? (
            planCards.map((aPackage) => (
              <View key={aPackage.identifier} style={styles.planCard}>
                <View>
                  <Text style={styles.planName}>{aPackage.product.title}</Text>
                  <Text style={styles.planSub}>
                    {aPackage.identifier} · {aPackage.product.identifier}
                  </Text>
                </View>
                <Text style={styles.planPrice}>{aPackage.product.priceString}</Text>
              </View>
            ))
          ) : (
            <Text style={styles.planFallback}>
              No products are coming back from RevenueCat yet. Create the `default` offering and attach your `lifetime`, `yearly`, and `monthly` packages.
            </Text>
          )}
        </View>
      </ScrollView>

      <View style={[styles.bottom, { paddingBottom: insets.bottom + 14 }]}>
        <Button
          label={subscription.busy ? 'Opening paywall…' : 'Open RevenueCat paywall'}
          Icon={subscription.busy ? undefined : Sparkles}
          onPress={showPaywall}
          disabled={subscription.busy}
          large
        />
        <Button
          label={restoring ? 'Restoring…' : 'Restore purchases'}
          Icon={restoring ? undefined : RefreshCcw}
          onPress={restore}
          variant="outline"
          disabled={subscription.busy || restoring}
          large
        />
        <Text style={styles.terms}>
          Hosted by RevenueCat · Entitlement required: Chefly Pro
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
  statusCard: { marginTop: 22, borderRadius: R.lg, backgroundColor: C.paper, borderWidth: 1, borderColor: C.line, padding: 16, gap: 8 },
  statusHead: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  statusTitle: { fontFamily: F.sansBold, fontSize: 14, color: C.ink },
  statusBody: { fontFamily: F.sans, fontSize: 14, lineHeight: 21, color: C.ink2 },
  error: { fontFamily: F.sansSemi, fontSize: 13, lineHeight: 19, color: C.danger },
  planList: { marginTop: 18, gap: 10 },
  planListTitle: { fontFamily: F.sansBold, fontSize: 13, letterSpacing: 0.8, color: C.ink3, textTransform: 'uppercase' },
  planCard: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 12, backgroundColor: C.paper, borderWidth: 1, borderColor: C.line, borderRadius: R.md, padding: 14 },
  planName: { fontFamily: F.sansSemi, fontSize: 15, color: C.ink },
  planSub: { fontFamily: F.sans, fontSize: 12.5, color: C.ink3, marginTop: 2 },
  planPrice: { fontFamily: F.serifBold, fontSize: 18, color: C.ink },
  planFallback: { fontFamily: F.sans, fontSize: 14, lineHeight: 21, color: C.ink2 },
  bottom: { paddingTop: 12, gap: 12, borderTopWidth: 1, borderTopColor: C.line },
  terms: { fontFamily: F.sans, fontSize: 12.5, color: C.ink3, textAlign: 'center' },
  skip: { alignItems: 'center', paddingVertical: 2 },
  skipText: { fontFamily: F.sansSemi, fontSize: 14.5, color: C.ink2 },
});
