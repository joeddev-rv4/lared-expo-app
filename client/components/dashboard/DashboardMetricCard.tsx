import React from 'react';
import { View, StyleSheet, Platform, ViewStyle } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { ThemedText } from '@/components/ThemedText';
import { Sparkline } from './Sparkline';
import { useTheme } from '@/hooks/useTheme';
import { Spacing, BorderRadius, Colors, Shadows } from '@/constants/theme';

interface DashboardMetricCardProps {
    title: string;
    value: string | number;
    icon: keyof typeof Ionicons.glyphMap;
    trend?: {
        value: number;
        label: string;
        positive: boolean;
    };
    color?: string;
    delay?: number;
    noBackground?: boolean;
    sparklineData?: number[];
    sparklineType?: 'line' | 'bar' | 'area' | 'curved' | 'gauge' | 'arc' | 'donut';
    rightIcon?: keyof typeof Ionicons.glyphMap;
    style?: ViewStyle;
}

export const DashboardMetricCard = ({
    title,
    value,
    icon,
    trend,
    color = Colors.light.primary,
    delay = 0,
    noBackground = false,
    sparklineData,
    sparklineType = 'line',
    rightIcon,
    style
}: DashboardMetricCardProps) => {
    const { theme, isDark } = useTheme();

    return (
        <View
            style={[
                styles.container,
                !noBackground && {
                    backgroundColor: theme.backgroundDefault,
                    borderColor: theme.border,
                    borderWidth: 1,
                    shadowColor: Shadows.card.shadowColor,
                    shadowOffset: Shadows.card.shadowOffset,
                    shadowOpacity: Shadows.card.shadowOpacity,
                    shadowRadius: Shadows.card.shadowRadius,
                    elevation: Shadows.card.elevation,
                },
                { position: 'relative' as const },
                style
            ]}
        >
            <View style={styles.mainContent}>
                <View style={[styles.content, { alignItems: 'center' }]}>
                    <Ionicons name={icon} size={28} color={color} />
                    <ThemedText style={[styles.value, { color: theme.text, textAlign: 'center' }]}>
                        {value}
                    </ThemedText>
                    <ThemedText style={[styles.title, { color: theme.textSecondary, textAlign: 'center' }]}>
                        {title}
                    </ThemedText>
                </View>
                {sparklineData && (
                    <View style={styles.sparklineContainer}>
                        <Sparkline data={sparklineData} color={color} type={sparklineType} />
                    </View>
                )}
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        padding: Spacing.xl,
        borderRadius: BorderRadius.lg,
        flex: 1,
        minWidth: 140,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        marginBottom: Spacing.sm,
    },
    mainContent: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-end',
    },
    sparklineContainer: {
        marginBottom: 4,
    },
    iconContainer: {
        width: 36,
        height: 36,
        borderRadius: 12,
        alignItems: 'center',
        justifyContent: 'center',
    },
    trendBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 6,
        paddingVertical: 2,
        borderRadius: BorderRadius.full,
        gap: 2,
    },
    trendText: {
        fontSize: 10,
        fontWeight: '600',
    },
    content: {
        gap: 8,
    },
    value: {
        fontSize: 40,
        fontWeight: '700',
    },
    valueIcon: {
        marginTop: 2,
    },
    rightIcon: {
        position: 'absolute',
        top: 50,
        right: Spacing.md,
    },
    title: {
        fontSize: 16,
        fontWeight: '500',
    },
});
