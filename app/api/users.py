# /mentormind-backend/app/api/users.py
from fastapi import APIRouter, Depends
from pydantic import BaseModel, EmailStr
from app.db.models import User, UserRole
from app.core.dependencies import get_current_active_user

router = APIRouter()

class UserOut(BaseModel):
    id: int
    name: str
    email: EmailStr
    role: UserRole

    class Config:
        from_attributes = True

@router.get("/me", response_model=UserOut)
def read_users_me(current_user: User = Depends(get_current_active_user)):
    """
    Get the profile of the currently authenticated user.
    """
    return current_user
