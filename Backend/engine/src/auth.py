"""
Authentication Module
Handles JWT tokens, password hashing, and user authentication
"""

from datetime import datetime, timedelta
from jose import JWTError, jwt
from passlib.context import CryptContext
from fastapi import HTTPException, Depends, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from database import get_user_by_username, get_user_by_email

# ============================================
# CONFIGURATION
# ============================================

# ✅ FIX: Use sha256_crypt instead of bcrypt
pwd_context = CryptContext(schemes=["sha256_crypt"], deprecated="auto")

# JWT Configuration
SECRET_KEY = "your-secret-key-change-this-in-production"
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 60 * 24  # 24 hours

# Security scheme for protected routes
security = HTTPBearer()


# ============================================
# PASSWORD FUNCTIONS
# ============================================

def verify_password(plain_password, hashed_password):
    """Verify a plain password against a hashed password."""
    return pwd_context.verify(plain_password, hashed_password)


def get_password_hash(password):
    """Hash a password."""
    return pwd_context.hash(password)


# ============================================
# JWT FUNCTIONS
# ============================================

def create_access_token(data: dict, expires_delta: timedelta = None):
    """Create a JWT access token."""
    to_encode = data.copy()
    
    if expires_delta:
        expire = datetime.utcnow() + expires_delta
    else:
        expire = datetime.utcnow() + timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
    
    return encoded_jwt


def decode_token(token: str):
    """Decode a JWT token."""
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        return payload
    except JWTError:
        return None


def get_current_user(token: str):
    """Get current user from token."""
    payload = decode_token(token)
    if payload is None:
        return None
    
    username = payload.get("sub")
    if username is None:
        return None
    
    user = get_user_by_username(username)
    return user


# ============================================
# AUTHENTICATION DEPENDENCIES (For Protected Routes)
# ============================================

async def get_current_user_from_token(
    credentials: HTTPAuthorizationCredentials = Depends(security)
):
    """Dependency for protected routes."""
    token = credentials.credentials
    user = get_current_user(token)
    
    if user is None:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid authentication credentials",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    if not user.get('is_active'):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="User account is inactive"
        )
    
    return user


# ============================================
# TEST BLOCK
# ============================================

if __name__ == "__main__":
    # Test password hashing
    password = "test123"
    hashed = get_password_hash(password)
    print(f"✅ Password: {password}")
    print(f"✅ Hashed: {hashed}")
    print(f"✅ Verify: {verify_password(password, hashed)}")
    
    # Test JWT
    token = create_access_token({"sub": "testuser"})
    print(f"✅ JWT Token: {token}")
    
    decoded = decode_token(token)
    print(f"✅ Decoded: {decoded}")