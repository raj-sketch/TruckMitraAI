from fastapi import APIRouter, HTTPException, status, Depends
from backend.models import Load, User, LoadCreate, Load
from typing import List
from backend.database import db
from backend.security import get_current_user

router = APIRouter(prefix="/loads", tags=["loads"])

@router.post("/", status_code=status.HTTP_201_CREATED)
def post_load(load_in: LoadCreate, current_user: User = Depends(get_current_user)):
    if current_user.role != 'shipper':
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Only shippers can post loads")
    
    load_dict = load_in.model_dump()
    load_dict["status"] = "posted"
    load_dict["shipper_id"] = current_user.email # Ensure shipper_id is the authenticated user

    # Use .add() to let Firestore generate the document ID
    update_time, load_ref = db.collection('loads').add(load_dict)
    return {"load_id": load_ref.id, "message": "Load posted successfully"}

@router.get("/shipper/me", response_model=List[Load])
def get_my_loads(current_user: User = Depends(get_current_user)):
    """
    Get all loads posted by the currently authenticated shipper.
    """
    if current_user.role != 'shipper':
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Only shippers can view their posted loads")

    docs = db.collection('loads').where('shipper_id', '==', current_user.email).stream()
    loads = []
    for doc in docs:
        load_data = doc.to_dict()
        load_data['id'] = doc.id
        loads.append(Load(**load_data))
    return loads

@router.get("/available", response_model=List[Load])
def get_available_loads(current_user: User = Depends(get_current_user)):
    docs = db.collection('loads').where('status', '==', 'posted').stream()
    loads = []
    for doc in docs:
        load_data = doc.to_dict()
        load_data['id'] = doc.id
        loads.append(Load(**load_data))
    return loads

@router.put("/{load_id}/accept")
def accept_load(load_id: str, current_user: User = Depends(get_current_user)):
    if current_user.role != 'loader':
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Only loaders can accept loads")

    load_ref = db.collection('loads').document(load_id)
    load_doc = load_ref.get()

    if not load_doc.exists:
        raise HTTPException(status_code=404, detail="Load not found")
    
    load = load_doc.to_dict()
    if load.get("status") != "posted":
        raise HTTPException(status_code=400, detail="Load not available")

    load_ref.update({"status": "active", "loader_id": current_user.email})
    return {"message": "Load accepted", "load_id": load_id}
