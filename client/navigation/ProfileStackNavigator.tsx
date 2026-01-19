import React from "react";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { View, StyleSheet, Pressable } from "react-native";

import ProfileScreen from "@/screens/ProfileScreen";
import { useScreenOptions } from "@/hooks/useScreenOptions";
import { ThemedText } from "@/components/ThemedText";
import { Spacing, BorderRadius, Colors } from "@/constants/theme";
import { Feather } from "@expo/vector-icons";

export type ProfileStackParamList = {
  Profile: undefined;
};

const Stack = createNativeStackNavigator<ProfileStackParamList>();

const SaleTag = () => (
  <View style={styles.saleTagContainer}>
    <View style={styles.saleTag}>
      <ThemedText style={styles.saleTagText}>Convertirme{'\n'}en Vendedor</ThemedText>
    </View>
  </View>
);

export default function ProfileStackNavigator() {
  const screenOptions = useScreenOptions();

  return (
    <Stack.Navigator screenOptions={screenOptions}>
      <Stack.Screen
        name="Profile"
        component={ProfileScreen}
        options={{
          headerTitle: "",
          headerLeft: () => <SaleTag />,
          headerRight: () => (
            <View style={{ flexDirection: 'row', marginRight: 16 }}>
              <Pressable style={{ marginRight: 16 }}>
                <Feather name="bell" size={24} color="#000" />
              </Pressable>
              <Pressable>
                <Feather name="menu" size={24} color="#000" />
              </Pressable>
            </View>
          ),
        }}
      />
    </Stack.Navigator>
  );
}

const styles = StyleSheet.create({
  saleTag: {
    backgroundColor: Colors.light.primary,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  saleTagText: {
    color: "#FFFFFF",
    fontSize: 10,
    fontWeight: "700",
    textAlign: "center",
    letterSpacing: 0,
    textAlignVertical: 'center',
    lineHeight: 12,
  },
  saleTagContainer: {
    position: "relative",
    marginLeft: Spacing.md,
  },
});
