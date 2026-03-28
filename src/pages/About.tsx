import { Link } from 'react-router-dom';
import { Citrus, ArrowLeft, Shield, Scale, BookOpen, TrendingUp, Users, FileText } from 'lucide-react';
import Section from '@/components/shared/Section';

function SectionCard({ icon: Icon, title, children }: { icon: typeof Shield; title: string; children: React.ReactNode }) {
  return (
    <div className="surface-card p-6 space-y-3">
      <div className="flex items-center gap-2">
        <div className="h-8 w-8 rounded-lg bg-primary/10 flex items-center justify-center">
          <Icon className="h-4 w-4 text-primary" />
        </div>
        <h2 className="text-base font-bold">{title}</h2>
      </div>
      <div className="text-sm text-muted-foreground leading-relaxed space-y-3">{children}</div>
    </div>
  );
}

export default function About() {
  return (
    <div className="max-w-4xl mx-auto px-4 md:px-8 py-8 space-y-8 animate-fade-in">
      <Link to="/" className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors">
        <ArrowLeft className="h-4 w-4" /> Back
      </Link>

      {/* Hero */}
      <div className="text-center space-y-4 py-8">
        <div className="inline-flex items-center gap-3">
          <div className="h-12 w-12 rounded-xl bg-primary/15 border border-primary/20 flex items-center justify-center">
            <Citrus className="h-6 w-6 text-primary" />
          </div>
          <div className="text-left">
            <h1 className="text-2xl font-bold tracking-tight">LIME</h1>
            <p className="text-xs text-muted-foreground tracking-widest uppercase">Linear Index Market Exchange</p>
          </div>
        </div>
        <p className="text-muted-foreground max-w-xl mx-auto leading-relaxed">
          LIME is a prediction market platform for trading continuous-outcome contracts on real-world economic indicators, financial metrics, weather events, and more.
        </p>
      </div>

      {/* What is LIME */}
      <SectionCard icon={BookOpen} title="What is LIME?">
        <p>
          LIME allows users to trade <strong className="text-foreground">linear index contracts</strong> — financial instruments whose payoff is determined by where a real-world variable (e.g., interest rates, temperature, GDP) lands within a predefined range at a future date.
        </p>
        <p>
          Unlike binary prediction markets that only offer "Yes/No" outcomes, LIME contracts pay out on a continuous scale from <strong className="text-foreground">0¢ to 100¢</strong>, providing more nuanced exposure to the underlying variable.
        </p>
      </SectionCard>

      {/* How it works */}
      <SectionCard icon={TrendingUp} title="How Contracts Work">
        <p>Each contract is defined by:</p>
        <ul className="list-disc list-inside space-y-1.5 ml-2">
          <li><strong className="text-foreground">Variable</strong> — the metric being tracked (e.g., "Fed Funds Rate")</li>
          <li><strong className="text-foreground">Range [Floor, Cap]</strong> — the bounds of the payoff zone</li>
          <li><strong className="text-foreground">Resolution Date</strong> — when the final value is observed</li>
          <li><strong className="text-foreground">Settlement Source</strong> — the authoritative data source</li>
        </ul>
        <p className="mt-2">
          <strong className="text-foreground">Payoff formula (linear):</strong>{' '}
          <code className="px-1.5 py-0.5 rounded bg-secondary text-foreground font-mono text-xs">
            payoff = (observed − floor) / (cap − floor) × 100¢
          </code>
        </p>
        <p>
          If the observed value ≤ floor, the contract pays <strong className="text-foreground">0¢</strong>.
          If ≥ cap, it pays <strong className="text-foreground">100¢</strong>.
          Values between are interpolated linearly (or via the specified payoff curve).
        </p>
        <p>
          <strong className="text-foreground">Buyer vs Seller:</strong> the buyer pays the contract price and receives the payoff.
          The seller receives the contract price upfront and pays out the payoff. <em>Buyer payoff + Seller payoff = 100¢ always.</em>
        </p>
      </SectionCard>

      {/* Order Book & Spread */}
      <SectionCard icon={Scale} title="Order Book & Spread">
        <p>
          LIME uses a central limit order book (CLOB) with price-time priority matching.
          You can place <strong className="text-foreground">market orders</strong> (immediate fill at best available price) or <strong className="text-foreground">limit orders</strong> (specify your price).
        </p>
        <p>
          The <strong className="text-foreground">spread</strong> is the difference between the <em>best ask</em> (lowest sell price) and the <em>best bid</em> (highest buy price).
          A tighter spread indicates a more liquid market.
        </p>
        <p>
          <strong className="text-foreground">Important:</strong> when you sell a contract, your effective cost is <code className="px-1 py-0.5 rounded bg-secondary text-foreground font-mono text-xs">100¢ − price</code>.
          This is because the buyer and seller together always cover the full 100¢ payout range.
        </p>
      </SectionCard>

      {/* Payoff curves */}
      <SectionCard icon={TrendingUp} title="Payoff Curves">
        <p>LIME supports multiple payoff curve types for different risk profiles:</p>
        <ul className="list-disc list-inside space-y-1.5 ml-2">
          <li><strong className="text-foreground">Linear</strong> — proportional payoff across the range</li>
          <li><strong className="text-foreground">Sigmoid</strong> — S-curve, sensitive near the midpoint</li>
          <li><strong className="text-foreground">Binary Step</strong> — all-or-nothing at a threshold</li>
          <li><strong className="text-foreground">Convex</strong> — rewards accelerate at higher values</li>
          <li><strong className="text-foreground">Concave</strong> — most payoff captured early, diminishing returns</li>
        </ul>
      </SectionCard>

      {/* Market Lifecycle */}
      <SectionCard icon={Users} title="Market Lifecycle">
        <ol className="list-decimal list-inside space-y-1.5 ml-2">
          <li><strong className="text-foreground">Draft</strong> — market is being configured</li>
          <li><strong className="text-foreground">Pending</strong> — submitted for admin review</li>
          <li><strong className="text-foreground">Active</strong> — open for trading</li>
          <li><strong className="text-foreground">Resolved</strong> — final value observed, payoffs calculated</li>
          <li><strong className="text-foreground">Settled</strong> — funds distributed to participants</li>
        </ol>
      </SectionCard>

      {/* Terms of Use */}
      <SectionCard icon={FileText} title="Terms of Use">
        <p>By using LIME, you agree to the following terms:</p>
        <ol className="list-decimal list-inside space-y-2 ml-2">
          <li>
            <strong className="text-foreground">Eligibility.</strong> You must be at least 18 years of age and comply with applicable laws in your jurisdiction to use the platform.
          </li>
          <li>
            <strong className="text-foreground">Nature of Contracts.</strong> LIME contracts are derivative instruments tied to real-world observables. They are not investment advice. You bear full responsibility for your trading decisions.
          </li>
          <li>
            <strong className="text-foreground">Risk Disclosure.</strong> Trading involves substantial risk of loss. Contract values can fluctuate significantly. You may lose your entire investment in a contract. Past performance does not guarantee future results.
          </li>
          <li>
            <strong className="text-foreground">Settlement.</strong> Contracts are settled based on the specified authoritative data source. LIME uses best efforts to obtain accurate settlement values but is not liable for errors in third-party data sources.
          </li>
          <li>
            <strong className="text-foreground">Market Integrity.</strong> Manipulation, wash trading, or any form of market abuse is strictly prohibited and may result in account suspension and forfeiture of funds.
          </li>
          <li>
            <strong className="text-foreground">Account Security.</strong> You are responsible for maintaining the confidentiality of your account credentials. LIME is not liable for unauthorized access resulting from your negligence.
          </li>
          <li>
            <strong className="text-foreground">Fees.</strong> Trading fees, withdrawal fees, and other applicable charges are disclosed at the time of each transaction. LIME reserves the right to modify fee schedules with prior notice.
          </li>
          <li>
            <strong className="text-foreground">Dispute Resolution.</strong> Any disputes shall be resolved through binding arbitration under the rules of the jurisdiction in which LIME operates. No class actions.
          </li>
          <li>
            <strong className="text-foreground">Modification of Terms.</strong> LIME reserves the right to update these terms at any time. Continued use of the platform constitutes acceptance of modified terms.
          </li>
          <li>
            <strong className="text-foreground">Privacy.</strong> LIME collects and processes personal data in accordance with its Privacy Policy. Data may be shared with regulatory authorities as required by law.
          </li>
        </ol>
      </SectionCard>

      {/* Disclaimer */}
      <div className="surface-card p-5 border-l-4 border-warning/50">
        <div className="flex items-start gap-3">
          <Shield className="h-5 w-5 text-warning shrink-0 mt-0.5" />
          <div className="text-xs text-muted-foreground leading-relaxed space-y-2">
            <p className="font-semibold text-foreground text-sm">Risk Disclaimer</p>
            <p>
              LIME is an experimental platform. Contracts traded on LIME are complex financial instruments that carry a high degree of risk.
              You should only trade with funds you can afford to lose. This platform does not provide financial, legal, or tax advice.
              Consult a qualified professional before making trading decisions.
            </p>
            <p>
              LIME makes no guarantees about the availability, accuracy, or reliability of the platform or its data sources.
              The platform is provided "as is" without warranties of any kind.
            </p>
          </div>
        </div>
      </div>

      <div className="text-center text-xs text-muted-foreground py-8">
        <p>© {new Date().getFullYear()} LIME — Linear Index Market Exchange. All rights reserved.</p>
      </div>
    </div>
  );
}
