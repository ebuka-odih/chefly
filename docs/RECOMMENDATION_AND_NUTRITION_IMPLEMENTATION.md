# Ingredient Intelligence, RAG, and Nutrition Implementation Notes

**Date:** June 22, 2026  
**Scope:** Chefly recipe recommendation, ingredient enrichment, nutrition calculation, and nutrition guidance.

## Product Direction

Chefly should not be positioned as a traditional Nigerian-food recommender. Nigerian and African ingredients should be treated as important coverage requirements, but the product should support a global audience and make recipes feel interesting, flexible, and modern across regions.

The core experience remains:

```text
Snap raw ingredients
-> detect ingredients
-> normalize and enrich ingredient context
-> generate interesting recipe options
-> calculate estimated nutrition
-> optionally explain nutrition tradeoffs
```

The recommendation system should balance:

- What the user actually has.
- What pairs well with those ingredients.
- Time of day and cooking time.
- Dietary preferences and restrictions.
- Global cuisine variety.
- Practical missing-ingredient suggestions.
- Nutritional usefulness without becoming a medical app.

## Current Project State

The backend currently has:

- Vision ingredient detection in `backend/app/services/ai_vision.py`.
- Recipe generation in `backend/app/services/ai_recipes.py`.
- `/recipes/suggest` in `backend/app/routes/recipes.py`.
- Recipe persistence in `backend/app/db/models.py`.

The current generation path is prompt-only:

```text
detected ingredients
-> direct LLM prompt
-> generated recipes
```

There is no ingredient ontology, embedding-based pairing, recipe retrieval, deterministic nutrition calculation, or trusted nutrition RAG layer yet.

The mobile suggestions screen currently uses mock data, so the frontend still needs to be wired to the backend suggestion endpoint.

## Epicure Findings

Relevant Hugging Face resource:

- Paper: https://huggingface.co/papers/2605.22391
- Co-occurrence model: https://huggingface.co/Kaikaku/epicure-cooc
- Core model: https://huggingface.co/Kaikaku/epicure-core
- Chemistry model: https://huggingface.co/Kaikaku/epicure-chem
- Dataset: https://huggingface.co/datasets/Kaikaku/epicure-corpus-resources

Epicure is not a raw recipe dataset. It provides ingredient embeddings and supporting analysis resources. It should be used as an ingredient intelligence layer, not as the recipe source of truth.

Epicure provides:

- 1,790 canonical ingredient vocabulary entries.
- Three 300-dimensional ingredient embedding models.
- Mode atlases and direction vectors for ingredient exploration.
- Cuisine and flavor-related embedding directions.
- Derived embedding data under CC BY 4.0.

Epicure does not provide:

- Raw recipe text.
- Full recipe instructions.
- Exact nutrition values.
- Medical or personalized diet advice.
- Complete coverage for all local/regional food names.

### Epicure Model Choice

Use `Kaikaku/epicure-core` first.

Reason:

- `epicure-cooc` is best for "what is commonly cooked together."
- `epicure-chem` is best for flavor chemistry similarity.
- `epicure-core` is the most useful middle ground for Chefly because it keeps recipe-context companionship while adding flavor-chemistry structure.

Use cases:

- Suggest ingredients that pair well with the detected pantry.
- Improve missing-ingredient suggestions.
- Suggest substitutions.
- Support "make this more Mediterranean", "make this more South Asian", or similar cuisine steering.
- Reduce LLM hallucination by giving it plausible ingredient neighborhoods.
- Rank recipe candidates by pantry compatibility.

### Ingredient Coverage Notes

Epicure covers many globally useful and African/Nigerian-relevant foods, including:

```text
yam
plantain
cassava
okra
scotch_bonnet_pepper
habanero_pepper
palm_oil
black_eyed_pea
spinach
rice
chicken
beef
catfish
crayfish
```

Some useful local terms are not direct canonical entries:

```text
garri
egusi
garden_egg
stockfish
cowpea
red_palm_oil
tomatoes
onions
```

This means Chefly needs its own normalization and synonym layer before using Epicure.

Example aliases:

```python
INGREDIENT_ALIASES = {
    "tomatoes": "tomato",
    "onions": "onion",
    "pepper": "scotch_bonnet_pepper",
    "cowpea": "black_eyed_pea",
    "red palm oil": "palm_oil",
}
```

For ingredients not found in Epicure, keep them in the recipe prompt as user-owned ingredients, but exclude them from vector operations unless a local extension embedding is added later.

## Recommended Recommendation Architecture

Add a backend service layer:

```text
backend/app/services/ingredient_normalizer.py
backend/app/services/ingredient_embeddings.py
backend/app/services/recipe_ranker.py
```

Suggested flow:

```text
Image upload
-> detect ingredients with vision model
-> normalize ingredient names
-> map to Epicure canonical vocabulary where possible
-> compute pantry embedding
-> retrieve nearest pairings and substitutions
-> construct grounded recipe prompt
-> generate recipe candidates
-> rank by pantry fit, time, preferences, and novelty
-> return recipes
```

Prompt context should include:

- Original detected ingredients.
- Canonical normalized ingredients.
- Ingredients missing from the embedding vocabulary.
- Embedding-suggested pairings.
- Allowed extra ingredients.
- Cuisine or flavor direction, if requested.
- Hard constraints such as allergies, diet, max time, and available equipment.

Example:

```text
Detected ingredients:
tomatoes, onions, plantain, eggs, pepper

Canonical ingredients:
tomato, onion, plantain, egg, scotch_bonnet_pepper

Useful pairings:
garlic, ginger, rice, chicken, crayfish, palm_oil

User preference:
quick dinner, medium spice, globally inspired, not traditional-only

Generate recipes that mostly use the user's ingredients. Do not require more than
3 extra ingredients unless necessary. Prefer interesting but practical meals.
```

## Nutrition Calculation Findings

Nutrition should be split into two systems:

1. Deterministic nutrition calculation.
2. Trusted-source nutrition guidance/RAG.

The LLM should not invent nutrition values. It can help parse ingredient text and explain results, but final nutrient totals should come from food composition databases and deterministic math.

### Primary Nutrition Data Sources

#### USDA FoodData Central

Use as the primary generic food composition source.

Source: https://fdc.nal.usda.gov/api-guide

Use cases:

- Raw and cooked generic ingredients.
- Foundation Foods.
- SR Legacy.
- FNDDS survey foods.
- Branded foods where useful.

Pros:

- Strong API.
- Good nutrient coverage.
- Widely used as a reference.

Limitations:

- US-centric.
- Ingredient matching still needs normalization and confidence scoring.

#### Open Food Facts

Use for packaged/branded products and barcode flows.

Source: https://openfoodfacts.github.io/openfoodfacts-server/api/

Use cases:

- Packaged sauces.
- Milk, yogurt, cereal, noodles, snacks.
- Branded seasoning cubes and packaged staples.
- Barcode scanning.

Pros:

- Global, open product database.
- Good for label-based packaged foods.

Limitations:

- Community-maintained data can be incomplete or inconsistent.
- Not ideal for raw loose ingredients.

#### FAO/INFOODS

Use for global and regional food composition reference.

Source: https://www.fao.org/infoods/infoods/tables-and-databases/faoinfoods-databases/en/

Use cases:

- International food coverage.
- Cross-checking non-US ingredients.
- Regional food composition expansion.

Limitations:

- Less app-ready than USDA.
- May require manual import and harmonization.

#### UK CoFID

Use as a secondary source for UK/commonwealth food composition.

Source: https://www.gov.uk/government/publications/composition-of-foods-integrated-dataset-cofid

Use cases:

- UK audience.
- Common prepared foods.
- Alternate validation for generic foods.

#### Canadian Nutrient File

Use as another secondary government food composition source.

Source: https://www.canada.ca/en/health-canada/services/food-nutrition/healthy-eating/nutrient-data.html

Use cases:

- Canadian/global fallback.
- Cross-checking nutrient values.

### Cooking Yield and Retention Sources

For better cooked-recipe nutrition, add yield and retention factors.

Sources:

- USDA nutrient retention factors: https://agdatacommons.nal.usda.gov/articles/dataset/USDA_Table_of_Nutrient_Retention_Factors_Release_6_2007_/24660888
- USDA food yields: https://www.ars.usda.gov/ARSUserFiles/80400530/pdf/ah102.pdf

Use these to account for:

- Boiling.
- Frying.
- Baking.
- Peeling.
- Draining.
- Moisture loss.
- Fat gain or loss.
- Vitamin and mineral retention.

This is needed because nutrition for raw ingredients does not always equal nutrition for cooked recipes.

## Nutrition Guidance and RAG Sources

Nutrition advice should be limited, general, and source-backed. Chefly should avoid diagnosis, disease treatment, or medical claims.

Recommended trusted sources:

- WHO healthy diet guidance: https://www.who.int/news-room/fact-sheets/detail/healthy-diet
- Dietary Guidelines for Americans: https://www.dietaryguidelines.gov/
- NIH Office of Dietary Supplements fact sheets: https://ods.od.nih.gov/factsheets/list-all/
- NIH nutrient recommendations: https://ods.od.nih.gov/HealthInformation/nutrientrecommendations.aspx
- FDA nutrition label guidance: https://www.fda.gov/food/nutrition-facts-label/how-understand-and-use-nutrition-facts-label

Use RAG for explanations such as:

- Why a recipe is high in sodium.
- How to reduce saturated fat.
- How to increase fiber.
- Why added sugar should be limited.
- Which ingredients contribute protein, fiber, iron, calcium, potassium, etc.
- How to make a meal more balanced.

Do not use RAG to calculate nutrient totals. Use RAG only to explain and contextualize calculated values.

## Recommended Nutrition Architecture

Add backend services:

```text
backend/app/services/nutrition_matcher.py
backend/app/services/nutrition_calculator.py
backend/app/services/nutrition_rag.py
backend/app/services/unit_conversion.py
```

Suggested deterministic calculation pipeline:

```text
Recipe ingredients with quantities
-> parse ingredient, quantity, unit, preparation state
-> convert quantity to grams or milliliters
-> match ingredient to a food composition database item
-> retrieve nutrients per 100g
-> apply edible portion, yield, and retention factors where possible
-> calculate total recipe nutrition
-> divide by serving count
-> return nutrients, assumptions, and confidence
```

Suggested response shape:

```json
{
  "nutrition": {
    "per_serving": {
      "calories": 540,
      "protein_g": 28,
      "carbs_g": 62,
      "fat_g": 18,
      "fiber_g": 8,
      "sugar_g": 7,
      "sodium_mg": 820
    },
    "confidence": "medium",
    "data_sources": ["USDA FoodData Central"],
    "assumptions": [
      "1 medium onion estimated as 110g",
      "Palm oil estimated as 1 tablespoon",
      "No added salt included unless listed"
    ]
  },
  "nutrition_notes": [
    "Good protein source.",
    "Sodium may be high if using stock cubes or packaged seasoning.",
    "Add vegetables or legumes to increase fiber."
  ]
}
```

## Exactness and Product Wording

Do not claim exact nutrition unless:

- The user provides exact quantities.
- Serving count is known.
- Brand/product data is available for packaged ingredients.
- Preparation method is known.
- Yield and retention assumptions are clear.

Recommended wording:

- "Estimated nutrition"
- "Calculated from USDA/Open Food Facts data"
- "Accuracy depends on quantities, brands, and cooking method"

Avoid:

- "Exact nutrition" for photo-only input.
- "Medical advice"
- "Diabetes-safe", "kidney-safe", "heart-safe", or similar clinical claims unless reviewed by qualified professionals and backed by a dedicated medical workflow.

## RAG Implementation Details

Use RAG for trusted nutrition explanations, not for nutrient math.

Recommended document ingestion:

```text
WHO healthy diet pages
Dietary Guidelines for Americans
NIH ODS fact sheets
FDA Nutrition Facts label guidance
internal Chefly nutrition policy notes
```

Chunk by section, not arbitrary length, so citations remain meaningful.

Store metadata:

```json
{
  "source": "WHO",
  "url": "https://www.who.int/news-room/fact-sheets/detail/healthy-diet",
  "topic": "healthy_diet",
  "audience": "general",
  "region": "global",
  "last_reviewed": "2026-06-22"
}
```

Advice generation should follow this structure:

```text
calculated nutrition facts
-> retrieve relevant guidance
-> produce short, non-medical nutrition notes
-> include assumptions and confidence
```

Example note:

```text
This recipe is relatively high in sodium, mainly from packaged seasoning. To lower it,
use less seasoning cube, add herbs/spices for flavor, and adjust salt at the end.
```

## Data Model Additions

Consider adding fields to stored recipe payloads:

```json
{
  "detected_ingredients": [],
  "canonical_ingredients": [],
  "unmapped_ingredients": [],
  "ingredient_pairings": [],
  "nutrition": {},
  "nutrition_assumptions": [],
  "nutrition_confidence": "low|medium|high",
  "nutrition_sources": [],
  "recommendation_context": {
    "time_of_day": "",
    "cuisine_direction": "",
    "max_time_minutes": 0,
    "dietary_preferences": []
  }
}
```

For relational storage later, possible tables:

```text
ingredients
ingredient_aliases
food_data_matches
recipe_nutrition
nutrition_source_documents
```

## Implementation Phases

### Phase 1: Ingredient Enrichment

- Add `ingredient_normalizer.py`.
- Add local alias map.
- Load Epicure Core embeddings.
- Add pairing/substitution enrichment.
- Pass enrichment into the recipe prompt.

### Phase 2: Backend Recipe Wiring

- Ensure mobile suggestions call `/recipes/suggest`.
- Return generated recipe candidates instead of mock recipes.
- Include recommendation metadata for debugging.

### Phase 3: Basic Nutrition Estimation

- Add USDA FoodData Central integration.
- Parse quantities from generated recipes.
- Calculate calories, protein, carbs, fat, fiber, sugar, and sodium per serving.
- Return assumptions and confidence.

### Phase 4: Packaged Product Support

- Add Open Food Facts lookup.
- Support barcode/product matching.
- Prefer branded label data when a packaged product is detected or scanned.

### Phase 5: Nutrition RAG

- Ingest WHO, USDA/DGA, NIH ODS, and FDA guidance.
- Generate short source-backed nutrition notes.
- Keep advice general and non-medical.

### Phase 6: Advanced Accuracy

- Add cooking yield and retention factors.
- Track raw vs cooked state.
- Improve unit conversion.
- Add regional food composition fallbacks from FAO/INFOODS, CoFID, and CNF.

## Safety and Quality Constraints

- Always distinguish calculated nutrition from estimated nutrition.
- Always return assumptions when quantities are inferred.
- Keep medical disclaimers concise and only when relevant.
- Do not provide disease-specific nutrition plans without explicit user context and proper safeguards.
- For allergies, treat user constraints as hard filters.
- For pregnancy, kidney disease, diabetes, hypertension, eating disorders, or pediatric nutrition, keep advice conservative and suggest professional guidance.

## Practical Next Step

The highest-value first implementation is:

```text
ingredient_normalizer.py
+ Epicure Core enrichment
+ improved recipe prompt
+ response metadata showing canonical names, unmapped ingredients, and suggested pairings
```

This improves recipe quality before taking on the harder nutrition calculation work.
