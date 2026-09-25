import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Search,
  Filter,
  Trash2,
  Edit2,
  Calendar,
  CreditCard,
  ArrowDownLeft,
  ArrowUpRight,
  Sparkles,
  Inbox,
  Plus,
} from 'lucide-react';
import { Transaction, EXPENSE_CATEGORIES, INCOME_CATEGORIES } from '../types';
import { useTransactions } from '../context/TransactionsContext';
import { useAuth } from '../context/AuthContext';

interface TransactionListProps {
  onEdit: (tx: Transaction) => void;
  onAddNew: () => void;
}

export const TransactionList: React.FC<TransactionListProps> = ({ onEdit, onAddNew }) => {
  const { transactions, deleteTransaction, seedDemoTransactions } = useTransactions();
  const { currency } = useAuth();

  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState<'all' | 'income' | 'expense'>('all');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);

  // Filtered transactions
  const filtered = useMemo(() => {
    return transactions.filter((tx) => {
      // Type match
      if (typeFilter !== 'all' && tx.type !== typeFilter) return false;
      // Category match
      if (categoryFilter !== 'all' && tx.category !== categoryFilter) return false;
      // Search note or category
      if (search.trim()) {
        const query = search.toLowerCase();
        const noteMatch = tx.note?.toLowerCase().includes(query);
        const catMatch = tx.category.toLowerCase().includes(query);
        const methodMatch = tx.paymentMethod?.toLowerCase().includes(query);
        if (!noteMatch && !catMatch && !methodMatch) return false;
      }
      return true;
    });
  }, [transactions, search, typeFilter, categoryFilter]);

  const handleDelete = async (id: string) => {
    await deleteTransaction(id);
    setDeleteConfirmId(null);
  };

  return (
    <div className="rounded-3xl bg-slate-900/80 border border-slate-800 p-6 backdrop-blur-xl shadow-xl">
      {/* List Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-5 border-b border-slate-800">
        <div>
          <h3 className="text-base md:text-lg font-bold text-white flex items-center gap-2">
            সর্বশেষ লেনদেন (Recent Transactions)
            <span className="text-xs px-2.5 py-0.5 rounded-full bg-slate-800 text-slate-400 font-normal">
              {filtered.length} টি এন্ট্রি
            </span>
          </h3>
          <p className="text-xs text-slate-400">
            আপনার সকল আয় ও ব্যয়ের তালিকা এবং বিস্তারিত হিস্ট্রি
          </p>
        </div>

        {/* Action button */}
        <div className="flex items-center gap-2">
          {transactions.length === 0 && (
            <button
              onClick={seedDemoTransactions}
              className="px-3.5 py-2 rounded-xl text-xs font-semibold bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 hover:bg-emerald-500/20 transition-all flex items-center gap-1.5 cursor-pointer"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>ডেমো ডাটা লোড করুন</span>
            </button>
          )}

          <button
            onClick={onAddNew}
            className="px-4 py-2 rounded-xl text-xs font-bold bg-emerald-500 hover:bg-emerald-400 text-slate-950 transition-all flex items-center gap-1.5 shadow-lg shadow-emerald-500/20 cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>নতুন যোগ করুন</span>
          </button>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="mt-5 grid grid-cols-1 sm:grid-cols-12 gap-3">
        {/* Search */}
        <div className="sm:col-span-6 relative">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
          <input
            type="text"
            placeholder="নোট বা ক্যাটাগরি খুঁজুন..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-slate-950/70 border border-slate-800 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500"
          />
        </div>

        {/* Type Filter */}
        <div className="sm:col-span-3">
          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value as any)}
            className="w-full px-3 py-2 bg-slate-950/70 border border-slate-800 rounded-xl text-xs text-slate-300 focus:outline-none focus:border-emerald-500 cursor-pointer"
          >
            <option value="all">সব ধরন (All Types)</option>
            <option value="income">শুধু আয় (Income)</option>
            <option value="expense">শুধু খরচ (Expense)</option>
          </select>
        </div>

        {/* Category Filter */}
        <div className="sm:col-span-3">
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="w-full px-3 py-2 bg-slate-950/70 border border-slate-800 rounded-xl text-xs text-slate-300 focus:outline-none focus:border-emerald-500 cursor-pointer"
          >
            <option value="all">সব ক্যাটাগরি (All Categories)</option>
            <optgroup label="খরচ (Expense)">
              {Object.keys(EXPENSE_CATEGORIES).map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </optgroup>
            <optgroup label="আয় (Income)">
              {Object.keys(INCOME_CATEGORIES).map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </optgroup>
          </select>
        </div>
      </div>

      {/* Transactions List */}
      <div className="mt-5 space-y-2.5">
        {filtered.length === 0 ? (
          <div className="text-center py-12 px-4 rounded-2xl border border-dashed border-slate-800 bg-slate-950/30">
            <Inbox className="w-10 h-10 mx-auto text-slate-600 mb-3" />
            <h4 className="text-sm font-semibold text-slate-300">কোনো লেনদেন পাওয়া যায়নি</h4>
            <p className="text-xs text-slate-500 max-w-sm mx-auto mt-1">
              {transactions.length === 0
                ? 'আপনার প্রথম আয় বা খরচের হিসাব যোগ করতে উপরের বাটনে ক্লিক করুন অথবা ডেমো ডাটা দেখতে পারেন।'
                : 'আপনার ফিল্টারের সাথে মিলে এমন কোনো লেনদেন নেই।'}
            </p>
          </div>
        ) : (
          filtered.map((tx) => {
            const isExpense = tx.type === 'expense';
            const meta = isExpense
              ? EXPENSE_CATEGORIES[tx.category] || { icon: '📦', color: '#f43f5e' }
              : INCOME_CATEGORIES[tx.category] || { icon: '✨', color: '#10b981' };

            return (
              <motion.div
                key={tx.id}
                layout
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="group relative flex flex-col sm:flex-row sm:items-center justify-between p-3.5 sm:p-4 rounded-2xl bg-slate-950/60 border border-slate-800/80 hover:border-slate-700 hover:bg-slate-950 transition-all gap-3"
              >
                {/* Left side info */}
                <div className="flex items-center gap-3.5">
                  <div
                    className="w-11 h-11 rounded-2xl flex items-center justify-center text-xl shrink-0 shadow-inner"
                    style={{ backgroundColor: `${meta.color}20` }}
                  >
                    <span>{meta.icon}</span>
                  </div>

                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <h4 className="text-sm font-bold text-white truncate">{tx.category}</h4>
                      {tx.paymentMethod && (
                        <span className="px-2 py-0.5 rounded-md text-[10px] font-semibold bg-slate-800 text-slate-400">
                          {tx.paymentMethod}
                        </span>
                      )}
                    </div>
                    {tx.note && (
                      <p className="text-xs text-slate-400 truncate max-w-xs md:max-w-md mt-0.5">
                        {tx.note}
                      </p>
                    )}
                    <div className="flex items-center gap-2 text-[11px] text-slate-500 mt-1">
                      <Calendar className="w-3 h-3" />
                      <span>{tx.date}</span>
                    </div>
                  </div>
                </div>

                {/* Right side amount & action buttons */}
                <div className="flex items-center justify-between sm:justify-end gap-4 border-t sm:border-t-0 pt-2 sm:pt-0 border-slate-850">
                  <div className="text-right">
                    <div
                      className={`text-base font-extrabold font-mono flex items-center justify-end gap-0.5 ${
                        isExpense ? 'text-rose-400' : 'text-emerald-400'
                      }`}
                    >
                      <span>{isExpense ? '-' : '+'}</span>
                      <span>{currency}</span>
                      <span>{Number(tx.amount).toLocaleString()}</span>
                    </div>
                    <span className="text-[10px] text-slate-500 uppercase tracking-wider font-semibold">
                      {isExpense ? 'খরচ' : 'আয়'}
                    </span>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-1 opacity-90 sm:opacity-0 group-hover:opacity-100 transition-opacity">
                    <button
                      onClick={() => onEdit(tx)}
                      className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
                      title="Edit transaction"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>

                    {deleteConfirmId === tx.id ? (
                      <div className="flex items-center gap-1 bg-rose-500/10 border border-rose-500/30 p-1 rounded-xl">
                        <button
                          onClick={() => handleDelete(tx.id)}
                          className="px-2 py-0.5 text-[11px] bg-rose-500 hover:bg-rose-600 text-white font-bold rounded-lg cursor-pointer"
                        >
                          মুছুন
                        </button>
                        <button
                          onClick={() => setDeleteConfirmId(null)}
                          className="px-1.5 py-0.5 text-[11px] text-slate-400 hover:text-white"
                        >
                          না
                        </button>
                      </div>
                    ) : (
                      <button
                        onClick={() => setDeleteConfirmId(tx.id)}
                        className="p-1.5 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 transition-colors"
                        title="Delete transaction"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                </div>
              </motion.div>
            );
          })
        )}
      </div>
    </div>
  );
};
