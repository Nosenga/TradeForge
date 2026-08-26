## Road map of TradeForge

┌─────────────────────────────────────────────────────────────────┐
│                    REACT FRONTEND (TypeScript)                  │
│  Dashboard | Charts | Strategies | Learn | Bot Management      │
└─────────────────────────────┬───────────────────────────────────┘
                              │ HTTPS / WebSocket
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                    ASP.NET CORE (Thin Gateway)                  │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │  Auth (JWT + Refresh)      │  Billing (Stripe)         │   │
│  │  User Management           │  API Gateway/Proxy        │   │
│  │  Strategy Metadata (read)  │  Bot Config (read/write)  │   │
│  └─────────────────────────────────────────────────────────┘   │
│  ❌ NO signal logic        ❌ NO execution logic               │
│  ❌ NO broker connections  ❌ NO trading decisions            │
└─────────────────────────────┬───────────────────────────────────┘
                              │ REST / gRPC
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                    PYTHON TRADING ENGINE (FastAPI)              │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │  STRATEGY DOMAIN                                       │   │
│  │  - Strategy definitions & parameters                   │   │
│  │  - Signal generation (RSI, MACD, custom)              │   │
│  │  - Backtesting engine                                 │   │
│  └─────────────────────────────────────────────────────────┘   │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │  BOT DOMAIN                                            │   │
│  │  - Bot lifecycle (start/stop/pause)                   │   │
│  │  - State reconciliation on restart                    │   │
│  │  - Idempotent order placement                         │   │
│  │  - Slippage/partial fill handling                     │   │
│  └─────────────────────────────────────────────────────────┘   │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │  BROKER BRIDGE                                         │   │
│  │  - MetaTrader EA Bridge (WebSocket/ZeroMQ)            │   │
│  │  - OR MetaApi SDK integration                         │   │
│  │  - Market data ingestion                              │   │
│  └─────────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────────┘
                              │
          ┌───────────────────┼───────────────────┐
          ▼                   ▼                   ▼
┌─────────────────┐  ┌─────────────────┐  ┌─────────────────┐
│   POSTGRESQL    │  │     REDIS       │  │    BROKER/MT    │
│  - Users        │  │  - Session      │  │  - MetaTrader   │
│  - Strategies   │  │  - Rate Limits  │  │  - OANDA       │
│  - Trades       │  │  - Cache        │  │  - etc.        │
│  - Bots         │  │  - Signal cache │  │                 │
│  - Signals      │  │                 │  │                 │
└─────────────────┘  └─────────────────┘  └─────────────────┘