import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Stack, useRouter, useSegments } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { useEffect } from 'react';
import { useAuthStore } from '@/store/auth';

SplashScreen.preventAutoHideAsync();

const queryClient = new QueryClient();

export default function RootLayout() {
    return (
        <QueryClientProvider client={queryClient}>
            <AuthGuard />
        </QueryClientProvider>
    );
}

function AuthGuard() {
    const { token, user, isLoading, hydrateFromStorage } = useAuthStore();
    const router = useRouter();
    const segments = useSegments();

    useEffect(() => {
        hydrateFromStorage().then(() => SplashScreen.hideAsync());
    }, []);

    useEffect(() => {
        if (isLoading) return;

        const inAuthGroup = segments[0] === '(auth)';
        const inOnboarding = segments[0] === 'onboarding';

        if (!token) {
            if (!inAuthGroup) router.replace('/(auth)/login');
        } else if (!user?.isOnboarded) {
            if (!inOnboarding) router.replace('/onboarding/welcome');
        } else {
            if (inAuthGroup || inOnboarding) router.replace('/(tabs)');
        }
    }, [token, user, isLoading, segments]);

    return (
        <Stack>
            <Stack.Screen name="(auth)" options={{ headerShown: false }} />
            <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
            <Stack.Screen name="onboarding" options={{ headerShown: false }} />
            <Stack.Screen
                name="add-expense"
                options={{ presentation: 'modal', title: 'Add Expense' }}
            />
            <Stack.Screen
                name="scan-receipt"
                options={{ presentation: 'modal', title: 'Scan Receipt' }}
            />
        </Stack>
    );
}
