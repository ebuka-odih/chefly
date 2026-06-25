from datetime import datetime, timedelta, timezone
import re

from fastapi import APIRouter, Depends, HTTPException
from jose import JWTError
from sqlalchemy.orm import Session

from app.config import settings
from app.db.database import get_db
from app.db.models import AuthOtp, User
from app.schemas.auth import (
    AuthSession,
    MagicLinkRequest,
    MagicLinkSent,
    MagicLinkVerify,
    OtpRequest,
    OtpSent,
    OtpVerify,
    Token,
    UserCreate,
    UserLogin,
    UserResponse,
    UserUpdate,
)
from app.services.mail import MailDeliveryError, send_otp_email
from app.utils.security import (
    create_access_token,
    create_otp_code,
    get_current_user,
    get_password_hash,
    hash_otp_code,
    verify_otp_code,
    verify_magic_link_token,
    verify_password,
)

router = APIRouter()


def _display_name_from_email(email: str) -> str:
    local = email.split("@", 1)[0]
    return re.sub(r"[^A-Za-z0-9]+", " ", local).strip().title() or "Chefly Cook"


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
    email = user.email.lower()
    db_user = db.query(User).filter(User.email == email).first()
    if db_user:
        raise HTTPException(status_code=400, detail="Email already registered")
    
    hashed_password = get_password_hash(user.password)
    name = user.name.strip() if user.name else ""
    new_user = User(email=email, name=name or _display_name_from_email(email), password_hash=hashed_password)
    db.add(new_user)
    db.commit()
    db.refresh(new_user)
    return new_user

@router.post("/login", response_model=Token)
def login(user_credentials: UserLogin, db: Session = Depends(get_db)):
    email = user_credentials.email.lower()
    user = db.query(User).filter(User.email == email).first()
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


@router.patch("/me", response_model=UserResponse)
def update_users_me(
    payload: UserUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    if payload.name is not None:
        name = payload.name.strip()
        current_user.name = name or _display_name_from_email(current_user.email)
    db.commit()
    db.refresh(current_user)
    return current_user


@router.post("/otp/request", response_model=OtpSent)
def request_otp(payload: OtpRequest, db: Session = Depends(get_db)):
    email = payload.email.lower()
    code = create_otp_code(email)
    expires_at = datetime.now(timezone.utc) + timedelta(minutes=settings.OTP_EXPIRE_MINUTES)

    db.query(AuthOtp).filter(AuthOtp.email == email).delete(synchronize_session=False)
    otp = AuthOtp(email=email, code_hash=hash_otp_code(email, code), expires_at=expires_at)
    db.add(otp)
    db.commit()

    try:
        send_otp_email(email, code)
    except MailDeliveryError as exc:
        db.query(AuthOtp).filter(AuthOtp.email == email).delete(synchronize_session=False)
        db.commit()
        raise HTTPException(status_code=502, detail=str(exc)) from exc
    except Exception as exc:  # noqa: BLE001
        db.query(AuthOtp).filter(AuthOtp.email == email).delete(synchronize_session=False)
        db.commit()
        raise HTTPException(status_code=502, detail="Could not send sign-in code") from exc

    return OtpSent(message="Sign-in code sent")


@router.post("/otp/verify", response_model=AuthSession)
def verify_otp(payload: OtpVerify, db: Session = Depends(get_db)):
    email = payload.email.lower()
    otp = db.query(AuthOtp).filter(AuthOtp.email == email).first()
    now = datetime.now(timezone.utc)
    expires_at = otp.expires_at if otp else None
    if expires_at and expires_at.tzinfo is None:
        expires_at = expires_at.replace(tzinfo=timezone.utc)

    if not otp or not expires_at or expires_at < now:
        if otp:
            db.delete(otp)
            db.commit()
        raise HTTPException(status_code=400, detail="That code is invalid or has expired")

    if not verify_otp_code(email, payload.code, otp.code_hash):
        raise HTTPException(status_code=400, detail="That code is invalid or has expired")

    db.delete(otp)
    db.commit()

    user = db.query(User).filter(User.email == email).first()
    if not user:
        user = User(email=email, name=_display_name_from_email(email), password_hash=None)
        db.add(user)
        db.commit()
        db.refresh(user)

    return _issue_session(user)


@router.post("/magic-link/request", response_model=MagicLinkSent)
def request_magic_link(payload: MagicLinkRequest, db: Session = Depends(get_db)):
    request_otp(OtpRequest(email=payload.email), db)
    return MagicLinkSent(message="Sign-in code sent")


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
