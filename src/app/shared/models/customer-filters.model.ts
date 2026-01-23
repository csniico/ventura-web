export interface CustomerFilters {
  search: string;
  sortBy: 'name' | 'created' | 'updated';
  sortOrder: 'asc' | 'desc';
}

export interface CustomerSearchParams {
  query?: string;
  businessId: string;
  limit?: number;
  page?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export interface PaginatedCustomerResponse {
  customers: Customer[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface CustomerModalData {
  customer?: Customer;
  mode: 'create' | 'edit';
}

export interface CustomerActionEvent {
  action: 'edit' | 'delete' | 'view';
  customer: Customer;
}

import { Customer } from './customer.model';