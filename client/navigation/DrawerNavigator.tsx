import React from "react";
import { createDrawerNavigator } from "@react-navigation/drawer";
import MainTabNavigator from "@/navigation/MainTabNavigator";
import DrawerContent from "@/screens/DrawerContent";
import { useTheme } from "@/hooks/useTheme";

export type DrawerParamList = {
  MainTabs: undefined;
};

const Drawer = createDrawerNavigator<DrawerParamList>();

export default function DrawerNavigator() {
  const { theme } = useTheme();

  return (
    <Drawer.Navigator
      drawerContent={(props) => <DrawerContent {...props} />}
      screenOptions={{
        headerShown: false,
        drawerPosition: "right",
        drawerType: "front",
        overlayColor: "rgba(0,0,0,0.5)",
        drawerStyle: {
          width: 280,
          backgroundColor: theme.backgroundRoot,
        },
      }}
    >
      <Drawer.Screen name="MainTabs" component={MainTabNavigator} />
    </Drawer.Navigator>
  );
}
