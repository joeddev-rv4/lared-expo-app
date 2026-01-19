import AsyncStorage from "@react-native-async-storage/async-storage";
import { Property } from "@/data/properties";

const STORAGE_KEYS = {
  ONBOARDING_COMPLETE: "onboarding_complete",
  FAVORITES: "favorites",
  USER_PROFILE: "user_profile",
  LISTINGS: "user_listings",
};

export async function hasCompletedOnboarding(): Promise<boolean> {
  try {
    const value = await AsyncStorage.getItem(STORAGE_KEYS.ONBOARDING_COMPLETE);
    return value === "true";
  } catch {
    return false;
  }
}

export async function setOnboardingComplete(): Promise<void> {
  try {
    await AsyncStorage.setItem(STORAGE_KEYS.ONBOARDING_COMPLETE, "true");
  } catch (error) {
    console.error("Error saving onboarding status:", error);
  }
}

export async function getFavorites(): Promise<string[]> {
  try {
    const value = await AsyncStorage.getItem(STORAGE_KEYS.FAVORITES);
    return value ? JSON.parse(value) : [];
  } catch {
    return [];
  }
}

export async function toggleFavorite(propertyId: string): Promise<string[]> {
  try {
    const favorites = await getFavorites();
    const index = favorites.indexOf(propertyId);
    if (index > -1) {
      favorites.splice(index, 1);
    } else {
      favorites.push(propertyId);
    }
    await AsyncStorage.setItem(STORAGE_KEYS.FAVORITES, JSON.stringify(favorites));
    return favorites;
  } catch (error) {
    console.error("Error toggling favorite:", error);
    return [];
  }
}

export interface UserProfile {
  name: string;
  email: string;
  avatarUrl?: string;
  isLoggedIn: boolean;
  loginMethod?: "email" | "google" | "apple";
}

export async function getUserProfile(): Promise<UserProfile | null> {
  try {
    const value = await AsyncStorage.getItem(STORAGE_KEYS.USER_PROFILE);
    return value ? JSON.parse(value) : null;
  } catch {
    return null;
  }
}

export async function setUserProfile(profile: UserProfile): Promise<void> {
  try {
    await AsyncStorage.setItem(STORAGE_KEYS.USER_PROFILE, JSON.stringify(profile));
  } catch (error) {
    console.error("Error saving user profile:", error);
  }
}

export async function clearUserProfile(): Promise<void> {
  try {
    await AsyncStorage.removeItem(STORAGE_KEYS.USER_PROFILE);
  } catch (error) {
    console.error("Error clearing user profile:", error);
  }
}

export interface UserListing {
  id: string;
  title: string;
  location: string;
  price: number;
  description: string;
  propertyType: string;
  bedrooms: number;
  bathrooms: number;
  guests: number;
  createdAt: string;
}

export async function getUserListings(): Promise<UserListing[]> {
  try {
    const value = await AsyncStorage.getItem(STORAGE_KEYS.LISTINGS);
    return value ? JSON.parse(value) : [];
  } catch {
    return [];
  }
}

export async function addUserListing(listing: Omit<UserListing, "id" | "createdAt">): Promise<UserListing> {
  try {
    const listings = await getUserListings();
    const newListing: UserListing = {
      ...listing,
      id: Date.now().toString(),
      createdAt: new Date().toISOString(),
    };
    listings.push(newListing);
    await AsyncStorage.setItem(STORAGE_KEYS.LISTINGS, JSON.stringify(listings));
    return newListing;
  } catch (error) {
    console.error("Error adding listing:", error);
    throw error;
  }
}

export async function clearAllData(): Promise<void> {
  try {
    await AsyncStorage.multiRemove(Object.values(STORAGE_KEYS));
  } catch (error) {
    console.error("Error clearing data:", error);
  }
}
