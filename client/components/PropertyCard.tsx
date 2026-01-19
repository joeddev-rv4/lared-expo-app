import React from "react";
import { View, StyleSheet, Pressable, Image, Dimensions, Share } from "react-native";
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
  onSharePress?: () => void;
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
  onSharePress,
}: PropertyCardProps) {
  const { theme, isDark } = useTheme();
  const scale = useSharedValue(1);
  const heartScale = useSharedValue(1);
  const shareScale = useSharedValue(1);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const heartAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: heartScale.value }],
  }));

  const shareAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: shareScale.value }],
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

  const handleSharePress = async () => {
    shareScale.value = withSpring(1.3, { damping: 10 });
    setTimeout(() => {
      shareScale.value = withSpring(1, { damping: 10 });
    }, 100);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);

    try {
      const priceFormatted = `Q${property.price.toLocaleString()}`;
      const message = `🏠 ${property.title}\n\n📍 ${property.location}\n💰 ${priceFormatted}\n📐 ${property.area} m²\n\n${property.description}\n\n🔗 La Red Inmobiliaria - Hecha por vendedores, para vendedores`;

      await Share.share({
        message,
        title: property.title,
      });
    } catch (error) {
      console.error("Error sharing:", error);
    }

    onSharePress?.();
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
        <View style={styles.actionButtons}>
          <Animated.View style={shareAnimatedStyle}>
            <Pressable
              onPress={handleSharePress}
              hitSlop={12}
              style={styles.actionButton}
              testID={`share-button-${property.id}`}
            >
              <Feather
                name="share"
                size={22}
                color="#FFFFFF"
                style={{
                  textShadowColor: "rgba(0,0,0,0.5)",
                  textShadowOffset: { width: 0, height: 1 },
                  textShadowRadius: 3,
                }}
              />
            </Pressable>
          </Animated.View>
          <Animated.View style={heartAnimatedStyle}>
            <Pressable
              onPress={handleFavoritePress}
              hitSlop={12}
              style={styles.actionButton}
              testID={`favorite-button-${property.id}`}
            >
              <Feather
                name={isFavorite ? "heart" : "heart"}
                size={22}
                color={isFavorite ? Colors.light.primary : "#FFFFFF"}
                style={{
                  textShadowColor: "rgba(0,0,0,0.5)",
                  textShadowOffset: { width: 0, height: 1 },
                  textShadowRadius: 3,
                }}
              />
              {isFavorite ? (
                <View style={styles.heartFill}>
                  <Feather name="heart" size={22} color={Colors.light.primary} />
                </View>
              ) : null}
            </Pressable>
          </Animated.View>
        </View>
        <View style={styles.commissionBadge}>
          <ThemedText style={styles.commissionText}>
            💰 Gana Q750.00
          </ThemedText>
        </View>
        <View style={styles.propertyTypeBadge}>
          <ThemedText style={styles.propertyTypeText}>
            {property.propertyType}
          </ThemedText>
        </View>
      </View>

      <View style={styles.content}>
        <View style={styles.headerRow}>
          <ThemedText style={styles.title} numberOfLines={2}>
            {property.title}
          </ThemedText>
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
              <Feather name="maximize" size={14} color={theme.textSecondary} />
              <ThemedText style={[styles.amenityText, { color: theme.textSecondary }]}>
                {property.area} m²
              </ThemedText>
            </View>
            {property.bedrooms > 0 && (
              <View style={styles.amenityItem}>
                <Feather name="home" size={14} color={theme.textSecondary} />
                <ThemedText style={[styles.amenityText, { color: theme.textSecondary }]}>
                  {property.bedrooms} hab.
                </ThemedText>
              </View>
            )}
            {property.bathrooms > 0 && (
              <View style={styles.amenityItem}>
                <Feather name="droplet" size={14} color={theme.textSecondary} />
                <ThemedText style={[styles.amenityText, { color: theme.textSecondary }]}>
                  {property.bathrooms} baños
                </ThemedText>
              </View>
            )}
          </View>
          <View style={styles.priceContainer}>
            <ThemedText style={[styles.price, { color: Colors.light.primary }]}>
              Q{property.price.toLocaleString()}
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
  actionButtons: {
    position: "absolute",
    top: Spacing.md,
    right: Spacing.md,
    flexDirection: "row",
    gap: Spacing.sm,
  },
  actionButton: {
    padding: Spacing.xs,
  },
  heartFill: {
    position: "absolute",
    top: 0,
    left: 0,
  },
  commissionBadge: {
    position: "absolute",
    bottom: Spacing.md,
    left: Spacing.md,
    backgroundColor: "#DC2626",
    paddingHorizontal: Spacing.sm,
    paddingVertical: 3,
    borderRadius: BorderRadius.xs,
  },
  commissionText: {
    fontSize: 11,
    fontWeight: "700",
    color: "#FFFFFF",
  },
  propertyTypeBadge: {
    position: "absolute",
    bottom: Spacing.md,
    right: Spacing.md,
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
    marginBottom: Spacing.xs,
  },
  title: {
    fontSize: 17,
    fontWeight: "600",
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
});
