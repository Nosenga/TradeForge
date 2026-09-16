import os
import time
import threading
import requests
import pandas as pd
from dotenv import load_dotenv
from database import get_market_data, insert_market_data
from fastapi import HTTPException

TWELVEDATA_INTERVAL_MAP = {
    "1h" : "1h",
    "4h" : "4h",
    "1d" : "1day",
    "1w" : "1week",
}

load_dotenv()

def format_symbol_for_api(symbol):
    """
    Convert symbol to Twelve Data format.
    
    Examples:
    EURUSD → EUR/USD
    BTCUSD → BTC/USD
    ETHUSD → ETH/USD
    AAPL → AAPL (stocks stay the same)
    """
    if '/' in symbol:
        return symbol
    
    crypto_pairs = ['BTC', 'ETH', 'XRP', 'LTC', 'ADA', 'DOT', 'LINK', 'BNB', 'SOL', 'DOGE']
    if symbol[:3] in crypto_pairs and symbol[3:] == 'USD':
        return f"{symbol[:3]}/{symbol[3:]}"
    
    forex_pairs = ['EUR', 'GBP', 'USD', 'AUD', 'NZD', 'JPY', 'CHF', 'CAD']
    if len(symbol) == 6 and symbol[:3] in forex_pairs:
        return f"{symbol[:3]}/{symbol[3:]}"
    
    return symbol

API_KEY = os.getenv("TWELVE_DATA_API_KEY")
BASE_URL = "https://api.twelvedata.com"

def fetch_ohlcv(symbol, interval="1h", outputsize=100):
    """Fetch OHLCV data from Twelve Data API."""
    td_interval = TWELVEDATA_INTERVAL_MAP.get(interval, interval)
    formatted_symbol = format_symbol_for_api(symbol)
    
    url = f"{BASE_URL}/time_series"
    params = {
        "symbol": formatted_symbol,
        "interval": td_interval,
        "outputsize": outputsize,
        "apikey": API_KEY
    }
    
    try:
        response = requests.get(url, params=params, timeout=30)
        response.raise_for_status()
        data = response.json()
        
        if data.get('status') == 'error':
            raise Exception(data.get('message', 'API Error'))
        
        df = pd.DataFrame(data['values'])
        
        required_columns = {'datetime', 'open', 'high', 'low', 'close'}
        for col in required_columns:
            if col not in df.columns:
                raise Exception(f"Missing required column: {col}")
        
        if 'volume' not in df.columns:
            df['volume'] = 0.0
        
        df.rename(columns={'datetime': 'timestamp'}, inplace=True)
        
        df['timestamp'] = pd.to_datetime(df['timestamp'])
        df['open'] = df['open'].astype(float)
        df['high'] = df['high'].astype(float)
        df['low'] = df['low'].astype(float)
        df['close'] = df['close'].astype(float)
        df['volume'] = df['volume'].astype(float)
        
        return df
        
    except requests.exceptions.Timeout:
        raise Exception("API request timed out")
    except requests.exceptions.HTTPError as e:
        raise Exception(f"API HTTP error: {e}")
    except requests.exceptions.RequestException as e:
        raise Exception(f"API request failed: {e}")
    except Exception as e:
        raise Exception(f"Error processing data: {e}")

def save_market_data(symbol, timeframe, df):
    """Save DataFrame to database, clearing stale rows first.
    
    Why: previously we only INSERTed new rows with ON CONFLICT DO NOTHING,
    which left large gaps if a symbol hadn't been fetched in a while
    (e.g. 20 days). Indicators like SMA(200) then computed on
    non-continuous data. Now we delete anything older than the oldest
    row we're about to insert, then insert.
    """
    from database import db_connection
    import pandas as pd

    if df is None or len(df) == 0:
        print(f"⚠️  No data to save for {symbol} ({timeframe})")
        return

    # Get the oldest timestamp in the batch we're about to insert
    oldest_ts = df['timestamp'].min()

    # Delete stale rows that would sit BEFORE this batch
    with db_connection() as conn:
        cur = conn.cursor()
        try:
            cur.execute("""
                DELETE FROM market_data
                WHERE symbol = %s
                  AND timeframe = %s
                  AND timestamp < %s
            """, (symbol, timeframe, oldest_ts))
            deleted = cur.rowcount
            conn.commit()
            if deleted > 0:
                print(f"🧹 Cleared {deleted} stale rows for {symbol} ({timeframe})")
        finally:
            cur.close()

    # Insert the fresh batch
    inserted = insert_market_data(symbol, timeframe, df)
    print(f"✅ Inserted {inserted} rows for {symbol} ({timeframe})")

TIMEFRAME_SECONDS = {
    "1h": 3600,
    "4h": 4 * 3600,
    "1d": 24 * 3600,
    "1w": 7 * 24 * 3600,
}

# ---------------------------------------------------------------------------
# Per-symbol+timeframe fetch cooldown.
#
# analyze_symbol() (in strategies.py) now routes through
# get_or_fetch_market_data() instead of reading the DB directly, so that
# trading SIGNALS get the same freshness guarantee that order placement and
# position management already had. But that means every bot's signal check
# (once per 60s scheduler tick, per bot) can now trigger a real API call --
# and with multiple bots watching the same symbol/timeframe, or a bot
# ticking faster than a bar closes, that adds up fast against Twelve Data's
# free-tier limit of 8 requests/minute.
#
# This cooldown makes sure we never call the API for the same
# "symbol:timeframe" key more than once every COOLDOWN_SECONDS, regardless
# of how many callers ask for it in that window. It's in-memory (a plain
# dict), which is fine here: worst case on a process restart is one extra
# "cold" fetch per symbol/timeframe, not a correctness problem.
# ---------------------------------------------------------------------------

COOLDOWN_SECONDS = 30  # allows up to 2 fetches/min per symbol+timeframe,
                       # comfortably under the free tier's 8 req/min cap
                       # even with several symbols/timeframes in play.

_last_fetch_times: dict[str, float] = {}
_fetch_lock = threading.Lock()


def _cooldown_key(symbol: str, timeframe: str) -> str:
    return f"{symbol}:{timeframe}"


def _seconds_since_last_fetch(key: str) -> float:
    """Read-only check, does not mark a fetch. Used for logging/testing."""
    last = _last_fetch_times.get(key)
    if last is None:
        return float("inf")
    return time.time() - last


def _try_start_fetch(key: str) -> bool:
    """Atomically check-and-mark: returns True (and reserves the slot) if
    we're allowed to fetch now, False if we're still in cooldown.

    The check and the timestamp update happen under the same lock so two
    near-simultaneous callers (e.g. two bots on the same symbol ticking at
    the same moment) can't both slip through before either one records
    that a fetch has started.
    """
    with _fetch_lock:
        now = time.time()
        last = _last_fetch_times.get(key, 0.0)
        if now - last < COOLDOWN_SECONDS:
            return False
        _last_fetch_times[key] = now
        return True


def _is_data_fresh(db_data, timeframe):
    """Check whether the most recent cached candle is recent enough that
    we don't need to hit the API again.

    FIX (earlier pass): the old check only looked at row COUNT
    (`len(db_data) >= limit`), so once 100 candles existed for a symbol,
    this function would serve those same 100 candles forever and never
    refetch -- meaning bots could trade on arbitrarily stale prices. Now we
    also check the age of the latest candle against the timeframe's own bar
    length (with a little slack for API/processing lag).
    """
    if not db_data:
        return False

    latest_ts = pd.to_datetime(db_data[0]['timestamp'])
    if latest_ts.tzinfo is not None:
        now = pd.Timestamp.now(tz=latest_ts.tzinfo)
    else:
        now = pd.Timestamp.now(tz="UTC").tz_localize(None)

    bar_seconds = TIMEFRAME_SECONDS.get(timeframe, 3600)
    max_age_seconds = bar_seconds * 1.5

    age_seconds = (now - latest_ts).total_seconds()
    return age_seconds <= max_age_seconds


def get_or_fetch_market_data(symbol, timeframe="1h", limit=100):
    """Get from DB or fetch from API if not enough data, or if what we
    have is stale -- subject to a per-symbol+timeframe cooldown so repeated
    callers (multiple bots, multiple ticks) can't each trigger their own
    API call within the same short window.
    """

    if timeframe == "1d":
        api_limit = min(limit, 90)
        print(f"📊 Daily timeframe: adjusting limit from {limit} to {api_limit}")
    else:
        api_limit = limit

    key = _cooldown_key(symbol, timeframe)

    db_data = get_market_data(symbol, timeframe, limit)

    if db_data and len(db_data) >= limit and _is_data_fresh(db_data, timeframe):
        print(f"✅ Found {len(db_data)} fresh records in database for {symbol} ({timeframe})")
        return db_data

    if not _try_start_fetch(key):
        remaining = COOLDOWN_SECONDS - _seconds_since_last_fetch(key)
        print(
            f"⏳ Cooldown active for {key} ({max(remaining, 0):.0f}s remaining) — "
            f"skipping API fetch, serving cached data "
            f"({len(db_data) if db_data else 0} row(s), possibly stale/insufficient)."
        )
        return db_data if db_data else []

    print(f"🔄 Fetching {api_limit} candles from API for {symbol} ({timeframe})...")
    try:
        df = fetch_ohlcv(symbol, timeframe, api_limit)
    except Exception as e:
        # The cooldown slot is already reserved even though this fetch
        # failed (e.g. rate limit, network error) -- that's intentional:
        # it prevents a retry storm from every caller in the next few
        # seconds. Worst case, we wait out the rest of the cooldown before
        # trying again, serving stale/cached data in the meantime.
        print(f"❌ Fetch failed for {key}: {e}. Serving cached data if available.")
        return db_data if db_data else []

    save_market_data(symbol, timeframe, df)
    
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

    print("\nCalling again immediately -- should hit cooldown if a fetch just happened...")
    data2 = get_or_fetch_market_data(symbol, timeframe, limit)
    print(f"Second call returned {len(data2) if data2 else 0} records")

class MarketProvider:
    def fetch_ohlcv(self, symbol,interval,outputsize):
        pass

class TwelveDataProvider(MarketProvider):
    def fetch_ohlcv(self, symbol, interval, outputsize):
        pass

class TraderMadeProvider(MarketProvider):
    def fetch_ohlcv(self, symbol, interval, outputsize):
        pass

class MetaTraderProvider(MarketProvider):
    def fetch_ohlcv(self, symbol, interval, outputsize):
        pass