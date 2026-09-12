import requests

print("=" * 60)
print("CHECKING ACCOUNT ENDPOINTS")
print("=" * 60)

d = requests.get('http://localhost:8000/openapi.json').json()
paths = d['paths']

account_paths = [p for p in paths if 'account' in p]
trade_paths = [p for p in paths if 'trade' in p]
bot_paths = [p for p in paths if 'bots' in p]
mt_paths = [p for p in paths if 'mt-bridge' in p]

print("\n=== ACCOUNT ENDPOINTS ===")
for p in account_paths:
    print(f"  {p} {list(paths[p].keys())}")

if not account_paths:
    print("  ❌ No account endpoints found!")

print("\n=== TRADE ENDPOINTS ===")
for p in trade_paths:
    print(f"  {p} {list(paths[p].keys())}")

print("\n=== BOT ENDPOINTS ===")
for p in bot_paths:
    print(f"  {p} {list(paths[p].keys())}")

print("\n=== MT BRIDGE ENDPOINTS ===")
for p in mt_paths:
    print(f"  {p} {list(paths[p].keys())}")

# Test account endpoint
print()
print("=" * 60)
print("TESTING ACCOUNT ENDPOINT")
print("=" * 60)

r = requests.post(
    'http://localhost:8000/api/v1/auth/login',
    json={'username': 'Godz', 'password': 'free2004'}
)

if r.status_code != 200:
    print(f"❌ Login failed: {r.status_code}")
    print(r.text)
    exit(1)

token = r.json()['access_token']
headers = {'Authorization': f'Bearer {token}'}
print("✅ Login successful")

resp = requests.get('http://localhost:8000/api/v1/account', headers=headers)
print(f"Account endpoint status: {resp.status_code}")

if resp.status_code == 200:
    print("✅ Account data:")
    for k, v in resp.json().items():
        print(f"   {k}: {v}")
else:
    print(f"❌ Response: {resp.text}")