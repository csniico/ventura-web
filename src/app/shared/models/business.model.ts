export interface DayHours {
  open: string;
  close: string;
}

export type BusinessHours = Record<string, DayHours>;

export interface Business {
  id: string;
  shortId: string;
  name: string;
  description?: string;
  tagLine?: string;
  logo?: string;
  logoKey?: string;
  email?: string;
  phone?: string;
  website?: string;
  address?: string;
  city?: string;
  state?: string;
  country?: string;
  taxId?: string;
  registrationNumber?: string;
  categories: string[];
  socials?: Record<string, string>;
  businessHours?: BusinessHours;
  ownerId: string;
  user?: any;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  deletedAt?: string;
}

/**
 * Fields accepted when creating/updating a business. The backend's POST only
 * accepts { name, categories }; everything else is applied via PATCH. The
 * BusinessService handles that split, so callers can pass the full object.
 * `ownerId` is derived from the bearer token server-side (kept optional here
 * for backward compatibility with existing callers).
 */
export interface CreateBusinessDto {
  ownerId?: string;
  categories: string[];
  name: string;
  email?: string;
  phone?: string;
  website?: string;
  description?: string;
  tagLine?: string;
  logo?: string;
  logoKey?: string;
  city?: string;
  state?: string;
  country?: string;
  address?: string;
  taxId?: string;
  registrationNumber?: string;
  socials?: Record<string, string>;
  businessHours?: BusinessHours;
}

export interface BusinessStep {
  id: number;
  title: string;
  description: string;
  isCompleted: boolean;
  isActive: boolean;
}

export const BUSINESS_CATEGORIES = [
  'Food & Beverage',
  'Retail & Shopping',
  'Health & Wellness',
  'Beauty & Personal Care',
  'Technology',
  'Education',
  'Professional Services',
  'Home & Garden',
  'Automotive',
  'Entertainment',
  'Travel & Tourism',
  'Real Estate',
  'Finance & Insurance',
  'Construction',
  'Manufacturing',
  'Other'
] as const;