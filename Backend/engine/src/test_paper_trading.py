"""
Full paper trading test with Godz account.
"""
import requests

BASE_URL = "http://localhost:8000"

# Login
r = requests.post(f"{BASE_URL}/api/v1/auth/login", json={
    "username": "Godz",
    "password": "free2004"
})
token = r.json()["access_token"]
headers = {"Authorization": f"Bearer {token}"}

print("=" * 60)
print("PAPER TRADING FLOW TEST")
print("=" * 60)

# 1. Check initial balance
acc = requests.get(f"{BASE_URL}/api/v1/account", headers=headers).json()
print(f"\n📊 Step 1: Initial Balance")
print(f"   Balance:  ${acc['balance']:.2f}")
print(f"   Equity:   ${acc['equity']:.2f}")
print(f"   Trades:   {acc['total_trades']}")

# 2. Place a BUY order
print(f"\n📊 Step 2: Placing BUY order")
order = requests.post(f"{BASE_URL}/api/v1/trade/order", headers=headers, json={
    "symbol": "EURUSD",
    "action": "BUY",
    "lot_size": 0.01,
    "stop_loss": 1.16,
    "take_profit": 1.18
}).json()
print(f"   Status: {order['status']}")
print(f"   Filled @ {order['filled_price']}")

# 3. Check positions
positions = requests.get(f"{BASE_URL}/api/v1/trade/positions", headers=headers).json()
print(f"\n📊 Step 3: Open Positions")
for p in positions['positions']:
    print(f"   {p['symbol']} {p['action']} {p['lots']} lots @ {p['entry_price']}")

# 4. Close position manually
if positions['positions']:
    pos_id = positions['positions'][0]['position_id']
    close = requests.post(f"{BASE_URL}/api/v1/trade/close/{pos_id}", headers=headers).json()
    print(f"\n📊 Step 4: Closed position @ {close['exit_price']}")
    print(f"   Status: {close['status']}")

# 5. Check balance after close
acc2 = requests.get(f"{BASE_URL}/api/v1/account", headers=headers).json()
print(f"\n📊 Step 5: Final Account State")
print(f"   Balance:  ${acc2['balance']:.2f}  (started at ${acc['balance']:.2f})")
print(f"   Equity:   ${acc2['equity']:.2f}")
print(f"   Trades:   {acc2['total_trades']}")
print(f"   Winning:  {acc2['winning_trades']}")
print(f"   Losing:   {acc2['losing_trades']}")

print("\n" + "=" * 60)
print("TEST COMPLETE")
print("=" * 60)