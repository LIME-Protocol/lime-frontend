/**
 * Chart formatting utilities for consistent X-axis display across all charts.
 */

/** Format a numeric value for chart axis ticks with appropriate precision */
export function formatAxisValue(value: number, unit: string): string {
  const abs = Math.abs(value);
  
  // Large numbers: abbreviate
  if (abs >= 1_000_000) return `${(value / 1_000_000).toFixed(1)}M`;
  if (abs >= 10_000) return `${(value / 1_000).toFixed(0)}K`;
  if (abs >= 1_000) return `${(value / 1_000).toFixed(1)}K`;
  
  // Small decimals (e.g., FX rates)
  if (abs < 10 && abs !== 0) {
    const decimals = abs < 1 ? 3 : abs < 10 ? 2 : 1;
    return value.toFixed(decimals);
  }
  
  return value.toFixed(abs % 1 === 0 ? 0 : 1);
}

/** Format value with unit suffix for chart tooltips */
export function formatAxisLabel(value: number, unit: string): string {
  const formatted = formatAxisValue(value, unit);
  if (!unit) return formatted;
  
  // Prefix units (like $)
  if (unit === '$' || unit === '$/oz' || unit === '$/bbl') {
    return `$${formatted}`;
  }
  
  return `${formatted} ${unit}`;
}

/** Build a tick formatter function for Recharts XAxis */
export function createXAxisFormatter(unit: string) {
  return (value: number) => formatAxisValue(value, unit);
}
