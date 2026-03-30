import { createContext, useContext, useState } from 'react';
import type { ReactNode } from 'react';

export interface Transaction {
  id: string;
  icon: string;
  description: string;
  amount: number;
  date: string;
  qualityScore?: number;
  qualityLabel?: 'good' | 'suspicious' | 'bad';
}

interface WalletState {
  balance: number;
  totalEarned: number;
  surveysCompleted: number;
  completedSurveyIds: string[];
  completedAt: Record<string, number>; // surveyId → Unix timestamp ms
  transactions: Transaction[];
}

interface WalletContextType {
  balance: number;
  totalEarned: number;
  surveysCompleted: number;
  completedSurveyIds: string[];
  completedAt: Record<string, number>;
  transactions: Transaction[];
  addSurveyEarning: (surveyId: string, description: string, amount: number, qualityScore?: number, qualityLabel?: 'good' | 'suspicious' | 'bad') => void;
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
  completedAt: {},
  transactions: [
    { id: 'signup', icon: '🎁', description: 'Sign-up Bonus', amount: 1.60, date: '1 Jan' },
  ],
};

export function WalletProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<WalletState>(() => {
    const stored = localStorage.getItem('survesg_wallet');
    if (!stored) return INITIAL_STATE;
    const parsed = JSON.parse(stored);
    // Backfill fields added after initial release so old stored data doesn't crash
    return { ...INITIAL_STATE, ...parsed, completedAt: parsed.completedAt ?? {} };
  });

  const save = (next: WalletState) => {
    setState(next);
    localStorage.setItem('survesg_wallet', JSON.stringify(next));
  };

  const addSurveyEarning = (surveyId: string, description: string, amount: number, qualityScore?: number, qualityLabel?: 'good' | 'suspicious' | 'bad') => {
    if (state.completedSurveyIds.includes(surveyId)) return;
    const tx: Transaction = {
      id: Date.now().toString(),
      icon: '📋',
      description,
      amount,
      date: todayStr(),
      qualityScore,
      qualityLabel,
    };
    save({
      ...state,
      balance: Math.round((state.balance + amount) * 100) / 100,
      totalEarned: Math.round((state.totalEarned + amount) * 100) / 100,
      surveysCompleted: state.surveysCompleted + 1,
      completedSurveyIds: [...state.completedSurveyIds, surveyId],
      completedAt: { ...state.completedAt, [surveyId]: Date.now() },
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
      completedAt: state.completedAt,
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
