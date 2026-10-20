"""
Paper Trading Account Manager - FIXED
- Correct leverage handling (1:100)
- Row-level locks with FOR UPDATE to prevent race conditions
- Proper margin calculation
"""
import uuid
from database import db_connection

CONTRACT_SIZE = 100000
LEVERAGE = 100 # Match your HFM demo leverage

class PaperAccountManager:

    @staticmethod
    def get_or_create(user_id: int) -> dict:
        with db_connection() as conn:
            cur = conn.cursor()
            try:
                cur.execute("""
                    SELECT id, user_id, account_number, starting_balance, balance,
                           equity, used_margin, free_margin, total_trades,
                           winning_trades, losing_trades, largest_win, largest_loss,
                           created_at, updated_at
                    FROM paper_accounts WHERE user_id = %s
                """, (user_id,))
                row = cur.fetchone()
                if row:
                    return PaperAccountManager._row_to_dict(row)

                account_number = f"PAPER-{uuid.uuid4().hex[:8].upper()}"
                cur.execute("""
                    INSERT INTO paper_accounts (user_id, account_number)
                    VALUES (%s, %s)
                    RETURNING id, user_id, account_number, starting_balance, balance,
                              equity, used_margin, free_margin, total_trades,
                              winning_trades, losing_trades, largest_win, largest_loss,
                              created_at, updated_at
                """, (user_id, account_number))
                row = cur.fetchone()
                conn.commit()
                print(f"✅ Created paper account {account_number} for user {user_id}")
                return PaperAccountManager._row_to_dict(row)
            finally:
                cur.close()

    @staticmethod
    def _row_to_dict(row) -> dict:
        return {
            'id': row[0], 'user_id': row[1], 'account_number': row[2],
            'starting_balance': float(row[3]), 'balance': float(row[4]),
            'equity': float(row[5]), 'used_margin': float(row[6]),
            'free_margin': float(row[7]), 'total_trades': row[8],
            'winning_trades': row[9], 'losing_trades': row[10],
            'largest_win': float(row[11]), 'largest_loss': float(row[12]),
            'created_at': row[13].isoformat() if row[13] else None,
            'updated_at': row[14].isoformat() if row[14] else None,
        }

    @staticmethod
    def update_balance(user_id: int, pnl: float) -> dict:
        """FIXED: Now uses FOR UPDATE lock"""
        with db_connection() as conn:
            cur = conn.cursor()
            try:
                cur.execute("""
                    SELECT balance, winning_trades, losing_trades,
                           largest_win, largest_loss, total_trades
                    FROM paper_accounts WHERE user_id = %s FOR UPDATE
                """, (user_id,))
                row = cur.fetchone()
                if not row:
                    return {"error": "Account not found"}

                balance = float(row[0])
                winning, losing = row[1], row[2]
                largest_win = float(row[3])
                largest_loss = float(row[4])
                total = row[5]

                new_balance = balance + pnl
                total += 1
                if pnl > 0:
                    winning += 1
                    largest_win = max(largest_win, pnl)
                elif pnl < 0:
                    losing += 1
                    largest_loss = min(largest_loss, pnl)

                cur.execute("""
                    UPDATE paper_accounts
                    SET balance = %s, total_trades = %s, winning_trades = %s,
                        losing_trades = %s, largest_win = %s, largest_loss = %s,
                        updated_at = NOW()
                    WHERE user_id = %s
                """, (new_balance, total, winning, losing, largest_win, largest_loss, user_id))
                conn.commit()
                return {"balance": new_balance, "pnl_added": pnl, "total_trades": total}
            finally:
                cur.close()

    @staticmethod
    def update_equity(user_id: int, open_pnl: float, used_margin: float = 0) -> dict:
        """FIXED: FOR UPDATE + correct equity calc"""
        with db_connection() as conn:
            cur = conn.cursor()
            try:
                cur.execute("SELECT balance FROM paper_accounts WHERE user_id = %s FOR UPDATE", (user_id,))
                row = cur.fetchone()
                if not row:
                    return {"error": "Account not found"}

                balance = float(row[0])
                equity = balance + open_pnl
                free_margin = equity - used_margin

                cur.execute("""
                    UPDATE paper_accounts
                    SET equity = %s, used_margin = %s, free_margin = %s, updated_at = NOW()
                    WHERE user_id = %s
                """, (equity, used_margin, free_margin, user_id))
                conn.commit()
                return {"balance": balance, "equity": equity, "used_margin": used_margin, "free_margin": free_margin}
            finally:
                cur.close()

    @staticmethod
    def reset(user_id: int, new_balance: float = 10000.00) -> dict:
        with db_connection() as conn:
            cur = conn.cursor()
            try:
                cur.execute("""
                    UPDATE paper_accounts
                    SET starting_balance = %s, balance = %s, equity = %s,
                        used_margin = 0, free_margin = %s, total_trades = 0,
                        winning_trades = 0, losing_trades = 0, largest_win = 0,
                        largest_loss = 0, updated_at = NOW()
                    WHERE user_id = %s
                """, (new_balance, new_balance, new_balance, new_balance, user_id))
                conn.commit()
                return {"status": "RESET", "new_balance": new_balance}
            finally:
                cur.close()

    @staticmethod
    def calc_used_margin(lots: float, price: float) -> float:
        """Real margin with leverage"""
        return (lots * CONTRACT_SIZE * price) / LEVERAGE