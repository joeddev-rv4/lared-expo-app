import React from "react";
import { createNativeStackNavigator } from "@react-navigation/native-stack";

import ProfileScreen from "@/screens/ProfileScreen";
import ClientListScreen from "@/screens/ClientListScreen";
import { useScreenOptions } from "@/hooks/useScreenOptions";
import { Colors } from "@/constants/theme";

export type ProfileStackParamList = {
  Profile: undefined;
  ClientList: { property: any };
};

const Stack = createNativeStackNavigator<ProfileStackParamList>();

export default function ProfileStackNavigator() {
  const screenOptions = useScreenOptions();

  return (
    <Stack.Navigator screenOptions={screenOptions}>
      <Stack.Screen
        name="Profile"
        component={ProfileScreen}
        options={{
          headerShown: !isWeb,
          headerTitle: "",
          headerStyle: { backgroundColor: Colors.light.primary },
          headerTintColor: '#FFFFFF',
          headerShown: false,
        }}
      />
      <Stack.Screen
        name="ClientList"
        component={ClientListScreen}
        options={{
          headerTitle: "Clientes Interesados",
          headerStyle: { backgroundColor: Colors.light.primary },
          headerTintColor: '#FFFFFF',
          headerShown: false, // Ya que tiene su propio header
          presentation: 'modal',
        }}
      />
    </Stack.Navigator>
  );
}
