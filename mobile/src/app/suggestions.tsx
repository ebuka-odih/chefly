import { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Pressable, ActivityIndicator } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { ArrowLeft } from 'lucide-react-native';
import { C, F, T, SHADOW, GRAD } from '@/theme/tokens';
import { RECIPES, SAVED_RECIPES } from '@/data/mock';
import { getDayContext } from '@/lib/time';
import { RecipeCard } from '@/components/RecipeCard';

export default function Suggestions() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const day = getDayContext();
  const { n } = useLocalSearchParams<{ n?: string }>();
  const count = Number(n ?? 0);
  const [loading, setLoading] = useState(true);
  const [saved, setSaved] = useState<string[]>(SAVED_RECIPES);

  useEffect(() => {
    const t = setTimeout(() => setLoading(false), 1400);
    return () => clearTimeout(t);
  }, []);

  const toggle = (id: string) =>
    setSaved((s) => (s.includes(id) ? s.filter((x) => x !== id) : [...s, id]));

  const results = RECIPES.slice(0, 4);
  const countLabel = count > 0 ? `${count} ingredients` : 'a surprise pick';

  if (loading) {
    return (
      <LinearGradient colors={GRAD.splash} style={styles.loading}>
        <Text style={{ fontSize: 56 }}>🍲</Text>
        <ActivityIndicator color={C.terracotta} size="large" style={{ marginTop: 14 }} />
        <Text style={styles.loadingT}>Cooking up ideas…</Text>
        <Text style={styles.loadingS}>Matching {countLabel} to {day.time}</Text>
      </LinearGradient>
    );
  }

  return (
    <ScrollView
      contentContainerStyle={{ paddingTop: insets.top + 8, paddingHorizontal: 22, paddingBottom: insets.bottom + 30 }}
      showsVerticalScrollIndicator={false}
    >
      <Pressable style={styles.back} onPress={() => router.back()}><ArrowLeft size={20} color={C.ink} /></Pressable>
      <Text style={[T.h1, { marginTop: 6 }]}>{results.length} meals for{'\n'}right now</Text>
      <Text style={[T.small, { marginTop: 6 }]}>{day.time} · from {countLabel}</Text>

      <View style={{ gap: 16, marginTop: 20 }}>
        {results.map((r, idx) => (
          <RecipeCard
            key={r.id}
            recipe={r}
            showRank={idx === 0}
            saved={saved.includes(r.id)}
            onToggleSave={toggle}
            onPress={() => router.push({ pathname: '/recipe/[id]', params: { id: r.id } })}
          />
        ))}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  back: { width: 42, height: 42, borderRadius: 21, backgroundColor: C.paper, borderWidth: 1, borderColor: C.line, alignItems: 'center', justifyContent: 'center', marginLeft: -4, ...SHADOW.sm },
  loading: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 40 },
  loadingT: { fontFamily: F.serif, fontSize: 22, color: C.ink, marginTop: 14 },
  loadingS: { fontFamily: F.sans, fontSize: 13.5, color: C.ink2, marginTop: 4 },
});
