from fastapi import APIRouter, Depends
from backend.models import User, UserRead
from backend.security import get_current_user

router = APIRouter(
    prefix="/users",
    tags=["users"],
)

@router.get("/me", response_model=UserRead)
async def read_users_me(current_user: User = Depends(get_current_user)):
    """
    Get current user. This endpoint is `async` because its dependency,
    `get_current_user`, is an `async` function that performs I/O operations
    in a non-blocking way.
    """
    return current_user