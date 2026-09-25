import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Wallet,
  LogOut,
  User,
  Settings,
  Plus,
  TrendingDown,
  TrendingUp,
  Sparkles,
  Shield,
  Layers,
  ChevronDown,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { ThreeCoin } from './ThreeCoin';

interface NavbarProps {
  onAddTransaction: (type: 'expense' | 'income') => void;
}

export const Navbar: React.FC<NavbarProps> = ({ onAddTransaction }) => {
  const { user, profile, signOut, currency, setCurrency, monthlyBudget, setMonthlyBudget } = useAuth();
  const [showSettings, setShowSettings] = useState(false);
  const [newBudget, setNewBudget] = useState(String(monthlyBudget));

  const handleSaveBudget = async () => {
    const val = parseFloat(newBudget);
    if (!isNaN(val) && val >= 0) {
      await setMonthlyBudget(val);
      setShowSettings(false);
    }
  };

  return (
    <header className="sticky top-0 z-30 w-full backdrop-blur-xl bg-slate-950/80 border-b border-slate-800/80">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-18 flex items-center justify-between">
        {/* Brand with 3D Coin */}
        <div className="flex items-center gap-3">
          <ThreeCoin size={42} />
          <div>
            <div className="flex items-center gap-1.5">
              <span className="text-xl font-black tracking-tight text-white">
                Taka<span className="text-emerald-400">Track</span>
              </span>
              <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                PRO
              </span>
            </div>
            <p className="text-[11px] text-slate-400 hidden sm:block">
              স্মার্ট পার্সোনাল ফিন্যান্স
            </p>
          </div>
        </div>

        {/* Right CTA & Profile */}
        <div className="flex items-center gap-2.5 sm:gap-3">
          {/* Quick Add Buttons */}
          <div className="hidden md:flex items-center gap-2">
            <button
              onClick={() => onAddTransaction('income')}
              className="px-3.5 py-2 rounded-xl text-xs font-bold bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 hover:bg-emerald-500/20 transition-all flex items-center gap-1.5 cursor-pointer"
            >
              <TrendingUp className="w-3.5 h-3.5 text-emerald-400" />
              <span>+ আয় (Income)</span>
            </button>

            <button
              onClick={() => onAddTransaction('expense')}
              className="px-3.5 py-2 rounded-xl text-xs font-bold bg-rose-500/10 border border-rose-500/30 text-rose-300 hover:bg-rose-500/20 transition-all flex items-center gap-1.5 cursor-pointer"
            >
              <TrendingDown className="w-3.5 h-3.5 text-rose-400" />
              <span>- খরচ (Expense)</span>
            </button>
          </div>

          {/* Settings Trigger */}
          <div className="relative">
            <button
              onClick={() => setShowSettings(!showSettings)}
              className="p-2 sm:px-3 sm:py-2 rounded-xl bg-slate-900 border border-slate-800 text-slate-300 hover:text-white hover:border-slate-700 transition-all flex items-center gap-2 text-xs font-semibold cursor-pointer"
              title="Settings"
            >
              <Settings className="w-4 h-4 text-emerald-400" />
              <span className="hidden sm:inline">সেটিংস</span>
            </button>

            <AnimatePresence>
              {showSettings && (
                <motion.div
                  initial={{ opacity: 0, y: 10, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 10, scale: 0.95 }}
                  className="absolute right-0 mt-2 w-72 p-4 bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl z-50 text-slate-200"
                >
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3">
                    প্রেফারেন্স ও বাজেট
                  </h4>

                  {/* Currency Selector */}
                  <div className="mb-3">
                    <label className="text-xs text-slate-400 block mb-1">মুদ্রা (Currency)</label>
                    <div className="grid grid-cols-4 gap-1.5">
                      {['৳', '$', '€', '₹'].map((curr) => (
                        <button
                          key={curr}
                          onClick={() => setCurrency(curr)}
                          className={`py-1.5 rounded-lg text-xs font-bold border transition-colors cursor-pointer ${
                            currency === curr
                              ? 'bg-emerald-500 text-slate-950 border-emerald-400'
                              : 'bg-slate-950 border-slate-800 text-slate-300 hover:bg-slate-800'
                          }`}
                        >
                          {curr}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Monthly Budget Setting */}
                  <div className="mb-4">
                    <label className="text-xs text-slate-400 block mb-1">
                      মাসিক বাজেট লিমিট ({currency})
                    </label>
                    <input
                      type="number"
                      value={newBudget}
                      onChange={(e) => setNewBudget(e.target.value)}
                      className="w-full px-3 py-1.5 bg-slate-950 border border-slate-800 rounded-lg text-xs font-mono text-white focus:outline-none focus:border-emerald-500"
                    />
                  </div>

                  <button
                    onClick={handleSaveBudget}
                    className="w-full py-2 rounded-xl bg-emerald-500 text-slate-950 font-bold text-xs hover:bg-emerald-400 transition-colors cursor-pointer"
                  >
                    পরিবর্তন সেভ করুন
                  </button>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* User Profile & Sign Out */}
          <div className="flex items-center gap-2 pl-2 border-l border-slate-800">
            <div className="hidden lg:flex flex-col text-right">
              <span className="text-xs font-bold text-white max-w-[130px] truncate">
                {profile?.displayName || user?.email?.split('@')[0] || 'User'}
              </span>
              <span className="text-[10px] text-slate-400 truncate max-w-[130px]">
                {user?.email}
              </span>
            </div>

            <button
              onClick={() => signOut()}
              className="p-2 sm:px-3 sm:py-2 rounded-xl bg-slate-900 border border-slate-800 text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 hover:border-rose-500/20 transition-all text-xs font-semibold flex items-center gap-1.5 cursor-pointer"
              title="লগআউট করুন"
            >
              <LogOut className="w-4 h-4" />
              <span className="hidden sm:inline">লগআউট</span>
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};
