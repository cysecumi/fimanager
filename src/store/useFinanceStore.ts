import { create } from 'zustand';
import { persist, createJSONStorage, StateStorage } from 'zustand/middleware';
import { get, set, del } from 'idb-keyval';
import { FinanceState, Wallet, Transaction } from '../types';

const idbStorage: StateStorage = {
  getItem: async (name: string): Promise<string | null> => {
    try {
      const data = await get(name);
      if (data) return data;
      
      // Migration: Check local storage if IndexedDB is empty
      const local = localStorage.getItem(name);
      if (local) {
        console.log('Migrating local storage to IndexedDB...');
        await set(name, local);
        return local;
      }
      return null;
    } catch (error) {
      console.error('Failed to fetch from IndexedDB:', error);
      return null;
    }
  },
  setItem: async (name: string, value: string): Promise<void> => {
    try {
      window.dispatchEvent(new CustomEvent('finance-store-sync-start'));
      await set(name, value);
      window.dispatchEvent(new CustomEvent('finance-store-sync-success'));
    } catch (error) {
      console.error('Failed to save to IndexedDB:', error);
      window.dispatchEvent(new CustomEvent('finance-store-sync-error'));
    }
  },
  removeItem: async (name: string): Promise<void> => {
    await del(name);
  },
};

export const useFinanceStore = create<FinanceState>()(
  persist(
    (set) => ({
      wallets: [
        {
          id: 'w-default',
          name: 'Tunai',
          transactions: [],
        },
      ],
      activeWalletId: 'w-default',
      showBalance: true,
      isDarkMode: false,
      language: 'id',
      theme: 'blue-light',
      scheduledTransactions: [],
      vaults: [],

      addWallet: (name, initialBalance, isEmergency) =>
        set((state) => {
          const newId = `w-${Date.now()}`;
          const newWallet: Wallet = {
            id: newId,
            name,
            transactions: [],
            isEmergency,
          };

          if (initialBalance > 0) {
            newWallet.transactions.push({
              id: `t-${Date.now()}`,
              desc: 'Saldo Awal',
              amount: initialBalance,
              type: 'income',
              date: new Date().toISOString(),
            });
          }

          return {
            wallets: [...state.wallets, newWallet],
            activeWalletId: newId,
          };
        }),

      deleteWallet: (id) =>
        set((state) => {
          if (state.wallets.filter((w) => !w.isArchived).length <= 1) return state;
          
          const newWallets = state.wallets.map((w) => 
            w.id === id ? { ...w, isArchived: true } : w
          );

          const visibleWallets = newWallets.filter((w) => !w.isArchived);
          
          return {
            wallets: newWallets,
            activeWalletId: state.activeWalletId === id ? visibleWallets[0].id : state.activeWalletId,
          };
        }),

      setActiveWallet: (id) => set({ activeWalletId: id }),

      addTransaction: (walletId, tx) =>
        set((state) => ({
          wallets: (state.wallets || []).map((w) =>
            w.id === walletId
              ? {
                  ...w,
                  transactions: [
                    {
                      ...tx,
                      id: `t-${Date.now()}`,
                      date: new Date().toISOString(),
                    },
                    ...w.transactions,
                  ],
                }
              : w
          ),
        })),

      deleteTransaction: (walletId, transactionId) =>
        set((state) => ({
          wallets: state.wallets.map((w) =>
            w.id === walletId
              ? {
                  ...w,
                  transactions: w.transactions.filter((t) => t.id !== transactionId),
                }
              : w
          ),
        })),

      toggleShowBalance: () => set((state) => ({ showBalance: !state.showBalance })),
      toggleDarkMode: () => set((state) => ({ isDarkMode: !state.isDarkMode })),
      setLanguage: (language) => set({ language }),
      setTheme: (theme) => set({ theme }),
      removeWalletPermanently: (id) =>
        set((state) => ({
          wallets: state.wallets.filter((w) => w.id !== id),
        })),

      addScheduledTransaction: (st) =>
        set((state) => ({
          scheduledTransactions: [
            ...(state.scheduledTransactions || []),
            { ...st, id: `st-${Date.now()}`, isProcessed: false },
          ],
        })),

      removeScheduledTransaction: (id) =>
        set((state) => ({
          scheduledTransactions: state.scheduledTransactions.filter((st) => st.id !== id),
        })),

      processScheduledTransactions: () =>
        set((state) => {
          const now = new Date();
          const toProcess = (state.scheduledTransactions || []).filter(
            (st) => !st.isProcessed && new Date(st.scheduledDate) <= now
          );

          if (toProcess.length === 0) return state;

          let newWallets = [...state.wallets];
          toProcess.forEach((st) => {
            newWallets = newWallets.map((w) =>
              w.id === st.walletId
                ? {
                    ...w,
                    transactions: [
                      {
                        id: `t-auto-${st.id}`,
                        desc: st.desc,
                        amount: st.amount,
                        type: st.type,
                        date: st.scheduledDate,
                      },
                      ...w.transactions,
                    ],
                  }
                : w
            );
          });

          const newScheduledTransactions = state.scheduledTransactions.map((st) => {
            const isDue = !st.isProcessed && new Date(st.scheduledDate) <= now;
            return isDue ? { ...st, isProcessed: true } : st;
          });

          return {
            wallets: newWallets,
            scheduledTransactions: newScheduledTransactions,
          };
        }),

      addVault: (name, pin) =>
        set((state) => ({
          vaults: [
            ...(state.vaults || []),
            { id: `v-${Date.now()}`, name, pin, transactions: [], notes: [] },
          ],
        })),

      deleteVault: (id) =>
        set((state) => ({
          vaults: state.vaults.filter((v) => v.id !== id),
        })),

      addVaultTransaction: (vaultId, tx) =>
        set((state) => ({
          vaults: state.vaults.map((v) =>
            v.id === vaultId
              ? {
                  ...v,
                  transactions: [
                    {
                      ...tx,
                      id: `vt-${Date.now()}`,
                      date: new Date().toISOString(),
                    },
                    ...v.transactions,
                  ],
                }
              : v
          ),
        })),

      deleteVaultTransaction: (vaultId, transactionId) =>
        set((state) => ({
          vaults: state.vaults.map((v) =>
            v.id === vaultId
              ? {
                  ...v,
                  transactions: v.transactions.filter((t) => t.id !== transactionId),
                }
              : v
          ),
        })),

      addVaultNote: (vaultId, note) =>
        set((state) => ({
          vaults: state.vaults.map((v) =>
            v.id === vaultId
              ? {
                  ...v,
                  notes: [
                    {
                      ...note,
                      id: `vn-${Date.now()}`,
                      date: new Date().toISOString(),
                    },
                    ...v.notes,
                  ],
                }
              : v
          ),
        })),

      deleteVaultNote: (vaultId, noteId) =>
        set((state) => ({
          vaults: state.vaults.map((v) =>
            v.id === vaultId
              ? {
                  ...v,
                  notes: v.notes.filter((n) => n.id !== noteId),
                }
              : v
          ),
        })),
      resetWalletBalance: (id) =>
        set((state) => {
          const wallet = state.wallets.find((w) => w.id === id);
          if (!wallet) return state;

          const balance = wallet.transactions.reduce(
            (acc, t) => (t.type === 'income' ? acc + t.amount : acc - t.amount),
            0
          );

          if (balance >= 0) return state;

          const resetTx: Transaction = {
            id: `t-reset-${Date.now()}`,
            desc: 'Reset Saldo',
            amount: Math.abs(balance),
            type: 'income',
            date: new Date().toISOString(),
          };

          return {
            wallets: state.wallets.map((w) =>
              w.id === id
                ? {
                    ...w,
                    transactions: [resetTx, ...w.transactions],
                  }
                : w
            ),
          };
        }),
    }),
    {
      name: 'financely-storage',
      storage: createJSONStorage(() => idbStorage),
    }
  )
);

