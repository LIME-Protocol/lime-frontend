
# Deployment-Readiness Plan

Bring LIME from "MVP working" to "safe to publish". A live security scan flags **4 errors + 3 warnings** that must be fixed before any real money or real users touch the platform. Then we close the operational gaps (settlement, notifications, withdraw, observability).

**Mocks stay intact** — every change is additive or guarded behind a flag. The Explore/Discover synthetic markets, sparklines, and price-history charts continue to work for empty states and demos.

---

## Phase A — Security hardening (BLOCKER for publish)

These come straight from the live scan. Each is a small, isolated migration.

**A.1 Trades table — hide user identities**
- Drop `Anyone can view trades` (currently leaks `buyer_user_id` / `seller_user_id` to the public).
- Keep `Users can view own trades` (already in place).
- Add a public-safe **view** `public_trades` exposing only `market_id, price, quantity, executed_at`. Realtime + `useMarketTradesLive` repointed to this view.

**A.2 Audit logs — scope to owner / admin**
- Replace `Authenticated users can view audit logs` with: `actor_id = auth.uid() OR has_role(auth.uid(),'admin')`.

**A.3 Resolutions — admin-only insert**
- Replace insert policy with: `auth.uid() = resolved_by AND has_role(auth.uid(),'admin')`.

**A.4 Realtime channel ACL**
- Add RLS on `realtime.messages` so users can only subscribe to:
  - `market:{uuid}` topics (public — orderbook + public_trades)
  - `user:{auth.uid()}` topics (private — own orders, balance, notifications)
- Refactor `useOrderBook`, `useMarketTradesLive` to subscribe by `topic = market:{id}`.
- Refactor `useUserBalance` and the new `useNotifications` to subscribe by `topic = user:{uid}`.

**A.5 Profiles — hide wallet_address**
- Either restrict `profiles` SELECT to `authenticated` and add a `public_profiles` view exposing only `id, username`, or drop `wallet_address` from the public columns. Pick the view approach to avoid breaking the comments join.

**A.6 Auth hardening**
- Enable Leaked Password Protection (HIBP) via auth config tool.
- Set OTP expiry to 10 minutes (default is too long).

---

## Phase B — Settlement engine (closes the lifecycle)

**B.1 Schema**
- Add `pending_resolution` value to `market_status` enum.
- Trigger `markets_pending_resolution_trg`: when an active market passes `resolution_date`, flip status to `pending_resolution` (runs on a scheduled poll, not row-level).

**B.2 `settle_market(p_market_id)` SECURITY DEFINER**
- Triggered automatically when a row is inserted in `resolutions` (via `AFTER INSERT` trigger).
- For each open position in the market:
  - Compute payoff = linear interpolation between `floor_payout` and `ceiling_payout` based on `final_observed_value` clamped to `[lower_bound, upper_bound]`.
  - Credit `balances` via `adjust_balance`.
  - Update `positions.realized_pnl`, set `status='closed'`.
- Refund any remaining open orders' reserved balance and mark them `cancelled`.
- Update `markets.status='resolved'`, set `final_payout_value`.
- Wrapped in a single transaction; idempotent (skip if already resolved).

**B.3 `auto-settle` edge function (cron)**
- Runs hourly via `pg_cron` calling the function.
- Promotes overdue markets to `pending_resolution` and emits an admin notification.
- Does NOT auto-resolve — admin still inserts the observed value.

---

## Phase C — Notifications (in-app)

**C.1 Schema**
```sql
notifications(id, user_id, type, title, body, market_id?, read_at, created_at)
```
RLS: owner-only SELECT/UPDATE, system INSERT via SECURITY DEFINER helpers.

**C.2 Triggers**
- `AFTER INSERT ON trades` → notify both `buyer_user_id` and `seller_user_id` ("Order filled").
- `AFTER INSERT ON resolutions` → notify every user with a position in that market ("Market resolved").
- `cancel_order` RPC → notify owner ("Order cancelled, refund issued").

**C.3 UI**
- `useNotifications()` hook (subscribed to `user:{uid}` realtime topic, see A.4).
- `NotificationBell` in Navbar with unread badge + dropdown list + mark-read action.

---

## Phase D — Wallet completion (Withdraw)

**D.1 RPC `request_withdrawal(p_amount, p_currency, p_method, p_destination)`**
- Pessimistic lock on `balances` row.
- Validates amount > 0, ≤ available balance, method whitelisted.
- Debits balance, inserts `transactions(type='withdraw', status='pending')`.

**D.2 Edge function `request-withdrawal`**
- Thin wrapper that auths user and calls the RPC.
- Rate limit: max 3 withdrawal requests / hour / user (in-memory bucket OK for now).

**D.3 UI**
- `src/components/wallet/WithdrawForm.tsx` (method picker: PIX / USDC / BTC / ETH + destination field + amount).
- New "Withdraw" tab in `Wallet.tsx`.
- Admin "Pending Withdrawals" table on `Admin.tsx` with Approve/Reject actions (updates `transactions.status` + refunds balance on reject).
- **Banner** on Wallet page: *"Simulation mode — deposits and withdrawals are not real transactions yet"*.

---

## Phase E — Operational hardening

**E.1 Edge function rate limiting**
- `place-order` and `request-withdrawal`: per-user token bucket using a `rate_limits(user_id, bucket, count, window_start)` table.
  - place-order: 30 req / minute / user.
  - request-withdrawal: 3 req / hour / user.
- Returns `429` with `Retry-After`.

**E.2 Input validation tightening (place-order)**
- Reject orders with `quantity` not whole number ≥ 1.
- Reject `price` outside `[0.01, 0.99]` (prevents wash trades at 0/1).
- Cap `quantity * price` at $10,000 per order (configurable, sanity ceiling for early phase).

**E.3 Frontend resilience**
- Global `<ErrorBoundary>` wrapping each route.
- Toast on every mutation failure with actionable message (we already have this in places — make it consistent).
- Sentry-equivalent: wire `console.error` capture to a `client_errors` table via a tiny edge function (debounced, anonymous user OK).

**E.4 Observability**
- Add `created_at` indexes on `orders(market_id, status, created_at)`, `trades(market_id, executed_at)`, `notifications(user_id, read_at)` — supports the realtime queries at scale.
- Add a lightweight `/admin/health` page reading `cloud_status` style metrics: open orders count, 24h volume, pending withdrawals, pending resolutions.

**E.5 Legal & branding (publish prerequisites)**
- `/terms` and `/privacy` static pages (placeholders the user can edit) linked from footer + auth screens.
- Consent checkbox on signup ("I accept Terms and Privacy").

---

## Phase F — Configuration toggles (mocks preserved)

- `VITE_USE_MOCKS` env flag (default: `true` in dev, `false` recommended for prod).
  - When `false`: hooks return only DB data; mock fallbacks in `useMarketRanges`, `useMarkets`, `MarketDetail` are bypassed.
  - When `true`: current behavior — mocks fill empty DB. **Default stays `true` so you don't lose anything.**
- A `<DemoModeBadge>` shown in the Navbar when `VITE_USE_MOCKS=true` so testers know what's synthetic.

---

## File map

```text
supabase/migrations/
  *_security_hardening.sql        [A.1–A.5] policies + public views
  *_settlement_engine.sql         [B.1–B.2] enum + settle_market + trigger
  *_notifications.sql             [C.1–C.2] table + triggers
  *_withdrawal_rpc.sql            [D.1] request_withdrawal
  *_rate_limits.sql               [E.1] table + helper
  *_indexes_publish.sql           [E.4]

supabase/functions/
  auto-settle/                    [B.3] cron
  request-withdrawal/             [D.2]
  client-error-log/               [E.3] anonymous error sink

src/
  hooks/
    use-notifications.ts          [C.3]
    use-withdraw.ts               [D.3]
    use-pending-withdrawals.ts    [D.3 admin]
  components/
    layout/NotificationBell.tsx   [C.3]
    layout/DemoModeBadge.tsx      [F]
    wallet/WithdrawForm.tsx       [D.3]
    wallet/SimulationBanner.tsx   [D.3]
    admin/PendingWithdrawals.tsx  [D.3]
    shared/ErrorBoundary.tsx      [E.3]
  pages/
    Wallet.tsx                    [MOD] withdraw tab + banner
    Admin.tsx                     [MOD] withdrawals + health
    Terms.tsx, Privacy.tsx        [E.5]
  lib/
    feature-flags.ts              [F] VITE_USE_MOCKS reader
```

---

## Execution order

1. **Phase A** (1 migration + 1 auth config call) — fixes the 4 errors. Required before any further publish.
2. **Phase E.1 + E.2** (rate limit + input tightening) — protects what's already live.
3. **Phase B** (settlement) — closes the lifecycle so resolved markets actually pay out.
4. **Phase C** (notifications) — visible quality-of-life win.
5. **Phase D** (withdraw) — completes the financial loop.
6. **Phase F + E.3–E.5** (flags, error boundary, legal) — final polish before publish.

Each phase is independently shippable and reversible. Mocks remain functional throughout because every new DB-backed hook still falls through to its mock fallback when `VITE_USE_MOCKS=true`.

---

## Open questions (will assume defaults if you don't object)

- **Payments**: keep simulated deposits + withdrawals (banner-flagged) for now. Wire Stripe later when you say go.
- **Custom domain / branded auth emails**: skip — use default `*.lovable.app`. Easy to add later.
- **Sentry vs custom client_errors table**: custom table (no extra dependency); can swap to Sentry later.
