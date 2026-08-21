# TradeForge — Task Tracker

> **Purpose:** Track what you're working on, what's done, and what's next.

---

## 🎯 Overall Progress

| Phase | Status | Weeks | Progress |
|-------|--------|-------|----------|
| Phase 1: Foundations | 🟡 In Progress | 1-2 | 0% |
| Phase 2: Trading Core | ⬜ Not Started | 3-5 | 0% |
| Phase 3: Service Integration | ⬜ Not Started | 5-6 | 0% |
| Phase 4: Frontend | ⬜ Not Started | 6-9 | 0% |
| Phase 5: Broker Integration | ⬜ Not Started | 9-12 | 0% |
| Phase 6: Bot Deployment | ⬜ Not Started | 12-14 | 0% |
| Phase 7: Content + Polish | ⬜ Not Started | 14-16 | 0% |
| Phase 8: Compliance + Monetization | ⬜ Not Started | 16-18 | 0% |

**Legend:** ⬜ Not Started | 🟡 In Progress | ✅ Done | ⚠️ Blocked

---

## 📋 Phase 1: Foundations (Weeks 1-2)

### Week 1: Project Setup & Market Data

#### ✅ Done
- [x] Created GitHub repository
- [x] Created docs folder with tracking files
- [x] (Add completed tasks here)

#### 🟡 In Progress
- [ ] Set up Python project with FastAPI
- [ ] Install dependencies: fastapi, uvicorn, pandas, requests, psycopg2-binary
- [ ] Create `.env` file with API keys (Twelve Data)
- [ ] Write `market_data.py` service
- [ ] Test market data retrieval (EUR/USD, BTC/USD)

#### ⬜ Not Started
- [ ] Set up PostgreSQL locally (or Supabase/Neon.tech)
- [ ] Create database `tradeforge`
- [ ] Run schema SQL (users, strategies, user_bots, trades, market_data)
- [ ] Write Python DB connection helper
- [ ] Store market data in PostgreSQL on fetch

---

### Week 2: Service Skeletons

#### ⬜ Not Started
- [ ] ASP.NET Core solution setup
- [ ] Create `TradeForge.Api` project
- [ ] Install NuGet packages (EF Core, Npgsql, JWT)
- [ ] Create `AppDbContext` with connection string
- [ ] JWT authentication (Register/Login)
- [ ] JWT token generation service
- [ ] Password hashing (BCrypt)
- [ ] FastAPI health check endpoint
- [ ] FastAPI DB connection test
- [ ] FastAPI market data endpoint (`/api/v1/market-data/{symbol}`)
- [ ] Dev/paper trading account set up (OANDA demo or similar)

---

## 📋 Phase 2: Trading Core (Weeks 3-5)

#### ⬜ Not Started

### Indicator Library
- [ ] RSI (Relative Strength Index)
- [ ] MACD (Moving Average Convergence Divergence)
- [ ] Simple Moving Average (SMA)
- [ ] Exponential Moving Average (EMA)
- [ ] Bollinger Bands
- [ ] ATR (Average True Range)

### Strategy Definition
- [ ] Define JSONB schema for entry/exit/risk rules
- [ ] Create 3-5 reference strategies (hardcoded):
  - [ ] RSI Oversold/Overbought
  - [ ] MACD Crossover
  - [ ] Bollinger Bands Breakout
  - [ ] Moving Average Crossover
  - [ ] Breakout Strategy

### Signal Generation
- [ ] Signal engine that evaluates data against strategy rules
- [ ] Confidence scoring for signals
- [ ] Signal persistence to PostgreSQL

### Backtesting
- [ ] Backtesting engine
- [ ] P&L calculation
- [ ] Win rate calculation
- [ ] Drawdown calculation
- [ ] Equity curve generation

### Paper Trading
- [ ] Paper trading order simulation
- [ ] Order fill simulation (with slippage)
- [ ] Paper trade history

### Tests
- [ ] Unit tests for indicators
- [ ] Validation tests against known data

---

## 📋 Phase 3: Service Integration (Weeks 5-6)

#### ⬜ Not Started
- [ ] Finalize ASP.NET ↔ Python API contract
- [ ] Create shared DTOs
- [ ] Implement Python REST endpoints
- [ ] Implement ASP.NET proxy calls to Python
- [ ] Strategies API (`/api/strategies`)
- [ ] Bot config API (`/api/bots`)
- [ ] Live data path (WebSocket/gRPC)
- [ ] API documentation (Swagger/OpenAPI)

---

## 📋 Phase 4: Frontend (Weeks 6-9)

#### ⬜ Not Started
- [ ] React project setup (Vite + TypeScript)
- [ ] Routing (React Router)
- [ ] Auth flow (Login/Register)
- [ ] Dashboard layout
- [ ] Strategies library UI
- [ ] TradingView Lightweight Charts integration
- [ ] Chart indicators
- [ ] Backtest results display
- [ ] Bot management UI
- [ ] Billing UI (Stripe)

---

## 📋 Phase 5: Broker Integration (Weeks 9-12)

#### ⬜ Not Started
- [ ] Choose MetaTrader bridge approach (ZeroMQ/WebSocket vs MetaApi)
- [ ] Build EA (MQL4/MQL5) for communication
- [ ] Idempotent order placement
- [ ] State reconciliation
- [ ] Slippage/partial fill handling
- [ ] Reconnect/failure handling
- [ ] End-to-end paper trading validation

---

## 📋 Phase 6: Bot Deployment (Weeks 12-14)

#### ⬜ Not Started
- [ ] Bot lifecycle service (start/stop/pause)
- [ ] Parameter editing without redeploy
- [ ] Error monitoring & alerting
- [ ] Admin visibility (bot health dashboard)
- [ ] Extended paper-mode soak test

---

## 📋 Phase 7: Content + Polish (Weeks 14-16)

#### ⬜ Not Started
- [ ] Trading fundamentals module
- [ ] Technical analysis module
- [ ] Indicators & strategies module
- [ ] Risk management module
- [ ] Trading psychology module
- [ ] Glossary
- [ ] Onboarding flow

---

## 📋 Phase 8: Compliance + Monetization (Weeks 16-18)

#### ⬜ Not Started
- [ ] Legal review (ToS, disclaimers)
- [ ] FSCA/SEC/FCA compliance check
- [ ] Stripe integration
- [ ] Subscription tiers
- [ ] Feature gating
- [ ] Downloadable EA packaging (optional)

---

## 🐛 Known Bugs & Issues
*(Add bugs here as you find them)*

---

## 🚧 Blockers
*(Add anything blocking progress here)*