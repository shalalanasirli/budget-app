import { useState } from 'react';
import {
    ActivityIndicator,
    Pressable,
    ScrollView,
    StyleSheet,
    Text,
    View,
} from 'react-native';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { expenseService, type ExpenseResponse } from '@/services/expenses';
import { categoryService, type Category } from '@/services/categories';
import { useAuthStore } from '@/store/auth';

function formatDate(dateStr: string): string {
    const [year, month, day] = dateStr.split('-').map(Number);
    const d = new Date(year, month - 1, day);
    return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

export default function ExpensesScreen() {
    const currency = useAuthStore((s) => s.user?.currency ?? 'USD');
    const queryClient = useQueryClient();
    const now = new Date();
    const [month] = useState(now.getMonth() + 1);
    const [year] = useState(now.getFullYear());
    const [selectedCategoryId, setSelectedCategoryId] = useState<string | undefined>();
    const [deletingId, setDeletingId] = useState<string | null>(null);

    const { data: categories } = useQuery({
        queryKey: ['categories'],
        queryFn: async () => {
            const res = await categoryService.getAll();
            return res.data as Category[];
        },
    });

    const { data: expenses, isLoading, isError, refetch } = useQuery({
        queryKey: ['expenses', selectedCategoryId, month, year],
        queryFn: async () => {
            const res = await expenseService.getAll({
                categoryId: selectedCategoryId,
                month,
                year,
            });
            return res.data as ExpenseResponse[];
        },
    });

    const fmt = (n: number) =>
        n.toLocaleString('en-US', { style: 'currency', currency: currency || 'USD' });

    const handleDelete = async (id: string) => {
        setDeletingId(id);
        try {
            await expenseService.delete(id);
            queryClient.invalidateQueries({ queryKey: ['expenses'] });
            queryClient.invalidateQueries({ queryKey: ['budgets'] });
        } finally {
            setDeletingId(null);
        }
    };

    return (
        <View style={styles.container}>
            <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                style={styles.filterBar}
                contentContainerStyle={styles.filterContent}
            >
                <Pressable
                    style={[styles.filterChip, !selectedCategoryId && styles.filterChipActive]}
                    onPress={() => setSelectedCategoryId(undefined)}
                >
                    <Text style={[styles.filterChipText, !selectedCategoryId && styles.filterChipTextActive]}>
                        All
                    </Text>
                </Pressable>
                {categories?.map((c) => (
                    <Pressable
                        key={c.id}
                        style={[styles.filterChip, selectedCategoryId === c.id && styles.filterChipActive]}
                        onPress={() => setSelectedCategoryId(c.id)}
                    >
                        <Text style={[styles.filterChipText, selectedCategoryId === c.id && styles.filterChipTextActive]}>
                            {c.name}
                        </Text>
                    </Pressable>
                ))}
            </ScrollView>

            {isLoading && <ActivityIndicator style={styles.loader} color="#2563EB" />}

            {isError && (
                <View style={styles.emptyState}>
                    <Text style={styles.emptyText}>Failed to load expenses.</Text>
                    <Pressable onPress={() => refetch()}>
                        <Text style={styles.retryText}>Retry</Text>
                    </Pressable>
                </View>
            )}

            {!isLoading && !isError && expenses?.length === 0 && (
                <View style={styles.emptyState}>
                    <Text style={styles.emptyText}>No expenses this month.</Text>
                    <Text style={styles.emptySubtext}>Tap + to add your first expense.</Text>
                </View>
            )}

            <ScrollView>
                {expenses?.map((e) => (
                    <View key={e.id} style={styles.item}>
                        <View style={styles.itemMain}>
                            <Text style={styles.itemMerchant}>
                                {e.merchant ?? e.categoryName}
                            </Text>
                            <Text style={styles.itemAmount}>{fmt(e.amount)}</Text>
                        </View>
                        <View style={styles.itemSub}>
                            <Text style={styles.itemMeta}>
                                {e.categoryName} · {formatDate(e.date)}
                            </Text>
                            <Pressable
                                onPress={() => handleDelete(e.id)}
                                disabled={deletingId === e.id}
                            >
                                <Text style={styles.deleteText}>
                                    {deletingId === e.id ? '···' : 'Delete'}
                                </Text>
                            </Pressable>
                        </View>
                    </View>
                ))}
            </ScrollView>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#fff',
    },
    filterBar: {
        flexGrow: 0,
        borderBottomWidth: 1,
        borderBottomColor: '#F3F4F6',
    },
    filterContent: {
        paddingHorizontal: 16,
        paddingVertical: 12,
        gap: 8,
    },
    filterChip: {
        paddingHorizontal: 14,
        paddingVertical: 6,
        borderRadius: 20,
        backgroundColor: '#F3F4F6',
    },
    filterChipActive: {
        backgroundColor: '#2563EB',
    },
    filterChipText: {
        fontSize: 13,
        color: '#374151',
        fontWeight: '500',
    },
    filterChipTextActive: {
        color: '#fff',
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
    },
    retryText: {
        fontSize: 14,
        color: '#2563EB',
    },
    item: {
        paddingHorizontal: 24,
        paddingVertical: 14,
        borderBottomWidth: 1,
        borderBottomColor: '#F9FAFB',
        gap: 4,
    },
    itemMain: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    itemMerchant: {
        fontSize: 15,
        fontWeight: '500',
        color: '#111827',
    },
    itemAmount: {
        fontSize: 15,
        fontWeight: '600',
        color: '#111827',
    },
    itemSub: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    itemMeta: {
        fontSize: 13,
        color: '#9CA3AF',
    },
    deleteText: {
        fontSize: 13,
        color: '#DC2626',
    },
});
