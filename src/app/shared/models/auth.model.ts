import { User } from "./user.model";

// Authentication Request DTOs
export interface LoginDto {
  email: string;
  password: string;
}

export interface SignUpDto {
  firstName: string;
  lastName?: string;
  email: string;
  password: string;
  avatarUrl?: string;
}

export interface VerifyCodeDto {
  shortToken: string;
  email: string;
  code: string;
}

export interface ResendCodeDto {
  id: string;
}

export interface ConfirmEmailDto {
  email: string;
}

export interface ResetPasswordDto {
  newPassword: string;
  userId: string;
}

// Authentication Response DTOs
export interface SignUpResponse {
  user: User;
  shortToken: string;
}

export interface VerificationResponse {
  success: boolean;
  message: string;
  userId?: string;
}

// Authentication State
export interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
}