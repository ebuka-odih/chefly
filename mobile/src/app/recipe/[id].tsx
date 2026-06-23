import { useEffect, useRef, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Pressable, useWindowDimensions, Animated, Easing } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Bookmark, Clock, Flame, ChefHat, ShoppingBasket, Check } from 'lucide-react-native';
import { C, F, R, SHADOW } from '@/theme/tokens';
import { getRecipe, nutritionFor, buildBreakdown, emojiFor, SAVED_RECIPES } from '@/data/mock';
import { AppHeader, IconBtn } from '@/components/AppHeader';
import { NutritionFlower } from '@/components/NutritionFlower';
import { MacroBadge } from '@/components/MacroBadge';

const TOTAL_WEIGHT = 350; // demo plate weight (g)

// staggered fade-up row (mirrors web .stagger)
function FadeUp({ delay = 0, children }: { delay?: number; children: React.ReactNode }) {
  const v = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    Animated.timing(v, { toValue: 1, duration: 420, delay, easing: Easing.out(Easing.cubic), useNativeDriver: true }).start();
  }, [v, delay]);
  return (
    <Animated.View style={{ opacity: v, transform: [{ translateY: v.interpolate({ inputRange: [0, 1], outputRange: [18, 0] }) }] }}>
      {children}
    </Animated.View>
  );
}

export default function RecipeDetail() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { width } = useWindowDimensions();
  const { id } = useLocalSearchParams<{ id: string }>();
  const recipe = getRecipe(id);
  const n = nutritionFor(recipe.id);
  const breakdown = buildBreakdown(recipe);
  const emoji = emojiFor(recipe);

  const [saved, setSaved] = useState(SAVED_RECIPES.includes(recipe.id));
  const grams = (pct: number) => Math.max(1, Math.round((pct / 100) * TOTAL_WEIGHT));
  const flowerSize = Math.min(width - 96, 290);

  return (
    <View style={{ flex: 1, backgroundColor: C.bg }}>
      <AppHeader
        variant="page"
        onBack={() => router.back()}
        right={
          <IconBtn onPress={() => setSaved((s) => !s)} style={saved ? styles.savedBtn : undefined}>
            <Bookmark size={19} color={saved ? C.white : C.ink} fill={saved ? C.white : 'none'} strokeWidth={2.2} />
          </IconBtn>
        }
      />

      <ScrollView style={{ flex: 1 }} showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: insets.bottom + 110 }}>
        {/* flower hero */}
        <View style={styles.flowerStage}>
          <NutritionFlower data={breakdown} center={emoji} size={flowerSize} />
        </View>

        <FadeUp delay={40}>
          <Text style={styles.title}>{recipe.name}</Text>
          <View style={styles.metaRow}>
            <View style={[styles.tag, styles.tagGreen]}><Flame size={13} color={C.green800} /><Text style={[styles.tagTxt, { color: C.green800 }]}>{n.calories} kcal</Text></View>
            <View style={styles.tag}><Clock size={13} color={C.ink2} /><Text style={styles.tagTxt}>{recipe.time} min</Text></View>
            <View style={styles.tag}><ChefHat size={13} color={C.ink2} /><Text style={styles.tagTxt}>{recipe.difficulty}</Text></View>
          </View>
        </FadeUp>

        {/* macro summary */}
        <FadeUp delay={100}>
          <View style={styles.macroRow}>
            <MacroBadge type="carbs" value={`${n.carbs}g`} />
            <MacroBadge type="fats" value={`${n.fats}g`} />
            <MacroBadge type="protein" value={`${n.protein}g`} />
          </View>
        </FadeUp>

        {/* ingredient breakdown */}
        <FadeUp delay={150}>
          <View style={styles.secHead}>
            <Text style={styles.secTitle}>Ingredients</Text>
            <Text style={styles.secMeta}>{TOTAL_WEIGHT} g</Text>
          </View>
        </FadeUp>
        <View style={{ gap: 10 }}>
          {breakdown.map((b, i) => (
            <FadeUp key={b.label} delay={190 + i * 45}>
              <View style={[styles.ingRow, SHADOW.sm]}>
                <View style={styles.ingThumb}>
                  <LinearGradient colors={['#DCEDC8', '#F1F7E8']} start={{ x: 0.5, y: 0 }} end={{ x: 0.5, y: 1 }} style={StyleSheet.absoluteFill} />
                  <Text style={{ fontSize: 24 }}>{b.emoji}</Text>
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.ingName}>{b.label}</Text>
                  <View style={styles.ingPills}>
                    <Pill color={C.carb} v={`${grams((b.percent * n.carbs) / 100)} g`} />
                    <Pill color={C.fat} v={`${grams((b.percent * n.fats) / 100)} g`} />
                    <Pill color={C.sugar} v={`${grams((b.percent * n.sugar) / 100)} g`} />
                  </View>
                </View>
                <Text style={styles.ingWeight}>{grams(b.percent)} g</Text>
              </View>
            </FadeUp>
          ))}
        </View>

        {/* shopping */}
        <FadeUp delay={230}>
          <View style={styles.secHead}>
            <Text style={styles.secTitle}>You&apos;ll also need</Text>
          </View>
          <View style={styles.chipsWrap}>
            {recipe.have.map((h) => (
              <View key={h.name} style={[styles.smChip, styles.smChipOn]}>
                <Check size={13} color={C.white} strokeWidth={3} />
                <Text style={[styles.smChipTxt, { color: C.white }]}>{h.name}</Text>
              </View>
            ))}
            {recipe.need.map((nn) => (
              <View key={nn.name} style={styles.smChip}>
                <ShoppingBasket size={13} color={C.ink2} />
                <Text style={styles.smChipTxt}>{nn.name}</Text>
              </View>
            ))}
          </View>
        </FadeUp>

        {/* steps */}
        <FadeUp delay={280}>
          <View style={styles.secHead}>
            <Text style={styles.secTitle}>Steps</Text>
            <Text style={styles.secMeta}>{recipe.steps.length} steps</Text>
          </View>
          <View style={{ gap: 12 }}>
            {recipe.steps.map((s, i) => (
              <View key={i} style={styles.step}>
                <View style={styles.stepNum}><Text style={styles.stepNumTxt}>{i + 1}</Text></View>
                <Text style={styles.stepText}>{s}</Text>
              </View>
            ))}
          </View>
        </FadeUp>
      </ScrollView>

      {/* sticky CTA */}
      <View style={[styles.ctaBar, { paddingBottom: insets.bottom + 12 }]}>
        <Pressable style={[styles.cta, SHADOW.cta]} onPress={() => router.push({ pathname: '/cooking/[id]', params: { id: recipe.id } })}>
          <LinearGradient colors={['#8BC34A', '#689F38']} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={StyleSheet.absoluteFill} />
          <ChefHat size={19} color={C.white} />
          <Text style={styles.ctaTxt}>Start cooking</Text>
        </Pressable>
      </View>
    </View>
  );
}

function Pill({ color, v }: { color: string; v: string }) {
  return (
    <View style={styles.pill}>
      <View style={[styles.pillDot, { backgroundColor: color }]} />
      <Text style={styles.pillTxt}>{v}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  savedBtn: { backgroundColor: C.green600 },
  flowerStage: { alignItems: 'center', paddingTop: 4, paddingBottom: 8 },
  title: { fontFamily: F.heavy, fontSize: 26, color: C.ink, textAlign: 'center', letterSpacing: -0.6, marginTop: 4 },
  metaRow: { flexDirection: 'row', justifyContent: 'center', flexWrap: 'wrap', gap: 8, marginTop: 12 },
  tag: { flexDirection: 'row', alignItems: 'center', gap: 5, paddingVertical: 6, paddingHorizontal: 12, borderRadius: R.pill, backgroundColor: C.surface2 },
  tagGreen: { backgroundColor: C.saffronSoft },
  tagTxt: { fontFamily: F.sansSemi, fontSize: 12.5, color: C.ink2 },
  macroRow: { flexDirection: 'row', gap: 12, marginTop: 22 },

  secHead: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: 26, marginBottom: 12 },
  secTitle: { fontFamily: F.sansBold, fontSize: 18, color: C.ink, letterSpacing: -0.3 },
  secMeta: { fontFamily: F.sansSemi, fontSize: 13, color: C.green700 },

  ingRow: { flexDirection: 'row', alignItems: 'center', gap: 14, padding: 12, backgroundColor: C.surface, borderRadius: R.md },
  ingThumb: { width: 48, height: 48, borderRadius: R.sm, alignItems: 'center', justifyContent: 'center', overflow: 'hidden' },
  ingName: { fontFamily: F.sansBold, fontSize: 15, color: C.ink },
  ingPills: { flexDirection: 'row', gap: 6, marginTop: 6 },
  ingWeight: { fontFamily: F.heavy, fontSize: 15, color: C.ink2 },
  pill: { flexDirection: 'row', alignItems: 'center', gap: 5, paddingVertical: 4, paddingHorizontal: 9, borderRadius: R.pill, backgroundColor: C.surface2 },
  pillDot: { width: 7, height: 7, borderRadius: 4 },
  pillTxt: { fontFamily: F.sansBold, fontSize: 11, color: C.ink2 },

  chipsWrap: { flexDirection: 'row', flexWrap: 'wrap', gap: 9 },
  smChip: { flexDirection: 'row', alignItems: 'center', gap: 6, paddingVertical: 8, paddingHorizontal: 13, borderRadius: R.pill, backgroundColor: C.surface, borderWidth: 1, borderColor: C.line },
  smChipOn: { backgroundColor: C.green600, borderColor: 'transparent' },
  smChipTxt: { fontFamily: F.sansSemi, fontSize: 13, color: C.ink2 },

  step: { flexDirection: 'row', gap: 14, alignItems: 'flex-start' },
  stepNum: { width: 28, height: 28, borderRadius: 14, backgroundColor: C.saffronSoft, alignItems: 'center', justifyContent: 'center' },
  stepNumTxt: { fontFamily: F.heavy, fontSize: 13, color: C.green700 },
  stepText: { flex: 1, fontFamily: F.sans, fontSize: 14.5, color: C.ink2, lineHeight: 22, paddingTop: 3 },

  ctaBar: { position: 'absolute', left: 0, right: 0, bottom: 0, paddingHorizontal: 20, paddingTop: 10, backgroundColor: C.bg, borderTopWidth: 1, borderTopColor: C.line },
  cta: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 9, height: 56, borderRadius: R.md, overflow: 'hidden' },
  ctaTxt: { fontFamily: F.sansBold, fontSize: 16, color: C.white },
});
