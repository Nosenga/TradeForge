"""
Authentication Module
Handles JWT tokens, password hashing, and user authentication.
"""

import os
from datetime import datetime, timedelta
from dotenv import load_dotenv
from jose import JWTError, jwt
from fastapi import HTTPException, Depends, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from database import get_user_by_username, get_user_by_email

load_dotenv()

# ============================================
# CONFIGURATION
# ============================================

# JWT Configuration
SECRET_KEY = os.getenv("JWT_SECRET_KEY")
if not SECRET_KEY:
    raise RuntimeError(
        "JWT_SECRET_KEY is not set in the environment. "
        "Generate one with: python -c \"import secrets; print(secrets.token_hex(32))\" "
        "and add it to your .env file."
    )

ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 60 * 24  # 24 hours

security = HTTPBearer()


# ============================================
# PASSWORD FUNCTIONS
# ============================================

# Try to use bcrypt (preferred); fall back to sha256_crypt if bcrypt isn't installed.
try:
    import bcrypt
    BCRYPT_AVAILABLE = True
except ImportError:
    BCRYPT_AVAILABLE = False

if BCRYPT_AVAILABLE:
    def verify_password(plain_password, hashed_password):
        """Verify a plain password against a bcrypt hash."""
        if isinstance(hashed_password, str):
            hashed_password = hashed_password.encode("utf-8")
        return bcrypt.checkpw(plain_password.encode("utf-8"), hashed_password)

    def get_password_hash(password):
        """Hash a password with bcrypt. Returns a str."""
        hashed = bcrypt.hashpw(password.encode("utf-8"), bcrypt.gensalt())
        return hashed.decode("utf-8")
else:
    # Fallback to passlib sha256_crypt (kept only for environments where
    # bcrypt cannot be installed -- e.g., missing C++ build tools on Windows)
    from passlib.context import CryptContext
    pwd_context = CryptContext(schemes=["sha256_crypt"], deprecated="auto")

    def verify_password(plain_password, hashed_password):
        return pwd_context.verify(plain_password, hashed_password)

    def get_password_hash(password):
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
# AUTHENTICATION DEPENDENCIES
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
    print(f"bcrypt available: {BCRYPT_AVAILABLE}")
    
    password = "test123"
    hashed = get_password_hash(password)
    print(f"✅ Password: {password}")
    print(f"✅ Hashed: {hashed[:40]}...")
    print(f"✅ Verify correct: {verify_password(password, hashed)}")
    print(f"✅ Verify wrong:   {verify_password('wrong', hashed)}")
    
    token = create_access_token({"sub": "testuser"})
    print(f"✅ JWT Token: {token[:40]}...")
    
    decoded = decode_token(token)
    print(f"✅ Decoded: {decoded}")