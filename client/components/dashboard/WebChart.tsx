import React, { useMemo } from 'react';
import { View, StyleSheet, Platform } from 'react-native';
import { ThemedText } from '@/components/ThemedText';
import { useTheme } from '@/hooks/useTheme';
import { Spacing, BorderRadius, Colors } from '@/constants/theme';

interface DataPoint {
    label: string;
    value: number;
}

interface WebChartProps {
    data: DataPoint[];
    height?: number;
    color?: string;
    max: number;
}

export const WebChart = ({
    data,
    height = 250,
    color = Colors.light.primary,
    max
}: WebChartProps) => {
    const { theme } = useTheme();

    // Use 'max' prop or fallback to data max
    const maxValue = useMemo(() => {
        return Math.max(max, ...data.map(d => d.value), 10);
    }, [data, max]);

    return (
        <View style={[styles.container, { height }]}>
            <View style={styles.chartArea}>
                {/* Y-Axis Lines */}
                <View style={StyleSheet.absoluteFill}>
                    <View style={[styles.gridLine, { borderTopColor: theme.border, top: '0%' }]} />
                    <View style={[styles.gridLine, { borderTopColor: theme.border, top: '25%' }]} />
                    <View style={[styles.gridLine, { borderTopColor: theme.border, top: '50%' }]} />
                    <View style={[styles.gridLine, { borderTopColor: theme.border, top: '75%' }]} />
                    <View style={[styles.gridLine, { borderTopColor: theme.border, top: '100%' }]} />
                </View>

                {/* Bars */}
                <View style={styles.barsContainer}>
                    {data.map((point, index) => {
                        const percentage = (point.value / maxValue) * 100;
                        const barWidth = data.length > 20 ? 12 : 32;
                        return (
                            <View key={index} style={styles.barColumn}>
                                <View style={styles.barTrack}>
                                    <View style={styles.valueContainer}>
                                        <ThemedText style={[styles.barValue, { color: theme.textSecondary }]}>
                                            {point.value}
                                        </ThemedText>
                                    </View>
                                    <View
                                        style={[
                                            styles.bar,
                                            {
                                                height: `${percentage}%`,
                                                width: barWidth,
                                                borderTopLeftRadius: barWidth / 2,
                                                borderTopRightRadius: barWidth / 2,
                                                ...(Platform.OS === 'web' ? {
                                                    backgroundImage: `radial-gradient(circle at 50% 50%, #044bb8, #000000)`
                                                } : {
                                                    backgroundColor: color
                                                })
                                            }
                                        ]}
                                    />
                                </View>
                                <ThemedText style={[styles.label, { color: theme.textSecondary }]}>
                                    {point.label}
                                </ThemedText>
                            </View>
                        );
                    })}
                </View>
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        width: '100%',
    },
    chartArea: {
        flex: 1,
        position: 'relative',
        paddingTop: 20, // Space for values at top
        paddingBottom: 24, // Space for labels
    },
    gridLine: {
        position: 'absolute',
        left: 0,
        right: 0,
        borderTopWidth: 1,
        borderStyle: 'dashed',
        opacity: 0.5,
    },
    barsContainer: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'flex-end',
        justifyContent: 'space-between',
        paddingHorizontal: Spacing.md,
    },
    barColumn: {
        flex: 1,
        height: '100%',
        alignItems: 'center',
        justifyContent: 'flex-end',
        marginHorizontal: Spacing.xs,
    },
    barTrack: {
        flex: 1,
        width: '100%',
        justifyContent: 'flex-end',
        alignItems: 'center',
    },
    valueContainer: {
        marginBottom: 4,
    },
    barValue: {
        fontSize: 9,
        fontWeight: '600',
        textAlign: 'center',
    },
    bar: {
        // Dynamic width and radius set in style prop
    },
    label: {
        fontSize: 10,
        marginTop: 8,
        position: 'absolute',
        bottom: -24,
    },
});
