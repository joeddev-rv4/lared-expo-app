import React, { useMemo } from 'react';
import { View, StyleSheet, Platform } from 'react-native';
import { ThemedText } from '@/components/ThemedText';
import { useTheme } from '@/hooks/useTheme';
import { Spacing, BorderRadius, Colors } from '@/constants/theme';

interface DataPoint {
    label: string;
    values: number[];
}

interface WebChartProps {
    data: DataPoint[];
    height?: number;
    colors?: string[];
    max: number;
    legends?: string[];
}

export const WebChart = ({
    data,
    height = 250,
    colors = [Colors.light.primary, '#10B981', '#F59E0B'],
    max,
    legends = ['Serie 1', 'Serie 2', 'Serie 3']
}: WebChartProps) => {
    const { theme } = useTheme();

    // Use 'max' prop or fallback to data max
    const maxValue = useMemo(() => {
        const allValues = data.flatMap(d => d.values);
        return Math.max(max, ...allValues, 10);
    }, [data, max]);

    const chartHeight = 200; // Fixed height for bars

    return (
        <View style={[styles.container, { height }]}>
            <View style={styles.chartArea}>
                {/* Y-Axis Lines */}
                <View style={StyleSheet.absoluteFill}>
                    {[0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((i) => (
                        <View key={i} style={[styles.gridLine, { top: `${100 - i * 10}%` }]} />
                    ))}
                </View>

                {/* Axes */}
                <View style={StyleSheet.absoluteFill}>
                    {/* Horizontal axis at bottom */}
                    <View style={[styles.axisLine, { borderTopColor: theme.text, top: '100%', left: 0, right: 0 }]} />
                    {/* Vertical axis at left */}
                    <View style={[styles.axisLine, { borderLeftColor: theme.text, left: 0, top: 0, bottom: 0 }]} />

                    {/* Y-axis labels */}
                    {[0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((i) => {
                        const value = Math.round(i * (maxValue / 10));
                        const topPercent = 100 - (i * 10);
                        return (
                            <View key={i} style={[styles.yAxisLabelContainer, { top: `${topPercent - 2}%` }]}>
                                <ThemedText style={styles.yAxisLabel}>
                                    {value}
                                </ThemedText>
                            </View>
                        );
                    })}
                </View>

                {/* Bars */}
                <View style={styles.barsContainer}>
                    {data.map((point, index) => {
                        const barWidth = data.length > 20 ? 8 : 24;
                        const groupWidth = barWidth * point.values.length + 4 * (point.values.length - 1);
                        return (
                            <View key={index} style={styles.barColumn}>
                                <View style={styles.barTrack}>
                                    <View style={styles.multiBarContainer}>
                                        {point.values.map((value, valueIndex) => {
                                            const barHeight = (value / maxValue) * chartHeight;
                                            return (
                                                <View
                                                    key={valueIndex}
                                                    style={[
                                                        styles.bar,
                                                        {
                                                            height: barHeight,
                                                            width: 40,
                                                            position: 'absolute',
                                                            bottom: 0,
                                                            left: data.length === 1 ? 133 : index === 0 ? 79 : index === 1 ? 57 : 0,
                                                            ...(Platform.OS === 'web' ? {
                                                                backgroundColor: colors[index % colors.length]
                                                            } : {
                                                                backgroundColor: colors[index % colors.length]
                                                            })
                                                        }
                                                    ]}
                                                />
                                            );
                                        })}
                                    </View>
                                </View>
                            </View>
                        );
                    })}
                </View>
            </View>

            {/* Legend */}
            <View style={styles.legendContainer}>
                {legends.map((legend, index) => (
                    <View key={index} style={styles.legendItem}>
                        <View style={[styles.legendColor, { backgroundColor: colors[index % colors.length] }]} />
                        <ThemedText style={[styles.legendText, { color: theme.text }]}>{legend}</ThemedText>
                    </View>
                ))}
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
        paddingBottom: 0, // No padding for bars to touch bottom
    },
    gridLine: {
        position: 'absolute',
        left: 0,
        right: 0,
        height: 1,
        backgroundColor: '#c0c0c0',
    },
    axisLine: {
        borderWidth: 1,
        borderColor: '#333',
        position: 'absolute',
    },
    yAxisLabelContainer: {
        position: 'absolute',
        left: -30,
        width: 25,
        height: 12,
        justifyContent: 'center',
        alignItems: 'flex-end',
    },
    yAxisLabel: {
        fontSize: 10,
        fontWeight: '500',
        textAlign: 'right',
        color: '#666',
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
    multiBarContainer: {
        position: 'relative',
        height: 200,
        width: '100%',
    },
    legendContainer: {
        flexDirection: 'row',
        justifyContent: 'center',
        marginTop: Spacing.md,
        flexWrap: 'wrap',
    },
    legendItem: {
        flexDirection: 'row',
        alignItems: 'center',
        marginHorizontal: Spacing.sm,
        marginVertical: Spacing.xs,
    },
    legendColor: {
        width: 12,
        height: 12,
        borderRadius: 6,
        marginRight: Spacing.xs,
    },
    legendText: {
        fontSize: 12,
        fontWeight: '500',
    },
});
