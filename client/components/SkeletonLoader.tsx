import React, { useEffect } from "react";
import { View, StyleSheet, Dimensions, Platform } from "react-native";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withTiming,
  interpolate,
} from "react-native-reanimated";
import { Spacing, BorderRadius } from "@/constants/theme";

const { width: SCREEN_WIDTH } = Dimensions.get("window");
const isWeb = Platform.OS === "web";

const SKELETON_COLOR = "#E0E0E0";
const SKELETON_HIGHLIGHT = "#F5F5F5";

interface SkeletonBoxProps {
  width: number | string;
  height: number;
  borderRadius?: number;
  style?: any;
}

function SkeletonBox({
  width,
  height,
  borderRadius = BorderRadius.sm,
  style,
}: SkeletonBoxProps) {
  const shimmer = useSharedValue(0);

  useEffect(() => {
    shimmer.value = withRepeat(withTiming(1, { duration: 1500 }), -1, false);
  }, []);

  const animatedStyle = useAnimatedStyle(() => {
    const opacity = interpolate(shimmer.value, [0, 0.5, 1], [0.3, 0.6, 0.3]);
    return { opacity };
  });

  return (
    <Animated.View
      style={[
        {
          width,
          height,
          borderRadius,
          backgroundColor: SKELETON_COLOR,
        },
        animatedStyle,
        style,
      ]}
    />
  );
}

export function PropertyCardSkeleton() {
  const cardWidth = isWeb ? "100%" : SCREEN_WIDTH - Spacing.lg * 2;

  return (
    <View style={[styles.propertyCard, { width: cardWidth }]}>
      <SkeletonBox width="100%" height={200} borderRadius={BorderRadius.md} />
      <View style={styles.propertyContent}>
        <SkeletonBox width="80%" height={20} style={styles.marginBottom} />
        <SkeletonBox width="50%" height={16} style={styles.marginBottom} />
        <SkeletonBox width="40%" height={14} />
      </View>
    </View>
  );
}

export function ProjectCardSkeleton() {
  return (
    <View style={styles.projectCard}>
      <SkeletonBox width={180} height={120} borderRadius={BorderRadius.md} />
      <View style={styles.projectContent}>
        <SkeletonBox width={140} height={16} style={styles.marginBottomSmall} />
        <SkeletonBox width={100} height={12} style={styles.marginBottomSmall} />
        <SkeletonBox width={60} height={20} borderRadius={BorderRadius.xs} />
      </View>
    </View>
  );
}

export function HorizontalPropertyCardSkeleton() {
  return (
    <View style={styles.horizontalPropertyCard}>
      <View style={styles.horizontalCardInner}>
        <SkeletonBox width="100%" height={200} borderRadius={BorderRadius.md} />
        <View style={styles.propertyContent}>
          <SkeletonBox width="80%" height={18} style={styles.marginBottom} />
          <SkeletonBox width="50%" height={14} style={styles.marginBottom} />
          <SkeletonBox width="40%" height={12} />
        </View>
      </View>
    </View>
  );
}

export function SectionTitleSkeleton() {
  return (
    <View style={styles.sectionTitleContainer}>
      <SkeletonBox width={180} height={24} />
      <SkeletonBox width={24} height={24} borderRadius={12} />
    </View>
  );
}

export function ExploreScreenSkeleton() {
  return (
    <View style={styles.container}>
      <SectionTitleSkeleton />
      <View style={styles.horizontalScroll}>
        {[1, 2, 3].map((i) => (
          <ProjectCardSkeleton key={`project-${i}`} />
        ))}
      </View>

      <SectionTitleSkeleton />
      <View style={styles.horizontalScroll}>
        {[1, 2, 3].map((i) => (
          <HorizontalPropertyCardSkeleton key={`nearby-${i}`} />
        ))}
      </View>

      <SectionTitleSkeleton />
      <View style={styles.horizontalScroll}>
        {[1, 2, 3].map((i) => (
          <HorizontalPropertyCardSkeleton key={`top-${i}`} />
        ))}
      </View>

      <SectionTitleSkeleton />
      {isWeb ? (
        <View style={styles.webGrid}>
          {[1, 2, 3, 4].map((i) => (
            <View key={`all-${i}`} style={styles.webGridItem}>
              <PropertyCardSkeleton />
            </View>
          ))}
        </View>
      ) : (
        <View>
          {[1, 2].map((i) => (
            <PropertyCardSkeleton key={`all-${i}`} />
          ))}
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: Spacing.lg,
  },
  propertyCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: BorderRadius.md,
    marginBottom: Spacing.lg,
    overflow: "hidden",
  },
  propertyContent: {
    padding: Spacing.md,
  },
  projectCard: {
    width: 180,
    marginRight: Spacing.md,
    backgroundColor: "#FFFFFF",
    borderRadius: BorderRadius.md,
    overflow: "hidden",
  },
  projectContent: {
    padding: Spacing.sm,
  },
  horizontalPropertyCard: {
    width: isWeb ? 320 : SCREEN_WIDTH * 0.8,
    marginRight: Spacing.md,
  },
  horizontalCardInner: {
    backgroundColor: "#FFFFFF",
    borderRadius: BorderRadius.md,
    overflow: "hidden",
  },
  sectionTitleContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginVertical: Spacing.lg,
  },
  horizontalScroll: {
    flexDirection: "row",
    marginBottom: Spacing.md,
  },
  webGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: Spacing.lg,
  },
  webGridItem: {
    width: isWeb ? "23%" : "100%",
    minWidth: 280,
  },
  marginBottom: {
    marginBottom: Spacing.sm,
  },
  marginBottomSmall: {
    marginBottom: Spacing.xs,
  },
  favoritesContainer: {
    flex: 1,
    paddingHorizontal: isWeb ? 90 : Spacing.lg,
  },
  favoritesTitleSkeleton: {
    marginBottom: Spacing.lg,
  },
});

export function FavoritesScreenSkeleton() {
  return (
    <View style={styles.favoritesContainer}>
      <SkeletonBox
        width={200}
        height={24}
        style={styles.favoritesTitleSkeleton}
      />
      {isWeb ? (
        <View style={styles.webGrid}>
          {[1, 2, 3, 4].map((i) => (
            <View key={`fav-${i}`} style={styles.webGridItem}>
              <PropertyCardSkeleton />
            </View>
          ))}
        </View>
      ) : (
        <View>
          {[1, 2, 3].map((i) => (
            <PropertyCardSkeleton key={`fav-${i}`} />
          ))}
        </View>
      )}
    </View>
  );
}
