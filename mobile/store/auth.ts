import * as SecureStore from 'expo-secure-store';
import { create } from 'zustand';

const STORAGE_KEY = 'auth_data';

export interface AuthUser {
    id: string;
    email: string;
    currency: string;
    isOnboarded: boolean;
}

interface AuthState {
    token: string | null;
    user: AuthUser | null;
    isLoading: boolean;
    hydrateFromStorage: () => Promise<void>;
    setAuth: (token: string, user: AuthUser) => Promise<void>;
    clearAuth: () => Promise<void>;
}

export const useAuthStore = create<AuthState>((set) => ({
    token: null,
    user: null,
    isLoading: true,

    hydrateFromStorage: async () => {
        try {
            const stored = await SecureStore.getItemAsync(STORAGE_KEY);
            if (stored) {
                const { token, user } = JSON.parse(stored);
                set({ token, user, isLoading: false });
            } else {
                set({ isLoading: false });
            }
        } catch {
            set({ isLoading: false });
        }
    },

    setAuth: async (token, user) => {
        await SecureStore.setItemAsync(STORAGE_KEY, JSON.stringify({ token, user }));
        set({ token, user });
    },

    clearAuth: async () => {
        await SecureStore.deleteItemAsync(STORAGE_KEY);
        set({ token: null, user: null });
    },
}));
