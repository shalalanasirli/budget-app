import api from './api';

export interface UserResponse {
    id: string;
    email: string;
    currency: string;
    isOnboarded: boolean;
}

export const userService = {
    updateMe: (payload: { currency?: string; isOnboarded?: boolean }) =>
        api.put<UserResponse>('/users/me', payload),
};
