export enum UserStatus {
  NOT_VERIFIED = "notVerified",
  VERIFIED = "Verified",
  BLOCKED = "BLOCKED",
}

export interface FirestoreUser {
  id: string;
  email: string;
  name: string;
  phone: string;
  phoneVerified: boolean;
  createdAt: Date;
  status: UserStatus;
  isAdmin: boolean;
  isVerifiedBroker: boolean;
  avatar: string;
  bankName: string;
  card: string;
  dpiDocument: {
    back: string;
    front: string;
  };
  dpiNumber: string;
}
