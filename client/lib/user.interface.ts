export enum UserStatus {
  NOT_VERIFIED = 'NOT_VERIFIED',
  VERIFIED = 'VERIFIED',
  BLOCKED = 'BLOCKED',
}

export interface FirestoreUser {
  id: string;
  email: string;
  name?: string;
  phone?: string;
  createdAt: Date;
  status: UserStatus;
  isAdmin: boolean;
  isVerifiedBroker: boolean;
  avatar?: string;
  dpiDocument?: string;
  bankName?: string;
  // Add other fields as needed
}