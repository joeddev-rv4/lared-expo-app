import React, { useState } from "react";
import {
  View,
  StyleSheet,
  Pressable,
  Image,
  Modal,
  ImageSourcePropType,
  useWindowDimensions,
} from "react-native";
import { useNavigation, useNavigationState } from "@react-navigation/native";
import { Ionicons } from "@expo/vector-icons";

import { ThemedText } from "@/components/ThemedText";
import { useAuth } from "@/contexts/AuthContext";
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
  {
    key: "explore",
    label: "Explorar",
    route: "ExploreTab",
    icon: require("../../assets/icons/icon_2.png"),
  },
  {
    key: "favorites",
    label: "Favoritos",
    route: "FavoritesTab",
    icon: require("../../assets/icons/icon_4.png"),
  },
  {
    key: "profile",
    label: "Mi Perfil",
    route: "ProfileTab",
    icon: require("../../assets/icons/icon_1.png"),
  },
  {
    key: "achievements",
    label: "Mis Logros",
    route: "AchievementsTab",
    icon: require("../../assets/icons/icon_3.png"),
  },
];

const MENU_OPTIONS = [
  { key: "notifications", label: "Notificaciones", icon: "bell" as const },
  { key: "settings", label: "Configuración", icon: "settings" as const },
  { key: "help", label: "Centro de ayuda", icon: "help-circle" as const },
  { key: "logout", label: "Cerrar sesión", icon: "log-out" as const },
];

const HEADER_GRADIENT_EDGE = "#000000";
const HEADER_GRADIENT_CENTER = "#044BB8";

interface WebNavbarProps {
  activeTabOverride?: string;
}

export function WebNavbar({ activeTabOverride }: WebNavbarProps) {
  const navigation = useNavigation<any>();
  const { logout } = useAuth();
  const { width } = useWindowDimensions();
  const [menuVisible, setMenuVisible] = useState(false);
  const [sellerHovered, setSellerHovered] = useState(false);

  const isMobile = width < 768;
  const isTablet = width >= 768 && width < 1024;

  // Get the active tab route from nested navigation state
  const detectedTabRoute = useNavigationState((state) => {
    // Navigate through: DrawerNavigator -> MainTabs -> Tab.Navigator
    const drawerRoute = state?.routes?.[state.index];
    if (drawerRoute?.name === 'MainTabs' && drawerRoute.state) {
      const tabState = drawerRoute.state;
      const activeTab = tabState.routes?.[tabState.index ?? 0];
      return activeTab?.name || 'ExploreTab';
    }
    return 'ExploreTab';
  });

  // Use override if provided, otherwise use detected route
  const activeTabRoute = activeTabOverride || detectedTabRoute;

  const getIsActive = (itemKey: string, itemRoute: string) => {
    if (activeTabRoute === itemRoute) return true;
    if (itemKey === "explore" && activeTabRoute === "ExploreTab") return true;
    if (itemKey === "favorites" && activeTabRoute === "FavoritesTab") return true;
    if (itemKey === "profile" && activeTabRoute === "ProfileTab") return true;
    if (itemKey === "achievements" && activeTabRoute === "AchievementsTab") return true;
    return false;
  };

  const handleNavPress = (routeName: string) => {
    // Navigate to nested tab screen through the drawer navigator
    navigation.navigate('MainTabs', { screen: routeName });
  };

  const handleMenuOptionPress = async (key: string) => {
    setMenuVisible(false);
    if (key === 'logout') {
      await logout();
      navigation.reset({
        index: 0,
        routes: [{ name: "Login" }],
      });
    }
  };

  const handleSearch = (query: {
    property: string;
    project: string;
    location: string;
  }) => {
    console.log("Search:", query);
  };

  return (
    <View style={styles.container}>
      <View style={styles.navbarWrapper}>
        <LinearGradient
          colors={[
            HEADER_GRADIENT_EDGE,
            HEADER_GRADIENT_CENTER,
            HEADER_GRADIENT_EDGE,
          ]}
          locations={[0, 0.5, 1]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={styles.topBar}
        >
          <View
            style={[
              styles.innerContainer,
              isMobile && styles.innerContainerMobile,
            ]}
          >
          <Pressable
            style={[
              styles.logoContainer,
              isMobile && styles.logoContainerMobile,
            ]}
            onPress={() => handleNavPress("ExploreTab")}
          >
            <Image
              source={require("../../assets/images/icon.png")}
              style={[styles.logoIcon, isMobile && styles.logoIconMobile]}
              resizeMode="contain"
            />
          </Pressable>

          {!isMobile ? (
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
                          style={[
                            styles.navIcon,
                            isActive && styles.navIconActive,
                          ]}
                          resizeMode="contain"
                        />
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
          ) : null}

          <View style={styles.rightSection}>
            {!isMobile ? (
              <Pressable
                style={[
                  styles.sellerButton,
                  sellerHovered && styles.sellerButtonHovered,
                ]}
                onHoverIn={() => setSellerHovered(true)}
                onHoverOut={() => setSellerHovered(false)}
              >
                <ThemedText
                  style={[
                    styles.sellerButtonText,
                    sellerHovered && styles.sellerButtonTextHovered,
                  ]}
                >
                  Conviértete en vendedor
                </ThemedText>
              </Pressable>
            ) : null}

            <Pressable style={styles.profileButton}>
              <Image
                source={{
                  uri: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&h=100&fit=crop",
                }}
                style={styles.profileImage}
              />
            </Pressable>

            <Pressable
              style={styles.menuButton}
              onPress={() => setMenuVisible(true)}
            >
              <Ionicons name="menu" size={20} color="#222222" />
            </Pressable>
          </View>
        </View>
        </LinearGradient>
      </View>

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
                onPress={() =>
                  handleMenuOptionPress(option.key)
                }
              >
                <Ionicons name={option.icon as keyof typeof Ionicons.glyphMap} size={16} color="#222222" />
                <ThemedText style={styles.menuOptionText}>
                  {option.label}
                </ThemedText>
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
    position: "fixed" as any,
    top: Spacing.lg,
    left: 0,
    right: 0,
    zIndex: 1000,
    alignItems: "center",
    paddingHorizontal: Spacing.xl,
  },
  navbarWrapper: {
    width: "100%",
    maxWidth: 1400,
    borderRadius: 50,
    overflow: "hidden",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 8,
  },
  topBar: {
    width: "100%",
  },
  innerContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.md,
    width: "100%",
    position: "relative",
  },
  logoContainer: {
    flexDirection: "row",
    alignItems: "center",
    height: 62,
    overflow: "visible",
    paddingTop: 37,
  },
  logoIcon: {
    width: 300,
    height: 300,
    marginVertical: -31,
  },
  navItems: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.xl,
    position: "absolute",
    left: "50%",
    transform: [{ translateX: "-50%" }],
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
    width: 20,
    height: 20,
  },
  navIconActive: {
    width: 40,
    height: 40,
  },
  navLabel: {
    fontSize: 14,
    fontWeight: "700",
    color: "#FFFFFF",
  },
  navLabelActive: {
    fontSize: 20,
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
  innerContainerMobile: {
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
  },
  logoContainerMobile: {
    height: 40,
    paddingTop: 20,
  },
  logoIconMobile: {
    width: 150,
    height: 150,
    marginVertical: -15,
  },
});
