import { useEffect, useState } from 'react';
import {
    ActivityIndicator,
    KeyboardAvoidingView,
    Platform,
    Pressable,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { categoryService, type Category } from '@/services/categories';
import { budgetService } from '@/services/budgets';

export default function BudgetSetupScreen() {
    const [categories, setCategories] = useState<Category[]>([]);
    const [amounts, setAmounts] = useState<Record<string, string>>({});
    const [loadingCategories, setLoadingCategories] = useState(true);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState('');
    const router = useRouter();

    useEffect(() => {
        categoryService
            .getAll()
            .then(({ data }) => setCategories(data))
            .catch(() => setError('Failed to load categories.'))
            .finally(() => setLoadingCategories(false));
    }, []);

    const handleNext = async () => {
        const now = new Date();
        const entries = Object.entries(amounts).filter(([, value]) => {
            const n = parseFloat(value);
            return !isNaN(n) && n > 0;
        });

        if (entries.length === 0) {
            router.push('/onboarding/success');
            return;
        }

        setSaving(true);
        setError('');
        try {
            await Promise.all(
                entries.map(([categoryId, amount]) =>
                    budgetService.create({
                        categoryId,
                        monthlyLimit: parseFloat(amount),
                        month: now.getMonth() + 1,
                        year: now.getFullYear(),
                    }),
                ),
            );
            router.push('/onboarding/success');
        } catch {
            setError('Failed to save budgets. Please try again.');
        } finally {
            setSaving(false);
        }
    };

    if (loadingCategories) {
        return (
            <SafeAreaView style={styles.centered}>
                <ActivityIndicator size="large" color="#2563EB" />
            </SafeAreaView>
        );
    }

    return (
        <SafeAreaView style={styles.safeArea} edges={['top', 'bottom']}>
            <KeyboardAvoidingView
                style={styles.container}
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            >
                <View style={styles.header}>
                    <Text style={styles.title}>Set your budgets</Text>
                    <Text style={styles.subtitle}>
                        Add a monthly limit for each category. You can update these anytime.
                    </Text>
                </View>

                <ScrollView
                    style={styles.list}
                    showsVerticalScrollIndicator={false}
                    keyboardShouldPersistTaps="handled"
                >
                    {categories.map((category) => (
                        <View key={category.id} style={styles.row}>
                            <Text style={styles.categoryName}>{category.name}</Text>
                            <TextInput
                                style={styles.amountInput}
                                placeholder="0.00"
                                value={amounts[category.id] ?? ''}
                                onChangeText={(value) =>
                                    setAmounts((prev) => ({ ...prev, [category.id]: value }))
                                }
                                keyboardType="decimal-pad"
                                placeholderTextColor="#9CA3AF"
                            />
                        </View>
                    ))}
                </ScrollView>

                {error ? <Text style={styles.error}>{error}</Text> : null}

                <View style={styles.footer}>
                    <Pressable
                        style={styles.skipButton}
                        onPress={() => router.push('/onboarding/success')}
                    >
                        <Text style={styles.skipText}>Skip for now</Text>
                    </Pressable>

                    <Pressable
                        style={[styles.button, saving && styles.buttonDisabled]}
                        onPress={handleNext}
                        disabled={saving}
                    >
                        {saving ? (
                            <ActivityIndicator color="#fff" />
                        ) : (
                            <Text style={styles.buttonText}>Next</Text>
                        )}
                    </Pressable>
                </View>
            </KeyboardAvoidingView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    centered: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#fff',
    },
    safeArea: {
        flex: 1,
        backgroundColor: '#fff',
    },
    container: {
        flex: 1,
        paddingHorizontal: 24,
        paddingBottom: 24,
    },
    header: {
        paddingTop: 24,
        paddingBottom: 24,
        gap: 8,
    },
    title: {
        fontSize: 26,
        fontWeight: '700',
        color: '#111827',
    },
    subtitle: {
        fontSize: 14,
        color: '#6B7280',
        lineHeight: 20,
    },
    list: {
        flex: 1,
    },
    row: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingVertical: 14,
        borderBottomWidth: 1,
        borderBottomColor: '#F3F4F6',
    },
    categoryName: {
        fontSize: 15,
        color: '#111827',
        fontWeight: '500',
        flex: 1,
    },
    amountInput: {
        width: 100,
        textAlign: 'right',
        fontSize: 15,
        color: '#111827',
        paddingVertical: 6,
        paddingHorizontal: 10,
        borderWidth: 1,
        borderColor: '#E5E7EB',
        borderRadius: 8,
    },
    error: {
        color: '#DC2626',
        fontSize: 14,
        marginBottom: 12,
    },
    footer: {
        gap: 12,
        marginTop: 16,
    },
    skipButton: {
        alignItems: 'center',
        padding: 12,
    },
    skipText: {
        color: '#6B7280',
        fontSize: 14,
    },
    button: {
        backgroundColor: '#2563EB',
        borderRadius: 12,
        padding: 16,
        alignItems: 'center',
    },
    buttonDisabled: {
        opacity: 0.4,
    },
    buttonText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: '600',
    },
});
