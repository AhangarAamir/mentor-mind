# /mentormind-backend/app/core/dependencies.py
from fastapi import Depends, HTTPException, status
from app.db.models import User, UserRole
from app.core.jwt_handler import get_current_user, oauth2_scheme
from app.db.base import database

def get_db():
    """
    Dependency to get a database connection for a request.
    """
    if database.is_closed():
        database.connect()
    try:
        yield database
    finally:
        if not database.is_closed():
            database.close()

def get_current_active_user(current_user: User = Depends(get_current_user)) -> User:
    """
    Dependency to get the current authenticated user.
    Can be expanded to check if the user is active.
    """
    # if not current_user.is_active:
    #     raise HTTPException(status_code=400, detail="Inactive user")
    return current_user

def get_current_admin_user(current_user: User = Depends(get_current_active_user)) -> User:
    """
    Dependency to ensure the current user is an admin.
    """
    if current_user.role != UserRole.admin.value:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="The user doesn't have enough privileges (admin required)",
        )
    return current_user

def get_current_parent_user(current_user: User = Depends(get_current_active_user)) -> User:
    """
    Dependency to ensure the current user is a parent.
    """
    if current_user.role != UserRole.parent.value:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="The user doesn't have enough privileges (parent required)",
        )
    return current_user

def get_current_student_user(current_user: User = Depends(get_current_active_user)) -> User:
    """
    Dependency to ensure the current user is a student.
    """
    if current_user.role != UserRole.student.value:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="The user doesn't have enough privileges (student required)",
        )
    return current_user
