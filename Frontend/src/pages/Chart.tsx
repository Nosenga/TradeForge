import React, { useState } from 'react';
import IndicatorChart from '../components/IndicatorChart';

const Chart: React.FC = () => {
  const [symbol, setSymbol] = useState('EURUSD');
  const [timeframe, setTimeframe] = useState('1h');
  const [showRSI, setShowRSI] = useState(true);
  const [showMACD, setShowMACD] = useState(true);
  const [showBollinger, setShowBollinger] = useState(true);

  const symbols = ['EURUSD', 'GBPUSD', 'BTCUSD'];
  const timeframes = ['1h', '4h', '1d'];

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-white">Charts</h1>
        <div className="flex gap-4">
          <select
            value={symbol}
            onChange={(e) => setSymbol(e.target.value)}
            className="bg-trade-card border border-trade-border rounded-lg px-4 py-2 text-white focus:outline-none focus:border-blue-500"
          >
            {symbols.map((s) => (
              <option key={s} value={s}>{s}</option>
            ))}
          </select>
          <select
            value={timeframe}
            onChange={(e) => setTimeframe(e.target.value)}
            className="bg-trade-card border border-trade-border rounded-lg px-4 py-2 text-white focus:outline-none focus:border-blue-500"
          >
            {timeframes.map((t) => (
              <option key={t} value={t}>{t}</option>
            ))}
          </select>
        </div>
      </div>
      
      {/* ✅ FIX: Use backticks for template literal */}
      <IndicatorChart 
        key={`${symbol}-${timeframe}-${showRSI}-${showMACD}-${showBollinger}`}
        symbol={symbol} 
        timeframe={timeframe}
        showRSI={showRSI}
        showMACD={showMACD}
        showBollinger={showBollinger}
        onShowRSIChange={setShowRSI}
        onShowMACDChange={setShowMACD}
        onShowBollingerChange={setShowBollinger}
      />
    </div>
  );
};

export default Chart;