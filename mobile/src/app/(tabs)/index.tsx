import { useEffect, useRef, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Pressable, Modal, Animated, Easing } from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Search, SlidersHorizontal, Pencil, Sparkles, Bell, ChevronRight, X, Clock, Flame } from 'lucide-react-native';
import { C, F, R, SHADOW } from '@/theme/tokens';
import { RECIPES, getRecipe, LAST_SCAN_ID, RECOMMENDED, nutritionFor, emojiFor } from '@/data/mock';
import { AppHeader, IconBtn } from '@/components/AppHeader';
import { DishImage } from '@/components/DishImage';
import { MacroBadge } from '@/components/MacroBadge';

const MEAL_TYPES = ['Breakfast', 'Lunch', 'Dinner', 'Snack'];
const FOOD_TYPES = ['Rice', 'Soup', 'Pasta', 'Salad', 'Grilled', 'Fried'];

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

  const hero = getRecipe(LAST_SCAN_ID);
  const heroN = nutritionFor(hero.id);
  const rail = RECOMMENDED.map((id) => getRecipe(id));

  const generate = () => {
    setShowSurprise(false);
    router.push({ pathname: '/suggestions', params: { n: '0' } });
  };

  return (
    <View style={{ flex: 1, backgroundColor: C.bg }}>
      <AppHeader
        variant="home"
        greeting="Hello, Chef 👋"
        title="Let's cook something"
        accent="good"
        right={
          <>
            <IconBtn dot>
              <Bell size={20} color={C.ink} strokeWidth={2.2} />
            </IconBtn>
            <View style={styles.avatar}>
              <Text style={styles.avatarTxt}>C</Text>
            </View>
          </>
        }
      />

      <ScrollView
        style={{ flex: 1 }}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingHorizontal: 20, paddingTop: 8, paddingBottom: insets.bottom + 140 }}
      >
        {/* search */}
        <View style={styles.searchRow}>
          <Pressable style={styles.searchBar} onPress={() => router.push('/ingredients')}>
            <Search size={18} color={C.ink3} strokeWidth={2.2} />
            <Text style={styles.searchPh}>Search recipes…</Text>
          </Pressable>
          <IconBtn onPress={() => setShowSurprise(true)} style={styles.sqBtn}>
            <SlidersHorizontal size={19} color={C.ink} strokeWidth={2.2} />
          </IconBtn>
        </View>

        {/* action tiles */}
        <FadeUp delay={60}>
          <View style={styles.tiles}>
            <Pressable style={[styles.tile, SHADOW.sm]} onPress={() => router.push('/ingredients')}>
              <LinearGradient colors={['#8BC34A', '#689F38']} start={{ x: 0.1, y: 0 }} end={{ x: 0.9, y: 1 }} style={StyleSheet.absoluteFill} />
              <View style={styles.tileIcoLight}>
                <Pencil size={22} color={C.white} strokeWidth={2.2} />
              </View>
              <View>
                <Text style={styles.tileTitleLight}>Type</Text>
                <Text style={styles.tileSubLight}>Enter ingredients</Text>
              </View>
            </Pressable>

            <Pressable style={[styles.tile, styles.tileDark, SHADOW.sm]} onPress={() => setShowSurprise(true)}>
              <View style={styles.tileIcoLight}>
                <Sparkles size={22} color={C.white} strokeWidth={2.2} />
              </View>
              <View>
                <Text style={styles.tileTitleLight}>Surprise</Text>
                <Text style={styles.tileSubLight}>Random idea</Text>
              </View>
            </Pressable>
          </View>
        </FadeUp>

        {/* last scan */}
        <View style={styles.secHead}>
          <Text style={styles.secTitle}>Last scan</Text>
          <Pressable onPress={() => router.push('/(tabs)/history')} hitSlop={8}><Text style={styles.seeAll}>See all</Text></Pressable>
        </View>
        <FadeUp delay={120}>
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
        <View style={styles.secHead}>
          <Text style={styles.secTitle}>Recommended</Text>
          <Pressable onPress={() => router.push('/(tabs)/saved')} hitSlop={8}><Text style={styles.seeAll}>See all</Text></Pressable>
        </View>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={{ gap: 14, paddingRight: 20, paddingVertical: 4 }}
          style={{ marginHorizontal: -20, paddingHorizontal: 20 }}
        >
          {rail.map((r) => {
            const n = nutritionFor(r.id);
            return (
              <Pressable key={r.id} style={[styles.railCard, SHADOW.card]} onPress={() => router.push({ pathname: '/recipe/[id]', params: { id: r.id } })}>
                <DishImage category={r.category} height={148} radius={0} emojiSize={62} />
                <View style={styles.railBody}>
                  <Text style={styles.railName} numberOfLines={1}>{r.name}</Text>
                  <View style={styles.railMetaRow}>
                    <Clock size={13} color={C.ink3} />
                    <Text style={styles.railMeta}>{r.time} min</Text>
                    <Flame size={13} color={C.ink3} style={{ marginLeft: 8 }} />
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

  searchRow: { flexDirection: 'row', alignItems: 'center', gap: 12, marginTop: 8 },
  searchBar: { flex: 1, flexDirection: 'row', alignItems: 'center', gap: 10, height: 50, borderRadius: R.pill, backgroundColor: C.surface, paddingHorizontal: 18, ...SHADOW.sm },
  searchPh: { fontFamily: F.sans, fontSize: 15, color: C.ink3 },
  sqBtn: { borderRadius: R.sm, width: 50, height: 50 },

  tiles: { flexDirection: 'row', gap: 14, marginTop: 18 },
  tile: { flex: 1, minHeight: 116, borderRadius: R.lg, padding: 18, justifyContent: 'space-between', overflow: 'hidden', backgroundColor: C.surface },
  tileDark: { backgroundColor: C.ink },
  tileIcoLight: { width: 44, height: 44, borderRadius: R.sm, backgroundColor: 'rgba(255,255,255,0.2)', alignItems: 'center', justifyContent: 'center' },
  tileTitleLight: { fontFamily: F.sansBold, fontSize: 17, color: C.white, letterSpacing: -0.2 },
  tileSubLight: { fontFamily: F.sans, fontSize: 12.5, color: 'rgba(255,255,255,0.82)', marginTop: 2 },

  secHead: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: 26, marginBottom: 12 },
  secTitle: { fontFamily: F.sansBold, fontSize: 18, color: C.ink, letterSpacing: -0.3 },
  seeAll: { fontFamily: F.sansSemi, fontSize: 13, color: C.green700 },

  card: { backgroundColor: C.surface, borderRadius: R.lg, padding: 16 },
  lsTop: { flexDirection: 'row', alignItems: 'center', gap: 14, marginBottom: 14 },
  lsThumb: { width: 56, height: 56, borderRadius: R.sm, alignItems: 'center', justifyContent: 'center', overflow: 'hidden' },
  lsName: { fontFamily: F.sansBold, fontSize: 16, color: C.ink },
  lsMeta: { fontFamily: F.sansMed, fontSize: 12.5, color: C.ink3, marginTop: 3 },
  macroRow: { flexDirection: 'row', gap: 12 },

  railCard: { width: 240, backgroundColor: C.surface, borderRadius: R.lg, overflow: 'hidden' },
  railBody: { padding: 14 },
  railName: { fontFamily: F.sansBold, fontSize: 16, color: C.ink },
  railMetaRow: { flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 6 },
  railMeta: { fontFamily: F.sansMed, fontSize: 12.5, color: C.ink3 },
  miniMacros: { flexDirection: 'row', gap: 12, marginTop: 11 },
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
