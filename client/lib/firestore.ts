import {
  doc,
  getDoc,
  setDoc,
  collection,
  query,
  where,
  getDocs,
} from "firebase/firestore";
import { db } from "./config";

export const getDocumentById = async <T>(
  collection: string,
  id: string,
): Promise<T | null> => {
  const docRef = doc(db, collection, id);
  const docSnap = await getDoc(docRef);
  if (docSnap.exists()) {
    return docSnap.data() as T;
  } else {
    return null;
  }
};

export const setDocument = async (
  collection: string,
  id: string,
  data: any,
): Promise<void> => {
  const docRef = doc(db, collection, id);
  await setDoc(docRef, data);
};

export const getUserByEmail = async <T>(email: string): Promise<T | null> => {
  const usersRef = collection(db, "users");
  const q = query(usersRef, where("email", "==", email));
  const querySnapshot = await getDocs(q);

  if (!querySnapshot.empty) {
    const doc = querySnapshot.docs[0];
    return { id: doc.id, ...doc.data() } as T;
  }

  return null;
};
