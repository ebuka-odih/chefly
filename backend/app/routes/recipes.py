import concurrent.futures
from typing import List, Optional
from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException, Request
from sqlalchemy import or_
from sqlalchemy.orm import Session

from app.db.database import get_db
from app.db.models import Recipe, UserSavedRecipe, User
from app.schemas.recipes import (
    RecipeRequest,
    RecipeResponse,
    SaveRecipeRequest,
    RecipePreferences,
    SavedRecipeResponse,
    SavedRecipeUpdate,
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


def _saved_recipe_response(recipe: Recipe) -> SavedRecipeResponse:
    payload = recipe.payload or {}
    return SavedRecipeResponse(id=payload.get("client_id") or str(recipe.id), **payload)


def _saved_recipe_query(db: Session, user_id, recipe_id: str):
    filters = [Recipe.payload["client_id"].as_string() == recipe_id]
    try:
        filters.append(Recipe.id == UUID(recipe_id))
    except ValueError:
        pass

    return db.query(Recipe).join(UserSavedRecipe).filter(
        UserSavedRecipe.user_id == user_id,
        or_(*filters),
    )


@router.post("/save", response_model=SavedRecipeResponse)
def save_recipe(
    recipe_data: SaveRecipeRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    existing = None
    if recipe_data.client_id:
        existing = _saved_recipe_query(db, current_user.id, recipe_data.client_id).first()
    if not existing:
        existing = db.query(Recipe).join(UserSavedRecipe).filter(
            UserSavedRecipe.user_id == current_user.id,
            Recipe.name == recipe_data.name,
            Recipe.description == recipe_data.description,
        ).first()
    if existing:
        return _saved_recipe_response(existing)

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
    db.refresh(new_recipe)

    return _saved_recipe_response(new_recipe)


@router.get("/saved", response_model=List[SavedRecipeResponse])
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
    return [_saved_recipe_response(r) for r in saved_recipes]


@router.get("/saved/{recipe_id}", response_model=SavedRecipeResponse)
def get_saved_recipe(
    recipe_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    recipe = _saved_recipe_query(db, current_user.id, recipe_id).first()
    if not recipe:
        raise HTTPException(status_code=404, detail="Saved recipe not found")
    return _saved_recipe_response(recipe)


@router.put("/saved/{recipe_id}", response_model=SavedRecipeResponse)
def update_saved_recipe(
    recipe_id: str,
    update: SavedRecipeUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    recipe = _saved_recipe_query(db, current_user.id, recipe_id).first()
    if not recipe:
        raise HTTPException(status_code=404, detail="Saved recipe not found")

    payload = dict(recipe.payload or {})
    patch = update.model_dump(exclude_unset=True)
    payload.update(patch)
    recipe.payload = payload
    recipe.name = payload.get("name", recipe.name)
    recipe.description = payload.get("description", recipe.description)
    recipe.image_url = payload.get("image_url")
    db.commit()
    db.refresh(recipe)
    return _saved_recipe_response(recipe)


@router.delete("/saved/{recipe_id}", status_code=204)
def delete_saved_recipe(
    recipe_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    recipe = _saved_recipe_query(db, current_user.id, recipe_id).first()
    saved = None
    if recipe:
        saved = db.query(UserSavedRecipe).filter(
            UserSavedRecipe.user_id == current_user.id,
            UserSavedRecipe.recipe_id == recipe.id,
        ).first()
    if not saved:
        raise HTTPException(status_code=404, detail="Saved recipe not found")

    db.delete(saved)
    db.commit()
    return None


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
