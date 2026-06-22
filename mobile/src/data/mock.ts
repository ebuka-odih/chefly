export type Ingredient = { name: string; qty: string };

export type Recipe = {
  id: string;
  name: string;
  category: string;
  tagline: string;
  description: string;
  time: number;
  difficulty: string;
  mealType: string;
  rank?: string;
  have: Ingredient[];
  need: Ingredient[];
  steps: string[];
};

export const QUICK_INGREDIENTS = [
  'Yam', 'Rice', 'Plantain', 'Eggs', 'Tomatoes', 'Onions', 'Chicken', 'Pepper', 'Garlic', 'Spinach',
];

export const RECIPES: Recipe[] = [
  {
    id: 'jollof-rice', name: 'Jollof Rice', category: 'rice',
    tagline: 'Smoky and filling — a proper weeknight dinner.',
    description: 'The party classic: long-grain rice simmered in a deep, smoky tomato-pepper base until every grain is stained red and flavourful.',
    time: 40, difficulty: 'Easy', mealType: 'Dinner', rank: 'Best fit',
    have: [
      { name: 'Rice', qty: '2 cups' }, { name: 'Tomatoes', qty: '4' },
      { name: 'Onions', qty: '2' }, { name: 'Pepper', qty: 'to taste' },
    ],
    need: [{ name: 'Stock cube', qty: '2' }, { name: 'Vegetable oil', qty: '¼ cup' }],
    steps: [
      'Blend the tomatoes, onions and pepper into a smooth base.',
      'Fry the blend in hot oil until it darkens and thickens, about 8 minutes.',
      'Stir in the rinsed rice, stock and seasoning until coated.',
      'Cover and simmer on low until the rice is tender and fluffy.',
      'Rest 5 minutes off the heat, then fluff and serve.',
    ],
  },
  {
    id: 'shakshuka', name: 'Shakshuka', category: 'breakfast',
    tagline: 'Eggs poached in a spiced tomato-pepper sauce.',
    description: 'A one-pan favourite — eggs gently poached in a rich, spiced tomato sauce. Fast, cosy and endlessly shareable.',
    time: 25, difficulty: 'Easy', mealType: 'Breakfast',
    have: [
      { name: 'Eggs', qty: '4' }, { name: 'Tomatoes', qty: '5' },
      { name: 'Onions', qty: '1' }, { name: 'Pepper', qty: '1' },
    ],
    need: [{ name: 'Paprika', qty: '1 tsp' }, { name: 'Olive oil', qty: '2 tbsp' }],
    steps: [
      'Soften onions and peppers in olive oil until sweet.',
      'Add chopped tomatoes and paprika; simmer into a thick sauce.',
      'Make wells and crack in the eggs.',
      'Cover and cook until the whites set but yolks stay soft.',
      'Finish with herbs and serve straight from the pan.',
    ],
  },
  {
    id: 'plantain-hash', name: 'Plantain Hash', category: 'fried',
    tagline: 'Sweet-savory skillet using what\'s ripe.',
    description: 'Caramelised ripe plantain tossed with peppers and onions — a sweet-savoury skillet that comes together in minutes.',
    time: 20, difficulty: 'Easy', mealType: 'Dinner',
    have: [
      { name: 'Plantain', qty: '3 ripe' }, { name: 'Onions', qty: '1' }, { name: 'Pepper', qty: '1' },
    ],
    need: [{ name: 'Oil', qty: '3 tbsp' }, { name: 'Salt', qty: 'to taste' }],
    steps: [
      'Dice the ripe plantain into thick cubes.',
      'Fry in hot oil until deeply golden on all sides.',
      'Add onions and peppers; toss until softened.',
      'Season, plate and serve warm.',
    ],
  },
  {
    id: 'yam-porridge', name: 'Yam Porridge', category: 'soup',
    tagline: 'Soft yam simmered in a spicy tomato sauce.',
    description: 'Asaro — comforting chunks of yam cooked down in a peppery tomato sauce until soft and silky.',
    time: 35, difficulty: 'Medium', mealType: 'Lunch',
    have: [
      { name: 'Yam', qty: '½ tuber' }, { name: 'Tomatoes', qty: '3' },
      { name: 'Onions', qty: '1' }, { name: 'Pepper', qty: 'to taste' },
    ],
    need: [{ name: 'Palm oil', qty: '3 tbsp' }, { name: 'Stock cube', qty: '2' }],
    steps: [
      'Peel and cube the yam; cover with water and boil until just tender.',
      'Blend tomatoes, onions and pepper; stir into the yam.',
      'Add palm oil and seasoning; simmer until thick.',
      'Mash a little for a creamy finish and serve.',
    ],
  },
  {
    id: 'garden-salad', name: 'Garden Salad', category: 'salad',
    tagline: 'Fresh and crunchy — five minutes, no cooking.',
    description: 'Crisp greens, juicy tomato and cucumber with a bright citrus dressing. The fastest fresh win in the app.',
    time: 8, difficulty: 'Easy', mealType: 'Lunch',
    have: [
      { name: 'Spinach', qty: '2 cups' }, { name: 'Tomatoes', qty: '2' }, { name: 'Onions', qty: '½' },
    ],
    need: [{ name: 'Lemon', qty: '1' }, { name: 'Olive oil', qty: '2 tbsp' }],
    steps: [
      'Tear the greens into a wide bowl.',
      'Add sliced tomato, cucumber and onion.',
      'Whisk lemon and olive oil; toss to coat.',
      'Season and serve immediately.',
    ],
  },
  {
    id: 'chicken-grill', name: 'Peppered Grilled Chicken', category: 'grilled',
    tagline: 'Charred, juicy and weekend-worthy.',
    description: 'Chicken marinated in a smoky pepper rub, grilled until charred at the edges and juicy inside.',
    time: 45, difficulty: 'Medium', mealType: 'Dinner',
    have: [
      { name: 'Chicken', qty: '4 pieces' }, { name: 'Pepper', qty: '2' },
      { name: 'Onions', qty: '1' }, { name: 'Garlic', qty: '3 cloves' },
    ],
    need: [{ name: 'Stock cube', qty: '2' }, { name: 'Oil', qty: '2 tbsp' }],
    steps: [
      'Blend pepper, onion and garlic into a marinade.',
      'Coat the chicken and rest for 15 minutes.',
      'Grill, turning, until charred and cooked through.',
      'Baste with the remaining marinade and serve.',
    ],
  },
];

// Spicy Tomato Fusilli — the "last scan" hero shown on Home (matches docs/1.jpg)
RECIPES.push({
  id: 'tomato-fusilli', name: 'Spicy Tomato Fusilli', category: 'pasta',
  tagline: 'Twisted pasta in a garlicky roasted tomato sauce.',
  description: 'Twisted pasta tossed in a garlicky roasted tomato sauce with a gentle chilli kick — fast, glossy and weeknight-friendly.',
  time: 25, difficulty: 'Easy', mealType: 'Dinner',
  have: [
    { name: 'Pasta', qty: '200 g' }, { name: 'Tomatoes', qty: '4' }, { name: 'Garlic', qty: '3 cloves' },
  ],
  need: [{ name: 'Chilli flakes', qty: '1 tsp' }, { name: 'Olive oil', qty: '2 tbsp' }, { name: 'Basil', qty: 'a handful' }],
  steps: [
    'Boil the fusilli in salted water until al dente.',
    'Gently sizzle sliced garlic and chilli flakes in olive oil.',
    'Add chopped tomatoes and simmer into a glossy sauce.',
    'Toss the drained pasta through with a splash of pasta water.',
    'Finish with torn basil and serve.',
  ],
});

// Per-category dish emoji (cover art) and per-recipe macro nutrition.
export const CATEGORY_EMOJI: Record<string, string> = {
  rice: '🍚', breakfast: '🍳', fried: '🍌', soup: '🍲', salad: '🥗', grilled: '🍗', pasta: '🍝',
};

export type Nutrition = { calories: number; carbs: number; fats: number; sugar: number; protein: number };
export const NUTRITION: Record<string, Nutrition> = {
  'jollof-rice': { calories: 520, carbs: 62, fats: 18, sugar: 6, protein: 14 },
  'shakshuka': { calories: 320, carbs: 18, fats: 22, sugar: 8, protein: 19 },
  'plantain-hash': { calories: 410, carbs: 58, fats: 16, sugar: 14, protein: 6 },
  'yam-porridge': { calories: 380, carbs: 64, fats: 10, sugar: 5, protein: 8 },
  'garden-salad': { calories: 210, carbs: 24, fats: 11, sugar: 7, protein: 6 },
  'chicken-grill': { calories: 480, carbs: 8, fats: 24, sugar: 3, protein: 46 },
  'tomato-fusilli': { calories: 480, carbs: 58, fats: 16, sugar: 9, protein: 15 },
};

export const emojiFor = (r: Recipe) => CATEGORY_EMOJI[r.category] || '🍽️';
export const nutritionFor = (id: string): Nutrition => NUTRITION[id] || NUTRITION['jollof-rice'];

// Community rating per recipe (stand-in for real reviews) — shown on suggestion cards.
export const RATING: Record<string, number> = {
  'jollof-rice': 4.8, 'shakshuka': 4.5, 'plantain-hash': 4.6, 'yam-porridge': 4.4,
  'garden-salad': 4.6, 'chicken-grill': 4.7, 'tomato-fusilli': 4.7,
};
export const ratingFor = (id: string): number => RATING[id] ?? 4.6;

// Per-ingredient emoji for the nutrition flower + ingredient rows.
const ING_EMOJI: Record<string, string> = {
  rice: '🍚', tomato: '🍅', tomatoes: '🍅', pepper: '🌶️', onion: '🧅', onions: '🧅',
  garlic: '🧄', basil: '🌿', oil: '🫒', 'olive oil': '🫒', 'vegetable oil': '🫒', 'palm oil': '🫒',
  pasta: '🍝', lettuce: '🥬', cucumber: '🥒', sesame: '⚪', egg: '🥚', eggs: '🥚', plantain: '🍌',
  meat: '🍖', spinach: '🥬', chicken: '🍗', fish: '🐟', beans: '🫘', yam: '🍠', vegetables: '🥦',
  paprika: '🌶️', 'chilli flakes': '🌶️', 'stock cube': '🧊', salt: '🧂', lemon: '🍋', curry: '🍛', thyme: '🌿',
};
export const ingredientEmoji = (name = '') => ING_EMOJI[name.toLowerCase()] || '🥄';

export type Breakdown = { label: string; percent: number; emoji: string };
// Weighted breakdown so the primary ingredients dominate the flower.
export const buildBreakdown = (r: Recipe): Breakdown[] => {
  const list = [...r.have.map((h) => h.name), ...r.need.map((n) => n.name)].slice(0, 6);
  if (!list.length) return [];
  const weights = list.map((_, i) => list.length - i);
  const total = weights.reduce((a, b) => a + b, 0);
  return list.map((label, i) => ({ label, percent: Math.round((weights[i] / total) * 100), emoji: ingredientEmoji(label) }));
};

// Last scan shown on Home, plus the "Recommended" rail order.
export const LAST_SCAN_ID = 'tomato-fusilli';
export const RECOMMENDED = ['jollof-rice', 'chicken-grill', 'garden-salad', 'shakshuka', 'plantain-hash'];

export const getRecipe = (id?: string): Recipe => RECIPES.find((r) => r.id === id) || RECIPES[0];

export const SAVED_RECIPES = ['jollof-rice', 'shakshuka', 'chicken-grill'];

export const HISTORY = [
  { id: 'h1', recipeId: 'yam-porridge', when: 'Today · 1:12 PM', ingredients: ['Yam', 'Tomatoes', 'Onions'] },
  { id: 'h2', recipeId: 'jollof-rice', when: 'Yesterday · 7:40 PM', ingredients: ['Rice', 'Tomatoes', 'Pepper'] },
  { id: 'h3', recipeId: 'garden-salad', when: 'Mon · 12:30 PM', ingredients: ['Spinach', 'Tomatoes'] },
  { id: 'h4', recipeId: 'plantain-hash', when: 'Sun · 6:05 PM', ingredients: ['Plantain', 'Onions'] },
];

export const PROFILE = {
  name: 'Emma',
  initial: 'E',
  handle: '@emmacooks',
  stats: { cooked: 24, saved: 8, streak: 5 },
  preferences: [
    { label: 'Cuisine focus', value: 'Nigerian' },
    { label: 'Spice level', value: 'Medium' },
    { label: 'Avoid', value: 'None' },
  ],
};
