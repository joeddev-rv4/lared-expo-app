import React from "react";
import { Pressable, Platform } from "react-native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { DrawerActions, useNavigation } from "@react-navigation/native";
import { Feather } from "@expo/vector-icons";

import ExploreScreen from "@/screens/ExploreScreen";
import { useScreenOptions } from "@/hooks/useScreenOptions";
import { useTheme } from "@/hooks/useTheme";
import { Spacing } from "@/constants/theme";
import { ThemedText } from "@/components/ThemedText";

const isWeb = Platform.OS === "web";

export type ExploreStackParamList = {
  Explore: undefined;
};

const Stack = createNativeStackNavigator<ExploreStackParamList>();

function HeaderLeftGreeting() {
  if (isWeb) return null;
  
  return (
    <ThemedText style={{ fontSize: 20, fontWeight: "700" }}>
      Hola, Ada Lovelace
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
        <Feather name="bell" size={22} color={theme.text} />
      </Pressable>
      <Pressable
        onPress={() => navigation.dispatch(DrawerActions.openDrawer())}
        hitSlop={8}
      >
        <Feather name="menu" size={22} color={theme.text} />
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
