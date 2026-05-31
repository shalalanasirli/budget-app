import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Tabs, useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

function FAB() {
    const router = useRouter();
    const insets = useSafeAreaInsets();
    return (
        <Pressable
            style={[styles.fab, { bottom: 56 + insets.bottom }]}
            onPress={() => router.push('/add-expense')}
        >
            <Text style={styles.fabText}>+</Text>
        </Pressable>
    );
}

export default function TabLayout() {
    return (
        <View style={styles.root}>
            <Tabs screenOptions={{ headerShown: false }}>
                <Tabs.Screen name="index" options={{ title: 'Dashboard' }} />
                <Tabs.Screen name="budget" options={{ title: 'Budget' }} />
                <Tabs.Screen name="expenses" options={{ href: null }} />
            </Tabs>
            <FAB />
        </View>
    );
}

const styles = StyleSheet.create({
    root: { flex: 1 },
    fab: {
        position: 'absolute',
        right: 24,
        width: 56,
        height: 56,
        borderRadius: 28,
        backgroundColor: '#2563EB',
        alignItems: 'center',
        justifyContent: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.2,
        shadowRadius: 8,
        elevation: 6,
    },
    fabText: { fontSize: 30, color: '#fff', lineHeight: 34 },
});
