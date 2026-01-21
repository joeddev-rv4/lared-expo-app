import React, { useState, useEffect, useRef } from "react";
import {
  View,
  StyleSheet,
  Pressable,
  Image,
  Animated,
  ImageBackground,
  useWindowDimensions,
  TextInput,
  Alert,
} from "react-native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { useNavigation } from "@react-navigation/native";
import { Ionicons, FontAwesome } from "@expo/vector-icons";

import { ThemedText } from "@/components/ThemedText";
import { ThemedView } from "@/components/ThemedView";
import { useTheme } from "@/hooks/useTheme";
import { useAuth } from "@/contexts/AuthContext";
import { Colors, Spacing, BorderRadius, Shadows } from "@/constants/theme";
import { RootStackParamList } from "@/navigation/RootStackNavigator";
import { getAuth, fetchSignInMethodsForEmail, createUserWithEmailAndPassword } from 'firebase/auth';
import { doc, setDoc, collection, query, where, getDocs } from 'firebase/firestore';
import { db } from '@/lib/config';

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
  const [currentPage, setCurrentPage] = useState(0);
  const [mode, setMode] = useState<'buttons' | 'login' | 'register' | 'register_username' | 'register_phone' | 'verify_phone'>('buttons');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [username, setUsername] = useState('');
  const [phone, setPhone] = useState('');
  const [verificationCode, setVerificationCode] = useState(['', '', '', '', '', '']);
  const [codeColors] = useState([new Animated.Value(0), new Animated.Value(0), new Animated.Value(0), new Animated.Value(0), new Animated.Value(0), new Animated.Value(0)]);
  const codeInputRefs = useRef<(TextInput | null)[]>([null, null, null, null, null, null]);
  const [hasAttemptedLogin, setHasAttemptedLogin] = useState(false);
  const fadeAnim = useRef(new Animated.Value(1)).current;
  const [formAnim] = useState(new Animated.Value(0));
  const [buttonsAnim] = useState(new Animated.Value(1));
  const [errorMessage, setErrorMessage] = useState('');
  const [showErrorPopup, setShowErrorPopup] = useState(false);

  // Clear any old data on mount
  useEffect(() => {
    const clearOldData = async () => {
      const { clearUserProfile } = await import('@/lib/storage');
      await clearUserProfile();
      await logout();
    };
    clearOldData();
  }, [logout]);

  useEffect(() => {
    if (user && hasAttemptedLogin) {
      navigation.replace('Main');
    }
  }, [user, navigation, hasAttemptedLogin]);

  useEffect(() => {
    if (mode === 'login' || mode === 'register' || mode === 'register_username' || mode === 'register_phone' || mode === 'verify_phone') {
      // Animar hacia adentro
      Animated.parallel([
        Animated.timing(formAnim, {
          toValue: 1,
          duration: 400,
          useNativeDriver: false,
        }),
        Animated.timing(buttonsAnim, {
          toValue: 0,
          duration: 400,
          useNativeDriver: false,
        }),
      ]).start();
    } else {
      Animated.parallel([
        Animated.timing(formAnim, {
          toValue: 0,
          duration: 400,
          useNativeDriver: false,
        }),
        Animated.timing(buttonsAnim, {
          toValue: 1,
          duration: 400,
          useNativeDriver: false,
        }),
      ]).start();
    }
  }, [mode]);

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

  const handleSubmit = async () => {
    if (!email || !password) {
      Alert.alert('Error', 'Por favor ingresa email y contraseña');
      return;
    }
    
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
    // Primero animar los botones hacia fuera
    Animated.timing(buttonsAnim, {
      toValue: 0,
      duration: 200,
      useNativeDriver: false,
    }).start(() => {
      // Luego cambiar el modo
      setMode('login');
    });
  };

  const handleRegister = () => {
    // Primero animar hacia fuera el contenido actual
    Animated.timing(formAnim, {
      toValue: 0,
      duration: 200,
      useNativeDriver: false,
    }).start(() => {
      // Luego cambiar el modo
      setMode('register');
    });
  };

  const handleRegisterNext = async () => {
    if (!email.trim()) {
      setErrorMessage('Por favor ingresa un email');
      setShowErrorPopup(true);
      setTimeout(() => setShowErrorPopup(false), 3000);
      return;
    }

    try {
      const auth = getAuth();
      
      console.log('Verificando email:', email);
      
      // Verificar en Firebase Auth
      const methods = await fetchSignInMethodsForEmail(auth, email);
      console.log('Métodos en Auth encontrados:', methods);
      
      if (methods.length > 0) {
        console.log('Email ya existe en Firebase Auth');
        setErrorMessage('Este email ya está relacionado a una cuenta');
        setShowErrorPopup(true);
        setTimeout(() => setShowErrorPopup(false), 3000);
        return;
      }

      console.log('Email disponible, procediendo...');
      // Email no existe, proceder al siguiente paso
      Animated.timing(formAnim, {
        toValue: 0,
        duration: 200,
        useNativeDriver: false,
      }).start(() => {
        setMode('register_username');
        formAnim.setValue(0);
        Animated.timing(formAnim, {
          toValue: 1,
          duration: 300,
          useNativeDriver: false,
        }).start();
      });
    } catch (error: any) {
      console.error('Error al verificar email:', error);
      setErrorMessage('Error al verificar email');
      setShowErrorPopup(true);
      setTimeout(() => setShowErrorPopup(false), 3000);
    }
  };

  const handleUsernameNext = async () => {
    if (!username.trim()) {
      setErrorMessage('Por favor ingresa un usuario');
      setShowErrorPopup(true);
      setTimeout(() => setShowErrorPopup(false), 3000);
      return;
    }

    console.log('Username ingresado:', username);
    // NO verificar en Firestore porque no hay autenticación aún
    // Proceder directamente al siguiente paso
    Animated.timing(formAnim, {
      toValue: 0,
      duration: 200,
      useNativeDriver: false,
    }).start(() => {
      setMode('register_phone');
      formAnim.setValue(0);
      Animated.timing(formAnim, {
        toValue: 1,
        duration: 300,
        useNativeDriver: false,
      }).start();
    });
  };

  const handleBack = () => {
    // Primero animar hacia fuera el contenido actual
    Animated.timing(formAnim, {
      toValue: 0,
      duration: 200,
      useNativeDriver: false,
    }).start(() => {
      // Luego cambiar el modo a botones
      setMode('buttons');
    });
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

            {mode === 'buttons' ? (
              <Animated.View 
                style={[
                  styles.buttonContainer,
                  { 
                    opacity: buttonsAnim,
                    transform: [{ 
                      translateX: buttonsAnim.interpolate({
                        inputRange: [0, 1],
                        outputRange: [-10, 0]
                      })
                    }]
                  }
                ]}
              >
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
                  <Ionicons name="mail-outline" size={20} color="#FFFFFF" />
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
            >
              <ThemedText style={[styles.skipText, { color: theme.textSecondary }]}>
                Continue as Guest
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

      {showErrorPopup && (
        <View style={styles.errorPopup}>
          <View style={styles.errorPopupContent}>
            <FontAwesome name="exclamation-circle" size={20} color="#FFFFFF" />
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
  formContainer: {
    gap: Spacing.md,
    width: "100%",
  },
  registerContainer: {
    gap: Spacing.md,
    width: "100%",
  },
  buttonRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  registerTitle: {
    fontSize: 18,
    fontWeight: "600",
    textAlign: "center",
  },
  input: {
    borderWidth: 1,
    borderRadius: BorderRadius.sm,
    padding: Spacing.md,
    fontSize: 16,
    minHeight: 50,
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
    marginTop: 0,
    borderWidth: 1,
    borderRadius: 8,
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
});
