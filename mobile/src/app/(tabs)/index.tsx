import { useEffect, useRef, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Pressable, Modal, Animated, Easing } from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Pencil, Sparkles, Bell, ChevronRight, X, Clock, Flame, Star, Heart, Sun, Sunrise, Moon, ArrowRight } from 'lucide-react-native';
import { C, F, R, SHADOW } from '@/theme/tokens';
import { getRecipe, LAST_SCAN_ID, RECOMMENDED, nutritionFor, emojiFor, ratingFor } from '@/data/mock';
import { getDayContext } from '@/lib/time';
import { AppHeader, IconBtn } from '@/components/AppHeader';
import { DishImage } from '@/components/DishImage';
import { MacroBadge } from '@/components/MacroBadge';

const MEAL_TYPES = ['Breakfast', 'Lunch', 'Dinner', 'Snack'];
const FOOD_TYPES = ['Rice', 'Soup', 'Pasta', 'Salad', 'Grilled', 'Fried'];

// Which recipe to surface for the current meal moment.
const SUGGEST_BY_MEAL: Record<string, string> = {
  Breakfast: 'shakshuka', Lunch: 'yam-porridge', Snack: 'garden-salad', Dinner: 'jollof-rice',
};
const periodIcon = (period: string, night: boolean) => (night ? Moon : period === 'morning' ? Sunrise : Sun);
const cap = (s: string) => s.charAt(0).toUpperCase() + s.slice(1);

// Fade-up entrance helper (mirrors the web .stagger / .fade-in-up).
function FadeUp({ delay = 0, children, style }: { delay?: number; children: React.ReactNode; style?: any }) {
  const v = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    Animated.timing(v, { toValue: 1, duration: 480, delay, easing: Easing.out(Easing.cubic), useNativeDriver: true }).start();
  }, [v, delay]);
  return (
    <Animated.View style={[{ opacity: v, transform: [{ translateY: v.interpolate({ inputRange: [0, 1], outputRange: [16, 0] }) }] }, style]}>
      {children}
    </Animated.View>
  );
}

export default function Home() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const [showSurprise, setShowSurprise] = useState(false);
  const [mealType, setMealType] = useState('Lunch');
  const [foodType, setFoodType] = useState('Rice');
  const [savedIds, setSavedIds] = useState<Set<string>>(new Set());
  const toggleSave = (id: string) =>
    setSavedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });

  // live-ish clock so the greeting + suggestion track the time of day
  const [now, setNow] = useState(() => new Date());
  useEffect(() => {
    const t = setInterval(() => setNow(new Date()), 60000);
    return () => clearInterval(t);
  }, []);
  const ctx = getDayContext(now);
  const TimeIcon = periodIcon(ctx.period, ctx.night);
  const suggestion = getRecipe(SUGGEST_BY_MEAL[ctx.meal] ?? 'jollof-rice');
  const suggestionN = nutritionFor(suggestion.id);

  const hero = getRecipe(LAST_SCAN_ID);
  const heroN = nutritionFor(hero.id);
  const rail = RECOMMENDED.map((id) => getRecipe(id));

  const generate = () => {
    setShowSurprise(false);
    router.push({ pathname: '/suggestions', params: { n: '0' } });
  };

  return (
    <View style={{ flex: 1, backgroundColor: C.bg }}>
      <ScrollView
        style={{ flex: 1 }}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: insets.bottom + 28 }}
      >
        {/* header scrolls with the page (breaks out of the 20px gutter) */}
        <View style={{ marginHorizontal: -20 }}>
          <AppHeader
            variant="home"
            greeting={`${ctx.greeting}, Chef`}
            title={ctx.meal === 'Snack' ? 'Fancy a snack?' : `What's for ${ctx.meal.toLowerCase()}?`}
            left={
              <IconBtn dot>
                <Bell size={20} color={C.ink} strokeWidth={2.2} />
              </IconBtn>
            }
            right={
              <Pressable onPress={() => router.push('/(tabs)/profile')} style={styles.avatar}>
                <Text style={styles.avatarTxt}>C</Text>
              </Pressable>
            }
          />
        </View>

        {/* time-aware suggestion — what to cook right now */}
        <FadeUp delay={40}>
          <Pressable
            style={({ pressed }) => [styles.nowCard, SHADOW.card, pressed && { transform: [{ scale: 0.99 }] }]}
            onPress={() => router.push({ pathname: '/recipe/[id]', params: { id: suggestion.id } })}
          >
            <LinearGradient colors={['#EAF3DE', '#F1F7E8']} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={StyleSheet.absoluteFill} />
            <View style={styles.nowTop}>
              <View style={styles.nowTime}>
                <TimeIcon size={14} color={C.green700} strokeWidth={2.4} />
                <Text style={styles.nowTimeTxt}>{cap(ctx.period)} · {ctx.time}</Text>
              </View>
              <Text style={styles.nowKicker}>Picked for you</Text>
            </View>
            <View style={styles.nowBody}>
              <View style={styles.nowThumb}>
                <DishImage category={suggestion.category} height={62} radius={0} emojiSize={34} />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.nowEyebrow}>{ctx.meal} idea</Text>
                <Text style={styles.nowName} numberOfLines={1}>{suggestion.name}</Text>
                <Text style={styles.nowMeta}>{suggestionN.calories} kcal · {suggestion.time} min</Text>
              </View>
              <View style={styles.nowGo}>
                <ArrowRight size={18} color={C.white} strokeWidth={2.5} />
              </View>
            </View>
          </Pressable>
        </FadeUp>

        {/* start your own way */}
        <FadeUp delay={90}>
          <Text style={styles.startLabel}>Or start your own</Text>
          <View style={styles.actions}>
            <Pressable style={({ pressed }) => [styles.actionBtn, styles.actionType, pressed && styles.actionPressed]} onPress={() => router.push('/ingredients')}>
              <Pencil size={18} color={C.white} strokeWidth={2.4} />
              <Text style={styles.actionTxt}>Type ingredients</Text>
            </Pressable>

            <Pressable style={({ pressed }) => [styles.actionBtn, styles.actionSurprise, pressed && styles.actionPressed]} onPress={() => setShowSurprise(true)}>
              <Sparkles size={18} color={C.white} strokeWidth={2.4} />
              <Text style={styles.actionTxt}>Surprise me</Text>
            </Pressable>
          </View>
        </FadeUp>

        {/* last scan */}
        <FadeUp delay={140}>
          <View style={styles.secHead}>
            <Text style={styles.secTitle}>Last scan</Text>
            <Pressable onPress={() => router.push('/(tabs)/history')} hitSlop={8}><Text style={styles.seeAll}>See all</Text></Pressable>
          </View>
        </FadeUp>
        <FadeUp delay={175}>
          <Pressable style={[styles.card, SHADOW.card]} onPress={() => router.push({ pathname: '/recipe/[id]', params: { id: hero.id } })}>
            <View style={styles.lsTop}>
              <View style={styles.lsThumb}>
                <LinearGradient colors={['#DCEDC8', '#F1F7E8']} start={{ x: 0.5, y: 0 }} end={{ x: 0.5, y: 1 }} style={StyleSheet.absoluteFill} />
                <Text style={{ fontSize: 28 }}>{emojiFor(hero)}</Text>
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.lsName}>{hero.name}</Text>
                <Text style={styles.lsMeta}>{heroN.calories} kcal · {hero.time} min</Text>
              </View>
              <ChevronRight size={20} color={C.ink3} />
            </View>
            <View style={styles.macroRow}>
              <MacroBadge type="carbs" value={`${heroN.carbs}%`} />
              <MacroBadge type="fats" value={`${heroN.fats}%`} />
              <MacroBadge type="sugar" value={`${heroN.sugar}%`} />
            </View>
          </Pressable>
        </FadeUp>

        {/* recommended */}
        <FadeUp delay={215}>
          <View style={styles.secHead}>
            <Text style={styles.secTitle}>Recommended</Text>
            <Pressable onPress={() => router.push('/(tabs)/saved')} hitSlop={8}><Text style={styles.seeAll}>See all</Text></Pressable>
          </View>
        </FadeUp>
        <FadeUp delay={245}>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={{ gap: 14, paddingRight: 20, paddingVertical: 4 }}
          style={{ marginHorizontal: -20, paddingHorizontal: 20 }}
        >
          {rail.map((r) => {
            const n = nutritionFor(r.id);
            const isSaved = savedIds.has(r.id);
            return (
              <Pressable
                key={r.id}
                style={({ pressed }) => [styles.railCard, SHADOW.card, pressed && { transform: [{ scale: 0.98 }] }]}
                onPress={() => router.push({ pathname: '/recipe/[id]', params: { id: r.id } })}
              >
                <View style={styles.railCover}>
                  <DishImage category={r.category} height={150} radius={0} emojiSize={64} />
                  <View style={styles.ratingChip}>
                    <Star size={12} color="#F6B73C" fill="#F6B73C" strokeWidth={0} />
                    <Text style={styles.ratingTxt}>{ratingFor(r.id).toFixed(1)}</Text>
                  </View>
                  <Pressable
                    onPress={() => toggleSave(r.id)}
                    hitSlop={8}
                    style={[styles.railHeart, isSaved && styles.railHeartOn]}
                    accessibilityRole="button"
                    accessibilityLabel={isSaved ? 'Remove from saved' : 'Save recipe'}
                  >
                    <Heart size={15} color={isSaved ? C.white : C.ink} fill={isSaved ? C.white : 'transparent'} strokeWidth={2.2} />
                  </Pressable>
                </View>
                <View style={styles.railBody}>
                  <Text style={styles.railName} numberOfLines={1}>{r.name}</Text>
                  <View style={styles.railMetaRow}>
                    <Clock size={13} color={C.ink3} strokeWidth={2.2} />
                    <Text style={styles.railMeta}>{r.time} min</Text>
                    <View style={styles.metaDot} />
                    <Flame size={13} color={C.ink3} strokeWidth={2.2} />
                    <Text style={styles.railMeta}>{r.difficulty}</Text>
                  </View>
                  <View style={styles.miniMacros}>
                    <Mini color={C.carb} v={`${n.carbs}%`} />
                    <Mini color={C.fat} v={`${n.fats}%`} />
                    <Mini color={C.sugar} v={`${n.sugar}%`} />
                  </View>
                </View>
              </Pressable>
            );
          })}
        </ScrollView>
        </FadeUp>
      </ScrollView>

      {/* Surprise sheet */}
      <Modal visible={showSurprise} animationType="slide" transparent onRequestClose={() => setShowSurprise(false)}>
        <Pressable style={styles.backdrop} onPress={() => setShowSurprise(false)}>
          <Pressable style={[styles.sheet, { paddingBottom: insets.bottom + 22 }]} onPress={(e) => e.stopPropagation()}>
            <View style={styles.handle} />
            <View style={styles.sheetHead}>
              <Text style={styles.sheetTitle}>Surprise me ✨</Text>
              <IconBtn onPress={() => setShowSurprise(false)} style={styles.smBtn}>
                <X size={18} color={C.ink2} />
              </IconBtn>
            </View>
            <Text style={styles.sheetSub}>Tell Chefly what you&apos;re in the mood for.</Text>

            <Text style={styles.eyebrow}>Meal time</Text>
            <View style={styles.optGrid}>
              {MEAL_TYPES.map((t) => (
                <OptionChip key={t} label={t} on={mealType === t} onPress={() => setMealType(t)} />
              ))}
            </View>

            <Text style={[styles.eyebrow, { marginTop: 20 }]}>Food type</Text>
            <View style={styles.optGrid}>
              {FOOD_TYPES.map((c) => (
                <OptionChip key={c} label={c} on={foodType === c} onPress={() => setFoodType(c)} />
              ))}
            </View>

            <Pressable style={[styles.cta, SHADOW.cta]} onPress={generate}>
              <LinearGradient colors={['#8BC34A', '#689F38']} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={StyleSheet.absoluteFill} />
              <Sparkles size={19} color={C.white} />
              <Text style={styles.ctaTxt}>Generate recipe</Text>
            </Pressable>
          </Pressable>
        </Pressable>
      </Modal>
    </View>
  );
}

function Mini({ color, v }: { color: string; v: string }) {
  return (
    <View style={styles.mini}>
      <View style={[styles.miniDot, { backgroundColor: color }]} />
      <Text style={styles.miniTxt}>{v}</Text>
    </View>
  );
}

function OptionChip({ label, on, onPress }: { label: string; on: boolean; onPress: () => void }) {
  return (
    <Pressable onPress={onPress} style={[styles.optChip, on && styles.optChipOn]}>
      <Text style={[styles.optChipTxt, on && styles.optChipTxtOn]}>{label}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  avatar: { width: 46, height: 46, borderRadius: R.pill, alignItems: 'center', justifyContent: 'center', backgroundColor: C.green700, borderWidth: 2, borderColor: C.surface, ...SHADOW.sm },
  avatarTxt: { fontFamily: F.heavy, fontSize: 16, color: C.white },

  // time-aware "what to cook now" card
  nowCard: { borderRadius: R.lg, overflow: 'hidden', padding: 16, marginTop: 10, borderWidth: 1, borderColor: C.line },
  nowTop: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  nowTime: { flexDirection: 'row', alignItems: 'center', gap: 6, backgroundColor: 'rgba(255,255,255,0.72)', borderRadius: R.pill, paddingVertical: 5, paddingHorizontal: 11 },
  nowTimeTxt: { fontFamily: F.sansBold, fontSize: 12, color: C.green800, letterSpacing: -0.1 },
  nowKicker: { fontFamily: F.sansSemi, fontSize: 12, color: C.green700 },
  nowBody: { flexDirection: 'row', alignItems: 'center', gap: 14, marginTop: 14 },
  nowThumb: { width: 62, height: 62, borderRadius: R.md, overflow: 'hidden' },
  nowEyebrow: { fontFamily: F.sansBold, fontSize: 11, letterSpacing: 0.5, textTransform: 'uppercase', color: C.green700 },
  nowName: { fontFamily: F.heavy, fontSize: 18, color: C.ink, letterSpacing: -0.4, marginTop: 3 },
  nowMeta: { fontFamily: F.sansMed, fontSize: 12.5, color: C.ink2, marginTop: 3 },
  nowGo: { width: 40, height: 40, borderRadius: 20, backgroundColor: C.green700, alignItems: 'center', justifyContent: 'center', ...SHADOW.sm },

  startLabel: { fontFamily: F.sansSemi, fontSize: 13, color: C.ink3, marginTop: 22, marginBottom: 10 },
  actions: { flexDirection: 'row', gap: 12 },
  actionBtn: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, height: 54, borderRadius: R.md, paddingHorizontal: 6 },
  actionType: { backgroundColor: C.green700 },
  actionSurprise: { backgroundColor: C.forest },
  actionTxt: { fontFamily: F.sansBold, fontSize: 14.5, color: C.white, letterSpacing: -0.2 },
  actionPressed: { opacity: 0.92, transform: [{ scale: 0.98 }] },

  secHead: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: 26, marginBottom: 12 },
  secTitle: { fontFamily: F.sansBold, fontSize: 18, color: C.ink, letterSpacing: -0.3 },
  seeAll: { fontFamily: F.sansSemi, fontSize: 13, color: C.green700 },

  card: { backgroundColor: C.surface, borderRadius: R.lg, padding: 16 },
  lsTop: { flexDirection: 'row', alignItems: 'center', gap: 14, marginBottom: 14 },
  lsThumb: { width: 56, height: 56, borderRadius: R.sm, alignItems: 'center', justifyContent: 'center', overflow: 'hidden' },
  lsName: { fontFamily: F.sansBold, fontSize: 16, color: C.ink },
  lsMeta: { fontFamily: F.sansMed, fontSize: 12.5, color: C.ink3, marginTop: 3 },
  macroRow: { flexDirection: 'row', gap: 10 },

  railCard: { width: 236, backgroundColor: C.surface, borderRadius: R.lg, overflow: 'hidden', borderWidth: 1, borderColor: C.line },
  railCover: { position: 'relative' },
  ratingChip: { position: 'absolute', top: 10, left: 10, flexDirection: 'row', alignItems: 'center', gap: 4, backgroundColor: 'rgba(255,255,255,0.94)', borderRadius: R.pill, paddingVertical: 4, paddingHorizontal: 9, ...SHADOW.sm },
  ratingTxt: { fontFamily: F.sansBold, fontSize: 12, color: C.ink, letterSpacing: -0.2 },
  railHeart: { position: 'absolute', top: 10, right: 10, width: 32, height: 32, borderRadius: 16, backgroundColor: 'rgba(255,255,255,0.94)', alignItems: 'center', justifyContent: 'center', ...SHADOW.sm },
  railHeartOn: { backgroundColor: C.green700 },
  railBody: { padding: 14 },
  railName: { fontFamily: F.sansBold, fontSize: 16, color: C.ink, letterSpacing: -0.2 },
  railMetaRow: { flexDirection: 'row', alignItems: 'center', gap: 5, marginTop: 7 },
  railMeta: { fontFamily: F.sansMed, fontSize: 12.5, color: C.ink3 },
  metaDot: { width: 3, height: 3, borderRadius: 2, backgroundColor: C.ink3, marginHorizontal: 3, opacity: 0.6 },
  miniMacros: { flexDirection: 'row', gap: 12, marginTop: 12 },
  mini: { flexDirection: 'row', alignItems: 'center', gap: 5 },
  miniDot: { width: 7, height: 7, borderRadius: 4 },
  miniTxt: { fontFamily: F.sansBold, fontSize: 11.5, color: C.ink2 },

  backdrop: { flex: 1, backgroundColor: 'rgba(31,49,16,0.42)', justifyContent: 'flex-end' },
  sheet: { backgroundColor: C.surface, borderTopLeftRadius: R.xl, borderTopRightRadius: R.xl, paddingHorizontal: 22, paddingTop: 12 },
  handle: { width: 42, height: 5, borderRadius: 3, backgroundColor: C.surface3, alignSelf: 'center', marginBottom: 16 },
  sheetHead: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  sheetTitle: { fontFamily: F.heavy, fontSize: 22, color: C.ink, letterSpacing: -0.4 },
  smBtn: { width: 40, height: 40 },
  sheetSub: { fontFamily: F.sans, fontSize: 14, color: C.ink2, marginTop: 4, marginBottom: 20 },
  eyebrow: { fontFamily: F.sansBold, fontSize: 12, letterSpacing: 1.4, color: C.ink3, textTransform: 'uppercase', marginBottom: 10 },
  optGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  optChip: { paddingVertical: 11, paddingHorizontal: 18, borderRadius: R.sm, backgroundColor: C.surface2, borderWidth: 1.5, borderColor: 'transparent' },
  optChipOn: { backgroundColor: C.saffronSoft, borderColor: C.green400 },
  optChipTxt: { fontFamily: F.sansSemi, fontSize: 14, color: C.ink2 },
  optChipTxtOn: { color: C.green800 },
  cta: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 9, height: 56, borderRadius: R.md, overflow: 'hidden', marginTop: 26 },
  ctaTxt: { fontFamily: F.sansBold, fontSize: 16, color: C.white },
});
