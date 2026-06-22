# Chefly — Product & Positioning Spec

**Version:** 1.0 · June 2026
**Tagline:** *Snap what you have. Cook what you'll love.*

> One-liner: Chefly is the fastest, most delightful AI chef — snap a photo of your raw
> ingredients and get a personalized, **time-aware** meal suggestion with a beautiful
> generated image of the finished dish.

---

## 1. Positioning

| | |
|---|---|
| **Problem** | Decision fatigue ("what do I cook?"), food waste, and recipe tools that ignore *time of day* (no one wants a 2-hour roast at 7pm on a Tuesday). |
| **Solution** | AI vision reads a photo of loose/raw ingredients, then returns 1–3 meals ranked for the current time of day — full recipe + a photorealistic image of the plated dish. |
| **Why we win** | Time-aware intelligence · works on raw/loose items (not just fridge scans) · stunning, shareable visuals · built for virality from day one. |

## 2. Audience

- **Primary:** busy professionals & parents (25–45) who cook 4–7×/week and hate waste + decision fatigue.
- **Secondary:** students, singles, couples, and food content creators.

## 3. Core flow (MVP)

1. Open → big **Snap ingredients** button.
2. Photo (or upload) of raw items → optional notes ("15 mins", "spicy ok", dietary).
3. Chefly analyzes photo **+ current time of day**.
4. Returns 1–3 ranked meal suggestions.
5. Tap one → recipe card + large photorealistic dish image.
6. One-tap: Save · Shopping list (missing items) · Share · **Cook now** (timer mode).

## 4. Features

**MVP**
- Ingredient detection from photo
- Time-of-day-aware suggestions
- Recipe generation (steps, timing, substitutions)
- Generated hero image of the final dish
- Clean, shareable recipe card
- Share to TikTok / Reels / Instagram / WhatsApp

**Phase 2**
- Saved dietary prefs & filters · meal history + "remix this"
- Weekly planning from multiple photos · voice input · community feed

**Virality (build in early)**
- Auto-generated shareable card with subtle Chefly watermark (toggle off in Pro)
- "Before & after" (raw photo → plated dish)
- One-tap post with suggested caption · influencer **web** version (no install needed)

## 5. Tech & cost (image generation)

- **Model:** Flux (Schnell/Dev) via Fal.ai or Replicate, **or** Google Imagen 4 (Fast tier).
- Generate **only the top dish** by default ("generate all" is a Pro feature).
- Aggressive image caching · detailed food-specific prompts.
- **Target: < $0.03 per generated image** at scale.
- Fallback: high-quality text recipe + tasteful placeholder if generation fails.

## 6. Monetization (freemium)

- **Free:** 5–10 scans/month + basic recipes.
- **Pro ($4.99–9.99/mo or lifetime):** unlimited scans, priority image gen, advanced filters, weekly plans, no share watermark.
- **Later:** premium-visuals packs · affiliate grocery delivery.

## 7. Brand & design

- **Tone:** helpful, delightful, lightly playful — "your smart kitchen friend who actually gets it." Never condescending.
- **Visual:** clean, modern, appetizing. Warm palette (soft oranges, greens, creams). Large generated dish images as the hero. Every result screen should look Instagram/TikTok-ready.
- **Shareable output:** recipe card must look premium when screenshotted; dish image is the hero; optional "Made with Chefly" watermark.
- See [`DESIGN.md`](DESIGN.md) for the concrete design system and [`design-concept.html`](design-concept.html) for the visual direction.

## 8. Success metrics (first 90 days)

- **Activation:** % completing first scan + viewing a generated image
- **Share rate:** % of results shared
- **Retention:** D7 / D30 actives
- **Cost:** per generated image (< $0.03)

## 9. AI prompt templates

**Vision + recipe**
> You are an expert chef. Analyze this photo of raw ingredients. Consider the current time of
> day. Suggest 1–3 realistic meals using mostly these ingredients, favoring quick and delicious
> options. For each: name, why it fits now, ingredients with quantities, step-by-step
> instructions, total time, and difficulty.

**Image generation (Flux / Imagen)**
> Photorealistic professional food photography of [dish name], beautifully plated on a modern
> plate, appetizing lighting, gentle steam, restaurant-quality presentation, slight 45° angle,
> highly detailed, mouth-watering. No text, no hands, no cutlery unless natural.
