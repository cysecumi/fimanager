import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Calendar as CalendarIcon, Plus, Trash2, Clock, CheckCircle2 } from 'lucide-react';
import { useFinanceStore } from '../store/useFinanceStore';
import { translations } from '../translations';
import { cn } from '../lib/utils';
import { format } from 'date-fns';
import { id } from 'date-fns/locale';

export function CalendarTab() {
  const { language, scheduledTransactions, addScheduledTransaction, removeScheduledTransaction, activeWalletId, wallets } = useFinanceStore();
  const t = translations[language];
  const [isModalOpen, setIsModalOpen] = useState(false);
  
  const [desc, setDesc] = useState('');
  const [amount, setAmount] = useState('');
  const [type, setType] = useState<'income' | 'expense'>('income');
  const [date, setDate] = useState(format(new Date(), 'yyyy-MM-dd'));

  const activeWallet = wallets.find(w => w.id === activeWalletId);

  const handleAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const raw = e.target.value.replace(/\D/g, '');
    if (!raw) {
      setAmount('');
      return;
    }
    const num = parseInt(raw);
    const limit = 10000000000;
    if (num > limit) return;
    setAmount(new Intl.NumberFormat('id-ID').format(num));
  };

  const handleAdd = () => {
    const rawValue = amount.replace(/\./g, '');
    const val = parseFloat(rawValue);
    if (isNaN(val) || val <= 0) return;

    addScheduledTransaction({
      walletId: activeWalletId,
      desc: desc.trim() || (type === 'income' ? t.defaultIncomeDesc : t.defaultExpenseDesc),
      amount: val,
      type,
      scheduledDate: new Date(date).toISOString(),
    });

    setDesc('');
    setAmount('');
    setIsModalOpen(false);
  };

  const sortedScheduled = [...(scheduledTransactions || [])].sort((a, b) => 
    new Date(b.scheduledDate).getTime() - new Date(a.scheduledDate).getTime()
  );

  return (
    <div className="space-y-6">
      <div className="bg-[var(--card)] p-6 rounded-3xl shadow-sm border border-[var(--card-border)] flex justify-between items-center transition-all">
        <div>
          <h3 className="text-sm font-black uppercase tracking-widest text-[var(--primary)]">{t.autoPlan}</h3>
          <p className="text-xs text-gray-400">{t.calendar}</p>
        </div>
        <button
          onClick={() => setIsModalOpen(true)}
          className="bg-[var(--primary)] text-white p-3 rounded-2xl shadow-lg hover:opacity-90 active:scale-95 transition-all"
        >
          <Plus size={20} />
        </button>
      </div>

      <div className="space-y-3">
        {sortedScheduled.length === 0 ? (
          <div className="p-12 bg-[var(--card)] rounded-3xl border border-dashed border-[var(--card-border)] text-center">
            <p className="text-gray-400 italic text-sm">{t.noScheduled}</p>
          </div>
        ) : (
          sortedScheduled.map((st) => (
            <motion.div
              key={st.id}
              layout
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="group flex justify-between items-center p-4 bg-[var(--card)] rounded-2xl border border-[var(--card-border)] shadow-sm hover:shadow-md transition-all"
            >
              <div className="flex items-center gap-4">
                <div className={cn(
                  "w-10 h-10 rounded-xl flex items-center justify-center",
                  st.isProcessed ? "bg-gray-100 text-gray-400" : (st.type === 'income' ? "bg-green-50 text-green-600" : "bg-red-50 text-red-600")
                )}>
                  {st.isProcessed ? <CheckCircle2 size={20} /> : <Clock size={20} />}
                </div>
                <div>
                  <p className={cn("font-bold transition-all", st.isProcessed && "opacity-50 line-through")}>
                    {st.desc}
                  </p>
                  <p className="text-[10px] font-black uppercase tracking-widest text-gray-400">
                    {format(new Date(st.scheduledDate), 'dd MMM yyyy', { locale: language === 'id' ? id : undefined })}
                    {st.isProcessed ? ` • ${t.processed}` : ` • ${t.waiting}`}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <div className="text-right">
                  <p className={cn(
                    "text-sm font-black",
                    st.type === 'income' ? "text-green-600" : "text-red-600",
                    st.isProcessed && "opacity-50"
                  )}>
                    {st.type === 'income' ? '+' : '-'}{st.amount.toLocaleString()}
                  </p>
                </div>
                <button
                  onClick={() => removeScheduledTransaction(st.id)}
                  className="opacity-0 group-hover:opacity-100 p-2 text-gray-300 hover:text-red-500 transition-all"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            </motion.div>
          ))
        )}
      </div>

      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsModalOpen(false)}
              className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="relative w-full max-w-sm bg-[var(--card)] rounded-3xl p-6 shadow-2xl flex flex-col gap-6 max-h-[90vh] overflow-y-auto"
            >
              <div>
                <h3 className="text-2xl font-black tracking-tighter text-[var(--primary)] mb-1 font-serif">Fimanager Plan.</h3>
                <p className="text-xs text-gray-400 uppercase font-black tracking-widest">{t.addSchedule}</p>
              </div>

              <div className="space-y-4">
                <div className="flex p-1 bg-[var(--accent)] rounded-2xl">
                  <button
                    onClick={() => setType('income')}
                    className={cn(
                      "flex-1 py-3 rounded-xl font-bold transition-all",
                      type === 'income' ? "bg-[var(--primary)] text-white shadow-md" : "text-gray-500"
                    )}
                  >
                    {t.income}
                  </button>
                  <button
                    onClick={() => setType('expense')}
                    className={cn(
                      "flex-1 py-3 rounded-xl font-bold transition-all",
                      type === 'expense' ? "bg-red-500 text-white shadow-md" : "text-gray-500"
                    )}
                  >
                    {t.expense}
                  </button>
                </div>

                <div className="space-y-1">
                  <p className="text-[10px] font-black uppercase tracking-widest text-gray-400 ml-2">{t.pickDate}</p>
                  <input
                    type="date"
                    className="w-full p-4 bg-gray-50 dark:bg-white/5 border-none rounded-2xl outline-none focus:ring-2 focus:ring-[var(--primary)] transition-all font-mono"
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                  />
                </div>

                <input
                  type="text"
                  placeholder={t.placeholderDesc}
                  className="w-full p-4 bg-gray-50 dark:bg-white/5 border-none rounded-2xl outline-none focus:ring-2 focus:ring-[var(--primary)] transition-all font-medium"
                  value={desc}
                  onChange={(e) => setDesc(e.target.value)}
                />
                <input
                  type="text"
                  inputMode="numeric"
                  placeholder="0"
                  className="w-full p-4 bg-gray-50 dark:bg-white/5 border-none rounded-2xl outline-none focus:ring-2 focus:ring-[var(--primary)] transition-all font-mono text-[var(--text-main)]"
                  value={amount}
                  onChange={handleAmountChange}
                />
              </div>

              <div className="flex gap-2">
                <button
                  onClick={handleAdd}
                  className="flex-1 bg-[var(--primary)] text-white p-4 rounded-2xl font-bold shadow-lg hover:opacity-90 active:scale-95 transition-all"
                >
                  {t.save}
                </button>
                <button
                  onClick={() => setIsModalOpen(false)}
                  className="px-6 bg-[var(--accent)] text-[var(--accent-text)] rounded-2xl font-bold hover:opacity-80 transition-all"
                >
                  {t.cancel}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
