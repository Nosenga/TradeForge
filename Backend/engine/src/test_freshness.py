"""
Test the full market data pipeline:
1. First call triggers a fetch (cleanup + insert + cooldown starts)
2. Second call immediately after should hit cooldown
3. Third call after waiting should fetch again
"""
import time
from market_data import get_or_fetch_market_data

print("=" * 60)
print("TEST 1: First call (should fetch)")
print("=" * 60)
data1 = get_or_fetch_market_data("EURUSD", "1h", 100)
print(f"→ Returned {len(data1)} candles")
print(f"→ Latest: {data1[0]['timestamp']} close={data1[0]['close']}")

print()
print("=" * 60)
print("TEST 2: Immediate second call (should hit cooldown)")
print("=" * 60)
data2 = get_or_fetch_market_data("EURUSD", "1h", 100)
print(f"→ Returned {len(data2)} candles")
print(f"→ Latest: {data2[0]['timestamp']} close={data2[0]['close']}")

print()
print("=" * 60)
print("TEST 3: Wait 35s then call again (should fetch)")
print("=" * 60)
print("Waiting 35 seconds...")
time.sleep(35)
data3 = get_or_fetch_market_data("EURUSD", "1h", 100)
print(f"→ Returned {len(data3)} candles")
print(f"→ Latest: {data3[0]['timestamp']} close={data3[0]['close']}")