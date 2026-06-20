import { User } from './user.model';

// Authentication Request DTOs (mirror the mobile app / new backend)
export interface LoginDto {
  email: string;
  password: string;
}

/** Request a passwordless one-time code by email. */
export interface EmailOtpDto {
  email: string;
}

/** Verify the emailed one-time code and sign in. */
export interface VerifyCodeDto {
  email: string;
  code: string;
}

/** Google sign-in: a Google ID token obtained client-side (GIS). */
export interface GoogleSignInDto {
  idToken: string;
}

/** Apple sign-in (web flow). */
export interface AppleSignInDto {
  identityToken: string;
  rawNonce?: string;
  firstName?: string;
  lastName?: string;
}

// Authentication Response — returned by every sign-in / verify / refresh call.
export interface AuthResponse {
  accessToken: string;
  refreshToken: string;
  user: User;
}

// Authentication State
export interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
}
