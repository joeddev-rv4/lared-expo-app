import React from "react";
import { StyleSheet, Pressable, View } from "react-native";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from "react-native-reanimated";
import * as Haptics from "expo-haptics";
import { Feather } from "@expo/vector-icons";

import { ThemedText } from "@/components/ThemedText";
import { useTheme } from "@/hooks/useTheme";
import { Spacing, BorderRadius, Colors } from "@/constants/theme";

interface FilterChipProps {
  label: string;
  isSelected: boolean;
  onPress: () => void;
  icon?: keyof typeof Feather.glyphMap;
  emoji?: string;
}

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

export function FilterChip({ label, isSelected, onPress, icon, emoji }: FilterChipProps) {
  const { theme } = useTheme();
  const scale = useSharedValue(1);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
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
      style={[
        styles.chip,
        {
          backgroundColor: isSelected ? Colors.light.primary : theme.backgroundDefault,
          borderColor: isSelected ? Colors.light.primary : theme.border,
        },
        animatedStyle,
      ]}
    >
      <View style={styles.chipContent}>
        {emoji && (
          <ThemedText style={styles.emoji}>{emoji}</ThemedText>
        )}
        {icon && (
          <Feather
            name={icon}
            size={16}
            color={isSelected ? "#FFFFFF" : theme.text}
            style={styles.icon}
          />
        )}
        <ThemedText
          style={[
            styles.label,
            { color: isSelected ? "#FFFFFF" : theme.text },
          ]}
        >
          {label}
        </ThemedText>
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
