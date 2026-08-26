import React, { useEffect, useRef, useState } from 'react';
import { 
  createChart, 
  ColorType, 
  CandlestickSeries,
  LineSeries,
  type IChartApi,
  type Time,
  type UTCTimestamp
} from 'lightweight-charts';
import { marketData } from '../api/client';

interface TradingChartProps {
  symbol?: string;
  timeframe?: string;
}

interface RawDataItem {
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
  timestamp: string;
}

interface ChartDataItem {
  time: Time;
  open: number;
  high: number;
  low: number;
  close: number;
}

interface SmaDataItem {
  time: Time;
  value: number | null;
}

const TradingChart: React.FC<TradingChartProps> = ({ 
  symbol: initialSymbol = 'EURUSD', 
  timeframe: initialTimeframe = '1h' 
}) => {
  const chartContainerRef = useRef<HTMLDivElement>(null);
  const chartRef = useRef<IChartApi | null>(null);
  
  const [symbol, setSymbol] = useState<string>(initialSymbol);
  const [timeframe, setTimeframe] = useState<string>(initialTimeframe);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string>('');

  const symbols: string[] = ['EURUSD', 'GBPUSD', 'BTCUSD'];
  const timeframes: string[] = ['1h', '4h', '1d'];

  useEffect(() => {
    const fetchAndRender = async () => {
      setLoading(true);
      setError('');
      
      try {
        console.log('📊 Fetching data for:', symbol, timeframe);
        
        const response = await marketData.getOHLCV(symbol, timeframe, 100);
        console.log('📊 Full Response:', response.data);
        
        // Handle different response shapes
        const rawData: RawDataItem[] = response.data?.data || response.data?.ohlcv || response.data || [];
        console.log('📊 Raw data length:', rawData.length);
        
        if (rawData.length === 0) {
          setError('No data available');
          setLoading(false);
          return;
        }
        
        // ✅ FIX: Use Unix timestamps + numeric conversion + sort
        const chartData: ChartDataItem[] = rawData
          .map((item: RawDataItem) => ({
            time: Math.floor(new Date(item.timestamp).getTime() / 1000) as UTCTimestamp,
            open: Number(item.open),
            high: Number(item.high),
            low: Number(item.low),
            close: Number(item.close),
          }))
          .sort((a, b) => (a.time as number) - (b.time as number));
        
        // Debug logs
        console.log('📊 chartData sample:', chartData.slice(0, 5));
        console.log('📊 total points:', chartData.length);
        console.log('📊 first point types:', {
          time: typeof chartData[0]?.time,
          open: typeof chartData[0]?.open,
          high: typeof chartData[0]?.high,
          low: typeof chartData[0]?.low,
          close: typeof chartData[0]?.close,
        });
        
        // Create chart - container is ALWAYS mounted
        if (chartContainerRef.current && chartData.length > 0) {
          // Clear previous chart
          if (chartRef.current) {
            chartRef.current.remove();
            chartRef.current = null;
          }
          
          const chart = createChart(chartContainerRef.current, {
            width: chartContainerRef.current.clientWidth,
            height: 500,
            layout: {
              background: { type: ColorType.Solid, color: '#0a0e17' },
              textColor: '#e5e7eb',
            },
            grid: {
              vertLines: { color: '#1f2937' },
              horzLines: { color: '#1f2937' },
            },
            timeScale: {
              timeVisible: true,
              secondsVisible: false,
            },
          });
          
          chartRef.current = chart;
          
          // Add candlestick series
          const candlestickSeries = chart.addSeries(CandlestickSeries, {
            upColor: '#00c853',
            downColor: '#ff1744',
            borderUpColor: '#00c853',
            borderDownColor: '#ff1744',
            wickUpColor: '#00c853',
            wickDownColor: '#ff1744',
          });
          
          candlestickSeries.setData(chartData);
          console.log('✅ Candlestick data set');
          
          // SMA 20
          const sma20Data: SmaDataItem[] = chartData.map((item: ChartDataItem, index: number) => {
            if (index < 20) return { time: item.time, value: null };
            const prices: number[] = chartData.slice(index - 20, index).map((d: ChartDataItem) => d.close);
            const avg: number = prices.reduce((a: number, b: number) => a + b, 0) / prices.length;
            return { time: item.time, value: avg };
          }).filter((d: SmaDataItem): d is SmaDataItem & { value: number } => d.value !== null);
          
          if (sma20Data.length > 0) {
            const sma20Series = chart.addSeries(LineSeries, {
              color: '#fbbf24',
              lineWidth: 2,
              title: 'SMA 20',
            });
            sma20Series.setData(sma20Data);
            console.log('✅ SMA 20 data set');
          }
          
          // Handle resize
          const handleResize = (): void => {
            if (chartContainerRef.current) {
              chart.applyOptions({
                width: chartContainerRef.current.clientWidth,
              });
            }
          };
          
          window.addEventListener('resize', handleResize);
          
          return () => {
            window.removeEventListener('resize', handleResize);
            if (chartRef.current) {
              chartRef.current.remove();
              chartRef.current = null;
            }
          };
        }
        
      } catch (err) {
        console.error('❌ Chart error:', err);
        setError('Failed to load chart data');
      } finally {
        setLoading(false);
      }
    };
    
    fetchAndRender();
  }, [symbol, timeframe]);

  return (
    <div className="bg-trade-card rounded-xl p-6 border border-trade-border">
      {/* Controls */}
      <div className="flex flex-wrap gap-4 mb-4">
        <div>
          <label className="block text-gray-400 text-sm mb-1">Symbol</label>
          <select
            value={symbol}
            onChange={(e) => setSymbol(e.target.value)}
            className="bg-trade-bg border border-trade-border rounded-lg px-3 py-1.5 text-white text-sm focus:outline-none focus:border-blue-500"
          >
            {symbols.map((s: string) => (
              <option key={s} value={s}>{s}</option>
            ))}
          </select>
        </div>
        
        <div>
          <label className="block text-gray-400 text-sm mb-1">Timeframe</label>
          <select
            value={timeframe}
            onChange={(e) => setTimeframe(e.target.value)}
            className="bg-trade-bg border border-trade-border rounded-lg px-3 py-1.5 text-white text-sm focus:outline-none focus:border-blue-500"
          >
            {timeframes.map((t: string) => (
              <option key={t} value={t}>{t}</option>
            ))}
          </select>
        </div>
      </div>
      
      {/* Chart container ALWAYS mounted with overlay loading/error states */}
      <div className="relative">
        <div ref={chartContainerRef} className="w-full h-[500px]" />

        {loading && (
          <div className="absolute inset-0 flex items-center justify-center text-gray-400 bg-trade-card/80 rounded-xl">
            Loading chart...
          </div>
        )}

        {error && !loading && (
          <div className="absolute inset-0 flex items-center justify-center text-red-500 bg-trade-card/80 rounded-xl">
            {error}
          </div>
        )}
      </div>
      
      {/* Legend */}
      <div className="flex gap-6 mt-4 text-sm">
        <div className="flex items-center gap-2">
          <span className="w-3 h-3 bg-yellow-400 rounded-sm"></span>
          <span className="text-gray-400">SMA 20</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="w-3 h-3 bg-green-500 rounded-sm"></span>
          <span className="text-gray-400">Candlestick</span>
        </div>
      </div>
    </div>
  );
};

export default TradingChart;