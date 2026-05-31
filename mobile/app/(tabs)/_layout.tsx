import { Tabs } from 'expo-router';
import ProfileMenu from '@/components/ProfileMenu';

export default function TabLayout() {
    return (
        <Tabs screenOptions={{ headerRight: () => <ProfileMenu /> }}>
            <Tabs.Screen name="index" options={{ title: 'Home' }} />
        </Tabs>
    );
}
