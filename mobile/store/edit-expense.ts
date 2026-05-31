import { create } from 'zustand';
import { type ExpenseResponse } from '@/services/expenses';

interface EditExpenseStore {
    expense: ExpenseResponse | null;
    set: (expense: ExpenseResponse) => void;
    clear: () => void;
}

export const useEditExpenseStore = create<EditExpenseStore>((set) => ({
    expense: null,
    set: (expense) => set({ expense }),
    clear: () => set({ expense: null }),
}));
