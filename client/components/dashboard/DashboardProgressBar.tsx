import React from 'react';
import { View, StyleSheet, Platform } from 'react-native';
import { ThemedText } from '@/components/ThemedText';
import { useTheme } from '@/hooks/useTheme';
import { Spacing, BorderRadius, Colors } from '@/constants/theme';

interface DashboardProgressBarProps {
    label: string;
    current: number;
    target: number;
    color?: string;
}

export const DashboardProgressBar = ({
    label,
    current,
    target,
    color = Colors.light.primary
}: DashboardProgressBarProps) => {
    const { theme } = useTheme();
    const percentage = Math.min(Math.max((current / target) * 100, 0), 100);

    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <ThemedText style={styles.label}>{label}</ThemedText>
                <ThemedText style={[styles.value, { color: theme.textSecondary }]}>
                    {current} / {target}
                </ThemedText>
            </View>
            <View style={[styles.track, { backgroundColor: theme.backgroundSecondary }]}>
                <View
                    style={[
                        styles.fill,
                        {
                            width: `${percentage}%`,
                            ...(Platform.OS === 'web' ? {
                                backgroundImage: `radial-gradient(circle at 50% 50%, #044bb8, #000000)`
                            } : {
                                backgroundColor: color
                            })
                        }
                    ]}
                />
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        marginBottom: Spacing.md,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: Spacing.xs,
    },
    label: {
        fontSize: 14,
        fontWeight: '500',
    },
    value: {
        fontSize: 12,
    },
    track: {
        height: 8,
        borderRadius: 4,
        overflow: 'hidden',
    },
    fill: {
        height: '100%',
        borderRadius: 4,
    },
});
