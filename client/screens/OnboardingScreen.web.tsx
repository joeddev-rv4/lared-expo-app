import React, { useState, useEffect, useRef } from "react";
import {
  View,
  StyleSheet,
  Image,
  Pressable,
  Animated,
  ImageBackground,
} from "react-native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { useNavigation } from "@react-navigation/native";

import { ThemedText } from "@/components/ThemedText";
import { setOnboardingComplete } from "@/lib/storage";
import { Colors, Spacing, BorderRadius } from "@/constants/theme";
import { RootStackParamList } from "@/navigation/RootStackNavigator";

const SLIDES = [
  {
    id: "1",
    image: require("../../assets/images/login_message_1.png"),
    title: "Refiere propiedades y gana",
  },
  {
    id: "2",
    image: require("../../assets/images/login_message_2.png"),
    title: "Tu conectas, nosotros vendemos",
  },
];

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

export default function OnboardingScreenWeb() {
  const navigation = useNavigation<NavigationProp>();
  const [currentPage, setCurrentPage] = useState(0);
  const fadeAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    const interval = setInterval(() => {
      Animated.timing(fadeAnim, {
        toValue: 0,
        duration: 300,
        useNativeDriver: false,
      }).start(() => {
        setCurrentPage((prev) => (prev + 1) % SLIDES.length);
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 300,
          useNativeDriver: false,
        }).start();
      });
    }, 4000);
    return () => clearInterval(interval);
  }, [fadeAnim]);

  const handleGetStarted = async () => {
    await setOnboardingComplete();
    navigation.replace("Login");
  };

  const currentSlide = SLIDES[currentPage];

  return (
    <ImageBackground
      source={require("../../assets/images/login_image_1.png")}
      style={styles.container}
      resizeMode="cover"
    >
      <View style={styles.overlay}>
        <View style={styles.content}>
          <View style={styles.carouselContainer}>
            <Animated.View style={[styles.slide, { opacity: fadeAnim }]}>
              <Image
                source={currentSlide.image}
                style={styles.slideImage}
                resizeMode="contain"
              />
              <ThemedText style={styles.slideTitle}>{currentSlide.title}</ThemedText>
            </Animated.View>

            <View style={styles.pagination}>
              {SLIDES.map((_, index) => (
                <Pressable
                  key={index}
                  onPress={() => setCurrentPage(index)}
                  style={[
                    styles.dot,
                    {
                      backgroundColor:
                        index === currentPage ? "#FFFFFF" : "rgba(255, 255, 255, 0.5)",
                      width: index === currentPage ? 24 : 8,
                    },
                  ]}
                />
              ))}
            </View>
          </View>

          <View style={styles.authContainer}>
            <Image
              source={require("../../assets/images/icon.png")}
              style={styles.logo}
              resizeMode="contain"
            />
            <ThemedText style={styles.welcomeTitle}>
              Bienvenido a La Red Inmobiliaria
            </ThemedText>
            <ThemedText style={styles.welcomeSubtitle}>
              Hecha por vendedores, para vendedores
            </ThemedText>

            <Pressable
              onPress={handleGetStarted}
              style={({ pressed }) => [
                styles.getStartedButton,
                { opacity: pressed ? 0.9 : 1, backgroundColor: Colors.light.primary },
              ]}
            >
              <ThemedText style={styles.getStartedText}>Comenzar</ThemedText>
            </Pressable>
          </View>
        </View>
      </View>
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    width: "100%",
    height: "100%",
  },
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.4)",
    justifyContent: "center",
    alignItems: "center",
  },
  content: {
    flexDirection: "row",
    width: "100%",
    maxWidth: 1200,
    alignItems: "center",
    justifyContent: "center",
    padding: Spacing["2xl"],
  },
  carouselContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    maxWidth: 600,
  },
  slide: {
    alignItems: "center",
    justifyContent: "center",
    width: "100%",
  },
  slideImage: {
    width: 400,
    height: 300,
  },
  slideTitle: {
    fontSize: 26,
    fontWeight: "700",
    textAlign: "center",
    color: "#FFFFFF",
    marginTop: Spacing.lg,
    marginBottom: Spacing.lg,
  },
  pagination: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    gap: Spacing.sm,
  },
  dot: {
    height: 8,
    borderRadius: 4,
  },
  authContainer: {
    flex: 1,
    alignItems: "center",
    maxWidth: 400,
    paddingHorizontal: Spacing["2xl"],
  },
  logo: {
    width: 100,
    height: 100,
    marginBottom: Spacing.xl,
  },
  welcomeTitle: {
    fontSize: 28,
    fontWeight: "700",
    textAlign: "center",
    marginBottom: Spacing.sm,
    color: "#FFFFFF",
  },
  welcomeSubtitle: {
    fontSize: 16,
    textAlign: "center",
    marginBottom: Spacing["3xl"],
    color: "rgba(255, 255, 255, 0.8)",
  },
  getStartedButton: {
    width: "100%",
    paddingVertical: Spacing.lg,
    borderRadius: BorderRadius.sm,
    alignItems: "center",
  },
  getStartedText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#FFFFFF",
  },
});
