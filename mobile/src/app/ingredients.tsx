import { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Pressable, TextInput } from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { ArrowLeft, Plus, X, ArrowRight } from 'lucide-react-native';
import { C, F, R, T, SHADOW, GRAD } from '@/theme/tokens';
import { LinearGradient } from 'expo-linear-gradient';
import { QUICK_INGREDIENTS } from '@/data/mock';
import { Chip } from '@/components/Chip';
import { Button } from '@/components/Button';

export default function Ingredients() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const [items, setItems] = useState<string[]>(['Tomatoes', 'Onions']);
  const [draft, setDraft] = useState('');

  const add = (value: string) => {
    const v = value.trim();
    if (v && !items.some((i) => i.toLowerCase() === v.toLowerCase())) setItems([...items, v]);
    setDraft('');
  };
  const remove = (item: string) => setItems(items.filter((i) => i !== item));
  const suggestions = QUICK_INGREDIENTS.filter((q) => !items.some((i) => i.toLowerCase() === q.toLowerCase()));

  return (
    <View style={{ flex: 1 }}>
      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{ paddingTop: insets.top + 8, paddingHorizontal: 22, paddingBottom: 140 }}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.bar}>
          <Pressable style={styles.iconBtn} onPress={() => router.back()}><ArrowLeft size={20} color={C.ink} /></Pressable>
          <Text style={T.h2}>Your ingredients</Text>
        </View>
        <Text style={[T.body, { marginTop: 4 }]}>Add everything you have on hand. We&apos;ll do the rest.</Text>

        <View style={styles.input}>
          <TextInput
            value={draft}
            onChangeText={setDraft}
            onSubmitEditing={() => add(draft)}
            placeholder="e.g. yam, ripe plantain, pepper…"
            placeholderTextColor={C.ink3}
            style={styles.textInput}
            returnKeyType="done"
          />
          <Pressable style={styles.addBtn} onPress={() => add(draft)}>
            <LinearGradient colors={GRAD.warm} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={StyleSheet.absoluteFill} />
            <Plus size={20} color={C.white} />
          </Pressable>
        </View>

        {items.length > 0 && (
          <View style={styles.pills}>
            {items.map((item) => (
              <View key={item} style={styles.pill}>
                <Text style={styles.pillText}>{item}</Text>
                <Pressable onPress={() => remove(item)} hitSlop={6} style={styles.pillX}><X size={14} color={C.white} /></Pressable>
              </View>
            ))}
          </View>
        )}

        <Text style={styles.suggestTitle}>Suggestions</Text>
        <View style={styles.chipRow}>
          {suggestions.map((s) => <Chip key={s} label={s} Icon={Plus} onPress={() => add(s)} />)}
        </View>
      </ScrollView>

      <View style={[styles.cta, { paddingBottom: insets.bottom + 18 }]}>
        <Button
          label={`Generate meal ideas (${items.length})`}
          IconRight={ArrowRight}
          large
          disabled={items.length === 0}
          onPress={() => router.push({ pathname: '/suggestions', params: { n: String(items.length) } })}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  bar: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  iconBtn: { width: 42, height: 42, borderRadius: 21, backgroundColor: C.paper, borderWidth: 1, borderColor: C.line, alignItems: 'center', justifyContent: 'center', marginLeft: -4, ...SHADOW.sm },
  input: { flexDirection: 'row', alignItems: 'center', gap: 10, backgroundColor: C.paper, borderWidth: 1, borderColor: C.line2, borderRadius: R.md, paddingLeft: 18, paddingRight: 6, paddingVertical: 6, marginTop: 18, ...SHADOW.sm },
  textInput: { flex: 1, fontFamily: F.sans, fontSize: 15.5, color: C.ink, paddingVertical: 11 },
  addBtn: { width: 46, height: 46, borderRadius: 14, overflow: 'hidden', alignItems: 'center', justifyContent: 'center', ...SHADOW.cta },
  pills: { flexDirection: 'row', flexWrap: 'wrap', gap: 9, marginTop: 18 },
  pill: { flexDirection: 'row', alignItems: 'center', gap: 8, backgroundColor: C.terracotta, borderRadius: R.pill, paddingLeft: 15, paddingRight: 9, paddingVertical: 9 },
  pillText: { fontFamily: F.sansMed, fontSize: 14, color: C.white },
  pillX: { width: 22, height: 22, borderRadius: 11, backgroundColor: 'rgba(255,255,255,0.22)', alignItems: 'center', justifyContent: 'center' },
  suggestTitle: { fontFamily: F.sansBold, fontSize: 13, letterSpacing: 0.6, textTransform: 'uppercase', color: C.ink3, marginTop: 28, marginBottom: 14 },
  chipRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  cta: { position: 'absolute', bottom: 0, left: 0, right: 0, paddingHorizontal: 22, paddingTop: 12, backgroundColor: C.cream },
});
