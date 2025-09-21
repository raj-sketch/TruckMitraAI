from pydantic import BaseModel, EmailStr
from typing import Optional


class UserCreate(BaseModel):
    email: EmailStr
    password: str
    role: str  # 'shipper' or 'loader'

class User(BaseModel):
    email: EmailStr
    hashed_password: str
    role: str  # 'shipper' or 'loader'

class LoadCreate(BaseModel):
    origin: str
    destination: str
    weight: float

class Load(LoadCreate):
    id: str
    shipper_id: str
    status: str
    loader_id: Optional[str] = None

class Truck(BaseModel):
    loader_id: str
    truck_number: str
    current_location: str
