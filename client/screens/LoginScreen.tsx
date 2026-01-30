import React, { useState, useEffect, useRef } from "react";
import {
  View,
  StyleSheet,
  Pressable,
  Image,
  TextInput,
  Alert,
  Animated,
  ScrollView,
  Platform,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { useNavigation } from "@react-navigation/native";
import { Ionicons, FontAwesome, Feather } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";

import { ThemedText } from "@/components/ThemedText";
import { ThemedView } from "@/components/ThemedView";
import { useTheme } from "@/hooks/useTheme";
import { useAuth } from "@/contexts/AuthContext";
import { Colors, Spacing, BorderRadius, Shadows } from "@/constants/theme";
import { RootStackParamList } from "@/navigation/RootStackNavigator";
import {
  getAuth,
  fetchSignInMethodsForEmail,
  createUserWithEmailAndPassword,
} from "firebase/auth";
import {
  doc,
  setDoc,
  collection,
  query,
  where,
  getDocs,
} from "firebase/firestore";
import { db } from "@/lib/config";

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

// Read login options from environment variables
const isGoogleLoginEnabled =
  process.env.EXPO_PUBLIC_GOOGLE_LOGIN_ENABLED !== "false";
const isFacebookLoginEnabled =
  process.env.EXPO_PUBLIC_FACEBOOK_LOGIN_ENABLED !== "false";
const isDevEnv = process.env.EXPO_PUBLIC_DEV_ENV === "true";
const devUser = process.env.EXPO_PUBLIC_DEV_ENV_USER;
const devPsw = process.env.EXPO_PUBLIC_DEV_ENV_PSW;

export default function LoginScreen() {
  console.log("DEV ENV DEBUG:", {
    isDevEnv,
    devUser,
    devPsw,
    env: process.env.EXPO_PUBLIC_DEV_ENV,
  });
  const navigation = useNavigation<NavigationProp>();
  const insets = useSafeAreaInsets();
  const { theme, isDark } = useTheme();
  const {
    login,
    isLoading,
    user,
    logout,
    loginGoogle,
    loginFacebook,
    loginAsGuest,
  } = useAuth();
  const [mode, setMode] = useState<
    | "buttons"
    | "login"
    | "register"
    | "register_password"
    | "register_username"
    | "register_phone"
    | "verify_phone"
    | "google_phone"
    | "google_verify_phone"
  >("buttons");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [username, setUsername] = useState("");
  const [phone, setPhone] = useState("");
  const [isFromGoogle, setIsFromGoogle] = useState(false);
  const [googleUserData, setGoogleUserData] = useState<{
    uid: string;
    email: string;
    displayName: string;
  } | null>(null);
  const [verificationCode, setVerificationCode] = useState([
    "",
    "",
    "",
    "",
    "",
    "",
  ]);
  const [codeColors] = useState([
    new Animated.Value(0),
    new Animated.Value(0),
    new Animated.Value(0),
    new Animated.Value(0),
    new Animated.Value(0),
    new Animated.Value(0),
  ]);
  const codeInputRefs = useRef<(TextInput | null)[]>([
    null,
    null,
    null,
    null,
    null,
    null,
  ]);
  const [hasAttemptedLogin, setHasAttemptedLogin] = useState(false);
  const [formAnim] = useState(new Animated.Value(0));
  const [buttonsAnim] = useState(new Animated.Value(1));
  const [errorMessage, setErrorMessage] = useState("");
  const [showErrorPopup, setShowErrorPopup] = useState(false);
  const [errorSlideAnim] = useState(new Animated.Value(300));
  const testFirebaseConnection = async () => {
    try {
      const auth = getAuth();
      console.log("🔥 Firebase Auth initialized:", {
        appName: auth.app.name,
        projectId: auth.app.options.projectId,
        apiKey: auth.app.options.apiKey?.substring(0, 10) + "...",
      });
      Alert.alert(
        "Firebase OK",
        "Conexión a Firebase funcionando correctamente",
      );
    } catch (error) {
      console.error("❌ Error de Firebase:", error);
      Alert.alert("Error de Firebase", "No se puede conectar a Firebase");
    }
  };

  const checkUserExists = async (email: string): Promise<boolean> => {
    try {
      const auth = getAuth();
      const signInMethods = await fetchSignInMethodsForEmail(auth, email);
      return signInMethods.length > 0;
    } catch (error) {
      console.error("Error checking user exists:", error);
      return false;
    }
  };

  // Clear old profile data on mount (but NOT logout - that would clear valid sessions)
  useEffect(() => {
    const clearOldData = async () => {
      const { clearUserProfile } = await import("@/lib/storage");
      await clearUserProfile();
      // REMOVED: await logout(); - This was incorrectly clearing valid Firebase sessions
    };
    clearOldData();
  }, []);

  // Animate error popup
  useEffect(() => {
    if (showErrorPopup) {
      Animated.spring(errorSlideAnim, {
        toValue: 0,
        useNativeDriver: true,
        tension: 65,
        friction: 8,
      }).start();
    } else {
      Animated.timing(errorSlideAnim, {
        toValue: 300,
        duration: 200,
        useNativeDriver: true,
      }).start();
    }
  }, [showErrorPopup]);

  useEffect(() => {
    if (user && hasAttemptedLogin) {
      navigation.replace("Main");
    }
  }, [user, navigation, hasAttemptedLogin]);

  useEffect(() => {
    if (
      mode === "login" ||
      mode === "register" ||
      mode === "register_password" ||
      mode === "register_username" ||
      mode === "register_phone" ||
      mode === "verify_phone" ||
      mode === "google_phone" ||
      mode === "google_verify_phone"
    ) {
      // Animate in
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

  const handleSubmit = async () => {
    if (!email || !password) {
      Alert.alert("Error", "Por favor ingresa email y contraseña");
      return;
    }

    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setHasAttemptedLogin(true);

    console.log("🔐 Intentando login con:", {
      email,
      firebaseConfig: {
        apiKey:
          process.env.EXPO_PUBLIC_FIREBASE_API_KEY?.substring(0, 10) + "...",
        projectId: process.env.EXPO_PUBLIC_FIREBASE_PROJECT_ID,
        authDomain: process.env.EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN,
      },
    });

    // Verificar si el usuario existe
    const userExists = await checkUserExists(email);
    if (!userExists) {
      console.log("❌ Usuario no existe en Firebase Auth");
      Alert.alert(
        "Usuario no encontrado",
        "Este email no está registrado en el sistema. ¿Quieres registrarte?",
        [
          { text: "Cancelar", style: "cancel" },
          { text: "Registrarse", onPress: () => setMode("register") },
        ],
      );
      return;
    }

    try {
      await login(email, password);
      console.log("✅ Login exitoso");
    } catch (error: any) {
      console.error("❌ Error de login:", error);
      console.error("Código de error:", error.code);
      console.error("Mensaje de error:", error.message);
      let errorMessage = "Error al iniciar sesión";
      let isCredentialError = false;

      if (
        error.code === "auth/invalid-credential" ||
        error.code === "auth/user-not-found" ||
        error.code === "auth/wrong-password"
      ) {
        errorMessage = "Credenciales incorrectas";
        isCredentialError = true;
      } else if (error.code === "auth/invalid-email") {
        errorMessage = "Email inválido";
      } else if (error.code === "auth/too-many-requests") {
        errorMessage = "Demasiados intentos fallidos. Intenta más tarde";
      } else if (error.message) {
        errorMessage = error.message;
      }

      if (isCredentialError) {
        setErrorMessage(errorMessage);
        setShowErrorPopup(true);
        setTimeout(() => setShowErrorPopup(false), 3000);
      } else {
        Alert.alert("Error de inicio de sesión", errorMessage);
      }
    }
  };

  const handleDevLogin = async () => {
    if (!devUser || !devPsw) {
      Alert.alert(
        "Configuration Error",
        "DEV_ENV_USER or DEV_ENV_PSW not set in .env",
      );
      return;
    }

    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setHasAttemptedLogin(true);

    try {
      await login(devUser, devPsw);
    } catch (error: any) {
      Alert.alert("Dev Login Error", error.message);
    }
  };

  const handleEmailLogin = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    Animated.timing(buttonsAnim, {
      toValue: 0,
      duration: 200,
      useNativeDriver: false,
    }).start(() => {
      setMode("login");
    });
  };

  const handleRegister = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    Animated.timing(formAnim, {
      toValue: 0,
      duration: 200,
      useNativeDriver: false,
    }).start(() => {
      setMode("register");
    });
  };

  const handleRegisterNext = async () => {
    if (!email.trim()) {
      setErrorMessage("Por favor ingresa un email");
      setShowErrorPopup(true);
      setTimeout(() => setShowErrorPopup(false), 3000);
      return;
    }

    try {
      const auth = getAuth();

      console.log("Verificando email:", email);

      // Verify in Firebase Auth
      const methods = await fetchSignInMethodsForEmail(auth, email);
      console.log("Métodos en Auth encontrados:", methods);

      if (methods.length > 0) {
        console.log("Email ya existe en Firebase Auth");
        setErrorMessage("Este email ya está relacionado a una cuenta");
        setShowErrorPopup(true);
        setTimeout(() => setShowErrorPopup(false), 3000);
        return;
      }

      // Also verify in Firestore
      const usersRef = collection(db, "users");
      const q = query(usersRef, where("email", "==", email));
      const querySnapshot = await getDocs(q);

      if (!querySnapshot.empty) {
        console.log("Email ya existe en Firestore");
        setErrorMessage("Este email ya está relacionado a una cuenta");
        setShowErrorPopup(true);
        setTimeout(() => setShowErrorPopup(false), 3000);
        return;
      }

      console.log("Email disponible, procediendo...");
      // Email doesn't exist, proceed to next step
      Animated.timing(formAnim, {
        toValue: 0,
        duration: 200,
        useNativeDriver: false,
      }).start(() => {
        setMode("register_password");
        formAnim.setValue(0);
        Animated.timing(formAnim, {
          toValue: 1,
          duration: 300,
          useNativeDriver: false,
        }).start();
      });
    } catch (error: any) {
      console.error("Error al verificar email:", error);
      setErrorMessage("Error al verificar email");
      setShowErrorPopup(true);
      setTimeout(() => setShowErrorPopup(false), 3000);
    }
  };

  const handlePasswordNext = async () => {
    if (!password.trim()) {
      setErrorMessage("Por favor ingresa una contraseña");
      setShowErrorPopup(true);
      setTimeout(() => setShowErrorPopup(false), 3000);
      return;
    }

    if (password.length < 6) {
      setErrorMessage("La contraseña debe tener al menos 6 caracteres");
      setShowErrorPopup(true);
      setTimeout(() => setShowErrorPopup(false), 3000);
      return;
    }

    if (password !== confirmPassword) {
      setErrorMessage("Las contraseñas no coinciden");
      setShowErrorPopup(true);
      setTimeout(() => setShowErrorPopup(false), 3000);
      return;
    }

    // Solo validar, no crear usuario todavía
    console.log("Contraseña validada, procediendo a username");
    Animated.timing(formAnim, {
      toValue: 0,
      duration: 200,
      useNativeDriver: false,
    }).start(() => {
      setMode("register_username");
      formAnim.setValue(0);
      Animated.timing(formAnim, {
        toValue: 1,
        duration: 300,
        useNativeDriver: false,
      }).start();
    });
  };

  const handleUsernameNext = async () => {
    if (!username.trim()) {
      setErrorMessage("Por favor ingresa un usuario");
      setShowErrorPopup(true);
      setTimeout(() => setShowErrorPopup(false), 3000);
      return;
    }

    console.log("Username ingresado:", username);
    Animated.timing(formAnim, {
      toValue: 0,
      duration: 200,
      useNativeDriver: false,
    }).start(() => {
      setMode("register_phone");
      formAnim.setValue(0);
      Animated.timing(formAnim, {
        toValue: 1,
        duration: 300,
        useNativeDriver: false,
      }).start();
    });
  };

  const handleBack = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);

    // Limpiar todos los estados del formulario
    setEmail("");
    setPassword("");
    setConfirmPassword("");
    setUsername("");
    setPhone("");
    setVerificationCode(["", "", "", "", "", ""]);

    Animated.timing(formAnim, {
      toValue: 0,
      duration: 200,
      useNativeDriver: false,
    }).start(() => {
      setMode("buttons");
    });
  };

  return (
    <ThemedView style={styles.container}>
      {(true || isDevEnv) && (
        <Pressable
          style={({ pressed }) =>
            ({
              position: Platform.OS === "web" ? "fixed" : "absolute",
              top: Platform.OS === "web" ? 100 : insets.top + 10,
              right: 20,
              zIndex: 99999,
              backgroundColor: "#FF0000",
              paddingHorizontal: 12,
              paddingVertical: 6,
              borderRadius: 8,
              shadowColor: "#000",
              shadowOffset: {
                width: 0,
                height: 2,
              },
              shadowOpacity: 0.25,
              shadowRadius: 3.84,
              elevation: 5,
              cursor: Platform.OS === "web" ? "pointer" : undefined,
              opacity: pressed ? 0.8 : 1,
              transform: Platform.OS === "web" ? [] : undefined, // help with stacking context
            }) as any
          }
          onPress={handleDevLogin}
        >
          <ThemedText
            style={{ color: "white", fontWeight: "bold", fontSize: 12 }}
          >
            DEV
          </ThemedText>
        </Pressable>
      )}
      <ScrollView
        contentContainerStyle={[
          styles.scrollContent,
          { paddingTop: insets.top + Spacing["2xl"] },
        ]}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.logoContainer}>
          <Image
            source={require("../../assets/images/icon.png")}
            style={styles.logo}
            resizeMode="contain"
          />
          <ThemedText style={styles.appName}>La Red Inmobiliaria</ThemedText>
          <ThemedText style={[styles.tagline, { color: theme.textSecondary }]}>
            Hecho por vendedores, para ser vendedores
          </ThemedText>
        </View>

        {mode === "buttons" ? (
          <Animated.View
            style={[
              styles.buttonContainer,
              {
                opacity: buttonsAnim,
                transform: [
                  {
                    translateY: buttonsAnim.interpolate({
                      inputRange: [0, 1],
                      outputRange: [-10, 0],
                    }),
                  },
                ],
              },
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
              <Feather name="mail" size={20} color="#FFFFFF" />
              <ThemedText style={styles.loginButtonText}>
                Continue with Email
              </ThemedText>
            </Pressable>

            {isGoogleLoginEnabled ? (
              <Pressable
                onPress={async () => {
                  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                  try {
                    const isNewUser = await loginGoogle();
                    console.log(
                      "Login Google completado, isNewUser:",
                      isNewUser,
                    );

                    // Save Google user data immediately
                    const auth = getAuth();
                    const currentUser = auth.currentUser;
                    if (currentUser) {
                      setGoogleUserData({
                        uid: currentUser.uid,
                        email: currentUser.email || "",
                        displayName: currentUser.displayName || "",
                      });
                    }

                    if (isNewUser) {
                      // New user, show phone screen
                      setIsFromGoogle(true);
                      Animated.timing(buttonsAnim, {
                        toValue: 0,
                        duration: 200,
                        useNativeDriver: false,
                      }).start(() => {
                        setMode("google_phone");
                        formAnim.setValue(0);
                        Animated.timing(formAnim, {
                          toValue: 1,
                          duration: 300,
                          useNativeDriver: false,
                        }).start();
                      });
                    } else {
                      // Existing user, go to Main
                      setHasAttemptedLogin(true);
                      navigation.replace("Main");
                    }
                  } catch (error: any) {
                    if (
                      error.message.includes("credenciales") ||
                      error.message.includes("Cuenta no existe")
                    ) {
                      setErrorMessage(error.message);
                      setShowErrorPopup(true);
                      setTimeout(() => setShowErrorPopup(false), 3000);
                    } else {
                      Alert.alert(
                        "Error",
                        error.message || "Error al iniciar sesión con Google",
                      );
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
              >
                <FontAwesome name="google" size={20} color="#DB4437" />
                <ThemedText
                  style={[styles.socialButtonText, { color: theme.text }]}
                >
                  Continue with Google
                </ThemedText>
              </Pressable>
            ) : null}

            {isFacebookLoginEnabled ? (
              <Pressable
                onPress={async () => {
                  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                  try {
                    const isNewUser = await loginFacebook();
                    console.log(
                      "Login Facebook completado, isNewUser:",
                      isNewUser,
                    );

                    // Save Facebook user data immediately
                    const auth = getAuth();
                    const currentUser = auth.currentUser;
                    if (currentUser) {
                      setGoogleUserData({
                        uid: currentUser.uid,
                        email: currentUser.email || "",
                        displayName: currentUser.displayName || "",
                      });
                    }

                    if (isNewUser) {
                      // New user, show phone screen
                      setIsFromGoogle(true);
                      Animated.timing(buttonsAnim, {
                        toValue: 0,
                        duration: 200,
                        useNativeDriver: false,
                      }).start(() => {
                        setMode("google_phone");
                        formAnim.setValue(0);
                        Animated.timing(formAnim, {
                          toValue: 1,
                          duration: 300,
                          useNativeDriver: false,
                        }).start();
                      });
                    } else {
                      // Existing user, go to Main
                      setHasAttemptedLogin(true);
                      navigation.replace("Main");
                    }
                  } catch (error: any) {
                    if (
                      error.message.includes("credenciales") ||
                      error.message.includes("Cuenta no existe")
                    ) {
                      setErrorMessage(error.message);
                      setShowErrorPopup(true);
                      setTimeout(() => setShowErrorPopup(false), 3000);
                    } else {
                      Alert.alert(
                        "Error",
                        error.message || "Error al iniciar sesión con Facebook",
                      );
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
              >
                <FontAwesome name="facebook" size={20} color="#FFFFFF" />
                <ThemedText style={styles.loginButtonText}>
                  Continue with Facebook
                </ThemedText>
              </Pressable>
            ) : null}

            <Pressable
              onPress={() => {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                Animated.timing(buttonsAnim, {
                  toValue: 0,
                  duration: 200,
                  useNativeDriver: false,
                }).start(() => {
                  setMode("register");
                });
              }}
              style={({ pressed }) => [
                styles.loginButton,
                styles.socialButton,
                {
                  backgroundColor: theme.backgroundRoot,
                  borderColor: Colors.light.primary,
                  opacity: pressed ? 0.7 : 1,
                },
              ]}
            >
              <Feather
                name="user-plus"
                size={20}
                color={Colors.light.primary}
              />
              <ThemedText
                style={[
                  styles.socialButtonText,
                  { color: Colors.light.primary },
                ]}
              >
                Crear cuenta
              </ThemedText>
            </Pressable>

            <Pressable
              onPress={() => {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                loginAsGuest();
              }}
              style={({ pressed }) => [
                styles.skipButton,
                { opacity: pressed ? 0.7 : 1, borderWidth: 0 },
              ]}
            >
              <ThemedText
                style={[styles.skipText, { color: theme.textSecondary }]}
              >
                Continue as Guest
              </ThemedText>
            </Pressable>
          </Animated.View>
        ) : mode === "login" ? (
          <Animated.View
            style={[
              styles.formContainer,
              {
                opacity: formAnim,
                transform: [
                  {
                    translateY: formAnim.interpolate({
                      inputRange: [0, 1],
                      outputRange: [50, 0],
                    }),
                  },
                ],
              },
            ]}
          >
            <TextInput
              style={[
                styles.input,
                {
                  borderColor: theme.border,
                  color: theme.text,
                  backgroundColor: theme.backgroundDefault,
                },
              ]}
              placeholder="Email"
              placeholderTextColor={theme.textSecondary}
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
              autoFocus
            />
            <TextInput
              style={[
                styles.input,
                {
                  borderColor: theme.border,
                  color: theme.text,
                  backgroundColor: theme.backgroundDefault,
                },
              ]}
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
            >
              <ThemedText style={styles.loginButtonText}>
                {isLoading ? "Iniciando sesión..." : "Iniciar Sesión"}
              </ThemedText>
            </Pressable>
            <View style={styles.formFooter}>
              <Pressable
                onPress={handleBack}
                style={({ pressed }) => [
                  styles.backButton,
                  { opacity: pressed ? 0.7 : 1 },
                ]}
              >
                <Feather
                  name="arrow-left"
                  size={20}
                  color={theme.textSecondary}
                />
                <ThemedText
                  style={[
                    styles.backButtonText,
                    { color: theme.textSecondary },
                  ]}
                >
                  Volver
                </ThemedText>
              </Pressable>
              <Pressable
                onPress={handleRegister}
                style={({ pressed }) => [{ opacity: pressed ? 0.7 : 1 }]}
              >
                <ThemedText
                  style={[styles.registerText, { color: Colors.light.primary }]}
                >
                  Registrarse
                </ThemedText>
              </Pressable>
            </View>
          </Animated.View>
        ) : mode === "register" ? (
          <Animated.View
            style={[
              styles.registerContainer,
              {
                opacity: formAnim,
                transform: [
                  {
                    translateY: formAnim.interpolate({
                      inputRange: [0, 1],
                      outputRange: [50, 0],
                    }),
                  },
                ],
              },
            ]}
          >
            <ThemedText style={[styles.registerTitle, { color: theme.text }]}>
              Ingresa tu email
            </ThemedText>
            <TextInput
              style={[
                styles.input,
                {
                  borderColor: theme.border,
                  color: theme.text,
                  backgroundColor: theme.backgroundDefault,
                },
              ]}
              placeholder="Email"
              placeholderTextColor={theme.textSecondary}
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
              autoFocus
            />
            <Pressable
              onPress={() => {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                handleRegisterNext();
              }}
              style={({ pressed }) => [
                styles.loginButton,
                {
                  backgroundColor: Colors.light.primary,
                  opacity: pressed ? 0.9 : 1,
                },
              ]}
            >
              <ThemedText style={styles.loginButtonText}>Siguiente</ThemedText>
            </Pressable>
            <Pressable
              onPress={handleBack}
              style={({ pressed }) => [
                styles.backButton,
                { opacity: pressed ? 0.7 : 1 },
              ]}
            >
              <Feather
                name="arrow-left"
                size={20}
                color={theme.textSecondary}
              />
              <ThemedText
                style={[styles.backButtonText, { color: theme.textSecondary }]}
              >
                Volver
              </ThemedText>
            </Pressable>
          </Animated.View>
        ) : mode === "register_password" ? (
          <Animated.View
            style={[
              styles.registerContainer,
              {
                opacity: formAnim,
                transform: [
                  {
                    translateY: formAnim.interpolate({
                      inputRange: [0, 1],
                      outputRange: [50, 0],
                    }),
                  },
                ],
              },
            ]}
          >
            <ThemedText style={[styles.registerTitle, { color: theme.text }]}>
              Ingrese su contraseña
            </ThemedText>
            <View style={styles.passwordContainer}>
              <TextInput
                style={[
                  styles.input,
                  styles.passwordInput,
                  {
                    borderColor: theme.border,
                    color: theme.text,
                    backgroundColor: theme.backgroundDefault,
                  },
                ]}
                placeholder="Contraseña"
                placeholderTextColor={theme.textSecondary}
                value={password}
                onChangeText={setPassword}
                secureTextEntry={!showPassword}
                autoFocus
              />
              <Pressable
                onPress={() => {
                  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                  setShowPassword(!showPassword);
                }}
                style={styles.eyeButton}
              >
                <Feather
                  name={showPassword ? "eye" : "eye-off"}
                  size={20}
                  color={theme.textSecondary}
                />
              </Pressable>
            </View>
            <View style={styles.passwordContainer}>
              <TextInput
                style={[
                  styles.input,
                  styles.passwordInput,
                  {
                    borderColor: theme.border,
                    color: theme.text,
                    backgroundColor: theme.backgroundDefault,
                  },
                ]}
                placeholder="Repetir Contraseña"
                placeholderTextColor={theme.textSecondary}
                value={confirmPassword}
                onChangeText={setConfirmPassword}
                secureTextEntry={!showConfirmPassword}
              />
              <Pressable
                onPress={() => {
                  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                  setShowConfirmPassword(!showConfirmPassword);
                }}
                style={styles.eyeButton}
              >
                <Feather
                  name={showConfirmPassword ? "eye" : "eye-off"}
                  size={20}
                  color={theme.textSecondary}
                />
              </Pressable>
            </View>
            <Pressable
              onPress={() => {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                handlePasswordNext();
              }}
              style={({ pressed }) => [
                styles.loginButton,
                {
                  backgroundColor: Colors.light.primary,
                  opacity: pressed ? 0.9 : 1,
                },
              ]}
            >
              <ThemedText style={styles.loginButtonText}>Siguiente</ThemedText>
            </Pressable>
            <Pressable
              onPress={handleBack}
              style={({ pressed }) => [
                styles.backButton,
                { opacity: pressed ? 0.7 : 1 },
              ]}
            >
              <Feather
                name="arrow-left"
                size={20}
                color={theme.textSecondary}
              />
              <ThemedText
                style={[styles.backButtonText, { color: theme.textSecondary }]}
              >
                Volver
              </ThemedText>
            </Pressable>
          </Animated.View>
        ) : mode === "register_username" ? (
          <Animated.View
            style={[
              styles.registerContainer,
              {
                opacity: formAnim,
                transform: [
                  {
                    translateY: formAnim.interpolate({
                      inputRange: [0, 1],
                      outputRange: [50, 0],
                    }),
                  },
                ],
              },
            ]}
          >
            <ThemedText style={[styles.registerTitle, { color: theme.text }]}>
              Ingresa tu nombre
            </ThemedText>
            <TextInput
              style={[
                styles.input,
                {
                  borderColor: theme.border,
                  color: theme.text,
                  backgroundColor: theme.backgroundDefault,
                },
              ]}
              placeholder="Nombre"
              placeholderTextColor={theme.textSecondary}
              value={username}
              onChangeText={setUsername}
              autoCapitalize="none"
              autoFocus
            />
            <Pressable
              onPress={() => {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                handleUsernameNext();
              }}
              style={({ pressed }) => [
                styles.loginButton,
                {
                  backgroundColor: Colors.light.primary,
                  opacity: pressed ? 0.9 : 1,
                },
              ]}
            >
              <ThemedText style={styles.loginButtonText}>Siguiente</ThemedText>
            </Pressable>
            <Pressable
              onPress={() => {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                Animated.timing(formAnim, {
                  toValue: 0,
                  duration: 200,
                  useNativeDriver: false,
                }).start(() => {
                  setMode("register");
                });
              }}
              style={({ pressed }) => [
                styles.backButton,
                { opacity: pressed ? 0.7 : 1 },
              ]}
            >
              <Feather
                name="arrow-left"
                size={20}
                color={theme.textSecondary}
              />
              <ThemedText
                style={[styles.backButtonText, { color: theme.textSecondary }]}
              >
                Volver
              </ThemedText>
            </Pressable>
          </Animated.View>
        ) : mode === "register_phone" ? (
          <Animated.View
            style={[
              styles.registerContainer,
              {
                opacity: formAnim,
                transform: [
                  {
                    translateY: formAnim.interpolate({
                      inputRange: [0, 1],
                      outputRange: [50, 0],
                    }),
                  },
                ],
              },
            ]}
          >
            <ThemedText style={[styles.registerTitle, { color: theme.text }]}>
              Ingresa tu teléfono
            </ThemedText>
            <TextInput
              style={[
                styles.input,
                {
                  borderColor: theme.border,
                  color: theme.text,
                  backgroundColor: theme.backgroundDefault,
                },
              ]}
              placeholder="Teléfono"
              placeholderTextColor={theme.textSecondary}
              value={phone}
              onChangeText={(text) => {
                // Solo permitir números y máximo 8 dígitos
                const cleanedText = text.replace(/[^0-9]/g, "").slice(0, 8);
                setPhone(cleanedText);
              }}
              keyboardType="phone-pad"
              maxLength={8}
              autoFocus
            />
            <View style={styles.buttonRow}>
              <Pressable
                onPress={async () => {
                  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                  try {
                    // Crear usuario en Firebase Auth
                    const auth = getAuth();
                    const userCredential = await createUserWithEmailAndPassword(
                      auth,
                      email,
                      password,
                    );
                    console.log(
                      "Usuario creado en Firebase Auth (sin teléfono):",
                      userCredential.user.uid,
                    );

                    // Guardar en Firestore sin teléfono
                    await setDoc(doc(db, "users", userCredential.user.uid), {
                      id: userCredential.user.uid,
                      email: email,
                      name: username,
                      phone: "",
                      createdAt: new Date(),
                      status: "notVerified",
                      isAdmin: false,
                      isVerifiedBroker: false,
                      avatar: "",
                      bank: "",
                      card: "",
                      dpiDocument: {
                        back: "",
                        front: "",
                      },
                      dpiNumber: "",
                    });

                    console.log("Usuario creado sin teléfono");

                    // Ir a la pantalla principal
                    setHasAttemptedLogin(true);
                    navigation.replace("Main");
                  } catch (error: any) {
                    console.error("Error al crear usuario:", error);
                    let errorMessage = "Error al crear cuenta";

                    if (error.code === "auth/email-already-in-use") {
                      errorMessage = "Este email ya está en uso";
                    } else if (error.code === "auth/invalid-email") {
                      errorMessage = "Email inválido";
                    } else if (error.code === "auth/weak-password") {
                      errorMessage = "La contraseña es muy débil";
                    } else if (error.message) {
                      errorMessage = error.message;
                    }

                    setErrorMessage(errorMessage);
                    setShowErrorPopup(true);
                    setTimeout(() => setShowErrorPopup(false), 3000);
                  }
                }}
                style={({ pressed }) => [
                  styles.skipButton,
                  {
                    opacity: pressed ? 0.7 : 1,
                    flex: 1,
                    marginRight: Spacing.sm,
                    height: 50,
                    paddingVertical: 0,
                    alignItems: "center",
                    justifyContent: "center",
                    borderColor: "#cccccc",
                  },
                ]}
              >
                <ThemedText
                  style={[
                    styles.skipText,
                    { color: theme.textSecondary, marginTop: 0 },
                  ]}
                >
                  Saltar
                </ThemedText>
              </Pressable>
              <Pressable
                onPress={() => {
                  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                  if (!phone.trim()) {
                    setErrorMessage("Por favor ingresa tu teléfono");
                    setShowErrorPopup(true);
                    setTimeout(() => setShowErrorPopup(false), 3000);
                    return;
                  }
                  if (phone.length !== 8) {
                    setErrorMessage(
                      "El teléfono debe tener exactamente 8 dígitos",
                    );
                    setShowErrorPopup(true);
                    setTimeout(() => setShowErrorPopup(false), 3000);
                    return;
                  }
                  Animated.timing(formAnim, {
                    toValue: 0,
                    duration: 200,
                    useNativeDriver: false,
                  }).start(() => {
                    setMode("verify_phone");
                    formAnim.setValue(0);
                    Animated.timing(formAnim, {
                      toValue: 1,
                      duration: 300,
                      useNativeDriver: false,
                    }).start();
                  });
                }}
                style={({ pressed }) => [
                  styles.loginButton,
                  {
                    backgroundColor: Colors.light.primary,
                    opacity: pressed ? 0.9 : 1,
                    flex: 1,
                    marginLeft: Spacing.sm,
                    height: 50,
                    paddingVertical: 0,
                    alignItems: "center",
                    justifyContent: "center",
                  },
                ]}
              >
                <ThemedText style={styles.loginButtonText}>
                  Siguiente
                </ThemedText>
              </Pressable>
            </View>
            <Pressable
              onPress={async () => {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                try {
                  // Crear usuario en Firebase Auth
                  const auth = getAuth();
                  const userCredential = await createUserWithEmailAndPassword(
                    auth,
                    email,
                    password,
                  );
                  console.log(
                    "Usuario creado en Firebase Auth (sin teléfono):",
                    userCredential.user.uid,
                  );

                  // Guardar en Firestore sin teléfono
                  await setDoc(doc(db, "users", userCredential.user.uid), {
                    id: userCredential.user.uid,
                    email: email,
                    name: username,
                    phone: "",
                    createdAt: new Date(),
                    status: "notVerified",
                    isAdmin: false,
                    isVerifiedBroker: false,
                    avatar: "",
                    bank: "",
                    card: "",
                    dpiDocument: {
                      back: "",
                      front: "",
                    },
                    dpiNumber: "",
                  });

                  console.log("Usuario creado sin teléfono");

                  // Ir a la pantalla principal
                  setHasAttemptedLogin(true);
                  navigation.replace("Main");
                } catch (error: any) {
                  console.error("Error al crear usuario:", error);
                  let errorMessage = "Error al crear cuenta";

                  if (error.code === "auth/email-already-in-use") {
                    errorMessage = "Este email ya está en uso";
                  } else if (error.code === "auth/invalid-email") {
                    errorMessage = "Email inválido";
                  } else if (error.code === "auth/weak-password") {
                    errorMessage = "La contraseña es muy débil";
                  } else if (error.message) {
                    errorMessage = error.message;
                  }

                  setErrorMessage(errorMessage);
                  setShowErrorPopup(true);
                  setTimeout(() => setShowErrorPopup(false), 3000);
                }
              }}
              style={({ pressed }) => [
                styles.skipButton,
                {
                  opacity: pressed ? 0.7 : 1,
                },
              ]}
            >
              <ThemedText
                style={[styles.skipText, { color: theme.textSecondary }]}
              >
                Saltar
              </ThemedText>
            </Pressable>
            <Pressable
              onPress={() => {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                Animated.timing(formAnim, {
                  toValue: 0,
                  duration: 200,
                  useNativeDriver: false,
                }).start(() => {
                  setMode("register_username");
                });
              }}
              style={({ pressed }) => [
                styles.backButton,
                { opacity: pressed ? 0.7 : 1 },
              ]}
            >
              <Feather
                name="arrow-left"
                size={20}
                color={theme.textSecondary}
              />
              <ThemedText
                style={[styles.backButtonText, { color: theme.textSecondary }]}
              >
                Volver
              </ThemedText>
            </Pressable>
          </Animated.View>
        ) : mode === "verify_phone" ? (
          <Animated.View
            style={[
              styles.registerContainer,
              {
                opacity: formAnim,
                transform: [
                  {
                    translateY: formAnim.interpolate({
                      inputRange: [0, 1],
                      outputRange: [50, 0],
                    }),
                  },
                ],
              },
            ]}
          >
            <ThemedText style={[styles.registerTitle, { color: theme.text }]}>
              Verifica tu teléfono
            </ThemedText>
            <View style={styles.codeContainer}>
              {verificationCode.map((digit, index) => {
                const borderColor = codeColors[index].interpolate({
                  inputRange: [0, 1],
                  outputRange: ["#cccccc", Colors.light.primary],
                });

                return (
                  <Animated.View
                    key={index}
                    style={[styles.codeSlotWrapper, { borderColor }]}
                  >
                    <TextInput
                      ref={(ref) => {
                        codeInputRefs.current[index] = ref;
                      }}
                      style={[styles.codeSlot, { color: theme.text }]}
                      value={digit}
                      onChangeText={(text) => {
                        if (text.length <= 1 && /^[0-9]*$/.test(text)) {
                          const newCode = [...verificationCode];
                          newCode[index] = text;
                          setVerificationCode(newCode);

                          if (text) {
                            Animated.timing(codeColors[index], {
                              toValue: 1,
                              duration: 200,
                              useNativeDriver: false,
                            }).start();

                            // Auto-focus next input
                            if (index < 5) {
                              setTimeout(() => {
                                codeInputRefs.current[index + 1]?.focus();
                              }, 10);
                            }
                          } else {
                            Animated.timing(codeColors[index], {
                              toValue: 0,
                              duration: 200,
                              useNativeDriver: false,
                            }).start();
                          }
                        }
                      }}
                      onKeyPress={(e: any) => {
                        if (
                          e.nativeEvent.key === "Backspace" &&
                          !digit &&
                          index > 0
                        ) {
                          setTimeout(() => {
                            codeInputRefs.current[index - 1]?.focus();
                          }, 10);
                        }
                      }}
                      keyboardType="number-pad"
                      maxLength={1}
                      autoFocus={index === 0}
                    />
                  </Animated.View>
                );
              })}
            </View>
            <Pressable
              onPress={async () => {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                const code = verificationCode.join("");
                if (code.length !== 6) {
                  setErrorMessage("Por favor ingresa el código completo");
                  setShowErrorPopup(true);
                  setTimeout(() => setShowErrorPopup(false), 3000);
                  return;
                }

                try {
                  // Crear usuario en Firebase Auth
                  const auth = getAuth();
                  const userCredential = await createUserWithEmailAndPassword(
                    auth,
                    email,
                    password,
                  );
                  console.log(
                    "Usuario creado en Firebase Auth:",
                    userCredential.user.uid,
                  );

                  // Guardar datos completos en Firestore
                  await setDoc(
                    doc(db, "users", userCredential.user.uid),
                    {
                      id: userCredential.user.uid,
                      email: email,
                      name: username,
                      phone: `+502${phone}`,
                      createdAt: new Date(),
                      status: "Verified",
                      isAdmin: false,
                      isVerifiedBroker: false,
                      avatar: "",
                      bank: "",
                      card: "",
                      dpiDocument: {
                        back: "",
                        front: "",
                      },
                      dpiNumber: "",
                    },
                    { merge: true },
                  );

                  console.log("Datos guardados en Firestore correctamente");

                  // Redirect to main page
                  setHasAttemptedLogin(true);
                  navigation.replace("Main");
                } catch (error: any) {
                  console.error("Error al crear usuario:", error);
                  let errorMsg = "Error al crear la cuenta";
                  if (error.code === "auth/email-already-in-use") {
                    errorMsg = "Este email ya está relacionado a una cuenta";
                  } else if (error.message) {
                    errorMsg = error.message;
                  }
                  setErrorMessage(errorMsg);
                  setShowErrorPopup(true);
                  setTimeout(() => setShowErrorPopup(false), 3000);
                }
              }}
              style={({ pressed }) => [
                styles.loginButton,
                {
                  backgroundColor: Colors.light.primary,
                  opacity: pressed ? 0.9 : 1,
                  marginTop: Spacing.xl,
                },
              ]}
            >
              <ThemedText style={styles.loginButtonText}>Siguiente</ThemedText>
            </Pressable>
            <Pressable
              onPress={() => {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                Animated.timing(formAnim, {
                  toValue: 0,
                  duration: 200,
                  useNativeDriver: false,
                }).start(() => {
                  setMode("register_phone");
                  formAnim.setValue(0);
                  Animated.timing(formAnim, {
                    toValue: 1,
                    duration: 300,
                    useNativeDriver: false,
                  }).start();
                });
              }}
              style={({ pressed }) => [
                styles.backButton,
                { opacity: pressed ? 0.7 : 1 },
              ]}
            >
              <Feather
                name="arrow-left"
                size={20}
                color={theme.textSecondary}
              />
              <ThemedText
                style={[styles.backButtonText, { color: theme.textSecondary }]}
              >
                Volver
              </ThemedText>
            </Pressable>
          </Animated.View>
        ) : mode === "google_phone" ? (
          <Animated.View
            style={[
              styles.registerContainer,
              {
                opacity: formAnim,
                transform: [
                  {
                    translateY: formAnim.interpolate({
                      inputRange: [0, 1],
                      outputRange: [50, 0],
                    }),
                  },
                ],
              },
            ]}
          >
            <ThemedText style={[styles.registerTitle, { color: theme.text }]}>
              Ingresa tu teléfono
            </ThemedText>
            <TextInput
              style={[
                styles.input,
                {
                  borderColor: theme.border,
                  color: theme.text,
                  backgroundColor: theme.backgroundDefault,
                },
              ]}
              placeholder="Teléfono"
              placeholderTextColor={theme.textSecondary}
              value={phone}
              onChangeText={(text) => {
                // Solo permitir números y máximo 8 dígitos
                const cleanedText = text.replace(/[^0-9]/g, "").slice(0, 8);
                setPhone(cleanedText);
              }}
              keyboardType="phone-pad"
              maxLength={8}
              autoFocus
            />
            <View style={styles.buttonRow}>
              <Pressable
                onPress={() => {
                  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                  if (!phone.trim()) {
                    setErrorMessage("Por favor ingresa tu teléfono");
                    setShowErrorPopup(true);
                    setTimeout(() => setShowErrorPopup(false), 3000);
                    return;
                  }
                  if (phone.length !== 8) {
                    setErrorMessage(
                      "El teléfono debe tener exactamente 8 dígitos",
                    );
                    setShowErrorPopup(true);
                    setTimeout(() => setShowErrorPopup(false), 3000);
                    return;
                  }

                  // Go to code verification with animation
                  Animated.timing(formAnim, {
                    toValue: 0,
                    duration: 200,
                    useNativeDriver: false,
                  }).start(() => {
                    setMode("google_verify_phone");
                    formAnim.setValue(0);
                    Animated.timing(formAnim, {
                      toValue: 1,
                      duration: 300,
                      useNativeDriver: false,
                    }).start();
                  });
                }}
                style={({ pressed }) => [
                  styles.loginButton,
                  {
                    backgroundColor: Colors.light.primary,
                    opacity: pressed ? 0.9 : 1,
                    flex: 1,
                    marginRight: Spacing.sm,
                    height: 50,
                    paddingVertical: 0,
                    alignItems: "center",
                    justifyContent: "center",
                  },
                ]}
              >
                <ThemedText style={styles.loginButtonText}>
                  Siguiente
                </ThemedText>
              </Pressable>
              <Pressable
                onPress={async () => {
                  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                  try {
                    // Use saved Google user data
                    if (!googleUserData) {
                      setErrorMessage(
                        "Error de autenticación. Por favor intenta de nuevo.",
                      );
                      setShowErrorPopup(true);
                      setTimeout(() => setShowErrorPopup(false), 3000);
                      return;
                    }

                    // Create user in Firestore without phone
                    await setDoc(
                      doc(db, "users", googleUserData.uid),
                      {
                        id: googleUserData.uid,
                        email: googleUserData.email,
                        name: googleUserData.displayName,
                        phone: "",
                        createdAt: new Date(),
                        status: "notVerified",
                        isAdmin: false,
                        isVerifiedBroker: false,
                        avatar: "",
                        bank: "",
                        card: "",
                        dpiDocument: {
                          back: "",
                          front: "",
                        },
                        dpiNumber: "",
                      },
                      { merge: true },
                    );

                    console.log("Usuario de Google creado sin teléfono");

                    // Go to main screen
                    setHasAttemptedLogin(true);
                    navigation.replace("Main");
                  } catch (error: any) {
                    console.error("Error al crear usuario:", error);
                    setErrorMessage("Error al crear usuario");
                    setShowErrorPopup(true);
                    setTimeout(() => setShowErrorPopup(false), 3000);
                  }
                }}
                style={({ pressed }) => [
                  styles.skipButton,
                  {
                    opacity: pressed ? 0.7 : 1,
                    flex: 1,
                    marginLeft: Spacing.sm,
                    height: 50,
                    paddingVertical: 0,
                    alignItems: "center",
                    justifyContent: "center",
                    borderColor: "#cccccc",
                  },
                ]}
              >
                <ThemedText
                  style={[
                    styles.skipText,
                    { color: theme.textSecondary, marginTop: 0 },
                  ]}
                >
                  Saltar
                </ThemedText>
              </Pressable>
            </View>
            <Pressable
              onPress={() => {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                // Go back to main buttons
                Animated.timing(formAnim, {
                  toValue: 0,
                  duration: 200,
                  useNativeDriver: false,
                }).start(() => {
                  setMode("buttons");
                  setIsFromGoogle(false);
                  formAnim.setValue(0);
                  Animated.timing(buttonsAnim, {
                    toValue: 1,
                    duration: 300,
                    useNativeDriver: false,
                  }).start();
                });
              }}
              style={({ pressed }) => [
                styles.backButton,
                { opacity: pressed ? 0.7 : 1 },
              ]}
            >
              <Feather
                name="arrow-left"
                size={20}
                color={theme.textSecondary}
              />
              <ThemedText
                style={[styles.backButtonText, { color: theme.textSecondary }]}
              >
                Volver
              </ThemedText>
            </Pressable>
          </Animated.View>
        ) : mode === "google_verify_phone" ? (
          <Animated.View
            style={[
              styles.registerContainer,
              {
                opacity: formAnim,
                transform: [
                  {
                    translateY: formAnim.interpolate({
                      inputRange: [0, 1],
                      outputRange: [50, 0],
                    }),
                  },
                ],
              },
            ]}
          >
            <ThemedText style={[styles.registerTitle, { color: theme.text }]}>
              Verifica tu teléfono
            </ThemedText>
            <View style={styles.codeContainer}>
              {verificationCode.map((digit, index) => {
                const borderColor = codeColors[index].interpolate({
                  inputRange: [0, 1],
                  outputRange: ["#cccccc", Colors.light.primary],
                });

                return (
                  <Animated.View
                    key={index}
                    style={[styles.codeSlotWrapper, { borderColor }]}
                  >
                    <TextInput
                      ref={(ref) => {
                        codeInputRefs.current[index] = ref;
                      }}
                      style={[styles.codeSlot, { color: theme.text }]}
                      value={digit}
                      onChangeText={(text) => {
                        if (text.length <= 1 && /^[0-9]*$/.test(text)) {
                          const newCode = [...verificationCode];
                          newCode[index] = text;
                          setVerificationCode(newCode);

                          if (text) {
                            Animated.timing(codeColors[index], {
                              toValue: 1,
                              duration: 200,
                              useNativeDriver: false,
                            }).start();

                            // Auto-focus next input
                            if (index < 5) {
                              setTimeout(() => {
                                codeInputRefs.current[index + 1]?.focus();
                              }, 10);
                            }
                          } else {
                            Animated.timing(codeColors[index], {
                              toValue: 0,
                              duration: 200,
                              useNativeDriver: false,
                            }).start();
                          }
                        }
                      }}
                      onKeyPress={(e: any) => {
                        if (
                          e.nativeEvent.key === "Backspace" &&
                          !digit &&
                          index > 0
                        ) {
                          setTimeout(() => {
                            codeInputRefs.current[index - 1]?.focus();
                          }, 10);
                        }
                      }}
                      keyboardType="number-pad"
                      maxLength={1}
                      autoFocus={index === 0}
                    />
                  </Animated.View>
                );
              })}
            </View>
            <Pressable
              onPress={async () => {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                const code = verificationCode.join("");
                if (code.length !== 6) {
                  setErrorMessage("Por favor ingresa el código completo");
                  setShowErrorPopup(true);
                  setTimeout(() => setShowErrorPopup(false), 3000);
                  return;
                }

                try {
                  // Use saved Google user data
                  if (!googleUserData) {
                    console.log("Error: Datos de Google no disponibles");
                    setErrorMessage(
                      "Error de autenticación. Por favor intenta de nuevo.",
                    );
                    setShowErrorPopup(true);
                    setTimeout(() => setShowErrorPopup(false), 3000);
                    return;
                  }

                  // Save phone and code in Firestore for Google user
                  await setDoc(
                    doc(db, "users", googleUserData.uid),
                    {
                      id: googleUserData.uid,
                      email: googleUserData.email,
                      name: googleUserData.displayName,
                      phone: `+502${phone}`,
                      createdAt: new Date(),
                      status: "Verified",
                      isAdmin: false,
                      isVerifiedBroker: false,
                      avatar: "",
                      bank: "",
                      card: "",
                      dpiDocument: {
                        back: "",
                        front: "",
                      },
                      dpiNumber: "",
                    },
                    { merge: true },
                  );

                  console.log(
                    "Teléfono y código guardados para usuario de Google",
                  );

                  // Go to main screen
                  setHasAttemptedLogin(true);
                  navigation.replace("Main");
                } catch (error: any) {
                  console.error("Error al guardar datos:", error);
                  setErrorMessage("Error al guardar datos");
                  setShowErrorPopup(true);
                  setTimeout(() => setShowErrorPopup(false), 3000);
                }
              }}
              style={({ pressed }) => [
                styles.loginButton,
                {
                  backgroundColor: Colors.light.primary,
                  opacity: pressed ? 0.9 : 1,
                  marginTop: Spacing.xl,
                },
              ]}
            >
              <ThemedText style={styles.loginButtonText}>Siguiente</ThemedText>
            </Pressable>
            <Pressable
              onPress={() => {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                Animated.timing(formAnim, {
                  toValue: 0,
                  duration: 200,
                  useNativeDriver: false,
                }).start(() => {
                  setMode("google_phone");
                  formAnim.setValue(0);
                  Animated.timing(formAnim, {
                    toValue: 1,
                    duration: 300,
                    useNativeDriver: false,
                  }).start();
                });
              }}
              style={({ pressed }) => [
                styles.backButton,
                { opacity: pressed ? 0.7 : 1 },
              ]}
            >
              <Feather
                name="arrow-left"
                size={20}
                color={theme.textSecondary}
              />
              <ThemedText
                style={[styles.backButtonText, { color: theme.textSecondary }]}
              >
                Volver
              </ThemedText>
            </Pressable>
          </Animated.View>
        ) : null}

        <ThemedText style={[styles.termsText, { color: theme.textSecondary }]}>
          By continuing, you agree to our{" "}
          <ThemedText
            style={[styles.linkText, { color: Colors.light.primary }]}
          >
            Terms of Service
          </ThemedText>{" "}
          and{" "}
          <ThemedText
            style={[styles.linkText, { color: Colors.light.primary }]}
          >
            Privacy Policy
          </ThemedText>
        </ThemedText>
      </ScrollView>

      {showErrorPopup && (
        <Animated.View
          style={[
            styles.errorPopup,
            {
              top: insets.top + 20,
              transform: [{ translateX: errorSlideAnim }],
            },
          ]}
        >
          <View style={styles.errorPopupContent}>
            <FontAwesome name="exclamation-circle" size={20} color="#FFFFFF" />
            <ThemedText style={styles.errorPopupText}>
              {errorMessage}
            </ThemedText>
          </View>
        </Animated.View>
      )}
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: Spacing.xl,
    paddingBottom: Spacing["2xl"],
  },
  logoContainer: {
    alignItems: "center",
    marginBottom: Spacing["3xl"],
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
    marginBottom: Spacing["2xl"],
  },
  buttonContainer: {
    gap: Spacing.md,
  },
  formContainer: {
    gap: Spacing.md,
  },
  registerContainer: {
    gap: Spacing.md,
  },
  buttonRow: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  registerTitle: {
    fontSize: 18,
    fontWeight: "600",
    textAlign: "center",
    marginBottom: Spacing.md,
  },
  input: {
    borderWidth: 1,
    borderRadius: BorderRadius.sm,
    padding: Spacing.md,
    fontSize: 16,
    minHeight: 50,
  },
  passwordContainer: {
    position: "relative",
  },
  passwordInput: {
    paddingRight: 50,
  },
  eyeButton: {
    position: "absolute",
    right: 15,
    top: 15,
    padding: 5,
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
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
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
  errorPopup: {
    position: "absolute",
    top: 20,
    right: 20,
    zIndex: 1000,
  },
  errorPopupContent: {
    backgroundColor: "#DC2626",
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
    borderRadius: BorderRadius.md,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
    minWidth: 250,
  },
  errorPopupText: {
    color: "#FFFFFF",
    fontSize: 14,
    fontWeight: "500",
    marginLeft: Spacing.sm,
    flex: 1,
  },
  codeContainer: {
    flexDirection: "row",
    justifyContent: "center",
    gap: Spacing.sm,
    marginTop: Spacing.xl,
    marginBottom: Spacing.lg,
  },
  codeSlotWrapper: {
    borderWidth: 2,
    borderRadius: BorderRadius.md,
    backgroundColor: "#FFFFFF",
  },
  codeSlot: {
    width: 45,
    height: 55,
    fontSize: 24,
    fontWeight: "600",
    textAlign: "center",
    padding: 0,
  },
});
