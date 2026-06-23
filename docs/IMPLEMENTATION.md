# Chefly Implementation Plan

**Date:** June 22, 2026  
**Status:** Planning document  
**Audience:** Backend, mobile, AI workflow, and product implementation

## 1. Goal

Chefly is a mobile-first cooking assistant. The core user journey is:

```text
User snaps or enters ingredients
-> Chefly understands ingredients, intent, time, preferences, and constraints
-> Chefly suggests practical but interesting recipes
-> User views recipe details, saves recipes, shops for missing items, or starts cooking mode
-> Chefly stores useful history and preferences for future recommendations
```

The app should support a global audience. Nigerian and African foods should be supported well, but they are not the product center. The product should avoid feeling like a traditional-food-only recommender. Recommendations should feel broad, modern, adaptive, and region-aware.

## 2. Existing Project Context

Current repo structure:

```text
backend/
  app/
    routes/
      auth.py
      ingredients.py
      recipes.py
      images.py
    services/
      ai_vision.py
      ai_recipes.py
      image_generation.py
    db/
      models.py

mobile/
  src/app/
    camera.tsx
    ingredients.tsx
    suggestions.tsx
    recipe/[id].tsx
    cooking/[id].tsx
    (tabs)/saved.tsx
    (tabs)/history.tsx
    (tabs)/profile.tsx
    questions.tsx
    auth.tsx
    edit-profile.tsx
    paywall.tsx
    privacy.tsx
    terms.tsx
    delete-account.tsx
```

Current backend capabilities:

- User register/login/me endpoints.
- Ingredient detection endpoint.
- Recipe suggestion endpoint.
- Save and saved recipes endpoints.
- Image generation endpoint.

Current gaps:

- Mobile screens still use mock data in several places.
- Recipe generation is prompt-only.
- No structured AI workflow/orchestration layer.
- No query and intent understanding.
- No ingredient enrichment layer.
- No pantry vector, pairing, substitution, or RAG workflow.
- No complete CRUD for profile, preferences, history, shopping list, cooking sessions, feedback, or account deletion.
- No deterministic nutrition calculation.
- No model routing policy or usage/cost tracking.

## 3. Target Architecture

Use FastAPI as the core backend for:

- Authentication and account management.
- All CRUD for mobile screens.
- AI workflow endpoints.
- Persistent user data.
- Recipe, saved recipe, scan, history, cooking mode, and preference storage.
- Usage limits and paywall enforcement.

Use Pydantic AI for the AI workflow agent layer:

- Intent understanding.
- Ingredient normalization.
- Tool calling.
- RAG retrieval.
- Recipe generation.
- Validation of structured outputs.
- Delegating image generation and nutrition estimation tools.

Use OpenRouter for model access:

- Cheap text models for query/intent understanding.
- Stronger but still cost-controlled text models for recipe generation.
- Vision-capable model for ingredient detection if OpenRouter model quality is acceptable.
- Cheap image-generation model for meal pictures.

Use deterministic services outside the LLM for:

- CRUD.
- Nutrition math.
- Unit conversion.
- Database writes.
- Auth.
- Usage accounting.
- Safety filters.

## 4. Backend Module Layout

Recommended backend layout:

```text
backend/app/
  api/
    deps.py
    errors.py
    pagination.py

  routes/
    auth.py
    users.py
    preferences.py
    ingredients.py
    recipes.py
    saved_recipes.py
    history.py
    shopping_lists.py
    cooking_sessions.py
    images.py
    feedback.py
    billing.py

  schemas/
    auth.py
    users.py
    preferences.py
    ingredients.py
    recipes.py
    saved_recipes.py
    history.py
    shopping_lists.py
    cooking_sessions.py
    images.py
    ai.py
    nutrition.py

  services/
    ai/
      agents.py
      deps.py
      models.py
      prompts.py
      tools.py
      openrouter_client.py
      workflow.py
      safety.py
    ingredients/
      normalizer.py
      aliases.py
      epicure.py
      matcher.py
    recipes/
      generator.py
      ranker.py
      validator.py
    nutrition/
      matcher.py
      calculator.py
      unit_conversion.py
      rag.py
    images/
      generator.py
      prompts.py
      cache.py
    users/
      preferences.py
      usage.py

  db/
    models.py
    database.py
    migrations/
```

The split is intentional:

- `routes/` owns HTTP shape.
- `schemas/` owns request/response models.
- `services/ai/` owns agent orchestration.
- Domain service packages own deterministic business logic.
- Database models stay persistence-focused.

## 5. Pydantic AI Agent SDK Usage

Use Pydantic AI for AI-related workflows because it supports:

- Typed agent outputs with `output_type`.
- Runtime dependencies with `deps_type`.
- Tool functions with validated schemas.
- Dynamic instructions.
- Async `run` calls that fit FastAPI service usage.
- Delegated agents for multi-step workflows.

Current docs source used for this plan:

- Context7 library: `/pydantic/pydantic-ai`
- Official package docs describe `Agent`, `RunContext`, `deps_type`, `output_type`, tool decorators, dynamic instructions, and async `agent.run(...)`.

### Agent Responsibilities

Do not create one giant agent that does everything. Use a small orchestrator plus focused tools.

Primary agent:

```text
MealPlanningAgent
```

Responsibilities:

- Understand user intent.
- Interpret available ingredients and constraints.
- Decide whether the user wants recipe suggestions, substitutions, nutrition info, cooking help, or history-based recommendations.
- Call deterministic tools for ingredient enrichment, recipe generation, nutrition, and image generation.
- Return a validated structured response.

Supporting agents or tools:

```text
IntentAgent
IngredientReviewAgent
RecipeDraftAgent
NutritionExplanationAgent
CookingAssistantAgent
```

The first implementation can keep these as tools under one agent. Split into multiple agents only when complexity grows.

### Pydantic AI Shape

Example implementation direction:

```python
from dataclasses import dataclass
from pydantic import BaseModel, Field
from pydantic_ai import Agent, RunContext


@dataclass
class MealAgentDeps:
    user_id: str | None
    db: object
    openrouter: object
    now_iso: str
    locale: str | None
    timezone: str


class MealIntent(BaseModel):
    intent: str = Field(description="suggest_recipe, explain_nutrition, cook_mode, substitute, shopping_list")
    confidence: float = Field(ge=0, le=1)
    requested_cuisine: str | None = None
    max_time_minutes: int | None = None
    dietary_constraints: list[str] = []
    allergies: list[str] = []


class RecipeSuggestion(BaseModel):
    name: str
    description: str
    estimated_time_minutes: int
    difficulty: str
    meal_type: str
    cuisine_style: str | None = None
    ingredients: list[str]
    uses_from_user: list[str]
    extra_ingredients: list[str]
    steps: list[str]
    nutrition: dict | None = None
    image_prompt: str | None = None
    image_url: str | None = None


class MealPlanOutput(BaseModel):
    intent: MealIntent
    recipes: list[RecipeSuggestion] = []
    follow_up_questions: list[str] = []
    warnings: list[str] = []
    assumptions: list[str] = []


meal_agent = Agent(
    "openai:gpt-4o-mini",
    deps_type=MealAgentDeps,
    output_type=MealPlanOutput,
    instructions="You are Chefly's meal planning agent. Return validated structured output only.",
)
```

The model string above is illustrative. In production, route through OpenRouter-compatible configuration as described below.

### Tools

Agent tools should call deterministic services:

```python
@meal_agent.tool
async def normalize_ingredients(ctx: RunContext[MealAgentDeps], ingredients: list[str]) -> dict:
    """Normalize user ingredient names and return canonical names, aliases, and unmapped items."""
    ...


@meal_agent.tool
async def enrich_ingredients(ctx: RunContext[MealAgentDeps], canonical_ingredients: list[str]) -> dict:
    """Return pairings, substitutions, and cuisine directions."""
    ...


@meal_agent.tool
async def calculate_nutrition(ctx: RunContext[MealAgentDeps], recipe: dict) -> dict:
    """Calculate estimated nutrition from structured ingredients."""
    ...


@meal_agent.tool
async def generate_meal_image(ctx: RunContext[MealAgentDeps], recipe_name: str, description: str) -> dict:
    """Generate or retrieve a cached meal image."""
    ...
```

Important rule:

```text
The agent may decide when to use tools, but tools own the business logic.
```

Do not allow the LLM to directly write database records, calculate nutrition, enforce billing limits, or decide auth state.

## 6. OpenRouter Model Strategy

OpenRouter should be used as the model gateway.

Relevant docs:

- API reference: https://openrouter.ai/docs/api/reference/overview
- Quickstart: https://openrouter.ai/docs/quickstart
- Chat completions: https://openrouter.ai/docs/api/api-reference/chat/send-chat-completion-request
- Image generation: https://openrouter.ai/docs/guides/overview/multimodal/image-generation
- Models API: https://openrouter.ai/docs/api/api-reference/models/get-models

OpenRouter is OpenAI-compatible for chat completions and supports model routing through one API. Image generation uses the chat completions endpoint with `modalities`, depending on the selected model.

### Model Roles

Use model routing by task type:

```text
intent_understanding:
  cheap, fast text model
  structured JSON output preferred

ingredient_review:
  cheap text model if ingredients are already detected
  vision-capable model only when image analysis is needed

recipe_generation:
  mid-tier text model with strong instruction following
  structured output required

nutrition_explanation:
  cheap text model with RAG context
  no nutrient math inside the model

image_generation:
  cheap image-capable model
  generate top recipe only by default
```

### Configuration

Add environment variables:

```text
OPENROUTER_API_KEY=
OPENROUTER_BASE_URL=https://openrouter.ai/api/v1
OPENROUTER_SITE_URL=
OPENROUTER_APP_NAME=Chefly

MODEL_INTENT=
MODEL_RECIPE=
MODEL_VISION=
MODEL_IMAGE=
MODEL_NUTRITION_EXPLANATION=
```

Keep model names in config, not hardcoded in services. OpenRouter model availability, price, and quality will change, so the backend must support swapping models without code changes.

### OpenRouter Client

Create:

```text
backend/app/services/ai/openrouter_client.py
```

Responsibilities:

- Centralize API key and base URL.
- Add optional `HTTP-Referer` and `X-Title` headers.
- Support text chat completions.
- Support image generation chat completions with `modalities`.
- Enforce timeouts and retries.
- Log model, latency, token usage, request id, and cost estimate where available.
- Normalize provider errors into app-level errors.

### Query and Intent Understanding

Intent understanding should run before full recipe generation.

Inputs:

- User text notes.
- Detected/manual ingredients.
- Current screen or user action.
- Time of day.
- Preferences.
- Dietary constraints.

Output:

```json
{
  "intent": "suggest_recipe",
  "confidence": 0.92,
  "max_time_minutes": 25,
  "meal_type": "dinner",
  "requested_cuisine": "any",
  "dietary_constraints": ["vegetarian"],
  "allergies": ["peanut"],
  "needs_follow_up": false,
  "follow_up_question": null
}
```

Use cases:

- "I have chicken and peppers, something quick" -> suggest recipe, max time short.
- "Make it healthy" -> suggest recipe plus nutrition focus.
- "No dairy" -> add hard dietary constraint.
- "What can I replace eggs with?" -> substitution intent.
- "Is this high protein?" -> nutrition explanation intent.

Edge cases:

- Low confidence intent should return a follow-up question.
- Allergy mentions must be treated as hard constraints.
- Dietary preference and allergy conflicts should ask a follow-up.
- Empty ingredient list should ask for ingredients or offer surprise mode.

## 7. Image Generation Strategy

The product goal is appetizing, shareable meal images. Use a cheap image-capable model through OpenRouter or another provider when cheaper/more reliable.

OpenRouter image generation:

- Use `/api/v1/chat/completions`.
- Select models with image output modalities.
- Include `modalities: ["image"]` or `["image", "text"]` depending on model capability.
- Inspect the OpenRouter models endpoint and pricing before picking default production model.

Image generation policy:

- Generate only the top recipe image by default.
- Generate additional images only on tap, save, share, or Pro.
- Cache images by stable prompt hash.
- Store generated image URL and provider metadata.
- Fall back to a styled placeholder or gradient food category image if generation fails.

Prompt requirements:

```text
Photorealistic food photography of [recipe name], finished dish only,
beautifully plated, appetizing natural light, realistic texture, modern plate,
slight 45-degree angle, no text, no watermark, no people, no hands.
```

Avoid:

- Hands, people, text, logos, brand marks.
- Raw ingredients when generating final dish.
- Unrealistic portions.
- Wrong cuisine-specific appearance when a region is requested.

Edge cases:

- Recipe name contains unsafe or non-food terms: sanitize prompt.
- Image provider returns no image: return recipe without image.
- Slow image generation: return text recipe first and poll image status.
- User edits recipe: invalidate or regenerate image prompt hash.
- Duplicate image requests: use cache lock/idempotency key.

## 8. Ingredient Intelligence and RAG

Use Epicure for ingredient embeddings:

- Paper: https://huggingface.co/papers/2605.22391
- Core model: https://huggingface.co/Kaikaku/epicure-core
- Dataset: https://huggingface.co/datasets/Kaikaku/epicure-corpus-resources

Use Epicure as an ingredient intelligence layer, not a recipe dataset.

Responsibilities:

- Normalize ingredient names.
- Map aliases and plurals.
- Find pairings.
- Find substitutions.
- Support cuisine direction steering.
- Improve missing-ingredient recommendations.

Add:

```text
backend/app/services/ingredients/normalizer.py
backend/app/services/ingredients/aliases.py
backend/app/services/ingredients/epicure.py
```

Example enrichment output:

```json
{
  "original": ["tomatoes", "onions", "eggs", "plantain"],
  "canonical": ["tomato", "onion", "egg", "plantain"],
  "unmapped": [],
  "pairings": ["garlic", "ginger", "rice", "chicken"],
  "substitutions": {
    "tomato": ["tomato_paste", "canned_tomato"]
  }
}
```

Edge cases:

- User detects non-food items: filter and report.
- Duplicate ingredients: dedupe after normalization.
- Ambiguous ingredient names: preserve original and ask follow-up if important.
- Local ingredient not in Epicure: keep it in prompt but skip vector lookup.
- Allergens found in pairings: remove from suggestions.

## 9. Nutrition Calculation and Nutrition RAG

Nutrition should not be primarily medical. It should be useful, lightweight, and clearly estimated.

Use deterministic calculation for nutrient totals. Use RAG only to explain results.

Primary data sources:

- USDA FoodData Central: https://fdc.nal.usda.gov/api-guide
- Open Food Facts: https://openfoodfacts.github.io/openfoodfacts-server/api/
- FAO/INFOODS: https://www.fao.org/infoods/infoods/tables-and-databases/faoinfoods-databases/en/
- UK CoFID: https://www.gov.uk/government/publications/composition-of-foods-integrated-dataset-cofid
- Canadian Nutrient File: https://www.canada.ca/en/health-canada/services/food-nutrition/healthy-eating/nutrient-data.html

Guidance/RAG sources:

- WHO healthy diet: https://www.who.int/news-room/fact-sheets/detail/healthy-diet
- Dietary Guidelines for Americans: https://www.dietaryguidelines.gov/
- NIH ODS fact sheets: https://ods.od.nih.gov/factsheets/list-all/
- FDA nutrition label guidance: https://www.fda.gov/food/nutrition-facts-label/how-understand-and-use-nutrition-facts-label

Calculation flow:

```text
Structured recipe ingredients
-> parse quantities and units
-> convert to grams/ml
-> match each ingredient to food database item
-> retrieve nutrients per 100g
-> apply yield/retention where available
-> sum totals
-> divide by serving count
-> return assumptions and confidence
```

Response wording:

- Use "estimated nutrition".
- Include confidence.
- Include assumptions.
- Do not claim exact values from photo-only input.

Edge cases:

- No quantities: estimate from common serving sizes and mark low confidence.
- Brand-specific food without barcode: use generic fallback.
- Fried foods: fat absorption may be inaccurate.
- Salt/seasoning not listed: sodium estimate may be low.
- User asks medical advice: provide general information only and recommend professional guidance where appropriate.
- Allergies: hard block unsafe ingredients and substitutions.

## 10. FastAPI CRUD Requirements by Screen

All screens should be backed by FastAPI, not mocks.

### Auth and Onboarding

Screens:

- `auth.tsx`
- `onboarding.tsx`
- `questions.tsx`
- `paywall.tsx`

Endpoints:

```text
POST /auth/register
POST /auth/login
POST /auth/logout
POST /auth/refresh
GET  /auth/me
POST /auth/forgot-password
POST /auth/reset-password

GET  /me
PATCH /me
DELETE /me

GET  /me/preferences
PUT  /me/preferences
PATCH /me/preferences
```

Data:

- Name.
- Email.
- Password hash.
- Avatar URL or initials.
- Cooking skill.
- Household size.
- Dietary preferences.
- Allergies.
- Avoided ingredients.
- Cuisine interests.
- Spice level.
- Health goals.
- Notification settings.
- Watermark setting.
- Subscription tier.

Edge cases:

- Duplicate email.
- Weak password.
- Expired token.
- Refresh token reuse.
- Deleted account token still active.
- Partial onboarding.
- User selects "No restrictions" and another restriction.
- Allergy stored as preference instead of hard constraint.

### Home

Screen:

- `(tabs)/index.tsx`

Endpoints:

```text
GET /home
GET /me/stats
GET /me/recent-activity
GET /recommendations/quick
```

Data:

- Greeting context.
- Time of day.
- Remaining free scans.
- Recent recipes.
- Suggested actions.
- Saved count.
- Cooked count.
- Streak.

Edge cases:

- New user with no history.
- Anonymous user.
- Free user scan limit reached.
- Timezone missing or wrong.

### Camera and Ingredient Review

Screens:

- `camera.tsx`
- `ingredients.tsx`

Endpoints:

```text
POST /ingredient-scans
GET  /ingredient-scans/{id}
PATCH /ingredient-scans/{id}
DELETE /ingredient-scans/{id}

POST /ingredients/detect
POST /ingredients/normalize
POST /ingredients/enrich
GET  /ingredients/suggestions
```

Data:

- Uploaded image.
- Detected ingredients.
- Confidence per ingredient.
- User-edited ingredients.
- Canonical ingredients.
- Unmapped ingredients.
- Scan metadata.

Edge cases:

- Blurry image.
- Multiple photos.
- Non-food objects.
- Packaged food labels.
- Duplicate ingredients.
- User removes all detected items.
- Upload too large.
- Unsupported image type.
- Vision model timeout.

### Suggestions

Screen:

- `suggestions.tsx`

Endpoints:

```text
POST /recipes/suggest
GET  /recipe-sessions/{id}
GET  /recipe-sessions/{id}/recipes
POST /recipe-sessions/{id}/regenerate
POST /recipe-sessions/{id}/feedback
```

Request:

```json
{
  "ingredients": ["tomato", "onion", "egg"],
  "scan_id": "optional",
  "notes": "quick dinner, no dairy",
  "preferences": {
    "max_time_minutes": 30,
    "spice_level": "medium",
    "dietary_constraints": ["vegetarian"],
    "allergies": []
  }
}
```

Response:

```json
{
  "session_id": "...",
  "intent": {...},
  "recipes": [...],
  "assumptions": [...],
  "warnings": [...]
}
```

Edge cases:

- Empty ingredient list.
- User asks for a cuisine incompatible with ingredients.
- Hard dietary constraint conflicts with detected ingredients.
- Agent output fails validation.
- Model provider outage.
- All generated recipes need too many extra ingredients.
- User regenerates repeatedly and exceeds limit.

### Recipe Detail

Screen:

- `recipe/[id].tsx`

Endpoints:

```text
GET    /recipes/{id}
PATCH  /recipes/{id}
DELETE /recipes/{id}
POST   /recipes/{id}/save
DELETE /recipes/{id}/save
POST   /recipes/{id}/share-card
POST   /recipes/{id}/image
POST   /recipes/{id}/nutrition
POST   /recipes/{id}/remix
```

Data:

- Recipe details.
- Ingredients with quantities.
- Steps.
- Time and difficulty.
- Nutrition estimate.
- Image URL.
- Missing ingredients.
- User save state.
- Share metadata.

Edge cases:

- Recipe belongs to another user.
- Recipe generated but not persisted.
- Image still pending.
- Nutrition confidence low.
- Recipe has unsafe/allergen conflict.
- User edits recipe and stale nutrition/image remains.

### Cooking Mode

Screen:

- `cooking/[id].tsx`

Endpoints:

```text
POST  /cooking-sessions
GET   /cooking-sessions/{id}
PATCH /cooking-sessions/{id}
POST  /cooking-sessions/{id}/complete-step
POST  /cooking-sessions/{id}/timer
POST  /cooking-sessions/{id}/finish
DELETE /cooking-sessions/{id}
```

Data:

- Current step.
- Completed steps.
- Active timers.
- Started/finished timestamps.
- User notes.
- Step images.

Edge cases:

- App closes mid-cook.
- Timer continues in background.
- User skips steps.
- User changes serving size during cooking.
- Step image generation fails.
- Recipe deleted while session active.

### Saved Recipes

Screen:

- `(tabs)/saved.tsx`

Endpoints:

```text
GET    /saved-recipes
POST   /saved-recipes
DELETE /saved-recipes/{recipe_id}
PATCH  /saved-recipes/{recipe_id}
```

Data:

- Saved recipe list.
- Folders/tags later.
- Saved timestamp.
- Notes.
- Favorite state.

Edge cases:

- Duplicate save.
- Recipe deleted but saved reference remains.
- Saved list pagination.
- Offline save retry.

### History

Screen:

- `(tabs)/history.tsx`

Endpoints:

```text
GET    /history
GET    /history/{id}
DELETE /history/{id}
DELETE /history
POST   /history/{id}/repeat
```

Data:

- Scan history.
- Recipe cooked history.
- Ingredients used.
- Timestamp.
- Recipe reference.
- Outcome feedback.

Edge cases:

- User clears history.
- Recipe referenced by history is deleted.
- Anonymous user converts to account.
- History grows large and needs pagination.

### Profile and Settings

Screens:

- `(tabs)/profile.tsx`
- `edit-profile.tsx`
- `privacy.tsx`
- `terms.tsx`
- `delete-account.tsx`

Endpoints:

```text
GET    /me
PATCH  /me
DELETE /me

GET    /me/settings
PATCH  /me/settings

GET    /legal/privacy
GET    /legal/terms
POST   /feedback
```

Data:

- Profile.
- Taste preferences.
- Notification settings.
- Share watermark setting.
- Legal documents.
- Account deletion state.

Edge cases:

- Deleting account should revoke tokens.
- Delete should remove or anonymize user data according to policy.
- Email change should require verification.
- Legal docs should be versioned.

### Shopping Lists

Future or Phase 2 screen/feature.

Endpoints:

```text
GET    /shopping-lists
POST   /shopping-lists
GET    /shopping-lists/{id}
PATCH  /shopping-lists/{id}
DELETE /shopping-lists/{id}
POST   /shopping-lists/from-recipe/{recipe_id}
PATCH  /shopping-lists/{id}/items/{item_id}
```

Edge cases:

- Duplicate ingredients across recipes.
- Unit merging is ambiguous.
- User already has an item.
- Ingredient substitution changes list.

## 11. Database Model Additions

Recommended models:

```text
User
UserPreference
UserSetting
RefreshToken
IngredientScan
IngredientScanItem
Recipe
RecipeSession
SavedRecipe
CookingSession
CookingSessionStep
UserHistory
ShoppingList
ShoppingListItem
GeneratedImage
NutritionEstimate
Feedback
UsageEvent
Subscription
LegalAcceptance
```

Important fields:

```text
Recipe:
  id
  owner_user_id nullable
  session_id nullable
  name
  description
  meal_type
  cuisine_style
  ingredients jsonb
  steps jsonb
  nutrition jsonb
  image_url
  image_status
  payload jsonb
  created_at

RecipeSession:
  id
  user_id nullable
  scan_id nullable
  intent jsonb
  input_ingredients jsonb
  canonical_ingredients jsonb
  preferences jsonb
  model_metadata jsonb
  status
  created_at

UsageEvent:
  id
  user_id nullable
  event_type
  model
  provider
  input_tokens
  output_tokens
  estimated_cost
  created_at
```

Use JSONB for flexible AI payloads, but keep common query fields as normal columns.

## 12. API Reliability and Edge Cases

### Idempotency

Use idempotency keys for:

- Image generation.
- Recipe generation.
- Save recipe.
- Cooking session creation.
- Account deletion.
- Payments/subscription updates.

### Rate Limits

Rate-limit:

- Auth attempts.
- Image uploads.
- Recipe generation.
- Image generation.
- Regeneration.
- Nutrition explanation.

### Async Work

Some tasks should be background jobs:

- Image generation.
- Multi-recipe nutrition calculation.
- RAG document ingestion.
- Large image uploads.

For MVP, FastAPI background tasks can work. Later, use a queue such as Celery, Dramatiq, RQ, or a managed worker.

### Provider Failures

Fallback order:

```text
intent model fails
-> use simple rule parser or ask follow-up

recipe model fails
-> retry once with same model
-> fallback model
-> return graceful error

image model fails
-> return recipe without image
-> allow retry

nutrition source fails
-> return recipe with no nutrition or cached nutrition
```

### Validation

Every AI output must pass Pydantic validation.

If validation fails:

- Retry once with validation errors.
- If still invalid, return a safe error.
- Log raw model output for debugging, excluding sensitive user data where possible.

### Security

- Never trust AI output as executable logic.
- Never allow AI tools to receive secrets.
- Do not expose provider errors directly to users.
- Validate image uploads by type and size.
- Strip EXIF metadata before permanent storage.
- Store passwords with strong hashing.
- Use refresh token rotation.
- Use row-level access checks on every user-owned resource.

### Privacy

- User food photos may contain home/private context.
- Store images only when necessary.
- Allow deletion of scans and account data.
- Keep legal acceptance versions.
- Avoid sending unnecessary profile data to LLM providers.

## 13. Testing Plan

Backend tests:

- Auth register/login/refresh/logout.
- User preferences CRUD.
- Ingredient scan CRUD.
- Recipe suggestion success and failure.
- Saved recipe CRUD.
- History CRUD.
- Cooking session lifecycle.
- Account deletion.
- Access control between users.

AI tests:

- Intent output schema validation.
- Ingredient normalization aliases.
- Empty ingredient handling.
- Allergy hard-filtering.
- Recipe output validation.
- Tool failure fallback.
- Image generation cache behavior.
- Nutrition calculation assumptions.

Mobile integration tests:

- Auth flow.
- Onboarding answers saved.
- Camera scan -> ingredient review -> suggestions.
- Manual ingredients -> suggestions.
- Save/unsave.
- Cooking session resume.
- Profile edit.
- Delete account.

## 14. Implementation Phases

### Phase 1: Backend Foundation

- Add missing CRUD routes and schemas.
- Add refresh token flow.
- Add preferences/settings tables.
- Wire mobile screens to real endpoints.
- Keep current AI services functional during migration.

### Phase 2: Pydantic AI Workflow

- Add `services/ai/` package.
- Add OpenRouter client.
- Add typed `MealPlanningAgent`.
- Add intent understanding.
- Add validated recipe output.
- Add usage logging.

### Phase 3: Ingredient Intelligence

- Add normalizer and aliases.
- Add Epicure Core loading.
- Add pairing/substitution enrichment.
- Add `/ingredients/normalize` and `/ingredients/enrich`.
- Feed enrichment into recipe generation.

### Phase 4: Image Generation

- Add image generation through OpenRouter or selected cheap provider.
- Add cache.
- Generate top recipe image only.
- Add image status and retry endpoints.

### Phase 5: Nutrition

- Add USDA FoodData Central integration.
- Add unit conversion.
- Add basic nutrition estimate.
- Add nutrition assumptions and confidence.
- Add nutrition explanation RAG later.

### Phase 6: Product Hardening

- Add rate limits.
- Add idempotency keys.
- Add background jobs.
- Add provider fallback.
- Add analytics and usage limits.
- Add privacy/account deletion hardening.

## 15. Acceptance Criteria

MVP backend is ready when:

- A user can register, log in, refresh auth, and delete account.
- A user can complete onboarding and persist preferences.
- A user can scan or manually enter ingredients.
- The backend can normalize ingredients and understand intent.
- The backend can generate 1-3 structured recipe suggestions.
- The backend can save recipes and list saved recipes.
- The backend can store cooking history.
- The backend can start/resume/finish cooking sessions.
- The backend can generate or gracefully skip meal images.
- AI outputs are validated with Pydantic models.
- Provider failures do not crash the user flow.
- All user-owned resources enforce access control.

## 16. First Concrete Build Step

Start with backend foundation and AI workflow scaffolding:

```text
1. Add settings for OpenRouter and model names.
2. Add services/ai/openrouter_client.py.
3. Add services/ai/agents.py with typed Pydantic AI output models.
4. Add /recipes/suggest implementation that uses the new workflow.
5. Add usage event logging.
6. Keep old ai_recipes.py as a fallback until the new workflow is stable.
```

This produces immediate product value while preserving the existing backend behavior as a safety net.
