from openai import OpenAI
from app.config import settings

client = OpenAI(api_key=settings.OPENAI_API_KEY)

def generate_recipe_image(recipe_name: str, recipe_description: str) -> str:
    """
    Generate an image for a recipe using OpenAI DALL-E 3
    """
    try:
        prompt = f"""Professional food photography of {recipe_name}. 
        {recipe_description}
        
        Style: High-quality, appetizing, well-lit food photography with vibrant colors.
        Composition: Close-up shot showing the dish plated beautifully on a clean white plate.
        Lighting: Natural daylight, soft shadows, making the food look fresh and delicious.
        Background: Clean, minimal, slightly blurred to focus on the food.
        """
        
        response = client.images.generate(
            model="dall-e-3",
            prompt=prompt,
            size="1024x1024",
            quality="standard",
            n=1,
        )
        
        image_url = response.data[0].url
        return image_url
        
    except Exception as e:
        print(f"Error generating image with DALL-E: {e}")
        return None

def generate_step_image(step_text: str) -> str:
    """
    Generate an image for a cooking step using OpenAI DALL-E 3.
    NOTE: Currently disabled in the app due to slow generation time.
    """
    try:
        prompt = f"""Visual representation of this cooking step: "{step_text}"
        
        Constraints:
        - SHOW ONLY INGREDIENTS, UTENSILS, AND FOOD ITEMS.
        - NO HUMANS, NO HANDS, NO FACES.
        - Style: Photorealistic, bright, clean, high quality.
        - Focus on the action happening to the food (e.g., chopping, boiling, frying) but without showing the person doing it.
        """
        
        response = client.images.generate(
            model="dall-e-3",
            prompt=prompt,
            size="1024x1024",
            quality="standard",
            n=1,
        )
        
        image_url = response.data[0].url
        return image_url
        
    except Exception as e:
        print(f"Error generating step image with DALL-E: {e}")
        return None


def generate_recipe_image_fallback(recipe_name: str) -> str:
    """
    Fallback: Generate a simple placeholder image
    Returns a data URI for a placeholder
    """
    # Return None to use frontend placeholder instead
    return None
