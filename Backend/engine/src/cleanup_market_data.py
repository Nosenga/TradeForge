"""
One-time cleanup: clear all cached market_data so the fresh-fetch
logic rebuilds it cleanly without the 20-day gaps.

Run once: python cleanup_market_data.py
"""

from database import db_connection


def cleanup():
    print("=" * 60)
    print("MARKET DATA CLEANUP")
    print("=" * 60)

    with db_connection() as conn:
        cur = conn.cursor()

        # Show what's in there now
        cur.execute("""
            SELECT symbol, timeframe, COUNT(*), MIN(timestamp), MAX(timestamp)
            FROM market_data
            GROUP BY symbol, timeframe
            ORDER BY symbol, timeframe
        """)
        rows = cur.fetchall()

        print("\nBefore cleanup:")
        for row in rows:
            print(f"  {row[0]} ({row[1]}): {row[2]} rows, {row[3]} → {row[4]}")

        # Delete everything
        cur.execute("DELETE FROM market_data")
        deleted = cur.rowcount
        conn.commit()

        print(f"\n🧹 Deleted {deleted} rows total")

        # Confirm empty
        cur.execute("SELECT COUNT(*) FROM market_data")
        remaining = cur.fetchone()[0]
        print(f"✅ market_data now has {remaining} rows")

        cur.close()

    print()
    print("Next: restart the backend and hit the market-data endpoint")
    print("(or run test_trade.py) to trigger a fresh fetch.")


if __name__ == "__main__":
    cleanup()