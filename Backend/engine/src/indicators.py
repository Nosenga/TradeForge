"""
Technical Indicators Library
"""

import pandas as pd
import numpy as np

# ============================================
# FUNCTION 1: SIMPLE MOVING AVERAGE
# ============================================

def calculate_sma(data, window=20):
    """
    Simple Moving Average (SMA)
    Averages the last 'window' number of prices.
    """
    # ✅ Copy this line exactly
    sma = data.rolling(window=window).mean()
    return sma

# ============================================
# FUNCTION 2: EXPONENTIAL MOVING AVERAGE
# ============================================

def calculate_ema(data, window=20):
    """
    Exponential Moving Average (EMA)
    Gives more weight to recent prices.
    """
    # ✅ Copy this line exactly
    ema = data.ewm(span=window, adjust=False).mean()
    return ema

# ============================================
# FUNCTION 3: RELATIVE STRENGTH INDEX
# ============================================

def calculate_rsi(data, window=14):
    """
    Relative Strength Index (RSI)
    Measures momentum. 0-100 scale.
    >70 = Overbought, <30 = Oversold
    """
    # ✅ Copy these lines exactly
    delta = data.diff()
    gain = (delta.where(delta > 0, 0)).rolling(window=window).mean()
    loss = (-delta.where(delta < 0, 0)).rolling(window=window).mean()
    rs = gain / loss
    rsi = 100 - (100 / (1 + rs))
    return rsi

# ============================================
# FUNCTION 4: MACD
# ============================================

def calculate_macd(data, fast=12, slow=26, signal=9):
    """
    Moving Average Convergence Divergence
    Returns: (macd_line, signal_line, histogram)
    """
    # ✅ Copy these lines exactly
    ema_fast = data.ewm(span=fast, adjust=False).mean()
    ema_slow = data.ewm(span=slow, adjust=False).mean()
    macd_line = ema_fast - ema_slow
    signal_line = macd_line.ewm(span=signal, adjust=False).mean()
    histogram = macd_line - signal_line
    return macd_line, signal_line, histogram

# ============================================
# FUNCTION 5: BOLLINGER BANDS
# ============================================

def calculate_bollinger_bands(data, window=20, num_std=2):
    """
    Bollinger Bands
    Returns: (upper_band, middle_band, lower_band)
    """
    # ✅ Copy these lines exactly
    middle_band = data.rolling(window=window).mean()
    std = data.rolling(window=window).std()
    upper_band = middle_band + (std * num_std)
    lower_band = middle_band - (std * num_std)
    return upper_band, middle_band, lower_band

# ============================================
# FUNCTION 6: AVERAGE TRUE RANGE
# ============================================

def calculate_atr(high, low, close, window=14):
    """
    Average True Range (ATR)
    Measures volatility.
    """
    # ✅ Copy these lines exactly
    high_low = high - low
    high_close = np.abs(high - close.shift())
    low_close = np.abs(low - close.shift())
    true_range = np.maximum(high_low, np.maximum(high_close, low_close))
    atr = true_range.rolling(window=window).mean()
    return atr


# ============================================
# TEST
# ============================================

if __name__ == "__main__":
    # Create price data
    prices = pd.Series([100, 102, 101, 103, 105, 104, 106, 108, 107, 109, 
                        111, 110, 112, 114, 113, 115, 117, 116, 118, 120])
    
    # Create OHLC data for ATR
    df = pd.DataFrame({
        'high': prices + np.random.rand(20) * 2,
        'low': prices - np.random.rand(20) * 2,
        'close': prices
    })
    
    print("📊 SMA(5):", calculate_sma(prices, window=5).iloc[-1])
    print("📊 EMA(5):", calculate_ema(prices, window=5).iloc[-1])
    
    rsi = calculate_rsi(prices, window=14)
    print("📊 RSI(14):", rsi.iloc[-1])
    
    macd, signal, hist = calculate_macd(prices)
    print("📊 MACD Line:", macd.iloc[-1])
    print("📊 Signal Line:", signal.iloc[-1])
    print("📊 Histogram:", hist.iloc[-1])
    
    upper, middle, lower = calculate_bollinger_bands(prices, window=5)
    print("📊 Bollinger Bands (5):")
    print(f"   Upper: {upper.iloc[-1]:.2f}")
    print(f"   Middle: {middle.iloc[-1]:.2f}")
    print(f"   Lower: {lower.iloc[-1]:.2f}")
    
    # ✅ ADD THIS: Test ATR
    atr = calculate_atr(df['high'], df['low'], df['close'], window=5)
    print("📊 ATR(5):", atr.iloc[-1])