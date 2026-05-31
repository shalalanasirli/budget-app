import { useState } from 'react';
import { ActivityIndicator, Pressable, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { userService } from '@/services/user';
import { useAuthStore } from '@/store/auth';

export default function SuccessScreen() {
    const [loading, setLoading] = useState(false);
    const { updateUser } = useAuthStore();

    const handleStart = async () => {
        setLoading(true);
        try {
            await userService.updateMe({ isOnboarded: true });
        } catch {
            // Continue regardless — user should not be stuck on this screen
        } finally {
            await updateUser({ isOnboarded: true });
            setLoading(false);
        }
    };

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.content}>
                <View style={styles.iconContainer}>
                    <View style={styles.iconInner} />
                </View>
                <Text style={styles.title}>You're all set!</Text>
                <Text style={styles.subtitle}>
                    Start tracking your expenses and stay on top of your budgets.
                </Text>
            </View>

            <Pressable
                style={[styles.button, loading && styles.buttonDisabled]}
                onPress={handleStart}
                disabled={loading}
            >
                {loading ? (
                    <ActivityIndicator color="#fff" />
                ) : (
                    <Text style={styles.buttonText}>Start tracking</Text>
                )}
            </Pressable>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#fff',
        paddingHorizontal: 24,
        paddingBottom: 24,
        justifyContent: 'space-between',
    },
    content: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        gap: 16,
    },
    iconContainer: {
        width: 80,
        height: 80,
        borderRadius: 40,
        backgroundColor: '#DCFCE7',
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 8,
    },
    iconInner: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: '#16A34A',
    },
    title: {
        fontSize: 28,
        fontWeight: '700',
        color: '#111827',
    },
    subtitle: {
        fontSize: 16,
        color: '#6B7280',
        textAlign: 'center',
        lineHeight: 24,
    },
    button: {
        backgroundColor: '#2563EB',
        borderRadius: 12,
        padding: 16,
        alignItems: 'center',
    },
    buttonDisabled: {
        opacity: 0.6,
    },
    buttonText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: '600',
    },
});
