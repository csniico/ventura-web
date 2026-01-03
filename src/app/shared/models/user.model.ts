export interface User {
  id: string;
  shortId: string;
  firstName: string;
  lastName?: string;
  email: string;
  googleId?: string;
  avatarUrl?: string;
  businessId?: string;
  isSystem: boolean;
  isActive: boolean;
  isEmailVerified: boolean;
  createdAt: Date;
  updatedAt: Date;
  deletedAt?: Date;
}