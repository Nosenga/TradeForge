import pytest
from database import get_database_connection, create_tables

def test_connection():
    conn = get_database_connection()
    assert conn is not None
    conn.close()

def test_tables():
    create_tables()
    # If no error, it passed
    assert True