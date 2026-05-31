import api from './api';

export interface Category {
    id: string;
    name: string;
    isDefault: boolean;
}

export const categoryService = {
    getAll: () => api.get<Category[]>('/categories'),
    create: (name: string) => api.post<Category>('/categories', { name }),
    deleteCategory: (id: string) => api.delete(`/categories/${id}`),
};
