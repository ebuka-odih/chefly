import { View, Text, StyleSheet, ScrollView, Pressable } from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { ChevronRight } from 'lucide-react-native';
import { C, F, R, T, SHADOW } from '@/theme/tokens';
import { HISTORY, getRecipe } from '@/data/mock';
import { DishImage } from '@/components/DishImage';

export default function History() {
  const router = useRouter();
  const insets = useSafeAreaInsets();

  return (
    <ScrollView
      contentContainerStyle={{ paddingTop: insets.top + 14, paddingHorizontal: 22, paddingBottom: insets.bottom + 110 }}
      showsVerticalScrollIndicator={false}
    >
      <Text style={T.eyebrow}>Your kitchen</Text>
      <Text style={[T.h1, { marginTop: 4 }]}>Cooking history</Text>
      <Text style={[T.small, { marginTop: 4 }]}>Everything you&apos;ve made with Chefly</Text>

      <View style={{ gap: 12, marginTop: 22 }}>
        {HISTORY.map((h) => {
          const recipe = getRecipe(h.recipeId);
          return (
            <Pressable key={h.id} style={styles.item} onPress={() => router.push({ pathname: '/recipe/[id]', params: { id: recipe.id } })}>
              <DishImage category={recipe.category} height={60} radius={14} plateRatio={0.6} emojiSize={22} style={{ width: 60 }} />
              <View style={{ flex: 1 }}>
                <Text style={styles.when}>{h.when}</Text>
                <Text style={styles.name}>{recipe.name}</Text>
                <Text style={styles.ing} numberOfLines={1}>{h.ingredients.join(' · ')}</Text>
              </View>
              <ChevronRight size={20} color={C.ink3} />
            </Pressable>
          );
        })}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  item: { flexDirection: 'row', alignItems: 'center', gap: 14, backgroundColor: C.paper, borderWidth: 1, borderColor: C.line, borderRadius: R.md, padding: 12, ...SHADOW.sm },
  when: { fontFamily: F.sansSemi, fontSize: 11.5, color: C.terracotta },
  name: { fontFamily: F.serif, fontSize: 16.5, color: C.ink, marginTop: 1 },
  ing: { fontFamily: F.sans, fontSize: 12.5, color: C.ink2, marginTop: 1 },
});
