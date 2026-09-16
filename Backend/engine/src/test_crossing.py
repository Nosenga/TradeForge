"""
Test that strategies only fire on CROSSING events, not every bar.
"""
from indicators import calculate_rsi
from signals import rsi_strategy
import pandas as pd
import numpy as np

# Generate synthetic price data that definitely crosses RSI thresholds
np.random.seed(42)
prices = pd.Series([100] * 20 + list(np.linspace(100, 90, 30)) + list(np.linspace(90, 110, 30)))

df = pd.DataFrame({
    'close': prices,
    'high': prices + 0.5,
    'low': prices - 0.5,
    'open': prices,
    'volume': [1000] * len(prices)
})

print("=" * 60)
print("CROSSING TEST: Signal at each bar")
print("=" * 60)

# Check the signal at each bar
buy_signals = 0
sell_signals = 0
hold_signals = 0

for i in range(20, len(df)):
    window = df.iloc[:i+1]
    signal = rsi_strategy(window)
    
    if signal['action'] == 'BUY':
        buy_signals += 1
        print(f"  Bar {i}: BUY — {signal['reasons'][0]}")
    elif signal['action'] == 'SELL':
        sell_signals += 1
        print(f"  Bar {i}: SELL — {signal['reasons'][0]}")

print()
print(f"Total BUY signals:  {buy_signals}")
print(f"Total SELL signals: {sell_signals}")
print(f"Total HOLD:         {len(df) - 20 - buy_signals - sell_signals}")
print()
print("Expected: FEWER BUY/SELL signals than bars (crossing events are rare)")