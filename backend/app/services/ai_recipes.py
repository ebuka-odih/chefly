import json
from typing import List
from openai import OpenAI
from app.config import settings
from app.schemas.recipes import RecipeBase, RecipePreferences

client = OpenAI(api_key=settings.OPENAI_API_KEY)

def generate_anime_recipe_card(recipe_name: str, recipe_description: str) -> str:
    """
    Generate 3D anime-style card image for a recipe.
    This is shown on the recipe card in the suggestions list.
    """
    try:
        prompt = f"""A single plate of {recipe_name} on a white ceramic plate, 3D rendered in anime game art style.

{recipe_description}

MUST INCLUDE: Only the finished dish, plated and ready to eat
MUST EXCLUDE: No people, no hands, no utensils, no ingredients, no cooking process
Style: 3D anime render like Genshin Impact food items
View: 45-degree angle from above
Lighting: Soft natural light, warm tones
Background: Simple solid color gradient, blurred"""
        
        response = client.images.generate(
            model="dall-e-3",
            prompt=prompt,
            size="1024x1024",
            quality="hd",
            n=1,
        )
        
        return response.data[0].url
        
    except Exception as e:
        print(f"Error generating 3D anime recipe card: {e}")
        return None

def generate_anime_step_image(step_text: str) -> str:
    """
    Generate 3D anime-style illustration for a cooking step.
    This is generated on-demand when user enters cooking mode.
    """
    try:
        # Extract key items from the step text
        prompt = f"""3D anime game-style illustration showing: {step_text}

MUST SHOW: Only the ingredients and cooking tools mentioned in the step
MUST EXCLUDE: No people, no hands, no arms, no human body parts
View: Top-down or isometric angle
Style: Clean 3D render like cooking game interface (Genshin Impact, Cooking Mama)
Lighting: Bright, even lighting
Background: Simple white or light gray surface
Focus: Clear view of the items involved in this specific cooking step"""
        
        response = client.images.generate(
            model="dall-e-3",
            prompt=prompt,
            size="1024x1024",
            quality="hd",
            n=1,
        )
        
        return response.data[0].url
        
    except Exception as e:
        print(f"Error generating 3D anime step image: {e}")
        return None

def generate_recipes_from_ingredients(ingredients: List[str], preferences: RecipePreferences) -> List[RecipeBase]:
    try:
        prompt = f"""
        Suggest 2-3 {preferences.cuisine} meals based on these ingredients: {', '.join(ingredients)}.
        Preferences: Spice Level: {preferences.spice_level}, Max Time: {preferences.max_time} mins.
        
        Return ONLY a JSON object with a key 'recipes' containing a list of recipe objects.
        Each recipe object must have:
        - name (string)
        - description (string)
        - estimated_time_minutes (int)
        - difficulty (string: Easy, Medium, Hard)
        - meal_type (string: Breakfast, Lunch, Dinner)
        - uses_from_user (list of strings, ingredients from my list used)
        - extra_ingredients (list of strings, other ingredients needed)
        - steps (list of strings)

        Do not use markdown formatting.
        """

        response = client.chat.completions.create(
            model="gpt-4o-mini",
            messages=[
                {"role": "system", "content": "You are a helpful chef assistant. You output strict JSON."},
                {"role": "user", "content": prompt}
            ],
            response_format={"type": "json_object"}
        )

        content = response.choices[0].message.content
        data = json.loads(content)
        
        # Validate and convert to Pydantic models
        recipes = []
        for r in data.get("recipes", []):
            recipe = RecipeBase(**r)
            
            # Generate anime-style card image for the recipe
            try:
                card_image = generate_anime_recipe_card(recipe.name, recipe.description)
                recipe.image_url = card_image
            except Exception as img_err:
                print(f"Error generating card image for {recipe.name}: {img_err}")
                recipe.image_url = None
            
            # Step images will be generated on-demand when user enters cooking mode
            recipe.step_images = []
            
            recipes.append(recipe)
            
        return recipes

    except Exception as e:
        print(f"Error generating recipes: {e}")
        return [
            RecipeBase(
                name="Fried Yam & Egg Sauce (Fallback)",
                description="Crispy fried yam served with spicy egg sauce.",
                estimated_time_minutes=30,
                difficulty="Easy",
                meal_type="Breakfast",
                uses_from_user=["Yam", "Eggs"],
                extra_ingredients=["Oil", "Salt"],
                steps=["Fry yam.", "Fry eggs."],
                step_images=[]
            )
        ]
