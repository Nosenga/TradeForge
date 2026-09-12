import psycopg2
from psycopg2 import pool
import os
from contextlib import contextmanager
from dotenv import load_dotenv
import time

load_dotenv()

# ============================================
# CONNECTION POOL
# ============================================

try:
    connection_pool = pool.SimpleConnectionPool(
        1,    # min connections
        20,   # max connections (increased from 10)
        os.getenv("DATABASE_URL")
    )
    print("✅ Connection pool created")
except Exception as e:
    print(f"❌ Failed to create connection pool: {e}")
    connection_pool = None


def get_database_connection(max_retries=3):
    """Get a connection from the pool with retry logic."""
    if not connection_pool:
        print("❌ Connection pool is None")
        return None

    for attempt in range(max_retries):
        try:
            conn = connection_pool.getconn()
        except Exception as e:
            if attempt < max_retries - 1:
                time.sleep(0.5 * (attempt + 1))
                continue
            print(f"❌ Failed to get connection after {max_retries} attempts: {e}")
            return None
        
        # Test the connection is alive
        try:
            cur = conn.cursor()
            cur.execute("SELECT 1")
            cur.close()
            return conn
        except Exception as e:
            # Connection is dead — discard it and retry
            try:
                connection_pool.putconn(conn, close=True)
            except Exception:
                pass
            
            if attempt < max_retries - 1:
                time.sleep(0.5 * (attempt + 1))
                continue
            else:
                print(f"❌ Connection failed health check after {max_retries} attempts: {e}")
                return None
        
    


def release_connection(conn):
    """Return connection to pool."""
    if connection_pool and conn:
        try:
            if not conn.closed:
                connection_pool.putconn(conn)
        except Exception:
            pass


@contextmanager
def db_connection():
    """Context manager that guarantees connection release."""
    conn = get_database_connection()
    if conn is None:
        raise Exception("❌ Failed to get database connection")
    try:
        yield conn
    except (psycopg2.InterfaceError, psycopg2.OperationalError) as e:

        print(f"❌ Database connection error: {e}")
        try:
            connection_pool.putconn(conn, close=True)
        except Exception:
            pass
        raise
    finally:
        try:
            if not conn.closed:
                connection_pool.putconn(conn)
        except Exception:
            pass


# ============================================
# MARKET DATA
# ============================================

def create_tables():
    """Create market_data table."""
    with db_connection() as conn:
        cur = conn.cursor()
        try:
            cur.execute("""
                CREATE TABLE IF NOT EXISTS market_data (
                    id SERIAL PRIMARY KEY,
                    symbol VARCHAR(20) NOT NULL,
                    timeframe VARCHAR(10) NOT NULL,
                    open FLOAT NOT NULL,
                    high FLOAT NOT NULL,
                    low FLOAT NOT NULL,
                    close FLOAT NOT NULL,
                    volume FLOAT NOT NULL DEFAULT 0.0,
                    timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                    UNIQUE (symbol, timeframe, timestamp)
                )
            """)
            conn.commit()
            print("✅ Market data table created")
        finally:
            cur.close()


def insert_market_data(symbol, timeframe, df):
    """Insert market data."""
    with db_connection() as conn:
        cur = conn.cursor()
        inserted_count = 0
        try:
            for _, row in df.iterrows():
                cur.execute("""
                    INSERT INTO market_data (symbol, timeframe, open, high, low, close, volume, timestamp)
                    VALUES (%s, %s, %s, %s, %s, %s, %s, %s)
                    ON CONFLICT (symbol, timeframe, timestamp) DO NOTHING
                """, (symbol, timeframe, row['open'], row['high'], row['low'],
                      row['close'], row['volume'], row['timestamp']))
                if cur.rowcount > 0:
                    inserted_count += 1
            conn.commit()
            return inserted_count
        except Exception as e:
            conn.rollback()
            print(f"❌ Error inserting market data: {e}")
            return 0
        finally:
            cur.close()


def get_market_data(symbol, timeframe, limit=100):
    """Get market data from database."""
    with db_connection() as conn:
        cur = conn.cursor()
        try:
            cur.execute("""
                SELECT open, high, low, close, volume, timestamp FROM market_data
                WHERE symbol = %s AND timeframe = %s
                ORDER BY timestamp DESC
                LIMIT %s
            """, (symbol, timeframe, limit))
            rows = cur.fetchall()
            return [{
                'open': float(row[0]),
                'high': float(row[1]),
                'low': float(row[2]),
                'close': float(row[3]),
                'volume': float(row[4]) if row[4] else 0,
                'timestamp': row[5].isoformat()
            } for row in rows]
        except Exception as e:
            print(f"❌ Error retrieving market data: {e}")
            return []
        finally:
            cur.close()


def get_latest_price(symbol):
    """Get latest price."""
    with db_connection() as conn:
        cur = conn.cursor()
        try:
            cur.execute("""
                SELECT close, timestamp FROM market_data
                WHERE symbol = %s
                ORDER BY timestamp DESC
                LIMIT 1
            """, (symbol,))
            row = cur.fetchone()
            if row:
                return {
                    'symbol': symbol,
                    'latest_price': float(row[0]),
                    'timestamp': row[1].isoformat()
                }
            return None
        except Exception as e:
            print(f"❌ Error retrieving latest price: {e}")
            return None
        finally:
            cur.close()


# ============================================
# USERS
# ============================================

def create_users_table():
    """Create users table."""
    with db_connection() as conn:
        cur = conn.cursor()
        try:
            cur.execute("""
                CREATE TABLE IF NOT EXISTS users (
                    id SERIAL PRIMARY KEY,
                    username VARCHAR(50) UNIQUE NOT NULL,
                    email VARCHAR(100) UNIQUE NOT NULL,
                    password_hash VARCHAR(255) NOT NULL,
                    full_name VARCHAR(100),
                    is_active BOOLEAN DEFAULT TRUE,
                    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
                )
            """)
            conn.commit()
            print("✅ Users table created successfully")
        finally:
            cur.close()


def get_user_by_username(username):
    """Get user by username."""
    with db_connection() as conn:
        cur = conn.cursor()
        try:
            cur.execute("""
                SELECT id, username, email, password_hash, full_name, is_active
                FROM users WHERE username = %s
            """, (username,))
            row = cur.fetchone()
            if row:
                return {
                    'id': row[0],
                    'username': row[1],
                    'email': row[2],
                    'password_hash': row[3],
                    'full_name': row[4],
                    'is_active': row[5]
                }
            return None
        finally:
            cur.close()


def get_user_by_email(email):
    """Get user by email."""
    with db_connection() as conn:
        cur = conn.cursor()
        try:
            cur.execute("""
                SELECT id, username, email, password_hash, full_name, is_active
                FROM users WHERE email = %s
            """, (email,))
            row = cur.fetchone()
            if row:
                return {
                    'id': row[0],
                    'username': row[1],
                    'email': row[2],
                    'password_hash': row[3],
                    'full_name': row[4],
                    'is_active': row[5]
                }
            return None
        finally:
            cur.close()


def create_user(username, email, password_hash, full_name=None):
    """Create a new user."""
    with db_connection() as conn:
        cur = conn.cursor()
        try:
            cur.execute("""
                INSERT INTO users (username, email, password_hash, full_name)
                VALUES (%s, %s, %s, %s)
                RETURNING id, username, email, full_name, is_active
            """, (username, email, password_hash, full_name))
            row = cur.fetchone()
            conn.commit()
            return {
                'id': row[0],
                'username': row[1],
                'email': row[2],
                'full_name': row[3],
                'is_active': row[4]
            }
        except Exception as e:
            conn.rollback()
            print(f"❌ Error creating user: {e}")
            return None
        finally:
            cur.close()


# ============================================
# TRADING TABLES
# ============================================

def create_trading_tables():
    """Create orders and positions tables."""
    with db_connection() as conn:
        cur = conn.cursor()
        try:
            cur.execute("""
                CREATE TABLE IF NOT EXISTS orders (
                    order_id VARCHAR(50) PRIMARY KEY,
                    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
                    symbol VARCHAR(20) NOT NULL,
                    action VARCHAR(10) NOT NULL,
                    lot_size DECIMAL(10,2) NOT NULL,
                    order_type VARCHAR(10) DEFAULT 'MARKET',
                    entry_price DECIMAL(20,8),
                    stop_loss DECIMAL(20,8),
                    take_profit DECIMAL(20,8),
                    status VARCHAR(20) DEFAULT 'PENDING',
                    created_at TIMESTAMP DEFAULT NOW(),
                    filled_at TIMESTAMP,
                    filled_price DECIMAL(20,8)
                )
            """)
            cur.execute("""
                CREATE TABLE IF NOT EXISTS positions (
                    position_id VARCHAR(50) PRIMARY KEY,
                    order_id VARCHAR(50) REFERENCES orders(order_id),
                    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
                    symbol VARCHAR(20) NOT NULL,
                    action VARCHAR(10) NOT NULL,
                    lots DECIMAL(10,2) NOT NULL,
                    entry_price DECIMAL(20,8) NOT NULL,
                    stop_loss DECIMAL(20,8),
                    take_profit DECIMAL(20,8),
                    current_price DECIMAL(20,8),
                    pnl DECIMAL(20,2) DEFAULT 0,
                    open_time TIMESTAMP DEFAULT NOW(),
                    close_time TIMESTAMP,
                    status VARCHAR(20) DEFAULT 'OPEN'
                )
            """)
            conn.commit()
            print("✅ Trading tables created successfully")
        finally:
            cur.close()


def create_bots_table():
    """Create bots table."""
    with db_connection() as conn:
        cur = conn.cursor()
        try:
            cur.execute("""
                CREATE TABLE IF NOT EXISTS bots (
                    id SERIAL PRIMARY KEY,
                    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
                    strategy_id INTEGER NOT NULL,
                    symbol VARCHAR(20) NOT NULL,
                    timeframe VARCHAR(10) NOT NULL,
                    lot_size DECIMAL(10,2) DEFAULT 0.01,
                    risk_percent DECIMAL(5,2) DEFAULT 1.0,
                    stop_loss_pips INTEGER DEFAULT 50,
                    take_profit_pips INTEGER DEFAULT 100,
                    min_confidence DECIMAL(3,2) DEFAULT 0.6,
                    status VARCHAR(20) DEFAULT 'STOPPED',
                    created_at TIMESTAMP DEFAULT NOW(),
                    updated_at TIMESTAMP DEFAULT NOW()
                )
            """)
            conn.commit()
            print("✅ Bots table created successfully")
        finally:
            cur.close()

def create_paper_accounts_table():
    """Create paper_accounts table if it doesn't exist."""
    with db_connection() as conn:
        cur = conn.cursor()
        try:
            cur.execute("""
                CREATE TABLE IF NOT EXISTS paper_accounts (
                    id SERIAL PRIMARY KEY,
                    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE UNIQUE,
                    account_number VARCHAR(50) UNIQUE NOT NULL,
                    starting_balance DECIMAL(20,2) NOT NULL DEFAULT 10000.00,
                    balance DECIMAL(20,2) NOT NULL DEFAULT 10000.00,
                    equity DECIMAL(20,2) NOT NULL DEFAULT 10000.00,
                    used_margin DECIMAL(20,2) DEFAULT 0,
                    free_margin DECIMAL(20,2) DEFAULT 10000.00,
                    total_trades INTEGER DEFAULT 0,
                    winning_trades INTEGER DEFAULT 0,
                    losing_trades INTEGER DEFAULT 0,
                    largest_win DECIMAL(20,2) DEFAULT 0,
                    largest_loss DECIMAL(20,2) DEFAULT 0,
                    created_at TIMESTAMP DEFAULT NOW(),
                    updated_at TIMESTAMP DEFAULT NOW()
                )
            """)
            conn.commit()
            print("✅ Paper accounts table created successfully")
        finally:
            cur.close()


if __name__ == "__main__":
    create_users_table()
    create_tables()
    create_trading_tables()
    create_bots_table()
    print("✅ Database setup complete!!")