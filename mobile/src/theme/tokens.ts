import { StyleSheet } from 'react-native';

// ============================================================
// CHEFLY — Fresh Garden design system (ported from the green web design)
// Leaf green · greige surfaces · warm near-black text. Inter throughout.
// Mirrors frontend/src/constants/theme.js + index.css.
// Legacy token keys (cream/terracotta/saffron/serif…) are kept and remapped
// to green values/Inter so every screen renders on-brand during the port.
// ============================================================
export const C = {
  // —— Brand greens ——
  green: '#8BC34A', // 500 — primary accent
  green400: '#9CCC65',
  green600: '#7CB342',
  green700: '#689F38',
  green800: '#558B2F',
  green900: '#33691E',
  forest: '#2F4715',
  forestDeep: '#1F3110',

  // —— Surfaces (warm greige / near-white) ——
  bg: '#F4F3EE', // app background
  surface: '#FBFAF6', // cards
  surface2: '#F3F1EA', // recessed / input
  surface3: '#ECEAE1',

  // —— Text (warm near-black) ——
  ink: '#20251C',
  ink2: '#5C6157',
  ink3: '#969A8E',

  // —— Macro / status ——
  carb: '#7CB342',
  fat: '#FFA726',
  sugar: '#EF5350',
  protein: '#42A5F5',
  success: '#66BB6A',
  danger: '#EF5350',

  line: 'rgba(47,71,21,0.10)',
  line2: 'rgba(47,71,21,0.16)',
  white: '#FFFFFF',

  // —— Legacy aliases (kept so existing screens keep compiling on-brand) ——
  cream: '#F4F3EE', // app bg
  cream2: '#F3F1EA', // recessed
  paper: '#FBFAF6', // cards / inputs
  saffron: '#8BC34A', // bright accent → leaf
  saffronSoft: '#F1F7E8', // selected/tinted → green-50
  terracotta: '#7CB342', // PRIMARY accent → green-600
  terracottaDeep: '#33691E', // pressed/strong → green-900
  sage: '#66BB6A', // success / check
  sageDeep: '#33691E',
  sageSoft: '#DCEDC8',
  gold: '#C29A4A', // subtle premium accent
  char: '#20251C', // dark pills / buttons (near-black)
  char2: '#2F4715', // forest
};

export const GRAD = {
  warm: ['#8BC34A', '#689F38'] as const, // primary CTA / brand mark: green-500 → green-700
  green: ['#9CCC65', '#558B2F'] as const, // leaf → forest hero
  splash: ['#F1F7E8', '#F4F3EE'] as const, // light green-tinted splash backdrop
  forest: ['#6D9233', '#2F4715'] as const, // marketing/forest backdrop
  cooking: ['#2F4715', '#1F3110'] as const, // deep forest (cooking / camera chrome)
};

export const R = { xl: 34, lg: 28, md: 22, sm: 16, xs: 12, pill: 999 };

// Font family names — must match the keys registered in app/_layout.tsx useFonts()
// Green design is Inter-only; header weight 800.
export const F = {
  // headers (Inter heavy, matches green design)
  display: 'Inter_800ExtraBold',
  heavy: 'Inter_800ExtraBold',
  sans: 'Inter_400Regular',
  sansMed: 'Inter_500Medium',
  sansSemi: 'Inter_600SemiBold',
  sansBold: 'Inter_700Bold',
  sansBlack: 'Inter_800ExtraBold',
  // legacy serif keys remapped to Inter so old refs render on-brand
  serif: 'Inter_700Bold',
  serifReg: 'Inter_400Regular',
  serifBold: 'Inter_800ExtraBold',
  serifItalic: 'Inter_600SemiBold',
};

export const SHADOW = {
  sm: {
    shadowColor: '#1F3110',
    shadowOpacity: 0.08,
    shadowRadius: 14,
    shadowOffset: { width: 0, height: 6 },
    elevation: 3,
  },
  card: {
    shadowColor: '#1F3110',
    shadowOpacity: 0.1,
    shadowRadius: 26,
    shadowOffset: { width: 0, height: 12 },
    elevation: 5,
  },
  cta: {
    shadowColor: '#7CB342',
    shadowOpacity: 0.42,
    shadowRadius: 22,
    shadowOffset: { width: 0, height: 12 },
    elevation: 7,
  },
};

// Per-category dish gradient stops (stand in for AI-generated dish photos)
export const DISH_GRAD: Record<string, readonly [string, string, string]> = {
  rice: ['#F4BC63', '#E07B33', '#BE3E27'],
  soup: ['#F2A64C', '#D5502B', '#97291B'],
  salad: ['#C2D472', '#6E9A4A', '#3C6731'],
  breakfast: ['#FCE291', '#F2B24C', '#D5842B'],
  pasta: ['#F2C76E', '#D98A3E', '#A4562B'],
  grilled: ['#E8A765', '#B5642F', '#6E3A1C'],
  fried: ['#F6CE7A', '#DE9A3C', '#A9611F'],
};

export const DISH_EMOJI: Record<string, string> = {
  rice: '🍛', soup: '🍲', salad: '🥗', breakfast: '🍳', pasta: '🍝', grilled: '🍗', fried: '🍌',
};

// Macro metadata used by badges & the nutrition flower
export const MACROS: Record<string, { label: string; color: string }> = {
  carbs: { label: 'Carbs', color: C.carb },
  fats: { label: 'Fats', color: C.fat },
  sugar: { label: 'Sugar', color: C.sugar },
  protein: { label: 'Protein', color: C.protein },
};

// Type scale — RN custom fonts carry weight via family, not fontWeight.
// Headers use Inter 800 with tight tracking (matches green web design).
export const T = StyleSheet.create({
  display: { fontFamily: F.heavy, fontSize: 33, color: C.ink, letterSpacing: -0.7, lineHeight: 37 },
  h1: { fontFamily: F.heavy, fontSize: 28, color: C.ink, letterSpacing: -0.6, lineHeight: 32 },
  h2: { fontFamily: F.heavy, fontSize: 22, color: C.ink, letterSpacing: -0.4, lineHeight: 26 },
  h3: { fontFamily: F.sansBold, fontSize: 18, color: C.ink, letterSpacing: -0.2 },
  title: { fontFamily: F.sansSemi, fontSize: 16, color: C.ink },
  body: { fontFamily: F.sans, fontSize: 15, color: C.ink2, lineHeight: 23 },
  bodyInk: { fontFamily: F.sans, fontSize: 15, color: C.ink, lineHeight: 23 },
  small: { fontFamily: F.sans, fontSize: 13, color: C.ink2, lineHeight: 19 },
  cap: { fontFamily: F.sansSemi, fontSize: 12.5, color: C.ink3 },
  eyebrow: { fontFamily: F.sansBold, fontSize: 12, letterSpacing: 1.6, color: C.ink3, textTransform: 'uppercase' },
});
