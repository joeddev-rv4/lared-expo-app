export enum UserStatus {
  NOT_VERIFIED = 'notVerified',
  VERIFIED = 'Verified',
  BLOCKED = 'BLOCKED',
}

export interface FirestoreUser {
  id: string;
  email: string;
  name: string;
  phone: string;
  createdAt: Date;
  status: UserStatus;
  isAdmin: boolean;
  isVerifiedBroker: boolean;
  avatar: string;
  bank: string;
  card: string;
  dpiDocument: {
    back: string;
    front: string;
  };
  dpiNumber: string;
}