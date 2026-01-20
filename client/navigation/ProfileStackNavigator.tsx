import React from "react";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { View, StyleSheet, Pressable, Image, Dimensions } from "react-native";

import ProfileScreen from "@/screens/ProfileScreen";
import { useScreenOptions } from "@/hooks/useScreenOptions";
import { ThemedText } from "@/components/ThemedText";
import { Spacing, BorderRadius, Colors } from "@/constants/theme";
import { Feather } from "@expo/vector-icons";

export type ProfileStackParamList = {
  Profile: undefined;
};

const Stack = createNativeStackNavigator<ProfileStackParamList>();

const { width: screenWidth } = Dimensions.get('window');
const imageWidth = screenWidth * 0.6;
const imageHeight = imageWidth / 6;

const SaleTag = () => (
  <View style={styles.saleTagContainer}>
    <Image
      source={require('../../assets/images/la_red_blanco_negro.png')}
      style={[styles.saleTagImage, { width: imageWidth, height: imageHeight }]}
    />
    <ThemedText style={styles.saleTagText}>¡Hazme Aliado!</ThemedText>
  </View>
);

export default function ProfileStackNavigator() {
  const screenOptions = useScreenOptions();

  return (
    <Stack.Navigator screenOptions={screenOptions}>
      <Stack.Screen
        name="Profile"
        component={ProfileScreen}
        options={{
          headerTitle: "",
          headerStyle: { backgroundColor: Colors.light.primary },
          headerTintColor: '#FFFFFF',
          headerLeft: () => <SaleTag />,
          headerRight: () => (
            <View style={{ flexDirection: 'row', marginRight: 16 }}>
              <Pressable style={{ marginRight: 16 }}>
                <Feather name="bell" size={24} color="#FFFFFF" />
              </Pressable>
              <Pressable>
                <Feather name="menu" size={24} color="#FFFFFF" />
              </Pressable>
            </View>
          ),
        }}
      />
    </Stack.Navigator>
  );
}

const styles = StyleSheet.create({
  saleTag: {
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  saleTagText: {
    color: "#FFFFFF",
    fontSize: 10,
    fontWeight: "700",
    textAlign: "center",
    letterSpacing: 0,
    textAlignVertical: 'center',
    lineHeight: 12,
  },
  saleTagImage: {
    resizeMode: 'contain',
  },
  saleTagContainer: {
    position: "relative",
    marginLeft: -45,
    flexDirection: 'column',
    alignItems: 'center',
  },
});
