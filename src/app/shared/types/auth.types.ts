// Auth Request DTOs
export interface LoginRequest {
  email: string;
  password: string;
}

export interface SignUpRequest {
  firstName: string;
  lastName?: string;
  email: string;
  password: string;
  avatarUrl?: string;
}

export interface VerifyCodeRequest {
  shortToken: string;
  email: string;
  code: string;
}

export interface ConfirmEmailRequest {
  email: string;
}

export interface ResendCodeRequest {
  email: string;
}

export interface ResetPasswordRequest {
  newPassword: string;
  userId: string;
}

// Auth Response DTOs
export interface AuthResponse {
  user: User;
  accessToken: string;
  message?: string;
}

export interface VerificationResponse {
  message: string;
  shortToken?: string;
  success: boolean;
}

export interface User {
  id: string;
  firstName: string;
  lastName?: string;
  email: string;
  isEmailVerified: boolean;
  avatarUrl?: string;
  createdAt: string;
  updatedAt: string;
}

// Error Response
export interface ApiError {
  message: string;
  statusCode: number;
  error?: string;
  timestamp?: string;
}

// Loading States
export interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
}