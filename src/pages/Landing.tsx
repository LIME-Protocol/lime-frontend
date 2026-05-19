import LandingNav from '@/components/landing/LandingNav';
import Hero from '@/components/landing/Hero';
import PayoffExplainer from '@/components/landing/PayoffExplainer';
import {
  ProtocolSection,
  OrderBookSection,
  CurvesSection,
  UseCasesSection,
  LifecycleSection,
  WhyLimeSection,
  FAQSection,
  CTASection,
  LandingFooter,
} from '@/components/landing/Sections';

export default function Landing() {
  return (
    <div className="dark min-h-screen bg-background text-foreground" style={{ colorScheme: 'dark' }}>
      <LandingNav />
      <main>
        <Hero />
        <ProtocolSection />

        <section
          id="how-it-works"
          className="border-b border-border/60 scroll-mt-24"
          aria-labelledby="how-title"
        >
          <div className="max-w-6xl mx-auto px-6 py-20 md:py-28">
            <div className="max-w-2xl mb-12 md:mb-16 space-y-4">
              <span className="text-[11px] uppercase tracking-widest text-primary font-medium font-['Satoshi']">
                How it works
              </span>
              <h2
                id="how-title"
                className="font-['Satoshi'] text-3xl md:text-5xl font-semibold tracking-tight leading-[1.05]"
                style={{ textWrap: 'balance' as never }}
              >
                Drag the value. Watch the payoff.
              </h2>
              <p className="font-['Satoshi'] text-base md:text-lg text-muted-foreground leading-relaxed">
                A contract is defined by a Variable, a Range [Floor, Cap], and a
                Resolution Date. Payoff scales linearly between the two bounds.
              </p>
            </div>
            <PayoffExplainer />
          </div>
        </section>

        <OrderBookSection />
        <CurvesSection />
        <UseCasesSection />
        <LifecycleSection />
        <WhyLimeSection />
        <FAQSection />
        <CTASection />
      </main>
      <LandingFooter />
    </div>
  );
}
