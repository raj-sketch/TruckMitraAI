from pydantic import BaseModel, EmailStr
from typing import Optional

# --- User Models ---

class UserBase(BaseModel):
    """Base model for common user properties."""
    email: EmailStr
    role: str  # 'shipper' or 'loader'
    company_name: Optional[str] = None
    gst_number: Optional[str] = None

class UserCreate(UserBase):
    """Model for creating a new user, includes password."""
    password: str

class User(UserBase):
    """Model for user data stored in the database, includes hashed password."""
    hashed_password: str

class Token(BaseModel):
    access_token: str
    token_type: str
    role: str