from pydantic import BaseModel
from typing import List, Optional

class IngredientList(BaseModel):
    ingredients: List[str]

class IngredientDetectionResponse(BaseModel):
    ingredients: List[str]
