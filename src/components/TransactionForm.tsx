import React, { useState } from 'react';
import { ArrowDownLeft, ArrowUpRight, Check } from 'lucide-react';
import { useFinanceStore } from '../store/useFinanceStore';
import { cn, MAX_LIMIT } from '../lib/utils';
import { TransactionType } from '../types';
import { translations } from '../translations';

export function TransactionForm() {
  const { activeWalletId, wallets, addTransaction, language } = useFinanceStore();
  const t = translations[language];
  const [desc, setDesc] = useState('');
  const [amount, setAmount] = useState('');
  const [type, setType] = useState<TransactionType>('income');

  const activeWallet = wallets.find((w) => w.id === activeWalletId);

  const handleAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const raw = e.target.value.replace(/\D/g, '');
    if (!raw) {
      setAmount('');
      return;
    }
    const num = parseInt(raw);
    if (num > MAX_LIMIT) return;
    
    // Format for display
    const formatted = new Intl.NumberFormat('id-ID').format(num);
    setAmount(formatted);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const rawValue = amount.replace(/\./g, '');
    const val = parseFloat(rawValue);
    if (isNaN(val) || val <= 0 || val > MAX_LIMIT) return;

    // Use default description if empty
    const finalDesc = desc.trim() || (type === 'income' ? t.defaultIncomeDesc : t.defaultExpenseDesc);

    addTransaction(activeWalletId, {
      desc: finalDesc,
      amount: val,
      type,
    });

    setDesc('');
    setAmount('');
  };

  if (!activeWallet || activeWalletId === 'absolute') return null;

  return (
    <div className="bg-[var(--card)] p-6 rounded-3xl shadow-sm border border-[var(--card-border)] mb-6 transition-all">
      <h3 className="text-sm font-black uppercase tracking-widest text-gray-400 mb-4 text-center sm:text-left">
        {t.tracker}: <span className="text-[var(--primary)]">{activeWallet.name}</span>
      </h3>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex flex-col gap-1">
              <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 ml-1">{language === 'id' ? 'Catatan / Keterangan' : 'Note / Description'}</label>
              <input
                type="text"
                placeholder={t.placeholderDesc}
                className="w-full p-4 bg-gray-50 dark:bg-white/5 border-none text-[var(--text-main)] rounded-2xl outline-none focus:ring-2 focus:ring-[var(--primary)] transition-all font-medium"
                value={desc}
                onChange={(e) => setDesc(e.target.value)}
              />
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 ml-1">{language === 'id' ? 'Jumlah Uang' : 'Amount'}</label>
              <input
                type="text"
                inputMode="numeric"
                placeholder={t.placeholderAmount}
                className="w-full p-4 bg-gray-50 dark:bg-white/5 border-none text-[var(--text-main)] rounded-2xl outline-none focus:ring-2 focus:ring-[var(--primary)] transition-all font-mono"
                value={amount}
                onChange={handleAmountChange}
              />
            </div>
          </div>
          
          <div className="flex p-1 bg-gray-100 dark:bg-white/5 rounded-2xl">
            <button
              type="button"
              onClick={() => setType('expense')}
              className={cn(
                'flex-1 flex items-center justify-center gap-2 py-3 rounded-xl font-bold transition-all',
                type === 'expense' ? 'bg-white dark:bg-[#0f172a] text-red-600 shadow-sm' : 'text-gray-500'
              )}
            >
              <ArrowUpRight size={18} /> {t.expense}
            </button>
            <button
              type="button"
              onClick={() => setType('income')}
              className={cn(
                'flex-1 flex items-center justify-center gap-2 py-3 rounded-xl font-bold transition-all',
                type === 'income' ? 'bg-white dark:bg-[#0f172a] text-green-600 shadow-sm' : 'text-gray-500'
              )}
            >
              <ArrowDownLeft size={18} /> {t.income}
            </button>
          </div>
        </div>

        <div className="flex justify-center">
          <button
            type="submit"
            className="w-full md:w-64 bg-[var(--primary)] text-white py-4 rounded-2xl font-bold shadow-lg opacity-90 hover:opacity-100 active:scale-95 transition-all flex items-center justify-center gap-2"
          >
            <Check size={20} /> {t.save}
          </button>
        </div>
        <p className="text-[10px] text-gray-400 italic text-center">
          {t.maxLimit}
        </p>
      </form>
    </div>
  );
}
