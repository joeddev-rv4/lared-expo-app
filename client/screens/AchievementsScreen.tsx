import React from "react";
import { View, StyleSheet, FlatList, Platform } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useHeaderHeight } from "@react-navigation/elements";
import { useBottomTabBarHeight } from "@react-navigation/bottom-tabs";
import { useNavigation } from "@react-navigation/native";
import { Ionicons } from "@expo/vector-icons";

const isWeb = Platform.OS === "web";

import { ThemedText } from "@/components/ThemedText";
import { EmptyState } from "@/components/EmptyState";
import { useTheme } from "@/hooks/useTheme";
import { useAuth } from "@/contexts/AuthContext";
import { auth } from "@/lib/config";
import { Spacing, BorderRadius, Colors } from "@/constants/theme";

interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: keyof typeof Ionicons.glyphMap;
  progress: number;
  total: number;
  unlocked: boolean;
}

const ACHIEVEMENTS: Achievement[] = [
  {
    id: "1",
    title: "First Steps",
    description: "Create your first listing",
    icon: "home",
    progress: 0,
    total: 1,
    unlocked: false,
  },
  {
    id: "2",
    title: "Explorer",
    description: "Save 5 properties to favorites",
    icon: "heart",
    progress: 2,
    total: 5,
    unlocked: false,
  },
  {
    id: "3",
    title: "Super Host",
    description: "Get 10 bookings on your listings",
    icon: "star",
    progress: 0,
    total: 10,
    unlocked: false,
  },
  {
    id: "4",
    title: "Globetrotter",
    description: "Book properties in 5 different cities",
    icon: "globe",
    progress: 1,
    total: 5,
    unlocked: false,
  },
  {
    id: "5",
    title: "Reviewer",
    description: "Leave 3 reviews",
    icon: "chatbox-outline",
    progress: 0,
    total: 3,
    unlocked: false,
  },
];

export default function AchievementsScreen() {
  const insets = useSafeAreaInsets();
  const headerHeight = useHeaderHeight();
  const tabBarHeight = isWeb ? 0 : useBottomTabBarHeight();
  const { theme } = useTheme();
  const { user, isGuest } = useAuth();
  const navigation = useNavigation<any>();

  const userId = user?.id || auth.currentUser?.uid;
  const unlockedCount = ACHIEVEMENTS.filter((a) => a.unlocked).length;

  const handleNavigateToSignup = () => {
    navigation.getParent()?.getParent()?.reset({
      index: 0,
      routes: [{ name: "Login" }],
    });
  };

  // Show login message for guest users
  if (isGuest || !userId) {
    return (
      <View style={[styles.container, { backgroundColor: theme.backgroundRoot }]}>
        <View style={[styles.guestContainer, { paddingTop: headerHeight + Spacing.xl }]}>
          <EmptyState
            image={require("../../assets/images/empty-states/favorites.png")}
            title="Inicia sesión"
            description="Inicia sesión para ver y gestionar tus logros."
            actionLabel="Crear cuenta"
            onAction={handleNavigateToSignup}
          />
        </View>
      </View>
    );
  }

  const renderAchievement = ({ item }: { item: Achievement }) => {
    const progressPercent = (item.progress / item.total) * 100;

    return (
      <View
        style={[
          styles.achievementCard,
          {
            backgroundColor: item.unlocked
              ? Colors.light.primary + "10"
              : theme.backgroundDefault,
            borderColor: item.unlocked ? Colors.light.primary : theme.border,
          },
        ]}
      >
        <View
          style={[
            styles.iconContainer,
            {
              backgroundColor: item.unlocked
                ? Colors.light.primary
                : theme.backgroundSecondary,
            },
          ]}
        >
          <Ionicons
            name={item.icon}
            size={24}
            color={item.unlocked ? "#FFFFFF" : theme.textSecondary}
          />
        </View>

        <View style={styles.achievementContent}>
          <ThemedText style={styles.achievementTitle}>{item.title}</ThemedText>
          <ThemedText
            style={[styles.achievementDescription, { color: theme.textSecondary }]}
          >
            {item.description}
          </ThemedText>

          <View style={styles.progressContainer}>
            <View
              style={[
                styles.progressBar,
                { backgroundColor: theme.backgroundSecondary },
              ]}
            >
              <View
                style={[
                  styles.progressFill,
                  {
                    width: `${progressPercent}%`,
                    backgroundColor: item.unlocked
                      ? Colors.light.success
                      : Colors.light.primary,
                  },
                ]}
              />
            </View>
            <ThemedText
              style={[styles.progressText, { color: theme.textSecondary }]}
            >
              {item.progress}/{item.total}
            </ThemedText>
          </View>
        </View>

        {item.unlocked ? (
          <View style={styles.unlockedBadge}>
            <Ionicons name="checkmark-circle-outline" size={24} color={Colors.light.success} />
          </View>
        ) : null}
      </View>
    );
  };

  const renderHeader = () => (
    <View style={styles.header}>
      <View
        style={[
          styles.statsCard,
          { backgroundColor: Colors.light.primary + "10" },
        ]}
      >
        <Ionicons name="trophy-outline" size={32} color={Colors.light.primary} />
        <View style={styles.statsText}>
          <ThemedText style={styles.statsValue}>
            {unlockedCount}/{ACHIEVEMENTS.length}
          </ThemedText>
          <ThemedText style={[styles.statsLabel, { color: theme.textSecondary }]}>
            Achievements Unlocked
          </ThemedText>
        </View>
      </View>
    </View>
  );

  return (
    <View style={[styles.container, { backgroundColor: theme.backgroundRoot }]}>
      <FlatList
        data={ACHIEVEMENTS}
        keyExtractor={(item) => item.id}
        renderItem={renderAchievement}
        contentContainerStyle={[
          styles.listContent,
          {
            paddingTop: headerHeight + Spacing.xl,
            paddingBottom: tabBarHeight + Spacing.xl,
          },
        ]}
        scrollIndicatorInsets={{ bottom: insets.bottom }}
        ListHeaderComponent={renderHeader}
        showsVerticalScrollIndicator={false}
      />
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
  listContent: {
    paddingHorizontal: Spacing.lg,
  },
  header: {
    marginBottom: Spacing.xl,
  },
  statsCard: {
    flexDirection: "row",
    alignItems: "center",
    padding: Spacing.xl,
    borderRadius: BorderRadius.md,
    gap: Spacing.lg,
  },
  statsText: {
    flex: 1,
  },
  statsValue: {
    fontSize: 28,
    fontWeight: "700",
  },
  statsLabel: {
    fontSize: 14,
  },
  achievementCard: {
    flexDirection: "row",
    padding: Spacing.lg,
    borderRadius: BorderRadius.md,
    marginBottom: Spacing.md,
    borderWidth: 1,
    alignItems: "center",
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: "center",
    justifyContent: "center",
    marginRight: Spacing.lg,
  },
  achievementContent: {
    flex: 1,
  },
  achievementTitle: {
    fontSize: 16,
    fontWeight: "600",
    marginBottom: Spacing.xs,
  },
  achievementDescription: {
    fontSize: 14,
    marginBottom: Spacing.sm,
  },
  progressContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.sm,
  },
  progressBar: {
    flex: 1,
    height: 6,
    borderRadius: 3,
    overflow: "hidden",
  },
  progressFill: {
    height: "100%",
    borderRadius: 3,
  },
  progressText: {
    fontSize: 12,
    fontWeight: "500",
    minWidth: 32,
  },
  unlockedBadge: {
    marginLeft: Spacing.md,
  },
});
