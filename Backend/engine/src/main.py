from fastapi import FastAPI, Query, HTTPException, Depends, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from datetime import datetime
from pydantic import BaseModel, Field
from database import get_market_data
from market_data import get_or_fetch_market_data
from strategies import analyze_symbol, get_strategy_signal
from database import get_user_by_username, get_user_by_email, create_user,create_users_table
from auth import(
    verify_password,
    get_password_hash,
    create_access_token,
    get_current_user,
    get_current_user_from_token
)
app = FastAPI(title="TradeForge Trading Engine", version="1.0.0")
create_users_table()

#===================================================================
#PYDANTIC MODELS (Request/Response)
#===================================================================

class RegisterRequest(BaseModel):
    username:str = Field(..., min_length= 3, max_length= 50)
    email:str
    password:str = Field(..., min_length=6 , max_length=100)
    full_name:str = None

class LoginRequest(BaseModel):
    username:str
    password:str

class TokenResponse(BaseModel):
    access_token:str
    token_type:str
    username:str
    email:str

class UserResponse(BaseModel):
    id: int
    username:str
    email:str
    full_name:str
    is_active:bool

# ============================================
# AUTH ENDPOINTS
# ============================================

@app.post("/api/v1/auth/register", response_model=UserResponse)
async def register(request: RegisterRequest):
    """Register a new user."""
    # Check if username exists
    if get_user_by_username(request.username):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Username already taken"
        )
    
    # Check if email exists
    if get_user_by_email(request.email):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Email already registered"
        )
    
    # Hash password
    password_hash = get_password_hash(request.password)
    
    # Create user
    user = create_user(
        username=request.username,
        email=request.email,
        password_hash=password_hash,
        full_name=request.full_name
    )
    
    if user is None:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to create user"
        )
    
    return user


@app.post("/api/v1/auth/login", response_model=TokenResponse)
async def login(request: LoginRequest):
    """Login and get JWT token."""
    # Get user
    user = get_user_by_username(request.username)
    
    if user is None:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid username or password"
        )
    
    # Verify password
    if not verify_password(request.password, user['password_hash']):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid username or password"
        )
    
    # Check if user is active
    if not user.get('is_active', True):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="User account is inactive"
        )
    
    # Create access token
    access_token = create_access_token(
        data={"sub": user['username']}
    )
    
    return {
        "access_token": access_token,
        "token_type": "bearer",
        "username": user['username'],
        "email": user['email']
    }


@app.get("/api/v1/auth/me", response_model=UserResponse)
async def get_current_user_info(
    current_user: dict = Depends(get_current_user_from_token)
):
    """Get current user information (protected route)."""
    return {
        'id': current_user['id'],
        'username': current_user['username'],
        'email': current_user['email'],
        'full_name': current_user.get('full_name'),
        'is_active': current_user.get('is_active', True)
    }


@app.get("/api/v1/auth/protected")
async def protected_route(
    current_user: dict = Depends(get_current_user_from_token)
):
    """Example protected route."""
    return {
        "message": f"Hello {current_user['username']}! You are authenticated.",
        "user": current_user
    }

#----------------------------------------------------------------------------------------
@app.get("/health")
async def health_check():
    return {"status": "healthy", "timestamp": datetime.utcnow().isoformat()}

@app.get("/api/v1/market-data/{symbol}")
async def get_market_data_endpoint(
    symbol: str,
    interval: str = Query("1h", description="Timeframe: 1h, 4h, 1d, etc."),
    limit: int = Query(100, description="Number of candles", ge=1, le=1000)
):
    data = get_or_fetch_market_data(symbol, interval, limit)
    if data is None:
        return {"error": "Failed to retrieve market data."}
    return data

@app.get("/api/v1/market-data/{symbol}/latest")
async def get_latest_price_endpoint(symbol: str):
    data = get_market_data(symbol, "1h", limit=1)
    if data is None or len(data) == 0:
        return {"error": "Failed to retrieve latest price."}
    latest_price = data[0]['close']
    timestamp = data[0]['timestamp']
    return {"symbol": symbol, "latest_price": latest_price, "timestamp": timestamp}

# ============================================
# ✅ CRITICAL FIX: Multi endpoint MUST come BEFORE the dynamic {symbol} endpoint
# ============================================

@app.get("/api/v1/signals/multi")  # <-- STATIC route FIRST!
async def get_multi_signals_endpoint(
    symbols: str = Query(..., description="Comma-separated symbols: EURUSD,GBPUSD"),
    timeframe: str = Query("1h", description="Timeframe: 1h, 4h, 1d, etc.")
):
    """Get trading signals for multiple symbols at once."""
    symbol_list = [s.strip().upper() for s in symbols.split(',')]
    results = {}
    errors = {}
    
    for symbol in symbol_list:
        try:
            result = analyze_symbol(symbol, timeframe, 100)
            if isinstance(result, dict) and 'error' in result:
                errors[symbol] = result['error']
            else:
                results[symbol] = result
        except Exception as e:
            errors[symbol] = str(e)
    
    return {
        "timestamp": datetime.utcnow().isoformat(),
        "timeframe": timeframe,
        "results": results,
        "errors": errors if errors else None
    }

@app.get("/api/v1/signals/{symbol}")  # <-- DYNAMIC route AFTER static routes!
async def get_signal_endpoint(
    symbol: str,
    timeframe: str = Query("1h", description="Timeframe: 1h, 4h, 1d, etc."),
    limit: int = Query(100, description="Number of candles", ge=20, le=500)
):
    try:
        result = analyze_symbol(symbol, timeframe, limit)
        if 'error' in result:
            raise HTTPException(status_code=404, detail=result['error'])
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))