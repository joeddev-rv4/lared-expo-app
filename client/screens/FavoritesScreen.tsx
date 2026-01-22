import React, { useState, useEffect, useCallback } from "react";
import { View, FlatList, StyleSheet, RefreshControl, Platform } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useHeaderHeight } from "@react-navigation/elements";
import { useBottomTabBarHeight } from "@react-navigation/bottom-tabs";
import { useFocusEffect } from "@react-navigation/native";
import * as Haptics from "expo-haptics";

import { PropertyCard } from "@/components/PropertyCard";
import { EmptyState } from "@/components/EmptyState";
import { useTheme } from "@/hooks/useTheme";
import { PLACEHOLDER_PROPERTIES, Property } from "@/data/properties";
import { getFavorites, toggleFavorite } from "@/lib/storage";
import { Spacing } from "@/constants/theme";

const isWeb = Platform.OS === "web";

export default function FavoritesScreen() {
  const insets = useSafeAreaInsets();
  const headerHeight = useHeaderHeight();
  const tabBarHeight = isWeb ? 0 : useBottomTabBarHeight();
  const { theme } = useTheme();

  const [favorites, setFavorites] = useState<string[]>([]);
  const [refreshing, setRefreshing] = useState(false);

  useFocusEffect(
    useCallback(() => {
      loadFavorites();
    }, [])
  );

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

  const favoriteProperties = PLACEHOLDER_PROPERTIES.filter((p) =>
    favorites.includes(p.id)
  );

  const renderEmpty = () => (
    <EmptyState
      image={require("../../assets/images/empty-states/favorites.png")}
      title="No Favorites Yet"
      description="Start exploring and save the properties you love by tapping the heart icon."
    />
  );

  return (
    <View style={[styles.container, { backgroundColor: theme.backgroundRoot }]}>
      <FlatList
        data={favoriteProperties}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <PropertyCard
            property={item}
            isFavorite={true}
            onPress={() => handlePropertyPress(item)}
            onFavoritePress={() => handleFavoriteToggle(item.id)}
          />
        )}
        contentContainerStyle={[
          styles.listContent,
          {
            paddingTop: headerHeight + Spacing.xl,
            paddingBottom: tabBarHeight + Spacing.xl,
          },
          favoriteProperties.length === 0 ? styles.emptyList : null,
        ]}
        scrollIndicatorInsets={{ bottom: insets.bottom }}
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
});
