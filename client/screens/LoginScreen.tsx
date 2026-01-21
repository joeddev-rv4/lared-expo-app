import React, { useState, useEffect } from "react";
import { View, StyleSheet, Pressable, Image, TextInput, Alert, Animated, Dimensions } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { useNavigation } from "@react-navigation/native";
import { Ionicons, FontAwesome } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";

import { ThemedText } from "@/components/ThemedText";
import { ThemedView } from "@/components/ThemedView";
import { useTheme } from "@/hooks/useTheme";
import { useAuth } from "@/contexts/AuthContext";
import { Colors, Spacing, BorderRadius, Shadows } from "@/constants/theme";
import { RootStackParamList } from "@/navigation/RootStackNavigator";

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

export default function LoginScreen() {
  const navigation = useNavigation<NavigationProp>();
  const insets = useSafeAreaInsets();
  const { theme, isDark } = useTheme();
  const { login, isLoading, user, logout, loginGoogle, loginFacebook } = useAuth();
  const [showEmailForm, setShowEmailForm] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [hasAttemptedLogin, setHasAttemptedLogin] = useState(false);
  const [scaleAnim] = useState(new Animated.Value(1));
  const [formAnim] = useState(new Animated.Value(0));
  const [buttonsAnim] = useState(new Animated.Value(1));
  const [errorMessage, setErrorMessage] = useState('');
  const [showErrorPopup, setShowErrorPopup] = useState(false);

  // Clear any old localStorage/AsyncStorage data on mount
  useEffect(() => {
    const clearOldData = async () => {
      const { clearUserProfile } = await import('@/lib/storage');
      await clearUserProfile();
      await logout(); // Also clear Firebase auth
    };
    clearOldData();
  }, [logout]);

  useEffect(() => {
    if (showEmailForm) {
      Animated.parallel([
        Animated.timing(formAnim, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.timing(buttonsAnim, {
          toValue: 0,
          duration: 300,
          useNativeDriver: true,
        }),
      ]).start();
    } else {
      Animated.parallel([
        Animated.timing(formAnim, {
          toValue: 0,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.timing(buttonsAnim, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [showEmailForm]);

  const handleSubmit = async () => {
    if (!email || !password) {
      Alert.alert('Error', 'Por favor ingresa email y contraseña');
      return;
    }
    
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setHasAttemptedLogin(true);
    
    try {
      await login(email, password);
    } catch (error: any) {
      let errorMessage = 'Error al iniciar sesión';
      let isCredentialError = false;
      
      if (error.code === 'auth/invalid-credential' || error.code === 'auth/user-not-found' || error.code === 'auth/wrong-password') {
        errorMessage = 'Email o contraseña incorrectos';
        isCredentialError = true;
      } else if (error.code === 'auth/invalid-email') {
        errorMessage = 'Email inválido';
      } else if (error.code === 'auth/too-many-requests') {
        errorMessage = 'Demasiados intentos fallidos. Intenta más tarde';
      } else if (error.message) {
        errorMessage = error.message;
      }
      
      if (isCredentialError) {
        setErrorMessage(errorMessage);
        setShowErrorPopup(true);
        // Auto-hide after 3 seconds
        setTimeout(() => setShowErrorPopup(false), 3000);
      } else {
        Alert.alert('Error de inicio de sesión', errorMessage);
      }
    }
  };

  const handleEmailLogin = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    Animated.sequence([
      Animated.spring(scaleAnim, {
        toValue: 0.95,
        useNativeDriver: true,
      }),
      Animated.spring(scaleAnim, {
        toValue: 1,
        useNativeDriver: true,
      }),
    ]).start();
    setShowEmailForm(true);
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

        {!showEmailForm ? (
          <Animated.View 
            style={[
              styles.buttonContainer,
              { 
                opacity: buttonsAnim,
                transform: [{ 
                  translateY: buttonsAnim.interpolate({
                    inputRange: [0, 1],
                    outputRange: [-50, 0]
                  })
                }]
              }
            ]}
          >
            <Animated.View style={{ transform: [{ scale: scaleAnim }] }}>
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
                <Feather name="mail" size={20} color="#FFFFFF" />
                <ThemedText style={styles.loginButtonText}>
                  Continue with Email
                </ThemedText>
              </Pressable>
            </Animated.View>

            <Pressable
              onPress={async () => {
                try {
                  await loginGoogle();
                } catch (error: any) {
                  if (error.message.includes('credenciales') || error.message.includes('Cuenta no existe')) {
                    setErrorMessage(error.message);
                    setShowErrorPopup(true);
                    setTimeout(() => setShowErrorPopup(false), 3000);
                  } else {
                    Alert.alert('Error', error.message || 'Error al iniciar sesión con Google');
                  }
                }
              }}
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
              onPress={async () => {
                try {
                  await loginFacebook();
                } catch (error: any) {
                  if (error.message.includes('credenciales') || error.message.includes('Cuenta no existe')) {
                    setErrorMessage(error.message);
                    setShowErrorPopup(true);
                    setTimeout(() => setShowErrorPopup(false), 3000);
                  } else {
                    Alert.alert('Error', error.message || 'Error al iniciar sesión con Facebook');
                  }
                }
              }}
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
            <Pressable
              onPress={() => Alert.alert('Continuar como invitado', 'Funcionalidad próximamente')}
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
          </Animated.View>
        ) : (
          <Animated.View 
            style={[
              styles.formContainer,
              { 
                opacity: formAnim,
                transform: [{ 
                  translateY: formAnim.interpolate({
                    inputRange: [0, 1],
                    outputRange: [50, 0]
                  })
                }]
              }
            ]}
          >
            <TextInput
              style={[styles.input, { 
                borderColor: theme.border, 
                color: theme.text,
                backgroundColor: theme.backgroundDefault 
              }]}
              placeholder="Email"
              placeholderTextColor={theme.textSecondary}
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
              autoFocus
            />
            <TextInput
              style={[styles.input, { 
                borderColor: theme.border, 
                color: theme.text,
                backgroundColor: theme.backgroundDefault 
              }]}
              placeholder="Contraseña"
              placeholderTextColor={theme.textSecondary}
              value={password}
              onChangeText={setPassword}
              secureTextEntry
            />
            <Pressable
              onPress={handleSubmit}
              disabled={isLoading}
              style={({ pressed }) => [
                styles.loginButton,
                {
                  backgroundColor: Colors.light.primary,
                  opacity: pressed ? 0.9 : isLoading ? 0.7 : 1,
                },
              ]}
              testID="login-button"
            >
              <ThemedText style={styles.loginButtonText}>
                {isLoading ? 'Iniciando sesión...' : 'Iniciar Sesión'}
              </ThemedText>
            </Pressable>
            <View style={styles.formFooter}>
              <Pressable
                onPress={() => setShowEmailForm(false)}
                style={({ pressed }) => [
                  styles.backButton,
                  { opacity: pressed ? 0.7 : 1 },
                ]}
              >
                <Feather name="arrow-left" size={20} color={theme.textSecondary} />
                <ThemedText style={[styles.backButtonText, { color: theme.textSecondary }]}>
                  Volver
                </ThemedText>
              </Pressable>
              <Pressable
                onPress={() => Alert.alert('Registrarse', 'Funcionalidad próximamente')}
                style={({ pressed }) => [
                  { opacity: pressed ? 0.7 : 1 },
                ]}
              >
                <ThemedText style={[styles.registerText, { color: Colors.light.primary }]}>
                  Registrarse
                </ThemedText>
              </Pressable>
            </View>
          </Animated.View>
        )}

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

      {showErrorPopup && (
        <View style={styles.errorPopup}>
          <View style={styles.errorPopupContent}>
            <Feather name="alert-circle" size={20} color="#FFFFFF" />
            <ThemedText style={styles.errorPopupText}>{errorMessage}</ThemedText>
          </View>
        </View>
      )}
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
  formContainer: {
    gap: Spacing.md,
  },
  input: {
    borderWidth: 1,
    borderRadius: BorderRadius.sm,
    padding: Spacing.md,
    fontSize: 16,
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
  backButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: Spacing.md,
    gap: Spacing.sm,
  },
  backButtonText: {
    fontSize: 16,
    fontWeight: "500",
  },
  formFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  registerText: {
    fontSize: 16,
    fontWeight: "500",
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
  errorPopup: {
    position: 'absolute',
    top: 50,
    right: 20,
    zIndex: 1000,
  },
  errorPopupContent: {
    backgroundColor: '#DC2626', // Red color
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
    borderRadius: BorderRadius.md,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
    minWidth: 200,
  },
  errorPopupText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '500',
    marginLeft: Spacing.sm,
    flex: 1,
  },
});
