import { cn, formatIDR } from '../lib/utils';
import { useFinanceStore } from '../store/useFinanceStore';

interface CurrencyTextProps {
  amount: number;
  className?: string;
  showSign?: boolean;
}

export function CurrencyText({ amount, className, showSign }: CurrencyTextProps) {
  const showBalance = useFinanceStore((state) => state.showBalance);
  const isNegative = amount < 0;
  const absAmount = Math.abs(amount);

  if (!showBalance) {
    return (
      <span className={cn('font-mono tracking-widest', className)}>
        {showSign && (isNegative ? '- ' : '+ ')}
        Rp ••••••
      </span>
    );
  }

  return (
    <span className={cn('font-mono', className)}>
      {showSign ? (
        <span className="mr-1">{isNegative ? '- ' : '+ '}</span>
      ) : (
        isNegative && <span className="mr-0.5">-</span>
      )}
      {formatIDR(absAmount)}
    </span>
  );
}
