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
import { Ionicons, FontAwesome, Feather } from "@expo/vector-icons";

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

// Read login options from environment variables
const isGoogleLoginEnabled = process.env.EXPO_PUBLIC_GOOGLE_LOGIN_ENABLED !== 'false';
const isFacebookLoginEnabled = process.env.EXPO_PUBLIC_FACEBOOK_LOGIN_ENABLED !== 'false';
const isDevEnv = process.env.EXPO_PUBLIC_DEV_ENV === 'true';
const devUser = process.env.EXPO_PUBLIC_DEV_ENV_USER;
const devPsw = process.env.EXPO_PUBLIC_DEV_ENV_PSW;

export default function LoginScreenWeb() {
  const navigation = useNavigation<NavigationProp>();
  const { theme, isDark } = useTheme();
  const { login, isLoading, user, logout, loginGoogle, loginFacebook, loginAsGuest } = useAuth();
  const { width: windowWidth } = useWindowDimensions();
  const isMobile = windowWidth < 768;
  const [currentPage, setCurrentPage] = useState(0);
  const [mode, setMode] = useState<'buttons' | 'login' | 'register' | 'register_password' | 'register_username' | 'register_phone' | 'verify_phone' | 'google_phone' | 'google_verify_phone'>('buttons');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [username, setUsername] = useState('');
  const [phone, setPhone] = useState('');
  const [isFromGoogle, setIsFromGoogle] = useState(false);
  const [googleUserData, setGoogleUserData] = useState<{ uid: string; email: string; displayName: string } | null>(null);
  const [verificationCode, setVerificationCode] = useState(['', '', '', '', '', '']);
  const [codeColors] = useState([new Animated.Value(0), new Animated.Value(0), new Animated.Value(0), new Animated.Value(0), new Animated.Value(0), new Animated.Value(0)]);
  const codeInputRefs = useRef<(TextInput | null)[]>([null, null, null, null, null, null]);
  const [hasAttemptedLogin, setHasAttemptedLogin] = useState(false);
  const fadeAnim = useRef(new Animated.Value(1)).current;
  const [formAnim] = useState(new Animated.Value(0));
  const [buttonsAnim] = useState(new Animated.Value(1));
  const [errorMessage, setErrorMessage] = useState('');
  const [showErrorPopup, setShowErrorPopup] = useState(false);
  const errorSlideAnim = useRef(new Animated.Value(300)).current;

  // Clear old profile data on mount (but NOT logout - that would clear valid sessions)
  useEffect(() => {
    const clearOldData = async () => {
      const { clearUserProfile } = await import('@/lib/storage');
      await clearUserProfile();
      // REMOVED: await logout(); - This was incorrectly clearing valid Firebase sessions
    };
    clearOldData();
  }, []);

  useEffect(() => {
    if (user && hasAttemptedLogin) {
      navigation.replace('Main');
    }
  }, [user, navigation, hasAttemptedLogin]);

  // Animate error popup
  useEffect(() => {
    if (showErrorPopup) {
      Animated.spring(errorSlideAnim, {
        toValue: 0,
        toValue: 0,
        useNativeDriver: false,
        tension: 65,
        friction: 8,
      }).start();
    } else {
      Animated.timing(errorSlideAnim, {
        toValue: 300,
        duration: 200,
        toValue: 300,
        duration: 200,
        useNativeDriver: false,
      }).start();
    }
  }, [showErrorPopup]);

  useEffect(() => {
    if (mode === 'login' || mode === 'register' || mode === 'register_password' || mode === 'register_username' || mode === 'register_phone' || mode === 'verify_phone' || mode === 'google_phone' || mode === 'google_verify_phone') {
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
        errorMessage = 'Credenciales incorrectas';
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

  const handleDevLogin = async () => {
    if (!devUser || !devPsw) {
      Alert.alert('Configuration Error', 'DEV_ENV_USER or DEV_ENV_PSW not set in .env');
      return;
    }

    setHasAttemptedLogin(true);

    try {
      await login(devUser, devPsw);
    } catch (error: any) {
      Alert.alert('Dev Login Error', error.message);
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

      // También verificar en Firestore
      const usersRef = collection(db, 'users');
      const q = query(usersRef, where('email', '==', email));
      const querySnapshot = await getDocs(q);

      if (!querySnapshot.empty) {
        console.log('Email ya existe en Firestore');
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
        setMode('register_password');
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

  const handlePasswordNext = async () => {
    if (!password.trim()) {
      setErrorMessage('Por favor ingresa una contraseña');
      setShowErrorPopup(true);
      setTimeout(() => setShowErrorPopup(false), 3000);
      return;
    }

    if (password.length < 6) {
      setErrorMessage('La contraseña debe tener al menos 6 caracteres');
      setShowErrorPopup(true);
      setTimeout(() => setShowErrorPopup(false), 3000);
      return;
    }

    if (password !== confirmPassword) {
      setErrorMessage('Las contraseñas no coinciden');
      setShowErrorPopup(true);
      setTimeout(() => setShowErrorPopup(false), 3000);
      return;
    }

    // Solo validar, no crear usuario todavía
    console.log('Contraseña validada, procediendo a username');
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
  };

  const handleUsernameNext = async () => {
    if (!username.trim()) {
      setErrorMessage('Por favor ingresa un usuario');
      setShowErrorPopup(true);
      setTimeout(() => setShowErrorPopup(false), 3000);
      return;
    }

    console.log('Username ingresado:', username);
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
    // Limpiar todos los estados del formulario
    setEmail('');
    setPassword('');
    setConfirmPassword('');
    setUsername('');
    setPhone('');
    setVerificationCode(['', '', '', '', '', '']);

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
      {isDevEnv && (
        <Pressable
          style={({ pressed }) => ({
            position: 'fixed',
            top: 10,
            right: 20,
            zIndex: 99999,
            backgroundColor: '#FF0000',
            paddingHorizontal: 12,
            paddingVertical: 6,
            borderRadius: 8,
            boxShadow: '0px 2px 3.84px rgba(0, 0, 0, 0.25)', // Web standard shadow
            elevation: 5,
            cursor: 'pointer',
            opacity: pressed ? 0.8 : 1,
          } as any)}
          onPress={handleDevLogin}
        >
          <ThemedText style={{ color: 'white', fontWeight: 'bold', fontSize: 12 }}>DEV</ThemedText>
        </Pressable>
      )}
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

                {isGoogleLoginEnabled ? (
                  <Pressable
                    onPress={async () => {
                      try {
                        const isNewUser = await loginGoogle();
                        console.log('Login Google completado, isNewUser:', isNewUser);

                        // Guardar datos del usuario de Google inmediatamente
                        const auth = getAuth();
                        const currentUser = auth.currentUser;
                        if (currentUser) {
                          setGoogleUserData({
                            uid: currentUser.uid,
                            email: currentUser.email || '',
                            displayName: currentUser.displayName || ''
                          });
                        }

                        if (isNewUser) {
                          // Usuario nuevo, mostrar pantalla de teléfono
                          setIsFromGoogle(true);
                          Animated.timing(buttonsAnim, {
                            toValue: 0,
                            duration: 200,
                            useNativeDriver: false,
                          }).start(() => {
                            setMode('google_phone');
                            formAnim.setValue(0);
                            Animated.timing(formAnim, {
                              toValue: 1,
                              duration: 300,
                              useNativeDriver: false,
                            }).start();
                          });
                        } else {
                          // Usuario existente, ir a Main
                          setHasAttemptedLogin(true);
                          navigation.replace('Main');
                        }
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
                  >
                    <FontAwesome name="google" size={20} color="#DB4437" />
                    <ThemedText style={[styles.socialButtonText, { color: theme.text }]}>
                      Continue with Google
                    </ThemedText>
                  </Pressable>
                ) : null}

                {isFacebookLoginEnabled ? (
                  <Pressable
                    onPress={async () => {
                      try {
                        const isNewUser = await loginFacebook();
                        console.log('Login Facebook completado, isNewUser:', isNewUser);

                        // Guardar datos del usuario de Facebook inmediatamente
                        const auth = getAuth();
                        const currentUser = auth.currentUser;
                        if (currentUser) {
                          setGoogleUserData({
                            uid: currentUser.uid,
                            email: currentUser.email || '',
                            displayName: currentUser.displayName || ''
                          });
                        }

                        if (isNewUser) {
                          // Usuario nuevo, mostrar pantalla de teléfono
                          setIsFromGoogle(true);
                          Animated.timing(buttonsAnim, {
                            toValue: 0,
                            duration: 200,
                            useNativeDriver: false,
                          }).start(() => {
                            setMode('google_phone');
                            formAnim.setValue(0);
                            Animated.timing(formAnim, {
                              toValue: 1,
                              duration: 300,
                              useNativeDriver: false,
                            }).start();
                          });
                        } else {
                          // Usuario existente, ir a Main
                          setHasAttemptedLogin(true);
                          navigation.replace('Main');
                        }
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
                  >
                    <FontAwesome name="facebook" size={20} color="#FFFFFF" />
                    <ThemedText style={styles.loginButtonText}>
                      Continue with Facebook
                    </ThemedText>
                  </Pressable>
                ) : null}

                <Pressable
                  onPress={() => {
                    Animated.timing(buttonsAnim, {
                      toValue: 0,
                      duration: 200,
                      useNativeDriver: false,
                    }).start(() => {
                      setMode('register');
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
                  <Feather name="user-plus" size={20} color={Colors.light.primary} />
                  <ThemedText style={[styles.socialButtonText, { color: Colors.light.primary }]}>
                    Crear cuenta
                  </ThemedText>
                </Pressable>

                <Pressable
                  onPress={() => loginAsGuest()}
                  style={({ pressed }) => [
                    styles.skipButton,
                    { opacity: pressed ? 0.7 : 1, borderWidth: 0 },
                  ]}
                >
                  <ThemedText style={[styles.skipText, { color: theme.textSecondary }]}>
                    Continue as Guest
                  </ThemedText>
                </Pressable>
              </Animated.View>
            ) : mode === 'login' ? (
              <Animated.View
                style={[
                  styles.formContainer,
                  {
                    opacity: formAnim,
                    transform: [{
                      translateX: formAnim.interpolate({
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
                >
                  <ThemedText style={styles.loginButtonText}>
                    {isLoading ? 'Iniciando sesión...' : 'Iniciar Sesión'}
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
                    <Feather name="arrow-left" size={20} color={theme.textSecondary} />
                    <ThemedText style={[styles.backButtonText, { color: theme.textSecondary }]}>
                      Volver
                    </ThemedText>
                  </Pressable>
                  <Pressable
                    onPress={handleRegister}
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
            ) : mode === 'register' ? (
              <Animated.View
                style={[
                  styles.registerContainer,
                  {
                    opacity: formAnim,
                    transform: [{
                      translateX: formAnim.interpolate({
                        inputRange: [0, 1],
                        outputRange: [50, 0]
                      })
                    }]
                  }
                ]}
              >
                <ThemedText style={[styles.registerTitle, { color: theme.text }]}>
                  Ingresa tu email
                </ThemedText>
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
                <Pressable
                  onPress={handleRegisterNext}
                  style={({ pressed }) => [
                    styles.loginButton,
                    {
                      backgroundColor: Colors.light.primary,
                      opacity: pressed ? 0.9 : 1,
                    },
                  ]}
                >
                  <ThemedText style={styles.loginButtonText}>
                    Siguiente
                  </ThemedText>
                </Pressable>
                <Pressable
                  onPress={handleBack}
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
              </Animated.View>
            ) : mode === 'register_password' ? (
              <Animated.View
                style={[
                  styles.registerContainer,
                  {
                    opacity: formAnim,
                    transform: [{
                      translateX: formAnim.interpolate({
                        inputRange: [0, 1],
                        outputRange: [50, 0]
                      })
                    }]
                  }
                ]}
              >
                <ThemedText style={[styles.registerTitle, { color: theme.text }]}>
                  Ingrese su contraseña
                </ThemedText>
                <View style={styles.passwordContainer}>
                  <TextInput
                    style={[styles.input, styles.passwordInput, {
                      borderColor: theme.border,
                      color: theme.text,
                      backgroundColor: theme.backgroundDefault
                    }]}
                    placeholder="Contraseña"
                    placeholderTextColor={theme.textSecondary}
                    value={password}
                    onChangeText={setPassword}
                    secureTextEntry={!showPassword}
                    autoFocus
                  />
                  <Pressable
                    onPress={() => setShowPassword(!showPassword)}
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
                    style={[styles.input, styles.passwordInput, {
                      borderColor: theme.border,
                      color: theme.text,
                      backgroundColor: theme.backgroundDefault
                    }]}
                    placeholder="Repetir Contraseña"
                    placeholderTextColor={theme.textSecondary}
                    value={confirmPassword}
                    onChangeText={setConfirmPassword}
                    secureTextEntry={!showConfirmPassword}
                  />
                  <Pressable
                    onPress={() => setShowConfirmPassword(!showConfirmPassword)}
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
                  onPress={handlePasswordNext}
                  style={({ pressed }) => [
                    styles.loginButton,
                    {
                      backgroundColor: Colors.light.primary,
                      opacity: pressed ? 0.9 : 1,
                    },
                  ]}
                >
                  <ThemedText style={styles.loginButtonText}>
                    Siguiente
                  </ThemedText>
                </Pressable>
                <Pressable
                  onPress={handleBack}
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
              </Animated.View>
            ) : mode === 'register_username' ? (
              <Animated.View
                style={[
                  styles.registerContainer,
                  {
                    opacity: formAnim,
                    transform: [{
                      translateX: formAnim.interpolate({
                        inputRange: [0, 1],
                        outputRange: [50, 0]
                      })
                    }]
                  }
                ]}
              >
                <ThemedText style={[styles.registerTitle, { color: theme.text }]}>
                  Ingresa tu nombre
                </ThemedText>
                <TextInput
                  style={[styles.input, {
                    borderColor: theme.border,
                    color: theme.text,
                    backgroundColor: theme.backgroundDefault
                  }]}
                  placeholder="Nombre"
                  placeholderTextColor={theme.textSecondary}
                  value={username}
                  onChangeText={setUsername}
                  autoCapitalize="none"
                  autoFocus
                />
                <Pressable
                  onPress={handleUsernameNext}
                  style={({ pressed }) => [
                    styles.loginButton,
                    {
                      backgroundColor: Colors.light.primary,
                      opacity: pressed ? 0.9 : 1,
                    },
                  ]}
                >
                  <ThemedText style={styles.loginButtonText}>
                    Siguiente
                  </ThemedText>
                </Pressable>
                <Pressable
                  onPress={() => {
                    Animated.timing(formAnim, {
                      toValue: 0,
                      duration: 200,
                      useNativeDriver: false,
                    }).start(() => {
                      setMode('register');
                    });
                  }}
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
              </Animated.View>
            ) : mode === 'register_phone' ? (
              <Animated.View
                style={[
                  styles.registerContainer,
                  {
                    opacity: formAnim,
                    transform: [{
                      translateX: formAnim.interpolate({
                        inputRange: [0, 1],
                        outputRange: [50, 0]
                      })
                    }]
                  }
                ]}
              >
                <ThemedText style={[styles.registerTitle, { color: theme.text }]}>
                  Ingresa tu teléfono
                </ThemedText>
                <TextInput
                  style={[styles.input, {
                    borderColor: theme.border,
                    color: theme.text,
                    backgroundColor: theme.backgroundDefault
                  }]}
                  placeholder="Teléfono"
                  placeholderTextColor={theme.textSecondary}
                  value={phone}
                  onChangeText={(text) => {
                    // Solo permitir números y máximo 8 dígitos
                    const cleanedText = text.replace(/[^0-9]/g, '').slice(0, 8);
                    setPhone(cleanedText);
                  }}
                  keyboardType="phone-pad"
                  maxLength={8}
                  autoFocus
                />
                <View style={styles.buttonRow}>
                  <Pressable
                    onPress={async () => {
                      try {
                        // Crear usuario en Firebase Auth
                        const auth = getAuth();
                        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
                        console.log('Usuario creado en Firebase Auth (sin teléfono):', userCredential.user.uid);

                        // Guardar en Firestore sin teléfono
                        await setDoc(doc(db, 'users', userCredential.user.uid), {
                          id: userCredential.user.uid,
                          email: email,
                          name: username,
                          phone: '',
                          createdAt: new Date(),
                          status: 'notVerified',
                          isAdmin: false,
                          isVerifiedBroker: false,
                          avatar: '',
                          bank: '',
                          card: '',
                          dpiDocument: {
                            back: '',
                            front: ''
                          },
                          dpiNumber: ''
                        });

                        console.log('Usuario creado sin teléfono');

                        // Ir a la pantalla principal
                        setHasAttemptedLogin(true);
                        navigation.replace('Main');
                      } catch (error: any) {
                        console.error('Error al crear usuario:', error);
                        let errorMessage = 'Error al crear cuenta';

                        if (error.code === 'auth/email-already-in-use') {
                          errorMessage = 'Este email ya está en uso';
                        } else if (error.code === 'auth/invalid-email') {
                          errorMessage = 'Email inválido';
                        } else if (error.code === 'auth/weak-password') {
                          errorMessage = 'La contraseña es muy débil';
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
                        alignItems: 'center',
                        justifyContent: 'center',
                        borderColor: '#cccccc',
                      },
                    ]}
                  >
                    <ThemedText style={[styles.skipText, { color: theme.textSecondary, marginTop: 0 }]}>
                      Saltar
                    </ThemedText>
                  </Pressable>
                  <Pressable
                    onPress={async () => {
                      if (!phone.trim()) {
                        setErrorMessage('Por favor ingresa tu teléfono');
                        setShowErrorPopup(true);
                        setTimeout(() => setShowErrorPopup(false), 3000);
                        return;
                      }
                      if (phone.length !== 8) {
                        setErrorMessage('El teléfono debe tener exactamente 8 dígitos');
                        setShowErrorPopup(true);
                        setTimeout(() => setShowErrorPopup(false), 3000);
                        return;
                      }

                      console.log('📱 Enviando código de verificación al número:', `+502${phone}`);

                      try {
                        // Enviar código de verificación por WhatsApp
                        const API_URL = process.env.EXPO_PUBLIC_API_URL || 'http://localhost:5000';
                        const response = await fetch(`${API_URL}/api/auth/send-verification`, {
                          method: 'POST',
                          headers: {
                            'Content-Type': 'application/json',
                          },
                          body: JSON.stringify({ phoneNumber: `+502${phone}` }),
                        });

                        const result = await response.json();
                        console.log('📨 Respuesta del servidor:', result);

                        if (!result.success) {
                          setErrorMessage(result.message || 'Error al enviar código');
                          setShowErrorPopup(true);
                          setTimeout(() => setShowErrorPopup(false), 3000);
                          return;
                        }

                        console.log('✅ Código enviado exitosamente');
                      } catch (error) {
                        console.error('❌ Error al enviar código:', error);
                        setErrorMessage('Error de conexión. Verifica tu internet.');
                        setShowErrorPopup(true);
                        setTimeout(() => setShowErrorPopup(false), 3000);
                        return;
                      }

                      Animated.timing(formAnim, {
                        toValue: 0,
                        duration: 200,
                        useNativeDriver: false,
                      }).start(() => {
                        setMode('verify_phone');
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
                        alignItems: 'center',
                        justifyContent: 'center',
                      },
                    ]}
                  >
                    <ThemedText style={styles.loginButtonText}>
                      Siguiente
                    </ThemedText>
                  </Pressable>
                </View>
                <Pressable
                  onPress={() => {
                    Animated.timing(formAnim, {
                      toValue: 0,
                      duration: 200,
                      useNativeDriver: false,
                    }).start(() => {
                      setMode('register_username');
                    });
                  }}
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
              </Animated.View>
            ) : mode === 'verify_phone' ? (
              <Animated.View
                style={[
                  styles.registerContainer,
                  {
                    opacity: formAnim,
                    transform: [{
                      translateX: formAnim.interpolate({
                        inputRange: [0, 1],
                        outputRange: [50, 0]
                      })
                    }]
                  }
                ]}
              >
                <ThemedText style={[styles.registerTitle, { color: theme.text }]}>
                  Verifica tu teléfono
                </ThemedText>
                <View style={styles.codeContainer}>
                  {verificationCode.map((digit, index) => {
                    const borderColor = codeColors[index].interpolate({
                      inputRange: [0, 1],
                      outputRange: ['#cccccc', Colors.light.primary]
                    });

                    return (
                      <Animated.View key={index} style={[styles.codeSlotWrapper, { borderColor }]}>
                        <TextInput
                          ref={(ref) => { codeInputRefs.current[index] = ref; }}
                          style={[styles.codeSlot, { color: theme.text, outlineStyle: 'none' } as any]}
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
                            if (e.nativeEvent.key === 'Backspace' && !digit && index > 0) {
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
                    const code = verificationCode.join('');
                    if (code.length !== 6) {
                      setErrorMessage('Por favor ingresa el código completo');
                      setShowErrorPopup(true);
                      setTimeout(() => setShowErrorPopup(false), 3000);
                      return;
                    }

                    try {
                      // Verificar el código con el servidor
                      console.log('🔍 Verificando código:', code);
                      const API_URL = process.env.EXPO_PUBLIC_API_URL || 'http://localhost:5000';
                      const verifyResponse = await fetch(`${API_URL}/api/auth/verify-code`, {
                        method: 'POST',
                        headers: {
                          'Content-Type': 'application/json',
                        },
                        body: JSON.stringify({
                          phoneNumber: `+502${phone}`,
                          code: code
                        }),
                      });

                      const verifyResult = await verifyResponse.json();
                      console.log('📨 Resultado de verificación:', verifyResult);

                      if (!verifyResult.success) {
                        setErrorMessage(verifyResult.message || 'Código incorrecto');
                        setShowErrorPopup(true);
                        setTimeout(() => setShowErrorPopup(false), 3000);
                        return;
                      }

                      console.log('✅ Código verificado correctamente');

                      // Crear usuario en Firebase Auth
                      const auth = getAuth();
                      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
                      console.log('Usuario creado en Firebase Auth:', userCredential.user.uid);

                      // Guardar datos completos en Firestore
                      await setDoc(doc(db, 'users', userCredential.user.uid), {
                        id: userCredential.user.uid,
                        email: email,
                        name: username,
                        phone: `+502${phone}`,
                        createdAt: new Date(),
                        status: 'Verified',
                        isAdmin: false,
                        isVerifiedBroker: false,
                        avatar: '',
                        bank: '',
                        card: '',
                        dpiDocument: {
                          back: '',
                          front: ''
                        },
                        dpiNumber: ''
                      });

                      console.log('Datos guardados en Firestore correctamente');

                      // Redirigir a la página principal
                      setHasAttemptedLogin(true);
                      navigation.replace('Main');
                    } catch (error: any) {
                      console.error('Error al crear usuario:', error);
                      let errorMsg = 'Error al crear la cuenta';
                      if (error.code === 'auth/email-already-in-use') {
                        errorMsg = 'Este email ya está relacionado a una cuenta';
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
                  <ThemedText style={styles.loginButtonText}>
                    Siguiente
                  </ThemedText>
                </Pressable>
                <Pressable
                  onPress={() => {
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
                  }}
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
              </Animated.View>
            ) : mode === 'google_phone' ? (
              <Animated.View
                style={[
                  styles.registerContainer,
                  {
                    opacity: formAnim,
                    transform: [{
                      translateX: formAnim.interpolate({
                        inputRange: [0, 1],
                        outputRange: [50, 0]
                      })
                    }]
                  }
                ]}
              >
                <ThemedText style={[styles.registerTitle, { color: theme.text }]}>
                  Ingresa tu teléfono
                </ThemedText>
                <TextInput
                  style={[styles.input, {
                    borderColor: theme.border,
                    color: theme.text,
                    backgroundColor: theme.backgroundDefault
                  }]}
                  placeholder="Teléfono"
                  placeholderTextColor={theme.textSecondary}
                  value={phone}
                  onChangeText={(text) => {
                    // Solo permitir números y máximo 8 dígitos
                    const cleanedText = text.replace(/[^0-9]/g, '').slice(0, 8);
                    setPhone(cleanedText);
                  }}
                  keyboardType="phone-pad"
                  maxLength={8}
                  autoFocus
                />
                <View style={styles.buttonRow}>
                  <Pressable
                    onPress={async () => {
                      if (!phone.trim()) {
                        setErrorMessage('Por favor ingresa tu teléfono');
                        setShowErrorPopup(true);
                        setTimeout(() => setShowErrorPopup(false), 3000);
                        return;
                      }
                      if (phone.length !== 8) {
                        setErrorMessage('El teléfono debe tener exactamente 8 dígitos');
                        setShowErrorPopup(true);
                        setTimeout(() => setShowErrorPopup(false), 3000);
                        return;
                      }

                      // Ir a verificación de código con animación
                      Animated.timing(formAnim, {
                        toValue: 0,
                        duration: 200,
                        useNativeDriver: false,
                      }).start(() => {
                        setMode('google_verify_phone');
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
                        alignItems: 'center',
                        justifyContent: 'center',
                      },
                    ]}
                  >
                    <ThemedText style={styles.loginButtonText}>
                      Siguiente
                    </ThemedText>
                  </Pressable>
                  <Pressable
                    onPress={async () => {
                      try {
                        // Usar los datos guardados del usuario de Google
                        if (!googleUserData) {
                          setErrorMessage('Error de autenticación. Por favor intenta de nuevo.');
                          setShowErrorPopup(true);
                          setTimeout(() => setShowErrorPopup(false), 3000);
                          return;
                        }

                        // Crear usuario en Firestore sin teléfono
                        await setDoc(doc(db, 'users', googleUserData.uid), {
                          id: googleUserData.uid,
                          email: googleUserData.email,
                          name: googleUserData.displayName,
                          phone: '',
                          createdAt: new Date(),
                          status: 'notVerified',
                          isAdmin: false,
                          isVerifiedBroker: false,
                          avatar: '',
                          bank: '',
                          card: '',
                          dpiDocument: {
                            back: '',
                            front: ''
                          },
                          dpiNumber: ''
                        }, { merge: true });

                        console.log('Usuario de Google creado sin teléfono');

                        // Ir a la pantalla principal
                        setHasAttemptedLogin(true);
                        navigation.replace('Main');
                      } catch (error: any) {
                        console.error('Error al crear usuario:', error);
                        setErrorMessage('Error al crear usuario');
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
                        alignItems: 'center',
                        justifyContent: 'center',
                        borderColor: '#cccccc',
                      },
                    ]}
                  >
                    <ThemedText style={[styles.skipText, { color: theme.textSecondary, marginTop: 0 }]}>
                      Saltar
                    </ThemedText>
                  </Pressable>
                </View>
                <Pressable
                  onPress={() => {
                    // Volver a los botones principales
                    Animated.timing(formAnim, {
                      toValue: 0,
                      duration: 200,
                      useNativeDriver: false,
                    }).start(() => {
                      setMode('buttons');
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
                  <Feather name="arrow-left" size={20} color={theme.textSecondary} />
                  <ThemedText style={[styles.backButtonText, { color: theme.textSecondary }]}>
                    Volver
                  </ThemedText>
                </Pressable>
              </Animated.View>
            ) : mode === 'google_verify_phone' ? (
              <Animated.View
                style={[
                  styles.registerContainer,
                  {
                    opacity: formAnim,
                    transform: [{
                      translateX: formAnim.interpolate({
                        inputRange: [0, 1],
                        outputRange: [50, 0]
                      })
                    }]
                  }
                ]}
              >
                <ThemedText style={[styles.registerTitle, { color: theme.text }]}>
                  Verifica tu teléfono
                </ThemedText>
                <View style={styles.codeContainer}>
                  {verificationCode.map((digit, index) => {
                    const borderColor = codeColors[index].interpolate({
                      inputRange: [0, 1],
                      outputRange: ['#cccccc', Colors.light.primary]
                    });

                    return (
                      <Animated.View key={index} style={[styles.codeSlotWrapper, { borderColor }]}>
                        <TextInput
                          ref={(ref) => { codeInputRefs.current[index] = ref; }}
                          style={[styles.codeSlot, { color: theme.text, outlineStyle: 'none' } as any]}
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
                            if (e.nativeEvent.key === 'Backspace' && !digit && index > 0) {
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
                    const code = verificationCode.join('');
                    if (code.length !== 6) {
                      setErrorMessage('Por favor ingresa el código completo');
                      setShowErrorPopup(true);
                      setTimeout(() => setShowErrorPopup(false), 3000);
                      return;
                    }

                    try {
                      // Usar los datos guardados del usuario de Google
                      if (!googleUserData) {
                        console.log('Error: Datos de Google no disponibles');
                        setErrorMessage('Error de autenticación. Por favor intenta de nuevo.');
                        setShowErrorPopup(true);
                        setTimeout(() => setShowErrorPopup(false), 3000);
                        return;
                      }

                      // Guardar teléfono y código en Firestore para usuario de Google
                      await setDoc(doc(db, 'users', googleUserData.uid), {
                        id: googleUserData.uid,
                        email: googleUserData.email,
                        name: googleUserData.displayName,
                        phone: `+502${phone}`,
                        createdAt: new Date(),
                        status: 'Verified',
                        isAdmin: false,
                        isVerifiedBroker: false,
                        avatar: '',
                        bank: '',
                        card: '',
                        dpiDocument: {
                          back: '',
                          front: ''
                        },
                        dpiNumber: ''
                      }, { merge: true });

                      console.log('Teléfono y código guardados para usuario de Google');

                      // Ir a la pantalla principal
                      setHasAttemptedLogin(true);
                      navigation.replace('Main');
                    } catch (error: any) {
                      console.error('Error al guardar datos:', error);
                      setErrorMessage('Error al guardar datos');
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
                  <ThemedText style={styles.loginButtonText}>
                    Siguiente
                  </ThemedText>
                </Pressable>
                <Pressable
                  onPress={() => {
                    Animated.timing(formAnim, {
                      toValue: 0,
                      duration: 200,
                      useNativeDriver: false,
                    }).start(() => {
                      setMode('google_phone');
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
                  <Feather name="arrow-left" size={20} color={theme.textSecondary} />
                  <ThemedText style={[styles.backButtonText, { color: theme.textSecondary }]}>
                    Volver
                  </ThemedText>
                </Pressable>
              </Animated.View>
            ) : null}

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
        <Animated.View
          style={[
            styles.errorPopup,
            { transform: [{ translateX: errorSlideAnim }] }
          ]}
        >
          <View style={styles.errorPopupContent}>
            <FontAwesome name="exclamation-circle" size={20} color="#FFFFFF" />
            <ThemedText style={styles.errorPopupText}>{errorMessage}</ThemedText>
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
  passwordContainer: {
    position: 'relative',
  },
  passwordInput: {
    paddingRight: 50,
  },
  eyeButton: {
    position: 'absolute',
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
  splitContainerMobile: {
    flexDirection: "column",
  },
  rightPanelMobile: {
    padding: Spacing.lg,
  },
  codeContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: Spacing.sm,
    marginVertical: Spacing.xl,
  },
  codeSlotWrapper: {
    width: 50,
    height: 60,
    borderWidth: 2,
    borderRadius: BorderRadius.sm,
    justifyContent: 'center',
    alignItems: 'center',
  },
  codeSlot: {
    fontSize: 24,
    fontWeight: '600',
    textAlign: 'center',
    width: '100%',
  },
  errorPopup: {
    position: 'absolute',
    top: 20,
    right: 20,
    zIndex: 1000,
  },
  errorPopupContent: {
    backgroundColor: '#DC2626',
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
    minWidth: 250,
  },
  errorPopupText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '500',
    marginLeft: Spacing.sm,
    flex: 1,
  },
});
