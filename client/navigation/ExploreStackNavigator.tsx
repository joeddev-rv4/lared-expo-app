import React, { useState, useEffect } from "react";
import { Pressable } from "react-native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { DrawerActions, useNavigation } from "@react-navigation/native";
import { Feather } from "@expo/vector-icons";

import ExploreScreen from "@/screens/ExploreScreen";
import { useScreenOptions } from "@/hooks/useScreenOptions";
import { useTheme } from "@/hooks/useTheme";
import { Spacing } from "@/constants/theme";
import { ThemedText } from "@/components/ThemedText";
import { getUserProfile } from "@/lib/storage";

export type ExploreStackParamList = {
  Explore: undefined;
};

const Stack = createNativeStackNavigator<ExploreStackParamList>();

function HeaderLeftGreeting() {
  const [userName, setUserName] = useState<string>("Usuario");

  useEffect(() => {
    const loadUserName = async () => {
      const profile = await getUserProfile();
      if (profile?.name) {
        setUserName(profile.name);
      }
    };
    loadUserName();
  }, []);

  return (
    <ThemedText style={{ fontSize: 20, fontWeight: "700" }}>
      Hola, {userName}
    </ThemedText>
  );
}

function HeaderRightButtons() {
  const navigation = useNavigation();
  const { theme } = useTheme();

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
          headerTitle: "",
          headerLeft: () => <HeaderLeftGreeting />,
          headerRight: () => <HeaderRightButtons />,
        }}
      />
    </Stack.Navigator>
  );
}
