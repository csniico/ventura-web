// Generic API Response Types
export interface ApiResponse<T = any> {
  data: T;
  message?: string;
  success: boolean;
}

export interface ApiError {
  message: string;
  statusCode: number;
  error?: string;
  timestamp?: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

// HTTP Method Types
export type HttpMethod = 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';

// Loading States
export interface LoadingState {
  isLoading: boolean;
  error: string | null;
}

// Form Validation
export interface ValidationError {
  field: string;
  message: string;
}

export interface FormState<T> extends LoadingState {
  data: T | null;
  errors: ValidationError[];
  isDirty: boolean;
  isValid: boolean;
}