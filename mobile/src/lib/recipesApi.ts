import { apiRequest } from '@/lib/api';
import { getAccessToken } from '@/lib/session';
import type { Recipe } from '@/data/mock';

export type BackendRecipe = {
  id?: string;
  client_id?: string;
  name: string;
  description: string;
  estimated_time_minutes: number;
  difficulty: string;
  meal_type: string;
  image_url?: string | null;
  uses_from_user: string[];
  extra_ingredients: string[];
  steps: string[];
  step_images?: (string | null)[] | null;
};

type SuggestRecipesResponse = {
  recipes: BackendRecipe[];
};

type RecipePreferences = {
  cuisine?: string;
  spice_level?: string;
  max_time?: number;
};

const registry = new Map<string, Recipe>();

function slugify(value: string) {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');
}

function categoryFor(recipe: BackendRecipe) {
  const meal = recipe.meal_type.toLowerCase();
  const text = `${recipe.name} ${recipe.description}`.toLowerCase();
  if (meal.includes('breakfast') || text.includes('egg')) return 'breakfast';
  if (text.includes('rice')) return 'rice';
  if (text.includes('salad')) return 'salad';
  if (text.includes('soup') || text.includes('porridge')) return 'soup';
  if (text.includes('grill') || text.includes('chicken')) return 'grilled';
  if (text.includes('pasta') || text.includes('fusilli')) return 'pasta';
  if (text.includes('plantain') || text.includes('fried')) return 'fried';
  return 'soup';
}

export function backendToRecipe(recipe: BackendRecipe, index = 0): Recipe {
  const id = recipe.id ?? `${slugify(recipe.name)}-${index}`;
  return {
    id,
    name: recipe.name,
    category: categoryFor(recipe),
    tagline: recipe.description,
    description: recipe.description,
    time: recipe.estimated_time_minutes,
    difficulty: recipe.difficulty,
    mealType: recipe.meal_type,
    rank: index === 0 ? 'Best fit' : undefined,
    have: recipe.uses_from_user.map((name) => ({ name, qty: 'on hand' })),
    need: recipe.extra_ingredients.map((name) => ({ name, qty: 'needed' })),
    steps: recipe.steps,
  };
}

export function registerRecipes(recipes: Recipe[]) {
  recipes.forEach((recipe) => registry.set(recipe.id, recipe));
}

export function getRegisteredRecipe(id?: string) {
  return id ? registry.get(id) : undefined;
}

export function recipeToBackend(recipe: Recipe): BackendRecipe {
  return {
    name: recipe.name,
    client_id: recipe.id,
    description: recipe.description,
    estimated_time_minutes: recipe.time,
    difficulty: recipe.difficulty,
    meal_type: recipe.mealType,
    uses_from_user: recipe.have.map((item) => item.name),
    extra_ingredients: recipe.need.map((item) => item.name),
    steps: recipe.steps,
    step_images: [],
  };
}

export async function suggestRecipes(ingredients: string[], preferences?: RecipePreferences) {
  const response = await apiRequest<SuggestRecipesResponse>('/recipes/suggest', {
    method: 'POST',
    body: { ingredients, preferences },
  });
  const recipes = response.recipes.map(backendToRecipe);
  registerRecipes(recipes);
  return recipes;
}

export async function getSavedRecipes() {
  const token = getAccessToken();
  if (!token) return [];
  const response = await apiRequest<BackendRecipe[]>('/recipes/saved', { token });
  const recipes = response.map(backendToRecipe);
  registerRecipes(recipes);
  return recipes;
}

export async function saveRecipe(recipe: Recipe) {
  const token = getAccessToken();
  if (!token) return recipe;
  const response = await apiRequest<BackendRecipe>('/recipes/save', {
    method: 'POST',
    token,
    body: recipeToBackend(recipe),
  });
  const savedRecipe = backendToRecipe(response);
  registerRecipes([savedRecipe]);
  return savedRecipe;
}

export async function updateSavedRecipe(recipe: Recipe) {
  const token = getAccessToken();
  if (!token) return recipe;
  const response = await apiRequest<BackendRecipe>(`/recipes/saved/${recipe.id}`, {
    method: 'PUT',
    token,
    body: recipeToBackend(recipe),
  });
  const updatedRecipe = backendToRecipe(response);
  registerRecipes([updatedRecipe]);
  return updatedRecipe;
}

export async function deleteSavedRecipe(recipeId: string) {
  const token = getAccessToken();
  if (!token) return;
  await apiRequest<void>(`/recipes/saved/${recipeId}`, {
    method: 'DELETE',
    token,
  });
}

export async function visualizeSteps(steps: string[]) {
  return apiRequest<(string | null)[]>('/recipes/visualize', {
    method: 'POST',
    body: { steps },
  });
}
