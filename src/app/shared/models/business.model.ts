export interface Business {
  id: string;
  shortId: string;
  name: string;
  description?: string;
  tagLine?: string;
  logo?: string;
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
  ownerId: string;
  user?: any;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  deletedAt?: string;
}

export interface CreateBusinessDto {
  ownerId: string;
  categories: string[];
  name: string;
  email?: string;
  phone?: string;
  description?: string;
  tagLine?: string;
  logo?: string;
  city?: string;
  state?: string;
  country?: string;
  address?: string;
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