import { useState } from 'react';
import { ActivityIndicator, Pressable, StyleSheet, Text, View } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { useRouter } from 'expo-router';
import { receiptService } from '@/services/receipts';
import { useScanStore } from '@/store/scan';

export default function ScanReceiptScreen() {
    const router = useRouter();
    const setResult = useScanStore((s) => s.setResult);
    const [scanning, setScanning] = useState(false);
    const [error, setError] = useState('');

    const pickAndScan = async (useCamera: boolean) => {
        const result = useCamera
            ? await ImagePicker.launchCameraAsync({ quality: 0.8 })
            : await ImagePicker.launchImageLibraryAsync({ quality: 0.8 });

        if (result.canceled) return;

        const asset = result.assets[0];
        const fileName = asset.uri.split('/').pop() ?? 'receipt.jpg';

        setScanning(true);
        setError('');
        try {
            const { data } = await receiptService.scan(asset.uri, fileName);
            setResult({
                merchant: data.merchant ?? undefined,
                amount: data.amount ?? undefined,
                categoryId: data.suggestedCategoryId ?? undefined,
            });
            router.back();
        } catch {
            setError('Could not scan receipt. Please try again or fill in manually.');
        } finally {
            setScanning(false);
        }
    };

    return (
        <View style={styles.container}>
            {scanning ? (
                <View style={styles.scanning}>
                    <ActivityIndicator size="large" color="#2563EB" />
                    <Text style={styles.scanningText}>Scanning receipt...</Text>
                </View>
            ) : (
                <>
                    <View style={styles.placeholder}>
                        <View style={styles.placeholderIcon} />
                        <Text style={styles.placeholderText}>
                            Take a photo or pick an image of your receipt.
                        </Text>
                    </View>

                    {error ? <Text style={styles.error}>{error}</Text> : null}

                    <View style={styles.actions}>
                        <Pressable
                            style={styles.button}
                            onPress={() => pickAndScan(true)}
                        >
                            <Text style={styles.buttonText}>Take Photo</Text>
                        </Pressable>

                        <Pressable
                            style={[styles.button, styles.buttonSecondary]}
                            onPress={() => pickAndScan(false)}
                        >
                            <Text style={[styles.buttonText, styles.buttonTextSecondary]}>
                                Choose from Library
                            </Text>
                        </Pressable>
                    </View>
                </>
            )}
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#fff',
        paddingHorizontal: 24,
        paddingVertical: 32,
        justifyContent: 'space-between',
    },
    scanning: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        gap: 16,
    },
    scanningText: {
        fontSize: 15,
        color: '#6B7280',
    },
    placeholder: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        gap: 16,
    },
    placeholderIcon: {
        width: 80,
        height: 80,
        borderRadius: 12,
        backgroundColor: '#F3F4F6',
        borderWidth: 2,
        borderColor: '#E5E7EB',
        borderStyle: 'dashed',
    },
    placeholderText: {
        fontSize: 15,
        color: '#6B7280',
        textAlign: 'center',
        lineHeight: 22,
    },
    error: {
        color: '#DC2626',
        fontSize: 14,
        textAlign: 'center',
        marginBottom: 16,
    },
    actions: {
        gap: 12,
    },
    button: {
        backgroundColor: '#2563EB',
        borderRadius: 12,
        padding: 16,
        alignItems: 'center',
    },
    buttonSecondary: {
        backgroundColor: 'transparent',
        borderWidth: 1,
        borderColor: '#E5E7EB',
    },
    buttonText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: '600',
    },
    buttonTextSecondary: {
        color: '#374151',
    },
});
