import { AlertCircle } from 'lucide-react';

/**
 * Honest disclosure shown on the Wallet page while real payment rails
 * are not wired up yet. Deposits credit balance instantly (mock); withdrawals
 * hit a real RPC and need admin approval but no real funds move.
 */
export default function SimulationBanner() {
  return (
    <div className="flex items-start gap-3 px-4 py-3 rounded-lg border border-warning/30 bg-warning/5">
      <AlertCircle className="h-4 w-4 text-warning shrink-0 mt-0.5" />
      <div className="space-y-0.5">
        <p className="text-[12px] font-semibold text-foreground">Simulation mode</p>
        <p className="text-[11px] text-muted-foreground leading-relaxed">
          Deposits and withdrawals are not real financial transactions yet. Balances are
          for testing the trading experience. Real payment rails will be enabled at launch.
        </p>
      </div>
    </div>
  );
}
