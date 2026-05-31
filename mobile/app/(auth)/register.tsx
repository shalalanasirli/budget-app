import { useState } from 'react';
import {
    ActivityIndicator,
    Pressable,
    StyleSheet,
    Text,
    TextInput,
    View,
} from 'react-native';
import { useRouter } from 'expo-router';
import { authService } from '@/services/auth';
import { useAuthStore } from '@/store/auth';

export default function RegisterScreen() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const { setAuth } = useAuthStore();
    const router = useRouter();

    const handleRegister = async () => {
        if (password.length < 8) {
            setError('Password must be at least 8 characters.');
            return;
        }
        if (password !== confirmPassword) {
            setError('Passwords do not match.');
            return;
        }
        setError('');
        setLoading(true);
        try {
            const { data } = await authService.register(email.trim(), password);
            await setAuth(data.token, {
                id: data.userId,
                email: data.email,
                currency: data.currency,
                isOnboarded: data.isOnboarded,
            });
        } catch (e: any) {
            const message = e.response?.data?.message;
            setError(message ?? 'Something went wrong. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <View style={styles.container}>
            <Text style={styles.title}>Create account</Text>

            <TextInput
                style={styles.input}
                placeholder="Email"
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
                autoCapitalize="none"
                autoCorrect={false}
            />

            <TextInput
                style={styles.input}
                placeholder="Password (min. 8 characters)"
                value={password}
                onChangeText={setPassword}
                secureTextEntry
            />

            <TextInput
                style={styles.input}
                placeholder="Repeat password"
                value={confirmPassword}
                onChangeText={setConfirmPassword}
                secureTextEntry
            />

            {error ? <Text style={styles.error}>{error}</Text> : null}

            <Pressable
                style={[styles.button, loading && styles.buttonDisabled]}
                onPress={handleRegister}
                disabled={loading}
            >
                {loading ? (
                    <ActivityIndicator color="#fff" />
                ) : (
                    <Text style={styles.buttonText}>Create account</Text>
                )}
            </Pressable>

            <Pressable onPress={() => router.replace('/(auth)/login')}>
                <Text style={styles.link}>Already have an account? Sign in</Text>
            </Pressable>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        paddingHorizontal: 24,
        backgroundColor: '#fff',
    },
    title: {
        fontSize: 28,
        fontWeight: '700',
        color: '#111827',
        marginBottom: 32,
    },
    input: {
        borderWidth: 1,
        borderColor: '#E5E7EB',
        borderRadius: 8,
        padding: 14,
        fontSize: 16,
        color: '#111827',
        marginBottom: 12,
    },
    error: {
        color: '#DC2626',
        fontSize: 14,
        marginBottom: 12,
    },
    button: {
        backgroundColor: '#2563EB',
        borderRadius: 8,
        padding: 16,
        alignItems: 'center',
        marginTop: 8,
        marginBottom: 16,
    },
    buttonDisabled: {
        opacity: 0.6,
    },
    buttonText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: '600',
    },
    link: {
        color: '#2563EB',
        fontSize: 14,
        textAlign: 'center',
    },
});
