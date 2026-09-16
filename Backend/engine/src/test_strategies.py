"""
Test that each strategy produces different signals.
"""
from strategies import analyze_symbol

symbol = "EURUSD"
timeframe = "1h"

strategies = {
    1: "RSI Oversold/Overbought",
    2: "MACD Crossover",
    3: "Bollinger Bands Breakout",
    4: "SMA Crossover (Golden Cross)",
}

print("=" * 70)
print(f"TESTING ALL STRATEGIES on {symbol} ({timeframe})")
print("=" * 70)

for sid, name in strategies.items():
    print()
    print(f"--- Strategy {sid}: {name} ---")
    
    result = analyze_symbol(symbol, timeframe, 200, strategy_id=sid)
    
    if 'error' in result:
        print(f"  ❌ Error: {result['error']}")
        continue
    
    print(f"  Action:     {result['action']}")
    print(f"  Confidence: {result['confidence'] * 100:.1f}%")
    print(f"  Price:      {result['price']}")
    print(f"  Strategy:   {result.get('strategy', 'N/A')}")
    print(f"  Reasons:")
    for r in result['reasons']:
        print(f"    - {r}")

print()
print("=" * 70)
print("DONE — each strategy should show different action/confidence/reasons")
print("=" * 70)