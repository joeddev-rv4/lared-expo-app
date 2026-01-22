import React from "react";
import { Pressable, Platform } from "react-native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { DrawerActions, useNavigation } from "@react-navigation/native";
import { Ionicons } from "@expo/vector-icons";

import ExploreScreen from "@/screens/ExploreScreen";
import { useScreenOptions } from "@/hooks/useScreenOptions";
import { useTheme } from "@/hooks/useTheme";
import { useAuth } from "@/contexts/AuthContext";
import { Spacing } from "@/constants/theme";
import { ThemedText } from "@/components/ThemedText";

const isWeb = Platform.OS === "web";

export type ExploreStackParamList = {
  Explore: undefined;
};

const Stack = createNativeStackNavigator<ExploreStackParamList>();

function HeaderLeftGreeting() {
  const { user } = useAuth();
  
  if (isWeb) return null;
  
  const firstName = user?.name?.split(' ')[0] || 'Usuario';
  
  return (
    <ThemedText style={{ fontSize: 20, fontWeight: "700" }}>
      Hola, {firstName}
    </ThemedText>
  );
}

function HeaderRightButtons() {
  const navigation = useNavigation();
  const { theme } = useTheme();

  if (isWeb) return null;

  return (
    <>
      <Pressable
        onPress={() => {}}
        hitSlop={8}
        style={{ marginRight: Spacing.lg }}
      >
        <Ionicons name="notifications-outline" size={22} color={theme.text} />
      </Pressable>
      <Pressable
        onPress={() => navigation.dispatch(DrawerActions.openDrawer())}
        hitSlop={8}
      >
        <Ionicons name="menu" size={22} color={theme.text} />
      </Pressable>
    </>
  );
}

export default function ExploreStackNavigator() {
  const screenOptions = useScreenOptions();

  return (
    <Stack.Navigator screenOptions={screenOptions}>
      <Stack.Screen
        name="Explore"
        component={ExploreScreen}
        options={{
          headerShown: !isWeb,
          headerTitle: "",
          headerLeft: () => <HeaderLeftGreeting />,
          headerRight: () => <HeaderRightButtons />,
        }}
      />
    </Stack.Navigator>
  );
}
