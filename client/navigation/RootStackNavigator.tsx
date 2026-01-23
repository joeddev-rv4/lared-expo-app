import React, { useEffect, useState } from "react";
import { ActivityIndicator, View, Platform } from "react-native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";

import DrawerNavigator from "@/navigation/DrawerNavigator";
import OnboardingScreen from "@/screens/OnboardingScreen";
import OnboardingScreenWeb from "@/screens/OnboardingScreen.web";
import LoginScreen from "@/screens/LoginScreen";
import LoginScreenWeb from "@/screens/LoginScreen.web";
import CaptureClientScreen from "@/screens/CaptureClientScreen";
import PropertyDetailScreen from "@/screens/PropertyDetailScreen";
import PropertyDetailScreenWeb from "@/screens/PropertyDetailScreen.web";
import SharedPropertyScreenWeb from "@/screens/SharedPropertyScreen.web";
import { useScreenOptions } from "@/hooks/useScreenOptions";
import { useTheme } from "@/hooks/useTheme";
import { hasCompletedOnboarding, getUserProfile } from "@/lib/storage";
import { Colors } from "@/constants/theme";
import { Property } from "@/data/properties";

const isWeb = Platform.OS === "web";
const OnboardingComponent = isWeb ? OnboardingScreenWeb : OnboardingScreen;
const LoginComponent = isWeb ? LoginScreenWeb : LoginScreen;

export type RootStackParamList = {
  Onboarding: undefined;
  Login: undefined;
  Main: undefined;
  AddListingModal: undefined;
  PropertyDetail: { property: Property };
  SharedProperty: { propertyId: string; odooId: string; odooContactId: string };
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

      if (!isWeb) {
        setInitialRoute("Onboarding");
      } else if (!onboardingComplete) {
        setInitialRoute("Onboarding");
      } else {
        // Always start at Login - let Firebase auth handle user state
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
        component={OnboardingComponent}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="Login"
        component={LoginComponent}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="Main"
        component={DrawerNavigator}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="AddListingModal"
        component={CaptureClientScreen}
        options={{
          presentation: "modal",
          headerShown: false,
        }}
      />
      <Stack.Screen
        name="PropertyDetail"
        component={isWeb ? PropertyDetailScreenWeb : PropertyDetailScreen}
        options={{ headerShown: false }}
      />
      {isWeb && (
        <Stack.Screen
          name="SharedProperty"
          component={SharedPropertyScreenWeb}
          options={{ headerShown: false }}
        />
      )}
    </Stack.Navigator>
  );
}
