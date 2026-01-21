import { signInWithEmailAndPassword, GoogleAuthProvider, FacebookAuthProvider, signInWithCredential, signInWithRedirect, getRedirectResult } from 'firebase/auth';
import { auth } from './config';
import { getDocumentById, setDocument, getUserByEmail } from './firestore';
import { COLLECTIONS } from './collections';
import { FirestoreUser, UserStatus } from './user.interface';
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

export const loginWithGoogle = async (): Promise<{ user: FirestoreUser; isNewUser: boolean }> => {
  try {
    const provider = new GoogleAuthProvider();
    
    if (Platform.OS === 'web') {
      // Web implementation using Firebase popup
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
      // Mobile implementation using Firebase redirect (works without native modules)
      const { signInWithRedirect } = await import('firebase/auth');
      await signInWithRedirect(auth, provider);
      
      // Esta función retornará después de la redirección
      // Por ahora lanzamos un error para indicar que se necesita configuración
      throw new Error('Google Sign-In en móvil está en proceso. Por favor usa el registro con email.');
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