import { useEffect, useState } from 'react';
import { ActivityIndicator, View, Text, StyleSheet, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { C, F, T } from '@/theme/tokens';
import { RECIPES, SAVED_RECIPES, type Recipe } from '@/data/mock';
import { RecipeCard } from '@/components/RecipeCard';
import { Button } from '@/components/Button';
import { deleteSavedRecipe, getSavedRecipes, saveRecipe } from '@/lib/recipesApi';

export default function Saved() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const [saved, setSaved] = useState<string[]>(SAVED_RECIPES);
  const [list, setList] = useState<Recipe[]>(RECIPES.filter((r) => SAVED_RECIPES.includes(r.id)));
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    getSavedRecipes()
      .then((recipes) => {
        if (!cancelled && recipes.length) {
          setList(recipes);
          setSaved(recipes.map((recipe) => recipe.id));
        }
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const toggle = async (id: string) => {
    const recipe = list.find((item) => item.id === id);
    const wasSaved = saved.includes(id);
    setSaved((s) => (wasSaved ? s.filter((x) => x !== id) : [...s, id]));
    if (wasSaved) setList((items) => items.filter((item) => item.id !== id));
    try {
      if (wasSaved) await deleteSavedRecipe(id);
      else if (recipe) await saveRecipe(recipe);
    } catch {
      if (recipe) setList((items) => (items.some((item) => item.id === recipe.id) ? items : [recipe, ...items]));
      setSaved((s) => (wasSaved ? [...s, id] : s.filter((x) => x !== id)));
    }
  };

  return (
    <ScrollView
      contentContainerStyle={{ paddingTop: insets.top + 14, paddingHorizontal: 22, paddingBottom: insets.bottom + 28 }}
      showsVerticalScrollIndicator={false}
    >
      <Text style={T.eyebrow}>Your collection</Text>
      <Text style={[T.h1, { marginTop: 4 }]}>Saved recipes</Text>
      <Text style={[T.small, { marginTop: 4 }]}>{list.length} dishes ready when you are</Text>

      {loading ? (
        <View style={styles.empty}>
          <ActivityIndicator color={C.terracotta} size="large" />
        </View>
      ) : list.length === 0 ? (
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
