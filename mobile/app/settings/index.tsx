import { useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    Modal,
    Pressable,
    ScrollView,
    StyleSheet,
    Text,
    View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { useAuthStore } from '@/store/auth';
import { userService } from '@/services/user';
import { CURRENCIES } from '@/constants/currencies';

export default function SettingsScreen() {
    const router = useRouter();
    const { user, updateUser, clearAuth } = useAuthStore();

    const [currencyPickerVisible, setCurrencyPickerVisible] = useState(false);
    const [savingCurrency, setSavingCurrency] = useState(false);

    const handleCurrencySelect = async (code: string) => {
        setCurrencyPickerVisible(false);
        setSavingCurrency(true);
        try {
            await userService.updateMe({ currency: code });
            await updateUser({ currency: code });
        } catch {
            Alert.alert('Error', 'Failed to update currency.');
        } finally {
            setSavingCurrency(false);
        }
    };

    const currentCurrency = CURRENCIES.find((c) => c.code === user?.currency);

    return (
        <SafeAreaView style={styles.safe} edges={['top']}>
            <View style={styles.header}>
                <Pressable onPress={() => router.back()} style={styles.backBtn}>
                    <Text style={styles.backText}>‹ Back</Text>
                </Pressable>
                <Text style={styles.headerTitle}>Settings</Text>
                <View style={styles.backBtn} />
            </View>

            <ScrollView style={styles.flex} contentContainerStyle={styles.content}>
                {/* Currency */}
                <Text style={styles.sectionTitle}>Currency</Text>
                <View style={styles.card}>
                    <Pressable
                        style={styles.row}
                        onPress={() => setCurrencyPickerVisible(true)}
                        disabled={savingCurrency}
                    >
                        <View style={styles.flex}>
                            <Text style={styles.fieldLabel}>Selected Currency</Text>
                            <Text style={styles.fieldValue}>
                                {currentCurrency
                                    ? `${currentCurrency.symbol} ${currentCurrency.code} — ${currentCurrency.name}`
                                    : user?.currency ?? 'USD'}
                            </Text>
                        </View>
                        {savingCurrency ? (
                            <ActivityIndicator color="#2563EB" size="small" />
                        ) : (
                            <Text style={styles.chevron}>›</Text>
                        )}
                    </Pressable>
                </View>

                {/* Manage */}
                <Text style={styles.sectionTitle}>Manage</Text>
                <View style={styles.card}>
                    <Pressable
                        style={styles.navRow}
                        onPress={() => router.push('/settings/categories')}
                    >
                        <Text style={styles.navRowLabel}>Categories</Text>
                        <Text style={styles.chevron}>›</Text>
                    </Pressable>
                    <View style={styles.separator} />
                    <Pressable
                        style={styles.navRow}
                        onPress={() => router.push('/settings/security')}
                    >
                        <Text style={styles.navRowLabel}>Security</Text>
                        <Text style={styles.chevron}>›</Text>
                    </Pressable>
                </View>

                {/* Logout */}
                <Pressable style={styles.logoutBtn} onPress={() => clearAuth()}>
                    <Text style={styles.logoutBtnText}>Log Out</Text>
                </Pressable>
            </ScrollView>

            {/* Currency picker modal */}
            <Modal
                visible={currencyPickerVisible}
                transparent
                animationType="slide"
                onRequestClose={() => setCurrencyPickerVisible(false)}
            >
                <Pressable
                    style={styles.pickerBackdrop}
                    onPress={() => setCurrencyPickerVisible(false)}
                >
                    <Pressable style={styles.pickerSheet} onPress={() => {}}>
                        <Text style={styles.pickerTitle}>Select Currency</Text>
                        <ScrollView>
                            {CURRENCIES.map((c) => (
                                <Pressable
                                    key={c.code}
                                    style={[
                                        styles.pickerItem,
                                        user?.currency === c.code && styles.pickerItemSelected,
                                    ]}
                                    onPress={() => handleCurrencySelect(c.code)}
                                >
                                    <Text style={styles.pickerItemText}>
                                        {c.symbol} {c.code} — {c.name}
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
    safe: { flex: 1, backgroundColor: '#F9FAFB' },
    flex: { flex: 1 },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 16,
        paddingVertical: 12,
        backgroundColor: '#fff',
        borderBottomWidth: 1,
        borderBottomColor: '#F3F4F6',
    },
    backBtn: { width: 70 },
    backText: { fontSize: 17, color: '#2563EB' },
    headerTitle: { fontSize: 17, fontWeight: '600', color: '#111827' },
    content: { padding: 16, paddingBottom: 48, gap: 8 },
    sectionTitle: {
        fontSize: 12,
        fontWeight: '600',
        color: '#6B7280',
        textTransform: 'uppercase',
        letterSpacing: 0.5,
        marginTop: 16,
        marginBottom: 4,
    },
    card: {
        backgroundColor: '#fff',
        borderRadius: 12,
        padding: 16,
        gap: 8,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.05,
        shadowRadius: 4,
        elevation: 1,
    },
    row: { flexDirection: 'row', alignItems: 'center', gap: 8 },
    fieldLabel: { fontSize: 12, color: '#6B7280', fontWeight: '500', marginBottom: 4 },
    fieldValue: { fontSize: 15, color: '#111827', fontWeight: '500' },
    chevron: { fontSize: 22, color: '#9CA3AF' },
    navRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingVertical: 4,
    },
    navRowLabel: { fontSize: 15, color: '#111827' },
    separator: { height: 1, backgroundColor: '#F3F4F6' },
    logoutBtn: { marginTop: 24, padding: 16, alignItems: 'center' },
    logoutBtnText: { color: '#DC2626', fontSize: 16, fontWeight: '600' },
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
        maxHeight: '70%',
    },
    pickerTitle: {
        fontSize: 16,
        fontWeight: '700',
        color: '#111827',
        paddingHorizontal: 24,
        paddingBottom: 12,
    },
    pickerItem: { paddingHorizontal: 24, paddingVertical: 14 },
    pickerItemSelected: { backgroundColor: '#EFF6FF' },
    pickerItemText: { fontSize: 15, color: '#111827' },
});
