import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { onAuthStateChanged, User, signOut } from 'firebase/auth';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { auth } from '../lib/config';
import { loginUser, loginWithGoogle, loginWithFacebook } from '../lib/auth';
import { FirestoreUser, UserStatus } from '../lib/user.interface';
import { pagesConfig } from '../lib/pagesConfig';
import { RootStackParamList } from '../navigation/RootStackNavigator';

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

interface AuthContextType {
  user: FirestoreUser | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  loginGoogle: () => Promise<void>;
  loginFacebook: () => Promise<void>;
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
      // DISABLE auto-login completely - only handle explicit login attempts
      if (firebaseUser) {
        console.log('Firebase user detected, but ignoring auto-login');
      }
      // Always set user to null unless explicitly logged in
      queryClient.setQueryData(['user'], null);
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
      navigation.navigate('Main' as any);
    } catch (error) {
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const loginGoogle = async () => {
    setIsLoading(true);
    try {
      const userData = await loginWithGoogle();
      
      if (userData.status === UserStatus.BLOCKED) {
        await logout();
        throw new Error('User is blocked');
      }
      queryClient.setQueryData(['user'], userData);
      navigation.navigate('Main' as any);
    } catch (error) {
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const loginFacebook = async () => {
    setIsLoading(true);
    try {
      const userData = await loginWithFacebook();
      
      if (userData.status === UserStatus.BLOCKED) {
        await logout();
        throw new Error('User is blocked');
      }
      queryClient.setQueryData(['user'], userData);
      navigation.navigate('Main' as any);
    } catch (error) {
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    await signOut(auth);
    queryClient.setQueryData(['user'], null);
  };

  return (
    <AuthContext.Provider value={{ user, isLoading, login, loginGoogle, loginFacebook, logout }}>
      {children}
    </AuthContext.Provider>
  );
};