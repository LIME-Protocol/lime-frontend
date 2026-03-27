# LIME — Linear Index Market Exchange

> A prediction-market platform for trading contracts on quantitative future outcomes (interest rates, inflation, commodity prices, temperature, and more). Each contract pays between **0¢** and **100¢** based on where an observed value lands inside a defined range at resolution.

---

## Table of Contents

1. [Product Overview](#product-overview)
2. [Architecture](#architecture)
3. [Technology Stack](#technology-stack)
4. [Data Model](#data-model)
5. [Trading Engine](#trading-engine)
6. [Payoff Curves](#payoff-curves)
7. [Market Lifecycle](#market-lifecycle)
8. [Wallet & Deposits](#wallet--deposits)
9. [Blockchain Integration (Solana)](#blockchain-integration-solana)
10. [Authentication & Security](#authentication--security)
11. [Frontend Architecture](#frontend-architecture)
12. [Edge Functions](#edge-functions)
13. [Project Structure](#project-structure)
14. [Development](#development)

---

## Product Overview

LIME lets users create, trade, and settle **linear index contracts** — financial derivatives whose payoff is a continuous function of an observable metric:

| Feature | Description |
|---|---|
| **Contract Type** | Linear, sigmoid, step, convex, or concave payoff |
| **Resolution** | Automated settlement from verified data sources |
| **Order Book** | Central Limit Order Book (CLOB) with price-time priority |
| **Market Creation** | Community-submitted → Admin-approved → Bookbuilding → Active |
| **Settlement** | Transparent, sourced from official data (Fed, BLS, exchanges) |

### Example

> **Market:** _"Fed Funds Rate — Dec 2025"_
> - Range: **3.00% – 5.50%**
> - Current contract price: **62.4¢**
> - Implied value: **3.00 + 0.624 × (5.50 − 3.00) = 4.56%**
> - If the rate settles at **4.25%**, the payoff = **(4.25 − 3.00) / (5.50 − 3.00) × 100 = 50.0¢**

---

## Architecture

```
┌──────────────────────────────────────────────────────────┐
│                    React SPA (Vite)                       │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐ │
│  │  Explore  │  │ Market   │  │ Portfolio│  │  Wallet  │ │
│  │  Page     │  │ Detail   │  │  Page    │  │  Page    │ │
│  └────┬─────┘  └────┬─────┘  └────┬─────┘  └────┬─────┘ │
│       │              │              │              │       │
│  ┌────┴──────────────┴──────────────┴──────────────┴────┐ │
│  │              React Query Cache Layer                  │ │
│  └────────────────────────┬─────────────────────────────┘ │
└───────────────────────────┼───────────────────────────────┘
                            │ HTTPS
┌───────────────────────────┼───────────────────────────────┐
│                  Supabase (Lovable Cloud)                  │
│  ┌────────────────────────┴─────────────────────────────┐ │
│  │              PostgREST API + Auth                     │ │
│  └────────────────────────┬─────────────────────────────┘ │
│  ┌────────────────────────┴─────────────────────────────┐ │
│  │        PostgreSQL (RLS, functions, triggers)          │ │
│  │  ┌──────────┐ ┌──────────┐ ┌──────────┐             │ │
│  │  │ markets  │ │ orders   │ │ trades   │  ...         │ │
│  │  └──────────┘ └──────────┘ └──────────┘             │ │
│  └──────────────────────────────────────────────────────┘ │
│  ┌──────────────────────────────────────────────────────┐ │
│  │         Edge Functions (Deno runtime)                 │ │
│  │  ┌──────────────┐                                    │ │
│  │  │ place-order   │ → validates → calls RPC            │ │
│  │  └──────────────┘                                    │ │
│  └──────────────────────────────────────────────────────┘ │
└──────────────────────────────────────────────────────────┘
                            │ Future
┌───────────────────────────┼───────────────────────────────┐
│                   Solana Blockchain                        │
│  ┌──────────────────────────────────────────────────────┐ │
│  │          Anchor Program (escrow + settlement)         │ │
│  │  • USDC SPL collateral vault                          │ │
│  │  • On-chain resolution + payout distribution          │ │
│  └──────────────────────────────────────────────────────┘ │
└──────────────────────────────────────────────────────────┘
```

### Design Decisions

| Decision | Rationale |
|---|---|
| **SQL matching engine** | Simpler to develop, audit, and debug than a custom in-memory engine. The `place_order_and_match` function runs atomically inside a transaction. |
| **Edge functions for order placement** | Service-role access ensures the matching function can update all affected rows (orders, trades, positions) atomically. |
| **Mock + real data hybrid** | During MVP, mock data provides visual richness while real orders flow through the live engine. |
| **Wallet abstraction layer** | `src/services/wallet.ts` defines interfaces (`WalletProvider`, `OnchainCollateral`, `OnchainSettlement`) so Solana can be plugged in without touching UI code. |
| **Row-Level Security everywhere** | Every table uses RLS policies to ensure users can only access their own data (orders, positions, balances, transactions). |

---

## Technology Stack

### Frontend

| Technology | Purpose |
|---|---|
| **React 18** | UI component framework |
| **TypeScript** | Type safety across the entire codebase |
| **Vite** | Fast development server and optimized builds |
| **Tailwind CSS** | Utility-first styling with semantic design tokens |
| **shadcn/ui** | Accessible component primitives (Radix UI) |
| **React Router v6** | Client-side routing |
| **TanStack React Query** | Server state management, caching, and real-time sync |
| **Recharts** | Charts (price history, payoff curves) |
| **Framer Motion** | CSS animations via Tailwind utilities |
| **date-fns** | Date formatting and calculations |
| **Sonner** | Toast notifications |

### Backend (Lovable Cloud / Supabase)

| Technology | Purpose |
|---|---|
| **PostgreSQL** | Primary database with JSONB, enums, functions |
| **PostgREST** | Auto-generated REST API from schema |
| **Row-Level Security** | Data access control at the database level |
| **PL/pgSQL Functions** | Atomic order matching (`place_order_and_match`) |
| **Deno Edge Functions** | Serverless API endpoints (JWT validation, order placement) |
| **Realtime** | WebSocket subscriptions for live comments |
| **Auth** | Email/password authentication with JWT |

### Blockchain (Planned)

| Technology | Purpose |
|---|---|
| **Solana** | Settlement chain for on-chain collateral and payouts |
| **Anchor** | Solana program framework (Rust) |
| **SPL Token (USDC)** | Collateral denomination |
| **@solana/web3.js** | Client-side blockchain interaction |
| **@solana/wallet-adapter** | Phantom, Solflare, Backpack connectivity |

---

## Data Model

### Core Tables

```
markets
├── id (UUID, PK)
├── title, description, category
├── metric_name, unit
├── lower_bound, upper_bound
├── floor_payout (default 0), ceiling_payout (default 1)
├── resolution_date
├── settlement_source, settlement_url
├── current_reference_value (nullable)
├── final_observed_value, final_payout_value (nullable)
├── status (enum: draft → pending → active → resolved | invalidated | cancelled)
├── created_by (UUID → auth.users)
└── created_at, updated_at

orders
├── id (UUID, PK)
├── user_id, market_id (FK → markets)
├── side (enum: buy | sell)
├── order_type (enum: market | limit)
├── price (0–1), quantity
├── filled_quantity, status (enum: open → partial → filled | cancelled)
└── created_at

trades
├── id (UUID, PK)
├── market_id (FK → markets)
├── buy_order_id, sell_order_id (FK → orders)
├── buyer_user_id, seller_user_id
├── price, quantity
└── executed_at

positions
├── id (UUID, PK)
├── user_id, market_id (FK → markets)
├── net_quantity (+long / −short)
├── average_price, estimated_pnl, realized_pnl
├── status (enum: open | closed)
└── updated_at

balances
├── user_id, currency (default 'USD'), amount
└── updated_at

transactions
├── user_id, type (deposit/withdrawal)
├── method (card, wire, pix, crypto_usdc, etc.)
├── amount, currency, status
├── tx_hash (for crypto), metadata (JSONB)
└── created_at

resolutions
├── market_id (FK → markets, unique)
├── observed_value, settlement_source_used
├── resolved_by, resolution_notes
└── resolved_at

comments
├── market_id (FK → markets)
├── user_id, content
└── created_at

profiles
├── id (UUID, FK → auth.users)
├── username, wallet_address
└── created_at

audit_logs
├── actor_type (user | system | admin)
├── actor_id, action (enum)
├── entity_type, entity_id
├── metadata (JSONB)
└── created_at
```

### Enums

- `market_status`: draft, pending, active, resolved, invalidated, cancelled
- `order_side`: buy, sell
- `order_type`: market, limit
- `order_status`: open, partial, filled, cancelled
- `position_status`: open, closed
- `audit_action`: create, update, approve, resolve, invalidate, cancel, trade, order
- `audit_actor_type`: user, system, admin

---

## Trading Engine

The matching engine is implemented as a PostgreSQL function (`place_order_and_match`) that runs inside a single transaction:

```
1. Validate market is active and price is in [0, 1]
2. Insert the incoming order
3. Scan opposite-side resting orders (price-time priority):
   - BUY  → match against SELLs where sell_price ≤ buy_price (lowest first)
   - SELL → match against BUYs where buy_price ≥ sell_price (highest first)
4. For each match:
   a. Create a trade at the resting (maker) price
   b. Update both orders' filled_quantity and status
   c. Upsert both users' positions (net_quantity, average_price)
5. If market order with remaining quantity → cancel remainder
6. Write audit log entry
7. Return: order_id, status, filled quantity, trade count
```

### Key Properties

- **Atomic**: The entire match runs in one transaction — no partial state
- **Price-time priority**: Oldest resting order at the best price matches first
- **No self-matching**: Users cannot trade against their own orders
- **Row-level locking**: `FOR UPDATE SKIP LOCKED` prevents deadlocks

---

## Payoff Curves

LIME supports multiple payoff structures beyond linear:

| Type | Formula | Use Case |
|---|---|---|
| **Linear** | `(V − L) / (U − L)` | Default — uniform sensitivity |
| **Sigmoid** | Logistic curve centered at midpoint | Consensus-concentrated events |
| **Step (Binary)** | 0 below threshold, 1 above | Binary outcome events |
| **Convex** | `t^n` (n > 1) | Tail-risk emphasis |
| **Concave** | `1 − (1−t)^n` | Near-target emphasis |

All payoff calculations are in `src/lib/types.ts` (`calculatePayoff`, `calculateSellPayoff`).

---

## Market Lifecycle

```
  User submits
      │
      ▼
   ┌──────┐     Admin       ┌─────────┐     Min liquidity     ┌────────┐
   │ Draft │ ──approves──▶  │ Pending  │ ──────reached──────▶  │ Active │
   └──────┘                 └─────────┘                        └───┬────┘
                                                                   │
                                                    Resolution date reached
                                                                   │
                                                                   ▼
                                                            ┌──────────┐
                                                            │ Resolved │
                                                            └──────────┘
```

- **Draft** → Created by user, not yet visible
- **Pending** → Awaiting admin review
- **Preliminary** → Approved, in bookbuilding phase (gathering participants)
- **Active** → Open for trading
- **Resolved** → Settlement value confirmed, payoffs calculated
- **Invalidated** → Cancelled by admin (faulty data source, etc.)

---

## Wallet & Deposits

The Wallet page (`/wallet`) supports multiple deposit methods:

| Method | Status | Settlement |
|---|---|---|
| Credit/Debit Card | MVP (simulated) | Instant |
| Bank Wire (ACH/SWIFT) | MVP (simulated) | 1-3 business days |
| PIX (Brazil) | MVP (simulated) | Instant |
| USDC (ERC-20 / Solana) | MVP (simulated) | Near instant |
| Bitcoin | MVP (simulated) | ~30 min |
| Ethereum | MVP (simulated) | ~5 min |

Balances are stored in the `balances` table with RLS. In the future, crypto deposits will be verified on-chain before crediting.

---

## Blockchain Integration (Solana)

### Architecture

The wallet abstraction layer (`src/services/wallet.ts`) defines three interfaces:

1. **`WalletProvider`** — Connect/disconnect wallet, sign messages
2. **`OnchainCollateral`** — Lock/release USDC into escrow
3. **`OnchainSettlement`** — Resolve markets and distribute payouts on-chain

### Planned Solana Program (Anchor)

```
┌─────────────────────────────────────────┐
│           LIME Anchor Program            │
│                                          │
│  initialize_market(market_id, bounds)    │
│  deposit_collateral(market_id, amount)   │
│  withdraw_collateral(market_id, amount)  │
│  resolve_market(market_id, value, proof) │
│  claim_payout(market_id)                 │
│                                          │
│  PDAs:                                   │
│  • Market escrow vault (USDC SPL)        │
│  • Market state (bounds, status, value)  │
│  • User position accounts                │
└─────────────────────────────────────────┘
```

### Integration Path

| Phase | Scope |
|---|---|
| **Phase 1 (Current)** | Mock wallet, off-chain matching, DB-only balances |
| **Phase 2** | Solana wallet connection (Phantom, Solflare), on-chain USDC deposits |
| **Phase 3** | On-chain collateral escrow via Anchor program |
| **Phase 4** | Fully on-chain settlement with oracle-verified resolution |

### Solana Configuration

Default configs for devnet and mainnet are defined in `src/services/wallet.ts`:

```typescript
export const SOLANA_DEFAULTS: Record<string, SolanaConfig> = {
  devnet: {
    network: 'devnet',
    programId: 'LIME_PROGRAM_ID_PLACEHOLDER',
    usdcMint: '4zMMC9srt5Ri5X14GAgXhaHii3GnPAEERYPJgZJDncDU',
    escrowAuthority: 'LIME_ESCROW_PDA_PLACEHOLDER',
  },
};
```

---

## Authentication & Security

- **Email/password auth** with mandatory email verification
- **JWT validation** in Edge Functions using service-role key
- **Row-Level Security** on all tables:
  - Users see only their own orders, positions, balances, transactions
  - Markets, trades, comments, and resolutions are publicly readable
  - Audit logs are readable by authenticated users
- **KYC fields** (country, document type/number) collected at signup for future compliance
- **`profiles` table** stores `wallet_address` for future Solana binding

---

## Frontend Architecture

### Design System

- **Theme**: Lime green primary (`hsl(142, 60%, 42%)`) with dark mode support
- **Fonts**: Inter (body) + JetBrains Mono (data/numbers)
- **Tokens**: All colors defined as CSS custom properties in `index.css`, consumed via Tailwind
- **Semantic colors**: `--positive`, `--negative`, `--warning`, `--info` with soft variants

### Key Components

| Component | Location | Purpose |
|---|---|---|
| `AppLayout` | `components/layout/` | Header, navigation, balance display |
| `MarketCard` | `components/market/` | Card with sparkline, price, status |
| `TradePanel` | `components/market/` | Buy/sell interface with order type toggle |
| `PayoffChart` | `components/market/` | Interactive payoff curve visualization |
| `PriceHistoryChart` | `components/market/` | 90-day price evolution (Recharts) |
| `OrderBookComponent` | `components/market/` | Live order book with depth bars |
| `SimilarMarkets` | `components/market/` | Related markets by category/volume |
| `Comments` | `components/market/` | Real-time discussion (Supabase Realtime) |

### State Management

- **Server state**: TanStack React Query with auto-refetch (5–10s intervals)
- **UI state**: React `useState` (no global store needed)
- **Auth state**: Custom `useAuth` hook wrapping Supabase auth listeners

---

## Edge Functions

### `place-order` (`supabase/functions/place-order/index.ts`)

Handles order placement with:

1. JWT authentication (extracts user from Bearer token)
2. Input validation (side, quantity, price range)
3. Calls `place_order_and_match` RPC with service-role privileges
4. Returns order status, fill info, and trade count

**CORS**: Open (`*`) for development; restrict in production.

---

## Project Structure

```
src/
├── components/
│   ├── layout/          # AppLayout (header + nav)
│   ├── market/          # MarketCard, TradePanel, PayoffChart, etc.
│   ├── shared/          # EmptyState, ErrorState, InfoTip, StatusBadge
│   └── ui/              # shadcn/ui primitives
├── hooks/
│   ├── use-auth.ts      # Auth state + signIn/signUp/signOut
│   ├── use-markets.ts   # Market queries (list, single, trades, orders)
│   ├── use-portfolio.ts # Positions, user orders, user trades
│   ├── use-trading.ts   # Place order mutation
│   ├── use-wallet.ts    # Balances, transactions, deposits
│   └── use-theme.ts     # Dark/light mode toggle
├── integrations/
│   └── supabase/        # Auto-generated client + types
├── lib/
│   ├── types.ts         # Domain types + payoff math + formatters
│   ├── adapters.ts      # DB row → frontend type converters
│   ├── mock-data.ts     # Sample markets, trades, order books
│   └── utils.ts         # Tailwind class merge utility
├── pages/
│   ├── Explore.tsx      # Dashboard with trending, categories, filters
│   ├── MarketDetail.tsx # Full market view with trade panel
│   ├── Portfolio.tsx    # Positions, orders, trade history
│   ├── Wallet.tsx       # Deposits + transaction history
│   ├── Admin.tsx        # Market management + audit trail
│   ├── Bookbuilding.tsx # Preliminary + pending markets
│   ├── Resolved.tsx     # Settled markets archive
│   ├── Auth.tsx         # Login + multi-step signup with KYC
│   └── NotFound.tsx     # 404 page
├── services/
│   └── wallet.ts        # Blockchain abstraction layer
├── index.css            # Design tokens + custom utilities
├── App.tsx              # Router + providers
└── main.tsx             # Entry point

supabase/
├── config.toml          # Project configuration
├── functions/
│   └── place-order/     # Order placement edge function
└── migrations/          # Database schema migrations
```

---

## Development

### Prerequisites

- Node.js 18+
- npm or bun

### Quick Start

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Run tests
npm test

# Build for production
npm run build
```

### Environment Variables

Managed automatically by Lovable Cloud:

| Variable | Description |
|---|---|
| `VITE_SUPABASE_URL` | Backend API endpoint |
| `VITE_SUPABASE_PUBLISHABLE_KEY` | Public anon key for client |
| `VITE_SUPABASE_PROJECT_ID` | Project identifier |

### Key Scripts

| Command | Purpose |
|---|---|
| `npm run dev` | Start Vite dev server |
| `npm run build` | Production build |
| `npm test` | Run Vitest test suite |
| `npm run lint` | ESLint check |

---

## License

Proprietary — All rights reserved.
