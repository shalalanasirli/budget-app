import { useCallback, useEffect, useState } from 'react';
import {
    ActivityIndicator,
    KeyboardAvoidingView,
    Modal,
    Platform,
    Pressable,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    View,
} from 'react-native';
import { useFocusEffect, useRouter } from 'expo-router';
import { useQueryClient } from '@tanstack/react-query';
import { expenseService } from '@/services/expenses';
import { categoryService, type Category } from '@/services/categories';
import { useScanStore } from '@/store/scan';

function toDateString(d: Date): string {
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${y}-${m}-${day}`;
}

function displayDate(d: Date): string {
    return d.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
}

export default function AddExpenseScreen() {
    const router = useRouter();
    const queryClient = useQueryClient();

    const [amount, setAmount] = useState('');
    const [categoryId, setCategoryId] = useState('');
    const [merchant, setMerchant] = useState('');
    const [description, setDescription] = useState('');
    const [date, setDate] = useState(new Date());
    const [categories, setCategories] = useState<Category[]>([]);
    const [pickerVisible, setPickerVisible] = useState(false);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState('');

    useEffect(() => {
        categoryService.getAll().then(({ data }) => setCategories(data));
    }, []);

    useFocusEffect(
        useCallback(() => {
            const scan = useScanStore.getState().result;
            if (scan) {
                if (scan.merchant) setMerchant(scan.merchant);
                if (scan.amount) setAmount(scan.amount.toString());
                if (scan.categoryId) setCategoryId(scan.categoryId);
                useScanStore.getState().clearResult();
            }
        }, []),
    );

    const selectedCategory = categories.find((c) => c.id === categoryId);

    const handleSave = async () => {
        const amountNum = parseFloat(amount);
        if (isNaN(amountNum) || amountNum <= 0) {
            setError('Enter a valid amount.');
            return;
        }
        if (!categoryId) {
            setError('Select a category.');
            return;
        }
        setError('');
        setSaving(true);
        try {
            await expenseService.create({
                categoryId,
                amount: amountNum,
                merchant: merchant.trim() || undefined,
                description: description.trim() || undefined,
                date: toDateString(date),
            });
            queryClient.invalidateQueries({ queryKey: ['expenses'] });
            queryClient.invalidateQueries({ queryKey: ['budgets'] });
            router.back();
        } catch {
            setError('Failed to save expense. Please try again.');
        } finally {
            setSaving(false);
        }
    };

    const shiftDate = (days: number) => {
        setDate((d) => {
            const next = new Date(d);
            next.setDate(next.getDate() + days);
            return next;
        });
    };

    return (
        <KeyboardAvoidingView
            style={styles.container}
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        >
            <ScrollView
                contentContainerStyle={styles.content}
                keyboardShouldPersistTaps="handled"
            >
                <View style={styles.field}>
                    <Text style={styles.label}>Amount</Text>
                    <TextInput
                        style={styles.amountInput}
                        placeholder="0.00"
                        value={amount}
                        onChangeText={setAmount}
                        keyboardType="decimal-pad"
                        placeholderTextColor="#9CA3AF"
                        autoFocus
                    />
                </View>

                <View style={styles.field}>
                    <Text style={styles.label}>Category</Text>
                    <Pressable
                        style={styles.input}
                        onPress={() => setPickerVisible(true)}
                    >
                        <Text style={selectedCategory ? styles.inputText : styles.inputPlaceholder}>
                            {selectedCategory?.name ?? 'Select category'}
                        </Text>
                    </Pressable>
                </View>

                <View style={styles.field}>
                    <Text style={styles.label}>Merchant (optional)</Text>
                    <TextInput
                        style={styles.input}
                        placeholder="e.g. Starbucks"
                        value={merchant}
                        onChangeText={setMerchant}
                        placeholderTextColor="#9CA3AF"
                    />
                </View>

                <View style={styles.field}>
                    <Text style={styles.label}>Note (optional)</Text>
                    <TextInput
                        style={styles.input}
                        placeholder="Add a note"
                        value={description}
                        onChangeText={setDescription}
                        placeholderTextColor="#9CA3AF"
                    />
                </View>

                <View style={styles.field}>
                    <Text style={styles.label}>Date</Text>
                    <View style={styles.datePicker}>
                        <Pressable style={styles.dateArrow} onPress={() => shiftDate(-1)}>
                            <Text style={styles.dateArrowText}>‹</Text>
                        </Pressable>
                        <Text style={styles.dateText}>{displayDate(date)}</Text>
                        <Pressable style={styles.dateArrow} onPress={() => shiftDate(1)}>
                            <Text style={styles.dateArrowText}>›</Text>
                        </Pressable>
                    </View>
                </View>

                <Pressable
                    style={styles.scanButton}
                    onPress={() => router.push('/scan-receipt')}
                >
                    <Text style={styles.scanButtonText}>Scan Receipt</Text>
                </Pressable>

                {error ? <Text style={styles.error}>{error}</Text> : null}

                <Pressable
                    style={[styles.saveButton, saving && styles.saveButtonDisabled]}
                    onPress={handleSave}
                    disabled={saving}
                >
                    {saving ? (
                        <ActivityIndicator color="#fff" />
                    ) : (
                        <Text style={styles.saveButtonText}>Save Expense</Text>
                    )}
                </Pressable>
            </ScrollView>

            <Modal
                visible={pickerVisible}
                transparent
                animationType="slide"
                onRequestClose={() => setPickerVisible(false)}
            >
                <Pressable style={styles.pickerBackdrop} onPress={() => setPickerVisible(false)}>
                    <Pressable style={styles.pickerSheet} onPress={() => {}}>
                        <Text style={styles.pickerTitle}>Select Category</Text>
                        {categories.map((c) => (
                            <Pressable
                                key={c.id}
                                style={[
                                    styles.pickerItem,
                                    categoryId === c.id && styles.pickerItemSelected,
                                ]}
                                onPress={() => {
                                    setCategoryId(c.id);
                                    setPickerVisible(false);
                                }}
                            >
                                <Text style={[
                                    styles.pickerItemText,
                                    categoryId === c.id && styles.pickerItemTextSelected,
                                ]}>
                                    {c.name}
                                </Text>
                            </Pressable>
                        ))}
                    </Pressable>
                </Pressable>
            </Modal>
        </KeyboardAvoidingView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#fff',
    },
    content: {
        padding: 24,
        gap: 20,
    },
    field: {
        gap: 6,
    },
    label: {
        fontSize: 13,
        fontWeight: '600',
        color: '#374151',
        textTransform: 'uppercase',
        letterSpacing: 0.5,
    },
    amountInput: {
        fontSize: 32,
        fontWeight: '700',
        color: '#111827',
        borderBottomWidth: 2,
        borderBottomColor: '#2563EB',
        paddingVertical: 8,
    },
    input: {
        borderWidth: 1,
        borderColor: '#E5E7EB',
        borderRadius: 8,
        padding: 14,
        justifyContent: 'center',
    },
    inputText: {
        fontSize: 15,
        color: '#111827',
    },
    inputPlaceholder: {
        fontSize: 15,
        color: '#9CA3AF',
    },
    datePicker: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        borderWidth: 1,
        borderColor: '#E5E7EB',
        borderRadius: 8,
        paddingHorizontal: 8,
    },
    dateArrow: {
        padding: 12,
    },
    dateArrowText: {
        fontSize: 22,
        color: '#2563EB',
    },
    dateText: {
        fontSize: 15,
        color: '#111827',
        fontWeight: '500',
    },
    scanButton: {
        borderWidth: 1,
        borderColor: '#2563EB',
        borderRadius: 10,
        padding: 14,
        alignItems: 'center',
    },
    scanButtonText: {
        color: '#2563EB',
        fontSize: 15,
        fontWeight: '600',
    },
    error: {
        color: '#DC2626',
        fontSize: 14,
    },
    saveButton: {
        backgroundColor: '#2563EB',
        borderRadius: 12,
        padding: 16,
        alignItems: 'center',
    },
    saveButtonDisabled: {
        opacity: 0.5,
    },
    saveButtonText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: '600',
    },
    pickerBackdrop: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.4)',
        justifyContent: 'flex-end',
    },
    pickerSheet: {
        backgroundColor: '#fff',
        borderTopLeftRadius: 20,
        borderTopRightRadius: 20,
        paddingTop: 20,
        paddingBottom: 40,
    },
    pickerTitle: {
        fontSize: 16,
        fontWeight: '700',
        color: '#111827',
        paddingHorizontal: 24,
        paddingBottom: 16,
    },
    pickerItem: {
        paddingHorizontal: 24,
        paddingVertical: 14,
    },
    pickerItemSelected: {
        backgroundColor: '#EFF6FF',
    },
    pickerItemText: {
        fontSize: 15,
        color: '#111827',
    },
    pickerItemTextSelected: {
        color: '#2563EB',
        fontWeight: '600',
    },
});
