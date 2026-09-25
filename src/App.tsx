import React, { useState } from 'react';
import { useAuth } from './context/AuthContext';
import { useTransactions } from './context/TransactionsContext';
import { AuthModal } from './components/AuthModal';
import { Navbar } from './components/Navbar';
import { SummaryCards } from './components/SummaryCards';
import { AnalyticsCharts } from './components/AnalyticsCharts';
import { TransactionList } from './components/TransactionList';
import { AddTransactionModal } from './components/AddTransactionModal';
import { ThreeCoin } from './components/ThreeCoin';
import { Transaction, TransactionType } from './types';
import {
  Plus,
  TrendingUp,
  TrendingDown,
  Sparkles,
  Layers,
  ArrowRight,
  ShieldCheck,
  Smartphone,
  Calendar,
} from 'lucide-react';

export default function App() {
  const { user, loading } = useAuth();
  const { transactions } = useTransactions();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalType, setModalType] = useState<TransactionType>('expense');
  const [editingTx, setEditingTx] = useState<Transaction | null>(null);

  const handleOpenAdd = (type: TransactionType = 'expense') => {
    setEditingTx(null);
    setModalType(type);
    setIsModalOpen(true);
  };

  const handleEdit = (tx: Transaction) => {
    setEditingTx(tx);
    setIsModalOpen(true);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center text-slate-400 gap-4">
        <div className="relative">
          <ThreeCoin size={64} interactive={false} />
        </div>
        <p className="text-sm font-semibold tracking-wide text-slate-300 animate-pulse">
          TakaTrack লোড হচ্ছে...
        </p>
      </div>
    );
  }

  if (!user) {
    return <AuthModal />;
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col selection:bg-emerald-500 selection:text-white">
      {/* Top Navigation */}
      <Navbar onAddTransaction={handleOpenAdd} />

      {/* Main Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        {/* Welcome Banner with 3D Coin Interactive Badge */}
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-emerald-950/60 via-slate-900 to-slate-900 border border-emerald-500/20 p-6 md:p-8 backdrop-blur-xl shadow-2xl flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="relative z-10 space-y-2 text-center md:text-left">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-semibold">
              <Sparkles className="w-3.5 h-3.5" />
              <span>স্বাগতম, {user.displayName || user.email?.split('@')[0]}!</span>
            </div>
            <h2 className="text-2xl md:text-3xl font-extrabold text-white tracking-tight">
              আপনার আর্থিক স্বাস্থ্য এক নজরে নিরীক্ষণ করুন
            </h2>
            <p className="text-xs md:text-sm text-slate-300 max-w-xl">
              সঠিক পরিকল্পনাই ভবিষ্যতের আর্থিক নিরাপত্তা। নিচের বাটনগুলো ব্যবহার করে আপনার 
              আজকের আয় ও ব্যয়ের হিসাব দ্রুত অন্তর্ভুক্ত করুন।
            </p>
          </div>

          <div className="relative z-10 flex items-center gap-4">
            <div className="flex flex-col items-center">
              <ThreeCoin size={80} />
              <span className="text-[10px] text-emerald-400/80 font-mono mt-1">3D Coin Interact</span>
            </div>

            <div className="flex flex-col sm:flex-row gap-2.5">
              <button
                onClick={() => handleOpenAdd('income')}
                className="px-4 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs shadow-lg shadow-emerald-500/25 transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                <TrendingUp className="w-4 h-4" />
                <span>+ আয় যুক্ত করুন</span>
              </button>
              <button
                onClick={() => handleOpenAdd('expense')}
                className="px-4 py-2.5 rounded-xl bg-rose-500/20 hover:bg-rose-500/30 border border-rose-500/40 text-rose-300 font-bold text-xs transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                <TrendingDown className="w-4 h-4 text-rose-400" />
                <span>- খরচ লিখুন</span>
              </button>
            </div>
          </div>

          {/* Glow backdrop */}
          <div className="absolute -top-16 -right-16 w-64 h-64 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
        </div>

        {/* 1. Summary Cards (Total Balance, Income, Expense, This Month) */}
        <SummaryCards />

        {/* 2. Visual Charts & Analytics */}
        <AnalyticsCharts />

        {/* 3. Transaction History List with Filters & CRUD */}
        <TransactionList
          onEdit={handleEdit}
          onAddNew={() => handleOpenAdd('expense')}
        />
      </main>

      {/* Floating Quick Action Button on Mobile */}
      <div className="fixed bottom-6 right-6 md:hidden z-40">
        <button
          onClick={() => handleOpenAdd('expense')}
          className="w-14 h-14 rounded-full bg-emerald-500 text-slate-950 flex items-center justify-center shadow-2xl shadow-emerald-500/50 hover:scale-105 active:scale-95 transition-transform"
          aria-label="Add transaction"
        >
          <Plus className="w-7 h-7 stroke-[2.5]" />
        </button>
      </div>

      {/* Transaction Modal (Add / Edit) */}
      <AddTransactionModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        editingTransaction={editingTx}
        initialType={modalType}
      />

      {/* Footer */}
      <footer className="mt-auto border-t border-slate-900 bg-slate-950 py-6 text-center text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-2">
          <p>© {new Date().getFullYear()} TakaTrack — আপনার নিরাপদ ক্লাউড পার্সোনাল ফিন্যান্স ট্র্যাকার।</p>
          <p className="flex items-center gap-1.5 text-slate-400">
            <span>Powered by Firebase Auth & Firestore</span>
          </p>
        </div>
      </footer>
    </div>
  );
}
