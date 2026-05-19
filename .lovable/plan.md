## Goal

Ship a marketing landing page at `/landing` (and make it the public entry point for unauthenticated visitors) whose only job is to **explain the LIME protocol** before users touch the app — same intent as `lbp.balancer.fi`, but with a fully original design rooted in LIME's identity.

Compliance reference: the `web-design-guidelines` skill resolves to Vercel's Web Interface Guidelines (`vercel-labs/web-interface-guidelines/command.md`). I'll treat its rules (accessibility, focus states, typography curly quotes + ellipsis, `tabular-nums`, reduced-motion, semantic HTML, image dimensions, etc.) as the QA checklist before shipping.

---

## Visual direction (locked from your picks)

- Palette — **LIME Noir**: `#0a0a0a` canvas, `#141414` surfaces, `#c6ff3d` lime accent, `#f5f5f5` text. Uses existing `--primary` / `--background` tokens; no hardcoded hex in components.
- Type — **Space Grotesk** (display/headings) + **DM Sans** (body). JetBrains Mono kept for numerals only (prices, payoff, stats) — consistent with project memory.
- Layout — **Full-width stacked sections**, generous vertical rhythm, asymmetric type, lime used surgically as accent (never as background fill).
- Motion — subtle on-scroll reveals + one signature hero animation (animated payoff curve sweeping floor → cap). Honors `prefers-reduced-motion`.

---

## Page structure (single route, stacked sections)

1. **Nav bar** — minimal: logo · "Protocol" · "How it works" · "Use cases" · "FAQ" · `Launch app →` CTA (links to `/` app shell, i.e. Explore).
2. **Hero** — bold headline (e.g. "Trade the *range*, not the outcome."), one-line subhead, dual CTA (`Launch app` primary, `Read the protocol` secondary anchor). Right side: animated linear payoff chart (floor → cap, 0¢ → 100¢) — the visual hook.
3. **What is LIME** — 2–3 short paragraphs + a 3-stat strip (e.g. *Continuous payoffs · On-chain ready · Operator-neutral*). `tabular-nums` on any number.
4. **How a contract works** — interactive (or scroll-driven) explainer: Variable → Range [Floor, Cap] → Resolution date → Payoff formula. Shows the formula `(observed − floor) / (cap − floor) × 100¢` in a monospaced callout with a live slider that drags the observed value and updates the payoff readout.
5. **Order book & spread** — visual showing Buy + Sell prices summing to $1.00, with the spread highlighted. Reinforces the core trading rule from project memory.
6. **Payoff curve gallery** — small cards for Linear, Sigmoid, Binary, Convex, Concave (mini SVG previews). MVP highlights Linear; others tagged "Coming soon".
7. **Use cases** — 3 cards: *Macro indicators* (rates, CPI), *Climate & weather*, *Sports/event ranges*. Each: one-sentence framing + a tiny mocked market preview.
8. **Lifecycle strip** — horizontal timeline: Draft → Pending → Active → Resolved → Settled.
9. **Why LIME** — differentiators vs binary prediction markets (continuous payoff, nuanced exposure, transparent settlement source).
10. **FAQ** — accordion using existing `components/ui/accordion.tsx`. 6–8 questions (What is a linear contract? How is settlement decided? What are the fees? Is it custodial? etc.).
11. **Final CTA band** — large lime-accented band: "Open your first position →".
12. **Footer** — links to About, Terms (already in `/about`), socials placeholder, © LIME.

---

## Routing & access

- New route `/landing` rendered **outside** `AppLayout` (no app navbar) so it owns its own marketing chrome.
- Update `src/App.tsx`: add `<Route path="/landing" element={<Landing />} />` at the top level alongside `/auth`.
- Keep `/` as Explore for logged-in users. For unauthenticated visitors hitting `/`, redirect to `/landing` (single check in `AppLayout` using `useAuth`). Logged-in users visiting `/landing` still see it — it stays publicly reachable.
- Update `index.html` `<title>` and `<meta description>` for the landing page (sitewide head; the app currently has only one entry point).

---

## Technical details

**Files to create**
- `src/pages/Landing.tsx` — page composition.
- `src/components/landing/LandingNav.tsx` — marketing nav (separate from app `Navbar`).
- `src/components/landing/Hero.tsx` — headline + animated payoff hero.
- `src/components/landing/PayoffExplainer.tsx` — interactive observed-value slider + formula readout.
- `src/components/landing/OrderBookDemo.tsx` — static Buy/Sell + spread visualization.
- `src/components/landing/PayoffCurveCard.tsx` — small SVG per curve type.
- `src/components/landing/UseCaseCard.tsx`
- `src/components/landing/LifecycleTimeline.tsx`
- `src/components/landing/FAQ.tsx` (wraps shadcn Accordion)
- `src/components/landing/LandingFooter.tsx`

**Files to edit**
- `src/App.tsx` — register `/landing` route outside `AppLayout`.
- `src/components/layout/AppLayout.tsx` — redirect unauthenticated users from `/` to `/landing`.
- `index.html` — title + meta description tuned to the landing copy.

**Design tokens**
- Reuse existing `--primary` (lime), `--background`, `--foreground`, `--card`, `--muted`. No new hex literals in JSX. If we need a dim-lime glow, add `--primary-glow` to `index.css` rather than inlining.
- Animations via Tailwind utilities + a small `framer-motion` usage for scroll reveals (already implicitly fine; if not installed I'll add it).

**Web Interface Guidelines QA pass before shipping**
- Semantic HTML: `<header>`, `<main>`, `<section>`, `<nav>`, `<footer>`; one `<h1>` in hero, then hierarchical `h2`/`h3`.
- All `<img>` get `width`/`height`; decorative SVGs `aria-hidden="true"`; icon-only buttons get `aria-label`.
- Focus-visible rings preserved (no `outline-none`); accordion + slider use shadcn primitives that already handle keyboard.
- Curly quotes `"…"`, real ellipsis `…`, non-breaking space in `10 MB` / brand strings.
- `tabular-nums` on all number displays.
- `prefers-reduced-motion`: payoff hero animation falls back to static state.
- Hero image and payoff SVG above the fold get `fetchpriority="high"`; everything else lazy.
- Anchor links (`#how-it-works`, etc.) use real `<a>` with `scroll-margin-top`.
- `Launch app` CTA is a real `<Link>` so Cmd-click works.

---

## Out of scope (so nothing else changes)

- No backend changes, no schema/migration, no edge functions.
- No changes to `Explore`, `MarketDetail`, `Wallet`, `Portfolio`, `Admin`.
- No new third-party services. `framer-motion` only if not already present.
- Copy in this plan is illustrative — final copy can be tightened during build, but tone stays editorial/technical, second person, Title Case for buttons.

---

## Deliverable

A polished, accessible, on-brand `/landing` route that a first-time visitor can read top-to-bottom in ~60 seconds and understand: *what a LIME contract is, how payoff works, what the spread means, what they can trade, and how to start.*
