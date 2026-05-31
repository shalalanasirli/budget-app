import { useState } from 'react';
import {
    ActivityIndicator,
    Pressable,
    RefreshControl,
    ScrollView,
    StyleSheet,
    Text,
    View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { expenseService, type ExpenseResponse } from '@/services/expenses';
import { categoryService, type Category } from '@/services/categories';
import { useAuthStore } from '@/store/auth';
import { useEditExpenseStore } from '@/store/edit-expense';
import SwipeableRow from '@/components/SwipeableRow';

function formatDate(dateStr: string): string {
    const [year, month, day] = dateStr.split('-').map(Number);
    return new Date(year, month - 1, day).toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
    });
}

const MONTH_NAMES = [
    'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
    'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec',
];

export default function HistoryScreen() {
    const router = useRouter();
    const currency = useAuthStore((s) => s.user?.currency ?? 'USD');
    const queryClient = useQueryClient();
    const setEditExpense = useEditExpenseStore((s) => s.set);
    const now = new Date();
    const [month, setMonth] = useState(now.getMonth() + 1);
    const [year, setYear] = useState(now.getFullYear());
    const [selectedCategoryId, setSelectedCategoryId] = useState<string | undefined>();
    const [refreshing, setRefreshing] = useState(false);

    const { data: categories } = useQuery({
        queryKey: ['categories'],
        queryFn: async () => (await categoryService.getAll()).data as Category[],
    });

    const { data: expenses, isLoading, isError, refetch } = useQuery({
        queryKey: ['expenses', selectedCategoryId, month, year],
        queryFn: async () =>
            (await expenseService.getAll({ categoryId: selectedCategoryId, month, year }))
                .data as ExpenseResponse[],
    });

    const fmt = (n: number) =>
        n.toLocaleString('en-US', { style: 'currency', currency: currency || 'USD' });

    const handleRefresh = async () => {
        setRefreshing(true);
        await refetch();
        setRefreshing(false);
    };

    const handleDelete = async (id: string) => {
        await expenseService.delete(id);
        queryClient.invalidateQueries({ queryKey: ['expenses'] });
        queryClient.invalidateQueries({ queryKey: ['budgets'] });
        queryClient.invalidateQueries({ queryKey: ['wallets'] });
    };

    const handleEdit = (expense: ExpenseResponse) => {
        setEditExpense(expense);
        router.push('/edit-expense');
    };

    const goToPrev = () => {
        if (month === 1) { setMonth(12); setYear((y) => y - 1); }
        else setMonth((m) => m - 1);
    };

    const goToNext = () => {
        if (month === 12) { setMonth(1); setYear((y) => y + 1); }
        else setMonth((m) => m + 1);
    };

    return (
        <SafeAreaView style={styles.safe} edges={['top']}>
            <View style={styles.header}>
                <Pressable onPress={() => router.back()} style={styles.backBtn}>
                    <Text style={styles.backText}>‹ Back</Text>
                </Pressable>
                <Text style={styles.headerTitle}>History</Text>
                <View style={styles.backBtn} />
            </View>

            <View style={styles.monthNav}>
                <Pressable onPress={goToPrev} style={styles.navBtn}>
                    <Text style={styles.navArrow}>‹</Text>
                </Pressable>
                <Text style={styles.monthLabel}>{MONTH_NAMES[month - 1]} {year}</Text>
                <Pressable onPress={goToNext} style={styles.navBtn}>
                    <Text style={styles.navArrow}>›</Text>
                </Pressable>
            </View>

            <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                style={styles.filterBar}
                contentContainerStyle={styles.filterContent}
            >
                <Pressable
                    style={[styles.chip, !selectedCategoryId && styles.chipActive]}
                    onPress={() => setSelectedCategoryId(undefined)}
                >
                    <Text style={[styles.chipText, !selectedCategoryId && styles.chipTextActive]}>All</Text>
                </Pressable>
                {categories?.map((c) => (
                    <Pressable
                        key={c.id}
                        style={[styles.chip, selectedCategoryId === c.id && styles.chipActive]}
                        onPress={() => setSelectedCategoryId(c.id)}
                    >
                        <Text style={[styles.chipText, selectedCategoryId === c.id && styles.chipTextActive]}>
                            {c.name}
                        </Text>
                    </Pressable>
                ))}
            </ScrollView>

            {isLoading && <ActivityIndicator style={styles.loader} color="#2563EB" />}

            {isError && (
                <View style={styles.emptyState}>
                    <Text style={styles.emptyIcon}>⚠</Text>
                    <Text style={styles.emptyText}>Failed to load expenses.</Text>
                    <Pressable onPress={() => refetch()} style={styles.retryBtn}>
                        <Text style={styles.retryText}>Try again</Text>
                    </Pressable>
                </View>
            )}

            {!isLoading && !isError && expenses?.length === 0 && (
                <View style={styles.emptyState}>
                    <Text style={styles.emptyIcon}>🧾</Text>
                    <Text style={styles.emptyText}>No expenses this month.</Text>
                    <Text style={styles.emptySubtext}>Tap + to record your first one.</Text>
                </View>
            )}

            <ScrollView
                refreshControl={
                    <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} tintColor="#2563EB" />
                }
            >
                {expenses?.map((e) => (
                    <SwipeableRow key={e.id} onDelete={() => handleDelete(e.id)}>
                        <Pressable style={styles.item} onPress={() => handleEdit(e)}>
                            <View style={styles.itemMain}>
                                <Text style={styles.itemMerchant} numberOfLines={1}>
                                    {e.merchant ?? e.categoryName}
                                </Text>
                                <Text style={styles.itemAmount}>{fmt(e.amount)}</Text>
                            </View>
                            <View style={styles.itemSub}>
                                <Text style={styles.itemMeta}>
                                    {e.categoryName} · {e.walletName} · {formatDate(e.date)}
                                </Text>
                                <Text style={styles.editHint}>Edit ›</Text>
                            </View>
                        </Pressable>
                    </SwipeableRow>
                ))}
            </ScrollView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    safe: { flex: 1, backgroundColor: '#fff' },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 16,
        paddingVertical: 12,
        borderBottomWidth: 1,
        borderBottomColor: '#F3F4F6',
    },
    backBtn: { width: 70 },
    backText: { fontSize: 17, color: '#2563EB' },
    headerTitle: { fontSize: 17, fontWeight: '600', color: '#111827' },
    monthNav: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 24,
        paddingVertical: 12,
        borderBottomWidth: 1,
        borderBottomColor: '#F3F4F6',
    },
    navBtn: { padding: 4 },
    navArrow: { fontSize: 22, color: '#2563EB' },
    monthLabel: { fontSize: 15, fontWeight: '600', color: '#111827' },
    filterBar: { flexGrow: 0, borderBottomWidth: 1, borderBottomColor: '#F3F4F6' },
    filterContent: { paddingHorizontal: 16, paddingVertical: 10, gap: 8 },
    chip: { paddingHorizontal: 14, paddingVertical: 6, borderRadius: 20, backgroundColor: '#F3F4F6' },
    chipActive: { backgroundColor: '#2563EB' },
    chipText: { fontSize: 13, color: '#374151', fontWeight: '500' },
    chipTextActive: { color: '#fff' },
    loader: { marginTop: 40 },
    emptyState: { alignItems: 'center', paddingTop: 60, gap: 8 },
    emptyIcon: { fontSize: 36 },
    emptyText: { fontSize: 15, color: '#374151', fontWeight: '500' },
    emptySubtext: { fontSize: 13, color: '#9CA3AF' },
    retryBtn: { marginTop: 4, paddingHorizontal: 20, paddingVertical: 8, backgroundColor: '#EFF6FF', borderRadius: 8 },
    retryText: { fontSize: 14, color: '#2563EB', fontWeight: '600' },
    item: {
        paddingHorizontal: 24,
        paddingVertical: 14,
        borderBottomWidth: 1,
        borderBottomColor: '#F9FAFB',
        gap: 4,
        backgroundColor: '#fff',
    },
    itemMain: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', gap: 8 },
    itemMerchant: { fontSize: 15, fontWeight: '500', color: '#111827', flex: 1 },
    itemAmount: { fontSize: 15, fontWeight: '600', color: '#111827' },
    itemSub: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
    itemMeta: { fontSize: 13, color: '#9CA3AF', flex: 1 },
    editHint: { fontSize: 12, color: '#2563EB' },
});
