import React, { useState, useEffect, useCallback } from "react";
import {
  View,
  StyleSheet,
  Pressable,
  ScrollView,
  Dimensions,
  Platform,
  TextInput,
  Image,
  Modal,
} from "react-native";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  interpolate,
  Easing,
} from "react-native-reanimated";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useHeaderHeight } from "@react-navigation/elements";
import { useBottomTabBarHeight } from "@react-navigation/bottom-tabs";
import { useFocusEffect } from "@react-navigation/native";
import { Ionicons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { ProfileStackParamList } from "@/navigation/ProfileStackNavigator";

const isWeb = Platform.OS === "web";

const ClientCountButton = ({ clientCount, onPress }: { clientCount: number; onPress: () => void }) => {
  const buttonScale = useSharedValue(1);
  const buttonAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: buttonScale.value }],
  }));

  const handlePressIn = () => {
    buttonScale.value = withTiming(0.95, { duration: 100 });
  };

  const handlePressOut = () => {
    buttonScale.value = withTiming(1, { duration: 100 });
  };

  return (
    <Animated.View style={buttonAnimatedStyle}>
      <Pressable
        onPress={onPress}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        style={styles.clientCountCircle}
      >
        <Ionicons name="people" size={16} color="#bf0a0a" />
        <ThemedText style={styles.clientCountText}>{clientCount}</ThemedText>
      </Pressable>
    </Animated.View>
  );
};

import { FilterChip } from "@/components/FilterChip";
import { ThemedText } from "@/components/ThemedText";
import { useTheme } from "@/hooks/useTheme";
import { Property, mapAPIPropertyToProperty } from "@/data/properties";
import { fetchPropiedades } from "@/lib/api";
import { Spacing, BorderRadius, Colors, Shadows } from "@/constants/theme";

type FilterType = "day" | "month" | "all";

interface Client {
  id: string;
  name: string;
  date: string;
  comment: string;
  phone?: string;
  email?: string;
  additionalInfo?: string;
}

export default function ProfileScreen() {
  const insets = useSafeAreaInsets();
  const headerHeight = useHeaderHeight();
  const tabBarHeight = isWeb ? 0 : useBottomTabBarHeight();
  const { theme, isDark } = useTheme();
  const navigation = useNavigation<NativeStackNavigationProp<ProfileStackParamList>>();

  const [selectedFilter, setSelectedFilter] = useState<FilterType>("day");
  const [properties, setProperties] = useState<Property[]>([]);
  const [loading, setLoading] = useState(true);
  const [webSearchExpanded, setWebSearchExpanded] = useState(false);
  const [webSearchQuery, setWebSearchQuery] = useState("");

  const searchExpandAnim = useSharedValue(0);

  const searchButtonAnimatedStyle = useAnimatedStyle(() => ({
    width: interpolate(searchExpandAnim.value, [0, 1], [48, 400]),
  }));

  const searchInputAnimatedStyle = useAnimatedStyle(() => ({
    opacity: searchExpandAnim.value,
    transform: [{ scale: searchExpandAnim.value }],
  }));

  const filters: { key: FilterType; label: string }[] = [
    { key: "day", label: "Día" },
    { key: "month", label: "Mes" },
    { key: "all", label: "Todo" },
  ];

  useFocusEffect(
    useCallback(() => {
      // Load properties with interested clients
      loadPropertiesWithClients();
    }, []),
  );

  const loadPropertiesWithClients = async () => {
    try {
      setLoading(true);
      
      // Mock properties data with clients interested
      const mockClients1: Client[] = [
        { id: "c1", name: "Juan Pérez", date: "2024-01-15", comment: "Me interesa esta propiedad para mi familia", phone: "555-1234", email: "juan@email.com", additionalInfo: "Busca financiación" },
        { id: "c2", name: "María García", date: "2024-01-20", comment: "Excelente ubicación", phone: "555-5678", email: "maria@email.com" },
      ];
      const mockClients2: Client[] = [
        { id: "c3", name: "Carlos López", date: "2024-01-10", comment: "Vista al mar impresionante", phone: "555-9012", email: "carlos@email.com", additionalInfo: "Tiene mascota" },
      ];
      const mockClients3: Client[] = [
        { id: "c4", name: "Ana Rodríguez", date: "2024-01-05", comment: "Perfecta para niños", phone: "555-3456", email: "ana@email.com" },
        { id: "c5", name: "Pedro Martínez", date: "2024-01-18", comment: "Jardín amplio", phone: "555-7890", email: "pedro@email.com", additionalInfo: "Trabaja desde casa" },
        { id: "c6", name: "Laura Sánchez", date: "2024-01-22", comment: "Me encanta el diseño", phone: "555-1111", email: "laura@email.com" },
      ];
      const mockClients4: Client[] = [
        { id: "c7", name: "Roberto Díaz", date: "2024-01-12", comment: "Estilo industrial único", phone: "555-2222", email: "roberto@email.com" },
      ];

      const mockProperties: (Property & { interestedClients: Client[] })[] = [
        {
          id: "1",
          title: "Casa Moderna Centro",
          location: "Centro Histórico, Ciudad de Guatemala",
          price: 250000,
          priceUnit: "Q",
          rating: 4.5,
          reviewCount: 12,
          description: "Hermosa casa moderna en el corazón de la ciudad",
          descripcionCorta: "Casa moderna con acabados de lujo",
          descripcionLarga: "Esta hermosa casa moderna ofrece espacios amplios y contemporáneos en el centro histórico. Cuenta con acabados de primera calidad, iluminación natural abundante y un diseño que combina elegancia con funcionalidad.",
          caracteristicas: ["3 habitaciones", "2 baños", "jardín", "estacionamiento"],
          proyectoCaracteristicas: [],
          imageUrl: "https://images.unsplash.com/photo-1564013799919-ab600027ffc6?w=800",
          imagenes: [],
          bedrooms: 3,
          bathrooms: 2,
          area: 180,
          amenities: ["Jardín", "Estacionamiento", "Seguridad 24/7"],
          isFavorite: false,
          projectName: "",
          propertyType: "Casa",
          estado: "Disponible",
          interestedClients: mockClients1,
        },
        {
          id: "2",
          title: "Apartamento Vista Mar",
          location: "Zona 10, Ciudad de Guatemala",
          price: 180000,
          priceUnit: "Q",
          rating: 4.2,
          reviewCount: 8,
          description: "Apartamento con vista panorámica al mar",
          descripcionCorta: "Vista espectacular al océano Pacífico",
          descripcionLarga: "Disfrute de vistas panorámicas al océano Pacífico desde este moderno apartamento. Ubicado en una zona exclusiva con acceso a playas privadas y amenidades de lujo.",
          caracteristicas: ["2 habitaciones", "2 baños", "balcón", "gimnasio"],
          proyectoCaracteristicas: [],
          imageUrl: "https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?w=800",
          imagenes: [],
          bedrooms: 2,
          bathrooms: 2,
          area: 120,
          amenities: ["Gimnasio", "Piscina", "Vista al mar"],
          isFavorite: false,
          projectName: "",
          propertyType: "Apartamento",
          estado: "Disponible",
          interestedClients: mockClients2,
        },
        {
          id: "3",
          title: "Villa Familiar Jardín",
          location: "Antigua Guatemala",
          price: 320000,
          priceUnit: "Q",
          rating: 4.8,
          reviewCount: 15,
          description: "Villa espaciosa perfecta para familias",
          descripcionCorta: "Espacios amplios para toda la familia",
          descripcionLarga: "Esta villa familiar ofrece espacios amplios y un hermoso jardín. Ideal para familias que buscan tranquilidad y comodidad en un entorno colonial.",
          caracteristicas: ["4 habitaciones", "3 baños", "jardín amplio", "terraza"],
          proyectoCaracteristicas: [],
          imageUrl: "https://images.unsplash.com/photo-1570129477492-45c003edd2be?w=800",
          imagenes: [],
          bedrooms: 4,
          bathrooms: 3,
          area: 250,
          amenities: ["Jardín", "Terraza", "Área de juegos"],
          isFavorite: false,
          projectName: "",
          propertyType: "Villa",
          estado: "Disponible",
          interestedClients: mockClients3,
        },
        {
          id: "4",
          title: "Loft Industrial",
          location: "Zona Viva, Ciudad de Guatemala",
          price: 210000,
          priceUnit: "Q",
          rating: 4.3,
          reviewCount: 10,
          description: "Loft moderno con estilo industrial",
          descripcionCorta: "Diseño industrial único en zona trendy",
          descripcionLarga: "Este loft industrial combina elementos de diseño contemporáneo con características industriales originales. Ubicado en la zona más trendy de la ciudad.",
          caracteristicas: ["1 habitación", "1 baño", "techos altos", "ventanales"],
          proyectoCaracteristicas: [],
          imageUrl: "https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=800",
          imagenes: [],
          bedrooms: 1,
          bathrooms: 1,
          area: 90,
          amenities: ["Techos altos", "Ventanales grandes", "Estilo industrial"],
          isFavorite: false,
          projectName: "",
          propertyType: "Loft",
          estado: "Disponible",
          interestedClients: mockClients4,
        },
      ];
      
      setProperties(mockProperties);
    } catch (error) {
      console.error("Error loading properties:", error);
      setProperties([]);
    } finally {
      setLoading(false);
    }
  };

  const handleFilterPress = (filter: FilterType) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setSelectedFilter(filter);
    // In a real app, this would filter properties based on the selected time period
  };

  const handleClientCountPress = (property: Property) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    navigation.navigate('ClientList', { property });
  };

  const handlePropertyPress = (property: Property) => {
    // Navigate to property detail - you might want to implement this
    console.log("Property pressed:", property.title);
  };

  const handleSharePress = (property: Property) => {
    // Handle share - you might want to implement this
    console.log("Share property:", property.title);
  };

  const toggleWebSearch = () => {
    const newState = !webSearchExpanded;
    setWebSearchExpanded(newState);
    searchExpandAnim.value = withTiming(newState ? 1 : 0, {
      duration: 300,
      easing: Easing.bezier(0.4, 0.0, 0.2, 1),
    });
    if (!newState) {
      setWebSearchQuery("");
    }
  };

  const handleWebSearch = (text: string) => {
    setWebSearchQuery(text);
    // You can implement search filtering here
  };

  const renderClientPropertyCard = (property: Property) => {
    const bankQuota = Math.round(property.price / 180);
    // Get client count from interestedClients
    const clientCount = (property as any).interestedClients?.length || 0;

    return (
      <Pressable
        key={property.id}
        onPress={() => handlePropertyPress(property)}
        style={({ pressed }) => [
          styles.propertyCardContainer,
          {
            backgroundColor: theme.backgroundRoot,
            opacity: pressed ? 0.9 : 1,
          },
          !isWeb && !isDark ? Shadows.card : null,
        ]}
      >
        <View style={styles.propertyImageContainer}>
          <Image
            source={{ uri: property.imageUrl }}
            style={styles.propertyImage}
            resizeMode="cover"
          />
          <View style={styles.propertyActionButtons}>
            {/* Client count button instead of heart */}
            <ClientCountButton
              clientCount={clientCount}
              onPress={() => handleClientCountPress(property)}
            />
            {/* Share button like in Favorites */}
            <Pressable
              onPress={() => handleSharePress(property)}
              hitSlop={12}
              style={styles.shareIconCircle}
            >
              <Ionicons name="share" size={18} color="#333333" />
            </Pressable>
          </View>
          {/* Removed commission badge */}
        </View>

        <View style={styles.propertyContent}>
          <ThemedText style={styles.propertyTitle} numberOfLines={2}>
            {property.title}
          </ThemedText>

          <ThemedText style={[styles.propertyBankQuota, { color: theme.textSecondary }]}>
            Cuota desde Q{bankQuota.toLocaleString()}/mes
          </ThemedText>

          <Pressable onPress={() => handlePropertyPress(property)} style={styles.propertyViewButton}>
            <ThemedText style={[styles.propertyViewButtonText, { color: "#bf0a0a" }]}>
              VER PROPIEDAD
            </ThemedText>
            <Ionicons name="chevron-forward" size={16} color="#bf0a0a" />
          </Pressable>
        </View>
      </Pressable>
    );
  };

  const renderWebSearchHeader = () => (
    <View style={styles.webSearchHeader}>
      <View style={styles.webSearchRow}>
        <Animated.View style={[styles.webSearchButtonContainer, searchButtonAnimatedStyle]}>
          <Pressable
            onPress={toggleWebSearch}
            style={styles.webSearchButton}
          >
            <Ionicons name="search-outline" size={20} color="#FFFFFF" />
          </Pressable>
          {webSearchExpanded ? (
            <Animated.View style={[styles.webSearchInputContainer, searchInputAnimatedStyle]}>
              <TextInput
                value={webSearchQuery}
                onChangeText={handleWebSearch}
                placeholder="Buscar clientes..."
                placeholderTextColor="rgba(255, 255, 255, 0.6)"
                style={styles.webSearchInput}
                autoFocus
              />
              <Pressable onPress={toggleWebSearch} style={styles.webSearchCloseButton}>
                <Ionicons name="close" size={18} color="#666666" />
              </Pressable>
            </Animated.View>
          ) : null}
        </Animated.View>

        <View style={styles.webFiltersContainer}>
          {filters.map((filter, index) => (
            <FilterChip
              key={filter.key}
              label={filter.label}
              isSelected={selectedFilter === filter.key}
              onPress={() => handleFilterPress(filter.key)}
              selectedColor="#bf0a0a"
            />
          ))}
        </View>
      </View>
    </View>
  );

  return (
    <View style={[styles.container, { backgroundColor: theme.backgroundRoot }]}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[
          styles.scrollContent,
          { 
            paddingTop: 0,
            paddingBottom: tabBarHeight + Spacing.xl 
          }
        ]}
      >
        {/* Web Search Header */}
        {isWeb ? renderWebSearchHeader() : (
          <View style={styles.mobileFiltersWrapper}>
            <View style={styles.mobileFiltersContainer}>
              {filters.map((filter, index) => (
                <FilterChip
                  key={filter.key}
                  label={filter.label}
                  isSelected={selectedFilter === filter.key}
                  onPress={() => handleFilterPress(filter.key)}
                  selectedColor="#bf0a0a"
                />
              ))}
            </View>
          </View>
        )}

        {/* Clients List */}
        <View style={styles.clientsContainer}>
          {loading ? (
            <View style={styles.loadingContainer}>
              <Ionicons
                name="people-outline"
                size={64}
                color={theme.textSecondary}
              />
              <ThemedText style={[styles.loadingText, { color: theme.textSecondary }]}>
                Cargando propiedades...
              </ThemedText>
            </View>
          ) : properties.length > 0 ? (
            isWeb ? (
              <View style={styles.webGrid}>
                {properties.map((property) => (
                  <View style={styles.webGridItem}>
                    {renderClientPropertyCard(property)}
                  </View>
                ))}
              </View>
            ) : (
              <View style={styles.mobileList}>
                {properties.map((property) => renderClientPropertyCard(property))}
              </View>
            )
          ) : (
            <View style={styles.emptyState}>
              <Ionicons
                name="people-outline"
                size={64}
                color={theme.textSecondary}
              />
              <ThemedText style={[styles.emptyStateTitle, { color: theme.text }]}>
                No hay propiedades con clientes interesados
              </ThemedText>
              <ThemedText style={[styles.emptyStateText, { color: theme.textSecondary }]}>
                Las propiedades con clientes interesados aparecerán aquí
              </ThemedText>
            </View>
          )}
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: isWeb ? 90 : Spacing.lg,
  },

  // Web Search Header
  webSearchHeader: {
    marginTop: Spacing.xl,
    marginBottom: Spacing.lg,
  },
  webSearchRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.md,
    flexWrap: "wrap",
  },
  webSearchButtonContainer: {
    height: 48,
    backgroundColor: "#bf0a0a",
    borderRadius: BorderRadius.full,
    flexDirection: "row",
    alignItems: "center",
    overflow: "hidden",
  },
  webSearchButton: {
    width: 48,
    height: 48,
    borderRadius: BorderRadius.full,
    justifyContent: "center",
    alignItems: "center",
  },
  webSearchInputContainer: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    paddingRight: Spacing.sm,
  },
  webSearchInput: {
    flex: 1,
    fontSize: 16,
    color: "#FFFFFF",
    marginLeft: Spacing.sm,
    ...(isWeb && { outlineWidth: 0, outlineStyle: "none", borderWidth: 0, boxShadow: "none", caretColor: "transparent" } as any),
  },
  webSearchCloseButton: {
    padding: Spacing.xs,
    backgroundColor: "rgba(255,255,255,0.2)",
    borderRadius: BorderRadius.full,
  },
  webFiltersContainer: {
    flexDirection: "row",
    gap: Spacing.sm,
  },

  // Mobile Filters
  mobileFiltersWrapper: {
    marginTop: Spacing.xl,
    marginBottom: Spacing.lg,
  },
  mobileFiltersContainer: {
    flexDirection: "row",
    justifyContent: "center",
    paddingVertical: Spacing.md,
    gap: Spacing.sm,
    position: 'relative',
  },

  // Clients
  clientsContainer: {
    flexDirection: "column",
  },
  webGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: Spacing.lg,
    ...(isWeb && { display: "grid" as any, gridTemplateColumns: "repeat(3, 1fr)" as any }),
  },
  webGridItem: {
    width: isWeb ? "100%" : "100%",
    minWidth: 280,
  },
  mobileList: {
    gap: Spacing.md,
  },

  // Loading
  loadingContainer: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: Spacing["2xl"] * 3,
  },
  loadingText: {
    fontSize: 16,
    marginTop: Spacing.md,
  },

  // Empty State
  emptyState: {
    width: "100%",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: Spacing["2xl"] * 3,
  },
  emptyStateTitle: {
    fontSize: 22,
    fontWeight: "700",
    marginTop: Spacing.lg,
    marginBottom: Spacing.sm,
  },
  emptyStateText: {
    fontSize: 14,
    textAlign: "center",
  },

  // Custom Property Card Styles
  propertyCardContainer: {
    borderRadius: BorderRadius.md,
    marginBottom: Spacing.lg,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: "#E0E0E0",
  },
  propertyImageContainer: {
    position: "relative",
  },
  propertyImage: {
    width: isWeb ? "100%" : Dimensions.get("window").width - Spacing.lg * 2,
    height: 200,
    aspectRatio: isWeb ? 16 / 10 : undefined,
  },
  propertyActionButtons: {
    position: "absolute",
    top: Spacing.md,
    right: Spacing.md,
    flexDirection: "row",
    gap: Spacing.sm,
  },
  clientCountCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "rgba(255, 255, 255, 0.9)",
    justifyContent: "center",
    alignItems: "center",
    flexDirection: "row",
    gap: 4,
    paddingHorizontal: 8,
  },
  clientCountText: {
    fontSize: 12,
    fontWeight: "600",
    color: "#bf0a0a",
  },
  shareIconCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "rgba(255, 255, 255, 0.85)",
    justifyContent: "center",
    alignItems: "center",
  },
  propertyContent: {
    padding: Spacing.md,
  },
  propertyTitle: {
    fontSize: 17,
    fontWeight: "600",
    marginBottom: Spacing.xs,
  },
  propertyBankQuota: {
    fontSize: 14,
    marginBottom: Spacing.sm,
  },
  propertyButtonsContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  propertyViewButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  propertyViewButtonText: {
    fontSize: 13,
    fontWeight: "600",
    letterSpacing: 0.5,
  },
  propertyShareButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "rgba(255, 255, 255, 0.8)",
    justifyContent: "center",
    alignItems: "center",
  },
  // Modal Styles
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.lg,
    paddingBottom: Spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0,0,0,0.1)',
  },
  backButton: {
    padding: Spacing.sm,
    marginRight: Spacing.md,
  },
  headerContent: {
    flex: 1,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '600',
    marginBottom: 2,
  },
  headerSubtitle: {
    fontSize: 14,
  },
  clientCard: {
    borderRadius: BorderRadius.md,
    padding: Spacing.md,
    marginBottom: Spacing.sm,
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.1)',
  },
  clientHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.sm,
  },
  clientBasicInfo: {
    flex: 1,
  },
  clientName: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 2,
  },
  clientDate: {
    fontSize: 14,
  },
  clientComment: {
    fontSize: 16,
    lineHeight: 22,
    marginBottom: Spacing.md,
  },
  clientDetails: {
    gap: Spacing.xs,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  detailText: {
    fontSize: 14,
  },
});
