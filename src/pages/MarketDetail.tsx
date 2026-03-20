import { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { markets } from '@/lib/mock-data';
import { impliedValue, formatCurrency, formatPrice, calculatePayoff } from '@/lib/types';
import PayoffChart from '@/components/PayoffChart';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, Calendar, ExternalLink, Info } from 'lucide-react';
import { cn } from '@/lib/utils';

export default function MarketDetail() {
  const { id } = useParams();
  const market = markets.find((m) => m.id === id);
  const [side, setSide] = useState<'long' | 'short'>('long');
  const [quantity, setQuantity] = useState('10');

  if (!market) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-20 text-center">
        <p className="text-muted-foreground">Mercado não encontrado</p>
        <Link to="/" className="text-accent text-sm mt-2 inline-block">Voltar</Link>
      </div>
    );
  }

  const implied = impliedValue(market.currentPrice, market.lowerBound, market.upperBound);
  const isResolved = market.status === 'resolved';
  const resolvedPayoff = market.resolvedValue !== undefined
    ? calculatePayoff(market.resolvedValue, market.lowerBound, market.upperBound)
    : undefined;

  return (
    <div className="max-w-4xl mx-auto px-4 md:px-8 py-6">
      <Link to="/" className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors mb-6 animate-fade-in">
        <ArrowLeft className="h-4 w-4" />
        Voltar
      </Link>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Header */}
          <div className="animate-reveal-up">
            <div className="flex items-center gap-2 mb-2">
              <Badge variant="secondary" className="text-[11px]">{market.category}</Badge>
              {isResolved && (
                <Badge className="bg-positive/10 text-positive text-[11px] hover:bg-positive/10">Resolvido</Badge>
              )}
            </div>
            <h1 className="text-xl font-bold leading-tight mb-2">{market.title}</h1>
            <p className="text-sm text-muted-foreground leading-relaxed">{market.description}</p>
          </div>

          {/* Payoff chart */}
          <div className="surface-raised rounded-xl border p-5 animate-reveal-up delay-100">
            <h2 className="text-sm font-semibold mb-4">Estrutura do payoff</h2>
            <PayoffChart
              lower={market.lowerBound}
              upper={market.upperBound}
              currentPrice={market.currentPrice}
              unit={market.unit}
              resolvedValue={market.resolvedValue}
            />
          </div>

          {/* Contract details */}
          <div className="surface-raised rounded-xl border p-5 animate-reveal-up delay-200">
            <h2 className="text-sm font-semibold mb-4">Detalhes do contrato</h2>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <Detail label="Variável" value={market.variable} />
              <Detail label="Unidade" value={market.unit} />
              <Detail label="Piso (L)" value={`${market.lowerBound.toLocaleString()} ${market.unit}`} mono />
              <Detail label="Teto (U)" value={`${market.upperBound.toLocaleString()} ${market.unit}`} mono />
              <Detail
                label="Resolução"
                value={new Date(market.resolutionDate).toLocaleDateString('pt-BR', { day: '2-digit', month: 'long', year: 'numeric' })}
                icon={<Calendar className="h-3 w-3" />}
              />
              <Detail label="Fonte" value={market.settlementSource} />
              {market.resolvedValue !== undefined && (
                <>
                  <Detail label="Valor realizado" value={`${market.resolvedValue} ${market.unit}`} mono highlight />
                  <Detail label="Payoff final" value={`${((resolvedPayoff ?? 0) * 100).toFixed(1)}¢`} mono highlight />
                </>
              )}
            </div>
          </div>

          {/* Rules */}
          <div className="surface-raised rounded-xl border p-5 animate-reveal-up delay-300">
            <div className="flex items-start gap-2.5">
              <Info className="h-4 w-4 text-info mt-0.5 shrink-0" />
              <div className="text-xs text-muted-foreground leading-relaxed space-y-1">
                <p>• Se o valor ficar <strong>abaixo de {market.lowerBound.toLocaleString()}</strong>, o contrato liquida em <strong>0¢</strong></p>
                <p>• Se ficar <strong>acima de {market.upperBound.toLocaleString()}</strong>, liquida em <strong>100¢</strong></p>
                <p>• Entre {market.lowerBound.toLocaleString()} e {market.upperBound.toLocaleString()}, o payoff é <strong>linear</strong></p>
              </div>
            </div>
          </div>
        </div>

        {/* Sidebar: trade panel */}
        <div className="space-y-4">
          {/* Price summary */}
          <div className="surface-raised rounded-xl border p-5 animate-reveal-up delay-100">
            <div className="text-center mb-4">
              <p className="text-xs text-muted-foreground mb-1">Valor implícito</p>
              <p className="text-3xl font-bold font-mono tabular-nums">{implied.toFixed(1)}</p>
              <p className="text-xs text-muted-foreground">{market.unit}</p>
            </div>
            <div className="grid grid-cols-2 gap-3 text-center text-xs">
              <div className="bg-secondary/60 rounded-lg py-2">
                <p className="text-muted-foreground">Preço</p>
                <p className="font-mono font-semibold tabular-nums">{formatPrice(market.currentPrice)}</p>
              </div>
              <div className="bg-secondary/60 rounded-lg py-2">
                <p className="text-muted-foreground">Volume 24h</p>
                <p className="font-mono font-semibold tabular-nums">{formatCurrency(market.volume24h)}</p>
              </div>
            </div>
          </div>

          {/* Trade form */}
          {!isResolved && (
            <div className="surface-raised rounded-xl border p-5 animate-reveal-up delay-200">
              <h3 className="text-sm font-semibold mb-4">Negociar</h3>

              {/* Side toggle */}
              <div className="flex rounded-lg bg-secondary p-0.5 mb-4">
                <button
                  onClick={() => setSide('long')}
                  className={cn(
                    'flex-1 py-2 text-xs font-medium rounded-md transition-all duration-150',
                    side === 'long'
                      ? 'bg-positive text-positive-foreground shadow-sm'
                      : 'text-muted-foreground hover:text-foreground'
                  )}
                >
                  Comprar
                </button>
                <button
                  onClick={() => setSide('short')}
                  className={cn(
                    'flex-1 py-2 text-xs font-medium rounded-md transition-all duration-150',
                    side === 'short'
                      ? 'bg-negative text-negative-foreground shadow-sm'
                      : 'text-muted-foreground hover:text-foreground'
                  )}
                >
                  Vender
                </button>
              </div>

              {/* Quantity */}
              <label className="block text-xs text-muted-foreground mb-1.5">Quantidade</label>
              <input
                type="number"
                min="1"
                value={quantity}
                onChange={(e) => setQuantity(e.target.value)}
                className="w-full h-10 px-3 rounded-lg border bg-background text-sm font-mono tabular-nums focus:outline-none focus:ring-2 focus:ring-ring/30 mb-3"
              />

              <div className="flex justify-between text-xs text-muted-foreground mb-4">
                <span>Custo estimado</span>
                <span className="font-mono tabular-nums font-medium text-foreground">
                  ${(Number(quantity) * (side === 'long' ? market.currentPrice : 1 - market.currentPrice) * 100).toFixed(2)}
                </span>
              </div>

              <Button
                className={cn(
                  'w-full font-medium transition-all duration-150 active:scale-[0.97]',
                  side === 'long'
                    ? 'bg-positive hover:bg-positive/90 text-positive-foreground'
                    : 'bg-negative hover:bg-negative/90 text-negative-foreground'
                )}
              >
                {side === 'long' ? 'Comprar' : 'Vender'} {quantity} contratos
              </Button>
            </div>
          )}

          {/* Volume stats */}
          <div className="surface-raised rounded-xl border p-5 animate-reveal-up delay-300">
            <div className="text-xs space-y-2.5">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Volume total</span>
                <span className="font-mono tabular-nums font-medium">{formatCurrency(market.totalVolume)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Volume 24h</span>
                <span className="font-mono tabular-nums font-medium">{formatCurrency(market.volume24h)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Faixa</span>
                <span className="font-mono tabular-nums font-medium">
                  {market.lowerBound.toLocaleString()} – {market.upperBound.toLocaleString()}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function Detail({ label, value, mono, highlight, icon }: {
  label: string;
  value: string;
  mono?: boolean;
  highlight?: boolean;
  icon?: React.ReactNode;
}) {
  return (
    <div>
      <p className="text-[11px] text-muted-foreground mb-0.5">{label}</p>
      <p className={cn(
        'text-sm',
        mono && 'font-mono tabular-nums',
        highlight && 'text-positive font-semibold',
      )}>
        {icon && <span className="inline-flex mr-1 align-middle">{icon}</span>}
        {value}
      </p>
    </div>
  );
}
