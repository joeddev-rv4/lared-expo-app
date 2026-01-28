import React, { useState, useRef, useEffect } from "react";
import {
  View,
  StyleSheet,
  Pressable,
  Image,
  Modal,
  ImageSourcePropType,
  useWindowDimensions,
  Animated,
  ScrollView,
} from "react-native";
import { useNavigation, useNavigationState } from "@react-navigation/native";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";

import { ThemedText } from "@/components/ThemedText";
import { useAuth } from "@/contexts/AuthContext";
import { Colors, Spacing, BorderRadius } from "@/constants/theme";

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
    label: "Mis Clientes",
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
  { key: "notifications", label: "Notificaciones", icon: "notifications" as const },
  { key: "settings", label: "Configuración", icon: "settings" as const },
  { key: "help", label: "Centro de ayuda", icon: "help-circle" as const },
  { key: "logout", label: "Cerrar sesión", icon: "log-out" as const },
];

// Datos de prueba para notificaciones
const SAMPLE_NOTIFICATIONS = [
  {
    id: 1,
    title: "Nueva propiedad disponible",
    message: "Se ha agregado una nueva propiedad en tu zona de interés",
    date: "2024-01-27T10:30:00Z",
    read: false,
  },
  {
    id: 2,
    title: "Cliente interesado",
    message: "María González mostró interés en tu propiedad",
    date: "2024-01-27T09:15:00Z",
    read: false,
  },
  {
    id: 3,
    title: "Actualización de precio",
    message: "El precio de la propiedad en Calle Principal ha sido actualizado",
    date: "2024-01-26T16:45:00Z",
    read: true,
  },
  {
    id: 4,
    title: "Cita programada",
    message: "Tienes una cita programada para mañana a las 14:00",
    date: "2024-01-26T14:20:00Z",
    read: true,
  },
  {
    id: 5,
    title: "Documento requerido",
    message: "Falta el documento de identificación para la propiedad XYZ",
    date: "2024-01-26T11:30:00Z",
    read: false,
  },
  {
    id: 6,
    title: "Oferta recibida",
    message: "Has recibido una nueva oferta por $250,000",
    date: "2024-01-25T17:00:00Z",
    read: false,
  },
  {
    id: 7,
    title: "Recordatorio de pago",
    message: "El pago mensual vence en 3 días",
    date: "2024-01-25T10:00:00Z",
    read: true,
  },
  {
    id: 8,
    title: "Propiedad vendida",
    message: "¡Felicitaciones! Tu propiedad en Avenida Central se ha vendido",
    date: "2024-01-24T15:30:00Z",
    read: true,
  },
  {
    id: 9,
    title: "Nuevo mensaje",
    message: "Tienes un nuevo mensaje de un cliente potencial",
    date: "2024-01-24T12:15:00Z",
    read: false,
  },
  {
    id: 10,
    title: "Actualización del sistema",
    message: "Se ha actualizado la plataforma con nuevas funcionalidades",
    date: "2024-01-24T09:00:00Z",
    read: true,
  },
];

const NAVBAR_BG_COLOR = "#FFFFFF";

interface WebNavbarProps {
  activeTabOverride?: string;
}

export function WebNavbar({ activeTabOverride }: WebNavbarProps) {
  const navigation = useNavigation<any>();
  const { logout, user } = useAuth();
  const { width } = useWindowDimensions();
  const [menuVisible, setMenuVisible] = useState(false);
  const [sellerHovered, setSellerHovered] = useState(false);
  const [notificationsVisible, setNotificationsVisible] = useState(false);
  const [notifications, setNotifications] = useState<any[]>([]);
  const slideAnim = useRef(new Animated.Value(-100)).current;

  const isMobile = width < 768;
  const isTablet = width >= 768 && width < 1024;

  // Calcular notificaciones sin leer
  const unreadNotificationsCount = notifications.filter(notification => !notification.read).length;

  // Cargar notificaciones desde la API
  useEffect(() => {
    const loadNotifications = async () => {
      if (!user?.id) return;

      try {
        const response = await fetch(`${process.env.EXPO_PUBLIC_API_URL}/notifications/user/${user.id}`);
        if (response.ok) {
          const data = await response.json();
          // Mapear la estructura de la API a la estructura del componente
          const mappedNotifications = data.map((notification: any) => ({
            id: notification._id,
            title: notification.titulo,
            message: notification.mensaje,
            date: notification.fecha,
            read: notification.status, // status: false = no leído, true = leído
          }));
          setNotifications(mappedNotifications);
        } else {
          console.error('Error al cargar notificaciones:', response.status);
        }
      } catch (error) {
        console.error('Error al cargar notificaciones:', error);
      }
    };

    // Cargar notificaciones inmediatamente
    loadNotifications();

    // Configurar polling cada 30 segundos
    const intervalId = setInterval(loadNotifications, 30000);

    // Limpiar interval cuando el componente se desmonte o cambie el usuario
    return () => clearInterval(intervalId);
  }, [user?.id]);

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

  const handleMenuToggle = () => {
    if (menuVisible) {
      // Cerrar menú con animación
      Animated.timing(slideAnim, {
        toValue: -100,
        duration: 200,
        useNativeDriver: true,
      }).start(() => {
        setMenuVisible(false);
      });
    } else {
      // Resetear animación antes de abrir
      slideAnim.setValue(-100);
      setMenuVisible(true);
      // Animar entrada: deslizar desde arriba hacia abajo
      Animated.spring(slideAnim, {
        toValue: 0,
        useNativeDriver: true,
        tension: 80,
        friction: 10,
      }).start();
    }
  };

  const handleMenuClose = () => {
    Animated.timing(slideAnim, {
      toValue: -100,
      duration: 200,
      useNativeDriver: true,
    }).start(() => {
      setMenuVisible(false);
      setNotificationsVisible(false); // Cerrar notificaciones también
    });
  };

  const handleMenuOptionPress = async (key: string) => {
    if (key === 'notifications') {
      setNotificationsVisible(!notificationsVisible);
    } else {
      // Cerrar notificaciones si están abiertas y cerrar menú
      if (notificationsVisible) {
        setNotificationsVisible(false);
      }
      handleMenuClose();
      if (key === 'logout') {
        await logout();
        navigation.reset({
          index: 0,
          routes: [{ name: "Login" }],
        });
      }
    }
  };

  const handleSearch = (query: {
    property: string;
    project: string;
    location: string;
  }) => {
    console.log("Search:", query);
  };

  const handleNotificationPress = async (notificationId: string) => {
    // Actualizar el estado local inmediatamente para quitar el punto rojo
    setNotifications(prevNotifications =>
      prevNotifications.map(notification =>
        notification.id === notificationId
          ? { ...notification, read: true }
          : notification
      )
    );

    try {
      // Hacer la petición al servidor para actualizar en la base de datos
      const response = await fetch(`${process.env.EXPO_PUBLIC_API_URL}/notifications/${notificationId}/read`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        console.error('Error al marcar notificación como leída:', response.status);
        // Revertir el cambio local si la petición falló
        setNotifications(prevNotifications =>
          prevNotifications.map(notification =>
            notification.id === notificationId
              ? { ...notification, read: false }
              : notification
          )
        );
      } else {
        console.log('Notificación marcada como leída:', notificationId);
      }
    } catch (error) {
      console.error('Error al actualizar notificación:', error);
      // Revertir el cambio local si hubo un error de red
      setNotifications(prevNotifications =>
        prevNotifications.map(notification =>
          notification.id === notificationId
            ? { ...notification, read: false }
            : notification
        )
      );
    }
  };

  return (
    <View style={[styles.container, isMobile && styles.containerMobile]}>
      <View style={styles.navbarWrapper}>
        <View style={styles.topBar}>
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
                onPress={handleMenuToggle}
              >
                <Ionicons name="menu" size={20} color="#222222" />
                {unreadNotificationsCount > 0 && (
                  <View style={styles.menuBadge}>
                    <ThemedText style={styles.menuBadgeText}>
                      {unreadNotificationsCount > 99 ? '99+' : unreadNotificationsCount}
                    </ThemedText>
                  </View>
                )}
              </Pressable>
            </View>
          </View>
        </View>
      </View>

      <Modal
        visible={menuVisible}
        transparent
        animationType="none"
        onRequestClose={handleMenuClose}
      >
        <Pressable
          style={styles.modalOverlay}
          onPress={handleMenuClose}
        >
          <Animated.View
            style={[
              styles.dropdownMenu,
              {
                transform: [{ translateY: slideAnim }],
                opacity: slideAnim.interpolate({
                  inputRange: [-100, 0],
                  outputRange: [0, 1],
                }),
                width: notificationsVisible ? 550 : 200,
              },
            ]}
          >
            <View style={styles.menuContainer}>
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
                  {option.key === 'notifications' && unreadNotificationsCount > 0 && (
                    <View style={styles.notificationBadge}>
                      <ThemedText style={styles.notificationBadgeText}>
                        {unreadNotificationsCount > 99 ? '99+' : unreadNotificationsCount}
                      </ThemedText>
                    </View>
                  )}
                  {option.key === 'notifications' && (
                    <Ionicons
                      name={notificationsVisible ? "chevron-forward" : "chevron-back"}
                      size={14}
                      color="#999999"
                      style={styles.chevronIcon}
                    />
                  )}
                </Pressable>
              ))}
            </View>

            {notificationsVisible && (
              <View style={styles.notificationsContainer}>
                <View style={styles.notificationsHeader}>
                  <ThemedText style={styles.notificationsTitle}>Notificaciones</ThemedText>
                </View>

                <ScrollView style={styles.notificationsList}>
                  {notifications.length === 0 ? (
                    <View style={styles.notificationItem}>
                      <View style={styles.notificationContent}>
                        <ThemedText style={styles.notificationTitle}>
                          No tienes notificaciones
                        </ThemedText>
                        <ThemedText style={styles.notificationMessage}>
                          Las nuevas notificaciones aparecerán aquí
                        </ThemedText>
                      </View>
                    </View>
                  ) : (
                    notifications.map((notification) => (
                      !notification.read ? (
                        <LinearGradient
                          key={notification.id}
                          colors={['#044bb8', '#000000']}
                          start={{ x: 0.5, y: 0.5 }}
                          end={{ x: 1, y: 1 }}
                          style={[styles.notificationItem, styles.notificationUnread]}
                        >
                          <Pressable
                            style={styles.notificationPressable}
                            onPress={() => handleNotificationPress(notification.id)}
                          >
                            <View style={styles.notificationContent}>
                              <View style={styles.notificationTitleRow}>
                                <ThemedText style={[styles.notificationTitle, styles.notificationTitleUnread]}>
                                  {notification.title}
                                </ThemedText>
                                <View style={styles.unreadDot} />
                              </View>
                              <ThemedText style={[styles.notificationMessage, styles.notificationMessageUnread]}>
                                {notification.message}
                              </ThemedText>
                              <ThemedText style={[styles.notificationDate, styles.notificationDateUnread]}>
                                {new Date(notification.date).toLocaleDateString('es-ES', {
                                  day: 'numeric',
                                  month: 'short',
                                  hour: '2-digit',
                                  minute: '2-digit',
                                })}
                              </ThemedText>
                            </View>
                          </Pressable>
                        </LinearGradient>
                      ) : (
                        <Pressable
                          key={notification.id}
                          style={styles.notificationItem}
                          onPress={() => handleNotificationPress(notification.id)}
                        >
                          <View style={styles.notificationContent}>
                            <View style={styles.notificationTitleRow}>
                              <ThemedText style={styles.notificationTitle}>
                                {notification.title}
                              </ThemedText>
                            </View>
                            <ThemedText style={styles.notificationMessage}>
                              {notification.message}
                            </ThemedText>
                            <ThemedText style={styles.notificationDate}>
                              {new Date(notification.date).toLocaleDateString('es-ES', {
                                day: 'numeric',
                                month: 'short',
                                hour: '2-digit',
                                minute: '2-digit',
                              })}
                            </ThemedText>
                          </View>
                        </Pressable>
                      )
                    ))
                  )}
                </ScrollView>
              </View>
            )}
          </Animated.View>
        </Pressable>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: "fixed" as any,
    top: 0,
    left: 0,
    right: 0,
    zIndex: 1000,
    alignItems: "center",
    paddingHorizontal: Spacing.xl,
    paddingTop: Spacing.lg,
    paddingBottom: Spacing.sm,
    backgroundColor: 'white',
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
    backgroundColor: NAVBAR_BG_COLOR,
  },
  innerContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: Spacing.lg,
    paddingVertical: 6,
    width: "100%",
    position: "relative",
  },
  logoContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },
  logoIcon: {
    width: 50,
    height: 50,
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
    width: 20,
    height: 20,
  },
  navLabel: {
    fontSize: 14,
    fontWeight: "600",
    color: "#333333",
  },
  navLabelActive: {
    fontSize: 14,
    color: "#bf0a0a",
    fontWeight: "600",
  },
  activeIndicator: {
    display: "none",
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
    backgroundColor: "#bf0a0a",
  },
  sellerButtonHovered: {
    backgroundColor: "#8a0808",
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
    position: "relative",
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
    paddingTop: 80,
    paddingRight: Spacing.xl,
  },
  dropdownMenu: {
    backgroundColor: "#FFFFFF",
    borderRadius: BorderRadius.md,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 5,
    overflow: "hidden",
    flexDirection: "row",
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
    flex: 1,
  },
  chevronIcon: {
    marginLeft: 2, // Reducido para mover la flecha más a la izquierda
  },
  menuBadge: {
    position: "absolute",
    top: -8,
    right: -8,
    backgroundColor: "#bf0a0a",
    borderRadius: 10,
    minWidth: 18,
    height: 18,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 2,
    borderColor: "#FFFFFF",
  },
  menuBadgeText: {
    color: "#FFFFFF",
    fontSize: 10,
    fontWeight: "600",
  },
  notificationBadge: {
    backgroundColor: "#bf0a0a",
    borderRadius: 8,
    minWidth: 16,
    height: 16,
    justifyContent: "center",
    alignItems: "center",
    marginLeft: Spacing.sm,
  },
  notificationBadgeText: {
    color: "#FFFFFF",
    fontSize: 9,
    fontWeight: "600",
  },
  menuContainer: {
    minWidth: 200,
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
  containerMobile: {
    paddingHorizontal: Spacing.md,
    paddingTop: Spacing.sm,
    paddingBottom: 0,
  },
  notificationsContainer: {
    width: 350,
    borderLeftWidth: 1,
    borderLeftColor: "#EBEBEB",
    backgroundColor: "#FFFFFF",
    maxHeight: 400,
  },
  notificationsHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: "#EBEBEB",
  },
  notificationsTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#222222",
  },
  notificationsList: {
    maxHeight: 350,
  },
  notificationItem: {
    flexDirection: "row",
    alignItems: "flex-start",
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
    borderRadius: 8,
    marginHorizontal: Spacing.sm,
    marginVertical: Spacing.xs,
    backgroundColor: "#FFFFFF",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  notificationPressable: {
    flex: 1,
  },
  notificationUnread: {
    backgroundColor: "#F8F9FF",
    borderColor: "#bf0a0a",
    borderWidth: 1,
  },
  notificationContent: {
    flex: 1,
  },
  notificationTitle: {
    fontSize: 14,
    fontWeight: "600",
    color: "#222222",
    marginBottom: Spacing.xs,
  },
  notificationTitleUnread: {
    color: "#FFFFFF",
  },
  notificationMessage: {
    fontSize: 13,
    color: "#666666",
    lineHeight: 18,
    marginBottom: Spacing.xs,
  },
  notificationMessageUnread: {
    color: "#FFFFFF",
  },
  notificationDate: {
    fontSize: 11,
    color: "#999999",
  },
  notificationDateUnread: {
    color: "#FFFFFF",
  },
  notificationTitleRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  unreadDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: "#bf0a0a",
    marginLeft: Spacing.xs,
  },
});
