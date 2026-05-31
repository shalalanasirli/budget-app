import { useEffect, useState } from 'react';
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
import { SafeAreaView } from 'react-native-safe-area-context';
import DateTimePicker from '@react-native-community/datetimepicker';
import { useRouter } from 'expo-router';
import { useQueryClient } from '@tanstack/react-query';
import { expenseService } from '@/services/expenses';
import { categoryService, type Category } from '@/services/categories';
import { walletService, type Wallet } from '@/services/wallets';
import { useEditExpenseStore } from '@/store/edit-expense';

function toDateString(d: Date): string {
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${y}-${m}-${day}`;
}

function parseDate(s: string): Date {
    const [y, m, d] = s.split('-').map(Number);
    return new Date(y, m - 1, d);
}

export default function EditExpenseScreen() {
    const router = useRouter();
    const queryClient = useQueryClient();
    const { expense, clear } = useEditExpenseStore();

    const [amount, setAmount] = useState(expense?.amount.toString() ?? '');
    const [categoryId, setCategoryId] = useState(expense?.categoryId ?? '');
    const [walletId, setWalletId] = useState(expense?.walletId ?? '');
    const [merchant, setMerchant] = useState(expense?.merchant ?? '');
    const [description, setDescription] = useState(expense?.description ?? '');
    const [date, setDate] = useState(expense ? parseDate(expense.date) : new Date());
    const [categories, setCategories] = useState<Category[]>([]);
    const [wallets, setWallets] = useState<Wallet[]>([]);
    const [categoryPickerVisible, setCategoryPickerVisible] = useState(false);
    const [walletPickerVisible, setWalletPickerVisible] = useState(false);
    const [showAndroidDatePicker, setShowAndroidDatePicker] = useState(false);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState('');

    useEffect(() => {
        categoryService.getAll().then(({ data }) => setCategories(data));
        walletService.getAll().then(({ data }) => setWallets(data));
    }, []);

    const selectedCategory = categories.find((c) => c.id === categoryId);
    const selectedWallet = wallets.find((w) => w.id === walletId);

    const handleSave = async () => {
        if (!expense) return;
        const amountNum = parseFloat(amount);
        if (isNaN(amountNum) || amountNum <= 0) { setError('Enter a valid amount.'); return; }
        if (!categoryId) { setError('Select a category.'); return; }
        if (!walletId) { setError('Select a wallet.'); return; }
        setError('');
        setSaving(true);
        try {
            await expenseService.update(expense.id, {
                categoryId,
                amount: amountNum,
                merchant: merchant.trim() || undefined,
                description: description.trim() || undefined,
                date: toDateString(date),
                walletId,
            });
            queryClient.invalidateQueries({ queryKey: ['expenses'] });
            queryClient.invalidateQueries({ queryKey: ['budgets'] });
            queryClient.invalidateQueries({ queryKey: ['wallets'] });
            clear();
            router.back();
        } catch {
            setError('Failed to save changes. Please try again.');
        } finally {
            setSaving(false);
        }
    };

    const handleCancel = () => { clear(); router.back(); };

    if (!expense) { router.back(); return null; }

    return (
        <SafeAreaView style={styles.safe} edges={['top']}>
            <View style={styles.header}>
                <Pressable onPress={handleCancel} style={styles.headerBtn}>
                    <Text style={styles.cancelText}>Cancel</Text>
                </Pressable>
                <Text style={styles.headerTitle}>Edit Expense</Text>
                <Pressable onPress={handleSave} disabled={saving} style={styles.headerBtn}>
                    {saving
                        ? <ActivityIndicator color="#2563EB" size="small" />
                        : <Text style={styles.saveText}>Save</Text>}
                </Pressable>
            </View>

            <KeyboardAvoidingView
                style={styles.flex}
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            >
                <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
                    <View style={styles.field}>
                        <Text style={styles.label}>Amount</Text>
                        <TextInput
                            style={styles.amountInput}
                            placeholder="0.00"
                            value={amount}
                            onChangeText={setAmount}
                            keyboardType="decimal-pad"
                            placeholderTextColor="#9CA3AF"
                        />
                    </View>

                    <View style={styles.field}>
                        <Text style={styles.label}>Category</Text>
                        <Pressable style={styles.input} onPress={() => setCategoryPickerVisible(true)}>
                            <Text style={selectedCategory ? styles.inputText : styles.inputPlaceholder}>
                                {selectedCategory?.name ?? 'Select category'}
                            </Text>
                        </Pressable>
                    </View>

                    <View style={styles.field}>
                        <Text style={styles.label}>Wallet</Text>
                        <Pressable style={styles.input} onPress={() => setWalletPickerVisible(true)}>
                            <Text style={selectedWallet ? styles.inputText : styles.inputPlaceholder}>
                                {selectedWallet
                                    ? `${selectedWallet.name} · ${selectedWallet.currency} ${selectedWallet.balance.toFixed(2)}`
                                    : 'Select wallet'}
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
                        {Platform.OS === 'ios' ? (
                            <DateTimePicker
                                value={date}
                                mode="date"
                                display="compact"
                                onChange={(_, selected) => selected && setDate(selected)}
                                style={styles.iosDatePicker}
                            />
                        ) : (
                            <>
                                <Pressable style={styles.input} onPress={() => setShowAndroidDatePicker(true)}>
                                    <Text style={styles.inputText}>
                                        {date.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}
                                    </Text>
                                </Pressable>
                                {showAndroidDatePicker && (
                                    <DateTimePicker
                                        value={date}
                                        mode="date"
                                        display="default"
                                        onChange={(_, selected) => { setShowAndroidDatePicker(false); if (selected) setDate(selected); }}
                                    />
                                )}
                            </>
                        )}
                    </View>

                    {error ? <Text style={styles.error}>{error}</Text> : null}
                </ScrollView>
            </KeyboardAvoidingView>

            <Modal visible={categoryPickerVisible} transparent animationType="slide" onRequestClose={() => setCategoryPickerVisible(false)}>
                <Pressable style={styles.pickerBackdrop} onPress={() => setCategoryPickerVisible(false)}>
                    <Pressable style={styles.pickerSheet} onPress={() => {}}>
                        <Text style={styles.pickerTitle}>Select Category</Text>
                        <ScrollView>
                            {categories.map((c) => (
                                <Pressable
                                    key={c.id}
                                    style={[styles.pickerItem, categoryId === c.id && styles.pickerItemSelected]}
                                    onPress={() => { setCategoryId(c.id); setCategoryPickerVisible(false); }}
                                >
                                    <Text style={[styles.pickerItemText, categoryId === c.id && styles.pickerItemTextSelected]}>{c.name}</Text>
                                </Pressable>
                            ))}
                        </ScrollView>
                    </Pressable>
                </Pressable>
            </Modal>

            <Modal visible={walletPickerVisible} transparent animationType="slide" onRequestClose={() => setWalletPickerVisible(false)}>
                <Pressable style={styles.pickerBackdrop} onPress={() => setWalletPickerVisible(false)}>
                    <Pressable style={styles.pickerSheet} onPress={() => {}}>
                        <Text style={styles.pickerTitle}>Select Wallet</Text>
                        <ScrollView>
                            {wallets.map((w) => (
                                <Pressable
                                    key={w.id}
                                    style={[styles.pickerItem, walletId === w.id && styles.pickerItemSelected]}
                                    onPress={() => { setWalletId(w.id); setWalletPickerVisible(false); }}
                                >
                                    <Text style={[styles.pickerItemText, walletId === w.id && styles.pickerItemTextSelected]}>
                                        {w.name}
                                        <Text style={styles.walletHint}>{'  '}{w.currency} {w.balance.toFixed(2)}</Text>
                                    </Text>
                                </Pressable>
                            ))}
                        </ScrollView>
                    </Pressable>
                </Pressable>
            </Modal>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    safe: { flex: 1, backgroundColor: '#fff' },
    flex: { flex: 1 },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 16,
        paddingVertical: 12,
        borderBottomWidth: 1,
        borderBottomColor: '#F3F4F6',
    },
    headerBtn: { width: 70 },
    headerTitle: { fontSize: 17, fontWeight: '600', color: '#111827' },
    cancelText: { fontSize: 17, color: '#6B7280' },
    saveText: { fontSize: 17, color: '#2563EB', fontWeight: '600', textAlign: 'right' },
    content: { padding: 24, gap: 20 },
    field: { gap: 6 },
    label: { fontSize: 13, fontWeight: '600', color: '#374151', textTransform: 'uppercase', letterSpacing: 0.5 },
    amountInput: {
        fontSize: 32,
        fontWeight: '700',
        color: '#111827',
        borderBottomWidth: 2,
        borderBottomColor: '#2563EB',
        paddingVertical: 8,
    },
    input: { borderWidth: 1, borderColor: '#E5E7EB', borderRadius: 8, padding: 14, justifyContent: 'center' },
    inputText: { fontSize: 15, color: '#111827' },
    inputPlaceholder: { fontSize: 15, color: '#9CA3AF' },
    iosDatePicker: { alignSelf: 'flex-start', marginLeft: -8 },
    error: { color: '#DC2626', fontSize: 14 },
    pickerBackdrop: { flex: 1, backgroundColor: 'rgba(0,0,0,0.4)', justifyContent: 'flex-end' },
    pickerSheet: {
        backgroundColor: '#fff',
        borderTopLeftRadius: 20,
        borderTopRightRadius: 20,
        paddingTop: 20,
        paddingBottom: 40,
        maxHeight: '60%',
    },
    pickerTitle: { fontSize: 16, fontWeight: '700', color: '#111827', paddingHorizontal: 24, paddingBottom: 16 },
    pickerItem: { paddingHorizontal: 24, paddingVertical: 14 },
    pickerItemSelected: { backgroundColor: '#EFF6FF' },
    pickerItemText: { fontSize: 15, color: '#111827' },
    pickerItemTextSelected: { color: '#2563EB', fontWeight: '600' },
    walletHint: { fontSize: 13, color: '#9CA3AF', fontWeight: '400' },
});
