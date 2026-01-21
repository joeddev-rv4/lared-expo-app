import React, { useState, useEffect, useRef } from "react";
import {
  View,
  StyleSheet,
  Pressable,
  Image,
  Animated,
  ImageBackground,
  useWindowDimensions,
} from "react-native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { useNavigation } from "@react-navigation/native";
import { Feather, FontAwesome } from "@expo/vector-icons";

import { ThemedText } from "@/components/ThemedText";
import { ThemedView } from "@/components/ThemedView";
import { useTheme } from "@/hooks/useTheme";
import { setUserProfile } from "@/lib/storage";
import { Colors, Spacing, BorderRadius, Shadows } from "@/constants/theme";
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

export default function LoginScreenWeb() {
  const navigation = useNavigation<NavigationProp>();
  const { theme, isDark } = useTheme();
  const { width } = useWindowDimensions();
  const isMobile = width < 768;
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

  const handleEmailLogin = async () => {
    await setUserProfile({
      name: "Guest User",
      email: "guest@example.com",
      isLoggedIn: true,
      loginMethod: "email",
    });
    navigation.replace("Main");
  };

  const handleGoogleLogin = async () => {
    await setUserProfile({
      name: "Google User",
      email: "user@gmail.com",
      isLoggedIn: true,
      loginMethod: "google",
    });
    navigation.replace("Main");
  };

  const handleFacebookLogin = async () => {
    await setUserProfile({
      name: "Facebook User",
      email: "user@facebook.com",
      isLoggedIn: true,
      loginMethod: "facebook",
    });
    navigation.replace("Main");
  };

  const handleSkip = async () => {
    await setUserProfile({
      name: "Guest",
      email: "",
      isLoggedIn: false,
    });
    navigation.replace("Main");
  };

  const currentSlide = SLIDES[currentPage];

  return (
    <ThemedView style={styles.container}>
      <View style={[styles.splitContainer, isMobile && styles.splitContainerMobile]}>
        {!isMobile ? (
          <ImageBackground
            source={require("../../assets/images/login_image_1.png")}
            style={styles.leftPanel}
            resizeMode="cover"
          >
            <View style={styles.leftOverlay}>
              <View style={styles.carouselContainer}>
                <Animated.View style={[styles.slide, { opacity: fadeAnim }]}>
                  <Image
                    source={currentSlide.image}
                    style={styles.slideImage}
                    resizeMode="contain"
                  />
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
                          index === currentPage ? "#FFFFFF" : "rgba(255, 255, 255, 0.5)",
                        width: index === currentPage ? 24 : 8,
                      },
                    ]}
                  />
                ))}
              </View>
            </View>
          </ImageBackground>
        ) : null}

        <View style={[styles.rightPanel, isMobile && styles.rightPanelMobile, { backgroundColor: theme.backgroundRoot }]}>
          <View style={styles.authContainer}>
            <Image
              source={require("../../assets/images/icon.png")}
              style={styles.logo}
              resizeMode="contain"
            />
            <ThemedText style={styles.appName}>La Red Inmobiliaria</ThemedText>
            <ThemedText style={[styles.tagline, { color: theme.textSecondary }]}>
              Hecha por vendedores, para vendedores
            </ThemedText>

            <View style={styles.buttonContainer}>
              <Pressable
                onPress={handleEmailLogin}
                style={({ pressed }) => [
                  styles.loginButton,
                  {
                    backgroundColor: Colors.light.primary,
                    opacity: pressed ? 0.9 : 1,
                  },
                ]}
              >
                <Feather name="mail" size={20} color="#FFFFFF" />
                <ThemedText style={styles.loginButtonText}>
                  Continuar con Email
                </ThemedText>
              </Pressable>

              <Pressable
                onPress={handleGoogleLogin}
                style={({ pressed }) => [
                  styles.loginButton,
                  styles.socialButton,
                  {
                    backgroundColor: theme.backgroundRoot,
                    borderColor: theme.border,
                    opacity: pressed ? 0.7 : 1,
                  },
                  isDark ? null : Shadows.card,
                ]}
              >
                <FontAwesome name="google" size={20} color="#DB4437" />
                <ThemedText style={[styles.socialButtonText, { color: theme.text }]}>
                  Continuar con Google
                </ThemedText>
              </Pressable>

              <Pressable
                onPress={handleFacebookLogin}
                style={({ pressed }) => [
                  styles.loginButton,
                  {
                    backgroundColor: "#1877F2",
                    opacity: pressed ? 0.9 : 1,
                  },
                ]}
              >
                <FontAwesome name="facebook" size={20} color="#FFFFFF" />
                <ThemedText style={styles.loginButtonText}>
                  Continuar con Facebook
                </ThemedText>
              </Pressable>
            </View>

            <Pressable
              onPress={handleSkip}
              style={({ pressed }) => [
                styles.skipButton,
                { opacity: pressed ? 0.7 : 1 },
              ]}
            >
              <ThemedText style={[styles.skipText, { color: theme.textSecondary }]}>
                Continuar como Invitado
              </ThemedText>
            </Pressable>

            <ThemedText style={[styles.termsText, { color: theme.textSecondary }]}>
              Al continuar, aceptas nuestros{" "}
              <ThemedText style={[styles.linkText, { color: Colors.light.primary }]}>
                Términos de Servicio
              </ThemedText>{" "}
              y{" "}
              <ThemedText style={[styles.linkText, { color: Colors.light.primary }]}>
                Política de Privacidad
              </ThemedText>
            </ThemedText>
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
    overflow: "hidden",
  },
  leftOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.4)",
    justifyContent: "center",
    alignItems: "center",
    padding: Spacing["2xl"],
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
    width: 500,
    height: 400,
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
    marginBottom: Spacing.lg,
  },
  appName: {
    fontSize: 28,
    fontWeight: "700",
    marginBottom: Spacing.sm,
  },
  tagline: {
    fontSize: 16,
    marginBottom: Spacing["3xl"],
  },
  buttonContainer: {
    gap: Spacing.md,
    width: "100%",
  },
  loginButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: Spacing.lg,
    borderRadius: BorderRadius.sm,
    gap: Spacing.md,
  },
  socialButton: {
    borderWidth: 1,
  },
  loginButtonText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#FFFFFF",
  },
  socialButtonText: {
    fontSize: 16,
    fontWeight: "600",
  },
  skipButton: {
    alignItems: "center",
    paddingVertical: Spacing.xl,
    marginTop: Spacing.md,
  },
  skipText: {
    fontSize: 16,
    fontWeight: "500",
  },
  termsText: {
    fontSize: 13,
    textAlign: "center",
    lineHeight: 20,
    marginTop: Spacing.lg,
  },
  linkText: {
    fontSize: 13,
    fontWeight: "500",
  },
  splitContainerMobile: {
    flexDirection: "column",
  },
  rightPanelMobile: {
    flex: 1,
    width: "100%",
  },
});
