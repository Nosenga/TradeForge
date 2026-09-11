# TradeForge

A full-stack algorithmic trading platform with automated bots, real-time signals, backtesting, and cloud-ready deployment. Built from scratch with Python (FastAPI), React (TypeScript), and PostgreSQL (Supabase).

![Status](https://img.shields.io/badge/status-active-brightgreen)
![Python](https://img.shields.io/badge/python-3.14-blue)
![React](https://img.shields.io/badge/react-19-blue)
![License](https://img.shields.io/badge/license-private-red)

---

## 📋 Table of Contents

- [What is TradeForge?](#what-is-tradeforge)
- [Features](#features)
- [Tech Stack](#tech-stack)
- [Architecture](#architecture)
- [Project Structure](#project-structure)
- [Getting Started](#getting-started)
- [Environment Variables](#environment-variables)
- [API Endpoints](#api-endpoints)
- [Trading Strategies](#trading-strategies)
- [How the Bot Works](#how-the-bot-works)
- [Roadmap](#roadmap)
- [Screenshots](#screenshots)
- [Contributing](#contributing)

---

## 🎯 What is TradeForge?

TradeForge is a complete, self-hosted algorithmic trading platform that:

- **Fetches** live market data from Twelve Data API
- **Analyzes** price action with 6 technical indicators (RSI, MACD, SMA, EMA, Bollinger Bands, ATR)
- **Generates** BUY/SELL/HOLD signals with confidence scoring
- **Backtests** strategies on historical data
- **Runs** automated trading bots that execute orders and manage positions
- **Manages** positions with automatic stop-loss and take-profit
- **Tracks** P&L in real-time
- **Stores** everything in a Supabase cloud PostgreSQL database

Built for traders who want full control over their automation without paying monthly SaaS fees.

---

## ✨ Features

### 📊 Market Data
- **Live OHLCV** from Twelve Data API
- **Multi-timeframe** support (1h, 4h, 1d)
- **Multi-symbol** support (EURUSD, GBPUSD, BTCUSD)
- **Smart caching** in PostgreSQL with freshness checks
- **Automatic retries** on connection failures

### 📈 Technical Analysis
- **6 built-in indicators**:
  - RSI (Relative Strength Index)
  - MACD (Moving Average Convergence Divergence)
  - SMA (Simple Moving Average)
  - EMA (Exponential Moving Average)
  - Bollinger Bands
  - ATR (Average True Range)
- **Voting-based signal generation** with weighted confidence scoring

### 🎯 Trading Strategies
- **4 pre-built strategies**:
  - RSI Oversold/Overbought
  - MACD Crossover
  - Bollinger Bands Breakout
  - SMA Crossover (Golden Cross)
- **Configurable parameters** per bot (lot size, SL/TP pips, min confidence)

### 🤖 Automated Trading Bots
- **Create multiple bots** with different strategies/symbols
- **Start/Stop/Delete** bots from the UI
- **Auto-execute** trades when signals fire
- **Position management** with automatic SL/TP checks every 60 seconds
- **Persistence** across server restarts
- **Real-time P&L** calculation

### 💼 Position Management
- **Live P&L tracking** updated every 60 seconds
- **Auto-close** on stop-loss or take-profit hit
- **Manual close** button per position
- **Bulk cleanup** to close all positions

### 📉 Backtesting
- **Historical backtest** with any strategy + symbol + timeframe
- **Performance metrics**: total return, win rate, profit factor, max drawdown
- **Equity curve** visualization
- **Trade-by-trade history**

### 📚 Learn Section
- **5 educational modules** covering trading fundamentals
- **Interactive lessons** with searchable content
- **Glossary** of trading terms

### 🔐 Authentication
- **JWT-based** login/registration
- **Protected routes** for authenticated users
- **Bcrypt** password hashing (switched to sha256_crypt for Python 3.14 compat)

### 🎨 Modern UI
- **Dark theme** with glass-morphism cards
- **Bento grid** layouts
- **Gradient buttons** with glow effects
- **Toast notifications** for all actions
- **Loading skeletons** for smooth UX
- **Responsive** layout (desktop-optimized)

---

## 🛠️ Tech Stack

### Backend
| Technology | Purpose |
|------------|---------|
| **Python 3.14** | Core language |
| **FastAPI** | REST API framework |
| **PostgreSQL (Supabase)** | Cloud database |
| **psycopg2** | PostgreSQL driver with connection pooling |
| **Pandas / NumPy** | Data manipulation and calculations |
| **python-jose** | JWT tokens |
| **passlib** | Password hashing |
| **Twelve Data API** | Market data provider |

### Frontend
| Technology | Purpose |
|------------|---------|
| **React 19** | UI framework |
| **TypeScript** | Type-safe JavaScript |
| **Vite** | Build tool and dev server |
| **Tailwind CSS** | Utility-first styling |
| **Lightweight Charts** | TradingView charting library |
| **React Router DOM** | Client-side routing |
| **Axios** | HTTP client |
| **react-hot-toast** | Toast notifications |
| **lucide-react** | Icon library |

---

## 🏗️ Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│ REACT FRONTEND (TypeScript) │
│ Dashboard | Charts | Strategies | Backtest | Trading | Learn │
└─────────────────────────────┬───────────────────────────────────┘
│ HTTPS + JWT
▼
┌─────────────────────────────────────────────────────────────────┐
│ PYTHON FASTAPI BACKEND │
│ │
│ ┌─────────────┐ ┌──────────────┐ ┌───────────────────────┐ │
│ │ Auth │ │ Market Data │ │ Signal Generator │ │
│ │ (JWT) │ │ (12 Data) │ │ (RSI/MACD/BB/SMA) │ │
│ └─────────────┘ └──────────────┘ └───────────────────────┘ │
│ │
│ ┌─────────────┐ ┌──────────────┐ ┌───────────────────────┐ │
│ │ Order Mgmt │ │ Position │ │ Bot Scheduler │ │
│ │ (Orders) │ │ Manager │ │ (60s loop) │ │
│ └─────────────┘ └──────────────┘ └───────────────────────┘ │
│ │
│ ┌─────────────────────────────────────────────────────────┐ │
│ │ Backtesting Engine │ │
│ └─────────────────────────────────────────────────────────┘ │
└─────────────────────────────┬───────────────────────────────────┘
│
┌───────────────┼───────────────┐
▼ ▼ ▼
┌────────────┐ ┌────────────┐ ┌────────────┐
│ Supabase │ │ Twelve Data│ │ (Future) │
│ PostgreSQL │ │ API │ │ MetaTrader │
└────────────┘ └────────────┘ └────────────┘

```

---

## 📂 Project Structure

```
TradeForge/
├── Backend/
│ └── engine/
│ └── src/
│ ├── init.py
│ ├── auth.py # JWT auth, password hashing
│ ├── bot_scheduler.py # Bot loop, position management
│ ├── config.py # Environment configuration
│ ├── database.py # PostgreSQL operations, pool
│ ├── indicators.py # 6 technical indicators
│ ├── main.py # FastAPI app + endpoints
│ ├── market_data.py # Twelve Data integration
│ ├── orders.py # OrderManager, Position models
│ ├── signals.py # Signal generation
│ └── strategies.py # Strategy engine
│
├── Frontend/
│ └── src/
│ ├── api/
│ │ ├── client.ts # Axios config + endpoints
│ │ └── indicators.ts # Indicator API client
│ ├── components/
│ │ ├── Layout.tsx # Navbar + outlet
│ │ ├── ProtectedRoute.tsx # Auth guard
│ │ ├── IndicatorChart.tsx # Advanced chart
│ │ └── Skeleton.tsx # Loading skeletons
│ ├── context/
│ │ └── AuthContext.tsx # Auth state
│ ├── pages/
│ │ ├── Login.tsx
│ │ ├── Register.tsx
│ │ ├── Dashboard.tsx
│ │ ├── Chart.tsx
│ │ ├── Strategies.tsx
│ │ ├── Backtest.tsx
│ │ ├── Trading.tsx # Bot + position management
│ │ └── Learn.tsx
│ ├── App.tsx
│ ├── main.tsx
│ └── index.css # Global styles + utilities
│
├── docs/
│ ├── decisions.md # Architecture decisions
│ ├── tasks.md # Task tracker
│ ├── learnings.md # Personal learnings
│ ├── bugs.md # Bug tracker
│ └── api-contract.md # API documentation
│
├── requirements.txt
├── .env.example
├── .gitignore
└── README.md
```

---

## 🚀 Getting Started

### Prerequisites

- **Python 3.14+**
- **Node.js 18+**
- **PostgreSQL 15+** (or a Supabase account)
- **Twelve Data API key** (free tier: https://twelvedata.com)

### Backend Setup

```bash
# Clone the repo
git clone https://github.com/yourusername/tradeforge.git
cd tradeforge/Backend/engine

# Create virtual environment
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Set up environment variables
cp .env.example .env
# Edit .env with your API keys and database URL

# Start the backend
cd src
python -m uvicorn main:app --reload --port 8000
```
# Frontend Setup

```bash
cd Frontend

# Install dependencies
npm install

# Start the dev server
npm run dev
```
Frontend will be available at https://localhost:5173

---

## 🔧 Environment Variables

### Backend/engine/src/.env


**Twelve Data API** 
TWELVE_DATA_API_KEY=your_api_key_here

**PostgreSQL (Supabase)**
DATABASE_URL=postgresql://postgres.xxxx:password@aws-0-region.pooler.supabase.com:5432/postgres

**JWT (optional, has default)**
SECRET_KEY=your_jwt_secret_key

### Frontend/ .env

```
VITE_API_URL=http://localhost:8000
```

---

## 📡API Endpoints

### Authetication

|Method|Endpoint|Description|
|------|--------|-----------|
|POST|/api/v1/auth/register|Register a new user|
|POST|/api/v1/auth/login|Login and get JWT token|
|GET|/api/v1/auth/me|Get current user info|

### Market Data

|Method|Endpoint|Description|
|------|--------|-----------|
|GET|/api/v1/market-data/{symbol}?interval=1h&limit=100|Get OHLCV candles|
|GET|/api/v1/market-data/{symbol}/latest|Get latest price|

### Indicators

|Method|Endpoint|Description|
|------|--------|-----------|
|GET|/api/v1/indicators/rsi/{symbol}?interval=1h&period=14|RSI values|
|GET|/api/v1/indicators/macd/{symbol}?interval=1h|MACD values|
|GET|/api/v1/indicators/bollinger/{symbol}?interval=1h|Bollinger Bands|

### Signals

|Method|Endpoint|Description|
|------|--------|-----------|
|GET|/api/v1/signals/{symbol}?timeframe=1h|Signal for one symbol|
|GET|/api/v1/signals/multi?symbols=EURUSD,GBPUSD&timeframe=1h|Multiple signals|

### Strategies & Backtesting

|Method|Endpoint|Description|
|------|--------|-----------|
|GET|/api/v1/strategies|List all strategies|
|POST|/api/v1/backtest|Run a backtest|

### Trading

|Method|Endpoint|Description|
|------|--------|-----------|
|POST|/api/v1/trade/order|Place a manual order|
|GET|/api/v1/trade/orders|Get order history|
|GET|/api/v1/trade/positions|Get open positions|
|POST|/api/v1/trade/close/{position_id}|Close a position|
|POST|/api/v1/trade/cleanup|Close all positions|

### Bots

|Method|Endpoint|Description|
|------|--------|-----------|
|POST|/api/v1/bots/create|Create a new bot|
|GET|/api/v1/bots|List all user bots|
|POST|/api/v1/bots/{bot_id}/start|Start a bot|
|POST|/api/v1/bots/{bot_id}/stop|Stop a bot|
|DELETE|/api/v1/bots/{bot_id}|Delete a bot|

Interactive docs: ```https://localhost:8000/docs```

---

## 📈 Trading Strategies

### 1. RSI Oversold/Overbought
- Entry: Buy when RSI < 30, Sell when RSI > 70
- Best timeframe: 1h
- Historical win rate: ~62%

### 2. MACD Crossover
- Entry: Buy on bullish crossover, Sell on bearish crossover
- Best timeframe: 4h
- Historical win rate: ~58%

### 3. Bollinger Bands Breakout
- Entry: Buy at lower band touch, Sell at upper band touch
- Best timeframe: 1h
- Historical win rate: ~56%

### 4. SMA Crossover (Golden Cross)
- Entry: Buy when 50 SMA crosses above 200 SMA
- Best timeframe: 1d
- Historical win rate: ~65%

---
## 🤖 How the Bot Works

### The Scheduler Loop (every 60 seconds)

```
┌──────────────────────────────────────────────────────────┐
│                                                          │
│  1. For each RUNNING bot:                                │
│                                                          │
│  2. MANAGE OPEN POSITIONS                                │
│     - Get current price for each open position           │
│     - Update P&L in database                             │
│     - Check if SL or TP hit                              │
│     - Close position if hit                              │
│                                                          │
│  3. CHECK FOR NEW SIGNALS                                │
│     - Analyze symbol with strategy indicators            │
│     - If action = BUY/SELL and confidence >= threshold:  │
│       - Skip if position already open for this symbol    │
│       - Calculate SL and TP based on pips                │
│       - Place market order                               │
│                                                          │
│  4. SLEEP 60 SECONDS                                     │
│                                                          │
└──────────────────────────────────────────────────────────┘
```
### Position Lifecycle

```
1. Signal fires (BUY EURUSD)
   ↓
2. Bot places order
   ↓
3. Order FILLED → Position OPENED
   - Entry price recorded
   - SL and TP set (bot's pips)
   - P&L starts at $0.00
   ↓
4. Every 60s:
   - Current price updated
   - P&L recalculated
   - SL/TP checked
   ↓
5. SL or TP hit → Position CLOSED
   - Exit price recorded
   - Final P&L logged
   - Removed from open positions
```
---

## 🗺️ Roadmap

[x] Phase 1: Data Layer — Market data + caching
[x] Phase 2: Indicators & Signals — 6 indicators + voting engine
[x] Phase 3: Authentication — JWT login/registration
[x] Phase 4: Frontend Dashboard — React + TradingView charts
[x] Phase 5: Backtesting Engine — Test strategies historically
[x] Phase 6: Order Management — Place/close orders
[x] Phase 7: Bot Scheduler — Automated trading loop
[x] Phase 8: Position Management — SL/TP auto-close + P&L
[x] Phase 9: Supabase Migration — Cloud database
[x] Phase 10: UI Overhaul — Dark + Glass + Bento theme
[] Phase 11: MetaTrader Bridge — Real broker execution (XM, HFM, IC Markets)
[] Phase 12: Notifications — Email/push alerts
[] Phase 13: Mobile Responsive — Phone-friendly UI
[] Phase 14: Custom Strategy Builder — User-created strategies
[] Phase 15: Deployment — AWS/DigitalOcean production

---
## 🖼️ Screenshots

### Dashboard
*Live signals for EURUSD, GBPUSD, BTCUSD with confidence scoring*

### Trading
*Bot management, open positions with P&L, manual trade form, order history*

### Charts
*Interactive candlestick chart with RSI, MACD, and Bollinger Bands overlays*

### Strategies
*Browse all 4 strategies with win rate, timeframe, and indicators*

### Backtesting
*Run backtests with equity curve and trade-by-trade history*

### Learn
*5 educational modules covering trading fundamentals*

---
## 🔒 Security Notes

- .env is gitignored — API keys and DB URLs never committed
- JWT tokens expire after 24 hours
- Bcrypt/sha256_crypt password hashing
- Parameterized SQL queries prevent injection
- CORS restricted to localhost during dev

---
## 🤝 Contributing

This is a personal project, but suggestions are welcome. Open an issue if you spot a bug or have an idea.

---
## 📝 License

Private - Personal Project

---
## 🙏 Acknowledgments

- Twelve Data — Free market data API
- TradingView — Lightweight Charts library
- Supabase — Free PostgreSQL hosting
- FastAPI — Modern Python backend
- Vite — Fast frontend tooling

---
### Built because I am way to lazy to be physically analyzing the market all the GAWD DAMN TIME ✌️🫩 by Godfrey Nosenga

**Last Updated**: 2026-09-11