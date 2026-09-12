"""
Check paper account for a user.
"""
from database import db_connection
from paper_account import PaperAccountManager

USERNAME = "Godz"

print("=" * 60)
print(f"Checking account for: {USERNAME}")
print("=" * 60)

# Get user ID
with db_connection() as conn:
    cur = conn.cursor()
    cur.execute("SELECT id, username, email FROM users WHERE username = %s", (USERNAME,))
    row = cur.fetchone()
    cur.close()

if not row:
    print(f"❌ User '{USERNAME}' not found")
    exit(1)

user_id = row[0]
print(f"✅ User ID: {user_id}")
print(f"✅ Username: {row[1]}")
print(f"✅ Email: {row[2]}")

# Get or create paper account
account = PaperAccountManager.get_or_create(user_id)
print()
print("=" * 60)
print("PAPER ACCOUNT")
print("=" * 60)
print(f"Account #:       {account['account_number']}")
print(f"Starting:        ${account['starting_balance']:.2f}")
print(f"Balance:         ${account['balance']:.2f}")
print(f"Equity:          ${account['equity']:.2f}")
print(f"Used Margin:     ${account['used_margin']:.2f}")
print(f"Free Margin:     ${account['free_margin']:.2f}")
print(f"Total Trades:    {account['total_trades']}")
print(f"Winning:         {account['winning_trades']}")
print(f"Losing:          {account['losing_trades']}")
print(f"Largest Win:     ${account['largest_win']:.2f}")
print(f"Largest Loss:    ${account['largest_loss']:.2f}")
print(f"Created:         {account['created_at']}")