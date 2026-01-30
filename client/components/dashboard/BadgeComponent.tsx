import React from "react";
import { View, StyleSheet, Image, Pressable } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { ThemedText } from "@/components/ThemedText";
import { useTheme } from "@/hooks/useTheme";
import { Spacing, BorderRadius, Colors } from "@/constants/theme";

interface BadgeProps {
  id: string;
  name: string;
  icon: keyof typeof Ionicons.glyphMap;
  variant: "gold" | "silver" | "bronze" | "locked";
  isLocked?: boolean;
  onPress?: () => void;
}

const BADGE_COLORS = {
  gold: "#FFD700",
  silver: "#C0C0C0",
  bronze: "#CD7F32",
  locked: "#A0A0A0",
};

export const BadgeComponent = ({
  name,
  icon,
  variant,
  isLocked,
  onPress,
}: BadgeProps) => {
  const { theme } = useTheme();
  const color = isLocked ? BADGE_COLORS.locked : BADGE_COLORS[variant];

  return (
    <Pressable onPress={onPress} style={styles.container}>
      <View
        style={[
          styles.badgeCircle,
          {
            borderColor: color,
            backgroundColor: isLocked
              ? theme.backgroundSecondary
              : color + "20",
          },
        ]}
      >
        <Ionicons name={icon} size={24} color={color} />
        {isLocked && (
          <View style={styles.lockIcon}>
            <Ionicons
              name="lock-closed"
              size={12}
              color={theme.textSecondary}
            />
          </View>
        )}
      </View>
      <ThemedText
        numberOfLines={1}
        style={[
          styles.label,
          { color: isLocked ? theme.textSecondary : theme.text },
        ]}
      >
        {name}
      </ThemedText>
    </Pressable>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: "center",
    width: 70,
    gap: Spacing.xs,
  },
  badgeCircle: {
    width: 56,
    height: 56,
    borderRadius: 28,
    borderWidth: 2,
    alignItems: "center",
    justifyContent: "center",
    position: "relative",
  },
  label: {
    fontSize: 10,
    fontWeight: "600",
    textAlign: "center",
  },
  lockIcon: {
    position: "absolute",
    bottom: -4,
    right: -4,
    backgroundColor: "#F5F5F5",
    borderRadius: 8,
    padding: 2,
  },
});
