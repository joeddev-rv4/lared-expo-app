import React from "react";
import { View, StyleSheet, Pressable, Image, Dimensions } from "react-native";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from "react-native-reanimated";
import { Feather } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";

import { ThemedText } from "@/components/ThemedText";
import { useTheme } from "@/hooks/useTheme";
import { Property } from "@/data/properties";
import { Spacing, BorderRadius, Colors, Shadows } from "@/constants/theme";

interface PropertyCardProps {
  property: Property;
  isFavorite: boolean;
  onPress: () => void;
  onFavoritePress: () => void;
}

const { width: SCREEN_WIDTH } = Dimensions.get("window");
const CARD_WIDTH = SCREEN_WIDTH - Spacing.lg * 2;
const IMAGE_HEIGHT = 200;

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

export function PropertyCard({
  property,
  isFavorite,
  onPress,
  onFavoritePress,
}: PropertyCardProps) {
  const { theme, isDark } = useTheme();
  const scale = useSharedValue(1);
  const heartScale = useSharedValue(1);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const heartAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: heartScale.value }],
  }));

  const handlePressIn = () => {
    scale.value = withSpring(0.98, { damping: 15, stiffness: 150 });
  };

  const handlePressOut = () => {
    scale.value = withSpring(1, { damping: 15, stiffness: 150 });
  };

  const handleFavoritePress = () => {
    heartScale.value = withSpring(1.3, { damping: 10 });
    setTimeout(() => {
      heartScale.value = withSpring(1, { damping: 10 });
    }, 100);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    onFavoritePress();
  };

  return (
    <AnimatedPressable
      onPress={onPress}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      style={[
        styles.container,
        {
          backgroundColor: theme.backgroundRoot,
        },
        isDark ? null : Shadows.card,
        animatedStyle,
      ]}
      testID={`property-card-${property.id}`}
    >
      <View style={styles.imageContainer}>
        <Image
          source={{ uri: property.imageUrl }}
          style={styles.image}
          resizeMode="cover"
        />
        <Animated.View style={[styles.favoriteButton, heartAnimatedStyle]}>
          <Pressable
            onPress={handleFavoritePress}
            hitSlop={12}
            testID={`favorite-button-${property.id}`}
          >
            <Feather
              name={isFavorite ? "heart" : "heart"}
              size={24}
              color={isFavorite ? Colors.light.primary : "#FFFFFF"}
              style={{
                textShadowColor: "rgba(0,0,0,0.5)",
                textShadowOffset: { width: 0, height: 1 },
                textShadowRadius: 3,
              }}
            />
            {isFavorite ? (
              <View style={styles.heartFill}>
                <Feather name="heart" size={24} color={Colors.light.primary} />
              </View>
            ) : null}
          </Pressable>
        </Animated.View>
        <View style={styles.propertyTypeBadge}>
          <ThemedText style={styles.propertyTypeText}>
            {property.propertyType}
          </ThemedText>
        </View>
      </View>

      <View style={styles.content}>
        <View style={styles.headerRow}>
          <ThemedText style={styles.title} numberOfLines={1}>
            {property.title}
          </ThemedText>
          <View style={styles.ratingContainer}>
            <Feather name="star" size={14} color={Colors.light.primary} />
            <ThemedText style={styles.rating}>{property.rating}</ThemedText>
            <ThemedText style={[styles.reviewCount, { color: theme.textSecondary }]}>
              ({property.reviewCount})
            </ThemedText>
          </View>
        </View>

        <View style={styles.locationRow}>
          <Feather name="map-pin" size={14} color={theme.textSecondary} />
          <ThemedText
            style={[styles.location, { color: theme.textSecondary }]}
            numberOfLines={1}
          >
            {property.location}
          </ThemedText>
        </View>

        <ThemedText
          style={[styles.description, { color: theme.textSecondary }]}
          numberOfLines={2}
        >
          {property.description}
        </ThemedText>

        <View style={styles.footer}>
          <View style={styles.amenities}>
            <View style={styles.amenityItem}>
              <Feather name="users" size={14} color={theme.textSecondary} />
              <ThemedText style={[styles.amenityText, { color: theme.textSecondary }]}>
                {property.guests}
              </ThemedText>
            </View>
            <View style={styles.amenityItem}>
              <Feather name="home" size={14} color={theme.textSecondary} />
              <ThemedText style={[styles.amenityText, { color: theme.textSecondary }]}>
                {property.bedrooms} bed
              </ThemedText>
            </View>
          </View>
          <View style={styles.priceContainer}>
            <ThemedText style={[styles.price, { color: theme.text }]}>
              ${property.price}
            </ThemedText>
            <ThemedText style={[styles.priceUnit, { color: theme.textSecondary }]}>
              /{property.priceUnit}
            </ThemedText>
          </View>
        </View>
      </View>
    </AnimatedPressable>
  );
}

const styles = StyleSheet.create({
  container: {
    borderRadius: BorderRadius.md,
    marginBottom: Spacing.lg,
    overflow: "hidden",
  },
  imageContainer: {
    position: "relative",
  },
  image: {
    width: CARD_WIDTH,
    height: IMAGE_HEIGHT,
  },
  favoriteButton: {
    position: "absolute",
    top: Spacing.md,
    right: Spacing.md,
  },
  heartFill: {
    position: "absolute",
    top: 0,
    left: 0,
  },
  propertyTypeBadge: {
    position: "absolute",
    bottom: Spacing.md,
    left: Spacing.md,
    backgroundColor: "rgba(255,255,255,0.95)",
    paddingHorizontal: Spacing.sm,
    paddingVertical: Spacing.xs,
    borderRadius: BorderRadius.xs,
  },
  propertyTypeText: {
    fontSize: 12,
    fontWeight: "600",
    color: Colors.light.text,
  },
  content: {
    padding: Spacing.md,
  },
  headerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: Spacing.xs,
  },
  title: {
    fontSize: 17,
    fontWeight: "600",
    flex: 1,
    marginRight: Spacing.sm,
  },
  ratingContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 3,
  },
  rating: {
    fontSize: 14,
    fontWeight: "600",
    marginLeft: 2,
  },
  reviewCount: {
    fontSize: 13,
  },
  locationRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: Spacing.sm,
    gap: 4,
  },
  location: {
    fontSize: 14,
    flex: 1,
  },
  description: {
    fontSize: 14,
    lineHeight: 20,
    marginBottom: Spacing.md,
  },
  footer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  amenities: {
    flexDirection: "row",
    gap: Spacing.md,
  },
  amenityItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  amenityText: {
    fontSize: 13,
  },
  priceContainer: {
    flexDirection: "row",
    alignItems: "baseline",
  },
  price: {
    fontSize: 18,
    fontWeight: "700",
  },
  priceUnit: {
    fontSize: 14,
  },
});
