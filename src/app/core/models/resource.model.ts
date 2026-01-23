export interface Product {
  id: string;
  shortId?: string;
  name: string;
  primaryImage?: string;
  supportingImages?: string[];
  availableQuantity: number;
  businessId: string;
  description?: string;
  notes?: string;
  price: number;
  createdAt: string;
  updatedAt: string;
  deletedAt?: string;
}

export interface Service {
  id: string;
  shortId?: string;
  name: string;
  primaryImage?: string;
  supportingImages?: string[];
  businessId: string;
  description?: string;
  notes?: string;
  price: number;
  businessHours?: Record<string, any>;
  createdAt: string;
  updatedAt: string;
  deletedAt?: string;
}

export type Resource = Product | Service;

export interface CreateProductDto {
  businessId: string;
  name: string;
  primaryImage?: string;
  supportingImages?: string[];
  availableQuantity?: number;
  description?: string;
  notes?: string;
  price?: number;
}

export interface CreateServiceDto {
  businessId: string;
  name: string;
  primaryImage?: string;
  supportingImages?: string[];
  description?: string;
  notes?: string;
  price?: number;
  businessHours?: Record<string, any>;
}

export interface UpdateProductDto {
  name?: string;
  primaryImage?: string;
  supportingImages?: string[];
  availableQuantity?: number;
  description?: string;
  notes?: string;
  price?: number;
}

export interface UpdateServiceDto {
  name?: string;
  primaryImage?: string;
  supportingImages?: string[];
  description?: string;
  notes?: string;
  price?: number;
  businessHours?: Record<string, any>;
}

export interface ResourceSearchParams {
  businessId: string;
  q?: string;
  filters?: 'on' | 'off';
  minPrice?: number;
  maxPrice?: number;
  minQty?: number;
  page?: number;
  limit?: number;
}

export interface ResourceSearchResponse {
  products?: Product[];
  services?: Service[];
}
