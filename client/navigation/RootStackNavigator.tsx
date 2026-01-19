import React, { useEffect, useState } from "react";
import { ActivityIndicator, View } from "react-native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";

import DrawerNavigator from "@/navigation/DrawerNavigator";
import OnboardingScreen from "@/screens/OnboardingScreen";
import LoginScreen from "@/screens/LoginScreen";
import AddListingScreen from "@/screens/AddListingScreen";
import { useScreenOptions } from "@/hooks/useScreenOptions";
import { useTheme } from "@/hooks/useTheme";
import { hasCompletedOnboarding, getUserProfile } from "@/lib/storage";
import { Colors } from "@/constants/theme";

export type RootStackParamList = {
  Onboarding: undefined;
  Login: undefined;
  Main: undefined;
  AddListingModal: undefined;
};

const Stack = createNativeStackNavigator<RootStackParamList>();

export default function RootStackNavigator() {
  const screenOptions = useScreenOptions();
  const { theme } = useTheme();
  const [isLoading, setIsLoading] = useState(true);
  const [initialRoute, setInitialRoute] = useState<keyof RootStackParamList>("Onboarding");

  useEffect(() => {
    checkInitialRoute();
  }, []);

  const checkInitialRoute = async () => {
    try {
      const onboardingComplete = await hasCompletedOnboarding();
      const profile = await getUserProfile();

      if (!onboardingComplete) {
        setInitialRoute("Onboarding");
      } else if (profile?.isLoggedIn) {
        setInitialRoute("Main");
      } else {
        setInitialRoute("Login");
      }
    } catch (error) {
      setInitialRoute("Onboarding");
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <View
        style={{
          flex: 1,
          justifyContent: "center",
          alignItems: "center",
          backgroundColor: theme.backgroundRoot,
        }}
      >
        <ActivityIndicator size="large" color={Colors.light.primary} />
      </View>
    );
  }

  return (
    <Stack.Navigator
      initialRouteName={initialRoute}
      screenOptions={screenOptions}
    >
      <Stack.Screen
        name="Onboarding"
        component={OnboardingScreen}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="Login"
        component={LoginScreen}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="Main"
        component={DrawerNavigator}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="AddListingModal"
        component={AddListingScreen}
        options={{
          presentation: "modal",
          headerTitle: "Add Listing",
        }}
      />
    </Stack.Navigator>
  );
}
