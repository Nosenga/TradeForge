import React, { useState } from 'react';
import { 
  BookOpen, 
  TrendingUp, 
  BarChart3, 
  Shield, 
  Brain,
  Search,
  ChevronDown,
  ChevronRight
} from 'lucide-react';

interface Module {
  id: string;
  title: string;
  icon: React.ReactNode;
  description: string;
  lessons: Lesson[];
}

interface Lesson {
  id: string;
  title: string;
  content: string;
  duration: string;
  completed?: boolean;
}

const Learn: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [expandedModule, setExpandedModule] = useState<string | null>('module1');
  const [expandedLesson, setExpandedLesson] = useState<string | null>(null);

  const modules: Module[] = [
    {
      id: 'module1',
      title: 'Trading Fundamentals',
      icon: <BookOpen className="w-6 h-6 text-blue-400" />,
      description: 'Learn the basics of financial markets and how trading works.',
      lessons: [
        {
          id: 'lesson1-1',
          title: 'What is Forex?',
          duration: '5 min',
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
              <p class="text-blue-400 text-sm">💡 The forex market operates 24 hours a day, 5 days a week.</p>
            </div>
          `
        },
        {
          id: 'lesson1-2',
          title: 'Market Participants',
          duration: '4 min',
          content: `
            <h3>Who Trades in the Forex Market?</h3>
            <ul>
              <li><strong>Central Banks:</strong> Set monetary policy and intervene in markets</li>
              <li><strong>Commercial Banks:</strong> Facilitate international trade and investment</li>
              <li><strong>Hedge Funds:</strong> Speculative trading for profit</li>
              <li><strong>Retail Traders:</strong> Individual traders like you</li>
              <li><strong>Corporations:</strong> Hedge currency risk from international operations</li>
            </ul>
          `
        },
        {
          id: 'lesson1-3',
          title: 'How to Read Price Charts',
          duration: '6 min',
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
          `
        }
      ]
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
          duration: '5 min',
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
          `
        },
        {
          id: 'lesson2-2',
          title: 'Support & Resistance',
          duration: '5 min',
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
              <p class="text-yellow-400 text-sm">⚠️ Support and resistance levels can become weaker after being tested multiple times.</p>
            </div>
          `
        }
      ]
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
          duration: '6 min',
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
          `
        },
        {
          id: 'lesson3-2',
          title: 'MACD - Moving Average Convergence Divergence',
          duration: '6 min',
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
          `
        }
      ]
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
          duration: '5 min',
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
          `
        },
        {
          id: 'lesson4-2',
          title: 'Stop-Loss & Take-Profit',
          duration: '4 min',
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
          `
        }
      ]
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
          duration: '4 min',
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
          `
        },
        {
          id: 'lesson5-2',
          title: 'Trading Journal',
          duration: '5 min',
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
          `
        }
      ]
    }
  ];

  const glossaryTerms = [
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
  ];

  const filteredModules = modules.filter(module =>
    module.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    module.lessons.some(lesson => lesson.title.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const filteredGlossary = glossaryTerms.filter(term =>
    term.term.toLowerCase().includes(searchTerm.toLowerCase()) ||
    term.definition.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const toggleModule = (moduleId: string) => {
    setExpandedModule(expandedModule === moduleId ? null : moduleId);
  };

  const toggleLesson = (lessonId: string) => {
    setExpandedLesson(expandedLesson === lessonId ? null : lessonId);
  };

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
            <p className="text-white font-bold text-lg">
              {modules.reduce((acc, m) => acc + m.lessons.length, 0)}
            </p>
          </div>
          <div className="text-right">
            <p className="text-gray-400 text-sm">Estimated Time</p>
            <p className="text-white font-bold text-lg">
              {modules.reduce((acc, m) => acc + m.lessons.reduce((sum, l) => sum + parseInt(l.duration), 0), 0)} min
            </p>
          </div>
        </div>
      </div>

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
                  {module.lessons.length} lessons
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
                {module.lessons.map((lesson) => (
                  <div key={lesson.id}>
                    <button
                      onClick={() => toggleLesson(lesson.id)}
                      className="w-full flex items-center justify-between p-3 hover:bg-trade-bg/30 transition"
                    >
                      <div className="flex items-center gap-3">
                        <div className={`w-2 h-2 rounded-full ${
                          lesson.completed ? 'bg-green-500' : 'bg-gray-600'
                        }`} />
                        <span className="text-gray-300 text-sm">{lesson.title}</span>
                      </div>
                      <div className="flex items-center gap-4">
                        <span className="text-gray-400 text-xs">{lesson.duration}</span>
                        {expandedLesson === lesson.id ? (
                          <ChevronDown className="w-4 h-4 text-gray-400" />
                        ) : (
                          <ChevronRight className="w-4 h-4 text-gray-400" />
                        )}
                      </div>
                    </button>

                    {/* Lesson Content */}
                    {expandedLesson === lesson.id && (
                      <div 
                        className="px-4 pb-4 prose prose-sm prose-invert max-w-none"
                        dangerouslySetInnerHTML={{ __html: lesson.content }}
                      />
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Glossary */}
      {searchTerm && filteredGlossary.length > 0 && (
        <div className="bg-trade-card rounded-xl border border-trade-border p-4">
          <h3 className="text-white font-bold mb-3">Glossary Results</h3>
          <div className="space-y-2">
            {filteredGlossary.map((term, index) => (
              <div key={index} className="border-b border-trade-border last:border-0 pb-2 last:pb-0">
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