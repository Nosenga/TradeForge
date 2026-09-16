"""
Force a fetch by clearing the cache, then test cooldown.
"""
from database import db_connection
from market_data import get_or_fetch_market_data
import time

print("=" * 60)
print("STEP 1: Clear EURUSD 1h cache to force a fetch")
print("=" * 60)

with db_connection() as conn:
    cur = conn.cursor()
    cur.execute("""
        DELETE FROM market_data
        WHERE symbol = 'EURUSD' AND timeframe = '1h'
    """)
    deleted = cur.rowcount
    conn.commit()
    cur.close()
    print(f"🧹 Deleted {deleted} rows")

print()
print("=" * 60)
print("STEP 2: First call — should trigger fetch")
print("=" * 60)
data1 = get_or_fetch_market_data("EURUSD", "1h", 100)
print(f"→ Returned {len(data1)} candles")

print()
print("=" * 60)
print("STEP 3: Immediate second call — should hit cooldown")
print("=" * 60)
data2 = get_or_fetch_market_data("EURUSD", "1h", 100)
print(f"→ Returned {len(data2)} candles")

print()
print("=" * 60)
print("STEP 4: Wait 35s, then call — should fetch again")
print("=" * 60)
print("Waiting 35 seconds...")
time.sleep(35)
data3 = get_or_fetch_market_data("EURUSD", "1h", 100)
print(f"→ Returned {len(data3)} candles")

print()
print("=" * 60)
print("DONE")
print("=" * 60)