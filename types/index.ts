import { Prisma } from "@prisma/client";

export type TransactionType = "INCOME" | "EXPENSE";

export interface TransactionWithCategory {
  id: string;
  userId: string;
  categoryId: string | null;
  type: TransactionType;
  amount: Prisma.Decimal;
  description: string;
  note: string | null;
  date: Date;
  createdAt: Date;
  updatedAt: Date;
  category: {
    id: string;
    name: string;
    icon: string | null;
    color: string | null;
  } | null;
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
