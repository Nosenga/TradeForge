# TradeForge — Architecture Decision Log

> **Purpose:** Record important architectural decisions, their context, and rationale. This prevents "why did we do this?" confusion later.

---

## Decision: Service Ownership

**Date:** 2026-08-21  
**Status:** ✅ Accepted

**Context:** We need to decide which service owns trading domain logic (strategies, signals, bots, execution).

**Decision:** Python owns the entire trading domain end-to-end. ASP.NET Core is a thin gateway handling only auth, billing, and read-only views.

**Rationale:**
- Broker connections, order state, and execution failures are the riskiest pieces
- Keeping them in one service reduces sync bugs
- Python has better numerical/indicator libraries (pandas, numpy, TA-Lib)
- ASP.NET Core is better for user management, payments, and serving web APIs

**Implications:**
- Python and ASP.NET communicate via REST/gRPC
- ASP.NET never writes to bot/trade tables — only reads for display
- Python is the single source of truth for trading state

---

## Decision: Market Data Provider

**Date:** 2026-08-21  
**Status:** ⏳ Pending

**Context:** We need live and historical OHLCV data for multiple symbols.

**Options Considered:**
1. Twelve Data — free tier, REST API, good coverage
2. OANDA API — free demo account, real broker data
3. MetaTrader terminal feed — via EA, free but requires MT running
4. Polygon.io — great for stocks/crypto, paid

**Decision:** (To be decided — recommend Twelve Data for development)

**Rationale:**
- (TBD)

**Implications:**
- (TBD)

---

## Decision: Bot Configuration Ownership

**Date:** 2026-08-21  
**Status:** ✅ Accepted

**Context:** Two services (ASP.NET and Python) need to access bot configuration. Who creates/updates it?

**Decision:** Python is the **only** writer of bot lifecycle and parameters. ASP.NET only reads for display.

**Rationale:**
- Bot state is tied to execution — Python must own it
- Prevents race conditions where ASP.NET thinks a bot is running but Python doesn't
- Single source of truth reduces bugs

**Implications:**
- ASP.NET calls Python's API to start/stop bots
- Python persists bot state to PostgreSQL
- ASP.NET displays whatever Python writes

---

## Decision: Live Data Path

**Date:** 2026-08-21  
**Status:** ⏳ Pending

**Context:** How does the frontend receive live signals and bot status updates?

**Options Considered:**
1. Frontend → WebSocket → Python (direct)
2. Frontend → WebSocket → ASP.NET → Redis Pub/Sub → Python

**Decision:** (Pending — recommended: frontend connects directly to Python via WebSocket)

**Rationale:**
- (TBD)

**Implications:**
- (TBD)

---

## Decision: Credential Storage

**Date:** 2026-08-21  
**Status:** ⏳ Pending

**Context:** We need to store broker credentials (account numbers, passwords, API keys) for users.

**Decision:** (To be decided — must be implemented before Phase 5)

**Options Considered:**
1. Azure Key Vault / AWS Secrets Manager
2. Application-level encryption with environment variable key
3. Never store credentials — require user to keep MetaTrader running

**Rationale:**
- (TBD)

**Implications:**
- (TBD)

---

## Decision: Database Choice

**Date:** 2026-08-21  
**Status:** ✅ Accepted

**Context:** We need a primary database for users, trades, bots, and signals.

**Decision:** PostgreSQL

**Rationale:**
- Reliable ACID compliance
- JSONB support for flexible strategy definitions
- Good performance for financial/time-series data
- Open source, widely supported
- We can add TimescaleDB extension later if needed

**Implications:**
- Use JSONB columns for entry_rules, parameters, etc.
- Consider indexing on frequently queried fields (user_id, symbol, timestamp)

---

## Quick Reference: Service Responsibilities

| Responsibility | ASP.NET Core | Python Engine |
|----------------|--------------|---------------|
| User Auth (JWT) | ✅ | ❌ |
| Billing (Stripe) | ✅ | ❌ |
| Strategy Metadata (CRUD) | ✅ | ❌ (reads only) |
| Strategy Logic (Entry/Exit Rules) | ❌ | ✅ |
| Signal Generation | ❌ | ✅ |
| Bot Lifecycle (Start/Stop) | ❌ (calls Python) | ✅ |
| Bot State Persistence | ❌ | ✅ |
| Order Execution | ❌ | ✅ |
| Broker Connections | ❌ | ✅ |
| Market Data Ingestion | ❌ | ✅ |
| Trade History (Display) | ✅ (reads) | ✅ (writes) |
| Admin Dashboard (Bot Health) | ✅ (reads) | ✅ (writes) |