import json
from typing import List, Optional

from app.config import settings
from app.services.llm import get_client
from app.schemas.recipes import RecipeBase, RecipePreferences
from app.utils.timeofday import TimeContext, parse_time_context

RECIPE_SYSTEM_PROMPT = """You are Chefly — a warm, sharp personal chef who turns
whatever someone has on hand into meals they'll actually want to cook *right now*.

Core principles:
- TIME-AWARE: you are told the current local time. Rank suggestions for that
  moment — quick energising food in the morning, a proper meal at dinner, light
  comforting food late at night. Never suggest a 2-hour roast at 9pm on a weeknight.
- USE WHAT THEY HAVE: build mostly from the user's ingredients. Add at most a few
  common pantry extras (salt, oil, stock, basic spices) and list them separately.
- REALISTIC: honest cook times, beginner-friendly steps, sensible quantities.
- RESPECT PREFERENCES: match the requested cuisine, spice level and time budget,
  and NEVER include any ingredient the user asked to avoid.

Output STRICT JSON only — no markdown, no commentary."""


def _build_user_prompt(
    ingredients: List[str],
    preferences: RecipePreferences,
    time_ctx: TimeContext,
) -> str:
    avoid = ", ".join(preferences.avoid) if preferences.avoid else "nothing"
    return f"""{time_ctx.as_prompt()}

The user has these ingredients: {', '.join(ingredients) if ingredients else '(none specified)'}.

Preferences:
- Cuisine focus: {preferences.cuisine}
- Spice level: {preferences.spice_level}
- Max total time: {preferences.max_time} minutes
- Avoid (never use): {avoid}

Suggest 2-4 meals, ordered best-fit first for the current time of day.

Return a JSON object: {{"recipes": [ ... ]}} where each recipe has EXACTLY these keys:
- "name": string
- "description": string (one appetising sentence)
- "why_now": string (short — why this fits the current time of day / day of week)
- "estimated_time_minutes": integer (<= the max time above)
- "difficulty": "Easy" | "Medium" | "Hard"
- "meal_type": "Breakfast" | "Lunch" | "Dinner" | "Snack"
- "uses_from_user": array of strings (only ingredients from the user's list)
- "extra_ingredients": array of strings (common extras needed, kept minimal)
- "steps": array of strings (clear, numbered-style instructions, 4-8 steps)

No markdown, no text outside the JSON object."""


def generate_recipes_from_ingredients(
    ingredients: List[str],
    preferences: RecipePreferences,
    local_time: Optional[str] = None,
    local_hour: Optional[int] = None,
) -> List[RecipeBase]:
    """Generate time-aware recipe suggestions.

    Image generation is intentionally NOT done here — suggestions return fast and
    text-only, and the dish image is generated on demand via /images/generate
    (cheaper, and matches the "generate only the top dish" product spec).
    """
    time_ctx = parse_time_context(local_time=local_time, hour=local_hour)

    if not settings.ai_enabled:
        print("[ai_recipes] No AI key configured; returning fallback recipe.")
        return [_fallback_recipe(time_ctx)]

    try:
        client = get_client()
        response = client.chat.completions.create(
            model=settings.RECIPE_MODEL,
            messages=[
                {"role": "system", "content": RECIPE_SYSTEM_PROMPT},
                {"role": "user", "content": _build_user_prompt(ingredients, preferences, time_ctx)},
            ],
            response_format={"type": "json_object"},
            temperature=0.7,
        )

        content = response.choices[0].message.content or "{}"
        data = json.loads(content)

        recipes: List[RecipeBase] = []
        for r in data.get("recipes", []):
            try:
                recipe = RecipeBase(**r)
                recipe.image_url = None  # generated on demand
                recipe.step_images = []
                recipes.append(recipe)
            except Exception as parse_err:  # noqa: BLE001 - skip malformed entries
                print(f"[ai_recipes] Skipping malformed recipe: {parse_err}")

        return recipes or [_fallback_recipe(time_ctx)]

    except Exception as e:  # noqa: BLE001 - degrade gracefully
        print(f"[ai_recipes] Error generating recipes: {e}")
        return [_fallback_recipe(time_ctx)]


def _fallback_recipe(time_ctx: TimeContext) -> RecipeBase:
    """Tasteful fallback so the UI always has something to show."""
    return RecipeBase(
        name="Fried Yam & Egg Sauce",
        description="Crispy fried yam served with a spicy egg-and-tomato sauce.",
        why_now=f"A reliable, quick {time_ctx.period.lower()} option you can make with pantry staples.",
        estimated_time_minutes=30,
        difficulty="Easy",
        meal_type="Breakfast",
        uses_from_user=["Yam", "Eggs"],
        extra_ingredients=["Oil", "Salt", "Tomatoes", "Onions"],
        steps=[
            "Peel and slice the yam into thick rounds; season with salt.",
            "Shallow-fry the yam in hot oil until golden on both sides.",
            "Sauté chopped onions and tomatoes into a soft sauce.",
            "Whisk in the eggs and stir until just set.",
            "Serve the fried yam with the egg sauce on the side.",
        ],
        step_images=[],
    )
