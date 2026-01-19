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
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useHeaderHeight } from "@react-navigation/elements";
import { useBottomTabBarHeight } from "@react-navigation/bottom-tabs";
import * as Haptics from "expo-haptics";
import { Feather } from "@expo/vector-icons";

import { PropertyCard } from "@/components/PropertyCard";
import { SearchBar } from "@/components/SearchBar";
import { FilterChip } from "@/components/FilterChip";
import { EmptyState } from "@/components/EmptyState";
import { ThemedText } from "@/components/ThemedText";
import { useTheme } from "@/hooks/useTheme";
import { Property, mapAPIPropertyToProperty } from "@/data/properties";
import { getFavorites, toggleFavorite, getUserProfile } from "@/lib/storage";
import {
  fetchPropiedades,
  APIPropiedad,
  ExtractedProject,
  extractProjectsFromProperties,
} from "@/lib/api";
import { Spacing, Colors, BorderRadius, Shadows } from "@/constants/theme";

const FILTER_OPTIONS = [
  { key: "Todos", label: "Todos", emoji: "🔍" },
  { key: "Propiedades", label: "Propiedades", emoji: "🏠" },
  { key: "Proyectos", label: "Proyectos", emoji: "🏗️" },
];

const { width: SCREEN_WIDTH } = Dimensions.get("window");
const PROJECT_CARD_WIDTH = (SCREEN_WIDTH - Spacing.lg * 3) / 2;

export default function ExploreScreen() {
  const insets = useSafeAreaInsets();
  const headerHeight = useHeaderHeight();
  const tabBarHeight = useBottomTabBarHeight();
  const { theme, isDark } = useTheme();

  const [searchQuery, setSearchQuery] = useState("");
  const [selectedFilter, setSelectedFilter] = useState("Todos");
  const [favorites, setFavorites] = useState<string[]>([]);
  const [refreshing, setRefreshing] = useState(false);
  const [properties, setProperties] = useState<Property[]>([]);
  const [rawApiData, setRawApiData] = useState<APIPropiedad[]>([]);
  const [projects, setProjects] = useState<ExtractedProject[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedProject, setSelectedProject] = useState<ExtractedProject | null>(null);
  const [userName, setUserName] = useState<string>("Usuario");

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      setError(null);
      const [apiProperties, favs, userProfile] = await Promise.all([
        fetchPropiedades(),
        getFavorites(),
        getUserProfile(),
      ]);
      setRawApiData(apiProperties);
      const mappedProperties = apiProperties.map(mapAPIPropertyToProperty);
      setProperties(mappedProperties);
      setFavorites(favs);
      if (userProfile?.name) {
        setUserName(userProfile.name);
      }

      const extractedProjects = extractProjectsFromProperties(apiProperties);
      setProjects(extractedProjects);
    } catch (err) {
      setError("Error al cargar las propiedades. Intenta de nuevo.");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    await loadData();
    setRefreshing(false);
  };

  const handleFavoriteToggle = async (propertyId: string) => {
    const newFavorites = await toggleFavorite(propertyId);
    setFavorites(newFavorites);
  };

  const handlePropertyPress = (property: Property) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  };

  const handleSharePress = (property: Property) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  };

  const filteredProperties = useMemo(() => {
    let filtered = properties;

    if (selectedProject) {
      filtered = filtered.filter((p) => p.projectName === selectedProject.name);
    } else if (selectedFilter === "Propiedades") {
      // Show all properties
    } else if (selectedFilter === "Proyectos") {
      return [];
    }

    if (searchQuery) {
      filtered = filtered.filter((property) =>
        property.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        property.location.toLowerCase().includes(searchQuery.toLowerCase()) ||
        property.projectName.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    return filtered;
  }, [properties, searchQuery, selectedFilter, selectedProject]);

  const filteredProjects = useMemo(() => {
    if (!searchQuery) return projects;
    return projects.filter((project) =>
      project.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      project.location.toLowerCase().includes(searchQuery.toLowerCase()) ||
      project.address.toLowerCase().includes(searchQuery.toLowerCase()) ||
      project.type.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [projects, searchQuery]);

  const handleProjectPress = (project: ExtractedProject) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setSelectedProject(project);
    setSelectedFilter("Propiedades");
  };

  const handleFilterChange = (filterKey: string) => {
    setSelectedFilter(filterKey);
    if (filterKey !== "Propiedades") {
      setSelectedProject(null);
    }
  };

  const renderProjectCard = ({ item }: { item: ExtractedProject }) => (
    <Pressable
      onPress={() => handleProjectPress(item)}
      style={({ pressed }) => [
        styles.projectCard,
        { backgroundColor: theme.backgroundRoot, opacity: pressed ? 0.9 : 1 },
        isDark ? null : Shadows.card,
      ]}
    >
      <Image source={{ uri: item.imageUrl }} style={styles.projectImage} />
      <View style={styles.projectInfo}>
        <ThemedText style={styles.projectName} numberOfLines={1}>
          {item.name}
        </ThemedText>
        <View style={styles.projectLocationRow}>
          <Feather name="map-pin" size={12} color={theme.textSecondary} />
          <ThemedText
            style={[styles.projectLocation, { color: theme.textSecondary }]}
            numberOfLines={1}
          >
            {item.location || item.address}
          </ThemedText>
        </View>
        <View style={styles.projectTypeRow}>
          <View style={[styles.projectTypeBadge, { backgroundColor: Colors.light.primary + "20" }]}>
            <ThemedText style={[styles.projectTypeLabel, { color: Colors.light.primary }]}>
              {item.type}
            </ThemedText>
          </View>
        </View>
        <ThemedText style={[styles.projectCount, { color: Colors.light.primary }]}>
          {item.propertyCount} {item.propertyCount === 1 ? "propiedad" : "propiedades"}
        </ThemedText>
      </View>
    </Pressable>
  );

  const renderHeader = () => (
    <View style={styles.headerContainer}>
      <ThemedText style={styles.greetingText}>
        Hola, {userName}
      </ThemedText>
      <SearchBar
        value={searchQuery}
        onChangeText={setSearchQuery}
        placeholder="Buscar propiedades o proyectos..."
      />
      <View style={styles.filterContainer}>
        <FlatList
          horizontal
          data={FILTER_OPTIONS}
          keyExtractor={(item) => item.key}
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.filterList}
          renderItem={({ item }) => (
            <FilterChip
              label={item.label}
              emoji={item.emoji}
              isSelected={selectedFilter === item.key}
              onPress={() => handleFilterChange(item.key)}
            />
          )}
        />
      </View>
      {selectedProject && (
        <View style={styles.selectedProjectContainer}>
          <ThemedText style={[styles.selectedProjectLabel, { color: theme.textSecondary }]}>
            Proyecto:
          </ThemedText>
          <Pressable
            onPress={() => setSelectedProject(null)}
            style={[styles.selectedProjectChip, { backgroundColor: Colors.light.primary }]}
          >
            <ThemedText style={styles.selectedProjectText}>{selectedProject.name}</ThemedText>
            <Feather name="x" size={16} color="#FFFFFF" />
          </Pressable>
        </View>
      )}
    </View>
  );

  const renderEmpty = () => {
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
      <EmptyState
        image={require("../../assets/images/empty-states/search.png")}
        title="Sin resultados"
        description="No se encontraron resultados. Intenta ajustar tu búsqueda."
        actionLabel="Limpiar filtros"
        onAction={() => {
          setSearchQuery("");
          setSelectedFilter("Todos");
          setSelectedProject(null);
        }}
      />
    );
  };

  const showProjectsGrid = selectedFilter === "Proyectos" && !selectedProject;

  return (
    <View style={[styles.container, { backgroundColor: theme.backgroundRoot }]}>
      {showProjectsGrid ? (
        <FlatList
          key="projects-grid"
          data={filteredProjects}
          keyExtractor={(item) => item.id.toString()}
          numColumns={2}
          renderItem={renderProjectCard}
          columnWrapperStyle={styles.projectsRow}
          contentContainerStyle={[
            styles.listContent,
            {
              paddingTop: headerHeight + Spacing.lg,
              paddingBottom: tabBarHeight + Spacing.xl,
            },
            filteredProjects.length === 0 ? styles.emptyList : null,
          ]}
          scrollIndicatorInsets={{ bottom: insets.bottom }}
          ListHeaderComponent={renderHeader}
          ListEmptyComponent={renderEmpty}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={handleRefresh}
              tintColor={theme.textSecondary}
              progressViewOffset={headerHeight}
            />
          }
        />
      ) : (
        <FlatList
          key="properties-list"
          data={filteredProperties}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <PropertyCard
              property={item}
              isFavorite={favorites.includes(item.id)}
              onPress={() => handlePropertyPress(item)}
              onFavoritePress={() => handleFavoriteToggle(item.id)}
              onSharePress={() => handleSharePress(item)}
            />
          )}
          contentContainerStyle={[
            styles.listContent,
            {
              paddingTop: headerHeight + Spacing.lg,
              paddingBottom: tabBarHeight + Spacing.xl,
            },
            filteredProperties.length === 0 ? styles.emptyList : null,
          ]}
          scrollIndicatorInsets={{ bottom: insets.bottom }}
          ListHeaderComponent={renderHeader}
          ListEmptyComponent={renderEmpty}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={handleRefresh}
              tintColor={theme.textSecondary}
              progressViewOffset={headerHeight}
            />
          }
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  listContent: {
    paddingHorizontal: Spacing.lg,
  },
  emptyList: {
    flexGrow: 1,
  },
  headerContainer: {
    marginBottom: Spacing.lg,
  },
  greetingText: {
    fontSize: 24,
    fontWeight: "700",
    marginBottom: Spacing.md,
  },
  filterContainer: {
    marginTop: Spacing.md,
  },
  filterList: {
    paddingVertical: Spacing.sm,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: Spacing["5xl"],
  },
  loadingText: {
    marginTop: Spacing.lg,
    fontSize: 16,
  },
  selectedProjectContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: Spacing.sm,
  },
  selectedProjectLabel: {
    fontSize: 14,
    marginRight: Spacing.sm,
  },
  selectedProjectChip: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.xs,
    borderRadius: BorderRadius.full,
    gap: Spacing.xs,
  },
  selectedProjectText: {
    color: "#FFFFFF",
    fontSize: 14,
    fontWeight: "500",
  },
  projectsRow: {
    justifyContent: "space-between",
    marginBottom: Spacing.md,
  },
  projectCard: {
    width: PROJECT_CARD_WIDTH,
    borderRadius: BorderRadius.md,
    overflow: "hidden",
  },
  projectImage: {
    width: "100%",
    height: 120,
  },
  projectInfo: {
    padding: Spacing.sm,
  },
  projectName: {
    fontSize: 14,
    fontWeight: "600",
    marginBottom: Spacing.xs,
  },
  projectLocationRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    marginBottom: Spacing.xs,
  },
  projectLocation: {
    fontSize: 12,
    flex: 1,
  },
  projectTypeRow: {
    marginBottom: Spacing.xs,
  },
  projectTypeBadge: {
    alignSelf: "flex-start",
    paddingHorizontal: Spacing.xs,
    paddingVertical: 2,
    borderRadius: BorderRadius.xs,
  },
  projectTypeLabel: {
    fontSize: 10,
    fontWeight: "600",
  },
  projectCount: {
    fontSize: 12,
    fontWeight: "500",
  },
});
