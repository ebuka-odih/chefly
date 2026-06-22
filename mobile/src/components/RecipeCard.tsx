import { View, Text, Pressable, StyleSheet } from 'react-native';
import { Heart } from 'lucide-react-native';
import { C, F, R, SHADOW } from '@/theme/tokens';
import { DishImage } from './DishImage';
import { TimeBadge, DifficultyBadge } from './Badge';
import type { Recipe } from '@/data/mock';

type Props = {
  recipe: Recipe;
  saved?: boolean;
  onToggleSave?: (id: string) => void;
  onPress?: () => void;
  showRank?: boolean;
};

export function RecipeCard({ recipe, saved, onToggleSave, onPress, showRank }: Props) {
  return (
    <Pressable onPress={onPress} style={({ pressed }) => [styles.card, pressed && { transform: [{ scale: 0.99 }] }]}>
      <View>
        {showRank && recipe.rank ? (
          <View style={styles.rank}><Text style={styles.rankText}>{recipe.rank}</Text></View>
        ) : null}
        <DishImage category={recipe.category} height={138} plateRatio={0.5} emojiSize={54} />
      </View>
      <View style={styles.body}>
        <View style={styles.top}>
          <View style={{ flex: 1, paddingRight: 10 }}>
            <Text style={styles.name}>{recipe.name}</Text>
            <Text style={styles.why}>{recipe.tagline}</Text>
          </View>
          <Pressable
            onPress={() => onToggleSave?.(recipe.id)}
            hitSlop={8}
            style={[styles.heart, saved && styles.heartOn]}
          >
            <Heart size={17} color={saved ? C.white : C.ink3} fill={saved ? C.white : 'transparent'} />
          </Pressable>
        </View>
        <View style={styles.meta}>
          <TimeBadge minutes={recipe.time} />
          <DifficultyBadge level={recipe.difficulty} />
        </View>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: { backgroundColor: C.paper, borderWidth: 1, borderColor: C.line, borderRadius: R.md, overflow: 'hidden', ...SHADOW.sm },
  rank: { position: 'absolute', top: 12, left: 12, zIndex: 3, backgroundColor: 'rgba(28,24,19,0.8)', borderRadius: R.pill, paddingVertical: 5, paddingHorizontal: 11 },
  rankText: { color: C.white, fontFamily: F.sansSemi, fontSize: 11.5 },
  body: { padding: 15 },
  top: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' },
  name: { fontFamily: F.serif, fontSize: 18, color: C.ink },
  why: { fontFamily: F.sans, fontSize: 12.8, color: C.ink2, marginTop: 5, lineHeight: 18 },
  meta: { flexDirection: 'row', gap: 8, marginTop: 12 },
  heart: { width: 36, height: 36, borderRadius: 18, backgroundColor: C.cream, borderWidth: 1, borderColor: C.line2, alignItems: 'center', justifyContent: 'center' },
  heartOn: { backgroundColor: C.terracotta, borderColor: C.terracotta },
});
