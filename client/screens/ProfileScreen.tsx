import React, { useState, useEffect, useCallback } from "react";
import {
  View,
  StyleSheet,
  Pressable,
  Image,
  ScrollView,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useHeaderHeight } from "@react-navigation/elements";
import { useBottomTabBarHeight } from "@react-navigation/bottom-tabs";
import { useFocusEffect, useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { Feather } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";

import { ThemedText } from "@/components/ThemedText";
import { Card } from "@/components/Card";
import { useTheme } from "@/hooks/useTheme";
import { getUserProfile, clearUserProfile, UserProfile, getUserListings, UserListing } from "@/lib/storage";
import { Spacing, BorderRadius, Colors, Shadows } from "@/constants/theme";
import { RootStackParamList } from "@/navigation/RootStackNavigator";

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

interface MenuItem {
  icon: keyof typeof Feather.glyphMap;
  label: string;
  value?: string;
  onPress: () => void;
}

export default function ProfileScreen() {
  const navigation = useNavigation<NavigationProp>();
  const insets = useSafeAreaInsets();
  const headerHeight = useHeaderHeight();
  const tabBarHeight = useBottomTabBarHeight();
  const { theme, isDark } = useTheme();

  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [listings, setListings] = useState<UserListing[]>([]);

  useFocusEffect(
    useCallback(() => {
      loadData();
    }, [])
  );

  const loadData = async () => {
    const userProfile = await getUserProfile();
    const userListings = await getUserListings();
    setProfile(userProfile);
    setListings(userListings);
  };

  const handleLogout = async () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    await clearUserProfile();
    navigation.reset({
      index: 0,
      routes: [{ name: "Login" }],
    });
  };

  const menuItems: MenuItem[] = [
    {
      icon: "home",
      label: "My Listings",
      value: `${listings.length} active`,
      onPress: () => {},
    },
    {
      icon: "credit-card",
      label: "Payment Methods",
      onPress: () => {},
    },
    {
      icon: "bell",
      label: "Notifications",
      onPress: () => {},
    },
    {
      icon: "shield",
      label: "Privacy & Security",
      onPress: () => {},
    },
    {
      icon: "help-circle",
      label: "Help Center",
      onPress: () => {},
    },
  ];

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: theme.backgroundRoot }]}
      contentContainerStyle={[
        styles.content,
        {
          paddingTop: headerHeight + Spacing.xl,
          paddingBottom: tabBarHeight + Spacing.xl,
        },
      ]}
    >
      <View style={styles.profileHeader}>
        <View
          style={[
            styles.avatarContainer,
            { backgroundColor: Colors.light.primary },
          ]}
        >
          <ThemedText style={styles.avatarText}>
            {profile?.name?.charAt(0).toUpperCase() || "G"}
          </ThemedText>
        </View>
        <ThemedText style={styles.name}>
          {profile?.name || "Guest User"}
        </ThemedText>
        <ThemedText style={[styles.email, { color: theme.textSecondary }]}>
          {profile?.email || "Not signed in"}
        </ThemedText>
        {profile?.loginMethod ? (
          <View
            style={[
              styles.badge,
              { backgroundColor: theme.backgroundDefault },
            ]}
          >
            <Feather
              name={
                profile.loginMethod === "google"
                  ? "mail"
                  : profile.loginMethod === "apple"
                  ? "smartphone"
                  : "user"
              }
              size={14}
              color={theme.textSecondary}
            />
            <ThemedText
              style={[styles.badgeText, { color: theme.textSecondary }]}
            >
              {profile.loginMethod === "google"
                ? "Google Account"
                : profile.loginMethod === "apple"
                ? "Apple Account"
                : "Email Account"}
            </ThemedText>
          </View>
        ) : null}
      </View>

      <View style={styles.menuSection}>
        {menuItems.map((item, index) => (
          <Pressable
            key={item.label}
            onPress={item.onPress}
            style={({ pressed }) => [
              styles.menuItem,
              {
                backgroundColor: pressed
                  ? theme.backgroundDefault
                  : theme.backgroundRoot,
                borderBottomColor: theme.border,
                borderBottomWidth: index < menuItems.length - 1 ? 1 : 0,
              },
            ]}
          >
            <View style={styles.menuItemLeft}>
              <View
                style={[
                  styles.menuIconContainer,
                  { backgroundColor: theme.backgroundDefault },
                ]}
              >
                <Feather name={item.icon} size={18} color={theme.text} />
              </View>
              <ThemedText style={styles.menuLabel}>{item.label}</ThemedText>
            </View>
            <View style={styles.menuItemRight}>
              {item.value ? (
                <ThemedText
                  style={[styles.menuValue, { color: theme.textSecondary }]}
                >
                  {item.value}
                </ThemedText>
              ) : null}
              <Feather name="chevron-right" size={20} color={theme.textSecondary} />
            </View>
          </Pressable>
        ))}
      </View>

      <Pressable
        onPress={handleLogout}
        style={({ pressed }) => [
          styles.logoutButton,
          {
            backgroundColor: pressed
              ? Colors.light.error + "10"
              : "transparent",
            borderColor: Colors.light.error,
          },
        ]}
        testID="logout-button"
      >
        <Feather name="log-out" size={18} color={Colors.light.error} />
        <ThemedText style={[styles.logoutText, { color: Colors.light.error }]}>
          Log Out
        </ThemedText>
      </Pressable>

      <ThemedText style={[styles.version, { color: theme.textSecondary }]}>
        PropertyHub v1.0.0
      </ThemedText>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    paddingHorizontal: Spacing.lg,
  },
  profileHeader: {
    alignItems: "center",
    marginBottom: Spacing["3xl"],
  },
  avatarContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: Spacing.lg,
  },
  avatarText: {
    fontSize: 32,
    fontWeight: "700",
    color: "#FFFFFF",
  },
  name: {
    fontSize: 24,
    fontWeight: "700",
    marginBottom: Spacing.xs,
  },
  email: {
    fontSize: 16,
    marginBottom: Spacing.md,
  },
  badge: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.xs,
    borderRadius: BorderRadius.full,
    gap: Spacing.xs,
  },
  badgeText: {
    fontSize: 13,
  },
  menuSection: {
    marginBottom: Spacing["2xl"],
  },
  menuItem: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: Spacing.lg,
  },
  menuItemLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.md,
  },
  menuIconContainer: {
    width: 36,
    height: 36,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
  },
  menuLabel: {
    fontSize: 16,
    fontWeight: "500",
  },
  menuItemRight: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.sm,
  },
  menuValue: {
    fontSize: 14,
  },
  logoutButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: Spacing.lg,
    borderRadius: BorderRadius.sm,
    borderWidth: 1,
    gap: Spacing.sm,
    marginBottom: Spacing["2xl"],
  },
  logoutText: {
    fontSize: 16,
    fontWeight: "600",
  },
  version: {
    fontSize: 13,
    textAlign: "center",
  },
});
