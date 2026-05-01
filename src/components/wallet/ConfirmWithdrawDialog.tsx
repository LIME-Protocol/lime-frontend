import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  amount: number;
  method: string;
  destination: string;
  onConfirm: () => void;
  loading?: boolean;
}

/**
 * 2-step confirmation dialog used for high-value withdrawals (> $1,000).
 * Requires the user to type the exact amount to enable the confirm button.
 */
export default function ConfirmWithdrawDialog({
  open,
  onOpenChange,
  amount,
  method,
  destination,
  onConfirm,
  loading,
}: Props) {
  const [typed, setTyped] = useState('');
  const expected = amount.toFixed(2);
  const matches = typed.trim() === expected;

  return (
    <Dialog
      open={open}
      onOpenChange={(o) => {
        if (!o) setTyped('');
        onOpenChange(o);
      }}
    >
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Confirm withdrawal</DialogTitle>
          <DialogDescription>
            You're about to withdraw{' '}
            <span className="font-mono font-semibold text-foreground">${expected}</span> via{' '}
            {method} to{' '}
            <span className="font-mono text-foreground">{destination.slice(0, 18)}…</span>.
            Type the amount below to confirm.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-2 py-2">
          <label className="data-label">Type {expected} to confirm</label>
          <Input
            value={typed}
            onChange={(e) => setTyped(e.target.value)}
            placeholder={expected}
            autoFocus
            className="font-mono"
          />
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button disabled={!matches || loading} onClick={onConfirm}>
            {loading ? 'Submitting…' : 'Confirm withdrawal'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
