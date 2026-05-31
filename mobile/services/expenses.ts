import api from './api';

export interface ExpenseResponse {
    id: string;
    categoryId: string;
    categoryName: string;
    amount: number;
    merchant: string | null;
    description: string | null;
    date: string;
    receiptImageUrl: string | null;
    createdAt: string;
}

export interface CreateExpensePayload {
    categoryId: string;
    amount: number;
    merchant?: string;
    description?: string;
    date: string;
}

export const expenseService = {
    getAll: (params: { categoryId?: string; month?: number; year?: number }) =>
        api.get<ExpenseResponse[]>('/expenses', { params }),

    create: (payload: CreateExpensePayload) =>
        api.post('/expenses', payload),

    delete: (id: string) =>
        api.delete(`/expenses/${id}`),
};
