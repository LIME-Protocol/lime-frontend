import { FormEvent, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, Check, Loader2 } from 'lucide-react';
import logoIcon from '@/assets/logo-icon.png';
import { joinWaitlist, isValidWaitlistEmail } from '@/services/waitlist';

export default function Waitlist() {
  const [email, setEmail] = useState('');
  const [name, setName] = useState('');
  const [message, setMessage] = useState('');
  const [status, setStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!isValidWaitlistEmail(email)) {
      setStatus('error');
      setMessage('Enter a valid email address.');
      return;
    }

    setSubmitting(true);
    const result = await joinWaitlist({ email, name, source: 'waitlist_page' });
    setSubmitting(false);
    setMessage(result.message);
    setStatus(result.status === 'error' ? 'error' : 'success');
  };

  return (
    <div className="dark min-h-screen bg-background text-foreground" style={{ colorScheme: 'dark' }}>
      <main className="min-h-screen grid lg:grid-cols-[1fr_520px]">
        <section className="relative overflow-hidden border-b lg:border-b-0 lg:border-r border-border/60 px-6 py-10 md:px-10 md:py-12 flex flex-col">
          <div
            className="pointer-events-none absolute -top-40 -right-40 h-[560px] w-[560px] rounded-full opacity-25 blur-3xl"
            style={{ background: 'radial-gradient(closest-side, hsl(var(--primary) / 0.45), transparent 70%)' }}
            aria-hidden="true"
          />

          <Link
            to="/"
            className="relative inline-flex w-fit items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            <ArrowLeft className="h-4 w-4" aria-hidden="true" />
            Back to landing
          </Link>

          <div className="relative flex-1 flex items-center">
            <div className="max-w-2xl space-y-7 py-16">
              <img src={logoIcon} alt="" className="h-10 w-10" aria-hidden="true" />
              <div className="space-y-5">
                <span className="data-label text-primary">LIME waitlist</span>
                <h1 className="font-['Satoshi'] text-5xl md:text-7xl font-semibold leading-[1.02]">
                  Get early access to continuous prediction markets.
                </h1>
                <p className="font-['Satoshi'] max-w-xl text-lg leading-relaxed text-muted-foreground">
                  Join the launch list for LIME, starting with markets like Anthropic IPO valuation that settle across a range instead of yes-or-no outcomes.
                </p>
              </div>
            </div>
          </div>
        </section>

        <section className="px-6 py-10 md:px-10 md:py-12 flex items-center">
          <div className="w-full surface-card glow-accent p-6 md:p-8 space-y-6">
            {status === 'success' ? (
              <div className="space-y-5 animate-reveal-up" role="status">
                <div className="h-11 w-11 rounded-full bg-primary/15 flex items-center justify-center">
                  <Check className="h-5 w-5 text-primary" aria-hidden="true" />
                </div>
                <div className="space-y-2">
                  <h2 className="font-['Satoshi'] text-2xl font-semibold">You're on the list.</h2>
                  <p className="text-sm text-muted-foreground leading-relaxed">{message}</p>
                </div>
                <Link
                  to="/"
                  className="inline-flex items-center gap-2 rounded-full border border-border bg-card/40 px-5 py-2.5 text-sm font-medium hover:bg-card transition-colors"
                >
                  Back to landing
                </Link>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-5" noValidate>
                <div className="space-y-2">
                  <h2 className="font-['Satoshi'] text-2xl font-semibold">Join the waitlist</h2>
                  <p className="text-sm text-muted-foreground">
                    We will send product access and launch market updates here.
                  </p>
                </div>

                <label className="block space-y-2">
                  <span className="data-label">Email</span>
                  <input
                    value={email}
                    onChange={(event) => setEmail(event.target.value)}
                    type="email"
                    required
                    placeholder="you@example.com"
                    className="h-11 w-full rounded-lg border border-border bg-secondary/50 px-3 text-sm outline-none focus:ring-2 focus:ring-ring/40"
                    autoComplete="email"
                  />
                </label>

                <label className="block space-y-2">
                  <span className="data-label">Name</span>
                  <input
                    value={name}
                    onChange={(event) => setName(event.target.value)}
                    type="text"
                    placeholder="Optional"
                    className="h-11 w-full rounded-lg border border-border bg-secondary/50 px-3 text-sm outline-none focus:ring-2 focus:ring-ring/40"
                    autoComplete="name"
                  />
                </label>

                {status === 'error' && (
                  <p className="text-sm text-negative" role="alert">
                    {message}
                  </p>
                )}

                <button
                  type="submit"
                  disabled={submitting}
                  className="inline-flex h-11 w-full items-center justify-center gap-2 rounded-full bg-primary px-5 text-sm font-semibold text-primary-foreground hover:opacity-90 transition-opacity disabled:cursor-not-allowed disabled:opacity-70"
                >
                  {submitting ? <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" /> : null}
                  Join Waitlist
                </button>
              </form>
            )}
          </div>
        </section>
      </main>
    </div>
  );
}
