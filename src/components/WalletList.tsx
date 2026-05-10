import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Plus, X, WalletIcon, AlertTriangle, AlertCircle, Shield } from 'lucide-react';
import { useFinanceStore } from '../store/useFinanceStore';
import { cn, MAX_LIMIT } from '../lib/utils';
import { CurrencyText } from './CurrencyText';
import { translations } from '../translations';

export function WalletList() {
  const { wallets, activeWalletId, setActiveWallet, addWallet, deleteWallet, language } = useFinanceStore();
  const t = translations[language];
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);
  const [name, setName] = useState('');
  const [initial, setInitial] = useState('');
  const [isEmergency, setIsEmergency] = useState(false);

  const activeWallets = wallets.filter(w => !w.isArchived);

  const totalNetWorth = activeWallets.reduce((total, wallet) => {
    const balance = wallet.transactions.reduce(
      (acc, t) => (t.type === 'income' ? acc + t.amount : acc - t.amount),
      0
    );
    return total + balance;
  }, 0);

  const handleInitialChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const raw = e.target.value.replace(/\D/g, '');
    if (!raw) {
      setInitial('');
      return;
    }
    const num = parseInt(raw);
    if (num > MAX_LIMIT) return;
    setInitial(new Intl.NumberFormat('id-ID').format(num));
  };

  const handleAdd = () => {
    const rawValue = initial.replace(/\./g, '');
    const val = parseFloat(rawValue) || 0;
    if (!name) return;
    if (val > MAX_LIMIT) return;
    addWallet(name, val, isEmergency);
    setName('');
    setInitial('');
    setIsEmergency(false);
    setIsModalOpen(false);
  };

  const handleConfirmDelete = () => {
    if (deleteConfirmId) {
      deleteWallet(deleteConfirmId);
      setDeleteConfirmId(null);
    }
  };

  return (
    <section className="mb-6 px-4">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-sm font-black uppercase tracking-widest text-gray-400">{t.wallets}</h2>
        <button
          onClick={() => setIsModalOpen(true)}
          className="flex items-center gap-1 text-xs bg-[var(--accent)] text-[var(--accent-text)] px-3 py-1.5 rounded-full font-bold transition-colors"
        >
          <Plus size={14} /> {t.add}
        </button>
      </div>

      <div className="flex gap-4 overflow-x-auto pb-4 no-scrollbar -mx-4 px-4">
        {/* Absolute Wallet Card */}
        <motion.div
          layout
          onClick={() => setActiveWallet('absolute')}
          className={cn(
            'relative min-w-[180px] md:min-w-[220px] p-4 md:p-6 rounded-2xl border-2 transition-all cursor-pointer overflow-hidden',
            activeWalletId === 'absolute' 
              ? 'bg-black dark:bg-white text-white dark:text-black border-black dark:border-white shadow-lg' 
              : 'bg-[var(--card)] border-[var(--card-border)] text-[var(--text-main)] hover:border-[var(--primary)] shadow-sm'
          )}
        >
          <div className="flex justify-between items-start mb-2 md:mb-4">
            <div className={cn(
              "p-1.5 rounded-lg",
              activeWalletId === 'absolute' ? "bg-white/20" : "bg-[var(--accent)] text-[var(--accent-text)]"
            )}>
              <Shield size={14} className="md:w-5 md:h-5" />
            </div>
          </div>
          <p className={cn(
            "text-[10px] md:text-xs font-black uppercase tracking-widest truncate mb-1",
            activeWalletId === 'absolute' ? "opacity-60" : "text-gray-400"
          )}>
            {t.absoluteWallet}
          </p>
          <CurrencyText 
            amount={totalNetWorth} 
            className={cn(
              "font-bold",
              totalNetWorth.toString().length > 10 ? "text-base md:text-xl" : "text-lg md:text-2xl"
            )} 
          />
        </motion.div>

        {activeWallets.map((wallet) => {
          const balance = wallet.transactions.reduce(
            (acc, t) => (t.type === 'income' ? acc + t.amount : acc - t.amount),
            0
          );
          const isActive = activeWalletId === wallet.id;
          const isExtreme = wallet.isEmergency && balance < 0;
          const isStandardEmergency = wallet.isEmergency && balance >= 0;

          return (
            <motion.div
              key={wallet.id}
              layout
              onClick={() => setActiveWallet(wallet.id)}
              className={cn(
                'relative min-w-[180px] md:min-w-[220px] p-4 md:p-6 rounded-2xl border-2 transition-all cursor-pointer overflow-hidden',
                // Active States
                isActive && !wallet.isEmergency && 'bg-[var(--primary)] border-[var(--primary)] text-white shadow-lg',
                isActive && isStandardEmergency && 'bg-orange-500 border-orange-500 text-white shadow-lg shadow-orange-200',
                isActive && isExtreme && 'bg-red-600 border-red-600 text-white shadow-lg shadow-red-200 animate-pulse',
                
                // Inactive States
                !isActive && !wallet.isEmergency && 'bg-[var(--card)] border-[var(--card-border)] text-[var(--text-main)] hover:border-[var(--primary)] shadow-sm',
                !isActive && isStandardEmergency && 'bg-orange-50 dark:bg-orange-500/10 border-orange-200 dark:border-orange-500/20 text-orange-900 dark:text-orange-200 hover:border-orange-400 shadow-sm',
                !isActive && isExtreme && 'bg-red-50 dark:bg-red-500/10 border-red-200 dark:border-red-500/20 text-red-900 dark:text-red-200 hover:border-red-400 shadow-sm'
              )}
            >
              <div className="flex justify-between items-start mb-2 md:mb-4">
                <div className="flex items-center gap-1">
                  {wallet.isEmergency && (
                    <AlertTriangle size={10} className={isActive ? 'text-white' : 'text-orange-500'} />
                  )}
                  <p className={cn('text-[10px] md:text-xs font-black uppercase tracking-wide truncate pr-6', 
                    isActive ? 'text-white opacity-80' : 'text-gray-400'
                  )}>
                    {wallet.name}
                  </p>
                </div>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setDeleteConfirmId(wallet.id);
                  }}
                  className={cn('absolute top-2 right-2 md:top-4 md:right-4 p-1 rounded-full', 
                    isActive ? 'hover:bg-black/10 text-white/50' : 'hover:bg-gray-100 text-gray-300'
                  )}
                >
                  <X size={12} className="md:w-4 md:h-4" />
                </button>
              </div>
              <CurrencyText 
                amount={balance} 
                className={cn(
                  'font-bold',
                  balance.toString().length > 10 ? 'text-base md:text-xl' : 'text-lg md:text-2xl',
                  balance < 0 && !isActive && 'text-red-600'
                )} 
              />
              {isActive && (
                <motion.div
                  layoutId="active-bg"
                  className="absolute -right-4 -bottom-4 opacity-10"
                >
                  {wallet.isEmergency ? <AlertTriangle size={80} className="md:w-32 md:h-32" /> : <WalletIcon size={80} className="md:w-32 md:h-32" />}
                </motion.div>
              )}
            </motion.div>
          );
        })}
      </div>

      {/* Deletion Confirmation Modal */}
      <AnimatePresence>
        {deleteConfirmId && (
          <div className="fixed inset-0 z-[110] flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setDeleteConfirmId(null)}
              className="absolute inset-0 bg-black/60 backdrop-blur-md"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="relative w-full max-w-xs md:max-w-sm bg-white dark:bg-[#1e293b] rounded-[2.5rem] p-8 shadow-2xl text-center max-h-[90vh] overflow-y-auto"
            >
              <div className="w-20 h-20 bg-red-50 dark:bg-red-500/10 text-red-600 dark:text-red-400 rounded-full flex items-center justify-center mx-auto mb-6 shadow-sm border border-red-100 dark:border-red-500/20">
                <AlertCircle size={40} />
              </div>
              <h3 className="text-xl font-black text-gray-900 dark:text-white mb-2">{t.confirmDelete}</h3>
              <p className="text-sm text-gray-500 dark:text-gray-400 mb-8 leading-relaxed">
                {t.confirmDeleteDesc}
              </p>
              <div className="flex flex-col gap-3">
                <button
                  onClick={handleConfirmDelete}
                  className="w-full bg-red-600 text-white py-4 rounded-2xl font-bold hover:bg-red-700 active:scale-95 transition-all shadow-lg shadow-red-100 dark:shadow-none"
                >
                  {t.yesHide}
                </button>
                <button
                  onClick={() => setDeleteConfirmId(null)}
                  className="w-full bg-gray-100 dark:bg-white/10 text-gray-600 dark:text-gray-300 py-4 rounded-2xl font-bold hover:bg-gray-200 dark:hover:bg-white/20 transition-all"
                >
                  {t.cancel}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsModalOpen(false)}
              className="absolute inset-0 bg-black/40 backdrop-blur-sm"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="relative w-full max-w-sm bg-white dark:bg-[#1e293b] rounded-3xl p-6 shadow-2xl dark:text-white"
            >
              <h3 className="text-xl font-bold mb-4">{t.add} {t.wallets}</h3>
              <div className="space-y-4">
                <div className="space-y-1">
                  <label className="text-[10px] font-black uppercase tracking-widest text-gray-400">{t.walletName}</label>
                  <input
                    type="text"
                    placeholder={t.placeholderDesc}
                    className="w-full p-4 bg-gray-50 dark:bg-white/5 dark:text-white border-none rounded-2xl outline-none focus:ring-2 focus:ring-blue-400 transition-all font-medium"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-black uppercase tracking-widest text-gray-400">{t.initialBalance}</label>
                  <input
                    type="text"
                    inputMode="numeric"
                    placeholder="0"
                    className="w-full p-4 bg-gray-50 dark:bg-white/5 dark:text-white border-none rounded-2xl outline-none focus:ring-2 focus:ring-blue-400 transition-all font-mono"
                    value={initial}
                    onChange={handleInitialChange}
                  />
                </div>
                
                <label className="flex items-center gap-3 p-4 bg-orange-50 dark:bg-orange-500/10 rounded-2xl cursor-pointer group hover:bg-orange-100 dark:hover:bg-orange-500/20 transition-colors">
                  <div className={cn(
                    'w-6 h-6 rounded-lg border-2 flex items-center justify-center transition-all',
                    isEmergency ? 'bg-orange-500 border-orange-500 text-white' : 'border-orange-200 dark:border-orange-500/40 bg-white dark:bg-transparent'
                  )}>
                    {isEmergency && <Plus size={16} strokeWidth={4} />}
                  </div>
                  <input
                    type="checkbox"
                    className="hidden"
                    checked={isEmergency}
                    onChange={(e) => setIsEmergency(e.target.checked)}
                  />
                  <div>
                    <p className="text-sm font-bold text-orange-900 dark:text-orange-200">{t.emergency}</p>
                    <p className="text-[10px] text-orange-700 dark:text-orange-400 opacity-70">{t.emergencyDesc}</p>
                  </div>
                </label>

                <div className="flex gap-3 pt-2">
                  <button
                    onClick={handleAdd}
                    className="flex-1 bg-[var(--primary)] text-white p-4 rounded-2xl font-bold shadow-lg hover:opacity-90 active:scale-95 transition-all"
                  >
                    {t.save}
                  </button>
                  <button
                    onClick={() => {
                      setIsModalOpen(false);
                      setIsEmergency(false);
                    }}
                    className="px-6 bg-gray-100 dark:bg-white/10 text-gray-600 dark:text-gray-300 rounded-2xl font-bold hover:bg-gray-200 dark:hover:bg-white/20 transition-all"
                  >
                    {t.cancel}
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </section>
  );
}
