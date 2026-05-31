import { Pressable, Text, View } from 'react-native';
import { Tabs, useRouter } from 'expo-router';
import ProfileMenu from '@/components/ProfileMenu';

function AddButton() {
    const router = useRouter();
    return (
        <Pressable
            onPress={() => router.push('/add-expense')}
            style={{ marginRight: 8 }}
        >
            <Text style={{ fontSize: 28, color: '#2563EB', lineHeight: 32 }}>+</Text>
        </Pressable>
    );
}

function HeaderRight() {
    return (
        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
            <AddButton />
            <ProfileMenu />
        </View>
    );
}

export default function TabLayout() {
    return (
        <Tabs screenOptions={{ headerRight: () => <HeaderRight /> }}>
            <Tabs.Screen name="index" options={{ title: 'Home' }} />
            <Tabs.Screen name="expenses" options={{ title: 'Expenses' }} />
        </Tabs>
    );
}
