# /mentormind-backend/app/core/jwt_handler.py
from datetime import datetime, timedelta, timezone
from typing import Optional
from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from jose import JWTError, jwt
from pydantic import BaseModel, EmailStr

from app.config import settings
from app.db import crud
from app.db.models import User, UserRole

# OAuth2 scheme for dependency injection
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/api/auth/login")
refresh_oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/api/auth/refresh") # Not strictly needed but good for clarity

class TokenData(BaseModel):
    email: Optional[EmailStr] = None
    role: Optional[UserRole] = None

def create_access_token(data: dict, expires_delta: Optional[timedelta] = None):
    to_encode = data.copy()
    if expires_delta:
        expire = datetime.now(timezone.utc) + expires_delta
    else:
        expire = datetime.now(timezone.utc) + timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
    to_encode.update({"exp": expire, "type": "access"})
    encoded_jwt = jwt.encode(to_encode, settings.SECRET_KEY, algorithm=settings.ALGORITHM)
    return encoded_jwt

def create_refresh_token(data: dict):
    expire = datetime.now(timezone.utc) + timedelta(days=settings.REFRESH_TOKEN_EXPIRE_DAYS)
    to_encode = data.copy()
    to_encode.update({"exp": expire, "type": "refresh"})
    encoded_jwt = jwt.encode(to_encode, settings.SECRET_KEY, algorithm=settings.ALGORITHM)
    return encoded_jwt

def create_access_and_refresh_tokens(data: dict):
    access_token = create_access_token(data)
    refresh_token = create_refresh_token(data)
    return {
        "access_token": access_token,
        "refresh_token": refresh_token,
        "token_type": "bearer",
    }

def decode_token(token: str) -> TokenData:
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    try:
        payload = jwt.decode(token, settings.SECRET_KEY, algorithms=[settings.ALGORITHM])
        email: str = payload.get("sub")
        role: str = payload.get("role")
        if email is None:
            raise credentials_exception
        return TokenData(email=email, role=UserRole(role))
    except (JWTError, ValueError):
        raise credentials_exception

def get_current_user(token: str = Depends(oauth2_scheme)) -> User:
    token_data = decode_token(token)
    user = crud.get_user_by_email(email=token_data.email)
    if user is None:
        raise HTTPException(status_code=404, detail="User not found")
    return user

def get_current_user_from_refresh_token(token: str = Depends(refresh_oauth2_scheme)) -> User:
    token_data = decode_token(token)
    user = crud.get_user_by_email(email=token_data.email)
    if user is None:
        raise HTTPException(status_code=404, detail="User not found")
    return user
