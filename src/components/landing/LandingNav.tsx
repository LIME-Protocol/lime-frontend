import { Link } from 'react-router-dom';
import { ArrowUpRight } from 'lucide-react';
import logoIcon from '@/assets/logo-icon.png';

const links = [
  { href: '#protocol', label: 'Protocol' },
  { href: '#how-it-works', label: 'How it works' },
  { href: '#use-cases', label: 'Use cases' },
  { href: '#faq', label: 'FAQ' },
];

export default function LandingNav() {
  return (
    <header className="sticky top-0 z-40 backdrop-blur-md bg-background/70 border-b border-border/60">
      <nav
        className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between"
        aria-label="Landing navigation"
      >
        <Link to="/landing" className="flex items-center gap-2.5 group" aria-label="LIME home">
          <img src={logoIcon} alt="" width={28} height={28} className="h-7 w-7" aria-hidden="true" />
          <span
            className="font-['Space_Grotesk'] text-base font-semibold tracking-tight"
            translate="no"
          >
            LIME
          </span>
        </Link>

        <ul className="hidden md:flex items-center gap-7 text-sm text-muted-foreground font-['DM_Sans']">
          {links.map((l) => (
            <li key={l.href}>
              <a
                href={l.href}
                className="hover:text-foreground transition-colors focus-visible:outline-none focus-visible:text-foreground"
              >
                {l.label}
              </a>
            </li>
          ))}
        </ul>

        <Link
          to="/"
          className="group inline-flex items-center gap-1.5 rounded-full bg-primary text-primary-foreground px-4 py-2 text-sm font-medium hover:opacity-90 transition-opacity focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-background"
        >
          Launch App
          <ArrowUpRight
            className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
            aria-hidden="true"
          />
        </Link>
      </nav>
    </header>
  );
}
