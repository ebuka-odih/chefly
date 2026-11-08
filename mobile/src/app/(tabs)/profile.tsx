import { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Pressable, Linking, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import {
  ChefHat, ChevronRight, Bell, Sparkles, HelpCircle, LogOut, Pencil,
  Shield, FileText, Trash2, Globe, Flame, Ban, Crown, RotateCcw,
} from 'lucide-react-native';
import { C, F, R, GRAD, SHADOW } from '@/theme/tokens';
import { Button } from '@/components/Button';
import { PROFILE } from '@/data/mock';
import { useMe, initialOf, profileFromEmail, updateMe } from '@/lib/profileStore';
import { clearSession, useSession } from '@/lib/session';
import {
  presentCheflyCustomerCenter,
  presentCheflyPaywall,
  restoreCheflyPurchases,
  useSubscription,
} from '@/lib/subscriptionStore';
import { formatEntitlementStatus, getCheflyProEntitlement } from '@/lib/revenueCat';

type IconCmp = React.ComponentType<{ size?: number; color?: string; strokeWidth?: number }>;
const tasteIcon = (label: string): IconCmp => {
  const l = label.toLowerCase();
  if (l.includes('cuisine')) return Globe;
  if (l.includes('spice')) return Flame;
  if (l.includes('avoid')) return Ban;
  return Sparkles;
};

function Toggle({ on, onPress }: { on: boolean; onPress: () => void }) {
  return (
    <Pressable onPress={onPress} style={[styles.tgl, on && styles.tglOn]}>
      <View style={[styles.knob, on && { transform: [{ translateX: 18 }] }]} />
    </Pressable>
  );
}

function Row({
  icon, label, right, top, onPress, danger,
}: {
  icon?: React.ReactNode;
  label: string;
  right?: React.ReactNode;
  top?: boolean;
  onPress?: () => void;
  danger?: boolean;
}) {
  return (
    <Pressable
      onPress={onPress}
      disabled={!onPress}
      style={({ pressed }) => [styles.row, top && styles.rowDivider, pressed && !!onPress && { backgroundColor: C.surface2 }]}
    >
      {icon ? <View style={[styles.rowIc, danger && styles.rowIcDanger]}>{icon}</View> : null}
      <Text style={[styles.rowLabel, { flex: 1 }, danger && { color: C.danger }]} numberOfLines={1}>
        {label}
      </Text>
      {right ?? <ChevronRight size={18} color={danger ? C.danger : C.ink3} />}
    </Pressable>
  );
}

export default function Profile() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const me = useMe();
  const session = useSession();
  const sessionUser = session?.user ?? null;
  const subscription = useSubscription();
  const [notif, setNotif] = useState(true);
  const [watermark, setWatermark] = useState(false);

  useEffect(() => {
    if (!sessionUser) return;
    const fallback = profileFromEmail(sessionUser.email);
    updateMe({
      name: sessionUser.name?.trim() || fallback.name,
      handle: fallback.handle,
    });
  }, [sessionUser]);

  const taste = [
    { label: 'Cuisine focus', value: me.cuisine },
    { label: 'Spice level', value: me.spice },
    { label: 'Avoid', value: me.avoid },
  ];

  const proEntitlement = getCheflyProEntitlement(subscription.customerInfo);

  const openCustomerCenter = async () => {
    try {
      await presentCheflyCustomerCenter();
    } catch (error) {
      const message = error instanceof Error ? error.message : 'We could not open Customer Center.';
      if (subscription.customerInfo?.managementURL) {
        Alert.alert('Customer Center unavailable', `${message}\n\nOpening the store subscription management page instead.`);
        Linking.openURL(subscription.customerInfo.managementURL).catch(() => {
          Alert.alert('Subscription management', message);
        });
        return;
      }
      Alert.alert('Customer Center', message);
    }
  };

  const restore = async () => {
    try {
      await restoreCheflyPurchases();
      Alert.alert('Restore complete', 'RevenueCat finished restoring your purchases.');
    } catch (error) {
      const message = error instanceof Error ? error.message : 'We could not restore your purchases.';
      Alert.alert('Restore failed', message);
    }
  };

  const openPaywall = async () => {
    try {
      await presentCheflyPaywall();
    } catch (error) {
      const message = error instanceof Error ? error.message : 'We could not open the paywall.';
      Alert.alert('RevenueCat paywall', message);
    }
  };

  return (
    <ScrollView
      contentContainerStyle={{ paddingTop: insets.top + 18, paddingHorizontal: 22, paddingBottom: insets.bottom + 28 }}
      showsVerticalScrollIndicator={false}
    >
      {/* profile hero */}
      <View style={styles.hero}>
        <View style={styles.avatarWrap}>
          <View style={styles.avatar}>
            <LinearGradient colors={GRAD.warm} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={StyleSheet.absoluteFill} />
            <Text style={styles.avatarText}>{initialOf(me.name)}</Text>
          </View>
          <Pressable style={styles.editBadge} hitSlop={6} onPress={() => router.push('/edit-profile')}>
            <Pencil size={14} color={C.ink} strokeWidth={2.4} />
          </Pressable>
        </View>
        <Text style={styles.name}>{me.name}</Text>
        <Text style={styles.handle}>{me.handle}</Text>
        <View style={styles.heroTag}>
          <Text style={styles.heroTagTxt}>🍳 {me.cuisine} home cook</Text>
        </View>
      </View>

      {/* relaxed stat cards */}
      <View style={styles.stats}>
        <Stat value={`${PROFILE.stats.cooked}`} label="Cooked" />
        <Stat value={`${PROFILE.stats.saved}`} label="Saved" />
        <Stat value={`${PROFILE.stats.streak} 🔥`} label="Day streak" />
      </View>

      {/* your taste */}
      <View style={styles.tasteHead}>
        <Text style={styles.sectionTitle}>Your taste</Text>
        <Pressable hitSlop={8} onPress={() => router.push('/edit-profile')}>
          <Text style={styles.editLink}>Edit</Text>
        </Pressable>
      </View>
      <View style={styles.card}>
        {taste.map((p, idx) => {
          const Icon = tasteIcon(p.label);
          return (
            <View key={p.label} style={[styles.tasteRow, idx > 0 && styles.rowDivider]}>
              <View style={styles.rowIc}>
                <Icon size={18} color={C.green700} strokeWidth={2.2} />
              </View>
              <Text style={styles.tasteLabel}>{p.label}</Text>
              <View style={styles.valuePill}>
                <Text style={styles.valuePillTxt}>{p.value}</Text>
              </View>
            </View>
          );
        })}
      </View>

      <Text style={styles.sectionTitle}>Chefly Pro</Text>
      <View style={styles.card}>
        <View style={styles.subscriptionHero}>
          <View style={styles.subscriptionIcon}>
            <Crown size={20} color={C.gold} strokeWidth={2.2} />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={styles.subscriptionTitle}>{subscription.isPro ? 'Chefly Pro is active' : 'Chefly Pro is locked'}</Text>
            <Text style={styles.subscriptionMeta}>{formatEntitlementStatus(proEntitlement)}</Text>
            <Text style={styles.subscriptionCopy}>
              {subscription.ready
                ? subscription.isPro
                  ? 'Customer info is synced through RevenueCat. Use Customer Center to manage plans and support actions.'
                  : 'Open the hosted RevenueCat paywall to subscribe, or restore previous purchases on this account.'
                : 'RevenueCat is checking your customer info and offerings.'}
            </Text>
            {subscription.lastError ? <Text style={styles.subscriptionError}>{subscription.lastError}</Text> : null}
          </View>
        </View>
        <View style={styles.subscriptionActions}>
          <Button
            label={subscription.isPro ? 'Manage subscription' : 'See plans'}
            onPress={subscription.isPro ? openCustomerCenter : openPaywall}
            variant={subscription.isPro ? 'dark' : 'primary'}
            large
          />
          <Button
            label="Restore purchases"
            onPress={restore}
            variant="outline"
            Icon={RotateCcw}
            large
          />
        </View>
      </View>

      <Text style={styles.sectionTitle}>Settings</Text>
      <View style={styles.card}>
        <Row icon={<Bell size={18} color={C.green700} />} label="Notifications" right={<Toggle on={notif} onPress={() => setNotif(!notif)} />} />
        <Row
          icon={<Sparkles size={18} color={C.green700} />}
          label="“Made with Chefly” watermark"
          top
          right={<Toggle on={watermark} onPress={() => setWatermark(!watermark)} />}
        />
      </View>

      <Text style={styles.sectionTitle}>Support & legal</Text>
      <View style={styles.card}>
        <Row
          icon={<HelpCircle size={18} color={C.green700} />}
          label="Help & feedback"
          onPress={() => Linking.openURL('mailto:hello@chefly.app?subject=Chefly%20feedback')}
        />
        <Row icon={<Shield size={18} color={C.green700} />} label="Privacy policy" top onPress={() => router.push('/privacy')} />
        <Row icon={<FileText size={18} color={C.green700} />} label="Terms of service" top onPress={() => router.push('/terms')} />
      </View>

      <Text style={styles.sectionTitle}>Account</Text>
      <View style={styles.card}>
        <Row icon={<Trash2 size={18} color={C.danger} />} label="Delete account" danger onPress={() => router.push('/delete-account')} />
      </View>

      <Pressable style={styles.signout} onPress={() => { clearSession(); router.replace('/onboarding'); }}>
        <LogOut size={18} color={C.danger} />
        <Text style={styles.signoutText}>Sign out</Text>
      </Pressable>

      <View style={styles.footer}>
        <ChefHat size={18} color={C.ink3} />
        <Text style={styles.footerText}>Chefly · v1.0</Text>
      </View>
    </ScrollView>
  );
}

function Stat({ value, label }: { value: string; label: string }) {
  return (
    <View style={styles.stat}>
      <Text style={styles.statValue}>{value}</Text>
      <Text style={styles.statLabel}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  // hero
  hero: { alignItems: 'center', marginTop: 4 },
  avatarWrap: { width: 88, height: 88 },
  avatar: { width: 88, height: 88, borderRadius: 44, overflow: 'hidden', alignItems: 'center', justifyContent: 'center', borderWidth: 3, borderColor: C.surface, ...SHADOW.card },
  avatarText: { fontFamily: F.heavy, fontSize: 32, color: C.white, letterSpacing: -0.5 },
  editBadge: { position: 'absolute', right: -2, bottom: -2, width: 32, height: 32, borderRadius: 16, backgroundColor: C.surface, borderWidth: 1, borderColor: C.line, alignItems: 'center', justifyContent: 'center', ...SHADOW.sm },
  name: { fontFamily: F.heavy, fontSize: 24, color: C.ink, letterSpacing: -0.6, marginTop: 14 },
  handle: { fontFamily: F.sansMed, fontSize: 14, color: C.ink3, marginTop: 3 },
  heroTag: { marginTop: 11, backgroundColor: C.saffronSoft, borderRadius: R.pill, paddingVertical: 7, paddingHorizontal: 14 },
  heroTagTxt: { fontFamily: F.sansSemi, fontSize: 13, color: C.green800, letterSpacing: -0.1 },

  // relaxed stat cards — airy, soft, rounder, generous padding
  stats: { flexDirection: 'row', gap: 14, marginTop: 28 },
  stat: { flex: 1, backgroundColor: C.surface, borderRadius: R.xl, paddingVertical: 28, paddingHorizontal: 10, alignItems: 'center', gap: 10, ...SHADOW.sm },
  statValue: { fontFamily: F.heavy, fontSize: 26, color: C.ink, letterSpacing: -0.5 },
  statLabel: { fontFamily: F.sansMed, fontSize: 12.5, color: C.ink3 },

  // sections
  sectionTitle: { fontFamily: F.sansBold, fontSize: 13, letterSpacing: 0.6, textTransform: 'uppercase', color: C.ink3, marginTop: 28, marginBottom: 12 },
  tasteHead: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: 28, marginBottom: 12 },
  editLink: { fontFamily: F.sansBold, fontSize: 13, color: C.green700 },
  card: { backgroundColor: C.surface, borderRadius: R.lg, overflow: 'hidden', ...SHADOW.sm },

  // generic / settings rows
  row: { flexDirection: 'row', alignItems: 'center', gap: 13, paddingVertical: 15, paddingHorizontal: 16 },
  rowDivider: { borderTopWidth: 1, borderTopColor: C.line },
  rowIc: { width: 34, height: 34, borderRadius: R.pill, backgroundColor: C.saffronSoft, alignItems: 'center', justifyContent: 'center' },
  rowIcDanger: { backgroundColor: 'rgba(239,83,80,0.12)' },
  rowLabel: { fontFamily: F.sansMed, fontSize: 14.5, color: C.ink },

  // taste rows
  tasteRow: { flexDirection: 'row', alignItems: 'center', gap: 13, paddingVertical: 15, paddingHorizontal: 16 },
  tasteLabel: { flex: 1, fontFamily: F.sansSemi, fontSize: 14.5, color: C.ink },
  valuePill: { backgroundColor: C.saffronSoft, borderRadius: R.pill, paddingVertical: 6, paddingHorizontal: 13 },
  valuePillTxt: { fontFamily: F.sansBold, fontSize: 13, color: C.green800, letterSpacing: -0.1 },

  subscriptionHero: { flexDirection: 'row', alignItems: 'flex-start', gap: 14, paddingHorizontal: 16, paddingTop: 16 },
  subscriptionIcon: { width: 38, height: 38, borderRadius: R.pill, backgroundColor: C.char, alignItems: 'center', justifyContent: 'center' },
  subscriptionTitle: { fontFamily: F.sansSemi, fontSize: 16, color: C.ink },
  subscriptionMeta: { fontFamily: F.sansBold, fontSize: 12.5, color: C.terracotta, marginTop: 2, textTransform: 'uppercase', letterSpacing: 0.7 },
  subscriptionCopy: { fontFamily: F.sans, fontSize: 14, lineHeight: 21, color: C.ink2, marginTop: 8 },
  subscriptionError: { fontFamily: F.sansSemi, fontSize: 13, color: C.danger, marginTop: 8, lineHeight: 19 },
  subscriptionActions: { gap: 10, padding: 16 },

  tgl: { width: 46, height: 28, borderRadius: 14, backgroundColor: C.line2, justifyContent: 'center', paddingHorizontal: 3 },
  tglOn: { backgroundColor: C.green700 },
  knob: { width: 22, height: 22, borderRadius: 11, backgroundColor: C.white, ...SHADOW.sm },

  signout: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 9, marginTop: 24, paddingVertical: 15, borderRadius: R.md, borderWidth: 1, borderColor: C.line2 },
  signoutText: { fontFamily: F.sansSemi, fontSize: 15, color: C.danger },
  footer: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, marginTop: 22 },
  footerText: { fontFamily: F.sans, fontSize: 13, color: C.ink3 },
});
