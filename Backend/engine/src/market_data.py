import os
import requests
import pandas as pd
from dotenv import load_dotenv
from database import get_market_data, insert_market_data

load_dotenv()

def format_symbol_for_api(symbol):
    # Format symbol for API compatibility
    symbol = symbol.upper()

    if len(symbol) == 6 and symbol.startswith(('EUR', 'USD', 'GBP', 'JPY', 'AUD', 'CAD', 'CHF', 'NZD')):
        # If it's a forex pair like EURUSD, format as EUR/USD
        symbol = f"{symbol[:3]}/{symbol[3:]}"
    return symbol

API_KEY = os.getenv("TWELVE_DATA_API_KEY")
BASE_URL = "https://api.twelvedata.com"

def fetch_ohlcv(symbol, interval="1h", outputsize=100):
    """Fetch OHLCV data from Twelve Data API."""
    formatted_symbol = format_symbol_for_api(symbol)
    url = f"{BASE_URL}/time_series"
    params = {
        "symbol": formatted_symbol,
        "interval": interval,
        "outputsize": outputsize,
        "apikey": API_KEY
    }
    
    try:
        response = requests.get(url, params=params, timeout=30)
        response.raise_for_status()
        data = response.json()
        
        # Check for API error
        if data.get('status') == 'error':
            raise Exception(data.get('message', 'API Error'))
        
        # Convert to DataFrame
        df = pd.DataFrame(data['values'])

        # Check required columns
        required_columns = {'datetime', 'open', 'high', 'low', 'close'}
        for col in required_columns:
            if col not in df.columns:
                raise Exception(f"Missing required column: {col}")


         # ---------------------------------------------
        
        if 'volume' not in df.columns:
            df['volume'] = 0.0  # Add volume column with default value 0.0 if missing
        
        
        # ----------------------------------------------
        
        # Rename datetime column to timestamp
        df.rename(columns={'datetime': 'timestamp'}, inplace=True)
       
        # Convert to proper types
        df['timestamp'] = pd.to_datetime(df['timestamp'])
        df['open'] = df['open'].astype(float)
        df['high'] = df['high'].astype(float)
        df['low'] = df['low'].astype(float)
        df['close'] = df['close'].astype(float)
        df['volume'] = df['volume'].astype(float)
        
        return df
        
    except requests.exceptions.Timeout:
        raise Exception("API request timed out")
    except requests.exceptions.RequestException as e:
        raise Exception(f"API request failed: {e}")
    except Exception as e:
        raise Exception(f"Error processing data: {e}")

def save_market_data(symbol, timeframe, df):
    """Save DataFrame to database."""
    inserted = insert_market_data(symbol, timeframe, df)
    print(f"✅ Inserted {inserted} rows for {symbol} ({timeframe})")

def get_or_fetch_market_data(symbol, timeframe="1h", limit=100):
    """Get from DB or fetch from API if not enough data."""
    # Try to get from database first
    db_data = get_market_data(symbol, timeframe, limit)
    
    # If database has enough data, return it
    if db_data and len(db_data) >= limit:
        print(f"✅ Found {len(db_data)} records in database for {symbol} ({timeframe})")
        return db_data
    
    # Otherwise fetch from API
    print(f"🔄 Fetching {limit} candles from API for {symbol} ({timeframe})...")
    df = fetch_ohlcv(symbol, timeframe, limit)
    
    # Save to database
    save_market_data(symbol, timeframe, df)
    
    # Return as list of dicts
    data = []
    for _, row in df.iterrows():
        data.append({
            'open': float(row['open']),
            'high': float(row['high']),
            'low': float(row['low']),
            'close': float(row['close']),
            'volume': float(row['volume']),
            'timestamp': row['timestamp'].isoformat()
        })
    
    return data


if __name__ == "__main__":
    # Test with EURUSD
    symbol = "EURUSD"
    timeframe = "1h"
    limit = 10
    
    print(f"Testing fetch for {symbol}...")
    data = get_or_fetch_market_data(symbol, timeframe, limit)
    
    if data:
        print(f"✅ Retrieved {len(data)} records")
        print(f"Latest price: {data[0]['close']} at {data[0]['timestamp']}")
    else:
        print("❌ No data retrieved")