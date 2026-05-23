import { Link } from 'react-router-dom';
import { ArrowRight, ArrowDown } from 'lucide-react';
import type { MouseEvent } from 'react';

export default function Hero() {
  const floor = 200;
  const cap = 800;
  const price = 0.4;
  const impliedValue = floor + price * (cap - floor);
  const marker = ((impliedValue - floor) / (cap - floor)) * 100;

  const handleHowItWorksClick = (event: MouseEvent<HTMLAnchorElement>) => {
    const target = document.getElementById('how-it-works');
    if (!target) return;

    event.preventDefault();
    target.scrollIntoView({ behavior: 'smooth', block: 'start' });
    window.history.replaceState(null, '', '#how-it-works');
  };

  return (
    <section className="relative overflow-hidden border-b border-border/60">
      {/* ambient lime glow */}
      <div
        className="pointer-events-none absolute -top-32 -right-32 h-[520px] w-[520px] rounded-full opacity-30 blur-3xl"
        style={{ background: 'radial-gradient(closest-side, hsl(var(--primary) / 0.45), transparent 70%)' }}
        aria-hidden="true"
      />

      <div className="max-w-6xl mx-auto px-6 pt-20 pb-24 md:pt-28 md:pb-32 grid md:grid-cols-[1.1fr_1fr] gap-14 items-center">
        <div className="space-y-7">
          <span
            data-hero-eyebrow
            className="inline-flex items-center gap-2 rounded-full border border-border/80 bg-card/60 px-3 py-1 text-[11px] uppercase tracking-widest text-muted-foreground font-['Satoshi']"
          >
            <span className="h-1.5 w-1.5 rounded-full bg-primary animate-pulse-glow" aria-hidden="true" />
            Linear Index Market Exchange
          </span>

          <h1
            className="font-['Satoshi'] text-5xl md:text-6xl lg:text-7xl font-semibold leading-[1.02] tracking-tight"
            style={{ textWrap: 'balance' as never }}
          >
            <span data-hero-line className="block">
              A prediction market,
            </span>
            <span data-hero-line className="block">
              but with a <em className="not-italic text-primary">continuous payoff</em>.
            </span>
          </h1>

          <p data-hero-copy className="font-['Satoshi'] text-lg text-muted-foreground max-w-xl leading-relaxed">
            LIME lets you trade numerical outcomes as ranges. Instead of a yes-or-no bet,
            contracts pay from 0¢ to 100¢ based on where the realized value lands.
          </p>

          <div data-hero-actions className="flex flex-wrap items-center gap-3 pt-2">
            <Link
              to="/waitlist"
              className="group inline-flex items-center gap-2 rounded-full bg-primary text-primary-foreground px-6 py-3 text-sm font-semibold hover:opacity-90 transition-opacity focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-background"
            >
              Join Waitlist
              <ArrowRight
                className="h-4 w-4 transition-transform group-hover:translate-x-0.5"
                aria-hidden="true"
              />
            </Link>
            <a
              href="#how-it-works"
              onClick={handleHowItWorksClick}
              className="inline-flex items-center gap-2 rounded-full border border-border bg-card/40 px-6 py-3 text-sm font-medium text-foreground hover:bg-card transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
            >
              See how it works
              <ArrowDown className="h-3.5 w-3.5" aria-hidden="true" />
            </a>
          </div>
        </div>

        {/* Hero payoff visual */}
        <div
          data-hero-card
          className="relative surface-card glow-accent p-6 md:p-8"
          aria-hidden="true"
        >
          <div className="flex items-center justify-between mb-5">
            <div>
              <div className="data-label">Sample contract</div>
              <div className="font-['Satoshi'] text-sm font-semibold mt-1">
                Anthropic IPO valuation
              </div>
            </div>
            <span className="text-[10px] uppercase tracking-widest text-primary font-medium">
              Launch market
            </span>
          </div>

          <div className="rounded-lg border border-border/60 bg-card/30 p-5 space-y-5">
            <div className="flex items-center justify-between text-xs text-muted-foreground">
              <span className="font-mono tabular-nums">$200B</span>
              <span className="font-mono tabular-nums">$800B</span>
            </div>
            <div className="relative h-3 rounded-full bg-muted">
              <div
                data-hero-bar
                className="absolute inset-y-0 left-0 rounded-full bg-primary"
                style={{ width: `${marker}%` }}
                aria-hidden="true"
              />
              <span
                className="absolute top-1/2 -translate-x-1/2 -translate-y-1/2"
                style={{ left: `${marker}%` }}
                aria-hidden="true"
              >
                <span
                  data-hero-marker
                  className="block h-5 w-5 rounded-full border-2 border-background bg-primary shadow-lg"
                />
              </span>
            </div>
            <div className="rounded-md border border-border/60 bg-background/70 px-4 py-3">
              <div className="data-label">Market-implied value</div>
              <div className="font-mono tabular-nums text-3xl font-bold text-primary mt-1">
                ${impliedValue.toFixed(0)}B
              </div>
              <p className="text-xs text-muted-foreground mt-2">
                A {Math.round(price * 100)}¢ price maps to the market expectation inside the valuation range.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-3 mt-6 pt-5 border-t border-border/60">
            <Stat label="Floor" value="$200B" />
            <Stat label="Price" value="40¢" highlight />
            <Stat label="Cap" value="$800B" />
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
