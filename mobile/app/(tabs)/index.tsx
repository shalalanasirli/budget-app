import { useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    Modal,
    Pressable,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    View,
} from 'react-native';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { budgetService } from '@/services/budgets';
import { walletService, type Wallet } from '@/services/wallets';
import BudgetProgressBar from '@/components/BudgetProgressBar';
import { useAuthStore } from '@/store/auth';

export interface BudgetSummary {
    id: string;
    categoryId: string;
    categoryName: string;
    monthlyLimit: number;
    spent: number;
    month: number;
    year: number;
}

const MONTH_NAMES = [
    'January', 'February', 'March', 'April',
    'May', 'June', 'July', 'August',
    'September', 'October', 'November', 'December',
];

function WalletCard({ wallet, symbol }: { wallet: Wallet; symbol: string }) {
    return (
        <View style={styles.walletCard}>
            <Text style={styles.walletCardName} numberOfLines={1}>{wallet.name}</Text>
            <Text style={styles.walletCardBalance}>
                {symbol} {wallet.balance.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </Text>
            <Text style={styles.walletCardCurrency}>{wallet.currency}</Text>
        </View>
    );
}

export default function HomeScreen() {
    const queryClient = useQueryClient();
    const currency = useAuthStore((s) => s.user?.currency ?? 'USD');
    const now = new Date();
    const [month, setMonth] = useState(now.getMonth() + 1);
    const [year, setYear] = useState(now.getFullYear());

    // Add wallet modal
    const [addWalletVisible, setAddWalletVisible] = useState(false);
    const [walletName, setWalletName] = useState('');
    const [walletBalance, setWalletBalance] = useState('');
    const [addingWallet, setAddingWallet] = useState(false);

    const { data: wallets } = useQuery({
        queryKey: ['wallets'],
        queryFn: async () => (await walletService.getAll()).data as Wallet[],
    });

    const { data: budgets, isLoading, isError, refetch } = useQuery({
        queryKey: ['budgets', month, year],
        queryFn: async () => {
            const res = await budgetService.getAll({ month, year });
            return res.data as BudgetSummary[];
        },
    });

    const totalLimit = budgets?.reduce((s, b) => s + b.monthlyLimit, 0) ?? 0;
    const totalSpent = budgets?.reduce((s, b) => s + b.spent, 0) ?? 0;

    const fmt = (n: number) =>
        n.toLocaleString('en-US', { style: 'currency', currency: currency || 'USD' });

    const goToPrev = () => {
        if (month === 1) { setMonth(12); setYear((y) => y - 1); }
        else setMonth((m) => m - 1);
    };

    const goToNext = () => {
        if (month === 12) { setMonth(1); setYear((y) => y + 1); }
        else setMonth((m) => m + 1);
    };

    const handleAddWallet = async () => {
        const name = walletName.trim();
        const balance = parseFloat(walletBalance);
        if (!name) {
            Alert.alert('Missing name', 'Enter a wallet name.');
            return;
        }
        if (isNaN(balance) || balance < 0) {
            Alert.alert('Invalid balance', 'Enter a valid starting balance.');
            return;
        }
        setAddingWallet(true);
        try {
            await walletService.create(name, balance);
            queryClient.invalidateQueries({ queryKey: ['wallets'] });
            setWalletName('');
            setWalletBalance('');
            setAddWalletVisible(false);
        } catch {
            Alert.alert('Error', 'Failed to create wallet.');
        } finally {
            setAddingWallet(false);
        }
    };

    return (
        <ScrollView style={styles.container} contentContainerStyle={styles.content}>
            {/* Wallet strip */}
            <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                style={styles.walletStrip}
                contentContainerStyle={styles.walletStripContent}
            >
                {wallets?.map((w) => (
                    <WalletCard key={w.id} wallet={w} symbol={w.currency} />
                ))}
                <Pressable
                    style={styles.addWalletCard}
                    onPress={() => setAddWalletVisible(true)}
                >
                    <Text style={styles.addWalletIcon}>+</Text>
                </Pressable>
            </ScrollView>

            {/* Month nav */}
            <View style={styles.monthNav}>
                <Pressable onPress={goToPrev} style={styles.navBtn}>
                    <Text style={styles.navArrow}>‹</Text>
                </Pressable>
                <Text style={styles.monthLabel}>{MONTH_NAMES[month - 1]} {year}</Text>
                <Pressable onPress={goToNext} style={styles.navBtn}>
                    <Text style={styles.navArrow}>›</Text>
                </Pressable>
            </View>

            {totalLimit > 0 && (
                <View style={styles.summary}>
                    <Text style={styles.summarySpent}>{fmt(totalSpent)}</Text>
                    <Text style={styles.summaryLabel}>of {fmt(totalLimit)} budget</Text>
                </View>
            )}

            {isLoading && <ActivityIndicator style={styles.loader} color="#2563EB" />}

            {isError && (
                <View style={styles.emptyState}>
                    <Text style={styles.emptyText}>Failed to load budgets.</Text>
                    <Pressable onPress={() => refetch()}>
                        <Text style={styles.retryText}>Retry</Text>
                    </Pressable>
                </View>
            )}

            {!isLoading && !isError && budgets?.length === 0 && (
                <View style={styles.emptyState}>
                    <Text style={styles.emptyText}>No budgets set for this month.</Text>
                    <Text style={styles.emptySubtext}>
                        Add budgets to start tracking your spending.
                    </Text>
                </View>
            )}

            {budgets?.map((b) => (
                <BudgetProgressBar
                    key={b.id}
                    categoryName={b.categoryName}
                    spent={b.spent}
                    limit={b.monthlyLimit}
                />
            ))}

            {/* Add wallet modal */}
            <Modal
                visible={addWalletVisible}
                transparent
                animationType="slide"
                onRequestClose={() => setAddWalletVisible(false)}
            >
                <Pressable
                    style={styles.modalBackdrop}
                    onPress={() => setAddWalletVisible(false)}
                >
                    <Pressable style={styles.modalSheet} onPress={() => {}}>
                        <Text style={styles.modalTitle}>New Wallet</Text>

                        <Text style={styles.inputLabel}>Name</Text>
                        <TextInput
                            style={styles.modalInput}
                            value={walletName}
                            onChangeText={setWalletName}
                            placeholder="e.g. Cash, Savings"
                            placeholderTextColor="#9CA3AF"
                            autoFocus
                        />

                        <Text style={styles.inputLabel}>Starting Balance</Text>
                        <TextInput
                            style={styles.modalInput}
                            value={walletBalance}
                            onChangeText={setWalletBalance}
                            placeholder="0.00"
                            placeholderTextColor="#9CA3AF"
                            keyboardType="decimal-pad"
                        />

                        <Pressable
                            style={[styles.modalBtn, addingWallet && styles.disabled]}
                            onPress={handleAddWallet}
                            disabled={addingWallet}
                        >
                            {addingWallet ? (
                                <ActivityIndicator color="#fff" />
                            ) : (
                                <Text style={styles.modalBtnText}>Add Wallet</Text>
                            )}
                        </Pressable>
                    </Pressable>
                </Pressable>
            </Modal>
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#fff',
    },
    content: {
        paddingHorizontal: 24,
        paddingBottom: 32,
    },
    // Wallet strip
    walletStrip: {
        marginHorizontal: -24,
        marginTop: 16,
        flexGrow: 0,
    },
    walletStripContent: {
        paddingHorizontal: 24,
        gap: 12,
        paddingBottom: 4,
    },
    walletCard: {
        width: 148,
        backgroundColor: '#1E3A8A',
        borderRadius: 16,
        padding: 16,
        justifyContent: 'space-between',
        minHeight: 96,
    },
    walletCardName: {
        fontSize: 13,
        color: 'rgba(255,255,255,0.75)',
        fontWeight: '500',
        marginBottom: 8,
    },
    walletCardBalance: {
        fontSize: 20,
        fontWeight: '700',
        color: '#fff',
    },
    walletCardCurrency: {
        fontSize: 12,
        color: 'rgba(255,255,255,0.6)',
        marginTop: 4,
    },
    addWalletCard: {
        width: 148,
        minHeight: 96,
        borderRadius: 16,
        borderWidth: 2,
        borderColor: '#E5E7EB',
        borderStyle: 'dashed',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#F9FAFB',
    },
    addWalletIcon: {
        fontSize: 32,
        color: '#9CA3AF',
        lineHeight: 36,
    },
    // Month nav
    monthNav: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingVertical: 20,
    },
    navBtn: {
        padding: 8,
    },
    navArrow: {
        fontSize: 24,
        color: '#2563EB',
        lineHeight: 28,
    },
    monthLabel: {
        fontSize: 17,
        fontWeight: '600',
        color: '#111827',
    },
    summary: {
        alignItems: 'center',
        paddingVertical: 20,
        marginBottom: 8,
        borderRadius: 12,
        backgroundColor: '#F9FAFB',
    },
    summarySpent: {
        fontSize: 32,
        fontWeight: '700',
        color: '#111827',
    },
    summaryLabel: {
        fontSize: 14,
        color: '#6B7280',
        marginTop: 4,
    },
    loader: {
        marginTop: 40,
    },
    emptyState: {
        alignItems: 'center',
        paddingTop: 60,
        gap: 8,
    },
    emptyText: {
        fontSize: 15,
        color: '#374151',
        fontWeight: '500',
    },
    emptySubtext: {
        fontSize: 13,
        color: '#9CA3AF',
        textAlign: 'center',
    },
    retryText: {
        fontSize: 14,
        color: '#2563EB',
        marginTop: 4,
    },
    // Add wallet modal
    modalBackdrop: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.4)',
        justifyContent: 'flex-end',
    },
    modalSheet: {
        backgroundColor: '#fff',
        borderTopLeftRadius: 20,
        borderTopRightRadius: 20,
        padding: 24,
        paddingBottom: 40,
        gap: 8,
    },
    modalTitle: {
        fontSize: 18,
        fontWeight: '700',
        color: '#111827',
        marginBottom: 8,
    },
    inputLabel: {
        fontSize: 12,
        fontWeight: '600',
        color: '#6B7280',
        textTransform: 'uppercase',
        letterSpacing: 0.4,
        marginBottom: 4,
    },
    modalInput: {
        borderWidth: 1,
        borderColor: '#E5E7EB',
        borderRadius: 10,
        padding: 13,
        fontSize: 15,
        color: '#111827',
        marginBottom: 8,
    },
    modalBtn: {
        backgroundColor: '#2563EB',
        borderRadius: 12,
        padding: 15,
        alignItems: 'center',
        marginTop: 8,
    },
    modalBtnText: { color: '#fff', fontWeight: '700', fontSize: 16 },
    disabled: { opacity: 0.5 },
});
