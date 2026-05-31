import { useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    Modal,
    Pressable,
    RefreshControl,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useRouter } from 'expo-router';
import { walletService, type Wallet } from '@/services/wallets';
import { expenseService, type ExpenseResponse } from '@/services/expenses';
import { useAuthStore } from '@/store/auth';

function formatDate(dateStr: string): string {
    const [year, month, day] = dateStr.split('-').map(Number);
    return new Date(year, month - 1, day).toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
    });
}

function WalletCard({ wallet }: { wallet: Wallet }) {
    return (
        <View style={styles.walletCard}>
            <Text style={styles.walletCardName} numberOfLines={1}>{wallet.name}</Text>
            <Text style={styles.walletCardBalance}>
                {wallet.balance.toLocaleString('en-US', {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2,
                })}
            </Text>
            <Text style={styles.walletCardCurrency}>{wallet.currency}</Text>
        </View>
    );
}

export default function DashboardScreen() {
    const router = useRouter();
    const queryClient = useQueryClient();
    const currency = useAuthStore((s) => s.user?.currency ?? 'USD');

    const [addWalletVisible, setAddWalletVisible] = useState(false);
    const [walletName, setWalletName] = useState('');
    const [walletBalance, setWalletBalance] = useState('');
    const [addingWallet, setAddingWallet] = useState(false);
    const [refreshing, setRefreshing] = useState(false);

    const { data: wallets, refetch: refetchWallets } = useQuery({
        queryKey: ['wallets'],
        queryFn: async () => (await walletService.getAll()).data as Wallet[],
    });

    const { data: recentExpenses, refetch: refetchExpenses } = useQuery({
        queryKey: ['expenses', 'recent'],
        queryFn: async () =>
            ((await expenseService.getAll({})).data as ExpenseResponse[]).slice(0, 3),
    });

    const handleRefresh = async () => {
        setRefreshing(true);
        await Promise.all([refetchWallets(), refetchExpenses()]);
        setRefreshing(false);
    };

    const fmt = (n: number) =>
        n.toLocaleString('en-US', { style: 'currency', currency: currency || 'USD' });

    const handleAddWallet = async () => {
        const name = walletName.trim();
        const balance = parseFloat(walletBalance);
        if (!name) { Alert.alert('Missing name', 'Enter a wallet name.'); return; }
        if (isNaN(balance) || balance < 0) { Alert.alert('Invalid balance', 'Enter a valid starting balance.'); return; }
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
        <SafeAreaView style={styles.safe} edges={['top']}>
            {/* Top bar */}
            <View style={styles.topBar}>
                <Text style={styles.screenTitle}>Dashboard</Text>
                <Pressable onPress={() => router.push('/settings')} hitSlop={8}>
                    <Text style={styles.settingsIcon}>⚙</Text>
                </Pressable>
            </View>

            <ScrollView
                contentContainerStyle={styles.content}
                refreshControl={
                    <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} tintColor="#2563EB" />
                }
            >
                {/* Wallet strip */}
                <ScrollView
                    horizontal
                    showsHorizontalScrollIndicator={false}
                    style={styles.walletStrip}
                    contentContainerStyle={styles.walletStripContent}
                >
                    {wallets?.map((w) => <WalletCard key={w.id} wallet={w} />)}
                    <Pressable
                        style={styles.addWalletCard}
                        onPress={() => setAddWalletVisible(true)}
                    >
                        <Text style={styles.addWalletIcon}>+</Text>
                    </Pressable>
                </ScrollView>

                {/* Recent expenses */}
                <View style={styles.section}>
                    <View style={styles.sectionHeader}>
                        <Text style={styles.sectionTitle}>Recent Expenses</Text>
                        <Pressable onPress={() => router.push('/history')}>
                            <Text style={styles.seeAll}>See all ›</Text>
                        </Pressable>
                    </View>

                    {!recentExpenses || recentExpenses.length === 0 ? (
                        <View style={styles.emptyState}>
                            <Text style={styles.emptyText}>No expenses yet.</Text>
                            <Text style={styles.emptySubtext}>Tap + to log your first one.</Text>
                        </View>
                    ) : (
                        <View style={styles.expenseList}>
                            {recentExpenses.map((e) => (
                                <View key={e.id} style={styles.expenseRow}>
                                    <View style={styles.expenseLeft}>
                                        <Text style={styles.expenseMerchant} numberOfLines={1}>
                                            {e.merchant ?? e.categoryName}
                                        </Text>
                                        <Text style={styles.expenseMeta}>
                                            {e.categoryName} · {formatDate(e.date)}
                                        </Text>
                                    </View>
                                    <Text style={styles.expenseAmount}>{fmt(e.amount)}</Text>
                                </View>
                            ))}
                        </View>
                    )}
                </View>
            </ScrollView>

            {/* Add wallet modal */}
            <Modal
                visible={addWalletVisible}
                transparent
                animationType="slide"
                onRequestClose={() => setAddWalletVisible(false)}
            >
                <Pressable style={styles.modalBackdrop} onPress={() => setAddWalletVisible(false)}>
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
                            {addingWallet
                                ? <ActivityIndicator color="#fff" />
                                : <Text style={styles.modalBtnText}>Add Wallet</Text>}
                        </Pressable>
                    </Pressable>
                </Pressable>
            </Modal>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    safe: { flex: 1, backgroundColor: '#F9FAFB' },
    topBar: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 20,
        paddingVertical: 14,
        backgroundColor: '#F9FAFB',
    },
    screenTitle: { fontSize: 22, fontWeight: '700', color: '#111827' },
    settingsIcon: { fontSize: 22, color: '#6B7280' },
    content: { paddingBottom: 100 },
    // Wallet strip
    walletStrip: { flexGrow: 0 },
    walletStripContent: { paddingHorizontal: 20, paddingBottom: 8, gap: 12 },
    walletCard: {
        width: 152,
        minHeight: 100,
        backgroundColor: '#1E3A8A',
        borderRadius: 16,
        padding: 16,
        justifyContent: 'space-between',
    },
    walletCardName: { fontSize: 13, color: 'rgba(255,255,255,0.75)', fontWeight: '500' },
    walletCardBalance: { fontSize: 22, fontWeight: '700', color: '#fff', marginTop: 8 },
    walletCardCurrency: { fontSize: 12, color: 'rgba(255,255,255,0.6)', marginTop: 4 },
    addWalletCard: {
        width: 152,
        minHeight: 100,
        borderRadius: 16,
        borderWidth: 2,
        borderColor: '#E5E7EB',
        borderStyle: 'dashed',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#fff',
    },
    addWalletIcon: { fontSize: 32, color: '#9CA3AF', lineHeight: 36 },
    // Recent expenses
    section: { marginTop: 24, paddingHorizontal: 20 },
    sectionHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 12,
    },
    sectionTitle: { fontSize: 17, fontWeight: '700', color: '#111827' },
    seeAll: { fontSize: 14, color: '#2563EB', fontWeight: '500' },
    emptyState: { alignItems: 'center', paddingVertical: 32, gap: 6 },
    emptyText: { fontSize: 15, color: '#374151', fontWeight: '500' },
    emptySubtext: { fontSize: 13, color: '#9CA3AF' },
    expenseList: {
        backgroundColor: '#fff',
        borderRadius: 12,
        overflow: 'hidden',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.05,
        shadowRadius: 4,
        elevation: 1,
    },
    expenseRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 16,
        paddingVertical: 14,
        borderBottomWidth: 1,
        borderBottomColor: '#F9FAFB',
        gap: 8,
    },
    expenseLeft: { flex: 1, gap: 3 },
    expenseMerchant: { fontSize: 15, fontWeight: '500', color: '#111827' },
    expenseMeta: { fontSize: 13, color: '#9CA3AF' },
    expenseAmount: { fontSize: 15, fontWeight: '600', color: '#111827' },
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
    modalTitle: { fontSize: 18, fontWeight: '700', color: '#111827', marginBottom: 8 },
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
