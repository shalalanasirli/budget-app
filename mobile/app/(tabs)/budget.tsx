import { useState } from 'react';
import {
    ActivityIndicator,
    KeyboardAvoidingView,
    Modal,
    Platform,
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
import { budgetService } from '@/services/budgets';
import { expenseService } from '@/services/expenses';
import BudgetProgressBar from '@/components/BudgetProgressBar';
import SwipeableRow from '@/components/SwipeableRow';
import { useAuthStore } from '@/store/auth';

interface BudgetSummary {
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

export default function BudgetScreen() {
    const currency = useAuthStore((s) => s.user?.currency ?? 'USD');
    const queryClient = useQueryClient();
    const now = new Date();
    const [month, setMonth] = useState(now.getMonth() + 1);
    const [year, setYear] = useState(now.getFullYear());
    const [refreshing, setRefreshing] = useState(false);

    const [editBudget, setEditBudget] = useState<BudgetSummary | null>(null);
    const [editLimit, setEditLimit] = useState('');
    const [saving, setSaving] = useState(false);

    const { data: budgets, isLoading, isError, refetch } = useQuery({
        queryKey: ['budgets', month, year],
        queryFn: async () => {
            const res = await budgetService.getAll({ month, year });
            return res.data as BudgetSummary[];
        },
    });

    const { data: expenses } = useQuery({
        queryKey: ['expenses', undefined, month, year],
        queryFn: async () =>
            (await expenseService.getAll({ month, year })).data,
    });

    const totalLimit = budgets?.reduce((s, b) => s + b.monthlyLimit, 0) ?? 0;
    const totalSpent = budgets?.reduce((s, b) => s + b.spent, 0) ?? 0;

    const fmt = (n: number) =>
        n.toLocaleString('en-US', { style: 'currency', currency: currency || 'USD' });

    const handleRefresh = async () => {
        setRefreshing(true);
        await refetch();
        setRefreshing(false);
    };

    const handleDelete = async (id: string) => {
        await budgetService.delete(id);
        queryClient.invalidateQueries({ queryKey: ['budgets'] });
    };

    const openEdit = (b: BudgetSummary) => {
        setEditBudget(b);
        setEditLimit(b.monthlyLimit.toString());
    };

    const handleSaveEdit = async () => {
        if (!editBudget) return;
        const limit = parseFloat(editLimit);
        if (isNaN(limit) || limit <= 0) return;
        setSaving(true);
        try {
            await budgetService.update(editBudget.id, limit);
            queryClient.invalidateQueries({ queryKey: ['budgets'] });
            setEditBudget(null);
        } finally {
            setSaving(false);
        }
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
            <View style={styles.topBar}>
                <Text style={styles.screenTitle}>Budget</Text>
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
                contentContainerStyle={styles.content}
                refreshControl={
                    <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} tintColor="#2563EB" />
                }
            >
                {totalLimit > 0 && (
                    <View style={styles.summaryCard}>
                        <Text style={styles.summarySpent}>{fmt(totalSpent)}</Text>
                        <Text style={styles.summaryLabel}>spent of {fmt(totalLimit)} budget</Text>
                        <View style={styles.summaryTrack}>
                            <View
                                style={[
                                    styles.summaryFill,
                                    {
                                        width: `${Math.min((totalSpent / totalLimit) * 100, 100)}%` as any,
                                        backgroundColor:
                                            totalSpent / totalLimit >= 0.9
                                                ? '#DC2626'
                                                : totalSpent / totalLimit >= 0.75
                                                ? '#D97706'
                                                : '#16A34A',
                                    },
                                ]}
                            />
                        </View>
                    </View>
                )}

                {isLoading && <ActivityIndicator style={styles.loader} color="#2563EB" />}

                {isError && (
                    <View style={styles.emptyState}>
                        <Text style={styles.emptyIcon}>⚠</Text>
                        <Text style={styles.emptyText}>Failed to load budgets.</Text>
                        <Pressable onPress={() => refetch()} style={styles.retryBtn}>
                            <Text style={styles.retryText}>Try again</Text>
                        </Pressable>
                    </View>
                )}

                {!isLoading && !isError && budgets?.length === 0 && (
                    <View style={styles.emptyState}>
                        <Text style={styles.emptyIcon}>📊</Text>
                        <Text style={styles.emptyText}>No budgets for this month.</Text>
                        <Text style={styles.emptySubtext}>Tap + to set a budget goal.</Text>
                    </View>
                )}

                {budgets?.map((b) => (
                    <SwipeableRow key={b.id} onDelete={() => handleDelete(b.id)}>
                        <Pressable onPress={() => openEdit(b)}>
                            <BudgetProgressBar
                                categoryName={b.categoryName}
                                spent={b.spent}
                                limit={b.monthlyLimit}
                            />
                        </Pressable>
                    </SwipeableRow>
                ))}
            </ScrollView>

            <Modal
                visible={editBudget !== null}
                transparent
                animationType="slide"
                onRequestClose={() => setEditBudget(null)}
            >
                <KeyboardAvoidingView
                    style={styles.modalBackdrop}
                    behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                >
                    <Pressable style={styles.modalBackdrop} onPress={() => setEditBudget(null)}>
                        <Pressable style={styles.sheet} onPress={() => {}}>
                            <Text style={styles.sheetTitle}>{editBudget?.categoryName}</Text>
                            <Text style={styles.sheetLabel}>Monthly limit</Text>
                            <TextInput
                                style={styles.sheetInput}
                                value={editLimit}
                                onChangeText={setEditLimit}
                                keyboardType="decimal-pad"
                                placeholder="0.00"
                                placeholderTextColor="#9CA3AF"
                                autoFocus
                            />
                            <View style={styles.sheetActions}>
                                <Pressable style={styles.cancelBtn} onPress={() => setEditBudget(null)}>
                                    <Text style={styles.cancelBtnText}>Cancel</Text>
                                </Pressable>
                                <Pressable style={styles.saveBtn} onPress={handleSaveEdit} disabled={saving}>
                                    {saving
                                        ? <ActivityIndicator color="#fff" size="small" />
                                        : <Text style={styles.saveBtnText}>Save</Text>}
                                </Pressable>
                            </View>
                        </Pressable>
                    </Pressable>
                </KeyboardAvoidingView>
            </Modal>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    safe: { flex: 1, backgroundColor: '#fff' },
    topBar: { paddingHorizontal: 20, paddingVertical: 14 },
    screenTitle: { fontSize: 22, fontWeight: '700', color: '#111827' },
    monthNav: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 24,
        paddingVertical: 12,
        borderBottomWidth: 1,
        borderBottomColor: '#F3F4F6',
    },
    navBtn: { padding: 8 },
    navArrow: { fontSize: 24, color: '#2563EB', lineHeight: 28 },
    monthLabel: { fontSize: 17, fontWeight: '600', color: '#111827' },
    content: { paddingHorizontal: 24, paddingBottom: 100 },
    summaryCard: {
        alignItems: 'center',
        paddingVertical: 24,
        marginVertical: 16,
        borderRadius: 16,
        backgroundColor: '#F9FAFB',
        gap: 4,
    },
    summarySpent: { fontSize: 34, fontWeight: '700', color: '#111827' },
    summaryLabel: { fontSize: 14, color: '#6B7280' },
    summaryTrack: {
        width: '80%',
        height: 6,
        borderRadius: 3,
        backgroundColor: '#E5E7EB',
        overflow: 'hidden',
        marginTop: 12,
    },
    summaryFill: { height: '100%', borderRadius: 3 },
    loader: { marginTop: 40 },
    emptyState: { alignItems: 'center', paddingTop: 60, gap: 8 },
    emptyIcon: { fontSize: 36 },
    emptyText: { fontSize: 15, color: '#374151', fontWeight: '500' },
    emptySubtext: { fontSize: 13, color: '#9CA3AF', textAlign: 'center' },
    retryBtn: { marginTop: 4, paddingHorizontal: 20, paddingVertical: 8, backgroundColor: '#EFF6FF', borderRadius: 8 },
    retryText: { fontSize: 14, color: '#2563EB', fontWeight: '600' },
    modalBackdrop: { flex: 1, justifyContent: 'flex-end', backgroundColor: 'rgba(0,0,0,0.4)' },
    sheet: {
        backgroundColor: '#fff',
        borderTopLeftRadius: 20,
        borderTopRightRadius: 20,
        padding: 28,
        paddingBottom: 40,
        gap: 14,
    },
    sheetTitle: { fontSize: 18, fontWeight: '700', color: '#111827' },
    sheetLabel: { fontSize: 13, fontWeight: '600', color: '#6B7280', textTransform: 'uppercase', letterSpacing: 0.5 },
    sheetInput: {
        borderWidth: 1,
        borderColor: '#E5E7EB',
        borderRadius: 10,
        padding: 14,
        fontSize: 22,
        fontWeight: '700',
        color: '#111827',
    },
    sheetActions: { flexDirection: 'row', gap: 12, marginTop: 4 },
    cancelBtn: {
        flex: 1,
        paddingVertical: 14,
        borderRadius: 10,
        borderWidth: 1,
        borderColor: '#E5E7EB',
        alignItems: 'center',
    },
    cancelBtnText: { fontSize: 15, fontWeight: '600', color: '#6B7280' },
    saveBtn: {
        flex: 1,
        paddingVertical: 14,
        borderRadius: 10,
        backgroundColor: '#2563EB',
        alignItems: 'center',
    },
    saveBtnText: { fontSize: 15, fontWeight: '600', color: '#fff' },
});
