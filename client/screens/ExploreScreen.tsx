import React, { useState, useEffect, useMemo } from "react";
import {
  View,
  FlatList,
  StyleSheet,
  RefreshControl,
  ActivityIndicator,
  Pressable,
  Image,
  Dimensions,
  Platform,
  ScrollView,
  TextInput,
} from "react-native";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withTiming,
  interpolate,
  Easing,
} from "react-native-reanimated";

const isWeb = Platform.OS === "web";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useHeaderHeight } from "@react-navigation/elements";
import { useBottomTabBarHeight } from "@react-navigation/bottom-tabs";
import * as Haptics from "expo-haptics";
import { Feather } from "@expo/vector-icons";

import { PropertyCard } from "@/components/PropertyCard";
import { SearchBar } from "@/components/SearchBar";
import { EmptyState } from "@/components/EmptyState";
import { ThemedText } from "@/components/ThemedText";
import { useTheme } from "@/hooks/useTheme";
import { Property, mapAPIPropertyToProperty } from "@/data/properties";
import { getFavorites, toggleFavorite } from "@/lib/storage";
import {
  fetchPropiedades,
  fetchProyectos,
  APIPropiedad,
  APIProyectoDetalle,
} from "@/lib/api";
import { Spacing, Colors, BorderRadius, Shadows } from "@/constants/theme";

const { width: SCREEN_WIDTH } = Dimensions.get("window");
const PROJECT_CARD_WIDTH = isWeb ? 280 : SCREEN_WIDTH * 0.7;
const PROPERTY_CARD_WIDTH = isWeb ? 320 : SCREEN_WIDTH * 0.8;

type SectionType = "projects" | "nearby" | "top10" | "all" | null;

export default function ExploreScreen() {
  const insets = useSafeAreaInsets();
  const headerHeight = useHeaderHeight();
  const tabBarHeight = useBottomTabBarHeight();
  const { theme, isDark } = useTheme();

  const [searchQuery, setSearchQuery] = useState("");
  const [favorites, setFavorites] = useState<string[]>([]);
  const [refreshing, setRefreshing] = useState(false);
  const [properties, setProperties] = useState<Property[]>([]);
  const [projects, setProjects] = useState<APIProyectoDetalle[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedProjectId, setSelectedProjectId] = useState<number | null>(null);
  const [webSearchExpanded, setWebSearchExpanded] = useState(false);
  const [webSearchQuery, setWebSearchQuery] = useState("");
  const [expandedSection, setExpandedSection] = useState<SectionType>(null);

  const searchExpandAnim = useSharedValue(0);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      setError(null);
      const [apiProperties, apiProjects, favs] = await Promise.all([
        fetchPropiedades(),
        fetchProyectos(),
        getFavorites(),
      ]);
      const mappedProperties = apiProperties.map(mapAPIPropertyToProperty);
      setProperties(mappedProperties);
      setProjects(apiProjects);
      setFavorites(favs);
    } catch (err) {
      setError("Error al cargar los datos. Intenta de nuevo.");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    if (!isWeb) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    await loadData();
    setRefreshing(false);
  };

  const handleFavoriteToggle = async (propertyId: string) => {
    const newFavorites = await toggleFavorite(propertyId);
    setFavorites(newFavorites);
  };

  const handlePropertyPress = (property: Property) => {
    if (!isWeb) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
  };

  const handleSharePress = (property: Property) => {
    if (!isWeb) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
  };

  const handleProjectPress = (project: APIProyectoDetalle) => {
    if (!isWeb) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    setSelectedProjectId(project.id);
  };

  const handleExpandSection = (section: SectionType) => {
    if (!isWeb) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    setExpandedSection(section);
  };

  const handleBackFromExpanded = () => {
    if (!isWeb) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    setExpandedSection(null);
  };

  const nearbyProperties = useMemo(() => {
    const shuffled = [...properties].sort(() => Math.random() - 0.5);
    return shuffled.slice(0, 10);
  }, [properties]);

  const topProperties = useMemo(() => {
    return properties
      .sort((a, b) => b.price - a.price)
      .slice(0, 10);
  }, [properties]);

  const filteredProperties = useMemo(() => {
    let filtered = properties;

    if (selectedProjectId) {
      filtered = filtered.filter((p) => {
        const project = projects.find((proj) => proj.id === selectedProjectId);
        return project && p.projectName === project.nombre_proyecto;
      });
    }

    if (searchQuery) {
      filtered = filtered.filter((property) =>
        property.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        property.location.toLowerCase().includes(searchQuery.toLowerCase()) ||
        property.projectName.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    return filtered;
  }, [properties, searchQuery, selectedProjectId, projects]);

  const toggleWebSearch = () => {
    const newState = !webSearchExpanded;
    setWebSearchExpanded(newState);
    searchExpandAnim.value = withSpring(newState ? 1 : 0, {
      damping: 15,
      stiffness: 120,
    });
    if (!newState) {
      setWebSearchQuery("");
      setSearchQuery("");
    }
  };

  const handleWebSearch = (text: string) => {
    setWebSearchQuery(text);
    setSearchQuery(text);
  };

  const searchButtonAnimatedStyle = useAnimatedStyle(() => {
    const width = interpolate(searchExpandAnim.value, [0, 1], [48, 400]);
    return {
      width: withTiming(width, { duration: 300, easing: Easing.bezier(0.25, 0.1, 0.25, 1) }),
    };
  });

  const tagsAnimatedStyle = useAnimatedStyle(() => {
    return {
      opacity: withTiming(1 - searchExpandAnim.value, { duration: 200 }),
      transform: [
        { translateX: withTiming(searchExpandAnim.value * -20, { duration: 200 }) },
        { scale: withTiming(1 - searchExpandAnim.value * 0.1, { duration: 200 }) },
      ],
    };
  });

  const searchInputAnimatedStyle = useAnimatedStyle(() => {
    return {
      opacity: withTiming(searchExpandAnim.value, { duration: 300 }),
    };
  });

  const getProjectImage = (project: APIProyectoDetalle) => {
    if (project.imagenes && project.imagenes.length > 0) {
      const img = project.imagenes.find((i) => i.formato === "imagen");
      return img?.url || "https://via.placeholder.com/400x300?text=Proyecto";
    }
    const matchingProperty = properties.find((p) => p.projectName === project.nombre_proyecto);
    return matchingProperty?.imageUrl || "https://via.placeholder.com/400x300?text=Proyecto";
  };

  const getSectionTitle = (section: SectionType): string => {
    switch (section) {
      case "projects": return "Proyectos disponibles";
      case "nearby": return "Propiedades cercanas";
      case "top10": return "Top 10 propiedades";
      case "all": return "Todas las propiedades";
      default: return "";
    }
  };

  const getSectionData = (section: SectionType): Property[] => {
    switch (section) {
      case "nearby": return nearbyProperties;
      case "top10": return topProperties;
      case "all": return filteredProperties;
      default: return [];
    }
  };

  const renderWebSearchHeader = () => (
    <View style={styles.webSearchHeader}>
      <View style={styles.webSearchRow}>
        <Animated.View style={[styles.webSearchButtonContainer, searchButtonAnimatedStyle]}>
          <Pressable
            onPress={toggleWebSearch}
            style={styles.webSearchButton}
          >
            <Feather name="search" size={20} color="#FFFFFF" />
          </Pressable>
          {webSearchExpanded ? (
            <Animated.View style={[styles.webSearchInputContainer, searchInputAnimatedStyle]}>
              <TextInput
                value={webSearchQuery}
                onChangeText={handleWebSearch}
                placeholder="Buscar propiedades, proyectos..."
                placeholderTextColor="#999999"
                style={styles.webSearchInput}
                autoFocus
              />
              <Pressable onPress={toggleWebSearch} style={styles.webSearchCloseButton}>
                <Feather name="x" size={18} color="#666666" />
              </Pressable>
            </Animated.View>
          ) : null}
        </Animated.View>

        {!webSearchExpanded ? (
          <Animated.View style={[styles.webTagsContainer, tagsAnimatedStyle]}>
            <Pressable style={styles.webTag}>
              <ThemedText style={styles.webTagText}>Propiedades</ThemedText>
            </Pressable>
            <Pressable style={styles.webTag}>
              <ThemedText style={styles.webTagText}>Proyectos</ThemedText>
            </Pressable>
            <Pressable style={styles.webTag}>
              <ThemedText style={styles.webTagText}>Propiedades nuevas</ThemedText>
            </Pressable>
          </Animated.View>
        ) : null}
      </View>
    </View>
  );

  const renderProjectCard = (project: APIProyectoDetalle) => {
    const isSelected = selectedProjectId === project.id;
    return (
      <Pressable
        key={project.id}
        onPress={() => handleProjectPress(project)}
        style={({ pressed }) => [
          styles.horizontalProjectCard,
          { 
            backgroundColor: theme.backgroundRoot, 
            opacity: pressed ? 0.9 : 1,
            borderColor: isSelected ? Colors.light.primary : "transparent",
            borderWidth: isSelected ? 2 : 0,
          },
          isDark ? null : Shadows.card,
        ]}
      >
        <Image source={{ uri: getProjectImage(project) }} style={styles.horizontalProjectImage} />
        <View style={styles.horizontalProjectInfo}>
          <ThemedText style={styles.horizontalProjectName} numberOfLines={1}>
            {project.nombre_proyecto}
          </ThemedText>
          <View style={styles.projectLocationRow}>
            <Feather name="map-pin" size={12} color={theme.textSecondary} />
            <ThemedText style={[styles.projectLocation, { color: theme.textSecondary }]} numberOfLines={1}>
              {project.ubicacion || project.direccion}
            </ThemedText>
          </View>
          <View style={[styles.projectTypeBadge, { backgroundColor: Colors.light.primary + "20" }]}>
            <ThemedText style={[styles.projectTypeLabel, { color: Colors.light.primary }]}>
              {project.tipo}
            </ThemedText>
          </View>
        </View>
      </Pressable>
    );
  };

  const renderExpandedProjectCard = (project: APIProyectoDetalle) => {
    const isSelected = selectedProjectId === project.id;
    return (
      <Pressable
        key={project.id}
        onPress={() => handleProjectPress(project)}
        style={({ pressed }) => [
          styles.expandedProjectCard,
          { 
            backgroundColor: theme.backgroundRoot, 
            opacity: pressed ? 0.9 : 1,
            borderColor: isSelected ? Colors.light.primary : "transparent",
            borderWidth: isSelected ? 2 : 0,
          },
          isDark ? null : Shadows.card,
        ]}
      >
        <Image source={{ uri: getProjectImage(project) }} style={styles.expandedProjectImage} />
        <View style={styles.horizontalProjectInfo}>
          <ThemedText style={styles.horizontalProjectName} numberOfLines={1}>
            {project.nombre_proyecto}
          </ThemedText>
          <View style={styles.projectLocationRow}>
            <Feather name="map-pin" size={12} color={theme.textSecondary} />
            <ThemedText style={[styles.projectLocation, { color: theme.textSecondary }]} numberOfLines={1}>
              {project.ubicacion || project.direccion}
            </ThemedText>
          </View>
          <View style={[styles.projectTypeBadge, { backgroundColor: Colors.light.primary + "20" }]}>
            <ThemedText style={[styles.projectTypeLabel, { color: Colors.light.primary }]}>
              {project.tipo}
            </ThemedText>
          </View>
        </View>
      </Pressable>
    );
  };

  const renderHorizontalPropertyCard = (property: Property) => (
    <View key={property.id} style={styles.horizontalPropertyCard}>
      <PropertyCard
        property={property}
        isFavorite={favorites.includes(property.id)}
        onPress={() => handlePropertyPress(property)}
        onFavoritePress={() => handleFavoriteToggle(property.id)}
        onSharePress={() => handleSharePress(property)}
      />
    </View>
  );

  const renderSectionTitle = (title: string, section: SectionType, showClearButton?: boolean, hideArrow?: boolean) => (
    <View style={styles.sectionTitleContainer}>
      <ThemedText style={styles.sectionTitle}>{title}</ThemedText>
      <View style={styles.sectionTitleRight}>
        {showClearButton && selectedProjectId ? (
          <Pressable onPress={() => setSelectedProjectId(null)} style={styles.clearButton}>
            <ThemedText style={styles.clearButtonText}>Ver todos</ThemedText>
            <Feather name="x" size={14} color={Colors.light.primary} />
          </Pressable>
        ) : null}
        {!hideArrow ? (
          <Pressable 
            onPress={() => handleExpandSection(section)} 
            style={styles.expandArrowButton}
          >
            <Feather name="chevron-right" size={24} color={Colors.light.primary} />
          </Pressable>
        ) : null}
      </View>
    </View>
  );

  const renderMobileSearchHeader = () => (
    <View style={styles.mobileSearchHeader}>
      <SearchBar
        value={searchQuery}
        onChangeText={setSearchQuery}
        placeholder="Buscar propiedades o proyectos..."
      />
    </View>
  );

  const renderExpandedHeader = () => (
    <View style={styles.expandedHeader}>
      <Pressable onPress={handleBackFromExpanded} style={styles.backButton}>
        <Feather name="arrow-left" size={24} color={Colors.light.primary} />
      </Pressable>
      <ThemedText style={styles.expandedTitle}>{getSectionTitle(expandedSection)}</ThemedText>
      <View style={styles.backButtonPlaceholder} />
    </View>
  );

  const renderExpandedContent = () => {
    if (expandedSection === "projects") {
      return (
        <View style={isWeb ? styles.webProjectsGrid : styles.mobilePropertiesList}>
          {projects.map(renderExpandedProjectCard)}
        </View>
      );
    }

    const data = getSectionData(expandedSection);
    
    return isWeb ? (
      <View style={styles.webGrid}>
        {data.map((item) => (
          <View key={item.id} style={styles.webGridItem}>
            <PropertyCard
              property={item}
              isFavorite={favorites.includes(item.id)}
              onPress={() => handlePropertyPress(item)}
              onFavoritePress={() => handleFavoriteToggle(item.id)}
              onSharePress={() => handleSharePress(item)}
            />
          </View>
        ))}
      </View>
    ) : (
      <View style={styles.mobilePropertiesList}>
        {data.map((item) => (
          <PropertyCard
            key={item.id}
            property={item}
            isFavorite={favorites.includes(item.id)}
            onPress={() => handlePropertyPress(item)}
            onFavoritePress={() => handleFavoriteToggle(item.id)}
            onSharePress={() => handleSharePress(item)}
          />
        ))}
      </View>
    );
  };

  const renderContent = () => {
    if (loading) {
      return (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={Colors.light.primary} />
          <ThemedText style={[styles.loadingText, { color: theme.textSecondary }]}>
            Cargando...
          </ThemedText>
        </View>
      );
    }

    if (error) {
      return (
        <EmptyState
          image={require("../../assets/images/empty-states/search.png")}
          title="Error de conexión"
          description={error}
          actionLabel="Reintentar"
          onAction={loadData}
        />
      );
    }

    return (
      <>
        {renderSectionTitle("Proyectos disponibles", "projects")}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.horizontalScrollContent}
          style={styles.horizontalScrollView}
        >
          {projects.map(renderProjectCard)}
        </ScrollView>

        {renderSectionTitle("Propiedades cercanas", "nearby")}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.horizontalScrollContent}
          style={styles.horizontalScrollView}
        >
          {nearbyProperties.map(renderHorizontalPropertyCard)}
        </ScrollView>

        {renderSectionTitle("Top 10 propiedades", "top10")}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.horizontalScrollContent}
          style={styles.horizontalScrollView}
        >
          {topProperties.map(renderHorizontalPropertyCard)}
        </ScrollView>

        {renderSectionTitle("Todas las propiedades", "all", true, true)}
        {isWeb ? (
          <View style={styles.webGrid}>
            {filteredProperties.map((item) => (
              <View key={item.id} style={styles.webGridItem}>
                <PropertyCard
                  property={item}
                  isFavorite={favorites.includes(item.id)}
                  onPress={() => handlePropertyPress(item)}
                  onFavoritePress={() => handleFavoriteToggle(item.id)}
                  onSharePress={() => handleSharePress(item)}
                />
              </View>
            ))}
          </View>
        ) : (
          <View style={styles.mobilePropertiesList}>
            {filteredProperties.map((item) => (
              <PropertyCard
                key={item.id}
                property={item}
                isFavorite={favorites.includes(item.id)}
                onPress={() => handlePropertyPress(item)}
                onFavoritePress={() => handleFavoriteToggle(item.id)}
                onSharePress={() => handleSharePress(item)}
              />
            ))}
          </View>
        )}
      </>
    );
  };

  if (expandedSection) {
    return (
      <View style={[styles.container, { backgroundColor: isWeb ? "#FFFFFF" : theme.backgroundRoot }]}>
        <ScrollView
          contentContainerStyle={[
            styles.scrollContent,
            {
              paddingTop: isWeb ? headerHeight : headerHeight + Spacing.lg,
              paddingBottom: isWeb ? Spacing.xl : tabBarHeight + Spacing.xl,
            },
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
          {renderExpandedHeader()}
          {renderExpandedContent()}
        </ScrollView>
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: isWeb ? "#FFFFFF" : theme.backgroundRoot }]}>
      <ScrollView
        contentContainerStyle={[
          styles.scrollContent,
          {
            paddingTop: isWeb ? headerHeight : headerHeight + Spacing.lg,
            paddingBottom: isWeb ? Spacing.xl : tabBarHeight + Spacing.xl,
          },
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
        {isWeb ? renderWebSearchHeader() : renderMobileSearchHeader()}
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
    paddingHorizontal: Spacing.lg,
  },
  webSearchHeader: {
    marginBottom: Spacing.lg,
  },
  webSearchRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.md,
  },
  webSearchButtonContainer: {
    height: 48,
    backgroundColor: Colors.light.primary,
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
  },
  webSearchCloseButton: {
    padding: Spacing.xs,
    backgroundColor: "rgba(255,255,255,0.2)",
    borderRadius: BorderRadius.full,
  },
  webTagsContainer: {
    flexDirection: "row",
    gap: Spacing.sm,
  },
  webTag: {
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    backgroundColor: "#F5F5F5",
    borderRadius: BorderRadius.full,
  },
  webTagText: {
    fontSize: 14,
    color: "#222222",
    fontWeight: "500",
  },
  mobileSearchHeader: {
    marginBottom: Spacing.md,
  },
  sectionTitleContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: Spacing.xl,
    marginBottom: Spacing.md,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: "#222222",
  },
  sectionTitleRight: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.sm,
  },
  expandArrowButton: {
    width: 40,
    height: 40,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: Colors.light.primary + "15",
    borderRadius: BorderRadius.full,
  },
  clearButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.xs,
  },
  clearButtonText: {
    fontSize: 14,
    color: Colors.light.primary,
    fontWeight: "500",
  },
  horizontalScrollView: {
    marginHorizontal: -Spacing.lg,
  },
  horizontalScrollContent: {
    paddingHorizontal: Spacing.lg,
    gap: Spacing.md,
  },
  horizontalProjectCard: {
    width: PROJECT_CARD_WIDTH,
    borderRadius: BorderRadius.lg,
    overflow: "hidden" as const,
  },
  horizontalProjectImage: {
    width: "100%" as const,
    height: 160,
    backgroundColor: "#F0F0F0",
  } as const,
  horizontalProjectInfo: {
    padding: Spacing.md,
  },
  horizontalProjectName: {
    fontSize: 16,
    fontWeight: "600",
    marginBottom: Spacing.xs,
  },
  projectLocationRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.xs,
    marginBottom: Spacing.sm,
  },
  projectLocation: {
    fontSize: 13,
    flex: 1,
  },
  projectTypeBadge: {
    alignSelf: "flex-start",
    paddingHorizontal: Spacing.sm,
    paddingVertical: Spacing.xs,
    borderRadius: BorderRadius.sm,
  },
  projectTypeLabel: {
    fontSize: 12,
    fontWeight: "500",
  },
  horizontalPropertyCard: {
    width: PROPERTY_CARD_WIDTH,
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
  webProjectsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: Spacing.lg,
    ...(isWeb && { display: "grid" as any, gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))" as any }),
  },
  expandedProjectCard: {
    width: "100%",
    minWidth: 280,
    borderRadius: BorderRadius.lg,
    overflow: "hidden" as const,
  },
  expandedProjectImage: {
    width: "100%" as const,
    height: 180,
    backgroundColor: "#F0F0F0",
  } as const,
  mobilePropertiesList: {
    gap: Spacing.md,
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
  expandedHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: Spacing.lg,
    paddingVertical: Spacing.sm,
  },
  backButton: {
    width: 44,
    height: 44,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: Colors.light.primary + "15",
    borderRadius: BorderRadius.full,
  },
  backButtonPlaceholder: {
    width: 44,
    height: 44,
  },
  expandedTitle: {
    fontSize: 22,
    fontWeight: "700",
    color: "#222222",
    textAlign: "center",
    flex: 1,
  },
});
