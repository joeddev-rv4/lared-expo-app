import React, { useMemo } from "react";
import { View, StyleSheet, LayoutChangeEvent, Platform } from "react-native";
import { ThemedText } from "@/components/ThemedText";
import { useTheme } from "@/hooks/useTheme";
import { Spacing, BorderRadius, Colors } from "@/constants/theme";

interface DataPoint {
  label: string;
  value: number;
}

interface ActivityChartProps {
  data: DataPoint[];
  height?: number;
  color?: string;
  title: string;
}

export const ActivityChart = ({
  data,
  height = 160,
  color = Colors.light.primary,
  title,
}: ActivityChartProps) => {
  const { theme } = useTheme();

  const maxValue = useMemo(() => {
    return Math.max(...data.map((d) => d.value), 10); // Ensure at least 10 for scaling
  }, [data]);

  return (
    <View
      style={[styles.container, { backgroundColor: theme.backgroundDefault }]}
    >
      <View style={styles.header}>
        <ThemedText style={styles.title}>{title}</ThemedText>
      </View>

      <View style={[styles.chartContainer, { height }]}>
        {data.map((point, index) => {
          const percentage = (point.value / maxValue) * 100;
          return (
            <View key={index} style={styles.barColumn}>
              <View style={styles.barArea}>
                <View
                  style={[
                    styles.bar,
                    {
                      height: `${percentage}%`,
                      backgroundColor: color,
                      opacity: percentage === 0 ? 0.1 : 0.8,
                    },
                  ]}
                />
              </View>
              <ThemedText
                style={[styles.label, { color: theme.textSecondary }]}
              >
                {point.label}
              </ThemedText>
            </View>
          );
        })}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: Spacing.md,
    borderRadius: BorderRadius.lg,
  },
  header: {
    marginBottom: Spacing.lg,
  },
  title: {
    fontSize: 16,
    fontWeight: "600",
  },
  chartContainer: {
    flexDirection: "row",
    alignItems: "flex-end",
    justifyContent: "space-between",
    gap: Spacing.xs,
  },
  barColumn: {
    flex: 1,
    alignItems: "center",
    gap: Spacing.xs,
  },
  barArea: {
    flex: 1,
    width: "100%",
    justifyContent: "flex-end",
    alignItems: "center",
    borderRadius: BorderRadius.sm,
    backgroundColor: "rgba(0,0,0,0.02)",
  },
  bar: {
    width: "60%",
    minHeight: 4,
    borderTopLeftRadius: 4,
    borderTopRightRadius: 4,
    borderBottomLeftRadius: 2,
    borderBottomRightRadius: 2,
  },
  label: {
    fontSize: 10,
    marginTop: 4,
  },
});
