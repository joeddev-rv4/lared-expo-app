import React from "react";
import { View, StyleSheet, Pressable, Image } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { useNavigation } from "@react-navigation/native";
import { Ionicons, FontAwesome } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";

import { ThemedText } from "@/components/ThemedText";
import { ThemedView } from "@/components/ThemedView";
import { useTheme } from "@/hooks/useTheme";
import { setUserProfile } from "@/lib/storage";
import { Colors, Spacing, BorderRadius, Shadows } from "@/constants/theme";
import { RootStackParamList } from "@/navigation/RootStackNavigator";

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

export default function LoginScreen() {
  const navigation = useNavigation<NavigationProp>();
  const insets = useSafeAreaInsets();
  const { theme, isDark } = useTheme();

  const handleEmailLogin = async () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    await setUserProfile({
      name: "Guest User",
      email: "guest@example.com",
      isLoggedIn: true,
      loginMethod: "email",
    });
    navigation.replace("Main");
  };

  const handleGoogleLogin = async () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    await setUserProfile({
      name: "Google User",
      email: "user@gmail.com",
      isLoggedIn: true,
      loginMethod: "google",
    });
    navigation.replace("Main");
  };

  const handleFacebookLogin = async () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    await setUserProfile({
      name: "Facebook User",
      email: "user@facebook.com",
      isLoggedIn: true,
      loginMethod: "facebook",
    });
    navigation.replace("Main");
  };

  const handleSkip = async () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    await setUserProfile({
      name: "Guest",
      email: "",
      isLoggedIn: false,
    });
    navigation.replace("Main");
  };

  return (
    <ThemedView style={styles.container}>
      <View style={[styles.content, { paddingTop: insets.top + Spacing["5xl"] }]}>
        <View style={styles.logoContainer}>
          <Image
            source={require("../../assets/images/icon.png")}
            style={styles.logo}
            resizeMode="contain"
          />
          <ThemedText style={styles.appName}>La Red Inmobiliaria</ThemedText>
          <ThemedText style={[styles.tagline, { color: theme.textSecondary }]}>
            Hecha por vendedores, para vendedores
          </ThemedText>
        </View>

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
            testID="email-login-button"
          >
            <Ionicons name="mail-outline" size={20} color="#FFFFFF" />
            <ThemedText style={styles.loginButtonText}>
              Continue with Email
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
            testID="google-login-button"
          >
            <FontAwesome name="google" size={20} color="#DB4437" />
            <ThemedText style={[styles.socialButtonText, { color: theme.text }]}>
              Continue with Google
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
            testID="facebook-login-button"
          >
            <FontAwesome name="facebook" size={20} color="#FFFFFF" />
            <ThemedText style={styles.loginButtonText}>
              Continue with Facebook
            </ThemedText>
          </Pressable>
        </View>

        <Pressable
          onPress={handleSkip}
          style={({ pressed }) => [
            styles.skipButton,
            { opacity: pressed ? 0.7 : 1 },
          ]}
          testID="skip-login-button"
        >
          <ThemedText style={[styles.skipText, { color: theme.textSecondary }]}>
            Continue as Guest
          </ThemedText>
        </Pressable>
      </View>

      <View style={[styles.footer, { paddingBottom: insets.bottom + Spacing.xl }]}>
        <ThemedText style={[styles.termsText, { color: theme.textSecondary }]}>
          By continuing, you agree to our{" "}
          <ThemedText style={[styles.linkText, { color: Colors.light.primary }]}>
            Terms of Service
          </ThemedText>{" "}
          and{" "}
          <ThemedText style={[styles.linkText, { color: Colors.light.primary }]}>
            Privacy Policy
          </ThemedText>
        </ThemedText>
      </View>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
    paddingHorizontal: Spacing.xl,
  },
  logoContainer: {
    alignItems: "center",
    marginBottom: Spacing["5xl"],
  },
  logo: {
    width: 100,
    height: 100,
    marginBottom: Spacing.lg,
  },
  appName: {
    fontSize: 32,
    fontWeight: "700",
    marginBottom: Spacing.sm,
  },
  tagline: {
    fontSize: 16,
  },
  buttonContainer: {
    gap: Spacing.md,
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
    marginTop: Spacing.lg,
  },
  skipText: {
    fontSize: 16,
    fontWeight: "500",
  },
  footer: {
    paddingHorizontal: Spacing.xl,
  },
  termsText: {
    fontSize: 13,
    textAlign: "center",
    lineHeight: 20,
  },
  linkText: {
    fontSize: 13,
    fontWeight: "500",
  },
});
