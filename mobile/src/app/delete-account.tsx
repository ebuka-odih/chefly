import { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Pressable, Modal } from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { TriangleAlert, Check, Trash2 } from 'lucide-react-native';
import { C, F, R, SHADOW } from '@/theme/tokens';
import { AppHeader } from '@/components/AppHeader';
import { PROFILE } from '@/data/mock';

const LOSES = [
  { label: 'Profile & preferences', detail: 'Your name, taste profile and settings' },
  { label: `${PROFILE.stats.saved} saved recipes`, detail: 'Everything in your saved list' },
  { label: `${PROFILE.stats.cooked} cooked meals & streak`, detail: 'Your full cooking history' },
  { label: 'Subscription', detail: 'Any active plan will be cancelled' },
];

export default function DeleteAccount() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const [ack, setAck] = useState(false);
  const [confirming, setConfirming] = useState(false);

  const reallyDelete = () => {
    setConfirming(false);
    router.replace('/onboarding');
  };

  return (
    <View style={{ flex: 1, backgroundColor: C.bg }}>
      <AppHeader variant="page" title="Delete account" onBack={() => router.back()} />

      <ScrollView
        style={{ flex: 1 }}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingHorizontal: 22, paddingTop: 8, paddingBottom: insets.bottom + 28 }}
      >
        <View style={styles.hero}>
          <View style={styles.warnIco}>
            <TriangleAlert size={26} color={C.danger} strokeWidth={2.2} />
          </View>
          <Text style={styles.title}>Delete your account?</Text>
          <Text style={styles.sub}>
            This permanently erases your Chefly account and everything in it. There’s no way to undo it.
          </Text>
        </View>

        <Text style={styles.eyebrow}>What you’ll lose</Text>
        <View style={styles.card}>
          {LOSES.map((it, i) => (
            <View key={it.label} style={[styles.loseRow, i > 0 && styles.divider]}>
              <View style={styles.loseDot} />
              <View style={{ flex: 1 }}>
                <Text style={styles.loseLabel}>{it.label}</Text>
                <Text style={styles.loseDetail}>{it.detail}</Text>
              </View>
            </View>
          ))}
        </View>

        <Pressable style={styles.ack} onPress={() => setAck(!ack)} accessibilityRole="checkbox" accessibilityState={{ checked: ack }}>
          <View style={[styles.check, ack && styles.checkOn]}>{ack ? <Check size={15} color={C.white} strokeWidth={3} /> : null}</View>
          <Text style={styles.ackTxt}>I understand this is permanent and my data can’t be recovered.</Text>
        </Pressable>

        <Pressable
          style={({ pressed }) => [styles.deleteBtn, !ack && styles.deleteBtnOff, pressed && ack && { opacity: 0.92 }]}
          disabled={!ack}
          onPress={() => setConfirming(true)}
        >
          <Trash2 size={18} color={C.white} strokeWidth={2.3} />
          <Text style={styles.deleteTxt}>Delete my account</Text>
        </Pressable>

        <Pressable style={styles.cancel} onPress={() => router.back()}>
          <Text style={styles.cancelTxt}>Keep my account</Text>
        </Pressable>
      </ScrollView>

      {/* final confirmation */}
      <Modal visible={confirming} transparent animationType="fade" onRequestClose={() => setConfirming(false)}>
        <View style={styles.backdrop}>
          <View style={styles.dialog}>
            <View style={styles.warnIco}>
              <TriangleAlert size={24} color={C.danger} strokeWidth={2.2} />
            </View>
            <Text style={styles.dialogTitle}>Are you sure?</Text>
            <Text style={styles.dialogSub}>This is your last chance — deleting your account can’t be reversed.</Text>
            <Pressable style={({ pressed }) => [styles.dialogDelete, pressed && { opacity: 0.92 }]} onPress={reallyDelete}>
              <Text style={styles.dialogDeleteTxt}>Yes, delete everything</Text>
            </Pressable>
            <Pressable style={styles.dialogCancel} onPress={() => setConfirming(false)}>
              <Text style={styles.dialogCancelTxt}>Cancel</Text>
            </Pressable>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  hero: { alignItems: 'center', marginTop: 10, paddingHorizontal: 6 },
  warnIco: { width: 56, height: 56, borderRadius: R.pill, backgroundColor: 'rgba(239,83,80,0.12)', alignItems: 'center', justifyContent: 'center' },
  title: { fontFamily: F.heavy, fontSize: 23, color: C.ink, letterSpacing: -0.5, marginTop: 16, textAlign: 'center' },
  sub: { fontFamily: F.sans, fontSize: 14.5, lineHeight: 22, color: C.ink2, textAlign: 'center', marginTop: 8 },

  eyebrow: { fontFamily: F.sansBold, fontSize: 12, letterSpacing: 1.2, textTransform: 'uppercase', color: C.ink3, marginTop: 30, marginBottom: 12 },
  card: { backgroundColor: C.surface, borderRadius: R.lg, overflow: 'hidden', ...SHADOW.sm },
  loseRow: { flexDirection: 'row', alignItems: 'center', gap: 13, paddingVertical: 14, paddingHorizontal: 16 },
  divider: { borderTopWidth: 1, borderTopColor: C.line },
  loseDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: C.danger },
  loseLabel: { fontFamily: F.sansSemi, fontSize: 14.5, color: C.ink },
  loseDetail: { fontFamily: F.sans, fontSize: 12.5, color: C.ink3, marginTop: 2 },

  ack: { flexDirection: 'row', alignItems: 'flex-start', gap: 12, marginTop: 24, paddingHorizontal: 4 },
  check: { width: 24, height: 24, borderRadius: 8, borderWidth: 2, borderColor: C.line2, alignItems: 'center', justifyContent: 'center', marginTop: 1 },
  checkOn: { backgroundColor: C.danger, borderColor: C.danger },
  ackTxt: { flex: 1, fontFamily: F.sansMed, fontSize: 14, lineHeight: 21, color: C.ink2 },

  deleteBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 9, height: 56, borderRadius: R.md, backgroundColor: C.danger, marginTop: 26, ...SHADOW.sm },
  deleteBtnOff: { opacity: 0.45 },
  deleteTxt: { fontFamily: F.sansBold, fontSize: 16, color: C.white },
  cancel: { alignItems: 'center', justifyContent: 'center', paddingVertical: 16, marginTop: 4 },
  cancelTxt: { fontFamily: F.sansSemi, fontSize: 15, color: C.ink2 },

  backdrop: { flex: 1, backgroundColor: 'rgba(31,49,16,0.45)', alignItems: 'center', justifyContent: 'center', paddingHorizontal: 32 },
  dialog: { width: '100%', backgroundColor: C.surface, borderRadius: R.xl, padding: 24, alignItems: 'center', ...SHADOW.card },
  dialogTitle: { fontFamily: F.heavy, fontSize: 20, color: C.ink, letterSpacing: -0.4, marginTop: 14 },
  dialogSub: { fontFamily: F.sans, fontSize: 14, lineHeight: 21, color: C.ink2, textAlign: 'center', marginTop: 8, marginBottom: 20 },
  dialogDelete: { width: '100%', height: 52, borderRadius: R.md, backgroundColor: C.danger, alignItems: 'center', justifyContent: 'center' },
  dialogDeleteTxt: { fontFamily: F.sansBold, fontSize: 15, color: C.white },
  dialogCancel: { width: '100%', height: 50, alignItems: 'center', justifyContent: 'center', marginTop: 6 },
  dialogCancelTxt: { fontFamily: F.sansSemi, fontSize: 15, color: C.ink2 },
});
