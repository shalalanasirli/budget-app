import api from './api';

export const budgetService = {
    getAll: (params: { month?: number; year?: number }) =>
        api.get('/budgets', { params }),

    create: (payload: {
        categoryId: string;
        monthlyLimit: number;
        month: number;
        year: number;
    }) => api.post('/budgets', payload),
};
