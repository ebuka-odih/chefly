from fastapi import APIRouter, Request

from app.schemas.images import ImageGenerationRequest, ImageGenerationResponse
from app.services.image_generation import generate_dish_image
from app.utils.urls import absolute_url

router = APIRouter()


@router.post("/generate", response_model=ImageGenerationResponse)
def generate_image(request: ImageGenerationRequest, http_request: Request):
    """Generate a photorealistic dish image for a recipe (on demand)."""
    try:
        image_url = generate_dish_image(request.recipe_name, request.recipe_description)
        if image_url:
            return {
                "image_url": absolute_url(http_request, image_url),
                "success": True,
                "message": "Image generated successfully",
            }
        return {
            "image_url": None,
            "success": False,
            "message": "Image generation unavailable",
        }
    except Exception as e:  # noqa: BLE001
        return {"image_url": None, "success": False, "message": f"Error: {str(e)}"}
