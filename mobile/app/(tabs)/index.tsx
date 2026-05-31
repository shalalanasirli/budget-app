import { useState } from 'react';
import { ActivityIndicator, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useQuery } from '@tanstack/react-query';
import { budgetService } from '@/services/budgets';
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

export default function HomeScreen() {
    const currency = useAuthStore((s) => s.user?.currency ?? 'USD');
    const now = new Date();
    const [month, setMonth] = useState(now.getMonth() + 1);
    const [year, setYear] = useState(now.getFullYear());

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

    return (
        <ScrollView style={styles.container} contentContainerStyle={styles.content}>
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
});
