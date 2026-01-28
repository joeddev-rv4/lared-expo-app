import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { onAuthStateChanged, User, signOut } from 'firebase/auth';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';
import { auth } from '../lib/config';
import { loginUser, loginWithGoogle, loginWithFacebook, getUserData } from '../lib/auth';
import { FirestoreUser, UserStatus } from '../lib/user.interface';
import { pagesConfig } from '../lib/pagesConfig';
import { RootStackParamList } from '../navigation/RootStackNavigator';
import { setUserId, clearUserId } from '../lib/storage';

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

interface AuthContextType {
  user: FirestoreUser | null;
  isLoading: boolean;
  isInitializing: boolean;
  isGuest: boolean;
  login: (email: string, password: string) => Promise<void>;
  loginGoogle: () => Promise<boolean>;
  loginFacebook: () => Promise<boolean>;
  loginAsGuest: () => void;

  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [isLoading, setIsLoading] = useState(false);
  const [isInitializing, setIsInitializing] = useState(true);
  const [isGuest, setIsGuest] = useState(false);
  const queryClient = useQueryClient();
  const navigation = useNavigation<NavigationProp>();

  const { data: user } = useQuery({
    queryKey: ['user'],
    queryFn: async () => {
      // Verificar primero si hay una sesión de Firebase activa
      const currentFirebaseUser = auth.currentUser;

      if (!currentFirebaseUser) {
        // No hay sesión de Firebase, limpiar storage por seguridad
        if (Platform.OS === "web") {
          localStorage.removeItem('userData');
          localStorage.removeItem('user_id');
        } else {
          await AsyncStorage.multiRemove(['userData', 'user_id']);
        }
        return null;
      }

      // Intentar cargar desde storage solo si hay sesión de Firebase
      try {
        const storedUser = Platform.OS === "web"
          ? localStorage.getItem('userData')
          : await AsyncStorage.getItem('userData');
        if (storedUser) {
          return JSON.parse(storedUser);
        }
      } catch (error) {
        console.error('Error loading user from storage:', error);
      }
      return null;
    },
    initialData: null,
    staleTime: 0, // No cachear el estado de usuario para evitar falsos positivos al recargar
  });

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        await setUserId(firebaseUser.uid);

        // Cargar datos del usuario de Firestore si no están en el contexto
        const currentUser = queryClient.getQueryData(['user']) as FirestoreUser | null;
        if (!currentUser) {
          try {
            const userData = await getUserData(firebaseUser.uid);
            if (userData) {
              queryClient.setQueryData(['user'], userData);
              // Guardar en storage
              const userString = JSON.stringify(userData);
              if (Platform.OS === "web") {
                localStorage.setItem('userData', userString);
              } else {
                await AsyncStorage.setItem('userData', userString);
              }
            }
          } catch (error) {
            console.error('Error loading user data from Firestore:', error);
          }
        }
      } else {
        queryClient.setQueryData(['user'], null);
        await clearUserId();
        // Limpiar storage
        if (Platform.OS === "web") {
          localStorage.removeItem('userData');
        } else {
          await AsyncStorage.removeItem('userData');
        }
      }
      setIsInitializing(false);
    });

    return () => unsubscribe();
  }, [queryClient]);

  const login = async (email: string, password: string) => {
    setIsLoading(true);
    try {
      const userData = await loginUser(email, password);
      if (userData.status === UserStatus.BLOCKED) {
        await logout();
        throw new Error('User is blocked');
      }
      queryClient.setQueryData(['user'], userData);
      // Guardar en storage
      const userString = JSON.stringify(userData);
      if (Platform.OS === "web") {
        localStorage.setItem('userData', userString);
      } else {
        await AsyncStorage.setItem('userData', userString);
      }
      await setUserId(userData.id);
      navigation.navigate('Main' as any);
    } catch (error) {
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const loginGoogle = async (): Promise<boolean> => {
    setIsLoading(true);
    try {
      const result = await loginWithGoogle();

      if (result.user.status === UserStatus.BLOCKED) {
        await logout();
        throw new Error('User is blocked');
      }

      queryClient.setQueryData(['user'], result.user);
      // Guardar en storage
      const userString = JSON.stringify(result.user);
      if (Platform.OS === "web") {
        localStorage.setItem('userData', userString);
      } else {
        await AsyncStorage.setItem('userData', userString);
      }
      await setUserId(result.user.id);

      return result.isNewUser;
    } catch (error) {
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const loginFacebook = async (): Promise<boolean> => {
    setIsLoading(true);
    try {
      const result = await loginWithFacebook();

      if (result.user.status === UserStatus.BLOCKED) {
        await logout();
        throw new Error('User is blocked');
      }

      queryClient.setQueryData(['user'], result.user);
      // Guardar en storage
      const userString = JSON.stringify(result.user);
      if (Platform.OS === "web") {
        localStorage.setItem('userData', userString);
      } else {
        await AsyncStorage.setItem('userData', userString);
      }
      await setUserId(result.user.id);

      return result.isNewUser;
    } catch (error) {
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const loginAsGuest = () => {
    setIsGuest(true);
    queryClient.setQueryData(['user'], null);
    navigation.navigate('Main' as any);
  };

  const logout = async () => {
    try {
      // Limpiar storage PRIMERO antes de signOut
      if (Platform.OS === "web") {
        localStorage.removeItem('userData');
        // Limpiar cualquier otro dato de sesión
        localStorage.removeItem('onboardingComplete');
      } else {
        await AsyncStorage.removeItem('userData');
        await AsyncStorage.removeItem('onboardingComplete');
      }

      // Limpiar userId
      await clearUserId();

      // Limpiar estado local
      setIsGuest(false);

      // Limpiar cache de react-query completamente
      queryClient.setQueryData(['user'], null);
      queryClient.invalidateQueries({ queryKey: ['user'] });
      queryClient.clear();

      // Finalmente cerrar sesión de Firebase
      await signOut(auth);
    } catch (error) {
      console.error('Error during logout:', error);
      // Aún así intentar limpiar todo
      queryClient.setQueryData(['user'], null);
      queryClient.clear();
    }
  };

  return (
    <AuthContext.Provider value={{ user, isLoading, isInitializing, isGuest, login, loginGoogle, loginFacebook, loginAsGuest, logout }}>
      {children}
    </AuthContext.Provider>
  );
};