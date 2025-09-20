from fastapi import APIRouter, HTTPException, status, Depends
from fastapi.security import OAuth2PasswordRequestForm
from pydantic import EmailStr
from backend.models import User
from typing import Dict
import jwt
import datetime

SECRET_KEY = "your_secret_key"  # Change this in production
ALGORITHM = "HS256"

router = APIRouter(prefix="/auth", tags=["auth"])

# In-memory user store for demo purposes
fake_users_db: Dict[str, User] = {}

@router.post('/register', status_code=status.HTTP_201_CREATED)
def register(user: User):
    if user.email in fake_users_db:
        raise HTTPException(status_code=400, detail="Email already registered")
    fake_users_db[user.email] = user
    return {"message": "User registered successfully"}

def authenticate_user(email: str, password: str):
    user = fake_users_db.get(email)
    if not user or user.password != password:
        return False
    return user

def create_access_token(data: dict, expires_delta: int = 3600):
    to_encode = data.copy()
    expire = datetime.datetime.utcnow() + datetime.timedelta(seconds=expires_delta)
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
    return encoded_jwt

@router.post('/token')
def login(form_data: OAuth2PasswordRequestForm = Depends()):
    user = authenticate_user(form_data.username, form_data.password)
    if not user:
        raise HTTPException(status_code=401, detail="Incorrect email or password")
    access_token = create_access_token({"sub": user.email})
    return {"access_token": access_token, "token_type": "bearer"}
