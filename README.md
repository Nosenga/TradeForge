# TradeForge Engine

A comprehensive algorithmic trading platform with market data, technical indicators, strategy backtesting, and automated trading capabilities.

---

## 📋 Table of Contents

- [Features](#features)
- [Tech Stack](#tech-stack)
- [Project Structure](#project-structure)
- [Installation](#installation)
- [Running the Application](#running-the-application)
- [API Endpoints](#api-endpoints)
- [Trading Strategies](#trading-strategies)
- [Backtesting](#backtesting)
- [Screenshots](#screenshots)
- [Next Steps](#next-steps)
- [License](#license)

---

## ✨ Features

### ✅ Phase 1: Data Layer
- **Market Data**: Real-time and historical OHLCV data from Twelve Data API
- **PostgreSQL Database**: Cached market data with freshness checks
- **Symbol Support**: Forex (EURUSD, GBPUSD), Crypto (BTCUSD), and more
- **Data Freshness**: Automatic re-fetching when data becomes stale

### ✅ Phase 2: Strategy Engine
- **6 Technical Indicators**: RSI, MACD, SMA, EMA, Bollinger Bands, ATR
- **Signal Generation**: Voting-based system combining multiple indicators
- **4 Pre-built Strategies**:
  - RSI Oversold/Overbought
  - MACD Crossover
  - Bollinger Bands Breakout
  - SMA Crossover (Golden Cross)
- **Real-time Signals**: BUY/SELL/HOLD with confidence scoring
- **Multi-Symbol Support**: Single and batch signal endpoints

### ✅ Phase 3: Frontend Dashboard
- **User Authentication**: JWT-based login/registration
- **Real-time Dashboard**: Live signals for multiple symbols
- **TradingView Charts**: Interactive candlestick charts with indicators
- **Technical Overlays**: SMA 20, SMA 50, Bollinger Bands
- **Indicator Toggles**: RSI, MACD, Bollinger Bands with overlay panels
- **Strategies Library**: Browse and view strategy details
- **Learn/Guide**: 5 educational modules with interactive lessons
- **Backtesting**: Run strategies on historical data with performance metrics

### ✅ Phase 4: Backtesting Engine
- **Historical Analysis**: Test strategies on past data
- **Performance Metrics**: Win rate, profit factor, max drawdown
- **Equity Curve**: Visual representation of account growth
- **Trade History**: Detailed trade-by-trade breakdown
- **Strategy Comparison**: Compare performance across strategies

---

## 🛠️ Tech Stack

### Backend
| Technology | Purpose |
|------------|---------|
| **Python 3.14+** | Core language |
| **FastAPI** | REST API framework |
| **PostgreSQL** | Database for users, trades, and market data |
| **SQLAlchemy** | ORM for database operations |
| **JWT** | Authentication and authorization |
| **Twelve Data API** | Market data provider |
| **Pandas** | Data manipulation and analysis |
| **NumPy** | Numerical computations |

### Frontend
| Technology | Purpose |
|------------|---------|
| **React 19** | UI framework |
| **TypeScript** | Type-safe JavaScript |
| **Vite** | Build tool and dev server |
| **Tailwind CSS** | Utility-first styling |
| **Lightweight Charts** | Interactive financial charts |
| **Axios** | HTTP client for API calls |
| **React Router DOM** | Client-side routing |

---

## 📂 Project Structure
```
TradeForge/
├── Backend/
│ └── engine/
│ └── src/
│ ├── init.py
│ ├── auth.py # JWT authentication
│ ├── config.py # Environment configuration
│ ├── database.py # PostgreSQL operations
│ ├── indicators.py # Technical indicators
│ ├── main.py # FastAPI application
│ ├── market_data.py # Twelve Data API integration
│ ├── signals.py # Signal generation
│ └── strategies.py # Strategy definitions
├── Frontend/
│ └── src/
│ ├── api/
│ │ ├── client.ts # Axios configuration
│ │ └── indicators.ts # Indicator API client
│ ├── components/
│ │ ├── Layout.tsx # Main layout with navbar
│ │ ├── ProtectedRoute.tsx # Auth guard
│ │ └── IndicatorChart.tsx # Advanced chart component
│ ├── context/
│ │ └── AuthContext.tsx # Authentication state
│ ├── pages/
│ │ ├── Login.tsx
│ │ ├── Register.tsx
│ │ ├── Dashboard.tsx
│ │ ├── Chart.tsx
│ │ ├── Strategies.tsx
│ │ ├── Learn.tsx # Educational content
│ │ └── Backtest.tsx # Backtesting UI
│ ├── App.tsx
│ ├── main.tsx
│ └── index.css
├── docs/
│ ├── decisions.md # Architecture decisions
│ ├── tasks.md # Task tracker
│ ├── learnings.md # Personal learnings
│ ├── bugs.md # Bug tracker
│ └── api-contract.md # API documentation
├── requirements.txt
├── .env.example # Environment variables template
├── .gitignore
└── README.md
```
---

## 🚀 Installation

### Prerequisites

- Python 3.14+
- Node.js 18+
- PostgreSQL 15+

### Backend Setup

```bash
# Clone the repository
git clone https://github.com/yourusername/tradeforge.git
cd tradeforge/Backend/engine

# Create virtual environment
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Set up environment variables
cp .env.example .env
# Edit .env with your API keys and database credentials

# Run migrations (if any)
# Create PostgreSQL database: CREATE DATABASE tradeforge;

# Start the backend server
cd src
python -m uvicorn main:app --reload --port 8000

### Frontend Setup
cd Frontend
npm install
npm run dev

The frontend will run on http://localhost:5173

🔧 Configuration
Environment Variables (.env)
env
# Backend
TWELVE_DATA_API_KEY=your_twelve_data_api_key
DATABASE_URL=postgresql://postgres:password@localhost:5432/tradeforge

# JWT
SECRET_KEY=your_jwt_secret_key
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=1440
📡 API Endpoints
Authentication
Endpoint	Method	Description
/api/v1/auth/register	POST	Register a new user
/api/v1/auth/login	POST	Login and get JWT token
/api/v1/auth/me	GET	Get current user information
/api/v1/auth/protected	GET	Example protected route
Market Data
Endpoint	Method	Description
/api/v1/market-data/{symbol}	GET	Get OHLCV data
/api/v1/market-data/{symbol}/latest	GET	Get latest price
Indicators
Endpoint	Method	Description
/api/v1/indicators/rsi/{symbol}	GET	Get RSI data
/api/v1/indicators/macd/{symbol}	GET	Get MACD data
/api/v1/indicators/bollinger/{symbol}	GET	Get Bollinger Bands
Signals
Endpoint	Method	Description
/api/v1/signals/{symbol}	GET	Get trading signal
/api/v1/signals/multi	GET	Get signals for multiple symbols
Strategies
Endpoint	Method	Description
/api/v1/strategies	GET	List all strategies
Backtesting
Endpoint	Method	Description
/api/v1/backtest	POST	Run backtest on a strategy


📊 Trading Strategies

1. RSI Oversold/Overbought
Entry: Buy when RSI < 30, Sell when RSI > 70

Timeframe: 1h

Win Rate: 62.5%

Indicators: RSI(14)

2. MACD Crossover
Entry: Buy on bullish crossover, Sell on bearish crossover

Timeframe: 4h

Win Rate: 58.3%

Indicators: MACD(12,26,9)

3. Bollinger Bands Breakout
Entry: Buy at lower band, Sell at upper band

Timeframe: 1h

Win Rate: 55.8%

Indicators: BB(20,2)

4. SMA Crossover (Golden Cross)
Entry: Buy when 50 SMA crosses above 200 SMA

Timeframe: 1d

Win Rate: 65.2%

Indicators: SMA(50), SMA(200)

### 📈 Backtesting
Run backtests with:

Select strategy, symbol, timeframe, date range

View performance metrics

Visual equity curve

Trade history with P&L

🖼️ Screenshots
Dashboard
Live signals for multiple symbols with BUY/SELL/HOLD recommendations

Chart Page
Interactive candlestick chart with RSI, MACD, and Bollinger Bands overlays

Strategies Library
Browse and view details of available trading strategies

Backtesting
Run backtests and analyze performance metrics

Learn/Guide
Educational modules for traders

🗺️ Roadmap
☑ Market Data Layer
☑ Technical Indicators
☑ Signal Generation
☑ Strategy Engine
☑ Frontend Dashboard
☑ Backtesting Engine
☑ Authentication
□ Bot Management (Live Trading)
□ Broker Integration (MetaTrader)
□ Custom Strategy Builder
□ Mobile Responsive
□ Cloud Deployment
□ Monetization (Subscriptions)

🤝 Contributing
Fork the repository

Create your feature branch (git checkout -b feature/amazing-feature)

Commit your changes (git commit -m 'Add amazing feature')

Push to the branch (git push origin feature/amazing-feature)

Open a Pull Request

📝 License
Private - Personal Project

🙏 Acknowledgments
Twelve Data for market data API

TradingView for charting library

FastAPI for the backend framework

📞 Contact
Godfrey Nosenga

GitHub: @godfrey

Email: godfreynosenga19@gmail.com

Built with <strong> Money on my mind<strong/> by Godfrey Nosenga