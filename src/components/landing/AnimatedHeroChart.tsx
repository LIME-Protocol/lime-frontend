import { useEffect, useRef, useState } from 'react';

/**
 * Animated hero chart — Polymarket-style live price loop.
 *
 * Simulates a random-walk "observed value" between Floor and Cap.
 * Renders a scrolling price history sparkline on top + the linear payoff
 * mapping from value to payoff (0¢–100¢) on the right, with a live readout.
 *
 * Pure rAF loop, no external deps. Honors prefers-reduced-motion.
 */

const FLOOR = 3.5;
const CAP = 5.5;
const HISTORY = 80;          // number of points retained in the sparkline
const STEP_MS = 90;          // ms between simulated ticks
const VOLATILITY = 0.06;     // max drift per tick (in %-points)

function payoffOf(v: number) {
  const raw = ((v - FLOOR) / (CAP - FLOOR)) * 100;
  return Math.max(0, Math.min(100, raw));
}

export default function AnimatedHeroChart() {
  const reduced =
    typeof window !== 'undefined' &&
    window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;

  const [series, setSeries] = useState<number[]>(() => {
    // Seed with a gentle sine so first paint already shows a curve
    const seed: number[] = [];
    for (let i = 0; i < HISTORY; i++) {
      seed.push(4.5 + Math.sin(i / 8) * 0.35);
    }
    return seed;
  });
  const valueRef = useRef(series[series.length - 1]);
  const lastTickRef = useRef(0);
  const rafRef = useRef<number | null>(null);

  useEffect(() => {
    if (reduced) return;
    const tick = (now: number) => {
      if (now - lastTickRef.current >= STEP_MS) {
        lastTickRef.current = now;
        // Mean-reverting random walk toward 4.5
        const drift = (4.5 - valueRef.current) * 0.04;
        const noise = (Math.random() - 0.5) * 2 * VOLATILITY;
        let next = valueRef.current + drift + noise;
        // Soft clamp so curve breathes inside [floor−0.2, cap+0.2]
        next = Math.max(FLOOR - 0.2, Math.min(CAP + 0.2, next));
        valueRef.current = next;
        setSeries((s) => [...s.slice(1), next]);
      }
      rafRef.current = requestAnimationFrame(tick);
    };
    rafRef.current = requestAnimationFrame(tick);
    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, [reduced]);

  const current = series[series.length - 1];
  const payoff = payoffOf(current);

  // ── Sparkline geometry ──────────────────────────────────────
  const W = 460;
  const H = 200;
  const padY = 14;
  const minV = FLOOR - 0.3;
  const maxV = CAP + 0.3;
  const xOf = (i: number) => (i / (HISTORY - 1)) * W;
  const yOf = (v: number) =>
    H - padY - ((v - minV) / (maxV - minV)) * (H - padY * 2);

  const linePath = series
    .map((v, i) => `${i === 0 ? 'M' : 'L'}${xOf(i).toFixed(2)} ${yOf(v).toFixed(2)}`)
    .join(' ');
  const areaPath = `${linePath} L${W} ${H} L0 ${H} Z`;

  const floorY = yOf(FLOOR);
  const capY = yOf(CAP);
  const lastX = xOf(HISTORY - 1);
  const lastY = yOf(current);

  return (
    <svg
      viewBox={`0 0 ${W} ${H}`}
      className="w-full h-auto"
      role="img"
      aria-label={`Live payoff simulation. Observed ${current.toFixed(2)} percent, payoff ${payoff.toFixed(1)} cents.`}
    >
      <defs>
        <linearGradient id="hero-area" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="hsl(var(--primary))" stopOpacity="0.35" />
          <stop offset="100%" stopColor="hsl(var(--primary))" stopOpacity="0" />
        </linearGradient>
      </defs>

      {/* Floor / Cap bands */}
      <line
        x1="0"
        y1={floorY}
        x2={W}
        y2={floorY}
        stroke="hsl(var(--border))"
        strokeDasharray="3 4"
      />
      <line
        x1="0"
        y1={capY}
        x2={W}
        y2={capY}
        stroke="hsl(var(--border))"
        strokeDasharray="3 4"
      />
      <text
        x="6"
        y={floorY - 4}
        fontSize="9"
        fill="hsl(var(--muted-foreground))"
        fontFamily="JetBrains Mono, monospace"
      >
        FLOOR {FLOOR.toFixed(2)}%
      </text>
      <text
        x="6"
        y={capY + 11}
        fontSize="9"
        fill="hsl(var(--muted-foreground))"
        fontFamily="JetBrains Mono, monospace"
      >
        CAP {CAP.toFixed(2)}%
      </text>

      {/* Series */}
      <path d={areaPath} fill="url(#hero-area)" />
      <path
        d={linePath}
        fill="none"
        stroke="hsl(var(--primary))"
        strokeWidth="2"
        strokeLinejoin="round"
        strokeLinecap="round"
      />

      {/* Pulsing live dot */}
      <circle
        cx={lastX}
        cy={lastY}
        r="9"
        fill="hsl(var(--primary))"
        opacity="0.18"
      >
        <animate
          attributeName="r"
          values="6;14;6"
          dur="1.8s"
          repeatCount="indefinite"
        />
        <animate
          attributeName="opacity"
          values="0.28;0;0.28"
          dur="1.8s"
          repeatCount="indefinite"
        />
      </circle>
      <circle
        cx={lastX}
        cy={lastY}
        r="4"
        fill="hsl(var(--primary))"
        stroke="hsl(var(--background))"
        strokeWidth="2"
      />

      {/* Live readout chip — bottom-left, doesn't collide with dot */}
      <g transform={`translate(12, ${H - 44})`}>
        <rect
          width="118"
          height="34"
          rx="6"
          fill="hsl(var(--background))"
          stroke="hsl(var(--border))"
        />
        <text
          x="9"
          y="14"
          fontSize="8.5"
          fill="hsl(var(--muted-foreground))"
          fontFamily="JetBrains Mono, monospace"
          letterSpacing="1"
        >
          PAYOFF
        </text>
        <text
          x="9"
          y="28"
          fontSize="14"
          fontWeight="700"
          fill="hsl(var(--primary))"
          fontFamily="JetBrains Mono, monospace"
        >
          {payoff.toFixed(1)}¢
        </text>
        <text
          x="70"
          y="14"
          fontSize="8.5"
          fill="hsl(var(--muted-foreground))"
          fontFamily="JetBrains Mono, monospace"
          letterSpacing="1"
        >
          VALUE
        </text>
        <text
          x="70"
          y="28"
          fontSize="13"
          fontWeight="600"
          fill="hsl(var(--foreground))"
          fontFamily="JetBrains Mono, monospace"
        >
          {current.toFixed(2)}%
        </text>
      </g>
    </svg>
  );
}
