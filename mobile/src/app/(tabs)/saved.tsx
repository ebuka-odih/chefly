import { useState } from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { C, F, T } from '@/theme/tokens';
import { RECIPES, SAVED_RECIPES } from '@/data/mock';
import { RecipeCard } from '@/components/RecipeCard';
import { Button } from '@/components/Button';

export default function Saved() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const [saved, setSaved] = useState<string[]>(SAVED_RECIPES);

  const toggle = (id: string) =>
    setSaved((s) => (s.includes(id) ? s.filter((x) => x !== id) : [...s, id]));

  const list = RECIPES.filter((r) => saved.includes(r.id));

  return (
    <ScrollView
      contentContainerStyle={{ paddingTop: insets.top + 14, paddingHorizontal: 22, paddingBottom: insets.bottom + 110 }}
      showsVerticalScrollIndicator={false}
    >
      <Text style={T.eyebrow}>Your collection</Text>
      <Text style={[T.h1, { marginTop: 4 }]}>Saved recipes</Text>
      <Text style={[T.small, { marginTop: 4 }]}>{list.length} dishes ready when you are</Text>

      {list.length === 0 ? (
        <View style={styles.empty}>
          <Text style={{ fontSize: 52 }}>🔖</Text>
          <Text style={[T.h2, { marginTop: 14 }]}>Nothing saved yet</Text>
          <Text style={[T.body, { textAlign: 'center', marginTop: 6 }]}>Tap the heart on any recipe to keep it here.</Text>
          <Button label="Find a recipe" onPress={() => router.push('/(tabs)')} style={{ marginTop: 20, paddingHorizontal: 28 }} />
        </View>
      ) : (
        <View style={{ gap: 16, marginTop: 22 }}>
          {list.map((r) => (
            <RecipeCard key={r.id} recipe={r} saved onToggleSave={toggle} onPress={() => router.push({ pathname: '/recipe/[id]', params: { id: r.id } })} />
          ))}
        </View>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  empty: { alignItems: 'center', paddingVertical: 70, paddingHorizontal: 20 },
});
