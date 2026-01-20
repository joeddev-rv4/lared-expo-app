import React, { useRef, useState, useEffect } from "react";
import {
  View,
  StyleSheet,
  Image,
  Pressable,
  ScrollView,
  NativeScrollEvent,
  NativeSyntheticEvent,
  useWindowDimensions,
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
    title: "Discover Amazing Properties",
    description:
      "Browse thousands of unique homes, apartments, and vacation rentals around the world.",
  },
  {
    id: "2",
    image: require("../../assets/images/onboarding/slide2.png"),
    title: "Connect with Hosts",
    description:
      "Chat directly with property owners and get personalized recommendations for your stay.",
  },
  {
    id: "3",
    image: require("../../assets/images/onboarding/slide3.png"),
    title: "Book Your Perfect Stay",
    description:
      "Secure your dream property with our simple and safe booking process.",
  },
];

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

export default function OnboardingScreenWeb() {
  const navigation = useNavigation<NavigationProp>();
  const { theme } = useTheme();
  const { width } = useWindowDimensions();
  const scrollRef = useRef<ScrollView>(null);
  const [currentPage, setCurrentPage] = useState(0);

  const slideWidth = width / 2 - Spacing.xl * 2;

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentPage((prev) => (prev + 1) % SLIDES.length);
    }, 4000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    scrollRef.current?.scrollTo({
      x: currentPage * slideWidth,
      animated: true,
    });
  }, [currentPage, slideWidth]);

  const handleGetStarted = async () => {
    await setOnboardingComplete();
    navigation.replace("Login");
  };

  return (
    <ThemedView style={styles.container}>
      <View style={styles.splitContainer}>
        <View style={[styles.leftPanel, { backgroundColor: Colors.light.primary + "08" }]}>
          <ScrollView
            ref={scrollRef}
            horizontal
            pagingEnabled
            showsHorizontalScrollIndicator={false}
            scrollEnabled={false}
            style={styles.carouselContainer}
          >
            {SLIDES.map((slide) => (
              <View key={slide.id} style={[styles.slide, { width: slideWidth }]}>
                <Image
                  source={slide.image}
                  style={styles.slideImage}
                  resizeMode="contain"
                />
                <ThemedText style={styles.slideTitle}>{slide.title}</ThemedText>
                <ThemedText style={[styles.slideDescription, { color: theme.textSecondary }]}>
                  {slide.description}
                </ThemedText>
              </View>
            ))}
          </ScrollView>

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
    padding: Spacing.xl,
  },
  carouselContainer: {
    maxHeight: 500,
  },
  slide: {
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: Spacing.xl,
  },
  slideImage: {
    width: 300,
    height: 250,
    marginBottom: Spacing["2xl"],
  },
  slideTitle: {
    fontSize: 24,
    fontWeight: "700",
    textAlign: "center",
    marginBottom: Spacing.md,
  },
  slideDescription: {
    fontSize: 16,
    textAlign: "center",
    lineHeight: 24,
    maxWidth: 400,
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
    padding: Spacing.xl,
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
