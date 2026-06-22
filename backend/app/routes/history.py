from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.db.database import get_db
from app.db.models import User, UserHistory
from app.schemas.history import HistoryCreate, HistoryItem, HistoryResponse
from app.utils.security import get_current_user

router = APIRouter()


@router.post("", response_model=HistoryItem)
@router.post("/", response_model=HistoryItem, include_in_schema=False)
def log_history(
    entry: HistoryCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Record that the current user cooked / chose a recipe."""
    payload = entry.recipe or {}
    if "name" not in payload:
        payload = {**payload, "name": entry.recipe_name}

    record = UserHistory(
        user_id=current_user.id,
        ingredients=entry.ingredients,
        recipe=payload,
    )
    db.add(record)
    db.commit()
    db.refresh(record)
    return _to_item(record)


@router.get("", response_model=HistoryResponse)
@router.get("/", response_model=HistoryResponse, include_in_schema=False)
def get_history(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Return the current user's cooking history, newest first."""
    rows = (
        db.query(UserHistory)
        .filter(UserHistory.user_id == current_user.id)
        .order_by(UserHistory.created_at.desc())
        .all()
    )
    return {"history": [_to_item(r) for r in rows]}


def _to_item(row: UserHistory) -> HistoryItem:
    recipe = row.recipe or {}
    return HistoryItem(
        id=row.id,
        ingredients=row.ingredients or [],
        recipe_name=recipe.get("name", "Recipe"),
        recipe=recipe,
        created_at=row.created_at,
    )
