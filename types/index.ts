export type TransactionType = "INCOME" | "EXPENSE";

export interface User {
  id: string;
  supabase_id: string;
  email: string;
  name: string | null;
  monthly_budget: number | null;
  created_at: string;
  updated_at: string;
}

export interface Category {
  id: string;
  user_id: string;
  name: string;
  icon: string | null;
  color: string | null;
  is_default: boolean;
  created_at: string;
}

export interface Transaction {
  id: string;
  user_id: string;
  category_id: string | null;
  type: TransactionType;
  amount: number;
  description: string;
  note: string | null;
  date: string;
  created_at: string;
  updated_at: string;
}

export interface TransactionWithCategory extends Transaction {
  category: Pick<Category, "id" | "name" | "icon" | "color"> | null;
}

export interface CategorySummary {
  categoryId: string | null;
  categoryName: string;
  categoryIcon: string | null;
  categoryColor: string | null;
  total: number;
  percentage: number;
  count: number;
}

export interface MonthlyData {
  month: string;
  income: number;
  expense: number;
}

export interface DailySpending {
  date: string;
  amount: number;
}

export interface InsightResponse {
  id: string;
  response: string;
  createdAt: string;
  scope: string | null;
  scopeValue: string | null;
}

export interface DashboardSummary {
  totalIncome: number;
  totalExpenses: number;
  netBalance: number;
  monthlyBudget: number | null;
  budgetRemaining: number | null;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}
