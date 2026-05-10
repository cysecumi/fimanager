export type TransactionType = 'income' | 'expense';

export interface Transaction {
  id: string;
  desc: string;
  amount: number;
  type: TransactionType;
  date: string;
}

export interface Wallet {
  id: string;
  name: string;
  transactions: Transaction[];
  isEmergency?: boolean;
  isArchived?: boolean;
}

export type Language = 'id' | 'en';
export type ThemeColor = 'pink' | 'blue-dark' | 'blue-light' | 'green' | 'purple';

export interface ScheduledTransaction {
  id: string;
  walletId: string;
  desc: string;
  amount: number;
  type: TransactionType;
  scheduledDate: string;
  isProcessed: boolean;
}

export interface VaultNote {
  id: string;
  title: string;
  content: string;
  date: string;
}

export interface Vault {
  id: string;
  name: string;
  pin: string;
  transactions: Transaction[];
  notes: VaultNote[];
}

export interface FinanceState {
  wallets: Wallet[];
  activeWalletId: string;
  showBalance: boolean;
  isDarkMode: boolean;
  language: Language;
  theme: ThemeColor;
  scheduledTransactions: ScheduledTransaction[];
  vaults: Vault[];
  addWallet: (name: string, initialBalance: number, isEmergency?: boolean) => void;
  deleteWallet: (id: string) => void;
  setActiveWallet: (id: string) => void;
  addTransaction: (walletId: string, transaction: Omit<Transaction, 'id' | 'date'>) => void;
  deleteTransaction: (walletId: string, transactionId: string) => void;
  toggleShowBalance: () => void;
  toggleDarkMode: () => void;
  setLanguage: (lang: Language) => void;
  setTheme: (theme: ThemeColor) => void;
  removeWalletPermanently: (id: string) => void;
  addScheduledTransaction: (st: Omit<ScheduledTransaction, 'id' | 'isProcessed'>) => void;
  removeScheduledTransaction: (id: string) => void;
  processScheduledTransactions: () => void;
  addVault: (name: string, pin: string) => void;
  deleteVault: (id: string) => void;
  addVaultTransaction: (vaultId: string, transaction: Omit<Transaction, 'id' | 'date'>) => void;
  deleteVaultTransaction: (vaultId: string, transactionId: string) => void;
  addVaultNote: (vaultId: string, note: Omit<VaultNote, 'id' | 'date'>) => void;
  deleteVaultNote: (vaultId: string, noteId: string) => void;
  resetWalletBalance: (id: string) => void;
}
