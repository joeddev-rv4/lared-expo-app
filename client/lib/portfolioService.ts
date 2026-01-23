import { 
  doc, 
  getDoc, 
  setDoc, 
  collection, 
  addDoc, 
  query, 
  where, 
  getDocs,
  deleteDoc,
  Timestamp 
} from 'firebase/firestore';
import { db } from './config';

interface PortfolioProperty {
  addedAt: Timestamp;
  propertyId: number;
  status: string;
  userId: string;
}

export async function addPropertyToPortfolio(propertyId: string, userId: string): Promise<boolean> {
  try {
    console.log('Portfolio service - adding property:', propertyId, 'for user:', userId);

    if (!userId || userId.trim() === '') {
      console.error('No user ID provided or empty');
      return false;
    }

    if (!propertyId || propertyId.trim() === '') {
      console.error('No property ID provided or empty');
      return false;
    }

    const parsedPropertyId = parseInt(propertyId, 10);
    if (isNaN(parsedPropertyId)) {
      console.error('Invalid property ID:', propertyId);
      return false;
    }

    console.log('Creating/checking portfolio document for user:', userId);
    const portfolioRef = doc(db, 'portfolios', userId);
    const portfolioSnap = await getDoc(portfolioRef);

    if (!portfolioSnap.exists()) {
      console.log('Creating new portfolio for user:', userId);
      await setDoc(portfolioRef, {
        createdAt: Timestamp.now(),
        userId: userId,
      });
    }

    const propertiesRef = collection(db, 'portfolios', userId, 'properties');

    console.log('Checking if property already exists:', parsedPropertyId);
    const existingQuery = query(
      propertiesRef,
      where('propertyId', '==', parsedPropertyId)
    );
    const existingDocs = await getDocs(existingQuery);

    if (!existingDocs.empty) {
      console.log('Property already exists in portfolio, skipping add');
      return true;
    }

    const propertyData: PortfolioProperty = {
      addedAt: Timestamp.now(),
      propertyId: parsedPropertyId,
      status: 'inProgress',
      userId: userId,
    };

    console.log('Adding property to Firebase:', propertyData);
    const docRef = await addDoc(propertiesRef, propertyData);
    console.log('Property added successfully with ID:', docRef.id);
    return true;
  } catch (error: any) {
    console.error('Error adding property to portfolio:', error);
    console.error('Error code:', error?.code);
    console.error('Error message:', error?.message);
    return false;
  }
}

export async function removePropertyFromPortfolio(propertyId: string, userId: string): Promise<boolean> {
  try {
    console.log('Portfolio service - removing property:', propertyId, 'for user:', userId);

    if (!userId || userId.trim() === '') {
      console.error('No user ID provided or empty');
      return false;
    }

    if (!propertyId || propertyId.trim() === '') {
      console.error('No property ID provided or empty');
      return false;
    }

    const parsedPropertyId = parseInt(propertyId, 10);
    if (isNaN(parsedPropertyId)) {
      console.error('Invalid property ID:', propertyId);
      return false;
    }

    const propertiesRef = collection(db, 'portfolios', userId, 'properties');

    console.log('Searching for property to remove:', parsedPropertyId);
    const existingQuery = query(
      propertiesRef,
      where('propertyId', '==', parsedPropertyId)
    );
    const existingDocs = await getDocs(existingQuery);

    if (existingDocs.empty) {
      console.log('Property not found in portfolio, nothing to remove');
      return true;
    }

    console.log('Found', existingDocs.docs.length, 'documents to delete');
    for (const docSnapshot of existingDocs.docs) {
      console.log('Deleting document:', docSnapshot.id);
      await deleteDoc(docSnapshot.ref);
    }

    console.log('Property removed from portfolio successfully');
    return true;
  } catch (error: any) {
    console.error('Error removing property from portfolio:', error);
    console.error('Error code:', error?.code);
    console.error('Error message:', error?.message);
    return false;
  }
}

export async function togglePropertyInPortfolio(propertyId: string, isCurrentlyFavorite: boolean, userId: string): Promise<boolean> {
  console.log('Toggle property in portfolio:', { propertyId, isCurrentlyFavorite, userId });

  if (!userId) {
    console.error('togglePropertyInPortfolio: No user ID provided');
    return false;
  }

  if (isCurrentlyFavorite) {
    console.log('Property is currently favorite, removing from portfolio...');
    return await removePropertyFromPortfolio(propertyId, userId);
  } else {
    console.log('Property is not favorite, adding to portfolio...');
    return await addPropertyToPortfolio(propertyId, userId);
  }
}

export async function getPortfolioProperties(userId: string): Promise<number[]> {
  try {
    if (!userId) {
      return [];
    }

    const propertiesRef = collection(db, 'portfolios', userId, 'properties');
    const snapshot = await getDocs(propertiesRef);
    
    return snapshot.docs.map(doc => doc.data().propertyId);
  } catch (error) {
    console.error('Error getting portfolio properties:', error);
    return [];
  }
}

export interface UserProfile {
  name: string;
  email: string;
  phone: string;
  photoURL?: string;
}

export async function getUserProfileFromFirebase(userId: string): Promise<UserProfile | null> {
  try {
    if (!userId) {
      return null;
    }

    const userRef = doc(db, 'users', userId);
    const userSnap = await getDoc(userRef);

    if (userSnap.exists()) {
      const data = userSnap.data();
      return {
        name: data.name || data.displayName || 'Agente Inmobiliario',
        email: data.email || '',
        phone: data.phone || data.phoneNumber || '',
        photoURL: data.photoURL || data.avatar,
      };
    }

    return null;
  } catch (error) {
    console.error('Error getting user profile from Firebase:', error);
    return null;
  }
}
