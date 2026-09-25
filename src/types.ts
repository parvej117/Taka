export type TransactionType = 'income' | 'expense';

export type ExpenseCategory =
  | 'Food'
  | 'Transport'
  | 'Rent'
  | 'Shopping'
  | 'Bills'
  | 'Education'
  | 'Medical'
  | 'Entertainment'
  | 'Investment'
  | 'Other';

export type IncomeCategory =
  | 'Salary'
  | 'Freelance'
  | 'Business'
  | 'Investments'
  | 'Gifts'
  | 'Allowance'
  | 'Other';

export interface Transaction {
  id: string;
  type: TransactionType;
  amount: number;
  category: ExpenseCategory | IncomeCategory | string;
  date: string; // YYYY-MM-DD
  note?: string;
  createdAt: number;
  userId: string;
  paymentMethod?: 'Cash' | 'bKash' | 'Nagad' | 'Bank' | 'Card' | 'Other';
}

export interface CategoryMeta {
  name: string;
  icon: string;
  color: string;
  bgLight: string;
}

export const EXPENSE_CATEGORIES: Record<string, CategoryMeta> = {
  Food: { name: 'Food & Dining', icon: '🍔', color: '#f97316', bgLight: 'rgba(249, 115, 22, 0.15)' },
  Transport: { name: 'Transport & Fuel', icon: '🚌', color: '#06b6d4', bgLight: 'rgba(6, 182, 212, 0.15)' },
  Rent: { name: 'Rent & Housing', icon: '🏠', color: '#8b5cf6', bgLight: 'rgba(139, 92, 246, 0.15)' },
  Shopping: { name: 'Shopping & Groceries', icon: '🛍️', color: '#ec4899', bgLight: 'rgba(236, 72, 153, 0.15)' },
  Bills: { name: 'Bills & Utilities', icon: '💡', color: '#eab308', bgLight: 'rgba(234, 179, 8, 0.15)' },
  Education: { name: 'Education & Courses', icon: '📚', color: '#3b82f6', bgLight: 'rgba(59, 130, 246, 0.15)' },
  Medical: { name: 'Medical & Healthcare', icon: '🏥', color: '#ef4444', bgLight: 'rgba(239, 68, 68, 0.15)' },
  Entertainment: { name: 'Entertainment & Fun', icon: '🎮', color: '#a855f7', bgLight: 'rgba(168, 85, 247, 0.15)' },
  Investment: { name: 'Investment & Savings', icon: '💎', color: '#10b981', bgLight: 'rgba(16, 185, 129, 0.15)' },
  Other: { name: 'Other Expenses', icon: '📦', color: '#64748b', bgLight: 'rgba(100, 116, 139, 0.15)' },
};

export const INCOME_CATEGORIES: Record<string, CategoryMeta> = {
  Salary: { name: 'Salary / Job', icon: '💼', color: '#10b981', bgLight: 'rgba(16, 185, 129, 0.15)' },
  Freelance: { name: 'Freelance & Projects', icon: '💻', color: '#3b82f6', bgLight: 'rgba(59, 130, 246, 0.15)' },
  Business: { name: 'Business Profits', icon: '🏢', color: '#8b5cf6', bgLight: 'rgba(139, 92, 246, 0.15)' },
  Investments: { name: 'Investment Returns', icon: '📈', color: '#06b6d4', bgLight: 'rgba(6, 182, 212, 0.15)' },
  Gifts: { name: 'Gifts & Rewards', icon: '🎁', color: '#ec4899', bgLight: 'rgba(236, 72, 153, 0.15)' },
  Allowance: { name: 'Pocket Money / Allowance', icon: '🪙', color: '#f59e0b', bgLight: 'rgba(245, 158, 11, 0.15)' },
  Other: { name: 'Other Income', icon: '✨', color: '#64748b', bgLight: 'rgba(100, 116, 139, 0.15)' },
};

export interface UserProfile {
  uid: string;
  email: string | null;
  displayName: string | null;
  currency: string; // default '৳' (BDT)
  monthlyBudget?: number;
}
