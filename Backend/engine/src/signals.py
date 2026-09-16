"""
Signal Generator
Combines multiple indicators to generate BUY/SELL/HOLD signals
"""

import pandas as pd
import numpy as np
from indicators import (
    calculate_sma,
    calculate_ema,
    calculate_rsi,
    calculate_macd,
    calculate_bollinger_bands,
    calculate_atr
)


# ============================================
# FUNCTION 1: Generate Individual Signals
# ============================================

def get_rsi_signal(rsi_value, oversold=30, overbought=70):
    """
    Generate signal from RSI.
    
    RSI < 30 = Oversold → BUY
    RSI > 70 = Overbought → SELL
    30-70 = Neutral → HOLD
    """
    if rsi_value < oversold:
        return {"action": "BUY", "confidence": 0.8, "reason": f"RSI oversold ({rsi_value:.1f})"}
    elif rsi_value > overbought:
        return {"action": "SELL", "confidence": 0.8, "reason": f"RSI overbought ({rsi_value:.1f})"}
    else:
        return {"action": "HOLD", "confidence": 0.0, "reason": f"RSI neutral ({rsi_value:.1f})"}


def get_macd_signal(macd_line, signal_line):
    """
    Generate signal from MACD.
    
    MACD > Signal = Bullish → BUY
    MACD < Signal = Bearish → SELL
    """
    if macd_line > signal_line:
        return {"action": "BUY", "confidence": 0.7, "reason": "MACD bullish crossover"}
    elif macd_line < signal_line:
        return {"action": "SELL", "confidence": 0.7, "reason": "MACD bearish crossover"}
    else:
        return {"action": "HOLD", "confidence": 0.0, "reason": "MACD neutral"}


def get_bb_signal(price, upper_band, lower_band):
    """
    Generate signal from Bollinger Bands.
    
    Price < Lower Band = Oversold → BUY
    Price > Upper Band = Overbought → SELL
    """
    if price < lower_band:
        return {"action": "BUY", "confidence": 0.6, "reason": "Price below lower Bollinger Band"}
    elif price > upper_band:
        return {"action": "SELL", "confidence": 0.6, "reason": "Price above upper Bollinger Band"}
    else:
        return {"action": "HOLD", "confidence": 0.0, "reason": "Price within Bollinger Bands"}


def get_sma_signal(price, sma):
    """
    Generate signal from SMA.
    
    Price > SMA = Bullish → BUY
    Price < SMA = Bearish → SELL
    """
    if price > sma:
        return {"action": "BUY", "confidence": 0.5, "reason": f"Price above SMA ({sma:.2f})"}
    elif price < sma:
        return {"action": "SELL", "confidence": 0.5, "reason": f"Price below SMA ({sma:.2f})"}
    else:
        return {"action": "HOLD", "confidence": 0.0, "reason": "Price at SMA"}


# ============================================
# FUNCTION 2: Combined Signal (Voting System)
# ============================================

def generate_combined_signal(df):
    """
    Generate combined signal using voting system.
    
    Weighted votes:
    - RSI: 35% (strong momentum)
    - MACD: 30% (trend confirmation)
    - Bollinger Bands: 20% (mean reversion)
    - SMA: 15% (trend direction)
    
    Returns:
        dict with action, confidence, reasons, and individual signals
    """
    
    # Get latest values
    latest = df.iloc[-1]
    price = latest['close']
    
    # Calculate indicators (using last row)
    # RSI
    rsi = calculate_rsi(df['close'])
    rsi_signal = get_rsi_signal(rsi.iloc[-1])
    
    # MACD
    macd, signal, hist = calculate_macd(df['close'])
    macd_signal = get_macd_signal(macd.iloc[-1], signal.iloc[-1])
    
    # Bollinger Bands
    upper, middle, lower = calculate_bollinger_bands(df['close'])
    bb_signal = get_bb_signal(price, upper.iloc[-1], lower.iloc[-1])
    
    # SMA (20-period)
    sma = calculate_sma(df['close'], window=20)
    sma_signal = get_sma_signal(price, sma.iloc[-1])
    
    # Collect all signals
    signals = {
        'rsi': rsi_signal,
        'macd': macd_signal,
        'bb': bb_signal,
        'sma': sma_signal
    }
    
    # Voting weights
    weights = {
        'rsi': 0.35,
        'macd': 0.30,
        'bb': 0.20,
        'sma': 0.15
    }
    
    # Calculate weighted vote
    buy_score = 0.0
    sell_score = 0.0
    reasons = []
    
    for key, signal_data in signals.items():
        weight = weights.get(key, 0.25)
        if signal_data['action'] == 'BUY':
            buy_score += weight * signal_data['confidence']
            reasons.append(f"{key.upper()}: {signal_data['reason']}")
        elif signal_data['action'] == 'SELL':
            sell_score += weight * signal_data['confidence']
            reasons.append(f"{key.upper()}: {signal_data['reason']}")
    
    # Determine final action
    if buy_score > sell_score and buy_score > 0.3:
        action = "BUY"
        confidence = min(buy_score, 1.0)
    elif sell_score > buy_score and sell_score > 0.3:
        action = "SELL"
        confidence = min(sell_score, 1.0)
    else:
        action = "HOLD"
        confidence = 0.0
        reasons = ["Mixed signals - no clear direction"]
    
    return {
        "action": action,
        "confidence": round(confidence, 2),
        "reasons": reasons,
        "individual_signals": signals,
        "buy_score": round(buy_score, 2),
        "sell_score": round(sell_score, 2)
    }


# ============================================
# FUNCTION 3: Simple Signal for a Single Symbol
# ============================================

def get_signal_for_symbol(symbol, df):
    """
    Generate trading signal for a symbol.
    
    Args:
        symbol: Symbol name (e.g., 'EURUSD')
        df: DataFrame with OHLCV data
    
    Returns:
        dict with signal, confidence, timestamp, and price
    """
    signal = generate_combined_signal(df)
    
    latest_price = df.iloc[-1]['close']
    latest_timestamp = df.index[-1] if isinstance(df.index, pd.DatetimeIndex) else df.iloc[-1].get('timestamp', 'N/A')
    
    return {
        "symbol": symbol,
        "timestamp": latest_timestamp,
        "price": float(latest_price),
        "action": signal['action'],
        "confidence": signal['confidence'],
        "reasons": signal['reasons'],
        "buy_score": signal['buy_score'],
        "sell_score": signal['sell_score']
    }


# ============================================
# TEST BLOCK
# ============================================

if __name__ == "__main__":
    print("=" * 60)
    print("TESTING SIGNAL GENERATOR")
    print("=" * 60)
    
    # Create test data
    np.random.seed(42)
    dates = pd.date_range('2026-01-01', periods=50, freq='D')
    prices = 100 + np.cumsum(np.random.randn(50))
    
    # ✅ FIXED: All columns now have the same length (50)
    df = pd.DataFrame({
        'close': prices,
        'high': prices + np.random.rand(50) * 2,
        'low': prices - np.random.rand(50) * 2,
        'open': prices,  # Use prices instead of prices[:-1]
        'volume': np.random.randint(1000, 10000, 50)
    }, index=dates)
    
    print("\n📊 Latest Price:", df.iloc[-1]['close'])

# ============================================
# STRATEGY FUNCTIONS (Single-Indicator)
# ============================================

def rsi_strategy(df):
    """
    Strategy 1: RSI Oversold/Overbought.
    
    BUY when RSI < 30 (oversold)
    SELL when RSI > 70 (overbought)
    HOLD otherwise
    """
    rsi = calculate_rsi(df['close'])
    latest_rsi = rsi.iloc[-1]
    
    if latest_rsi < 30:
        return {
            "action": "BUY",
            "confidence": 0.8,
            "reasons": [f"RSI oversold ({latest_rsi:.1f})"],
            "strategy": "RSI Oversold/Overbought"
        }
    elif latest_rsi > 70:
        return {
            "action": "SELL",
            "confidence": 0.8,
            "reasons": [f"RSI overbought ({latest_rsi:.1f})"],
            "strategy": "RSI Oversold/Overbought"
        }
    else:
        return {
            "action": "HOLD",
            "confidence": 0.0,
            "reasons": [f"RSI neutral ({latest_rsi:.1f})"],
            "strategy": "RSI Oversold/Overbought"
        }


def macd_strategy(df):
    """
    Strategy 2: MACD Crossover.
    
    BUY when MACD crosses above signal line
    SELL when MACD crosses below signal line
    HOLD otherwise
    """
    macd, signal, hist = calculate_macd(df['close'])
    
    current_macd = macd.iloc[-1]
    current_signal = signal.iloc[-1]
    
    if current_macd > current_signal:
        return {
            "action": "BUY",
            "confidence": 0.7,
            "reasons": [f"MACD ({current_macd:.4f}) above signal ({current_signal:.4f})"],
            "strategy": "MACD Crossover"
        }
    elif current_macd < current_signal:
        return {
            "action": "SELL",
            "confidence": 0.7,
            "reasons": [f"MACD ({current_macd:.4f}) below signal ({current_signal:.4f})"],
            "strategy": "MACD Crossover"
        }
    else:
        return {
            "action": "HOLD",
            "confidence": 0.0,
            "reasons": ["MACD neutral"],
            "strategy": "MACD Crossover"
        }


def bollinger_strategy(df):
    """
    Strategy 3: Bollinger Bands Breakout.
    
    BUY when price < lower band
    SELL when price > upper band
    HOLD otherwise
    """
    upper, middle, lower = calculate_bollinger_bands(df['close'])
    price = df.iloc[-1]['close']
    
    if price < lower.iloc[-1]:
        return {
            "action": "BUY",
            "confidence": 0.7,
            "reasons": [f"Price ({price:.5f}) below lower band ({lower.iloc[-1]:.5f})"],
            "strategy": "Bollinger Bands Breakout"
        }
    elif price > upper.iloc[-1]:
        return {
            "action": "SELL",
            "confidence": 0.7,
            "reasons": [f"Price ({price:.5f}) above upper band ({upper.iloc[-1]:.5f})"],
            "strategy": "Bollinger Bands Breakout"
        }
    else:
        return {
            "action": "HOLD",
            "confidence": 0.0,
            "reasons": ["Price within Bollinger Bands"],
            "strategy": "Bollinger Bands Breakout"
        }


def sma_crossover_strategy(df):
    """
    Strategy 4: SMA Crossover (Golden Cross).
    
    BUY when SMA(50) > SMA(200)
    SELL when SMA(50) < SMA(200)
    HOLD otherwise
    """
    sma_50 = calculate_sma(df['close'], window=50)
    sma_200 = calculate_sma(df['close'], window=200)
    
    if len(sma_50.dropna()) == 0 or len(sma_200.dropna()) == 0:
        return {
            "action": "HOLD",
            "confidence": 0.0,
            "reasons": ["Not enough data for SMA crossover"],
            "strategy": "SMA Crossover (Golden Cross)"
        }
    
    current_50 = sma_50.iloc[-1]
    current_200 = sma_200.iloc[-1]
    
    if current_50 > current_200:
        return {
            "action": "BUY",
            "confidence": 0.85,
            "reasons": [f"SMA(50) {current_50:.5f} above SMA(200) {current_200:.5f} (bullish)"],
            "strategy": "SMA Crossover (Golden Cross)"
        }
    elif current_50 < current_200:
        return {
            "action": "SELL",
            "confidence": 0.85,
            "reasons": [f"SMA(50) {current_50:.5f} below SMA(200) {current_200:.5f} (bearish)"],
            "strategy": "SMA Crossover (Golden Cross)"
        }
    else:
        return {
            "action": "HOLD",
            "confidence": 0.0,
            "reasons": ["SMA crossover neutral"],
            "strategy": "SMA Crossover (Golden Cross)"
        }


# ============================================
# STRATEGY DISPATCHER
# ============================================

STRATEGY_MAP = {
    1: rsi_strategy,
    2: macd_strategy,
    3: bollinger_strategy,
    4: sma_crossover_strategy,
}


def run_strategy(strategy_id, df):
    """
    Run a specific strategy by ID.
    
    Args:
        strategy_id: 1-4 (from strategies table)
        df: DataFrame with OHLCV data
    
    Returns:
        dict with action, confidence, reasons, strategy name
    """
    strategy_func = STRATEGY_MAP.get(strategy_id)
    
    if strategy_func is None:
        # Unknown strategy — fall back to voting
        print(f"⚠️  Unknown strategy_id {strategy_id}, using default voting")
        return generate_combined_signal(df)
    
    return strategy_func(df)
    
    # Generate combined signal
    signal = generate_combined_signal(df)
    
    print("\n📈 COMBINED SIGNAL:")
    print(f"   Action: {signal['action']}")
    print(f"   Confidence: {signal['confidence'] * 100:.1f}%")
    print(f"   Buy Score: {signal['buy_score']:.2f}")
    print(f"   Sell Score: {signal['sell_score']:.2f}")
    print("\n   Reasons:")
    for reason in signal['reasons']:
        print(f"   - {reason}")
    
    print("\n📊 Individual Signals:")
    for key, val in signal['individual_signals'].items():
        print(f"   {key.upper()}: {val['action']} ({val['confidence']*100:.1f}%) - {val['reason']}")
    
    # Test get_signal_for_symbol
    print("\n" + "=" * 60)
    print("TESTING get_signal_for_symbol()")
    print("=" * 60)
    
    result = get_signal_for_symbol("EURUSD", df)
    print(f"Symbol: {result['symbol']}")
    print(f"Action: {result['action']}")
    print(f"Confidence: {result['confidence']*100:.1f}%")
    print(f"Price: {result['price']}")