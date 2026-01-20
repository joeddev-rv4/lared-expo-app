import React, { useState } from "react";
import { View, StyleSheet, Pressable, Image, Modal } from "react-native";
import { useNavigation, useRoute } from "@react-navigation/native";
import { Feather } from "@expo/vector-icons";

import { ThemedText } from "@/components/ThemedText";
import { WebSearchBar } from "@/components/WebSearchBar";
import { Colors, Spacing, BorderRadius } from "@/constants/theme";

interface NavItem {
  key: string;
  label: string;
  route: string;
}

const NAV_ITEMS: NavItem[] = [
  { key: "explore", label: "Explorar", route: "ExploreTab" },
  { key: "favorites", label: "Favoritos", route: "FavoritesTab" },
  { key: "profile", label: "Mi Perfil", route: "ProfileTab" },
  { key: "achievements", label: "Mis Logros", route: "AchievementsTab" },
];

const MENU_OPTIONS = [
  { key: "notifications", label: "Notificaciones", icon: "bell" as const },
  { key: "settings", label: "Configuración", icon: "settings" as const },
  { key: "help", label: "Centro de ayuda", icon: "help-circle" as const },
  { key: "logout", label: "Cerrar sesión", icon: "log-out" as const },
];

const HEADER_BG_COLOR = "#F5F5F5";

export function WebNavbar() {
  const navigation = useNavigation<any>();
  const route = useRoute();
  const [menuVisible, setMenuVisible] = useState(false);

  const currentRoute = route.name;

  const handleNavPress = (routeName: string) => {
    navigation.navigate(routeName);
  };

  const handleMenuOptionPress = (key: string) => {
    setMenuVisible(false);
  };

  const handleSearch = (query: { property: string; project: string; location: string }) => {
    console.log("Search:", query);
  };

  return (
    <View style={styles.container}>
      <View style={styles.topBar}>
        <View style={styles.innerContainer}>
          <Pressable style={styles.logoContainer} onPress={() => handleNavPress("ExploreTab")}>
            <Image
              source={require("../../assets/images/icon.png")}
              style={styles.logoIcon}
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
                    { opacity: pressed ? 0.7 : 1 },
                  ]}
                >
                  <ThemedText
                    style={[
                      styles.navLabel,
                      isActive && styles.navLabelActive,
                    ]}
                  >
                    {item.label}
                  </ThemedText>
                  {isActive ? <View style={styles.activeIndicator} /> : null}
                </Pressable>
              );
            })}
          </View>

          <View style={styles.rightSection}>
            <Pressable style={styles.sellerButton}>
              <ThemedText style={styles.sellerButtonText}>Conviértete en vendedor</ThemedText>
            </Pressable>
            
            <Pressable 
              style={styles.profileMenuContainer}
              onPress={() => setMenuVisible(true)}
            >
              <Feather name="menu" size={16} color="#222222" style={styles.menuIcon} />
              <Image
                source={{ uri: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&h=100&fit=crop" }}
                style={styles.profileImage}
              />
            </Pressable>
          </View>
        </View>
      </View>

      <View style={styles.searchContainer}>
        <WebSearchBar onSearch={handleSearch} />
      </View>

      <View style={styles.bottomDivider} />

      <Modal
        visible={menuVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setMenuVisible(false)}
      >
        <Pressable 
          style={styles.modalOverlay}
          onPress={() => setMenuVisible(false)}
        >
          <View style={styles.dropdownMenu}>
            {MENU_OPTIONS.map((option, index) => (
              <Pressable
                key={option.key}
                style={({ pressed }) => [
                  styles.menuOption,
                  index === 0 && styles.menuOptionFirst,
                  index === MENU_OPTIONS.length - 1 && styles.menuOptionLast,
                  { backgroundColor: pressed ? "#F7F7F7" : "#FFFFFF" },
                ]}
                onPress={() => handleMenuOptionPress(option.key)}
              >
                <Feather name={option.icon} size={16} color="#222222" />
                <ThemedText style={styles.menuOptionText}>{option.label}</ThemedText>
              </Pressable>
            ))}
          </View>
        </Pressable>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: "100%",
    backgroundColor: HEADER_BG_COLOR,
  },
  topBar: {
    width: "100%",
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
  logoIcon: {
    width: 32,
    height: 32,
  },
  logoText: {
    fontSize: 18,
    fontWeight: "700",
    color: "#222222",
  },
  navItems: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.xl,
  },
  navItem: {
    paddingVertical: Spacing.sm,
    position: "relative",
  },
  navLabel: {
    fontSize: 14,
    fontWeight: "500",
    color: "#717171",
  },
  navLabelActive: {
    color: "#222222",
    fontWeight: "600",
  },
  activeIndicator: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    height: 2,
    backgroundColor: "#222222",
    borderRadius: 1,
  },
  rightSection: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.md,
  },
  sellerButton: {
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderRadius: BorderRadius.full,
    backgroundColor: Colors.light.primary,
  },
  sellerButtonText: {
    fontSize: 13,
    fontWeight: "600",
    color: "#FFFFFF",
  },
  profileMenuContainer: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#DDDDDD",
    borderRadius: BorderRadius.full,
    paddingLeft: Spacing.sm,
    paddingRight: 4,
    paddingVertical: 4,
    gap: Spacing.sm,
    backgroundColor: "#FFFFFF",
  },
  menuIcon: {
    marginLeft: 4,
  },
  profileImage: {
    width: 32,
    height: 32,
    borderRadius: 16,
  },
  searchContainer: {
    width: "100%",
    maxWidth: 1280,
    marginHorizontal: "auto",
  },
  bottomDivider: {
    width: "100%",
    height: 1,
    backgroundColor: "#DDDDDD",
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.1)",
    justifyContent: "flex-start",
    alignItems: "flex-end",
    paddingTop: 70,
    paddingRight: Spacing.xl,
  },
  dropdownMenu: {
    backgroundColor: "#FFFFFF",
    borderRadius: BorderRadius.md,
    minWidth: 200,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 5,
    overflow: "hidden",
  },
  menuOption: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
    gap: Spacing.md,
  },
  menuOptionFirst: {
    paddingTop: Spacing.lg,
  },
  menuOptionLast: {
    paddingBottom: Spacing.lg,
    borderTopWidth: 1,
    borderTopColor: "#EBEBEB",
  },
  menuOptionText: {
    fontSize: 14,
    color: "#222222",
  },
});
