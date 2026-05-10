import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Trash2, ArrowDownLeft, ArrowUpRight, AlertTriangle } from 'lucide-react';
import { format } from 'date-fns';
import { id } from 'date-fns/locale';
import { Transaction } from '../types';
import { useFinanceStore } from '../store/useFinanceStore';
import { CurrencyText } from './CurrencyText';
import { translations } from '../translations';

interface TransactionItemProps {
  transaction: Transaction;
  walletId: string;
}

export const TransactionItem: React.FC<TransactionItemProps> = ({ transaction, walletId }) => {
  const { deleteTransaction, language } = useFinanceStore();
  const t = translations[language];
  const [showConfirm, setShowConfirm] = useState(false);

  const isIncome = transaction.type === 'income';

  const handleDelete = () => {
    deleteTransaction(walletId, transaction.id);
    setShowConfirm(false);
  };

  return (
    <>
      <motion.div
        layout
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="flex justify-between items-center p-4 bg-[var(--card)] rounded-2xl border border-[var(--card-border)] shadow-sm hover:shadow-md transition-all group"
      >
        <div className="flex items-center gap-4">
          <div
            className={`w-12 h-12 rounded-2xl flex items-center justify-center ${
              isIncome 
                ? 'bg-green-50 dark:bg-green-500/10 text-green-600 dark:text-green-400' 
                : 'bg-red-50 dark:bg-red-500/10 text-red-600 dark:text-red-400'
            }`}
          >
            {isIncome ? <ArrowDownLeft size={20} /> : <ArrowUpRight size={20} />}
          </div>
          <div className="flex-1 min-w-0 py-1">
            <div className="flex items-center gap-2 mb-1">
              <p className="font-bold text-base bg-[#acf293] text-black px-3 py-1 rounded-xl leading-snug break-words">
                {transaction.desc}
              </p>
              {(transaction as any).walletName && (
                <span className="shrink-0 text-[8px] font-black uppercase tracking-tighter px-2 py-0.5 bg-blue-100 dark:bg-blue-500/20 text-blue-600 dark:text-blue-400 rounded-full border border-blue-200 dark:border-blue-500/30">
                  {(transaction as any).walletName}
                </span>
              )}
            </div>
            <div className="flex items-center gap-2 opacity-60">
              <p className="text-[10px] font-black uppercase tracking-widest text-gray-400">
                {format(new Date(transaction.date), 'dd MMM yyyy • HH:mm', { locale: language === 'id' ? id : undefined })}
              </p>
            </div>
          </div>
        </div>
        <div className="text-right">
          <CurrencyText
            amount={isIncome ? transaction.amount : -transaction.amount}
            className={`text-sm font-black block ${
              isIncome ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'
            }`}
            showSign
          />
          <button
            onClick={() => setShowConfirm(true)}
            className="opacity-0 group-hover:opacity-100 text-gray-400 hover:text-red-500 transition-all p-1"
          >
            <Trash2 size={14} />
          </button>
        </div>
      </motion.div>

      <AnimatePresence>
        {showConfirm && (
          <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowConfirm(false)}
              className="absolute inset-0 bg-black/40 backdrop-blur-sm"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="relative w-full max-w-xs bg-white dark:bg-[#1e293b] rounded-[2rem] p-6 shadow-2xl text-center"
            >
              <div className="w-16 h-16 bg-red-50 dark:bg-red-500/10 text-red-600 dark:text-red-400 rounded-full flex items-center justify-center mx-auto mb-4 border border-red-100 dark:border-red-500/20">
                <AlertTriangle size={32} />
              </div>
              <h3 className="text-lg font-black text-gray-900 dark:text-white mb-2">{t.confirmDeleteTx}</h3>
              <p className="text-xs text-gray-500 dark:text-gray-400 mb-6 leading-relaxed">
                {t.confirmDeleteTxDesc}
              </p>
              <div className="flex flex-col gap-2">
                <button
                  onClick={handleDelete}
                  className="w-full bg-red-600 text-white py-3 rounded-xl font-bold hover:bg-red-700 active:scale-95 transition-all shadow-lg shadow-red-100 dark:shadow-none"
                >
                  {t.delete}
                </button>
                <button
                  onClick={() => setShowConfirm(false)}
                  className="w-full bg-gray-100 dark:bg-white/10 text-gray-600 dark:text-gray-300 py-3 rounded-xl font-bold hover:bg-gray-200 dark:hover:bg-white/20 transition-all"
                >
                  {t.cancel}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
}
