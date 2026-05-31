import { StyleSheet, Text, View } from 'react-native';
import { useAuthStore } from '@/store/auth';

interface Props {
    categoryName: string;
    spent: number;
    limit: number;
}

function barColor(ratio: number): string {
    if (ratio >= 0.9) return '#DC2626';
    if (ratio >= 0.75) return '#D97706';
    return '#16A34A';
}

export default function BudgetProgressBar({ categoryName, spent, limit }: Props) {
    const currency = useAuthStore((s) => s.user?.currency ?? '');
    const ratio = limit > 0 ? Math.min(spent / limit, 1) : 0;
    const color = barColor(ratio);
    const pct = Math.round(ratio * 100);

    const fmt = (n: number) =>
        n.toLocaleString('en-US', { style: 'currency', currency: currency || 'USD' });

    return (
        <View style={styles.container}>
            <View style={styles.row}>
                <Text style={styles.name}>{categoryName}</Text>
                <Text style={[styles.amounts, ratio >= 0.9 && styles.amountsOver]}>
                    {fmt(spent)} / {fmt(limit)}
                </Text>
            </View>
            <View style={styles.track}>
                <View style={[styles.fill, { width: `${pct}%` as any, backgroundColor: color }]} />
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        gap: 8,
        paddingVertical: 14,
        borderBottomWidth: 1,
        borderBottomColor: '#F3F4F6',
    },
    row: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    name: {
        fontSize: 15,
        fontWeight: '500',
        color: '#111827',
    },
    amounts: {
        fontSize: 13,
        color: '#6B7280',
    },
    amountsOver: {
        color: '#DC2626',
    },
    track: {
        height: 6,
        borderRadius: 3,
        backgroundColor: '#E5E7EB',
        overflow: 'hidden',
    },
    fill: {
        height: '100%',
        borderRadius: 3,
    },
});
