# TradeForge — Task Tracker

## 🎯 Overall Progress

| Phase | Status | Progress |
|-------|--------|----------|
| Phase 1: Foundations | ✅ Done | 100% |
| Phase 2: Trading Core | ✅ Done | 100% |
| Phase 3: Service Integration | ✅ Done | 100% |
| Phase 4: Frontend | ✅ Done | 100% |
| Phase 5: Broker Integration | 🟡 Partial | 40% |
| Phase 6: Bot Deployment | ✅ Done | 95% |
| Phase 7: Content + Polish | 🟡 Partial | 60% |
| Phase 8: Compliance + Monetization | ⬜ Not Started | 0% |

**Legend:** ⬜ Not Started | 🟡 In Progress | ✅ Done | ⚠️ Blocked

---

## ✅ Completed

### Phase 1: Foundations
- [x] PostgreSQL database schema
- [x] Twelve Data API integration
- [x] FastAPI project structure
- [x] JWT authentication

### Phase 2: Trading Core
- [x] 6 technical indicators (RSI, MACD, SMA, EMA, Bollinger, ATR)
- [x] Signal generation engine (voting system)
- [x] 4 pre-built strategies
- [x] Backtesting engine

### Phase 3: Service Integration
- [x] REST API endpoints
- [x] CORS configuration
- [x] API contracts documented

### Phase 4: Frontend
- [x] Login/Register with JWT
- [x] Dashboard with live signals
- [x] TradingView Lightweight Charts
- [x] Strategies library page
- [x] Backtesting UI
- [x] Trading page (bots, positions, paper account)
- [x] Learn section (5 modules)
- [x] Dark + Glass + Bento theme
- [x] Toast notifications
- [x] Loading skeletons
- [x] Market News (Finnhub)
- [x] Market Sessions display

### Phase 5: Broker Integration (Partial)
- [x] MT5 bridge skeleton (WebSocket server)
- [ ] MT5 EA (Expert Advisor)
- [ ] Real broker connection (HFM demo)
- [ ] Order execution via MT5

### Phase 6: Bot Deployment
- [x] Bot CRUD (create/start/stop/delete)
- [x] Bot scheduler (60s loop)
- [x] Position management (SL/TP auto-close)
- [x] P&L tracking
- [x] Paper trading accounts
- [x] Market hours guard
- [x] Equity/margin updates

### Phase 7: Content + Polish (Partial)
- [x] Market News feed
- [x] Market Sessions display
- [ ] Mobile responsive
- [ ] Bot detail page
- [ ] Symbol-specific news

---

## 🐛 Known Issues / TODO

### Critical (Recently Fixed ✅)
- [x] Connection pool exhaustion
- [x] `update_balance` wrong args in bot_scheduler
- [x] Connection scoping in `update_position`
- [x] Market data staleness in `get_or_fetch_market_data`
- [x] JWT secret hardcoded in `auth.py`
- [x] bcrypt downgrade (sha256_crypt → bcrypt)

### Critical (Open 🔴)
- [ ] **`analyze_symbol` bypasses freshness check** — signal generation reads raw DB, never triggers fetch
- [ ] **Rate limit exposure** — need per-symbol-timeframe cooldown for API calls

### Medium (Open 🟡)
- [ ] Wire `strategy_id` to actual strategy logic (currently all bots use same voting)
- [ ] Signals fire on every bar (should only fire on crossings)
- [ ] MT bridge per-client routing (currently broadcasts to all)
- [ ] Move JWT to httpOnly cookie (currently in localStorage)
- [ ] Mobile responsive layout
- [ ] Bot detail page
- [ ] Symbol-specific news

### Low (Open 🟢)
- [ ] Realistic margin formula (currently $100K per lot = 1:1 leverage)
- [ ] Equity curve chart
- [ ] Export trade history
- [ ] `get_latest_price` freshness (may not matter for cache reads)

### Housekeeping
- [x] requirements.txt updated
- [x] Backend startup clean
- [x] Auth verification test