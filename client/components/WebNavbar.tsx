import React, { useState } from "react";
import { View, StyleSheet, Pressable, Image, Modal, ImageSourcePropType } from "react-native";
import { useNavigation, useRoute } from "@react-navigation/native";
import { Feather } from "@expo/vector-icons";

import { ThemedText } from "@/components/ThemedText";
import { Colors, Spacing, BorderRadius } from "@/constants/theme";
import { LinearGradient } from "expo-linear-gradient";

interface NavItem {
  key: string;
  label: string;
  route: string;
  icon?: ImageSourcePropType;
  featherIcon?: string;
}

const NAV_ITEMS: NavItem[] = [
  { key: "explore", label: "Explorar", route: "ExploreTab", icon: require("../../assets/icons/explorar.png") },
  { key: "profile", label: "Mi Perfil", route: "ProfileTab", icon: require("../../assets/icons/mi_perfil.png") },
  { key: "achievements", label: "Mis Logros", route: "AchievementsTab", icon: require("../../assets/icons/mis_logros.png") },
];

const MENU_OPTIONS = [
  { key: "favorites", label: "Favoritos", icon: "heart" as const, route: "FavoritesTab" },
  { key: "notifications", label: "Notificaciones", icon: "bell" as const },
  { key: "settings", label: "Configuración", icon: "settings" as const },
  { key: "help", label: "Centro de ayuda", icon: "help-circle" as const },
  { key: "logout", label: "Cerrar sesión", icon: "log-out" as const },
];

const HEADER_GRADIENT_EDGE = "#000000";
const HEADER_GRADIENT_CENTER = "#044BB8";

export function WebNavbar() {
  const navigation = useNavigation<any>();
  const route = useRoute();
  const [menuVisible, setMenuVisible] = useState(false);
  const [sellerHovered, setSellerHovered] = useState(false);

  const currentRoute = route.name;
  
  const getIsActive = (itemKey: string, itemRoute: string) => {
    if (currentRoute === itemRoute) return true;
    if (itemKey === "explore" && (currentRoute === "Explore" || currentRoute === "ExploreScreen" || currentRoute === "MainTabs" || currentRoute.toLowerCase().includes("explore"))) return true;
    if (itemKey === "profile" && currentRoute.toLowerCase().includes("profile")) return true;
    if (itemKey === "achievements" && currentRoute.toLowerCase().includes("achievement")) return true;
    return false;
  };

  const handleNavPress = (routeName: string) => {
    navigation.navigate(routeName);
  };

  const handleMenuOptionPress = (key: string, route?: string) => {
    setMenuVisible(false);
    if (route) {
      navigation.navigate(route);
    }
  };

  const handleSearch = (query: { property: string; project: string; location: string }) => {
    console.log("Search:", query);
  };

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={[HEADER_GRADIENT_EDGE, HEADER_GRADIENT_CENTER, HEADER_GRADIENT_EDGE]}
        locations={[0, 0.5, 1]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 0 }}
        style={styles.topBar}
      >
        <View style={styles.innerContainer}>
          <Pressable style={styles.logoContainer} onPress={() => handleNavPress("ExploreTab")}>
            <Image
              source={require("../../assets/images/icon.png")}
              style={styles.logoIcon}
              resizeMode="contain"
            />
          </Pressable>

          <View style={styles.navItems}>
            {NAV_ITEMS.map((item) => {
              const isActive = getIsActive(item.key, item.route);
              
              return (
                <Pressable
                  key={item.key}
                  onPress={() => handleNavPress(item.route)}
                  style={({ pressed }) => [
                    styles.navItem,
                    { opacity: pressed ? 0.7 : 1 },
                  ]}
                >
                  <View style={styles.navItemContent}>
                    {item.icon ? (
                      <Image 
                        source={item.icon} 
                        style={isActive ? styles.navIconActive : styles.navIcon} 
                        resizeMode="contain" 
                      />
                    ) : item.featherIcon ? (
                      <Feather name={item.featherIcon as any} size={isActive ? 24 : 20} color="#FFFFFF" />
                    ) : null}
                    <ThemedText
                      style={[
                        styles.navLabel,
                        isActive && styles.navLabelActive,
                      ]}
                    >
                      {item.label}
                    </ThemedText>
                  </View>
                  {isActive ? <View style={styles.activeIndicator} /> : null}
                </Pressable>
              );
            })}
          </View>

          <View style={styles.rightSection}>
            <Pressable 
              style={[
                styles.sellerButton,
                sellerHovered && styles.sellerButtonHovered,
              ]}
              onHoverIn={() => setSellerHovered(true)}
              onHoverOut={() => setSellerHovered(false)}
            >
              <ThemedText style={[
                styles.sellerButtonText,
                sellerHovered && styles.sellerButtonTextHovered,
              ]}>
                Conviértete en vendedor
              </ThemedText>
            </Pressable>
            
            <Pressable style={styles.profileButton}>
              <Image
                source={{ uri: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&h=100&fit=crop" }}
                style={styles.profileImage}
              />
            </Pressable>

            <Pressable 
              style={styles.menuButton}
              onPress={() => setMenuVisible(true)}
            >
              <Feather name="menu" size={20} color="#222222" />
            </Pressable>
          </View>
        </View>
      </LinearGradient>

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
                onPress={() => handleMenuOptionPress(option.key, (option as any).route)}
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
    height: 62,
    overflow: "visible",
  },
  logoIcon: {
    width: 124,
    height: 124,
    marginVertical: -31,
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
  navItemContent: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.sm,
  },
  navIcon: {
    width: 40,
    height: 40,
  },
  navIconActive: {
    width: 48,
    height: 48,
  },
  navLabel: {
    fontSize: 14,
    fontWeight: "700",
    color: "#FFFFFF",
  },
  navLabelActive: {
    color: "#FFFFFF",
    fontWeight: "700",
  },
  activeIndicator: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    height: 2,
    backgroundColor: "#FFFFFF",
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
    backgroundColor: "transparent",
    borderWidth: 1,
    borderColor: "#FFFFFF",
  },
  sellerButtonHovered: {
    backgroundColor: "#bf0a0a",
    borderColor: "#bf0a0a",
  },
  sellerButtonText: {
    fontSize: 13,
    fontWeight: "600",
    color: "#FFFFFF",
  },
  sellerButtonTextHovered: {
    color: "#FFFFFF",
  },
  profileButton: {
    padding: 4,
  },
  profileImage: {
    width: 36,
    height: 36,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: "#DDDDDD",
  },
  menuButton: {
    padding: Spacing.sm,
    borderRadius: BorderRadius.full,
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#DDDDDD",
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
