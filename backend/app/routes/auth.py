from datetime import timedelta

from fastapi import APIRouter, Depends, HTTPException
from jose import JWTError
from sqlalchemy.orm import Session

from app.config import settings
from app.db.database import get_db
from app.db.models import User
from app.schemas.auth import (
    AuthSession,
    MagicLinkRequest,
    MagicLinkSent,
    MagicLinkVerify,
    Token,
    UserCreate,
    UserLogin,
    UserResponse,
)
from app.services.mail import build_magic_link, send_magic_link_email
from app.utils.security import (
    create_access_token,
    create_magic_link_token,
    get_current_user,
    get_password_hash,
    verify_magic_link_token,
    verify_password,
)

router = APIRouter()


def _display_name_from_email(email: str) -> str:
    return email.split("@", 1)[0].replace(".", " ").replace("_", " ").strip().title() or "Chefly Cook"


def _issue_session(user: User) -> AuthSession:
    access_token = create_access_token(
        data={"sub": user.email},
        expires_delta=timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES),
    )
    return AuthSession(
        access_token=access_token,
        token_type="bearer",
        user=UserResponse.model_validate(user),
    )

@router.post("/register", response_model=UserResponse)
def register(user: UserCreate, db: Session = Depends(get_db)):
    db_user = db.query(User).filter(User.email == user.email).first()
    if db_user:
        raise HTTPException(status_code=400, detail="Email already registered")
    
    hashed_password = get_password_hash(user.password)
    new_user = User(email=user.email, name=user.name, password_hash=hashed_password)
    db.add(new_user)
    db.commit()
    db.refresh(new_user)
    return new_user

@router.post("/login", response_model=Token)
def login(user_credentials: UserLogin, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.email == user_credentials.email).first()
    if not user:
        raise HTTPException(status_code=400, detail="Invalid credentials")
    
    if not user.password_hash:
        raise HTTPException(status_code=400, detail="Use magic link sign-in for this account")

    if not verify_password(user_credentials.password, user.password_hash):
        raise HTTPException(status_code=400, detail="Invalid credentials")
    
    access_token_expires = timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = create_access_token(
        data={"sub": user.email}, expires_delta=access_token_expires
    )
    return {"access_token": access_token, "token_type": "bearer"}

@router.get("/me", response_model=UserResponse)
def read_users_me(current_user: User = Depends(get_current_user)):
    return current_user


@router.post("/magic-link/request", response_model=MagicLinkSent)
def request_magic_link(payload: MagicLinkRequest):
    token = create_magic_link_token(payload.email.lower())
    magic_link = build_magic_link(token)

    try:
        send_magic_link_email(payload.email.lower(), magic_link)
    except Exception as exc:  # noqa: BLE001
        raise HTTPException(status_code=502, detail="Could not send magic link email") from exc

    return MagicLinkSent(message="Magic link sent")


@router.post("/magic-link/verify", response_model=AuthSession)
def verify_magic_link(payload: MagicLinkVerify, db: Session = Depends(get_db)):
    try:
        email = verify_magic_link_token(payload.token).lower()
    except JWTError as exc:
        raise HTTPException(status_code=400, detail="That magic link is invalid or has expired") from exc

    user = db.query(User).filter(User.email == email).first()
    if not user:
        user = User(email=email, name=_display_name_from_email(email), password_hash=None)
        db.add(user)
        db.commit()
        db.refresh(user)

    return _issue_session(user)
