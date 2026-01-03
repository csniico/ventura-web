import { Injectable, inject, signal } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Router } from '@angular/router';
import { Observable, throwError } from 'rxjs';
import { catchError, tap } from 'rxjs/operators';
import { environment } from '../../../environments/environment';
import { API_ENDPOINTS } from '../../shared/api.constants';
import {
  LoginRequest,
  SignUpRequest,
  VerifyCodeRequest,
  ConfirmEmailRequest,
  ResendCodeRequest,
  ResetPasswordRequest,
  AuthResponse,
  VerificationResponse,
  User,
  ApiError,
  AuthState
} from '../../shared/types/auth.types';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private http = inject(HttpClient);
  private router = inject(Router);
  
  // Reactive state using Angular Signals
  private authState = signal<AuthState>({
    user: null,
    isAuthenticated: false,
    isLoading: false,
    error: null
  });

  // Public readonly signals
  readonly user = signal<User | null>(null);
  readonly isAuthenticated = signal<boolean>(false);
  readonly isLoading = signal<boolean>(false);
  readonly error = signal<string | null>(null);

  private baseUrl = environment.apiUrl;

  constructor() {
    this.initializeAuth();
  }

  private initializeAuth(): void {
    const userData = localStorage.getItem('user');
    
    if (userData) {
      try {
        const user = JSON.parse(userData) as User;
        this.updateAuthState({ user, isAuthenticated: true });
      } catch (error) {
        this.clearAuthData();
      }
    }
  }

  private updateAuthState(updates: Partial<AuthState>): void {
    const currentState = this.authState();
    const newState = { ...currentState, ...updates };
    this.authState.set(newState);
    
    // Update individual signals
    this.user.set(newState.user);
    this.isAuthenticated.set(newState.isAuthenticated);
    this.isLoading.set(newState.isLoading);
    this.error.set(newState.error);
  }

  private setLoading(loading: boolean): void {
    this.updateAuthState({ isLoading: loading, error: null });
  }

  private setError(error: string): void {
    this.updateAuthState({ isLoading: false, error });
  }

  private handleAuthSuccess(response: AuthResponse): void {
    localStorage.setItem('user', JSON.stringify(response.user));
    
    this.updateAuthState({
      user: response.user,
      isAuthenticated: true,
      isLoading: false,
      error: null
    });
  }

  private clearAuthData(): void {
    localStorage.removeItem('user');
    
    this.updateAuthState({
      user: null,
      isAuthenticated: false,
      isLoading: false,
      error: null
    });
  }

  private handleError = (error: HttpErrorResponse): Observable<never> => {
    let errorMessage = 'An unexpected error occurred';
    
    if (error.error instanceof ErrorEvent) {
      // Client-side error
      errorMessage = error.error.message;
    } else {
      // Server-side error
      const apiError = error.error as ApiError;
      errorMessage = apiError?.message || `Error ${error.status}: ${error.statusText}`;
    }
    
    this.setError(errorMessage);
    return throwError(() => new Error(errorMessage));
  };

  // Auth Methods
  login(credentials: LoginRequest): Observable<AuthResponse> {
    this.setLoading(true);
    
    return this.http.post<AuthResponse>(`${this.baseUrl}${API_ENDPOINTS.AUTH.LOGIN}`, credentials)
      .pipe(
        tap(response => {
          this.handleAuthSuccess(response);
          this.router.navigate(['/dashboard']);
        }),
        catchError(this.handleError)
      );
  }

  register(userData: SignUpRequest): Observable<VerificationResponse> {
    this.setLoading(true);
    
    return this.http.post<VerificationResponse>(`${this.baseUrl}${API_ENDPOINTS.AUTH.REGISTER}`, userData)
      .pipe(
        tap(response => {
          this.updateAuthState({ isLoading: false, error: null });
          // Store email for verification flow
          sessionStorage.setItem('pendingVerificationEmail', userData.email);
          this.router.navigate(['/auth/verify-email']);
        }),
        catchError(this.handleError)
      );
  }

  verifyEmail(verificationData: VerifyCodeRequest): Observable<AuthResponse> {
    this.setLoading(true);
    
    return this.http.post<AuthResponse>(`${this.baseUrl}${API_ENDPOINTS.AUTH.VERIFY_CODE}`, verificationData)
      .pipe(
        tap(response => {
          this.handleAuthSuccess(response);
          sessionStorage.removeItem('pendingVerificationEmail');
          this.router.navigate(['/dashboard']);
        }),
        catchError(this.handleError)
      );
  }

  resendVerificationCode(email: string): Observable<VerificationResponse> {
    this.setLoading(true);
    
    const request: ResendCodeRequest = { email };
    return this.http.post<VerificationResponse>(`${this.baseUrl}${API_ENDPOINTS.AUTH.RESEND_CODE}`, request)
      .pipe(
        tap(() => this.updateAuthState({ isLoading: false, error: null })),
        catchError(this.handleError)
      );
  }

  confirmEmail(email: string): Observable<VerificationResponse> {
    this.setLoading(true);
    
    const request: ConfirmEmailRequest = { email };
    return this.http.post<VerificationResponse>(`${this.baseUrl}${API_ENDPOINTS.AUTH.CONFIRM_EMAIL}`, request)
      .pipe(
        tap(response => {
          this.updateAuthState({ isLoading: false, error: null });
          sessionStorage.setItem('pendingResetEmail', email);
          if (response.shortToken) {
            sessionStorage.setItem('resetToken', response.shortToken);
          }
          this.router.navigate(['/auth/verify-email'], { queryParams: { type: 'reset' } });
        }),
        catchError(this.handleError)
      );
  }

  resetPassword(newPassword: string, userId: string): Observable<VerificationResponse> {
    this.setLoading(true);
    
    const request: ResetPasswordRequest = { newPassword, userId };
    return this.http.post<VerificationResponse>(`${this.baseUrl}${API_ENDPOINTS.AUTH.RESET_PASSWORD}`, request)
      .pipe(
        tap(() => {
          this.updateAuthState({ isLoading: false, error: null });
          sessionStorage.removeItem('pendingResetEmail');
          sessionStorage.removeItem('resetToken');
          this.router.navigate(['/auth/login']);
        }),
        catchError(this.handleError)
      );
  }

  logout(): void {
    this.setLoading(true);
    
    this.http.post(`${this.baseUrl}${API_ENDPOINTS.AUTH.LOGOUT}`, {})
      .pipe(
        catchError(() => {
          // Even if logout fails on server, clear local data
          return throwError(() => new Error('Logout failed'));
        })
      )
      .subscribe({
        next: () => this.performLogout(),
        error: () => this.performLogout()
      });
  }

  private performLogout(): void {
    this.clearAuthData();
    this.router.navigate(['/auth/login']);
  }

  // Utility methods
  clearError(): void {
    this.updateAuthState({ error: null });
  }

  // Get pending email for verification flows
  getPendingVerificationEmail(): string | null {
    return sessionStorage.getItem('pendingVerificationEmail');
  }

  getPendingResetEmail(): string | null {
    return sessionStorage.getItem('pendingResetEmail');
  }

  getResetToken(): string | null {
    return sessionStorage.getItem('resetToken');
  }
}