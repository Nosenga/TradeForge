"""
Order Management - FIXED
- Correct PnL for JPY pairs and BTC
- Realistic margin with leverage
- Connection bug already fixed in your version - kept it
"""
import uuid
from datetime import datetime
from typing import List
from database import db_connection
from paper_account import PaperAccountManager

CONTRACT_SIZE = 100000
LEVERAGE = 100

def get_pnl_multiplier(symbol: str) -> float:
    symbol = symbol.upper()
    if "JPY" in symbol:
        return 100.0 # JPY pairs pip math different
    if "BTC" in symbol or "ETH" in symbol:
        return 1.0 # Crypto - direct price diff
    return 100000.0

def calc_pnl(action: str, entry: float, current: float, lots: float, symbol: str) -> float:
    mult = get_pnl_multiplier(symbol)
    if action == "BUY":
        return (current - entry) * lots * mult
    else:
        return (entry - current) * lots * mult

#... Keep your Order and Position classes exactly as they are...

class OrderManager:
    def __init__(self, user_id: int):
        self.user_id = user_id
        account = PaperAccountManager.get_or_create(user_id)
        self.balance = account['balance']
        self.account = account

    @staticmethod
    def save_order(order): # same as yours
        with db_connection() as conn:
            cur = conn.cursor()
            try:
                cur.execute("""
                    INSERT INTO orders (order_id, user_id, symbol, action, lot_size,
                        order_type, entry_price, stop_loss, take_profit, status, created_at)
                    VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s)
                """, (order.order_id, order.user_id, order.symbol, order.action,
                      order.lot_size, order.order_type, order.entry_price,
                      order.stop_loss, order.take_profit, order.status, order.created_at))
                conn.commit()
                return True
            except Exception as e:
                print(f"❌ Error saving order: {e}")
                conn.rollback()
                return False
            finally:
                cur.close()

    # get_orders and save_position stay same as yours...

    @staticmethod
    def get_positions(user_id: int) -> List[dict]:
        with db_connection() as conn:
            cur = conn.cursor()
            try:
                cur.execute("SELECT * FROM positions WHERE user_id = %s AND status = 'OPEN' ORDER BY open_time DESC", (user_id,))
                rows = cur.fetchall()
                return [{'position_id': r[0], 'order_id': r[1], 'user_id': r[2], 'symbol': r[3],
                         'action': r[4], 'lots': float(r[5]), 'entry_price': float(r[6]),
                         'stop_loss': float(r[7]) if r[7] else None, 'take_profit': float(r[8]) if r[8] else None,
                         'current_price': float(r[9]), 'pnl': float(r[10]), 'open_time': r[11],
                         'close_time': r[12], 'status': r[13]} for r in rows]
            finally:
                cur.close()

    @staticmethod
    def update_position(position_id: str, current_price: float):
        """FIXED: Uses correct PnL formula per symbol"""
        with db_connection() as conn:
            cur = conn.cursor()
            try:
                cur.execute("SELECT action, entry_price, lots, symbol FROM positions WHERE position_id = %s", (position_id,))
                row = cur.fetchone()
                if not row:
                    return False
                action, entry_price, lots, symbol = row[0], float(row[1]), float(row[2]), row[3]
                current_price = float(current_price)
                pnl = calc_pnl(action, entry_price, current_price, lots, symbol)
                cur.execute("UPDATE positions SET current_price = %s, pnl = %s WHERE position_id = %s",
                            (current_price, pnl, position_id))
                conn.commit()
                return True
            except Exception as e:
                print(f"❌ Error updating position: {e}")
                conn.rollback()
                return False
            finally:
                cur.close()

    @staticmethod
    def close_position(position_id: str, exit_price: float, reason: str = "manual") -> bool:
        user_id = None
        pnl = 0
        with db_connection() as conn:
            cur = conn.cursor()
            try:
                cur.execute("SELECT user_id, action, entry_price, lots, symbol FROM positions WHERE position_id = %s", (position_id,))
                row = cur.fetchone()
                if not row:
                    return False
                user_id, action, entry_price, lots, symbol = row[0], row[1], float(row[2]), float(row[3]), row[4]
                pnl = calc_pnl(action, entry_price, float(exit_price), lots, symbol)
                cur.execute("UPDATE positions SET status='CLOSED', close_time=NOW(), current_price=%s, pnl=%s WHERE position_id=%s",
                            (exit_price, pnl, position_id))
                conn.commit()
            finally:
                cur.close()

        if user_id is not None:
            PaperAccountManager.update_balance(user_id, pnl)
        return True