import psycopg2
import os
from dotenv import load_dotenv

load_dotenv()

def get_database_connection():

    try:
        # Get the database URL from environment variables
        database_url = os.getenv("DATABASE_URL")
        if not database_url:
            raise ValueError("DATABASE_URL is not set in the environment variables.")

        # Establish a connection to the PostgreSQL database
        connection = psycopg2.connect(database_url)
        return connection
    except Exception as e:
        print(f"Error connecting to database: {e}")
        return None

def create_tables():
    connection = get_database_connection()
    if connection is None:
        print("Failed to connect to the database. Cannot create tables.")
        return

    commands = (
        """
        CREATE TABLE IF NOT EXISTS market_data (
            id SERIAL PRIMARY KEY ,
            symbol VARCHAR(10) NOT NULL,
            timeframe VARCHAR(10) NOT NULL ,
            open FLOAT NOT NULL,
            high FLOAT NOT NULL,
            low FLOAT NOT NULL,
            close FLOAT NOT NULL,
            volume FLOAT NOT NULL DEFAULT 0.0,
            timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            UNIQUE (symbol, timeframe, timestamp)
        )
        """,
        
    )

    try:
        cursor = connection.cursor()
        for command in commands:
            cursor.execute(command)
        connection.commit()
        cursor.close()
        print("Tables created successfully.")
    except Exception as e:
        print(f"Error creating tables: {e}")
        connection.rollback()
    finally:
        connection.close()


def insert_market_data(symbol, timeframe, df):

    connection = get_database_connection()
    if connection is None:
        print("Failed to connect to the database. Cannot insert market data.")
        return 0
    cursor = connection.cursor()
    inserted_count = 0

    try:
        for index, row in df.iterrows():
            cursor.execute(
                """
                INSERT INTO market_data (symbol, timeframe, open, high, low, close, volume, timestamp)
                VALUES (%s, %s, %s, %s, %s, %s, %s, %s)
                ON CONFLICT (symbol, timeframe, timestamp) DO NOTHING
                """,
                (symbol, timeframe, row['open'], row['high'], row['low'], row['close'], row['volume'], row['timestamp'])
            )
            if cursor.rowcount > 0:
                inserted_count += 1
            
        connection.commit()
        print("Market data inserted successfully.")
        return inserted_count
    except Exception as e:
        print(f"Error inserting market data: {e}")
        connection.rollback()
    finally:
        cursor.close()
        connection.close()

def get_market_data(symbol, timeframe, limit = 100):
    connection = get_database_connection()
    if connection is None:
        print("Failed to connect to the database. Cannot retrieve market data.")
        return None
    cursor = connection.cursor()

    try:
        cursor.execute(
            """
            SELECT open, high, low, close, volume, timestamp FROM market_data
            WHERE symbol = %s AND timeframe = %s
            ORDER BY timestamp DESC
            LIMIT %s
            """,
            (symbol, timeframe, limit)
        )
        rows = cursor.fetchall()

        data = []
        for row in rows:
            data.append({
                'open': float(row[0]),
                'high': float(row[1]),
                'low': float(row[2]),
                'close': float(row[3]),
                'volume': float(row[4]) if row[4] else 0,
                'timestamp': row[5].isoformat()
            })
        return data

    
    except Exception as e:
        print(f"❌Error retrieving market data: {e}")
        return None
    finally:
        cursor.close()
        connection.close()

def get_latest_price(symbol):
    connection = get_database_connection()
    if connection is None:
        print("❌Failed to connect to the database. Cannot retrieve latest price.")
        return None
    cursor = connection.cursor()

    try:
        cursor.execute(
            """
            SELECT close, timestamp FROM market_data
            WHERE symbol = %s
            ORDER BY timestamp DESC
            LIMIT 1
            """,
            (symbol,)
        )
        row = cursor.fetchone()
        if row:
            return {
                'symbol': symbol,
                'latest_price': float(row[0]),
                'timestamp': row[1].isoformat()  # Assuming the timestamp is in the second column
            }
        else:
            print(f"❌No data found for symbol: {symbol}")
            return None

        
    except Exception as e:
        print(f"❌Error retrieving latest price: {e}")
        return None
    finally:
        cursor.close()
        connection.close()

def create_users_table():
    """Create users table if it doesn't exist."""
    conn = get_database_connection()
    if conn is None:
        print("❌ Failed to connect to database")
        return
    
    cur = conn.cursor()
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
    cur.close()
    conn.close()
    print("✅ Users table created successfully")


def get_user_by_username(username):
    """Get user by username."""
    conn = get_database_connection()
    if conn is None:
        return None
    
    cur = conn.cursor()
    cur.execute("""
        SELECT id, username, email, password_hash, full_name, is_active
        FROM users
        WHERE username = %s
    """, (username,))
    
    row = cur.fetchone()
    cur.close()
    conn.close()
    
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


def get_user_by_email(email):
    """Get user by email."""
    conn = get_database_connection()
    if conn is None:
        return None
    
    cur = conn.cursor()
    cur.execute("""
        SELECT id, username, email, password_hash, full_name, is_active
        FROM users
        WHERE email = %s
    """, (email,))
    
    row = cur.fetchone()
    cur.close()
    conn.close()
    
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


def create_user(username, email, password_hash, full_name=None):
    """Create a new user."""
    conn = get_database_connection()
    if conn is None:
        return None
    
    cur = conn.cursor()
    try:
        cur.execute("""
            INSERT INTO users (username, email, password_hash, full_name)
            VALUES (%s, %s, %s, %s)
            RETURNING id, username, email, full_name, is_active
        """, (username, email, password_hash, full_name))
        
        row = cur.fetchone()
        conn.commit()
        cur.close()
        conn.close()
        
        return {
            'id': row[0],
            'username': row[1],
            'email': row[2],
            'full_name': row[3],
            'is_active': row[4]  # ✅ Added this
        }
    except Exception as e:
        conn.rollback()
        cur.close()
        conn.close()
        print(f"❌ Error creating user: {e}")
        return None

if __name__ == "__main__":
    create_tables()
    print("✅Database setup complete!!")


    
