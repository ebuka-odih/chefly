from fastapi import APIRouter
from app.schemas.images import ImageGenerationRequest, ImageGenerationResponse
from app.services.image_generation import generate_recipe_image

router = APIRouter()

@router.post("/generate", response_model=ImageGenerationResponse)
def generate_image(request: ImageGenerationRequest):
    """
    Generate an image for a recipe using Google Gemini Imagen
    """
    try:
        image_url = generate_recipe_image(request.recipe_name, request.recipe_description)
        
        if image_url:
            return {
                "image_url": image_url,
                "success": True,
                "message": "Image generated successfully"
            }
        else:
            return {
                "image_url": None,
                "success": False,
                "message": "Failed to generate image"
            }
    except Exception as e:
        return {
            "image_url": None,
            "success": False,
            "message": f"Error: {str(e)}"
        }
