import React, { useState } from "react";
import { View, StyleSheet, Pressable, TextInput } from "react-native";
import { Ionicons } from "@expo/vector-icons";

import { ThemedText } from "@/components/ThemedText";
import { Colors, Spacing, BorderRadius, Shadows } from "@/constants/theme";

interface WebSearchBarProps {
  onSearch?: (query: {
    property: string;
    project: string;
    location: string;
  }) => void;
}

export function WebSearchBar({ onSearch }: WebSearchBarProps) {
  const [propertyName, setPropertyName] = useState("");
  const [projectName, setProjectName] = useState("");
  const [location, setLocation] = useState("");

  const handleSearch = () => {
    onSearch?.({
      property: propertyName,
      project: projectName,
      location: location,
    });
  };

  return (
    <View style={styles.container}>
      <View style={styles.searchBar}>
        <View style={styles.searchField}>
          <ThemedText style={styles.fieldLabel}>Propiedad</ThemedText>
          <TextInput
            style={styles.fieldInput}
            placeholder="Buscar por nombre..."
            placeholderTextColor="#717171"
            value={propertyName}
            onChangeText={setPropertyName}
          />
        </View>

        <View style={styles.divider} />

        <View style={styles.searchField}>
          <ThemedText style={styles.fieldLabel}>Proyecto</ThemedText>
          <TextInput
            style={styles.fieldInput}
            placeholder="Nombre del proyecto..."
            placeholderTextColor="#717171"
            value={projectName}
            onChangeText={setProjectName}
          />
        </View>

        <View style={styles.divider} />

        <View style={styles.searchField}>
          <ThemedText style={styles.fieldLabel}>Ubicación</ThemedText>
          <TextInput
            style={styles.fieldInput}
            placeholder="Ciudad o zona..."
            placeholderTextColor="#717171"
            value={location}
            onChangeText={setLocation}
          />
        </View>

        <Pressable
          style={({ pressed }) => [
            styles.searchButton,
            { opacity: pressed ? 0.9 : 1 },
          ]}
          onPress={handleSearch}
        >
          <Ionicons name="search-outline" size={18} color="#FFFFFF" />
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: "100%",
    alignItems: "center",
    //paddingVertical: Spacing.sm,
    paddingTop: 10,
    paddingHorizontal: Spacing.xl,
  },
  searchBar: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFFFFF",
    borderRadius: BorderRadius.full,
    borderWidth: 1,
    borderColor: "#DDDDDD",
    paddingLeft: Spacing.lg,
    paddingRight: Spacing.xs,
    paddingVertical: Spacing.xs,
    maxWidth: 850,
    width: "100%",
    ...Shadows.card,
  },
  searchField: {
    flex: 1,
    paddingVertical: Spacing.sm,
    paddingHorizontal: Spacing.md,
  },
  fieldLabel: {
    fontSize: 12,
    fontWeight: "600",
    color: "#222222",
    marginBottom: 2,
  },
  fieldInput: {
    fontSize: 14,
    color: "#222222",
    paddingVertical: 0,
  },
  divider: {
    width: 1,
    height: 32,
    backgroundColor: "#DDDDDD",
  },
  searchButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: "#bf0a0a",
    justifyContent: "center",
    alignItems: "center",
    marginLeft: Spacing.sm,
  },
});
