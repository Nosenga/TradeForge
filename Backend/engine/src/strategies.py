"""
Strategy Engine
Connects signals to market data and stores strategies in database
"""

import pandas as pd
from database import get_market_data
from signals import get_signal_for_symbol, generate_combined_signal


def analyze_symbol(symbol, timeframe="1h", limit=100):
    """
    Analyze a symbol and generate a trading signal.
    
    Args:
        symbol: Symbol name (e.g., 'EURUSD')
        timeframe: Timeframe (e.g., '1h', '4h', '1d')
        limit: Number of candles to fetch
    
    Returns:
        dict with signal, price, and indicators
    """
    # Fetch market data from database
    data = get_market_data(symbol, timeframe, limit)
    
    if not data or len(data) < 20:
        return {
            "error": f"Insufficient data for {symbol} ({timeframe})",
            "symbol": symbol
        }
    
    # Convert to DataFrame
    df = pd.DataFrame(data)
    df['timestamp'] = pd.to_datetime(df['timestamp'])
    df.set_index('timestamp', inplace=True)
    df.sort_index(inplace=True)
    
    # Generate signal
    signal = get_signal_for_symbol(symbol, df)
    
    return signal


def get_strategy_signal(strategy_id, symbol, timeframe="1h", limit=100):
    """
    Get signal for a specific strategy (future: custom strategies)
    For now, uses the default combined strategy.
    """
    # Currently using default strategy
    # Later this will load custom strategies from database
    return analyze_symbol(symbol, timeframe, limit)


# ============================================
# TEST BLOCK
# ============================================

if __name__ == "__main__":
    print("=" * 60)
    print("TESTING STRATEGY ENGINE")
    print("=" * 60)
    
    # Test with EURUSD
    result = analyze_symbol("EURUSD", "1h", 50)
    
    if 'error' in result:
        print(f"❌ Error: {result['error']}")
    else:
        print(f"📊 Symbol: {result['symbol']}")
        print(f"📊 Price: {result['price']}")
        print(f"📊 Action: {result['action']}")
        print(f"📊 Confidence: {result['confidence']*100:.1f}%")
        print("\nReasons:")
        for reason in result['reasons']:
            print(f"  - {reason}")