import { Injectable, inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { Observable, tap, catchError, throwError } from 'rxjs';
import { environment } from '../../../environments/environment';
import { UserService } from './user.service';
import {
  LoginDto,
  SignUpDto,
  VerifyCodeDto,
  ResendCodeDto,
  ConfirmEmailDto,
  ResetPasswordDto,
  SignUpResponse,
  VerificationResponse,
  AuthState,
  User,
  ApiResponse,
  API_ENDPOINTS,
} from '../../shared';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private http = inject(HttpClient);
  private router = inject(Router);
  private userService = inject(UserService);

  // Public readonly signals
  readonly user = signal<User | null>(null);
  readonly isAuthenticated = signal<boolean>(false);
  readonly isLoading = signal<boolean>(false);
  readonly error = signal<string | null>(null);

  constructor() {
    this.initializeAuth();
  }

  // Initialize authentication state (check if user is logged in via cookie)
  private initializeAuth(): void {
    // Just check if user data exists - auth state managed by httpOnly cookies
    const userData = localStorage.getItem('user');
    if (userData) {
      try {
        const user = JSON.parse(userData) as User;
        this.setAuthState(user, true);
      } catch (error) {
        this.clearAuthState();
      }
    }
  }

  // Login user
  login(credentials: LoginDto): Observable<User> {
    this.clearError();

    return this.http.post<User>(API_ENDPOINTS.AUTH.LOGIN, credentials).pipe(
      tap((user) => {
        this.handleLoginSuccess(user);
      }),
      catchError((error) => {
        return throwError(() => error);
      })
    );
  }

  // Register user
  register(userData: SignUpDto): Observable<SignUpResponse> {
    this.setLoading(true);
    this.clearError();

    return this.http.post<SignUpResponse>(API_ENDPOINTS.AUTH.REGISTER, userData).pipe(
      tap(() => {
        this.setLoading(false);
      }),
      catchError((error) => {
        this.handleAuthError('Registration failed. Please try again.');
        return throwError(() => error);
      })
    );
  }

  // Verify email code
  verifyCode(data: VerifyCodeDto): Observable<User> {
    this.setLoading(true);
    this.clearError();

    return this.http.post<User>(API_ENDPOINTS.AUTH.VERIFY_CODE, data).pipe(
      tap((user) => {
        this.setLoading(false);
        // Store user data after successful verification
        localStorage.setItem('user', JSON.stringify(user));
        this.setAuthState(user, true);
      }),
      catchError((error) => {
        this.handleAuthError('Verification failed. Please check your code.');
        return throwError(() => error);
      })
    );
  }

  // Resend verification code
  resendCode(data: ResendCodeDto): Observable<ApiResponse> {
    this.setLoading(true);
    this.clearError();

    return this.http.post<ApiResponse>(API_ENDPOINTS.AUTH.RESEND_CODE, data).pipe(
      tap(() => {
        this.setLoading(false);
      }),
      catchError((error) => {
        this.handleAuthError('Failed to resend code. Please try again.');
        return throwError(() => error);
      })
    );
  }

  // Confirm email for password reset
  confirmEmail(data: ConfirmEmailDto): Observable<ApiResponse> {
    this.setLoading(true);
    this.clearError();

    return this.http.post<ApiResponse>(API_ENDPOINTS.AUTH.CONFIRM_EMAIL, data).pipe(
      tap(() => {
        this.setLoading(false);
      }),
      catchError((error) => {
        this.handleAuthError('Email confirmation failed. Please try again.');
        return throwError(() => error);
      })
    );
  }

  // Reset password
  resetPassword(data: ResetPasswordDto): Observable<ApiResponse> {
    this.setLoading(true);
    this.clearError();

    return this.http.post<ApiResponse>(API_ENDPOINTS.AUTH.RESET_PASSWORD, data).pipe(
      tap(() => {
        this.setLoading(false);
      }),
      catchError((error) => {
        this.handleAuthError('Password reset failed. Please try again.');
        return throwError(() => error);
      })
    );
  }

  // Logout user
  logout(): void {
    this.http.post(API_ENDPOINTS.AUTH.LOGOUT, {}).subscribe({
      complete: () => {
        this.clearAuthState();
        this.router.navigate(['/auth/login']);
      },
    });
  }

  // Initiate Google OAuth login
  loginWithGoogle(): void {
    // Redirect to backend Google OAuth endpoint
    const googleAuthUrl = `${environment.apiUrl}${API_ENDPOINTS.AUTH.GOOGLE_LOGIN}`;
    window.location.href = googleAuthUrl;
  }

  // Fetch user data by ID (for Google OAuth callback)
  fetchUserById(userId: string): Observable<User> {
    this.setLoading(true);
    this.clearError();

    return this.userService.getUserById(userId).pipe(
      tap((user) => {
        this.setLoading(false);
        this.handleLoginSuccess(user);
      }),
      catchError((error) => {
        this.handleAuthError('Failed to fetch user data. Please try again.');
        return throwError(() => error);
      })
    );
  }

  // Handle successful login
  private handleLoginSuccess(user: User): void {
    // Store only user data - auth tokens handled by httpOnly cookies
    localStorage.setItem('user', JSON.stringify(user));
    
    // Update auth state
    this.setAuthState(user, true);

    // Navigate based on email verification and business setup
    if (!user.isEmailVerified) {
      this.router.navigate(['/auth/verify-email']);
    } else if (!user.businessId) {
      this.router.navigate(['/business/setup']);
    } else {
      this.router.navigate(['/dashboard']);
    }
  }

  // Handle authentication errors
  private handleAuthError(message: string): void {
    this.setLoading(false);
    this.error.set(message);
  }

  // Set authentication state
  private setAuthState(user: User, isAuthenticated: boolean): void {
    this.user.set(user);
    this.isAuthenticated.set(isAuthenticated);
  }

  // Clear authentication state
  private clearAuthState(): void {
    localStorage.removeItem('user');
    this.user.set(null);
    this.isAuthenticated.set(false);
    this.error.set(null);
  }

  // Set loading state
  private setLoading(loading: boolean): void {
    this.isLoading.set(loading);
  }

  // Clear error state
  private clearError(): void {
    this.error.set(null);
  }

  // Check if user is authenticated
  isLoggedIn(): boolean {
    return this.isAuthenticated();
  }

  // Get current user
  getCurrentUser(): User | null {
    return this.user();
  }
}