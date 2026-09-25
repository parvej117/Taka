import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  X,
  PlusCircle,
  Calendar,
  CreditCard,
  FileText,
  DollarSign,
  Tag,
  Check,
} from 'lucide-react';
import {
  Transaction,
  TransactionType,
  EXPENSE_CATEGORIES,
  INCOME_CATEGORIES,
} from '../types';
import { useTransactions } from '../context/TransactionsContext';
import { useAuth } from '../context/AuthContext';
import confetti from 'canvas-confetti';

interface AddTransactionModalProps {
  isOpen: boolean;
  onClose: () => void;
  editingTransaction?: Transaction | null;
  initialType?: TransactionType;
}

export const AddTransactionModal: React.FC<AddTransactionModalProps> = ({
  isOpen,
  onClose,
  editingTransaction,
  initialType = 'expense',
}) => {
  const { addTransaction, updateTransaction } = useTransactions();
  const { currency } = useAuth();

  const [type, setType] = useState<TransactionType>(initialType);
  const [amount, setAmount] = useState<string>('');
  const [category, setCategory] = useState<string>('Food');
  const [date, setDate] = useState<string>(
    new Date().toISOString().split('T')[0]
  );
  const [note, setNote] = useState<string>('');
  const [paymentMethod, setPaymentMethod] = useState<'Cash' | 'bKash' | 'Nagad' | 'Bank' | 'Card' | 'Other'>('Cash');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Sync state if editing
  useEffect(() => {
    if (editingTransaction) {
      setType(editingTransaction.type);
      setAmount(String(editingTransaction.amount));
      setCategory(editingTransaction.category);
      setDate(editingTransaction.date);
      setNote(editingTransaction.note || '');
      setPaymentMethod(editingTransaction.paymentMethod || 'Cash');
    } else {
      setType(initialType);
      setAmount('');
      setCategory(initialType === 'expense' ? 'Food' : 'Salary');
      setDate(new Date().toISOString().split('T')[0]);
      setNote('');
      setPaymentMethod('bKash');
    }
    setError(null);
  }, [editingTransaction, initialType, isOpen]);

  // When switching type, update default category
  const handleTypeChange = (newType: TransactionType) => {
    setType(newType);
    if (newType === 'expense') {
      if (!EXPENSE_CATEGORIES[category]) {
        setCategory('Food');
      }
    } else {
      if (!INCOME_CATEGORIES[category]) {
        setCategory('Salary');
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const numAmount = parseFloat(amount);
    if (isNaN(numAmount) || numAmount <= 0) {
      setError('সঠিক টাকার পরিমাণ লিখুন (Amount must be > 0)');
      return;
    }
    if (!category) {
      setError('একটি ক্যাটাগরি বাছাই করুন');
      return;
    }
    if (!date) {
      setError('তারিখ দিন');
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      if (editingTransaction) {
        await updateTransaction(editingTransaction.id, {
          type,
          amount: numAmount,
          category,
          date,
          note: note.trim(),
          paymentMethod,
        });
      } else {
        await addTransaction({
          type,
          amount: numAmount,
          category,
          date,
          note: note.trim(),
          paymentMethod,
        });

        // Trigger celebratory confetti if income added!
        if (type === 'income') {
          confetti({
            particleCount: 60,
            spread: 70,
            origin: { y: 0.6 },
          });
        }
      }
      onClose();
    } catch (err: any) {
      console.error(err);
      setError(err.message || 'ব্যর্থ হয়েছে, অনুগ্রহ করে আবার চেষ্টা করুন');
    } finally {
      setIsSubmitting(false);
    }
  };

  const currentCategories =
    type === 'expense' ? EXPENSE_CATEGORIES : INCOME_CATEGORIES;

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm overflow-y-auto">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 15 }}
          className="relative w-full max-w-lg bg-slate-900 border border-slate-800 rounded-3xl p-6 md:p-8 shadow-2xl overflow-hidden my-8"
        >
          {/* Header */}
          <div className="flex items-center justify-between pb-4 border-b border-slate-800">
            <div>
              <h3 className="text-xl font-bold text-white flex items-center gap-2">
                {editingTransaction ? 'এন্ট্রি এডিট করুন' : 'নতুন এন্ট্রি যোগ করুন'}
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">
                টাকা ট্র্যাকারে আপনার লেনদেনের হিসাব লিপিবদ্ধ করুন
              </p>
            </div>
            <button
              onClick={onClose}
              className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {error && (
            <div className="mt-4 p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="mt-5 space-y-5">
            {/* Type selector (Income vs Expense) */}
            <div className="grid grid-cols-2 p-1.5 rounded-2xl bg-slate-950/80 border border-slate-800">
              <button
                type="button"
                onClick={() => handleTypeChange('expense')}
                className={`py-2.5 rounded-xl text-sm font-bold flex items-center justify-center gap-2 transition-all cursor-pointer ${
                  type === 'expense'
                    ? 'bg-rose-500 text-white shadow-lg shadow-rose-500/25'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <span>📉 খরচ (Expense)</span>
              </button>
              <button
                type="button"
                onClick={() => handleTypeChange('income')}
                className={`py-2.5 rounded-xl text-sm font-bold flex items-center justify-center gap-2 transition-all cursor-pointer ${
                  type === 'income'
                    ? 'bg-emerald-500 text-slate-950 shadow-lg shadow-emerald-500/25'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <span>📈 আয় (Income)</span>
              </button>
            </div>

            {/* Amount input */}
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1.5">
                পরিমাণ ({currency})
              </label>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-2xl font-bold text-emerald-400">
                  {currency}
                </span>
                <input
                  type="number"
                  step="any"
                  required
                  placeholder="0.00"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  className="w-full pl-12 pr-4 py-3 bg-slate-950/80 border border-slate-800 rounded-2xl text-2xl font-bold text-white placeholder-slate-600 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-all font-mono"
                  autoFocus
                />
              </div>
            </div>

            {/* Category selection */}
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-2">
                ক্যাটাগরি বাছাই করুন
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 max-h-48 overflow-y-auto pr-1">
                {Object.entries(currentCategories).map(([key, meta]) => {
                  const isSelected = category === key;
                  return (
                    <button
                      key={key}
                      type="button"
                      onClick={() => setCategory(key)}
                      className={`p-2.5 rounded-xl border text-left flex items-center gap-2.5 transition-all cursor-pointer ${
                        isSelected
                          ? 'border-emerald-500 bg-emerald-500/10 text-white ring-1 ring-emerald-500'
                          : 'border-slate-800 bg-slate-950/40 text-slate-300 hover:border-slate-700 hover:bg-slate-950/80'
                      }`}
                    >
                      <span className="text-xl">{meta.icon}</span>
                      <div className="min-w-0 flex-1">
                        <p className="text-xs font-semibold truncate leading-tight">
                          {key}
                        </p>
                      </div>
                      {isSelected && (
                        <Check className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                      )}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Date and Payment Method */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1.5">
                  তারিখ (Date)
                </label>
                <div className="relative">
                  <Calendar className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                  <input
                    type="date"
                    required
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    className="w-full pl-10 pr-3 py-2.5 bg-slate-950/80 border border-slate-800 rounded-xl text-xs font-medium text-white focus:outline-none focus:border-emerald-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1.5">
                  পদ্ধতি (Method)
                </label>
                <select
                  value={paymentMethod}
                  onChange={(e) => setPaymentMethod(e.target.value as any)}
                  className="w-full px-3 py-2.5 bg-slate-950/80 border border-slate-800 rounded-xl text-xs font-medium text-white focus:outline-none focus:border-emerald-500 cursor-pointer"
                >
                  <option value="Cash">💵 Cash (নগদ টাকা)</option>
                  <option value="bKash">🌸 bKash (বিকাশ)</option>
                  <option value="Nagad">🟠 Nagad (নগদ)</option>
                  <option value="Bank">🏦 Bank Transfer</option>
                  <option value="Card">💳 Credit / Debit Card</option>
                  <option value="Other">✨ Other</option>
                </select>
              </div>
            </div>

            {/* Note input */}
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1.5">
                নোট বা বিবরণ (ঐচ্ছিক)
              </label>
              <div className="relative">
                <FileText className="absolute left-3.5 top-3 w-4 h-4 text-slate-500" />
                <textarea
                  rows={2}
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                  placeholder="যেমন: সুপারশপে বাজার, রিকশা ভাড়া, ইত্যাদি..."
                  className="w-full pl-10 pr-3 py-2 bg-slate-950/80 border border-slate-800 rounded-xl text-xs text-white placeholder-slate-600 focus:outline-none focus:border-emerald-500 resize-none"
                />
              </div>
            </div>

            {/* Action buttons */}
            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2.5 rounded-xl border border-slate-800 text-xs font-semibold text-slate-300 hover:bg-slate-800 transition-colors"
              >
                বাতিল করুন
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className={`px-6 py-2.5 rounded-xl font-bold text-xs flex items-center gap-2 shadow-lg transition-all cursor-pointer ${
                  type === 'expense'
                    ? 'bg-rose-500 hover:bg-rose-400 text-white shadow-rose-500/20'
                    : 'bg-emerald-500 hover:bg-emerald-400 text-slate-950 shadow-emerald-500/20'
                } disabled:opacity-50`}
              >
                {isSubmitting ? (
                  <span className="inline-block w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
                ) : (
                  <>
                    <PlusCircle className="w-4 h-4" />
                    <span>{editingTransaction ? 'পরিবর্তন সেভ করুন' : 'সংরক্ষণ করুন'}</span>
                  </>
                )}
              </button>
            </div>
          </form>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
