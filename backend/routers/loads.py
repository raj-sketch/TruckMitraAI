from fastapi import APIRouter, HTTPException, status, Depends
from datetime import datetime, timezone
from google.cloud.firestore_v1.base_query import FieldFilter, Or
from backend.database import db
from backend.models import LoadCreate, LoadCreateResponse, User, LoadRead
from backend.security import get_current_user

# Create a new router for loads
router = APIRouter()

@router.post(
    "/",
    response_model=LoadCreateResponse,
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
            "loader_id": None,
            "posted_date": datetime.now(timezone.utc),
            "status": "stand by"  # Initial status for a newly created load
        })

        # Add a new document to the 'loads' collection with an auto-generated ID
        _update_time, doc_ref = db.collection("loads").add(load_dict)

        return {"load_id": doc_ref.id, "message": "Load posted successfully"}

    except Exception as e:
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=str(e))

@router.get(
    "/shipper/me",
    response_model=list[LoadRead],
    summary="Get all loads for the current shipper"
)
def get_my_shipper_loads(current_user: User = Depends(get_current_user)):
    """
    Retrieves all loads posted by the currently authenticated shipper.

    - **Requires authentication.**
    - Checks if the user is a 'shipper'.
    - Returns a list of loads, ordered by the most recently posted.
    """
    if current_user.role != 'shipper':
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only shippers can view their posted loads"
        )

    try:
        # Query the 'loads' collection for documents where 'shipper_id' matches the current user's email.
        # Order the results by 'posted_date' in descending order to get the newest loads first.
        docs = db.collection('loads') \
            .where(filter=FieldFilter('shipper_id', '==', current_user.email)) \
            .order_by('posted_date', direction='DESCENDING') \
            .stream()

        # The response model `LoadRead` expects an `id` field, which is not part of the document data.
        # We construct a list of dictionaries, adding the document ID to each one.
        loads = [{**doc.to_dict(), "id": doc.id} for doc in docs]
        return loads
    except Exception as e:
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=str(e))

@router.get(
    "/shipper/me",
    response_model=list[LoadRead],
    summary="Get all loads for the current shipper"
)
def get_my_shipper_loads(current_user: User = Depends(get_current_user)):
    """
    Retrieves all loads posted by the currently authenticated shipper.

    - **Requires authentication.**
    - Checks if the user is a 'shipper'.
    - Returns a list of loads, ordered by the most recently posted.
    """
    if current_user.role != 'shipper':
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only shippers can view their posted loads"
        )

    try:
        # Query the 'loads' collection for documents where 'shipper_id' matches the current user's email.
        # Order the results by 'posted_date' in descending order to get the newest loads first.
        docs = db.collection('loads') \
            .where(filter=FieldFilter('shipper_id', '==', current_user.email)) \
            .order_by('posted_date', direction='DESCENDING') \
            .stream()

        # The response model `LoadRead` expects an `id` field, which is not part of the document data.
        # We construct a list of dictionaries, adding the document ID to each one.
        loads = [{**doc.to_dict(), "id": doc.id} for doc in docs]
        return loads
    except Exception as e:
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=str(e))

@router.get(
    "/available",
    response_model=list[LoadRead],
    summary="Get all available loads for drivers"
)
def get_available_loads(current_user: User = Depends(get_current_user)):
    """
    Retrieves all loads that are available to be accepted by a driver.
    An available load is one with the status 'stand by'.

    - **Requires authentication.**
    - Checks if the user is a 'loader' (driver).
    - Returns a list of available loads.
    """
    if current_user.role != 'loader':
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only loaders can view available loads."
        )
    try:
        # Query for loads where the status is 'stand by'.
        docs = db.collection('loads').where(filter=FieldFilter('status', '==', 'stand by')).stream()
        loads = [{**doc.to_dict(), "id": doc.id} for doc in docs]
        return loads
    except Exception as e:
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=str(e))

@router.put(
    "/{load_id}/accept",
    summary="Accept an available load"
)
def accept_load(load_id: str, current_user: User = Depends(get_current_user)):
    """
    Allows a driver to accept a load.

    - **Requires authentication.**
    - Checks if the user is a 'loader' (driver).
    - Verifies the load exists and its status is 'stand by'.
    - Updates the load's status to 'in transit' and assigns the current driver's email as the 'loader_id'.
    """
    if current_user.role != 'loader':
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only loaders can accept loads."
        )

    doc_ref = db.collection('loads').document(load_id)
    doc = doc_ref.get()

    if not doc.exists:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Load not found")

    load = doc.to_dict()
    if load.get('status') != 'stand by':
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Load not available")

    # Update the document with the new status and the driver's ID.
    doc_ref.update({
        "status": "in transit",
        "loader_id": current_user.email
    })

    return {"message": "Load accepted", "load_id": load_id}

@router.get(
    "/my-active",
    response_model=list[LoadRead],
    summary="Get all active loads for the current driver"
)
def get_my_active_loads(current_user: User = Depends(get_current_user)):
    """
    Retrieves all loads currently assigned to the authenticated driver.

    - **Requires authentication.**
    - Checks if the user is a 'loader' (driver).
    - Returns a list of loads assigned to the driver.
    """
    if current_user.role != 'loader':
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only loaders can view their active loads."
        )

    try:
        # Query for loads where the loader_id matches the current user's email.
        docs = db.collection('loads').where(filter=FieldFilter('loader_id', '==', current_user.email)).stream()
        loads = [{**doc.to_dict(), "id": doc.id} for doc in docs]
        return loads
    except Exception as e:
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=str(e))