import React from "react";
import { Pressable } from "react-native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { DrawerActions, useNavigation } from "@react-navigation/native";
import { Feather } from "@expo/vector-icons";

import ExploreScreen from "@/screens/ExploreScreen";
import { HeaderTitle } from "@/components/HeaderTitle";
import { useScreenOptions } from "@/hooks/useScreenOptions";
import { useTheme } from "@/hooks/useTheme";
import { Spacing } from "@/constants/theme";

export type ExploreStackParamList = {
  Explore: undefined;
};

const Stack = createNativeStackNavigator<ExploreStackParamList>();

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
          headerTitle: () => <HeaderTitle title="PropertyHub" />,
          headerRight: () => <HeaderRightButtons />,
        }}
      />
    </Stack.Navigator>
  );
}
