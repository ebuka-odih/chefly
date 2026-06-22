# Chefly Backend — Implementation Notes

**Status:** implemented, tested (19/19 e2e checks pass), deployed via Dokploy.
**Date:** June 2026

This document records what was built to take the backend from the spec
(`docs/BACKEND.json`, `docs/MIGRATION.md`) to a deployable, working service.

---

## 1. What changed and why

The repo already had a FastAPI skeleton, but it could not deploy or run as-is:

| Problem (before) | Fix (now) |
|---|---|
| **No `Dockerfile`** — Dokploy build failed with `failed to read dockerfile`. | Added `backend/Dockerfile` + `.dockerignore` (Dokploy's build context is `backend/`). |
| Used the **OpenAI API directly** (`OPENAI_API_KEY`, `GOOGLE_API_KEY`), but the server only has **`OPENROUTER_KEY`**. App crashed at import. | All AI calls now go through **OpenRouter** (OpenAI-compatible). Single shared client in `services/llm.py`. |
| `config.py` **required** keys with no defaults → boot crash when unset. | Every setting has a safe default; only `OPENROUTER_KEY` is needed for live AI. |
| `requirements.txt` **missing** `python-jose`, `passlib`/`argon2`, `email-validator` (all imported in code) → runtime ImportError. | Requirements completed; unused `google-generativeai`/`pillow` removed. |
| **No `/history` endpoint** though `UserHistory` model existed (spec lists `GET /history`). | Added `routes/history.py` (`GET` + `POST /history`). |
| Recipe suggestions were **not time-aware** (the headline feature in `MIGRATION.md`). | Added time-of-day context + rewrote the recipe prompt. |
| Dish images generated with **DALL·E inside `/recipes/suggest`** — slow, expensive, unavailable on OpenRouter. | Image gen **decoupled** to on-demand `/images/generate`, via OpenRouter's image model, with disk caching. |
| Image generation returned giant base64 in JSON. | Images are **saved to disk** and served from `/static/images/...`; only a URL is returned. |
| No health check for the orchestrator. | Added `GET /health` (checks DB + AI config); Docker `HEALTHCHECK` wired to it. |
| Branding still "ChopWhat". | API title/root now "Chefly". |

---

## 2. Architecture

```
mobile (Expo/RN)  ──HTTP──▶  FastAPI (Dokploy container)
                                 ├── /ingredients/detect   → OpenRouter vision  (gpt-4o-mini)
                                 ├── /recipes/suggest       → OpenRouter recipes (gpt-4.1-mini, time-aware)
                                 ├── /images/generate       → OpenRouter image   (gemini-2.5-flash-image)
                                 ├── /recipes/visualize     → step images (on demand)
                                 ├── /recipes/save·saved    → Postgres
                                 ├── /history (GET·POST)    → Postgres
                                 ├── /auth/*                → Postgres + JWT
                                 └── /static/images/*       → generated images (disk cache)
                                          │
                                          ▼
                                  Postgres (chefly-db, Dokploy)
```

All LLM traffic is funneled through `app/services/llm.py` → one OpenRouter client.

### Models (overridable via env)
| Role | OpenRouter model | Env var |
|---|---|---|
| Vision (ingredient detection) | `openai/gpt-4o-mini` | `VISION_MODEL` |
| Recipes (structured JSON) | `openai/gpt-4.1-mini` | `RECIPE_MODEL` |
| Images (dish + steps) | `google/gemini-2.5-flash-image` | `IMAGE_MODEL` |

Vision/recipe models match `docs/BACKEND.json`. Image model is OpenRouter's
"Nano Banana" (~$0.039/image; the only piece slightly above the `< $0.03` target).

---

## 3. Time-aware intelligence (the headline feature)

`MIGRATION.md` positions Chefly on *time-of-day awareness* — "no one wants a
2-hour roast at 7pm on a Tuesday." Implemented in `app/utils/timeofday.py`:

- The client may send `local_time` (ISO) or `local_hour` (0–23) on
  `/recipes/suggest`; otherwise the server's clock is used.
- The hour maps to a meal period — **Breakfast / Brunch / Lunch / Snack /
  Dinner / Late night** — each with a one-line steer for the model.
- That context is injected into the recipe prompt, and each recipe returns a
  **`why_now`** field explaining why it fits the current moment.

Verified behaviour (same ingredients, different hour):
- `local_hour: 7` → all **Breakfast** suggestions
- `local_hour: 20` → all **Dinner** suggestions

---

## 4. Improved AI prompts

### Vision (`services/ai_vision.py`)
- Strict-JSON system prompt; `response_format={"type":"json_object"}`.
- Specificity rules (plantain≠banana, yam≠sweet potato, scotch bonnet, garden egg).
- Output normalised: lower-cased, trimmed, de-duplicated.
- **Never fabricates** ingredients — returns `[]` on failure instead of mock data,
  so the UI/user is never shown food that isn't in the photo.

### Recipes (`services/ai_recipes.py`)
- Time-aware system prompt (see §3).
- Honors `cuisine`, `spice_level`, `max_time`, and a new **`avoid`** list
  (ingredients to never use — maps to the Profile "Avoid Ingredients" setting).
- Asks for an exact JSON shape; malformed entries are skipped, not fatal.
- Always returns at least a tasteful fallback recipe so the UI is never empty.

### Images (`services/image_generation.py`)
- Uses the photorealistic dish prompt from `MIGRATION.md` §9.
- **Hash-based disk cache**: identical prompts return instantly and cost nothing
  (measured: 7.7s first call → 0.025s cache hit).

---

## 5. API reference

| Method | Path | Auth | Notes |
|---|---|---|---|
| GET | `/` | – | welcome + docs link |
| GET | `/health` | – | `{status, database, ai_configured}` |
| POST | `/ingredients/detect` | – | multipart `file` → `{ingredients: [...]}` |
| POST | `/recipes/suggest` | – | time-aware; body below |
| POST | `/recipes/save` | ✅ | save a recipe to the user |
| GET | `/recipes/saved` | ✅ | list saved recipes |
| POST | `/recipes/visualize` | – | `{steps:[...]}` → list of step image URLs |
| POST | `/images/generate` | – | `{recipe_name, recipe_description}` → image URL |
| POST | `/history` | ✅ | log a cooked recipe |
| GET | `/history` | ✅ | user cooking history (newest first) |
| POST | `/auth/register` · `/auth/login` · GET `/auth/me` | – / – / ✅ | JWT |

`POST /recipes/suggest` body:
```json
{
  "ingredients": ["rice", "tomatoes", "onions", "chicken"],
  "preferences": { "cuisine": "Nigerian", "spice_level": "Medium",
                   "max_time": 45, "avoid": ["beef"] },
  "local_hour": 20
}
```

Interactive docs: **`/docs`** (Swagger UI) on the running service.

---

## 6. Configuration (env)

| Var | Required | Default | Purpose |
|---|---|---|---|
| `DATABASE_URL` | prod | `sqlite:///./chefly.db` | Postgres in prod; SQLite locally |
| `OPENROUTER_KEY` | for AI | – | OpenRouter API key |
| `OPENROUTER_BASE_URL` | – | `https://openrouter.ai/api/v1` | |
| `VISION_MODEL` / `RECIPE_MODEL` / `IMAGE_MODEL` | – | see §2 | model overrides |
| `SECRET_KEY` | prod | dev default | JWT signing — **set in prod** |
| `ACCESS_TOKEN_EXPIRE_MINUTES` | – | 10080 (7d) | token lifetime |

See `backend/.env.example`. Local dev runs on SQLite with zero Postgres setup
(the models use `JSONB` on Postgres, falling back to generic `JSON` on SQLite).

---

## 7. Deployment (Dokploy)

- **App:** `chefly-api` · **Source:** `github.com/ebuka-odih/chefly` · **Branch:** `main`
- **Build:** `backend/Dockerfile`, with the build context set to `backend/`
  (Dokploy `dockerContextPath=backend`).
- **DB:** `chefly-db` (Postgres) on `dokploy-network`; reached via the
  `DATABASE_URL` service name.
- **Env** is set in Dokploy (`DATABASE_URL`, `OPENROUTER_KEY`, `SECRET_KEY`).
- `autoDeploy` is on → pushing to `main` rebuilds and redeploys.

The container runs `uvicorn app.main:app` on port 8000 with a `/health`
HEALTHCHECK. Generated images live under `/app/app/static` (declared `VOLUME`).

---

## 8. Testing

`backend/test_api.py` is an end-to-end smoke test covering every endpoint:
meta, time-aware suggestions (morning vs evening contrast), auth, save/saved,
and history.

```bash
# against a running server (defaults to 127.0.0.1:8099)
BASE_URL=http://127.0.0.1:8099 python test_api.py
python test_api.py --with-images   # also exercises (slow, paid) image gen
```

Latest local run: **19/19 passed** (image gen verified separately, incl. cache).

---

## 9. Next steps (not in this change)

- **Mobile integration:** the Expo app currently renders mock data
  (`mobile/src/data/mock.ts`). Point the camera/suggestions/cooking flows at the
  deployed API (an `api.ts` client + env base URL).
- **Image storage:** move from local disk to S3/R2 for multi-replica durability
  (spec §5). Today images regenerate after a redeploy unless a volume is mounted.
- **Caching:** add the Redis recipe cache described in `BACKEND.json`
  (`recipes:{ingredients_hash}:{prefs_hash}`).
- **Migrations:** Alembic is in requirements but unused; `create_all` handles the
  fresh schema for now.
