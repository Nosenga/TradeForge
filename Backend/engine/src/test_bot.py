
from database import db_connection

with db_connection() as conn:
    cur = conn.cursor()
    cur.execute(
        """
        UPDATE orders
        SET status = 'CANCELLED'
        WHERE status = 'PENDING'
          AND created_at < NOW() - INTERVAL '1 hour'
        """
    )
    conn.commit()
    print(f"Cancelled {cur.rowcount} stale pending orders")
    cur.close()
