import React, { useEffect, useState } from 'react';
import { View, StyleSheet, Animated } from 'react-native';
import { ThemedText } from '@/components/ThemedText';
import { useTheme } from '@/hooks/useTheme';
import { Spacing, BorderRadius, Colors } from '@/constants/theme';
import { Ionicons } from '@expo/vector-icons';

interface Message {
    id: string;
    text: string;
    icon: keyof typeof Ionicons.glyphMap;
    color: string;
}

interface DashboardBannerProps {
    messages: Message[];
    interval?: number;
    title?: string;
}

export const DashboardBanner = ({ messages, interval = 2000, title }: DashboardBannerProps) => {
    const { theme } = useTheme();
    const [currentIndex, setCurrentIndex] = useState(0);
    const [fadeAnim] = useState(new Animated.Value(1));

    useEffect(() => {
        if (messages.length > 1) {
            const timer = setInterval(() => {
                Animated.sequence([
                    Animated.timing(fadeAnim, {
                        toValue: 0,
                        duration: 300,
                        useNativeDriver: true,
                    }),
                    Animated.timing(fadeAnim, {
                        toValue: 1,
                        duration: 300,
                        useNativeDriver: true,
                    }),
                ]).start();

                setTimeout(() => {
                    setCurrentIndex((prev) => (prev + 1) % messages.length);
                }, 300);
            }, interval);

            return () => clearInterval(timer);
        }
    }, [messages.length, interval, fadeAnim]);

    const currentMessage = messages[currentIndex];

    return (
        <View style={[styles.container, { backgroundColor: theme.backgroundDefault }]}>
            {title && <ThemedText style={styles.title}>{title}</ThemedText>}
            <Animated.View style={[styles.content, { opacity: fadeAnim }]}>
                <View style={[styles.iconContainer, { backgroundColor: currentMessage.color + '20' }]}>
                    <Ionicons name={currentMessage.icon} size={24} color={currentMessage.color} />
                </View>
                <ThemedText style={styles.text}>{currentMessage.text}</ThemedText>
            </Animated.View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        padding: Spacing.lg,
        borderRadius: BorderRadius.lg,
        height: 100,
        justifyContent: 'center',
        overflow: 'hidden',
    },
    title: {
        fontSize: 18,
        fontWeight: '700',
        textAlign: 'center',
        marginBottom: Spacing.sm,
    },
    content: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: Spacing.md,
    },
    iconContainer: {
        width: 48,
        height: 48,
        borderRadius: 24,
        alignItems: 'center',
        justifyContent: 'center',
    },
    text: {
        fontSize: 16,
        fontWeight: '600',
        flex: 1,
    },
});
