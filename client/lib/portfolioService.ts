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
    console.log('Portfolio service - adding property for user:', userId);
    if (!userId) {
      console.error('No user ID provided');
      return false;
    }

    const portfolioRef = doc(db, 'portfolios', userId);
    const portfolioSnap = await getDoc(portfolioRef);

    if (!portfolioSnap.exists()) {
      await setDoc(portfolioRef, {
        createdAt: Timestamp.now(),
      });
    }

    const propertiesRef = collection(db, 'portfolios', userId, 'properties');
    
    const existingQuery = query(
      propertiesRef, 
      where('propertyId', '==', parseInt(propertyId, 10))
    );
    const existingDocs = await getDocs(existingQuery);

    if (!existingDocs.empty) {
      console.log('Property already exists in portfolio');
      return true;
    }

    const propertyData: PortfolioProperty = {
      addedAt: Timestamp.now(),
      propertyId: parseInt(propertyId, 10),
      status: 'inProgress',
      userId: userId,
    };

    await addDoc(propertiesRef, propertyData);
    console.log('Property added to portfolio successfully');
    return true;
  } catch (error) {
    console.error('Error adding property to portfolio:', error);
    return false;
  }
}

export async function removePropertyFromPortfolio(propertyId: string, userId: string): Promise<boolean> {
  try {
    if (!userId) {
      console.error('No user ID provided');
      return false;
    }

    const propertiesRef = collection(db, 'portfolios', userId, 'properties');
    
    const existingQuery = query(
      propertiesRef, 
      where('propertyId', '==', parseInt(propertyId, 10))
    );
    const existingDocs = await getDocs(existingQuery);

    if (existingDocs.empty) {
      console.log('Property not found in portfolio');
      return true;
    }

    for (const docSnapshot of existingDocs.docs) {
      await deleteDoc(docSnapshot.ref);
    }

    console.log('Property removed from portfolio successfully');
    return true;
  } catch (error) {
    console.error('Error removing property from portfolio:', error);
    return false;
  }
}

export async function togglePropertyInPortfolio(propertyId: string, isCurrentlyFavorite: boolean, userId: string): Promise<boolean> {
  if (isCurrentlyFavorite) {
    return await removePropertyFromPortfolio(propertyId, userId);
  } else {
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
