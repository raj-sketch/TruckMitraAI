from fastapi import APIRouter, Depends, status
from backend.models import User, MyCollectionCreate, MyCollectionRead
from backend.security import get_current_user
from backend.database import db
from datetime import datetime, timezone

router = APIRouter(
    prefix="/my_collection",
    tags=["my_collection"],
)

@router.post("/", response_model=MyCollectionRead, status_code=status.HTTP_201_CREATED)
async def create_my_collection_item(
    item_in: MyCollectionCreate,
    current_user: User = Depends(get_current_user)
):
    """
    Create a new item in my_collection. Requires authentication.
    """
    item_dict = item_in.model_dump()
    item_dict["created_by"] = current_user.email
    item_dict["created_at"] = datetime.now(timezone.utc)

    # Add the new document to the 'my_collection' collection
    _update_time, item_ref = db.collection('my_collection').add(item_dict)

    # Fetch the newly created document to return it with its ID
    new_item_doc = item_ref.get()
    new_item = new_item_doc.to_dict()
    new_item['id'] = new_item_doc.id
    
    return MyCollectionRead(**new_item)