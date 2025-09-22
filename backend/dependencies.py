from fastapi.security import OAuth2PasswordBearer

# This scheme is used by both auth and security modules.
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/auth/token")