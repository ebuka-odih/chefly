import { useState } from 'react';
import { ActivityIndicator, View, Text, StyleSheet, ScrollView, Pressable, TextInput } from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Check } from 'lucide-react-native';
import { C, F, R, GRAD, SHADOW } from '@/theme/tokens';
import { AppHeader } from '@/components/AppHeader';
import { Button } from '@/components/Button';
import { useMe, updateMe, initialOf } from '@/lib/profileStore';
import { updateProfileName } from '@/lib/authApi';

const CUISINES = ['Nigerian', 'West African', 'Mediterranean', 'Italian', 'Asian', 'Mexican', 'Anything'];
const SPICES = ['Mild', 'Medium', 'Hot', 'Fiery'];
const AVOIDS = ['None', 'Pork', 'Red meat', 'Gluten', 'Dairy', 'Nuts', 'Shellfish'];

function Opt({ label, on, onPress }: { label: string; on: boolean; onPress: () => void }) {
  return (
    <Pressable onPress={onPress} style={({ pressed }) => [styles.chip, on && styles.chipOn, pressed && { transform: [{ scale: 0.97 }] }]}>
      <Text style={[styles.chipTxt, on && styles.chipTxtOn]}>{label}</Text>
    </Pressable>
  );
}

export default function EditProfile() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const me = useMe();

  const [name, setName] = useState(me.name);
  const [handle, setHandle] = useState(me.handle);
  const [cuisine, setCuisine] = useState(me.cuisine);
  const [spice, setSpice] = useState(me.spice);
  const [avoid, setAvoid] = useState(me.avoid);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const save = async () => {
    if (busy) return;
    const cleanName = name.trim() || me.name;
    let cleanHandle = handle.trim();
    if (cleanHandle && !cleanHandle.startsWith('@')) cleanHandle = `@${cleanHandle}`;
    setBusy(true);
    setError(null);
    try {
      await updateProfileName(cleanName);
      updateMe({ name: cleanName, handle: cleanHandle || me.handle, cuisine, spice, avoid });
      router.back();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not save profile.');
    } finally {
      setBusy(false);
    }
  };

  return (
    <View style={{ flex: 1, backgroundColor: C.bg }}>
      <AppHeader variant="page" title="Edit profile" onBack={() => router.back()} />

      <ScrollView
        style={{ flex: 1 }}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
        contentContainerStyle={{ paddingHorizontal: 22, paddingTop: 6, paddingBottom: insets.bottom + 110 }}
      >
        <View style={styles.avatarWrap}>
          <View style={styles.avatar}>
            <LinearGradient colors={GRAD.warm} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={StyleSheet.absoluteFill} />
            <Text style={styles.avatarText}>{initialOf(name)}</Text>
          </View>
        </View>

        <Text style={styles.eyebrow}>Profile</Text>
        <View style={styles.field}>
          <Text style={styles.fieldLabel}>Name</Text>
          <TextInput value={name} onChangeText={setName} placeholder="Your name" placeholderTextColor={C.ink3} style={styles.input} />
        </View>
        {error ? <Text style={styles.error}>{error}</Text> : null}
        <View style={[styles.field, { marginTop: 12 }]}>
          <Text style={styles.fieldLabel}>Username</Text>
          <TextInput
            value={handle}
            onChangeText={setHandle}
            placeholder="@username"
            placeholderTextColor={C.ink3}
            autoCapitalize="none"
            autoCorrect={false}
            style={styles.input}
          />
        </View>

        <Text style={styles.eyebrow}>Cuisine focus</Text>
        <View style={styles.chips}>
          {CUISINES.map((c) => (
            <Opt key={c} label={c} on={cuisine === c} onPress={() => setCuisine(c)} />
          ))}
        </View>

        <Text style={styles.eyebrow}>Spice level</Text>
        <View style={styles.chips}>
          {SPICES.map((s) => (
            <Opt key={s} label={s} on={spice === s} onPress={() => setSpice(s)} />
          ))}
        </View>

        <Text style={styles.eyebrow}>Avoid</Text>
        <View style={styles.chips}>
          {AVOIDS.map((a) => (
            <Opt key={a} label={a} on={avoid === a} onPress={() => setAvoid(a)} />
          ))}
        </View>
      </ScrollView>

      <View style={[styles.bottom, { paddingBottom: insets.bottom + 14 }]}>
        <Button label={busy ? 'Saving...' : 'Save changes'} Icon={busy ? undefined : Check} onPress={save} disabled={busy} large />
        {busy ? <ActivityIndicator color={C.terracotta} style={styles.saving} /> : null}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  avatarWrap: { alignItems: 'center', marginTop: 4 },
  avatar: { width: 84, height: 84, borderRadius: 42, overflow: 'hidden', alignItems: 'center', justifyContent: 'center', borderWidth: 3, borderColor: C.surface, ...SHADOW.card },
  avatarText: { fontFamily: F.heavy, fontSize: 30, color: C.white, letterSpacing: -0.5 },

  eyebrow: { fontFamily: F.sansBold, fontSize: 12, letterSpacing: 1.2, textTransform: 'uppercase', color: C.ink3, marginTop: 26, marginBottom: 12 },

  field: { backgroundColor: C.surface, borderRadius: R.md, paddingHorizontal: 16, paddingTop: 10, paddingBottom: 6, ...SHADOW.sm },
  fieldLabel: { fontFamily: F.sansSemi, fontSize: 12, color: C.ink3 },
  input: { fontFamily: F.sansMed, fontSize: 16, color: C.ink, paddingVertical: 6, marginTop: 1 },
  error: { fontFamily: F.sansSemi, fontSize: 12.5, color: C.danger, marginTop: 8 },

  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  chip: { paddingVertical: 11, paddingHorizontal: 16, borderRadius: R.pill, backgroundColor: C.surface, borderWidth: 1.5, borderColor: C.line2 },
  chipOn: { backgroundColor: C.saffronSoft, borderColor: C.green400 },
  chipTxt: { fontFamily: F.sansSemi, fontSize: 14, color: C.ink2 },
  chipTxtOn: { color: C.green800 },

  bottom: { paddingHorizontal: 22, paddingTop: 12, borderTopWidth: 1, borderTopColor: C.line, backgroundColor: C.bg },
  saving: { position: 'absolute', right: 36, top: 28 },
});
