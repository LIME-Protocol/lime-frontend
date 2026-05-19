import { useEffect, useRef } from 'react';

/**
 * Animated hero chart — Polymarket-style live price loop.
 *
 * Performance strategy:
 *  - React renders the SVG skeleton ONCE.
 *  - The rAF loop mutates path `d` + text content via refs (no setState).
 *  - 40 points, throttled to ~5 ticks/sec, so reconciliation cost = 0.
 */

const FLOOR = 3.5;
const CAP = 5.5;
const HISTORY = 40;
const STEP_MS = 200;
const VOLATILITY = 0.06;

const W = 460;
const H = 200;
const PAD_Y = 14;
const MIN_V = FLOOR - 0.3;
const MAX_V = CAP + 0.3;

const xOf = (i: number) => (i / (HISTORY - 1)) * W;
const yOf = (v: number) =>
  H - PAD_Y - ((v - MIN_V) / (MAX_V - MIN_V)) * (H - PAD_Y * 2);

function buildPath(series: number[]) {
  let line = '';
  for (let i = 0; i < series.length; i++) {
    line += `${i === 0 ? 'M' : 'L'}${xOf(i).toFixed(1)} ${yOf(series[i]).toFixed(1)} `;
  }
  return line;
}

function payoffOf(v: number) {
  const raw = ((v - FLOOR) / (CAP - FLOOR)) * 100;
  return Math.max(0, Math.min(100, raw));
}

export default function AnimatedHeroChart() {
  const lineRef = useRef<SVGPathElement>(null);
  const areaRef = useRef<SVGPathElement>(null);
  const dotRef = useRef<SVGCircleElement>(null);
  const pulseRef = useRef<SVGCircleElement>(null);
  const payoffRef = useRef<SVGTextElement>(null);
  const valueRef = useRef<SVGTextElement>(null);

  useEffect(() => {
    const reduced = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;

    // Seed series
    const series: number[] = [];
    for (let i = 0; i < HISTORY; i++) {
      series.push(4.5 + Math.sin(i / 5) * 0.35);
    }

    const apply = () => {
      const last = series[series.length - 1];
      const line = buildPath(series);
      const area = `${line} L${W} ${H} L0 ${H} Z`;
      const lx = xOf(HISTORY - 1);
      const ly = yOf(last);

      lineRef.current?.setAttribute('d', line);
      areaRef.current?.setAttribute('d', area);
      dotRef.current?.setAttribute('cx', String(lx));
      dotRef.current?.setAttribute('cy', String(ly));
      pulseRef.current?.setAttribute('cx', String(lx));
      pulseRef.current?.setAttribute('cy', String(ly));
      if (payoffRef.current) payoffRef.current.textContent = `${payoffOf(last).toFixed(1)}¢`;
      if (valueRef.current) valueRef.current.textContent = `${last.toFixed(2)}%`;
    };

    apply();
    if (reduced) return;

    let raf = 0;
    let lastTick = 0;
    const tick = (now: number) => {
      if (now - lastTick >= STEP_MS) {
        lastTick = now;
        const cur = series[series.length - 1];
        const drift = (4.5 - cur) * 0.04;
        const noise = (Math.random() - 0.5) * 2 * VOLATILITY;
        let next = cur + drift + noise;
        next = Math.max(FLOOR - 0.2, Math.min(CAP + 0.2, next));
        series.shift();
        series.push(next);
        apply();
      }
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, []);

  const floorY = yOf(FLOOR);
  const capY = yOf(CAP);

  return (
    <svg
      viewBox={`0 0 ${W} ${H}`}
      className="w-full h-auto"
      role="img"
      aria-label="Live payoff simulation"
    >
      <defs>
        <linearGradient id="hero-area" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="hsl(var(--primary))" stopOpacity="0.35" />
          <stop offset="100%" stopColor="hsl(var(--primary))" stopOpacity="0" />
        </linearGradient>
      </defs>

      {/* Floor / Cap bands */}
      <line x1="0" y1={floorY} x2={W} y2={floorY} stroke="hsl(var(--border))" strokeDasharray="3 4" />
      <line x1="0" y1={capY} x2={W} y2={capY} stroke="hsl(var(--border))" strokeDasharray="3 4" />
      <text x="6" y={floorY - 4} fontSize="9" fill="hsl(var(--muted-foreground))" fontFamily="JetBrains Mono, monospace">
        FLOOR {FLOOR.toFixed(2)}%
      </text>
      <text x="6" y={capY + 11} fontSize="9" fill="hsl(var(--muted-foreground))" fontFamily="JetBrains Mono, monospace">
        CAP {CAP.toFixed(2)}%
      </text>

      {/* Series — mutated via refs */}
      <path ref={areaRef} fill="url(#hero-area)" />
      <path
        ref={lineRef}
        fill="none"
        stroke="hsl(var(--primary))"
        strokeWidth="2"
        strokeLinejoin="round"
        strokeLinecap="round"
      />

      {/* Pulsing live dot — SMIL handles pulse cheaply on GPU */}
      <circle ref={pulseRef} r="9" fill="hsl(var(--primary))" opacity="0.18">
        <animate attributeName="r" values="6;14;6" dur="1.8s" repeatCount="indefinite" />
        <animate attributeName="opacity" values="0.28;0;0.28" dur="1.8s" repeatCount="indefinite" />
      </circle>
      <circle
        ref={dotRef}
        r="4"
        fill="hsl(var(--primary))"
        stroke="hsl(var(--background))"
        strokeWidth="2"
      />

      {/* Live readout chip */}
      <g transform={`translate(12, ${H - 44})`}>
        <rect width="118" height="34" rx="6" fill="hsl(var(--background))" stroke="hsl(var(--border))" />
        <text x="9" y="14" fontSize="8.5" fill="hsl(var(--muted-foreground))" fontFamily="JetBrains Mono, monospace" letterSpacing="1">
          PAYOFF
        </text>
        <text ref={payoffRef} x="9" y="28" fontSize="14" fontWeight="700" fill="hsl(var(--primary))" fontFamily="JetBrains Mono, monospace" />
        <text x="70" y="14" fontSize="8.5" fill="hsl(var(--muted-foreground))" fontFamily="JetBrains Mono, monospace" letterSpacing="1">
          VALUE
        </text>
        <text ref={valueRef} x="70" y="28" fontSize="13" fontWeight="600" fill="hsl(var(--foreground))" fontFamily="JetBrains Mono, monospace" />
      </g>
    </svg>
  );
}
