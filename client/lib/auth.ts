import { signInWithEmailAndPassword, GoogleAuthProvider, FacebookAuthProvider, signInWithCredential } from 'firebase/auth';
import { auth } from './config';
import { getDocumentById, setDocument, getUserByEmail } from './firestore';
import { COLLECTIONS } from './collections';
import { FirestoreUser, UserStatus } from './user.interface';
import { GoogleSignin } from '@react-native-google-signin/google-signin';
import { Platform } from 'react-native';

export const loginUser = async (email: string, password: string): Promise<FirestoreUser> => {
  const userCredential = await signInWithEmailAndPassword(auth, email, password);
  const user = userCredential.user;

  let userData = await getUserData(user.uid);

  if (!userData) {
    // Create new user document if not exists
    const newUser: FirestoreUser = {
      id: user.uid,
      email: user.email!,
      name: '',
      phone: '',
      createdAt: new Date(),
      status: UserStatus.NOT_VERIFIED,
      isAdmin: false,
      isVerifiedBroker: false,
    };
    await setDocument(COLLECTIONS.USERS, user.uid, newUser);
    userData = newUser;
  }

  return userData;
};

export const getUserData = async (userId: string): Promise<FirestoreUser | null> => {
  return await getDocumentById<FirestoreUser>(COLLECTIONS.USERS, userId);
};

// Configure Google Sign-In
GoogleSignin.configure({
  webClientId: process.env.EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID, // from Firebase project settings
  offlineAccess: false,
});

export const loginWithGoogle = async (): Promise<{ user: FirestoreUser; isNewUser: boolean }> => {
  try {
    if (Platform.OS === 'web') {
      // Web implementation using Firebase directly
      const provider = new GoogleAuthProvider();
      const { signInWithPopup } = await import('firebase/auth');
      
      const userCredential = await signInWithPopup(auth, provider);
      const user = userCredential.user;
      
      // Buscar usuario por email en lugar de por UID
      const userData = await getUserByEmail<FirestoreUser>(user.email!);
      
      if (!userData) {
        // Usuario nuevo - crear perfil básico
        const newUser: FirestoreUser = {
          id: user.uid,
          email: user.email!,
          name: user.displayName || '',
          phone: '',
          createdAt: new Date(),
          status: UserStatus.NOT_VERIFIED,
          isAdmin: false,
          isVerifiedBroker: false,
        };
        
        // Crear documento básico en Firestore
        await setDocument(COLLECTIONS.USERS, user.uid, newUser);
        return { user: newUser, isNewUser: true };
      }
      
      // Si el usuario existe pero con un UID diferente, actualizar el documento
      if (userData.id !== user.uid) {
        // Copiar el usuario existente al nuevo UID de Google
        const updatedUser = { ...userData, id: user.uid };
        await setDocument(COLLECTIONS.USERS, user.uid, updatedUser);
        return { user: updatedUser, isNewUser: false };
      }
      
      return { user: userData, isNewUser: false };
    } else {
      // Mobile implementation using Google Sign-In
      await GoogleSignin.hasPlayServices();
      const userInfo = await GoogleSignin.signIn();
      
      if (!userInfo.data?.idToken) {
        throw new Error('No ID token received from Google Sign-In');
      }
      
      const googleCredential = GoogleAuthProvider.credential(userInfo.data.idToken);
      const userCredential = await signInWithCredential(auth, googleCredential);
      const user = userCredential.user;
      
      // Buscar usuario por email en lugar de por UID
      const userData = await getUserByEmail<FirestoreUser>(user.email!);
      
      if (!userData) {
        // Usuario nuevo - crear perfil básico
        const newUser: FirestoreUser = {
          id: user.uid,
          email: user.email!,
          name: user.displayName || '',
          phone: '',
          createdAt: new Date(),
          status: UserStatus.NOT_VERIFIED,
          isAdmin: false,
          isVerifiedBroker: false,
        };
        
        // Crear documento básico en Firestore
        await setDocument(COLLECTIONS.USERS, user.uid, newUser);
        return { user: newUser, isNewUser: true };
      }
      
      // Si el usuario existe pero con un UID diferente, actualizar el documento
      if (userData.id !== user.uid) {
        // Copiar el usuario existente al nuevo UID de Google
        const updatedUser = { ...userData, id: user.uid };
        await setDocument(COLLECTIONS.USERS, user.uid, updatedUser);
        return { user: updatedUser, isNewUser: false };
      }
      
      return { user: userData, isNewUser: false };
    }
  } catch (error: any) {
    console.error('Google login error:', error);
    // Re-throw the error without wrapping it if it's our custom error
    if (error.message === 'Cuenta no existe') {
      throw error;
    }
    throw new Error(`Error al iniciar sesión con Google: ${error.message}`);
  }
};

export const loginWithFacebook = async (): Promise<FirestoreUser> => {
  try {
    if (Platform.OS === 'web') {
      // Web implementation using Firebase directly
      const provider = new FacebookAuthProvider();
      const { signInWithPopup } = await import('firebase/auth');
      
      const userCredential = await signInWithPopup(auth, provider);
      const user = userCredential.user;
      
      // Buscar usuario por email en lugar de por UID
      const userData = await getUserByEmail<FirestoreUser>(user.email!);
      
      if (!userData) {
        throw new Error('Cuenta no existe');
      }
      
      // Si el usuario existe pero con un UID diferente, actualizar el documento
      if (userData.id !== user.uid) {
        // Copiar el usuario existente al nuevo UID de Facebook
        const updatedUser = { ...userData, id: user.uid };
        await setDocument(COLLECTIONS.USERS, user.uid, updatedUser);
        return updatedUser;
      }
      
      return userData;
    } else {
      // Mobile implementation - Facebook SDK would be needed here
      throw new Error('Facebook login en móvil requiere configuración adicional');
    }
  } catch (error: any) {
    console.error('Facebook login error:', error);
    // Re-throw the error without wrapping it if it's our custom error
    if (error.message === 'Cuenta no existe') {
      throw error;
    }
    throw new Error(`Error al iniciar sesión con Facebook: ${error.message}`);
  }
};