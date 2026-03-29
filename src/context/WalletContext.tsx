import { createContext, useContext, useState, ReactNode } from 'react';

export interface Transaction {
  id: string;
  icon: string;
  description: string;
  amount: number;
  date: string;
}

interface WalletState {
  balance: number;
  totalEarned: number;
  surveysCompleted: number;
  completedSurveyIds: string[];
  transactions: Transaction[];
}

interface WalletContextType {
  balance: number;
  totalEarned: number;
  surveysCompleted: number;
  completedSurveyIds: string[];
  transactions: Transaction[];
  addSurveyEarning: (surveyId: string, description: string, amount: number) => void;
  addAdEarning: () => void;
  withdraw: (amount: number, method: string) => void;
}

const WalletContext = createContext<WalletContextType | null>(null);

function todayStr() {
  return new Date().toLocaleDateString('en-SG', { day: 'numeric', month: 'short' });
}

const INITIAL_STATE: WalletState = {
  balance: 1.60,
  totalEarned: 1.60,
  surveysCompleted: 0,
  completedSurveyIds: [],
  transactions: [
    { id: 'signup', icon: '🎁', description: 'Sign-up Bonus', amount: 1.60, date: '1 Jan' },
  ],
};

export function WalletProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<WalletState>(() => {
    const stored = localStorage.getItem('survesg_wallet');
    return stored ? JSON.parse(stored) : INITIAL_STATE;
  });

  const save = (next: WalletState) => {
    setState(next);
    localStorage.setItem('survesg_wallet', JSON.stringify(next));
  };

  const addSurveyEarning = (surveyId: string, description: string, amount: number) => {
    if (state.completedSurveyIds.includes(surveyId)) return;
    const tx: Transaction = {
      id: Date.now().toString(),
      icon: '📋',
      description,
      amount,
      date: todayStr(),
    };
    save({
      ...state,
      balance: Math.round((state.balance + amount) * 100) / 100,
      totalEarned: Math.round((state.totalEarned + amount) * 100) / 100,
      surveysCompleted: state.surveysCompleted + 1,
      completedSurveyIds: [...state.completedSurveyIds, surveyId],
      transactions: [tx, ...state.transactions],
    });
  };

  const addAdEarning = () => {
    const tx: Transaction = {
      id: Date.now().toString(),
      icon: '📺',
      description: 'Watch & Earn Ad',
      amount: 0.10,
      date: todayStr(),
    };
    save({
      ...state,
      balance: Math.round((state.balance + 0.10) * 100) / 100,
      totalEarned: Math.round((state.totalEarned + 0.10) * 100) / 100,
      transactions: [tx, ...state.transactions],
    });
  };

  const withdraw = (amount: number, method: string) => {
    const tx: Transaction = {
      id: Date.now().toString(),
      icon: '💸',
      description: `Withdrawal — ${method}`,
      amount: -amount,
      date: todayStr(),
    };
    save({
      ...state,
      balance: Math.round((state.balance - amount) * 100) / 100,
      transactions: [tx, ...state.transactions],
    });
  };

  return (
    <WalletContext.Provider value={{
      balance: state.balance,
      totalEarned: state.totalEarned,
      surveysCompleted: state.surveysCompleted,
      completedSurveyIds: state.completedSurveyIds,
      transactions: state.transactions,
      addSurveyEarning,
      addAdEarning,
      withdraw,
    }}>
      {children}
    </WalletContext.Provider>
  );
}

export function useWallet() {
  const ctx = useContext(WalletContext);
  if (!ctx) throw new Error('useWallet must be used within WalletProvider');
  return ctx;
}
