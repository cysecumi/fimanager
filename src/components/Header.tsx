import { useFinanceStore } from '../store/useFinanceStore';
import { CurrencyText } from './CurrencyText';
import { Eye, EyeOff } from 'lucide-react';
import { cn } from '../lib/utils';
import { Settings } from './Settings';
import { translations } from '../translations';

export function Header() {
  const { wallets, showBalance, toggleShowBalance, language, theme } = useFinanceStore();
  const t = translations[language];

  const totalNetWorth = wallets.reduce((total, wallet) => {
    return total + wallet.transactions.reduce((acc, t) => 
      t.type === 'income' ? acc + t.amount : acc - t.amount, 0
    );
  }, 0);

  return (
    <header className={cn(
      "p-4 md:p-6 shadow-xl sticky top-0 z-50 transition-all duration-500 text-white",
      theme === 'purple' ? "bg-gradient-to-br from-[#7c3aed] to-[#9333ea]" : "bg-[var(--primary)]"
    )}>
      <div className="max-w-5xl mx-auto flex justify-between items-center">
        <div>
          <h1 className="text-xl md:text-2xl font-black tracking-tighter" style={{ fontFamily: '"Times New Roman", Times, serif' }}>FIMANAGER</h1>
          <p className="text-[10px] uppercase font-bold tracking-widest opacity-70">
            {t.subtitle}
          </p>
        </div>
        <div className="flex items-center gap-2 sm:gap-4">
          <div className="text-right">
            <p className="text-[10px] uppercase font-bold tracking-widest opacity-70">
              {t.totalBalance}
            </p>
            <CurrencyText 
              amount={totalNetWorth} 
              className={cn(
                "font-bold tracking-tight block transition-all",
                totalNetWorth.toString().length > 10 ? "text-base sm:text-xl" : "text-xl sm:text-2xl",
                totalNetWorth < 0 && "text-red-200"
              )}
            />
          </div>
          <div className="flex items-center bg-black/10 rounded-full p-1">
            <button
              onClick={toggleShowBalance}
              className="p-2 hover:bg-white/10 rounded-full transition-colors"
              title={showBalance ? t.hideBalance : t.showBalance}
            >
              {showBalance ? <Eye size={18} /> : <EyeOff size={18} />}
            </button>
            <Settings />
          </div>
        </div>
      </div>
    </header>
  );
}
