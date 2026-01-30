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
  Alert,
  TextInput,
  Platform,
} from "react-native";
import { getStorage, ref as storageRef, uploadBytes, getDownloadURL, deleteObject } from 'firebase/storage';
import { useNavigation, useNavigationState } from "@react-navigation/native";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";

import { ThemedText } from "@/components/ThemedText";
import { Avatar } from "@/components/Avatar";
import { useAuth } from "@/contexts/AuthContext";
import { Colors, Spacing, BorderRadius } from "@/constants/theme";
import { collection, getDocs } from 'firebase/firestore';
import { db } from '@/lib/config';
import { useQueryClient } from '@tanstack/react-query';
import { setDocument } from '@/lib/firestore';
import { COLLECTIONS } from '@/lib/collections';

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
    route: "explore",
    icon: require("../../assets/icons/icon_2.png"),
  },
  {
    key: "favorites",
    label: "Favoritos",
    route: "favorites",
    icon: require("../../assets/icons/icon_4.png"),
  },
  {
    key: "profile",
    label: "Mis Clientes",
    route: "profile",
    icon: require("../../assets/icons/icon_1.png"),
  },
  {
    key: "achievements",
    label: "Mis Logros",
    route: "achievements",
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
  const [profileModalVisible, setProfileModalVisible] = useState(false);
  const [carouselIndex, setCarouselIndex] = useState(0);
  const [hoveredUpdate, setHoveredUpdate] = useState(false);
  const [hoveredDelete, setHoveredDelete] = useState(false);
  const [hoveredSave, setHoveredSave] = useState(false);
  const [editableName, setEditableName] = useState(user?.name || '');
  const [editableEmail, setEditableEmail] = useState(user?.email || '');
  const [editablePhone, setEditablePhone] = useState(user?.phone || '');
  const [editableDpi, setEditableDpi] = useState(user?.dpiNumber || '');
  const [editableBank, setEditableBank] = useState(user?.bankName || '');
  const [editableCard, setEditableCard] = useState(user?.card || '');
  const [banks, setBanks] = useState<{id: string, name: string}[]>([]);
  const [showBankDropdown, setShowBankDropdown] = useState(false);
  const dropdownHeight = useRef(new Animated.Value(0)).current;
  const [isEditingName, setIsEditingName] = useState(false);
  const [isEditingEmail, setIsEditingEmail] = useState(false);
  const [isEditingPhone, setIsEditingPhone] = useState(false);
  const [isEditingDpi, setIsEditingDpi] = useState(false);
  const [isEditingCard, setIsEditingCard] = useState(false);
  const [savingProfile, setSavingProfile] = useState(false);
  const queryClient = useQueryClient();

  useEffect(() => {
    setEditableName(user?.name || '');
    setEditableEmail(user?.email || '');
    setEditablePhone(user?.phone || '');
    setEditableDpi(user?.dpiNumber || '');
    setEditableBank(user?.bankName || '');
    setEditableCard(user?.card || '');
  }, [user]);

  useEffect(() => {
    const fetchBanks = async () => {
      try {
        const banksCollection = collection(db, 'banks');
        const banksSnapshot = await getDocs(banksCollection);
        const banksList = banksSnapshot.docs.map(doc => ({ id: doc.id, name: doc.data().name }));
        setBanks(banksList);
      } catch (error) {
        console.error('Error fetching banks:', error);
      }
    };
    fetchBanks();
  }, []);

  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const fileInputRef = useRef<any>(null);
  const [uploadingDpiFront, setUploadingDpiFront] = useState(false);
  const [uploadingDpiBack, setUploadingDpiBack] = useState(false);
  const fileInputFrontRef = useRef<any>(null);
  const fileInputBackRef = useRef<any>(null);
  const [hoveredSaveFront, setHoveredSaveFront] = useState(false);
  const [hoveredSaveBack, setHoveredSaveBack] = useState(false);

  // DPI viewer state (to show images full-screen) ✅
  const [dpiViewerVisible, setDpiViewerVisible] = useState(false);
  const [dpiViewerUrl, setDpiViewerUrl] = useState<string | null>(null);

  const handleAvatarClick = async () => {
    if (!user?.id) return;
    if (Platform.OS === 'web') {
      fileInputRef.current?.click();
      return;
    }

    // Try to open native image picker if available
    try {
      // @ts-ignore - optional dependency, only used on native when available
      const ImagePicker = await import('expo-image-picker');
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: false,
        quality: 0.8,
      });

      if (!result || (result as any).canceled) return;
      const asset = (result as any).assets && (result as any).assets[0];
      if (!asset?.uri) return;

      const uri: string = asset.uri;
      // Fetch blob and upload
      try {
        setUploadingAvatar(true);
        const response = await fetch(uri);
        const blob = await response.blob();
        const storage = getStorage();
        const fileName = `avatars/${user.id}/${Date.now()}_${uri.split('/').pop()}`;
        const storageReference = storageRef(storage, fileName);
        await uploadBytes(storageReference, blob as any);
        const downloadURL = await getDownloadURL(storageReference);

        const updatedUser = { ...(user as any), avatar: downloadURL } as any;
        await setDocument(COLLECTIONS.USERS, user.id, updatedUser);
        queryClient.setQueryData(['user'], updatedUser);
        if (typeof window !== 'undefined' && window.localStorage) {
          localStorage.setItem('userData', JSON.stringify(updatedUser));
        }

        Alert.alert('Guardado', 'Foto de perfil actualizada');
      } catch (err) {
        console.error('Error uploading avatar (native):', err);
        Alert.alert('Error', 'No se pudo subir la imagen');
      } finally {
        setUploadingAvatar(false);
      }
    } catch (err) {
      // expo-image-picker not available or failed
      Alert.alert('No disponible', 'El selector de imágenes no está disponible en esta plataforma. Por favor usa la versión web para subir tu foto.');
    }
  };

  const handleFileChange = async (e: any) => {
    const file = e?.target?.files && e.target.files[0];
    if (!file) return;
    if (!user?.id) return;

    setUploadingAvatar(true);
    try {
      const storage = getStorage();
      const fileName = `avatars/${user.id}/${Date.now()}_${file.name}`;
      const storageReference = storageRef(storage, fileName);
      // In web, File is a Blob and can be uploaded directly
      await uploadBytes(storageReference, file);
      const downloadURL = await getDownloadURL(storageReference);

      const updatedUser = { ...(user as any), avatar: downloadURL } as any;
      await setDocument(COLLECTIONS.USERS, user.id, updatedUser);
      queryClient.setQueryData(['user'], updatedUser);
      if (typeof window !== 'undefined' && window.localStorage) {
        localStorage.setItem('userData', JSON.stringify(updatedUser));
      }

      Alert.alert('Guardado', 'Foto de perfil actualizada');
    } catch (err) {
      console.error('Error uploading avatar (web):', err);
      Alert.alert('Error', 'No se pudo subir la imagen');
    } finally {
      setUploadingAvatar(false);
      // clear the input value so same file can be selected again
      try { if (fileInputRef.current) fileInputRef.current.value = null; } catch {};
    }
  };

  const handleDpiFrontClick = async () => {
    if (!user?.id) return;
    if (Platform.OS === 'web') {
      fileInputFrontRef.current?.click();
      return;
    }

    try {
      // @ts-ignore - optional dependency
      const ImagePicker = await import('expo-image-picker');
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: false,
        quality: 0.8,
      });
      if (!result || (result as any).canceled) return;
      const asset = (result as any).assets && (result as any).assets[0];
      if (!asset?.uri) return;
      const uri: string = asset.uri;

      try {
        setUploadingDpiFront(true);
        const response = await fetch(uri);
        const blob = await response.blob();
        const storage = getStorage();
        const fileName = `dpi/${user.id}/front_${Date.now()}_${uri.split('/').pop()}`;
        const storageReference = storageRef(storage, fileName);
        await uploadBytes(storageReference, blob as any);
        const downloadURL = await getDownloadURL(storageReference);

        const updatedUser = { ...(user as any), dpiDocument: { ...(user.dpiDocument || {}), front: downloadURL } } as any;
        await setDocument(COLLECTIONS.USERS, user.id, updatedUser);
        queryClient.setQueryData(['user'], updatedUser);
        if (typeof window !== 'undefined' && window.localStorage) {
          localStorage.setItem('userData', JSON.stringify(updatedUser));
        }

        Alert.alert('Guardado', 'DPI frontal actualizado');
      } catch (err) {
        console.error('Error uploading DPI front (native):', err);
        Alert.alert('Error', 'No se pudo subir la imagen');
      } finally {
        setUploadingDpiFront(false);
      }
    } catch (err) {
      Alert.alert('No disponible', 'El selector de imágenes no está disponible en esta plataforma.');
    }
  };

  const handleDpiFrontFileChange = async (e: any) => {
    const file = e?.target?.files && e.target.files[0];
    if (!file) return;
    if (!user?.id) return;

    setUploadingDpiFront(true);
    try {
      const storage = getStorage();
      const fileName = `dpi/${user.id}/front_${Date.now()}_${file.name}`;
      const storageReference = storageRef(storage, fileName);
      await uploadBytes(storageReference, file);
      const downloadURL = await getDownloadURL(storageReference);

      const updatedUser = { ...(user as any), dpiDocument: { ...(user.dpiDocument || {}), front: downloadURL } } as any;
      await setDocument(COLLECTIONS.USERS, user.id, updatedUser);
      queryClient.setQueryData(['user'], updatedUser);
      if (typeof window !== 'undefined' && window.localStorage) {
        localStorage.setItem('userData', JSON.stringify(updatedUser));
      }

      Alert.alert('Guardado', 'DPI frontal actualizado');
    } catch (err) {
      console.error('Error uploading DPI front (web):', err);
      Alert.alert('Error', 'No se pudo subir la imagen');
    } finally {
      setUploadingDpiFront(false);
      try { if (fileInputFrontRef.current) fileInputFrontRef.current.value = null; } catch {};
    }
  };

  const handleDpiBackClick = async () => {
    if (!user?.id) return;
    if (Platform.OS === 'web') {
      fileInputBackRef.current?.click();
      return;
    }

    try {
      // @ts-ignore - optional dependency
      const ImagePicker = await import('expo-image-picker');
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: false,
        quality: 0.8,
      });
      if (!result || (result as any).canceled) return;
      const asset = (result as any).assets && (result as any).assets[0];
      if (!asset?.uri) return;
      const uri: string = asset.uri;

      try {
        setUploadingDpiBack(true);
        const response = await fetch(uri);
        const blob = await response.blob();
        const storage = getStorage();
        const fileName = `dpi/${user.id}/back_${Date.now()}_${uri.split('/').pop()}`;
        const storageReference = storageRef(storage, fileName);
        await uploadBytes(storageReference, blob as any);
        const downloadURL = await getDownloadURL(storageReference);

        const updatedUser = { ...(user as any), dpiDocument: { ...(user.dpiDocument || {}), back: downloadURL } } as any;
        await setDocument(COLLECTIONS.USERS, user.id, updatedUser);
        queryClient.setQueryData(['user'], updatedUser);
        if (typeof window !== 'undefined' && window.localStorage) {
          localStorage.setItem('userData', JSON.stringify(updatedUser));
        }

        Alert.alert('Guardado', 'DPI posterior actualizado');
      } catch (err) {
        console.error('Error uploading DPI back (native):', err);
        Alert.alert('Error', 'No se pudo subir la imagen');
      } finally {
        setUploadingDpiBack(false);
      }
    } catch (err) {
      Alert.alert('No disponible', 'El selector de imágenes no está disponible en esta plataforma.');
    }
  };

  const handleDpiBackFileChange = async (e: any) => {
    const file = e?.target?.files && e.target.files[0];
    if (!file) return;
    if (!user?.id) return;

    setUploadingDpiBack(true);
    try {
      const storage = getStorage();
      const fileName = `dpi/${user.id}/back_${Date.now()}_${file.name}`;
      const storageReference = storageRef(storage, fileName);
      await uploadBytes(storageReference, file);
      const downloadURL = await getDownloadURL(storageReference);

      const updatedUser = { ...(user as any), dpiDocument: { ...(user.dpiDocument || {}), back: downloadURL } } as any;
      await setDocument(COLLECTIONS.USERS, user.id, updatedUser);
      queryClient.setQueryData(['user'], updatedUser);
      if (typeof window !== 'undefined' && window.localStorage) {
        localStorage.setItem('userData', JSON.stringify(updatedUser));
      }

      Alert.alert('Guardado', 'DPI posterior actualizado');
    } catch (err) {
      console.error('Error uploading DPI back (web):', err);
      Alert.alert('Error', 'No se pudo subir la imagen');
    } finally {
      setUploadingDpiBack(false);
      try { if (fileInputBackRef.current) fileInputBackRef.current.value = null; } catch {};
    }
  };

  const normalizedStatus = (user?.status || "").toString().toLowerCase();
  const slideAnim = useRef(new Animated.Value(-100)).current;
  const profileSlideAnim = useRef(new Animated.Value(600)).current;

  const isMobile = width < 768;
  const isTablet = width >= 768 && width < 1024;

  // Responsive input width for mobile
  const inputWidth: any = isMobile ? '100%' : 220;

  // Calcular notificaciones sin leer
  const unreadNotificationsCount = notifications.filter(notification => !notification.read).length;

  // Cargar notificaciones desde la API
  useEffect(() => {
    const loadNotifications = async () => {
      if (!user?.id) return;

      try {
        const apiUrl = process.env.EXPO_PUBLIC_API_URL;
        if (!apiUrl) {
          console.warn('EXPO_PUBLIC_API_URL no está configurado');
          return;
        }
        const response = await fetch(`${apiUrl}/notifications/${user.id}`, {
          headers: {
            'ngrok-skip-browser-warning': 'true',
          },
        });
        if (response.ok) {
          const data = await response.json();
          // Verificar que data sea un array
          if (Array.isArray(data)) {
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
            setNotifications([]);
          }
        } else {
          // No mostrar error en consola para respuestas no exitosas
          setNotifications([]);
        }
      } catch (error) {
        // No mostrar error en consola
        setNotifications([]);
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
    if (!state) return 'explore';
    
    // Find the Main route which contains MainTabNavigator
    const mainRoute = state.routes?.find(r => r.name === 'Main');
    if (mainRoute?.state) {
      // MainTabNavigator state - get the active tab
      const tabState = mainRoute.state;
      const activeTabIndex = tabState.index ?? 0;
      const activeTab = tabState.routes?.[activeTabIndex];
      return activeTab?.name || 'explore';
    }
    
    // Fallback: check if current route IS the Main route at current index
    const currentRoute = state.routes?.[state.index];
    if (currentRoute?.name === 'Main' && currentRoute.state) {
      const tabState = currentRoute.state;
      const activeTabIndex = tabState.index ?? 0;
      const activeTab = tabState.routes?.[activeTabIndex];
      return activeTab?.name || 'explore';
    }
    
    return 'explore';
  });

  // Use override if provided, otherwise use detected route
  const activeTabRoute = activeTabOverride || detectedTabRoute;

  const getIsActive = (itemKey: string, itemRoute: string) => {
    if (activeTabRoute === itemRoute) return true;
    if (itemKey === "explore" && activeTabRoute === "explore") return true;
    if (itemKey === "favorites" && activeTabRoute === "favorites") return true;
    if (itemKey === "profile" && activeTabRoute === "profile") return true;
    if (itemKey === "achievements" && activeTabRoute === "achievements") return true;
    return false;
  };

  const handleNavPress = (routeName: string) => {
    // Navigate to tab screen through the Main screen which contains MainTabNavigator
    (navigation as any).navigate('Main', { screen: routeName });
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
          'ngrok-skip-browser-warning': 'true',
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

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleMobileMenuClose = () => {
    setMobileMenuOpen(false);
  };

  if (isMobile) {
    return (
      <>
        <View style={styles.floatingNavContainer}>
          <Pressable style={styles.floatingUserButton} onPress={() => {
            setProfileModalVisible(true);
            Animated.timing(profileSlideAnim, {
              toValue: 0,
              duration: 300,
              useNativeDriver: true,
            }).start();
          }}>
            <Avatar 
              name={user?.name || "Usuario"} 
              size={40} 
            />
          </Pressable>
          <Pressable style={styles.floatingMenuButton} onPress={() => setMobileMenuOpen(!mobileMenuOpen)}>
            <View style={styles.hamburgerLine} />
            <View style={styles.hamburgerLine} />
            <View style={styles.hamburgerLine} />
            {unreadNotificationsCount > 0 && (
              <View style={styles.floatingMenuBadge}>
                <ThemedText style={styles.floatingMenuBadgeText}>
                  {unreadNotificationsCount > 9 ? '9+' : unreadNotificationsCount}
                </ThemedText>
              </View>
            )}
          </Pressable>
        </View>

        <Modal
          visible={mobileMenuOpen}
          transparent
          animationType="none"
          onRequestClose={handleMobileMenuClose}
        >
          <Pressable style={styles.mobileMenuOverlay} onPress={handleMobileMenuClose}>
            <View style={styles.mobileMenuFloating}>
              <View style={styles.mobileMenuHeader}>
                <Image
                  source={require("../../assets/images/icon.png")}
                  style={{ width: 40, height: 40 }}
                  resizeMode="contain"
                />
                <Pressable onPress={handleMobileMenuClose} style={styles.mobileMenuCloseButton}>
                  <Ionicons name="close" size={24} color="#222" />
                </Pressable>
              </View>
              
              {NAV_ITEMS.map((item) => {
                const isActive = getIsActive(item.key, item.route);
                return (
                  <Pressable
                    key={item.key}
                    style={styles.mobileMenuItem}
                    onPress={() => {
                      handleMobileMenuClose();
                      handleNavPress(item.route);
                    }}
                  >
                    {item.icon ? (
                      <Image source={item.icon} style={styles.mobileMenuItemIcon} resizeMode="contain" />
                    ) : null}
                    <ThemedText style={[styles.mobileMenuItemText, isActive && styles.mobileMenuItemTextActive]}>
                      {item.label}
                    </ThemedText>
                  </Pressable>
                );
              })}
              
              <View style={styles.mobileMenuDivider} />
              
              {MENU_OPTIONS.map((option) => (
                <Pressable
                  key={option.key}
                  style={styles.mobileMenuItem}
                  onPress={() => {
                    handleMobileMenuClose();
                    handleMenuOptionPress(option.key);
                  }}
                >
                  <Ionicons name={option.icon as keyof typeof Ionicons.glyphMap} size={20} color="#555" />
                  <ThemedText style={styles.mobileMenuItemText}>{option.label}</ThemedText>
                  {option.key === 'notifications' && unreadNotificationsCount > 0 && (
                    <View style={styles.mobileMenuBadge}>
                      <ThemedText style={styles.mobileMenuBadgeText}>
                        {unreadNotificationsCount > 99 ? '99+' : unreadNotificationsCount}
                      </ThemedText>
                    </View>
                  )}
                </Pressable>
              ))}
            </View>
          </Pressable>
        </Modal>
      </>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.navbarWrapper}>
        <View style={styles.topBar}>
          <View style={styles.innerContainer}>
            <Pressable
              style={styles.logoContainer}
              onPress={() => handleNavPress("explore")}
            >
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

            <View style={styles.rightSection}>
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

              <Pressable 
                style={styles.profileButton}
                onPress={() => {
                  setProfileModalVisible(true);
                  Animated.timing(profileSlideAnim, {
                    toValue: 0,
                    duration: 300,
                    useNativeDriver: true,
                  }).start();
                }}
              >
                {user?.avatar ? (
                  <Image source={{ uri: user.avatar }} style={styles.profileImage} />
                ) : (
                  <Avatar 
                    name={user?.name || "Usuario"} 
                    size={36} 
                  />
                )}
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

      {profileModalVisible && (
        <View style={styles.profileModalOverlay}>
          <Pressable
            style={styles.profileModalBackdrop}
            onPress={() => {
              Animated.timing(profileSlideAnim, {
                toValue: 600,
                duration: 300,
                useNativeDriver: true,
              }).start(() => setProfileModalVisible(false));
            }}
          />

          <Animated.View 
            style={[
              isMobile ? styles.profileModalSidebarMobile : styles.profileModalSidebar,
              { transform: isMobile ? [{ translateY: profileSlideAnim }] : [{ translateX: profileSlideAnim }] }
            ]}
          >
            <View style={styles.profileModalHeader}>
              <View style={{ width: 20 }} />
              <ThemedText style={styles.profileModalTitle}>Mi Perfil</ThemedText>
            </View>
            <ScrollView 
              style={styles.profileModalScroll}
              contentContainerStyle={styles.profileModalBody}
            >
              <ThemedText style={styles.profileModalLabel}>Foto de Perfil</ThemedText>
              <View style={styles.avatarContainer}>
                {user?.avatar ? (
                  <Image
                    source={{ uri: user.avatar }}
                    style={styles.profileModalAvatar}
                  />
                ) : (
                  <View style={styles.profileModalAvatarPlaceholder}>
                    <ThemedText style={styles.profileModalAvatarInitial}>
                      {user?.name ? user.name.charAt(0).toUpperCase() : "U"}
                    </ThemedText>
                  </View>
                )}
                <View style={styles.avatarButtons}>
                  <Pressable 
                    style={hoveredUpdate ? styles.updateButtonHovered : styles.updateButton}
                    onHoverIn={() => setHoveredUpdate(true)}
                    onHoverOut={() => setHoveredUpdate(false)}
                    onPress={() => handleAvatarClick()}
                    disabled={uploadingAvatar}
                  >
                    <ThemedText style={hoveredUpdate ? styles.updateButtonTextHovered : styles.updateButtonText}>{uploadingAvatar ? 'Cargando...' : 'Actualizar'}</ThemedText>
                  </Pressable>
                  <Pressable 
                    style={hoveredDelete ? styles.deleteButtonHovered : styles.deleteButton}
                    onHoverIn={() => setHoveredDelete(true)}
                    onHoverOut={() => setHoveredDelete(false)}
                    onPress={async () => {
                      if (!user?.id) return;
                      setUploadingAvatar(true);
                      try {
                        // Try removing file from Firebase Storage if present
                        if (user?.avatar) {
                          try {
                            const storage = getStorage();
                            // Extract storage path from download URL
                            const match = user.avatar.match(/\/o\/(.*?)\?/);
                            if (match && match[1]) {
                              const path = decodeURIComponent(match[1]);
                              const storageReference = storageRef(storage, path);
                              await deleteObject(storageReference);
                            }
                          } catch (storageErr) {
                            console.warn('Error deleting avatar from storage:', storageErr);
                          }
                        }

                        await setDocument(COLLECTIONS.USERS, user.id, { ...user, avatar: null });
                        queryClient.setQueryData(['user'], { ...user, avatar: null });
                        if (typeof window !== 'undefined' && window.localStorage) {
                          const updated = { ...user, avatar: null };
                          localStorage.setItem('userData', JSON.stringify(updated));
                        }
                        Alert.alert('Eliminado', 'Foto de perfil eliminada');
                      } catch (err) {
                        console.error('Error deleting avatar:', err);
                        Alert.alert('Error', 'No se pudo eliminar la foto');
                      } finally {
                        setUploadingAvatar(false);
                      }
                    }}
                    disabled={uploadingAvatar}
                  >
                    <Ionicons name="trash" size={24} color={hoveredDelete ? '#bf0a0a' : '#fff'} />
                  </Pressable>

                  {/* Hidden file input for web */}
                  {Platform.OS === 'web' && (
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/*"
                      style={{ display: 'none' }}
                      onChange={handleFileChange}
                    />
                  )}

                  <View style={styles.statusContainer}>
                    <ThemedText style={styles.profileModalDetail}>
                      Status: <ThemedText style={normalizedStatus === 'verified' ? styles.statusVerified : (normalizedStatus === 'notverified' || normalizedStatus === 'not_verified') ? styles.statusNotVerified : styles.statusDefault}>{user?.status || "N/A"}</ThemedText>
                    </ThemedText>
                  </View>
                </View>
              </View>
              <View style={styles.profileModalUserInfo}>
                <View style={styles.fieldRow}>
                    <View style={styles.fieldColumn}>
                    <ThemedText style={styles.profileModalLabel}>Nombre</ThemedText>
                    <View style={styles.inputContainer}>
                        <TextInput
                          style={[styles.nameInput, { width: inputWidth, backgroundColor: isEditingName ? '#fff' : '#f5f5f5', opacity: isEditingName ? 1 : 0.6, outlineWidth: 0, outlineColor: 'transparent' }]}
                          value={editableName}
                          onChangeText={setEditableName}
                          placeholder="Ingresa tu nombre"
                          editable={isEditingName}
                          focusable={isEditingName}
                          onBlur={() => setIsEditingName(false)}
                          onSubmitEditing={() => setIsEditingName(false)}
                          pointerEvents={isEditingName ? 'auto' : 'none'}
                        />
                      <Pressable onPress={() => setIsEditingName(true)}>
                        <Ionicons name="pencil" size={20} color="#666" style={styles.inputIcon} />
                      </Pressable>
                    </View>
                  </View>
                    <View style={styles.fieldColumn}> 
                    <ThemedText style={styles.profileModalLabel}>Email</ThemedText>
                    <View style={styles.inputContainer}>
                        <TextInput
                          style={[styles.nameInput, { width: inputWidth, backgroundColor: isEditingEmail ? '#fff' : '#f5f5f5', opacity: isEditingEmail ? 1 : 0.6, outlineWidth: 0, outlineColor: 'transparent' }]}
                          value={editableEmail}
                          onChangeText={setEditableEmail}
                          placeholder="Ingresa tu email"
                          editable={isEditingEmail}
                          focusable={isEditingEmail}
                          onBlur={() => setIsEditingEmail(false)}
                          onSubmitEditing={() => setIsEditingEmail(false)}
                          pointerEvents={isEditingEmail ? 'auto' : 'none'}
                        />
                      <Pressable onPress={() => setIsEditingEmail(true)}>
                        <Ionicons name="pencil" size={20} color="#666" style={styles.inputIcon} />
                      </Pressable>
                    </View>
                  </View>
                </View>
                <View style={styles.fieldRow}>
                  <View style={styles.fieldColumn}>
                    <ThemedText style={styles.profileModalLabel}>Teléfono</ThemedText>
                    <View style={styles.inputContainer}>
                        <TextInput
                          style={[styles.nameInput, { width: inputWidth, backgroundColor: isEditingPhone ? '#fff' : '#f5f5f5', opacity: isEditingPhone ? 1 : 0.6, outlineWidth: 0, outlineColor: 'transparent' }]}
                          value={editablePhone}
                          onChangeText={setEditablePhone}
                          placeholder="Ingresa tu teléfono"
                          editable={isEditingPhone}
                          focusable={isEditingPhone}
                          onBlur={() => setIsEditingPhone(false)}
                          onSubmitEditing={() => setIsEditingPhone(false)}
                          pointerEvents={isEditingPhone ? 'auto' : 'none'}
                        />
                      <Pressable onPress={() => setIsEditingPhone(true)}>
                        <Ionicons name="pencil" size={20} color="#666" style={styles.inputIcon} />
                      </Pressable>
                    </View>
                  </View>
                    <View style={styles.fieldColumn}> 
                    <ThemedText style={styles.profileModalLabel}>DPI</ThemedText>
                    <View style={styles.inputContainer}>
                        <TextInput
                          style={[styles.nameInput, { width: inputWidth, backgroundColor: isEditingDpi ? '#fff' : '#f5f5f5', opacity: isEditingDpi ? 1 : 0.6, outlineWidth: 0, outlineColor: 'transparent' }]}
                          value={editableDpi}
                          onChangeText={setEditableDpi}
                          placeholder="Ingresa tu DPI"
                          editable={isEditingDpi}
                          focusable={isEditingDpi}
                          onBlur={() => setIsEditingDpi(false)}
                          onSubmitEditing={() => setIsEditingDpi(false)}
                          pointerEvents={isEditingDpi ? 'auto' : 'none'}
                        />
                      <Pressable onPress={() => setIsEditingDpi(true)}>
                        <Ionicons name="pencil" size={20} color="#666" style={styles.inputIcon} />
                      </Pressable>
                    </View>
                  </View>
                </View>
                <View style={styles.fieldRow}>
                  <View style={styles.fieldColumn}>
                    <ThemedText style={styles.profileModalLabel}>Banco</ThemedText>
                    <Pressable onPress={() => {
                      const newState = !showBankDropdown;
                      setShowBankDropdown(newState);
                      Animated.timing(dropdownHeight, {
                        toValue: newState ? 150 : 0,
                        duration: 300,
                        useNativeDriver: false,
                      }).start();
                    }} style={styles.inputContainer}>
                        <TextInput
                          style={[styles.nameInput, {
                            width: inputWidth,
                            borderBottomWidth: showBankDropdown ? 0 : 1,
                            borderBottomLeftRadius: showBankDropdown ? 0 : 8,
                            borderBottomRightRadius: showBankDropdown ? 0 : 8,
                            borderColor: showBankDropdown ? 'transparent' : '#ccc'
                          }]}
                          value={editableBank}
                          editable={false}
                          placeholder="Selecciona un banco"
                        />
                      <Ionicons name={showBankDropdown ? "chevron-up" : "chevron-down"} size={20} color="#666" style={styles.inputIcon} />
                    </Pressable>
                    <Animated.View style={[styles.dropdown, {
                      height: dropdownHeight,
                      borderTopWidth: showBankDropdown ? 1 : 0,
                      borderTopColor: showBankDropdown ? '#ccc' : 'transparent',
                      borderWidth: showBankDropdown ? 1 : 0,
                      borderColor: showBankDropdown ? '#ccc' : 'transparent'
                    }]}> 
                      <ScrollView>
                        {banks.map(bank => (
                          <Pressable
                            key={bank.id}
                            onPress={() => {
                              setEditableBank(bank.name);
                              setShowBankDropdown(false);
                              Animated.timing(dropdownHeight, {
                                toValue: 0,
                                duration: 300,
                                useNativeDriver: false,
                              }).start();
                            }}
                            style={styles.dropdownItem}
                          >
                            <ThemedText style={styles.dropdownText}>{bank.name}</ThemedText>
                          </Pressable>
                        ))}
                      </ScrollView>
                    </Animated.View>
                  </View>
                    <View style={styles.fieldColumn}> 
                    <ThemedText style={styles.profileModalLabel}>Cuenta</ThemedText>
                    <View style={styles.inputContainer}>
                        <TextInput
                          style={[styles.nameInput, { width: inputWidth, backgroundColor: isEditingCard ? '#fff' : '#f5f5f5', opacity: isEditingCard ? 1 : 0.6, outlineWidth: 0, outlineColor: 'transparent' }]}
                          value={editableCard}
                          onChangeText={setEditableCard}
                          placeholder="Ingresa tu cuenta"
                          editable={isEditingCard}
                          focusable={isEditingCard}
                          onBlur={() => setIsEditingCard(false)}
                          onSubmitEditing={() => setIsEditingCard(false)}
                          pointerEvents={isEditingCard ? 'auto' : 'none'}
                        />
                      <Pressable onPress={() => setIsEditingCard(true)}>
                        <Ionicons name="pencil" size={20} color="#666" style={styles.inputIcon} />
                      </Pressable>
                    </View>
                  </View>
                </View>
              </View>
              <View style={styles.profileModalActions}>
                <View style={{ width: '100%', marginBottom: 12, alignItems: 'center' }}>
                  <Pressable
                    style={[
                      hoveredSave ? styles.updateButtonHovered : styles.updateButton,
                      (savingProfile || uploadingAvatar) && { opacity: 0.7 },
                      isMobile ? { transform: [{ translateX: 0 }], width: '90%', alignSelf: 'center' } : { transform: [{ translateX: -25 }] }
                    ]}
                    onHoverIn={() => setHoveredSave(true)}
                    onHoverOut={() => setHoveredSave(false)}
                    onPress={async () => {
                      if (!user?.id) return;
                      setSavingProfile(true);
                      const updatedUser = {
                        ...user,
                        name: editableName,
                        email: editableEmail,
                        phone: editablePhone,
                        dpiNumber: editableDpi,
                        bankName: editableBank,
                        card: editableCard,
                      } as any;

                      try {
                        // Actualizar en Firestore
                        await setDocument(COLLECTIONS.USERS, user.id, updatedUser);

                        // Actualizar caché local (react-query) y storage
                        queryClient.setQueryData(['user'], updatedUser);
                        if (typeof window !== 'undefined' && window.localStorage) {
                          localStorage.setItem('userData', JSON.stringify(updatedUser));
                        }

                        // Intentar notificar API externa (opcional)
                        try {
                          const apiUrl = process.env.EXPO_PUBLIC_API_URL;
                          if (apiUrl) {
                            await fetch(`${apiUrl}/user/${user.id}`, {
                              method: 'PUT',
                              headers: { 'Content-Type': 'application/json' },
                              body: JSON.stringify({
                                name: editableName,
                                email: editableEmail,
                                phone: editablePhone,
                                dpiNumber: editableDpi,
                                bankName: editableBank,
                                card: editableCard,
                              }),
                            });
                          }
                        } catch (externalErr) {
                          // No crítico, sólo loggear
                          console.warn('Error notifying external API:', externalErr);
                        }

                        Alert.alert('Guardado', 'Perfil actualizado correctamente');
                      } catch (err) {
                        console.error('Error saving profile:', err);
                        Alert.alert('Error', 'No se pudo guardar el perfil');
                      } finally {
                        setSavingProfile(false);
                        // cerrar modo edición en todos los campos
                        setIsEditingName(false);
                        setIsEditingEmail(false);
                        setIsEditingPhone(false);
                        setIsEditingDpi(false);
                        setIsEditingCard(false);
                      }
                    }}
                    disabled={savingProfile || uploadingAvatar}
                  >
                    <ThemedText style={(savingProfile || uploadingAvatar || hoveredSave) ? styles.updateButtonTextHovered : styles.updateButtonText}>{uploadingAvatar ? 'Cargando...' : (savingProfile ? 'Guardando...' : 'Guardar')}</ThemedText>
                  </Pressable>
                </View>

                <View style={[styles.dpiTilesContainer, isMobile && styles.dpiTilesContainerMobile]}>
                  <View style={[styles.dpiTileWrapper, isMobile && styles.dpiTileWrapperMobile]}>
                    <View style={styles.dpiTile}>
                      {user?.dpiDocument?.front ? (
                        <Pressable
                          onPress={() => {
                            setDpiViewerUrl(user.dpiDocument.front);
                            setDpiViewerVisible(true);
                          }}
                          style={{ width: '100%', height: '100%' }}
                        >
                          <Image
                            source={{ uri: user.dpiDocument.front }}
                            style={styles.dpiImage}
                            resizeMode="cover"
                          />
                        </Pressable>
                      ) : (
                        <View style={styles.dpiPlaceholder}>
                          <Ionicons name="alert-circle" size={48} color="#bf0a0a" />
                          <ThemedText style={styles.carouselPlaceholderText}>
                            Aún no has cargado tu DPI (frontal)
                          </ThemedText>
                        </View>
                      )}
                    </View>

                    {Platform.OS === 'web' && (
                      <input
                        ref={fileInputFrontRef}
                        type="file"
                        accept="image/*"
                        style={{ display: 'none' }}
                        onChange={handleDpiFrontFileChange}
                      />
                    )}

                    <Pressable
                      style={[hoveredSaveFront ? styles.updateButtonHovered : styles.updateButton, uploadingDpiFront && { opacity: 0.7 }, { width: '100%', marginTop: 8 }]}
                      onHoverIn={() => setHoveredSaveFront(true)}
                      onHoverOut={() => setHoveredSaveFront(false)}
                      onPress={() => handleDpiFrontClick()}
                      disabled={uploadingDpiFront}
                    >
                      <ThemedText style={(uploadingDpiFront || hoveredSaveFront) ? styles.updateButtonTextHovered : styles.updateButtonText}>{uploadingDpiFront ? 'Cargando...' : 'Guardar DPI Frontal'}</ThemedText>
                    </Pressable>
                  </View>

                  <View style={[styles.dpiTileWrapper, isMobile && styles.dpiTileWrapperMobile]}>
                    <View style={styles.dpiTile}>
                      {user?.dpiDocument?.back ? (
                        <Pressable
                          onPress={() => {
                            setDpiViewerUrl(user.dpiDocument.back);
                            setDpiViewerVisible(true);
                          }}
                          style={{ width: '100%', height: '100%' }}
                        >
                          <Image
                            source={{ uri: user.dpiDocument.back }}
                            style={styles.dpiImage}
                            resizeMode="cover"
                          />
                        </Pressable>
                      ) : (
                        <View style={styles.dpiPlaceholder}>
                          <Ionicons name="alert-circle" size={48} color="#bf0a0a" />
                          <ThemedText style={styles.carouselPlaceholderText}>
                            Aún no has cargado tu DPI (posterior)
                          </ThemedText>
                        </View>
                      )}
                    </View>

                    {Platform.OS === 'web' && (
                      <input
                        ref={fileInputBackRef}
                        type="file"
                        accept="image/*"
                        style={{ display: 'none' }}
                        onChange={handleDpiBackFileChange}
                      />
                    )}

                    <Pressable
                      style={[hoveredSaveBack ? styles.updateButtonHovered : styles.updateButton, uploadingDpiBack && { opacity: 0.7 }, { width: '100%', marginTop: 8 }]}
                      onHoverIn={() => setHoveredSaveBack(true)}
                      onHoverOut={() => setHoveredSaveBack(false)}
                      onPress={() => handleDpiBackClick()}
                      disabled={uploadingDpiBack}
                    >
                      <ThemedText style={(uploadingDpiBack || hoveredSaveBack) ? styles.updateButtonTextHovered : styles.updateButtonText}>{uploadingDpiBack ? 'Cargando...' : 'Guardar DPI Posterior'}</ThemedText>
                    </Pressable>
                  </View>
                </View>
              </View>
            </ScrollView>
          </Animated.View>

          {/* DPI viewer modal */}
          {dpiViewerVisible && (
            <Modal visible={dpiViewerVisible} transparent animationType="fade" onRequestClose={() => setDpiViewerVisible(false)}>
              <Pressable style={styles.dpiViewerOverlay} onPress={() => setDpiViewerVisible(false)}>
                {dpiViewerUrl ? (
                  <Image source={{ uri: dpiViewerUrl }} style={styles.dpiViewerImage} resizeMode="contain" />
                ) : null}
                <Pressable style={styles.dpiViewerCloseButton} onPress={() => setDpiViewerVisible(false)}>
                  <Ionicons name="close" size={28} color="#fff" />
                </Pressable>
              </Pressable>
            </Modal>
          )}

        </View>
      )}
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
  floatingNavContainer: {
    position: "fixed" as any,
    top: 16,
    left: 16,
    right: 16,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    zIndex: 1000,
    pointerEvents: "box-none" as any,
  },
  floatingUserButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: "#fff",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 4,
    alignItems: "center",
    justifyContent: "center",
    overflow: "hidden",
  },
  floatingUserImage: {
    width: 44,
    height: 44,
    borderRadius: 22,
  },
  floatingMenuButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: "#fff",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 4,
    alignItems: "center",
    justifyContent: "center",
    gap: 4,
  },
  hamburgerLine: {
    width: 20,
    height: 2,
    backgroundColor: "#333",
    borderRadius: 1,
  },
  floatingMenuBadge: {
    position: "absolute",
    top: -4,
    right: -4,
    backgroundColor: "#bf0a0a",
    borderRadius: 10,
    minWidth: 18,
    height: 18,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 4,
  },
  floatingMenuBadgeText: {
    color: "#fff",
    fontSize: 10,
    fontWeight: "700",
  },
  mobileMenuOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "flex-end",
    flexDirection: "row",
  },
  mobileMenuFloating: {
    width: "80%",
    maxWidth: 320,
    height: "100%",
    backgroundColor: "#fff",
    shadowColor: "#000",
    shadowOffset: { width: -4, height: 0 },
    shadowOpacity: 0.15,
    shadowRadius: 20,
    elevation: 8,
    paddingVertical: 16,
  },
  mobileMenuHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 24,
    paddingBottom: 24,
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
    marginBottom: 8,
  },
  mobileMenuCloseButton: {
    padding: 8,
  },
  mobileMenuItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 14,
    paddingHorizontal: 24,
    gap: 12,
  },
  mobileMenuItemIcon: {
    width: 20,
    height: 20,
  },
  mobileMenuItemText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#333",
  },
  mobileMenuItemTextActive: {
    color: "#bf0a0a",
  },
  mobileMenuDivider: {
    height: 1,
    backgroundColor: "#eee",
    marginVertical: 8,
    marginHorizontal: 24,
  },
  mobileMenuBadge: {
    backgroundColor: "#bf0a0a",
    borderRadius: 10,
    minWidth: 20,
    height: 20,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 6,
    marginLeft: "auto",
  },
  mobileMenuBadgeText: {
    color: "#fff",
    fontSize: 11,
    fontWeight: "700",
  },
  profileModalOverlay: {
    position: 'fixed' as any,
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    zIndex: 2000,
    flexDirection: 'row',
    alignItems: 'stretch',
  },
  profileModalBackdrop: {
    flex: 1,
  },
  profileModalSidebar: {
    position: 'fixed' as any,
    right: 0,
    top: 0,
    height: '100%',
    width: 600,
    backgroundColor: "#fff",
    shadowColor: "#000",
    shadowOffset: { width: -4, height: 0 },
    shadowOpacity: 0.15,
    shadowRadius: 20,
    elevation: 8,
    paddingTop: 20,
    zIndex: 2001,
  },
  profileModalHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "flex-start",
    paddingHorizontal: 20,
    paddingBottom: 20,
    borderBottomWidth: 1,
    borderBottomColor: "#999",
  },
  profileModalScroll: {
    flex: 1,
  },
  profileModalAvatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
    alignSelf: "flex-start",
    marginBottom: 10,
  },
  profileModalAvatarPlaceholder: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: "#bf0a0a",
    alignSelf: "flex-start",
    marginBottom: 10,
    justifyContent: "center",
    alignItems: "center",
  },
  profileModalAvatarInitial: {
    color: "#fff",
    fontSize: 40,
    fontWeight: "bold",
  },
  profileModalLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 10,
    textAlign: 'left',
  },
  nameInput: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    padding: 10,
    fontSize: 16,
    color: '#333',
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  inputIcon: {
    marginLeft: 10,
  },
  dropdown: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderTopWidth: 0,
    borderTopLeftRadius: 0,
    borderTopRightRadius: 8,
    backgroundColor: '#fff',
    overflow: 'hidden',
  },
  dropdownItem: {
    padding: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  dropdownText: {
    fontSize: 16,
    color: '#333',
  },
  fieldRow: {
    flexDirection: 'row',
    marginBottom: 15,
  },
  fieldColumn: {
    flex: 1,
    marginHorizontal: 10,
  },
  avatarContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 20,
  },
  avatarButtons: {
    flexDirection: 'row',
    gap: 10,
  },
  updateButton: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: '#bf0a0a',
    borderRadius: 8,
    paddingHorizontal: 15,
    paddingVertical: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  updateButtonHovered: {
    backgroundColor: '#bf0a0a',
    borderWidth: 1,
    borderColor: '#bf0a0a',
    borderRadius: 8,
    paddingHorizontal: 15,
    paddingVertical: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  updateButtonText: {
    color: '#bf0a0a',
    fontSize: 14,
    fontWeight: '600',
  },
  updateButtonTextHovered: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  deleteButton: {
    backgroundColor: '#bf0a0a',
    borderRadius: 8,
    padding: 10,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'transparent',
  },
  deleteButtonHovered: {
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 10,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#bf0a0a',
  },
  statusContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 10,
  },
  profileModalUserInfo: {
    flex: 1,
    marginTop: 20,
    alignItems: "flex-start",
  },
  profileModalName: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 10,
  },
  profileModalDetail: {
    fontSize: 14,
    color: "#666",
    textAlign: "left",
  },
  profileModalEmail: {
    fontSize: 14,
    color: "#666",
  },
  profileModalPhone: {
    fontSize: 14,
    color: "#666",
  },
  profileModalStatus: {
    fontSize: 14,
    color: "#666",
  },
  statusVerified: {
    color: "green",
  },
  statusNotVerified: {
    color: "red",
  },
  statusDefault: {
    color: "#666",
  },
  profileModalActions: {
    marginTop: 20,
  },
  profileModalButton: {
    backgroundColor: "#007AFF",
    padding: 15,
    borderRadius: 10,
    alignItems: "center",
    marginBottom: 10,
  },
  profileModalButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
  profileModalCloseButton: {
    backgroundColor: "#f0f0f0",
    padding: 15,
    borderRadius: 10,
    alignItems: "center",
  },
  profileModalCloseButtonText: {
    color: "#333",
    fontSize: 16,
  },
  profileModalTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#333",
    flex: 1,
  },
  profileModalBody: {
    alignItems: "flex-start",
    paddingVertical: 20,
    paddingHorizontal: 20,
  },
  profileInfo: {
    alignItems: "center",
    marginTop: 15,
  },
  profileName: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 10,
  },
  profileDetail: {
    fontSize: 14,
    color: "#666",
    marginBottom: 5,
  },
  carouselContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "flex-end",
    marginTop: 20,
    marginLeft: 160,
  },
  carouselArrow: {
    padding: 5,
  },
  carouselContent: {
    flex: 1,
    height: 200,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 10,
    backgroundColor: "#f9f9f9",
  },
  carouselImage: {
    width: "100%",
    height: "100%",
    borderRadius: 10,
  },
  carouselPlaceholder: {
    alignItems: "center",
    justifyContent: "center",
  },
  carouselPlaceholderText: {
    marginTop: 10,
    fontSize: 14,
    color: "#666",
    textAlign: "center",
  },
  dpiTilesContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    width: '100%',
    marginTop: 20,
    alignItems: 'flex-start',
  },
  dpiTileWrapper: {
    width: 260,
    alignItems: 'center',
    marginHorizontal: 12,
  },
  dpiTile: {
    width: '100%',
    height: 200,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 10,
    backgroundColor: '#f9f9f9',
    overflow: 'hidden',
    justifyContent: 'center',
    alignItems: 'center',
  },
  dpiImage: {
    width: '100%',
    height: '100%',
    borderRadius: 10,
  },
  dpiPlaceholder: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 10,
  },
  // Mobile responsive adjustments ✅
  dpiTilesContainerMobile: {
    flexDirection: 'column',
    alignItems: 'center',
    paddingHorizontal: 16,
  },
  dpiTileWrapperMobile: {
    width: '100%',
    maxWidth: 360,
    alignItems: 'center',
    marginHorizontal: 0,
    marginBottom: 12,
  },
  profileModalSidebarMobile: {
    position: 'fixed' as any,
    left: 0,
    right: 0,
    bottom: 0,
    top: 0,
    width: '100%',
    height: '100%',
    backgroundColor: '#fff',
    paddingTop: 20,
    zIndex: 2001,
    borderTopLeftRadius: 8,
    borderTopRightRadius: 8,
  },
  dpiViewerOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.9)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 3000,
  },
  dpiViewerImage: {
    width: '90%',
    height: '80%',
  },
  dpiViewerCloseButton: {
    position: 'absolute',
    top: 40,
    right: 30,
    padding: 8,
  },
});
