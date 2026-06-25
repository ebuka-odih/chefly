from pydantic import BaseModel, Field
from typing import List, Optional


class RecipeBase(BaseModel):
    name: str
    description: str
    why_now: Optional[str] = None  # why this fits the current time of day
    estimated_time_minutes: int
    difficulty: str
    meal_type: str
    image_url: Optional[str] = None
    uses_from_user: List[str] = Field(default_factory=list)
    extra_ingredients: List[str] = Field(default_factory=list)
    steps: List[str] = Field(default_factory=list)
    step_images: Optional[List[Optional[str]]] = None  # image URL per step


class RecipeResponse(BaseModel):
    recipes: List[RecipeBase]


class RecipePreferences(BaseModel):
    cuisine: Optional[str] = "African"
    spice_level: Optional[str] = "Medium"
    max_time: Optional[int] = 60
    avoid: Optional[List[str]] = Field(default_factory=list)  # ingredients to never use


class RecipeRequest(BaseModel):
    ingredients: List[str]
    preferences: Optional[RecipePreferences] = None
    # Time-of-day awareness — client may pass its local time so suggestions are
    # ranked for the user's actual moment (falls back to server time if absent).
    local_time: Optional[str] = None  # ISO 8601, e.g. "2026-06-22T19:30:00"
    local_hour: Optional[int] = None  # 0-23, alternative to local_time


class SaveRecipeRequest(RecipeBase):
    pass


class VisualizeStepsRequest(BaseModel):
    steps: List[str]
