from pydantic import BaseModel
from typing import Optional

class User(BaseModel):
    uid: str
    email: str
    role: str  # 'shipper' or 'loader'

class Load(BaseModel):
    id: Optional[str]
    shipper_id: str
    origin: str
    destination: str
    status: str  # 'posted', 'accepted', 'in_transit', 'delivered'
    loader_id: Optional[str] = None
    posted_at: Optional[str] = None
    accepted_at: Optional[str] = None
