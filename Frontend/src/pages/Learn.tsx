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
  CheckCircle2,
} from 'lucide-react';

interface Lesson {
  id: string;
  title: string;
  /** Duration in whole minutes. Used for both display and the total-time rollup. */
  durationMinutes: number;
  content: string;
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
 * Static content lives outside the component so it isn't re-created (including
 * the JSX icon nodes) on every render. It's also easier to unit test / extend
 * this way, e.g. by moving it into its own content/modules.ts file later.
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
            <p class="text-blue-400 text-sm">💡 The forex market operates 24 hours a day, 5 days a week.</p>
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
    ],
  },
  // --- New modules below: original explanations of swing trading, dividend
  // investing, and options, written from general trading knowledge (not
  // copied from any book or other source). ---
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
          position for a few days to a few weeks, aiming to capture one meaningful "swing" in price.</p>
          <h4>Why Traders Choose It:</h4>
          <ul>
            <li><strong>Less screen time:</strong> You don't need to watch every tick like a day trader.</li>
            <li><strong>Bigger targets per trade:</strong> Holding longer lets a trend develop further.</li>
            <li><strong>Works on daily/4-hour charts:</strong> Easier to analyze than 1-minute charts.</li>
          </ul>
          <h4>Trade-offs:</h4>
          <ul>
            <li>Overnight and weekend risk: news can gap the price against you while markets are closed.</li>
            <li>Requires patience — trades can take time to play out.</li>
          </ul>
        `,
      },
      {
        id: 'lesson6-2',
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
            <li><strong>3. Look for confirmation</strong> — a reversal candlestick pattern, a bounce off support, or an indicator turning back in the trend's direction.</li>
            <li><strong>4. Define risk first</strong> — decide your stop-loss level before you decide your target.</li>
          </ul>
          <div class="bg-teal-900/20 border border-teal-500/30 rounded-lg p-4 mt-4">
            <p class="text-teal-400 text-sm">💡 A pullback in an uptrend is often a better entry than chasing a fresh breakout.</p>
          </div>
        `,
      },
      {
        id: 'lesson6-3',
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
        title: 'How Dividends Work',
        durationMinutes: 5,
        content: `
          <h3>How Dividends Work</h3>
          <p>A dividend is a portion of a company's profit paid out to shareholders, usually in cash,
          on a regular schedule (often quarterly).</p>
          <h4>Key Dates to Know:</h4>
          <ul>
            <li><strong>Declaration date:</strong> The company announces the dividend and amount.</li>
            <li><strong>Ex-dividend date:</strong> You must own the stock before this date to receive the payment.</li>
            <li><strong>Record date:</strong> The company checks its records to see who owns shares.</li>
            <li><strong>Payment date:</strong> The dividend is actually paid out.</li>
          </ul>
          <h4>Dividend Yield:</h4>
          <p>Dividend Yield = Annual Dividend per Share ÷ Share Price. A higher yield isn't
          automatically better — it can also signal a falling stock price or a payout the company
          may struggle to sustain.</p>
        `,
      },
      {
        id: 'lesson7-2',
        title: 'Evaluating a Dividend Stock',
        durationMinutes: 6,
        content: `
          <h3>Evaluating a Dividend Stock</h3>
          <h4>Things to Check Beyond the Yield:</h4>
          <ul>
            <li><strong>Payout ratio:</strong> The share of earnings paid out as dividends. A very high ratio (e.g., near or above 100%) can be a warning sign.</li>
            <li><strong>Dividend growth history:</strong> Has the company raised its dividend consistently over many years?</li>
            <li><strong>Free cash flow:</strong> Can the business actually afford the dividend from cash it generates, not just accounting profit?</li>
            <li><strong>Debt levels:</strong> Heavily indebted companies may cut dividends first during a downturn.</li>
          </ul>
          <div class="bg-yellow-900/20 border border-yellow-500/30 rounded-lg p-4 mt-4">
            <p class="text-yellow-400 text-sm">⚠️ An unusually high yield is often the market pricing in a likely dividend cut — investigate before buying.</p>
          </div>
        `,
      },
      {
        id: 'lesson7-3',
        title: 'Dividend Reinvestment & Compounding',
        durationMinutes: 5,
        content: `
          <h3>Dividend Reinvestment & Compounding</h3>
          <p>Many brokers offer a Dividend Reinvestment Plan (DRIP), which automatically uses your
          dividend payments to buy more shares of the same stock — often with no commission.</p>
          <h4>Why It Matters:</h4>
          <ul>
            <li>Reinvested dividends buy more shares, which then generate their own dividends — compounding over time.</li>
            <li>Long holding periods let compounding do more of the work than short-term price moves.</li>
            <li>Diversifying across sectors reduces the risk that one industry's dividend cuts hurt your whole portfolio.</li>
          </ul>
        `,
      },
    ],
  },
  {
    id: 'module8',
    title: 'Options Trading Crash Course',
    icon: <Layers className="w-6 h-6 text-pink-400" />,
    description: 'Understand calls, puts, and the basic building blocks of options.',
    lessons: [
      {
        id: 'lesson8-1',
        title: 'Calls & Puts Explained',
        durationMinutes: 6,
        content: `
          <h3>Calls & Puts Explained</h3>
          <p>An option is a contract that gives the buyer the right, but not the obligation, to buy
          or sell a stock at a set price (the "strike price") before a set expiration date.</p>
          <h4>The Two Basic Types:</h4>
          <ul>
            <li><strong>Call option:</strong> Gives the buyer the right to <em>buy</em> the stock at the strike price. Bought when you expect the price to rise.</li>
            <li><strong>Put option:</strong> Gives the buyer the right to <em>sell</em> the stock at the strike price. Bought when you expect the price to fall.</li>
          </ul>
          <h4>Key Terms:</h4>
          <ul>
            <li><strong>Premium:</strong> The price paid to buy the option.</li>
            <li><strong>Strike price:</strong> The agreed price for buying/selling the underlying stock.</li>
            <li><strong>Expiration date:</strong> The last day the option can be exercised.</li>
            <li><strong>In the money / out of the money:</strong> Whether exercising the option right now would be profitable or not.</li>
          </ul>
        `,
      },
      {
        id: 'lesson8-2',
        title: 'Why Traders Use Options',
        durationMinutes: 5,
        content: `
          <h3>Why Traders Use Options</h3>
          <ul>
            <li><strong>Leverage:</strong> Control more shares' worth of exposure for a smaller upfront cost than buying stock outright.</li>
            <li><strong>Hedging:</strong> Buying puts against a stock you own can limit downside risk, similar to insurance.</li>
            <li><strong>Income generation:</strong> Selling (writing) options against shares you already own — a "covered call" — can generate extra income.</li>
            <li><strong>Defined risk (when buying):</strong> The most a buyer can lose is the premium paid.</li>
          </ul>
          <div class="bg-pink-900/20 border border-pink-500/30 rounded-lg p-4 mt-4">
            <p class="text-pink-400 text-sm">⚠️ Selling options can carry much larger, sometimes theoretically unlimited, risk compared to buying them — that's a more advanced strategy.</p>
          </div>
        `,
      },
      {
        id: 'lesson8-3',
        title: 'What Moves an Option\'s Price',
        durationMinutes: 6,
        content: `
          <h3>What Moves an Option's Price</h3>
          <p>An option's premium is made up of <strong>intrinsic value</strong> (how far in the money
          it already is) and <strong>time value</strong> (the chance it becomes more profitable before
          expiration). Several factors move that price:</p>
          <ul>
            <li><strong>Underlying price movement:</strong> The most direct driver — calls gain as the stock rises, puts gain as it falls.</li>
            <li><strong>Time decay (theta):</strong> Options lose time value as expiration approaches, all else equal.</li>
            <li><strong>Implied volatility (vega):</strong> Higher expected volatility raises option premiums, since bigger moves are considered more likely.</li>
            <li><strong>Interest rates and dividends:</strong> Smaller effects, but they factor into an option's fair value too.</li>
          </ul>
          <p>These sensitivities are commonly referred to as "the Greeks" (delta, theta, vega, gamma, rho) and are worth studying in depth before trading options with real money.</p>
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
  { term: 'Dividend Yield', definition: 'Annual dividend per share divided by the current share price, expressed as a percentage.' },
  { term: 'Payout Ratio', definition: 'The share of a company\'s earnings paid out to shareholders as dividends.' },
  { term: 'DRIP', definition: 'Dividend Reinvestment Plan - automatically uses dividend payments to buy more shares.' },
  { term: 'Call Option', definition: 'A contract giving the buyer the right, but not the obligation, to buy a stock at a set price before expiration.' },
  { term: 'Put Option', definition: 'A contract giving the buyer the right, but not the obligation, to sell a stock at a set price before expiration.' },
  { term: 'Premium', definition: 'The price paid to buy an options contract.' },
  { term: 'Strike Price', definition: 'The price at which an option holder can buy (call) or sell (put) the underlying stock.' },
  { term: 'Theta', definition: 'The rate at which an option loses value as time passes (time decay).' },
  { term: 'Implied Volatility', definition: 'The market\'s expectation of how much a stock\'s price will move, which influences option premiums.' },
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
                        <div
                          className="px-4 pb-4 prose prose-sm prose-invert max-w-none"
                          dangerouslySetInnerHTML={{ __html: lesson.content }}
                        />
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