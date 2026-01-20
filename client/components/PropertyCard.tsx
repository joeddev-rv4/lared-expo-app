import React from "react";
import { View, StyleSheet, Pressable, Image, Dimensions, Share, Platform } from "react-native";
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
const isWeb = Platform.OS === "web";

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
      const message = `${property.title}\n\n${property.location}\n${priceFormatted}\n${property.area} m²\n\n${property.description}\n\nLa Red Inmobiliaria - Hecha por vendedores, para vendedores`;

      await Share.share({
        message,
        title: property.title,
      });
    } catch (error) {
      console.error("Error sharing:", error);
    }

    onSharePress?.();
  };

  const bankQuota = Math.round(property.price / 180);

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
          <Animated.View style={heartAnimatedStyle}>
            <Pressable
              onPress={handleFavoritePress}
              hitSlop={12}
              style={styles.iconCircle}
              testID={`favorite-button-${property.id}`}
            >
              <Feather
                name="heart"
                size={18}
                color={isFavorite ? Colors.light.primary : "#333333"}
              />
            </Pressable>
          </Animated.View>
          <Animated.View style={shareAnimatedStyle}>
            <Pressable
              onPress={handleSharePress}
              hitSlop={12}
              style={styles.iconCircle}
              testID={`share-button-${property.id}`}
            >
              <Feather
                name="share"
                size={18}
                color="#333333"
              />
            </Pressable>
          </Animated.View>
        </View>
        <View style={styles.commissionBadge}>
          <ThemedText style={styles.commissionText}>
            Gana Q750.00
          </ThemedText>
        </View>
      </View>

      <View style={styles.content}>
        <ThemedText style={styles.title} numberOfLines={2}>
          {property.title}
        </ThemedText>

        <ThemedText style={[styles.bankQuota, { color: theme.textSecondary }]}>
          Cuota desde Q{bankQuota.toLocaleString()}/mes
        </ThemedText>

        <Pressable onPress={handleSharePress} style={styles.shareButton}>
          <ThemedText style={[styles.shareButtonText, { color: Colors.light.primary }]}>
            COMPARTE Y GANA
          </ThemedText>
          <Feather name="chevron-right" size={16} color={Colors.light.primary} />
        </Pressable>
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
    width: isWeb ? "100%" : CARD_WIDTH,
    height: IMAGE_HEIGHT,
    aspectRatio: isWeb ? 16 / 10 : undefined,
  },
  actionButtons: {
    position: "absolute",
    top: Spacing.md,
    right: Spacing.md,
    flexDirection: "row",
    gap: Spacing.sm,
  },
  iconCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "rgba(255, 255, 255, 0.85)",
    justifyContent: "center",
    alignItems: "center",
  },
  commissionBadge: {
    position: "absolute",
    bottom: Spacing.md,
    left: Spacing.md,
    backgroundColor: "#DC2626",
    paddingHorizontal: Spacing.sm,
    paddingVertical: 4,
    borderRadius: BorderRadius.xs,
  },
  commissionText: {
    fontSize: 12,
    fontWeight: "700",
    color: "#FFFFFF",
  },
  content: {
    padding: Spacing.md,
  },
  title: {
    fontSize: 17,
    fontWeight: "600",
    marginBottom: Spacing.xs,
  },
  bankQuota: {
    fontSize: 14,
    marginBottom: Spacing.sm,
  },
  shareButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  shareButtonText: {
    fontSize: 13,
    fontWeight: "600",
    letterSpacing: 0.5,
  },
});
