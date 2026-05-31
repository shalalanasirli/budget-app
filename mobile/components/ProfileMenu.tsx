import { useState } from 'react';
import { Modal, Platform, Pressable, StyleSheet, Text, View } from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useAuthStore } from '@/store/auth';

const HEADER_HEIGHT = Platform.OS === 'ios' ? 44 : 56;

export default function ProfileMenu() {
    const [visible, setVisible] = useState(false);
    const { user, clearAuth } = useAuthStore();
    const router = useRouter();
    const insets = useSafeAreaInsets();

    const initial = user?.email?.[0]?.toUpperCase() ?? '?';

    const handleSettings = () => {
        setVisible(false);
        router.push('/settings');
    };

    const handleLogout = () => {
        setVisible(false);
        clearAuth();
    };

    return (
        <>
            <Pressable style={styles.avatar} onPress={() => setVisible(true)}>
                <Text style={styles.initial}>{initial}</Text>
            </Pressable>

            <Modal
                visible={visible}
                transparent
                animationType="fade"
                onRequestClose={() => setVisible(false)}
            >
                <Pressable
                    style={[styles.backdrop, { paddingTop: insets.top + HEADER_HEIGHT + 8 }]}
                    onPress={() => setVisible(false)}
                >
                    <Pressable style={styles.menu} onPress={() => {}}>
                        <Text style={styles.email} numberOfLines={1}>
                            {user?.email}
                        </Text>
                        <View style={styles.divider} />
                        <Pressable style={styles.menuItem} onPress={handleSettings}>
                            <Text style={styles.menuItemText}>Settings</Text>
                        </Pressable>
                        <View style={styles.divider} />
                        <Pressable style={styles.menuItem} onPress={handleLogout}>
                            <Text style={[styles.menuItemText, styles.logoutText]}>Log out</Text>
                        </Pressable>
                    </Pressable>
                </Pressable>
            </Modal>
        </>
    );
}

const styles = StyleSheet.create({
    avatar: {
        width: 34,
        height: 34,
        borderRadius: 17,
        backgroundColor: '#2563EB',
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: 16,
    },
    initial: {
        color: '#fff',
        fontSize: 14,
        fontWeight: '600',
    },
    backdrop: {
        flex: 1,
        alignItems: 'flex-end',
        paddingRight: 16,
    },
    menu: {
        backgroundColor: '#fff',
        borderRadius: 12,
        minWidth: 200,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.1,
        shadowRadius: 12,
        elevation: 8,
        overflow: 'hidden',
    },
    email: {
        fontSize: 13,
        color: '#6B7280',
        paddingHorizontal: 16,
        paddingVertical: 12,
    },
    divider: {
        height: 1,
        backgroundColor: '#F3F4F6',
    },
    menuItem: {
        paddingHorizontal: 16,
        paddingVertical: 14,
    },
    menuItemText: {
        fontSize: 15,
        color: '#111827',
        fontWeight: '500',
    },
    logoutText: {
        color: '#DC2626',
    },
});
