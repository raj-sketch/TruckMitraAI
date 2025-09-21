from fastapi import APIRouter, HTTPException, status, Depends
from fastapi.security import OAuth2PasswordRequestForm
from backend.models import User, UserCreate
from backend.database import db
from backend.security import verify_password, get_password_hash, create_access_token

router = APIRouter(prefix="/auth", tags=["auth"])

@router.post('/register', status_code=status.HTTP_201_CREATED)
def register(user_in: UserCreate):
    user_ref = db.collection('users').document(user_in.email)
    if user_ref.get().exists:
        raise HTTPException(status_code=400, detail="Email already registered")
    
    hashed_password = get_password_hash(user_in.password)
    user_db = User(email=user_in.email, role=user_in.role, hashed_password=hashed_password)
    user_ref.set(user_db.model_dump())
    return {"message": "User registered successfully"}

def authenticate_user(email: str, password: str):
    user_ref = db.collection('users').document(email)
    user_doc = user_ref.get()
    if not user_doc.exists:
        return False
    user = User(**user_doc.to_dict())
    if not verify_password(password, user.hashed_password):
        return False
    return user_doc.to_dict()

@router.post('/token', status_code=status.HTTP_200_OK)
def login(form_data: OAuth2PasswordRequestForm = Depends()):
    user = authenticate_user(form_data.username, form_data.password)
    if not user:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Incorrect email or password", headers={"WWW-Authenticate": "Bearer"})
    
    access_token = create_access_token(data={"sub": user["email"], "role": user["role"]})
    return {"access_token": access_token, "token_type": "bearer"}
