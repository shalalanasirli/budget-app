import { useState } from 'react';
import {
    ActivityIndicator,
    Pressable,
    ScrollView,
    StyleSheet,
    Text,
    View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { CURRENCIES } from '@/constants/currencies';
import { userService } from '@/services/user';
import { useAuthStore } from '@/store/auth';

export default function CurrencyScreen() {
    const [selected, setSelected] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const { updateUser } = useAuthStore();
    const router = useRouter();

    const handleNext = async () => {
        if (!selected) return;
        setLoading(true);
        setError('');
        try {
            await userService.updateMe({ currency: selected });
            await updateUser({ currency: selected });
            router.push('/onboarding/budget-setup');
        } catch {
            setError('Failed to save. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.header}>
                <Text style={styles.title}>Choose your currency</Text>
                <Text style={styles.subtitle}>You can change this later in settings.</Text>
            </View>

            <ScrollView style={styles.list} showsVerticalScrollIndicator={false}>
                {CURRENCIES.map((currency) => {
                    const isSelected = selected === currency.code;
                    return (
                        <Pressable
                            key={currency.code}
                            style={[styles.item, isSelected && styles.itemSelected]}
                            onPress={() => setSelected(currency.code)}
                        >
                            <View style={styles.itemSymbolContainer}>
                                <Text style={styles.itemSymbol}>{currency.symbol}</Text>
                            </View>
                            <View style={styles.itemLabels}>
                                <Text style={styles.itemCode}>{currency.code}</Text>
                                <Text style={styles.itemName}>{currency.name}</Text>
                            </View>
                            {isSelected && <View style={styles.selectedDot} />}
                        </Pressable>
                    );
                })}
            </ScrollView>

            {error ? <Text style={styles.error}>{error}</Text> : null}

            <Pressable
                style={[styles.button, (!selected || loading) && styles.buttonDisabled]}
                onPress={handleNext}
                disabled={!selected || loading}
            >
                {loading ? (
                    <ActivityIndicator color="#fff" />
                ) : (
                    <Text style={styles.buttonText}>Next</Text>
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
    },
    list: {
        flex: 1,
    },
    item: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 14,
        paddingHorizontal: 16,
        borderRadius: 10,
        marginBottom: 8,
        backgroundColor: '#F9FAFB',
        borderWidth: 1,
        borderColor: '#F3F4F6',
        gap: 12,
    },
    itemSelected: {
        borderColor: '#2563EB',
        backgroundColor: '#EFF6FF',
    },
    itemSymbolContainer: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: '#E5E7EB',
        alignItems: 'center',
        justifyContent: 'center',
    },
    itemSymbol: {
        fontSize: 16,
        fontWeight: '600',
        color: '#374151',
    },
    itemLabels: {
        flex: 1,
    },
    itemCode: {
        fontSize: 15,
        fontWeight: '600',
        color: '#111827',
    },
    itemName: {
        fontSize: 13,
        color: '#6B7280',
        marginTop: 2,
    },
    selectedDot: {
        width: 10,
        height: 10,
        borderRadius: 5,
        backgroundColor: '#2563EB',
    },
    error: {
        color: '#DC2626',
        fontSize: 14,
        marginBottom: 12,
    },
    button: {
        backgroundColor: '#2563EB',
        borderRadius: 12,
        padding: 16,
        alignItems: 'center',
        marginTop: 16,
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
