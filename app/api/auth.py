# /mentormind-backend/app/api/auth.py
from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordRequestForm
from pydantic import BaseModel, EmailStr

from app.db.crud import create_user, get_user_by_email
from app.db.models import User, UserRole
from app.core import security, jwt_handler
from app.core.dependencies import get_db

router = APIRouter()

class UserCreate(BaseModel):
    name: str
    email: EmailStr
    password: str
    role: UserRole

class Token(BaseModel):
    access_token: str
    refresh_token: str
    token_type: str = "bearer"

@router.post("/signup", response_model=Token, status_code=status.HTTP_201_CREATED)
def signup(user_in: UserCreate, db=Depends(get_db)):
    """
    Create a new user (student, parent, or admin).
    """
    db_user = get_user_by_email(user_in.email)
    if db_user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Email already registered",
        )
    
    hashed_password = security.hash_password(user_in.password)
    user = create_user(
        name=user_in.name,
        email=user_in.email,
        password_hash=hashed_password,
        role=user_in.role,
    )

    return jwt_handler.create_access_and_refresh_tokens(
        data={"sub": user.email, "role": user.role}
    )

@router.post("/login", response_model=Token)
def login(form_data: OAuth2PasswordRequestForm = Depends(), db=Depends(get_db)):
    """
    Authenticate user and return JWT tokens.
    """
    user = get_user_by_email(form_data.username)
    if not user or not security.verify_password(form_data.password, str(user.password_hash)):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password",
            headers={"WWW-Authenticate": "Bearer"},
        )

    return jwt_handler.create_access_and_refresh_tokens(
        data={"sub": user.email, "role": user.role}
    )

@router.post("/refresh", response_model=Token)
def refresh_token(current_user: User = Depends(jwt_handler.get_current_user_from_refresh_token)):
    """
    Generate a new access token from a valid refresh token.
    """
    if not current_user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid refresh token",
        )
    
    return jwt_handler.create_access_and_refresh_tokens(
        data={"sub": current_user.email, "role": current_user.role}
    )
