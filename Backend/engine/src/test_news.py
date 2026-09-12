import requests

r = requests.post('http://localhost:8000/api/v1/auth/login', json={
    'username': 'Godz',
    'password': 'free2004'
})
token = r.json()['access_token']
headers = {'Authorization': f'Bearer {token}'}

print("=" * 60)
print("NEWS ENDPOINT TEST")
print("=" * 60)

resp = requests.get(
    'http://localhost:8000/api/v1/news?category=forex&limit=5',
    headers=headers
)
print(f"Status: {resp.status_code}")

if resp.status_code == 200:
    data = resp.json()
    print(f"Count: {data['count']}")
    print()
    for n in data['news']:
        print(f"• {n['headline']}")
        print(f"  {n['source']}")
        print()
else:
    print(resp.text)