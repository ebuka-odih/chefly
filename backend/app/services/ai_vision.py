import base64
import json
from typing import List

from app.config import settings
from app.services.llm import get_client

VISION_SYSTEM_PROMPT = """You are Chefly's ingredient-detection vision model.

Your only job: look at a photo of raw / loose groceries and list the distinct,
usable food ingredients you can actually see.

Rules:
1. Identify the SPECIFIC item, not a vague category:
   - "plantain" not "banana"  ·  "yam" not "sweet potato"  ·  "cassava" not "yuca"
   - "scotch bonnet" / "bell pepper" not just "pepper"  ·  "garden egg" for African eggplant
2. Use simple, lower-case common names ("tomatoes", "onions", "rice").
3. List in order of prominence (most visible / largest first).
4. Only list what you can clearly see — never guess or pad the list.
5. Merge obvious duplicates; split genuinely different items
   (e.g. "red bell pepper", "green bell pepper").
6. Ignore non-food items, packaging, hands, and background clutter.

Return ONLY a JSON object: {"ingredients": ["...", "..."]}.
No markdown, no prose, no explanations."""


def detect_ingredients_from_image(image_bytes: bytes) -> List[str]:
    """Detect food ingredients in an image using the OpenRouter vision model.

    Returns an empty list on failure (the caller / client decides what to do —
    we never fabricate ingredients that aren't in the photo).
    """
    if not settings.ai_enabled:
        print("[ai_vision] No AI key configured; returning empty ingredient list.")
        return []

    try:
        base64_image = base64.b64encode(image_bytes).decode("utf-8")
        client = get_client()

        response = client.chat.completions.create(
            model=settings.VISION_MODEL,
            messages=[
                {"role": "system", "content": VISION_SYSTEM_PROMPT},
                {
                    "role": "user",
                    "content": [
                        {
                            "type": "text",
                            "text": "List every food ingredient visible in this photo as JSON.",
                        },
                        {
                            "type": "image_url",
                            "image_url": {
                                "url": f"data:image/jpeg;base64,{base64_image}",
                                "detail": "high",
                            },
                        },
                    ],
                },
            ],
            max_tokens=500,
            temperature=0.1,
            response_format={"type": "json_object"},
        )

        content = response.choices[0].message.content or "{}"
        content = content.replace("```json", "").replace("```", "").strip()
        data = json.loads(content)
        ingredients = data.get("ingredients", [])
        # Normalise: strings only, trimmed, de-duplicated, non-empty.
        seen, cleaned = set(), []
        for item in ingredients:
            if not isinstance(item, str):
                continue
            name = item.strip().lower()
            if name and name not in seen:
                seen.add(name)
                cleaned.append(name)
        return cleaned
    except Exception as e:  # noqa: BLE001 - surface the error, degrade gracefully
        print(f"[ai_vision] Error calling vision model: {e}")
        return []
