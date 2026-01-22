import React from "react";
import { Platform } from "react-native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";

import FavoritesScreen from "@/screens/FavoritesScreen";
import PropertyDetailScreen from "@/screens/PropertyDetailScreen";
import PropertyDetailScreenWeb from "@/screens/PropertyDetailScreen.web";
import { useScreenOptions } from "@/hooks/useScreenOptions";
import { Property } from "@/data/properties";

const isWeb = Platform.OS === "web";

export type FavoritesStackParamList = {
  FavoritesList: undefined;
  FavoritesPropertyDetail: { property: Property; sourceTab?: string };
};

const Stack = createNativeStackNavigator<FavoritesStackParamList>();

export default function FavoritesStackNavigator() {
  const screenOptions = useScreenOptions();

  return (
    <Stack.Navigator screenOptions={screenOptions}>
      <Stack.Screen
        name="FavoritesList"
        component={FavoritesScreen}
        options={{
          headerTitle: "Favoritos",
        }}
      />
      <Stack.Screen
        name="FavoritesPropertyDetail"
        component={isWeb ? PropertyDetailScreenWeb : PropertyDetailScreen}
        options={{
          headerShown: false,
        }}
      />
    </Stack.Navigator>
  );
}
