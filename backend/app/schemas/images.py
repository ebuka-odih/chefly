from pydantic import BaseModel
from typing import Optional

class ImageGenerationRequest(BaseModel):
    recipe_name: str
    recipe_description: Optional[str] = ""

class ImageGenerationResponse(BaseModel):
    image_url: Optional[str] = None
    success: bool
    message: Optional[str] = None
