from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
from app.db.database import get_db
from app.db.models import Recipe, UserSavedRecipe, User
from app.schemas.recipes import RecipeRequest, RecipeResponse, SaveRecipeRequest, RecipePreferences, RecipeBase, VisualizeStepsRequest
from app.services.ai_recipes import generate_recipes_from_ingredients
from app.utils.security import get_current_user

router = APIRouter()

@router.post("/suggest", response_model=RecipeResponse)
def suggest_recipes(request: RecipeRequest):
    preferences = request.preferences or RecipePreferences()
    recipes = generate_recipes_from_ingredients(request.ingredients, preferences)
    return {"recipes": recipes}

@router.post("/save", response_model=RecipeBase)
def save_recipe(
    recipe_data: SaveRecipeRequest, 
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    # 1. Check if recipe already exists (by name and description, or just create new)
    # For simplicity, we'll create a new one or check if we can deduplicate.
    # Since these are AI generated, they don't have IDs yet.
    
    new_recipe = Recipe(
        name=recipe_data.name,
        description=recipe_data.description,
        image_url=recipe_data.image_url,
        payload=recipe_data.model_dump()
    )
    db.add(new_recipe)
    db.commit()
    db.refresh(new_recipe)
    
    # 2. Save to user's saved recipes
    user_saved = UserSavedRecipe(
        user_id=current_user.id,
        recipe_id=new_recipe.id
    )
    db.add(user_saved)
    db.commit()
    
    return recipe_data

@router.get("/saved", response_model=List[RecipeBase])
def get_saved_recipes(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    saved_recipes = db.query(Recipe).join(UserSavedRecipe).filter(
        UserSavedRecipe.user_id == current_user.id
    ).all()
    
    # Convert DB models to Pydantic models
    # We stored the full data in payload, so we can use that
    return [RecipeBase(**r.payload) for r in saved_recipes]

@router.post("/visualize", response_model=List[str])
def visualize_steps(request: VisualizeStepsRequest):
    """
    Generate anime-style images for each cooking step.
    Called when user enters cooking mode.
    Returns a list of image URLs corresponding to the steps.
    """
    from app.services.ai_recipes import generate_anime_step_image
    import concurrent.futures
    
    # Limit to first 5 steps
    steps_to_process = request.steps[:5]
    
    # Generate images in parallel
    with concurrent.futures.ThreadPoolExecutor(max_workers=3) as executor:
        future_to_step = {executor.submit(generate_anime_step_image, step): i for i, step in enumerate(steps_to_process)}
        
        results = [None] * len(steps_to_process)
        for future in concurrent.futures.as_completed(future_to_step):
            index = future_to_step[future]
            try:
                results[index] = future.result()
            except Exception as exc:
                print(f'Step {index} generated an exception: {exc}')
                results[index] = None
                
    return results
