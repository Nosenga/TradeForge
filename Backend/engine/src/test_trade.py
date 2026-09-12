import requests

BASE_URL = "http://localhost:8000"

# 1. Login
login = requests.post(
    f"{BASE_URL}/api/v1/auth/login",
    json={"username": "Godz", "password": "free2004"}
)
token = login.json()["access_token"]
print(f"✅ Token: {token[:30]}...")

# 2. Place Order (JSON body)
order = requests.post(
    f"{BASE_URL}/api/v1/trade/order",
    headers={"Authorization": f"Bearer {token}"},
    json={
        "symbol": "EURUSD",
        "action": "BUY",
        "lot_size": 0.01,
        "stop_loss": 1.16,
        "take_profit": 1.18
    }
)
print(f"✅ Order Response: {order.json()}")

# Place SELL order
sell_order = requests.post(
    f"{BASE_URL}/api/v1/trade/order",
    headers={"Authorization": f"Bearer {token}"},
    json={
        "symbol": "GBPUSD",
        "action": "SELL",
        "lot_size": 0.02,
        "stop_loss": 1.35,
        "take_profit": 1.32
    }
)
print(f"✅ SELL Order: {sell_order.json()}")

orders = requests.get(
    f"{BASE_URL}/api/v1/trade/orders",
    headers={"Authorization": f"Bearer {token}"}
)
print(f"✅ Orders: {orders.json()}")

positions = requests.get(
    f"{BASE_URL}/api/v1/trade/positions",
    headers={"Authorization": f"Bearer {token}"}
)
print(f"✅ Positions: {positions.json()}")