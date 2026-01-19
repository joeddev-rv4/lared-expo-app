import React, { useRef, useState } from "react";
import {
  View,
  StyleSheet,
  Dimensions,
  Image,
  Pressable,
  ScrollView,
  Platform,
  NativeScrollEvent,
  NativeSyntheticEvent,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { useNavigation } from "@react-navigation/native";
import * as Haptics from "expo-haptics";

import { ThemedText } from "@/components/ThemedText";
import { ThemedView } from "@/components/ThemedView";
import { useTheme } from "@/hooks/useTheme";
import { setOnboardingComplete } from "@/lib/storage";
import { Colors, Spacing, BorderRadius } from "@/constants/theme";
import { RootStackParamList } from "@/navigation/RootStackNavigator";

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get("window");

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

export default function OnboardingScreen() {
  const navigation = useNavigation<NavigationProp>();
  const insets = useSafeAreaInsets();
  const { theme } = useTheme();
  const scrollRef = useRef<ScrollView>(null);
  const [currentPage, setCurrentPage] = useState(0);

  const handleSkip = async () => {
    if (Platform.OS !== "web") {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    await setOnboardingComplete();
    navigation.replace("Login");
  };

  const handleContinue = async () => {
    if (Platform.OS !== "web") {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    if (currentPage < SLIDES.length - 1) {
      scrollRef.current?.scrollTo({
        x: (currentPage + 1) * SCREEN_WIDTH,
        animated: true,
      });
    } else {
      await setOnboardingComplete();
      navigation.replace("Login");
    }
  };

  const handleScroll = (event: NativeSyntheticEvent<NativeScrollEvent>) => {
    const page = Math.round(event.nativeEvent.contentOffset.x / SCREEN_WIDTH);
    if (page !== currentPage) {
      setCurrentPage(page);
    }
  };

  return (
    <ThemedView style={styles.container}>
      <ScrollView
        ref={scrollRef}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onScroll={handleScroll}
        scrollEventThrottle={16}
        style={styles.scrollView}
      >
        {SLIDES.map((slide) => (
          <View key={slide.id} style={styles.slide}>
            <Image
              source={slide.image}
              style={styles.image}
              resizeMode="contain"
            />
            <View style={styles.textContainer}>
              <ThemedText style={styles.title}>{slide.title}</ThemedText>
              <ThemedText style={[styles.description, { color: theme.textSecondary }]}>
                {slide.description}
              </ThemedText>
            </View>
          </View>
        ))}
      </ScrollView>

      <View style={[styles.footer, { paddingBottom: insets.bottom + Spacing.xl }]}>
        <View style={styles.pagination}>
          {SLIDES.map((_, index) => (
            <View
              key={index}
              style={[
                styles.dot,
                {
                  backgroundColor:
                    index === currentPage
                      ? Colors.light.primary
                      : theme.border,
                  width: index === currentPage ? 24 : 8,
                },
              ]}
            />
          ))}
        </View>

        <View style={styles.buttonContainer}>
          <Pressable
            onPress={handleSkip}
            style={({ pressed }) => [
              styles.skipButton,
              { opacity: pressed ? 0.7 : 1 },
            ]}
            testID="skip-button"
          >
            <ThemedText style={[styles.skipText, { color: theme.textSecondary }]}>
              Skip
            </ThemedText>
          </Pressable>

          <Pressable
            onPress={handleContinue}
            style={({ pressed }) => [
              styles.continueButton,
              { opacity: pressed ? 0.9 : 1, backgroundColor: Colors.light.primary },
            ]}
            testID="continue-button"
          >
            <ThemedText style={styles.continueText}>
              {currentPage === SLIDES.length - 1 ? "Get Started" : "Continue"}
            </ThemedText>
          </Pressable>
        </View>
      </View>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  slide: {
    width: SCREEN_WIDTH,
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: Spacing.xl,
  },
  image: {
    width: SCREEN_WIDTH * 0.85,
    height: SCREEN_HEIGHT * 0.4,
    marginBottom: Spacing["3xl"],
  },
  textContainer: {
    alignItems: "center",
    paddingHorizontal: Spacing.lg,
  },
  title: {
    fontSize: 28,
    fontWeight: "700",
    textAlign: "center",
    marginBottom: Spacing.md,
  },
  description: {
    fontSize: 16,
    textAlign: "center",
    lineHeight: 24,
  },
  footer: {
    paddingHorizontal: Spacing.xl,
  },
  pagination: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: Spacing["2xl"],
    gap: Spacing.sm,
  },
  dot: {
    height: 8,
    borderRadius: 4,
  },
  buttonContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  skipButton: {
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.xl,
  },
  skipText: {
    fontSize: 16,
    fontWeight: "500",
  },
  continueButton: {
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing["3xl"],
    borderRadius: BorderRadius.full,
  },
  continueText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#FFFFFF",
  },
});
