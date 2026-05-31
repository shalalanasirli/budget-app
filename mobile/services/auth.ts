import api from './api';

export interface AuthResponse {
    token: string;
    userId: string;
    email: string;
    currency: string;
    isOnboarded: boolean;
}

export const authService = {
    register: (email: string, password: string) =>
        api.post<AuthResponse>('/auth/register', { email, password }),

    login: (email: string, password: string) =>
        api.post<AuthResponse>('/auth/login', { email, password }),
};
