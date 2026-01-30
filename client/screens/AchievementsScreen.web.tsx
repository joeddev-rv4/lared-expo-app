import React, { useState, useEffect } from "react";
import { View, StyleSheet, ScrollView, Pressable, Platform, useWindowDimensions } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useHeaderHeight } from "@react-navigation/elements";
import { Ionicons } from "@expo/vector-icons";

import { ThemedText } from "@/components/ThemedText";
import { DashboardMetricCard } from "@/components/dashboard/DashboardMetricCard";
import { WebChart } from "@/components/dashboard/WebChart";
import { DashboardBanner } from "@/components/dashboard/DashboardBanner";
import { getPortfolioProperties } from "@/lib/portfolioService";
import { DashboardProgressBar } from "@/components/dashboard/DashboardProgressBar";
import { useTheme } from "@/hooks/useTheme";
import { useAuth } from "@/contexts/AuthContext";
import { Spacing, BorderRadius, Colors, Shadows } from "@/constants/theme";

// Mock Data
const METRICS = {
    assigned: { value: 12, spark: [10, 15, 8, 12, 18, 14, 20] },
    clients: { value: 45, spark: [30, 35, 32, 40, 38, 42, 45] },
    views: { value: 1240, spark: [1000, 1100, 1050, 1200, 1180, 1220, 1240] },
};

const BRAND_BLUE = '#044bb8';

const TIPS_DE_VENTA = [
    "Enfócate en el beneficio principal: No hables solo de lo que es tu producto, sino de cómo mejora la vida del cliente o le resuelve un problema concreto.",
    "Usa un llamado a la acción directo y visible: Frases como 'Compra ahora', 'Cotiza hoy' o 'Contáctanos' guían al cliente y aumentan la conversión.",
    "Mantén el mensaje claro y fácil de entender: El usuario debe captar la idea principal en pocos segundos, sin leer demasiado.",
    "Aprovecha el poder de la urgencia: Mensajes como 'Por tiempo limitado' o 'Últimas unidades disponibles' motivan a decidir más rápido.",
    "Resalta promociones u ofertas especiales: Descuentos, combos o beneficios exclusivos llaman la atención y aumentan el interés inmediato.",
    "Usa números para generar impacto: Porcentajes, precios o cantidades concretas hacen el mensaje más creíble y atractivo.",
    "Incluye confianza o prueba social: Frases como 'Clientes satisfechos' o 'Más de 1,000 ventas' ayudan a reducir dudas.",
    "Utiliza colores estratégicos: El texto y los botones deben contrastar con el fondo para dirigir la vista hacia lo más importante.",
    "Adapta el mensaje a tu público objetivo: No es lo mismo vender a jóvenes, empresas o familias; el lenguaje debe conectar con quien lo ve.",
    "Destaca qué te hace diferente: Muestra en una frase por qué tu producto o servicio es mejor que la competencia."
];

const MESSAGES = [
    { id: '1', text: "¡Sigue así! Tu esfuerzo está dando frutos.", icon: "thumbs-up" as const, color: Colors.light.primary },
    { id: '2', text: "No pares de compartir y ganar", icon: "share" as const, color: "#10B981" },
    { id: '3', text: "Gana Q750 por cada referido", icon: "cash" as const, color: "#8B5CF6" },
];

const OTHER_MESSAGES = [
    { id: '4', text: "Estás a solo un click de ganar Q750", icon: "finger-print" as const, color: "#F59E0B" },
    { id: '5', text: "Consigue clientes desde tu teléfono", icon: "phone-portrait" as const, color: "#EF4444" },
    { id: '6', text: "Comparte en tus redes sociales y gana", icon: "ellipsis-horizontal" as const, color: "#8B5CF6" },
];

export default function AchievementsScreenWeb() {
    const { theme, isDark } = useTheme();
    const { user } = useAuth();
    const headerHeight = useHeaderHeight();
    const { width: windowWidth } = useWindowDimensions();
    const [timeRange, setTimeRange] = useState<"Month" | "Week">("Month");
    const [metrics, setMetrics] = useState({
        ganancias: { value: 0, spark: [0, 0, 0, 0, 0, 0, 0] },
        gananciasTotales: { value: 0, spark: [0, 0, 0, 0, 0, 0, 0] },
        propiedades: { value: 0, spark: [0, 0, 0, 0, 0, 0, 0] },
        clientes: { value: 0, spark: [0, 0, 0, 0, 0, 0, 0] },
    });
    const [chartData, setChartData] = useState({
        Month: [] as { label: string; values: number[] }[],
        Week: [] as { label: string; values: number[] }[],
    });

    const today = new Date().getDate();
    const tipIndex = today % TIPS_DE_VENTA.length;
    const selectedTip = TIPS_DE_VENTA[tipIndex];
    const TIPS_MESSAGES = [
        { id: 'tip', text: selectedTip, icon: "bulb" as const, color: "#F59E0B" }
    ];

    // Responsive sizes for banner
    const bannerFontSizeTitle = windowWidth < 768 ? 12 : 14;
    const bannerFontSizeText = windowWidth < 768 ? 10 : 12;
    const bannerIconSize = windowWidth < 768 ? 24 : 32;

    // Calculate chart data based on metrics
    // Moved to useEffect

    const chartDataGanancias = {
        Month: [
            { label: "Ganancias estimadas", values: [metrics.ganancias.value] },
        ],
        Week: [
            { label: "Ganancias estimadas", values: [metrics.ganancias.value] },
        ]
    };

    useEffect(() => {
        const fetchMetrics = async () => {
            if (!user?.id) return;

            try {
                // Fetch leads
                const leadsResponse = await fetch(`${process.env.EXPO_PUBLIC_API_URL}/lead/user/${user.id}`, {
                    headers: {
                        'ngrok-skip-browser-warning': 'true',
                    },
                });
                const leads = await leadsResponse.json();
                const totalLeads = Array.isArray(leads) ? leads.length : 0;

                // Fetch count status 11
                const status11Response = await fetch(`${process.env.EXPO_PUBLIC_API_URL}/lead/count-status-11/${user.id}`, {
                    headers: {
                        'ngrok-skip-browser-warning': 'true',
                    },
                });
                const countStatus11 = await status11Response.json();

                // Fetch favorites from Firebase
                const portfolioPropertyIds = await getPortfolioProperties(user.id);
                const totalFavorites = portfolioPropertyIds.length;

                // Parse selected month - fixed to January 2026
                const year = 2026;
                const month = 1;
                const monthIndex = month - 1;
                const daysInMonth = new Date(year, month, 0).getDate();

                // Group leads by day
                const leadsByDay: { [key: number]: number } = {};
                if (Array.isArray(leads)) {
                    leads.forEach(lead => {
                        const date = new Date(lead.createdAt || lead.created_at || lead.date);
                        if (date.getMonth() === monthIndex && date.getFullYear() === year) {
                            const day = date.getDate();
                            leadsByDay[day] = (leadsByDay[day] || 0) + 1;
                        }
                    });
                }

                // Calculate metrics
                const gananciasValue = totalLeads * 750;
                const gananciasTotalesValue = countStatus11 * 750;
                const propiedadesValue = totalFavorites;
                const clientesValue = totalLeads;

                // Mock sparkline data (you can make this dynamic if needed)
                const sparkGanancias = [gananciasValue * 0.7, gananciasValue * 0.8, gananciasValue * 0.75, gananciasValue * 0.9, gananciasValue * 0.85, gananciasValue * 0.95, gananciasValue];
                const sparkGananciasTotales = [gananciasTotalesValue * 0.7, gananciasTotalesValue * 0.8, gananciasTotalesValue * 0.75, gananciasTotalesValue * 0.9, gananciasTotalesValue * 0.85, gananciasTotalesValue * 0.95, gananciasTotalesValue];
                const sparkPropiedades = [propiedadesValue * 0.6, propiedadesValue * 0.7, propiedadesValue * 0.65, propiedadesValue * 0.8, propiedadesValue * 0.75, propiedadesValue * 0.9, propiedadesValue];
                const sparkClientes = [clientesValue * 0.5, clientesValue * 0.6, clientesValue * 0.55, clientesValue * 0.7, clientesValue * 0.65, clientesValue * 0.8, clientesValue];

                setMetrics({
                    ganancias: { value: gananciasValue, spark: sparkGanancias },
                    gananciasTotales: { value: gananciasTotalesValue, spark: sparkGananciasTotales },
                    propiedades: { value: propiedadesValue, spark: sparkPropiedades },
                    clientes: { value: clientesValue, spark: sparkClientes },
                });

                // Set chart data with daily leads
                const chartData = {
                    Month: Array.from({ length: daysInMonth }, (_, i) => {
                        const day = i + 1;
                        const value = leadsByDay[day] || 0;
                        return { label: `Día ${day}`, values: [value] };
                    }),
                    Week: Array.from({ length: daysInMonth }, (_, i) => {
                        const day = i + 1;
                        const value = leadsByDay[day] || 0;
                        return { label: `Día ${day}`, values: [value] };
                    })
                };
                setChartData(chartData);
            } catch (error) {
                console.error('Error fetching metrics:', error);
            }
        };

        fetchMetrics();
    }, [user?.id]);

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
                    <View style={[styles.gridRow, styles.headerRow, isMobileWeb && styles.gridRowMobile]}>
                        {/* Left: Title */}
                        <View style={[styles.leftColumn, !isMobileWeb && { width: columnLeftWidth }, isMobileWeb && styles.leftColumnMobile]}>
                            <ThemedText style={[styles.pageTitle, { textAlign: 'center' }]}>Mis Logros</ThemedText>
                            <ThemedText style={[styles.pageDescription, { color: theme.textSecondary, textAlign: 'center' }]}>
                                Aquí podrás ver tus avances en la Red Inmobiliaria.
                            </ThemedText>
                        </View>

                        {/* Vertical Divider - hidden on mobile */}
                        {!isMobileWeb ? <View style={[styles.verticalDivider, { backgroundColor: theme.border }]} /> : null}

                        {/* Right: Controls */}
                        <View style={[styles.rightColumn, { width: columnRightWidth, alignItems: 'flex-end', justifyContent: 'center' }]}>
                            <View style={styles.controls}>
                                <View style={[styles.toggleContainer, { backgroundColor: theme.backgroundSecondary, ...(isMobileWeb && { marginLeft: 50 }) }]}>
                                    <Pressable onPress={() => setTimeRange("Month")} style={[styles.toggleBtn, timeRange === "Month" && styles.activeToggle]}>
                                        <ThemedText style={[styles.toggleText, timeRange === "Month" && styles.activeToggleText]}>Este mes</ThemedText>
                                    </Pressable>
                                    <Pressable onPress={() => setTimeRange("Week")} style={[styles.toggleBtn, timeRange === "Week" && styles.activeToggle]}>
                                        <ThemedText style={[styles.toggleText, timeRange === "Week" && styles.activeToggleText]}>Esta semana</ThemedText>
                                    </Pressable>
                                </View>
                            </View>
                        </View>
                    </View>

                    <View style={[styles.divider, { backgroundColor: theme.border }]} />

                    {/* Section 2: Performance */}
                    <View style={[styles.gridRow, isMobileWeb && styles.gridRowMobile]}>
                        {/* Left: Metrics Stack */}
                        <View style={[styles.leftColumn, { width: '100%', alignItems: 'center' }, isMobileWeb && styles.leftColumnMobile]}>
                            <ThemedText style={[styles.sectionTitle, { textAlign: 'center' }]}>Resumen</ThemedText>
                            <View style={[styles.metricsStack, { flexDirection: isMobileWeb ? 'column' : 'row', gap: isMobileWeb ? Spacing.md : 0, alignItems: 'center', flexWrap: isMobileWeb ? 'nowrap' : 'wrap' }]}>
                                <DashboardMetricCard
                                    title="Ganancias Estimadas"
                                    value={metrics.ganancias.value}
                                    icon="cash-outline"
                                    color={BRAND_BLUE}
                                    noBackground
                                    style={{ marginHorizontal: 10 }}
                                />
                                {!isMobileWeb && <View style={[styles.separator, { marginHorizontal: 5 }]} />}
                                <DashboardMetricCard
                                    title="Propiedades Asignadas"
                                    value={metrics.propiedades.value}
                                    icon="home-outline"
                                    color={BRAND_BLUE}
                                    noBackground
                                    style={{ marginHorizontal: 10 }}
                                />
                                {!isMobileWeb && <View style={styles.separator} />}
                                <DashboardMetricCard
                                    title="Clientes Obtenidos"
                                    value={metrics.clientes.value}
                                    icon="person-outline"
                                    color={BRAND_BLUE}
                                    noBackground
                                    style={{ marginHorizontal: 10 }}
                                />
                                {!isMobileWeb && <View style={styles.separator} />}
                                <DashboardMetricCard
                                    title="Ganancias Totales"
                                    value={metrics.gananciasTotales.value}
                                    icon="cash-outline"
                                    color={BRAND_BLUE}
                                    noBackground
                                    style={{ marginHorizontal: 10 }}
                                />
                            </View>
                        </View>
                    </View>

                    <View style={[styles.divider, { backgroundColor: theme.border }]} />

                    {/* Section: Mensajes Motivacionales */}
                    <View style={[styles.gridRow, isMobileWeb && styles.gridRowMobile]}>
                        <View style={[styles.leftColumn, { width: '100%', alignItems: 'center' }, isMobileWeb && styles.leftColumnMobile]}>
                            <ThemedText style={[styles.sectionTitle, { textAlign: 'center' }]}>Tips De Venta</ThemedText>
                            <View style={{ flexDirection: 'row', gap: Spacing.md, justifyContent: 'center' }}>
                                <DashboardBanner 
                                    messages={TIPS_MESSAGES} 
                                    interval={3000} 
                                    fontSizeTitle={bannerFontSizeTitle} 
                                    fontSizeText={bannerFontSizeText} 
                                    iconSize={bannerIconSize} 
                                />
                            </View>
                        </View>
                    </View>
                    <View style={[{ display: 'none' }, styles.gridRow, isMobileWeb && styles.gridRowMobile]}>
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
        paddingHorizontal: 0,
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
        fontSize: 30,
        fontWeight: '700',
        marginBottom: Spacing.xs,
    },
    pageDescription: {
        fontSize: 16,
        lineHeight: 22,
    },
    controls: {
        flexDirection: 'row',
        gap: Spacing.md,
        alignItems: 'center',
    },
    toggleContainer: {
        flexDirection: 'row',
        justifyContent: 'center',
        padding: 4,
        borderRadius: BorderRadius.md,
        width: '100%',
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
        fontSize: 28,
        fontWeight: '600',
        marginBottom: Spacing.xl,
    },
    subSectionTitle: {
        fontSize: 14,
        fontWeight: '500',
        marginBottom: Spacing.md,
        marginTop: Spacing.lg,
    },
    chartSpacer: {
        height: Spacing.lg,
    },
    metricsStack: {
        gap: 0, // No gap, using dividers instead
    },
    separator: {
        height: 120,
        width: 2,
        backgroundColor: '#000',
        marginHorizontal: Spacing.md,
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
    gridRowMobile: {
        flexDirection: 'column',
    },
    leftColumnMobile: {
        width: '100%',
        paddingRight: 0,
        minWidth: 0,
        marginBottom: Spacing.lg,
    },
    rightColumnMobile: {
        width: '100%',
        paddingLeft: 0,
    },
    controlsMobile: {
        flexDirection: 'column',
        gap: Spacing.sm,
        width: '100%',
        alignItems: 'stretch',
    },
});
