import React from "react";
import { View, StyleSheet, Pressable, Image } from "react-native";
import { useNavigation, useRoute } from "@react-navigation/native";
import { Feather } from "@expo/vector-icons";

import { ThemedText } from "@/components/ThemedText";
import { useTheme } from "@/hooks/useTheme";
import { Colors, Spacing, Shadows } from "@/constants/theme";

interface NavItem {
  key: string;
  label: string;
  icon: keyof typeof Feather.glyphMap;
  route: string;
}

const NAV_ITEMS: NavItem[] = [
  { key: "explore", label: "Explorar", icon: "search", route: "ExploreTab" },
  { key: "favorites", label: "Favoritos", icon: "heart", route: "FavoritesTab" },
  { key: "profile", label: "Mi Perfil", icon: "user", route: "ProfileTab" },
  { key: "achievements", label: "Mis Logros", icon: "award", route: "AchievementsTab" },
];

export function WebNavbar() {
  const { theme } = useTheme();
  const navigation = useNavigation<any>();
  const route = useRoute();

  const currentRoute = route.name;

  const handleNavPress = (routeName: string) => {
    navigation.navigate(routeName);
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.backgroundRoot }, Shadows.card]}>
      <View style={styles.innerContainer}>
        <Pressable style={styles.logoContainer} onPress={() => handleNavPress("ExploreTab")}>
          <Image
            source={require("../../assets/images/icon.png")}
            style={styles.logo}
            resizeMode="contain"
          />
          <ThemedText style={styles.logoText}>La Red Inmobiliaria</ThemedText>
        </Pressable>

        <View style={styles.navItems}>
          {NAV_ITEMS.map((item) => {
            const isActive = currentRoute === item.route || 
              (currentRoute === "Explore" && item.route === "ExploreTab");
            
            return (
              <Pressable
                key={item.key}
                onPress={() => handleNavPress(item.route)}
                style={({ pressed }) => [
                  styles.navItem,
                  isActive && styles.navItemActive,
                  { opacity: pressed ? 0.7 : 1 },
                ]}
              >
                <Feather
                  name={item.icon}
                  size={20}
                  color={isActive ? Colors.light.primary : theme.textSecondary}
                />
                <ThemedText
                  style={[
                    styles.navLabel,
                    { color: isActive ? Colors.light.primary : theme.textSecondary },
                  ]}
                >
                  {item.label}
                </ThemedText>
              </Pressable>
            );
          })}
        </View>

        <View style={styles.rightSection}>
          <Pressable style={styles.iconButton}>
            <Feather name="bell" size={20} color={theme.text} />
          </Pressable>
          <Pressable style={styles.iconButton}>
            <Feather name="menu" size={20} color={theme.text} />
          </Pressable>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: "100%",
    borderBottomWidth: 1,
    borderBottomColor: "rgba(0,0,0,0.08)",
  },
  innerContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: Spacing.xl,
    paddingVertical: Spacing.md,
    maxWidth: 1280,
    marginHorizontal: "auto",
    width: "100%",
  },
  logoContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.sm,
  },
  logo: {
    width: 40,
    height: 40,
  },
  logoText: {
    fontSize: 18,
    fontWeight: "700",
    color: Colors.light.primary,
  },
  navItems: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.lg,
  },
  navItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.xs,
    paddingVertical: Spacing.sm,
    paddingHorizontal: Spacing.md,
    borderRadius: 20,
  },
  navItemActive: {
    backgroundColor: Colors.light.primary + "15",
  },
  navLabel: {
    fontSize: 14,
    fontWeight: "500",
  },
  rightSection: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.md,
  },
  iconButton: {
    padding: Spacing.sm,
    borderRadius: 20,
  },
});
