from fastapi import APIRouter, UploadFile, File
from app.schemas.ingredients import IngredientDetectionResponse
from app.services.ai_vision import detect_ingredients_from_image

router = APIRouter()

@router.post("/detect", response_model=IngredientDetectionResponse)
async def detect_ingredients(file: UploadFile = File(...)):
    contents = await file.read()
    ingredients = detect_ingredients_from_image(contents)
    return {"ingredients": ingredients}
