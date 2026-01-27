import React from 'react';
import { View, StyleSheet, Platform } from 'react-native';
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
    sparklineType = 'line'
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
                }
            ]}
        >
            <View style={styles.header}>
                <View style={[styles.iconContainer, { backgroundColor: color + '20' }]}>
                    <Ionicons name={icon} size={20} color={color} />
                </View>
                {trend && (
                    <View style={[
                        styles.trendBadge,
                        { backgroundColor: trend.positive ? '#10B98120' : '#EF444420' }
                    ]}>
                        <Ionicons
                            name={trend.positive ? "arrow-up" : "arrow-down"}
                            size={12}
                            color={trend.positive ? '#10B981' : '#EF4444'}
                        />
                        <ThemedText style={[
                            styles.trendText,
                            { color: trend.positive ? '#10B981' : '#EF4444' }
                        ]}>
                            {trend.value}%
                        </ThemedText>
                    </View>
                )}
            </View>

            <View style={styles.mainContent}>
                <View style={styles.content}>
                    <ThemedText style={[styles.value, { color: theme.text }]}>
                        {value}
                    </ThemedText>
                    <ThemedText style={[styles.title, { color: theme.textSecondary }]}>
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
        padding: Spacing.md,
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
        gap: 2,
        flex: 1,
    },
    value: {
        fontSize: 24,
        fontWeight: '700',
    },
    title: {
        fontSize: 12,
        fontWeight: '500',
    },
});
