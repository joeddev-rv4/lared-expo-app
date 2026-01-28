import React, { useState } from "react";
import { View, StyleSheet, ScrollView, Pressable, Platform, useWindowDimensions } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useHeaderHeight } from "@react-navigation/elements";
import { Ionicons } from "@expo/vector-icons";

import { ThemedText } from "@/components/ThemedText";
import { DashboardMetricCard } from "@/components/dashboard/DashboardMetricCard";
import { WebChart } from "@/components/dashboard/WebChart";
import { DashboardBanner } from "@/components/dashboard/DashboardBanner";
import { DashboardProgressBar } from "@/components/dashboard/DashboardProgressBar";
import { useTheme } from "@/hooks/useTheme";
import { Spacing, BorderRadius, Colors, Shadows } from "@/constants/theme";

// Mock Data
const METRICS = {
    assigned: { value: 12, spark: [10, 15, 8, 12, 18, 14, 20] },
    clients: { value: 45, spark: [30, 35, 32, 40, 38, 42, 45] },
    views: { value: 1240, spark: [1000, 1100, 1050, 1200, 1180, 1220, 1240] },
};

const BRAND_BLUE = '#044bb8';

const CHART_DATA = {
    Month: Array.from({ length: 30 }, (_, i) => ({
        label: (i + 1).toString(),
        value: Math.floor(Math.random() * 60) + 20,
    })),
    Week: [
        { label: "Lun", value: 12 },
        { label: "Mar", value: 19 },
        { label: "Mié", value: 3 },
        { label: "Jue", value: 5 },
        { label: "Vie", value: 22 },
        { label: "Sáb", value: 30 },
        { label: "Dom", value: 15 },
    ]
};

const MESSAGES = [
    { id: '1', text: "¡Estás a solo 250 XP del siguiente nivel!", icon: "trending-up" as const, color: Colors.light.primary },
    { id: '2', text: "Has conseguido 3 nuevos clientes esta semana.", icon: "people" as const, color: "#10B981" },
    { id: '3', text: "Tu propiedad en Centro Histórico tiene +20 visitas.", icon: "eye" as const, color: "#8B5CF6" },
];

export default function AchievementsScreenWeb() {
    const { theme, isDark } = useTheme();
    const headerHeight = useHeaderHeight();
    const { width: windowWidth } = useWindowDimensions();
    const [timeRange, setTimeRange] = useState<"Month" | "Week">("Month");

    const isSmallWindow = windowWidth < 1024;
    const isMobileWeb = windowWidth < 768;

    const columnLeftWidth = isSmallWindow ? "35%" : "30%";
    const columnRightWidth = isSmallWindow ? "65%" : "70%";

    return (
        <View style={[styles.container, { backgroundColor: '#FFFFFF' }]}>
            <ScrollView
                contentContainerStyle={[
                    styles.scrollContent,
                    {
                        paddingTop: headerHeight,
                        paddingBottom: Spacing.xl,
                        paddingHorizontal: isMobileWeb ? Spacing.md : 90,
                    }
                ]}
                showsVerticalScrollIndicator={false}
            >

                <View style={styles.dashboardGrid}>

                    {/* Section 1: Header */}
                    <View style={[styles.gridRow, styles.headerRow]}>
                        {/* Left: Title */}
                        <View style={[styles.leftColumn, { width: columnLeftWidth }]}>
                            <ThemedText style={styles.pageTitle}>Mis Logros</ThemedText>
                            <ThemedText style={[styles.pageDescription, { color: theme.textSecondary }]}>
                                Aquí podrás ver tus avances en la Red Inmobiliaria.
                            </ThemedText>
                        </View>

                        {/* Vertical Divider */}
                        <View style={[styles.verticalDivider, { backgroundColor: theme.border }]} />

                        {/* Right: Controls */}
                        <View style={[styles.rightColumn, { width: columnRightWidth, alignItems: 'flex-end', justifyContent: 'center' }]}>
                            <View style={styles.controls}>
                                <View style={[styles.toggleContainer, { backgroundColor: theme.backgroundSecondary }]}>
                                    <Pressable onPress={() => setTimeRange("Month")} style={[styles.toggleBtn, timeRange === "Month" && styles.activeToggle]}>
                                        <ThemedText style={[styles.toggleText, timeRange === "Month" && styles.activeToggleText]}>Este mes</ThemedText>
                                    </Pressable>
                                    <Pressable onPress={() => setTimeRange("Week")} style={[styles.toggleBtn, timeRange === "Week" && styles.activeToggle]}>
                                        <ThemedText style={[styles.toggleText, timeRange === "Week" && styles.activeToggleText]}>Esta semana</ThemedText>
                                    </Pressable>
                                </View>
                                <Pressable style={styles.exportButton}>
                                    <ThemedText style={styles.exportButtonText}>Exportar</ThemedText>
                                </Pressable>
                            </View>
                        </View>
                    </View>

                    <View style={[styles.divider, { backgroundColor: theme.border }]} />

                    {/* Section 2: Performance */}
                    <View style={styles.gridRow}>
                        {/* Left: Metrics Stack */}
                        <View style={[styles.leftColumn, { width: columnLeftWidth }]}>
                            <ThemedText style={styles.sectionTitle}>Resumen</ThemedText>
                            <View style={styles.metricsStack}>
                                <DashboardMetricCard
                                    title="Propiedades Asignadas"
                                    value={METRICS.assigned.value}
                                    icon="home-outline"
                                    color={BRAND_BLUE}
                                    trend={{ value: 12, label: "vs mes ant.", positive: true }}
                                    noBackground
                                    sparklineData={METRICS.assigned.spark}
                                    sparklineType="bar"
                                />
                                <View style={[styles.innerDivider, { backgroundColor: theme.border }]} />
                                <DashboardMetricCard
                                    title="Clientes Obtenidos"
                                    value={METRICS.clients.value}
                                    icon="people-outline"
                                    color={BRAND_BLUE}
                                    trend={{ value: 5, label: "vs mes ant.", positive: true }}
                                    noBackground
                                    sparklineData={METRICS.clients.spark}
                                    sparklineType="area"
                                />
                                <View style={[styles.innerDivider, { backgroundColor: theme.border }]} />
                                <DashboardMetricCard
                                    title="Visitas Totales"
                                    value={METRICS.views.value.toLocaleString()}
                                    icon="eye-outline"
                                    color={BRAND_BLUE}
                                    trend={{ value: 2, label: "vs mes ant.", positive: false }}
                                    noBackground
                                    sparklineData={[METRICS.views.value, 2000]}
                                    sparklineType="donut"
                                />
                            </View>
                        </View>

                        {/* Vertical Divider */}
                        <View style={[styles.verticalDivider, { backgroundColor: theme.border }]} />

                        {/* Right: Chart Area */}
                        <View style={[styles.rightColumn, { width: columnRightWidth }]}>
                            <ThemedText style={styles.sectionTitle}>Gráfica de Actividad</ThemedText>
                            <View style={styles.chartWrapper}>
                                <WebChart
                                    max={100}
                                    data={CHART_DATA[timeRange]}
                                    color={BRAND_BLUE}
                                    height={300}
                                />
                            </View>
                        </View>
                    </View>

                    <View style={[styles.divider, { backgroundColor: theme.border }]} />

                    {/* Section 3: Gamification */}
                    <View style={styles.gridRow}>
                        {/* Left: Metas (Percentage bars) */}
                        <View style={[styles.leftColumn, { width: columnLeftWidth }]}>
                            <ThemedText style={styles.sectionTitle}>Metas</ThemedText>
                            <View style={styles.metasStack}>
                                <DashboardProgressBar label="Cierre de Tratos" current={3} target={5} color={BRAND_BLUE} />
                                <DashboardProgressBar label="Fidelización" current={85} target={100} color={BRAND_BLUE} />
                                <DashboardProgressBar label="Prospección" current={12} target={20} color={BRAND_BLUE} />
                            </View>
                        </View>

                        {/* Vertical Divider */}
                        <View style={[styles.verticalDivider, { backgroundColor: theme.border }]} />

                        {/* Right: Banners */}
                        <View style={[styles.rightColumn, { width: columnRightWidth, justifyContent: 'center' }]}>
                            <ThemedText style={styles.sectionTitle}>Analítico</ThemedText>
                            <DashboardBanner messages={MESSAGES} interval={2000} />
                        </View>
                    </View>

                </View>
            </ScrollView>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    scrollContent: {
        width: '100%',
        paddingHorizontal: 90, // Match ExploreScreen web padding
    },
    dashboardGrid: {
        overflow: 'hidden',
    },
    gridRow: {
        flexDirection: 'row',
        paddingVertical: Spacing.xl,
    },
    headerRow: {
        paddingVertical: Spacing.lg, // More compact header
    },
    leftColumn: {
        paddingRight: Spacing.xl,
        minWidth: 280,
    },
    rightColumn: {
        paddingLeft: Spacing.xl,
        flex: 1,
    },
    verticalDivider: {
        width: 1,
        alignSelf: 'stretch', // Ensure divider fills the row height
    },
    divider: {
        height: 1,
        width: '100%',
    },
    pageTitle: {
        fontSize: 22,
        fontWeight: '700',
        marginBottom: Spacing.xs,
    },
    pageDescription: {
        fontSize: 14,
        lineHeight: 20,
    },
    controls: {
        flexDirection: 'row',
        gap: Spacing.md,
        alignItems: 'center',
    },
    toggleContainer: {
        flexDirection: 'row',
        padding: 4,
        borderRadius: BorderRadius.md,
    },
    toggleBtn: {
        paddingVertical: 8,
        paddingHorizontal: 16,
        borderRadius: BorderRadius.sm,
    },
    activeToggle: {
        backgroundColor: Colors.light.backgroundRoot,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.1,
        shadowRadius: 2,
    },
    toggleText: {
        fontSize: 13,
        color: '#666',
    },
    activeToggleText: {
        fontWeight: '600',
        color: '#000',
    },
    exportButton: {
        backgroundColor: '#bf0a0a',
        paddingVertical: 10,
        paddingHorizontal: 20,
        borderRadius: BorderRadius.full,
    },
    exportButtonText: {
        color: '#FFF',
        fontWeight: '600',
        fontSize: 13,
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: '600',
        marginBottom: Spacing.xl,
    },
    metricsStack: {
        gap: 0, // No gap, using dividers instead
    },
    innerDivider: {
        height: 1,
        width: '100%',
        marginVertical: Spacing.sm,
    },
    chartWrapper: {
        flex: 1,
        minHeight: 300,
    },
    metasStack: {
        gap: Spacing.lg,
    },
});
