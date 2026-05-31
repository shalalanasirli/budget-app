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

export default function LoginScreen() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const { setAuth } = useAuthStore();
    const router = useRouter();

    const handleLogin = async () => {
        setError('');
        setLoading(true);
        try {
            const { data } = await authService.login(email.trim(), password);
            await setAuth(data.token, {
                id: data.userId,
                email: data.email,
                currency: data.currency,
                isOnboarded: data.isOnboarded,
            });
        } catch {
            setError('Invalid email or password.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <View style={styles.container}>
            <Text style={styles.title}>Sign in</Text>

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
                placeholder="Password"
                value={password}
                onChangeText={setPassword}
                secureTextEntry
            />

            {error ? <Text style={styles.error}>{error}</Text> : null}

            <Pressable
                style={[styles.button, loading && styles.buttonDisabled]}
                onPress={handleLogin}
                disabled={loading}
            >
                {loading ? (
                    <ActivityIndicator color="#fff" />
                ) : (
                    <Text style={styles.buttonText}>Sign in</Text>
                )}
            </Pressable>

            <Pressable onPress={() => router.replace('/(auth)/register')}>
                <Text style={styles.link}>Don't have an account? Register</Text>
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
