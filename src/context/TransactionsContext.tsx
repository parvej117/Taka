import React, { createContext, useContext, useEffect, useState, useMemo } from 'react';
import {
  collection,
  query,
  orderBy,
  onSnapshot,
  addDoc,
  deleteDoc,
  updateDoc,
  doc,
  writeBatch,
} from 'firebase/firestore';
import { db } from '../firebase';
import { useAuth } from './AuthContext';
import { Transaction } from '../types';
import { handleFirestoreError, OperationType } from '../utils/firestoreError';

interface TransactionsContextType {
  transactions: Transaction[];
  loading: boolean;
  addTransaction: (data: Omit<Transaction, 'id' | 'userId' | 'createdAt'>) => Promise<void>;
  updateTransaction: (id: string, data: Partial<Omit<Transaction, 'id' | 'userId' | 'createdAt'>>) => Promise<void>;
  deleteTransaction: (id: string) => Promise<void>;
  totalIncome: number;
  totalExpense: number;
  totalBalance: number;
  thisMonthIncome: number;
  thisMonthExpense: number;
  thisMonthBalance: number;
  seedDemoTransactions: () => Promise<void>;
}

const TransactionsContext = createContext<TransactionsContextType | undefined>(undefined);

export const TransactionsProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user } = useAuth();
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);

  // Helper for demo transactions storage
  const loadDemoFromStorage = (): Transaction[] => {
    try {
      const stored = localStorage.getItem('takatrack_demo_transactions');
      if (stored) return JSON.parse(stored);
    } catch (e) {
      console.error(e);
    }
    return [];
  };

  const saveDemoToStorage = (items: Transaction[]) => {
    localStorage.setItem('takatrack_demo_transactions', JSON.stringify(items));
  };

  useEffect(() => {
    if (!user) {
      setTransactions([]);
      setLoading(false);
      return;
    }

    if (user.isDemo) {
      const localItems = loadDemoFromStorage();
      if (localItems.length === 0) {
        // Auto seed initial welcoming sample data for demo user
        const now = new Date();
        const curYear = now.getFullYear();
        const curMonth = String(now.getMonth() + 1).padStart(2, '0');
        const d = (day: number) => `${curYear}-${curMonth}-${String(day).padStart(2, '0')}`;
        const initialSamples: Transaction[] = [
          { id: 'sample_1', userId: user.uid, type: 'income', amount: 55000, category: 'Salary', date: d(1), note: 'মাসিক স্যালারি', paymentMethod: 'Bank', createdAt: Date.now() - 50000 },
          { id: 'sample_2', userId: user.uid, type: 'income', amount: 12000, category: 'Freelance', date: d(5), note: 'ওয়েব ডেভেলপমেন্ট প্রজেক্ট', paymentMethod: 'bKash', createdAt: Date.now() - 40000 },
          { id: 'sample_3', userId: user.uid, type: 'expense', amount: 15000, category: 'Rent', date: d(3), note: 'বাসা ভাড়া ও সার্ভিস চার্জ', paymentMethod: 'Bank', createdAt: Date.now() - 30000 },
          { id: 'sample_4', userId: user.uid, type: 'expense', amount: 4500, category: 'Food', date: d(6), note: 'কাঁচাবাজার ও মাছ-মাংস', paymentMethod: 'Cash', createdAt: Date.now() - 20000 },
          { id: 'sample_5', userId: user.uid, type: 'expense', amount: 1850, category: 'Bills', date: d(8), note: 'ওয়াইফাই ও বিদ্যুৎ বিল', paymentMethod: 'Nagad', createdAt: Date.now() - 10000 },
          { id: 'sample_6', userId: user.uid, type: 'expense', amount: 950, category: 'Transport', date: d(11), note: 'মেট্রোরেল কার্ড রিচার্জ', paymentMethod: 'bKash', createdAt: Date.now() - 5000 },
        ];
        saveDemoToStorage(initialSamples);
        setTransactions(initialSamples);
      } else {
        setTransactions(localItems);
      }
      setLoading(false);
      return;
    }

    // Real Firebase user listener
    setLoading(true);
    const path = `users/${user.uid}/transactions`;
    const q = query(
      collection(db, 'users', user.uid, 'transactions'),
      orderBy('date', 'desc')
    );

    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const items: Transaction[] = [];
        snapshot.forEach((docSnap) => {
          items.push({
            id: docSnap.id,
            ...(docSnap.data() as Omit<Transaction, 'id'>),
          });
        });
        setTransactions(items);
        setLoading(false);
      },
      (error) => {
        setLoading(false);
        handleFirestoreError(error, OperationType.LIST, path);
      }
    );

    return () => unsubscribe();
  }, [user]);

  const addTransaction = async (data: Omit<Transaction, 'id' | 'userId' | 'createdAt'>) => {
    if (!user) throw new Error('Must be logged in to add transaction');

    if (user.isDemo) {
      const newTx: Transaction = {
        id: 'tx_' + Date.now() + '_' + Math.random().toString(36).substring(2, 6),
        ...data,
        userId: user.uid,
        createdAt: Date.now(),
      };
      const updated = [newTx, ...transactions].sort((a, b) => b.date.localeCompare(a.date));
      setTransactions(updated);
      saveDemoToStorage(updated);
      return;
    }

    const path = `users/${user.uid}/transactions`;
    try {
      const colRef = collection(db, 'users', user.uid, 'transactions');
      await addDoc(colRef, {
        ...data,
        userId: user.uid,
        createdAt: Date.now(),
      });
    } catch (error) {
      handleFirestoreError(error, OperationType.CREATE, path);
    }
  };

  const updateTransaction = async (
    id: string,
    data: Partial<Omit<Transaction, 'id' | 'userId' | 'createdAt'>>
  ) => {
    if (!user) throw new Error('Must be logged in to edit transaction');

    if (user.isDemo) {
      const updated = transactions.map((t) => (t.id === id ? { ...t, ...data } : t));
      setTransactions(updated);
      saveDemoToStorage(updated);
      return;
    }

    const path = `users/${user.uid}/transactions/${id}`;
    try {
      const docRef = doc(db, 'users', user.uid, 'transactions', id);
      await updateDoc(docRef, data);
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, path);
    }
  };

  const deleteTransaction = async (id: string) => {
    if (!user) throw new Error('Must be logged in to delete transaction');

    if (user.isDemo) {
      const updated = transactions.filter((t) => t.id !== id);
      setTransactions(updated);
      saveDemoToStorage(updated);
      return;
    }

    const path = `users/${user.uid}/transactions/${id}`;
    try {
      const docRef = doc(db, 'users', user.uid, 'transactions', id);
      await deleteDoc(docRef);
    } catch (error) {
      handleFirestoreError(error, OperationType.DELETE, path);
    }
  };

  // Calculations
  const { totalIncome, totalExpense, totalBalance, thisMonthIncome, thisMonthExpense, thisMonthBalance } =
    useMemo(() => {
      let income = 0;
      let expense = 0;
      let mIncome = 0;
      let mExpense = 0;

      const now = new Date();
      const currentYearMonth = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;

      transactions.forEach((tx) => {
        const val = Number(tx.amount) || 0;
        if (tx.type === 'income') {
          income += val;
          if (tx.date && tx.date.startsWith(currentYearMonth)) {
            mIncome += val;
          }
        } else {
          expense += val;
          if (tx.date && tx.date.startsWith(currentYearMonth)) {
            mExpense += val;
          }
        }
      });

      return {
        totalIncome: income,
        totalExpense: expense,
        totalBalance: income - expense,
        thisMonthIncome: mIncome,
        thisMonthExpense: mExpense,
        thisMonthBalance: mIncome - mExpense,
      };
    }, [transactions]);

  const seedDemoTransactions = async () => {
    if (!user) return;
    const now = new Date();
    const curYear = now.getFullYear();
    const curMonth = String(now.getMonth() + 1).padStart(2, '0');
    const d = (day: number) => `${curYear}-${curMonth}-${String(day).padStart(2, '0')}`;

    const samples: Omit<Transaction, 'id' | 'userId' | 'createdAt'>[] = [
      { type: 'income', amount: 50000, category: 'Salary', date: d(1), note: 'মাসিক বেতন (Salary)', paymentMethod: 'Bank' },
      { type: 'income', amount: 16000, category: 'Freelance', date: d(6), note: 'UI/UX প্রজেক্ট সম্মানী', paymentMethod: 'bKash' },
      { type: 'expense', amount: 15000, category: 'Rent', date: d(2), note: 'বাসা ভাড়া', paymentMethod: 'Bank' },
      { type: 'expense', amount: 4200, category: 'Food', date: d(4), note: 'মুদি বাজার ও কাঁচাবাজার', paymentMethod: 'bKash' },
      { type: 'expense', amount: 1350, category: 'Bills', date: d(7), note: 'বিদ্যুৎ ও ওয়াইফাই বিল', paymentMethod: 'Nagad' },
      { type: 'expense', amount: 900, category: 'Transport', date: d(10), note: 'মেট্রোরেল ও যাতায়াত', paymentMethod: 'Cash' },
      { type: 'expense', amount: 3500, category: 'Shopping', date: d(12), note: 'পোশাক ও প্রয়োজনীয় শপিং', paymentMethod: 'Card' },
      { type: 'expense', amount: 1600, category: 'Food', date: d(15), note: 'রেস্টুরেন্টে ডিনার', paymentMethod: 'Card' },
      { type: 'expense', amount: 800, category: 'Medical', date: d(18), note: 'ওষুধ ও ভিটামিন', paymentMethod: 'Cash' },
      { type: 'expense', amount: 2500, category: 'Education', date: d(21), note: 'কোর্স ও বই কেনা', paymentMethod: 'bKash' },
    ];

    if (user.isDemo) {
      const formatted: Transaction[] = samples.map((s, idx) => ({
        id: 'seed_' + Date.now() + '_' + idx,
        userId: user.uid,
        createdAt: Date.now() - idx * 1000,
        ...s,
      }));
      setTransactions(formatted);
      saveDemoToStorage(formatted);
      return;
    }

    const path = `users/${user.uid}/transactions`;
    try {
      const batch = writeBatch(db);
      const colRef = collection(db, 'users', user.uid, 'transactions');
      samples.forEach((item, index) => {
        const newDoc = doc(colRef);
        batch.set(newDoc, {
          ...item,
          userId: user.uid,
          createdAt: Date.now() - index * 1000,
        });
      });
      await batch.commit();
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, path);
    }
  };

  return (
    <TransactionsContext.Provider
      value={{
        transactions,
        loading,
        addTransaction,
        updateTransaction,
        deleteTransaction,
        totalIncome,
        totalExpense,
        totalBalance,
        thisMonthIncome,
        thisMonthExpense,
        thisMonthBalance,
        seedDemoTransactions,
      }}
    >
      {children}
    </TransactionsContext.Provider>
  );
};

export const useTransactions = () => {
  const context = useContext(TransactionsContext);
  if (!context) throw new Error('useTransactions must be used within TransactionsProvider');
  return context;
};
