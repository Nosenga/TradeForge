"""
Verify that the critical fixes are actually applied.
"""
import inspect

print("=" * 60)
print("FIX VERIFICATION")
print("=" * 60)

# Test A: Leverage constants
print("\n--- Fix #1: Leverage ---")
try:
    from paper_account import PaperAccountManager, CONTRACT_SIZE, LEVERAGE
    print(f"CONTRACT_SIZE = {CONTRACT_SIZE}")
    print(f"LEVERAGE = {LEVERAGE}")

    margin = PaperAccountManager.calc_used_margin(0.01, 1.16529)
    print(f"0.01 lot EURUSD margin: {margin:.2f}")
    expected = (0.01 * 100000 * 1.16529) / 100
    print(f"Expected:                {expected:.2f}")
    if abs(margin - expected) < 0.01:
        print("PASS: Leverage math correct")
    else:
        print("FAIL: Leverage math wrong")
except Exception as e:
    print(f"ERROR: {e}")

# Test B: P&L multiplier
print("\n--- Fix #2: P&L Multiplier ---")
try:
    from orders import get_pnl_multiplier
    for s in ['EURUSD', 'USDJPY', 'GBPJPY', 'BTCUSD', 'ETHUSD']:
        print(f"  {s}: {get_pnl_multiplier(s)}")
except Exception as e:
    print(f"ERROR: {e}")

# Test C: FOR UPDATE on update_balance
print("\n--- Fix #3a: FOR UPDATE on update_balance ---")
try:
    from paper_account import PaperAccountManager
    src = inspect.getsource(PaperAccountManager.update_balance)
    if 'FOR UPDATE' in src:
        print("PASS: Found")
    else:
        print("FAIL: Missing")
except Exception as e:
    print(f"ERROR: {e}")

# Test D: FOR UPDATE on update_equity
print("\n--- Fix #3b: FOR UPDATE on update_equity ---")
try:
    from paper_account import PaperAccountManager
    src = inspect.getsource(PaperAccountManager.update_equity)
    if 'FOR UPDATE' in src:
        print("PASS: Found")
    else:
        print("FAIL: Missing")
except Exception as e:
    print(f"ERROR: {e}")

# Test E: Kill-switch
print("\n--- Fix #4: Kill-switch ---")
try:
    from bot_scheduler import TradingBot
    src = inspect.getsource(TradingBot.__init__)
    for field in ['daily_loss', 'max_daily_loss']:
        if field in src:
            print(f"PASS: {field}")
        else:
            print(f"FAIL: {field} missing")
except Exception as e:
    print(f"ERROR: {e}")

# Test F: Connection scoping in update_position
print("\n--- Fix #5: Connection scoping (update_position) ---")
try:
    from orders import OrderManager
    src = inspect.getsource(OrderManager.update_position)
    with_pos = src.find("with db_connection")
    try_pos = src.find("try:")
    if with_pos != -1 and try_pos != -1 and with_pos < try_pos:
        print("PASS: Connection scoping correct")
    else:
        print("WARN: Cannot determine - inspect manually")
except Exception as e:
    print(f"ERROR: {e}")

# Test G: P&L calculation function
print("\n--- Fix #6: P&L calculation ---")
try:
    from orders import calc_pnl
    # Buy EURUSD at 1.1000, exit at 1.1100, 0.01 lot
    # Expected: (1.1100 - 1.1000) * 0.01 * 100000 = 10.00
    pnl = calc_pnl("BUY", 1.1000, 1.1100, 0.01, "EURUSD")
    print(f"EURUSD BUY pnl: {pnl:.2f} (expected: 10.00)")

    # USDJPY: (110.50 - 110.00) * 0.01 * 100 = 0.50
    pnl = calc_pnl("BUY", 110.00, 110.50, 0.01, "USDJPY")
    print(f"USDJPY BUY pnl: {pnl:.2f} (expected: 0.50)")

    # BTCUSD: (50000 - 49000) * 0.01 * 1 = 10.00
    pnl = calc_pnl("BUY", 49000, 50000, 0.01, "BTCUSD")
    print(f"BTCUSD BUY pnl: {pnl:.2f} (expected: 10.00)")
except Exception as e:
    print(f"ERROR: {e}")

print()
print("=" * 60)
print("DONE")
print("=" * 60)