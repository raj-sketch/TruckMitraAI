from fastapi import APIRouter, HTTPException, status, Depends
from fastapi.security import OAuth2PasswordRequestForm
from fastapi.responses import JSONResponse
from backend.models import User, UserCreate
from typing import Optional
from backend.database import db
from backend.security import verify_password, get_password_hash, create_access_token

router = APIRouter(prefix="/auth", tags=["auth"])

@router.post('/register', status_code=status.HTTP_201_CREATED)
def register(user_in: UserCreate):
    user_ref = db.collection('users').document(user_in.email)
    if user_ref.get().exists:
        raise HTTPException(status_code=400, detail="Email already registered")
    
    hashed_password = get_password_hash(user_in.password)
    user_db = User(
        email=user_in.email,
        role=user_in.role,
        hashed_password=hashed_password,
        user_name=user_in.user_name,
    )
    user_ref.set(user_db.model_dump())
    return {"message": "User registered successfully"}

def authenticate_user(email: str, password: str) -> Optional[User]:
    user_ref = db.collection('users').document(email)
    user_doc = user_ref.get()
    if not user_doc.exists:
        return None
    user = User(**user_doc.to_dict())
    if not verify_password(password, user.hashed_password):
        return None
    return user

@router.post('/token', status_code=status.HTTP_200_OK)
def login(form_data: OAuth2PasswordRequestForm = Depends()):
    try:
        user = authenticate_user(form_data.username, form_data.password)
        if not user:
            # This is an expected failure (wrong password), so we raise a standard 401
            raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Incorrect email or password", headers={"WWW-Authenticate": "Bearer"})
        
        access_token = create_access_token(data={"sub": user.email, "role": user.role})
        return {"access_token": access_token, "token_type": "bearer", "role": user.role}
    except Exception as e:
        # Catch any other unexpected errors (e.g., DB connection, missing SECRET_KEY)
        # and return a 500 error that the frontend can handle.
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"An internal error occurred during authentication: {e}"
        )
