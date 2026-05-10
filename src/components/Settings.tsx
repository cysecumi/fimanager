import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Settings as SettingsIcon, X, Languages, Palette, Archive, Trash2, RotateCcw, Moon, Sun, AlertTriangle, Shield, Unlock, Lock, Plus } from 'lucide-react';
import { useFinanceStore } from '../store/useFinanceStore';
import { translations } from '../translations';
import { cn, MAX_LIMIT } from '../lib/utils';
import { ThemeColor, Language } from '../types';

export function Settings() {
  const [isOpen, setIsOpen] = useState(false);
  const [deletePermanentlyId, setDeletePermanentlyId] = useState<string | null>(null);

  const { 
    language, setLanguage, 
    theme, setTheme, 
    isDarkMode, toggleDarkMode,
    wallets, vaults, addVault, deleteVault,
    addVaultTransaction, deleteVaultTransaction,
    addVaultNote, deleteVaultNote 
  } = useFinanceStore();
  const t = translations[language];

  const [isAddingVault, setIsAddingVault] = useState(false);
  const [vaultName, setVaultName] = useState('');
  const [vaultPin, setVaultPin] = useState('');

  const [activeVaultId, setActiveVaultId] = useState<string | null>(null);
  const [vaultEntryPin, setVaultEntryPin] = useState('');
  const [showVaultContent, setShowVaultContent] = useState(false);
  const [vaultError, setVaultError] = useState(false);
  const [vaultView, setVaultView] = useState<'transactions' | 'notes'>('transactions');

  // Vault form states
  const [isAddingVaultTx, setIsAddingVaultTx] = useState(false);
  const [vTxDesc, setVTxDesc] = useState('');
  const [vTxAmount, setVTxAmount] = useState('');
  const [vTxType, setVTxType] = useState<'income' | 'expense'>('income');

  const [isAddingVaultNote, setIsAddingVaultNote] = useState(false);
  const [vNoteTitle, setVNoteTitle] = useState('');
  const [vNoteContent, setVNoteContent] = useState('');

  const activeVault = vaults.find(v => v.id === activeVaultId);

  const vaultBalance = activeVault?.transactions.reduce(
    (acc, t) => (t.type === 'income' ? acc + t.amount : acc - t.amount),
    0
  ) || 0;

  const themes: { id: ThemeColor; color: string; label: string }[] = [
    { id: 'blue-light', color: 'bg-blue-400', label: 'Biru Muda (Default)' },
    { id: 'blue-dark', color: 'bg-[#0a0f2c]', label: 'Biru Tua (Mode Gelap)' },
    { id: 'pink', color: 'bg-pink-400', label: 'Merah Muda (Pink)' },
    { id: 'green', color: 'bg-emerald-500', label: 'Hijau Muda' },
    { id: 'purple', color: 'bg-gradient-to-br from-purple-500 to-indigo-600', label: 'Ungu Gradient' },
  ];

  const archivedWallets = wallets.filter((w) => w.isArchived);

  const deleteWalletName = wallets.find(w => w.id === deletePermanentlyId)?.name;

  const handleVTxAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const raw = e.target.value.replace(/\D/g, '');
    if (!raw) {
      setVTxAmount('');
      return;
    }
    const num = parseInt(raw);
    if (num > MAX_LIMIT) return;
    setVTxAmount(new Intl.NumberFormat('id-ID').format(num));
  };

  const handlePermanentDelete = (id: string) => {
    setDeletePermanentlyId(id);
  };

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className="p-2 hover:bg-white/10 rounded-full transition-colors"
        title={t.settings}
      >
        <SettingsIcon size={20} />
      </button>

      <AnimatePresence>
        {isOpen && (
          <div className="fixed inset-0 z-[150] flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsOpen(false)}
              className="absolute inset-0 bg-black/60 backdrop-blur-md"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative w-full max-w-lg bg-[var(--card)] rounded-[2rem] md:rounded-[3rem] p-6 md:p-8 shadow-2xl flex flex-col max-h-[90vh] text-[var(--text-main)] overflow-hidden"
            >
              <div className="flex justify-between items-center mb-6 md:mb-8">
                <h2 className="text-2xl font-black tracking-tighter text-[var(--primary)] font-serif">
                  Fimanager
                </h2>
                <button
                  onClick={() => setIsOpen(false)}
                  className="p-2 bg-gray-100 dark:bg-white/10 text-gray-400 rounded-full hover:text-gray-600 dark:hover:text-white"
                >
                  <X size={20} />
                </button>
              </div>

              <div className="flex-1 overflow-y-auto space-y-8 pr-2 no-scrollbar">
                {/* Visual Mode */}
                <section>
                  <div className="flex items-center gap-2 mb-4">
                    <Sun size={16} className="text-gray-400" />
                    <h3 className="text-[10px] font-black uppercase tracking-widest text-gray-400">
                      Visual
                    </h3>
                  </div>
                  <div className="flex p-1 bg-gray-100 dark:bg-white/5 rounded-2xl">
                    <button
                      onClick={() => !isDarkMode && toggleDarkMode()}
                      className={cn(
                        'flex-1 py-3 rounded-xl font-bold transition-all flex items-center justify-center gap-2',
                        isDarkMode ? 'bg-[var(--primary)] text-white shadow-sm' : 'text-gray-500'
                      )}
                    >
                      <Moon size={16} /> {t.darkMode}
                    </button>
                    <button
                      onClick={() => isDarkMode && toggleDarkMode()}
                      className={cn(
                        'flex-1 py-3 rounded-xl font-bold transition-all flex items-center justify-center gap-2',
                        !isDarkMode ? 'bg-[var(--primary)] text-white shadow-sm' : 'text-gray-500'
                      )}
                    >
                      <Sun size={16} /> {t.lightMode}
                    </button>
                  </div>
                </section>

                {/* Language Settings */}
                <section>
                  <div className="flex items-center gap-2 mb-4">
                    <Languages size={16} className="text-gray-400" />
                    <h3 className="text-[10px] font-black uppercase tracking-widest text-gray-400">
                      {t.language}
                    </h3>
                  </div>
                  <div className="flex p-1 bg-gray-100 dark:bg-white/5 rounded-2xl">
                    <button
                      onClick={() => setLanguage('id')}
                      className={cn(
                        'flex-1 py-3 rounded-xl font-bold transition-all',
                        language === 'id' ? 'bg-[var(--primary)] text-white shadow-sm' : 'text-gray-500'
                      )}
                    >
                      Indonesian
                    </button>
                    <button
                      onClick={() => setLanguage('en')}
                      className={cn(
                        'flex-1 py-3 rounded-xl font-bold transition-all',
                        language === 'en' ? 'bg-[var(--primary)] text-white shadow-sm' : 'text-gray-500'
                      )}
                    >
                      English
                    </button>
                  </div>
                </section>

                {/* Theme Settings */}
                <section>
                  <div className="flex items-center gap-2 mb-4">
                    <Palette size={16} className="text-gray-400" />
                    <h3 className="text-[10px] font-black uppercase tracking-widest text-gray-400">
                      {t.theme}
                    </h3>
                  </div>
                  <div className="flex flex-wrap gap-3">
                    {themes.map((th) => (
                      <button
                        key={th.id}
                        onClick={() => setTheme(th.id)}
                        className={cn(
                          'w-12 h-12 rounded-2xl border-4 transition-all flex items-center justify-center',
                          th.color,
                          theme === th.id ? 'border-[var(--primary)] scale-110 shadow-lg' : 'border-transparent opacity-60'
                        )}
                        title={th.label}
                      >
                        {theme === th.id && <div className="w-2 h-2 bg-white rounded-full" />}
                      </button>
                    ))}
                  </div>
                </section>

                {/* Reset Balance Section */}
                <section>
                  <div className="flex items-center gap-2 mb-4">
                    <RotateCcw size={16} className="text-gray-400" />
                    <h3 className="text-[10px] font-black uppercase tracking-widest text-gray-400">
                      {t.resetBalance}
                    </h3>
                  </div>
                  <p className="text-[10px] text-gray-400 mb-4 px-1 leading-relaxed">
                    {t.resetBalanceDesc}
                  </p>
                  
                  <div className="space-y-3">
                    {wallets.filter(w => !w.isArchived).map(wallet => {
                      const balance = wallet.transactions.reduce(
                        (acc, tx) => (tx.type === 'income' ? acc + tx.amount : acc - tx.amount),
                        0
                      );
                      const isNegative = balance < 0;

                      return (
                        <div key={wallet.id} className="flex justify-between items-center p-4 bg-gray-50 dark:bg-white/5 rounded-2xl border border-gray-200 dark:border-white/10">
                          <div>
                            <p className="font-bold text-gray-800 dark:text-white text-sm">{wallet.name}</p>
                            <p className={cn("text-[10px] font-bold", isNegative ? "text-red-500" : "text-gray-400")}>
                               {balance.toLocaleString('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 })}
                            </p>
                          </div>
                          <button
                            onClick={() => {
                              if (isNegative) {
                                useFinanceStore.getState().resetWalletBalance(wallet.id);
                              }
                            }}
                            disabled={!isNegative}
                            className={cn(
                              "px-4 py-2 rounded-xl font-bold text-[10px] uppercase tracking-widest transition-all",
                              isNegative 
                                ? "bg-red-500 text-white shadow-md active:scale-95" 
                                : "bg-gray-100 dark:bg-white/10 text-gray-400 cursor-not-allowed"
                            )}
                          >
                            Reset
                          </button>
                        </div>
                      );
                    })}
                  </div>
                </section>

                {/* Vault Section */}
                <section>
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-2">
                      <Shield size={16} className="text-gray-400" />
                      <h3 className="text-[10px] font-black uppercase tracking-widest text-gray-400">
                        {t.vault}
                      </h3>
                    </div>
                    <button
                      onClick={() => setIsAddingVault(true)}
                      className="text-[10px] font-black uppercase tracking-widest text-[var(--primary)] hover:underline"
                    >
                      {t.add}
                    </button>
                  </div>

                  {vaults.length === 0 ? (
                    <div className="p-6 bg-gray-50 dark:bg-white/5 rounded-2xl border border-dashed border-gray-200 dark:border-white/10 text-center">
                      <p className="text-xs text-gray-400 italic">{t.vaultEmpty}</p>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {vaults.map((v) => (
                        <div
                          key={v.id}
                          className="flex justify-between items-center p-4 bg-gray-50 dark:bg-white/5 rounded-2xl border border-gray-200 dark:border-white/10"
                        >
                          <div className="flex items-center gap-3">
                            <div className="p-2 bg-[var(--accent)] text-[var(--accent-text)] rounded-xl">
                              <Lock size={16} />
                            </div>
                            <div>
                              <p className="font-bold text-gray-800 dark:text-white line-clamp-1">{v.name}</p>
                              <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">
                                Locked
                              </p>
                            </div>
                          </div>
                          <div className="flex gap-2">
                            <button
                              onClick={() => {
                                setActiveVaultId(v.id);
                                setVaultEntryPin('');
                                setShowVaultContent(false);
                              }}
                              className="px-4 py-2 bg-gray-100 dark:bg-white/10 text-gray-600 dark:text-gray-300 rounded-xl font-bold text-xs transition-colors"
                            >
                              Open
                            </button>
                            <button
                              onClick={() => deleteVault(v.id)}
                              className="p-2 text-gray-300 hover:text-red-500 transition-colors"
                            >
                              <Trash2 size={16} />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </section>

                {/* Archive History */}
                <section>
                  <div className="flex items-center gap-2 mb-4">
                    <Archive size={16} className="text-gray-400" />
                    <h3 className="text-[10px] font-black uppercase tracking-widest text-gray-400">
                      {t.archivedWallets}
                    </h3>
                  </div>
                  {archivedWallets.length === 0 ? (
                    <div className="p-6 bg-gray-50 dark:bg-white/5 rounded-2xl border border-dashed border-gray-200 dark:border-white/10 text-center">
                      <p className="text-xs text-gray-400 italic">Tidak ada dompet terarsip</p>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {archivedWallets.map((w) => (
                        <div
                          key={w.id}
                          className="flex justify-between items-center p-4 bg-gray-50 dark:bg-white/5 rounded-2xl border border-gray-200 dark:border-white/10"
                        >
                          <div>
                            <p className="font-bold text-gray-800 dark:text-white">{w.name}</p>
                            <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">
                              {w.transactions.length} Transaksi
                            </p>
                          </div>
                          <div className="flex gap-2">
                            <button
                              onClick={() => {
                                useFinanceStore.setState((state) => ({
                                  wallets: state.wallets.map((wallet) =>
                                    wallet.id === w.id ? { ...wallet, isArchived: false } : wallet
                                  ),
                                }));
                              }}
                              className="p-2 bg-blue-50 text-blue-600 rounded-xl hover:bg-blue-100 transition-colors"
                              title={t.unarchive}
                            >
                              <RotateCcw size={16} />
                            </button>
                            <button
                              onClick={() => handlePermanentDelete(w.id)}
                              className="p-2 bg-red-50 text-red-600 rounded-xl hover:bg-red-100 transition-colors"
                              title={t.deletePermanently}
                            >
                              <Trash2 size={16} />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </section>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {deletePermanentlyId && (
          <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setDeletePermanentlyId(null)}
              className="absolute inset-0 bg-black/80 backdrop-blur-sm"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="relative w-full max-w-xs md:max-w-sm bg-white dark:bg-[#1e293b] rounded-[2rem] md:rounded-[2.5rem] p-6 md:p-8 shadow-2xl text-center max-h-[90vh] overflow-y-auto"
            >
              <div className="w-20 h-20 bg-red-50 dark:bg-red-500/10 text-red-600 dark:text-red-400 rounded-full flex items-center justify-center mx-auto mb-6 shadow-sm border border-red-100 dark:border-red-500/20">
                <AlertTriangle size={40} />
              </div>
              <h3 className="text-xl font-black text-gray-900 dark:text-white mb-2">{t.confirmDeletePermanently}</h3>
              <p className="font-bold text-red-600 dark:text-red-400 mb-2 uppercase text-[10px] tracking-widest">{deleteWalletName}</p>
              <p className="text-sm text-gray-500 dark:text-gray-400 mb-8 leading-relaxed">
                {t.confirmDeletePermanentlyDesc}
              </p>
              <div className="flex flex-col gap-3">
                <button
                  onClick={() => {
                    useFinanceStore.getState().removeWalletPermanently(deletePermanentlyId);
                    setDeletePermanentlyId(null);
                  }}
                  className="w-full bg-red-600 text-white py-4 rounded-2xl font-bold hover:bg-red-700 active:scale-95 transition-all shadow-lg shadow-red-100 dark:shadow-none"
                >
                  {t.yesDeletePermanently}
                </button>
                <button
                  onClick={() => setDeletePermanentlyId(null)}
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
        {isAddingVault && (
          <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsAddingVault(false)}
              className="absolute inset-0 bg-black/80 backdrop-blur-sm"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="relative w-full max-w-sm bg-[var(--card)] rounded-[2rem] md:rounded-3xl p-6 md:p-8 shadow-2xl flex flex-col gap-4 md:gap-6 max-h-[90vh] overflow-y-auto"
            >
              <div>
                <h3 className="text-2xl font-black tracking-tighter text-[var(--primary)] mb-1 font-serif">Fimanager Vault.</h3>
                <p className="text-xs text-gray-400 uppercase font-black tracking-widest">{t.createVault}</p>
              </div>

              <div className="space-y-4">
                <input
                  type="text"
                  placeholder={t.vaultName}
                  className="w-full p-4 bg-gray-100 dark:bg-white/5 border-none rounded-2xl outline-none focus:ring-2 focus:ring-[var(--primary)] transition-all font-medium text-[var(--text-main)]"
                  value={vaultName}
                  onChange={(e) => setVaultName(e.target.value)}
                />
                <input
                  type="password"
                  maxLength={4}
                  placeholder={t.vaultPin}
                  className="w-full p-4 bg-gray-100 dark:bg-white/5 border-none rounded-2xl outline-none focus:ring-2 focus:ring-[var(--primary)] transition-all font-mono text-center text-2xl tracking-[1rem] text-[var(--text-main)]"
                  value={vaultPin}
                  onChange={(e) => {
                    const val = e.target.value.replace(/\D/g, '');
                    if (val.length <= 4) setVaultPin(val);
                  }}
                />
              </div>

              <div className="flex gap-2">
                <button
                  onClick={() => {
                    if (vaultName && vaultPin.length === 4) {
                      addVault(vaultName, vaultPin);
                      setIsAddingVault(false);
                      setVaultName('');
                      setVaultPin('');
                    }
                  }}
                  className="flex-1 bg-[var(--primary)] text-white p-4 rounded-2xl font-bold shadow-lg hover:opacity-90 active:scale-95 transition-all"
                >
                  {t.save}
                </button>
                <button
                  onClick={() => setIsAddingVault(false)}
                  className="px-6 bg-gray-100 dark:bg-white/10 text-gray-600 dark:text-gray-300 rounded-2xl font-bold hover:opacity-80 transition-all"
                >
                  {t.cancel}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {activeVaultId && !showVaultContent && (
          <div className="fixed inset-0 z-[210] flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setActiveVaultId(null)}
              className="absolute inset-0 bg-black/90 backdrop-blur-sm"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="relative w-full max-w-sm bg-[var(--card)] rounded-[2rem] md:rounded-[3rem] p-6 md:p-10 shadow-2xl flex flex-col items-center gap-6 md:gap-8 text-[var(--text-main)] max-h-[90vh] overflow-y-auto"
            >
              <div className="w-20 h-20 bg-[var(--accent)] text-[var(--accent-text)] rounded-full flex items-center justify-center shadow-lg">
                <Lock size={32} />
              </div>

              <div className="text-center">
                <h3 className="text-2xl font-black italic tracking-tighter text-[var(--primary)] mb-1">
                  {activeVault?.name}
                </h3>
                <p className="text-xs text-gray-400 uppercase font-black tracking-widest">{t.enterPin}</p>
              </div>

              <input
                type="password"
                maxLength={4}
                autoFocus
                className={cn(
                  "w-full p-4 bg-gray-100 dark:bg-white/5 border-none rounded-2xl outline-none focus:ring-2 transition-all font-mono text-center text-3xl tracking-[1.5rem] text-[var(--text-main)]",
                  vaultError ? "focus:ring-red-500 animate-shake" : "focus:ring-[var(--primary)]"
                )}
                value={vaultEntryPin}
                onChange={(e) => {
                  const val = e.target.value.replace(/\D/g, '');
                  if (val.length <= 4) {
                    setVaultEntryPin(val);
                    setVaultError(false);
                    if (val.length === 4) {
                      if (val === activeVault?.pin) {
                        setShowVaultContent(true);
                      } else {
                        setVaultError(true);
                        setTimeout(() => setVaultEntryPin(''), 500);
                      }
                    }
                  }
                }}
              />

              {vaultError && (
                <p className="text-red-500 font-bold text-xs uppercase tracking-widest">{t.wrongPin}</p>
              )}

              <button
                onClick={() => setActiveVaultId(null)}
                className="text-gray-400 hover:text-gray-600 font-bold text-xs uppercase tracking-widest"
              >
                {t.cancel}
              </button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {activeVaultId && showVaultContent && (
          <div className="fixed inset-0 z-[220] flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setActiveVaultId(null)}
              className="absolute inset-0 bg-black/90 backdrop-blur-md"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative w-full max-w-lg bg-[var(--card)] rounded-[2rem] md:rounded-[3rem] p-6 md:p-8 shadow-2xl flex flex-col max-h-[90vh] text-[var(--text-main)] overflow-hidden"
            >
              <div className="flex justify-between items-center mb-6">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-green-500 text-white rounded-full flex items-center justify-center shadow-lg">
                    <Unlock size={20} />
                  </div>
                  <div>
                    <h2 className="text-xl font-black italic tracking-tighter text-[var(--primary)]">
                      {activeVault?.name}
                    </h2>
                    <div className="flex items-center gap-2">
                       <p className="text-[10px] font-black uppercase tracking-widest text-green-500">
                        {t.balanceInVault}: {vaultBalance.toLocaleString()}
                      </p>
                    </div>
                  </div>
                </div>
                <button
                  onClick={() => setActiveVaultId(null)}
                  className="p-2 bg-gray-100 dark:bg-white/10 text-gray-400 rounded-full hover:text-gray-600"
                >
                  <X size={20} />
                </button>
              </div>

              <div className="flex p-1 bg-gray-100 dark:bg-white/5 rounded-2xl mb-6">
                <button
                  onClick={() => setVaultView('transactions')}
                  className={cn(
                    "flex-1 py-2 rounded-xl text-xs font-black uppercase tracking-widest transition-all",
                    vaultView === 'transactions' ? "bg-[var(--primary)] text-white shadow-sm" : "text-gray-400"
                  )}
                >
                  Finance
                </button>
                <button
                  onClick={() => setVaultView('notes')}
                  className={cn(
                    "flex-1 py-2 rounded-xl text-xs font-black uppercase tracking-widest transition-all",
                    vaultView === 'notes' ? "bg-[var(--primary)] text-white shadow-sm" : "text-gray-400"
                  )}
                >
                  {t.notes}
                </button>
              </div>

              <div className="flex-1 overflow-y-auto pr-2 no-scrollbar space-y-4">
                {vaultView === 'transactions' ? (
                  <>
                    <button
                      onClick={() => setIsAddingVaultTx(true)}
                      className="w-full p-4 border-2 border-dashed border-gray-200 dark:border-white/10 rounded-2xl text-xs font-black uppercase tracking-widest text-gray-400 hover:text-[var(--primary)] hover:border-[var(--primary)] transition-all flex items-center justify-center gap-2"
                    >
                      <Plus size={14} /> {t.add}
                    </button>
                    {activeVault?.transactions.length === 0 ? (
                       <p className="text-center py-10 text-xs text-gray-400 italic">No secret transactions</p>
                    ) : (
                      activeVault?.transactions.map(tx => (
                        <div key={tx.id} className="flex justify-between items-center p-4 bg-gray-50 dark:bg-white/5 rounded-2xl">
                          <div>
                            <p className="font-bold text-sm">{tx.desc}</p>
                            <p className="text-[10px] text-gray-400 uppercase font-black">{new Date(tx.date).toLocaleDateString()}</p>
                          </div>
                          <div className="flex items-center gap-3">
                            <p className={cn("font-black text-sm", tx.type === 'income' ? "text-green-500" : "text-red-500")}>
                              {tx.type === 'income' ? '+' : '-'}{tx.amount.toLocaleString()}
                            </p>
                            <button onClick={() => activeVaultId && deleteVaultTransaction(activeVaultId, tx.id)} className="text-gray-300 hover:text-red-500 transition-colors">
                              <Trash2 size={14} />
                            </button>
                          </div>
                        </div>
                      ))
                    )}
                  </>
                ) : (
                  <>
                    <button
                      onClick={() => setIsAddingVaultNote(true)}
                      className="w-full p-4 border-2 border-dashed border-gray-200 dark:border-white/10 rounded-2xl text-xs font-black uppercase tracking-widest text-gray-400 hover:text-[var(--primary)] hover:border-[var(--primary)] transition-all flex items-center justify-center gap-2"
                    >
                      <Plus size={14} /> {t.addNote}
                    </button>
                    {activeVault?.notes.length === 0 ? (
                       <p className="text-center py-10 text-xs text-gray-400 italic">No secure notes</p>
                    ) : (
                      activeVault?.notes.map(note => (
                        <div key={note.id} className="p-4 bg-gray-50 dark:bg-white/5 rounded-2xl space-y-2">
                          <div className="flex justify-between items-start">
                            <p className="font-black text-sm text-[var(--primary)]">{note.title}</p>
                            <button onClick={() => activeVaultId && deleteVaultNote(activeVaultId, note.id)} className="text-gray-300 hover:text-red-500 transition-colors">
                              <Trash2 size={14} />
                            </button>
                          </div>
                          <p className="text-xs text-gray-600 dark:text-gray-300 whitespace-pre-wrap">{note.content}</p>
                          <p className="text-[9px] text-gray-400 font-bold uppercase tracking-widest">{new Date(note.date).toLocaleDateString()}</p>
                        </div>
                      ))
                    )}
                  </>
                )}
              </div>

              {/* Nested Modals specifically for Vault */}
              <AnimatePresence>
                {isAddingVaultTx && (
                  <div className="absolute inset-0 z-10 p-6 flex items-center justify-center">
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setIsAddingVaultTx(false)} className="absolute inset-0 bg-black/40 rounded-[3rem]" />
                    <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }} className="relative w-full bg-[var(--card)] rounded-3xl p-6 shadow-2xl border border-[var(--card-border)] space-y-4">
                      <div className="flex p-1 bg-gray-100 dark:bg-white/5 rounded-2xl mb-2">
                        <button onClick={() => setVTxType('income')} className={cn("flex-1 py-2 rounded-xl text-xs font-bold transition-all", vTxType === 'income' ? "bg-green-500 text-white" : "text-gray-400")}>{t.income}</button>
                        <button onClick={() => setVTxType('expense')} className={cn("flex-1 py-2 rounded-xl text-xs font-bold transition-all", vTxType === 'expense' ? "bg-red-500 text-white" : "text-gray-400")}>{t.expense}</button>
                      </div>
                      <input type="text" placeholder={t.placeholderDesc} className="w-full p-4 bg-gray-50 dark:bg-white/5 border-none rounded-2xl text-sm" value={vTxDesc} onChange={e => setVTxDesc(e.target.value)} />
                      <input type="text" inputMode="numeric" placeholder="0" className="w-full p-4 bg-gray-50 dark:bg-white/5 border-none rounded-2xl text-sm font-mono text-[var(--text-main)]" value={vTxAmount} onChange={handleVTxAmountChange} />
                      <div className="flex gap-2">
                        <button 
                          onClick={() => {
                            const rawValue = vTxAmount.replace(/\./g, '');
                            const val = parseFloat(rawValue);
                            if (activeVaultId && !isNaN(val) && val > 0) {
                              addVaultTransaction(activeVaultId, { desc: vTxDesc || 'Secret', amount: val, type: vTxType });
                              setVTxDesc(''); setVTxAmount(''); setIsAddingVaultTx(false);
                            }
                          }}
                          className="flex-1 bg-[var(--primary)] text-white p-3 rounded-2xl font-bold text-sm shadow-lg"
                        >
                          {t.save}
                        </button>
                        <button onClick={() => setIsAddingVaultTx(false)} className="px-4 bg-gray-100 dark:bg-white/10 text-gray-500 rounded-2xl text-sm font-bold">{t.cancel}</button>
                      </div>
                    </motion.div>
                  </div>
                )}

                {isAddingVaultNote && (
                  <div className="absolute inset-0 z-10 p-6 flex items-center justify-center">
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setIsAddingVaultNote(false)} className="absolute inset-0 bg-black/40 rounded-[3rem]" />
                    <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }} className="relative w-full bg-[var(--card)] rounded-3xl p-6 shadow-2xl border border-[var(--card-border)] space-y-4">
                      <input type="text" placeholder={t.noteTitle} className="w-full p-4 bg-gray-50 dark:bg-white/5 border-none rounded-2xl text-sm font-bold" value={vNoteTitle} onChange={e => setVNoteTitle(e.target.value)} />
                      <textarea placeholder={t.noteContent} rows={4} className="w-full p-4 bg-gray-50 dark:bg-white/5 border-none rounded-2xl text-sm resize-none" value={vNoteContent} onChange={e => setVNoteContent(e.target.value)} />
                      <div className="flex gap-2">
                        <button 
                          onClick={() => {
                            if (activeVaultId && vNoteTitle) {
                              addVaultNote(activeVaultId, { title: vNoteTitle, content: vNoteContent });
                              setVNoteTitle(''); setVNoteContent(''); setIsAddingVaultNote(false);
                            }
                          }}
                          className="flex-1 bg-[var(--primary)] text-white p-3 rounded-2xl font-bold text-sm shadow-lg"
                        >
                          {t.save}
                        </button>
                        <button onClick={() => setIsAddingVaultNote(false)} className="px-4 bg-gray-100 dark:bg-white/10 text-gray-500 rounded-2xl text-sm font-bold">{t.cancel}</button>
                      </div>
                    </motion.div>
                  </div>
                )}
              </AnimatePresence>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
}
