import React, { useMemo, useState } from 'react';
import { motion } from 'motion/react';
import {
  PieChart as PieIcon,
  BarChart3,
  TrendingUp,
  Calendar,
  Layers,
  ArrowUpRight,
  ArrowDownRight,
} from 'lucide-react';
import { useTransactions } from '../context/TransactionsContext';
import { useAuth } from '../context/AuthContext';
import { EXPENSE_CATEGORIES, INCOME_CATEGORIES } from '../types';

export const AnalyticsCharts: React.FC = () => {
  const { transactions } = useTransactions();
  const { currency } = useAuth();
  const [chartMode, setChartMode] = useState<'categories' | 'monthly' | 'trend'>('categories');
  const [activeCategoryType, setActiveCategoryType] = useState<'expense' | 'income'>('expense');

  // 1. Category-wise Breakdown
  const categoryData = useMemo(() => {
    const totals: Record<string, number> = {};
    let grandTotal = 0;

    transactions
      .filter((t) => t.type === activeCategoryType)
      .forEach((t) => {
        const val = Number(t.amount) || 0;
        totals[t.category] = (totals[t.category] || 0) + val;
        grandTotal += val;
      });

    const entries = Object.entries(totals)
      .map(([cat, amount]) => {
        const meta =
          activeCategoryType === 'expense'
            ? EXPENSE_CATEGORIES[cat] || { name: cat, icon: '📦', color: '#64748b' }
            : INCOME_CATEGORIES[cat] || { name: cat, icon: '✨', color: '#64748b' };
        const percent = grandTotal > 0 ? (amount / grandTotal) * 100 : 0;
        return {
          category: cat,
          name: meta.name,
          icon: meta.icon,
          color: meta.color,
          amount,
          percent,
        };
      })
      .sort((a, b) => b.amount - a.amount);

    return { entries, grandTotal };
  }, [transactions, activeCategoryType]);

  // 2. Last 6 Months Comparison (Income vs Expense)
  const monthlyData = useMemo(() => {
    const monthsMap: Record<string, { income: number; expense: number; label: string }> = {};

    // Get last 6 calendar months
    const now = new Date();
    for (let i = 5; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
      const label = d.toLocaleDateString('bn-BD', { month: 'short' });
      monthsMap[key] = { income: 0, expense: 0, label };
    }

    transactions.forEach((tx) => {
      const key = tx.date?.substring(0, 7);
      if (key && monthsMap[key]) {
        const amt = Number(tx.amount) || 0;
        if (tx.type === 'income') monthsMap[key].income += amt;
        else monthsMap[key].expense += amt;
      }
    });

    const list = Object.entries(monthsMap).map(([key, val]) => ({
      key,
      ...val,
    }));

    const maxVal = Math.max(
      ...list.map((m) => Math.max(m.income, m.expense, 1000))
    );

    return { list, maxVal };
  }, [transactions]);

  // SVG Pie generator helper
  const pieSlices = useMemo(() => {
    if (categoryData.grandTotal === 0) return [];
    let cumulativeAngle = 0;
    return categoryData.entries.map((item) => {
      const sliceAngle = (item.amount / categoryData.grandTotal) * 360;
      const startAngle = cumulativeAngle;
      const endAngle = cumulativeAngle + sliceAngle;
      cumulativeAngle += sliceAngle;

      const r = 70;
      const cx = 100;
      const cy = 100;

      const startRad = ((startAngle - 90) * Math.PI) / 180;
      const endRad = ((endAngle - 90) * Math.PI) / 180;

      const x1 = cx + r * Math.cos(startRad);
      const y1 = cy + r * Math.sin(startRad);
      const x2 = cx + r * Math.cos(endRad);
      const y2 = cy + r * Math.sin(endRad);

      const largeArc = sliceAngle > 180 ? 1 : 0;
      const pathData =
        sliceAngle >= 359.99
          ? `M ${cx} ${cy - r} A ${r} ${r} 0 1 1 ${cx - 0.001} ${cy - r} Z`
          : `M ${cx} ${cy} L ${x1} ${y1} A ${r} ${r} 0 ${largeArc} 1 ${x2} ${y2} Z`;

      return {
        ...item,
        pathData,
        startAngle,
        endAngle,
      };
    });
  }, [categoryData]);

  return (
    <div className="rounded-3xl bg-slate-900/80 border border-slate-800 p-6 backdrop-blur-xl shadow-xl">
      {/* Top Header & Tab Controls */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-slate-800 pb-5">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-2xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
            <BarChart3 className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base md:text-lg font-bold text-white flex items-center gap-2">
              রিপোর্ট ও বিশ্লেষণ (Reports & Analytics)
            </h3>
            <p className="text-xs text-slate-400">
              আপনার আর্থিক লেনদেনের ভিজ্যুয়াল গ্রাফ ও ক্যাটাগরি চার্ট
            </p>
          </div>
        </div>

        {/* View Switcher */}
        <div className="flex items-center gap-2 bg-slate-950/80 p-1 rounded-2xl border border-slate-800">
          <button
            onClick={() => setChartMode('categories')}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
              chartMode === 'categories'
                ? 'bg-emerald-500 text-slate-950 shadow-md font-bold'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            ক্যাটাগরি চার্ট
          </button>
          <button
            onClick={() => setChartMode('monthly')}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
              chartMode === 'monthly'
                ? 'bg-emerald-500 text-slate-950 shadow-md font-bold'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            মাসিক তুলনা
          </button>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="mt-6">
        {chartMode === 'categories' ? (
          <div>
            {/* Toggle Income vs Expense for category */}
            <div className="flex items-center justify-between mb-6">
              <div className="inline-flex p-1 rounded-xl bg-slate-950 border border-slate-800">
                <button
                  onClick={() => setActiveCategoryType('expense')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                    activeCategoryType === 'expense'
                      ? 'bg-rose-500/20 text-rose-300 border border-rose-500/40'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  খরচের খাত (Expenses)
                </button>
                <button
                  onClick={() => setActiveCategoryType('income')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                    activeCategoryType === 'income'
                      ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  আয়ের খাত (Incomes)
                </button>
              </div>

              <span className="text-xs text-slate-400 font-mono">
                মোট: <strong className="text-white">{currency} {categoryData.grandTotal.toLocaleString()}</strong>
              </span>
            </div>

            {categoryData.entries.length === 0 ? (
              <div className="py-12 text-center text-slate-500">
                <PieIcon className="w-10 h-10 mx-auto mb-2 opacity-30" />
                <p className="text-sm">এই ক্যাটাগরিতে এখনো কোনো তথ্য যুক্ত করা হয়নি।</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-center">
                {/* 3D Ring Pie Chart */}
                <div className="md:col-span-5 flex flex-col items-center justify-center relative">
                  <div className="relative w-56 h-56 flex items-center justify-center">
                    <svg viewBox="0 0 200 200" className="w-full h-full transform -rotate-90">
                      {pieSlices.map((slice, i) => (
                        <path
                          key={i}
                          d={slice.pathData}
                          fill={slice.color}
                          className="transition-all duration-300 hover:opacity-80 cursor-pointer"
                        />
                      ))}
                      {/* Donut inner hole */}
                      <circle cx="100" cy="100" r="46" fill="#0f172a" />
                    </svg>

                    {/* Donut Center Label */}
                    <div className="absolute inset-0 flex flex-col items-center justify-center text-center pointer-events-none">
                      <span className="text-[10px] uppercase font-bold tracking-wider text-slate-400">
                        {activeCategoryType === 'expense' ? 'মোট খরচ' : 'মোট আয়'}
                      </span>
                      <span className="text-base font-extrabold text-white font-mono">
                        {currency} {categoryData.grandTotal.toLocaleString()}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Category Bars List */}
                <div className="md:col-span-7 space-y-3.5">
                  {categoryData.entries.slice(0, 6).map((item) => (
                    <div key={item.category} className="group">
                      <div className="flex items-center justify-between text-xs mb-1.5">
                        <div className="flex items-center gap-2">
                          <span className="text-base">{item.icon}</span>
                          <span className="font-semibold text-slate-200">{item.category}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="font-mono text-slate-300">
                            {currency} {item.amount.toLocaleString()}
                          </span>
                          <span className="font-mono text-slate-500 w-10 text-right">
                            {item.percent.toFixed(1)}%
                          </span>
                        </div>
                      </div>

                      {/* Progress bar */}
                      <div className="w-full bg-slate-950 h-2.5 rounded-full overflow-hidden p-0.5 border border-slate-800">
                        <motion.div
                          initial={{ width: 0 }}
                          animate={{ width: `${item.percent}%` }}
                          transition={{ duration: 0.8, ease: 'easeOut' }}
                          className="h-full rounded-full"
                          style={{ backgroundColor: item.color }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        ) : (
          /* Monthly Income vs Expense Bar Chart */
          <div>
            <div className="flex items-center justify-between mb-4">
              <span className="text-xs text-slate-400">
                বিগত ৬ মাসের আয় ও ব্যয়ের তুলনামূলক চার্ট
              </span>
              <div className="flex items-center gap-4 text-xs">
                <span className="flex items-center gap-1.5 text-emerald-400">
                  <span className="w-3 h-3 rounded-md bg-emerald-500 inline-block" /> আয় (Income)
                </span>
                <span className="flex items-center gap-1.5 text-rose-400">
                  <span className="w-3 h-3 rounded-md bg-rose-500 inline-block" /> খরচ (Expense)
                </span>
              </div>
            </div>

            <div className="mt-8 grid grid-cols-6 gap-2 sm:gap-6 items-end h-56 pt-4 pb-2 border-b border-slate-800">
              {monthlyData.list.map((m) => {
                const incHeight = (m.income / monthlyData.maxVal) * 100;
                const expHeight = (m.expense / monthlyData.maxVal) * 100;

                return (
                  <div key={m.key} className="flex flex-col items-center h-full justify-end group">
                    <div className="flex items-end gap-1.5 w-full justify-center h-44">
                      {/* Income Bar */}
                      <div className="relative w-4 sm:w-7 flex flex-col items-center justify-end h-full">
                        <motion.div
                          initial={{ height: 0 }}
                          animate={{ height: `${Math.max(incHeight, 4)}%` }}
                          transition={{ duration: 0.6 }}
                          className="w-full bg-gradient-to-t from-emerald-600 to-emerald-400 rounded-t-lg group-hover:brightness-110 shadow-lg shadow-emerald-500/20"
                        />
                      </div>

                      {/* Expense Bar */}
                      <div className="relative w-4 sm:w-7 flex flex-col items-center justify-end h-full">
                        <motion.div
                          initial={{ height: 0 }}
                          animate={{ height: `${Math.max(expHeight, 4)}%` }}
                          transition={{ duration: 0.6, delay: 0.1 }}
                          className="w-full bg-gradient-to-t from-rose-600 to-rose-400 rounded-t-lg group-hover:brightness-110 shadow-lg shadow-rose-500/20"
                        />
                      </div>
                    </div>

                    <span className="text-[11px] font-medium text-slate-400 mt-2 truncate">
                      {m.label}
                    </span>
                  </div>
                );
              })}
            </div>

            {/* Monthly quick summaries */}
            <div className="mt-4 grid grid-cols-2 sm:grid-cols-3 gap-3">
              <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800/80">
                <span className="text-[11px] text-slate-400">সর্বোচ্চ আয়ের মাস</span>
                <p className="text-sm font-bold text-emerald-400 mt-0.5">
                  {currency} {Math.max(...monthlyData.list.map((m) => m.income)).toLocaleString()}
                </p>
              </div>
              <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800/80">
                <span className="text-[11px] text-slate-400">সর্বোচ্চ খরচের মাস</span>
                <p className="text-sm font-bold text-rose-400 mt-0.5">
                  {currency} {Math.max(...monthlyData.list.map((m) => m.expense)).toLocaleString()}
                </p>
              </div>
              <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800/80 col-span-2 sm:col-span-1">
                <span className="text-[11px] text-slate-400">সঞ্চয়ের হার</span>
                <p className="text-sm font-bold text-teal-300 mt-0.5">
                  সুস্থ ব্যালেন্স ব্যবস্থাপনা
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
