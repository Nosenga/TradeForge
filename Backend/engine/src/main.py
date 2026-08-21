from fastapi import FastAPI, Query
from datetime import datetime
from database import get_market_data
from market_data import get_or_fetch_market_data

app = FastAPI(title="TradeForge Trading Engine", version="1.0.0")

@app.get("/health")
async def health_check():
    return {"status": "healthy", "timestamp": datetime.utcnow().isoformat()}

@app.get("/api/v1/market-data/{symbol}")
async def get_market_data_endpoint(
    symbol: str,
    interval: str = Query("1h", description="Timeframe: 1h, 4h, 1d, etc."),
    limit: int = Query(100, description="Number of candles", ge=1, le=1000)
):
    """Get OHLCV market data for a symbol."""
    data = get_or_fetch_market_data(symbol, interval, limit)
    if data is None:
        return {"error": "Failed to retrieve market data."}
    return data

@app.get("/api/v1/market-data/{symbol}/latest")
async def get_latest_price_endpoint(symbol: str):
    """Get the latest price for a symbol."""
    data = get_market_data(symbol, "1h", limit=1)
    if data is None or len(data) == 0:
        return {"error": "Failed to retrieve latest price."}
    latest_price = data[0]['close']
    timestamp = data[0]['timestamp']
    return {"symbol": symbol, "latest_price": latest_price, "timestamp": timestamp}