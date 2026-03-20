import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { markets } from '@/lib/mock-data';
import { cn } from '@/lib/utils';
import { Plus, CheckCircle2 } from 'lucide-react';

export default function AdminPage() {
  const [showForm, setShowForm] = useState(false);

  return (
    <div className="max-w-4xl mx-auto px-4 md:px-8 py-8">
      <div className="flex items-center justify-between mb-8 animate-reveal-up">
        <div>
          <h1 className="text-2xl font-bold mb-1">Admin</h1>
          <p className="text-sm text-muted-foreground">Gerenciar mercados</p>
        </div>
        <Button
          onClick={() => setShowForm(!showForm)}
          className="bg-accent text-accent-foreground hover:bg-accent/90 active:scale-[0.97] transition-all"
          size="sm"
        >
          <Plus className="h-4 w-4 mr-1" />
          Novo mercado
        </Button>
      </div>

      {/* Create form */}
      {showForm && (
        <div className="surface-raised rounded-xl border p-6 mb-6 animate-scale-in">
          <h2 className="text-sm font-semibold mb-4">Criar mercado</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
            <FormField label="Título" placeholder="Taxa Selic ao final de 2025" />
            <FormField label="Categoria" placeholder="Juros" />
            <FormField label="Variável" placeholder="Taxa Selic" />
            <FormField label="Unidade" placeholder="% a.a." />
            <FormField label="Piso (L)" placeholder="10.0" type="number" />
            <FormField label="Teto (U)" placeholder="15.0" type="number" />
            <FormField label="Data de resolução" placeholder="2025-12-18" type="date" />
            <FormField label="Fonte de settlement" placeholder="Banco Central" />
          </div>
          <textarea
            placeholder="Descrição do mercado..."
            className="w-full h-20 px-3 py-2 rounded-lg border bg-background text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring/30 resize-none mb-4"
          />
          <div className="flex gap-2">
            <Button className="bg-accent text-accent-foreground hover:bg-accent/90 active:scale-[0.97]" size="sm">
              Criar
            </Button>
            <Button variant="ghost" size="sm" onClick={() => setShowForm(false)}>
              Cancelar
            </Button>
          </div>
        </div>
      )}

      {/* Market list */}
      <div className="space-y-3">
        {markets.map((market, i) => (
          <div
            key={market.id}
            className="surface-raised rounded-xl border p-5 flex items-center justify-between gap-4 animate-reveal-up"
            style={{ animationDelay: `${i * 60}ms` }}
          >
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2 mb-1">
                <Badge variant="secondary" className="text-[11px] px-2 py-0.5">{market.category}</Badge>
                <Badge
                  className={cn(
                    'text-[11px] px-2 py-0.5',
                    market.status === 'active'
                      ? 'bg-info/10 text-info hover:bg-info/10'
                      : 'bg-positive/10 text-positive hover:bg-positive/10'
                  )}
                >
                  {market.status === 'active' ? 'Ativo' : 'Resolvido'}
                </Badge>
              </div>
              <h3 className="text-sm font-semibold truncate">{market.title}</h3>
              <p className="text-xs text-muted-foreground mt-0.5">
                {market.lowerBound} – {market.upperBound} {market.unit} · Resolve em{' '}
                {new Date(market.resolutionDate).toLocaleDateString('pt-BR')}
              </p>
            </div>
            {market.status === 'active' && (
              <Button
                variant="outline"
                size="sm"
                className="shrink-0 text-xs active:scale-[0.97] transition-all"
              >
                <CheckCircle2 className="h-3.5 w-3.5 mr-1" />
                Resolver
              </Button>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

function FormField({ label, placeholder, type = 'text' }: {
  label: string;
  placeholder: string;
  type?: string;
}) {
  return (
    <div>
      <label className="block text-xs text-muted-foreground mb-1">{label}</label>
      <input
        type={type}
        placeholder={placeholder}
        className="w-full h-9 px-3 rounded-lg border bg-background text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring/30"
      />
    </div>
  );
}
