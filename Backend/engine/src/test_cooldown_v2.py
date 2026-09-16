"""
Test cooldown by making data artificially stale.
"""
from database import db_connection
from market_data import get_or_fetch_market_data
import time

print("=" * 60)
print("STEP 1: Clear cache")
print("=" * 60)

with db_connection() as conn:
    cur = conn.cursor()
    cur.execute("DELETE FROM market_data WHERE symbol = 'EURUSD' AND timeframe = '1h'")
    conn.commit()
    print(f"🧹 Deleted {cur.rowcount} rows")
    cur.close()

print()
print("=" * 60)
print("STEP 2: First call — triggers fetch, starts cooldown")
print("=" * 60)
data1 = get_or_fetch_market_data("EURUSD", "1h", 100)
print(f"→ {len(data1)} candles")

print()
print("=" * 60)
print("STEP 3: Corrupt the timestamps to look old")
print("=" * 60)

# Set all timestamps to be 10 days old so freshness check fails
with db_connection() as conn:
    cur = conn.cursor()
    cur.execute("""
        UPDATE market_data
        SET timestamp = timestamp - INTERVAL '10 days'
        WHERE symbol = 'EURUSD' AND timeframe = '1h'
    """)
    conn.commit()
    print(f"🕰️  Made {cur.rowcount} rows appear 10 days old")
    cur.close()

print()
print("=" * 60)
print("STEP 4: Immediate call — data is stale, but cooldown active")
print("=" * 60)
data2 = get_or_fetch_market_data("EURUSD", "1h", 100)
print(f"→ {len(data2)} candles")

print()
print("=" * 60)
print("STEP 5: Wait 35s, then call — cooldown expired, should fetch")
print("=" * 60)
print("Waiting 35 seconds...")
time.sleep(35)
data3 = get_or_fetch_market_data("EURUSD", "1h", 100)
print(f"→ {len(data3)} candles")