import { useEffect, useRef, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  TextInput,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Mail, ArrowRight, ArrowLeft, MailCheck, ClipboardPaste, Check } from 'lucide-react-native';
import { C, F, R, GRAD, SHADOW } from '@/theme/tokens';
import { Button } from '@/components/Button';
import { requestOtp, verifyMagicLink, verifyOtp } from '@/lib/authApi';
import { setSession } from '@/lib/session';

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export default function Auth() {
  const router = useRouter();
  const params = useLocalSearchParams<{ token?: string | string[] }>();
  const insets = useSafeAreaInsets();
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [sent, setSent] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const inputRef = useRef<TextInput>(null);
  const otpInputRef = useRef<TextInput>(null);
  const handledToken = useRef<string | null>(null);

  const valid = EMAIL_RE.test(email.trim());
  const validOtp = otp.length === 6;
  const linkToken = typeof params.token === 'string' ? params.token : '';

  // Auth is reached via replace() from onboarding, so the stack is often empty —
  // fall back to onboarding instead of a no-op GO_BACK that warns.
  const goBack = () => (router.canGoBack() ? router.back() : router.replace('/onboarding'));

  useEffect(() => {
    if (!linkToken || handledToken.current === linkToken) return;
    handledToken.current = linkToken;
    setBusy(true);
    setSent(true);
    setError(null);

    verifyMagicLink(linkToken)
      .then((session) => {
        setSession(session);
        router.replace('/questions');
      })
      .catch((err) => {
        handledToken.current = null;
        setSent(false);
        setError(err instanceof Error ? err.message : 'We could not verify that link.');
      })
      .finally(() => setBusy(false));
  }, [linkToken, router]);

  const sendCode = async () => {
    if (!valid || busy) return;
    setBusy(true);
    setError(null);
    try {
      await requestOtp(email.trim().toLowerCase());
      setSent(true);
      setOtp('');
      requestAnimationFrame(() => otpInputRef.current?.focus());
    } catch (err) {
      setError(err instanceof Error ? err.message : 'We could not send that code.');
    } finally {
      setBusy(false);
    }
  };

  const verifyCode = async (codeValue = otp) => {
    const normalizedCode = codeValue.replace(/\D/g, '').slice(0, 6);
    if (!valid || normalizedCode.length !== 6 || busy) return;
    setBusy(true);
    setError(null);
    try {
      const session = await verifyOtp(email.trim().toLowerCase(), normalizedCode);
      setSession(session);
      router.replace('/questions');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'That code did not work.');
    } finally {
      setBusy(false);
    }
  };

  const changeOtp = (value: string) => {
    setOtp(value.replace(/\D/g, '').slice(0, 6));
  };

  const pasteOtp = async () => {
    if (busy) return;
    let copied = '';
    try {
      const clipboard = await import('expo-clipboard');
      copied = await clipboard.getStringAsync();
    } catch {
      otpInputRef.current?.focus();
      setError('Paste from the keyboard menu, then tap Verify code.');
      return;
    }
    const copiedCode = copied.replace(/\D/g, '').slice(0, 6);
    if (!copiedCode) {
      setError('No sign-in code found on your clipboard.');
      return;
    }
    setOtp(copiedCode);
    if (copiedCode.length === 6) {
      await verifyCode(copiedCode);
    }
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
            <Pressable onPress={goBack} hitSlop={8} style={styles.backBtn}>
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
              {busy ? <ActivityIndicator size="small" color={C.white} /> : <MailCheck size={40} color={C.white} />}
            </View>
            <Text style={styles.eyebrow}>{busy ? 'Signing you in' : 'Check your inbox'}</Text>
            <Text style={styles.title}>{busy ? `Verifying\nyour code` : `Enter your\n6-digit code`}</Text>
            <Text style={styles.desc}>
              {busy ? (
                'Hold on while we finish signing you in.'
              ) : (
                <>
                  We emailed a sign-in code to{'\n'}
                  <Text style={styles.emailStrong}>{email.trim()}</Text>
                  {'\n'}Paste it below to open your account.
                </>
              )}
            </Text>
            {error ? <Text style={styles.error}>{error}</Text> : null}

            <View style={styles.otpWrap}>
              <Pressable style={styles.otpField} onPress={() => otpInputRef.current?.focus()}>
                <TextInput
                  ref={otpInputRef}
                  value={otp}
                  onChangeText={changeOtp}
                  placeholder="000000"
                  placeholderTextColor={C.ink3}
                  keyboardType="number-pad"
                  inputMode="numeric"
                  textContentType="oneTimeCode"
                  autoComplete="one-time-code"
                  maxLength={6}
                  returnKeyType="go"
                  onSubmitEditing={() => verifyCode()}
                  style={styles.otpInput}
                />
              </Pressable>
              <Pressable onPress={pasteOtp} hitSlop={8} style={styles.pasteBtn} disabled={busy}>
                <ClipboardPaste size={21} color={C.terracottaDeep} />
              </Pressable>
            </View>

            <View style={styles.bottom}>
              <Button label={busy ? 'Checking…' : 'Verify code'} IconRight={busy ? undefined : Check} onPress={() => verifyCode()} disabled={!validOtp || busy} large />
              <Pressable onPress={sendCode} hitSlop={8} style={styles.textBtn} disabled={busy}>
                <Text style={styles.textBtnLabel}>Resend code</Text>
              </Pressable>
              <Pressable onPress={() => setSent(false)} hitSlop={8} style={styles.textBtn} disabled={busy}>
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
              Enter your email and we&apos;ll send a 6-digit code to sign you in. No passwords to remember.
            </Text>
            {error ? <Text style={styles.error}>{error}</Text> : null}

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
                onSubmitEditing={sendCode}
                style={styles.input}
              />
            </Pressable>

            <View style={styles.bottom}>
              <Button label={busy ? 'Sending…' : 'Send code'} IconRight={busy ? undefined : ArrowRight} onPress={sendCode} disabled={!valid || busy} large />
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
  otpWrap: { flexDirection: 'row', alignItems: 'center', gap: 12, marginTop: 28 },
  otpField: {
    flex: 1,
    height: 64,
    borderRadius: R.md,
    backgroundColor: C.paper,
    borderWidth: 1.5,
    borderColor: C.line2,
    justifyContent: 'center',
    paddingHorizontal: 18,
    ...SHADOW.sm,
  },
  otpInput: {
    height: '100%',
    fontFamily: F.sansBold,
    fontSize: 28,
    color: C.ink,
    letterSpacing: 8,
    textAlign: 'center',
  },
  pasteBtn: {
    width: 54,
    height: 54,
    borderRadius: R.pill,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: C.saffronSoft,
    borderWidth: 1,
    borderColor: C.line2,
  },
  bottom: { marginTop: 'auto', gap: 16 },
  legal: { fontFamily: F.sans, fontSize: 12.5, color: C.ink3, textAlign: 'center', lineHeight: 18 },
  textBtn: { alignItems: 'center', paddingVertical: 4 },
  textBtnLabel: { fontFamily: F.sansSemi, fontSize: 14.5, color: C.terracotta },
  error: { fontFamily: F.sansMed, fontSize: 14, color: C.danger, marginTop: 12, lineHeight: 20 },
});
