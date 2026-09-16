"""
Diagnostic: Compare engine price vs live Twelve Data price.
"""
import os
import requests
from datetime import datetime, timezone
from dotenv import load_dotenv

load_dotenv()
API_KEY = os.getenv("TWELVE_DATA_API_KEY")

print("=" * 60)
print("PRICE FRESHNESS DIAGNOSTIC")
print("=" * 60)
print(f"Local time:  {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
print(f"UTC time:    {datetime.now(timezone.utc).strftime('%Y-%m-%d %H:%M:%S')}")
print()

# 1. Engine's cached price
print("--- ENGINE (cached in DB) ---")
from market_data import get_or_fetch_market_data
try:
    data = get_or_fetch_market_data("EURUSD", "1h", 3)
    for i, candle in enumerate(data):
        marker = "← latest" if i == 0 else ""
        print(f"  {candle['timestamp']}: close={candle['close']} {marker}")
except Exception as e:
    print(f"  ❌ Error: {e}")

# 2. Twelve Data LIVE price
print()
print("--- TWELVE DATA (live API) ---")
try:
    url = "https://api.twelvedata.com/price"
    params = {"symbol": "EUR/USD", "apikey": API_KEY}
    r = requests.get(url, params=params, timeout=10)
    live = r.json()
    print(f"  Response: {live}")
except Exception as e:
    print(f"  ❌ Error: {e}")

# 3. Twelve Data latest candle
print()
print("--- TWELVE DATA (latest 1h candle) ---")
try:
    url = "https://api.twelvedata.com/time_series"
    params = {
        "symbol": "EUR/USD",
        "interval": "1h",
        "outputsize": 3,
        "apikey": API_KEY,
    }
    r = requests.get(url, params=params, timeout=10)
    data = r.json()
    if data.get("status") == "error":
        print(f"  ❌ API error: {data.get('message')}")
    else:
        for i, candle in enumerate(data.get("values", [])):
            marker = "← latest" if i == 0 else ""
            print(f"  {candle['datetime']}: close={candle['close']} {marker}")
except Exception as e:
    print(f"  ❌ Error: {e}")

print()
print("=" * 60)