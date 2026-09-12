"""
News Service
Fetches market news from Finnhub.
"""

import os
import re
import requests
from dotenv import load_dotenv
from typing import List

load_dotenv()

FINNHUB_API_KEY = os.getenv("FINNHUB_API_KEY")
FINNHUB_BASE_URL = "https://finnhub.io/api/v1"


class MarketNews:
    """Fetch market news from Finnhub."""
    
    @staticmethod
    def _fetch(category: str, limit: int) -> List[dict]:
        """Internal helper — fetch news for a category."""
        if not FINNHUB_API_KEY:
            print("⚠️  FINNHUB_API_KEY not set")
            return []
        
        try:
            url = f"{FINNHUB_BASE_URL}/news"
            params = {
                "category": category,
                "token": FINNHUB_API_KEY,
            }
            
            response = requests.get(url, params=params, timeout=10)
            
            if response.status_code != 200:
                print(f"❌ Finnhub error: {response.status_code}")
                return []
            
            data = response.json()
            
            news = []
            for entry in data[:limit]:
                # Strip HTML from summary
                summary = entry.get("summary", "") or ""
                summary = re.sub(r'<[^>]+>', '', summary)
                summary = summary.strip()[:200]
                
                news.append({
                    "headline": entry.get("headline", ""),
                    "summary": summary,
                    "source": entry.get("source", ""),
                    "url": entry.get("url", ""),
                    "image": entry.get("image", ""),
                    "datetime": entry.get("datetime", 0),
                    "category": entry.get("category", ""),
                })
            
            return news
        
        except Exception as e:
            print(f"❌ Error fetching news: {e}")
            return []
    
    # ✅ Public methods
    @staticmethod
    def get_general_news(limit: int = 10) -> List[dict]:
        """Get general market news."""
        return MarketNews._fetch("general", limit)
    
    @staticmethod
    def get_forex_news(limit: int = 10) -> List[dict]:
        """Get forex-specific news."""
        return MarketNews._fetch("forex", limit)
    
    @staticmethod
    def get_crypto_news(limit: int = 10) -> List[dict]:
        """Get crypto news."""
        return MarketNews._fetch("crypto", limit)
    
    @staticmethod
    def get_merged_news(limit: int = 10) -> List[dict]:
        """Get forex + general news, deduped."""
        forex = MarketNews.get_forex_news(limit)
        general = MarketNews.get_general_news(limit)
        
        seen = set()
        combined = []
        for item in forex + general:
            if item['headline'] not in seen:
                seen.add(item['headline'])
                combined.append(item)
        
        return combined[:limit]


# ============================================
# TEST
# ============================================

if __name__ == "__main__":
    print("=" * 60)
    print("MARKET NEWS TEST")
    print("=" * 60)
    
    news = MarketNews.get_merged_news(5)
    print(f"\n📰 Found {len(news)} news items\n")
    
    for item in news:
        print(f"  • {item['headline'][:80]}")
        if item['summary']:
            print(f"    {item['summary'][:100]}")
        print(f"    {item['source']}")
        print()