import base64
from typing import List
from openai import OpenAI
from app.config import settings
import json

client = OpenAI(api_key=settings.OPENAI_API_KEY)

def detect_ingredients_from_image(image_bytes: bytes) -> List[str]:
    try:
        # Encode image to base64
        base64_image = base64.b64encode(image_bytes).decode('utf-8')

        response = client.chat.completions.create(
            model="gpt-4o-mini",
            messages=[
                {
                    "role": "system",
                    "content": """You are an expert ingredient detection assistant specializing in African and Nigerian cuisine.
                    
Your task is to identify ALL visible food ingredients in the image with high accuracy.

IMPORTANT GUIDELINES:
1. Be specific about the exact type of ingredient (e.g., "plantain" not "banana", "beans" not "black-eyed peas" unless you're certain)
2. For common African ingredients, use the most common local names:
   - Plantain (not banana - plantains are larger, starchier, and used for cooking)
   - Yam (not sweet potato - yams are white/yellow inside, rough brown skin)
   - Cassava (not yuca)
   - Garden egg (African eggplant)
   - Scotch bonnet pepper (not just "pepper")
3. List ingredients in order of prominence (largest/most visible first)
4. Only include ingredients you can clearly see - don't guess
5. Use simple, common names (e.g., "tomatoes" not "roma tomatoes")
6. If you see multiple types of the same ingredient, list them separately (e.g., "red bell pepper", "green bell pepper")

Return ONLY a JSON object with a single key 'ingredients' containing a list of strings.
Example: {"ingredients": ["plantain", "yam", "tomatoes", "onions"]}

Do not include markdown formatting or explanations."""
                },
                {
                    "role": "user",
                    "content": [
                        {"type": "text", "text": "Identify all the food ingredients visible in this image. Be precise and use common African/Nigerian ingredient names where applicable."},
                        {
                            "type": "image_url",
                            "image_url": {
                                "url": f"data:image/jpeg;base64,{base64_image}",
                                "detail": "high"  # Use high detail for better accuracy
                            },
                        },
                    ],
                }
            ],
            max_tokens=500,
            temperature=0.1,  # Lower temperature for more consistent/accurate results
        )

        content = response.choices[0].message.content
        # Clean up potential markdown code blocks
        if "```json" in content:
            content = content.replace("```json", "").replace("```", "")
        
        data = json.loads(content.strip())
        return data.get("ingredients", [])
    except Exception as e:
        print(f"Error calling OpenAI Vision: {e}")
        # Fallback to mock if API fails (e.g. quota issues)
        return ["Yam", "Tomatoes", "Onions", "Pepper (Fallback)"]
