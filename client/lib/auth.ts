import {
  signInWithEmailAndPassword,
  GoogleAuthProvider,
  FacebookAuthProvider,
  signInWithCredential,
  OAuthProvider,
} from "firebase/auth";
import { auth } from "./config";
import { getDocumentById, setDocument, getUserByEmail } from "./firestore";
import { COLLECTIONS } from "./collections";
import { FirestoreUser, UserStatus } from "./user.interface";
import { Platform } from "react-native";

export const loginUser = async (
  email: string,
  password: string,
): Promise<FirestoreUser> => {
  try {
    const userCredential = await signInWithEmailAndPassword(
      auth,
      email,
      password,
    );

    const user = userCredential.user;
    let userData = await getUserData(user.uid);

    if (!userData) {
      // Create new user document if not exists
      const newUser: FirestoreUser = {
        id: user.uid,
        email: user.email!,
        name: "",
        phone: "",
        createdAt: new Date(),
        status: UserStatus.NOT_VERIFIED,
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
        phoneVerified: false,
      };
      await setDocument(COLLECTIONS.USERS, user.uid, newUser);
      userData = newUser;
    }

    return userData;
  } catch (error) {
    throw error;
  }
};

export const getUserData = async (
  userId: string,
): Promise<FirestoreUser | null> => {
  return await getDocumentById<FirestoreUser>(COLLECTIONS.USERS, userId);
};

export const loginWithGoogle = async (): Promise<{
  user: FirestoreUser;
  isNewUser: boolean;
}> => {
  try {
    const provider = new GoogleAuthProvider();
    provider.setCustomParameters({
      prompt: "select_account",
    });

    let userCredential;

    if (Platform.OS === "web") {
      // Web implementation usando popup
      const { signInWithPopup } = await import("firebase/auth");
      userCredential = await signInWithPopup(auth, provider);
    } else {
      // Mobile implementation usando Google Auth nativa de Expo
      const { makeRedirectUri } = await import("expo-auth-session");
      const { openAuthSessionAsync } = await import("expo-web-browser");

      const redirectUri = makeRedirectUri({
        scheme: "propertyhub",
        path: "auth",
      });

      const clientId = process.env.EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID;

      if (!clientId) {
        throw new Error("Google Client ID no configurado");
      }

      // Construir URL de OAuth de Google
      const authUrl = `https://accounts.google.com/o/oauth2/v2/auth?${new URLSearchParams(
        {
          client_id: clientId,
          redirect_uri: redirectUri,
          response_type: "id_token",
          scope: "openid profile email",
          nonce: Math.random().toString(36).substring(7),
        },
      )}`;

      // Abrir navegador para autenticación
      const result = await openAuthSessionAsync(authUrl, redirectUri);

      if (result.type !== "success") {
        throw new Error("Autenticación cancelada");
      }

      // Extraer el id_token de la URL
      const url = result.url;
      const idToken = url.match(/id_token=([^&]+)/)?.[1];

      if (!idToken) {
        throw new Error("No se pudo obtener el token de Google");
      }

      // Crear credencial de Firebase con el token
      const credential = GoogleAuthProvider.credential(idToken);
      userCredential = await signInWithCredential(auth, credential);
    }

    const user = userCredential.user;

    // Buscar usuario por email
    const userData = await getUserByEmail<FirestoreUser>(user.email!);

    if (!userData) {
      // Usuario nuevo - crear perfil básico
      const newUser: FirestoreUser = {
        id: user.uid,
        email: user.email!,
        name: user.displayName || "",
        phone: "",
        createdAt: new Date(),
        status: UserStatus.NOT_VERIFIED,
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
        phoneVerified: false,
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
  } catch (error: any) {
    console.error("Google login error:", error);

    // Manejar cancelación del usuario
    if (
      error.code === "auth/popup-closed-by-user" ||
      error.code === "auth/cancelled-popup-request" ||
      error.message === "Autenticación cancelada"
    ) {
      throw new Error("Inicio de sesión cancelado");
    }

    // Re-throw the error without wrapping it if it's our custom error
    if (error.message === "Cuenta no existe") {
      throw error;
    }

    throw new Error(`Error al iniciar sesión con Google: ${error.message}`);
  }
};

export const loginWithFacebook = async (): Promise<{
  user: FirestoreUser;
  isNewUser: boolean;
}> => {
  try {
    if (Platform.OS === "web") {
      // Web implementation using Firebase directly
      const provider = new FacebookAuthProvider();
      const { signInWithPopup } = await import("firebase/auth");

      const userCredential = await signInWithPopup(auth, provider);
      const user = userCredential.user;

      // Buscar usuario por email
      const userData = await getUserByEmail<FirestoreUser>(user.email!);

      if (!userData) {
        // Usuario nuevo - crear perfil básico
        const newUser: FirestoreUser = {
          id: user.uid,
          email: user.email!,
          name: user.displayName || "",
          phone: "",
          createdAt: new Date(),
          status: UserStatus.NOT_VERIFIED,
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
          phoneVerified: false,
        };

        // Crear documento básico en Firestore
        await setDocument(COLLECTIONS.USERS, user.uid, newUser);
        return { user: newUser, isNewUser: true };
      }

      // Si el usuario existe pero con un UID diferente, actualizar el documento
      if (userData.id !== user.uid) {
        // Copiar el usuario existente al nuevo UID de Facebook
        const updatedUser = { ...userData, id: user.uid };
        await setDocument(COLLECTIONS.USERS, user.uid, updatedUser);
        return { user: updatedUser, isNewUser: false };
      }

      return { user: userData, isNewUser: false };
    } else {
      // Mobile implementation - Facebook SDK would be needed here
      throw new Error(
        "Facebook login en móvil requiere configuración adicional",
      );
    }
  } catch (error: any) {
    console.error("Facebook login error:", error);

    // Manejar cancelación del usuario
    if (
      error.code === "auth/popup-closed-by-user" ||
      error.code === "auth/cancelled-popup-request"
    ) {
      throw new Error("Inicio de sesión cancelado");
    }

    throw new Error(`Error al iniciar sesión con Facebook: ${error.message}`);
  }
};
