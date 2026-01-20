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
  ImageBackground,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { useNavigation } from "@react-navigation/native";
import * as Haptics from "expo-haptics";

import { ThemedText } from "@/components/ThemedText";
import { setOnboardingComplete } from "@/lib/storage";
import { Colors, Spacing, BorderRadius } from "@/constants/theme";
import { RootStackParamList } from "@/navigation/RootStackNavigator";

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get("window");

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

export default function OnboardingScreen() {
  const navigation = useNavigation<NavigationProp>();
  const insets = useSafeAreaInsets();
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
    <ImageBackground
      source={require("../../assets/images/login_image_1.png")}
      style={styles.container}
      resizeMode="cover"
    >
      <View style={styles.overlay}>
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
              <ThemedText style={styles.slideTitle}>{slide.title}</ThemedText>
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
                      index === currentPage ? "#FFFFFF" : "rgba(255, 255, 255, 0.5)",
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
              <ThemedText style={styles.skipText}>Saltar</ThemedText>
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
                {currentPage === SLIDES.length - 1 ? "Comenzar" : "Continuar"}
              </ThemedText>
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
    backgroundColor: "rgba(0, 0, 0, 0.3)",
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
    width: SCREEN_WIDTH * 0.9,
    height: SCREEN_HEIGHT * 0.5,
  },
  slideTitle: {
    fontSize: 32,
    fontWeight: "700",
    textAlign: "center",
    color: "#FFFFFF",
    marginTop: Spacing.xl,
    paddingHorizontal: Spacing.md,
    width: "100%",
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
    color: "#FFFFFF",
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
