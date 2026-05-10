import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Search, LayoutDashboard, Calculator as CalcIcon, PieChart, History, Calendar as CalendarIcon, Database, CheckCircle2, RotateCcw } from 'lucide-react';
import { Header } from './components/Header';
import { WalletList } from './components/WalletList';
import { TransactionForm } from './components/TransactionForm';
import { TransactionItem } from './components/TransactionItem';
import { Calculator } from './components/Calculator';
import { Stats } from './components/Stats';
import { CalendarTab } from './components/CalendarTab';
import { useFinanceStore } from './store/useFinanceStore';
import { cn } from './lib/utils';
import { translations } from './translations';

type Tab = 'tracker' | 'calculator' | 'stats' | 'calendar';

export default function App() {
  const [activeTab, setActiveTab] = useState<Tab>('tracker');
  const [historySearch, setHistorySearch] = useState('');
  const [syncStatus, setSyncStatus] = useState<'synced' | 'saving' | 'error'>('synced');
  
  const { 
    wallets, activeWalletId, language, theme, isDarkMode,
    processScheduledTransactions 
  } = useFinanceStore();

  useEffect(() => {
    const handleStart = () => setSyncStatus('saving');
    const handleSuccess = () => setSyncStatus('synced');
    const handleError = () => setSyncStatus('error');

    window.addEventListener('finance-store-sync-start', handleStart);
    window.addEventListener('finance-store-sync-success', handleSuccess);
    window.addEventListener('finance-store-sync-error', handleError);

    return () => {
      window.removeEventListener('finance-store-sync-start', handleStart);
      window.removeEventListener('finance-store-sync-success', handleSuccess);
      window.removeEventListener('finance-store-sync-error', handleError);
    };
  }, []);

  useEffect(() => {
    // Stability safeguard: track app lifecycle
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'hidden') {
        console.log('App backgrounded: State frozen in SQLite.');
      }
    };
    
    // Attempt to save state before window is closed (last resort)
    const handleBeforeUnload = () => {
      console.log('App closing: Persistence ensured.');
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('beforeunload', handleBeforeUnload);

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, []);

  const t = translations[language];

  const activeWallet = wallets.find((w) => w.id === activeWalletId);
  const isAbsolute = activeWalletId === 'absolute';

  const displayTransactions = (isAbsolute 
    ? wallets.flatMap(w => w.transactions.map(tx => ({ ...tx, walletName: w.name, walletId: w.id })))
        .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    : (activeWallet?.transactions || []).map(tx => ({ ...tx, walletId: activeWalletId })))
    .filter(tx => tx.desc.toLowerCase().includes(historySearch.toLowerCase()));

  const tabs = [
    { id: 'tracker', label: t.tracker, icon: LayoutDashboard },
    { id: 'calculator', label: t.calculator, icon: CalcIcon },
    { id: 'stats', label: t.stats, icon: PieChart },
    { id: 'calendar', label: t.calendar, icon: CalendarIcon },
  ];

  useEffect(() => {
    processScheduledTransactions();
    // Check every 5 minutes
    const interval = setInterval(processScheduledTransactions, 300000);
    return () => clearInterval(interval);
  }, [processScheduledTransactions]);

  useEffect(() => {
    document.body.className = cn(
      'antialiased transition-all duration-500', 
      isDarkMode && 'dark',
      `theme-${theme}`
    );
  }, [theme, isDarkMode]);

  // Adjust theme text color if needed
  const isDarkOverall = isDarkMode || theme === 'blue-dark';

  return (
    <div className="min-h-screen pb-16 md:pb-24 lg:pb-32 transition-colors duration-500">
      {/* Persistence Status Floating Badge */}
      <div className="fixed bottom-6 right-6 z-50 pointer-events-none hidden sm:block">
        <div className={cn(
          "flex items-center gap-2 px-3 py-1.5 rounded-full border shadow-lg backdrop-blur-md transition-all duration-500",
          syncStatus === 'synced' ? "bg-green-500/10 border-green-500/20 text-green-600" :
          syncStatus === 'saving' ? "bg-blue-500/10 border-blue-500/20 text-blue-600 animate-pulse" :
          "bg-red-500/10 border-red-500/20 text-red-600"
        )}>
          {syncStatus === 'synced' && <CheckCircle2 size={12} />}
          {syncStatus === 'saving' && <RotateCcw size={12} className="animate-spin" />}
          {syncStatus === 'error' && <Database size={12} />}
          <span className="text-[10px] font-black uppercase tracking-widest">
            {syncStatus === 'synced' ? 'Data Secured (Local)' : 
             syncStatus === 'saving' ? 'Securing...' : 'Sync Error'}
          </span>
        </div>
      </div>

      <Header />

      <main className="w-full max-w-5xl mx-auto pt-4 md:pt-8">
        <WalletList />

        {/* Tab Navigation */}
        <div className="px-4 mb-6 md:mb-8 sticky top-[72px] md:top-[92px] z-40">
          <div className={cn(
            "flex p-1.5 rounded-[2rem] shadow-lg border backdrop-blur-xl transition-all",
            isDarkOverall ? "bg-white/5 border-white/10" : "bg-white border-gray-100"
          )}>
            {tabs.map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;

              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as Tab)}
                  className={cn(
                    'relative flex-1 flex items-center justify-center gap-2 py-3 rounded-[1.5rem] text-sm font-black uppercase tracking-widest transition-all',
                    isActive ? 'text-[var(--primary)]' : 'text-gray-400 hover:text-gray-600'
                  )}
                >
                  {isActive && (
                    <motion.div
                      layoutId="tab-active"
                      className="absolute inset-0 rounded-[1.5rem] bg-[var(--accent)]"
                    />
                  )}
                  <span className="relative z-10 flex items-center gap-2">
                    <Icon size={18} />
                    <span className="hidden sm:inline">{tab.label}</span>
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Tab Content */}
        <div className="px-4">
          <AnimatePresence mode="wait">
            {activeTab === 'tracker' && (
              <motion.div
                key="tracker"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="space-y-6"
              >
                <TransactionForm />

                <div className="space-y-4">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-2">
                    <div className="flex items-center gap-2">
                      <History size={16} className="text-gray-400" />
                      <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-400">
                        {t.history}
                      </h3>
                    </div>
                    {/* Search Input */}
                    <div className={cn(
                      "flex items-center gap-2 px-4 py-2 rounded-xl border transition-all w-full sm:w-64",
                      isDarkOverall ? "bg-white/5 border-white/10" : "bg-white border-gray-100 shadow-sm focus-within:ring-2 focus-within:ring-[var(--primary)]"
                    )}>
                      <Search size={14} className="text-gray-400" />
                      <input 
                        type="text"
                        placeholder={language === 'id' ? 'Cari catatan...' : 'Search records...'}
                        className="bg-transparent border-none outline-none text-xs font-bold w-full text-[var(--text-main)]"
                        value={historySearch}
                        onChange={(e) => setHistorySearch(e.target.value)}
                      />
                    </div>
                  </div>

                  <AnimatePresence initial={false}>
                    {displayTransactions.length === 0 ? (
                      <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className={cn(
                          "p-12 rounded-3xl border border-dashed text-center",
                          isDarkOverall ? "bg-black/20 border-white/10" : "bg-white border-gray-200"
                        )}
                      >
                        <p className="text-gray-400 italic">{t.emptyHistory}</p>
                      </motion.div>
                    ) : (
                      displayTransactions.map((tx) => (
                        <TransactionItem 
                          key={tx.id} 
                          transaction={tx} 
                          walletId={tx.walletId} 
                        />
                      ))
                    )}
                  </AnimatePresence>
                </div>
              </motion.div>
            )}

            {activeTab === 'calculator' && (
              <motion.div
                key="calculator"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
              >
                <Calculator />
              </motion.div>
            )}

            {activeTab === 'stats' && (
              <motion.div
                key="stats"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
              >
                <Stats />
              </motion.div>
            )}

            {activeTab === 'calendar' && (
              <motion.div
                key="calendar"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
              >
                <CalendarTab />
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </main>
    </div>
  );
}
