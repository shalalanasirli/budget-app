import { useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    KeyboardAvoidingView,
    Platform,
    Pressable,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { useAuthStore } from '@/store/auth';
import { userService } from '@/services/user';

export default function SecurityScreen() {
    const router = useRouter();
    const { clearAuth } = useAuthStore();

    const [currentPassword, setCurrentPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [savingPassword, setSavingPassword] = useState(false);
    const [passwordError, setPasswordError] = useState('');
    const [deletingAccount, setDeletingAccount] = useState(false);

    const handleChangePassword = async () => {
        setPasswordError('');
        if (!currentPassword || !newPassword || !confirmPassword) {
            setPasswordError('All fields are required.');
            return;
        }
        if (newPassword.length < 8) {
            setPasswordError('New password must be at least 8 characters.');
            return;
        }
        if (newPassword !== confirmPassword) {
            setPasswordError('New passwords do not match.');
            return;
        }
        setSavingPassword(true);
        try {
            await userService.changePassword(currentPassword, newPassword);
            setCurrentPassword('');
            setNewPassword('');
            setConfirmPassword('');
            Alert.alert('Success', 'Password updated.');
        } catch {
            setPasswordError('Current password is incorrect.');
        } finally {
            setSavingPassword(false);
        }
    };

    const handleDeleteAccount = () => {
        Alert.alert(
            'Delete Account',
            'This will permanently delete your account and all data. This cannot be undone.',
            [
                { text: 'Cancel', style: 'cancel' },
                {
                    text: 'Delete Account',
                    style: 'destructive',
                    onPress: async () => {
                        setDeletingAccount(true);
                        try {
                            await userService.deleteAccount();
                            await clearAuth();
                        } catch {
                            Alert.alert('Error', 'Failed to delete account.');
                            setDeletingAccount(false);
                        }
                    },
                },
            ],
        );
    };

    return (
        <SafeAreaView style={styles.safe} edges={['top']}>
            <View style={styles.header}>
                <Pressable onPress={() => router.back()} style={styles.backBtn}>
                    <Text style={styles.backText}>‹ Back</Text>
                </Pressable>
                <Text style={styles.headerTitle}>Security</Text>
                <View style={styles.backBtn} />
            </View>

            <KeyboardAvoidingView
                style={styles.flex}
                behavior={Platform.OS === 'ios' ? 'padding' : undefined}
            >
                <ScrollView
                    style={styles.flex}
                    contentContainerStyle={styles.content}
                    keyboardShouldPersistTaps="handled"
                >
                    <Text style={styles.sectionTitle}>Change Password</Text>
                    <View style={styles.card}>
                        <Text style={styles.fieldLabel}>Current Password</Text>
                        <TextInput
                            style={styles.input}
                            value={currentPassword}
                            onChangeText={setCurrentPassword}
                            secureTextEntry
                            placeholder="Enter current password"
                            placeholderTextColor="#9CA3AF"
                            autoCapitalize="none"
                        />
                        <Text style={styles.fieldLabel}>New Password</Text>
                        <TextInput
                            style={styles.input}
                            value={newPassword}
                            onChangeText={setNewPassword}
                            secureTextEntry
                            placeholder="At least 8 characters"
                            placeholderTextColor="#9CA3AF"
                            autoCapitalize="none"
                        />
                        <Text style={styles.fieldLabel}>Confirm New Password</Text>
                        <TextInput
                            style={styles.input}
                            value={confirmPassword}
                            onChangeText={setConfirmPassword}
                            secureTextEntry
                            placeholder="Repeat new password"
                            placeholderTextColor="#9CA3AF"
                            autoCapitalize="none"
                        />
                        {passwordError ? (
                            <Text style={styles.errorText}>{passwordError}</Text>
                        ) : null}
                        <Pressable
                            style={[styles.primaryBtn, savingPassword && styles.disabled]}
                            onPress={handleChangePassword}
                            disabled={savingPassword}
                        >
                            {savingPassword ? (
                                <ActivityIndicator color="#fff" />
                            ) : (
                                <Text style={styles.primaryBtnText}>Change Password</Text>
                            )}
                        </Pressable>
                    </View>

                    <Text style={[styles.sectionTitle, styles.dangerTitle]}>Danger Zone</Text>
                    <View style={styles.card}>
                        <Pressable
                            style={[styles.dangerBtn, deletingAccount && styles.disabled]}
                            onPress={handleDeleteAccount}
                            disabled={deletingAccount}
                        >
                            {deletingAccount ? (
                                <ActivityIndicator color="#DC2626" />
                            ) : (
                                <Text style={styles.dangerBtnText}>Delete Account</Text>
                            )}
                        </Pressable>
                    </View>
                </ScrollView>
            </KeyboardAvoidingView>
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
    dangerTitle: { color: '#DC2626' },
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
    fieldLabel: { fontSize: 12, color: '#6B7280', fontWeight: '500', marginBottom: 2 },
    input: {
        borderWidth: 1,
        borderColor: '#E5E7EB',
        borderRadius: 8,
        padding: 12,
        fontSize: 15,
        color: '#111827',
        backgroundColor: '#fff',
        marginBottom: 4,
    },
    errorText: { color: '#DC2626', fontSize: 13 },
    primaryBtn: {
        backgroundColor: '#2563EB',
        borderRadius: 10,
        padding: 14,
        alignItems: 'center',
        marginTop: 4,
    },
    primaryBtnText: { color: '#fff', fontWeight: '600', fontSize: 15 },
    dangerBtn: {
        borderWidth: 1,
        borderColor: '#DC2626',
        borderRadius: 10,
        padding: 14,
        alignItems: 'center',
    },
    dangerBtnText: { color: '#DC2626', fontWeight: '600', fontSize: 15 },
    disabled: { opacity: 0.5 },
});
