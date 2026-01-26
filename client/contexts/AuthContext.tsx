import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { onAuthStateChanged, User, signOut } from 'firebase/auth';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
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
  const [isGuest, setIsGuest] = useState(false);
  const queryClient = useQueryClient();
  const navigation = useNavigation<NavigationProp>();

  const { data: user } = useQuery({
    queryKey: ['user'],
    queryFn: () => null, // Will be set by login
    initialData: null,
    staleTime: Infinity,
  });

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        console.log('Firebase user detected, UID:', firebaseUser.uid);
        await setUserId(firebaseUser.uid);
        console.log('User ID saved to storage');

        // Cargar datos del usuario de Firestore si no están en el contexto
        const currentUser = queryClient.getQueryData(['user']) as FirestoreUser | null;
        if (!currentUser) {
          console.log('Loading user data from Firestore...');
          try {
            const userData = await getUserData(firebaseUser.uid);
            if (userData) {
              console.log('User data loaded from Firestore:', userData.id);
              queryClient.setQueryData(['user'], userData);
            } else {
              console.log('No user data found in Firestore for UID:', firebaseUser.uid);
            }
          } catch (error) {
            console.error('Error loading user data from Firestore:', error);
          }
        }
      } else {
        console.log('No Firebase user, clearing session');
        queryClient.setQueryData(['user'], null);
        await clearUserId();
      }
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
    await signOut(auth);
    await clearUserId();
    setIsGuest(false);
    queryClient.setQueryData(['user'], null);
  };

  return (
    <AuthContext.Provider value={{ user, isLoading, isGuest, login, loginGoogle, loginFacebook, loginAsGuest, logout }}>
      {children}
    </AuthContext.Provider>
  );
};