import React from "react";
import { View, StyleSheet, Pressable, Platform, Text } from "react-native";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { BlurView } from "expo-blur";
import * as Haptics from "expo-haptics";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import ExploreStackNavigator from "@/navigation/ExploreStackNavigator";
import FavoritesStackNavigator from "@/navigation/FavoritesStackNavigator";
import ProfileStackNavigator from "@/navigation/ProfileStackNavigator";
import AchievementsStackNavigator from "@/navigation/AchievementsStackNavigator";
import AddListingScreen from "@/screens/AddListingScreen";
import { WebNavbar } from "@/components/WebNavbar";
import { useTheme } from "@/hooks/useTheme";
import { Colors, Spacing, Shadows } from "@/constants/theme";

const isWeb = Platform.OS === "web";

export type MainTabParamList = {
  ExploreTab: undefined;
  FavoritesTab: undefined;
  AddListingTab: undefined;
  ProfileTab: undefined;
  AchievementsTab: undefined;
};

const Tab = createBottomTabNavigator<MainTabParamList>();

interface TabIconProps {
  symbol: string;
  color: string;
  size: number;
}

function TabIcon({ symbol, color, size }: TabIconProps) {
  return (
    <Text style={{ fontSize: size - 4, color, fontWeight: '400' }}>
      {symbol}
    </Text>
  );
}

function AddListingButton({ onPress }: { onPress: () => void }) {
  const handlePress = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    onPress();
  };

  return (
    <Pressable
      onPress={handlePress}
      style={[styles.fabContainer, Shadows.fab]}
      testID="add-listing-button"
    >
      <View style={styles.fab}>
        <Text style={styles.fabIcon}>+</Text>
      </View>
    </Pressable>
  );
}

export default function MainTabNavigator() {
  const { theme, isDark } = useTheme();
  const insets = useSafeAreaInsets();
  
  const androidBottomPadding = Platform.OS === 'android' ? Math.max(insets.bottom, 16) : 0;
  const tabBarHeight = Platform.OS === "ios" ? 88 : 64 + androidBottomPadding;

  return (
    <View style={styles.webContainer}>
      {isWeb && <WebNavbar />}
      <Tab.Navigator
        initialRouteName="ExploreTab"
        screenOptions={{
          tabBarActiveTintColor: "#bf0a0a",
          tabBarInactiveTintColor: theme.tabIconDefault,
          tabBarStyle: isWeb
            ? { display: "none" }
            : {
                position: "absolute",
                backgroundColor: Platform.select({
                  ios: "transparent",
                  android: theme.backgroundRoot,
                  web: theme.backgroundRoot,
                }),
                borderTopWidth: 0,
                elevation: 0,
                height: tabBarHeight,
                paddingTop: 8,
                paddingBottom: androidBottomPadding,
              },
          tabBarBackground: () =>
            Platform.OS === "ios" ? (
              <BlurView
                intensity={100}
                tint={isDark ? "dark" : "light"}
                style={StyleSheet.absoluteFill}
              />
            ) : null,
          headerShown: false,
          tabBarLabelStyle: {
            fontSize: 11,
            fontWeight: "500",
          },
        }}
      >
      <Tab.Screen
        name="ExploreTab"
        component={ExploreStackNavigator}
        options={{
          title: "Explorar",
          tabBarIcon: ({ color, size }) => (
            <TabIcon symbol="🔍" color={color} size={size} />
          ),
        }}
      />
      <Tab.Screen
        name="FavoritesTab"
        component={FavoritesStackNavigator}
        options={{
          title: "Favoritos",
          tabBarIcon: ({ color, size }) => (
            <TabIcon symbol="♡" color={color} size={size} />
          ),
        }}
      />
      {Platform.OS !== "web" && (
        <Tab.Screen
          name="AddListingTab"
          component={AddListingScreen}
          options={({ navigation }) => ({
            title: "",
            tabBarIcon: () => null,
            tabBarButton: () => (
              <AddListingButton
                onPress={() => navigation.navigate("AddListingModal")}
              />
            ),
          })}
          listeners={({ navigation }) => ({
            tabPress: (e) => {
              e.preventDefault();
              navigation.navigate("AddListingModal");
            },
          })}
        />
      )}
      <Tab.Screen
        name="ProfileTab"
        component={ProfileStackNavigator}
        options={{
          title: "Mi Perfil",
          tabBarIcon: ({ color, size }) => (
            <TabIcon symbol="👤" color={color} size={size} />
          ),
        }}
      />
      <Tab.Screen
        name="AchievementsTab"
        component={AchievementsStackNavigator}
        options={{
          title: "Mis Logros",
          tabBarIcon: ({ color, size }) => (
            <TabIcon symbol="🏆" color={color} size={size} />
          ),
        }}
      />
    </Tab.Navigator>
    </View>
  );
}

const styles = StyleSheet.create({
  webContainer: {
    flex: 1,
  },
  fabContainer: {
    position: "relative",
    top: -16,
    alignItems: "center",
    justifyContent: "center",
  },
  fab: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: "#bf0a0a",
    alignItems: "center",
    justifyContent: "center",
  },
  fabIcon: {
    fontSize: 32,
    color: "#FFFFFF",
    fontWeight: "300",
    lineHeight: 36,
  },
});
