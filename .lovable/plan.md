

Plano para fechar as lacunas críticas do produto, mantendo o código modularizado, seguro e testável. Dividido em 4 fases independentes — cada uma entregável sozinha.

## Visão Geral

```text
Fase 1: Fundação (RBAC + Seeds)         → desbloqueia tudo
Fase 2: Trading real (E2E)              → core do produto
Fase 3: Wallet completa (depósito+saque)→ ciclo financeiro
Fase 4: Lifecycle (settlement+notif)    → automação
```

---

## Fase 1 — Fundação: RBAC + Seeds + Cancel

**1.1 Sistema de Roles (segurança crítica)**
- Migration: enum `app_role ('admin','moderator','user')` + tabela `user_roles(id, user_id, role, unique(user_id, role))` com RLS.
- Função `has_role(_user_id uuid, _role app_role)` SECURITY DEFINER (evita recursão RLS).
- Hook `src/hooks/use-user-role.ts` consultando `user_roles`.
- `src/components/auth/RoleGate.tsx` para proteger rotas.
- `Admin.tsx`: usar `RoleGate` em vez de só checar `user`.
- Bookbuilding: criar mercado vira ação de admin.

**1.2 Seed de `market_ranges` para os 6 mercados DB**
- Inserir 2–3 ranges lineares por mercado real (Fed Funds, CPI, EUR/USD, S&P, Gold, BTC) via insert tool (não migration — é dado).
- Resultado: "Select Range" passa a funcionar em todos os mercados reais.

**1.3 Cancelar ordem aberta**
- Migration: política RLS já permite UPDATE em `orders` próprios — adicionar função `cancel_order(p_order_id uuid)` SECURITY DEFINER que valida `status IN ('open','partial')` e seta `'cancelled'`.
- Hook `useCancelOrder` em `use-trading.ts`.
- Botão "Cancel" em `Portfolio.tsx` na aba Orders quando `status='open'`.

---

## Fase 2 — Trading Real End-to-End

**2.1 Validação de saldo no `place_order_and_match`**
- Atualizar a RPC: antes de inserir order, calcular `cost = quantity * (side='buy' ? price : 1-price)` e validar contra `balances.amount`. Bloquear via lock pessimista (`SELECT ... FOR UPDATE`).
- Debitar saldo no momento da ordem; creditar de volta se cancelada.

**2.2 Conectar UI ao DB real**
- `OrderBookComponent`: novo hook `useOrderBook(marketId)` lendo `orders` agrupadas por preço (apenas `status IN ('open','partial')`).
- `TradeHistory`: novo hook `useMarketTrades(marketId)` com Realtime subscription em `trades`.
- Remover dependência de mock orderbook/trades em `MarketDetail`.
- Habilitar Realtime: `ALTER PUBLICATION supabase_realtime ADD TABLE orders, trades`.

**2.3 Pré-verificação no `TradePanel`**
- Mostrar saldo disponível e desabilitar botão se `cost > balance`.
- Toast claro: "Saldo insuficiente — depositar".

---

## Fase 3 — Wallet Completa

**3.1 Withdraw flow**
- Tabela `transactions` já suporta `type='withdraw'`. Criar:
  - Edge function `request-withdrawal` (valida saldo, cria transaction `pending`, debita balance atomicamente via RPC `request_withdrawal`).
  - UI: `src/components/wallet/WithdrawForm.tsx` com seleção de método (PIX/USDC/BTC/ETH) e campo destino.
- Status manual `approved/rejected` por admin (Fase 1 já protege isso).

**3.2 Honestidade do depósito**
- Manter mock funcional, mas adicionar banner "Modo simulação" no Wallet.
- Stub para integração futura (Stripe/cripto) — placeholder `useDepositProvider` configurável.

---

## Fase 4 — Lifecycle: Settlement + Notificações

**4.1 Settlement automático**
- Edge function `auto-settle` que roda via `pg_cron` a cada hora:
  - Busca markets `status='active' AND resolution_date < now()` sem `final_observed_value`.
  - Marca como `pending_resolution` (novo valor enum) — admin precisa inserir valor.
  - Quando admin resolve: trigger calcula payoff por position usando interpolação linear entre `floor_payout/ceiling_payout` com base em `final_observed_value`, credita balances, marca positions `closed`.

**4.2 Notificações in-app**
- Tabela `notifications(user_id, type, title, body, market_id?, read_at, created_at)` com RLS.
- Triggers DB:
  - Em `trades` insert → notifica buyer + seller.
  - Em `resolutions` insert → notifica todos com position naquele market.
- Hook `useNotifications()` com Realtime + dropdown no Navbar.

---

## Estrutura de Arquivos (novos / modificados)

```text
src/
  hooks/
    use-user-role.ts          [NOVO] role check
    use-order-book.ts         [NOVO] live orderbook
    use-market-trades.ts      [NOVO] live trades  
    use-cancel-order.ts       [NOVO] cancel
    use-withdraw.ts           [NOVO] saque
    use-notifications.ts      [NOVO] notif
    use-trading.ts            [MOD] saldo check
  components/
    auth/RoleGate.tsx         [NOVO]
    wallet/WithdrawForm.tsx   [NOVO]
    layout/NotificationBell.tsx [NOVO]
    market/OrderBookComponent.tsx [MOD] usa hook real
    market/TradeHistory.tsx   [MOD] usa hook real
    market/TradePanel.tsx     [MOD] valida saldo
  pages/
    Admin.tsx                 [MOD] RoleGate
    Portfolio.tsx             [MOD] cancel button
    Wallet.tsx                [MOD] withdraw tab
supabase/
  migrations/                 [NOVAS] roles, cancel_order, notifications, settle
  functions/
    request-withdrawal/       [NOVA]
    auto-settle/              [NOVA]
```

---

## Princípios de Modularidade

- **Toda lógica financeira em RPCs SECURITY DEFINER** (saldo, cancel, settle) — RLS sozinho não basta para invariantes multi-tabela.
- **Hooks atômicos**: 1 hook = 1 responsabilidade (no `use-trading.ts` mega).
- **RoleGate componível**: `<RoleGate role="admin">...</RoleGate>` em vez de checks ad-hoc.
- **Realtime opt-in** por componente, não global.
- **Sem mocks em paths críticos**: orderbook, trades, ranges sempre do DB.

---

## Ordem de Execução Recomendada

Sugiro implementar **Fase 1 inteira primeiro** (3 entregas pequenas e independentes) — desbloqueia segurança e os ranges aparecem imediatamente. Depois **Fase 2** que é o coração. Fases 3 e 4 são incrementos.

Posso começar pela **Fase 1** agora? Ou prefere reordenar (ex: ranges primeiro isolado, depois trading)?

