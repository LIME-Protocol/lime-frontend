import { Link } from 'react-router-dom';
import {
  Activity,
  Cloud,
  Trophy,
  LineChart,
  ShieldCheck,
  Sparkles,
  ArrowUpRight,
} from 'lucide-react';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';

/* ────────────────────────────────────────────── */
/*  Section shell                                 */
/* ────────────────────────────────────────────── */
function SectionShell({
  id,
  eyebrow,
  title,
  description,
  children,
}: {
  id: string;
  eyebrow: string;
  title: string;
  description?: string;
  children: React.ReactNode;
}) {
  return (
    <section
      id={id}
      className="border-b border-border/60 scroll-mt-24"
      aria-labelledby={`${id}-title`}
    >
      <div className="max-w-6xl mx-auto px-6 py-20 md:py-28">
        <div className="max-w-2xl mb-12 md:mb-16 space-y-4">
          <span className="text-[11px] uppercase tracking-widest text-primary font-medium font-['Satoshi']">
            {eyebrow}
          </span>
          <h2
            id={`${id}-title`}
            className="font-['Satoshi'] text-3xl md:text-5xl font-semibold tracking-tight leading-[1.05]"
            style={{ textWrap: 'balance' as never }}
          >
            {title}
          </h2>
          {description && (
            <p className="font-['Satoshi'] text-base md:text-lg text-muted-foreground leading-relaxed">
              {description}
            </p>
          )}
        </div>
        {children}
      </div>
    </section>
  );
}

/* ────────────────────────────────────────────── */
/*  Protocol overview                             */
/* ────────────────────────────────────────────── */
export function ProtocolSection() {
  const stats = [
    { label: 'Payoff range', value: '0¢–100¢' },
    { label: 'Settlement', value: 'On-chain ready' },
    { label: 'Curve types', value: '5' },
  ];
  return (
    <SectionShell
      id="protocol"
      eyebrow="The Protocol"
      title="A continuous-outcome prediction market."
      description="Binary markets force you into yes or no. LIME contracts pay out on a continuous scale tied to a real-world value, so your exposure mirrors how the world actually unfolds."
    >
      <div className="grid md:grid-cols-3 gap-px bg-border/60 rounded-xl overflow-hidden border border-border/60">
        {stats.map((s) => (
          <div key={s.label} className="bg-background p-7">
            <div className="data-label mb-3">{s.label}</div>
            <div className="font-['Satoshi'] text-3xl md:text-4xl font-semibold tracking-tight tabular-nums">
              {s.value}
            </div>
          </div>
        ))}
      </div>
    </SectionShell>
  );
}

/* ────────────────────────────────────────────── */
/*  Order book demo                               */
/* ────────────────────────────────────────────── */
export function OrderBookSection() {
  const buy = 0.62;
  const sell = 0.38;
  const spread = 0.04;
  return (
    <SectionShell
      id="order-book"
      eyebrow="Order book"
      title="Buy and Sell always sum to $1.00."
      description="Every contract has two sides. The Buy and Sell prices represent the market's split view, and the spread between Ask and Bid measures liquidity."
    >
      <div className="grid md:grid-cols-2 gap-6">
        <div className="surface-card p-6 space-y-5">
          <div className="flex items-center justify-between">
            <span className="font-['Satoshi'] font-semibold">BUY side</span>
            <span className="font-mono tabular-nums text-3xl font-bold text-primary">
              ${buy.toFixed(2)}
            </span>
          </div>
          <div className="h-2 rounded-full bg-muted overflow-hidden">
            <div
              className="h-full bg-primary"
              style={{ width: `${buy * 100}%` }}
              aria-hidden="true"
            />
          </div>
          <div className="flex items-center justify-between pt-4 border-t border-border/60">
            <span className="font-['Satoshi'] font-semibold text-muted-foreground">
              SELL side
            </span>
            <span className="font-mono tabular-nums text-3xl font-bold text-muted-foreground">
              ${sell.toFixed(2)}
            </span>
          </div>
          <div className="h-2 rounded-full bg-muted overflow-hidden">
            <div
              className="h-full bg-muted-foreground/40"
              style={{ width: `${sell * 100}%` }}
              aria-hidden="true"
            />
          </div>
          <div className="text-xs text-muted-foreground pt-2">
            <span className="font-mono tabular-nums">{buy.toFixed(2)}</span> +{' '}
            <span className="font-mono tabular-nums">{sell.toFixed(2)}</span> ={' '}
            <span className="font-mono tabular-nums text-foreground">1.00</span>
          </div>
        </div>

        <div className="surface-card p-6 space-y-5 bg-card/60">
          <div className="data-label">Spread</div>
          <div className="font-['Satoshi'] text-5xl font-semibold tabular-nums">
            {spread.toFixed(2)}¢
          </div>
          <p className="text-sm text-muted-foreground font-['Satoshi'] leading-relaxed">
            Difference between the best Ask and best Bid. Tighter spread means deeper
            liquidity. LIME uses Price-Time Priority matching — the same engine modern
            exchanges run on.
          </p>
          <div className="pt-4 border-t border-border/60 grid grid-cols-2 gap-4 text-sm">
            <div>
              <div className="data-label">Best Ask</div>
              <div className="font-mono tabular-nums font-semibold mt-1">$0.66</div>
            </div>
            <div>
              <div className="data-label">Best Bid</div>
              <div className="font-mono tabular-nums font-semibold mt-1">$0.62</div>
            </div>
          </div>
        </div>
      </div>
    </SectionShell>
  );
}

/* ────────────────────────────────────────────── */
/*  Curve gallery                                 */
/* ────────────────────────────────────────────── */
const curves: { name: string; status: 'live' | 'soon'; path: string }[] = [
  { name: 'Linear', status: 'live', path: 'M0 80 L120 0' },
  { name: 'Sigmoid', status: 'soon', path: 'M0 80 C40 80, 60 40, 60 40 S100 0, 120 0' },
  { name: 'Binary', status: 'soon', path: 'M0 80 L60 80 L60 0 L120 0' },
  { name: 'Convex', status: 'soon', path: 'M0 80 Q90 80, 120 0' },
  { name: 'Concave', status: 'soon', path: 'M0 80 Q30 0, 120 0' },
];

export function CurvesSection() {
  return (
    <SectionShell
      id="curves"
      eyebrow="Payoff curves"
      title="Five ways to shape exposure."
      description="The MVP runs on Linear. Sigmoid, Binary, Convex and Concave curves are on the roadmap — same engine, different risk profile."
    >
      <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
        {curves.map((c) => (
          <div
            key={c.name}
            className="surface-card p-5 space-y-4 group hover:border-primary/30 transition-colors"
          >
            <svg viewBox="0 0 120 80" className="w-full h-20" aria-hidden="true">
              <path
                d={c.path}
                fill="none"
                stroke={c.status === 'live' ? 'hsl(var(--primary))' : 'hsl(var(--muted-foreground) / 0.5)'}
                strokeWidth="2.5"
                strokeLinecap="round"
              />
            </svg>
            <div className="flex items-center justify-between">
              <span className="font-['Satoshi'] font-semibold text-sm">{c.name}</span>
              <span
                className={`text-[10px] uppercase tracking-widest font-medium ${
                  c.status === 'live' ? 'text-primary' : 'text-muted-foreground'
                }`}
              >
                {c.status === 'live' ? 'MVP' : 'Soon'}
              </span>
            </div>
          </div>
        ))}
      </div>
    </SectionShell>
  );
}

/* ────────────────────────────────────────────── */
/*  Use cases                                     */
/* ────────────────────────────────────────────── */
const useCases = [
  {
    icon: Activity,
    title: 'Macro indicators',
    body: 'Trade the path of the Fed Funds Rate, CPI prints, or unemployment numbers as a range, not a binary call.',
    example: 'Fed Funds · Dec 2026 · 3.50–5.50%',
  },
  {
    icon: Cloud,
    title: 'Climate & weather',
    body: 'Hedge or speculate on temperature, rainfall, and storm intensity with continuous payoffs tied to NOAA data.',
    example: 'NYC avg temp · Jan 2027 · 28–42°F',
  },
  {
    icon: Trophy,
    title: 'Sports & events',
    body: 'Express conviction on a player\u2019s season total or a team\u2019s win count without limiting yourself to yes / no.',
    example: 'Season wins · NBA team · 35–55',
  },
];

export function UseCasesSection() {
  return (
    <SectionShell
      id="use-cases"
      eyebrow="Use cases"
      title="One engine. Many markets."
      description="Anything that lands on a number can be a LIME contract."
    >
      <div className="grid md:grid-cols-3 gap-6">
        {useCases.map((u) => (
          <article
            key={u.title}
            className="surface-card p-7 space-y-4 hover:border-primary/30 transition-colors"
          >
            <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
              <u.icon className="h-5 w-5 text-primary" aria-hidden="true" />
            </div>
            <h3 className="font-['Satoshi'] text-xl font-semibold">{u.title}</h3>
            <p className="font-['Satoshi'] text-sm text-muted-foreground leading-relaxed">
              {u.body}
            </p>
            <div className="pt-4 border-t border-border/60">
              <div className="data-label">Example</div>
              <div className="font-mono tabular-nums text-xs mt-1.5 text-foreground">
                {u.example}
              </div>
            </div>
          </article>
        ))}
      </div>
    </SectionShell>
  );
}

/* ────────────────────────────────────────────── */
/*  Lifecycle                                     */
/* ────────────────────────────────────────────── */
const phases = ['Draft', 'Pending', 'Active', 'Resolved', 'Settled'];

export function LifecycleSection() {
  return (
    <SectionShell
      id="lifecycle"
      eyebrow="Market lifecycle"
      title="From draft to settlement, on rails."
      description="Every market moves through the same five phases. Operators draft and propose, the community trades, and the protocol settles to a published data source."
    >
      <ol className="relative grid grid-cols-2 md:grid-cols-5 gap-4">
        {phases.map((p, i) => (
          <li key={p} className="surface-card p-5 space-y-2 relative">
            <div className="font-mono tabular-nums text-[11px] text-muted-foreground">
              0{i + 1}
            </div>
            <div className="font-['Satoshi'] font-semibold">{p}</div>
            <div
              className={`h-1 w-8 rounded-full ${
                i === 2 ? 'bg-primary' : 'bg-border'
              }`}
              aria-hidden="true"
            />
          </li>
        ))}
      </ol>
    </SectionShell>
  );
}

/* ────────────────────────────────────────────── */
/*  Why LIME                                      */
/* ────────────────────────────────────────────── */
const reasons = [
  {
    icon: LineChart,
    title: 'Continuous payoffs',
    body: 'Get paid in proportion to how right you were — not a binary win or zero.',
  },
  {
    icon: ShieldCheck,
    title: 'Transparent settlement',
    body: 'Every market declares its data source up front. No off-chain discretion at resolution.',
  },
  {
    icon: Sparkles,
    title: 'Built to scale on-chain',
    body: 'Architecture is Solana-ready so the same orderbook can move from off-chain MVP to on-chain settlement.',
  },
];

export function WhyLimeSection() {
  return (
    <SectionShell
      id="why"
      eyebrow="Why LIME"
      title="The case for continuous markets."
    >
      <div className="grid md:grid-cols-3 gap-6">
        {reasons.map((r) => (
          <div key={r.title} className="surface-card p-7 space-y-4">
            <r.icon className="h-6 w-6 text-primary" aria-hidden="true" />
            <h3 className="font-['Satoshi'] text-lg font-semibold">{r.title}</h3>
            <p className="font-['Satoshi'] text-sm text-muted-foreground leading-relaxed">
              {r.body}
            </p>
          </div>
        ))}
      </div>
    </SectionShell>
  );
}

/* ────────────────────────────────────────────── */
/*  FAQ                                           */
/* ────────────────────────────────────────────── */
const faqs = [
  {
    q: 'What is a linear contract?',
    a: 'A LIME contract pays out between 0¢ and 100¢ based on where the observed value falls between the Floor and the Cap at resolution. If the value lands below the Floor, payoff is 0¢; above the Cap, 100¢; in between, it scales linearly.',
  },
  {
    q: 'How is the settlement value chosen?',
    a: 'Every market declares its authoritative data source when it\u2019s created — for example, the FOMC press release or a NOAA station. At the resolution date, LIME reads that source and computes payoffs.',
  },
  {
    q: 'Is LIME custodial?',
    a: 'The MVP runs an off-chain orderbook with custodied balances so the experience is fast and free of gas. The architecture is built to migrate to on-chain settlement on Solana without breaking the trading flow.',
  },
  {
    q: 'How does the order book match trades?',
    a: 'Price-Time Priority. The best price wins; on ties, the earlier order wins. The same logic powers traditional financial exchanges.',
  },
  {
    q: 'What fees does LIME charge?',
    a: 'Trading fees and withdrawal fees are disclosed at the time of each transaction inside the app. The protocol does not take a cut of contract payoffs.',
  },
  {
    q: 'Can I lose more than I put in?',
    a: 'No. Maximum loss per contract is the price you paid (Buy side) or 100¢ minus the price you received (Sell side). There is no leverage on LIME contracts.',
  },
];

export function FAQSection() {
  return (
    <SectionShell
      id="faq"
      eyebrow="Questions"
      title="Things people ask first."
    >
      <Accordion type="single" collapsible className="max-w-3xl">
        {faqs.map((f, i) => (
          <AccordionItem key={i} value={`item-${i}`} className="border-border/60">
            <AccordionTrigger className="font-['Satoshi'] text-left text-base hover:no-underline hover:text-primary">
              {f.q}
            </AccordionTrigger>
            <AccordionContent className="font-['Satoshi'] text-sm text-muted-foreground leading-relaxed">
              {f.a}
            </AccordionContent>
          </AccordionItem>
        ))}
      </Accordion>
    </SectionShell>
  );
}

/* ────────────────────────────────────────────── */
/*  Final CTA                                     */
/* ────────────────────────────────────────────── */
export function CTASection() {
  return (
    <section className="border-b border-border/60" aria-labelledby="cta-title">
      <div className="max-w-6xl mx-auto px-6 py-24 md:py-32">
        <div className="relative overflow-hidden rounded-2xl border border-primary/30 bg-primary/[0.06] p-10 md:p-16 text-center space-y-6">
          <div
            className="pointer-events-none absolute inset-0 opacity-30"
            style={{
              background:
                'radial-gradient(closest-side, hsl(var(--primary) / 0.3), transparent 70%)',
            }}
            aria-hidden="true"
          />
          <h2
            id="cta-title"
            className="relative font-['Satoshi'] text-4xl md:text-6xl font-semibold tracking-tight"
            style={{ textWrap: 'balance' as never }}
          >
            Open your first position.
          </h2>
          <p className="relative max-w-xl mx-auto text-muted-foreground font-['Satoshi']">
            Browse live markets, place a Buy or Sell at any price between 0¢ and 100¢,
            and let the orderbook do the rest.
          </p>
          <div className="relative">
            <Link
              to="/"
              className="group inline-flex items-center gap-2 rounded-full bg-primary text-primary-foreground px-7 py-3.5 text-sm font-semibold hover:opacity-90 transition-opacity focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-background"
            >
              Launch the App
              <ArrowUpRight
                className="h-4 w-4 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
                aria-hidden="true"
              />
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}

/* ────────────────────────────────────────────── */
/*  Footer                                        */
/* ────────────────────────────────────────────── */
export function LandingFooter() {
  return (
    <footer className="border-t border-border/60">
      <div className="max-w-6xl mx-auto px-6 py-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6 text-sm text-muted-foreground font-['Satoshi']">
        <div className="space-y-1">
          <div
            className="font-['Satoshi'] text-foreground font-semibold"
            translate="no"
          >
            LIME
          </div>
          <div className="text-xs">Linear Index Market Exchange.</div>
        </div>
        <nav className="flex flex-wrap items-center gap-5" aria-label="Footer">
          <Link to="/about" className="hover:text-foreground transition-colors">
            About
          </Link>
          <Link to="/about" className="hover:text-foreground transition-colors">
            Terms
          </Link>
          <a
            href="#protocol"
            className="hover:text-foreground transition-colors"
          >
            Protocol
          </a>
        </nav>
        <div className="text-xs">© {new Date().getFullYear()} LIME.</div>
      </div>
    </footer>
  );
}
