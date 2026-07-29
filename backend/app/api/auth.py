import random
import string
from datetime import datetime, timedelta
from typing import Optional
from fastapi import APIRouter, Depends, HTTPException, status, Body
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy.orm import Session
from pydantic import BaseModel, EmailStr

from app.core.database import get_db
from app.core.security import hash_password, verify_password, create_access_token, create_refresh_token, decode_token
from app.core.config import settings
from app.models.user import User, Session as UserSession, generate_uuid
from app.api.deps import get_current_user

router = APIRouter(prefix="/api/auth", tags=["auth"])


class SignUpRequest(BaseModel):
    email: EmailStr
    password: str
    name: Optional[str] = None


class SignInRequest(BaseModel):
    email: EmailStr
    password: str


class TokenResponse(BaseModel):
    access_token: str
    refresh_token: str
    token_type: str = "bearer"
    user: dict


class UserResponse(BaseModel):
    id: str
    email: str
    username: Optional[str]
    display_name: Optional[str]
    role: str
    avatar_url: Optional[str]
    is_verified: bool
    theme: str
    language: str


class ForgotPasswordRequest(BaseModel):
    email: EmailStr


class ResetPasswordRequest(BaseModel):
    token: str
    new_password: str


class ChangePasswordRequest(BaseModel):
    current_password: str
    new_password: str


class VerifyOTPRequest(BaseModel):
    email: EmailStr
    otp: str


def make_user_response(user: User) -> dict:
    return {
        "id": user.id,
        "email": user.email,
        "username": user.username,
        "display_name": user.display_name,
        "role": user.role,
        "avatar_url": user.avatar_url,
        "is_verified": user.is_verified,
        "theme": user.theme,
        "language": user.language,
        "compact_mode": user.compact_mode,
        "accent_color": user.accent_color,
        "membership_id": user.membership_id,
    }


@router.post("/signup", response_model=TokenResponse)
def signup(req: SignUpRequest, db: Session = Depends(get_db)):
    existing = db.query(User).filter(User.email == req.email).first()
    if existing:
        raise HTTPException(status_code=400, detail="Email already registered")

    user = User(
        id=generate_uuid(),
        email=req.email,
        username=req.email.split("@")[0] + "_" + generate_uuid()[:6],
        display_name=req.name or req.email.split("@")[0],
        hashed_password=hash_password(req.password),
        role="member" if db.query(User).count() > 0 else "owner",
        is_verified=db.query(User).count() == 0,
    )
    db.add(user)
    db.commit()
    db.refresh(user)

    return create_tokens(user, db)


@router.post("/login", response_model=TokenResponse)
def login(req: SignInRequest, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.email == req.email).first()
    if not user or not user.hashed_password:
        raise HTTPException(status_code=401, detail="Invalid email or password")
    if not verify_password(req.password, user.hashed_password):
        raise HTTPException(status_code=401, detail="Invalid email or password")
    if user.is_banned:
        raise HTTPException(status_code=403, detail="Account is banned")
    if user.is_suspended:
        raise HTTPException(status_code=403, detail="Account is suspended")
    return create_tokens(user, db)


@router.post("/login/form", response_model=TokenResponse)
def login_form(form_data: OAuth2PasswordRequestForm = Depends(), db: Session = Depends(get_db)):
    user = db.query(User).filter(User.email == form_data.username).first()
    if not user or not user.hashed_password or not verify_password(form_data.password, user.hashed_password):
        raise HTTPException(status_code=401, detail="Invalid credentials")
    return create_tokens(user, db)


@router.post("/refresh", response_model=TokenResponse)
def refresh(refresh_token: str = Body(..., embed=True), db: Session = Depends(get_db)):
    payload = decode_token(refresh_token)
    if not payload or payload.get("type") != "refresh":
        raise HTTPException(status_code=401, detail="Invalid refresh token")
    user_id = payload.get("sub")
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=401, detail="User not found")
    return create_tokens(user, db)


@router.post("/forgot-password")
def forgot_password(req: ForgotPasswordRequest, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.email == req.email).first()
    if not user:
        return {"message": "If account exists, reset link sent"}
    code = "".join(random.choices(string.digits, k=6))
    user.otp_code = code
    user.otp_expires_at = datetime.utcnow() + timedelta(minutes=10)
    user.verification_token = create_access_token({"sub": user.id, "purpose": "reset"}, timedelta(minutes=10))
    db.commit()
    return {"message": "If account exists, reset instructions sent", "verification_token": user.verification_token}


@router.post("/reset-password")
def reset_password(req: ResetPasswordRequest, db: Session = Depends(get_db)):
    payload = decode_token(req.token)
    if not payload or payload.get("purpose") != "reset":
        raise HTTPException(status_code=400, detail="Invalid or expired token")
    user = db.query(User).filter(User.id == payload.get("sub")).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    user.hashed_password = hash_password(req.new_password)
    user.verification_token = None
    db.commit()
    return {"message": "Password reset successfully"}


@router.post("/change-password")
def change_password(req: ChangePasswordRequest, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    if not verify_password(req.current_password, current_user.hashed_password):
        raise HTTPException(status_code=400, detail="Current password is incorrect")
    current_user.hashed_password = hash_password(req.new_password)
    db.commit()
    return {"message": "Password changed successfully"}


@router.post("/verify-email")
def verify_email(token: str = Body(..., embed=True), db: Session = Depends(get_db)):
    payload = decode_token(token)
    if not payload:
        raise HTTPException(status_code=400, detail="Invalid token")
    user = db.query(User).filter(User.id == payload.get("sub")).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    user.is_verified = True
    user.verification_token = None
    db.commit()
    return {"message": "Email verified"}


@router.post("/send-otp")
def send_otp(email: EmailStr = Body(..., embed=True), db: Session = Depends(get_db)):
    user = db.query(User).filter(User.email == email).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    code = "".join(random.choices(string.digits, k=6))
    user.otp_code = code
    user.otp_expires_at = datetime.utcnow() + timedelta(minutes=10)
    db.commit()
    return {"message": "OTP sent"}


@router.post("/verify-otp")
def verify_otp(req: VerifyOTPRequest, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.email == req.email).first()
    if not user or user.otp_code != req.otp:
        raise HTTPException(status_code=400, detail="Invalid OTP")
    if user.otp_expires_at and user.otp_expires_at < datetime.utcnow():
        raise HTTPException(status_code=400, detail="OTP expired")
    user.otp_code = None
    user.otp_expires_at = None
    user.is_verified = True
    db.commit()
    return {"message": "OTP verified", "access_token": create_access_token({"sub": user.id})}


@router.get("/me", response_model=UserResponse)
def get_me(current_user: User = Depends(get_current_user)):
    return make_user_response(current_user)


@router.put("/me")
def update_me(
    display_name: Optional[str] = Body(None),
    avatar_url: Optional[str] = Body(None),
    bio: Optional[str] = Body(None),
    theme: Optional[str] = Body(None),
    language: Optional[str] = Body(None),
    accent_color: Optional[str] = Body(None),
    compact_mode: Optional[bool] = Body(None),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    if display_name is not None:
        current_user.display_name = display_name
    if avatar_url is not None:
        current_user.avatar_url = avatar_url
    if bio is not None:
        current_user.bio = bio
    if theme is not None:
        current_user.theme = theme
    if language is not None:
        current_user.language = language
    if accent_color is not None:
        current_user.accent_color = accent_color
    if compact_mode is not None:
        current_user.compact_mode = compact_mode
    db.commit()
    return make_user_response(current_user)


@router.get("/sessions")
def get_sessions(current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    sessions = db.query(UserSession).filter(UserSession.user_id == current_user.id, UserSession.is_active).all()
    return [{"id": s.id, "device_info": s.device_info, "ip_address": s.ip_address, "created_at": s.created_at.isoformat()} for s in sessions]


@router.delete("/sessions/{session_id}")
def revoke_session(session_id: str, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    s = db.query(UserSession).filter(UserSession.id == session_id, UserSession.user_id == current_user.id).first()
    if not s:
        raise HTTPException(status_code=404, detail="Session not found")
    s.is_active = False
    db.commit()
    return {"message": "Session revoked"}


@router.delete("/sessions")
def revoke_all_sessions(current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    db.query(UserSession).filter(UserSession.user_id == current_user.id, UserSession.is_active).update({"is_active": False})
    db.commit()
    return {"message": "All sessions revoked"}


def create_tokens(user: User, db: Session) -> dict:
    access_token = create_access_token({"sub": user.id})
    refresh_token = create_refresh_token({"sub": user.id})
    session = UserSession(
        id=generate_uuid(),
        user_id=user.id,
        token=access_token,
        expires_at=datetime.utcnow() + timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES),
    )
    db.add(session)
    db.commit()
    return {
        "access_token": access_token,
        "refresh_token": refresh_token,
        "token_type": "bearer",
        "user": make_user_response(user),
    }
