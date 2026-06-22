import { useRef, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  TextInput,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Mail, ArrowRight, ArrowLeft, MailCheck } from 'lucide-react-native';
import { C, F, R, GRAD, SHADOW, T } from '@/theme/tokens';
import { Button } from '@/components/Button';

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export default function Auth() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const [email, setEmail] = useState('');
  const [sent, setSent] = useState(false);
  const inputRef = useRef<TextInput>(null);

  const valid = EMAIL_RE.test(email.trim());

  // No backend yet — sending the "magic link" just advances the UI.
  const sendLink = () => {
    if (!valid) return;
    setSent(true);
  };

  return (
    <KeyboardAvoidingView
      style={styles.root}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <View style={[styles.inner, { paddingTop: insets.top + 8, paddingBottom: insets.bottom + 18 }]}>
        <View style={styles.top}>
          {sent ? (
            <Pressable onPress={() => setSent(false)} hitSlop={8} style={styles.backBtn}>
              <ArrowLeft size={20} color={C.ink} />
            </Pressable>
          ) : (
            <Pressable onPress={() => router.back()} hitSlop={8} style={styles.backBtn}>
              <ArrowLeft size={20} color={C.ink} />
            </Pressable>
          )}
          <Text style={styles.brand}>Chefly</Text>
          <View style={{ width: 38 }} />
        </View>

        {sent ? (
          <View style={styles.body}>
            <View style={[styles.mark, SHADOW.cta]}>
              <LinearGradient colors={GRAD.warm} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={StyleSheet.absoluteFill} />
              <MailCheck size={40} color={C.white} />
            </View>
            <Text style={styles.eyebrow}>Check your inbox</Text>
            <Text style={styles.title}>Tap the link{'\n'}we just sent</Text>
            <Text style={styles.desc}>
              We emailed a magic link to{'\n'}
              <Text style={styles.emailStrong}>{email.trim()}</Text>
              {'\n'}Open it on this device to sign in — no password needed.
            </Text>

            <View style={styles.bottom}>
              {/* No backend yet — "opening the link" continues the flow. */}
              <Button label="I opened the link" IconRight={ArrowRight} onPress={() => router.replace('/questions')} large />
              <Pressable onPress={() => setSent(false)} hitSlop={8} style={styles.textBtn}>
                <Text style={styles.textBtnLabel}>Use a different email</Text>
              </Pressable>
            </View>
          </View>
        ) : (
          <View style={styles.body}>
            <View style={[styles.mark, SHADOW.cta]}>
              <LinearGradient colors={GRAD.warm} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={StyleSheet.absoluteFill} />
              <Mail size={40} color={C.white} />
            </View>
            <Text style={styles.eyebrow}>Welcome</Text>
            <Text style={styles.title}>Let&apos;s get{'\n'}you cooking</Text>
            <Text style={styles.desc}>
              Enter your email and we&apos;ll send a magic link to sign you in. No passwords to remember.
            </Text>

            <Pressable style={styles.field} onPress={() => inputRef.current?.focus()}>
              <Mail size={19} color={C.ink3} />
              <TextInput
                ref={inputRef}
                value={email}
                onChangeText={setEmail}
                placeholder="you@email.com"
                placeholderTextColor={C.ink3}
                keyboardType="email-address"
                autoCapitalize="none"
                autoCorrect={false}
                autoComplete="email"
                inputMode="email"
                returnKeyType="go"
                onSubmitEditing={sendLink}
                style={styles.input}
              />
            </Pressable>

            <View style={styles.bottom}>
              <Button label="Send magic link" IconRight={ArrowRight} onPress={sendLink} disabled={!valid} large />
              <Text style={styles.legal}>
                By continuing you agree to our Terms & Privacy Policy.
              </Text>
            </View>
          </View>
        )}
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: C.cream },
  inner: { flex: 1, paddingHorizontal: 24 },
  top: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 },
  backBtn: { width: 38, height: 38, borderRadius: R.pill, alignItems: 'center', justifyContent: 'center', backgroundColor: C.paper, borderWidth: 1, borderColor: C.line },
  brand: { fontFamily: F.serif, fontSize: 20, color: C.ink },
  body: { flex: 1, paddingTop: 18 },
  mark: { width: 80, height: 80, borderRadius: 24, alignItems: 'center', justifyContent: 'center', overflow: 'hidden' },
  eyebrow: { fontFamily: F.sansBold, fontSize: 12, letterSpacing: 1.4, color: C.terracotta, textTransform: 'uppercase', marginTop: 26 },
  title: { fontFamily: F.serifBold, fontSize: 36, color: C.ink, marginTop: 10, lineHeight: 39, letterSpacing: -0.5 },
  desc: { fontFamily: F.sans, fontSize: 16, color: C.ink2, marginTop: 14, lineHeight: 23 },
  emailStrong: { fontFamily: F.sansSemi, color: C.ink },
  field: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 11,
    backgroundColor: C.paper,
    borderWidth: 1.5,
    borderColor: C.line2,
    borderRadius: R.md,
    paddingHorizontal: 16,
    height: 56,
    marginTop: 26,
    ...SHADOW.sm,
  },
  input: { flex: 1, fontFamily: F.sansMed, fontSize: 16, color: C.ink, height: '100%' },
  bottom: { marginTop: 'auto', gap: 16 },
  legal: { fontFamily: F.sans, fontSize: 12.5, color: C.ink3, textAlign: 'center', lineHeight: 18 },
  textBtn: { alignItems: 'center', paddingVertical: 4 },
  textBtnLabel: { fontFamily: F.sansSemi, fontSize: 14.5, color: C.terracotta },
});
