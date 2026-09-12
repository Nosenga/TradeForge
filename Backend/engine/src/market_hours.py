"""
Market Hours Utility
Determines if markets are open for trading.
"""

from datetime import datetime, time, timezone, timedelta


class MarketHours:
    """Check if forex/crypto markets are open."""
    
    # Forex market hours (UTC)
    # Opens: Sunday 22:00 UTC
    # Closes: Friday 22:00 UTC
    
    @staticmethod
    def is_forex_open() -> bool:
        """Check if forex market is open."""
        now = datetime.now(timezone.utc)
        weekday = now.weekday()  # 0=Mon, 6=Sun
        hour = now.hour
        
        # Saturday: closed all day
        if weekday == 5:
            return False
        
        # Sunday: opens at 22:00 UTC
        if weekday == 6:
            return hour >= 22
        
        # Friday: closes at 22:00 UTC
        if weekday == 4:
            return hour < 22
        
        # Mon-Thu: open all day
        return True
    
    @staticmethod
    def is_crypto_open() -> bool:
        """Crypto trades 24/7."""
        return True
    
    @staticmethod
    def is_symbol_tradable(symbol: str) -> bool:
        """Check if a specific symbol is tradable right now."""
        # Crypto symbols end in USD and start with BTC/ETH/etc
        crypto_prefixes = ['BTC', 'ETH', 'XRP', 'LTC', 'ADA', 'DOT', 'LINK', 'BNB', 'SOL', 'DOGE']
        
        for prefix in crypto_prefixes:
            if symbol.startswith(prefix):
                return MarketHours.is_crypto_open()
        
        # Forex
        return MarketHours.is_forex_open()
    
    @staticmethod
    def get_status() -> dict:
        """Get current market status for UI display."""
        now = datetime.now(timezone.utc)
        
        forex_open = MarketHours.is_forex_open()
        crypto_open = MarketHours.is_crypto_open()
        
        # Next open/close info
        weekday = now.weekday()
        hour = now.hour
        
        status_text = ""
        next_event = ""
        
        if weekday == 5:  # Saturday
            status_text = "Closed (Weekend)"
            # Next open is Sunday 22:00
            next_event = "Opens Sunday 22:00 UTC"
        elif weekday == 6 and hour < 22:  # Sunday before 22:00
            status_text = "Closed (Pre-market)"
            next_event = "Opens tonight at 22:00 UTC"
        elif weekday == 4 and hour >= 22:  # Friday after 22:00
            status_text = "Closed (Weekend)"
            next_event = "Opens Sunday 22:00 UTC"
        else:
            status_text = "Open"
            next_event = ""
        
        return {
            "forex_open": forex_open,
            "crypto_open": crypto_open,
            "status": status_text,
            "next_event": next_event,
            "utc_time": now.isoformat(),
            "day_of_week": now.strftime("%A"),
        }


if __name__ == "__main__":
    import json
    print(json.dumps(MarketHours.get_status(), indent=2))