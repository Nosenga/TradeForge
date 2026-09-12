import requests

r = requests.post(
    'http://localhost:8000/api/v1/auth/login',
    json={'username': 'Godz', 'password': 'free2004'}
)
r.raise_for_status()

token = r.json()['access_token']
headers = {'Authorization': f'Bearer {token}'}
resp = requests.get('http://localhost:8000/api/v1/dashboard', headers=headers)
resp.raise_for_status()

data = resp.json()
print('Orders returned:', len(data.get('orders', [])))
print('Positions returned:', len(data.get('positions', [])))
print('Bots returned:', len(data.get('bots', [])))
for o in data.get('orders', []):
    print(f"  {o['created_at'][:19]} {o['symbol']} {o['action']} {o['status']}")