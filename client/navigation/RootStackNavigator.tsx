import React, { useEffect, useState } from "react";
import { ActivityIndicator, View, Platform } from "react-native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";

import DrawerNavigator from "@/navigation/DrawerNavigator";
import OnboardingScreen from "@/screens/OnboardingScreen";
import OnboardingScreenWeb from "@/screens/OnboardingScreen.web";
import LoginScreen from "@/screens/LoginScreen";
import LoginScreenWeb from "@/screens/LoginScreen.web";
import LandingScreenWeb from "@/screens/LandingScreen.web";
import CaptureClientScreen from "@/screens/CaptureClientScreen";
import PropertyDetailScreen from "@/screens/PropertyDetailScreen";
import PropertyDetailScreenWeb from "@/screens/PropertyDetailScreen.web";
import BlogScreenWeb from "@/screens/BlogScreen.web";
import { useScreenOptions } from "@/hooks/useScreenOptions";
import { useTheme } from "@/hooks/useTheme";
import { Colors } from "@/constants/theme";
import { useAuth } from "@/contexts/AuthContext";
import { Property } from "@/data/properties";

const isWeb = Platform.OS === "web";
const OnboardingComponent = isWeb ? OnboardingScreenWeb : OnboardingScreen;
const LoginComponent = isWeb ? LoginScreenWeb : LoginScreen;

export type RootStackParamList = {
  Landing: undefined;
  Onboarding: undefined;
  Login: undefined;
  Main: undefined;
  AddListingModal: undefined;
  PropertyDetail: { property: Property };
  Blog: { userId: string; propertyId: string };
};

const Stack = createNativeStackNavigator<RootStackParamList>();

export default function RootStackNavigator() {
  const screenOptions = useScreenOptions();
  const { theme } = useTheme();
  const { isInitializing, user } = useAuth();
  const [isLoading, setIsLoading] = useState(true);
  const [initialRoute, setInitialRoute] = useState<keyof RootStackParamList>(isWeb ? "Landing" : "Onboarding");

  useEffect(() => {
    if (!isInitializing) {
      checkInitialRoute();
    }
  }, [isInitializing, user]);

  const checkInitialRoute = async () => {
    try {
      // Si el usuario ya está autenticado (sesión restaurada), ir a Main
      if (user) {
        setInitialRoute("Main");
        setIsLoading(false);
        return;
      }

      // En web, si no hay usuario, siempre ir a Landing
      if (isWeb) {
        setInitialRoute("Landing");
        setIsLoading(false);
        return;
      }

      // En móviles, mostrar Onboarding
      setInitialRoute("Onboarding");
    } catch (error) {
      setInitialRoute(isWeb ? "Landing" : "Onboarding");
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading || isInitializing) {
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
      {isWeb && (
        <Stack.Screen
          name="Landing"
          component={LandingScreenWeb}
          options={{ headerShown: false }}
        />
      )}
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
      {isWeb ? (
        <Stack.Screen
          name="Blog"
          component={BlogScreenWeb}
          options={{ headerShown: false }}
        />
      ) : null}
    </Stack.Navigator>
  );
}
