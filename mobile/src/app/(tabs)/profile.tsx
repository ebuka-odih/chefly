import { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Pressable } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { ChefHat, ChevronRight, Bell, Leaf, Sparkles, HelpCircle, LogOut, Pencil } from 'lucide-react-native';
import { C, F, R, T, SHADOW } from '@/theme/tokens';
import { PROFILE } from '@/data/mock';

function Toggle({ on, onPress }: { on: boolean; onPress: () => void }) {
  return (
    <Pressable onPress={onPress} style={[styles.tgl, on && styles.tglOn]}>
      <View style={[styles.knob, on && { transform: [{ translateX: 18 }] }]} />
    </Pressable>
  );
}

function Row({ icon, label, value, right, top }: { icon?: React.ReactNode; label: string; value?: string; right?: React.ReactNode; top?: boolean }) {
  return (
    <View style={[styles.row, top && { borderTopWidth: 1, borderTopColor: C.line }]}>
      {icon ? <View style={styles.rowIc}>{icon}</View> : null}
      <Text style={[styles.rowLabel, { flex: 1 }]}>{label}</Text>
      {value ? <Text style={styles.rowValue}>{value}</Text> : null}
      {right ?? <ChevronRight size={18} color={C.ink3} />}
    </View>
  );
}

export default function Profile() {
  const insets = useSafeAreaInsets();
  const [notif, setNotif] = useState(true);
  const [watermark, setWatermark] = useState(false);

  return (
    <ScrollView
      contentContainerStyle={{ paddingTop: insets.top + 16, paddingHorizontal: 22, paddingBottom: insets.bottom + 110 }}
      showsVerticalScrollIndicator={false}
    >
      <View style={styles.head}>
        <View style={styles.avatar}><Text style={styles.avatarText}>{PROFILE.initial}</Text></View>
        <View style={{ flex: 1 }}>
          <Text style={T.h2}>{PROFILE.name}</Text>
          <Text style={[T.small, { marginTop: 2 }]}>{PROFILE.handle}</Text>
        </View>
        <Pressable style={styles.edit}><Pencil size={17} color={C.ink} /></Pressable>
      </View>

      <View style={styles.stats}>
        <Stat value={`${PROFILE.stats.cooked}`} label="Cooked" />
        <Stat value={`${PROFILE.stats.saved}`} label="Saved" />
        <Stat value={`${PROFILE.stats.streak}🔥`} label="Day streak" />
      </View>

      <Text style={styles.sectionTitle}>Your taste</Text>
      <View style={styles.card}>
        {PROFILE.preferences.map((p, idx) => (
          <Row key={p.label} label={p.label} value={p.value} top={idx > 0} />
        ))}
      </View>

      <Text style={styles.sectionTitle}>Settings</Text>
      <View style={styles.card}>
        <Row icon={<Bell size={18} color={C.terracotta} />} label="Notifications" right={<Toggle on={notif} onPress={() => setNotif(!notif)} />} />
        <Row icon={<Leaf size={18} color={C.terracotta} />} label="Dietary preferences" top />
        <Row icon={<Sparkles size={18} color={C.terracotta} />} label="“Made with Chefly” watermark" top right={<Toggle on={watermark} onPress={() => setWatermark(!watermark)} />} />
        <Row icon={<HelpCircle size={18} color={C.terracotta} />} label="Help & feedback" top />
      </View>

      <Pressable style={styles.signout}>
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
  head: { flexDirection: 'row', alignItems: 'center', gap: 15 },
  avatar: { width: 66, height: 66, borderRadius: 22, backgroundColor: C.sage, alignItems: 'center', justifyContent: 'center', ...SHADOW.sm },
  avatarText: { fontFamily: F.heavy, fontSize: 26, color: C.white, letterSpacing: -0.5 },
  edit: { width: 42, height: 42, borderRadius: 21, backgroundColor: C.paper, borderWidth: 1, borderColor: C.line, alignItems: 'center', justifyContent: 'center', ...SHADOW.sm },
  stats: { flexDirection: 'row', gap: 12, marginTop: 26 },
  stat: { flex: 1, backgroundColor: C.surface, borderWidth: 1, borderColor: C.line, borderRadius: R.lg, paddingVertical: 22, paddingHorizontal: 8, alignItems: 'center', gap: 7, ...SHADOW.sm },
  statValue: { fontFamily: F.heavy, fontSize: 26, color: C.ink, letterSpacing: -0.5 },
  statLabel: { fontFamily: F.sansMed, fontSize: 12.5, color: C.ink3 },
  sectionTitle: { fontFamily: F.sansBold, fontSize: 13, letterSpacing: 0.6, textTransform: 'uppercase', color: C.ink3, marginTop: 30, marginBottom: 12 },
  card: { backgroundColor: C.paper, borderWidth: 1, borderColor: C.line, borderRadius: R.md, overflow: 'hidden', ...SHADOW.sm },
  row: { flexDirection: 'row', alignItems: 'center', gap: 13, paddingVertical: 15, paddingHorizontal: 16 },
  rowIc: { width: 34, height: 34, borderRadius: 11, backgroundColor: C.cream2, alignItems: 'center', justifyContent: 'center' },
  rowLabel: { fontFamily: F.sansMed, fontSize: 14.5, color: C.ink },
  rowValue: { fontFamily: F.sans, fontSize: 14, color: C.ink2 },
  tgl: { width: 46, height: 28, borderRadius: 14, backgroundColor: C.line2, justifyContent: 'center', paddingHorizontal: 3 },
  tglOn: { backgroundColor: C.sage },
  knob: { width: 22, height: 22, borderRadius: 11, backgroundColor: C.white, ...SHADOW.sm },
  signout: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 9, marginTop: 26, paddingVertical: 15, borderRadius: R.md, borderWidth: 1, borderColor: C.line2 },
  signoutText: { fontFamily: F.sansSemi, fontSize: 15, color: C.danger },
  footer: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, marginTop: 22 },
  footerText: { fontFamily: F.sans, fontSize: 13, color: C.ink3 },
});
