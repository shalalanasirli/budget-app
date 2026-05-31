import api from '@/services/api';

export interface Wallet {
    id: string;
    name: string;
    balance: number;
    currency: string;
    createdAt: string;
}

export const walletService = {
    getAll: () => api.get<Wallet[]>('/wallets'),

    create: (name: string, balance: number, currency?: string) =>
        api.post<Wallet>('/wallets', { name, balance, currency }),

    update: (id: string, payload: { name?: string; balance?: number }) =>
        api.put<Wallet>(`/wallets/${id}`, payload),

    deleteWallet: (id: string) => api.delete(`/wallets/${id}`),
};
