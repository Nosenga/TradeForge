import React, { useMemo, useState } from 'react';
import {
  BookOpen,
  TrendingUp,
  BarChart3,
  Shield,
  Brain,
  Search,
  ChevronDown,
  ChevronRight,
  LineChart,
  Coins,
  Layers,
  Boxes,
  Zap,
  Globe,
  CheckCircle2,
} from 'lucide-react';

interface Lesson {
  id: string;
  title: string;
  /** Duration in whole minutes. Used for both display and the total-time rollup. */
  durationMinutes: number;
  content: string;
  /** Optional key into DIAGRAMS — renders an inline SVG illustration above the lesson content. */
  visualId?: string;
}

interface Module {
  id: string;
  title: string;
  icon: React.ReactNode;
  description: string;
  lessons: Lesson[];
}

interface GlossaryTerm {
  term: string;
  definition: string;
}

/**
 * Inline SVG illustrations for the most spatial/visual lessons. Kept as raw
 * SVG (not images) so there's no hosting dependency and they scale cleanly.
 * Colors are hardcoded hex approximations of the existing Tailwind palette
 * (green-400 #4ade80, red-400 #f87171, blue-400 #60a5fa, etc.) so a diagram
 * dropped into dangerouslySetInnerHTML-adjacent JSX still matches the app's
 * dark theme without depending on Tailwind classes being present on <svg>.
 */
const DIAGRAM_COLORS = {
  green: '#4ade80',
  red: '#f87171',
  blue: '#60a5fa',
  amber: '#fbbf24',
  purple: '#c084fc',
  gray: '#9ca3af',
  grid: '#374151',
  text: '#d1d5db',
};

const DIAGRAMS: Record<string, React.ReactNode> = {
  'candlestick-anatomy': (
    <svg viewBox="0 0 400 240" className="w-full h-auto">
      {/* Bullish candle */}
      <line x1="110" y1="30" x2="110" y2="200" stroke={DIAGRAM_COLORS.green} strokeWidth="2" />
      <rect x="90" y="90" width="40" height="80" fill={DIAGRAM_COLORS.green} rx="2" />
      <text x="110" y="20" fill={DIAGRAM_COLORS.text} fontSize="12" textAnchor="middle">High</text>
      <text x="110" y="222" fill={DIAGRAM_COLORS.text} fontSize="12" textAnchor="middle">Low</text>
      <text x="145" y="94" fill={DIAGRAM_COLORS.text} fontSize="11">Close</text>
      <text x="145" y="174" fill={DIAGRAM_COLORS.text} fontSize="11">Open</text>
      <text x="110" y="230" fill={DIAGRAM_COLORS.green} fontSize="12" textAnchor="middle">Bullish</text>

      {/* Bearish candle */}
      <line x1="290" y1="20" x2="290" y2="190" stroke={DIAGRAM_COLORS.red} strokeWidth="2" />
      <rect x="270" y="60" width="40" height="80" fill={DIAGRAM_COLORS.red} rx="2" />
      <text x="290" y="12" fill={DIAGRAM_COLORS.text} fontSize="12" textAnchor="middle">High</text>
      <text x="290" y="204" fill={DIAGRAM_COLORS.text} fontSize="12" textAnchor="middle">Low</text>
      <text x="325" y="64" fill={DIAGRAM_COLORS.text} fontSize="11">Open</text>
      <text x="325" y="144" fill={DIAGRAM_COLORS.text} fontSize="11">Close</text>
      <text x="290" y="230" fill={DIAGRAM_COLORS.red} fontSize="12" textAnchor="middle">Bearish</text>

      {/* Wick label with arrow */}
      <line x1="60" y1="45" x2="88" y2="45" stroke={DIAGRAM_COLORS.gray} strokeWidth="1" />
      <text x="10" y="49" fill={DIAGRAM_COLORS.gray} fontSize="11">Wick</text>
      <line x1="140" y1="130" x2="180" y2="130" stroke={DIAGRAM_COLORS.gray} strokeWidth="1" />
      <text x="184" y="134" fill={DIAGRAM_COLORS.gray} fontSize="11">Body</text>
    </svg>
  ),

  'candlestick-reversals': (
    <svg viewBox="0 0 600 220" className="w-full h-auto">
      {/* Hammer */}
      <g>
        <line x1="70" y1="40" x2="70" y2="180" stroke={DIAGRAM_COLORS.green} strokeWidth="2" />
        <rect x="55" y="40" width="30" height="24" fill={DIAGRAM_COLORS.green} rx="2" />
        <text x="70" y="205" fill={DIAGRAM_COLORS.text} fontSize="13" textAnchor="middle">Hammer</text>
        <text x="70" y="20" fill={DIAGRAM_COLORS.gray} fontSize="10" textAnchor="middle">bottom reversal</text>
      </g>
      {/* Shooting star */}
      <g>
        <line x1="230" y1="40" x2="230" y2="180" stroke={DIAGRAM_COLORS.red} strokeWidth="2" />
        <rect x="215" y="150" width="30" height="24" fill={DIAGRAM_COLORS.red} rx="2" />
        <text x="230" y="205" fill={DIAGRAM_COLORS.text} fontSize="13" textAnchor="middle">Shooting Star</text>
        <text x="230" y="20" fill={DIAGRAM_COLORS.gray} fontSize="10" textAnchor="middle">top reversal</text>
      </g>
      {/* Bullish engulfing */}
      <g>
        <line x1="420" y1="80" x2="420" y2="120" stroke={DIAGRAM_COLORS.red} strokeWidth="2" />
        <rect x="410" y="90" width="20" height="20" fill={DIAGRAM_COLORS.red} rx="2" />
        <line x1="470" y1="50" x2="470" y2="170" stroke={DIAGRAM_COLORS.green} strokeWidth="2" />
        <rect x="452" y="65" width="36" height="90" fill={DIAGRAM_COLORS.green} rx="2" />
        <text x="445" y="205" fill={DIAGRAM_COLORS.text} fontSize="13" textAnchor="middle">Bullish Engulfing</text>
        <text x="445" y="20" fill={DIAGRAM_COLORS.gray} fontSize="10" textAnchor="middle">small red, then big green</text>
      </g>
    </svg>
  ),

  'chart-patterns': (
    <svg viewBox="0 0 600 260" className="w-full h-auto">
      {/* Bull flag: pole + flag + breakout */}
      <g>
        <polyline
          points="30,220 60,150 65,145 80,155 95,150 110,158 125,152 160,60"
          fill="none"
          stroke={DIAGRAM_COLORS.green}
          strokeWidth="2.5"
        />
        <line x1="160" y1="60" x2="185" y2="20" stroke={DIAGRAM_COLORS.green} strokeWidth="2.5" strokeDasharray="4 3" />
        <path d="M 165 22 L 185 20 L 178 38 Z" fill={DIAGRAM_COLORS.green} />
        <text x="95" y="245" fill={DIAGRAM_COLORS.text} fontSize="13" textAnchor="middle">Bull Flag</text>
        <text x="60" y="140" fill={DIAGRAM_COLORS.gray} fontSize="10">pole</text>
        <text x="95" y="175" fill={DIAGRAM_COLORS.gray} fontSize="10">flag</text>
      </g>
      {/* Head and shoulders */}
      <g>
        <polyline
          points="330,200 360,140 390,170 420,80 450,170 480,140 510,200"
          fill="none"
          stroke={DIAGRAM_COLORS.red}
          strokeWidth="2.5"
        />
        <line x1="360" y1="170" x2="480" y2="170" stroke={DIAGRAM_COLORS.gray} strokeWidth="1.5" strokeDasharray="4 3" />
        <text x="420" y="70" fill={DIAGRAM_COLORS.text} fontSize="11" textAnchor="middle">head</text>
        <text x="360" y="130" fill={DIAGRAM_COLORS.text} fontSize="11" textAnchor="middle">shoulder</text>
        <text x="480" y="130" fill={DIAGRAM_COLORS.text} fontSize="11" textAnchor="middle">shoulder</text>
        <text x="500" y="185" fill={DIAGRAM_COLORS.gray} fontSize="10">neckline</text>
        <text x="420" y="245" fill={DIAGRAM_COLORS.text} fontSize="13" textAnchor="middle">Head & Shoulders</text>
      </g>
    </svg>
  ),

  'ma-crossover': (
    <svg viewBox="0 0 600 260" className="w-full h-auto">
      {/* price */}
      <polyline
        points="20,200 80,190 140,160 200,150 260,90 320,70 380,110 440,140 500,100 560,60"
        fill="none"
        stroke={DIAGRAM_COLORS.gray}
        strokeWidth="1.5"
      />
      {/* fast MA */}
      <polyline
        points="20,205 80,195 140,175 200,145 260,120 320,95 380,100 440,120 500,110 560,80"
        fill="none"
        stroke={DIAGRAM_COLORS.blue}
        strokeWidth="2.5"
      />
      {/* slow MA */}
      <polyline
        points="20,215 80,210 140,200 200,185 260,165 320,145 380,130 440,125 500,120 560,110"
        fill="none"
        stroke={DIAGRAM_COLORS.amber}
        strokeWidth="2.5"
      />
      <circle cx="290" cy="107" r="6" fill={DIAGRAM_COLORS.green} />
      <text x="290" y="90" fill={DIAGRAM_COLORS.green} fontSize="12" textAnchor="middle">Golden Cross</text>
      <circle cx="470" cy="122" r="6" fill={DIAGRAM_COLORS.red} />
      <text x="470" y="150" fill={DIAGRAM_COLORS.red} fontSize="12" textAnchor="middle">Death Cross</text>
      <text x="70" y="30" fill={DIAGRAM_COLORS.blue} fontSize="12">— Fast MA (e.g. 50-day)</text>
      <text x="70" y="48" fill={DIAGRAM_COLORS.amber} fontSize="12">— Slow MA (e.g. 200-day)</text>
    </svg>
  ),

  'support-resistance': (
    <svg viewBox="0 0 600 220" className="w-full h-auto">
      <line x1="20" y1="60" x2="580" y2="60" stroke={DIAGRAM_COLORS.red} strokeWidth="1.5" strokeDasharray="6 4" />
      <text x="30" y="50" fill={DIAGRAM_COLORS.red} fontSize="12">Resistance</text>
      <line x1="20" y1="160" x2="440" y2="160" stroke={DIAGRAM_COLORS.green} strokeWidth="1.5" strokeDasharray="6 4" />
      <text x="30" y="178" fill={DIAGRAM_COLORS.green} fontSize="12">Support</text>
      <polyline
        points="20,110 70,60 120,110 170,160 220,110 270,60 320,110 370,160 420,110 460,60 500,35 560,15"
        fill="none"
        stroke={DIAGRAM_COLORS.text}
        strokeWidth="2.5"
      />
      <text x="520" y="30" fill={DIAGRAM_COLORS.blue} fontSize="12" textAnchor="middle">Breakout</text>
    </svg>
  ),

  'options-payoffs': (
    <svg viewBox="0 0 600 260" className="w-full h-auto">
      {/* Straddle: V shape */}
      <g>
        <line x1="20" y1="150" x2="180" y2="150" stroke={DIAGRAM_COLORS.grid} strokeWidth="1" />
        <polyline points="20,90 100,150 180,90" fill="none" stroke={DIAGRAM_COLORS.purple} strokeWidth="2.5" />
        <text x="100" y="230" fill={DIAGRAM_COLORS.text} fontSize="12" textAnchor="middle">Long Straddle</text>
        <text x="100" y="248" fill={DIAGRAM_COLORS.gray} fontSize="10" textAnchor="middle">profits either direction</text>
      </g>
      {/* Bull call spread: capped step */}
      <g>
        <line x1="220" y1="150" x2="380" y2="150" stroke={DIAGRAM_COLORS.grid} strokeWidth="1" />
        <polyline points="220,170 270,170 340,110 380,110" fill="none" stroke={DIAGRAM_COLORS.blue} strokeWidth="2.5" />
        <text x="300" y="230" fill={DIAGRAM_COLORS.text} fontSize="12" textAnchor="middle">Bull Call Spread</text>
        <text x="300" y="248" fill={DIAGRAM_COLORS.gray} fontSize="10" textAnchor="middle">capped risk & reward</text>
      </g>
      {/* Iron condor: plateau */}
      <g>
        <line x1="420" y1="150" x2="580" y2="150" stroke={DIAGRAM_COLORS.grid} strokeWidth="1" />
        <polyline
          points="420,190 450,190 480,120 520,120 550,190 580,190"
          fill="none"
          stroke={DIAGRAM_COLORS.amber}
          strokeWidth="2.5"
        />
        <text x="500" y="230" fill={DIAGRAM_COLORS.text} fontSize="12" textAnchor="middle">Iron Condor</text>
        <text x="500" y="248" fill={DIAGRAM_COLORS.gray} fontSize="10" textAnchor="middle">profits if price stays boxed in</text>
      </g>
    </svg>
  ),
};

/** Renders an optional lesson diagram. Returns null if the lesson has no visualId. */
const LessonVisual: React.FC<{ visualId?: string }> = ({ visualId }) => {
  if (!visualId || !DIAGRAMS[visualId]) return null;
  return (
    <div className="bg-trade-bg/50 border border-trade-border rounded-lg p-4 mb-4">
      {DIAGRAMS[visualId]}
    </div>
  );
};

/**
 * Static content lives outside the component so it isn't re-created (including
 * the JSX icon nodes) on every render. It's also easier to unit test / extend
 * this way, e.g. by moving it into its own content/modules.ts file later.
 *
 * Content in modules 6-11 is written from general trading/investing
 * knowledge, organized around the same topic areas as a condensed study
 * guide the user provided (swing trading, options, dividends, futures, day
 * trading, forex) — not copied or closely paraphrased from any single
 * source.
 */
const MODULES: Module[] = [
  {
    id: 'module1',
    title: 'Trading Fundamentals',
    icon: <BookOpen className="w-6 h-6 text-blue-400" />,
    description: 'Learn the basics of financial markets and how trading works.',
    lessons: [
      {
        id: 'lesson1-1',
        title: 'What is Forex?',
        durationMinutes: 5,
        content: `
          <h3>What is Forex?</h3>
          <p>Forex (Foreign Exchange) is the global market where currencies are traded. It's the largest and most liquid financial market in the world, with a daily trading volume exceeding $6 trillion.</p>
          <h4>Key Concepts:</h4>
          <ul>
            <li><strong>Currency Pairs:</strong> Currencies are traded in pairs (e.g., EUR/USD, GBP/USD)</li>
            <li><strong>Base vs Quote Currency:</strong> The first currency is the base, the second is the quote</li>
            <li><strong>Pips:</strong> The smallest price movement in a currency pair</li>
            <li><strong>Leverage:</strong> Borrowed capital to increase potential returns</li>
          </ul>
          <h4>Major Currency Pairs:</h4>
          <ul>
            <li>EUR/USD (Euro/US Dollar)</li>
            <li>USD/JPY (US Dollar/Japanese Yen)</li>
            <li>GBP/USD (British Pound/US Dollar)</li>
            <li>USD/CHF (US Dollar/Swiss Franc)</li>
          </ul>
          <div class="bg-blue-900/20 border border-blue-500/30 rounded-lg p-4 mt-4">
            <p class="text-blue-400 text-sm">💡 The forex market operates 24 hours a day, 5 days a week. See the Forex for Beginners module for a deeper dive.</p>
          </div>
        `,
      },
      {
        id: 'lesson1-2',
        title: 'Market Participants',
        durationMinutes: 4,
        content: `
          <h3>Who Trades in the Forex Market?</h3>
          <ul>
            <li><strong>Central Banks:</strong> Set monetary policy and intervene in markets</li>
            <li><strong>Commercial Banks:</strong> Facilitate international trade and investment</li>
            <li><strong>Hedge Funds:</strong> Speculative trading for profit</li>
            <li><strong>Retail Traders:</strong> Individual traders like you</li>
            <li><strong>Corporations:</strong> Hedge currency risk from international operations</li>
          </ul>
        `,
      },
      {
        id: 'lesson1-3',
        title: 'How to Read Price Charts',
        durationMinutes: 6,
        visualId: 'candlestick-anatomy',
        content: `
          <h3>Reading Price Charts</h3>
          <h4>Types of Charts:</h4>
          <ul>
            <li><strong>Line Charts:</strong> Simple, shows closing prices over time</li>
            <li><strong>Bar Charts:</strong> Shows open, high, low, close for each period</li>
            <li><strong>Candlestick Charts:</strong> Most popular, shows OHLC with visual cues</li>
          </ul>
          <h4>Candlestick Components:</h4>
          <ul>
            <li><strong>Body:</strong> Represents the open-to-close range</li>
            <li><strong>Wick/Shadow:</strong> Represents the high-to-low range</li>
            <li><strong>Green (Bullish):</strong> Close > Open</li>
            <li><strong>Red (Bearish):</strong> Close < Open</li>
          </ul>
        `,
      },
    ],
  },
  {
    id: 'module2',
    title: 'Technical Analysis',
    icon: <TrendingUp className="w-6 h-6 text-green-400" />,
    description: 'Master the art of analyzing price movements and patterns.',
    lessons: [
      {
        id: 'lesson2-1',
        title: 'Trend Analysis',
        durationMinutes: 5,
        content: `
          <h3>Understanding Trends</h3>
          <p>A trend is the general direction of price movement over time.</p>
          <h4>Types of Trends:</h4>
          <ul>
            <li><strong>Uptrend:</strong> Higher highs and higher lows</li>
            <li><strong>Downtrend:</strong> Lower highs and lower lows</li>
            <li><strong>Sideways/Range:</strong> Price moves within a channel</li>
          </ul>
          <h4>Trend Identification:</h4>
          <ul>
            <li><strong>Trendlines:</strong> Draw lines connecting swing highs or lows</li>
            <li><strong>Moving Averages:</strong> Smooth price data to identify direction</li>
            <li><strong>ADX:</strong> Measures trend strength</li>
          </ul>
        `,
      },
      {
        id: 'lesson2-2',
        title: 'Support & Resistance',
        durationMinutes: 5,
        visualId: 'support-resistance',
        content: `
          <h3>Support and Resistance Levels</h3>
          <p>Key price levels where price has historically reversed.</p>
          <h4>Support:</h4>
          <p>A price level where buying pressure is strong enough to prevent further decline.</p>
          <h4>Resistance:</h4>
          <p>A price level where selling pressure is strong enough to prevent further rise.</p>
          <h4>Trading Strategies:</h4>
          <ul>
            <li><strong>Bounce:</strong> Buy at support, sell at resistance</li>
            <li><strong>Breakout:</strong> Trade in the direction of the breakout</li>
          </ul>
          <div class="bg-yellow-900/20 border border-yellow-500/30 rounded-lg p-4 mt-4">
            <p class="text-yellow-400 text-sm">⚠️ Support and resistance levels can become weaker after being tested multiple times, and can break entirely on news like an earnings surprise.</p>
          </div>
        `,
      },
      {
        id: 'lesson2-3',
        title: 'Candlestick Reversal Patterns',
        durationMinutes: 7,
        visualId: 'candlestick-reversals',
        content: `
          <h3>Candlestick Reversal Patterns</h3>
          <p>Beyond a single candle's color, certain multi-candle shapes hint that a trend may be running out of steam.</p>
          <h4>At the Bottom of a Downtrend:</h4>
          <ul>
            <li><strong>Hammer:</strong> A small body near the top of the range with a long lower wick — buyers pushed price back up after sellers tried to drive it lower.</li>
            <li><strong>Bullish engulfing:</strong> A large green candle whose body completely swallows the prior red candle's body.</li>
            <li><strong>Piercing line:</strong> A green candle that closes above the midpoint of the prior red candle's body.</li>
          </ul>
          <h4>At the Top of an Uptrend:</h4>
          <ul>
            <li><strong>Shooting star:</strong> A small body near the bottom of the range with a long upper wick — buyers tried to push higher but sellers took control.</li>
            <li><strong>Bearish engulfing:</strong> A large red candle whose body swallows the prior green candle's body.</li>
            <li><strong>Dark cloud cover:</strong> A red candle that closes below the midpoint of the prior green candle's body.</li>
          </ul>
          <h4>Indecision Candles:</h4>
          <ul>
            <li><strong>Doji:</strong> Open and close are nearly equal, producing a thin cross shape — neither side won that period.</li>
            <li><strong>Spinning top:</strong> A small body with wicks on both sides, showing a tug-of-war.</li>
          </ul>
          <div class="bg-green-900/20 border border-green-500/30 rounded-lg p-4 mt-4">
            <p class="text-green-400 text-sm">✅ Reversal candles are far more reliable when they show up on above-average volume and at a level you were already watching (like support or resistance).</p>
          </div>
        `,
      },
      {
        id: 'lesson2-4',
        title: 'Chart Patterns: Flags, Head & Shoulders, Double Tops',
        durationMinutes: 6,
        visualId: 'chart-patterns',
        content: `
          <h3>Common Chart Patterns</h3>
          <h4>Continuation Patterns:</h4>
          <ul>
            <li><strong>Flags:</strong> A sharp, news-driven move (the "pole") followed by a brief sideways or gently sloped consolidation (the "flag"). A breakout in the pole's original direction, on rising volume, often continues the move.</li>
            <li><strong>Pennants:</strong> Similar to flags, but the consolidation narrows into a small symmetrical triangle rather than a rectangle.</li>
          </ul>
          <h4>Reversal Patterns:</h4>
          <ul>
            <li><strong>Head and shoulders:</strong> Three peaks where the middle one is the tallest — a classic top reversal pattern after an extended rally. The mirror image (inverse head and shoulders) marks bottoms.</li>
            <li><strong>Double top / double bottom:</strong> Two failed attempts to break the same high (or low). A double top is only confirmed once price breaks below the low that separated the two peaks.</li>
          </ul>
          <p>Volume is often what separates a real breakout from a false one — a pattern that breaks on light volume is more likely to fail and snap back.</p>
        `,
      },
    ],
  },
  {
    id: 'module3',
    title: 'Indicators & Strategies',
    icon: <BarChart3 className="w-6 h-6 text-purple-400" />,
    description: 'Learn to use technical indicators and build trading strategies.',
    lessons: [
      {
        id: 'lesson3-1',
        title: 'RSI - Relative Strength Index',
        durationMinutes: 6,
        content: `
          <h3>RSI (Relative Strength Index)</h3>
          <p>RSI measures the speed and change of price movements on a scale of 0-100.</p>
          <h4>How to Use RSI:</h4>
          <ul>
            <li><strong>Overbought (>70):</strong> Potential reversal to the downside</li>
            <li><strong>Oversold (<30):</strong> Potential reversal to the upside</li>
            <li><strong>Divergence:</strong> Price and RSI moving in opposite directions</li>
          </ul>
          <h4>RSI Strategy:</h4>
          <ul>
            <li>Buy when RSI < 30 and starts moving up</li>
            <li>Sell when RSI > 70 and starts moving down</li>
            <li>Use with trend confirmation for better results</li>
          </ul>
          <div class="bg-purple-900/20 border border-purple-500/30 rounded-lg p-4 mt-4">
            <p class="text-purple-400 text-sm">💡 "Overbought" doesn't mean "must fall now" — in a strong trend, RSI can stay pinned above 70 for a long time. Think of it as a ball thrown high: it will come down eventually, just not necessarily on your schedule.</p>
          </div>
        `,
      },
      {
        id: 'lesson3-2',
        title: 'MACD - Moving Average Convergence Divergence',
        durationMinutes: 6,
        content: `
          <h3>MACD (Moving Average Convergence Divergence)</h3>
          <p>MACD is a trend-following momentum indicator.</p>
          <h4>Components:</h4>
          <ul>
            <li><strong>MACD Line:</strong> 12-day EMA - 26-day EMA</li>
            <li><strong>Signal Line:</strong> 9-day EMA of MACD Line</li>
            <li><strong>Histogram:</strong> MACD Line - Signal Line</li>
          </ul>
          <h4>MACD Signals:</h4>
          <ul>
            <li><strong>Bullish Crossover:</strong> MACD crosses above Signal Line → BUY</li>
            <li><strong>Bearish Crossover:</strong> MACD crosses below Signal Line → SELL</li>
            <li><strong>Divergence:</strong> Price and MACD moving in opposite directions</li>
          </ul>
        `,
      },
      {
        id: 'lesson3-3',
        title: 'Moving Average Crossovers & Bollinger Bands',
        durationMinutes: 6,
        visualId: 'ma-crossover',
        content: `
          <h3>Moving Average Crossovers</h3>
          <p>A short-period moving average crossing a longer-period one is one of the oldest trend-change signals.</p>
          <ul>
            <li><strong>Golden cross:</strong> The 50-day average crosses above the 200-day average — often read as a longer-term bullish signal.</li>
            <li><strong>Death cross:</strong> The 50-day average crosses below the 200-day average — often read as a longer-term bearish signal.</li>
            <li>Shorter pairs like 20/50 give faster, noisier signals; longer pairs like 50/200 give slower, more reliable ones.</li>
          </ul>
          <h3>Bollinger Bands</h3>
          <p>A 20-period moving average with two bands plotted two standard deviations above and below it.</p>
          <ul>
            <li>Price tagging the upper band suggests it's stretched to the upside; the lower band suggests it's stretched to the downside — neither is an automatic reversal signal on its own.</li>
            <li><strong>Band squeeze:</strong> When the bands narrow sharply, volatility has compressed and often precedes a bigger move.</li>
            <li>In a strong trend, price can "ride the band" for an extended period — some traders use the 20-period average itself as a trailing stop in that case.</li>
          </ul>
          <div class="bg-purple-900/20 border border-purple-500/30 rounded-lg p-4 mt-4">
            <p class="text-purple-400 text-sm">💡 Most traders pick 2-3 indicators from different families (e.g., one trend indicator, one momentum indicator) rather than stacking many similar ones that all say the same thing.</p>
          </div>
        `,
      },
    ],
  },
  {
    id: 'module4',
    title: 'Risk Management',
    icon: <Shield className="w-6 h-6 text-red-400" />,
    description: 'Protect your capital and manage trading risks effectively.',
    lessons: [
      {
        id: 'lesson4-1',
        title: 'Position Sizing',
        durationMinutes: 5,
        content: `
          <h3>Position Sizing</h3>
          <p>Determine how much to risk on each trade.</p>
          <h4>Risk Per Trade:</h4>
          <ul>
            <li><strong>1-2% Rule:</strong> Risk 1-2% of your account per trade</li>
            <li><strong>Kelly Criterion:</strong> Mathematical approach to position sizing</li>
          </ul>
          <h4>Position Size Formula:</h4>
          <p>Position Size = (Account Balance × Risk %) / (Stop-Loss Distance × Pip Value)</p>
          <div class="bg-green-900/20 border border-green-500/30 rounded-lg p-4 mt-4">
            <p class="text-green-400 text-sm">✅ Example: $10,000 account, 2% risk = $200 risk per trade</p>
          </div>
          <p>The same 1-2% rule shows up across almost every trading style — stocks, options, futures, and forex — because it's really about surviving a losing streak, not any one market's quirks. A wider stop-loss simply means a smaller position size for the same dollar risk.</p>
        `,
      },
      {
        id: 'lesson4-2',
        title: 'Stop-Loss & Take-Profit',
        durationMinutes: 4,
        content: `
          <h3>Stop-Loss and Take-Profit</h3>
          <h4>Stop-Loss:</h4>
          <p>An order to close a trade at a predetermined price to limit losses.</p>
          <ul>
            <li>Place below support (for long positions)</li>
            <li>Place above resistance (for short positions)</li>
            <li>Use 2x ATR for volatility-adjusted stops</li>
          </ul>
          <h4>Take-Profit:</h4>
          <p>An order to close a trade at a predetermined price to lock in profits.</p>
          <ul>
            <li>Target 1.5-2x your stop-loss distance</li>
            <li>Use support/resistance levels as targets</li>
          </ul>
          <div class="bg-red-900/20 border border-red-500/30 rounded-lg p-4 mt-4">
            <p class="text-red-400 text-sm">⚠️ Set both before you enter the trade, not after. Widening a stop-loss mid-trade to "give it room" is one of the most common ways a small loss becomes a big one.</p>
          </div>
        `,
      },
      {
        id: 'lesson4-3',
        title: 'Expected Value: Win Rate vs Reward-to-Risk',
        durationMinutes: 5,
        content: `
          <h3>Expected Value: Win Rate vs Reward-to-Risk</h3>
          <p>A trading strategy doesn't need to win most of the time to be profitable — it needs a positive expected value.</p>
          <h4>The Formula:</h4>
          <p>Expected Value = (Win Rate × Average Win) − (Loss Rate × Average Loss)</p>
          <ul>
            <li>An 80% win rate can still lose money overall if the occasional loss is much bigger than the typical win.</li>
            <li>A 40% win rate can still be very profitable if winners are, on average, several times bigger than losers.</li>
            <li>This is why many option-selling strategies can have high win rates but require careful risk limits — the rare loss can be disproportionately large.</li>
          </ul>
          <p>Before taking a trade, it's worth asking: given my realistic win rate and my planned stop/target, is the expected value actually positive?</p>
        `,
      },
    ],
  },
  {
    id: 'module5',
    title: 'Trading Psychology',
    icon: <Brain className="w-6 h-6 text-orange-400" />,
    description: 'Develop the mindset of a successful trader.',
    lessons: [
      {
        id: 'lesson5-1',
        title: 'Discipline & Patience',
        durationMinutes: 4,
        content: `
          <h3>Discipline and Patience in Trading</h3>
          <h4>Key Principles:</h4>
          <ul>
            <li><strong>Follow Your Trading Plan:</strong> Stick to your entry/exit rules</li>
            <li><strong>Don't Chase Trades:</strong> Wait for your setup</li>
            <li><strong>Accept Losses:</strong> Losses are part of trading</li>
            <li><strong>Review and Improve:</strong> Keep a trading journal</li>
          </ul>
          <h4>Common Mistakes:</h4>
          <ul>
            <li>Overtrading</li>
            <li>Moving stop-losses</li>
            <li>Revenge trading</li>
            <li>Fear of missing out (FOMO)</li>
          </ul>
        `,
      },
      {
        id: 'lesson5-2',
        title: 'Trading Journal',
        durationMinutes: 5,
        content: `
          <h3>Keeping a Trading Journal</h3>
          <p>A trading journal helps you track your progress and identify patterns.</p>
          <h4>What to Track:</h4>
          <ul>
            <li>Entry/Exit price and time</li>
            <li>Position size and risk</li>
            <li>Reason for trade entry</li>
            <li>Trade outcome (profit/loss)</li>
            <li>Emotions during the trade</li>
          </ul>
          <div class="bg-blue-900/20 border border-blue-500/30 rounded-lg p-4 mt-4">
            <p class="text-blue-400 text-sm">📝 Review your journal weekly to identify patterns in your trading behavior.</p>
          </div>
        `,
      },
      {
        id: 'lesson5-3',
        title: 'Treating Trading Like a Business',
        durationMinutes: 5,
        content: `
          <h3>Treating Trading Like a Business</h3>
          <p>Consistently profitable traders tend to treat trading less like a hobby or a lottery ticket, and more like running a small business.</p>
          <h4>What That Looks Like in Practice:</h4>
          <ul>
            <li><strong>Write a simple plan:</strong> goals, how much capital you're allocating, and what an acceptable "expense" (i.e., losses) looks like over a year.</li>
            <li><strong>Specialize early:</strong> studying a small handful of instruments deeply usually beats spreading attention across dozens.</li>
            <li><strong>Track everything:</strong> wins, losses, and the fees/commissions that quietly eat into returns.</li>
            <li><strong>Set a review checkpoint</strong> (e.g., every quarter or year) to honestly assess whether the results justify continuing, adjusting, or stopping.</li>
          </ul>
          <p>Losses are a normal cost of doing business, not proof that something is broken — the goal is for the plan's expected value to be positive over many trades, not for every individual trade to win.</p>
        `,
      },
    ],
  },
  {
    id: 'module6',
    title: 'Swing Trading',
    icon: <LineChart className="w-6 h-6 text-teal-400" />,
    description: 'Hold trades for days to weeks and capture medium-term price swings.',
    lessons: [
      {
        id: 'lesson6-1',
        title: 'What Is Swing Trading?',
        durationMinutes: 5,
        content: `
          <h3>What Is Swing Trading?</h3>
          <p>Swing trading sits between day trading and long-term investing. Instead of closing
          positions within a single day, or holding for years, a swing trader typically holds a
          position for a few days to a few weeks — sometimes up to a couple of months — aiming to
          capture one meaningful "swing" in price.</p>
          <h4>Why Traders Choose It:</h4>
          <ul>
            <li><strong>Less screen time:</strong> You don't need to watch every tick like a day trader — a few chart checks a day is often enough.</li>
            <li><strong>Bigger targets per trade:</strong> Holding longer lets a trend develop further.</li>
            <li><strong>Works across markets:</strong> stocks, options, and forex can all be swing-traded, and you can profit from moves up (going long) or down (going short, or buying puts).</li>
            <li><strong>Compatible with a day job</strong> and generally considered lower-stress and lower-risk than day trading.</li>
          </ul>
          <h4>Trade-offs:</h4>
          <ul>
            <li>Overnight and weekend risk: news can gap the price against you while markets are closed.</li>
            <li>It is not a get-rich-quick scheme — it rewards study, patience, and disciplined chart reading over time.</li>
          </ul>
        `,
      },
      {
        id: 'lesson6-2',
        title: 'Swing Trading vs Other Styles',
        durationMinutes: 6,
        content: `
          <h3>Swing Trading vs Other Styles</h3>
          <ul>
            <li><strong>Day trading:</strong> every position is closed by the end of the day, which means constant monitoring and generally higher stress. In the US, making four or more day trades within five business days in a margin account triggers the "Pattern Day Trader" rule, which requires a $25,000 minimum account balance. Swing trading has no such capital minimum.</li>
            <li><strong>Buy-and-hold investing:</strong> a years-to-decades horizon, often using dollar-cost averaging into broadly diversified index funds, largely ignoring short-term price swings. Swing traders instead try to beat a buy-and-hold return by actively timing entries and exits on one or two names at a time.</li>
            <li><strong>Position trading:</strong> holds for weeks to years and leans more on fundamentals than swing trading does, often taking far fewer trades per year (roughly 10-12) with wider stops but a more favorable risk/reward per trade.</li>
            <li><strong>High-frequency trading (HFT):</strong> algorithmic trading firms that execute enormous numbers of trades per second. They add liquidity to the market but can put slower retail traders at a disadvantage on very short time frames — another reason swing trading's longer holding period suits individual traders well.</li>
          </ul>
        `,
      },
      {
        id: 'lesson6-3',
        title: 'The Three Markets for Swing Traders',
        durationMinutes: 6,
        content: `
          <h3>The Three Markets for Swing Traders</h3>
          <h4>Forex</h4>
          <p>Extremely liquid, trades nearly 24 hours a day five days a week, and usually involves little to no commission (brokers earn the bid/ask spread instead). Its round-the-clock nature means a swing position can be checked just a few times a day.</p>
          <h4>Options</h4>
          <p>Contracts that give the right to buy (call) or sell (put) typically 100 shares at a set strike price before expiration. They require relatively little capital and cap risk at the premium paid, but value erodes as expiration approaches — like sand running through an hourglass — so the expiry clock always has to be part of the plan.</p>
          <h4>Stocks</h4>
          <p>Volatile stocks tend to make the best swing candidates. Earnings reports are usually the single biggest catalyst — markets react to results <em>versus expectations</em>, not the absolute numbers, which is why a company can beat last year's numbers and still sell off. Product launches and regulatory news matter too, but should be weighed carefully since institutions often react to news before retail traders can.</p>
        `,
      },
      {
        id: 'lesson6-4',
        title: 'Finding a Swing Setup',
        durationMinutes: 6,
        content: `
          <h3>Finding a Swing Setup</h3>
          <p>Most swing setups combine three ingredients: a clear trend, a pullback into a
          reasonable entry zone, and a signal that the pullback is ending.</p>
          <h4>A Common Approach:</h4>
          <ul>
            <li><strong>1. Identify the trend</strong> on the daily chart using higher highs/higher lows (or the reverse for a downtrend).</li>
            <li><strong>2. Wait for a pullback</strong> toward a moving average, prior support/resistance, or a Fibonacci retracement level.</li>
            <li><strong>3. Look for confirmation</strong> — a reversal candlestick pattern, a bounce off support backed by volume, or an indicator turning back in the trend's direction. Most traders want to see a level tested two or three times before trusting it.</li>
            <li><strong>4. Define risk first</strong> — decide your stop-loss level before you decide your target, and use limit orders for entries and stop-losses just beyond support/resistance so the plan executes without emotion getting involved.</li>
          </ul>
          <div class="bg-teal-900/20 border border-teal-500/30 rounded-lg p-4 mt-4">
            <p class="text-teal-400 text-sm">💡 A pullback in an uptrend is often a better entry than chasing a fresh breakout, and levels can break on real news (an earnings surprise, a product announcement) — no indicator or level works 100% of the time, which is exactly why the stop-loss is non-negotiable.</p>
          </div>
        `,
      },
      {
        id: 'lesson6-5',
        title: 'Money Management & Psychology for Swing Traders',
        durationMinutes: 6,
        content: `
          <h3>Money Management & Psychology for Swing Traders</h3>
          <h4>Account Sizing:</h4>
          <p>Many traders start with an amount they could comfortably afford to lose while learning — sometimes as little as a few hundred to a couple thousand dollars purely for practice — and grow the account over time by reinvesting early profits rather than withdrawing them.</p>
          <h4>The 1% (or 1-2%) Rule:</h4>
          <p>Risk — not the full position size, just the amount you stand to lose if the stop is hit — no more than about 1-2% of the account on any single trade. A wider stop-loss (more risk per share) simply means a smaller position size for the same dollar risk; a tighter stop allows a larger position for the same dollar risk.</p>
          <h4>Psychology Checklist:</h4>
          <ul>
            <li>Set stops and profit targets before entering, every single time — not after seeing how the trade is going.</li>
            <li>Expect losing trades; they don't mean the plan is broken.</li>
            <li>Avoid greed — once a preset profit target is hit, take it and move to the next setup rather than hoping for more.</li>
            <li>Stay calm through drawdowns; a trade that's underwater isn't automatically a loser if the stop hasn't been hit.</li>
          </ul>
        `,
      },
      {
        id: 'lesson6-6',
        title: 'Managing a Swing Trade',
        durationMinutes: 5,
        content: `
          <h3>Managing a Swing Trade</h3>
          <h4>Trade Management Ideas:</h4>
          <ul>
            <li><strong>Scale out:</strong> Take partial profit at a first target, let the rest run with a trailing stop.</li>
            <li><strong>Move stops to breakeven</strong> once price has moved a set amount in your favor, to remove downside risk.</li>
            <li><strong>Respect your invalidation level:</strong> If price closes beyond the level that would prove your idea wrong, exit — don't hope.</li>
            <li><strong>Watch for scheduled news</strong> (earnings, central bank meetings) that could gap the position while you're not watching.</li>
          </ul>
        `,
      },
    ],
  },
  {
    id: 'module7',
    title: 'Dividend Investing',
    icon: <Coins className="w-6 h-6 text-yellow-400" />,
    description: 'Build long-term income by owning shares in dividend-paying companies.',
    lessons: [
      {
        id: 'lesson7-1',
        title: 'Why Dividends Matter',
        durationMinutes: 5,
        content: `
          <h3>Why Dividends Matter</h3>
          <p>Dividends can provide passive income, help fund retirement alongside (rather than instead of) a pension, and free up cash without having to sell shares.</p>
          <h4>Total Return, Not Just Price:</h4>
          <p>A stock's share price can go nowhere for years and still deliver a real return if dividends are being paid and reinvested along the way — price stagnation is not the same thing as zero total return. Reinvested dividends buy more shares, which then generate their own dividends, compounding over long periods. Historically, broad market indexes have delivered meaningfully higher total returns with dividends reinvested than on price appreciation alone, which is why "time in the market" is often repeated as the core idea behind dividend investing.</p>
        `,
      },
      {
        id: 'lesson7-2',
        title: 'Saving vs Investing',
        durationMinutes: 4,
        content: `
          <h3>Saving vs Investing</h3>
          <p>Before putting money into dividend stocks, most planners suggest building an emergency fund — roughly six months of expenses — in an insured savings account or short-term government bills, kept separate from money that will be invested.</p>
          <h4>Investing Puts Capital at Risk:</h4>
          <p>Unlike savings, investing accepts the possibility of losing some principal in exchange for income and growth potential. Before starting, it helps to define: your target income, your real risk tolerance, your time horizon, and any account-specific penalty dates (for example, early-withdrawal penalties on US retirement accounts before age 59½).</p>
        `,
      },
      {
        id: 'lesson7-3',
        title: 'How Dividends Work',
        durationMinutes: 5,
        content: `
          <h3>How Dividends Work</h3>
          <p>A dividend is a portion of a company's profit paid out to shareholders, usually in cash,
          on a regular schedule — most US companies pay quarterly.</p>
          <h4>Key Dates to Know:</h4>
          <ul>
            <li><strong>Declaration date:</strong> The board announces the dividend and amount.</li>
            <li><strong>Record date:</strong> The company checks who's on the shareholder register.</li>
            <li><strong>Ex-dividend date:</strong> You must own the stock <em>before</em> this date to receive the payment.</li>
            <li><strong>Payment date:</strong> The dividend is actually paid out, typically about a month after the record date.</li>
          </ul>
          <h4>Dividend Yield:</h4>
          <p>Dividend Yield = Annual Dividend per Share ÷ Share Price. A higher yield isn't
          automatically better — it can also signal a falling stock price or a payout the company
          may struggle to sustain.</p>
          <h4>Qualified vs Non-Qualified:</h4>
          <p>Qualified dividends are generally taxed at lower capital-gains rates; non-qualified dividends (common with REITs, MLPs, and business development companies) are taxed as ordinary income. Rules vary by country, so check local tax treatment.</p>
        `,
      },
      {
        id: 'lesson7-4',
        title: 'Types of Dividend-Paying Instruments',
        durationMinutes: 6,
        content: `
          <h3>Types of Dividend-Paying Instruments</h3>
          <ul>
            <li><strong>ADRs (American Depositary Receipts):</strong> US-listed shares that represent ownership in a foreign company. Dividends arrive in US dollars after conversion, and foreign governments often withhold tax on the payment (sometimes creditable on your home tax return). They're an easy way to add international exposure, but worth checking the tax treatment for your situation.</li>
            <li><strong>MLPs (Master Limited Partnerships):</strong> publicly traded partnerships, common in energy infrastructure like pipelines. They use pass-through taxation, often pay high distributions, but come with extra tax paperwork (a Schedule K-1 in the US) and distributions are typically taxed as ordinary income.</li>
            <li><strong>REITs (Real Estate Investment Trusts):</strong> must hold the large majority of their assets in real estate and are required to distribute most of their taxable income to shareholders, which is why they tend to offer high yields. In exchange for that payout requirement they're often exempt from corporate-level tax, but the dividends are usually taxed as ordinary income. They trade like ordinary stocks.</li>
            <li><strong>Preferred stock:</strong> sits between bonds and common stock — generally offers a more stable, bond-like dividend than common shares, with less upside but more income predictability.</li>
          </ul>
        `,
      },
      {
        id: 'lesson7-5',
        title: 'Building a Dividend Portfolio',
        durationMinutes: 6,
        content: `
          <h3>Building a Dividend Portfolio</h3>
          <p>A few guiding principles for putting a portfolio together:</p>
          <ul>
            <li><strong>Start with goals:</strong> desired income, risk tolerance, and time horizon shape everything else.</li>
            <li><strong>Aim for a sensible blended yield</strong> across the whole portfolio rather than chasing the single highest-yielding stock you can find.</li>
            <li><strong>Stay within industries you understand,</strong> but diversify across sectors so one industry's troubles don't sink the whole portfolio.</li>
            <li><strong>Screen by your own values</strong> if that matters to you (for example, ESG criteria).</li>
            <li><strong>Use free research tools</strong> (screeners, company filings, financial data sites) before buying.</li>
            <li><strong>Start small and average in</strong> over time rather than deploying everything at once.</li>
            <li><strong>Build a core of steady, resilient "blue chip" holdings,</strong> then add smaller, more cyclical positions around the edges.</li>
          </ul>
        `,
      },
      {
        id: 'lesson7-6',
        title: 'Evaluating a Dividend Stock',
        durationMinutes: 6,
        content: `
          <h3>Evaluating a Dividend Stock</h3>
          <h4>Start With Sustainability, Not Yield:</h4>
          <p>Compare a stock's yield to a safe benchmark like a long-term government bond yield — a dividend stock yielding wildly more than that benchmark deserves extra scrutiny, not automatic excitement.</p>
          <h4>Ratios Worth Checking:</h4>
          <ul>
            <li><strong>Payout ratio:</strong> the share of earnings paid out as dividends. A ratio near or above 100% can be a warning sign that the payout isn't well covered by profits.</li>
            <li><strong>Free cash flow:</strong> can the business actually afford the dividend out of the cash it generates, not just accounting profit?</li>
            <li><strong>Debt levels:</strong> heavily indebted companies are often first to cut dividends in a downturn — many investors look for debt-to-equity meaningfully below 2.</li>
            <li><strong>Dividend growth history:</strong> companies that have raised dividends for many consecutive years (sometimes called "dividend aristocrats" at 25+ years) tend to have more resilient payouts than one-off high yielders.</li>
          </ul>
          <div class="bg-yellow-900/20 border border-yellow-500/30 rounded-lg p-4 mt-4">
            <p class="text-yellow-400 text-sm">⚠️ An unusually high yield is often the market pricing in a likely dividend cut — investigate before buying. Yield is forward-looking and can be optimistic; actual total return is what matters in the end.</p>
          </div>
        `,
      },
      {
        id: 'lesson7-7',
        title: 'Using and Reinvesting the Income',
        durationMinutes: 5,
        content: `
          <h3>Using and Reinvesting the Income</h3>
          <p>Many brokers offer a Dividend Reinvestment Plan (DRIP), which automatically uses your
          dividend payments to buy more shares of the same stock — often with no commission and sometimes in fractional shares.</p>
          <h4>Why It Matters:</h4>
          <ul>
            <li>Reinvested dividends buy more shares, which then generate their own dividends — compounding over time.</li>
            <li>Some investors split their dividend income: a portion saved, a portion reinvested through DRIP, and a small portion spent — rather than an all-or-nothing approach.</li>
            <li>Outside of tax-sheltered retirement accounts, reinvested dividends are still generally taxable in the year they're paid, even though you never touched the cash.</li>
          </ul>
        `,
      },
      {
        id: 'lesson7-8',
        title: 'Surviving Bear Markets & Avoiding Common Mistakes',
        durationMinutes: 6,
        content: `
          <h3>Surviving Bear Markets</h3>
          <p>Established dividend payers, especially in defensive sectors like consumer staples, have historically tended to keep paying through downturns better than more cyclical businesses. A rough "safety ladder" from riskier to safer income sources runs: broad index funds → mature defensive-sector stocks → preferred stock → bonds and CDs, which carry a contractual (not discretionary) obligation to pay.</p>
          <h3>Common Mistakes to Avoid</h3>
          <ul>
            <li><strong>The yield trap:</strong> a roughly 3-7% yield is often considered a healthier range; yields above 10% frequently signal the market expects a cut.</li>
            <li><strong>Confusing "cheap" with "good value":</strong> a shrinking business at a low earnings multiple is still shrinking.</li>
            <li><strong>Ignoring dividend growth:</strong> a flat, never-raised payout slowly loses purchasing power to inflation.</li>
            <li><strong>Home-market bias:</strong> concentrating entirely in one country's stocks skips a lot of the world's opportunity set.</li>
            <li><strong>Not diversifying or monitoring holdings</strong> — a "set and forget" mechanical approach still needs periodic check-ins for major changes at the underlying companies.</li>
          </ul>
        `,
      },
    ],
  },
  {
    id: 'module8',
    title: 'Options Trading',
    icon: <Layers className="w-6 h-6 text-pink-400" />,
    description: 'Understand calls, puts, pricing, the Greeks, and common options strategies.',
    lessons: [
      {
        id: 'lesson8-1',
        title: 'Calls & Puts Explained',
        durationMinutes: 6,
        content: `
          <h3>Calls & Puts Explained</h3>
          <p>An option is a contract that gives the buyer (the "holder") the right, but not the obligation, to buy
          or sell a stock at a set price (the "strike price") before a set expiration date. The seller (the "writer")
          takes on the matching obligation if the buyer chooses to exercise. A useful analogy: buying an option is
          like putting down an earnest-money deposit on a house — the deposit is the premium, the agreed purchase
          price is the strike, and the closing deadline is expiration. You can walk away and lose only the deposit,
          or go through with the deal.</p>
          <h4>The Two Basic Types:</h4>
          <ul>
            <li><strong>Call option:</strong> Gives the buyer the right to <em>buy</em> the stock (usually 100 shares per contract) at the strike price. Bought when you expect the price to rise.</li>
            <li><strong>Put option:</strong> Gives the buyer the right to <em>sell</em> the stock at the strike price. Bought when you expect the price to fall, or to protect ("hedge") shares you already own.</li>
          </ul>
          <h4>Key Terms:</h4>
          <ul>
            <li><strong>Premium:</strong> The price paid to buy the option, quoted per share and multiplied by 100 for a standard contract.</li>
            <li><strong>Strike price:</strong> The agreed price for buying/selling the underlying stock.</li>
            <li><strong>Expiration date:</strong> The last day the option can be exercised. Options range from short-dated "weeklies" to long-dated LEAPS (a year or more out).</li>
            <li><strong>American vs European style:</strong> American-style options can be exercised any time before expiration; European-style only at expiration itself.</li>
            <li><strong>In the money / out of the money:</strong> Whether exercising the option right now would be profitable or not.</li>
          </ul>
          <p>In practice, most options are bought and sold rather than exercised — a large majority are closed out or simply expire worthless, with only a small fraction actually exercised.</p>
        `,
      },
      {
        id: 'lesson8-2',
        title: 'Why Traders Use Options',
        durationMinutes: 5,
        content: `
          <h3>Why Traders Use Options</h3>
          <ul>
            <li><strong>Leverage:</strong> Control more shares' worth of exposure for a smaller upfront cost than buying stock outright — a given percentage move in the stock can translate into a much larger percentage move in the option's value.</li>
            <li><strong>Hedging:</strong> Buying puts against a stock you own can limit downside risk, similar to insurance.</li>
            <li><strong>Income generation:</strong> Selling (writing) a call against shares you already own — a "covered call" — or selling a put backed by cash — a "cash-secured put" — can generate extra income.</li>
            <li><strong>Defined risk (when buying):</strong> The most an option <em>buyer</em> can lose is the premium paid, no matter how far the stock moves against the position.</li>
          </ul>
          <div class="bg-pink-900/20 border border-pink-500/30 rounded-lg p-4 mt-4">
            <p class="text-pink-400 text-sm">⚠️ That defined-risk protection applies to buyers, not necessarily sellers. Selling a covered call or a cash-secured put has bounded, known risk (losing upside, or ending up owning shares). Selling a "naked" (uncovered) call, however, can carry very large — in theory unlimited — risk if the stock keeps rising, since there's no owned stock backing the obligation.</p>
          </div>
        `,
      },
      {
        id: 'lesson8-3',
        title: "What Moves an Option's Price",
        durationMinutes: 6,
        content: `
          <h3>What Moves an Option's Price</h3>
          <p>An option's premium is made up of <strong>intrinsic value</strong> (how far in the money
          it already is) and <strong>time value</strong> (the chance it becomes more profitable before
          expiration). Out-of-the-money and at-the-money options are made up entirely of time value.
          Time decay isn't linear — it accelerates as expiration gets closer, which is why an
          out-of-the-money option's price can crumble quickly in its final days if the stock hasn't moved.</p>
          <ul>
            <li><strong>Underlying price movement:</strong> The most direct driver — calls gain as the stock rises, puts gain as it falls.</li>
            <li><strong>Time decay (theta):</strong> Options lose time value as expiration approaches, all else equal, and that decay accelerates near the end of the option's life.</li>
            <li><strong>Implied volatility (vega):</strong> The market's forecast of how much the stock could move over the option's remaining life. Higher expected volatility raises option premiums, since bigger moves are considered more likely — a stock with a higher historical volatility relative to the broad market (a higher "beta") also tends to command richer option premiums.</li>
            <li><strong>Interest rates and dividends:</strong> Smaller effects, but they factor into an option's fair value too — notably, a stock typically drops by roughly the dividend amount on its ex-dividend date, which shifts value between calls and puts at that strike.</li>
          </ul>
          <p>A widely used model for pricing options, developed by Black and Scholes, formalizes these relationships; in practice, most traders rely on a broker's built-in calculator rather than computing it by hand.</p>
        `,
      },
      {
        id: 'lesson8-4',
        title: "The Greeks: A Risk Dashboard",
        durationMinutes: 6,
        content: `
          <h3>The Greeks: A Risk Dashboard</h3>
          <p>The "Greeks" describe how sensitive an option's price is to different factors — think of them as a risk dashboard for a position.</p>
          <ul>
            <li><strong>Delta:</strong> how much the option's price moves per $1 move in the stock. An at-the-money option has a delta near 0.50; a deep in-the-money option approaches 1.00 (moving almost dollar-for-dollar with the stock). Delta grows toward 1 as an in-the-money option nears expiration, and shrinks toward 0 as an out-of-the-money option nears expiration.</li>
            <li><strong>Gamma:</strong> the rate at which delta itself changes as the stock moves — essentially "the delta of delta."</li>
            <li><strong>Theta:</strong> the option's daily time decay, which is negative for buyers (they lose a little value each day, all else equal) and positive for sellers. Decay accelerates as expiration approaches.</li>
            <li><strong>Vega:</strong> how much the option's price changes for each one-point move in implied volatility. Long option positions generally benefit from rising implied volatility.</li>
            <li><strong>Rho:</strong> sensitivity to interest-rate changes — usually a minor factor except for very long-dated options like LEAPS.</li>
          </ul>
        `,
      },
      {
        id: 'lesson8-5',
        title: 'Reading the Option Chain & Approval Levels',
        durationMinutes: 5,
        content: `
          <h3>Reading the Option Chain</h3>
          <ul>
            <li><strong>Bid / ask / spread:</strong> the bid is what buyers are offering, the ask is what sellers want; a wide spread (common in thinly traded strikes or long-dated LEAPS) means you may have to sell closer to the bid if you need to exit quickly.</li>
            <li><strong>Open interest:</strong> the total number of contracts currently outstanding at a strike — higher open interest generally means it will be easier to enter and exit a position at a fair price.</li>
            <li><strong>Volume:</strong> the number of contracts traded that day, which tends to concentrate in the strikes and expirations closest to the current price and date.</li>
            <li><strong>Settlement:</strong> most individual stock options settle by physically exchanging shares if exercised; index and currency options often settle in cash instead. Only option writers (sellers) can be "assigned."</li>
          </ul>
          <h3>Broker Approval Levels</h3>
          <p>Brokers typically gate access to options strategies by risk level, roughly from lowest to highest risk: covered calls and cash-secured puts, then long calls and puts, then multi-leg spreads, then uncovered ("naked") writing. Higher levels require demonstrating more experience and risk tolerance to your broker.</p>
        `,
      },
      {
        id: 'lesson8-6',
        title: 'Common Multi-Leg Strategies',
        durationMinutes: 7,
        visualId: 'options-payoffs',
        content: `
          <h3>Common Multi-Leg Strategies</h3>
          <p>Combining two or more options at once ("legs") can shape the risk and reward of a trade more precisely than a single call or put.</p>
          <ul>
            <li><strong>Long straddle:</strong> buy an at-the-money call and put at the same strike and expiry. Profits from a big move in <em>either</em> direction — a classic play ahead of a known catalyst like earnings. Maximum loss is the combined premium paid, if the stock barely moves.</li>
            <li><strong>Long strangle:</strong> the cheaper cousin of a straddle — an out-of-the-money call and put instead of at-the-money ones. Costs less upfront but needs a bigger move to profit.</li>
            <li><strong>Vertical spreads:</strong> buying one strike and selling another at the same expiration. These cap both the maximum loss and the maximum gain, which is why they're often described as the defined-risk way to express a directional view:
              <ul>
                <li><em>Bull call spread</em> (a debit trade): benefits from a moderate rise.</li>
                <li><em>Bear put spread</em> (a debit trade): benefits from a moderate decline.</li>
                <li><em>Bull put spread</em> (a credit trade): benefits if the stock stays flat or rises.</li>
                <li><em>Bear call spread</em> (a credit trade): benefits if the stock stays flat or falls — but note this one has a less favorable payoff shape, with a smaller capped profit against a potentially larger capped loss, so a single bad trade can offset several winners.</li>
              </ul>
            </li>
            <li><strong>Iron condor:</strong> sell an out-of-the-money call and put, and buy further out-of-the-money options against each for protection. Profits if the stock stays within a range; loss is capped by the protective "wings."</li>
          </ul>
          <div class="bg-pink-900/20 border border-pink-500/30 rounded-lg p-4 mt-4">
            <p class="text-pink-400 text-sm">💡 If a spread's original thesis breaks — say, a bear call spread gets caught in a strong rally — many traders prefer to close it or adjust into a new position rather than hold and hope it recovers.</p>
          </div>
        `,
      },
      {
        id: 'lesson8-7',
        title: 'Selling Options for Income',
        durationMinutes: 6,
        content: `
          <h3>Selling Options for Income</h3>
          <ul>
            <li><strong>Covered calls:</strong> sell a call against shares you already own, above your cost basis, collecting the premium as income. If the stock rises past the strike, the shares may get "called away" (sold) at that strike — a known, accepted trade-off in exchange for the income.</li>
            <li><strong>Cash-secured puts:</strong> sell a put on a stock you'd genuinely be happy to own at that strike price, while holding enough cash to buy the shares if assigned. This is sometimes used as a way to get paid while waiting to buy a stock at a target price.</li>
            <li><strong>Naked options:</strong> selling calls or puts without an offsetting stock or cash position. This can generate income from options that are unlikely to be reached, but carries much larger risk than the two strategies above and is generally reserved for experienced traders with higher broker approval levels.</li>
          </ul>
          <p>A key operational detail: brokers typically auto-exercise in-the-money options at expiration, so it's important to close or manage a position deliberately rather than simply letting expiration arrive unprepared.</p>
        `,
      },
      {
        id: 'lesson8-8',
        title: 'Risk Management for Options Traders',
        durationMinutes: 5,
        content: `
          <h3>Risk Management for Options Traders</h3>
          <ul>
            <li>Plan every trade before entering, including a loss limit (many traders use something like -25% to -50% of the premium paid) and a preset profit target.</li>
            <li>Limit any single options position to a small fraction of the overall portfolio — a commonly cited guideline is no more than about 5%.</li>
            <li>Favor liquid options with tight bid/ask spreads and healthy open interest so you can exit cleanly.</li>
            <li>Remember that a large share of bought options expire worthless — buy with a specific reason (a technical setup, a known catalyst), not because the premium "looks cheap."</li>
            <li>Keep the calendar in view: earnings dates, ex-dividend dates, and expiration itself can all move an option's value independent of your thesis.</li>
          </ul>
          <div class="bg-red-900/20 border border-red-500/30 rounded-lg p-4 mt-4">
            <p class="text-red-400 text-sm">⚠️ Common pitfalls to avoid: buying deep out-of-the-money "lottery ticket" options, trading on fear or greed rather than a plan, taking naked positions without any hedge, and entering a trade without deciding your exit in advance.</p>
          </div>
        `,
      },
    ],
  },
  {
    id: 'module9',
    title: 'Futures Trading',
    icon: <Boxes className="w-6 h-6 text-cyan-400" />,
    description: 'Standardized contracts on commodities, indexes, and rates — and how margin works.',
    lessons: [
      {
        id: 'lesson9-1',
        title: 'What Futures Contracts Are',
        durationMinutes: 5,
        content: `
          <h3>What Futures Contracts Are</h3>
          <p>A futures contract is a standardized agreement to buy or sell an asset — a commodity, a stock index, a currency, or an interest rate — at a set price on a set future date. Futures originated in the 19th century as a way for farmers and grain buyers to lock in prices ahead of harvest, and that hedging purpose is still core to the market today alongside speculation.</p>
          <h4>Popular Contract Types:</h4>
          <ul>
            <li><strong>Stock index futures</strong> (e.g., on the S&P 500) — deep liquidity and nearly round-the-clock trading.</li>
            <li><strong>Interest-rate futures</strong> (e.g., on government notes).</li>
            <li><strong>Commodity futures</strong> like crude oil and gold — gold in particular is often used as a hedge asset.</li>
          </ul>
          <p>Most futures positions today are closed out or cash-settled well before the contract's expiration — only a very small share actually end in physical delivery of the underlying asset.</p>
        `,
      },
      {
        id: 'lesson9-2',
        title: 'Margin, Settlement, and Contract Codes',
        durationMinutes: 6,
        content: `
          <h3>Margin and Settlement</h3>
          <ul>
            <li><strong>Initial margin:</strong> the deposit required to open a futures position, set by the exchange — a fraction of the contract's full notional value, which is what creates the leverage in futures trading.</li>
            <li><strong>Maintenance margin:</strong> the minimum account balance required to keep the position open. If the account falls below it, a margin call requires depositing more funds the same day, or the broker will liquidate the position.</li>
            <li><strong>Marked to market daily:</strong> gains and losses are settled in the account every trading day, not just when the position is closed.</li>
          </ul>
          <h3>Contract Codes</h3>
          <p>Futures tickers combine a symbol, a month code letter, and a year digit. Contracts typically expire on a quarterly cycle (March, June, September, December), and traders generally focus on the current "nearby" contract for liquidity, rolling into the next one shortly before expiration.</p>
        `,
      },
      {
        id: 'lesson9-3',
        title: 'Micro Futures: Lower Capital, Same Exposure Shape',
        durationMinutes: 5,
        content: `
          <h3>Micro Futures</h3>
          <p>Exchanges have progressively introduced smaller contract sizes to make futures more accessible: a full-size stock index contract, a smaller "E-mini" version, and an even smaller "Micro" version, each representing a fraction of the previous size's dollar-per-point value.</p>
          <h4>Why Beginners Often Start Here:</h4>
          <ul>
            <li>Lower account minimums and much smaller intraday margin requirements than full-size or E-mini contracts.</li>
            <li>Roughly one-tenth the dollar risk per point of the E-mini equivalent, letting a trader learn with real money at a much smaller scale.</li>
            <li>Still tied to the same underlying index or commodity, so the trading logic (support/resistance, trend, indicators) transfers directly to the larger contracts later.</li>
          </ul>
        `,
      },
      {
        id: 'lesson9-4',
        title: 'Building a Futures Trading Plan',
        durationMinutes: 6,
        content: `
          <h3>Building a Futures Trading Plan</h3>
          <ul>
            <li><strong>Pick one instrument</strong> with strong liquidity and volatility, and focus on mastering it before branching out.</li>
            <li><strong>Apply strict capital rules:</strong> commonly cited guidelines include risking only 1-2% of the account per trade and never committing more than roughly 10% of capital to any single position.</li>
            <li><strong>Paper trade first</strong> using a broker's practice account to learn the platform and test a strategy before risking real money — many traders set themselves a target number of winning practice trades before going live.</li>
            <li><strong>Define entries and exits in advance</strong> (for example, buy at support, sell at resistance) and know your realistic win rate versus your reward-to-risk ratio before sizing a trade.</li>
            <li><strong>Treat losses as tuition, not failure</strong> — leveraged instruments like futures are unforgiving of undisciplined position sizing, and even experienced traders describe an early period of costly lessons.</li>
          </ul>
        `,
      },
    ],
  },
  {
    id: 'module10',
    title: 'Day Trading',
    icon: <Zap className="w-6 h-6 text-amber-400" />,
    description: 'Open and close positions within the same session — strategies and the extra risks involved.',
    lessons: [
      {
        id: 'lesson10-1',
        title: 'What Day Trading Is',
        durationMinutes: 5,
        content: `
          <h3>What Day Trading Is</h3>
          <p>Day trading means opening and closing every position within the same trading day — no positions are held overnight. Profit comes purely from intraday price movement, often across multiple trades in a single session.</p>
          <h4>Requirements and Rules:</h4>
          <ul>
            <li>In the US, making four or more day trades within five business days in a margin account triggers the Pattern Day Trader rule, requiring a $25,000 minimum account balance.</li>
            <li>Day trading demands close attention during market hours and constant awareness of scheduled news (interest-rate decisions, earnings, economic data releases) that can move prices sharply within the session.</li>
            <li>A common piece of advice: never trade with money you can't afford to lose, and never trade funds you need for near-term expenses.</li>
          </ul>
          <p>Compared to swing trading, day trading avoids overnight gap risk entirely, but demands far more screen time and typically uses more leverage on an intraday basis.</p>
        `,
      },
      {
        id: 'lesson10-2',
        title: 'Finding Stocks to Trade',
        durationMinutes: 5,
        content: `
          <h3>Finding Stocks to Trade</h3>
          <p>Day traders generally look for "stocks in play" — names with a specific catalyst driving above-average volume and volatility that day, rather than trading everything indiscriminately.</p>
          <h4>Key Concepts:</h4>
          <ul>
            <li><strong>Float:</strong> the number of shares actually available for trading (excluding closely-held insider shares). A low float can produce much more violent price swings on the same amount of buying or selling pressure.</li>
            <li><strong>Market cap:</strong> share price multiplied by shares outstanding — a quick gauge of company size.</li>
            <li><strong>Pre-market gaps:</strong> a stock gapping up on strong pre-market volume often signals demand that persists into the session; a gap down on volume often signals persistent weakness.</li>
            <li><strong>Scanners and watchlists:</strong> most active traders build a short watchlist (often 5-10 names) each day using a scanner for unusual volume, price gaps, or news, rather than searching the whole market manually.</li>
          </ul>
        `,
      },
      {
        id: 'lesson10-3',
        title: 'Popular Day Trading Strategies',
        durationMinutes: 7,
        content: `
          <h3>Popular Day Trading Strategies</h3>
          <ul>
            <li><strong>Opening Range Breakout (ORB):</strong> mark the high and low of the first 30-60 minutes of trading, then trade a break of that range in the breakout direction — the idea being that the opening range often sets the tone for the rest of the day.</li>
            <li><strong>Scalping:</strong> many trades throughout the day on short time frames (often 1-5 minute charts), each targeting a small, quick profit. This style needs discipline and fast execution, and typically caps the profit potential of any single trade in exchange for a high number of opportunities.</li>
            <li><strong>Red-to-green moves:</strong> buying as a stock crosses back above the previous day's closing price, treating that level as a momentum shift and a natural risk reference point.</li>
            <li><strong>Reversal trading:</strong> watching for a shift from higher-highs/higher-lows to lower-highs/lower-lows (or vice versa) on a trendline or moving-average break, and getting out before a strong reversal erases the session's gains.</li>
          </ul>
          <div class="bg-amber-900/20 border border-amber-500/30 rounded-lg p-4 mt-4">
            <p class="text-amber-400 text-sm">💡 Checking the daily chart before trusting an intraday signal helps avoid mistaking normal noise for a real breakout — a move that looks decisive on a 5-minute chart can be a rounding error on the daily one.</p>
          </div>
        `,
      },
      {
        id: 'lesson10-4',
        title: 'Day Trading Risk Management & Workflow',
        durationMinutes: 6,
        content: `
          <h3>Day Trading Risk Management</h3>
          <ul>
            <li><strong>The 1% rule:</strong> risk no more than about 1% of the account on any single trade.</li>
            <li><strong>Set stop-loss and take-profit levels before entering</strong> every single trade.</li>
            <li><strong>Check the expected value:</strong> (profit target × probability of winning) minus (stop-loss size × probability of losing) — only take trades where this comes out positive given a realistic win rate.</li>
          </ul>
          <h3>A Simple Pre-Trade Workflow</h3>
          <ul>
            <li>Build the day's watchlist and note each stock's trigger level, support/resistance, and planned position size and stop.</li>
            <li>Keep a trading journal and review it on a regular schedule (e.g., weekly) to spot recurring mistakes.</li>
            <li>Choose a strategy that fits the day's environment — trending versus range-bound, risk-on versus risk-off — rather than forcing the same setup regardless of conditions.</li>
            <li>Track your maximum drawdown and aim for trades with a healthy reward-to-risk ratio, not just a high win rate.</li>
          </ul>
        `,
      },
    ],
  },
  {
    id: 'module11',
    title: 'Forex for Beginners',
    icon: <Globe className="w-6 h-6 text-indigo-400" />,
    description: 'A deeper look at currency pairs, pips, leverage, and what actually moves currencies.',
    lessons: [
      {
        id: 'lesson11-1',
        title: 'Currency Pairs & Market Structure',
        durationMinutes: 6,
        content: `
          <h3>Currency Pairs & Market Structure</h3>
          <p>Forex trades one currency against another, quoted as base/counter (for example, USD/JPY). Buying USD/JPY means going long the US dollar and short the Japanese yen at the same time — currency value is always relative, so a currency can rise against one counterpart while falling against another.</p>
          <h4>Pair Categories:</h4>
          <ul>
            <li><strong>Majors:</strong> pairs involving the most heavily traded currencies (USD, EUR, JPY, GBP, and others) — the tightest spreads and deepest liquidity.</li>
            <li><strong>Minors/crosses:</strong> pairs between major currencies that don't include the US dollar (e.g., EUR/GBP) — still reasonably liquid.</li>
            <li><strong>Exotics:</strong> pairs involving less-traded currencies — much wider spreads and thinner liquidity, generally best avoided by beginners.</li>
          </ul>
          <h4>Trading Sessions:</h4>
          <p>Activity generally builds through the Asian session, picks up through the European session, and is busiest of all during the overlap between the European and US sessions — that overlap is typically when liquidity and volume peak.</p>
        `,
      },
      {
        id: 'lesson11-2',
        title: 'Quotes, Pips, Lots, and Orders',
        durationMinutes: 6,
        content: `
          <h3>Quotes, Pips, and Lots</h3>
          <ul>
            <li><strong>Bid and ask:</strong> the bid is what you can sell at, the ask is what you can buy at — the gap between them, the spread, is effectively the broker's fee, since most forex brokers don't charge a separate commission.</li>
            <li><strong>Pip:</strong> typically the fourth decimal place in a currency quote (the second decimal for yen pairs) — the standard unit for measuring price movement.</li>
            <li><strong>Lot sizes:</strong> a standard lot is 100,000 units of the base currency; a mini lot is 10,000; a micro lot is 1,000 — smaller lot sizes let beginners trade with much less capital at risk per pip.</li>
          </ul>
          <h3>Order Types</h3>
          <ul>
            <li><strong>Market order:</strong> fills immediately at the current price, with some risk of slippage.</li>
            <li><strong>Limit/pending order:</strong> only fills at a specified price or better.</li>
            <li><strong>Stop-loss and take-profit:</strong> should be set before entering a trade — a widely used guideline is to risk about 1-2% of the account per trade, and to never widen a stop-loss mid-trade "to give it room."</li>
          </ul>
        `,
      },
      {
        id: 'lesson11-3',
        title: 'Leverage & Margin in Forex',
        durationMinutes: 5,
        content: `
          <h3>Leverage & Margin in Forex</h3>
          <p>Forex brokers commonly offer high leverage (in the US, capped at 1:50 for major pairs; higher limits sometimes exist with offshore brokers). Leverage is not a loan you owe afterward — it only exists while a position is open, and a broker will automatically close ("square off") a losing position once losses approach the funds on deposit, known as a margin call.</p>
          <h4>Using Leverage Responsibly:</h4>
          <ul>
            <li>Use tight, sensible stop-losses rather than relying on leverage limits alone to control risk.</li>
            <li>Size positions so they can survive the planned stop-loss distance plus the spread cost, not just the maximum the broker allows.</li>
            <li>Apply the same 1-2% per-trade risk guideline used across other markets.</li>
          </ul>
          <div class="bg-indigo-900/20 border border-indigo-500/30 rounded-lg p-4 mt-4">
            <p class="text-indigo-400 text-sm">⚠️ High leverage cuts both ways — it magnifies gains and losses equally, and a very small adverse move can wipe out a heavily leveraged position quickly.</p>
          </div>
        `,
      },
      {
        id: 'lesson11-4',
        title: 'What Moves Currency Prices',
        durationMinutes: 6,
        content: `
          <h3>What Moves Currency Prices</h3>
          <h4>Demand-Side Factors:</h4>
          <ul>
            <li>GDP growth, net exports, employment data, consumer spending, and durable-goods orders — stronger economic data generally supports a currency.</li>
          </ul>
          <h4>Supply-Side and Policy Factors:</h4>
          <ul>
            <li>Central bank interest-rate decisions — rate hikes tend to attract foreign capital seeking higher yields, supporting the currency; rate cuts or large-scale money creation tend to weaken it.</li>
            <li>Some governments actively manage their currency's value to support export competitiveness.</li>
          </ul>
          <h4>Shocks and Sentiment:</h4>
          <ul>
            <li>Central bank surprise announcements, inflation surprises, large hedging flows tied to trade contracts, shifts between "risk-on" and "risk-off" sentiment, sovereign debt concerns, and geopolitical shocks (wars, pandemics, natural disasters) can all move currencies sharply and quickly.</li>
          </ul>
        `,
      },
      {
        id: 'lesson11-5',
        title: 'Choosing a Broker & Getting Started',
        durationMinutes: 5,
        content: `
          <h3>Choosing a Forex Broker</h3>
          <ul>
            <li><strong>Regulation first:</strong> confirm the broker is regulated by a recognized authority in its jurisdiction. Unregulated offshore brokers carry real risk of simply not returning your funds.</li>
            <li><strong>Watch for red flags:</strong> difficulty withdrawing funds, pressure to "leave funds in" for a bonus, or aggressive marketing of high-risk products like binary options.</li>
            <li><strong>Practical checklist:</strong> tight spreads, a reliable trading platform, fast order execution, and responsive customer support.</li>
          </ul>
          <h3>Using a Demo Account</h3>
          <p>A demo account is a good way to learn a trading platform's mechanics, but virtual money can also create false confidence — traders sometimes take oversized positions or hold losers longer in a demo than they ever would with real money. Practicing with your intended real account size and your real risk rules, even in a demo, gives a more honest preview of how the strategy will actually feel.</p>
        `,
      },
    ],
  },
];

const GLOSSARY_TERMS: GlossaryTerm[] = [
  { term: 'Pip', definition: 'The smallest price movement in a currency pair, usually 0.0001 for most pairs.' },
  { term: 'Leverage', definition: 'Borrowed capital that allows traders to control larger positions with less capital.' },
  { term: 'Spread', definition: 'The difference between the bid (buy) and ask (sell) price of a currency pair.' },
  { term: 'Margin', definition: 'The amount of money required to open and maintain a leveraged position.' },
  { term: 'Stop-Loss', definition: 'A predetermined price at which a trade is closed to limit losses.' },
  { term: 'Take-Profit', definition: 'A predetermined price at which a trade is closed to lock in profits.' },
  { term: 'Bullish', definition: 'A market sentiment where prices are expected to rise.' },
  { term: 'Bearish', definition: 'A market sentiment where prices are expected to fall.' },
  { term: 'RSI', definition: 'Relative Strength Index - measures the speed and change of price movements.' },
  { term: 'MACD', definition: 'Moving Average Convergence Divergence - a trend-following momentum indicator.' },
  { term: 'Support', definition: 'A price level where buying pressure is strong enough to prevent further decline.' },
  { term: 'Resistance', definition: 'A price level where selling pressure is strong enough to prevent further rise.' },
  { term: 'Swing Trading', definition: 'A style of trading that holds positions for days to weeks to capture a medium-term price move.' },
  { term: 'Position Trading', definition: 'A longer-horizon style holding positions for weeks to years, leaning more on fundamentals than technicals.' },
  { term: 'Pattern Day Trader (PDT) Rule', definition: 'A US rule requiring a $25,000 minimum account balance for accounts making 4+ day trades within 5 business days.' },
  { term: 'Dividend Yield', definition: 'Annual dividend per share divided by the current share price, expressed as a percentage.' },
  { term: 'Payout Ratio', definition: 'The share of a company\'s earnings paid out to shareholders as dividends.' },
  { term: 'DRIP', definition: 'Dividend Reinvestment Plan - automatically uses dividend payments to buy more shares.' },
  { term: 'REIT', definition: 'Real Estate Investment Trust - a company that owns real estate and must distribute most of its taxable income as dividends.' },
  { term: 'ADR', definition: 'American Depositary Receipt - a US-listed instrument representing shares of a foreign company.' },
  { term: 'MLP', definition: 'Master Limited Partnership - a publicly traded partnership, common in energy infrastructure, with pass-through taxation.' },
  { term: 'Call Option', definition: 'A contract giving the buyer the right, but not the obligation, to buy a stock at a set price before expiration.' },
  { term: 'Put Option', definition: 'A contract giving the buyer the right, but not the obligation, to sell a stock at a set price before expiration.' },
  { term: 'Premium', definition: 'The price paid to buy an options contract.' },
  { term: 'Strike Price', definition: 'The price at which an option holder can buy (call) or sell (put) the underlying stock.' },
  { term: 'Theta', definition: 'The rate at which an option loses value as time passes (time decay).' },
  { term: 'Delta', definition: 'How much an option\'s price changes for a $1 move in the underlying stock.' },
  { term: 'Vega', definition: 'How much an option\'s price changes for a 1-point move in implied volatility.' },
  { term: 'Implied Volatility', definition: 'The market\'s expectation of how much a stock\'s price will move, which influences option premiums.' },
  { term: 'Covered Call', definition: 'Selling a call option against shares you already own, to collect premium income.' },
  { term: 'Cash-Secured Put', definition: 'Selling a put option while holding enough cash to buy the shares if assigned.' },
  { term: 'Iron Condor', definition: 'An options strategy selling an OTM call and put while buying further OTM options for protection, profiting if price stays in a range.' },
  { term: 'Open Interest', definition: 'The total number of outstanding options or futures contracts at a given strike or expiration.' },
  { term: 'Futures Contract', definition: 'A standardized agreement to buy or sell an asset at a set price on a set future date.' },
  { term: 'Initial Margin', definition: 'The deposit required by an exchange to open a futures position.' },
  { term: 'Maintenance Margin', definition: 'The minimum account balance required to keep a leveraged position open before a margin call is triggered.' },
  { term: 'Margin Call', definition: 'A broker demand for additional funds when an account falls below the required maintenance margin.' },
  { term: 'Micro Futures', definition: 'A smaller-sized version of a standard futures contract, designed for lower capital requirements.' },
  { term: 'Day Trading', definition: 'Opening and closing all trading positions within the same trading day.' },
  { term: 'Opening Range Breakout (ORB)', definition: 'A day-trading strategy based on trading a break of the high/low range set in the first 30-60 minutes of the session.' },
  { term: 'Scalping', definition: 'A high-frequency trading style taking many trades for small, quick profits, usually on very short time frames.' },
  { term: 'Float', definition: 'The number of a company\'s shares actually available for public trading, excluding closely-held insider shares.' },
  { term: 'Lot (Forex)', definition: 'A standardized trade size in forex: standard (100,000 units), mini (10,000), or micro (1,000).' },
];

const Learn: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [expandedModule, setExpandedModule] = useState<string | null>('module1');
  const [expandedLesson, setExpandedLesson] = useState<string | null>(null);
  const [completedLessons, setCompletedLessons] = useState<Set<string>>(new Set());

  const normalizedSearch = searchTerm.trim().toLowerCase();

  // Filter modules AND their lessons together, so searching for a lesson
  // (e.g. "RSI") narrows down to just that lesson instead of showing every
  // lesson in the module it happens to live in.
  const filteredModules = useMemo(() => {
    if (!normalizedSearch) return MODULES;

    return MODULES.map((module) => {
      const moduleTitleMatches = module.title.toLowerCase().includes(normalizedSearch);
      const matchingLessons = module.lessons.filter((lesson) =>
        lesson.title.toLowerCase().includes(normalizedSearch)
      );

      // If the module title itself matches, show all its lessons.
      // Otherwise, show only the lessons that matched.
      const lessonsToShow = moduleTitleMatches ? module.lessons : matchingLessons;

      if (lessonsToShow.length === 0) return null;
      return { ...module, lessons: lessonsToShow };
    }).filter((m): m is Module => m !== null);
  }, [normalizedSearch]);

  const filteredGlossary = useMemo(() => {
    if (!normalizedSearch) return [];
    return GLOSSARY_TERMS.filter(
      (term) =>
        term.term.toLowerCase().includes(normalizedSearch) ||
        term.definition.toLowerCase().includes(normalizedSearch)
    );
  }, [normalizedSearch]);

  const totalLessons = useMemo(
    () => MODULES.reduce((acc, m) => acc + m.lessons.length, 0),
    []
  );
  const totalMinutes = useMemo(
    () => MODULES.reduce((acc, m) => acc + m.lessons.reduce((sum, l) => sum + l.durationMinutes, 0), 0),
    []
  );

  const toggleModule = (moduleId: string) => {
    setExpandedModule(expandedModule === moduleId ? null : moduleId);
    // Collapse any open lesson when switching modules, since expandedLesson
    // is tracked globally rather than per-module.
    setExpandedLesson(null);
  };

  const toggleLesson = (lessonId: string) => {
    const isOpening = expandedLesson !== lessonId;
    setExpandedLesson(isOpening ? lessonId : null);

    // Mark a lesson as completed the first time it's opened.
    if (isOpening) {
      setCompletedLessons((prev) => {
        if (prev.has(lessonId)) return prev;
        const next = new Set(prev);
        next.add(lessonId);
        return next;
      });
    }
  };

  const hasNoResults =
    normalizedSearch.length > 0 && filteredModules.length === 0 && filteredGlossary.length === 0;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-white">Learn & Guide</h1>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search lessons or glossary..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="bg-trade-bg border border-trade-border rounded-lg pl-10 pr-4 py-2 text-white text-sm focus:outline-none focus:border-blue-500 w-64"
          />
        </div>
      </div>

      {/* Progress */}
      <div className="bg-trade-card rounded-xl p-4 border border-trade-border">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-gray-400 text-sm">Total Lessons</p>
            <p className="text-white font-bold text-lg">{totalLessons}</p>
          </div>
          <div>
            <p className="text-gray-400 text-sm">Completed</p>
            <p className="text-white font-bold text-lg">
              {completedLessons.size} / {totalLessons}
            </p>
          </div>
          <div className="text-right">
            <p className="text-gray-400 text-sm">Estimated Time</p>
            <p className="text-white font-bold text-lg">{totalMinutes} min</p>
          </div>
        </div>
      </div>

      {/* No results */}
      {hasNoResults && (
        <div className="bg-trade-card rounded-xl border border-trade-border p-6 text-center">
          <p className="text-gray-400 text-sm">
            No lessons or glossary terms match "{searchTerm}". Try a different keyword.
          </p>
        </div>
      )}

      {/* Modules */}
      <div className="space-y-4">
        {filteredModules.map((module) => (
          <div key={module.id} className="bg-trade-card rounded-xl border border-trade-border overflow-hidden">
            {/* Module Header */}
            <button
              onClick={() => toggleModule(module.id)}
              className="w-full flex items-center justify-between p-4 hover:bg-trade-bg/50 transition"
            >
              <div className="flex items-center gap-3">
                {module.icon}
                <div className="text-left">
                  <h3 className="text-white font-semibold">{module.title}</h3>
                  <p className="text-gray-400 text-sm">{module.description}</p>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <span className="text-gray-400 text-sm">
                  {module.lessons.length} lesson{module.lessons.length === 1 ? '' : 's'}
                </span>
                {expandedModule === module.id ? (
                  <ChevronDown className="w-5 h-5 text-gray-400" />
                ) : (
                  <ChevronRight className="w-5 h-5 text-gray-400" />
                )}
              </div>
            </button>

            {/* Lessons */}
            {expandedModule === module.id && (
              <div className="border-t border-trade-border divide-y divide-trade-border">
                {module.lessons.map((lesson) => {
                  const isCompleted = completedLessons.has(lesson.id);
                  return (
                    <div key={lesson.id}>
                      <button
                        onClick={() => toggleLesson(lesson.id)}
                        className="w-full flex items-center justify-between p-3 hover:bg-trade-bg/30 transition"
                      >
                        <div className="flex items-center gap-3">
                          {isCompleted ? (
                            <CheckCircle2 className="w-4 h-4 text-green-500" />
                          ) : (
                            <div className="w-2 h-2 rounded-full bg-gray-600" />
                          )}
                          <span className="text-gray-300 text-sm">{lesson.title}</span>
                        </div>
                        <div className="flex items-center gap-4">
                          <span className="text-gray-400 text-xs">{lesson.durationMinutes} min</span>
                          {expandedLesson === lesson.id ? (
                            <ChevronDown className="w-4 h-4 text-gray-400" />
                          ) : (
                            <ChevronRight className="w-4 h-4 text-gray-400" />
                          )}
                        </div>
                      </button>

                      {/* Lesson Content */}
                      {expandedLesson === lesson.id && (
                        <div className="px-4 pb-4">
                          <LessonVisual visualId={lesson.visualId} />
                          <div
                            className="prose prose-sm prose-invert max-w-none"
                            dangerouslySetInnerHTML={{ __html: lesson.content }}
                          />
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Glossary */}
      {normalizedSearch && filteredGlossary.length > 0 && (
        <div className="bg-trade-card rounded-xl border border-trade-border p-4">
          <h3 className="text-white font-bold mb-3">Glossary Results</h3>
          <div className="space-y-2">
            {filteredGlossary.map((term) => (
              <div key={term.term} className="border-b border-trade-border last:border-0 pb-2 last:pb-0">
                <p className="text-blue-400 font-medium">{term.term}</p>
                <p className="text-gray-400 text-sm">{term.definition}</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default Learn;