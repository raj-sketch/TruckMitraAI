from fastapi import APIRouter, Depends
from pydantic import BaseModel, EmailStr
from typing import Optional

from backend.models import User
from backend.security import get_current_user

router = APIRouter(prefix="/users", tags=["users"])


class UserRead(BaseModel):
    email: EmailStr
    role: str
    company_name: Optional[str] = None

@router.get("/me", response_model=UserRead)
def read_users_me(current_user: User = Depends(get_current_user)):
    return current_user