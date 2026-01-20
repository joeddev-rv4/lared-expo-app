import React from "react";
import { View, StyleSheet, Pressable } from "react-native";
import { useNavigation, useRoute } from "@react-navigation/native";
import { DrawerActions } from "@react-navigation/native";
import { Feather } from "@expo/vector-icons";

import { ThemedText } from "@/components/ThemedText";
import { useTheme } from "@/hooks/useTheme";
import { Colors, Spacing, BorderRadius } from "@/constants/theme";

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

  const handleMenuPress = () => {
    navigation.dispatch(DrawerActions.openDrawer());
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.backgroundSecondary }]}>
      <View style={styles.innerContainer}>
        <View style={styles.navMenuContainer}>
          <View style={styles.navMenu}>
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
                    size={18}
                    color={Colors.light.primary}
                  />
                  <ThemedText
                    style={[
                      styles.navLabel,
                      isActive && styles.navLabelActive,
                    ]}
                  >
                    {item.label}
                  </ThemedText>
                </Pressable>
              );
            })}
          </View>
        </View>

        <View style={styles.rightSection}>
          <Pressable style={[styles.iconButton, { backgroundColor: "#FFFFFF" }]}>
            <Feather name="bell" size={20} color={Colors.light.primary} />
          </Pressable>
          <Pressable 
            style={[styles.iconButton, { backgroundColor: "#FFFFFF" }]}
            onPress={handleMenuPress}
          >
            <Feather name="menu" size={20} color={Colors.light.primary} />
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
  navMenuContainer: {
    flex: 1,
    alignItems: "center",
  },
  navMenu: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFFFFF",
    borderRadius: BorderRadius.full,
    paddingHorizontal: Spacing.sm,
    paddingVertical: Spacing.xs,
    gap: Spacing.xs,
  },
  navItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.xs,
    paddingVertical: Spacing.sm,
    paddingHorizontal: Spacing.md,
    borderRadius: BorderRadius.full,
  },
  navItemActive: {
    backgroundColor: Colors.light.primary + "15",
  },
  navLabel: {
    fontSize: 14,
    fontWeight: "500",
    color: Colors.light.primary,
  },
  navLabelActive: {
    fontWeight: "600",
  },
  rightSection: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.md,
  },
  iconButton: {
    padding: Spacing.sm,
    borderRadius: BorderRadius.full,
  },
});
