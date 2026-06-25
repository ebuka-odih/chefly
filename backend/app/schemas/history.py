from pydantic import BaseModel, Field
from typing import List, Optional
from datetime import datetime
from uuid import UUID


class HistoryCreate(BaseModel):
    """Log that a user cooked / chose a recipe from a set of ingredients."""
    ingredients: List[str] = Field(default_factory=list)
    recipe_name: str
    recipe: Optional[dict] = None  # full recipe payload (optional)


class HistoryItem(BaseModel):
    id: UUID
    ingredients: List[str]
    recipe_name: str
    recipe: Optional[dict] = None
    created_at: datetime

    class Config:
        from_attributes = True


class HistoryResponse(BaseModel):
    history: List[HistoryItem]
