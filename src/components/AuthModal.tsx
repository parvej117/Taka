import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Wallet,
  Mail,
  Lock,
  User,
  ArrowRight,
  Sparkles,
  AlertCircle,
  CheckCircle2,
  TrendingUp,
  ShieldCheck,
  PieChart,
  HelpCircle,
  ChevronDown,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { ThreeCoin } from './ThreeCoin';

export const AuthModal: React.FC = () => {
  const { signIn, signUp, signInWithGoogle, signInWithDemo, resetPassword } = useAuth();
  const [isLogin, setIsLogin] = useState(true);
  const [isForgotPassword, setIsForgotPassword] = useState(false);

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isProviderDisabled, setIsProviderDisabled] = useState(false);
  const [showConsoleGuide, setShowConsoleGuide] = useState(false);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const handleGoogleSignIn = async () => {
    setError(null);
    setIsProviderDisabled(false);
    setLoading(true);
    try {
      await signInWithGoogle();
    } catch (err: any) {
      console.error(err);
      if (err.code === 'auth/popup-closed-by-user') {
        setError('গুগল লগইন পপআপ বন্ধ করা হয়েছে। আবার চেষ্টা করুন।');
      } else {
        setError(err.message || 'গুগল লগইন ব্যর্থ হয়েছে।');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsProviderDisabled(false);
    setSuccessMsg(null);
    setLoading(true);

    try {
      if (isForgotPassword) {
        if (!email.trim()) {
          throw new Error('Please enter your email address');
        }
        await resetPassword(email.trim());
        setSuccessMsg('Password reset link sent! Check your inbox.');
      } else if (isLogin) {
        if (!email.trim() || !password) {
          throw new Error('Please enter email and password');
        }
        await signIn(email.trim(), password);
      } else {
        if (!name.trim()) throw new Error('Please enter your full name');
        if (!email.trim() || !password) throw new Error('Please enter email and password');
        if (password.length < 6) throw new Error('Password must be at least 6 characters');
        await signUp(email.trim(), password, name.trim());
      }
    } catch (err: any) {
      console.error(err);
      let msg = err.message || 'Something went wrong';
      if (err.code === 'auth/operation-not-allowed') {
        setIsProviderDisabled(true);
        msg = 'Firebase-এ Email/Password লগইন প্রোভাইডার এখনও সক্রিয় (Enable) করা নেই। নিচের Google Sign-In বা ডেমো মোড ব্যবহার করুন।';
      } else if (err.code === 'auth/user-not-found' || err.code === 'auth/wrong-password' || err.code === 'auth/invalid-credential') {
        msg = 'ইমেইল বা পাসওয়ার্ড ভুল হয়েছে। সঠিক তথ্য দিয়ে চেষ্টা করুন।';
      } else if (err.code === 'auth/email-already-in-use') {
        msg = 'এই ইমেইল দিয়ে ইতিমধ্যে একাউন্ট আছে। দয়া করে লগইন করুন।';
      } else if (err.code === 'auth/weak-password') {
        msg = 'পাসওয়ার্ড কমপক্ষে ৬ অক্ষরের হতে হবে।';
      }
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative min-h-screen w-full flex items-center justify-center p-4 md:p-8 overflow-hidden bg-gradient-to-br from-slate-950 via-slate-900 to-emerald-950 text-slate-100">
      {/* Ambient background glows */}
      <div className="absolute top-1/4 -left-32 w-96 h-96 bg-emerald-500/15 rounded-full blur-3xl pointer-events-none animate-pulse" />
      <div className="absolute bottom-1/4 -right-32 w-96 h-96 bg-teal-500/15 rounded-full blur-3xl pointer-events-none animate-pulse delay-1000" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-4xl h-96 bg-emerald-600/5 rounded-full blur-[120px] pointer-events-none" />

      {/* Floating money / graph badges */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden opacity-25">
        <div className="absolute top-12 left-1/4 text-4xl animate-bounce delay-300">৳</div>
        <div className="absolute bottom-20 left-12 text-3xl animate-bounce delay-700">📈</div>
        <div className="absolute top-36 right-20 text-3xl animate-bounce delay-500">💰</div>
        <div className="absolute bottom-32 right-1/4 text-4xl animate-bounce delay-200">💎</div>
      </div>

      <div className="relative z-10 w-full max-w-5xl grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
        {/* Left Hero */}
        <div className="lg:col-span-6 space-y-6 text-center lg:text-left">
          <div className="inline-flex items-center gap-3 px-4 py-2 rounded-full bg-emerald-500/10 border border-emerald-500/20 backdrop-blur-md">
            <span className="flex h-2 w-2 rounded-full bg-emerald-400 animate-ping" />
            <span className="text-xs font-semibold uppercase tracking-wider text-emerald-300">
              Personal Finance • Realtime Cloud Sync
            </span>
          </div>

          <div className="flex flex-col items-center lg:items-start gap-4">
            <div className="flex items-center gap-4">
              <ThreeCoin size={76} />
              <div>
                <h1 className="text-4xl md:text-5xl font-black tracking-tight text-white flex items-center gap-2">
                  Taka<span className="text-emerald-400">Track</span>
                </h1>
                <p className="text-sm font-medium text-emerald-300/80">
                  স্মার্ট টাকা হিসাব ও বাজেট ম্যানেজার
                </p>
              </div>
            </div>

            <p className="text-base text-slate-300 max-w-md leading-relaxed">
              আপনার সমস্ত আয়-ব্যয়ের পুঙ্খানুপুঙ্খ হিসাব রাখুন এক জায়গায়। ক্যাটাগরি বিশ্লেষণ, 
              বাজেট ট্র্যাকিং এবং ইন্টারঅ্যাক্টিভ চার্ট দিয়ে টাকা সাশ্রয় করুন সহজে।
            </p>
          </div>

          {/* Feature Highlights */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
            <div className="p-3.5 rounded-2xl bg-slate-900/60 border border-slate-800 backdrop-blur-sm">
              <div className="w-8 h-8 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center mb-2">
                <ShieldCheck className="w-4 h-4" />
              </div>
              <h4 className="text-sm font-semibold text-white">ব্যক্তিগত ডেটা</h4>
              <p className="text-xs text-slate-400">প্রতিটি একাউন্টের তথ্য সম্পূর্ণ নিরাপদ ও আলাদা।</p>
            </div>

            <div className="p-3.5 rounded-2xl bg-slate-900/60 border border-slate-800 backdrop-blur-sm">
              <div className="w-8 h-8 rounded-xl bg-cyan-500/20 text-cyan-400 flex items-center justify-center mb-2">
                <PieChart className="w-4 h-4" />
              </div>
              <h4 className="text-sm font-semibold text-white">ক্যাটাগরি চার্ট</h4>
              <p className="text-xs text-slate-400">খাবার, ভাড়া, বিল ইত্যাদি সুন্দর গ্রাফে দেখুন।</p>
            </div>

            <div className="p-3.5 rounded-2xl bg-slate-900/60 border border-slate-800 backdrop-blur-sm">
              <div className="w-8 h-8 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center mb-2">
                <TrendingUp className="w-4 h-4" />
              </div>
              <h4 className="text-sm font-semibold text-white">মাসিক ব্যালেন্স</h4>
              <p className="text-xs text-slate-400">কত জমল আর কত খরচ হল সাথে সাথে হিসাব।</p>
            </div>
          </div>
        </div>

        {/* Right Auth Card */}
        <div className="lg:col-span-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            className="w-full max-w-md mx-auto p-6 md:p-8 rounded-3xl bg-slate-900/90 border border-slate-800 shadow-2xl backdrop-blur-xl"
          >
            {/* Header */}
            <div className="flex items-center justify-between border-b border-slate-800 pb-4 mb-5">
              <div>
                <h2 className="text-xl font-bold text-white">
                  {isForgotPassword
                    ? 'পাসওয়ার্ড পুনরুদ্ধার'
                    : isLogin
                    ? 'লগইন করুন'
                    : 'নতুন একাউন্ট খুলুন'}
                </h2>
                <p className="text-xs text-slate-400 mt-1">
                  {isForgotPassword
                    ? 'আপনার ইমেইলে পাসওয়ার্ড রিসেট লিংক পাঠানো হবে'
                    : 'TakaTrack-এ প্রবেশ করে আপনার আর্থিক হিসাব শুরু করুন'}
                </p>
              </div>

              {!isForgotPassword && (
                <div className="flex bg-slate-800/80 p-1 rounded-xl">
                  <button
                    type="button"
                    onClick={() => {
                      setIsLogin(true);
                      setError(null);
                      setIsProviderDisabled(false);
                    }}
                    className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all cursor-pointer ${
                      isLogin
                        ? 'bg-emerald-500 text-slate-950 shadow-md font-bold'
                        : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    লগইন
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setIsLogin(false);
                      setError(null);
                      setIsProviderDisabled(false);
                    }}
                    className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all cursor-pointer ${
                      !isLogin
                        ? 'bg-emerald-500 text-slate-950 shadow-md font-bold'
                        : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    রেজিস্টার
                  </button>
                </div>
              )}
            </div>

            {/* Recommended: Google Sign-in */}
            <div className="space-y-2.5 mb-5">
              <button
                type="button"
                onClick={handleGoogleSignIn}
                disabled={loading}
                className="w-full py-3 px-4 rounded-2xl bg-white hover:bg-slate-100 text-slate-900 font-bold text-sm shadow-lg shadow-white/5 active:scale-[0.98] transition-all flex items-center justify-center gap-3 cursor-pointer disabled:opacity-60"
              >
                <svg className="w-5 h-5 shrink-0" viewBox="0 0 24 24">
                  <path
                    fill="#4285F4"
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  />
                  <path
                    fill="#34A853"
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  />
                  <path
                    fill="#FBBC05"
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                  />
                  <path
                    fill="#EA4335"
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                  />
                </svg>
                <span>Google দিয়ে সরাসরি প্রবেশ করুন</span>
              </button>

              <button
                type="button"
                onClick={() => signInWithDemo()}
                disabled={loading}
                className="w-full py-2.5 px-4 rounded-xl bg-slate-950 hover:bg-slate-800/80 border border-emerald-500/30 text-emerald-400 font-semibold text-xs transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>লগইন ছাড়াই ডেমো মোডে দেখুন (Instant Demo)</span>
              </button>
            </div>

            {/* Divider */}
            <div className="relative flex items-center justify-center mb-5">
              <div className="border-t border-slate-800 w-full" />
              <span className="bg-slate-900 px-3 text-[11px] text-slate-500 font-medium uppercase tracking-wider shrink-0">
                অথবা ইমেইল দিয়ে
              </span>
              <div className="border-t border-slate-800 w-full" />
            </div>

            {/* Error & Warning Banner */}
            <AnimatePresence>
              {error && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="mb-4 p-3.5 rounded-2xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs space-y-2"
                >
                  <div className="flex items-start gap-2">
                    <AlertCircle className="w-4 h-4 shrink-0 text-rose-400 mt-0.5" />
                    <span className="leading-relaxed">{error}</span>
                  </div>

                  {isProviderDisabled && (
                    <div className="pt-2 border-t border-rose-500/20 space-y-2">
                      <p className="text-[11px] text-rose-200">
                        💡 <strong>সহজ সমাধান:</strong> উপরের <strong>Google Sign-In</strong> বা <strong>ডেমো মোড</strong> বাটনে ক্লিক করে সাথে সাথে ভেতরে প্রবেশ করতে পারবেন।
                      </p>
                      <button
                        type="button"
                        onClick={() => setShowConsoleGuide(!showConsoleGuide)}
                        className="text-[11px] text-emerald-400 hover:underline flex items-center gap-1 cursor-pointer font-medium"
                      >
                        <HelpCircle className="w-3.5 h-3.5" />
                        <span>Firebase-এ Email/Password কীভাবে অন করবেন?</span>
                      </button>

                      {showConsoleGuide && (
                        <div className="p-2.5 rounded-xl bg-slate-950 text-slate-300 text-[11px] leading-relaxed border border-slate-800">
                          ১. Firebase Console-এ যান (<code className="text-emerald-300">console.firebase.google.com</code>)<br/>
                          ২. Authentication &gt; <strong>Sign-in method</strong> ট্যাবে যান<br/>
                          ৩. <strong>Email/Password</strong> প্রোভাইডার সিলেক্ট করে <strong>Enable</strong> সেভ করুন
                        </div>
                      )}
                    </div>
                  )}
                </motion.div>
              )}
              {successMsg && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="mb-4 p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs flex items-center gap-2"
                >
                  <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-400" />
                  <span>{successMsg}</span>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Email/Password Form */}
            <form onSubmit={handleSubmit} className="space-y-4">
              {!isLogin && !isForgotPassword && (
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1.5">
                    আপনার পূর্ণ নাম
                  </label>
                  <div className="relative">
                    <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <input
                      type="text"
                      required
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="যেমন: তানভীর আহমেদ"
                      className="w-full pl-10 pr-4 py-2.5 bg-slate-950/60 border border-slate-750 rounded-xl text-sm text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-colors"
                    />
                  </div>
                </div>
              )}

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1.5">
                  ইমেইল এড্রেস
                </label>
                <div className="relative">
                  <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="name@example.com"
                    className="w-full pl-10 pr-4 py-2.5 bg-slate-950/60 border border-slate-750 rounded-xl text-sm text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-colors"
                  />
                </div>
              </div>

              {!isForgotPassword && (
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="block text-xs font-medium text-slate-300">
                      পাসওয়ার্ড
                    </label>
                    {isLogin && (
                      <button
                        type="button"
                        onClick={() => {
                          setIsForgotPassword(true);
                          setError(null);
                          setSuccessMsg(null);
                          setIsProviderDisabled(false);
                        }}
                        className="text-xs text-emerald-400 hover:text-emerald-300 transition-colors cursor-pointer"
                      >
                        পাসওয়ার্ড ভুলে গেছেন?
                      </button>
                    )}
                  </div>
                  <div className="relative">
                    <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <input
                      type="password"
                      required
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="••••••••"
                      className="w-full pl-10 pr-4 py-2.5 bg-slate-950/60 border border-slate-750 rounded-xl text-sm text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-colors"
                    />
                  </div>
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="w-full mt-2 py-3 px-4 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 font-bold text-sm shadow-lg shadow-emerald-500/20 active:scale-[0.98] transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
              >
                {loading ? (
                  <span className="inline-block w-4 h-4 border-2 border-slate-950 border-t-transparent rounded-full animate-spin" />
                ) : (
                  <>
                    <span>
                      {isForgotPassword
                        ? 'রিসেট লিংক পাঠান'
                        : isLogin
                        ? 'ইমেইল দিয়ে লগইন'
                        : 'ইমেইল দিয়ে একাউন্ট তৈরি'}
                    </span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </form>

            {/* Back to login if forgot pass */}
            {isForgotPassword && (
              <div className="mt-4 text-center">
                <button
                  type="button"
                  onClick={() => {
                    setIsForgotPassword(false);
                    setError(null);
                    setIsProviderDisabled(false);
                  }}
                  className="text-xs text-slate-400 hover:text-white transition-colors cursor-pointer"
                >
                  ← লগইনে ফিরে যান
                </button>
              </div>
            )}
          </motion.div>
        </div>
      </div>
    </div>
  );
};
