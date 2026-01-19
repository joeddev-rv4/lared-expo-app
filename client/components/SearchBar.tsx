import React from "react";
import { View, TextInput, StyleSheet, Pressable } from "react-native";
import { Feather } from "@expo/vector-icons";

import { useTheme } from "@/hooks/useTheme";
import { Spacing, BorderRadius, Shadows } from "@/constants/theme";

interface SearchBarProps {
  value: string;
  onChangeText: (text: string) => void;
  placeholder?: string;
  onFilterPress?: () => void;
}

export function SearchBar({
  value,
  onChangeText,
  placeholder = "Search properties...",
  onFilterPress,
}: SearchBarProps) {
  const { theme, isDark } = useTheme();

  return (
    <View
      style={[
        styles.container,
        {
          backgroundColor: theme.backgroundRoot,
          borderColor: theme.border,
        },
        isDark ? null : Shadows.card,
      ]}
    >
      <Feather name="search" size={20} color={theme.textSecondary} />
      <TextInput
        style={[styles.input, { color: theme.text }]}
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor={theme.textSecondary}
        testID="search-input"
      />
      {onFilterPress ? (
        <Pressable
          onPress={onFilterPress}
          style={styles.filterButton}
          hitSlop={8}
          testID="filter-button"
        >
          <Feather name="sliders" size={20} color={theme.text} />
        </Pressable>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
    borderRadius: BorderRadius.full,
    borderWidth: 1,
    gap: Spacing.sm,
  },
  input: {
    flex: 1,
    fontSize: 16,
    paddingVertical: 0,
  },
  filterButton: {
    padding: Spacing.xs,
  },
});
