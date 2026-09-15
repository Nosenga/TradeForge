from database import get_user_by_username
from auth import verify_password, BCRYPT_AVAILABLE

print("=" * 60)
print("AUTH VERIFICATION TEST")
print("=" * 60)

print(f"bcrypt available: {BCRYPT_AVAILABLE}")

user = get_user_by_username('Godz')
if not user:
    print("❌ User 'Godz' not found")
    exit(1)

print(f"✅ User ID: {user['id']}")
print(f"✅ Username: {user['username']}")
print(f"✅ Email: {user['email']}")
print(f"✅ Full name: {user['full_name'] or '(not set)'}")
print(f"✅ Hash prefix: {user['password_hash'][:7]}")

# Check hash type properly
hash_prefix = user['password_hash'][:4]
is_bcrypt = hash_prefix in ('$2a$', '$2b$', '$2y$')
print(f"✅ Is bcrypt hash: {is_bcrypt}")

# Verify password
correct = verify_password('free2004', user['password_hash'])
wrong = verify_password('wrongpass', user['password_hash'])
print(f"✅ Correct password verifies: {correct}")
print(f"✅ Wrong password rejected: {not wrong}")

print()
if is_bcrypt and correct and not wrong:
    print("🎉 AUTH IS FULLY WORKING")
else:
    print("⚠️  Something is off — check above")