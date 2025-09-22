from fastapi import APIRouter, HTTPException, status, Depends
from datetime import datetime, timezone
from backend.database import db
from backend.models import LoadCreate, LoadRead, User
from backend.security import get_current_user

# Create a new router for loads
router = APIRouter()

@router.post(
    "/",
    response_model=LoadRead,
    status_code=status.HTTP_201_CREATED,
    summary="Create a new load"
)
def create_load(
    load_in: LoadCreate,
    current_user: User = Depends(get_current_user)
):
    """
    Creates a new load document in Firestore.

    - **Requires authentication.**
    - Checks if the user is a 'shipper'.
    - Receives load data (origin, destination, etc.).
    - Adds shipper ID, posted date, and a default 'posted' status.
    - Saves to the 'loads' collection in Firestore.
    - Returns the complete load object, including its new ID.
    """
    if current_user.role != 'shipper':
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only shippers can create new loads."
        )

    try:
        # Prepare the data to be stored in Firestore
        load_dict = load_in.model_dump()
        load_dict.update({
            "shipper_id": current_user.email,
            "posted_date": datetime.now(timezone.utc),
            "status": "posted"  # 'posted' is a good initial status
        })

        # Add a new document to the 'loads' collection with an auto-generated ID
        _update_time, doc_ref = db.collection("loads").add(load_dict)

        # Return the full object by merging the generated ID with the saved data
        return LoadRead(id=doc_ref.id, **load_dict)

    except Exception as e:
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=str(e))