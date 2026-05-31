import { useEffect, useState } from 'react';
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
import { useQueryClient } from '@tanstack/react-query';
import { categoryService, type Category } from '@/services/categories';
import SwipeableRow from '@/components/SwipeableRow';

export default function CategoriesScreen() {
    const router = useRouter();
    const queryClient = useQueryClient();

    const [categories, setCategories] = useState<Category[]>([]);
    const [newName, setNewName] = useState('');
    const [adding, setAdding] = useState(false);
    const [deletingId, setDeletingId] = useState<string | null>(null);

    useEffect(() => {
        load();
    }, []);

    const load = async () => {
        try {
            const { data } = await categoryService.getAll();
            setCategories(data);
        } catch {}
    };

    const handleAdd = async () => {
        const name = newName.trim();
        if (!name) return;
        setAdding(true);
        try {
            const { data } = await categoryService.create(name);
            setCategories((prev) => [...prev, data]);
            setNewName('');
            queryClient.invalidateQueries({ queryKey: ['categories'] });
        } catch {
            Alert.alert('Error', 'Failed to add category.');
        } finally {
            setAdding(false);
        }
    };

    const handleDelete = (id: string, name: string) => {
        Alert.alert('Delete Category', `Delete "${name}"?`, [
            { text: 'Cancel', style: 'cancel' },
            {
                text: 'Delete',
                style: 'destructive',
                onPress: async () => {
                    setDeletingId(id);
                    try {
                        await categoryService.deleteCategory(id);
                        setCategories((prev) => prev.filter((c) => c.id !== id));
                        queryClient.invalidateQueries({ queryKey: ['categories'] });
                    } catch {
                        Alert.alert('Error', 'Failed to delete category.');
                    } finally {
                        setDeletingId(null);
                    }
                },
            },
        ]);
    };

    return (
        <SafeAreaView style={styles.safe} edges={['top']}>
            <View style={styles.header}>
                <Pressable onPress={() => router.back()} style={styles.backBtn}>
                    <Text style={styles.backText}>‹ Back</Text>
                </Pressable>
                <Text style={styles.headerTitle}>Categories</Text>
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
                    <View style={styles.card}>
                        {categories.map((c) =>
                            c.isDefault ? (
                                <View key={c.id} style={styles.row}>
                                    <Text style={styles.name}>{c.name}</Text>
                                    <Text style={styles.badge}>Default</Text>
                                </View>
                            ) : (
                                <SwipeableRow key={c.id} onDelete={() => handleDelete(c.id, c.name)}>
                                    <View style={[styles.row, styles.rowBg]}>
                                        <Text style={styles.name}>{c.name}</Text>
                                        {deletingId === c.id && (
                                            <ActivityIndicator color="#DC2626" size="small" />
                                        )}
                                    </View>
                                </SwipeableRow>
                            ),
                        )}

                        <View style={styles.addRow}>
                            <TextInput
                                style={[styles.input, styles.flex]}
                                value={newName}
                                onChangeText={setNewName}
                                placeholder="New category name"
                                placeholderTextColor="#9CA3AF"
                                returnKeyType="done"
                                onSubmitEditing={handleAdd}
                            />
                            <Pressable
                                style={[styles.addBtn, adding && styles.disabled]}
                                onPress={handleAdd}
                                disabled={adding}
                            >
                                {adding ? (
                                    <ActivityIndicator color="#fff" size="small" />
                                ) : (
                                    <Text style={styles.addBtnText}>Add</Text>
                                )}
                            </Pressable>
                        </View>
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
    content: { padding: 16, paddingBottom: 48 },
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
    row: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingVertical: 10,
        borderBottomWidth: 1,
        borderBottomColor: '#F3F4F6',
    },
    rowBg: { backgroundColor: '#fff', paddingHorizontal: 16 },
    name: { fontSize: 15, color: '#111827' },
    badge: {
        fontSize: 11,
        color: '#6B7280',
        backgroundColor: '#F3F4F6',
        paddingHorizontal: 8,
        paddingVertical: 3,
        borderRadius: 10,
    },
    deleteText: { fontSize: 16, color: '#DC2626', fontWeight: '600' },
    addRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginTop: 4 },
    input: {
        borderWidth: 1,
        borderColor: '#E5E7EB',
        borderRadius: 8,
        padding: 12,
        fontSize: 15,
        color: '#111827',
        backgroundColor: '#fff',
    },
    addBtn: {
        backgroundColor: '#2563EB',
        borderRadius: 8,
        paddingHorizontal: 16,
        paddingVertical: 12,
        alignItems: 'center',
        justifyContent: 'center',
    },
    addBtnText: { color: '#fff', fontWeight: '600', fontSize: 14 },
    disabled: { opacity: 0.5 },
});
