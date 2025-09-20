from fastapi import APIRouter, HTTPException, status, Depends
from fastapi.security import OAuth2PasswordBearer
from backend.models import Load
from typing import List, Dict
import uuid

router = APIRouter(prefix="/loads", tags=["loads"])
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/auth/token")

# In-memory store for demo
fake_loads_db: Dict[str, Load] = {}

def get_current_user(token: str = Depends(oauth2_scheme)):
    # For demo, just check token exists
    if not token:
        raise HTTPException(status_code=401, detail="Not authenticated")
    # In production, decode JWT and fetch user
    return token

@router.post("/", status_code=status.HTTP_201_CREATED)
def post_load(load: Load, token: str = Depends(oauth2_scheme)):
    load_id = str(uuid.uuid4())
    load_dict = load.dict()
    load_dict["status"] = "posted"
    fake_loads_db[load_id] = Load(**load_dict)
    return {"load_id": load_id, "message": "Load posted successfully"}

@router.get("/shipper/{user_id}", response_model=List[Load])
def get_shipper_loads(user_id: str, token: str = Depends(oauth2_scheme)):
    return [l for l in fake_loads_db.values() if l.shipper_id == user_id]

@router.get("/available", response_model=List[Load])
def get_available_loads(token: str = Depends(oauth2_scheme)):
    return [l for l in fake_loads_db.values() if l.status == "posted"]

@router.put("/{load_id}/accept")
def accept_load(load_id: str, loader_id: str, token: str = Depends(oauth2_scheme)):
    load = fake_loads_db.get(load_id)
    if not load:
        raise HTTPException(status_code=404, detail="Load not found")
    if load.status != "posted":
        raise HTTPException(status_code=400, detail="Load not available")
    load.status = "active"
    load.loader_id = loader_id
    fake_loads_db[load_id] = load
    return {"message": "Load accepted", "load_id": load_id}
