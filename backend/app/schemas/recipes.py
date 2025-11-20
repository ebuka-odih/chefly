from pydantic import BaseModel
from typing import List, Optional
from uuid import UUID

class RecipeBase(BaseModel):
    name: str
    description: str
    estimated_time_minutes: int
    difficulty: str
    meal_type: str
    image_url: Optional[str] = None
    uses_from_user: List[str]
    extra_ingredients: List[str]
    steps: List[str]
    step_images: Optional[List[Optional[str]]] = None  # Image URL for each step

class RecipeResponse(BaseModel):
    recipes: List[RecipeBase]

class RecipePreferences(BaseModel):
    cuisine: Optional[str] = "African"
    spice_level: Optional[str] = "Medium"
    max_time: Optional[int] = 60

class RecipeRequest(BaseModel):
    ingredients: List[str]
    preferences: Optional[RecipePreferences] = None

class SaveRecipeRequest(RecipeBase):
    pass

class VisualizeStepsRequest(BaseModel):
    steps: List[str]
