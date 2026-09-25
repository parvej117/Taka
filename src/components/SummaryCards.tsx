import React from 'react';
import { motion } from 'motion/react';
import {
  Wallet,
  TrendingUp,
  TrendingDown,
  CalendarDays,
  Target,
  ArrowUpRight,
  ArrowDownRight,
  Sparkles,
} from 'lucide-react';
import { useTransactions } from '../context/TransactionsContext';
import { useAuth } from '../context/AuthContext';

export const SummaryCards: React.FC = () => {
  const {
    totalBalance,
    totalIncome,
    totalExpense,
    thisMonthIncome,
    thisMonthExpense,
    thisMonthBalance,
  } = useTransactions();
  const { currency, monthlyBudget } = useAuth();

  const budgetUsedPercent = monthlyBudget > 0 
    ? Math.min(Math.round((thisMonthExpense / monthlyBudget) * 100), 100) 
    : 0;

  const cards = [
    {
      title: 'মোট ব্যালেন্স (Total Balance)',
      amount: totalBalance,
      icon: Wallet,
      gradient: 'from-emerald-600/30 via-emerald-800/10 to-transparent',
      borderColor: 'border-emerald-500/30',
      iconBg: 'bg-emerald-500/20 text-emerald-400',
      textColor: totalBalance >= 0 ? 'text-emerald-400' : 'text-rose-400',
      badge: totalBalance >= 0 ? 'পজিটিভ ফান্ড' : 'নেগেটিভ ফান্ড',
      badgeColor: totalBalance >= 0 ? 'text-emerald-400 bg-emerald-500/10' : 'text-rose-400 bg-rose-500/10',
      subtitle: `চলতি মাসের নীট: ${currency} ${thisMonthBalance.toLocaleString()}`,
    },
    {
      title: 'সর্বমোট আয় (Total Income)',
      amount: totalIncome,
      icon: TrendingUp,
      gradient: 'from-teal-600/30 via-teal-800/10 to-transparent',
      borderColor: 'border-teal-500/30',
      iconBg: 'bg-teal-500/20 text-teal-400',
      textColor: 'text-teal-300',
      badge: 'আয় বৃদ্ধি',
      badgeColor: 'text-teal-400 bg-teal-500/10',
      subtitle: `এই মাসে আয়: ${currency} ${thisMonthIncome.toLocaleString()}`,
    },
    {
      title: 'সর্বমোট খরচ (Total Expense)',
      amount: totalExpense,
      icon: TrendingDown,
      gradient: 'from-rose-600/30 via-rose-800/10 to-transparent',
      borderColor: 'border-rose-500/30',
      iconBg: 'bg-rose-500/20 text-rose-400',
      textColor: 'text-rose-400',
      badge: 'আউটফ্লো',
      badgeColor: 'text-rose-400 bg-rose-500/10',
      subtitle: `এই মাসে খরচ: ${currency} ${thisMonthExpense.toLocaleString()}`,
    },
    {
      title: 'চলতি মাস ও বাজেট (This Month)',
      amount: thisMonthExpense,
      icon: CalendarDays,
      gradient: 'from-amber-600/30 via-amber-800/10 to-transparent',
      borderColor: 'border-amber-500/30',
      iconBg: 'bg-amber-500/20 text-amber-400',
      textColor: 'text-amber-300',
      badge: `বাজেট ${budgetUsedPercent}% ব্যবহৃত`,
      badgeColor: budgetUsedPercent > 85 ? 'text-rose-400 bg-rose-500/10' : 'text-amber-400 bg-amber-500/10',
      isBudgetCard: true,
      subtitle: `বাজেট লিমিট: ${currency} ${monthlyBudget.toLocaleString()}`,
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-5">
      {cards.map((card, idx) => {
        const Icon = card.icon;
        return (
          <motion.div
            key={card.title}
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.35, delay: idx * 0.08 }}
            whileHover={{ y: -4, transition: { duration: 0.2 } }}
            className={`relative overflow-hidden rounded-3xl bg-slate-900/80 border ${card.borderColor} p-5 backdrop-blur-xl shadow-xl transition-all duration-300 hover:shadow-2xl group`}
          >
            {/* Background 3D Radial Glow */}
            <div
              className={`absolute -right-8 -top-8 w-36 h-36 bg-gradient-to-br ${card.gradient} rounded-full blur-2xl pointer-events-none group-hover:scale-125 transition-transform duration-500`}
            />

            <div className="relative z-10">
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-semibold text-slate-400 truncate max-w-[170px]">
                  {card.title}
                </span>
                <div className={`p-2.5 rounded-2xl ${card.iconBg} shadow-inner`}>
                  <Icon className="w-5 h-5" />
                </div>
              </div>

              <div className="flex items-baseline gap-1.5 mb-2">
                <span className="text-sm font-medium text-slate-400">{currency}</span>
                <span className={`text-2xl md:text-3xl font-extrabold tracking-tight font-mono ${card.textColor}`}>
                  {card.amount.toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 2 })}
                </span>
              </div>

              {card.isBudgetCard ? (
                <div className="mt-3 pt-3 border-t border-slate-800/80">
                  <div className="flex justify-between text-xs mb-1">
                    <span className="text-slate-400">বাজেট প্রোগ্রেস</span>
                    <span className="font-semibold text-slate-200">{budgetUsedPercent}%</span>
                  </div>
                  <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all duration-700 ${
                        budgetUsedPercent > 90
                          ? 'bg-rose-500'
                          : budgetUsedPercent > 70
                          ? 'bg-amber-500'
                          : 'bg-emerald-500'
                      }`}
                      style={{ width: `${budgetUsedPercent}%` }}
                    />
                  </div>
                  <p className="text-[11px] text-slate-400 mt-2 truncate">{card.subtitle}</p>
                </div>
              ) : (
                <div className="mt-3 pt-3 border-t border-slate-800/80 flex items-center justify-between text-xs">
                  <span className="text-slate-400 truncate">{card.subtitle}</span>
                  <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${card.badgeColor}`}>
                    {card.badge}
                  </span>
                </div>
              )}
            </div>
          </motion.div>
        );
      })}
    </div>
  );
};
