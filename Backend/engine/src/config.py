import os
from dotenv import load_dotenv

load_dotenv()

class Config:
    TWELVE_DATA_API_KEY = os.getenv("TWELVE_DATA_API_KEY")
    DATABASE_URL = os.getenv("DATABASE_URL")
    
    @classmethod
    def validate(cls):
        if not cls.TWELVE_DATA_API_KEY:
            raise ValueError("TWELVE_DATA_API_KEY is required")
        if not cls.DATABASE_URL:
            raise ValueError("DATABASE_URL is required")