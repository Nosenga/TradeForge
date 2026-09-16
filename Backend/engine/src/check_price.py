import requests
from datetime import datetime

r = requests.post('http://localhost:8000/api/v1/auth/login', json={
    'username': 'Godz',
    'password': 'free2004'
})
token = r.json()['access_token']
headers = {'Authorization': f'Bearer {token}'}

print("=" * 60)
print("PRICE COMPARISON")
print("=" * 60)
print(f"Time now: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
print()

# Get latest cached price
latest = requests.get('http://localhost:8000/api/v1/market-data/EURUSD/latest', headers=headers).json()
print(f"Engine's latest EURUSD price:")
print(f"  Price:     {latest.get('latest_price')}")
print(f"  Timestamp: {latest.get('timestamp')}")
print()

# Get signal
print("Engine's signal for EURUSD 1h:")
signal = requests.get('http://localhost:8000/api/v1/signals/EURUSD?timeframe=1h', headers=headers).json()
print(f"  Action:     {signal.get('action')}")
print(f"  Confidence: {signal.get('confidence')}")
print(f"  Price:      {signal.get('price')}")
print(f"  Timestamp:  {signal.get('timestamp')}")
if signal.get('reasons'):
    print(f"  Reasons:")
    for reason in signal['reasons']:
        print(f"    - {reason}")