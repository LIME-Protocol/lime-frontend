import type { ReactNode } from 'react';

interface SectionProps {
  emoji: string;
  title: string;
  subtitle?: string;
  children: ReactNode;
  delay: number;
}

export default function Section({ emoji, title, subtitle, children, delay }: SectionProps) {
  return (
    <div className={`space-y-3 animate-reveal-up stagger-${delay}`}>
      <div className="flex items-center gap-3">
        <span className="text-xl">{emoji}</span>
        <div>
          <h2 className="text-sm font-semibold">{title}</h2>
          {subtitle && <p className="text-[11px] text-muted-foreground">{subtitle}</p>}
        </div>
      </div>
      <div className="border-t border-border/50 pt-4">{children}</div>
    </div>
  );
}
