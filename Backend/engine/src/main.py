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
from fastapi.middleware.cors import CORSMiddleware
from database import create_trading_tables


app = FastAPI(title="TradeForge Trading Engine", version="1.0.0")

# CORS - Allow frontend to talk to backend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://127.0.0.1:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


create_users_table()
create_trading_tables()



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
    is_active:bool = True

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
# =================================================
# UPDATE
# =================================================

from indicators import (
    calculate_rsi,
    calculate_macd,
    calculate_bollinger_bands,
    calculate_sma,
    calculate_ema
)
from market_data import get_or_fetch_market_data
import pandas as pd

# ============================================
# INDICATOR ENDPOINTS
# ============================================

@app.get("/api/v1/indicators/rsi/{symbol}")
async def get_rsi_endpoint(
    symbol: str,
    interval: str = Query("1h"),
    period: int = Query(14),
    limit: int = Query(100, ge=20, le=500)
):
    """Get RSI data for a symbol."""
    try:
        # Fetch market data
        df = get_or_fetch_market_data(symbol, interval, limit)
        
        if not df or len(df) < period:
            return {"error": "Insufficient data"}
        
        # Convert to DataFrame if needed
        if isinstance(df, list):
            df = pd.DataFrame(df)
            df['timestamp'] = pd.to_datetime(df['timestamp'])
            df.set_index('timestamp', inplace=True)
            df.sort_index(inplace=True)
        
        # Calculate RSI
        rsi = calculate_rsi(df['close'], period)
        
        # Format response
        data = []
        for idx, value in rsi.items():
            data.append({
                'timestamp': idx.isoformat() if hasattr(idx, 'isoformat') else str(idx),
                'value': float(value) if not pd.isna(value) else None
            })
        
        return {
            "symbol": symbol,
            "interval": interval,
            "period": period,
            "data": data
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.get("/api/v1/indicators/macd/{symbol}")
async def get_macd_endpoint(
    symbol: str,
    interval: str = Query("1h"),
    fast: int = Query(12),
    slow: int = Query(26),
    signal: int = Query(9),
    limit: int = Query(100, ge=20, le=500)
):
    """Get MACD data for a symbol."""
    try:
        # Fetch market data
        df = get_or_fetch_market_data(symbol, interval, limit)
        
        if not df or len(df) < slow:
            return {"error": "Insufficient data"}
        
        # Convert to DataFrame if needed
        if isinstance(df, list):
            df = pd.DataFrame(df)
            df['timestamp'] = pd.to_datetime(df['timestamp'])
            df.set_index('timestamp', inplace=True)
            df.sort_index(inplace=True)
        
        # Calculate MACD
        macd_line, signal_line, histogram = calculate_macd(df['close'], fast, slow, signal)
        
        # Format response
        data = []
        for idx in df.index:
            data.append({
                'timestamp': idx.isoformat() if hasattr(idx, 'isoformat') else str(idx),
                'macd': float(macd_line.loc[idx]) if idx in macd_line.index and not pd.isna(macd_line.loc[idx]) else None,
                'signal': float(signal_line.loc[idx]) if idx in signal_line.index and not pd.isna(signal_line.loc[idx]) else None,
                'histogram': float(histogram.loc[idx]) if idx in histogram.index and not pd.isna(histogram.loc[idx]) else None
            })
        
        return {
            "symbol": symbol,
            "interval": interval,
            "fast": fast,
            "slow": slow,
            "signal": signal,
            "data": data
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.get("/api/v1/indicators/bollinger/{symbol}")
async def get_bollinger_endpoint(
    symbol: str,
    interval: str = Query("1h"),
    window: int = Query(20),
    num_std: int = Query(2),
    limit: int = Query(100, ge=20, le=500)
):
    """Get Bollinger Bands for a symbol."""
    try:
        # Fetch market data
        df = get_or_fetch_market_data(symbol, interval, limit)
        
        if not df or len(df) < window:
            return {"error": "Insufficient data"}
        
        # Convert to DataFrame if needed
        if isinstance(df, list):
            df = pd.DataFrame(df)
            df['timestamp'] = pd.to_datetime(df['timestamp'])
            df.set_index('timestamp', inplace=True)
            df.sort_index(inplace=True)
        
        # Calculate Bollinger Bands
        upper, middle, lower = calculate_bollinger_bands(df['close'], window, num_std)
        
        # Format response
        data = []
        for idx in df.index:
            data.append({
                'timestamp': idx.isoformat() if hasattr(idx, 'isoformat') else str(idx),
                'upper': float(upper.loc[idx]) if idx in upper.index and not pd.isna(upper.loc[idx]) else None,
                'middle': float(middle.loc[idx]) if idx in middle.index and not pd.isna(middle.loc[idx]) else None,
                'lower': float(lower.loc[idx]) if idx in lower.index and not pd.isna(lower.loc[idx]) else None
            })
        
        return {
            "symbol": symbol,
            "interval": interval,
            "window": window,
            "num_std": num_std,
            "data": data
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/api/v1/strategies")
async def get_strategies():
    """Get all available strategies."""
    # For now, return hardcoded strategies
    # Later, fetch from database
    return [
        {
            "id": 1,
            "name": "RSI Oversold/Overbought",
            "description": "Buy when RSI drops below 30, sell when RSI rises above 70.",
            "timeframe": "1h",
            "win_rate": 62.5,
            "total_trades": 87,
            "profit_factor": 1.45,
            "is_active": True,
            "indicators": ["RSI(14)"]
        },
        {
            "id": 2,
            "name": "MACD Crossover",
            "description": "Buy when MACD crosses above signal line, sell when it crosses below.",
            "timeframe": "4h",
            "win_rate": 58.3,
            "total_trades": 112,
            "profit_factor": 1.32,
            "is_active": True,
            "indicators": ["MACD(12,26,9)"]
        },
        {
            "id": 3,
            "name": "Bollinger Bands Breakout",
            "description": "Buy when price touches lower band, sell when it touches upper band.",
            "timeframe": "1h",
            "win_rate": 55.8,
            "total_trades": 95,
            "profit_factor": 1.28,
            "is_active": True,
            "indicators": ["BB(20,2)"]
        },
        {
            "id": 4,
            "name": "SMA Crossover (Golden Cross)",
            "description": "Buy when 50-day SMA crosses above 200-day SMA, sell when it crosses below.",
            "timeframe": "1d",
            "win_rate": 65.2,
            "total_trades": 45,
            "profit_factor": 1.78,
            "is_active": True,
            "indicators": ["SMA(50)", "SMA(200)"]
        }
    ]

# ============================================
# BACKTESTING ENDPOINT
# ============================================

from datetime import datetime, timedelta
import pandas as pd
import numpy as np
from market_data import get_or_fetch_market_data
from strategies import analyze_symbol

class BacktestEngine:
    @staticmethod
    def run_backtest(symbol, strategy_id, timeframe, start_date, end_date, initial_balance=10000):
        """Run a backtest on a strategy."""
        
        # Fetch historical data
        data = get_or_fetch_market_data(symbol, timeframe, 500)
        if not data or len(data) < 50:
            return {"error": "Insufficient data for backtesting"}
        
        # Convert to DataFrame
        df = pd.DataFrame(data)
        df['timestamp'] = pd.to_datetime(df['timestamp'])
        df.set_index('timestamp', inplace=True)
        df.sort_index(inplace=True)
        
        # Filter by date range
        start = pd.to_datetime(start_date)
        end = pd.to_datetime(end_date)
        df = df[(df.index >= start) & (df.index <= end)]
        
        if len(df) < 20:
            return {"error": "Not enough data in date range"}
        
        # Get strategy signal function based on strategy_id
        signal_func = get_strategy_by_id(strategy_id)
        
        # Run backtest
        trades = []
        balance = initial_balance
        position = 0
        entry_price = 0
        equity_curve = []
        stop_loss = None
        take_profit = None
        
        for i in range(len(df)):
            price = df.iloc[i]['close']
            timestamp = df.index[i]
            
            # Check if position is open and should be closed
            if position != 0:
                # Check stop loss / take profit
                if stop_loss and take_profit:
                    if position == 1:  # Long
                        if price <= stop_loss or price >= take_profit:
                            # Close position
                            pnl = (price - entry_price) * position * 1000
                            balance += pnl
                            trades.append({
                                'entry_time': entry_time,
                                'exit_time': timestamp,
                                'action': 'CLOSE',
                                'entry_price': entry_price,
                                'exit_price': price,
                                'pnl': pnl,
                                'balance': balance
                            })
                            position = 0
                            entry_price = 0
                            stop_loss = None
                            take_profit = None
                    elif position == -1:  # Short
                        if price >= stop_loss or price <= take_profit:
                            pnl = (entry_price - price) * abs(position) * 1000
                            balance += pnl
                            trades.append({
                                'entry_time': entry_time,
                                'exit_time': timestamp,
                                'action': 'CLOSE',
                                'entry_price': entry_price,
                                'exit_price': price,
                                'pnl': pnl,
                                'balance': balance
                            })
                            position = 0
                            entry_price = 0
                            stop_loss = None
                            take_profit = None
            
            # Check for new signal
            if position == 0 and i >= 20:
                try:
                    signal = signal_func(df.iloc[:i])
                    if signal and signal.get('action') in ['BUY', 'SELL']:
                        action = signal['action']
                        entry_price = price
                        entry_time = timestamp
                        
                        # Set position
                        if action == 'BUY':
                            position = 1
                        else:
                            position = -1
                        
                        # Set stop loss and take profit (2% stop, 4% take profit)
                        if action == 'BUY':
                            stop_loss = price * 0.98
                            take_profit = price * 1.04
                        else:
                            stop_loss = price * 1.02
                            take_profit = price * 0.96
                        
                        trades.append({
                            'entry_time': entry_time,
                            'exit_time': None,
                            'action': action,
                            'entry_price': entry_price,
                            'exit_price': None,
                            'pnl': None,
                            'balance': balance
                        })
                except Exception as e:
                    # Skip errors in signal generation
                    pass
            
            # Record equity
            current_balance = balance
            if position != 0:
                if position == 1:
                    current_balance = balance + (price - entry_price) * position * 1000
                else:
                    current_balance = balance + (entry_price - price) * abs(position) * 1000
            
            equity_curve.append({
                'timestamp': timestamp.isoformat(),
                'balance': current_balance
            })
        
        # Calculate metrics
        total_trades = len([t for t in trades if t.get('action') == 'CLOSE'])
        winning_trades = len([t for t in trades if t.get('action') == 'CLOSE' and t.get('pnl', 0) > 0])
        losing_trades = len([t for t in trades if t.get('action') == 'CLOSE' and t.get('pnl', 0) <= 0])
        
        win_rate = (winning_trades / total_trades * 100) if total_trades > 0 else 0
        
        # Calculate profit factor
        total_profit = sum([t.get('pnl', 0) for t in trades if t.get('action') == 'CLOSE' and t.get('pnl', 0) > 0])
        total_loss = abs(sum([t.get('pnl', 0) for t in trades if t.get('action') == 'CLOSE' and t.get('pnl', 0) < 0]))
        profit_factor = total_profit / total_loss if total_loss > 0 else 0
        
        # Calculate max drawdown
        max_balance = initial_balance
        max_drawdown = 0
        for eq in equity_curve:
            if eq['balance'] > max_balance:
                max_balance = eq['balance']
            drawdown = (max_balance - eq['balance']) / max_balance * 100
            if drawdown > max_drawdown:
                max_drawdown = drawdown
        
        final_balance = equity_curve[-1]['balance'] if equity_curve else initial_balance
        total_return = (final_balance - initial_balance) / initial_balance * 100
        
        return {
            'strategy_id': strategy_id,
            'symbol': symbol,
            'timeframe': timeframe,
            'start_date': start_date,
            'end_date': end_date,
            'initial_balance': initial_balance,
            'final_balance': final_balance,
            'total_return': total_return,
            'total_trades': total_trades,
            'winning_trades': winning_trades,
            'losing_trades': losing_trades,
            'win_rate': win_rate,
            'profit_factor': profit_factor,
            'max_drawdown': max_drawdown,
            'total_profit': total_profit,
            'total_loss': total_loss,
            'trades': trades,
            'equity_curve': equity_curve
        }


def get_strategy_by_id(strategy_id):
    """Return the signal function for a strategy ID."""
    strategies = {
        1: rsi_strategy,
        2: macd_strategy,
        3: bollinger_strategy,
        4: sma_crossover_strategy,
    }
    return strategies.get(strategy_id, rsi_strategy)


# Strategy Signal Functions
def rsi_strategy(df):
    """RSI Oversold/Overbought Strategy."""
    from indicators import calculate_rsi
    if len(df) < 14:
        return {"action": "HOLD"}
    
    rsi = calculate_rsi(df['close'], 14)
    if rsi.iloc[-1] < 30:
        return {"action": "BUY"}
    elif rsi.iloc[-1] > 70:
        return {"action": "SELL"}
    return {"action": "HOLD"}


def macd_strategy(df):
    """MACD Crossover Strategy."""
    from indicators import calculate_macd
    if len(df) < 26:
        return {"action": "HOLD"}
    
    macd, signal, hist = calculate_macd(df['close'])
    if macd.iloc[-1] > signal.iloc[-1] and macd.iloc[-2] <= signal.iloc[-2]:
        return {"action": "BUY"}
    elif macd.iloc[-1] < signal.iloc[-1] and macd.iloc[-2] >= signal.iloc[-2]:
        return {"action": "SELL"}
    return {"action": "HOLD"}


def bollinger_strategy(df):
    """Bollinger Bands Breakout Strategy."""
    from indicators import calculate_bollinger_bands
    if len(df) < 20:
        return {"action": "HOLD"}
    
    upper, middle, lower = calculate_bollinger_bands(df['close'])
    price = df['close'].iloc[-1]
    
    if price < lower.iloc[-1]:
        return {"action": "BUY"}
    elif price > upper.iloc[-1]:
        return {"action": "SELL"}
    return {"action": "HOLD"}


def sma_crossover_strategy(df):
    """SMA Crossover Strategy."""
    from indicators import calculate_sma
    if len(df) < 200:
        return {"action": "HOLD"}
    
    sma_50 = calculate_sma(df['close'], 50)
    sma_200 = calculate_sma(df['close'], 200)
    
    if sma_50.iloc[-1] > sma_200.iloc[-1] and sma_50.iloc[-2] <= sma_200.iloc[-2]:
        return {"action": "BUY"}
    elif sma_50.iloc[-1] < sma_200.iloc[-1] and sma_50.iloc[-2] >= sma_200.iloc[-2]:
        return {"action": "SELL"}
    return {"action": "HOLD"}


# ✅ Add this Pydantic model
class BacktestRequest(BaseModel):
    strategy_id: int
    symbol: str
    timeframe: str = "1h"
    start_date: str = None
    end_date: str = None
    initial_balance: float = 10000

@app.post("/api/v1/backtest")
async def run_backtest(request: BacktestRequest):  # ✅ Use request body
    """Run a backtest on a strategy."""
    try:
        if not request.start_date:
            request.start_date = (datetime.now() - timedelta(days=180)).strftime("%Y-%m-%d")
        if not request.end_date:
            request.end_date = datetime.now().strftime("%Y-%m-%d")
        
        result = BacktestEngine.run_backtest(
            symbol=request.symbol,
            strategy_id=request.strategy_id,
            timeframe=request.timeframe,
            start_date=request.start_date,
            end_date=request.end_date,
            initial_balance=request.initial_balance
        )
        
        if result.get('error'):
            raise HTTPException(status_code=400, detail=result['error'])
        
        return result
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


# ============================================
# TRADING ENDPOINTS
# ============================================

from orders import OrderManager
from pydantic import BaseModel, Field

class OrderRequest(BaseModel):
    symbol: str
    action: str # BUY or SELL
    lot_size: float = Field(..., gt=0, description="Lot size must be greater than 0")
    stop_loss: float = None
    take_profit: float = None


@app.post("/api/v1/trade/order")
async def place_order(

    request: OrderRequest,
    current_user: dict = Depends(get_current_user_from_token)

):
    """Place Order."""
    try:
        # Convert to float to be safe
        lot_size = float(request.lot_size)
        
        #Validate action
        if request.action not in ['BUY','SELL']:
            raise HTTPException(400, "Action must be BUY or SELL")

        #Validate lot size
        if lot_size <=0:
            raise HTTPException(400 , "Lot size must be greater than 0")

        order_manager = OrderManager(current_user['id'])
        order = order_manager.place_order(
            symbol= request.symbol,
            action=request.action,
            lot_size=request.lot_size,
            stop_loss=request.stop_loss,
            take_profit=request.take_profit
        )

        if not order:
            raise HTTPException(500 , "Failed to place order")

        return {
            "order_id":order.order_id,
            "symbol":order.symbol,
            "action":order.action,
            "lot_size":order.lot_size,
            "status": order.status,
            "filled_price":order.filled_price,
            "created_at":order.created_at
        }
    
    except ValueError:
        raise HTTPException(400, "Lot size must be a valid number")
    
    except Exception as e:
        raise HTTPException(500, str(e))

@app.get("/api/v1/trade/orders")
async def get_orders(
    status: str = None,
    current_user: dict = Depends(get_current_user_from_token)
):
    """Get user's orders."""
    try:
        orders = OrderManager.get_orders(current_user['id'], status)
        return {"orders": orders}
        
    except Exception as e:
        raise HTTPException(500, str(e))


@app.get("/api/v1/trade/positions")
async def get_positions(
    current_user: dict = Depends(get_current_user_from_token)
):
    """Get user's open positions."""
    try:
        positions = OrderManager.get_positions(current_user['id'])
        return {"positions": positions}
        
    except Exception as e:
        raise HTTPException(500, str(e))