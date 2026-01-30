import React, { useEffect } from "react";
import { StyleSheet, Pressable, View } from "react-native";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withTiming,
  interpolateColor,
} from "react-native-reanimated";
import * as Haptics from "expo-haptics";
import { Ionicons } from "@expo/vector-icons";

import { ThemedText } from "@/components/ThemedText";
import { useTheme } from "@/hooks/useTheme";
import { Spacing, BorderRadius, Colors } from "@/constants/theme";

interface FilterChipProps {
  label: string;
  isSelected: boolean;
  onPress: () => void;
  icon?: keyof typeof Ionicons.glyphMap;
  emoji?: string;
  selectedColor?: string;
}

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

export function FilterChip({
  label,
  isSelected,
  onPress,
  icon,
  emoji,
  selectedColor = Colors.light.primary,
}: FilterChipProps) {
  const { theme } = useTheme();
  const scale = useSharedValue(1);
  const selectedAnim = useSharedValue(isSelected ? 1 : 0);

  useEffect(() => {
    selectedAnim.value = withTiming(isSelected ? 1 : 0, { duration: 300 });
  }, [isSelected]);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const chipAnimatedStyle = useAnimatedStyle(() => ({
    backgroundColor: interpolateColor(
      selectedAnim.value,
      [0, 1],
      [theme.backgroundDefault, selectedColor],
    ),
    borderColor: interpolateColor(
      selectedAnim.value,
      [0, 1],
      [theme.border, selectedColor],
    ),
  }));

  const textAnimatedStyle = useAnimatedStyle(() => ({
    color: interpolateColor(
      selectedAnim.value,
      [0, 1],
      [theme.text, "#FFFFFF"],
    ),
  }));

  const handlePressIn = () => {
    scale.value = withSpring(0.95, { damping: 15, stiffness: 150 });
  };

  const handlePressOut = () => {
    scale.value = withSpring(1, { damping: 15, stiffness: 150 });
  };

  const handlePress = () => {
    Haptics.selectionAsync();
    onPress();
  };

  return (
    <AnimatedPressable
      onPress={handlePress}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      style={[styles.chip, chipAnimatedStyle, animatedStyle]}
    >
      <View style={styles.chipContent}>
        {emoji && <ThemedText style={styles.emoji}>{emoji}</ThemedText>}
        {icon && (
          <Ionicons
            name={icon}
            size={16}
            color={isSelected ? "#FFFFFF" : theme.text}
            style={styles.icon}
          />
        )}
        <Animated.Text style={[styles.label, textAnimatedStyle]}>
          {label}
        </Animated.Text>
      </View>
    </AnimatedPressable>
  );
}

const styles = StyleSheet.create({
  chip: {
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.sm,
    borderRadius: BorderRadius.full,
    borderWidth: 1,
    marginRight: Spacing.sm,
  },
  chipContent: {
    flexDirection: "row",
    alignItems: "center",
  },
  emoji: {
    fontSize: 16,
    marginRight: Spacing.xs,
  },
  icon: {
    marginRight: Spacing.xs,
  },
  label: {
    fontSize: 14,
    fontWeight: "500",
  },
});
