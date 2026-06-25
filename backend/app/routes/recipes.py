import concurrent.futures
from typing import List, Optional

from fastapi import APIRouter, Depends, Request
from sqlalchemy.orm import Session

from app.db.database import get_db
from app.db.models import Recipe, UserSavedRecipe, User
from app.schemas.recipes import (
    RecipeRequest,
    RecipeResponse,
    SaveRecipeRequest,
    RecipePreferences,
    RecipeBase,
    VisualizeStepsRequest,
)
from app.services.ai_recipes import generate_recipes_from_ingredients
from app.services.image_generation import generate_step_image
from app.utils.security import get_current_user
from app.utils.urls import absolute_url

router = APIRouter()


@router.post("/suggest", response_model=RecipeResponse)
def suggest_recipes(request: RecipeRequest):
    """Time-aware recipe suggestions. Public (anonymous scans allowed)."""
    preferences = request.preferences or RecipePreferences()
    recipes = generate_recipes_from_ingredients(
        request.ingredients,
        preferences,
        local_time=request.local_time,
        local_hour=request.local_hour,
    )
    return {"recipes": recipes}


@router.post("/save", response_model=RecipeBase)
def save_recipe(
    recipe_data: SaveRecipeRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    new_recipe = Recipe(
        name=recipe_data.name,
        description=recipe_data.description,
        image_url=recipe_data.image_url,
        payload=recipe_data.model_dump(),
    )
    db.add(new_recipe)
    db.commit()
    db.refresh(new_recipe)

    user_saved = UserSavedRecipe(user_id=current_user.id, recipe_id=new_recipe.id)
    db.add(user_saved)
    db.commit()

    return recipe_data


@router.get("/saved", response_model=List[RecipeBase])
def get_saved_recipes(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    saved_recipes = (
        db.query(Recipe)
        .join(UserSavedRecipe)
        .filter(UserSavedRecipe.user_id == current_user.id)
        .order_by(UserSavedRecipe.created_at.desc())
        .all()
    )
    return [RecipeBase(**r.payload) for r in saved_recipes]


@router.post("/visualize", response_model=List[Optional[str]])
def visualize_steps(request: VisualizeStepsRequest, http_request: Request):
    """Generate images for cooking steps (called when entering cooking mode).

    Returns a list aligned with the input steps; an entry is null if that step's
    image could not be generated.
    """
    steps_to_process = request.steps[:5]  # cap cost
    results: List[Optional[str]] = [None] * len(steps_to_process)

    with concurrent.futures.ThreadPoolExecutor(max_workers=3) as executor:
        future_to_index = {
            executor.submit(generate_step_image, step): i
            for i, step in enumerate(steps_to_process)
        }
        for future in concurrent.futures.as_completed(future_to_index):
            index = future_to_index[future]
            try:
                results[index] = absolute_url(http_request, future.result())
            except Exception as exc:  # noqa: BLE001
                print(f"[recipes] Step {index} image failed: {exc}")
                results[index] = None

    return results
