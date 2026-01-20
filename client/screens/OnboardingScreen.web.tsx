import React, { useState, useEffect, useRef } from "react";
import {
  View,
  StyleSheet,
  Image,
  Pressable,
  Animated,
} from "react-native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { useNavigation } from "@react-navigation/native";

import { ThemedText } from "@/components/ThemedText";
import { ThemedView } from "@/components/ThemedView";
import { useTheme } from "@/hooks/useTheme";
import { setOnboardingComplete } from "@/lib/storage";
import { Colors, Spacing, BorderRadius } from "@/constants/theme";
import { RootStackParamList } from "@/navigation/RootStackNavigator";

const SLIDES = [
  {
    id: "1",
    image: require("../../assets/images/onboarding/slide1.png"),
    title: "Descubre Propiedades Increíbles",
    description:
      "Explora miles de casas, apartamentos y propiedades únicas en todo el país.",
  },
  {
    id: "2",
    image: require("../../assets/images/onboarding/slide2.png"),
    title: "Conecta con Clientes",
    description:
      "Comparte propiedades con tus contactos y gana comisiones por cada venta exitosa.",
  },
  {
    id: "3",
    image: require("../../assets/images/onboarding/slide3.png"),
    title: "Gana con Cada Venta",
    description:
      "Recibe comisiones atractivas por cada propiedad que ayudes a vender.",
  },
];

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

export default function OnboardingScreenWeb() {
  const navigation = useNavigation<NavigationProp>();
  const { theme } = useTheme();
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
    <ThemedView style={styles.container}>
      <View style={styles.splitContainer}>
        <View style={[styles.leftPanel, { backgroundColor: Colors.light.primary + "08" }]}>
          <View style={styles.carouselContainer}>
            <Animated.View style={[styles.slide, { opacity: fadeAnim }]}>
              <Image
                source={currentSlide.image}
                style={styles.slideImage}
                resizeMode="contain"
              />
              <ThemedText style={styles.slideTitle}>{currentSlide.title}</ThemedText>
              <ThemedText style={[styles.slideDescription, { color: theme.textSecondary }]}>
                {currentSlide.description}
              </ThemedText>
            </Animated.View>
          </View>

          <View style={styles.pagination}>
            {SLIDES.map((_, index) => (
              <Pressable
                key={index}
                onPress={() => setCurrentPage(index)}
                style={[
                  styles.dot,
                  {
                    backgroundColor:
                      index === currentPage ? Colors.light.primary : theme.border,
                    width: index === currentPage ? 24 : 8,
                  },
                ]}
              />
            ))}
          </View>
        </View>

        <View style={styles.rightPanel}>
          <View style={styles.authContainer}>
            <Image
              source={require("../../assets/images/icon.png")}
              style={styles.logo}
              resizeMode="contain"
            />
            <ThemedText style={styles.welcomeTitle}>
              Bienvenido a La Red Inmobiliaria
            </ThemedText>
            <ThemedText style={[styles.welcomeSubtitle, { color: theme.textSecondary }]}>
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
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  splitContainer: {
    flex: 1,
    flexDirection: "row",
  },
  leftPanel: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: Spacing["2xl"],
    overflow: "hidden",
  },
  carouselContainer: {
    width: "100%",
    maxWidth: 500,
    alignItems: "center",
    justifyContent: "center",
  },
  slide: {
    alignItems: "center",
    justifyContent: "center",
    width: "100%",
  },
  slideImage: {
    width: 280,
    height: 220,
    marginBottom: Spacing["2xl"],
  },
  slideTitle: {
    fontSize: 26,
    fontWeight: "700",
    textAlign: "center",
    marginBottom: Spacing.md,
  },
  slideDescription: {
    fontSize: 16,
    textAlign: "center",
    lineHeight: 24,
    maxWidth: 380,
    paddingHorizontal: Spacing.lg,
  },
  pagination: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    marginTop: Spacing["2xl"],
    gap: Spacing.sm,
  },
  dot: {
    height: 8,
    borderRadius: 4,
  },
  rightPanel: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: Spacing["2xl"],
  },
  authContainer: {
    alignItems: "center",
    maxWidth: 400,
    width: "100%",
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
  },
  welcomeSubtitle: {
    fontSize: 16,
    textAlign: "center",
    marginBottom: Spacing["3xl"],
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
