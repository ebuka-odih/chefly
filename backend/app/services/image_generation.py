"""Dish & step image generation via OpenRouter.

OpenRouter has no `/images` endpoint, so we call an image-capable chat model
(google/gemini-2.5-flash-image by default) with `modalities: [image, text]` and
read the returned base64 PNG.
"""
import base64
import hashlib
import os
from typing import Optional

import requests

from app.config import settings

# app/services/image_generation.py -> app/static/images
STATIC_DIR = os.path.normpath(os.path.join(os.path.dirname(__file__), "..", "static", "images"))

DISH_PROMPT = (
    "Photorealistic professional food photography of {name}, beautifully plated on a "
    "modern plate, appetizing lighting, gentle steam, restaurant-quality presentation, "
    "slight 45-degree angle, highly detailed, mouth-watering. {description} "
    "No text, no hands, no cutlery unless natural."
)

STEP_PROMPT = (
    "Clean, well-lit overhead photo illustrating this single cooking step: {step}. "
    "Show only the food, ingredients and cookware involved — no people, no hands, no faces. "
    "Bright, appetising, modern kitchen styling. No text."
)


def _cache_path(prompt: str) -> tuple[str, str]:
    digest = hashlib.sha256(prompt.encode("utf-8")).hexdigest()[:32]
    return digest, os.path.join(STATIC_DIR, f"{digest}.png")


def generate_image_from_prompt(prompt: str) -> Optional[str]:
    """Generate (or return cached) image for a prompt.

    Returns "/static/images/<hash>.png", a "data:image/png;base64,..." URL, or None.
    """
    if not settings.ai_enabled:
        return None

    digest, path = _cache_path(prompt)
    rel_url = f"/static/images/{digest}.png"

    if os.path.exists(path):
        return rel_url

    try:
        resp = requests.post(
            f"{settings.OPENROUTER_BASE_URL}/chat/completions",
            headers={
                "Authorization": f"Bearer {settings.ai_key}",
                "Content-Type": "application/json",
                "HTTP-Referer": "https://chefly.app",
                "X-Title": "Chefly",
            },
            json={
                "model": settings.IMAGE_MODEL,
                "messages": [{"role": "user", "content": prompt}],
                "modalities": ["image", "text"],
            },
            timeout=120,
        )
        resp.raise_for_status()
        data = resp.json()

        images = data.get("choices", [{}])[0].get("message", {}).get("images")
        if not images:
            print(f"[image_generation] No image returned: {data.get('error') or data}")
            return None

        data_url = images[0]["image_url"]["url"]
        b64 = data_url.split(",", 1)[1] if "," in data_url else data_url
        raw = base64.b64decode(b64)

        try:
            os.makedirs(STATIC_DIR, exist_ok=True)
            with open(path, "wb") as fh:
                fh.write(raw)
            return rel_url
        except OSError as disk_err:
            print(f"[image_generation] Could not cache to disk ({disk_err}); returning data URL.")
            return data_url

    except Exception as e:  # noqa: BLE001
        print(f"[image_generation] Error generating image: {e}")
        return None


def generate_dish_image(recipe_name: str, recipe_description: str = "") -> Optional[str]:
    return generate_image_from_prompt(
        DISH_PROMPT.format(name=recipe_name, description=recipe_description or "")
    )


def generate_step_image(step_text: str) -> Optional[str]:
    return generate_image_from_prompt(STEP_PROMPT.format(step=step_text))
