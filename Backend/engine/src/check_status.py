import requests

BASE_URL = "http://localhost:8000"

# Login
r = requests.post(f"{BASE_URL}/api/v1/auth/login", json={
    "username": "trader2",
    "password": "secure123"
})
token = r.json()["access_token"]
headers = {"Authorization": f"Bearer {token}"}

print("=" * 60)
print("=== BOTS ===")
print("=" * 60)
bots = requests.get(f"{BASE_URL}/api/v1/bots", headers=headers).json()
for b in bots["bots"]:
    print(f"  Bot #{b['bot_id']}: {b['symbol']} {b['timeframe']} ({b['status']})")

print()
print("=" * 60)
print("=== OPEN POSITIONS ===")
print("=" * 60)
positions = requests.get(f"{BASE_URL}/api/v1/trade/positions", headers=headers).json()
print(f"Total: {len(positions['positions'])}")
for p in positions["positions"]:
    print(f"  {p['symbol']} {p['action']} entry={p['entry_price']} current={p['current_price']} pnl={p['pnl']}")

print()
print("=" * 60)
print("=== RECENT ORDERS (last 10) ===")
print("=" * 60)
orders = requests.get(f"{BASE_URL}/api/v1/trade/orders", headers=headers).json()
for o in orders["orders"][:10]:
    print(f"  {o['created_at'][:19]} {o['symbol']} {o['action']} {o['lot_size']} → {o['status']}")