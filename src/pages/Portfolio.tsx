import { positions } from '@/lib/mock-data';
import { formatPrice } from '@/lib/types';
import { Link } from 'react-router-dom';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

export default function PortfolioPage() {
  const totalPnl = positions.reduce((sum, p) => sum + p.pnl, 0);

  return (
    <div className="max-w-4xl mx-auto px-4 md:px-8 py-8">
      <div className="mb-8 animate-reveal-up">
        <h1 className="text-2xl font-bold mb-1">Portfólio</h1>
        <p className="text-sm text-muted-foreground">Suas posições abertas</p>
      </div>

      {/* Summary */}
      <div className="surface-raised rounded-xl border p-5 mb-6 animate-reveal-up delay-100">
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
          <div>
            <p className="text-xs text-muted-foreground mb-0.5">Posições</p>
            <p className="text-xl font-bold font-mono tabular-nums">{positions.length}</p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground mb-0.5">P&L total</p>
            <p className={cn(
              'text-xl font-bold font-mono tabular-nums',
              totalPnl >= 0 ? 'text-positive' : 'text-negative'
            )}>
              {totalPnl >= 0 ? '+' : ''}{totalPnl.toFixed(1)}
            </p>
          </div>
        </div>
      </div>

      {/* Positions list */}
      <div className="space-y-3">
        {positions.map((pos, i) => (
          <Link
            key={pos.id}
            to={`/market/${pos.marketId}`}
            className="block surface-raised rounded-xl border p-5 transition-all duration-200 hover:border-accent/30 active:scale-[0.98] animate-reveal-up"
            style={{ animationDelay: `${(i + 2) * 80}ms` }}
          >
            <div className="flex items-start justify-between gap-4">
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <Badge
                    variant="secondary"
                    className={cn(
                      'text-[11px] px-2 py-0.5',
                      pos.side === 'long' ? 'bg-positive/10 text-positive' : 'bg-negative/10 text-negative'
                    )}
                  >
                    {pos.side === 'long' ? 'Long' : 'Short'}
                  </Badge>
                  <Badge variant="secondary" className="text-[11px] px-2 py-0.5">
                    {pos.market.category}
                  </Badge>
                </div>
                <h3 className="text-sm font-semibold truncate">{pos.market.title}</h3>
                <div className="flex items-center gap-4 mt-2 text-xs text-muted-foreground">
                  <span>Qtd: <span className="font-mono tabular-nums">{pos.quantity}</span></span>
                  <span>Entrada: <span className="font-mono tabular-nums">{formatPrice(pos.entryPrice)}</span></span>
                  <span>Atual: <span className="font-mono tabular-nums">{formatPrice(pos.currentPrice)}</span></span>
                </div>
              </div>
              <div className="text-right shrink-0">
                <p className={cn(
                  'text-lg font-bold font-mono tabular-nums',
                  pos.pnl >= 0 ? 'text-positive' : 'text-negative'
                )}>
                  {pos.pnl >= 0 ? '+' : ''}{pos.pnl.toFixed(1)}
                </p>
                <p className={cn(
                  'text-xs font-mono tabular-nums',
                  pos.pnl >= 0 ? 'text-positive' : 'text-negative'
                )}>
                  {pos.pnlPercent >= 0 ? '+' : ''}{pos.pnlPercent.toFixed(1)}%
                </p>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
