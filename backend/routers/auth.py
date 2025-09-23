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
    """
    Register a new user.
    
    This endpoint creates a new user account in the database.
    """
    try:
        # Check if database is available
        if db is None:
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="Database connection not available. Please check your Firebase configuration."
            )
        
        # Check if user already exists
        user_ref = db.collection('users').document(user_in.email)
        existing_user = user_ref.get()
        
        if existing_user.exists:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST, 
                detail="Email already registered"
            )
        
        # Hash the password
        hashed_password = get_password_hash(user_in.password)
        
        # Create user object
        user_db = User(
            email=user_in.email,
            role=user_in.role,
            hashed_password=hashed_password,
            user_name=user_in.user_name,
        )
        
        # Save user to database
        user_ref.set(user_db.model_dump())
        
        return {"message": "User registered successfully"}
        
    except HTTPException:
        # Re-raise HTTP exceptions as they are already properly formatted
        raise
    except Exception as e:
        # Handle any other unexpected errors
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Registration failed: {str(e)}"
        )

def authenticate_user(email: str, password: str) -> Optional[User]:
    """
    Authenticate a user by email and password.
    
    Returns the user object if authentication is successful, None otherwise.
    """
    try:
        # Check if database is available
        if db is None:
            return None
        
        # Get user from database
        user_ref = db.collection('users').document(email)
        user_doc = user_ref.get()
        
        if not user_doc.exists:
            return None
        
        # Parse user data
        user_data = user_doc.to_dict()
        user = User(**user_data)
        
        # Verify password
        if not verify_password(password, user.hashed_password):
            return None
        
        return user
        
    except Exception as e:
        # Log error and return None for any authentication errors
        print(f"Authentication error: {e}")
        return None

@router.post('/token', status_code=status.HTTP_200_OK)
def login(form_data: OAuth2PasswordRequestForm = Depends()):
    """
    Login endpoint for user authentication.
    
    Returns an access token if credentials are valid.
    """
    try:
        # Authenticate user
        user = authenticate_user(form_data.username, form_data.password)
        
        if not user:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED, 
                detail="Incorrect email or password", 
                headers={"WWW-Authenticate": "Bearer"}
            )
        
        # Create access token
        access_token = create_access_token(data={"sub": user.email, "role": user.role})
        
        return {
            "access_token": access_token, 
            "token_type": "bearer", 
            "role": user.role
        }
        
    except HTTPException:
        # Re-raise HTTP exceptions as they are already properly formatted
        raise
    except Exception as e:
        # Handle any other unexpected errors
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Authentication failed: {str(e)}"
        )