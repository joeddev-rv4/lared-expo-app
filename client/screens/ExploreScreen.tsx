import React, { useState, useEffect, useCallback } from "react";
import { View, FlatList, StyleSheet, RefreshControl } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useHeaderHeight } from "@react-navigation/elements";
import { useBottomTabBarHeight } from "@react-navigation/bottom-tabs";
import { DrawerActions, useNavigation } from "@react-navigation/native";
import * as Haptics from "expo-haptics";

import { PropertyCard } from "@/components/PropertyCard";
import { SearchBar } from "@/components/SearchBar";
import { FilterChip } from "@/components/FilterChip";
import { EmptyState } from "@/components/EmptyState";
import { useTheme } from "@/hooks/useTheme";
import { PLACEHOLDER_PROPERTIES, PROPERTY_TYPES, Property } from "@/data/properties";
import { getFavorites, toggleFavorite } from "@/lib/storage";
import { Spacing } from "@/constants/theme";

export default function ExploreScreen() {
  const navigation = useNavigation();
  const insets = useSafeAreaInsets();
  const headerHeight = useHeaderHeight();
  const tabBarHeight = useBottomTabBarHeight();
  const { theme } = useTheme();

  const [searchQuery, setSearchQuery] = useState("");
  const [selectedFilter, setSelectedFilter] = useState("All");
  const [favorites, setFavorites] = useState<string[]>([]);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    loadFavorites();
  }, []);

  const loadFavorites = async () => {
    const favs = await getFavorites();
    setFavorites(favs);
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    await loadFavorites();
    setTimeout(() => setRefreshing(false), 500);
  };

  const handleFavoriteToggle = async (propertyId: string) => {
    const newFavorites = await toggleFavorite(propertyId);
    setFavorites(newFavorites);
  };

  const handlePropertyPress = (property: Property) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  };

  const handleFilterPress = () => {
    navigation.dispatch(DrawerActions.openDrawer());
  };

  const filteredProperties = PLACEHOLDER_PROPERTIES.filter((property) => {
    const matchesSearch =
      property.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      property.location.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesFilter =
      selectedFilter === "All" || property.propertyType === selectedFilter;
    return matchesSearch && matchesFilter;
  });

  const renderHeader = () => (
    <View style={styles.headerContainer}>
      <SearchBar
        value={searchQuery}
        onChangeText={setSearchQuery}
        placeholder="Search destinations..."
        onFilterPress={handleFilterPress}
      />
      <FlatList
        horizontal
        data={PROPERTY_TYPES}
        keyExtractor={(item) => item}
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.filterList}
        renderItem={({ item }) => (
          <FilterChip
            label={item}
            isSelected={selectedFilter === item}
            onPress={() => setSelectedFilter(item)}
          />
        )}
      />
    </View>
  );

  const renderEmpty = () => (
    <EmptyState
      image={require("../../assets/images/empty-states/search.png")}
      title="No Properties Found"
      description="Try adjusting your search or filters to find what you're looking for."
      actionLabel="Clear Filters"
      onAction={() => {
        setSearchQuery("");
        setSelectedFilter("All");
      }}
    />
  );

  return (
    <View style={[styles.container, { backgroundColor: theme.backgroundRoot }]}>
      <FlatList
        data={filteredProperties}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <PropertyCard
            property={item}
            isFavorite={favorites.includes(item.id)}
            onPress={() => handlePropertyPress(item)}
            onFavoritePress={() => handleFavoriteToggle(item.id)}
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
  filterList: {
    paddingVertical: Spacing.lg,
  },
});
