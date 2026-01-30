import React from "react";
import { createNativeStackNavigator } from "@react-navigation/native-stack";

import { Platform } from "react-native";
import AchievementsScreen from "@/screens/AchievementsScreen";
import AchievementsScreenWeb from "@/screens/AchievementsScreen.web";
import { useScreenOptions } from "@/hooks/useScreenOptions";

const isWeb = Platform.OS === "web";

export type AchievementsStackParamList = {
  Achievements: undefined;
};

const Stack = createNativeStackNavigator<AchievementsStackParamList>();

export default function AchievementsStackNavigator() {
  const screenOptions = useScreenOptions();

  return (
    <Stack.Navigator screenOptions={screenOptions}>
      <Stack.Screen
        name="Achievements"
        component={isWeb ? AchievementsScreenWeb : AchievementsScreen}
        options={{
          headerTitle: "Mis Logros",
          headerShown: !isWeb,
        }}
      />
    </Stack.Navigator>
  );
}
