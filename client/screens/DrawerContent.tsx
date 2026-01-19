import React from "react";
import { View, StyleSheet, Pressable, Image, ScrollView } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { DrawerContentComponentProps } from "@react-navigation/drawer";
import { Feather } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";

import { ThemedText } from "@/components/ThemedText";
import { useTheme } from "@/hooks/useTheme";
import { Spacing, BorderRadius, Colors } from "@/constants/theme";

interface DrawerMenuItem {
  icon: keyof typeof Feather.glyphMap;
  label: string;
  onPress: () => void;
}

export default function DrawerContent({ navigation }: DrawerContentComponentProps) {
  const insets = useSafeAreaInsets();
  const { theme, isDark } = useTheme();

  const menuItems: DrawerMenuItem[] = [
    {
      icon: "map",
      label: "Map View",
      onPress: () => {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        navigation.closeDrawer();
      },
    },
    {
      icon: "calendar",
      label: "My Bookings",
      onPress: () => {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        navigation.closeDrawer();
      },
    },
    {
      icon: "message-circle",
      label: "Messages",
      onPress: () => {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        navigation.closeDrawer();
      },
    },
    {
      icon: "settings",
      label: "Settings",
      onPress: () => {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        navigation.closeDrawer();
      },
    },
    {
      icon: "info",
      label: "About",
      onPress: () => {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        navigation.closeDrawer();
      },
    },
  ];

  return (
    <View style={[styles.container, { backgroundColor: theme.backgroundRoot }]}>
      <View
        style={[
          styles.header,
          {
            paddingTop: insets.top + Spacing.xl,
            backgroundColor: Colors.light.primary,
          },
        ]}
      >
        <Image
          source={require("../../assets/images/icon.png")}
          style={styles.logo}
          resizeMode="contain"
        />
        <ThemedText style={styles.appName}>PropertyHub</ThemedText>
        <ThemedText style={styles.tagline}>Find your perfect stay</ThemedText>
      </View>

      <ScrollView
        style={styles.menuContainer}
        contentContainerStyle={styles.menuContent}
      >
        {menuItems.map((item) => (
          <Pressable
            key={item.label}
            onPress={item.onPress}
            style={({ pressed }) => [
              styles.menuItem,
              {
                backgroundColor: pressed
                  ? theme.backgroundDefault
                  : "transparent",
              },
            ]}
          >
            <Feather name={item.icon} size={22} color={theme.text} />
            <ThemedText style={styles.menuLabel}>{item.label}</ThemedText>
          </Pressable>
        ))}
      </ScrollView>

      <View
        style={[
          styles.footer,
          { paddingBottom: insets.bottom + Spacing.lg, borderTopColor: theme.border },
        ]}
      >
        <ThemedText style={[styles.footerText, { color: theme.textSecondary }]}>
          PropertyHub v1.0.0
        </ThemedText>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    padding: Spacing.xl,
    paddingBottom: Spacing["2xl"],
  },
  logo: {
    width: 50,
    height: 50,
    marginBottom: Spacing.md,
    borderRadius: BorderRadius.sm,
  },
  appName: {
    fontSize: 24,
    fontWeight: "700",
    color: "#FFFFFF",
    marginBottom: Spacing.xs,
  },
  tagline: {
    fontSize: 14,
    color: "rgba(255,255,255,0.8)",
  },
  menuContainer: {
    flex: 1,
  },
  menuContent: {
    paddingVertical: Spacing.lg,
  },
  menuItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: Spacing.lg,
    paddingHorizontal: Spacing.xl,
    gap: Spacing.lg,
  },
  menuLabel: {
    fontSize: 16,
    fontWeight: "500",
  },
  footer: {
    borderTopWidth: 1,
    paddingTop: Spacing.lg,
    paddingHorizontal: Spacing.xl,
  },
  footerText: {
    fontSize: 13,
    textAlign: "center",
  },
});
