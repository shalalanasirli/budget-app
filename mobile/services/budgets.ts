import api from './api';

export const budgetService = {
    create: (payload: {
        categoryId: string;
        monthlyLimit: number;
        month: number;
        year: number;
    }) => api.post('/budgets', payload),
};
