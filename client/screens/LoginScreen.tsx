import React, { useState, useEffect, useRef } from "react";
import { View, StyleSheet, Pressable, Image, TextInput, Alert, Animated, ScrollView } from "react-native";
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
import { getAuth, fetchSignInMethodsForEmail, createUserWithEmailAndPassword } from 'firebase/auth';
import { doc, setDoc } from 'firebase/firestore';
import { db } from '@/lib/config';

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

export default function LoginScreen() {
  const navigation = useNavigation<NavigationProp>();
  const insets = useSafeAreaInsets();
  const { theme, isDark } = useTheme();
  const { login, isLoading, user, logout, loginGoogle, loginFacebook } = useAuth();
  const [mode, setMode] = useState<'buttons' | 'login' | 'register' | 'register_username' | 'register_phone' | 'verify_phone' | 'google_phone' | 'google_verify_phone'>('buttons');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [username, setUsername] = useState('');
  const [phone, setPhone] = useState('');
  const [isFromGoogle, setIsFromGoogle] = useState(false);
  const [googleUserData, setGoogleUserData] = useState<{ uid: string; email: string; displayName: string } | null>(null);
  const [verificationCode, setVerificationCode] = useState(['', '', '', '', '', '']);
  const [codeColors] = useState([new Animated.Value(0), new Animated.Value(0), new Animated.Value(0), new Animated.Value(0), new Animated.Value(0), new Animated.Value(0)]);
  const codeInputRefs = useRef<(TextInput | null)[]>([null, null, null, null, null, null]);
  const [hasAttemptedLogin, setHasAttemptedLogin] = useState(false);
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
    if (mode === 'login' || mode === 'register' || mode === 'register_username' || mode === 'register_phone' || mode === 'verify_phone' || mode === 'google_phone' || mode === 'google_verify_phone') {
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
        setTimeout(() => setShowErrorPopup(false), 3000);
      } else {
        Alert.alert('Error de inicio de sesión', errorMessage);
      }
    }
  };

  const handleEmailLogin = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    Animated.timing(buttonsAnim, {
      toValue: 0,
      duration: 200,
      useNativeDriver: false,
    }).start(() => {
      setMode('login');
    });
  };

  const handleRegister = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    Animated.timing(formAnim, {
      toValue: 0,
      duration: 200,
      useNativeDriver: false,
    }).start(() => {
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
      
      // Verify in Firebase Auth
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
      // Email doesn't exist, proceed to next step
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
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    Animated.timing(formAnim, {
      toValue: 0,
      duration: 200,
      useNativeDriver: false,
    }).start(() => {
      setMode('buttons');
    });
  };

  return (
    <ThemedView style={styles.container}>
      <ScrollView 
        contentContainerStyle={[styles.scrollContent, { paddingTop: insets.top + Spacing["2xl"] }]}
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
            Hecha por vendedores, para vendedores
          </ThemedText>
        </View>

        {mode === 'buttons' ? (
          <Animated.View 
            style={[
              styles.buttonContainer,
              { 
                opacity: buttonsAnim,
                transform: [{ 
                  translateY: buttonsAnim.interpolate({
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
              <Feather name="mail" size={20} color="#FFFFFF" />
              <ThemedText style={styles.loginButtonText}>
                Continue with Email
              </ThemedText>
            </Pressable>

            <Pressable
              onPress={async () => {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                try {
                  const isNewUser = await loginGoogle();
                  console.log('Login Google completado, isNewUser:', isNewUser);
                  
                  // Save Google user data immediately
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
                    // New user, show phone screen
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
                    // Existing user, go to Main
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

            <Pressable
              onPress={async () => {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
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
            >
              <FontAwesome name="facebook" size={20} color="#FFFFFF" />
              <ThemedText style={styles.loginButtonText}>
                Continue with Facebook
              </ThemedText>
            </Pressable>
            <Pressable
              onPress={() => {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                Alert.alert('Continuar como invitado', 'Funcionalidad próximamente');
              }}
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
                  translateY: formAnim.interpolate({
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
                  translateY: formAnim.interpolate({
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
              placeholder="Usuario"
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
              <ThemedText style={styles.loginButtonText}>
                Siguiente
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
                  translateY: formAnim.interpolate({
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
              onChangeText={setPhone}
              keyboardType="phone-pad"
              autoFocus
            />
            <View style={styles.buttonRow}>
              <Pressable
                onPress={() => {
                  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                  if (!phone.trim()) {
                    setErrorMessage('Por favor ingresa tu teléfono');
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
                onPress={() => {
                  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                  // No functionality for now
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
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
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
                  translateY: formAnim.interpolate({
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
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                const code = verificationCode.join('');
                if (code.length !== 6) {
                  setErrorMessage('Por favor ingresa el código completo');
                  setShowErrorPopup(true);
                  setTimeout(() => setShowErrorPopup(false), 3000);
                  return;
                }
                
                try {
                  // Create user in Firebase Auth
                  const auth = getAuth();
                  const tempPassword = `Temp${Date.now()}!`; // Temporary password
                  await createUserWithEmailAndPassword(auth, email, tempPassword);
                  
                  console.log('Usuario creado en Auth, iniciando sesión...');
                  
                  // Login to establish session correctly
                  await login(email, tempPassword);
                  
                  // Now get authenticated user
                  const currentUser = auth.currentUser;
                  if (!currentUser) {
                    throw new Error('No se pudo autenticar el usuario');
                  }
                  
                  console.log('Usuario autenticado:', currentUser.uid);
                  
                  // Wait a bit to ensure session is fully established
                  await new Promise(resolve => setTimeout(resolve, 1000));
                  
                  // Save additional data in Firestore with merge
                  await setDoc(doc(db, 'users', currentUser.uid), {
                    email: email,
                    username: username,
                    phone: phone,
                    createdAt: new Date().toISOString(),
                    verificationCode: code,
                  }, { merge: true });
                  
                  console.log('Datos guardados en Firestore correctamente');
                  
                  // Redirect to main page
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
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
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
                  translateY: formAnim.interpolate({
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
              onChangeText={setPhone}
              keyboardType="phone-pad"
              autoFocus
            />
            <View style={styles.buttonRow}>
              <Pressable
                onPress={() => {
                  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                  if (!phone.trim()) {
                    setErrorMessage('Por favor ingresa tu teléfono');
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
                  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                  try {
                    // Use saved Google user data
                    if (!googleUserData) {
                      setErrorMessage('Error de autenticación. Por favor intenta de nuevo.');
                      setShowErrorPopup(true);
                      setTimeout(() => setShowErrorPopup(false), 3000);
                      return;
                    }
                    
                    // Create user in Firestore without phone
                    await setDoc(doc(db, 'users', googleUserData.uid), {
                      email: googleUserData.email,
                      name: googleUserData.displayName,
                      phone: '',
                      createdAt: new Date().toISOString(),
                      provider: 'google',
                    }, { merge: true });
                    
                    console.log('Usuario de Google creado sin teléfono');
                    
                    // Go to main screen
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
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                // Go back to main buttons
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
                  translateY: formAnim.interpolate({
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
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                const code = verificationCode.join('');
                if (code.length !== 6) {
                  setErrorMessage('Por favor ingresa el código completo');
                  setShowErrorPopup(true);
                  setTimeout(() => setShowErrorPopup(false), 3000);
                  return;
                }
                
                try {
                  // Use saved Google user data
                  if (!googleUserData) {
                    console.log('Error: Datos de Google no disponibles');
                    setErrorMessage('Error de autenticación. Por favor intenta de nuevo.');
                    setShowErrorPopup(true);
                    setTimeout(() => setShowErrorPopup(false), 3000);
                    return;
                  }
                  
                  // Save phone and code in Firestore for Google user
                  await setDoc(doc(db, 'users', googleUserData.uid), {
                    email: googleUserData.email,
                    name: googleUserData.displayName,
                    phone: phone,
                    verificationCode: code,
                    createdAt: new Date().toISOString(),
                    provider: 'google',
                  }, { merge: true });
                  
                  console.log('Teléfono y código guardados para usuario de Google');
                  
                  // Go to main screen
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
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
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
          By continuing, you agree to our{" "}
          <ThemedText style={[styles.linkText, { color: Colors.light.primary }]}>
            Terms of Service
          </ThemedText>{" "}
          and{" "}
          <ThemedText style={[styles.linkText, { color: Colors.light.primary }]}>
            Privacy Policy
          </ThemedText>
        </ThemedText>
      </ScrollView>

      {showErrorPopup && (
        <View style={[styles.errorPopup, { top: insets.top + 20 }]}>
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
    flexDirection: 'row',
    justifyContent: 'space-between',
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
  errorPopup: {
    position: 'absolute',
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
  codeContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: Spacing.sm,
    marginTop: Spacing.xl,
    marginBottom: Spacing.lg,
  },
  codeSlotWrapper: {
    borderWidth: 2,
    borderRadius: BorderRadius.md,
    backgroundColor: '#FFFFFF',
  },
  codeSlot: {
    width: 45,
    height: 55,
    fontSize: 24,
    fontWeight: '600',
    textAlign: 'center',
    padding: 0,
  },
});
