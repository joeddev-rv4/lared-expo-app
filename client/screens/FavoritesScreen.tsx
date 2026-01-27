import React, { useState, useCallback } from "react";
import {
  View,
  StyleSheet,
  RefreshControl,
  ActivityIndicator,
  Platform,
  ScrollView,
  useWindowDimensions,
  Alert,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useHeaderHeight } from "@react-navigation/elements";
import { useBottomTabBarHeight } from "@react-navigation/bottom-tabs";
import { useFocusEffect, useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import * as Haptics from "expo-haptics";

import { PropertyCard } from "@/components/PropertyCard";
import { EmptyState } from "@/components/EmptyState";
import { ThemedText } from "@/components/ThemedText";
import { FavoritesScreenSkeleton } from "@/components/SkeletonLoader";
import { useTheme } from "@/hooks/useTheme";
import { Property, mapAPIPropertyToProperty } from "@/data/properties";
import { toggleFavorite } from "@/lib/storage";
import { getPortfolioProperties, togglePropertyInPortfolio } from "@/lib/portfolioService";
import { useAuth } from "@/contexts/AuthContext";
import { auth } from "@/lib/config";
import { fetchPropiedades } from "@/lib/api";
import { FavoritesStackParamList } from "@/navigation/FavoritesStackNavigator";
import { Spacing, Colors } from "@/constants/theme";

const isWeb = Platform.OS === "web";

export default function FavoritesScreen() {
  const insets = useSafeAreaInsets();
  const headerHeight = useHeaderHeight();
  const tabBarHeight = isWeb ? 0 : useBottomTabBarHeight();
  const { theme, isDark } = useTheme();
  const { user, isGuest } = useAuth();
  const navigation = useNavigation<NativeStackNavigationProp<FavoritesStackParamList>>();
  const { width: windowWidth } = useWindowDimensions();

  const isMobileWeb = isWeb && windowWidth < 768;
  const isTabletWeb = isWeb && windowWidth >= 768 && windowWidth < 1024;

  const [favoriteProperties, setFavoriteProperties] = useState<Property[]>([]);
  const [favoriteIds, setFavoriteIds] = useState<number[]>([]);
  const [refreshing, setRefreshing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useFocusEffect(
    useCallback(() => {
      loadFavorites();
    }, [user])
  );

  const loadFavorites = async () => {
    try {
      setLoading(true);
      setError(null);

      const userId = user?.id || auth.currentUser?.uid;

      if (!userId) {
        setFavoriteProperties([]);
        setFavoriteIds([]);
        setLoading(false);
        return;
      }

      // Obtener IDs de propiedades favoritas desde Firebase
      const portfolioPropertyIds = await getPortfolioProperties(userId);
      setFavoriteIds(portfolioPropertyIds);

      if (portfolioPropertyIds.length === 0) {
        setFavoriteProperties([]);
        setLoading(false);
        return;
      }

      // Obtener todas las propiedades de la API
      const apiProperties = await fetchPropiedades();
      const allProperties = apiProperties.map(mapAPIPropertyToProperty);

      // Filtrar solo las propiedades favoritas
      const favorites = allProperties.filter((property) =>
        portfolioPropertyIds.includes(parseInt(property.id, 10))
      );

      setFavoriteProperties(favorites);
    } catch (err) {
      console.error("Error loading favorites:", err);
      setError("Error al cargar los favoritos. Intenta de nuevo.");
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    if (!isWeb) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    await loadFavorites();
    setRefreshing(false);
  };

  const handleFavoriteToggle = async (propertyId: string) => {
    const userId = user?.id || auth.currentUser?.uid;

    if (!userId) {
      Alert.alert(
        "Inicia sesión",
        "Necesitas iniciar sesión para gestionar tus favoritos.",
        [{ text: "OK" }]
      );
      return;
    }

    // Actualización optimista - remover de la lista local
    const previousProperties = [...favoriteProperties];
    setFavoriteProperties((prev) => prev.filter((p) => p.id !== propertyId));

    try {
      // Actualizar en Firebase (isCurrentlyFavorite = true porque estamos en la pantalla de favoritos)
      const success = await togglePropertyInPortfolio(propertyId, true, userId);

      // También actualizar storage local
      await toggleFavorite(propertyId);

      if (!success) {
        // Revertir si falla
        setFavoriteProperties(previousProperties);
        Alert.alert(
          "Error",
          "No se pudo eliminar de tu portafolio. Intenta de nuevo.",
          [{ text: "OK" }]
        );
      }
    } catch (error) {
      console.error("Error removing favorite:", error);
      setFavoriteProperties(previousProperties);
      Alert.alert(
        "Error",
        "Error de conexión. Intenta de nuevo.",
        [{ text: "OK" }]
      );
    }
  };

  const handlePropertyPress = (property: Property) => {
    if (!isWeb) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    navigation.navigate("FavoritesPropertyDetail", { property, sourceTab: "FavoritesTab" });
  };

  const handleSharePress = (property: Property) => {
    if (!isWeb) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
  };

  const getCurrentUserId = () => user?.id || auth.currentUser?.uid || "";

  const handleNavigateToSignup = () => {
    navigation.getParent()?.getParent()?.reset({
      index: 0,
      routes: [{ name: "Login" as any }],
    });
  };

  const renderEmpty = () => {
    const userId = user?.id || auth.currentUser?.uid;

    if (isGuest || !userId) {
      return (
        <EmptyState
          image={require("../../assets/images/empty-states/favorites.png")}
          title="Inicia sesión"
          description="Inicia sesión para ver y gestionar tus propiedades favoritas."
          actionLabel="Crear cuenta"
          onAction={handleNavigateToSignup}
        />
      );
    }

    return (
      <EmptyState
        image={require("../../assets/images/empty-states/favorites.png")}
        title="Sin favoritos"
        description="Comienza a explorar y guarda las propiedades que te gusten tocando el ícono de corazón."
      />
    );
  };

  const renderContent = () => {
    if (loading) {
      return <FavoritesScreenSkeleton />;
    }

    if (error) {
      return (
        <EmptyState
          image={require("../../assets/images/empty-states/search.png")}
          title="Error de conexión"
          description={error}
          actionLabel="Reintentar"
          onAction={loadFavorites}
        />
      );
    }

    if (favoriteProperties.length === 0) {
      return renderEmpty();
    }

    // Renderizado responsive igual que ExploreScreen
    return isWeb ? (
      <View style={[styles.webGrid, isMobileWeb && styles.webGridMobile, isTabletWeb && styles.webGridTablet]}>
        {favoriteProperties.map((property) => (
          <View key={property.id} style={[styles.webGridItem, isMobileWeb && styles.webGridItemMobile, isTabletWeb && styles.webGridItemTablet]}>
            <PropertyCard
              property={property}
              isFavorite={true}
              onPress={() => handlePropertyPress(property)}
              onFavoritePress={() => handleFavoriteToggle(property.id)}
              onSharePress={() => handleSharePress(property)}
              showCopyLink={true}
              userId={getCurrentUserId()}
              isGuest={isGuest}
            />
          </View>
        ))}
      </View>
    ) : (
      <View style={styles.mobileList}>
        {favoriteProperties.map((property) => (
          <PropertyCard
            key={property.id}
            property={property}
            isFavorite={true}
            onPress={() => handlePropertyPress(property)}
            onFavoritePress={() => handleFavoriteToggle(property.id)}
            onSharePress={() => handleSharePress(property)}
            showCopyLink={true}
            userId={getCurrentUserId()}
            isGuest={isGuest}
          />
        ))}
      </View>
    );
  };

  return (
    <View style={[styles.container, { backgroundColor: isWeb ? "#FFFFFF" : theme.backgroundRoot }]}>
      <ScrollView
        contentContainerStyle={[
          styles.scrollContent,
          {
            paddingBottom: isWeb ? Spacing.xl : tabBarHeight + Spacing.xl,
          },
          isMobileWeb && { paddingHorizontal: Spacing.md },
          favoriteProperties.length === 0 && !loading ? styles.emptyContent : null,
        ]}
        showsVerticalScrollIndicator={false}
        refreshControl={
          !isWeb ? (
            <RefreshControl
              refreshing={refreshing}
              onRefresh={handleRefresh}
              tintColor={theme.textSecondary}
              progressViewOffset={headerHeight}
            />
          ) : undefined
        }
      >
        {favoriteProperties.length > 0 && !loading && (
          <ThemedText style={styles.sectionTitle}>
            Mis Favoritos ({favoriteProperties.length})
          </ThemedText>
        )}
        {renderContent()}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: isWeb ? 90 : Spacing.lg,
  },
  emptyContent: {
    flexGrow: 1,
    justifyContent: "center",
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: "#222222",
    marginBottom: Spacing.lg,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: Spacing.xl * 3,
  },
  loadingText: {
    marginTop: Spacing.md,
    fontSize: 16,
  },
  webGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: Spacing.lg,
    ...(isWeb && { display: "grid" as any, gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))" as any }),
  },
  webGridItem: {
    width: isWeb ? "100%" : "100%",
    minWidth: 280,
  },
  webGridMobile: {
    ...(isWeb && { gridTemplateColumns: "1fr" as any }),
  },
  webGridTablet: {
    ...(isWeb && { gridTemplateColumns: "repeat(2, 1fr)" as any }),
  },
  webGridItemMobile: {
    minWidth: "100%",
  },
  webGridItemTablet: {
    minWidth: "auto",
  },
  mobileList: {
    gap: Spacing.md,
  },
});
