import React, { useRef } from 'react';
import { Animated, PanResponder, Pressable, StyleSheet, Text, View } from 'react-native';

interface Props {
    onDelete: () => void;
    children: React.ReactNode;
}

const DELETE_WIDTH = 80;
const SWIPE_THRESHOLD = -50;

export default function SwipeableRow({ onDelete, children }: Props) {
    const translateX = useRef(new Animated.Value(0)).current;
    const open = useRef(false);

    const close = () => {
        Animated.spring(translateX, {
            toValue: 0,
            useNativeDriver: true,
            bounciness: 4,
        }).start(() => { open.current = false; });
    };

    const panResponder = useRef(
        PanResponder.create({
            onMoveShouldSetPanResponder: (_, { dx, dy }) =>
                Math.abs(dx) > Math.abs(dy) && Math.abs(dx) > 6,
            onPanResponderMove: (_, { dx }) => {
                const base = open.current ? -DELETE_WIDTH : 0;
                const next = Math.max(Math.min(base + dx, 0), -DELETE_WIDTH);
                translateX.setValue(next);
            },
            onPanResponderRelease: (_, { dx }) => {
                const base = open.current ? -DELETE_WIDTH : 0;
                const total = base + dx;
                if (total < SWIPE_THRESHOLD) {
                    Animated.spring(translateX, {
                        toValue: -DELETE_WIDTH,
                        useNativeDriver: true,
                        bounciness: 4,
                    }).start(() => { open.current = true; });
                } else {
                    close();
                }
            },
        }),
    ).current;

    return (
        <View style={styles.container}>
            <Pressable
                style={styles.deleteAction}
                onPress={() => { close(); onDelete(); }}
            >
                <Text style={styles.deleteText}>Delete</Text>
            </Pressable>
            <Animated.View
                style={[styles.row, { transform: [{ translateX }] }]}
                {...panResponder.panHandlers}
            >
                {children}
            </Animated.View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: { overflow: 'hidden' },
    deleteAction: {
        position: 'absolute',
        right: 0,
        top: 0,
        bottom: 0,
        width: DELETE_WIDTH,
        backgroundColor: '#DC2626',
        justifyContent: 'center',
        alignItems: 'center',
    },
    deleteText: { color: '#fff', fontWeight: '700', fontSize: 14 },
    row: { backgroundColor: '#fff' },
});
