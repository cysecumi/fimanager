import { useMemo } from 'react';
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
} from 'chart.js';
import { Pie, Bar } from 'react-chartjs-2';
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameDay } from 'date-fns';
import { id } from 'date-fns/locale';
import { useFinanceStore } from '../store/useFinanceStore';
import { CurrencyText } from './CurrencyText';
import { translations } from '../translations';

ChartJS.register(
  ArcElement,
  Tooltip,
  Legend,
  CategoryScale,
  LinearScale,
  BarElement,
  Title
);

export function Stats() {
  const { wallets, activeWalletId, language } = useFinanceStore();
  const t = translations[language];
  
  const wallet = useMemo(() => {
    if (activeWalletId === 'absolute') {
      const allTxs = wallets.flatMap(w => w.transactions).sort((a, b) => 
        new Date(b.date).getTime() - new Date(a.date).getTime()
      );
      return {
        name: t.absoluteWallet,
        transactions: allTxs
      };
    }
    return wallets.find((w) => w.id === activeWalletId);
  }, [wallets, activeWalletId, t.absoluteWallet]);

  const stats = useMemo(() => {
    if (!wallet) return { income: 0, expense: 0 };
    return wallet.transactions.reduce(
      (acc, t) => {
        if (t.type === 'income') acc.income += t.amount;
        else acc.expense += t.amount;
        return acc;
      },
      { income: 0, expense: 0 }
    );
  }, [wallet]);

  const dailyData = useMemo(() => {
    if (!wallet) return { labels: [], values: [] };
    
    const now = new Date();
    const start = startOfMonth(now);
    const end = endOfMonth(now);
    const days = eachDayOfInterval({ start, end });

    const labels = days.map(day => format(day, 'd'));
    const values = days.map(day => {
      return wallet.transactions
        .filter(tx => tx.type === 'expense' && isSameDay(new Date(tx.date), day))
        .reduce((sum, tx) => sum + tx.amount, 0);
    });

    return { labels, values };
  }, [wallet]);

  const pieData = {
    labels: [t.income, t.expense],
    datasets: [
      {
        data: [stats.income, stats.expense],
        backgroundColor: [
          'rgba(34, 197, 94, 0.8)', // Green-500
          'rgba(239, 68, 68, 0.8)',  // Red-500
        ],
        borderColor: ['transparent', 'transparent'],
        borderWidth: 0,
        hoverOffset: 10,
      },
    ],
  };

  const barData = {
    labels: dailyData.labels,
    datasets: [
      {
        label: t.dailyExp,
        data: dailyData.values,
        backgroundColor: 'rgba(59, 130, 246, 0.8)', // Blue-500
        borderRadius: 8,
      },
    ],
  };

  const pieOptions = {
    plugins: {
      legend: {
        display: false,
      },
    },
    cutout: '70%',
    maintainAspectRatio: false,
  };

  const barOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false,
      },
      tooltip: {
        callbacks: {
          label: (context: any) => {
            return new Intl.NumberFormat(language === 'id' ? 'id-ID' : 'en-US', {
              style: 'currency',
              currency: 'IDR',
              minimumFractionDigits: 0,
            }).format(context.raw);
          },
        },
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        grid: {
          display: false,
        },
        ticks: {
          display: false,
        },
      },
      x: {
        grid: {
          display: false,
        },
        ticks: {
          font: {
            size: 10,
          },
        },
      },
    },
  };

  if (!wallet || wallet.transactions.length === 0) {
    return (
      <div className="bg-[var(--card)] p-8 rounded-3xl shadow-sm border border-[var(--card-border)] text-center transition-all">
        <p className="text-gray-400 italic">{t.emptyHistory}</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 lg:space-y-8">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-[var(--card)] p-6 rounded-3xl shadow-sm border border-[var(--card-border)] transition-all">
          <h3 className="text-sm font-black uppercase tracking-widest text-gray-400 mb-6 text-center">
            {t.allocation}: <span className="text-[var(--primary)]">{wallet.name}</span>
          </h3>
          
          <div className="relative h-64 mb-8">
            <Pie data={pieData} options={pieOptions} />
            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
              <p className="text-[10px] font-black uppercase tracking-widest text-gray-400">{t.netBalance}</p>
              <CurrencyText 
                amount={stats.income - stats.expense} 
                className={`text-xl font-black ${stats.income - stats.expense >= 0 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="bg-green-50 dark:bg-green-500/10 p-4 rounded-3xl border border-green-100 dark:border-green-500/20 text-center">
              <p className="text-[10px] font-black uppercase tracking-widest text-green-600 dark:text-green-400 mb-1">{t.income}</p>
              <CurrencyText amount={stats.income} className="text-lg font-black text-green-700 dark:text-green-300" />
            </div>
            <div className="bg-red-50 dark:bg-red-500/10 p-4 rounded-3xl border border-red-100 dark:border-red-500/20 text-center">
              <p className="text-[10px] font-black uppercase tracking-widest text-red-600 dark:text-red-400 mb-1">{t.expense}</p>
              <CurrencyText amount={stats.expense} className="text-lg font-black text-red-700 dark:text-red-300" />
            </div>
          </div>
        </div>

        <div className="bg-[var(--card)] p-6 rounded-3xl shadow-sm border border-[var(--card-border)] transition-all flex flex-col justify-center">
          <h3 className="text-sm font-black uppercase tracking-widest text-gray-400 mb-6 text-center">
            {t.dailyExp}
          </h3>
          <div className="h-64 lg:h-80">
            <Bar data={barData} options={barOptions} />
          </div>
        </div>
      </div>
    </div>
  );
}

