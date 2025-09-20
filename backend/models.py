from pydantic import BaseModel, EmailStr
from typing import Optional

class User(BaseModel):
    email: EmailStr
    password: str
    role: str  # 'shipper' or 'loader'

class Load(BaseModel):
    shipper_id: str
    origin: str
    destination: str
    weight: float
    status: str  # 'posted', 'active', 'completed'
    loader_id: Optional[str] = None

class Truck(BaseModel):
    loader_id: str
    truck_number: str
    current_location: str
