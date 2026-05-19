import { Link } from 'react-router-dom';
import { ArrowUpRight, ArrowDown } from 'lucide-react';

export default function Hero() {
  return (
    <section className="relative overflow-hidden border-b border-border/60">
      {/* ambient lime glow */}
      <div
        className="pointer-events-none absolute -top-32 -right-32 h-[520px] w-[520px] rounded-full opacity-30 blur-3xl"
        style={{ background: 'radial-gradient(closest-side, hsl(var(--primary) / 0.45), transparent 70%)' }}
        aria-hidden="true"
      />

      <div className="max-w-6xl mx-auto px-6 pt-20 pb-24 md:pt-28 md:pb-32 grid md:grid-cols-[1.1fr_1fr] gap-14 items-center">
        <div className="space-y-7 animate-reveal-up">
          <span className="inline-flex items-center gap-2 rounded-full border border-border/80 bg-card/60 px-3 py-1 text-[11px] uppercase tracking-widest text-muted-foreground font-['Satoshi']">
            <span className="h-1.5 w-1.5 rounded-full bg-primary animate-pulse-glow" aria-hidden="true" />
            Linear Index Market Exchange
          </span>

          <h1
            className="font-['Satoshi'] text-5xl md:text-6xl lg:text-7xl font-semibold leading-[1.02] tracking-tight"
            style={{ textWrap: 'balance' as never }}
          >
            Trade the <em className="not-italic text-primary">range</em>,
            <br />
            not the outcome.
          </h1>

          <p className="font-['Satoshi'] text-lg text-muted-foreground max-w-xl leading-relaxed">
            LIME is a continuous-payoff prediction market. Take positions on where a
            real-world variable will land — rates, weather, indices — and get paid on a
            scale from 0¢ to 100¢ instead of all-or-nothing.
          </p>

          <div className="flex flex-wrap items-center gap-3 pt-2">
            <Link
              to="/"
              className="group inline-flex items-center gap-2 rounded-full bg-primary text-primary-foreground px-6 py-3 text-sm font-semibold hover:opacity-90 transition-opacity focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-background"
            >
              Launch App
              <ArrowUpRight
                className="h-4 w-4 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
                aria-hidden="true"
              />
            </Link>
            <a
              href="#how-it-works"
              className="inline-flex items-center gap-2 rounded-full border border-border bg-card/40 px-6 py-3 text-sm font-medium text-foreground hover:bg-card transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
            >
              Read the Protocol
              <ArrowDown className="h-3.5 w-3.5" aria-hidden="true" />
            </a>
          </div>
        </div>

        {/* Hero payoff visual */}
        <div
          className="relative surface-card glow-accent p-6 md:p-8 animate-scale-in stagger-2"
          aria-hidden="true"
        >
          <div className="flex items-center justify-between mb-5">
            <div>
              <div className="data-label">Sample contract</div>
              <div className="font-['Satoshi'] text-sm font-semibold mt-1">
                Fed Funds Rate · Dec 2026
              </div>
            </div>
            <span className="text-[10px] uppercase tracking-widest text-primary font-medium">
              Live
            </span>
          </div>
          <div className="h-48 rounded-lg border border-dashed border-border/60 bg-card/30 flex items-center justify-center">
            <span className="font-['Satoshi'] text-xs uppercase tracking-widest text-muted-foreground">Chart placeholder</span>
          </div>

          <div className="grid grid-cols-3 gap-3 mt-6 pt-5 border-t border-border/60">
            <Stat label="Floor" value="3.50%" />
            <Stat label="Consensus" value="62.4¢" highlight />
            <Stat label="Cap" value="5.50%" />
          </div>
        </div>
      </div>
    </section>
  );
}

function Stat({ label, value, highlight = false }: { label: string; value: string; highlight?: boolean }) {
  return (
    <div className="space-y-1">
      <div className="data-label">{label}</div>
      <div
        className={`font-mono tabular-nums text-base font-semibold ${
          highlight ? 'text-primary' : 'text-foreground'
        }`}
      >
        {value}
      </div>
    </div>
  );
}
