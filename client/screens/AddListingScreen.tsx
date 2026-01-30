import React, { useState } from "react";
import {
  View,
  StyleSheet,
  TextInput,
  ScrollView,
  Pressable,
  Alert,
  Platform,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useHeaderHeight } from "@react-navigation/elements";
import { useNavigation } from "@react-navigation/native";
import { Ionicons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";

import { ThemedText } from "@/components/ThemedText";
import { Button } from "@/components/Button";
import { FilterChip } from "@/components/FilterChip";
import { useTheme } from "@/hooks/useTheme";
import { addUserListing } from "@/lib/storage";
import { PROPERTY_TYPES } from "@/data/properties";
import { Spacing, BorderRadius, Colors } from "@/constants/theme";

export default function AddListingScreen() {
  const navigation = useNavigation();
  const insets = useSafeAreaInsets();
  const headerHeight = useHeaderHeight();
  const { theme } = useTheme();

  const [title, setTitle] = useState("");
  const [location, setLocation] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [price, setPrice] = useState("");
  const [description, setDescription] = useState("");
  const [propertyType, setPropertyType] = useState("");
  const [bedrooms, setBedrooms] = useState("1");
  const [bathrooms, setBathrooms] = useState("1");
  const [guests, setGuests] = useState("2");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async () => {
    if (!title || !location || !price || !propertyType) {
      if (Platform.OS === "web") {
        alert("Please fill in all required fields");
      }
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      return;
    }

    setIsSubmitting(true);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

    try {
      await addUserListing({
        title,
        location,
        price: parseFloat(price),
        description,
        propertyType,
        bedrooms: parseInt(bedrooms) || 1,
        bathrooms: parseInt(bathrooms) || 1,
        guests: parseInt(guests) || 2,
        imageUrl:
          imageUrl ||
          "https://images.unsplash.com/photo-1564013799919-ab600027ffc6?w=800",
      });

      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      navigation.goBack();
    } catch (error) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const propertyTypes = PROPERTY_TYPES.filter((t) => t !== "All");

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: theme.backgroundRoot }]}
      contentContainerStyle={[
        styles.content,
        {
          paddingTop: headerHeight + Spacing.xl,
          paddingBottom: insets.bottom + Spacing.xl,
        },
      ]}
      keyboardShouldPersistTaps="handled"
    >
      <View style={styles.section}>
        <ThemedText style={styles.sectionTitle}>Property Details</ThemedText>

        <View style={styles.inputContainer}>
          <ThemedText style={[styles.label, { color: theme.textSecondary }]}>
            Title *
          </ThemedText>
          <TextInput
            style={[
              styles.input,
              {
                backgroundColor: theme.backgroundDefault,
                color: theme.text,
                borderColor: theme.border,
              },
            ]}
            value={title}
            onChangeText={setTitle}
            placeholder="Beautiful Beach House..."
            placeholderTextColor={theme.textSecondary}
            testID="title-input"
          />
        </View>

        <View style={styles.inputContainer}>
          <ThemedText style={[styles.label, { color: theme.textSecondary }]}>
            Location *
          </ThemedText>
          <TextInput
            style={[
              styles.input,
              {
                backgroundColor: theme.backgroundDefault,
                color: theme.text,
                borderColor: theme.border,
              },
            ]}
            value={location}
            onChangeText={setLocation}
            placeholder="Malibu, California"
            placeholderTextColor={theme.textSecondary}
            testID="location-input"
          />
        </View>

        <View style={styles.inputContainer}>
          <ThemedText style={[styles.label, { color: theme.textSecondary }]}>
            Image URL
          </ThemedText>
          <TextInput
            style={[
              styles.input,
              {
                backgroundColor: theme.backgroundDefault,
                color: theme.text,
                borderColor: theme.border,
              },
            ]}
            value={imageUrl}
            onChangeText={setImageUrl}
            placeholder="https://example.com/image.jpg"
            placeholderTextColor={theme.textSecondary}
            testID="image-url-input"
          />
        </View>

        <View style={styles.inputContainer}>
          <ThemedText style={[styles.label, { color: theme.textSecondary }]}>
            Price per night ($) *
          </ThemedText>
          <TextInput
            style={[
              styles.input,
              {
                backgroundColor: theme.backgroundDefault,
                color: theme.text,
                borderColor: theme.border,
              },
            ]}
            value={price}
            onChangeText={setPrice}
            placeholder="250"
            placeholderTextColor={theme.textSecondary}
            keyboardType="numeric"
            testID="price-input"
          />
        </View>

        <View style={styles.inputContainer}>
          <ThemedText style={[styles.label, { color: theme.textSecondary }]}>
            Property Type *
          </ThemedText>
          <View style={styles.chipContainer}>
            {propertyTypes.map((type) => (
              <FilterChip
                key={type}
                label={type}
                isSelected={propertyType === type}
                onPress={() => setPropertyType(type)}
              />
            ))}
          </View>
        </View>
      </View>

      <View style={styles.section}>
        <ThemedText style={styles.sectionTitle}>Capacity</ThemedText>

        <View style={styles.row}>
          <View style={styles.counterContainer}>
            <ThemedText style={[styles.label, { color: theme.textSecondary }]}>
              Bedrooms
            </ThemedText>
            <View style={styles.counter}>
              <Pressable
                onPress={() =>
                  setBedrooms(String(Math.max(1, parseInt(bedrooms) - 1)))
                }
                style={[styles.counterButton, { borderColor: theme.border }]}
              >
                <Ionicons name="remove" size={18} color={theme.text} />
              </Pressable>
              <ThemedText style={styles.counterValue}>{bedrooms}</ThemedText>
              <Pressable
                onPress={() => setBedrooms(String(parseInt(bedrooms) + 1))}
                style={[styles.counterButton, { borderColor: theme.border }]}
              >
                <Ionicons name="add" size={18} color={theme.text} />
              </Pressable>
            </View>
          </View>

          <View style={styles.counterContainer}>
            <ThemedText style={[styles.label, { color: theme.textSecondary }]}>
              Bathrooms
            </ThemedText>
            <View style={styles.counter}>
              <Pressable
                onPress={() =>
                  setBathrooms(String(Math.max(1, parseInt(bathrooms) - 1)))
                }
                style={[styles.counterButton, { borderColor: theme.border }]}
              >
                <Ionicons name="remove" size={18} color={theme.text} />
              </Pressable>
              <ThemedText style={styles.counterValue}>{bathrooms}</ThemedText>
              <Pressable
                onPress={() => setBathrooms(String(parseInt(bathrooms) + 1))}
                style={[styles.counterButton, { borderColor: theme.border }]}
              >
                <Ionicons name="add" size={18} color={theme.text} />
              </Pressable>
            </View>
          </View>

          <View style={styles.counterContainer}>
            <ThemedText style={[styles.label, { color: theme.textSecondary }]}>
              Guests
            </ThemedText>
            <View style={styles.counter}>
              <Pressable
                onPress={() =>
                  setGuests(String(Math.max(1, parseInt(guests) - 1)))
                }
                style={[styles.counterButton, { borderColor: theme.border }]}
              >
                <Ionicons name="remove" size={18} color={theme.text} />
              </Pressable>
              <ThemedText style={styles.counterValue}>{guests}</ThemedText>
              <Pressable
                onPress={() => setGuests(String(parseInt(guests) + 1))}
                style={[styles.counterButton, { borderColor: theme.border }]}
              >
                <Ionicons name="add" size={18} color={theme.text} />
              </Pressable>
            </View>
          </View>
        </View>
      </View>

      <View style={styles.section}>
        <ThemedText style={styles.sectionTitle}>Description</ThemedText>

        <TextInput
          style={[
            styles.input,
            styles.textArea,
            {
              backgroundColor: theme.backgroundDefault,
              color: theme.text,
              borderColor: theme.border,
            },
          ]}
          value={description}
          onChangeText={setDescription}
          placeholder="Describe your property..."
          placeholderTextColor={theme.textSecondary}
          multiline
          numberOfLines={4}
          textAlignVertical="top"
          testID="description-input"
        />
      </View>

      <Button
        onPress={handleSubmit}
        disabled={isSubmitting}
        style={styles.submitButton}
      >
        {isSubmitting ? "Creating..." : "Create Listing"}
      </Button>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    paddingHorizontal: Spacing.lg,
  },
  section: {
    marginBottom: Spacing["2xl"],
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: "600",
    marginBottom: Spacing.lg,
  },
  inputContainer: {
    marginBottom: Spacing.lg,
  },
  label: {
    fontSize: 14,
    marginBottom: Spacing.sm,
  },
  input: {
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
    borderRadius: BorderRadius.sm,
    borderWidth: 1,
    fontSize: 16,
  },
  textArea: {
    minHeight: 120,
    paddingTop: Spacing.md,
  },
  chipContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: Spacing.sm,
  },
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  counterContainer: {
    alignItems: "center",
  },
  counter: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.md,
  },
  counterButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  counterValue: {
    fontSize: 18,
    fontWeight: "600",
    minWidth: 24,
    textAlign: "center",
  },
  submitButton: {
    marginTop: Spacing.lg,
  },
});
