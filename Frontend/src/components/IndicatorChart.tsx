import React, { useEffect, useRef, useState } from 'react';
import { 
  createChart, 
  ColorType, 
  CandlestickSeries,
  LineSeries,
  HistogramSeries,
  type IChartApi,
  type Time,
  type UTCTimestamp
} from 'lightweight-charts';
import { marketData } from '../api/client';
import { indicators } from '../api/indicators';

interface IndicatorChartProps {
  symbol?: string;
  timeframe?: string;
  showRSI?: boolean;
  showMACD?: boolean;
  showBollinger?: boolean;
  onShowRSIChange?: (show: boolean) => void;
  onShowMACDChange?: (show: boolean) => void;
  onShowBollingerChange?: (show: boolean) => void;
}

interface ChartDataItem {
  time: Time;
  open: number;
  high: number;
  low: number;
  close: number;
}

const IndicatorChart: React.FC<IndicatorChartProps> = ({ 
  symbol: initialSymbol = 'EURUSD', 
  timeframe: initialTimeframe = '1h',
  showRSI = true,
  showMACD = true,
  showBollinger = true,
  onShowRSIChange,
  onShowMACDChange,
  onShowBollingerChange,
}) => {
  const chartContainerRef = useRef<HTMLDivElement>(null);
  const rsiContainerRef = useRef<HTMLDivElement>(null);
  const macdContainerRef = useRef<HTMLDivElement>(null);
  
  const chartRef = useRef<IChartApi | null>(null);
  const rsiChartRef = useRef<IChartApi | null>(null);
  const macdChartRef = useRef<IChartApi | null>(null);
  
  const [symbol, setSymbol] = useState(initialSymbol);
  const [timeframe, setTimeframe] = useState(initialTimeframe);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const symbols = ['EURUSD', 'GBPUSD', 'BTCUSD'];
  const timeframes = ['1h', '4h', '1d'];

  // Main effect for fetching and rendering
  useEffect(() => {
    let cancelled = false;
    let handleResize: (() => void) | null = null;

    console.log('🔄 Chart effect triggered:', { symbol, timeframe, showRSI, showMACD, showBollinger });

    const cleanupCharts = () => {
      if (handleResize) {
        window.removeEventListener('resize', handleResize);
        handleResize = null;
      }
      if (chartRef.current) {
        chartRef.current.remove();
        chartRef.current = null;
      }
      if (rsiChartRef.current) {
        rsiChartRef.current.remove();
        rsiChartRef.current = null;
      }
      if (macdChartRef.current) {
        macdChartRef.current.remove();
        macdChartRef.current = null;
      }
    };

    // Clean up previous charts before creating new ones
    cleanupCharts();

    const fetchAndRender = async () => {
      setLoading(true);
      setError('');
      
      try {
        // Fetch market data
        const limit = timeframe === '1d'? 90: 100;
        const marketResponse = await marketData.getOHLCV(symbol, timeframe, limit);
        if (cancelled) return;
        console.log('📊 Market response:', marketResponse);
        
        const rawData = Array.isArray(marketResponse.data) 
          ? marketResponse.data 
          : marketResponse.data?.data || [];
        
        console.log('📊 Raw data length:', rawData.length);
        
        if (!rawData || rawData.length === 0) {
          setError(`No data available for ${symbol} (${timeframe})`);
          setLoading(false);
          return;
        }
        
        const chartData: ChartDataItem[] = rawData.map((item: any) => ({
          time: Math.floor(new Date(item.timestamp).getTime() / 1000) as UTCTimestamp,
          open: Number(item.open),
          high: Number(item.high),
          low: Number(item.low),
          close: Number(item.close),
        })).sort((a: ChartDataItem, b: ChartDataItem) => (a.time as number) - (b.time as number));
        
        // Fetch indicators
        let rsiData: any[] = [];
        let macdData: any[] = [];
        let bollingerData: any[] = [];
        
        if (showRSI) {
          const rsiResponse = await indicators.getRSI(symbol, timeframe, 14, 100);
          if (cancelled) return;
          rsiData = Array.isArray(rsiResponse.data) ? rsiResponse.data : rsiResponse.data?.data || [];
          console.log('📊 RSI data length:', rsiData.length);
        }
        
        if (showMACD) {
          const macdResponse = await indicators.getMACD(symbol, timeframe, 12, 26, 9, 100);
          if (cancelled) return;
          macdData = Array.isArray(macdResponse.data) ? macdResponse.data : macdResponse.data?.data || [];
          console.log('📊 MACD data length:', macdData.length);
        }
        
        if (showBollinger) {
          const bollingerResponse = await indicators.getBollinger(symbol, timeframe, 20, 2, 100);
          if (cancelled) return;
          bollingerData = Array.isArray(bollingerResponse.data) ? bollingerResponse.data : bollingerResponse.data?.data || [];
          console.log('📊 Bollinger data length:', bollingerData.length);
        }
        
        // Render Main Chart
        if (chartContainerRef.current && chartData.length > 0) {
          const chart = createChart(chartContainerRef.current, {
            width: chartContainerRef.current.clientWidth,
            height: 400,
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
          
          // Candlestick series
          const candlestickSeries = chart.addSeries(CandlestickSeries, {
            upColor: '#00c853',
            downColor: '#ff1744',
            borderUpColor: '#00c853',
            borderDownColor: '#ff1744',
            wickUpColor: '#00c853',
            wickDownColor: '#ff1744',
          });
          candlestickSeries.setData(chartData);
          
          // Bollinger Bands
          if (showBollinger && bollingerData.length > 0) {
            const upperData = bollingerData.map((item: any) => ({
              time: Math.floor(new Date(item.timestamp).getTime() / 1000) as UTCTimestamp,
              value: item.upper,
            })).filter((d: any) => d.value !== null);
            
            const middleData = bollingerData.map((item: any) => ({
              time: Math.floor(new Date(item.timestamp).getTime() / 1000) as UTCTimestamp,
              value: item.middle,
            })).filter((d: any) => d.value !== null);
            
            const lowerData = bollingerData.map((item: any) => ({
              time: Math.floor(new Date(item.timestamp).getTime() / 1000) as UTCTimestamp,
              value: item.lower,
            })).filter((d: any) => d.value !== null);
            
            if (upperData.length > 0) {
              const upperSeries = chart.addSeries(LineSeries, {
                color: '#ff6b6b',
                lineWidth: 1,
                title: 'BB Upper',
              });
              upperSeries.setData(upperData);
            }
            
            if (middleData.length > 0) {
              const middleSeries = chart.addSeries(LineSeries, {
                color: '#ffd93d',
                lineWidth: 1,
                title: 'BB Middle',
              });
              middleSeries.setData(middleData);
            }
            
            if (lowerData.length > 0) {
              const lowerSeries = chart.addSeries(LineSeries, {
                color: '#ff6b6b',
                lineWidth: 1,
                title: 'BB Lower',
              });
              lowerSeries.setData(lowerData);
            }
          }
          
          // SMA 20
          const sma20Data = chartData.map((item, index) => {
            if (index < 20) return { time: item.time, value: null };
            const prices = chartData.slice(index - 20, index).map(d => d.close);
            const avg = prices.reduce((a, b) => a + b, 0) / prices.length;
            return { time: item.time, value: avg };
          }).filter(d => d.value !== null);
          
          if (sma20Data.length > 0) {
            const sma20Series = chart.addSeries(LineSeries, {
              color: '#fbbf24',
              lineWidth: 2,
              title: 'SMA 20',
            });
            sma20Series.setData(sma20Data);
          }
          
          // Handle resize
          handleResize = () => {
            if (chartContainerRef.current) {
              chart.applyOptions({
                width: chartContainerRef.current.clientWidth,
              });
            }
          };
          window.addEventListener('resize', handleResize);
        }
        
        // Render RSI
        if (showRSI && rsiContainerRef.current && rsiData.length > 0) {
          const rsiChart = createChart(rsiContainerRef.current, {
            width: rsiContainerRef.current.clientWidth,
            height: 150,
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
          
          rsiChartRef.current = rsiChart;
          
          const rsiSeries = rsiChart.addSeries(LineSeries, {
            color: '#a855f7',
            lineWidth: 2,
            title: 'RSI 14',
          });
          
          const rsiFormatted = rsiData.map((item: any) => ({
            time: Math.floor(new Date(item.timestamp).getTime() / 1000) as UTCTimestamp,
            value: item.value,
          })).filter((d: any) => d.value !== null);
          
          rsiSeries.setData(rsiFormatted);
          
          // Overbought/oversold lines
          const overboughtData = rsiFormatted.map((d: any) => ({ time: d.time, value: 70 }));
          const oversoldData = rsiFormatted.map((d: any) => ({ time: d.time, value: 30 }));
          
          const overboughtSeries = rsiChart.addSeries(LineSeries, {
            color: '#ff1744',
            lineWidth: 1,
            lineStyle: 2,
            title: 'Overbought',
          });
          overboughtSeries.setData(overboughtData);
          
          const oversoldSeries = rsiChart.addSeries(LineSeries, {
            color: '#00c853',
            lineWidth: 1,
            lineStyle: 2,
            title: 'Oversold',
          });
          oversoldSeries.setData(oversoldData);
        }
        
        // Render MACD
        if (showMACD && macdContainerRef.current && macdData.length > 0) {
          const macdChart = createChart(macdContainerRef.current, {
            width: macdContainerRef.current.clientWidth,
            height: 150,
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
          
          macdChartRef.current = macdChart;
          
          // MACD Line
          const macdLineData = macdData.map((item: any) => ({
            time: Math.floor(new Date(item.timestamp).getTime() / 1000) as UTCTimestamp,
            value: item.macd,
          })).filter((d: any) => d.value !== null);
          
          const macdSeries = macdChart.addSeries(LineSeries, {
            color: '#60a5fa',
            lineWidth: 2,
            title: 'MACD',
          });
          macdSeries.setData(macdLineData);
          
          // Signal Line
          const signalLineData = macdData.map((item: any) => ({
            time: Math.floor(new Date(item.timestamp).getTime() / 1000) as UTCTimestamp,
            value: item.signal,
          })).filter((d: any) => d.value !== null);
          
          const signalSeries = macdChart.addSeries(LineSeries, {
            color: '#fb923c',
            lineWidth: 2,
            title: 'Signal',
          });
          signalSeries.setData(signalLineData);
          
          // Histogram
          const histogramData = macdData.map((item: any) => ({
            time: Math.floor(new Date(item.timestamp).getTime() / 1000) as UTCTimestamp,
            value: item.histogram,
            color: item.histogram >= 0 ? '#00c853' : '#ff1744',
          })).filter((d: any) => d.value !== null);
          
          const histogramSeries = macdChart.addSeries(HistogramSeries, {
            color: '#60a5fa',
          });
          histogramSeries.setData(histogramData);
        }
        
      } catch (err) {
        console.error('❌ Chart error:', err);
        setError('Failed to load chart data');
      } finally {
        setLoading(false);
      }
    };
    
    fetchAndRender();

    return () => {
      cancelled = true;
      cleanupCharts();
    };
  }, [symbol, timeframe, showRSI, showMACD, showBollinger]);

  return (
    <div className="bg-trade-card rounded-xl p-6 border border-trade-border">
      {/* Controls */}
      <div className="flex flex-wrap gap-4 mb-4">
       {/* <div>
          <label className="block text-gray-400 text-sm mb-1">Symbol</label>
          <select
            value={symbol}
            onChange={(e) => setSymbol(e.target.value)}
            className="bg-trade-bg border border-trade-border rounded-lg px-3 py-1.5 text-white text-sm focus:outline-none focus:border-blue-500"
          >
            {symbols.map((s) => (
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
            {timeframes.map((t) => (
              <option key={t} value={t}>{t}</option>
            ))}
          </select>
        </div> */}
        
        <div className="flex items-end gap-4">
          <label className="flex items-center gap-2 text-gray-400 text-sm">
            <input
              type="checkbox"
              checked={showRSI}
              onChange={(e) => onShowRSIChange?.(e.target.checked)}
              className="rounded bg-trade-bg border-trade-border"
            />
            RSI
          </label>
          <label className="flex items-center gap-2 text-gray-400 text-sm">
            <input
              type="checkbox"
              checked={showMACD}
              onChange={(e) => onShowMACDChange?.(e.target.checked)}
              className="rounded bg-trade-bg border-trade-border"
            />
            MACD
          </label>
          <label className="flex items-center gap-2 text-gray-400 text-sm">
            <input
              type="checkbox"
              checked={showBollinger}
              onChange={(e) => onShowBollingerChange?.(e.target.checked)}
              className="rounded bg-trade-bg border-trade-border"
            />
            Bollinger
          </label>
        </div>
      </div>
      
      {/* Chart */}
      {loading ? (
        <div className="flex items-center justify-center h-[500px] text-gray-400">Loading chart...</div>
      ) : error ? (
        <div className="flex items-center justify-center h-[500px] text-red-500">{error}</div>
      ) : (
        <div className="space-y-2">
          <div ref={chartContainerRef} className="w-full h-[400px]" />
          {showRSI && <div ref={rsiContainerRef} className="w-full h-[150px]" />}
          {showMACD && <div ref={macdContainerRef} className="w-full h-[150px]" />}
        </div>
      )}
    </div>
  );
};

export default IndicatorChart;