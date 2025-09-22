from pydantic import BaseModel, EmailStr
from typing import Optional
from datetime import datetime

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

class UserRead(BaseModel):
    """Model for reading user data, excluding sensitive information like hashed password."""
    email: EmailStr
    role: str
    company_name: Optional[str] = None

class Token(BaseModel):
    access_token: str
    token_type: str
    role: str

# --- Load Models ---

class LoadBase(BaseModel):
    """Base model for common load properties."""
    origin: str  # Origin location of the load
    destination: str  # Destination location of the load
    material_type: str  # Type of material being shipped
    weight: int  # Weight of the load in kilograms
    order_description: Optional[str] = None

class LoadCreate(LoadBase):
    """Model for creating a new load."""
    pass

class Load(LoadBase):
    """Model for load data stored in the database."""
    id: str  # Unique identifier for the load
    shipper_id: str  # ID of the shipper posting the load
    status: str  # Current status of the load
    posted_date: datetime  # Date when the load was posted

class LoadRead(Load): 
    """Model for reading load data."""
    pass

# --- MyCollection Models ---

class MyCollectionBase(BaseModel):
    """Base model for MyCollection."""
    name: str
    description: Optional[str] = None

class MyCollectionCreate(MyCollectionBase):
    """Model for creating a new item in MyCollection."""
    pass

class MyCollectionRead(MyCollectionBase):
    """Model for reading an item from MyCollection."""
    id: str
    created_by: EmailStr
    created_at: datetime