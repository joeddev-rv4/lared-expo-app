import React, { useState, useEffect } from "react";
import {
  View,
  StyleSheet,
  ScrollView,
  Platform,
  Pressable,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useHeaderHeight } from "@react-navigation/elements";
import { useBottomTabBarHeight } from "@react-navigation/bottom-tabs";
import { useNavigation } from "@react-navigation/native";
import { Ionicons } from "@expo/vector-icons";

import { ThemedText } from "@/components/ThemedText";
import { EmptyState } from "@/components/EmptyState";
import { DashboardMetricCard } from "@/components/dashboard/DashboardMetricCard";
import { ActivityChart } from "@/components/dashboard/ActivityChart";
import { BadgeComponent } from "@/components/dashboard/BadgeComponent";
import { useTheme } from "@/hooks/useTheme";
import { useAuth } from "@/contexts/AuthContext";
import { auth } from "@/lib/config";
import { getPortfolioProperties } from "@/lib/portfolioService";
import { Spacing, BorderRadius, Colors, Shadows } from "@/constants/theme";

const isWeb = Platform.OS === "web";

// Mock Data
const USER_LEVEL = {
  current: 4,
  title: "Broker Experto",
  xp: 750,
  nextLevelXp: 1000,
  nextTitle: "Broker Maestro",
};

const METRICS = {
  properties: 12,
  clients: 45,
  views: 1240,
};

const ACTIVITY_DATA = [
  { label: "Lun", value: 12 },
  { label: "Mar", value: 19 },
  { label: "Mié", value: 3 },
  { label: "Jue", value: 5 },
  { label: "Vie", value: 22 },
  { label: "Sáb", value: 30 },
  { label: "Dom", value: 15 },
];

const BADGES = [
  {
    id: "1",
    name: "Primera Venta",
    icon: "pricetag" as const,
    variant: "bronze" as const,
    isLocked: false,
  },
  {
    id: "2",
    name: "Top Valorado",
    icon: "star" as const,
    variant: "gold" as const,
    isLocked: false,
  },
  {
    id: "3",
    name: "Veloz",
    icon: "flash" as const,
    variant: "silver" as const,
    isLocked: false,
  },
  {
    id: "4",
    name: "Cerrador",
    icon: "checkmark-done-circle" as const,
    variant: "gold" as const,
    isLocked: true,
  },
  {
    id: "5",
    name: "Influencer",
    icon: "people" as const,
    variant: "silver" as const,
    isLocked: true,
  },
];

const DAILY_GOAL = "Contactar 3 nuevos clientes";

export default function AchievementsScreen() {
  const insets = useSafeAreaInsets();
  const headerHeight = useHeaderHeight();
  const tabBarHeight = isWeb ? 0 : useBottomTabBarHeight();
  const { theme, isDark } = useTheme();
  const { user, isGuest } = useAuth();
  const navigation = useNavigation<any>();
  const [timeRange, setTimeRange] = useState<"Día" | "Semana" | "Mes">(
    "Semana",
  );
  const [metrics, setMetrics] = useState({
    ganancias: 0,
    propiedades: 0,
    clientes: 0,
  });

  const userId = user?.id || auth.currentUser?.uid;

  useEffect(() => {
    const fetchMetrics = async () => {
      if (!userId) return;

      try {
        // Fetch leads
        const leadsResponse = await fetch(
          `${process.env.EXPO_PUBLIC_API_URL}/lead/user/${userId}`,
          {
            headers: {
              "ngrok-skip-browser-warning": "true",
            },
          },
        );
        const leads = await leadsResponse.json();
        const totalLeads = Array.isArray(leads) ? leads.length : 0;

        // Fetch favorites from Firebase
        const portfolioPropertyIds = await getPortfolioProperties(userId);
        const totalFavorites = portfolioPropertyIds.length;

        // Calculate metrics
        const gananciasValue = totalLeads * 750;
        const propiedadesValue = totalFavorites;
        const clientesValue = totalLeads;

        setMetrics({
          ganancias: gananciasValue,
          propiedades: propiedadesValue,
          clientes: clientesValue,
        });
      } catch (error) {
        console.error("Error fetching metrics:", error);
      }
    };

    fetchMetrics();
  }, [userId]);

  const handleNavigateToSignup = () => {
    navigation
      .getParent()
      ?.getParent()
      ?.reset({
        index: 0,
        routes: [{ name: "Login" }],
      });
  };

  if (isGuest || !userId) {
    return (
      <View
        style={[styles.container, { backgroundColor: theme.backgroundRoot }]}
      >
        <View
          style={[
            styles.guestContainer,
            { paddingTop: headerHeight + Spacing.xl },
          ]}
        >
          <EmptyState
            image={require("../../assets/images/empty-states/favorites.png")}
            title="Inicia sesión"
            description="Inicia sesión para ver tu panel de logros y estadísticas."
            actionLabel="Crear cuenta"
            onAction={handleNavigateToSignup}
          />
        </View>
      </View>
    );
  }

  const renderHeader = () => {
    const progress = (USER_LEVEL.xp / USER_LEVEL.nextLevelXp) * 100;

    return (
      <View
        style={[
          styles.headerCard,
          isDark ? null : Shadows.card,
          { backgroundColor: Colors.light.primary },
        ]}
      >
        <View style={styles.headerTop}>
          <View>
            <ThemedText style={styles.userTitle}>{USER_LEVEL.title}</ThemedText>
            <ThemedText style={styles.levelText}>
              Nivel {USER_LEVEL.current}
            </ThemedText>
          </View>
          <View style={styles.medalIcon}>
            <Ionicons name="ribbon" size={40} color="#FFD700" />
          </View>
        </View>

        <View style={styles.xpContainer}>
          <View style={styles.xpBarBg}>
            <View style={[styles.xpBarFill, { width: `${progress}%` }]} />
          </View>
          <View style={styles.xpTextRow}>
            <ThemedText style={styles.xpText}>{USER_LEVEL.xp} XP</ThemedText>
            <ThemedText style={styles.xpText}>
              {USER_LEVEL.nextLevelXp} XP
            </ThemedText>
          </View>
          <ThemedText style={styles.nextLevelText}>
            {USER_LEVEL.nextLevelXp - USER_LEVEL.xp} XP para{" "}
            {USER_LEVEL.nextTitle}
          </ThemedText>
        </View>
      </View>
    );
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.backgroundRoot }]}>
      <ScrollView
        contentContainerStyle={[
          styles.scrollContent,
          {
            paddingTop: headerHeight + Spacing.lg,
            paddingBottom: tabBarHeight + Spacing.xl,
          },
        ]}
        showsVerticalScrollIndicator={false}
      >
        {renderHeader()}

        <View style={styles.section}>
          <ThemedText style={styles.sectionTitle}>Resumen</ThemedText>
          <View style={styles.metricsGrid}>
            <DashboardMetricCard
              title="Ganancias Estimadas"
              value={metrics.ganancias.toString()}
              icon="cash-outline"
              color="#3B82F6"
            />
            <DashboardMetricCard
              title="Propiedades Asignadas"
              value={metrics.propiedades.toString()}
              icon="cash-outline"
              color="#10B981"
            />
          </View>
          <View style={[styles.metricsGrid, { marginTop: Spacing.md }]}>
            <DashboardMetricCard
              title="Clientes Obtenidos"
              value={metrics.clientes.toString()}
              icon="cash-outline"
              color="#8B5CF6"
            />
          </View>
        </View>

        <View style={styles.section}>
          <View style={styles.sectionHeaderRow}>
            <ThemedText style={styles.sectionTitle}>
              Pulso de Actividad
            </ThemedText>
            <View style={styles.toggleContainer}>
              {(["Día", "Semana", "Mes"] as const).map((t) => (
                <Pressable
                  key={t}
                  onPress={() => setTimeRange(t)}
                  style={[
                    styles.toggleButton,
                    timeRange === t && {
                      backgroundColor: theme.backgroundSecondary,
                    },
                  ]}
                >
                  <ThemedText
                    style={[
                      styles.toggleText,
                      timeRange === t && {
                        fontWeight: "600",
                        color: Colors.light.primary,
                      },
                    ]}
                  >
                    {t}
                  </ThemedText>
                </Pressable>
              ))}
            </View>
          </View>
          <ActivityChart
            title="Propiedades Añadidas"
            data={ACTIVITY_DATA}
            color="#bf0a0a"
          />
        </View>

        <View style={styles.section}>
          <ThemedText style={styles.sectionTitle}>Insignias y Metas</ThemedText>

          <View
            style={[
              styles.goalCard,
              {
                backgroundColor: theme.backgroundDefault,
                borderColor: theme.border,
              },
            ]}
          >
            <View style={styles.goalIcon}>
              <Ionicons name="flag" size={24} color={Colors.light.primary} />
            </View>
            <View style={styles.goalContent}>
              <ThemedText style={styles.goalTitle}>Meta Diaria</ThemedText>
              <ThemedText
                style={[styles.goalText, { color: theme.textSecondary }]}
              >
                {DAILY_GOAL}
              </ThemedText>
            </View>
            <Ionicons
              name="chevron-forward"
              size={20}
              color={theme.textSecondary}
            />
          </View>

          <View style={styles.badgesGrid}>
            {BADGES.map((badge) => (
              <BadgeComponent key={badge.id} {...badge} />
            ))}
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
  guestContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: Spacing.lg,
  },
  scrollContent: {
    paddingHorizontal: Spacing.lg,
  },
  headerCard: {
    padding: Spacing.lg,
    borderRadius: BorderRadius.lg,
    marginBottom: Spacing.xl,
  },
  headerTop: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: Spacing.lg,
  },
  userTitle: {
    fontSize: 24,
    fontWeight: "700",
    color: "#FFFFFF",
  },
  levelText: {
    fontSize: 16,
    color: "rgba(255,255,255,0.9)",
    marginTop: 4,
  },
  medalIcon: {
    backgroundColor: "rgba(255,255,255,0.2)",
    padding: 8,
    borderRadius: 12,
  },
  xpContainer: {
    gap: 8,
  },
  xpBarBg: {
    height: 8,
    backgroundColor: "rgba(0,0,0,0.2)",
    borderRadius: 4,
    overflow: "hidden",
  },
  xpBarFill: {
    height: "100%",
    backgroundColor: "#FFFFFF",
    borderRadius: 4,
  },
  xpTextRow: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  xpText: {
    fontSize: 12,
    color: "rgba(255,255,255,0.8)",
    fontWeight: "600",
  },
  nextLevelText: {
    fontSize: 12,
    color: "rgba(255,255,255,0.9)",
    textAlign: "center",
    marginTop: 4,
  },
  section: {
    marginBottom: Spacing.xl,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "700",
    marginBottom: Spacing.md,
  },
  metricsGrid: {
    flexDirection: "row",
    gap: Spacing.md,
  },
  sectionHeaderRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: Spacing.md,
  },
  toggleContainer: {
    flexDirection: "row",
    gap: Spacing.xs,
  },
  toggleButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  toggleText: {
    fontSize: 12,
  },
  goalCard: {
    flexDirection: "row",
    alignItems: "center",
    padding: Spacing.md,
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    marginBottom: Spacing.lg,
  },
  goalIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Colors.light.primary + "15",
    alignItems: "center",
    justifyContent: "center",
    marginRight: Spacing.md,
  },
  goalContent: {
    flex: 1,
  },
  goalTitle: {
    fontSize: 14,
    fontWeight: "600",
  },
  goalText: {
    fontSize: 14,
  },
  badgesGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: Spacing.lg,
    justifyContent: "flex-start", // Or 'space-between' depending on preference
  },
});
